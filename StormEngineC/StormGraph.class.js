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
	
	this.nodes = {};
	this.links = [];
};
StormGraph.prototype = Object.create(StormNode.prototype);

/** @private */
StormGraph.prototype.addNode = function(jsonIn) {  
	var node = stormEngineC.createNode();
	node.name = jsonIn.id;
	node.loadBox($V3([1.0,0.1,1.0]));
	//node.loadObj({'objUrl':"../../UNUSED/boxhole.obj"});
	node.draggable(true);
	
	if(jsonIn.position != undefined) {
		node.setPosition(jsonIn.position); 
	} else {
		node.setPosition($V3([0.0, 0.0, 0.0])); 
	}
	
	
	this.nodes[node.name] = node;
	
	return this.nodes[node.name];
};

/** @private */
StormGraph.prototype.addLink = function(idA, idB) {
	var nodeOrigin = this.nodes[idA];
	var nodeEnd = this.nodes[idB];
	
	
	var line = stormEngineC.createLine(nodeOrigin.getPosition(), nodeEnd.getPosition(), $V3([0.5,0.5,0.5]), $V3([1.0,1.0,1.0]));
	
	
	var arrow = stormEngineC.createNode();
	arrow.loadTriangle();
	arrow.setPosition(nodeEnd.getPosition());
	var o = nodeOrigin.getPosition();
	var e = nodeEnd.getPosition();
	var m = $M16().makeLookAt(o.e[0], o.e[1], o.e[2], e.e[0], e.e[1], e.e[2], 0, 1, 0);
	arrow.MPOS = m.inverse();
	arrow.setRotation((Math.PI/2), false, $V3([1.0,0.0,0.0]));
	arrow.setRotation((Math.PI/2)+(Math.PI/4), false, $V3([0.0,1.0,0.0]));
	
	
	this.links.push({"link": line,
					"arrow": arrow,
					"origin": nodeOrigin,
					"end": nodeEnd});
	
	return this.links[this.links.length-1];
};

/** @private */
StormGraph.prototype.update = function(idA, idB) {
	/*var selectedNode = stormEngineC.getSelectedNode(); 
	if(selectedNode != undefined) {
		
	}*/
	
	for(var n=0; n < this.links.length; n++) {
		var link = this.links[n]["link"];
		var arrow = this.links[n]["arrow"];
		var nodeOrigin = this.links[n]["origin"];
		var nodeEnd = this.links[n]["end"];
		
		
		link.setOrigin(nodeOrigin.getPosition());
		link.setEnd(nodeEnd.getPosition());
		
		arrow.setPosition(nodeEnd.getPosition());
		var o = nodeOrigin.getPosition();
		var e = nodeEnd.getPosition();
		var m = $M16().makeLookAt(o.e[0], o.e[1], o.e[2], e.e[0], e.e[1], e.e[2], 0, 1, 0);
		arrow.MPOS = m.inverse();
		arrow.setRotation((Math.PI/2), false, $V3([1.0,0.0,0.0]));
		arrow.setRotation((Math.PI/2)+(Math.PI/4), false, $V3([0.0,1.0,0.0]));
	}
};










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
	var bn_nodeArrayItemStart = this.bufferNodes.addNode({
									"position": jsonIn.position,
									"node": jsonIn.node,
									"color": jsonIn.color
								});
	
	// ADD NODE TO ARRAY NODES
	// this.nodes[__STRING_USER_NODEID__] = __INT_BUFFERNODE_nodeArrayItemStart__
	this.nodes[jsonIn.id] = bn_nodeArrayItemStart;
	
	return jsonIn.id;
};
StormGraph.prototype.updateNodes = function(jsonIn) {
	//this.bufferNodes.writeNodeDir();
	//this.bufferNodes.writeNodePolaritys();
	//this.bufferNodes.writeNodeDestination();
	
	this.bufferNodes.updateNodes();
};

/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.origin Node Origin for this link
* 	@param {String} jsonIn.target Node Target for this link
 */
StormGraph.prototype.addLinkBN = function(jsonIn) {
	var blId = this.bufferNodes.addLink({
		"origin_nodeId": this.nodes[jsonIn.origin].nodeId,
		"target_nodeId": this.nodes[jsonIn.target].nodeId,
		"origin_itemStart": this.nodes[jsonIn.origin].itemStart,
		"target_itemStart": this.nodes[jsonIn.target].itemStart
		});
	
	// ADD LINK TO ARRAY LINKS
	this.links.push({
		"origin_nodeId": this.nodes[jsonIn.origin].nodeId,
		"target_nodeId": this.nodes[jsonIn.target].nodeId,
		"origin_itemStart": this.nodes[jsonIn.origin].itemStart,
		"target_itemStart": this.nodes[jsonIn.target].itemStart
		});
};
StormGraph.prototype.updateLinks = function(jsonIn) {
	//this.bufferNodes.writeLinkDir();
	//this.bufferNodes.writeLinkPolaritys();
	//this.bufferNodes.writeLinkDestination();
	
	this.bufferNodes.updateLinks();
};

