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
	
	this.shader_BN_READY = false;
	
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
	// NodeIndices
	///////////////////////////////////////
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.GL_bufferNodeIndices;
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	this.arrayNodeVertexPosX = [];
	this.arrayNodeVertexPosY = [];
	this.arrayNodeVertexPosZ = [];
	
	this.GL_bufferNodeVertexPosX;
	this.GL_bufferNodeVertexPosY;
	this.GL_bufferNodeVertexPosZ;
};
StormBufferNodes.prototype = Object.create(StormNode.prototype);

StormBufferNodes.prototype.addNode = function() {
	// assign position for this node
	var nodePosX = -(this.workAreaSize/2)+(Math.random()*this.workAreaSize);
	var nodePosZ = -(this.workAreaSize/2)+(Math.random()*this.workAreaSize);
	
	var box = new StormMesh();
	box.loadBox();
	
	var maxNodeIndexId = 0;
	for(var n=0; n < box.indexArray.length; n++) {
		var idxIndex = n;
		var idxVertex = n*3;
		
		this.arrayNodeId.push(this.currentNodeId);
		
		this.arrayNodePosX.push(nodePosX);
		this.arrayNodePosY.push(0.0);
		this.arrayNodePosZ.push(nodePosZ);
		
		this.arrayNodeIndices.push(this.startIndexId+box.indexArray[idxIndex]);
		if(box.indexArray[idxIndex] > maxNodeIndexId) {
			maxNodeIndexId = box.indexArray[idxIndex];			
		}
		
		
		this.arrayNodeVertexPosX.push(box.vertexArray[idxVertex]);
		this.arrayNodeVertexPosY.push(box.vertexArray[idxVertex+1]);
		this.arrayNodeVertexPosZ.push(box.vertexArray[idxVertex+2]);
	}
	this.currentNodeId++; // augment id
	this.startIndexId += (maxNodeIndexId+1);
	console.log(this.arrayNodeIndices);
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	// CLGL buffers
	this.CLGL_bufferNodeId = this.generateCLGLBuffer(this.arrayNodeId);
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	// CLGL buffers
	this.CLGL_bufferNodePosX = this.generateCLGLBuffer(this.arrayNodePosX);
	this.CLGL_bufferNodePosX_TEMP = this.generateCLGLBuffer(this.arrayNodePosX);
	this.CLGL_bufferNodePosY = this.generateCLGLBuffer(this.arrayNodePosY);
	this.CLGL_bufferNodePosY_TEMP = this.generateCLGLBuffer(this.arrayNodePosY);
	this.CLGL_bufferNodePosZ = this.generateCLGLBuffer(this.arrayNodePosZ);
	this.CLGL_bufferNodePosZ_TEMP = this.generateCLGLBuffer(this.arrayNodePosZ);
	
	// GL buffers
	this.GL_bufferNodePosX = this.generateGLPacketBuffer(this.arrayNodePosX, true, "ARRAY_BUFFER");
	this.GL_bufferNodePosY = this.generateGLPacketBuffer(this.arrayNodePosY, true, "ARRAY_BUFFER");
	this.GL_bufferNodePosZ = this.generateGLPacketBuffer(this.arrayNodePosZ, true, "ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeIndices
	///////////////////////////////////////
	// GL buffers
	this.GL_bufferNodeIndices = this.generateGLPacketBuffer(this.arrayNodeIndices, false, "ELEMENT_ARRAY_BUFFER");
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	// GL buffers
	this.GL_bufferNodeVertexPosX = this.generateGLPacketBuffer(this.arrayNodeVertexPosX, true, "ARRAY_BUFFER");
	this.GL_bufferNodeVertexPosY = this.generateGLPacketBuffer(this.arrayNodeVertexPosY, true, "ARRAY_BUFFER");
	this.GL_bufferNodeVertexPosZ = this.generateGLPacketBuffer(this.arrayNodeVertexPosZ, true, "ARRAY_BUFFER");
	
	
	if(this.shader_BN_READY == false) {
		this.initshader_BN();		
	}
	this.initKernels();
};

StormBufferNodes.prototype.generateCLGLBuffer = function(arr) {
	var buffer_CLGL = this.webCLGL.createBuffer(arr.length, 'FLOAT', this.workAreaSize);
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
			var arrPack = stormEngineC.utils.pack((arr[n]+(this.workAreaSize/2))/this.workAreaSize);
			arrayUint[idd+0] = arrPack[0]*256;
			arrayUint[idd+1] = arrPack[1]*256;
			arrayUint[idd+2] = arrPack[2]*256;
			arrayUint[idd+3] = arrPack[3]*256;
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










StormBufferNodes.prototype.initshader_BN = function() {
	var sourceVertex = stormEngineC.stormGLContext.precision+
		'attribute vec4 aNodePosX;\n'+
		'attribute vec4 aNodePosY;\n'+
		'attribute vec4 aNodePosZ;\n'+
	
		'attribute vec4 aNodeVertexPosX;\n'+
		'attribute vec4 aNodeVertexPosY;\n'+
		'attribute vec4 aNodeVertexPosZ;\n'+
		
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		
		'void main(void) {\n'+			
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////
			// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0)) 	
			'float tex_nodePosX = (unpack(aNodePosX)*'+(this.workAreaSize*2).toFixed(7)+')-'+this.workAreaSize.toFixed(7)+';\n'+  
			'float tex_nodePosY = (unpack(aNodePosY)*'+(this.workAreaSize*2).toFixed(7)+')-'+this.workAreaSize.toFixed(7)+';\n'+  
			'float tex_nodePosZ = (unpack(aNodePosZ)*'+(this.workAreaSize*2).toFixed(7)+')-'+this.workAreaSize.toFixed(7)+';\n'+  
			'vec4 nodePos = vec4(tex_nodePosX, tex_nodePosY, tex_nodePosZ, 1.0);'+
			
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////
			'float tex_nodeVertexPosX = (unpack(aNodeVertexPosX)*'+(this.workAreaSize*2).toFixed(7)+')-'+this.workAreaSize.toFixed(7)+';\n'+  
			'float tex_nodeVertexPosY = (unpack(aNodeVertexPosY)*'+(this.workAreaSize*2).toFixed(7)+')-'+this.workAreaSize.toFixed(7)+';\n'+  
			'float tex_nodeVertexPosZ = (unpack(aNodeVertexPosZ)*'+(this.workAreaSize*2).toFixed(7)+')-'+this.workAreaSize.toFixed(7)+';\n'+  
			'vec4 nodeVertexPos = vec4(tex_nodeVertexPosX, tex_nodeVertexPosY, tex_nodeVertexPosZ, 1.0);'+
			
			
			'mat4 nodepos = u_nodeWMatrix;'+
			'nodepos[3][0] = nodePos.x;'+
			'nodepos[3][1] = nodePos.y;'+
			'nodepos[3][2] = nodePos.z;'+
			'gl_Position = uPMatrix * u_cameraWMatrix * nodepos * nodeVertexPos;\n'+
			
			//'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * nodeVertexPos;\n'+
				
		'}';
	var sourceFragment = stormEngineC.stormGLContext.precision+
	
		'void main(void) {\n'+
			'gl_FragColor = vec4(1.0,1.0,1.0, 1.0);\n'+
		'}';
	this.shader_BN = this.gl.createProgram();
	stormEngineC.stormGLContext.createShader(this.gl, "BUFFER NODES", sourceVertex, sourceFragment, this.shader_BN, this.pointers_BufferNodes.bind(this));
};
/**
 * @private 
 */
StormBufferNodes.prototype.pointers_BufferNodes = function() {
	this.u_BN_PMatrix = this.gl.getUniformLocation(this.shader_BN, "uPMatrix");
	this.u_BN_cameraWMatrix = this.gl.getUniformLocation(this.shader_BN, "u_cameraWMatrix");
	this.u_BN_nodeWMatrix = this.gl.getUniformLocation(this.shader_BN, "u_nodeWMatrix");
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	this.attr_BN_NodePosX = this.gl.getAttribLocation(this.shader_BN, "aNodePosX");
	this.attr_BN_NodePosY = this.gl.getAttribLocation(this.shader_BN, "aNodePosY");
	this.attr_BN_NodePosZ = this.gl.getAttribLocation(this.shader_BN, "aNodePosZ");
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	this.attr_BN_NodeVertexPosX = this.gl.getAttribLocation(this.shader_BN, "aNodeVertexPosX");
	this.attr_BN_NodeVertexPosY = this.gl.getAttribLocation(this.shader_BN, "aNodeVertexPosY");
	this.attr_BN_NodeVertexPosZ = this.gl.getAttribLocation(this.shader_BN, "aNodeVertexPosZ");
	
	
	this.shader_BN_READY = true;
};
/**
 * @private 
 */
StormBufferNodes.prototype.render_BufferNodes = function() {
	if(stormEngineC.stormGLContext.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, stormEngineC.stormGLContext.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, stormEngineC.stormGLContext.textureObject_DOF, 0);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
	}
	//this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	//this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	
	this.gl.useProgram(this.shader_BN);
	
	this.gl.uniformMatrix4fv(this.u_BN_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_BN_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	this.gl.uniformMatrix4fv(this.u_BN_nodeWMatrix, false, this.MPOS.transpose().e); 	
			
				
				// WEBCLGL    
				this.webCLGL.enqueueNDRangeKernel(this.kernelPosX, this.CLGL_bufferNodePosX_TEMP); 
				this.webCLGL.enqueueNDRangeKernel(this.kernelPosY, this.CLGL_bufferNodePosY_TEMP); 
				this.webCLGL.enqueueNDRangeKernel(this.kernelPosZ, this.CLGL_bufferNodePosZ_TEMP); 
				
				//this.webCLGL.enqueueNDRangeKernel(this.kernelDirXYZ, this.buffer_DirTemp); 
				
				this.webCLGL.copy(this.CLGL_bufferNodePosX_TEMP, this.CLGL_bufferNodePosX);
				this.webCLGL.copy(this.CLGL_bufferNodePosY_TEMP, this.CLGL_bufferNodePosY);
				this.webCLGL.copy(this.CLGL_bufferNodePosZ_TEMP, this.CLGL_bufferNodePosZ);
				
				//this.webCLGL.copy(this.buffer_DirTemp, this.buffer_Dir);
				
				
				var arr4Uint8_X = this.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(this.CLGL_bufferNodePosX);
				var arr4Uint8_Y = this.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(this.CLGL_bufferNodePosY); 
				var arr4Uint8_Z = this.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(this.CLGL_bufferNodePosZ);
				
				
				
				
				this.gl.useProgram(this.shader_BN); 
				
				
				///////////////////////////////////////
				// NodePos
				///////////////////////////////////////
				this.gl.enableVertexAttribArray(this.attr_BN_NodePosX);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.GL_bufferNodePosX);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_X, this.gl.DYNAMIC_DRAW);
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_X);   
				this.gl.vertexAttribPointer(this.attr_BN_NodePosX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
				
				this.gl.enableVertexAttribArray(this.attr_BN_NodePosY);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.GL_bufferNodePosY);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Y, this.gl.DYNAMIC_DRAW);
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Y); 
				this.gl.vertexAttribPointer(this.attr_BN_NodePosY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
				
				this.gl.enableVertexAttribArray(this.attr_BN_NodePosZ);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.GL_bufferNodePosZ);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Z, this.gl.DYNAMIC_DRAW);
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Z);  
				this.gl.vertexAttribPointer(this.attr_BN_NodePosZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
				
				
				///////////////////////////////////////
				// NodeVertexPos
				///////////////////////////////////////
				this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexPosX);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.GL_bufferNodeVertexPosX);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_X, this.gl.DYNAMIC_DRAW);
					//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_X);   
				this.gl.vertexAttribPointer(this.attr_BN_NodeVertexPosX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
				
				this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexPosY);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.GL_bufferNodeVertexPosY);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Y, this.gl.DYNAMIC_DRAW);
					//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Y); 
				this.gl.vertexAttribPointer(this.attr_BN_NodeVertexPosY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
				
				this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexPosZ);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.GL_bufferNodeVertexPosZ);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Z, this.gl.DYNAMIC_DRAW);
					//this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Z);  
				this.gl.vertexAttribPointer(this.attr_BN_NodeVertexPosZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
				
				///////////////////////////////////////
				// NodeIndices
				///////////////////////////////////////
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.GL_bufferNodeIndices);
				this.gl.drawElements(4, this.arrayNodeIndices.length, this.gl.UNSIGNED_SHORT, 0);
				
				//this.gl.drawArrays(4, 0, this.arrayNodeId.length); // 4 triangles, 
			
		
	if(stormEngineC.stormGLContext.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
	} else {
		//this.gl.disable(this.gl.BLEND);
	}
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