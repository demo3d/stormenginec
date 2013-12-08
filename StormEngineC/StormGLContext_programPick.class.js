/*----------------------------------------------------------------------------------------
     									PICK
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Pick = function() {
	_this = stormEngineC.stormGLContext;
	var sourceVertex = 	'attribute vec3 aVertexPosition;\n'+
		
		'uniform mat4 u_nodeWVMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
					
		'void main(void) {\n'+
			'gl_Position = uPMatrix * u_nodeWVMatrix * vec4(aVertexPosition, 1.0);\n'+
			
		'}';
	var sourceFragment = _this.precision+
		
		'uniform float uNodeId;\n'+
		'uniform float uCurrentMousePosX;\n'+
		'uniform float uCurrentMousePosY;\n'+
		
		'void main(void) {\n'+// gl_FragCoord.x muestra de 0.0 a width (Ej: 0 a 512.0)
			'if( (uCurrentMousePosX < (gl_FragCoord.x+1.0) && uCurrentMousePosX > (gl_FragCoord.x-1.0)) &&'+
				'(uCurrentMousePosY < (gl_FragCoord.y+1.0) && uCurrentMousePosY > (gl_FragCoord.y-1.0)) ) {\n'+
				
				'gl_FragColor = vec4(uNodeId, 0.0, 0.0, 1.0);\n'+
			'}\n'+
		'}';
	_this.shader_Pick = _this.gl.createProgram();
	_this.createShader(_this.gl, "PICK", sourceVertex, sourceFragment, _this.shader_Pick, _this.pointers_Pick);
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Pick = function() {
	_this = stormEngineC.stormGLContext;
	_this.attr_Pick_pos = _this.gl.getAttribLocation(_this.shader_Pick, "aVertexPosition");
	
	_this.u_Pick_nodeId = _this.gl.getUniformLocation(_this.shader_Pick, "uNodeId");
	_this.u_Pick_currentMousePosX = _this.gl.getUniformLocation(_this.shader_Pick, "uCurrentMousePosX");
	_this.u_Pick_currentMousePosY = _this.gl.getUniformLocation(_this.shader_Pick, "uCurrentMousePosY");
	
	_this.u_Pick_PMatrix = _this.gl.getUniformLocation(_this.shader_Pick, "uPMatrix");
	_this.u_Pick_nodeWVMatrix = _this.gl.getUniformLocation(_this.shader_Pick, "u_nodeWVMatrix");
	_this.Shader_Pick_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Pick = function() {
	
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); 
	this.gl.useProgram(this.shader_Pick);
	
	for(var n = 0, f = this.nodes.length; n < f; n++) { 
		if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light') { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
			for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
				//alert(this.nodes[n].idNum/this.nodes.length);
				this.gl.uniform1f(this.u_Pick_nodeId, (this.nodes[n].idNum/this.nodes.length));
				//alert((stormEngineC.mousePosX/this.viewportWidth));
				this.gl.uniform1f(this.u_Pick_currentMousePosX, stormEngineC.mousePosX);
				this.gl.uniform1f(this.u_Pick_currentMousePosY, (this.viewportHeight-stormEngineC.mousePosY)); 
				
				this.gl.uniformMatrix4fv(this.u_Pick_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
				this.gl.uniformMatrix4fv(this.u_Pick_nodeWVMatrix, false, this.nodes[n].MCAMPOSFrame.transpose().e);
				
				
				this.gl.enableVertexAttribArray(this.attr_Pick_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
					
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
				
				
				
				this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
			}
		}
	}
	
	this.gl.disable(this.gl.BLEND);
	
	
	var arrayPick = new Uint8Array(4); 
	this.gl.readPixels(stormEngineC.mousePosX, (this.viewportHeight-stormEngineC.mousePosY), 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arrayPick);

	if(arrayPick[0] != 0) {
		var selectedNode = stormEngineC.nodes[ Math.round(parseFloat(arrayPick[0]/255)*this.nodes.length) ];
		if(selectedNode != undefined) stormEngineC.PanelListObjects.select(undefined, selectedNode);		
	}
};