/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
StormParticles = function() { StormNode.call(this); 
	this.objectType = 'particles';
	
	this.isGraph = false;
	this.jsonIn;
	this.polarity = 1; // positive
	this.arrVertexPoints;
	this.arrayVertexColor;
	this.enDestination = 0;
	this.destinationForce = 1.0;
	this.lifeDistance = 0.0;
	this.pointSize = 2.0;
	
	this.selfshadows = true;
};
StormParticles.prototype = Object.create(StormNode.prototype);

/**
* Delete this particles
* @type Void
*/
StormParticles.prototype.deleteParticles = function() {  
	
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		stormEngineC.polarityPoints[n].removeParticles({node:this});
	}
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		stormEngineC.forceFields[n].removeParticles({node:this});
	}

	var idToRemove = undefined;
	for(var n = 0, f = stormEngineC.particles.length; n < f; n++) {
		if(stormEngineC.particles[n].idNum == this.idNum) idToRemove = n;
	}
	stormEngineC.particles.splice(idToRemove,1);
};

/**
* Generate particles
* @type Void
* @param {Object} jsonIn
* 	@param {Int} jsonIn.amount Number of particles
* 	@param {Array.<{origin, end}>} [jsonIn.disposal={radius:0.5}] The initial position 
*	@param {Array.<StormV3>} [jsonIn.disposal={radius:0.5}] The initial position
* 	@param {Object} [jsonIn.disposal={radius:0.5}] The initial position
* 		@param {Float} jsonIn.disposal.width If type square
* 		@param {Float} jsonIn.disposal.height If type square
* 		@param {Float} jsonIn.disposal.spacing If type square
* 		@param {Float} [jsonIn.disposal.radius=0.5] If type spheric
* 	@param {StormV3} [jsonIn.color=$V3([1.0,1.0,1.0])] Color from StormV3
* 	@param {HTMLImageElement} [jsonIn.color=$V3([1.0,1.0,1.0])] Color from HTMLImageElement
* 	@param {Float} [jsonIn.pointSize=2.0] The point size
* 	@param {Int} [jsonIn.polarity=1] 1=positive 0=negative
* 	@param {String} [jsonIn.direction=undefined] Write "random" for random direction
* 	@param {StormV3} [jsonIn.direction=undefined] Set a vector for the direction
* 	@param {Float} [jsonIn.lifeDistance=0] Life distance from origin. 0=Deactivated
*/
StormParticles.prototype.generateParticles = function(jsonIn) {  
	this.gl = stormEngineC.stormGLContext.gl;
	
	cos = function(val) {return Math.cos(stormEngineC.utils.degToRad(val))};
	sin = function(val) {return Math.sin(stormEngineC.utils.degToRad(val))};
	
	if(jsonIn.pointSize != undefined) this.pointSize = jsonIn.pointSize;
	if(jsonIn.polarity != undefined) this.polarity = jsonIn.polarity;
	if(jsonIn.lifeDistance != undefined) this.lifeDistance = jsonIn.lifeDistance;
	
	this.buffer_ColorRGBA = this.gl.createBuffer(); 
			
	jsonIn.amount = (jsonIn.amount != undefined) ? jsonIn.amount : 16*16; 	
	this.particlesLength = jsonIn.amount;
	
	
	if(jsonIn.graph != undefined) {
		this.isGraph = true;
		this.graph = jsonIn.graph;
	}
	
	this.jsonIn = jsonIn;
	//setTimeout((function() {
			this.setDisposal(this.jsonIn.disposal); 
			this.setDirection(this.jsonIn.direction);
			this.setColor(this.jsonIn.color);
			this.setPolarity(this.jsonIn.polarity);
			this.setDestinationWidthHeight({width: Math.sqrt(this.particlesLength), height: Math.sqrt(this.particlesLength)}, false);
		//}).bind(this),100); 
};
/**
* Set disposal
* @type Void
* @param {Array<StormV3>} disposal For make through a Array
* @param {Object} disposal For make a square or spherical disposal
* 	@param {Float} disposal.width Width
* 	@param {Float} disposal.height Height
* 	@param {Float} disposal.spacing Spacing
* 	@param {Float} [disposal.radius=0.5] Radius for type spherical (Anule width/height)
*/
StormParticles.prototype.setDisposal = function(jsonIn) { 	
	if(this.isGraph == true) {		
		var arra = [];
		//var arraEnd = []; 
		
		var arrayXYZW = [];
		var arrayX = [];
		var arrayY = [];
		var arrayZ = [];
		var arrayGraphXYZW = [];
		var arrayGraphX = [];
		var arrayGraphY = [];
		var arrayGraphZ = [];
		/*var arrayXEnd = [];
		var arrayYEnd = [];
		var arrayZEnd = [];*/
		
		var arrayParentId = []; 
		
		this.buffersObjects = [];
		
		for(var n = 0, f = this.particlesLength; n < f; n++) {
			var rad = (jsonIn == undefined) ? 1.0 : jsonIn.radius;
			var currAngleH = Math.random()*360.0;
			var currAngleV = Math.random()*180.0;
			var v = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV)) * rad,  
							cos(currAngleV) * rad * Math.random(),
							sin(currAngleH) * Math.abs(sin(currAngleV)) * rad]);
							
			v = this.getPosition().add(v);
			arrayX.push(v.e[0]);
			arrayY.push(v.e[1]);
			arrayZ.push(v.e[2]);
			arra.push(v.e[0],v.e[1],v.e[2],0.0);
		}
		
		for(var n = 0, f = this.graph.length; n < f; n++) {
			arrayGraphXYZW.push(arrayX[this.graph[n].origin], arrayY[this.graph[n].origin], arrayZ[this.graph[n].origin]);
			arrayGraphX.push(arrayX[this.graph[n].origin]);			
			arrayGraphY.push(arrayY[this.graph[n].origin]);
			arrayGraphZ.push(arrayZ[this.graph[n].origin]);
			
			arrayGraphXYZW.push(arrayX[this.graph[n].end], arrayY[this.graph[n].end], arrayZ[this.graph[n].end]);
			arrayGraphX.push(arrayX[this.graph[n].end]);			
			arrayGraphY.push(arrayY[this.graph[n].end]);
			arrayGraphZ.push(arrayZ[this.graph[n].end]);
			
			var hasParent = false;
			for(var nb = 0; nb < this.graph.length; nb++) {
				if(this.graph[n].origin == this.graph[nb].end) {
					var parentPos = $V3([arrayX[this.graph[nb].origin], arrayY[this.graph[nb].origin], arrayZ[this.graph[nb].origin]]);
					var parentDir = parentPos.subtract(this.getPosition());
					
					//arrayGraphParentId.push(parentDir.e[0], parentDir.e[1], parentDir.e[2], 0.0);
					
					arrayParentId.push(this.graph[nb].origin, this.graph[nb].origin); 
					hasParent = true;
					break;
				}				
			}
			if(hasParent == false) arrayParentId.push(0,0);
		}
		
		
		this.particlesLength = arrayGraphX.length;
		this.arrVertexPoints = new Float32Array(this.particlesLength*3);
				
		this.makeWebCLGL();
		
		var bObject = this.attachMeshSeparateXYZ(arrayGraphX,arrayGraphY,arrayGraphZ);
		//var color = (jsonIn.color != undefined) ? jsonIn.color : $V3([1.0,1.0,1.0]);
		//bObject.material.write(color);
		
		this.webCLGL.enqueueWriteBuffer(this.buffer_InitPos, arrayGraphXYZW);
		this.webCLGL.enqueueWriteBuffer(this.buffer_PosXYZW, arrayGraphXYZW);
		
		this.webCLGL.enqueueWriteBuffer(this.buffer_ParentId, arrayParentId);
	} else {
		var arraXYZW = []; 
		var arrayX = []; 
		var arrayY = []; 
		var arrayZ = []; 
		var h = 0, hP = 0, vP = 0;
		//console.log(this.buffersObjects);  
		this.buffersObjects = [];
		
		for(var n = 0, f = this.particlesLength; n < f; n++) {
			if(jsonIn != undefined && jsonIn.constructor === Array) {			
				var v = this.getPosition().add(jsonIn[n]);
				
				arraXYZW.push(v.e[0],v.e[1],v.e[2],0.0);
				arrayX.push(v.e[0]);
				arrayY.push(v.e[1]);
				arrayZ.push(v.e[2]);
				
			} else if(jsonIn == undefined || jsonIn.radius != undefined) {
				var rad = (jsonIn == undefined) ? 1.0 : jsonIn.radius;
				var currAngleH = Math.random()*360.0;
				var currAngleV = Math.random()*180.0;
				var v = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV)) * rad,  
								cos(currAngleV) * rad * Math.random(),
								sin(currAngleH) * Math.abs(sin(currAngleV)) * rad]);
								
				v = this.getPosition().add(v);
				
				arraXYZW.push(v.e[0],v.e[1],v.e[2],0.0);
				arrayX.push(v.e[0]);
				arrayY.push(v.e[1]);
				arrayZ.push(v.e[2]);
				
			} else if(jsonIn.width != undefined) {
				var spac = (jsonIn.spacing != undefined) ? jsonIn.spacing : 0.01; 
				var oper = this.MPOS.x($V3([hP,0.0,vP]));
				
				arraXYZW.push(oper.e[0],oper.e[1],oper.e[2],0.0);
				arrayX.push(oper.e[3]);
				arrayY.push(oper.e[7]);
				arrayZ.push(oper.e[11]);
				
				h++;
				hP+=spac;
				if(h > jsonIn.width-1) {h=0;hP=0;vP+=spac;}
			}
		}
		
		
		this.arrVertexPoints = new Float32Array(this.particlesLength*3);
		
		this.makeWebCLGL();  
		
		var bObject = this.attachMeshSeparateXYZ(arrayX,arrayY,arrayZ);
		//var color = (jsonIn.color != undefined) ? jsonIn.color : $V3([1.0,1.0,1.0]);
		//bObject.material.write(color);
		
		this.webCLGL.enqueueWriteBuffer(this.buffer_InitPos, arraXYZW);
		this.webCLGL.enqueueWriteBuffer(this.buffer_PosXYZW, arraXYZW);
	}
	
};
/**
* Set direction 
* @type Void
* @param {String|StormV3} [direction=undefined] 'random', StormV3 or undefined(0.0) 
*/
StormParticles.prototype.setDirection = function(direction) { 	
	var arrayDir = []; 
	for(var n = 0, f = this.particlesLength; n < f; n++) {
		var idVertexPoints = n*3;
		if(direction == undefined) {
			arrayDir.push(0.0,0.0,0.0,0.0);
		} else if(direction == 'random') {
			arrayDir.push(1.0-(Math.random()*2.0),1.0-(Math.random()*2.0),1.0-(Math.random()*2.0),0.0);
		} else if(direction instanceof StormV3) {
			arrayDir.push(direction.e[0],direction.e[1],direction.e[2],0.0);
		}
	}
	this.webCLGL.enqueueWriteBuffer(this.buffer_InitDir, arrayDir);
	this.webCLGL.enqueueWriteBuffer(this.buffer_Dir, arrayDir);
};
/**
* Set color
* @type Void
* @param {StormV3|HTMLImageElement} color Vector3 or HTMLImageElement
*/
StormParticles.prototype.setColor = function(color) { 	
	if(color != undefined && color instanceof HTMLImageElement) {
		this.arrayVertexColor = stormEngineC.utils.getUint8ArrayFromHTMLImageElement(color);
	} else if(color != undefined && color instanceof StormV3) {
		this.arrayVertexColor = new Uint8Array([color.e[0]*255, color.e[1]*255, color.e[2]*255, 255]);
	} else {
		this.arrayVertexColor = new Uint8Array([255, 255, 255, 255]);
	}
	
	var arrayColorRGBA = []; 
	var nVertexColors = 0;
	for(var n = 0, f = this.particlesLength; n < f; n++) {
		if(nVertexColors*4 >= this.arrayVertexColor.length) nVertexColors = 0;
		var idVertexColor = nVertexColors*4;
		arrayColorRGBA.push(this.arrayVertexColor[idVertexColor+0],this.arrayVertexColor[idVertexColor+1],this.arrayVertexColor[idVertexColor+2],this.arrayVertexColor[idVertexColor+3]);
		nVertexColors++;
	}	
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer_ColorRGBA);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayColorRGBA), this.gl.STATIC_DRAW);
	//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Uint8Array(arrayColorRGBA));   
};
/**
* Set polarity 
* @type Void
* @param {Int} polarity 1=positive 0=negative  
*/
StormParticles.prototype.setPolarity = function(polarity) { 	
	this.polarity = polarity;
	
	var arrPolaritys = []; 
	for(var n = 0, f = this.particlesLength; n < f; n++) arrPolaritys.push(this.polarity); 
	
	this.webCLGL.enqueueWriteBuffer(this.buffer_ParticlesPolaritys, arrPolaritys);
};
/**
* Set destination plane
* @type Void
* @param {Object} jsonIn
* 	@param {Int} jsonIn.width Width.
* 	@param {Int} jsonIn.height Height.
* 	@param {Float} [jsonIn.spacing=0.01] Spacing.
* 	@param {Float} [jsonIn.force=1.0] Force (from 0.0 to 1.0).
*/
StormParticles.prototype.setDestinationWidthHeight = function(jsonIn, enable) { 	
	this.enDestination = (enable == undefined || enable == true) ? 1 : 0; 
	this.destinationForce = (jsonIn.force != undefined) ? jsonIn.force : this.destinationForce; 
	var len = jsonIn.width*jsonIn.height;
	
	var arrayDest = []; 

	var h = 0, hP = 0, vP = 0;
	var spac = (jsonIn.spacing != undefined) ? jsonIn.spacing : 0.01;
	for(var n = 0, f = len; n < f; n++) {
		var oper = this.MPOS.x($V3([hP,0.0,vP]));
		arrayDest.push(oper.e[3],oper.e[7],oper.e[11], 0.0);
		h++;
		hP+=spac;
		if(h > jsonIn.width-1) {h=0;hP=0;vP+=spac;}
	}
	this.kernelDir.setKernelArg("enableDestination", this.enDestination);
	this.kernelDir.setKernelArg("destinationForce", this.destinationForce);
	this.webCLGL.enqueueWriteBuffer(this.buffer_Destination, arrayDest);
};

/**
* Set destination volume
* @type Void
* @param {Object} jsonIn
* 	@param {StormVoxelizator} jsonIn.voxelizator Voxelizator object.
* 	@param {Float} [jsonIn.force=1.0] Force (from 0.0 to 1.0).
*/
StormParticles.prototype.setDestinationVolume = function(jsonIn, enable) { 	
	this.enDestination = (enable == undefined || enable == true) ? 1 : 0; 
	this.destinationForce = (jsonIn.force != undefined) ? jsonIn.force : this.destinationForce; 
	
	var vo = jsonIn.voxelizator;
	if(vo instanceof StormVoxelizator == false) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	if(vo.image3D_VoxelsColor == undefined) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	var data = vo.clglBuff_VoxelsColor.inData;
	var numActCells = 0;
	for(var n = 0, f = data.length/4; n < f; n++) { // num of active cells
		var id = n*4;
		if(data[id+3] > 0) numActCells++; 
	}
	var particlesXCell = this.particlesLength/numActCells;
	
	var arrayDestT = []; 
	var arrayColorRGBAT = [];
	var stackParticles = 0;
	var CCX=0,CCY=0,CCZ=0;
	var CCXMAX=vo.resolution-1, CCYMAX=vo.resolution-1, CCZMAX=vo.resolution-1;
	for(var n = 0, f = data.length/4; n < f; n++) { // num of active cells
		var id = n*4;
		
		//if(data[id] > 30 && data[id+1] > 30 && data[id+2] > 30) { 
		if(data[id+3] > 0) {
			stackParticles += particlesXCell;
			var particlesOk = Math.floor(stackParticles);
			if(particlesOk > 0) {
				stackParticles -= particlesOk;
				var p = $V3([0.0,0.0,0.0]).add($V3([-(vo.size/2.0), -(vo.size/2.0), -(vo.size/2.0)])); // init position  
				p = p.add($V3([vo.cs*CCX, vo.cs*CCY, vo.cs*(CCZMAX-CCZ)]));  
		
				for(var nb = 0, fnb = particlesOk; nb < fnb; nb++) {
					arrayDestT.push(p.e[0]+(vo.cs*Math.random()),p.e[1]+(vo.cs*Math.random()),p.e[2]+(vo.cs*Math.random()), 0.0); 
					arrayColorRGBAT.push(data[id],data[id+1],data[id+2],1.0);			
				}
			}
		}
		
		if(CCX == CCXMAX && CCZ == CCZMAX && CCY == CCYMAX) {
			break;
		} else {
			if(CCX == CCXMAX && CCZ == CCZMAX) {
				CCX=0;CCZ=0;CCY++;
			} else {
				if(CCX == CCXMAX) {
					CCX=0;CCZ++;
				} else {
					CCX++;
				}
			}
		}
	} 
	
	var arrayDest = []; 
	var arrayColorRGBA = []; 
	for(var n = 0, f = data.length/4; n < f; n++) {
		var id = n*4;
		arrayDest[id] = (arrayDestT[id] != undefined) ? arrayDestT[id] : 0.0;
		arrayDest[id+1] = (arrayDestT[id+1] != undefined) ? arrayDestT[id+1] : 0.0;
		arrayDest[id+2] = (arrayDestT[id+2] != undefined) ? arrayDestT[id+2] : 0.0;
		arrayDest[id+3] = (arrayDestT[id+3] != undefined) ? arrayDestT[id+3] : 0.0;
		
		arrayColorRGBA[id] = (arrayColorRGBAT[id] != undefined) ? arrayColorRGBAT[id] : 0.0;
		arrayColorRGBA[id+1] = (arrayColorRGBAT[id+1] != undefined) ? arrayColorRGBAT[id+1] : 0.0;
		arrayColorRGBA[id+2] = (arrayColorRGBAT[id+2] != undefined) ? arrayColorRGBAT[id+2] : 0.0;
		arrayColorRGBA[id+3] = (arrayColorRGBAT[id+3] != undefined) ? arrayColorRGBAT[id+3] : 0.0;
	}
	
	this.kernelDir.setKernelArg("enableDestination", this.enDestination);
	this.kernelDir.setKernelArg("destinationForce", this.destinationForce);
	this.webCLGL.enqueueWriteBuffer(this.buffer_Destination, arrayDest);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer_ColorRGBA);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayColorRGBA), this.gl.STATIC_DRAW);
	//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Uint8Array(arrayColorRGBA));   
};


/**
* Set destination force
* @type Void
* @param {Float} force from 0.0 to 1.0
*/
StormParticles.prototype.setDestinationForce = function(force) { 	
	this.destinationForce = (force != undefined) ? force : this.destinationForce;
	
	this.kernelDir.setKernelArg("destinationForce", this.destinationForce);
};

/**
* Disable destination
* @type Void
*/
StormParticles.prototype.disableDestination = function() { 	
	this.enDestination = 0;
	
	this.kernelDir.setKernelArg("enableDestination", this.enDestination);
};
/**
* Enable destination
* @type Void
*/
StormParticles.prototype.enableDestination = function() { 	
	this.enDestination = 1;
	
	this.kernelDir.setKernelArg("enableDestination", this.enDestination);
};

/**
* Set life distance
* @type Void
* @param {Float} lifeDistance
*/
StormParticles.prototype.setLifeDistance = function(lifeDistance) { 	
	this.lifeDistance = (lifeDistance != undefined) ? lifeDistance : this.lifeDistance;
	
	this.kernelPos.setKernelArg("lifeDistance", this.lifeDistance);
	this.kernelDir.setKernelArg("lifeDistance", this.lifeDistance);
};

/**
* Set the visibility of the particle selfshadows
* @type Void
* @param {Bool} active
*/
StormParticles.prototype.setSelfshadows = function(active) { 	
	this.selfshadows = active;
};

/**
* Set the point size
* @type Void
* @param {Float} point size
*/
StormParticles.prototype.setPointSize = function(pointSize) { 	
	this.pointSize = (pointSize != undefined) ? pointSize : this.pointSize;
};








/**
* @private 
*/
StormParticles.prototype.makeWebCLGL = function() {	
	// WEBCLGL    	
	this.webCLGL = new WebCLGL();    
	var offset = stormEngineC.particlesOffset;   
	this.buffer_InitPos = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_InitDir = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_ParentId = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', 100);
	this.buffer_PosXYZW = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);this.buffer_PosTempXYZW = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_Dir = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);this.buffer_DirTemp = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset);
	this.buffer_ParticlesPolaritys = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT', offset);
	this.buffer_Destination = this.webCLGL.createBuffer(this.particlesLength, 'FLOAT4', offset); 
	
	
	// POS
	var kernelPos_Source = 'void main(	float4* initPos,'+
										'float4* posXYZW,'+
										'float4* dir,'+
										'float lifeDistance) {'+
								'vec2 x = get_global_id();'+
								'vec3 currentPos = posXYZW[x].xyz;\n'+ 
								'vec4 dir = dir[x];'+
								'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
								'vec3 newPos = (currentPos+currentDir);\n'+
								'vec4 initPos = initPos[x];'+
								'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance)'+
									'newPos = vec3(initPos.x,initPos.y,initPos.z);'+
									
								'out_float4 = vec4(newPos, 1.0);\n'+
								'}';
							
	this.kernelPos = this.webCLGL.createKernel();
	this.kernelPos.setKernelSource(kernelPos_Source);	
	
	this.kernelPos.setKernelArg("initPos", this.buffer_InitPos);
	this.kernelPos.setKernelArg("posXYZW", this.buffer_PosXYZW);
	this.kernelPos.setKernelArg("dir", this.buffer_Dir);
	this.kernelPos.setKernelArg("lifeDistance", this.lifeDistance);
	
	// DIR		
	this.kernelDir = this.webCLGL.createKernel(); 
	this.kernelDir.setKernelSource(this.generatekernelDir_Source());	
	
	this.updatekernelDir_Arguments(); 
}; 
/**
* @private 
*/
StormParticles.prototype.generatekernelDir_Source = function() { 
	lines_argumentsPoles = (function() {
		var str = '';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
					str += ',float pole'+currentPP+'X'+
							',float pole'+currentPP+'Y'+
							',float pole'+currentPP+'Z'+
							',float pole'+currentPP+'Polarity'+
							',float pole'+currentPP+'Orbit'+
							',float pole'+currentPP+'Force';
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	lines_argumentsForces = (function() {
		var str = '';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.forceFields[n].nodesProc[nb].objectType && this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
					str += ',float force'+currentPP+'X'+
							',float force'+currentPP+'Y'+
							',float force'+currentPP+'Z';
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	
	lines_poles = (function() {
		var str = 'float workAreaSize;vec3 polePos;float toDir; vec3 cc;float distanceToPole;\n';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
					str += 'polePos = vec3(pole'+currentPP+'X,pole'+currentPP+'Y,pole'+currentPP+'Z);\n'+ 
							'toDir = 1.0;\n'+  
							'if(sign(particlePolarity[x]) == 0.0 && sign(pole'+currentPP+'Polarity) == 1.0) toDir = -1.0;\n'+
							'if(sign(particlePolarity[x]) == 1.0 && sign(pole'+currentPP+'Polarity) == 0.0) toDir = -1.0;\n'+
							'workAreaSize = '+stormEngineC.particlesOffset.toFixed(20)+';'+ 
							'distanceToPole = distance(currentPos,polePos);'+
							
								//'cc = normalize(currentPos-polePos)*( abs(distanceToPole)*1.0 )*toDir;\n'+
							
							//'if(pole'+n+'Orbit == 0.0)'+			
							'cc = normalize(polePos-currentPos)*( abs(distanceToPole)*0.1*(pole'+currentPP+'Force) )*toDir*-1.0;\n'+	
							'cc += normalize(polePos-currentPos)*( abs(workAreaSize-distanceToPole)*0.1*(1.0-pole'+currentPP+'Force) )*toDir;\n'+
							
							'if(pole'+currentPP+'Orbit == 1.0) cc = normalize(polePos-currentPos)*( abs(workAreaSize-distanceToPole)*0.1*(pole'+currentPP+'Force) )*toDir*-1.0;\n'+
							//'else if(pole'+n+'Atraction == 1.0) cc = normalize(polePos-currentPos)*( abs(distanceToPole)*0.1*(pole'+n+'Force) )*toDir*-1.0;\n'+	
							
							'currentDir = (currentDir)+(cc);\n';
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	lines_forces = (function() {
		var str = 'vec3 force;\n';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.forceFields[n].nodesProc[nb].objectType && this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
					str += 'force = vec3(force'+currentPP+'X,force'+currentPP+'Y,force'+currentPP+'Z);\n'+ 
							'currentDir = currentDir+(force*0.0001);\n';     
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	var kernelDir_Source =	'void main(float4* initPos'+
										',float4* initDir'+
										',float4* posXYZW'+
										',float4* dir'+
										',float isGraph'+
										',float* parentId'+
										',float* particlePolarity'+
										',float4* dest'+
										',float enableDestination'+
										',float destinationForce'+
										',float lifeDistance'+
										lines_argumentsPoles()+ 
										lines_argumentsForces()+ 
										') {\n'+
								'vec2 x = get_global_id();\n'+	 
								'vec4 dirA = dir[x];'+								
								'vec3 currentDir = vec3(dirA.x,dirA.y,dirA.z);\n'+ 
								'vec3 currentPos = posXYZW[x].xyz;\n'+ 
								'vec4 dest = dest[x];'+
								'vec3 destinationPos = vec3(dest.x,dest.y,dest.z);\n'+ 
								
								
								
								
								// particles interact with others particles
								/*'int width = '+Math.sqrt(this.particlesLength)+';'+
								'int height = '+Math.sqrt(this.particlesLength)+';'+
								'float workItemWidth = 1.0/float(width);'+
								'float workItemHeight = 1.0/float(height);'+
								'int currentCol = 0;'+
								'int currentRow = 0;'+
								'const int f = '+this.particlesLength+';\n'+
								'vec3 dirOthers = vec3(0.0,0.0,0.0);\n'+ 
								'int h = 0;'+ 
								'vec4 dirB;'+
								
								'for(int i =0; i < 32*32; i++) {'+
									'vec2 xb = vec2(float(currentCol)*workItemWidth, float(currentRow)*workItemHeight);'+
									'dirB = dir[xb];'+
									'vec3 currentDirB = vec3(dirB.x,dirB.y,dirB.z);\n'+ 
									'vec3 currentPosB = vec3(posX[xb],posY[xb],posZ[xb]);\n'+ 
									
									'float dist = distance(currentPos,currentPosB);'+
									'if(abs(dist) < 0.1) {'+
										'float ww = (0.1-abs(dist))/0.1;'+
										'dirOthers += (currentDirB*ww);'+    
										'h++;'+
									'}'+
									
									'if(currentCol >= width) {'+
										'currentRow++;'+
										'currentCol = 0;'+
									'} else currentCol++;'+
								'}'+
								'dirOthers = (dirOthers/float(h))*0.1;'+
								'currentDir = currentDir+(dirOthers);'+*/
								
								
								
								// for network graph
								'vec3 posParent, dirToDestination;\n'+
								'if(isGraph == 1.0) {'+
									'int width = '+parseInt(Math.sqrt(this.particlesLength))+';'+
									'int height = '+parseInt(Math.sqrt(this.particlesLength))+';'+
									'float workItemWidth = 1.0/float(width);'+
									'float workItemHeight = 1.0/float(height);'+
									
									'int pId = int(parentId[x]);'+								
									'float num = float(pId/width);\n'+
									'float col = fract(num)*float(width);\n'+ 	 
									'float row = floor(num);\n'+
									
									'vec2 xb = vec2(float(col)*workItemWidth, float(row)*workItemHeight);'+
									'posParent = posXYZW[xb].xyz;'+
									'vec3 dirParent = posParent-vec3(0.0,0.0,0.0);'+
									'vec3 destinationPoss = posParent+dirParent;'+
									'dirToDestination = destinationPoss-currentPos;'+
								'}'+
								
								
								
								
								lines_poles()+
								
								'if(enableDestination == 1.0) {\n'+
									'vec3 dirDestination = normalize(destinationPos-currentPos);\n'+
									'float distan = abs(distance(currentPos,destinationPos));\n'+
									'float dirDestWeight = sqrt(distan);\n'+  
									'currentDir = (currentDir+(dirDestination*dirDestWeight*destinationForce))*dirDestWeight*0.1;\n'+
								'}\n'+
								
								lines_forces()+
								
								'currentDir = currentDir*0.8;'+ // air resistence
								
								'vec3 newPos = (currentPos+currentDir);\n'+
								'vec4 initPos = initPos[x];'+
								'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance) {'+
									'vec4 initDir = vec4(initDir[x]);'+
									'currentDir = vec3(initDir.x,initDir.y,initDir.z);'+
								'}'+
								
								// for network graph
								'if(isGraph == 1.0) {'+
									'currentDir = currentDir+(dirToDestination*( max(min(1.0-length(posParent-currentPos),1.0),0.0) ))*0.8;'+ 
								'}'+
								
								
								'vec3 newDir = currentDir;\n'+
	
								'out_float4 = vec4(newDir,1.0);\n'+
							'}';
	return kernelDir_Source;
};
/**
* @private 
*/
StormParticles.prototype.updatekernelDir_Arguments = function() {
	this.kernelDir.setKernelArg("initPos", this.buffer_InitPos);
	this.kernelDir.setKernelArg("initDir", this.buffer_InitDir);
	this.kernelDir.setKernelArg("posXYZW", this.buffer_PosXYZW);
	this.kernelDir.setKernelArg("dir", this.buffer_Dir);
	this.kernelDir.setKernelArg("isGraph", (this.isGraph == true)?1.0:0.0);
	this.kernelDir.setKernelArg("parentId", this.buffer_ParentId);
	this.kernelDir.setKernelArg("particlePolarity", this.buffer_ParticlesPolaritys);
	this.kernelDir.setKernelArg("dest", this.buffer_Destination);
	this.kernelDir.setKernelArg("enableDestination", this.enDestination);
	this.kernelDir.setKernelArg("destinationForce", this.destinationForce);
	this.kernelDir.setKernelArg("lifeDistance", this.lifeDistance);
	
	var currentPP = 0;
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				this.kernelDir.setKernelArg('pole'+currentPP+'X', oper.e[3]); 
				this.kernelDir.setKernelArg('pole'+currentPP+'Y', oper.e[7]); 
				this.kernelDir.setKernelArg('pole'+currentPP+'Z', oper.e[11]); 
				this.kernelDir.setKernelArg('pole'+currentPP+'Polarity', stormEngineC.polarityPoints[n].polarity); 
				this.kernelDir.setKernelArg('pole'+currentPP+'Orbit', stormEngineC.polarityPoints[n].orbit); 
				this.kernelDir.setKernelArg('pole'+currentPP+'Force', stormEngineC.polarityPoints[n].force); 
				
				currentPP++;
			}
		}
	}	
	var currentPP = 0;
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				this.kernelDir.setKernelArg('force'+currentPP+'X', oper.e[0]); 
				this.kernelDir.setKernelArg('force'+currentPP+'Y', oper.e[1]); 
				this.kernelDir.setKernelArg('force'+currentPP+'Z', oper.e[2]); 
				
				currentPP++;
			}
		}
	}	
};