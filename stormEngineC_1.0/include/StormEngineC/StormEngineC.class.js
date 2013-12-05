/*
StormEngineC. 3D Engine Javascript.
Copyright (C) 2010 Roberto Gonzalez. Stormcolor.com.

This file is part of StormEngineC.

StormEngineC is free software; you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

StormEngineC is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with StormEngineC; If not, see <http://www.gnu.org/licenses/>.
 */


/**
 * Contructor del engine
 */
StormEngineC = function() {
	this.nodes = [];
	this.nodesCam = [];
	this.lines = [];
	this.linesRemovables = [];
	this.lights = [];
	
	this.debugValues = [];
	this.debugResult;
	
	this.defaultCamera;

	this.pause = false;
	this.pauseRender = false;
	
	this.preloads = 0;
	
	this.lastTime = 0;
	this.elapsed;
	
	this.statusValue = '';
	this.callback = '';
};

/**
 * Inicializar contexto WebGL
 * @param int width - ancho del contexto WebGL
 * @param int height - alto del contaxto WebGL
 */
StormEngineC.prototype.createWebGL = function(width, height, callback) {
	// stormGLContext
	this.stormGLContextWidth = width;
	this.stormGLContextHeight = height;

	if(callback != undefined) {
		this.callback = callback;
	}
	
	this.stormGLContext = new StormGLContext(width, height);
	this.setStatus('initializing');
	
	// stormRender
	document.write(
			'<div id="stormRenderContext" align="left" style="background:#333; border: 1px solid #999; position: absolute; left:50px; top:350px; border-radius:6px; padding:6px;display:none">' +
				'<div style="text-align:right"><a href="" style="background:#333;border:1px solid #999;border-radius:6px;color:#FFF" onclick="stormEngineC.renderFrameStop();return false;"><b>Stop</b></a></div>' +
				'<br /><canvas id="stormCanvas2D" width="'+width+'" height="'+height+'"></canvas>' +
			'</div>');
	
	this.loadManager();
};

/**
 * Crear variables internas
 */
StormEngineC.prototype.loadManager = function() {
	var nodeCam = this.createCamera($V3([0.0, 0.0, 0.0]));
	this.setWebGLCam(nodeCam);
	
	this.createLight({	'type':'sun', // sun | spot
						'direction':$V3([-0.49,-1.0,-0.20]),
						'color':$V3([0.8, 0.8, 0.8])
						});
									
	this.stormJigLibJS = new StormJigLibJS();
	this.stormJigLibJS.createJigLibWorld();
	
	
	document.onkeydown = function(event) {
		if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.keyDownFC(event);
	};
    document.onkeyup = function(event) {
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.keyUpFC(event);
    };
    document.onmousemove = function(event) {
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.mouseMoveFC(event);
    };
    document.onmousedown = function(event) {
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.mouseDownFC(event);
    };
    document.onmouseup = function(event) {
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.mouseUpFC(event);
    };
};


/**
 * Inicializar stormEngine
 */
StormEngineC.prototype.go = function() {
	this.raf();
};
StormEngineC.prototype.raf = function() {
	if(!this.pause) {
		if(this.preloads == 0) this.setStatus(''); else this.setStatus('Loading...');
		
		this.render();
		
		if(this.callback != '') {
			if( eval('typeof('+this.callback+')') == 'function' ) {
				eval(this.callback+'('+this.elapsed+');');
			}
		}
		requestAnimFrame(raf);
		//window.setTimeout(raf, 1000 / 60);
	} else {
		this.setStatus('Paused');
	}
};
raf = function() {
	stormEngineC.raf();
};
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

/**
 * Actualizar y dibujar
 */
StormEngineC.prototype.render = function() {
	
	
	var timeNow = new Date().getTime();
    if(this.lastTime != 0) {
    	this.elapsed = timeNow - this.lastTime;
    	//stormEngineC.setDebugValue(0, this.elapsed, 'elapsed');
    }
    this.lastTime = timeNow;
    
	// array de lineas onRender
    //this.linesRemovables = [];
   
	if(this.preloads == 0) this.stormJigLibJS.update(this.elapsed);
	this.defaultCamera.player.updateFC(this.elapsed);
	this.defaultCamera.makeLookAt(	this.defaultCamera.nodeGoal.getPosition().e[0], this.defaultCamera.nodeGoal.getPosition().e[1], this.defaultCamera.nodeGoal.getPosition().e[2],
			this.defaultCamera.nodePivot.getPosition().e[0], this.defaultCamera.nodePivot.getPosition().e[1], this.defaultCamera.nodePivot.getPosition().e[2],
			0.0,1.0,0.0);
	for(var n = 0; n < this.lights.length; n++) {
		if(this.lights[n].type == 'sun') {
			var vecEyeLight = this.getWebGLCam().getPosition().add(this.lights[n].direction.x(-10.0));
			var vecPosLight = vecEyeLight.add(this.lights[n].direction);
			
			this.lights[n].makeLookAt(vecEyeLight.e[0], vecEyeLight.e[1], vecEyeLight.e[2],
							vecPosLight.e[0], vecPosLight.e[1], vecPosLight.e[2],
							0.0,1.0,0.0);
		}
	}
			
	// guardar operaciones generales para este frame
	for(var n = 0; n < this.nodes.length; n++) {
		this.nodes[n].mWMatrixFrame = this.nodes[n].mWMatrix.x(this.nodes[n].mRotationLocalSpaceMatrix);
		this.nodes[n].mWVMatrixFrame = this.defaultCamera.mWMatrix.x(this.nodes[n].mWMatrixFrame);
	}
	this.stormGLContext.renderGLContext();
	
	// debug values
	this.showDebugValues();
};

/**
 * Mostrar progreso de una peticion XMLHttpRequest acompañado de un texto pasado en string.
 * Una vez que req se encuentre en readyState == 4 hay que volver a llamar a esta funcion pasando solo string vacio para borrar lo que haya
 * @param (String) string
 * @param (XMLHttpRequest) req - OPTIONAL
 */
StormEngineC.prototype.setStatus = function(string, req) {
	
	this.statusValue = string;
		
	document.getElementById('stormStatus').innerHTML = this.statusValue;
	
	
	if(req != undefined) {
		req.upload.addEventListener("progress", function(evt) {
			if(evt.lengthComputable) {
				var current = parseInt((evt.loaded / evt.total)*100);
				document.getElementById('stormStatus').innerHTML = stormEngineC.statusValue+'<div style="margin:0 auto;width:100px; height:18px;background:#333; border:1px solid #EEE;"><div style="width:'+current+'px; height:100%; background:#006600; font-size:11px; text-align: center; ">'+current+'%</div></div>';
			}
		}, false);
	}
	
	
	
};

/**
 * Creacion de nodo de objeto (visible en contexto WebGL al añadirse al array nodes)
 * @returns (StormNode)
 */
StormEngineC.prototype.createNode = function() {
	var node = new StormNode();
	this.nodes.push(node);
	return node;
};
/**
 * Creacion de nodo de camara
 * @returns {StormNode}
 */
StormEngineC.prototype.createCamera = function(vec, distance) {
	var nodeCam = new StormCamera();
	
	nodeCam.nodeGoal = new StormNode();
	nodeCam.nodeGoal.mWMatrix = $M16([
	        	                      1, 0, 0, 0,
	        	                      0, 1, 0, 0,
	        		                  0, 0, 1, 0,
	        		                  0, 0, 0, 1
	        		                ]);
	nodeCam.nodeGoal.mRotationLocalSpaceMatrix = $M16([
	        	                      1, 0, 0, 0,
	        	                      0, 1, 0, 0,
	        		                  0, 0, 1, 0,
	        		                  0, 0, 0, 1
	        		                ]);
	nodeCam.nodePivot = new StormNode();
	if(vec == undefined) var vec = $V3([0.0, 0.0, 0.0]);
	nodeCam.nodePivot.mWMatrix = $M16([
	        	                      1, 0, 0, vec.e[0],
	        	                      0, 1, 0, vec.e[1],
	        		                  0, 0, 1, vec.e[2],
	        		                  0, 0, 0, 1
	        		                ]);
	nodeCam.nodePivot.mRotationLocalSpaceMatrix = $M16([
	        	                      1, 0, 0, 0,
	        	                      0, 1, 0, 0,
	        		                  0, 0, 1, 0,
	        		                  0, 0, 0, 1
	        		                ]);
	var dist =(distance != undefined) ? distance : 10.0;
	nodeCam.player = new FreeCam(dist);
	nodeCam.player.playerSetupFC();
	nodeCam.player.cameraSetupFC(nodeCam);
	
	this.nodesCam.push(nodeCam);
	return nodeCam;
};
/**
 * Creacion de linea
 * @returns (Object)
 */
StormEngineC.prototype.createLine = function(vecOrigin, vecEnd, removable) {
	var cutLine = new Object;
	
	if(vecOrigin != undefined) cutLine.origin = vecOrigin;
	if(vecEnd != undefined) cutLine.end = vecEnd;
	if(removable != undefined) {
		stormEngineC.linesRemovables.push(cutLine);
	} else {
		stormEngineC.lines.push(cutLine);
	}
	
	return cutLine;
};
/**
 * Creacion de luz
 * @returns (Object)
 */
StormEngineC.prototype.createLight = function(jsonIn) {
	if(jsonIn.type == 'sun') {
		if(this.lights[0] == undefined) {
			var light = new StormLight();
			stormEngineC.lights.push(light);
			if(jsonIn.type != undefined) light.type = jsonIn.type;
		} else {
			var light = this.lights[0];
		}
	} else {
		var light = new StormLight();
		stormEngineC.lights.push(light);
		if(jsonIn.type != undefined) light.type = jsonIn.type;
	}
	
	if(jsonIn.color != undefined) light.color = jsonIn.color;
	if(jsonIn.direction != undefined) light.direction = jsonIn.direction;
	if(jsonIn.position != undefined) light.setPosition($V3([jsonIn.position.e[0], jsonIn.position.e[1], jsonIn.position.e[2]]));

	var vecEyeLight = light.getPosition();
	var vecPosLight = vecEyeLight.add(light.direction);
	
	light.makeLookAt(vecEyeLight.e[0], vecEyeLight.e[1], vecEyeLight.e[2],
					vecPosLight.e[0], vecPosLight.e[1], vecPosLight.e[2],
					0.0,1.0,0.0);
						
	

	
	return light;
};


/**
 * Añade informacion de debug al array debugValues tanto para una matrix, vector o numero indicado en value
 * @param int idx = id de info
 * @param Matrix, Vector, int, float, etc.. = valor a insertar
 * @param string = texto indicativo
 */
StormEngineC.prototype.setDebugValue = function(idx, value, string) {
	this.typeVector = value instanceof StormV3;
	this.typeMatrix = value instanceof StormM16;
	
	if(this.typeVector == true) {
		var v1 = value.e[0].toString().substr(0, 5);
		var v2 = value.e[1].toString().substr(0, 5);
		var v3 = value.e[2].toString().substr(0, 5);
		this.debugValues[idx] = '<b>['+idx+']	'+string+':</b>	'+v1+',	'+v2+',	'+v3+'<br />';
	} else if(this.typeMatrix == true) {
		var m00 = value.e[0].toString().substr(0, 5);
		var m01 = value.e[1].toString().substr(0, 5);
		var m02 = value.e[2].toString().substr(0, 5);
		var m03 = value.e[3].toString().substr(0, 5);
		
		var m10 = value.e[4].toString().substr(0, 5);
		var m11 = value.e[5].toString().substr(0, 5);
		var m12 = value.e[6].toString().substr(0, 5);
		var m13 = value.e[7].toString().substr(0, 5);
		
		var m20 = value.e[8].toString().substr(0, 5);
		var m21 = value.e[9].toString().substr(0, 5);
		var m22 = value.e[10].toString().substr(0, 5);
		var m23 = value.e[11].toString().substr(0, 5);
		
		var m30 = value.e[12].toString().substr(0, 5);
		var m31 = value.e[13].toString().substr(0, 5);
		var m32 = value.e[14].toString().substr(0, 5);
		var m33 = value.e[15].toString().substr(0, 5);
		
		this.debugValues[idx] = '<b>['+idx+']	'+string+':</b>	<div align="right">'+m00+',	'+m01+',	'+m02+',	'+m03+',<br />'+m10+',	'+m11+',	'+m12+',	'+m13+',<br />'+m20+',	'+m21+',	'+m22+',	'+m23+',<br />'+m30+',	'+m31+',	'+m32+',	'+m33+'</div>';
	} else {
		this.debugValues[idx] = '<b>['+idx+']	'+string+':</b>	'+value.toString().substr(0, 5)+'<br />';
	}
};
/**
 * Muestra los valores de debug almacenados
 */
StormEngineC.prototype.showDebugValues = function() {
	this.debugResult = '';
	for(var n = 0; n < this.debugValues.length; n++) {
		this.debugResult += this.debugValues[n];
	}
	
	document.getElementById("divDebug").innerHTML  = this.debugResult;
	
};
function dump(obj) {
	var out = '';
	for (var i in obj) {
		out += i + ": " + obj[i] + "\n";
	}
	alert(out);
}
/**
 * Guarda la escena actual
 * @returns - texto plano con la escena
 */
StormEngineC.prototype.save = function() {
	var stormScene = new StormScene();
	
	return stormScene.save();
};
/**
 * Carga una escena a partir del texto plano indicado
 * @param string stormSceneSource
 */
StormEngineC.prototype.load = function(stormSceneSource) {
	var stormScene = new StormScene();
	
	stormScene.load(stormSceneSource);
};
/**
 * Limpia la escena actual
 */
StormEngineC.prototype.clearScene = function() {
stormEngineC.setWebGLpause(true);
	this.nodes = [];
	this.nodesCam = [];
	this.lines = [];
	this.linesRemovables = [];
	this.lights = [];
	
	//TODO Borrar buffers contexto WebGL
	this.stormGLContext = new StormGLContext(this.stormGLContextWidth, this.stormGLContextHeight, true);
	this.loadManager();
	
	//this.go();
	stormEngineC.setWebGLpause(false);
};

/**
 * Realiza un render (stormRender) basado en path tracing y bidirectional path tracing
 * @param int width - ancho del cuadro a renderizar
 * @param int height - alto del cuadro a renderizar
 */
StormEngineC.prototype.renderFrame = function(width, height) {
	this.pauseRender = false;
	
	this.renderImage = new StormRender(width, height); 
	this.renderImage.makeRender(this.defaultCamera);
};
/**
 * Detiene el render stormRender
 */
StormEngineC.prototype.renderFrameStop = function() {
	this.pauseRender = true;
};

/**
 * Pausa el contexto WebGL
 */
StormEngineC.prototype.setWebGLpause = function() {
	if(stormEngineC.pause == false) {
		stormEngineC.pause = true;
	} else {
		stormEngineC.pause = false;
		stormEngineC.raf();
		//stormEngineC.renderImage.makeRender();
	}
};
/**
 * Habilita SSAO en el contaxto WebGL
 */
StormEngineC.prototype.setWebGLSSAO = function(enable, level) {
	this.stormGLContext.SSAOenable = enable;
	if(level != undefined) {
		this.stormGLContext.SSAOlevel = level;
	}
};
/**
 * edge shadow blur
 */
StormEngineC.prototype.setWebGLEdgeShadowBlur = function(level) {
	this.stormGLContext.ShadowBlurLevel = level;
};
/**
 * ambient color value
 */
StormEngineC.prototype.setAmbientColor = function(vec) {
	this.stormGLContext.ambientColor = vec;
};
/**
 * Mover camara del contaxto WebGL siempre o solo con boton izquierdo del mouse pulsado
 * @param bool boolCamAlwaysMove - true = mueve siempre;
 */
StormEngineC.prototype.setWebGLCamAlwaysMove = function(boolCamAlwaysMove) {
	this.defaultCamera.player.alwaysMove = boolCamAlwaysMove;
};
/**
 * Activar camara para mostrar en contexto webgl
 */
StormEngineC.prototype.setWebGLCam = function(nodeCam) {
	this.stormGLContext.setViewportCamera(nodeCam);
	this.defaultCamera = nodeCam;
};
/**
 * Devuelve nodo camara activa usada en el contexto webgl
 */
StormEngineC.prototype.getWebGLCam = function() {
	return this.defaultCamera;
};
/**
 * ajustar gravedad jiglib
 */
StormEngineC.prototype.setWorldGravity = function(vecGravity) {
	this.stormJigLibJS.dynamicsWorld.setGravity(new Vector3D( vecGravity.e[0], vecGravity.e[1], vecGravity.e[2], 0 ));;
};
var stormEngineC = new StormEngineC();


// includes
var stormEngineCDirectory = document.getElementById("stormEngineC").src;
stormEngineC.includeDirectory = '';
var separat = '';
var expl = stormEngineCDirectory.split("/");
for(var n = 0; n < expl.length-1; n++) {
	stormEngineC.includeDirectory = stormEngineC.includeDirectory+separat+expl[n];
	separat = '/';
}


if (window.WebCL == undefined) {
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormMathMin.class.js"></script>');
} else {
	var clPlatforms = WebCL.getPlatformIDs();
    var clContext = WebCL.createContextFromType([WebCL.CL_CONTEXT_PLATFORM, clPlatforms[0]], WebCL.CL_DEVICE_TYPE_DEFAULT);
    var clDevices = clContext.getContextInfo(WebCL.CL_CONTEXT_DEVICES);
    var clCmdQueue = clContext.createCommandQueue(clDevices[0], 0);
    var utils = WebCL.getUtils();
    
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormMathCL.class.js"></script>');
}
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormGLContext.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormNode.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormMesh.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormBufferObject.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormCamera.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormLight.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormScene.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormRayTriangle.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormLineSceneCollision.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormRender.class.js"></script>');

	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geom/glMatrix.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/jiglib.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geom/Vector3D.js"></script>');							
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geom/Matrix3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/math/JMatrix3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/math/JMath3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/math/JNumber3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/cof/JConfig.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/CollOutData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/ContactData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/PlaneData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/EdgeData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/TerrainData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/OctreeCell.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/CollOutBodyData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/TriangleVertexIndices.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/data/SpanData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraintMaxDistance.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraintWorldPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraintPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/MaterialProperties.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollPointInfo.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollisionInfo.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectInfo.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectFunctor.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectBoxTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectSphereMesh.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectCapsuleBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectSphereCapsule.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectCapsuleTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectSphereBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectSphereTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectBoxBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectBoxMesh.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectBoxPlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectCapsuleCapsule.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectSphereSphere.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectSpherePlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollDetectCapsulePlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollisionSystemAbstract.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollisionSystemGridEntry.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollisionSystemGrid.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/collision/CollisionSystemBrute.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JIndexedTriangle.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JOctree.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JRay.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JAABox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JTriangle.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JSegment.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/events/JCollisionEvent.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraintMaxDistance.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraintWorldPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/constraint/JConstraintPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/PhysicsController.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/CachedImpulse.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/HingeJoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/BodyPair.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/PhysicsState.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/PhysicsSystem.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/physics/RigidBody.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JSphere.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JTriangleMesh.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JPlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/geometry/JCapsule.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/debug/Stats.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/vehicles/JChassis.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/vehicles/JWheel.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/JigLibJS/vehicles/JCar.js"></script>');
	
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormJigLibJS.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/FreeCam.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormPlayerCar.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineC.includeDirectory+'/StormPlayer.class.js"></script>');