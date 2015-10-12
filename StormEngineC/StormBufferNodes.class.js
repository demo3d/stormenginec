/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
StormBufferNodes = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'buffernodes';

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
	
	// NODES POSITION KERNEL
	this.kernelNodePos = this.webCLGL.createKernel();
	this.kernelNodePos.setKernelSource(this.kernelSources.positionByDirection());
	
	// NODES DIRECTION KERNEL
	this.kernelNodeDir = this.webCLGL.createKernel(); 
	this.kernelNodeDir.setKernelSource(this.kernelSources.direction(this.objectType, this.idNum));
	
	// NODES VERTEX AND FRAGMENT PROGRAMS 
	var vfNode_vertexSource = 'void main(float* nodeId,'+
										'float4*kernel nodePos,'+
										'float4* nodeVertexPos,'+
										'float4* nodeVertexCol,'+
										'mat4 PMatrix,'+
										'mat4 cameraWMatrix,'+
										'mat4 nodeWMatrix,'+
										'float workAreaSize,'+
										'float nodesSize) {'+
									'vec2 x = get_global_id();'+
									'float nodeIdx = nodeId[x];\n'+  
									'vec4 nodePosition = nodePos[x];\n'+
									'vec4 nodeVertexPosition = nodeVertexPos[x];\n'+
									'vec4 nodeVertexColor = nodeVertexCol[x];\n'+
									
									
									'mat4 nodepos = nodeWMatrix;'+
									'nodepos[3][0] = nodePosition.x;'+
									'nodepos[3][1] = nodePosition.y;'+
									'nodepos[3][2] = nodePosition.z;'+
									'gl_Position = PMatrix * cameraWMatrix * nodepos * nodeVertexPosition;\n'+
							'}';
	var vfNode_fragmentSource = 'void main(	float nodesSize) {'+
										'vec2 x = get_global_id();'+
										
										'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
									'}';
	this.vfNode = this.webCLGL.createVertexFragmentProgram();
	this.vfNode.setVertexSource(vfNode_vertexSource);
	this.vfNode.setFragmentSource(vfNode_fragmentSource);
};
StormBufferNodes.prototype = Object.create(StormNode.prototype);

/** @private **/
StormBufferNodes.prototype.update = function() {	
	this.updatekernelNodesPos_Arguments();
	this.updatekernelNodesDir_Arguments();
	this.updatevfNode_Arguments();
};

/** @private **/
StormBufferNodes.prototype.setBuffer_NodeId = function(arr) {
	this.CLGL_bufferNodeId = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "VERTEX_AND_FRAGMENT");
	this.CLGL_bufferNodeId_TEMP = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "VERTEX_AND_FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeId, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeId_TEMP, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodePos = function(arr) {
	this.CLGL_bufferNodePosXYZW = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "VERTEX_FROM_KERNEL");
	this.CLGL_bufferNodePosXYZW_TEMP = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "VERTEX_FROM_KERNEL");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodePosXYZW, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodePosXYZW_TEMP, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodeVertexPos = function(arr) {
	this.CLGL_bufferNodeVertexPos = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "VERTEX");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeVertexPos, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodeVertexColor = function(arr) {
	this.CLGL_bufferNodeVertexColor = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "VERTEX");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeVertexColor, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodeIndices = function(arr) {
	this.indicesCount = arr.length;
	this.CLGL_bufferNodeIndices = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "VERTEX_INDEX");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeIndices, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodeDir = function(arr) {
	this.CLGL_bufferNodeDir = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "FRAGMENT");
	this.CLGL_bufferNodeDir_TEMP = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeDir, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeDir_TEMP, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodePolaritys = function(arr) {
	this.CLGL_bufferNodePolaritys = this.webCLGL.createBuffer(arr.length, "FLOAT", this.workAreaSize, false, "FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodePolaritys, arr);
};
/** @private **/
StormBufferNodes.prototype.setBuffer_NodeDestination = function(arr) {
	this.CLGL_bufferNodeDestination = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.workAreaSize, false, "FRAGMENT"); 		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeDestination, arr);
};
/** @private **/
StormBufferNodes.prototype.set_nodesSize = function(nodesSize) {
	this.nodesSize = nodesSize;
};

/** @private **/
StormBufferNodes.prototype.updatekernelNodesPos_Arguments = function() {
	this.kernelNodePos.setKernelArg("posXYZW", this.CLGL_bufferNodePosXYZW);
	this.kernelNodePos.setKernelArg("dir", this.CLGL_bufferNodeDir);
};
/** @private **/
StormBufferNodes.prototype.updatekernelNodesDir_Arguments = function() {
	this.kernelNodeDir.setKernelArg("idx", this.CLGL_bufferNodeId); 
	this.kernelNodeDir.setKernelArg("nodeid", this.CLGL_bufferNodeId); 
	this.kernelNodeDir.setKernelArg("posXYZW", this.CLGL_bufferNodePosXYZW);
	this.kernelNodeDir.setKernelArg("dir", this.CLGL_bufferNodeDir); 
	this.kernelNodeDir.setKernelArg("particlePolarity", this.CLGL_bufferNodePolaritys); 
	this.kernelNodeDir.setKernelArg("dest", this.CLGL_bufferNodeDestination); 
	this.kernelNodeDir.setKernelArg("enableDestination", this.enDestination); 
	this.kernelNodeDir.setKernelArg("destinationForce", this.destinationForce); 
	this.kernelNodeDir.setKernelArg("enableDrag", this.enableDrag); 
	this.kernelNodeDir.setKernelArg("idToDrag", this.idToDrag); 
	this.kernelNodeDir.setKernelArg("MouseDragTranslationX", this.MouseDragTranslationX); 
	this.kernelNodeDir.setKernelArg("MouseDragTranslationY", this.MouseDragTranslationY); 
	this.kernelNodeDir.setKernelArg("MouseDragTranslationZ", this.MouseDragTranslationZ); 
	this.kernelNodeDir.setKernelArg("islink", 0);  // islink
	
	var currentPP = 0;
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'X', oper.e[3]); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Y', oper.e[7]); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Z', oper.e[11]); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Polarity', stormEngineC.polarityPoints[n].polarity); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Orbit', stormEngineC.polarityPoints[n].orbit); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Force', stormEngineC.polarityPoints[n].force); 
				
				currentPP++;
			}
		}
	}	
	
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				this.kernelNodeDir.setKernelArg('force'+n+'X', oper.e[0]); 
				this.kernelNodeDir.setKernelArg('force'+n+'Y', oper.e[1]); 
				this.kernelNodeDir.setKernelArg('force'+n+'Z', oper.e[2]); 
			}
		}
	}	
};
/** @private **/
StormBufferNodes.prototype.updatevfNode_Arguments = function() {
	this.vfNode.setVertexArg("nodeId", this.CLGL_bufferNodeId);
	this.vfNode.setVertexArg("nodePos", this.CLGL_bufferNodePosXYZW); // this from kernel
	this.vfNode.setVertexArg("nodeVertexPos", this.CLGL_bufferNodeVertexPos);
	this.vfNode.setVertexArg("nodeVertexCol", this.CLGL_bufferNodeVertexColor);
	this.vfNode.setVertexArg("PMatrix", stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.vfNode.setVertexArg("cameraWMatrix", stormEngineC.defaultCamera.MPOS.transpose().e);
	this.vfNode.setVertexArg("nodeWMatrix", this.MPOS.transpose().e);
	this.vfNode.setVertexArg("workAreaSize", parseFloat(this.workAreaSize));
	this.vfNode.setVertexArg("nodesSize", parseFloat(this.nodesSize));
	 	
	this.vfNode.setFragmentArg("nodesSize", parseFloat(this.nodesSize));
};

/** @private **/
StormBufferNodes.prototype.prerender = function() {
	this.webCLGL.enqueueNDRangeKernel(this.kernelNodePos, this.CLGL_bufferNodePosXYZW_TEMP);  			
	this.webCLGL.enqueueNDRangeKernel(this.kernelNodeDir, this.CLGL_bufferNodeDir_TEMP); 
	
	this.webCLGL.copy(this.CLGL_bufferNodePosXYZW_TEMP, this.CLGL_bufferNodePosXYZW);			
	this.webCLGL.copy(this.CLGL_bufferNodeDir_TEMP, this.CLGL_bufferNodeDir); 
	
	this.webCLGL.enqueueReadBuffer_Packet4Uint8Array_Float4(this.CLGL_bufferNodePosXYZW); 
};
/** @private **/
StormBufferNodes.prototype.render = function() {
	this.vfNode.setVertexArg("PMatrix", stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.vfNode.setVertexArg("cameraWMatrix", stormEngineC.defaultCamera.MPOS.transpose().e);
	this.vfNode.setVertexArg("nodeWMatrix", this.MPOS.transpose().e);
	//this.vfNode.setVertexArg("workAreaSize", parseFloat(this.workAreaSize));
	this.vfNode.setVertexArg("nodesSize", parseFloat(this.nodesSize));
	
	this.vfNode.setFragmentArg("nodesSize", parseFloat(this.nodesSize));
	
	this.webCLGL.enqueueVertexFragmentProgram(this.vfNode, this.CLGL_bufferNodeIndices, this.indicesCount, this.gl.TRIANGLES);
};






