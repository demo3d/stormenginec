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
	
	//*******************************************************************************************************************
	// NODES
	//*******************************************************************************************************************
	// default mesh to use
	var meshNode = new StormNode();
	meshNode.loadBox();
	
	this.currentNodeId = 0;	
	this.nodeArrayItemStart = 0;
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	this.arrayNodeId = [];
	
	this.CLGL_bufferNodeId;
	this.CLGL_bufferNodeId_TEMP;
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	this.arrayNodePosX = [];
	this.arrayNodePosY = [];
	this.arrayNodePosZ = [];
	
	this.CLGL_bufferNodePosX;
	this.CLGL_bufferNodePosY;
	this.CLGL_bufferNodePosZ;
	this.CLGL_bufferNodePosX_TEMP;
	this.CLGL_bufferNodePosY_TEMP;
	this.CLGL_bufferNodePosZ_TEMP;
	
	this.GL_bufferNodePosX;
	this.GL_bufferNodePosY;
	this.GL_bufferNodePosZ;
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	this.arrayNodeVertexPosX = [];
	this.arrayNodeVertexPosY = [];
	this.arrayNodeVertexPosZ = [];
	
	this.GL_bufferNodeVertexPosX;
	this.GL_bufferNodeVertexPosY;
	this.GL_bufferNodeVertexPosZ;
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	this.arrayNodeVertexColor = [];
	
	this.GL_bufferNodeVertexColor;
	
	///////////////////////////////////////
	// NodeIndices
	///////////////////////////////////////
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.GL_bufferNodeIndices;
	
	///////////////////////////////////////
	// NodeDir
	///////////////////////////////////////
	this.arrayNodeDir = [];
	
	this.CLGL_bufferNodeDir;
	this.CLGL_bufferNodeDir_TEMP;
	
	///////////////////////////////////////
	// NodePolaritys
	///////////////////////////////////////
	this.arrayNodePolaritys = [];
	
	this.CLGL_bufferNodePolaritys;
	
	///////////////////////////////////////
	// NodeDestination
	///////////////////////////////////////
	this.arrayNodeDestination = [];
	
	this.CLGL_bufferNodeDestination;
	
	//*******************************************************************************************************************
	// LINKS
	//*******************************************************************************************************************
	this.currentLinkId = 0;
	
	///////////////////////////////////////
	// LinkId
	///////////////////////////////////////
	this.arrayLinkId = [];
	
	this.CLGL_bufferLinkId;
	
	///////////////////////////////////////
	// LinkNodeId
	///////////////////////////////////////
	this.arrayLinkNodeId = [];
	
	this.CLGL_bufferLinkNodeId;
	
	///////////////////////////////////////
	// LinkPos
	///////////////////////////////////////
	this.arrayLinkPosX = [];
	this.arrayLinkPosY = [];
	this.arrayLinkPosZ = [];
	
	this.CLGL_bufferLinkPosX;
	this.CLGL_bufferLinkPosY;
	this.CLGL_bufferLinkPosZ;
	
	this.GL_bufferLinkPosX;
	this.GL_bufferLinkPosY;
	this.GL_bufferLinkPosZ;
	
	///////////////////////////////////////
	// LinkDir
	///////////////////////////////////////
	this.arrayLinkDir = [];
	
	this.CLGL_bufferLinkDir;
	this.CLGL_bufferLinkDir_TEMP; 
	
	///////////////////////////////////////
	// LinkPolaritys
	///////////////////////////////////////
	this.arrayLinkPolaritys = [];
	
	this.CLGL_bufferLinkPolaritys;
	
	///////////////////////////////////////
	// LinkDestination
	///////////////////////////////////////
	this.arrayLinkDestination = [];
	
	this.CLGL_bufferLinkDestination;
};
StormBufferNodes.prototype = Object.create(StormNode.prototype);












//**********************************************************************************************************************************
//**********************************************************************************************************************************
//										NODES
//**********************************************************************************************************************************
//**********************************************************************************************************************************
/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {Int}
 */
StormBufferNodes.prototype.addNode = function(jsonIn) { 
	var nAIS = this.nodeArrayItemStart;
	
	// assign position for this node
	var nodePosX = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[0] : Math.random()*this.workAreaSize;
	var nodePosY = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[1] : Math.random()*this.workAreaSize;
	var nodePosZ = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[2] : Math.random()*this.workAreaSize;
	// assign mesh for this node
	var node = (jsonIn != undefined && jsonIn.node != undefined) ? jsonIn.node : meshNode;
	// assign color for this node
	var color = (jsonIn != undefined && jsonIn.color != undefined) ? jsonIn.color : $V3([1.0, 1.0, 1.0]);
		
	
	//*******************************************************************************************************************
	// FILL ARRAYS
	//*******************************************************************************************************************
	
	for(var i=0; i < node.buffersObjects.length; i++) {
		var bo = node.buffersObjects[i];
		for(var n=0; n < bo.nodeMeshVertexArray.length/3; n++) {
			var idxVertex = n*3;
			
			///////////////////////////////////////
			// NodeId
			///////////////////////////////////////
			this.arrayNodeId.push(this.currentNodeId);
			
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////
			this.arrayNodePosX.push(nodePosX);
			this.arrayNodePosY.push(nodePosY);
			this.arrayNodePosZ.push(nodePosZ);
			
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////
			this.arrayNodeVertexPosX.push(bo.nodeMeshVertexArray[idxVertex]);
			this.arrayNodeVertexPosY.push(bo.nodeMeshVertexArray[idxVertex+1]);
			this.arrayNodeVertexPosZ.push(bo.nodeMeshVertexArray[idxVertex+2]);
			//console.log(bo.nodeMeshVertexArray[idxVertex]);
			
			///////////////////////////////////////
			// NodeVertexColor
			///////////////////////////////////////
			this.arrayNodeVertexColor.push(color.e[0]*255, color.e[1]*255, color.e[2]*255, 255);
			
			///////////////////////////////////////
			// NodeDir
			///////////////////////////////////////
			this.arrayNodeDir.push(0, 0, 0, 255);
			
			///////////////////////////////////////
			// NodePolaritys
			///////////////////////////////////////
			this.arrayNodePolaritys.push(0);
			
			///////////////////////////////////////
			// NodeDestination
			///////////////////////////////////////
			this.arrayNodeDestination.push(0.0, 0.0, 0.0, 255);
			
			
			this.nodeArrayItemStart++;
		}
	}
	//console.log(this.arrayNodePosX.length);
		
	var maxNodeIndexId = 0;
	for(var i=0; i < node.buffersObjects.length; i++) {
		var bo = node.buffersObjects[i];
		for(var n=0; n < bo.nodeMeshIndexArray.length; n++) {
			var idxIndex = n;
			
			///////////////////////////////////////
			// NodeIndices
			///////////////////////////////////////
			this.arrayNodeIndices.push(this.startIndexId+bo.nodeMeshIndexArray[idxIndex]);
			//console.log(this.startIndexId+bo.nodeMeshIndexArray[idxIndex]);
			
			if(bo.nodeMeshIndexArray[idxIndex] > maxNodeIndexId) {
				maxNodeIndexId = bo.nodeMeshIndexArray[idxIndex];			
			}
		}
	}
	this.startIndexId += (maxNodeIndexId+1);
	
	
	this.currentNodeId++; // augment node id
	
	//return this.currentNodeId-1;
	return {"nodeId": this.currentNodeId-1, "itemStart": nAIS}; // nodeArrayItemStart
};	

StormBufferNodes.prototype.updateNodes = function() {
	//*******************************************************************************************************************
	// CREATE CLGL & GL BUFFERS
	//*******************************************************************************************************************
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferNodeId != undefined) {
		this.CLGL_bufferNodeId.remove();
		this.CLGL_bufferNodeId_TEMP.remove();
	}
	this.CLGL_bufferNodeId = this.generateCLGLBuffer(this.arrayNodeId, "FLOAT");
	this.CLGL_bufferNodeId_TEMP = this.generateCLGLBuffer(this.arrayNodeId, "FLOAT");
	
	
	// GL buffers
	if(this.GL_bufferNodeId != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeId);
	}
	this.GL_bufferNodeId = this.generateGLPacketBuffer(this.arrayNodeId, true, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferNodePosX != undefined) {
		this.CLGL_bufferNodePosX.remove();
		this.CLGL_bufferNodePosY.remove();
		this.CLGL_bufferNodePosZ.remove();
		this.CLGL_bufferNodePosX_TEMP.remove();
		this.CLGL_bufferNodePosY_TEMP.remove();
		this.CLGL_bufferNodePosZ_TEMP.remove();
	}
	this.CLGL_bufferNodePosX = this.generateCLGLBuffer(this.arrayNodePosX, "FLOAT");
	this.CLGL_bufferNodePosY = this.generateCLGLBuffer(this.arrayNodePosY, "FLOAT");
	this.CLGL_bufferNodePosZ = this.generateCLGLBuffer(this.arrayNodePosZ, "FLOAT");
	this.CLGL_bufferNodePosX_TEMP = this.generateCLGLBuffer(this.arrayNodePosX, "FLOAT");
	this.CLGL_bufferNodePosY_TEMP = this.generateCLGLBuffer(this.arrayNodePosY, "FLOAT");
	this.CLGL_bufferNodePosZ_TEMP = this.generateCLGLBuffer(this.arrayNodePosZ, "FLOAT");
	
	// GL buffers
	if(this.GL_bufferNodePosX != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodePosX);
		this.gl.deleteBuffer(this.GL_bufferNodePosY);
		this.gl.deleteBuffer(this.GL_bufferNodePosZ);
	}
	this.GL_bufferNodePosX = this.generateGLPacketBuffer(this.arrayNodePosX, true, "ARRAY_BUFFER");
	this.GL_bufferNodePosY = this.generateGLPacketBuffer(this.arrayNodePosY, true, "ARRAY_BUFFER");
	this.GL_bufferNodePosZ = this.generateGLPacketBuffer(this.arrayNodePosZ, true, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	// GL buffers
	if(this.GL_bufferNodeVertexPosX != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeVertexPosX);
		this.gl.deleteBuffer(this.GL_bufferNodeVertexPosY);
		this.gl.deleteBuffer(this.GL_bufferNodeVertexPosZ);
	}
	this.GL_bufferNodeVertexPosX = this.generateGLPacketBuffer(this.arrayNodeVertexPosX, true, "ARRAY_BUFFER");
	this.GL_bufferNodeVertexPosY = this.generateGLPacketBuffer(this.arrayNodeVertexPosY, true, "ARRAY_BUFFER");
	this.GL_bufferNodeVertexPosZ = this.generateGLPacketBuffer(this.arrayNodeVertexPosZ, true, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeVertexColor
	///////////////////////////////////////
	// GL buffers
	if(this.GL_bufferNodeVertexColor != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeVertexColor);
	}
	this.GL_bufferNodeVertexColor = this.generateGLPacketBuffer(this.arrayNodeVertexColor, false, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeIndices
	///////////////////////////////////////
	// GL buffers
	if(this.GL_bufferNodeIndices != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeIndices);
	}
	this.GL_bufferNodeIndices = this.generateGLPacketBuffer(this.arrayNodeIndices, false, "ELEMENT_ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeDir
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferNodeDir != undefined) {
		this.CLGL_bufferNodeDir.remove();
		this.CLGL_bufferNodeDir_TEMP.remove();
	}
	this.CLGL_bufferNodeDir = this.generateCLGLBuffer(this.arrayNodeDir, "FLOAT4"); 
	this.CLGL_bufferNodeDir_TEMP = this.generateCLGLBuffer(this.arrayNodeDir, "FLOAT4");
	
	///////////////////////////////////////
	// NodePolaritys
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferNodePolaritys != undefined) {
		this.CLGL_bufferNodePolaritys.remove();
	}
	this.CLGL_bufferNodePolaritys = this.generateCLGLBuffer(this.arrayNodePolaritys, "FLOAT");
	
	///////////////////////////////////////
	// NodeDestination
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferNodeDestination != undefined) {
		this.CLGL_bufferNodeDestination.remove();
	}
	this.CLGL_bufferNodeDestination = this.generateCLGLBuffer(this.arrayNodeDestination, "FLOAT4"); 
	
	//*******************************************************************************************************************
		
	
	this.initKernelsNodes();
	this.initKernelsNodesDir();	
};
StormBufferNodes.prototype.initKernelsNodes = function() {
	//POS
	var kernelPos_Source = 'void main(	float* posX,'+
										'float* posY,'+
										'float* posZ,'+
										'float4* dir) {'+
									'vec2 x = get_global_id();'+
									'vec3 currentPos = vec3(posX[x],posY[x],posZ[x]);\n'+ 
									'vec4 dir = dir[x];'+
									'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
									'vec3 newPos = (currentPos+currentDir);\n';
	
	var kernelPosX_Source = kernelPos_Source+
							'out_float = newPos.x;\n'+
							'}';
	this.kernelNodePosX = this.webCLGL.createKernel(kernelPosX_Source);
	this.kernelNodePosX.setKernelArg("posX", this.CLGL_bufferNodePosX);
	this.kernelNodePosX.setKernelArg("posY", this.CLGL_bufferNodePosY);
	this.kernelNodePosX.setKernelArg("posZ", this.CLGL_bufferNodePosZ);
	this.kernelNodePosX.setKernelArg("dir", this.CLGL_bufferNodeDir);
	
	var kernelPosY_Source = kernelPos_Source+
							'out_float = newPos.y;\n'+
							'}';
	this.kernelNodePosY = this.webCLGL.createKernel(kernelPosY_Source);
	this.kernelNodePosY.setKernelArg("posX", this.CLGL_bufferNodePosX);
	this.kernelNodePosY.setKernelArg("posY", this.CLGL_bufferNodePosY);
	this.kernelNodePosY.setKernelArg("posZ", this.CLGL_bufferNodePosZ);
	this.kernelNodePosY.setKernelArg("dir", this.CLGL_bufferNodeDir);
	
	var kernelPosZ_Source = kernelPos_Source+
							'out_float = newPos.z;\n'+
							'}';
	this.kernelNodePosZ = this.webCLGL.createKernel(kernelPosZ_Source);
	this.kernelNodePosZ.setKernelArg("posX", this.CLGL_bufferNodePosX); 
	this.kernelNodePosZ.setKernelArg("posY", this.CLGL_bufferNodePosY); 
	this.kernelNodePosZ.setKernelArg("posZ", this.CLGL_bufferNodePosZ);   
	this.kernelNodePosZ.setKernelArg("dir", this.CLGL_bufferNodeDir);
};

StormBufferNodes.prototype.initKernelsNodesDir = function() {
	// DIR
	var kernelDir_Source = this.generatekernelDir_Source();
	
	var kernelDirX_Source = kernelDir_Source+
							'out_float4 = vec4(newDir,1.0);\n'+
							'}';
	this.kernelNodeDir = this.webCLGL.createKernel(kernelDirX_Source); 
	
	this.updatekernelNodesDir_Arguments(); 
};
/**
* @private 
*/
StormBufferNodes.prototype.updatekernelNodesDir_Arguments = function() {
	this.kernelNodeDir.setKernelArg("idx", this.CLGL_bufferNodeId); 
	this.kernelNodeDir.setKernelArg("nodeid", this.CLGL_bufferNodeId); 
	this.kernelNodeDir.setKernelArg("posX", this.CLGL_bufferNodePosX); 
	this.kernelNodeDir.setKernelArg("posY", this.CLGL_bufferNodePosY); 
	this.kernelNodeDir.setKernelArg("posZ", this.CLGL_bufferNodePosZ); 
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









//**********************************************************************************************************************************
//**********************************************************************************************************************************
//										LINKS
//**********************************************************************************************************************************
//**********************************************************************************************************************************
/**
* Create new link for the graph
* @param	{Object} jsonIn
* 	@param {Int} jsonIn.origin Origin for this link (nodeArrayItemStart)
* 	@param {Int} jsonIn.target Target for this link (nodeArrayItemStart)
 * @returns {Int}
 */
StormBufferNodes.prototype.addLink = function(jsonIn) { 
	//*******************************************************************************************************************
	// FILL ARRAYS
	//*******************************************************************************************************************
		//console.log(jsonIn.origin);
		//console.log(jsonIn.target);
	var arr4Uint8_X = this.webCLGL.enqueueReadBuffer_Float(this.CLGL_bufferNodePosX);
	var arr4Uint8_Y = this.webCLGL.enqueueReadBuffer_Float(this.CLGL_bufferNodePosY); 
	var arr4Uint8_Z = this.webCLGL.enqueueReadBuffer_Float(this.CLGL_bufferNodePosZ);
		

		//console.log(arr4Uint8_X);
		//console.log(arr4Uint8_Y);
		//console.log(arr4Uint8_Z); 
	
	///////////////////////////////////////
	// LinkId (origin)
	///////////////////////////////////////
	this.arrayLinkId.push(this.currentLinkId);
	
	///////////////////////////////////////
	// LinkNodeId (origin)
	///////////////////////////////////////
	this.arrayLinkNodeId.push(jsonIn.origin_nodeId);
	
	///////////////////////////////////////
	// LinkPos (origin)
	///////////////////////////////////////
	this.arrayLinkPosX.push(arr4Uint8_X[jsonIn.origin_itemStart]);			
	this.arrayLinkPosY.push(arr4Uint8_Y[jsonIn.origin_itemStart]);
	this.arrayLinkPosZ.push(arr4Uint8_Z[jsonIn.origin_itemStart]);
	
	///////////////////////////////////////
	// LinkDir (origin)
	///////////////////////////////////////
	this.arrayLinkDir.push(0.0, 0.0, 0.0, 255);
	
	///////////////////////////////////////
	// LinkPolaritys (origin)
	///////////////////////////////////////
	this.arrayLinkPolaritys.push(0);
	
	///////////////////////////////////////
	// LinkDestination (origin)
	///////////////////////////////////////
	this.arrayLinkDestination.push(0.0, 0.0, 0.0, 255);
	
	
	
	///////////////////////////////////////
	// LinkId (target)
	///////////////////////////////////////
	this.arrayLinkId.push(this.currentLinkId+1);
	
	///////////////////////////////////////
	// LinkNodeId (target)
	///////////////////////////////////////
	this.arrayLinkNodeId.push(jsonIn.target_nodeId);
	
	///////////////////////////////////////
	// LinkPos (target)
	///////////////////////////////////////
	this.arrayLinkPosX.push(arr4Uint8_X[jsonIn.target_itemStart]);			
	this.arrayLinkPosY.push(arr4Uint8_Y[jsonIn.target_itemStart]);
	this.arrayLinkPosZ.push(arr4Uint8_Z[jsonIn.target_itemStart]);
	
	///////////////////////////////////////
	// LinkDir (target)
	///////////////////////////////////////
	this.arrayLinkDir.push(0.0, 0.0, 0.0, 255);
	
	///////////////////////////////////////
	// LinkPolaritys (target)
	///////////////////////////////////////
	this.arrayLinkPolaritys.push(0);
	
	///////////////////////////////////////
	// LinkDestination (target)
	///////////////////////////////////////
	this.arrayLinkDestination.push(0.0, 0.0, 0.0, 255);
	
	
	this.currentLinkId += 2; // augment link id
	
	return this.currentLinkId-2;
};	

StormBufferNodes.prototype.updateLinks = function() {
	//*******************************************************************************************************************
	// CREATE CLGL & GL BUFFERS
	//*******************************************************************************************************************
	
	///////////////////////////////////////
	// LinkId
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferLinkId != undefined) {
		this.CLGL_bufferLinkId.remove();
		this.CLGL_bufferLinkId_TEMP.remove();
	}
	this.CLGL_bufferLinkId = this.generateCLGLBuffer(this.arrayLinkId, "FLOAT");
	this.CLGL_bufferLinkId_TEMP = this.generateCLGLBuffer(this.arrayLinkId, "FLOAT");
	
	///////////////////////////////////////
	// LinkNodeId
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferLinkNodeId  != undefined) {
		this.CLGL_bufferLinkNodeId.remove();
		this.CLGL_bufferLinkNodeId_TEMP.remove();
	}
	this.CLGL_bufferLinkNodeId = this.generateCLGLBuffer(this.arrayLinkNodeId, "FLOAT");
	this.CLGL_bufferLinkNodeId_TEMP = this.generateCLGLBuffer(this.arrayLinkNodeId, "FLOAT");
	
	///////////////////////////////////////
	// LinkPos
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferLinkPosX  != undefined) {
		this.CLGL_bufferLinkPosX.remove();
		this.CLGL_bufferLinkPosY.remove();
		this.CLGL_bufferLinkPosZ.remove();
		this.CLGL_bufferLinkPosX_TEMP.remove();
		this.CLGL_bufferLinkPosY_TEMP.remove();
		this.CLGL_bufferLinkPosZ_TEMP.remove();
	}
	this.CLGL_bufferLinkPosX = this.generateCLGLBuffer(this.arrayLinkPosX, "FLOAT");
	this.CLGL_bufferLinkPosY = this.generateCLGLBuffer(this.arrayLinkPosY, "FLOAT");
	this.CLGL_bufferLinkPosZ = this.generateCLGLBuffer(this.arrayLinkPosZ, "FLOAT");
	this.CLGL_bufferLinkPosX_TEMP = this.generateCLGLBuffer(this.arrayLinkPosX, "FLOAT");
	this.CLGL_bufferLinkPosY_TEMP = this.generateCLGLBuffer(this.arrayLinkPosY, "FLOAT");
	this.CLGL_bufferLinkPosZ_TEMP = this.generateCLGLBuffer(this.arrayLinkPosZ, "FLOAT");
	
	// GL buffers
	if(this.GL_bufferLinkPosX  != undefined) {
		this.gl.deleteBuffer(this.GL_bufferLinkPosX);
		this.gl.deleteBuffer(this.GL_bufferLinkPosY);
		this.gl.deleteBuffer(this.GL_bufferLinkPosZ);
	}
	this.GL_bufferLinkPosX = this.generateGLPacketBuffer(this.arrayLinkPosX, true, "ARRAY_BUFFER");
	this.GL_bufferLinkPosY = this.generateGLPacketBuffer(this.arrayLinkPosY, true, "ARRAY_BUFFER");
	this.GL_bufferLinkPosZ = this.generateGLPacketBuffer(this.arrayLinkPosZ, true, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// LinkDir
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferLinkDir  != undefined) {
		this.CLGL_bufferLinkDir.remove();
		this.CLGL_bufferLinkDir_TEMP.remove();
	}
	this.CLGL_bufferLinkDir = this.generateCLGLBuffer(this.arrayLinkDir, "FLOAT4");
	this.CLGL_bufferLinkDir_TEMP = this.generateCLGLBuffer(this.arrayLinkDir, "FLOAT4");
	
	///////////////////////////////////////
	// LinkPolaritys
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferLinkPolaritys  != undefined) {
		this.CLGL_bufferLinkPolaritys.remove();
	}
	this.CLGL_bufferLinkPolaritys = this.generateCLGLBuffer(this.arrayLinkPolaritys, "FLOAT");
	
	///////////////////////////////////////
	// LinkDestination
	///////////////////////////////////////
	// CLGL buffers
	if(this.CLGL_bufferLinkDestination  != undefined) {
		this.CLGL_bufferLinkDestination.remove();
	}
	this.CLGL_bufferLinkDestination = this.generateCLGLBuffer(this.arrayLinkDestination, "FLOAT4"); 
	
	//*******************************************************************************************************************
	
	
	
	this.initKernelsLinks();
	this.initKernelsLinksDir();
};
StormBufferNodes.prototype.initKernelsLinks = function() {
	//POS
	var kernelPos_Source = 'void main(	float* posX,'+
										'float* posY,'+
										'float* posZ,'+
										'float4* dir) {'+
									'vec2 x = get_global_id();'+
									'vec3 currentPos = vec3(posX[x],posY[x],posZ[x]);\n'+ 
									'vec4 dir = dir[x];'+
									'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
									'vec3 newPos = (currentPos+currentDir);\n';
	
	var kernelPosX_Source = kernelPos_Source+
							'out_float = newPos.x;\n'+
							'}';
	this.kernelLinkPosX = this.webCLGL.createKernel(kernelPosX_Source);
	this.kernelLinkPosX.setKernelArg("posX", this.CLGL_bufferLinkPosX);
	this.kernelLinkPosX.setKernelArg("posY", this.CLGL_bufferLinkPosY);
	this.kernelLinkPosX.setKernelArg("posZ", this.CLGL_bufferLinkPosZ);
	this.kernelLinkPosX.setKernelArg("dir", this.CLGL_bufferLinkDir);
	
	var kernelPosY_Source = kernelPos_Source+
							'out_float = newPos.y;\n'+
							'}';
	this.kernelLinkPosY = this.webCLGL.createKernel(kernelPosY_Source);
	this.kernelLinkPosY.setKernelArg("posX", this.CLGL_bufferLinkPosX);
	this.kernelLinkPosY.setKernelArg("posY", this.CLGL_bufferLinkPosY);
	this.kernelLinkPosY.setKernelArg("posZ", this.CLGL_bufferLinkPosZ);
	this.kernelLinkPosY.setKernelArg("dir", this.CLGL_bufferLinkDir);
	
	var kernelPosZ_Source = kernelPos_Source+
							'out_float = newPos.z;\n'+
							'}';
	this.kernelLinkPosZ = this.webCLGL.createKernel(kernelPosZ_Source);
	this.kernelLinkPosZ.setKernelArg("posX", this.CLGL_bufferLinkPosX); 
	this.kernelLinkPosZ.setKernelArg("posY", this.CLGL_bufferLinkPosY); 
	this.kernelLinkPosZ.setKernelArg("posZ", this.CLGL_bufferLinkPosZ);   
	this.kernelLinkPosZ.setKernelArg("dir", this.CLGL_bufferLinkDir);
};

StormBufferNodes.prototype.initKernelsLinksDir = function() {
	// DIR
	var kernelDir_Source = this.generatekernelDir_Source();
	
	var kernelDirX_Source = kernelDir_Source+
							'out_float4 = vec4(newDir,1.0);\n'+
							'}';
	this.kernelLinkDir = this.webCLGL.createKernel(kernelDirX_Source); 
	
	this.updatekernelLinksDir_Arguments(); 
};
/**
* @private 
*/
StormBufferNodes.prototype.updatekernelLinksDir_Arguments = function() {
	this.kernelLinkDir.setKernelArg("idx", this.CLGL_bufferLinkId); 
	this.kernelLinkDir.setKernelArg("nodeid", this.CLGL_bufferLinkNodeId); 
	this.kernelLinkDir.setKernelArg("posX", this.CLGL_bufferLinkPosX); 
	this.kernelLinkDir.setKernelArg("posY", this.CLGL_bufferLinkPosY); 
	this.kernelLinkDir.setKernelArg("posZ", this.CLGL_bufferLinkPosZ); 
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














//**********************************************************************************************************************************
//**********************************************************************************************************************************
//										DIR
//**********************************************************************************************************************************
//**********************************************************************************************************************************
/**
* @private 
*/
StormBufferNodes.prototype.generatekernelDir_Source = function() { 
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
							'workAreaSize = '+stormEngineC.polarityPoints[n].nodesProc[nb].workAreaSize.toFixed(20)+';'+
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
	var kernelDir_Source =	'void main(	float* idx'+
										',float* nodeid'+
										',float* posX'+
										',float* posY'+
										',float* posZ'+
										',float4* dir'+
										',float* particlePolarity'+
										',float4* dest'+
										',float enableDestination'+
										',float destinationForce'+
										',float enableDrag'+
										',float idToDrag'+
										',float MouseDragTranslationX'+
										',float MouseDragTranslationY'+
										',float MouseDragTranslationZ'+
										',float islink'+
										lines_argumentsPoles()+ 
										lines_argumentsForces()+ 
										') {\n'+
								'vec2 x = get_global_id();\n'+	 
								'float idBN = idx[x];'+
								'float nodeidBN = nodeid[x];'+	
								'vec4 dirA = dir[x];'+								
								'vec3 currentDir = vec3(dirA.x,dirA.y,dirA.z);\n'+ 
								'vec3 currentPos = vec3(posX[x],posY[x],posZ[x]);\n'+ 
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
														
								
								
								lines_poles()+
								
								'if(enableDrag == 1.0) {'+
									'if(islink == 0.0) {'+
										'if(idBN == idToDrag) {'+
											'vec3 dp = vec3(MouseDragTranslationX, MouseDragTranslationY, MouseDragTranslationZ);'+ 
											'currentDir = dp;\n'+
										'}\n'+
									'} else {'+
										'if(nodeidBN == idToDrag) {'+
											'vec3 dp = vec3(MouseDragTranslationX, MouseDragTranslationY, MouseDragTranslationZ);'+ 
											'currentDir = dp;\n'+
										'}\n'+
									'}\n'+
								'}\n'+
								
								'if(enableDestination == 1.0) {\n'+
									'vec3 dirDestination = normalize(destinationPos-currentPos);\n'+
									'float distan = abs(distance(currentPos,destinationPos));\n'+
									'float dirDestWeight = sqrt(distan);\n'+  
									'currentDir = (currentDir+(dirDestination*dirDestWeight*destinationForce))*dirDestWeight*0.1;\n'+
								'}\n'+
								
								lines_forces()+
								
								'currentDir = currentDir*0.8;'+ // air resistence
								
								
								
								'vec3 newDir = currentDir;\n';
	return kernelDir_Source;
};










//*******************************************************************************************************************
// FUNCTION FOR CREATION & UPDATE OF CLGL & GL BUFFERS
//*******************************************************************************************************************
StormBufferNodes.prototype.generateCLGLBuffer = function(arr, type) {
	var buffer_CLGL;
	if(type == "FLOAT") {
		buffer_CLGL = this.webCLGL.createBuffer(arr.length, type, (this.workAreaSize));
	} else {
		buffer_CLGL = this.webCLGL.createBuffer(arr.length/4, type, (this.workAreaSize));
	}
	this.webCLGL.enqueueWriteBuffer(buffer_CLGL, arr);

	return buffer_CLGL;
};
StormBufferNodes.prototype.generateGLPacketBuffer = function(arr, packet, arrayType) {
	var pack = (packet != undefined && packet == false) ? false : true;
	
	var buffer_GL = this.gl.createBuffer();
	
	if(pack == true) {
		var arrayUint = new Uint8Array(arr.length*4); 	
		for(var n = 0, f = arr.length; n < f; n++) {  
			var idd = n*4;
			var arrPack = stormEngineC.utils.pack((arr[n]+(((this.workAreaSize*2.0))/2))/((this.workAreaSize*2.0))); 
			arrayUint[idd+0] = arrPack[0]*255;
			arrayUint[idd+1] = arrPack[1]*255;
			arrayUint[idd+2] = arrPack[2]*255;
			arrayUint[idd+3] = arrPack[3]*255;
		}	
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayUint), this.gl.DYNAMIC_DRAW);
	} else {
		if(arrayType != undefined && arrayType == "ELEMENT_ARRAY_BUFFER") {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer_GL);
			this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), this.gl.DYNAMIC_DRAW);					
		} else { // ARRAY_BUFFER
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arr), this.gl.DYNAMIC_DRAW);			
		}
	}
	
	return buffer_GL;
};
