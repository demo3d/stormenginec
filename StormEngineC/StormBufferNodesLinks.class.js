/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
StormBufferNodesLinks = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'buffernodeslinks';

	this.gl = stormEngineC.stormGLContext.gl;
	this.webCLGL = stormEngineC.clglBufferNodes;
	
	this.workAreaSize = (jsonIn != undefined && jsonIn.workAreaSize != undefined) ? jsonIn.workAreaSize : 100.0;
	
	this.enDestination = 0;
	this.destinationForce = 1.0;
	this.enableDrag = 0.0;
	this.idToDrag = 0.0;
	this.MouseDragTranslationX = 0.0;
	this.MouseDragTranslationY = 0.0;
	this.MouseDragTranslationZ = 0.0;
	this.nodesSize = 0;
	
	this.kernelSources = new KernelSources();
	
	// LINKS POSITION KERNEL	
	this.kernelLinkPos = this.webCLGL.createKernel();
	this.kernelLinkPos.setKernelSource(this.kernelSources.positionByDirection());
	
	// LINKS DIRECTION KERNEL
	this.kernelLinkDir = this.webCLGL.createKernel(); 
	this.kernelLinkDir.setKernelSource(this.kernelSources.direction(this.objectType, this.idNum));
	
	// LINKS VERTEX AND FRAGMENT PROGRAMS 
	var vfLinks_vertexSource = 'void main(float4*kernel linkPos,'+
										'mat4 PMatrix,'+
										'mat4 cameraWMatrix,'+
										'mat4 nodeWMatrix,'+
										'float workAreaSize) {'+
									'vec2 x = get_global_id();'+
									'vec4 linkPosition = linkPos[x];\n'+
									
									
									'mat4 nodepos = nodeWMatrix;'+
									'nodepos[3][0] = linkPosition.x;'+
									'nodepos[3][1] = linkPosition.y;'+
									'nodepos[3][2] = linkPosition.z;'+
									'gl_Position = PMatrix * cameraWMatrix * nodepos * vec4(0.0, 0.0, 0.0, 1.0);\n'+
							'}';
	var vfLinks_fragmentSource = 'void main(	float nodesSize) {'+
										'vec2 x = get_global_id();'+
										
										'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
									'}';
	this.vfLinks = this.webCLGL.createVertexFragmentProgram();
	this.vfLinks.setVertexSource(vfLinks_vertexSource);
	this.vfLinks.setFragmentSource(vfLinks_fragmentSource);
};
StormBufferNodesLinks.prototype = Object.create(StormNode.prototype);

/** @private **/
StormBufferNodesLinks.prototype.update = function() {
	this.updatekernelLinksPos_Arguments();
	this.updatekernelLinksDir_Arguments();
	this.updatevfLinks_Arguments();
};

/** @private **/
StormBufferNodesLinks.prototype.setBuffer_LinkId = function(arr) {
	this.verticesCount = arr.length;
	this.CLGL_bufferLinkId = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "FRAGMENT");
	this.CLGL_bufferLinkId_TEMP = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "FRAGMENT");		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkId, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkId_TEMP, arr);
};
/** @private **/
StormBufferNodesLinks.prototype.setBuffer_LinkNodeId = function(arr) {
	this.CLGL_bufferLinkNodeId = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "FRAGMENT");
	this.CLGL_bufferLinkNodeId_TEMP = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "FRAGMENT");		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkNodeId, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkNodeId_TEMP, arr);
};
/** @private **/
StormBufferNodesLinks.prototype.setBuffer_LinkPos = function(arr) {
	this.CLGL_bufferLinkPosXYZW = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "VERTEX_FROM_KERNEL");
	this.CLGL_bufferLinkPosXYZW_TEMP = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "VERTEX_FROM_KERNEL");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkPosXYZW, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkPosXYZW_TEMP, arr);
};
/** @private **/
StormBufferNodesLinks.prototype.setBuffer_LinkDir = function(arr) {
	this.CLGL_bufferLinkDir = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "FRAGMENT");
	this.CLGL_bufferLinkDir_TEMP = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "FRAGMENT");		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkDir, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkDir_TEMP, arr);
};
/** @private **/
StormBufferNodesLinks.prototype.setBuffer_LinkPolaritys = function(arr) {
	this.CLGL_bufferLinkPolaritys = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "FRAGMENT");		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkPolaritys, arr);
};
/** @private **/
StormBufferNodesLinks.prototype.setBuffer_LinkDestination = function(arr) {
	this.CLGL_bufferLinkDestination = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "FRAGMENT");		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkDestination, arr);
};
/** @private **/
StormBufferNodesLinks.prototype.set_nodesSize = function(nodesSize) {
	this.nodesSize = nodesSize;
};

/** @private **/
StormBufferNodesLinks.prototype.updatekernelLinksPos_Arguments = function() {
	this.kernelLinkPos.setKernelArg("posXYZW", this.CLGL_bufferLinkPosXYZW);
	this.kernelLinkPos.setKernelArg("dir", this.CLGL_bufferLinkDir);
};
/** @private **/
StormBufferNodesLinks.prototype.updatekernelLinksDir_Arguments = function() {
	this.kernelLinkDir.setKernelArg("idx", this.CLGL_bufferLinkId); 
	this.kernelLinkDir.setKernelArg("nodeid", this.CLGL_bufferLinkNodeId); 
	this.kernelLinkDir.setKernelArg("posXYZW", this.CLGL_bufferLinkPosXYZW); 
	this.kernelLinkDir.setKernelArg("dir", this.CLGL_bufferLinkDir); 
	this.kernelLinkDir.setKernelArg("particlePolarity", this.CLGL_bufferLinkPolaritys); 
	this.kernelLinkDir.setKernelArg("dest", this.CLGL_bufferLinkDestination); 
	this.kernelLinkDir.setKernelArg("enableDestination", this.enDestination); 
	this.kernelLinkDir.setKernelArg("destinationForce", this.destinationForce); 
	this.kernelLinkDir.setKernelArg("enableDrag", this.enableDrag); 
	this.kernelLinkDir.setKernelArg("idToDrag", this.idToDrag); 
	this.kernelLinkDir.setKernelArg("MouseDragTranslationX", this.MouseDragTranslationX); 
	this.kernelLinkDir.setKernelArg("MouseDragTranslationY", this.MouseDragTranslationY); 
	this.kernelLinkDir.setKernelArg("MouseDragTranslationZ", this.MouseDragTranslationZ); 
	this.kernelLinkDir.setKernelArg("islink", 1);  // islink
	
	var currentPP = 0;
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				this.kernelLinkDir.setKernelArg('pole'+n+'X', oper.e[3]); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Y', oper.e[7]); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Z', oper.e[11]); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Polarity', stormEngineC.polarityPoints[n].polarity); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Orbit', stormEngineC.polarityPoints[n].orbit); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Force', stormEngineC.polarityPoints[n].force); 
				
				currentPP++;
			}
		}
	}	
	
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				this.kernelLinkDir.setKernelArg('force'+n+'X', oper.e[0]); 
				this.kernelLinkDir.setKernelArg('force'+n+'Y', oper.e[1]); 
				this.kernelLinkDir.setKernelArg('force'+n+'Z', oper.e[2]); 
			}
		}
	}	
};
/** @private **/
StormBufferNodesLinks.prototype.updatevfLinks_Arguments = function() {
	this.vfLinks.setVertexArg("linkPos", this.CLGL_bufferLinkPosXYZW); // this from kernel
	this.vfLinks.setVertexArg("PMatrix", stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.vfLinks.setVertexArg("cameraWMatrix", stormEngineC.defaultCamera.MPOS.transpose().e);
	this.vfLinks.setVertexArg("nodeWMatrix", this.MPOS.transpose().e);
	this.vfLinks.setVertexArg("workAreaSize", parseFloat(this.workAreaSize));
	 	
	this.vfLinks.setFragmentArg("nodesSize", parseFloat(this.nodesSize));
};

/** @private **/
StormBufferNodesLinks.prototype.prerender = function() {
	this.webCLGL.enqueueNDRangeKernel(this.kernelLinkPos, this.CLGL_bufferLinkPosXYZW_TEMP);			
	this.webCLGL.enqueueNDRangeKernel(this.kernelLinkDir, this.CLGL_bufferLinkDir_TEMP); 
	
	this.webCLGL.copy(this.CLGL_bufferLinkPosXYZW_TEMP, this.CLGL_bufferLinkPosXYZW);			
	this.webCLGL.copy(this.CLGL_bufferLinkDir_TEMP, this.CLGL_bufferLinkDir);
	
	this.webCLGL.enqueueReadBuffer_Packet4Uint8Array_Float4(this.CLGL_bufferLinkPosXYZW); 
};
/** @private **/
StormBufferNodesLinks.prototype.render = function() {
	this.vfLinks.setVertexArg("PMatrix", stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.vfLinks.setVertexArg("cameraWMatrix", stormEngineC.defaultCamera.MPOS.transpose().e);
	this.vfLinks.setVertexArg("nodeWMatrix", this.MPOS.transpose().e);
	//this.vfNode.setVertexArg("workAreaSize", parseFloat(this.workAreaSize));
	
	this.vfLinks.setFragmentArg("nodesSize", parseFloat(this.nodesSize));
	
	this.webCLGL.enqueueVertexFragmentProgram(this.vfLinks, undefined, this.verticesCount, this.gl.LINES);
};
