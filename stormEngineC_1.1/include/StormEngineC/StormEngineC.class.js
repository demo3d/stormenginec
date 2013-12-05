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
// includes
var stormEngineCDirectory = '';
var separat = '';
var expl = document.getElementById("stormEngineC").src.split("/");
for(var n = 0; n < expl.length-1; n++) {
	stormEngineCDirectory = stormEngineCDirectory+separat+expl[n];
	separat = '/';
}
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormMathMin.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormGLContext.class.js"></script>');
//document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormGLRenderContext.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormNode.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormMesh.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormBufferObject.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormCamera.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormScene.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRayTriangle.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormLineSceneCollision.class.js"></script>');
if(window.WebCL == undefined) {
	//document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRender.class.js"></script>'); // raytracing cpu
} else {
	var clPlatforms = WebCL.getPlatformIDs();
	//CL_DEVICE_TYPE_GPU - CL_DEVICE_TYPE_CPU - CL_DEVICE_TYPE_DEFAULT - CL_DEVICE_TYPE_ACCELERATOR - CL_DEVICE_TYPE_ALL
    var clContext = WebCL.createContextFromType([WebCL.CL_CONTEXT_PLATFORM, clPlatforms[0]], WebCL.CL_DEVICE_TYPE_GPU); 
    var clDevices = clContext.getContextInfo(WebCL.CL_CONTEXT_DEVICES);
    var clCmdQueue = clContext.createCommandQueue(clDevices[0], 0); // CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE - CL_QUEUE_PROFILING_ENABLE
    var utils = WebCL.getUtils();
    
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRenderCLv4.class.js"></script>');
}

	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geom/glMatrix.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/jiglib.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geom/Vector3D.js"></script>');							
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geom/Matrix3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/math/JMatrix3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/math/JMath3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/math/JNumber3D.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/cof/JConfig.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/CollOutData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/ContactData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/PlaneData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/EdgeData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/TerrainData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/OctreeCell.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/CollOutBodyData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/TriangleVertexIndices.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/data/SpanData.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraintMaxDistance.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraintWorldPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraintPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/MaterialProperties.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollPointInfo.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollisionInfo.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectInfo.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectFunctor.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectBoxTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectSphereMesh.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectCapsuleBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectSphereCapsule.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectCapsuleTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectSphereBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectSphereTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectBoxBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectBoxMesh.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectBoxPlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectCapsuleCapsule.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectSphereSphere.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectSpherePlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollDetectCapsulePlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollisionSystemAbstract.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollisionSystemGridEntry.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollisionSystemGrid.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/collision/CollisionSystemBrute.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JIndexedTriangle.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JOctree.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JRay.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JAABox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JTriangle.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JSegment.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/events/JCollisionEvent.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraintMaxDistance.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraintWorldPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/constraint/JConstraintPoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/PhysicsController.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/CachedImpulse.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/HingeJoint.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/BodyPair.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/PhysicsState.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/PhysicsSystem.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/physics/RigidBody.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JSphere.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JTriangleMesh.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JPlane.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JTerrain.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JBox.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/geometry/JCapsule.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/debug/Stats.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/vehicles/JChassis.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/vehicles/JWheel.js"></script>');
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JigLibJS/vehicles/JCar.js"></script>');
	
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormJigLibJS.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormUtils.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/FreeCam.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormPlayerCar.class.js"></script>');
document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormPlayer.class.js"></script>');
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
	this.pauseRender = true;
	
	this.preloads = 0;
	this.shaderLoad = false;
	this.start = false;
	
	this.lastTime = 0;
	this.elapsed;
	
	this.statusValue = '';
	this.callback = '';
};

/**
 * Init WebGL Context
 */
StormEngineC.prototype.createWebGL = function(DIVIDcanvas, callback) {
	if(DIVIDcanvas != undefined) {
		this.DIVIDcanvas = DIVIDcanvas;
		
		// stormGLContext
		this.stormGLContext = new StormGLContext(DIVIDcanvas);
		
		this.stormGLContextWidth = this.stormGLContext.viewportWidth;
		this.stormGLContextHeight = this.stormGLContext.viewportHeight;
		
		this.setStatus('initializing');

		this.loadManager();
		
		if(callback != undefined) {
			this.callback = callback;
		}
	} else {
		alert('Target canvas required');
	}
};

/**
 * Prepare
 */
StormEngineC.prototype.loadManager = function() {
	this.utils = new StormUtils();
	
	var nodeCam = this.createCamera($V3([0.0, 0.0, 0.0]));
	this.setWebGLCam(nodeCam);
									
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
    stormEngineC.stormGLContext.stormCanvasObject.onmousedown = function(event) {
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.mouseDownFC(event);
		if(stormEngineC.stormRender != undefined && stormEngineC.renderStop == false) {
			stormEngineC.pauseRender = true;
			clearTimeout(stormEngineC.stormRender.timerRender);
			
			stormEngineC.pause = false;
			stormEngineC.raf();
		}
    };
    stormEngineC.stormGLContext.stormCanvasObject.onmouseup = function(event) {
    	if(stormEngineC.preloads == 0) stormEngineC.defaultCamera.player.mouseUpFC(event);
		if(stormEngineC.stormRender != undefined && stormEngineC.renderStop == false) {
			stormEngineC.pauseRender = false;
			stormEngineC.stormRender.setCam(stormEngineC.defaultCamera);
			stormEngineC.stormRender.makeRender();
			
			stormEngineC.pause = true;
		}
    };
};


/**
 * Init stormEngine
 */
StormEngineC.prototype.go = function() {
	this.raf();
};
StormEngineC.prototype.raf = function() {
	if(!this.pause) {
		if(this.preloads == 0) this.setStatus(''); else this.setStatus('Loading...');
		
		this.render();
		
		if(typeof(this.callback)== 'function' && this.elapsed != undefined) {
			this.callback(this.elapsed);
		} else if( eval('typeof('+this.callback+')') == 'function' && this.elapsed != undefined) {
			eval(this.callback+'('+this.elapsed+');');
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
   
	if(this.preloads == 0 && this.start == true) {
		this.stormJigLibJS.update(this.elapsed);
		if(this.shaderLoad == false) {
			this.stormGLContext.initShader();
			this.shaderLoad = true;
		}
	}

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
	for(var n = 0; n < this.lights.length; n++) {
		this.lights[n].mWMatrixFrame = this.lights[n].mWMatrix.x(this.lights[n].mRotationLocalSpaceMatrix);
		this.lights[n].mWVMatrixFrame = this.defaultCamera.mWMatrix.x(this.lights[n].mWMatrixFrame);
		
		this.lights[n].mrealWMatrixFrame = this.lights[n].mrealWMatrix.x(this.lights[n].mrealRotationLocalSpaceMatrix);
		this.lights[n].mrealWVMatrixFrame = this.defaultCamera.mWMatrix.x(this.lights[n].mrealWMatrixFrame);
	}
	if(this.shaderLoad) this.stormGLContext.renderGLContext();
	
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
		
	this.stormGLContext.divStatus.innerHTML = this.statusValue;
	
	
	if(req != undefined) {
		req.upload.addEventListener("progress", function(evt) {
			if(evt.lengthComputable) {
				var current = parseInt((evt.loaded / evt.total)*100);
				this.stormGLContext.divStatus.innerHTML = stormEngineC.statusValue+'<div style="margin:0 auto;width:100px; height:18px;background:#333; border:1px solid #EEE;"><div style="width:'+current+'px; height:100%; background:#006600; font-size:11px; text-align: center; ">'+current+'%</div></div>';
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
 * Crear textura en el contexto WebGL a partir de un elemento imagen de HTML
 * @param HTMLimageElement imageElement
 */
StormEngineC.prototype.addGLTexture = function(imageElement) {
	this.stormGLContext.gl.pixelStorei(this.stormGLContext.gl.UNPACK_FLIP_Y_WEBGL, true);
	this.stormGLContext.gl.pixelStorei(this.stormGLContext.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	this.stormGLContext.gl.bindTexture(this.stormGLContext.gl.TEXTURE_2D, imageElement.textureObj);
	this.stormGLContext.gl.texImage2D(this.stormGLContext.gl.TEXTURE_2D, 0, this.stormGLContext.gl.RGBA, this.stormGLContext.gl.RGBA, this.stormGLContext.gl.UNSIGNED_BYTE, imageElement);
	
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_MAG_FILTER, this.stormGLContext.gl.LINEAR);
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_MIN_FILTER, this.stormGLContext.gl.LINEAR_MIPMAP_NEAREST);
	this.stormGLContext.gl.generateMipmap(this.stormGLContext.gl.TEXTURE_2D);
	
	this.stormGLContext.gl.bindTexture(this.stormGLContext.gl.TEXTURE_2D, null);
	
	var e = document.createElement('canvas');
	e.width = imageElement.width;
	e.height = imageElement.height;
	var ctx2DTEX = e.getContext("2d");		
	ctx2DTEX.drawImage(imageElement, 0, 0);
	var gid = ctx2DTEX.getImageData(0, 0, imageElement.width, imageElement.height);
	imageElement.BO.arrayTEX_Kd = gid.data;
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
	var light = new StormNode();
	this.lights.push(light); 
	light.objectType = 'light';
	
	var mesh = new StormMesh();
	mesh.loadBox(light, $V3([0.1,0.1,0.1])); 
	
	light.type = jsonIn.type; // sun | spot
	light.mrealWMatrix = $M16([
	                      1.0, 0.0, 0.0, 0.0,
	                      0.0, 1.0, 0.0, 0.0,
		                  0.0, 0.0, 1.0, 0.0,
		                  0.0, 0.0, 0.0, 1.0
		                ]);
	light.mrealRotationLocalSpaceMatrix = $M16([
	                                       1.0, 0.0, 0.0, 0.0,
			        	                   0.0, 1.0, 0.0, 0.0,
			        	                   0.0, 0.0, 1.0, 0.0,
			        	                   0.0, 0.0, 0.0, 1.0
			        	                 ]);
										 
	if(jsonIn.color != undefined) {
		light.setLightColor(jsonIn.color);
	} else {
		light.setLightColor(5770);
	}
	if(jsonIn.direction != undefined) {
		light.setDirection($V3([jsonIn.direction.e[0], jsonIn.direction.e[1], jsonIn.direction.e[2]]));
	} else {
		light.direction = $V3([-0.5,-0.3,-0.5]);
	}
	if(jsonIn.position != undefined) {
		light.setPosition($V3([jsonIn.position.e[0], jsonIn.position.e[1], jsonIn.position.e[2]]));
	}

	
			
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
	
	this.stormGLContext.divDebug.innerHTML  = this.debugResult;
	
};
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
	this.stormGLContext = new StormGLContext(this.DIVIDcanvas, true);
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
	if(window.WebCL == undefined) {
		alert('Your browser does not support experimental-nokia-webcl. See http://webcl.nokiaresearch.com/');
	} else {
		this.renderStop = false;
		
		this.pauseRender = false;
		this.stormRender = new StormRender(width, height);
		this.stormRender.setCam(this.defaultCamera);
		this.stormRender.makeRender();
		
		this.pause = true;
	}
	
};
/**
 * Detiene el render stormRender
 */
StormEngineC.prototype.renderFrameStop = function() {
	this.renderStop = true;
	
	this.pauseRender = true;
	clearTimeout(this.stormRender.timerRender);
	//clCmdQueue.releaseCLResources();
	
	this.pause = false;
	this.raf();
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
		//stormEngineC.stormRender.makeRender();
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




