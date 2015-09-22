/*----------------------------------------------------------------------------------------
     									PICK
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Pick = function() {
	var sourceVertex = this.precision+
		'attribute vec3 aVertexPosition;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform float uNodeId;\n'+
		'uniform int uIsTransform;\n'+
		'uniform mat4 u_matrixNodeTranform;\n'+
		
		'uniform float uFar;\n'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'varying float vNodeId;\n'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vNodeId = uNodeId;'+
			
			'if(uIsTransform == 0) {'+ // nodes
				'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'} else {'+ // overlay transforms
				'vec4 scaleVec = u_cameraWMatrix * u_nodeWMatrix * u_matrixNodeTranform * vec4(vp, 1.0);\n'+
				'float scale = (length(scaleVec) * LinearDepthConstant)*50.0;'+
				
				'vec4 pos = vec4(vp, 1.0);'+
				'if(uNodeId == 0.1 || uNodeId == 0.2 || uNodeId == 0.3 || uNodeId == 0.7 || uNodeId == 0.8 || uNodeId == 0.9) {'+
					// position & scale
					'pos = vec4(0.0,-0.5,0.0,1.0)+vec4(vp, 1.0);'+
				'}'+
				
				'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * u_matrixNodeTranform * vec4(vec3(pos.x*scale,pos.y*scale,pos.z*scale), 1.0);\n'+
			'}'+
		'}';
	var sourceFragment = this.precision+
		'uniform float uNodeId;\n'+
		'uniform float uCurrentMousePosX;\n'+
		'uniform float uCurrentMousePosY;\n'+
		'uniform int uIsTransform;\n'+
		
		'varying float vNodeId;\n'+
		
		stormEngineC.utils.packGLSLFunctionString()+
		
		'void main(void) {\n'+// gl_FragCoord.x muestra de 0.0 a width (Ej: 0 a 512.0)
			//'if( (uCurrentMousePosX < (gl_FragCoord.x+1.0) && uCurrentMousePosX > (gl_FragCoord.x-1.0)) &&'+
			//	'(uCurrentMousePosY < (gl_FragCoord.y+1.0) && uCurrentMousePosY > (gl_FragCoord.y-1.0)) ) {\n'+
				'if(uIsTransform == 0) {'+ // nodes
					// 255*255*255*255 = 4228250625
					// uNodeId/4228250625 = value from 0.0 to 1.0
					'gl_FragColor = pack(uNodeId/1000000.0);\n'+ 
				'} else {'+ // overlay transforms
					'gl_FragColor = vec4(0.0, vNodeId, 0.0, 1.0);\n'+ 
				'}'+
			//'}\n'+
		'}';
	this.shader_Pick = this.gl.createProgram();
	this.createShader(this.gl, "PICK", sourceVertex, sourceFragment, this.shader_Pick, this.pointers_Pick.bind(this));
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Pick = function() {
	this.attr_Pick_pos = this.gl.getAttribLocation(this.shader_Pick, "aVertexPosition");
	
	this.u_Pick_nodeId = this.gl.getUniformLocation(this.shader_Pick, "uNodeId");
	this.u_Pick_isTransform = this.gl.getUniformLocation(this.shader_Pick, "uIsTransform");
	this.u_Pick_currentMousePosX = this.gl.getUniformLocation(this.shader_Pick, "uCurrentMousePosX");
	this.u_Pick_currentMousePosY = this.gl.getUniformLocation(this.shader_Pick, "uCurrentMousePosY");
	
	this.u_Pick_far = this.gl.getUniformLocation(this.shader_Pick, "uFar");
	
	this.u_Pick_PMatrix = this.gl.getUniformLocation(this.shader_Pick, "uPMatrix");
	this.u_Pick_cameraWMatrix = this.gl.getUniformLocation(this.shader_Pick, "u_cameraWMatrix");
	this.u_Pick_nodeWMatrix = this.gl.getUniformLocation(this.shader_Pick, "u_nodeWMatrix");
	this.u_Pick_nodeVScale = this.gl.getUniformLocation(this.shader_Pick, "u_nodeVScale");
	this.u_Pick_matrixNodeTranform = this.gl.getUniformLocation(this.shader_Pick, "u_matrixNodeTranform");
	this.Shader_Pick_READY = true;
};



/** @private */
StormGLContext.prototype.render_Pick = function() {
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); 
	this.gl.useProgram(this.shader_Pick);
	
	this.gl.uniform1f(this.u_Pick_far, this.far);
	//alert(node.idNum/this.nodes.length);
	
	//alert((stormEngineC.mousePosX/this.viewportWidth)); 
	this.gl.uniform1f(this.u_Pick_currentMousePosX, stormEngineC.mousePosX);  
	this.gl.uniform1f(this.u_Pick_currentMousePosY, (stormEngineC.$.height()-(stormEngineC.mousePosY))); 
	
	this.gl.uniformMatrix4fv(this.u_Pick_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_Pick_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	
	
	if(this.makeMouseDown == true) {
		this.makeMouseDown = false;
		
		this.pick(this.nodes);
		if(this.nodeQuerySelection == 0) this.pick(this.polarityPoints);
	}
	if(this.makeMouseMove == true) {
		this.makeMouseMove = false;
		
		this.drag();  
	}
	if(this.makeMouseUp == true) {
		this.makeMouseUp = false;
		
		this.unpick();  
	}	
		
	this.gl.disable(this.gl.BLEND);
};
/** @private */
StormGLContext.prototype.pick = function(nodes) {	
	this.nodeQuerySelection = this.querySelect(nodes);
	
	if(this.nodeQuerySelection instanceof StormNode ||
		this.nodeQuerySelection instanceof StormPolarityPoint) { // selection is a node
			if(this.nodeQuerySelection.isDraggable) {
				stormEngineC.selectNode(this.nodeQuerySelection);
				
				this.nodeQuerySelection.bodyActive(false);
				this.nodeQuerySelection.setPosition(this.nodeQuerySelection.getPosition());  
				
				stormEngineC.draggingNodeNow = true;
			}
			if(this.nodeQuerySelection.onmousedownFunction != undefined) this.nodeQuerySelection.onmousedownFunction();
	} else if(this.nodeQuerySelection > 0) { // selection is transform axis of a selected node
		if(stormEngineC.getSelectedNode() != undefined) stormEngineC.getSelectedNode().bodyActive(false);
		
		stormEngineC.draggingNodeNow = true;
	}
};

/** @private */
StormGLContext.prototype.drag = function() {	
	if(stormEngineC.draggingNodeNow == true) {		
		if(this.nodeQuerySelection instanceof StormNode ||
			this.nodeQuerySelection instanceof StormPolarityPoint) {
				var dir = stormEngineC.utils.getDraggingScreenVector(); 
				stormEngineC.getSelectedNode().setPosition(stormEngineC.getSelectedNode().getPosition().add(dir));
		} else if(this.nodeQuerySelection > 0) {
			var selOver = this.nodeQuerySelection;
			if(selOver == 1 || selOver == 2 || selOver == 3) {
				var dir;
				if(selOver == 1) {
					if(stormEngineC.defaultTransformMode == 0)
						dir = stormEngineC.utils.getDraggingPosXVector(); 
					else 
						dir = stormEngineC.utils.getDraggingPosXVector(false); 
				} else if(selOver == 2) {
					if(stormEngineC.defaultTransformMode == 0)
						dir = stormEngineC.utils.getDraggingPosYVector(); 
					else 
						dir = stormEngineC.utils.getDraggingPosYVector(false); 
				} else if(selOver == 3) {
					if(stormEngineC.defaultTransformMode == 0)
						dir = stormEngineC.utils.getDraggingPosZVector(); 
					else 
						dir = stormEngineC.utils.getDraggingPosZVector(false); 
				}
				stormEngineC.getSelectedNode().setPosition(stormEngineC.getSelectedNode().getPosition().add(dir));
			} else if(selOver == 4 || selOver == 5 || selOver == 6) {
				if(selOver == 4) {
					if(stormEngineC.defaultTransformMode == 0) {
						var val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().setRotationX(val.e[0]+val.e[1]+val.e[2]);
					} else {
						var val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().MROTXYZ = stormEngineC.getSelectedNode().MROTXYZ.setRotationX(val.e[0]+val.e[1]+val.e[2]);
					}
				} else if(selOver == 5) {
					if(stormEngineC.defaultTransformMode == 0) {
						var val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().setRotationY(val.e[0]+val.e[1]+val.e[2]);
					} else {
						var val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().MROTXYZ = stormEngineC.getSelectedNode().MROTXYZ.setRotationY(val.e[0]+val.e[1]+val.e[2]);
					}
				} else if(selOver == 6) {
					if(stormEngineC.defaultTransformMode == 0) {
						var val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().setRotationZ(val.e[0]+val.e[1]+val.e[2]);
					} else {
						var val = stormEngineC.utils.getDraggingScreenVector(); 
						stormEngineC.getSelectedNode().MROTXYZ = stormEngineC.getSelectedNode().MROTXYZ.setRotationZ(val.e[0]+val.e[1]+val.e[2]);
					}
				}
			} else if(stormEngineC.defaultTransformMode == 1 && (selOver == 7 || selOver == 8 || selOver == 9)) {
				var val;
				if(selOver == 7) {
					val = stormEngineC.utils.getDraggingScreenVector();  
					stormEngineC.getSelectedNode().setScaleX(val.e[0]+val.e[1]+val.e[2]);
				} else if(selOver == 8) {
					val = stormEngineC.utils.getDraggingScreenVector(); 
					stormEngineC.getSelectedNode().setScaleY(val.e[0]+val.e[1]+val.e[2]);
				} else if(selOver == 9) {
					val = stormEngineC.utils.getDraggingScreenVector(); 
					stormEngineC.getSelectedNode().setScaleZ(val.e[0]+val.e[1]+val.e[2]);
				}
			}
		}
	}
};

/** @private */
StormGLContext.prototype.unpick = function() {
	if(stormEngineC.draggingNodeNow == true) {
		stormEngineC.getSelectedNode().bodyActive(true);
		var dir = stormEngineC.utils.getDraggingScreenVector();
		stormEngineC.getSelectedNode().bodyApplyImpulse({vector: dir.x(100), milis: 10});
		stormEngineC.draggingNodeNow = false;
	}
	
	
	/*this.nodeQuerySelection = this.querySelect(this.nodes);
	if(this.nodeQuerySelection instanceof StormNode) {
		if(	stormEngineC.mousePosX == stormEngineC.oldMousePosClickX &&
			stormEngineC.mousePosY == stormEngineC.oldMousePosClickY) {
				stormEngineC.selectNode(this.nodeQuerySelection);
		}
		if(this.nodeQuerySelection.onmouseupFunction != undefined) this.nodeQuerySelection.onmouseupFunction();
	}

	this.nodeQuerySelection = this.querySelect(this.polarityPoints);
	if(this.nodeQuerySelection instanceof StormPolarityPoint) {
		if(	stormEngineC.mousePosX == stormEngineC.oldMousePosClickX &&
			stormEngineC.mousePosY == stormEngineC.oldMousePosClickY) {
				stormEngineC.selectNode(this.nodeQuerySelection);
		}
		if(this.nodeQuerySelection.onmouseupFunction != undefined) this.nodeQuerySelection.onmouseupFunction();
	}*/
};


/** @private */
StormGLContext.prototype.querySelect = function(nodes) {	
	for(var n = 0, f = nodes.length; n < f; n++) { 
		if(	nodes[n].visibleOnContext && nodes[n].objectType != 'light') {
			
			var node = nodes[n];
			this.gl.uniform1f(this.u_Pick_nodeId, parseFloat(node.idNum));
			
			for(var nb = 0, fb = node.buffersObjects.length; nb < fb; nb++) {
				this.gl.uniform1i(this.u_Pick_isTransform, 0); // nodes
				
				this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOSFrame.transpose().e); 
				this.gl.uniform3f(this.u_Pick_nodeVScale, node.VSCALE.e[0], node.VSCALE.e[1], node.VSCALE.e[2]);   
				
				
				this.gl.enableVertexAttribArray(this.attr_Pick_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
					
				this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, node.buffersObjects[nb].nodeMeshIndexBuffer);
				
				this.gl.drawElements(this.gl.TRIANGLES, node.buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
			}
		}
	}
	
	for(var n = 0, f = nodes.length; n < f; n++) { 
		if(	nodes[n].visibleOnContext && nodes[n].objectType != 'light') {
			var node = nodes[n];
			this.gl.uniform1f(this.u_Pick_nodeId, ((node.idNum+1)/nodes.length));
			if(stormEngineC.editMode && stormEngineC.getSelectedNode() != undefined && stormEngineC.getSelectedNode().idNum == nodes[n].idNum) {
				for(var nb = 0, fb = node.buffersObjects.length; nb < fb; nb++) {	
					this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
					this.gl.uniform1i(this.u_Pick_isTransform, 1); // overlay transforms 
					
					if(stormEngineC.defaultTransformMode == 0) // world
						this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOS.transpose().e); 
					else // local
						this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOSFrame.transpose().e); 
						
					// (detector)
					if(stormEngineC.defaultTransform == 0) {
						// overlay pos X
						this.gl.uniform1f(this.u_Pick_nodeId, 0.1); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosX.MPOS.x(this.nodeOverlayPosX.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosX.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosX.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay pos Y
						this.gl.uniform1f(this.u_Pick_nodeId, 0.2); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosY.MPOS.x(this.nodeOverlayPosY.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosY.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosY.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay pos Z
						this.gl.uniform1f(this.u_Pick_nodeId, 0.3); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosZ.MPOS.x(this.nodeOverlayPosZ.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
					} else if(stormEngineC.defaultTransform == 1) {
						// overlay rot X
						this.gl.uniform1f(this.u_Pick_nodeId, 0.4); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetX.MPOS.x(this.nodeOverlayRotDetX.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay rot Y
						this.gl.uniform1f(this.u_Pick_nodeId, 0.5); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetY.MPOS.x(this.nodeOverlayRotDetY.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay rot Z
						this.gl.uniform1f(this.u_Pick_nodeId, 0.6); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetZ.MPOS.x(this.nodeOverlayRotDetZ.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
					} else if(stormEngineC.defaultTransform == 2 && stormEngineC.defaultTransformMode == 1) {
						// overlay scale X
						this.gl.uniform1f(this.u_Pick_nodeId, 0.7); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetX.MPOS.x(this.nodeOverlayScaDetX.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay scale Y
						this.gl.uniform1f(this.u_Pick_nodeId, 0.8); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetY.MPOS.x(this.nodeOverlayScaDetY.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
						
						// overlay scale Z
						this.gl.uniform1f(this.u_Pick_nodeId, 0.9); 
						this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetZ.MPOS.x(this.nodeOverlayScaDetZ.MROTXYZ).transpose().e);
						
						this.gl.enableVertexAttribArray(this.attr_Pick_pos);
						this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshVertexBuffer);
						this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
						
						this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshIndexBuffer);
						
						this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
					}
				}
			}
		}
	}
	
	return this.querySelectNow(nodes);
};
/** @private */
StormGLContext.prototype.querySelectNow = function(nodes) {
	if(stormEngineC.draggingNodeNow == false) {
		var arrayPick = new Uint8Array(4);  
		this.gl.readPixels(stormEngineC.mousePosX, (stormEngineC.$.height()-(stormEngineC.mousePosY)), 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arrayPick);
		//console.log(arrayPick[0]+"	"+arrayPick[1]+"	"+arrayPick[2]+"	"+arrayPick[3]);
		
		if(arrayPick[0] == 0 && arrayPick[1] != 0 && arrayPick[2] == 0 && arrayPick[3] == 255) { // selection is overlay transforms
			var transformNum = parseFloat(arrayPick[1]/255).toFixed(1); // overlay transforms 
			
			if(transformNum == 0.1) {  // mouse over transform pos x 
				return 1;
			} else if(transformNum == 0.2) {// mouse over transform pos y
				return 2;
			} else if(transformNum == 0.3) {// mouse over transform pos z
				return 3;
			} else if(transformNum == 0.4) {// mouse over transform rot x
				return 4;
			} else if(transformNum == 0.5) {// mouse over transform rot y
				return 5;
			} else if(transformNum == 0.6) {// mouse over transform rot z
				return 6;
			} else if(transformNum == 0.7) {// mouse over transform sca x
				return 7;
			} else if(transformNum == 0.8) {// mouse over transform sca y
				return 8;
			} else if(transformNum == 0.9) {// mouse over transform sca z
				return 9;
			}
		} else if(arrayPick[0] == 0 && arrayPick[1] == 0 && arrayPick[2] == 0 && arrayPick[3] == 0) {
			return 0; 		
		} else { // selection is a node
			var unpackValue = stormEngineC.utils.unpack([arrayPick[0]/255, arrayPick[1]/255, arrayPick[2]/255, arrayPick[3]/255]); // value from 0.0 to 1.0
			var nodeIdNum = Math.floor(unpackValue*1000000.0)-1; 
			var selectedNode = nodes[nodeIdNum];
			//console.log(selectedNode.name);
			
			if(selectedNode != undefined) {// mouse over node
				return selectedNode;
			} else {
				return 0; 
			}
		}
	}
};