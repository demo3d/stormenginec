/*----------------------------------------------------------------------------------------
     									PICK
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Pick = function() {
	var sourceVertex = this.precision+
		// for graph
		'attribute float aNodeId;\n'+
		
		'attribute vec4 aNodePosX;\n'+
		'attribute vec4 aNodePosY;\n'+
		'attribute vec4 aNodePosZ;\n'+
	
		'attribute vec4 aNodeVertexPos;\n'+
		
		'uniform float u_workAreaSize;\n'+
		
		// others attrs		
		'attribute vec3 aVertexPosition;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform float uNodeId;\n'+
		'uniform int uVertexType;\n'+
		'uniform mat4 u_matrixNodeTranform;\n'+
		
		'uniform float uFar;\n'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		
		'varying float vNodeId;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
	
		
		'void main(void) {\n'+
			'if(uVertexType == 0) {'+ // nodes
				'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
				'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'} else if(uVertexType == 1) {'+ // overlay transforms
				'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
				'vec4 scaleVec = u_cameraWMatrix * u_nodeWMatrix * u_matrixNodeTranform * vec4(vp, 1.0);\n'+
				'float scale = (length(scaleVec) * LinearDepthConstant)*100.0;'+
				
				'vec4 pos = vec4(vp, 1.0);'+
				'if(uNodeId == 0.1 || uNodeId == 0.2 || uNodeId == 0.3 || uNodeId == 0.7 || uNodeId == 0.8 || uNodeId == 0.9) {'+
					// position & scale
					'pos = vec4(0.0,-0.5,0.0,1.0)+vec4(vp, 1.0);'+
				'}'+
				
				'gl_Position = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * u_matrixNodeTranform * vec4(vec3(pos.x*scale,pos.y*scale,pos.z*scale), 1.0);\n'+
			'} else if(uVertexType == 2) {'+ // editing graph
				///////////////////////////////////////
				// NodeId
				///////////////////////////////////////
				// normalized and no needed divide by 255 (unpack(aNodeVertexPosX/255.0))
				'float tex_nodeId = aNodeId;\n'+
				'vNodeId = tex_nodeId+1.0;'+
			
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
				'vec4 nodeVertexPos = aNodeVertexPos;'+
			
				
				'mat4 nodepos = u_nodeWMatrix;'+
				'nodepos[3][0] = nodePos.x;'+
				'nodepos[3][1] = nodePos.y;'+
				'nodepos[3][2] = nodePos.z;'+
				'gl_Position = uPMatrix * u_cameraWMatrix * nodepos * nodeVertexPos;\n'+
			'}'+
		'}';
	var sourceFragment = this.precision+
		'uniform float uNodeId;\n'+
		'uniform float uCurrentMousePosX;\n'+
		'uniform float uCurrentMousePosY;\n'+
		'uniform int uVertexType;\n'+
		'uniform int uFragType;\n'+
		
		'varying float vNodeId;\n'+
		
		stormEngineC.utils.packGLSLFunctionString()+
		
		'void main(void) {\n'+// gl_FragCoord.x muestra de 0.0 a width (Ej: 0 a 512.0)
			//'if( (uCurrentMousePosX < (gl_FragCoord.x+1.0) && uCurrentMousePosX > (gl_FragCoord.x-1.0)) &&'+
			//	'(uCurrentMousePosY < (gl_FragCoord.y+1.0) && uCurrentMousePosY > (gl_FragCoord.y-1.0)) ) {\n'+
				'if(uFragType == 0) {'+ // nodes
					// 255*255*255*255 = 4228250625
					// uNodeId/4228250625 = value from 0.0 to 1.0
					'gl_FragColor = pack((uNodeId+1.0)/1000000.0);\n'+ 
				'} else if(uFragType == 1) {'+ // overlay transforms
					'gl_FragColor = vec4(0.0, uNodeId, 0.0, 1.0);\n'+ 
				'} else if(uFragType == 2) {'+ // editing graph
					'gl_FragColor = pack(vNodeId/1000000.0);\n'+ 
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
	this.u_Pick_vertexType = this.gl.getUniformLocation(this.shader_Pick, "uVertexType");
	this.u_Pick_fragType = this.gl.getUniformLocation(this.shader_Pick, "uFragType");
	
	this.u_Pick_currentMousePosX = this.gl.getUniformLocation(this.shader_Pick, "uCurrentMousePosX");
	this.u_Pick_currentMousePosY = this.gl.getUniformLocation(this.shader_Pick, "uCurrentMousePosY");
	
	this.u_Pick_far = this.gl.getUniformLocation(this.shader_Pick, "uFar");
	
	this.u_Pick_PMatrix = this.gl.getUniformLocation(this.shader_Pick, "uPMatrix");
	this.u_Pick_cameraWMatrix = this.gl.getUniformLocation(this.shader_Pick, "u_cameraWMatrix");
	this.u_Pick_nodeWMatrix = this.gl.getUniformLocation(this.shader_Pick, "u_nodeWMatrix");
	this.u_Pick_nodeVScale = this.gl.getUniformLocation(this.shader_Pick, "u_nodeVScale");
	this.u_Pick_matrixNodeTranform = this.gl.getUniformLocation(this.shader_Pick, "u_matrixNodeTranform");
	
	
	this.u_Pick_uWorkAreaSize = this.gl.getUniformLocation(this.shader_Pick, "u_workAreaSize");
	
	
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	this.attr_Pick_NodeId = this.gl.getAttribLocation(this.shader_Pick, "aNodeId");
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	this.attr_Pick_NodePosX = this.gl.getAttribLocation(this.shader_Pick, "aNodePosX");
	this.attr_Pick_NodePosY = this.gl.getAttribLocation(this.shader_Pick, "aNodePosY");
	this.attr_Pick_NodePosZ = this.gl.getAttribLocation(this.shader_Pick, "aNodePosZ");
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	this.attr_Pick_NodeVertexPos = this.gl.getAttribLocation(this.shader_Pick, "aNodeVertexPos");
	
	
	this.Shader_Pick_READY = true;
};


//**********************************************************************************************************************************
//**********************************************************************************************************************************
//										(NODE TYPE graph) || (NODE && TRANSFORM AXIS OF SELECTED NODE)
//**********************************************************************************************************************************
//**********************************************************************************************************************************

/** @private */
StormGLContext.prototype.render_Pick = function() {		
	this.gl.useProgram(this.shader_Pick);
	
	this.gl.uniform1f(this.u_Pick_far, this.far);
	
	//alert((stormEngineC.mousePosX/this.viewportWidth)); 
	this.gl.uniform1f(this.u_Pick_currentMousePosX, stormEngineC.mousePosX);  
	this.gl.uniform1f(this.u_Pick_currentMousePosY, (stormEngineC.$.height()-(stormEngineC.mousePosY))); 
	
	this.gl.uniformMatrix4fv(this.u_Pick_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_Pick_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	
	
	if(this.makeMouseDown == true) {
		this.makeMouseDown = false;
		
		if(stormEngineC.dragging == false) {		
			var pick = (function(nodes) {
				if(	this.gettedPixel instanceof StormNode ||
					this.gettedPixel instanceof StormPolarityPoint ||
					this.gettedPixel instanceof StormGraph) { // selection is a node
					stormEngineC.selectNode(this.gettedPixel);
					
					if(this.gettedPixel.isDraggable) {
						this.gettedPixel.bodyActive(false);
						this.gettedPixel.setPosition(this.gettedPixel.getPosition());  
						
						stormEngineC.dragging = true;
					}
					if(this.gettedPixel.onmousedownFunction != undefined) this.gettedPixel.onmousedownFunction();
				} else if(this.gettedPixel > 0) { // selection is transform axis of a selected node
					if(stormEngineC.getSelectedNode() != undefined) {
						stormEngineC.getSelectedNode().bodyActive(false);
					}
					
					stormEngineC.dragging = true;
				}
			}).bind(this);
			
			var pickEditionMode = (function() {
				if(stormEngineC.getSelectedNode() != undefined && stormEngineC.getSelectedNode().selectedNodeIsInEditionMode()) { // selection is in edit mode
					// check if makeMouseDown over node type graph
					console.log("- rendering selected node in edit mode...");				
					this.render();
					this.gettedPixel = this.readPixel(); 
					
					
					if(stormEngineC.getSelectedNode() instanceof StormNode && stormEngineC.getSelectedNode().objectType == 'graph') {
						stormEngineC.dragging = true;
					}
				}
			}).bind(this);
			
			// check if makeMouseDown over nodes
			console.log("- rendering nodes & transform axis...");
			this.render(this.nodes);
			this.gettedPixel = this.readPixel(this.nodes); 
			if(this.gettedPixel !== false) {
				pick(this.nodes); 
				pickEditionMode();
			} else {
				console.log("- rendering polarityPoints & transform axis...");
				this.render(this.polarityPoints);
				this.gettedPixel = this.readPixel(this.polarityPoints); 				
				if(this.gettedPixel !== false) {
					pick(this.polarityPoints); 
					pickEditionMode();
				} else {
					console.log("- rendering graph & transform axis...");
					this.render(this.graphs);
					this.gettedPixel = this.readPixel(this.graphs); 					
					if(this.gettedPixel !== false) {
						pick(this.graphs); 
						pickEditionMode();
					} else {
						
					}
				}
			}
			
		}
	}
	if(this.makeMouseMove == true) {
		this.makeMouseMove = false;
		
		if(stormEngineC.dragging == true) {		
			this.drag();  
		}
	}
	if(this.makeMouseUp == true) {
		this.makeMouseUp = false;
		
		if(stormEngineC.dragging == true) {
			this.unpick();  
			stormEngineC.dragging = false;
		}
	}
};

/** @private */
StormGLContext.prototype.render = function(nodes) {	
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	
	this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	//this.gl.enable(this.gl.BLEND);
	//this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA); 
	
	if(nodes == undefined) { // selection is edit mode		
		// draw ids of selected node (type graph) in grayscale (bufferNode and internal id of this)			
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);		
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		var node = stormEngineC.getSelectedNode();
		
		if(node.objectType == 'graph') {
			this.gl.uniform1i(this.u_Pick_vertexType, 2); // graph
			this.gl.uniform1i(this.u_Pick_fragType, 2); // id bufferModesnode
			
			this.render_graphs(node);
		}		
	} else { // selection not in edit mode
		// draw nodes according id (grayscale)	
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);		
		this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
		
		for(var n = 0, f = nodes.length; n < f; n++) { 
			if(	nodes[n].visibleOnContext && nodes[n].objectType != 'light') {
				var node = nodes[n];
				
				this.gl.uniform1f(this.u_Pick_nodeId, parseFloat(node.idNum));
				
				if(node.objectType == 'graph') {
					this.gl.uniform1i(this.u_Pick_vertexType, 2); // graph
					this.gl.uniform1i(this.u_Pick_fragType, 0); // id node
					
					this.render_graphs(node);
				} else {
					this.gl.uniform1i(this.u_Pick_vertexType, 0); // nodes
					this.gl.uniform1i(this.u_Pick_fragType, 0); // id node
					
					this.render_nodes(node);
				}
			}
		}
			
		// draw overlay transforms (detectors) of selected node		
		for(var n = 0, f = nodes.length; n < f; n++) { 
			if(	nodes[n].visibleOnContext && nodes[n].objectType != 'light') {
				var node = nodes[n];
				
				if(stormEngineC.editMode == true && stormEngineC.getSelectedNode() != undefined && stormEngineC.getSelectedNode().idNum == nodes[n].idNum) {
					this.gl.uniform1i(this.u_Pick_vertexType, 1); // overlay transforms 
					this.gl.uniform1i(this.u_Pick_fragType, 1); // overlay transforms 
					
					this.render_transformsaxis(node);
				}
			}
		}
		
		this.gl.disable(this.gl.BLEND);
	}
};
/** @private */
StormGLContext.prototype.render_graphs = function(node) {	
	if(node.arrayNodeId.length) {
		this.gl.disableVertexAttribArray(this.attr_Pick_pos);
		
		this.gl.enableVertexAttribArray(this.attr_Pick_NodeId);
		this.gl.enableVertexAttribArray(this.attr_Pick_NodePosX);
		this.gl.enableVertexAttribArray(this.attr_Pick_NodePosY);
		this.gl.enableVertexAttribArray(this.attr_Pick_NodePosZ);
		this.gl.enableVertexAttribArray(this.attr_Pick_NodeVertexPos);
		
		this.gl.uniform1f(this.u_Pick_uWorkAreaSize, parseFloat(node.offset));						
		this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOS.transpose().e); 
							
		for(var n=0; n < node.clglWork_nodes.buffers["nodeId"].items.length; n++) {
			///////////////////////////////////////
			// NodeId
			///////////////////////////////////////					
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.clglWork_nodes.buffers["nodeId"].items[n].vertexData0);
			this.gl.vertexAttribPointer(this.attr_BN_NodeId, 1, this.gl.FLOAT, false, 0, 0);
								
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.clglWork_nodes.buffers["posXYZW"].items[n].vertexData0);
			this.gl.vertexAttribPointer(this.attr_Pick_NodePosX, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!! 
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.clglWork_nodes.buffers["posXYZW"].items[n].vertexData1);
			this.gl.vertexAttribPointer(this.attr_Pick_NodePosY, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.clglWork_nodes.buffers["posXYZW"].items[n].vertexData2);  
			this.gl.vertexAttribPointer(this.attr_Pick_NodePosZ, 4, this.gl.UNSIGNED_BYTE, true, 0, 0); // NORMALIZE!!
								
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, node.clglWork_nodes.buffers["nodeVertexPos"].items[n].vertexData0);
			this.gl.vertexAttribPointer(this.attr_Pick_NodeVertexPos, 4, this.gl.FLOAT, false, 0, 0);
								
			///////////////////////////////////////
			// NodeIndices
			///////////////////////////////////////
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, node.clglWork_nodes.CLGL_bufferIndices.items[n].vertexData0);
			this.gl.drawElements(this.gl.TRIANGLES, node.clglWork_nodes.CLGL_bufferIndices.items[n].length, this.gl.UNSIGNED_SHORT, 0);
		}		
	}
};
/** @private */
StormGLContext.prototype.render_nodes = function(node) {
	this.gl.disableVertexAttribArray(this.attr_Pick_NodeId);
	this.gl.disableVertexAttribArray(this.attr_Pick_NodePosX);
	this.gl.disableVertexAttribArray(this.attr_Pick_NodePosY);
	this.gl.disableVertexAttribArray(this.attr_Pick_NodePosZ);
	this.gl.disableVertexAttribArray(this.attr_Pick_NodeVertexPosX);
	this.gl.disableVertexAttribArray(this.attr_Pick_NodeVertexPosY);
	this.gl.disableVertexAttribArray(this.attr_Pick_NodeVertexPosZ);
	
	this.gl.enableVertexAttribArray(this.attr_Pick_pos);
	
	
	this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOSFrame.transpose().e); 
	this.gl.uniform3f(this.u_Pick_nodeVScale, node.VSCALE.e[0], node.VSCALE.e[1], node.VSCALE.e[2]);   
	
	for(var nb = 0, fb = node.buffersObjects.length; nb < fb; nb++) {
		var bo = node.buffersObjects[nb];
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bo.nodeMeshVertexBuffer);
		this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, bo.nodeMeshIndexBuffer);
		
		this.gl.drawElements(this.gl.TRIANGLES, bo.nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
	}
};
/** @private */
StormGLContext.prototype.render_transformsaxis = function(node) {
	for(var nb = 0, fb = node.buffersObjects.length; nb < fb; nb++) {	
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
		
		if(stormEngineC.defaultTransformMode == 0) // world
			this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOS.transpose().e); 
		else // local
			this.gl.uniformMatrix4fv(this.u_Pick_nodeWMatrix, false, node.MPOSFrame.transpose().e); 
			
		// (detectors)
		if(stormEngineC.defaultTransform == 0) {
			// overlay pos X
			this.gl.uniform1f(this.u_Pick_nodeId, 0.1); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosX.MPOS.x(this.nodeOverlayPosX.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosX.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosX.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
			
			// overlay pos Y
			this.gl.uniform1f(this.u_Pick_nodeId, 0.2); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosY.MPOS.x(this.nodeOverlayPosY.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosY.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosY.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
			
			// overlay pos Z
			this.gl.uniform1f(this.u_Pick_nodeId, 0.3); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayPosZ.MPOS.x(this.nodeOverlayPosZ.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayPosZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
		} else if(stormEngineC.defaultTransform == 1) {
			// overlay rot X
			this.gl.uniform1f(this.u_Pick_nodeId, 0.4); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetX.MPOS.x(this.nodeOverlayRotDetX.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
			
			// overlay rot Y
			this.gl.uniform1f(this.u_Pick_nodeId, 0.5); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetY.MPOS.x(this.nodeOverlayRotDetY.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
			
			// overlay rot Z
			this.gl.uniform1f(this.u_Pick_nodeId, 0.6); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayRotDetZ.MPOS.x(this.nodeOverlayRotDetZ.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayRotDetZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
		} else if(stormEngineC.defaultTransform == 2 && stormEngineC.defaultTransformMode == 1) {
			// overlay scale X
			this.gl.uniform1f(this.u_Pick_nodeId, 0.7); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetX.MPOS.x(this.nodeOverlayScaDetX.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetX.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
			
			// overlay scale Y
			this.gl.uniform1f(this.u_Pick_nodeId, 0.8); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetY.MPOS.x(this.nodeOverlayScaDetY.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetY.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
			
			// overlay scale Z
			this.gl.uniform1f(this.u_Pick_nodeId, 0.9); 
			this.gl.uniformMatrix4fv(this.u_Pick_matrixNodeTranform, false, this.nodeOverlayScaDetZ.MPOS.x(this.nodeOverlayScaDetZ.MROTXYZ).transpose().e);
			
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attr_Pick_pos, 3, this.gl.FLOAT, false, 0, 0);
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshIndexBuffer);
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodeOverlayScaDetZ.buffersObjects[0].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);	
		}
	}
};
/** @private */
StormGLContext.prototype.readPixel = function(nodes) {
	var arrayPick = new Uint8Array(4);  
	this.gl.readPixels(stormEngineC.mousePosX, (stormEngineC.$.height()-(stormEngineC.mousePosY)), 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, arrayPick);
	console.log(arrayPick[0]+"	"+arrayPick[1]+"	"+arrayPick[2]+"	"+arrayPick[3]);
	
	if(nodes == undefined) { // selection is edit mode?
		if(stormEngineC.getSelectedNode().objectType == 'graph') { // selection is type graph
			var unpackValue = stormEngineC.utils.unpack([arrayPick[0]/255, arrayPick[1]/255, arrayPick[2]/255, arrayPick[3]/255]); // value from 0.0 to 1.0
			
			var nodeIdNum = Math.round(unpackValue*1000000.0)-1.0;
			console.log("graph: "+nodeIdNum);
			
			return nodeIdNum;
		}
	} else { // selection not in edit mode
		if(arrayPick[0] == 0 && arrayPick[1] != 0 && arrayPick[2] == 0 && arrayPick[3] == 255) { // selection is overlay transforms?
			var transformNum = parseFloat(arrayPick[1]/255).toFixed(1); // overlay transforms 
			console.log("transform axis: "+transformNum);
			
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
		} else if( !(arrayPick[0] == 0 && arrayPick[1] == 0 && arrayPick[2] == 0 && arrayPick[3] == 0) ) { // selection is a node?
			var unpackValue = stormEngineC.utils.unpack([arrayPick[0]/255, arrayPick[1]/255, arrayPick[2]/255, arrayPick[3]/255]); // value from 0.0 to 1.0
			
			var nodeIdNum = Math.ceil(unpackValue*1000000.0)-1; 
			var selectedNode = nodes[nodeIdNum];
			
			
			if(selectedNode != undefined) {// mouse over node
				console.log("node: "+selectedNode.name);
				return selectedNode;
			}
		}	
		
		console.log("false");
		return false;		
	}
};

/** @private */
StormGLContext.prototype.drag = function() {
	if(stormEngineC.getSelectedNode() != undefined && stormEngineC.getSelectedNode().selectedNodeIsInEditionMode()) { // selection is edit mode?
		if(stormEngineC.getSelectedNode() instanceof StormNode && stormEngineC.getSelectedNode().objectType == 'graph') { // selection is type graph
			var selNode = stormEngineC.getSelectedNode();
			
			selNode.enableDrag = 1.0;
			selNode.idToDrag = this.gettedPixel;
			var dir = stormEngineC.utils.getDraggingScreenVector(); 
			selNode.MouseDragTranslationX = dir.e[0];
			selNode.MouseDragTranslationY = dir.e[1];
			selNode.MouseDragTranslationZ = dir.e[2];
			
			
			selNode.clglWork_nodes.setArg("enableDrag", parseFloat(selNode.enableDrag));
			selNode.clglWork_nodes.setArg("idToDrag", parseFloat(selNode.idToDrag));
			selNode.clglWork_nodes.setArg("MouseDragTranslationX", selNode.MouseDragTranslationX);
			selNode.clglWork_nodes.setArg("MouseDragTranslationY", selNode.MouseDragTranslationY);
			selNode.clglWork_nodes.setArg("MouseDragTranslationZ", selNode.MouseDragTranslationZ);
						
			selNode.clglWork_links.setArg("enableDrag", selNode.enableDrag);
			selNode.clglWork_links.setArg("idToDrag", selNode.idToDrag);	 		
			selNode.clglWork_links.setArg("MouseDragTranslationX", selNode.MouseDragTranslationX);
			selNode.clglWork_links.setArg("MouseDragTranslationY", selNode.MouseDragTranslationY);
			selNode.clglWork_links.setArg("MouseDragTranslationZ", selNode.MouseDragTranslationZ);
			
			setTimeout(function() {
				selNode.clglWork_nodes.setArg("MouseDragTranslationX", 0.0);
				selNode.clglWork_nodes.setArg("MouseDragTranslationY", 0.0);
				selNode.clglWork_nodes.setArg("MouseDragTranslationZ", 0.0);
							 		
				selNode.clglWork_links.setArg("MouseDragTranslationX", 0.0);
				selNode.clglWork_links.setArg("MouseDragTranslationY", 0.0);
				selNode.clglWork_links.setArg("MouseDragTranslationZ", 0.0);
			}, 10);
		}
	} else { // selection not in edit mode
		if(	this.gettedPixel instanceof StormNode ||
			this.gettedPixel instanceof StormPolarityPoint ||
			this.gettedPixel instanceof StormGraph) { // selection is a node?
			var dir = stormEngineC.utils.getDraggingScreenVector(); 
			stormEngineC.getSelectedNode().setPosition(stormEngineC.getSelectedNode().getPosition().add(dir));
		} else if(this.gettedPixel > 0) { // selection is transform axis of a selected node?
			var selOver = this.gettedPixel;
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
	if(stormEngineC.getSelectedNode() != undefined && stormEngineC.getSelectedNode().selectedNodeIsInEditionMode()) { // selection is edit mode?
		if(stormEngineC.getSelectedNode() instanceof StormNode && stormEngineC.getSelectedNode().objectType == 'graph') { // selection is type graph
			var selNode = stormEngineC.getSelectedNode();
			
			selNode.enableDrag = 0.0;
			selNode.idToDrag = 0.0;
			selNode.MouseDragTranslationX = 0.0;
			selNode.MouseDragTranslationY = 0.0;
			selNode.MouseDragTranslationZ = 0.0;
			
			selNode.clglWork_nodes.setArg("enableDrag", parseFloat(selNode.enableDrag));
			selNode.clglWork_nodes.setArg("idToDrag", parseFloat(selNode.idToDrag));
			selNode.clglWork_nodes.setArg("MouseDragTranslationX", selNode.MouseDragTranslationX);
			selNode.clglWork_nodes.setArg("MouseDragTranslationY", selNode.MouseDragTranslationY);
			selNode.clglWork_nodes.setArg("MouseDragTranslationZ", selNode.MouseDragTranslationZ);
			
			
			selNode.clglWork_links.setArg("enableDrag", selNode.enableDrag);
			selNode.clglWork_links.setArg("idToDrag", selNode.idToDrag);			
			selNode.clglWork_links.setArg("MouseDragTranslationX", selNode.MouseDragTranslationX);
			selNode.clglWork_links.setArg("MouseDragTranslationY", selNode.MouseDragTranslationY);
			selNode.clglWork_links.setArg("MouseDragTranslationZ", selNode.MouseDragTranslationZ);
		}
	} else { // selection not in edit mode
		stormEngineC.getSelectedNode().bodyActive(true);
		var dir = stormEngineC.utils.getDraggingScreenVector();
		stormEngineC.getSelectedNode().bodyApplyImpulse({vector: dir.x(100), milis: 10});
	}
			
			
	/*this.gettedPixel = this.querySelect(this.nodes);
	if(this.gettedPixel instanceof StormNode) {
		if(	stormEngineC.mousePosX == stormEngineC.oldMousePosClickX &&
			stormEngineC.mousePosY == stormEngineC.oldMousePosClickY) {
				stormEngineC.selectNode(this.gettedPixel);
		}
		if(this.gettedPixel.onmouseupFunction != undefined) this.gettedPixel.onmouseupFunction();
	}

	this.gettedPixel = this.querySelect(this.polarityPoints);
	if(this.gettedPixel instanceof StormPolarityPoint) {
		if(	stormEngineC.mousePosX == stormEngineC.oldMousePosClickX &&
			stormEngineC.mousePosY == stormEngineC.oldMousePosClickY) {
				stormEngineC.selectNode(this.gettedPixel);
		}
		if(this.gettedPixel.onmouseupFunction != undefined) this.gettedPixel.onmouseupFunction();
	}*/
};

