/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
StormBufferNodes = function() { StormNode.call(this); 
	this.objectType = 'buffernodes';

	this.gl = stormEngineC.stormGLContext.gl;
	this.webCLGL = new WebCLGL();
	
	this.workAreaSize = 100.0;
	
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
	// NodeIndices
	///////////////////////////////////////
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.GL_bufferNodeIndices;
};
StormBufferNodes.prototype = Object.create(StormNode.prototype);

StormBufferNodes.prototype.addNode = function() {
	// assign position for this node
	var nodePosX = -(this.workAreaSize/2)+(Math.random()*this.workAreaSize);
	var nodePosZ = -(this.workAreaSize/2)+(Math.random()*this.workAreaSize);
	
	var box = new StormMesh();
	box.loadBox();
		
	
	//*******************************************************************************************************************
	// FILL TEMPORAL ARRAYS
	//*******************************************************************************************************************
	
	var arrayNodeId_TEMP = [];
	var arrayNodePosX_TEMP = [];
	var arrayNodePosY_TEMP = [];
	var arrayNodePosZ_TEMP = [];
	var arrayNodeVertexPosX_TEMP = [];
	var arrayNodeVertexPosY_TEMP = [];
	var arrayNodeVertexPosZ_TEMP = [];
	var arrayNodeIndices_TEMP = [];
	for(var n=0; n < box.vertexArray.length/3; n++) {
		var idxVertex = n*3;
		
		///////////////////////////////////////
		// NodeId
		///////////////////////////////////////		
		arrayNodeId_TEMP.push(this.currentNodeId);
		
		///////////////////////////////////////
		// NodePos
		///////////////////////////////////////		
		arrayNodePosX_TEMP.push(nodePosX);
		arrayNodePosY_TEMP.push(0.0);
		arrayNodePosZ_TEMP.push(nodePosZ);
		
		///////////////////////////////////////
		// NodeVertexPos
		///////////////////////////////////////		
		arrayNodeVertexPosX_TEMP.push(box.vertexArray[idxVertex]);
		arrayNodeVertexPosY_TEMP.push(box.vertexArray[idxVertex+1]);
		arrayNodeVertexPosZ_TEMP.push(box.vertexArray[idxVertex+2]);
	}	
	if(this.currentNodeId == 0) { // new
		for(var n=arrayNodeId_TEMP.length; n < 512*512; n++) {
			
			///////////////////////////////////////
			// NodeId
			///////////////////////////////////////		
			arrayNodeId_TEMP.push(0.0);
			
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////		
			arrayNodePosX_TEMP.push(0.0);
			arrayNodePosY_TEMP.push(0.0);
			arrayNodePosZ_TEMP.push(0.0);
			
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////		
			arrayNodeVertexPosX_TEMP.push(0.0);
			arrayNodeVertexPosY_TEMP.push(0.0);
			arrayNodeVertexPosZ_TEMP.push(0.0);
		}	
	}
	
	for(var n=0; n < box.indexArray.length; n++) {	
		var idxIndex = n;
		
		///////////////////////////////////////
		// NodeIndices
		///////////////////////////////////////		
		arrayNodeIndices_TEMP.push(this.startIndexId+box.indexArray[idxIndex]);		
	}
	if(this.currentNodeId == 0) { // new
		for(var n=arrayNodeIndices_TEMP.length; n < 512*512; n++) {
			
			///////////////////////////////////////
			// NodeIndices
			///////////////////////////////////////		
			arrayNodeIndices_TEMP.push(0.0);		
		}
	}
	
	//*******************************************************************************************************************
	// CREATE OR UPDATE CLGL & GL BUFFERS
	//*******************************************************************************************************************
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	// CLGL buffers
	if(this.currentNodeId == 0) { // new
		this.CLGL_bufferNodeId = this.generateCLGLBuffer(arrayNodeId_TEMP);
		this.CLGL_bufferNodeId_TEMP = this.generateCLGLBuffer(arrayNodeId_TEMP);
	} else { // update
		this.updateCLGLBuffer(this.arrayNodeId.length, this.CLGL_bufferNodeId, arrayNodeId_TEMP);
		this.updateCLGLBuffer(this.arrayNodeId.length, this.CLGL_bufferNodeId_TEMP, arrayNodeId_TEMP);
	}
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	// CLGL buffers
	if(this.currentNodeId == 0) { // new
		this.CLGL_bufferNodePosX = this.generateCLGLBuffer(arrayNodePosX_TEMP);
		this.CLGL_bufferNodePosY = this.generateCLGLBuffer(arrayNodePosY_TEMP);
		this.CLGL_bufferNodePosZ = this.generateCLGLBuffer(arrayNodePosZ_TEMP);
		this.CLGL_bufferNodePosX_TEMP = this.generateCLGLBuffer(arrayNodePosX_TEMP);
		this.CLGL_bufferNodePosY_TEMP = this.generateCLGLBuffer(arrayNodePosY_TEMP);
		this.CLGL_bufferNodePosZ_TEMP = this.generateCLGLBuffer(arrayNodePosZ_TEMP);
	} else { // update
		this.updateCLGLBuffer(this.arrayNodePosX.length, this.CLGL_bufferNodePosX, arrayNodePosX_TEMP);	
		this.updateCLGLBuffer(this.arrayNodePosY.length, this.CLGL_bufferNodePosY, arrayNodePosY_TEMP);	
		this.updateCLGLBuffer(this.arrayNodePosZ.length, this.CLGL_bufferNodePosZ, arrayNodePosZ_TEMP);
		this.updateCLGLBuffer(this.arrayNodePosX.length, this.CLGL_bufferNodePosX_TEMP, arrayNodePosX_TEMP);	
		this.updateCLGLBuffer(this.arrayNodePosY.length, this.CLGL_bufferNodePosY_TEMP, arrayNodePosY_TEMP);	
		this.updateCLGLBuffer(this.arrayNodePosZ.length, this.CLGL_bufferNodePosZ_TEMP, arrayNodePosZ_TEMP);
	}
	
	// GL buffers
	if(this.currentNodeId == 0) { // new
		this.GL_bufferNodePosX = this.generateGLPacketBuffer(arrayNodePosX_TEMP, true, "ARRAY_BUFFER");
		this.GL_bufferNodePosY = this.generateGLPacketBuffer(arrayNodePosY_TEMP, true, "ARRAY_BUFFER");
		this.GL_bufferNodePosZ = this.generateGLPacketBuffer(arrayNodePosZ_TEMP, true, "ARRAY_BUFFER");
	} else { // update
		this.updateGLPacketBuffer(this.arrayNodePosX.length, this.GL_bufferNodePosX, arrayNodePosX_TEMP, true, "ARRAY_BUFFER");
		this.updateGLPacketBuffer(this.arrayNodePosY.length, this.GL_bufferNodePosY, arrayNodePosY_TEMP, true, "ARRAY_BUFFER");
		this.updateGLPacketBuffer(this.arrayNodePosZ.length, this.GL_bufferNodePosZ, arrayNodePosZ_TEMP, true, "ARRAY_BUFFER");
	}
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	// GL buffers
	if(this.currentNodeId == 0) { // new
		this.GL_bufferNodeVertexPosX = this.generateGLPacketBuffer(arrayNodeVertexPosX_TEMP, true, "ARRAY_BUFFER");
		this.GL_bufferNodeVertexPosY = this.generateGLPacketBuffer(arrayNodeVertexPosY_TEMP, true, "ARRAY_BUFFER");
		this.GL_bufferNodeVertexPosZ = this.generateGLPacketBuffer(arrayNodeVertexPosZ_TEMP, true, "ARRAY_BUFFER");
	} else { // update
		this.updateGLPacketBuffer(this.arrayNodeVertexPosX.length, this.GL_bufferNodeVertexPosX, arrayNodeVertexPosX_TEMP, true, "ARRAY_BUFFER");
		this.updateGLPacketBuffer(this.arrayNodeVertexPosY.length, this.GL_bufferNodeVertexPosY, arrayNodeVertexPosY_TEMP, true, "ARRAY_BUFFER");
		this.updateGLPacketBuffer(this.arrayNodeVertexPosZ.length, this.GL_bufferNodeVertexPosZ, arrayNodeVertexPosZ_TEMP, true, "ARRAY_BUFFER");
	}
	
	///////////////////////////////////////
	// NodeIndices
	///////////////////////////////////////
	// GL buffers
	if(this.currentNodeId == 0) { // new
		this.GL_bufferNodeIndices = this.generateGLPacketBuffer(arrayNodeIndices_TEMP, false, "ELEMENT_ARRAY_BUFFER");
	} else { // update
		this.updateGLPacketBuffer(this.arrayNodeIndices.length, this.GL_bufferNodeIndices, arrayNodeIndices_TEMP, false, "ELEMENT_ARRAY_BUFFER");
	}
	
	
	
	//*******************************************************************************************************************
	// STORE TEMPORAL ARRAYS IN NATIVE ARRAYS
	//*******************************************************************************************************************
	
	for(var n=0; n < box.vertexArray.length/3; n++) {
		var idxVertex = n*3;
		
		///////////////////////////////////////
		// NodeId
		///////////////////////////////////////
		this.arrayNodeId.push(this.currentNodeId);
		
		///////////////////////////////////////
		// NodePos
		///////////////////////////////////////
		this.arrayNodePosX.push(nodePosX);
		this.arrayNodePosY.push(0.0);
		this.arrayNodePosZ.push(nodePosZ);
		
		///////////////////////////////////////
		// NodeVertexPos
		///////////////////////////////////////
		this.arrayNodeVertexPosX.push(box.vertexArray[idxVertex]);
		this.arrayNodeVertexPosY.push(box.vertexArray[idxVertex+1]);
		this.arrayNodeVertexPosZ.push(box.vertexArray[idxVertex+2]);
		//console.log(box.vertexArray[idxVertex]);
	}
	//console.log(this.arrayNodePosX.length);
		
	var maxNodeIndexId = 0;
	for(var n=0; n < box.indexArray.length; n++) {	
		var idxIndex = n;
		
		///////////////////////////////////////
		// NodeIndices
		///////////////////////////////////////
		this.arrayNodeIndices.push(this.startIndexId+box.indexArray[idxIndex]);
		//console.log(this.startIndexId+box.indexArray[idxIndex]);
		
		if(box.indexArray[idxIndex] > maxNodeIndexId) {
			maxNodeIndexId = box.indexArray[idxIndex];			
		}
	}
	this.startIndexId += (maxNodeIndexId+1);
	
	
	this.currentNodeId++; // augment id
	this.initKernels();
};


//*******************************************************************************************************************
// FUNCTION FOR CREATION & UPDATE OF CLGL & GL BUFFERS
//*******************************************************************************************************************
StormBufferNodes.prototype.generateCLGLBuffer = function(arr) {
	var buffer_CLGL = this.webCLGL.createBuffer(arr.length, 'FLOAT', this.workAreaSize);
	this.webCLGL.enqueueWriteBuffer(buffer_CLGL, arr);
	
	return buffer_CLGL;
};
StormBufferNodes.prototype.updateCLGLBuffer = function(updatingFromId, buffer_CLGL, arr) {
	//var buffer_CLGL = this.webCLGL.createBuffer(arr.length, 'FLOAT', this.workAreaSize);
	this.webCLGL.enqueueUpdateBuffer(buffer_CLGL, arr, updatingFromId);
	
	return buffer_CLGL;
};
StormBufferNodes.prototype.generateGLPacketBuffer = function(arr, packet, arrayType) {
	var pack = (packet != undefined && packet == false) ? false : true;
	
	var buffer_GL = this.gl.createBuffer();// buffers del objeto para opengl
	
	if(pack == true) {
		var arrayUint = new Uint8Array(arr.length*4); 	
		for(var n = 0, f = arr.length; n < f; n++) {  
			var idd = n*4;
			var arrPack = stormEngineC.utils.pack((arr[n]+(this.workAreaSize/2))/this.workAreaSize);
			arrayUint[idd+0] = arrPack[0]*255;
			arrayUint[idd+1] = arrPack[1]*255;
			arrayUint[idd+2] = arrPack[2]*255;
			arrayUint[idd+3] = arrPack[3]*255;
		}	
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
		//if(updatingFromId == -1)
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayUint), this.gl.DYNAMIC_DRAW);			
		//else
			//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, updatingFromId, new Uint8Array(arrayUint));
	} else {
		if(arrayType != undefined && arrayType == "ELEMENT_ARRAY_BUFFER") {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer_GL);
			//if(updatingFromId == -1)
				this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), this.gl.DYNAMIC_DRAW);		
			//else
				//this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, updatingFromId, new Uint16Array(arr));					
		} else { // ARRAY_BUFFER
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
			//if(updatingFromId == -1)
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arr), this.gl.DYNAMIC_DRAW);
			//else
				//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, updatingFromId, new Uint8Array(arr));				
		}
	}
	
	return buffer_GL;
};
StormBufferNodes.prototype.updateGLPacketBuffer = function(updatingFromId, buffer_GL, arr, packet, arrayType) {
	var pack = (packet != undefined && packet == false) ? false : true;
	
	//var buffer_GL = this.gl.createBuffer();// buffers del objeto para opengl
	
	if(pack == true) {
		var arrayUint = new Uint8Array(arr.length*4); 	
		for(var n = 0, f = arr.length; n < f; n++) {  
			var idd = n*4;
			var arrPack = stormEngineC.utils.pack((arr[n]+(this.workAreaSize/2))/this.workAreaSize);
			arrayUint[idd+0] = arrPack[0]*255;
			arrayUint[idd+1] = arrPack[1]*255;
			arrayUint[idd+2] = arrPack[2]*255;
			arrayUint[idd+3] = arrPack[3]*255;
		}	
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
		//if(updatingFromId == -1)
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayUint), this.gl.DYNAMIC_DRAW);			
		//else
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, updatingFromId, new Uint8Array(arrayUint));
	} else {
		if(arrayType != undefined && arrayType == "ELEMENT_ARRAY_BUFFER") {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer_GL);
			//if(updatingFromId == -1)
				//this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), this.gl.DYNAMIC_DRAW);		
			//else
				this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, updatingFromId, new Uint16Array(arr));					
		} else { // ARRAY_BUFFER
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
			//if(updatingFromId == -1)
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arr), this.gl.DYNAMIC_DRAW);
			//else
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, updatingFromId, new Uint8Array(arr));				
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