/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormGraph = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'graph';
	
	this.gl = stormEngineC.stormGLContext.gl;
	
	this.offset = (jsonIn != undefined && jsonIn.offset != undefined) ? jsonIn.offset : 100.0;
	
	this.clglLayout_nodes = new WebCLGLLayout_3DpositionByDirection({"offset": this.offset});
	this.clglLayout_links = new WebCLGLLayout_3DpositionByDirection({"offset": this.offset});
	
	this.nodes = {};
	this.links = [];
	
	
	
	
	this.arrayNodeId = [];
	this.arrayNodePosXYZW = [];
	this.arrayNodeVertexPos = [];
	this.arrayNodeVertexColor = [];
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.arrayNodeDir = [];
	this.arrayNodePolaritys = [];
	this.arrayNodeDestination = [];
	
	// default mesh to use
	var meshNode = new StormNode();
	meshNode.loadBox();
	
	this.currentNodeId = 0;	
	this.nodeArrayItemStart = 0;
	
	
	
	
	
	this.arrayLinkId = [];
	this.arrayLinkNodeId = [];
	this.arrayLinkPosXYZW = [];
	this.arrayLinkVertexPos = [];
	this.arrayLinkVertexColor = [];
	this.startIndexId_link = 0;
	this.arrayLinkIndices = [];
	
	this.arrayLinkDir = [];
	this.arrayLinkPolaritys = [];
	this.arrayLinkDestination = [];
	
	this.currentLinkId = 0;
};
StormGraph.prototype = Object.create(StormNode.prototype);










/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.id Id of node
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {String}
 */
StormGraph.prototype.addNodeBN = function(jsonIn) {
	var bn_nodeArrayItemStart = this.addNodeNow({
									"position": jsonIn.position,
									"node": jsonIn.node,
									"color": jsonIn.color
								});
	
	
	// ADD NODE TO ARRAY NODES
	// this.nodes[__STRING_USER_NODEID__] = __INT_BUFFERNODE_nodeArrayItemStart__
	this.nodes[jsonIn.id] = bn_nodeArrayItemStart;
	
	return jsonIn.id;
};
/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {Int}
 */
StormGraph.prototype.addNodeNow = function(jsonIn) { 
	var nAIS = this.nodeArrayItemStart;
	
	// assign position for this node
	var nodePosX = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[0] : Math.random()*this.offset;
	var nodePosY = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[1] : Math.random()*this.offset;
	var nodePosZ = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[2] : Math.random()*this.offset;
	// assign mesh for this node
	this.node = (jsonIn != undefined && jsonIn.node != undefined) ? jsonIn.node : meshNode;
	// assign color for this node
	var color = (jsonIn != undefined && jsonIn.color != undefined) ? jsonIn.color : $V3([1.0, 1.0, 1.0]);
		
	
	//*******************************************************************************************************************
	// FILL ARRAYS
	//*******************************************************************************************************************
	
	for(var i=0; i < this.node.buffersObjects.length; i++) {
		var bo = this.node.buffersObjects[i];
		for(var n=0; n < bo.nodeMeshVertexArray.length/3; n++) {
			var idxVertex = n*3;
			
			this.arrayNodeId.push(this.currentNodeId);
			this.arrayNodePosXYZW.push(nodePosX, nodePosY, nodePosZ, 1.0);
			this.arrayNodeVertexPos.push(bo.nodeMeshVertexArray[idxVertex], bo.nodeMeshVertexArray[idxVertex+1], bo.nodeMeshVertexArray[idxVertex+2], 1.0);
			//console.log(bo.nodeMeshVertexArray[idxVertex]);
			this.arrayNodeVertexColor.push(color.e[0], color.e[1], color.e[2], 1.0);
			
			
			this.nodeArrayItemStart++;
		}
	}
	//console.log(this.arrayNodePosX.length);
		
	var maxNodeIndexId = 0;
	for(var i=0; i < this.node.buffersObjects.length; i++) {
		var bo = this.node.buffersObjects[i];
		for(var n=0; n < bo.nodeMeshIndexArray.length; n++) {
			var idxIndex = n;
			
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
StormGraph.prototype.updateNodes = function(jsonIn) {
	this.clglLayout_nodes.setBuffer_Id(this.arrayNodeId);
	this.clglLayout_nodes.setBuffer_NodeId(this.arrayNodeId);
	this.clglLayout_nodes.setBuffer_Pos(this.arrayNodePosXYZW);
	this.clglLayout_nodes.setBuffer_VertexPos(this.arrayNodeVertexPos);
	this.clglLayout_nodes.setBuffer_VertexColor(this.arrayNodeVertexColor);
	this.clglLayout_nodes.setBuffer_Indices(this.arrayNodeIndices);
	
	this.arrayNodeDir = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDir.push(0, 0, 0, 255);
	}
	this.clglLayout_nodes.setBuffer_Dir(this.arrayNodeDir);
	
	this.arrayNodePolaritys = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodePolaritys.push(0);
	}
	this.clglLayout_nodes.setBuffer_Polaritys(this.arrayNodePolaritys);
	
	this.arrayNodeDestination = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDestination.push(0, 0, 0, 255);
	}
	this.clglLayout_nodes.setBuffer_Destination(this.arrayNodeDestination);
	
	
	this.clglLayout_nodes.set_PMatrix(stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.clglLayout_nodes.set_cameraWMatrix(stormEngineC.defaultCamera.MPOS.transpose().e);
	this.clglLayout_nodes.set_nodeWMatrix(this.MPOS.transpose().e);
	this.clglLayout_nodes.set_nodesSize(parseFloat(this.currentNodeId-1));
	
	this.clglLayout_nodes.set_enableDestination(0);
	this.clglLayout_nodes.set_destinationForce(0);
	this.clglLayout_nodes.set_enableDrag(0);
	this.clglLayout_nodes.set_idToDrag(0);
	this.clglLayout_nodes.set_MouseDragTranslationX(0);
	this.clglLayout_nodes.set_MouseDragTranslationY(0);
	this.clglLayout_nodes.set_MouseDragTranslationZ(0);
	this.clglLayout_nodes.set_islink(0);
	
	this.clglLayout_nodes.set_polaritypoints();
};

/** @private **/
StormGraph.prototype.prerender_nodes = function() {
	this.clglLayout_nodes.prerender();
};
/** @private **/
StormGraph.prototype.render_nodes = function() {
	this.clglLayout_nodes.render((function() {
		this.clglLayout_nodes.set_PMatrix(stormEngineC.defaultCamera.mPMatrix.transpose().e);
		this.clglLayout_nodes.set_cameraWMatrix(stormEngineC.defaultCamera.MPOS.transpose().e);
		this.clglLayout_nodes.set_nodeWMatrix(this.MPOS.transpose().e);
		this.clglLayout_nodes.set_nodesSize(parseFloat(this.currentNodeId-1));
	}).bind(this), this.gl.TRIANGLES);
};













/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.origin Node Origin for this link
* 	@param {String} jsonIn.target Node Target for this link
 */
StormGraph.prototype.addLinkBN = function(jsonIn) {
	var arr4Uint8_XYZW = this.clglLayout_nodes.webCLGL.enqueueReadBuffer_Float4(this.clglLayout_nodes.CLGL_bufferPosXYZW);
	var blId = this.addLinkNow({
		"origin_nodeId": this.nodes[jsonIn.origin].nodeId,
		"target_nodeId": this.nodes[jsonIn.target].nodeId,
		"origin_itemStart": this.nodes[jsonIn.origin].itemStart,
		"target_itemStart": this.nodes[jsonIn.target].itemStart,
		"arraysNodePositions": arr4Uint8_XYZW
		});
	
	// ADD LINK TO ARRAY LINKS
	this.links.push({
		"origin_nodeId": this.nodes[jsonIn.origin].nodeId,
		"target_nodeId": this.nodes[jsonIn.target].nodeId,
		"origin_itemStart": this.nodes[jsonIn.origin].itemStart,
		"target_itemStart": this.nodes[jsonIn.target].itemStart
		});
};
/**
* Create new link for the graph
* @param	{Object} jsonIn
* 	@param {Int} jsonIn.origin_nodeId
* 	@param {Int} jsonIn.origin_itemStart
* 	@param {Int} jsonIn.target_nodeId
* 	@param {Int} jsonIn.target_itemStart
* 	@param {Array<Float32Array>} jsonIn.arraysNodePositions
 * @returns {Int}
 */
StormGraph.prototype.addLinkNow = function(jsonIn) { 
	//*******************************************************************************************************************
	// FILL ARRAYS
	//*******************************************************************************************************************
	
	// (origin)
	this.arrayLinkId.push(this.currentLinkId);
	this.arrayLinkNodeId.push(jsonIn.origin_nodeId);
	this.arrayLinkPosXYZW.push(	jsonIn.arraysNodePositions[0][jsonIn.origin_itemStart],
								jsonIn.arraysNodePositions[1][jsonIn.origin_itemStart],
								jsonIn.arraysNodePositions[2][jsonIn.origin_itemStart],
								1.0);
	this.arrayLinkVertexPos.push(0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexColor.push(1.0, 1.0, 1.0, 1.0);
	
	// (target)
	this.arrayLinkId.push(this.currentLinkId+1);
	this.arrayLinkNodeId.push(jsonIn.target_nodeId);
	this.arrayLinkPosXYZW.push(	jsonIn.arraysNodePositions[0][jsonIn.target_itemStart],
								jsonIn.arraysNodePositions[1][jsonIn.target_itemStart],
								jsonIn.arraysNodePositions[2][jsonIn.target_itemStart],
								1.0);	
	this.arrayLinkVertexPos.push(0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexColor.push(1.0, 1.0, 1.0, 1.0);
	
	
	this.arrayLinkIndices.push(this.startIndexId_link, this.startIndexId_link+1);
	this.startIndexId_link += 2;
	
	this.currentLinkId += 2; // augment link id
	
	return this.currentLinkId-2;
};
StormGraph.prototype.updateLinks = function(jsonIn) {
	this.clglLayout_links.setBuffer_Id(this.arrayLinkId);
	this.clglLayout_links.setBuffer_NodeId(this.arrayLinkNodeId);
	this.clglLayout_links.setBuffer_Pos(this.arrayLinkPosXYZW);
	this.clglLayout_links.setBuffer_VertexPos(this.arrayLinkVertexPos);
	this.clglLayout_links.setBuffer_VertexColor(this.arrayLinkVertexColor);
	this.clglLayout_links.setBuffer_Indices(this.arrayLinkIndices);
	
	this.arrayLinkDir = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDir.push(0, 0, 0, 255);
	}
	this.clglLayout_links.setBuffer_Dir(this.arrayLinkDir);
	
	this.arrayLinkPolaritys = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkPolaritys.push(0);
	}
	this.clglLayout_links.setBuffer_Polaritys(this.arrayLinkPolaritys);
	
	this.arrayLinkDestination = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDestination.push(0, 0, 0, 255);  
	}
	this.clglLayout_links.setBuffer_Destination(this.arrayLinkDestination);
	
	
	this.clglLayout_links.set_PMatrix(stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.clglLayout_links.set_cameraWMatrix(stormEngineC.defaultCamera.MPOS.transpose().e);
	this.clglLayout_links.set_nodeWMatrix(this.MPOS.transpose().e);
	this.clglLayout_links.set_nodesSize(this.currentLinkId-2);
	
	this.clglLayout_links.set_enableDestination(0);
	this.clglLayout_links.set_destinationForce(0);
	this.clglLayout_links.set_enableDrag(0);
	this.clglLayout_links.set_idToDrag(0);
	this.clglLayout_links.set_MouseDragTranslationX(0);
	this.clglLayout_links.set_MouseDragTranslationY(0);
	this.clglLayout_links.set_MouseDragTranslationZ(0);
	this.clglLayout_links.set_islink(1);
	
	this.clglLayout_links.set_polaritypoints();
};

/** @private **/
StormGraph.prototype.prerender_links = function() {
	this.clglLayout_links.prerender();
};
/** @private **/
StormGraph.prototype.render_links = function() {
	this.clglLayout_links.render((function() {
		this.clglLayout_links.set_PMatrix(stormEngineC.defaultCamera.mPMatrix.transpose().e);
		this.clglLayout_links.set_cameraWMatrix(stormEngineC.defaultCamera.MPOS.transpose().e);
		this.clglLayout_links.set_nodeWMatrix(this.MPOS.transpose().e);
		this.clglLayout_links.set_nodesSize(parseFloat(this.currentNodeId-1));
	}).bind(this), this.gl.LINES);
};