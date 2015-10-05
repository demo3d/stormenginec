StormGLContext.prototype.initshader_BN = function() {
	var sourceVertex = this.precision+
		// for BufferNodes
		'attribute vec4 aNodeId;\n'+
	
		'attribute vec4 aNodePosX;\n'+
		'attribute vec4 aNodePosY;\n'+
		'attribute vec4 aNodePosZ;\n'+
	
		'attribute vec4 aNodeVertexPosX;\n'+
		'attribute vec4 aNodeVertexPosY;\n'+
		'attribute vec4 aNodeVertexPosZ;\n'+
		
		'attribute vec4 aNodeVertexColor;\n'+
		'varying vec4 vNodeVertexColor;\n'+
		
		'uniform float u_workAreaSize;\n'+
		
		
		// others attrs
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		
		'varying float vNodeId;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		
		'void main(void) {\n'+		
			///////////////////////////////////////
			// NodeId
			///////////////////////////////////////
			// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0)) 	
			'float tex_nodeId = (unpack(aNodeId)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'vNodeId = tex_nodeId;'+
			
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////
			// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0)) 	
			'float tex_nodePosX = (unpack(aNodePosX)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'float tex_nodePosY = (unpack(aNodePosY)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'float tex_nodePosZ = (unpack(aNodePosZ)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'vec4 nodePos = vec4(tex_nodePosX, tex_nodePosY, tex_nodePosZ, 1.0);'+
			
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////
			// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0)) 	 
			'float tex_nodeVertexPosX = (unpack(aNodeVertexPosX)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'float tex_nodeVertexPosY = (unpack(aNodeVertexPosY)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'float tex_nodeVertexPosZ = (unpack(aNodeVertexPosZ)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'vec4 nodeVertexPos = vec4(tex_nodeVertexPosX, tex_nodeVertexPosY, tex_nodeVertexPosZ, 1.0);'+
			
			///////////////////////////////////////
			// NodeVertexColor
			///////////////////////////////////////
			// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0)) 	
			'vNodeVertexColor = aNodeVertexColor;\n'+
			
			
			
			'mat4 nodepos = u_nodeWMatrix;'+
			'nodepos[3][0] = nodePos.x;'+
			'nodepos[3][1] = nodePos.y;'+
			'nodepos[3][2] = nodePos.z;'+
			'gl_Position = uPMatrix * u_cameraWMatrix * nodepos * nodeVertexPos;\n'+
			
			//'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * nodeVertexPos;\n'+
				
		'}';
	var sourceFragment = this.precision+
	
		'varying vec4 vNodeVertexColor;\n'+
		
		'varying float vNodeId;\n'+
		'uniform float u_nodesSize;\n'+
		
		'void main(void) {\n'+
			'gl_FragColor = vec4(vNodeVertexColor.r, vNodeVertexColor.g, vNodeVertexColor.b, vNodeVertexColor.a);\n'+
		'}';
	this.shader_BN = this.gl.createProgram();
	this.createShader(this.gl, "BUFFER NODES", sourceVertex, sourceFragment, this.shader_BN, this.pointers_BufferNodes.bind(this));
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_BufferNodes = function() {
	this.u_BN_PMatrix = this.gl.getUniformLocation(this.shader_BN, "uPMatrix");
	this.u_BN_cameraWMatrix = this.gl.getUniformLocation(this.shader_BN, "u_cameraWMatrix");
	this.u_BN_nodeWMatrix = this.gl.getUniformLocation(this.shader_BN, "u_nodeWMatrix");
	
	this.u_BN_uWorkAreaSize = this.gl.getUniformLocation(this.shader_BN, "u_workAreaSize");
	this.u_BN_uNodesSize = this.gl.getUniformLocation(this.shader_BN, "u_nodesSize");

	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	this.attr_BN_NodeId = this.gl.getAttribLocation(this.shader_BN, "aNodeId");
	
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
	
	///////////////////////////////////////
	// NodeVertexColor
	///////////////////////////////////////
	this.attr_BN_NodeVertexColor = this.gl.getAttribLocation(this.shader_BN, "aNodeVertexColor");
	
	this.Shader_BN_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_BufferNodes = function() {
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureObject_DOF, 0);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
	}
	//this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	//this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	
	this.gl.useProgram(this.shader_BN);
	
	this.gl.uniformMatrix4fv(this.u_BN_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_BN_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
		
			
	for(var n=0; n < stormEngineC.bufferNodes.length; n++) {
		var bn = stormEngineC.bufferNodes[n];
		
		if(bn.arrayNodeId.length) {
			this.gl.uniform1f(this.u_BN_uWorkAreaSize, parseFloat(bn.workAreaSize));
			this.gl.uniform1f(this.u_BN_uNodesSize, parseFloat(bn.currentNodeId-1));
			
			this.gl.uniformMatrix4fv(this.u_BN_nodeWMatrix, false, bn.MPOS.transpose().e); 
			
			
			// WEBCLGL    
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelNodePosX, bn.CLGL_bufferNodePosX_TEMP); 
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelNodePosY, bn.CLGL_bufferNodePosY_TEMP); 
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelNodePosZ, bn.CLGL_bufferNodePosZ_TEMP); 
			
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelNodeDir, bn.CLGL_bufferNodeDir_TEMP); 
			
			bn.webCLGL.copy(bn.CLGL_bufferNodePosX_TEMP, bn.CLGL_bufferNodePosX);
			bn.webCLGL.copy(bn.CLGL_bufferNodePosY_TEMP, bn.CLGL_bufferNodePosY);
			bn.webCLGL.copy(bn.CLGL_bufferNodePosZ_TEMP, bn.CLGL_bufferNodePosZ);
			
			bn.webCLGL.copy(bn.CLGL_bufferNodeDir_TEMP, bn.CLGL_bufferNodeDir); 
			
			
			var arr4Uint8_X = bn.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(bn.CLGL_bufferNodePosX);
			var arr4Uint8_Y = bn.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(bn.CLGL_bufferNodePosY); 
			var arr4Uint8_Z = bn.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(bn.CLGL_bufferNodePosZ);
			
			
			
			
			this.gl.useProgram(this.shader_BN); 
			
			
			///////////////////////////////////////
			// NodeId
			///////////////////////////////////////
			this.gl.enableVertexAttribArray(this.attr_BN_NodeId);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodeId);
			this.gl.vertexAttribPointer(this.attr_BN_NodeId, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////
			this.gl.enableVertexAttribArray(this.attr_BN_NodePosX);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodePosX);
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_X, this.gl.DYNAMIC_DRAW);
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_X);    
			this.gl.vertexAttribPointer(this.attr_BN_NodePosX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
			
			this.gl.enableVertexAttribArray(this.attr_BN_NodePosY);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodePosY);
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Y, this.gl.DYNAMIC_DRAW);
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Y); 
			this.gl.vertexAttribPointer(this.attr_BN_NodePosY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			this.gl.enableVertexAttribArray(this.attr_BN_NodePosZ);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodePosZ);
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Z, this.gl.DYNAMIC_DRAW);
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Z);   
			this.gl.vertexAttribPointer(this.attr_BN_NodePosZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////
			this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexPosX);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodeVertexPosX);
			this.gl.vertexAttribPointer(this.attr_BN_NodeVertexPosX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
			
			this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexPosY);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodeVertexPosY);
			this.gl.vertexAttribPointer(this.attr_BN_NodeVertexPosY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexPosZ);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodeVertexPosZ);
			this.gl.vertexAttribPointer(this.attr_BN_NodeVertexPosZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			
			///////////////////////////////////////
			// NodeVertexColor
			///////////////////////////////////////
			this.gl.enableVertexAttribArray(this.attr_BN_NodeVertexColor);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferNodeVertexColor);
			this.gl.vertexAttribPointer(this.attr_BN_NodeVertexColor, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
			
			
			///////////////////////////////////////
			// NodeIndices
			///////////////////////////////////////
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bn.GL_bufferNodeIndices);
			this.gl.drawElements(this.gl.TRIANGLES, bn.arrayNodeIndices.length, this.gl.UNSIGNED_SHORT, 0);
			
			//this.gl.drawArrays(4, 0, bn.arrayNodeIndices.length); // 4 triangles,
		}
	}	
		
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
	} else {
		//this.gl.disable(this.gl.BLEND);
	}
};












StormGLContext.prototype.initshader_BNLinks = function() {
	var sourceVertex = this.precision+
		'attribute vec4 aLinkPosX;\n'+
		'attribute vec4 aLinkPosY;\n'+
		'attribute vec4 aLinkPosZ;\n'+
		
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform float u_workAreaSize;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		
		'void main(void) {\n'+			
			///////////////////////////////////////
			// LinkPos
			///////////////////////////////////////
			// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0)) 	
			'float tex_linkPosX = (unpack(aLinkPosX)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'float tex_linkPosY = (unpack(aLinkPosY)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'float tex_linkPosZ = (unpack(aLinkPosZ)*(u_workAreaSize*2.0))-u_workAreaSize;\n'+  
			'vec4 linkPos = vec4(tex_linkPosX, tex_linkPosY, tex_linkPosZ, 1.0);'+
			
			
			'mat4 nodepos = u_nodeWMatrix;'+
			'nodepos[3][0] = linkPos.x;'+
			'nodepos[3][1] = linkPos.y;'+
			'nodepos[3][2] = linkPos.z;'+
			'gl_Position = uPMatrix * u_cameraWMatrix * nodepos * vec4(0.0, 0.0, 0.0, 1.0);\n'+
			
			//'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * nodeVertexPos;\n'+
				
		'}';
	var sourceFragment = this.precision+
		
		'void main(void) {\n'+
			'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n'+
		'}';
	this.shader_BNLinks = this.gl.createProgram();
	this.createShader(this.gl, "BUFFER NODES LINKS", sourceVertex, sourceFragment, this.shader_BNLinks, this.pointers_BufferNodesLinks.bind(this));
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_BufferNodesLinks = function() {
	this.u_BNLinks_PMatrix = this.gl.getUniformLocation(this.shader_BNLinks, "uPMatrix");
	this.u_BNLinks_cameraWMatrix = this.gl.getUniformLocation(this.shader_BNLinks, "u_cameraWMatrix");
	this.u_BNLinks_nodeWMatrix = this.gl.getUniformLocation(this.shader_BNLinks, "u_nodeWMatrix");
	
	this.u_BNLinks_uWorkAreaSize = this.gl.getUniformLocation(this.shader_BNLinks, "u_workAreaSize");
	
	///////////////////////////////////////
	// LinkPos
	///////////////////////////////////////
	this.attr_BNLinks_LinkPosX = this.gl.getAttribLocation(this.shader_BNLinks, "aLinkPosX");
	this.attr_BNLinks_LinkPosY = this.gl.getAttribLocation(this.shader_BNLinks, "aLinkPosY");
	this.attr_BNLinks_LinkPosZ = this.gl.getAttribLocation(this.shader_BNLinks, "aLinkPosZ");
	
	this.shader_BNLinks_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_BufferNodesLinks = function() {
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureObject_DOF, 0);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
	}
	//this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	//this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	
	this.gl.useProgram(this.shader_BNLinks);
	
	this.gl.uniformMatrix4fv(this.u_BNLinks_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_BNLinks_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
		
			
	for(var n=0; n < stormEngineC.bufferNodes.length; n++) {
		var bn = stormEngineC.bufferNodes[n];
		
		if(bn.arrayLinkId.length) {
			this.gl.uniform1f(this.u_BNLinks_uWorkAreaSize, parseFloat(bn.workAreaSize));	
			
			this.gl.uniformMatrix4fv(this.u_BNLinks_nodeWMatrix, false, bn.MPOS.transpose().e); 
			
			// WEBCLGL    
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelLinkPosX, bn.CLGL_bufferLinkPosX_TEMP); 
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelLinkPosY, bn.CLGL_bufferLinkPosY_TEMP); 
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelLinkPosZ, bn.CLGL_bufferLinkPosZ_TEMP); 
			
			bn.webCLGL.enqueueNDRangeKernel(bn.kernelLinkDir, bn.CLGL_bufferLinkDir_TEMP); 
			
			bn.webCLGL.copy(bn.CLGL_bufferLinkPosX_TEMP, bn.CLGL_bufferLinkPosX);
			bn.webCLGL.copy(bn.CLGL_bufferLinkPosY_TEMP, bn.CLGL_bufferLinkPosY);
			bn.webCLGL.copy(bn.CLGL_bufferLinkPosZ_TEMP, bn.CLGL_bufferLinkPosZ);
			
			bn.webCLGL.copy(bn.CLGL_bufferLinkDir_TEMP, bn.CLGL_bufferLinkDir);
			
			
			var arr4Uint8_X = bn.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(bn.CLGL_bufferLinkPosX);
			var arr4Uint8_Y = bn.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(bn.CLGL_bufferLinkPosY); 
			var arr4Uint8_Z = bn.webCLGL.enqueueReadBuffer_Float_Packet4Uint8Array(bn.CLGL_bufferLinkPosZ);
			
			
			
			
			this.gl.useProgram(this.shader_BNLinks); 
			
			
			///////////////////////////////////////
			// LinkPos
			///////////////////////////////////////
			this.gl.enableVertexAttribArray(this.attr_BNLinks_LinkPosX);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferLinkPosX);
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_X, this.gl.DYNAMIC_DRAW);
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_X);    
			this.gl.vertexAttribPointer(this.attr_BNLinks_LinkPosX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
			
			this.gl.enableVertexAttribArray(this.attr_BNLinks_LinkPosY);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferLinkPosY);
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Y, this.gl.DYNAMIC_DRAW);
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Y); 
			this.gl.vertexAttribPointer(this.attr_BNLinks_LinkPosY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			this.gl.enableVertexAttribArray(this.attr_BNLinks_LinkPosZ);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bn.GL_bufferLinkPosZ);
			//this.gl.bufferData(this.gl.ARRAY_BUFFER, arr4Uint8_Z, this.gl.DYNAMIC_DRAW);
			this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, arr4Uint8_Z);   
			this.gl.vertexAttribPointer(this.attr_BNLinks_LinkPosZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			
			
			this.gl.drawArrays(this.gl.LINES, 0, bn.arrayLinkId.length);
		}
	}	
		
	if(this.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
	} else {
		//this.gl.disable(this.gl.BLEND);
	}
};