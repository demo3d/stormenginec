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
	
	// default mesh to use
	var meshNode = new StormNode();
	meshNode.loadBox();
	
	this.currentNodeId = 0;	
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	this.arrayNodeId = [];
	
	this.CLGL_bufferNodeId;
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	this.arrayNodePosX = [];
	this.arrayNodePosY = [];
	this.arrayNodePosZ = [];
	
	this.CLGL_bufferNodePosX;
	this.CLGL_bufferNodePosY;
	this.CLGL_bufferNodePosZ;
	
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
};
StormBufferNodes.prototype = Object.create(StormNode.prototype);

/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {Int}
 */
StormBufferNodes.prototype.addNode = function(jsonIn) { 
	// assign position for this node
	var nodePosX = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[0] : Math.random()*this.workAreaSize;
	var nodePosY = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[1] : Math.random()*this.workAreaSize;
	var nodePosZ = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[2] : Math.random()*this.workAreaSize;
	// assign mesh for this node
	var node = (jsonIn != undefined && jsonIn.node != undefined) ? jsonIn.node : meshNode;
	// assign color for this node
	var color = (jsonIn != undefined && jsonIn.color != undefined) ? jsonIn.color : $V3([1.0, 1.0, 1.0]);
		
	
	//*******************************************************************************************************************
	// FILL TEMPORAL ARRAYS
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
	
	
	//*******************************************************************************************************************
	// CREATE OR UPDATE CLGL & GL BUFFERS
	//*******************************************************************************************************************
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	// CLGL buffers
	if(this.currentNodeId > 0) {
		this.CLGL_bufferNodeId.remove();
		this.CLGL_bufferNodeId_TEMP.remove();
	}
	this.CLGL_bufferNodeId = this.generateCLGLBuffer(this.arrayNodeId);
	this.CLGL_bufferNodeId_TEMP = this.generateCLGLBuffer(this.arrayNodeId);
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	// CLGL buffers
	if(this.currentNodeId > 0) {
		this.CLGL_bufferNodePosX.remove();
		this.CLGL_bufferNodePosY.remove();
		this.CLGL_bufferNodePosZ.remove();
		this.CLGL_bufferNodePosX_TEMP.remove();
		this.CLGL_bufferNodePosY_TEMP.remove();
		this.CLGL_bufferNodePosZ_TEMP.remove();
	}
	this.CLGL_bufferNodePosX = this.generateCLGLBuffer(this.arrayNodePosX);
	this.CLGL_bufferNodePosY = this.generateCLGLBuffer(this.arrayNodePosY);
	this.CLGL_bufferNodePosZ = this.generateCLGLBuffer(this.arrayNodePosZ);
	this.CLGL_bufferNodePosX_TEMP = this.generateCLGLBuffer(this.arrayNodePosX);
	this.CLGL_bufferNodePosY_TEMP = this.generateCLGLBuffer(this.arrayNodePosY);
	this.CLGL_bufferNodePosZ_TEMP = this.generateCLGLBuffer(this.arrayNodePosZ);
	
	// GL buffers
	if(this.currentNodeId > 0) {
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
	if(this.currentNodeId > 0) {
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
	if(this.currentNodeId > 0) {
		this.gl.deleteBuffer(this.GL_bufferNodeVertexColor);
	}
	this.GL_bufferNodeVertexColor = this.generateGLPacketBuffer(this.arrayNodeVertexColor, false, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeIndices
	///////////////////////////////////////
	// GL buffers
	if(this.currentNodeId > 0) {
		this.gl.deleteBuffer(this.GL_bufferNodeIndices);
	}
	this.GL_bufferNodeIndices = this.generateGLPacketBuffer(this.arrayNodeIndices, false, "ELEMENT_ARRAY_BUFFER");
	
	//*******************************************************************************************************************
	
	
	
	
	this.currentNodeId++; // augment id
	this.initKernels();
	
	return this.currentNodeId-1;
};

StormBufferNodes.prototype.addLink = function(jsonIn) { 
	
	
};

//*******************************************************************************************************************
// FUNCTION FOR CREATION & UPDATE OF CLGL & GL BUFFERS
//*******************************************************************************************************************
StormBufferNodes.prototype.generateCLGLBuffer = function(arr) {
	var buffer_CLGL = this.webCLGL.createBuffer(arr.length, 'FLOAT', (this.workAreaSize));
	this.webCLGL.enqueueWriteBuffer(buffer_CLGL, arr);
	
	return buffer_CLGL;
};
StormBufferNodes.prototype.generateGLPacketBuffer = function(arr, packet, arrayType) {
	var pack = (packet != undefined && packet == false) ? false : true;
	
	var buffer_GL = this.gl.createBuffer();// buffers del objeto para opengl
	
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












StormBufferNodes.prototype.initKernels = function() {
	//POS
	var kernelPos_Source = 'void main(	float* posX,'+
										'float* posY,'+
										'float* posZ) {'+
								'vec2 x = get_global_id();'+
								'vec3 currentPos = vec3(posX[x],posY[x],posZ[x]);\n'+ 
								//'vec4 dir = dir[x];'+
								//'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
								//'vec3 newPos = (currentPos+currentDir);\n'+
								//'vec4 initPos = initPos[x];'+
								//'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance)'+
								//	'newPos = vec3(initPos.x,initPos.y,initPos.z);';
								
								'vec3 newPos = currentPos;'; 
	
	var kernelPosX_Source = kernelPos_Source+
							'out_float = newPos.x;\n'+
							'}';
	this.kernelPosX = this.webCLGL.createKernel(kernelPosX_Source);
	this.kernelPosX.setKernelArg(0,this.CLGL_bufferNodePosX);
	this.kernelPosX.setKernelArg(1,this.CLGL_bufferNodePosY);
	this.kernelPosX.setKernelArg(2,this.CLGL_bufferNodePosZ);
	
	var kernelPosY_Source = kernelPos_Source+
							'out_float = newPos.y;\n'+
							'}';
	this.kernelPosY = this.webCLGL.createKernel(kernelPosY_Source);
	this.kernelPosY.setKernelArg(0,this.CLGL_bufferNodePosX);
	this.kernelPosY.setKernelArg(1,this.CLGL_bufferNodePosY);
	this.kernelPosY.setKernelArg(2,this.CLGL_bufferNodePosZ);
	
	var kernelPosZ_Source = kernelPos_Source+
							'out_float = newPos.z;\n'+
							'}';
	this.kernelPosZ = this.webCLGL.createKernel(kernelPosZ_Source);
	this.kernelPosZ.setKernelArg(0,this.CLGL_bufferNodePosX); 
	this.kernelPosZ.setKernelArg(1,this.CLGL_bufferNodePosY); 
	this.kernelPosZ.setKernelArg(2,this.CLGL_bufferNodePosZ);   
	
	this.kernelPosX.compile();
	this.kernelPosY.compile();
	this.kernelPosZ.compile();
};