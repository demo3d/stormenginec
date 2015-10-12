/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormGraph = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'graph';
	
	this.workAreaSize = (jsonIn != undefined && jsonIn.workAreaSize != undefined) ? jsonIn.workAreaSize : 100.0;
	this.bufferNodes = stormEngineC.createBufferNodes({"workAreaSize": 100.0});
	this.bufferNodesLinks = stormEngineC.createBufferNodesLinks({"workAreaSize": 100.0});
	
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
	var nodePosX = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[0] : Math.random()*this.workAreaSize;
	var nodePosY = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[1] : Math.random()*this.workAreaSize;
	var nodePosZ = (jsonIn != undefined && jsonIn.position != undefined) ? jsonIn.position.e[2] : Math.random()*this.workAreaSize;
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
	this.bufferNodes.setBuffer_NodeId(this.arrayNodeId);
	this.bufferNodes.setBuffer_NodePos(this.arrayNodePosXYZW);
	this.bufferNodes.setBuffer_NodeVertexPos(this.arrayNodeVertexPos);
	this.bufferNodes.setBuffer_NodeVertexColor(this.arrayNodeVertexColor);
	this.bufferNodes.setBuffer_NodeIndices(this.arrayNodeIndices);
	
	this.arrayNodeDir = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDir.push(0, 0, 0, 255);
	}
	this.bufferNodes.setBuffer_NodeDir(this.arrayNodeDir);
	
	this.arrayNodePolaritys = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodePolaritys.push(0);
	}
	this.bufferNodes.setBuffer_NodePolaritys(this.arrayNodePolaritys);
	
	this.arrayNodeDestination = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDestination.push(0, 0, 0, 255);
	}
	this.bufferNodes.setBuffer_NodeDestination(this.arrayNodeDestination);
	
	this.bufferNodesLinks.set_nodesSize(this.currentNodeId-1);
	
	this.bufferNodes.update();
};















/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.origin Node Origin for this link
* 	@param {String} jsonIn.target Node Target for this link
 */
StormGraph.prototype.addLinkBN = function(jsonIn) {
	var arr4Uint8_XYZW = this.bufferNodes.webCLGL.enqueueReadBuffer_Float4(this.bufferNodes.CLGL_bufferNodePosXYZW);
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
	
	// (target)
	this.arrayLinkId.push(this.currentLinkId+1);
	this.arrayLinkNodeId.push(jsonIn.target_nodeId);
	this.arrayLinkPosXYZW.push(	jsonIn.arraysNodePositions[0][jsonIn.target_itemStart],
								jsonIn.arraysNodePositions[1][jsonIn.target_itemStart],
								jsonIn.arraysNodePositions[2][jsonIn.target_itemStart],
								1.0);	
	
	
	this.currentLinkId += 2; // augment link id
	
	return this.currentLinkId-2;
};
StormGraph.prototype.updateLinks = function(jsonIn) {
	this.bufferNodesLinks.setBuffer_LinkId(this.arrayLinkId);
	this.bufferNodesLinks.setBuffer_LinkNodeId(this.arrayLinkNodeId);
	this.bufferNodesLinks.setBuffer_LinkPos(this.arrayLinkPosXYZW);
	
	this.arrayLinkDir = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDir.push(0, 0, 0, 255);
	}
	this.bufferNodesLinks.setBuffer_LinkDir(this.arrayLinkDir);
	
	this.arrayLinkPolaritys = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkPolaritys.push(0);
	}
	this.bufferNodesLinks.setBuffer_LinkPolaritys(this.arrayLinkPolaritys);
	
	this.arrayLinkDestination = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDestination.push(0, 0, 0, 255);  
	}
	this.bufferNodesLinks.setBuffer_LinkDestination(this.arrayLinkDestination);
	
	this.bufferNodesLinks.set_nodesSize(this.currentLinkId-2);
	
	this.bufferNodesLinks.update();
};

