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
	
	this.webCLGL = new WebCLGL(this.gl);
	this.clglLayout_nodes = new WebCLGLLayout_3DpositionByDirection(this.webCLGL, {"offset": this.offset});
	this.clglLayout_links = new WebCLGLLayout_3DpositionByDirection(this.webCLGL, {"offset": this.offset});
	var clglLayout_3dPosByDir = [// vertex head
								['varying vec4 vVertexColor;'],
								
								// vertex source
								['vec2 x = get_global_id();'+
						
								'float nodeIdx = nodeId[x];\n'+  
								'vec4 nodePosition = nodePos[x];\n'+
								'vec4 nodeVertexPosition = nodeVertexPos[x];\n'+
								'vec4 nodeVertexColor = nodeVertexCol[x];\n'+
								
								'mat4 nodepos = nodeWMatrix;'+
								'nodepos[3][0] = nodePosition.x;'+
								'nodepos[3][1] = nodePosition.y;'+
								'nodepos[3][2] = nodePosition.z;'+
								
								'vVertexColor = nodeVertexColor;'+
								'gl_Position = PMatrix * cameraWMatrix * nodepos * nodeVertexPosition;\n'+
								'gl_PointSize = 2.0;\n'],
								
								// fragment head
								['varying vec4 vVertexColor;'],
								['vec2 x = get_global_id();'+
									
								 // fragment source
								'gl_FragColor = vVertexColor;\n']];
	this.clglLayout_nodes.setVFProgram(clglLayout_3dPosByDir[0], clglLayout_3dPosByDir[1], clglLayout_3dPosByDir[2], clglLayout_3dPosByDir[3]);
	this.clglLayout_links.setVFProgram(clglLayout_3dPosByDir[0], clglLayout_3dPosByDir[1], clglLayout_3dPosByDir[2], clglLayout_3dPosByDir[3]);
	
	this.nodes = {};
	this.links = [];
	
	
	
	
	this.arrayNodeId = [];
	this.arrayNodePosXYZW = [];
	this.arrayNodeVertexPos = [];
	this.arrayNodeVertexColor = [];
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.arrayInitPos = [];	
	this.arrayInitDir = [];	
	this.arrayNodeDir = [];
	this.arrayNodePolaritys = [];
	this.arrayNodeDestination = [];
	
	// default mesh to use
	var meshNode = new StormNode();
	meshNode.loadBox();
	
	this.currentNodeId = 0;	
	this.nodeArrayItemStart = 0;
	
	
	
	
	
	this.arrayLinkId = [];
	this.arrayLinkNodeName = [];
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
	
	
	
	
	
	this.enDestination = 0;
};
StormGraph.prototype = Object.create(StormNode.prototype);










/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} name Name of node
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {String}
 */
StormGraph.prototype.addNode = function(jsonIn) {
	var node = this.addNodeNow({
									"position": jsonIn.position,
									"node": jsonIn.node,
									"color": jsonIn.color
								});
	
	
	// ADD NODE TO ARRAY NODES
	// this.nodes[__STRING_USER_NODEID__] = {"nodeId": __INT_this.currentNodeId__, "itemStart": __INT_this.nodeArrayItemStart__}
	this.nodes[jsonIn.name] = node;
	
	return jsonIn.name;
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

/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.origin NodeName Origin for this link
* 	@param {String} jsonIn.target NodeName Target for this link
 */
StormGraph.prototype.addLink = function(jsonIn) {
	var blId = this.addLinkNow({
		"origin_nodeName": jsonIn.origin,
		"target_nodeName": jsonIn.target,
		"origin_nodeId": this.nodes[jsonIn.origin].nodeId,
		"target_nodeId": this.nodes[jsonIn.target].nodeId,
		"origin_itemStart": this.nodes[jsonIn.origin].itemStart,
		"target_itemStart": this.nodes[jsonIn.target].itemStart
		});
	
	// ADD LINK TO ARRAY LINKS
	this.links.push({
		"origin_nodeName": jsonIn.origin,
		"target_nodeName": jsonIn.target,
		"origin_nodeId": this.nodes[jsonIn.origin].nodeId,
		"target_nodeId": this.nodes[jsonIn.target].nodeId,
		"origin_itemStart": this.nodes[jsonIn.origin].itemStart,
		"target_itemStart": this.nodes[jsonIn.target].itemStart
		});
};
/**
* Create new link for the graph
* @param	{Object} jsonIn
* 	@param {Int} jsonIn.origin_nodeName
* 	@param {Int} jsonIn.target_nodeName
* 	@param {Int} jsonIn.origin_nodeId
* 	@param {Int} jsonIn.target_nodeId
* 	@param {Int} jsonIn.origin_itemStart
* 	@param {Int} jsonIn.target_itemStart
* 	@param {Array<Float32Array>} jsonIn.arraysNodePositions
 * @returns {Int}
 */
StormGraph.prototype.addLinkNow = function(jsonIn) {
	var arr4Uint8_XYZW = this.clglLayout_nodes.webCLGL.enqueueReadBuffer_Float4(this.clglLayout_nodes.CLGL_bufferPosXYZW);
	
	
	// (origin)
	this.arrayLinkId.push(this.currentLinkId);
	this.arrayLinkNodeName.push(jsonIn.origin_nodeName);
	this.arrayLinkNodeId.push(jsonIn.origin_nodeId);
	this.arrayLinkPosXYZW.push(	arr4Uint8_XYZW[0][(jsonIn.origin_itemStart)],
								arr4Uint8_XYZW[1][(jsonIn.origin_itemStart)],
								arr4Uint8_XYZW[2][(jsonIn.origin_itemStart)],
								1.0);
	this.arrayLinkVertexPos.push(0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexColor.push(1.0, 1.0, 1.0, 1.0);
	
	// (target)
	this.arrayLinkId.push(this.currentLinkId+1);
	this.arrayLinkNodeName.push(jsonIn.target_nodeName);
	this.arrayLinkNodeId.push(jsonIn.target_nodeId);
	this.arrayLinkPosXYZW.push(	arr4Uint8_XYZW[0][(jsonIn.target_itemStart)],
								arr4Uint8_XYZW[1][(jsonIn.target_itemStart)],
								arr4Uint8_XYZW[2][(jsonIn.target_itemStart)],
								1.0);	
	this.arrayLinkVertexPos.push(0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexColor.push(1.0, 1.0, 1.0, 1.0);
	
	
	this.arrayLinkIndices.push(this.startIndexId_link, this.startIndexId_link+1);
	this.startIndexId_link += 2;
	
	this.currentLinkId += 2; // augment link id
	
	return this.currentLinkId-2;
};
















StormGraph.prototype.updateNodes = function(jsonIn) {
	var arrPP = [];
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				
				arrPP.push({"x": oper.e[3], "y": oper.e[7], "z": oper.e[11],
							"polarity": stormEngineC.polarityPoints[n].polarity,
							"orbit": stormEngineC.polarityPoints[n].orbit,
							"force": stormEngineC.polarityPoints[n].force});
			}
		}
	}	
	this.clglLayout_nodes.set_polaritypoints(arrPP);
	
	
	var arrF = [];
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				
				arrF.push({"x": oper.e[3], "y": oper.e[7], "z": oper.e[11]});
			}
		}
	}
	this.clglLayout_nodes.set_forces(arrF);
	
	
	this.clglLayout_nodes.setBuffer_Id(this.arrayNodeId);
	this.clglLayout_nodes.setBuffer_NodeId(this.arrayNodeId);
		
	if(this.clglLayout_nodes.CLGL_bufferPosXYZW != undefined) {
		var arr4Uint8_XYZW = this.clglLayout_nodes.webCLGL.enqueueReadBuffer_Float4(this.clglLayout_nodes.CLGL_bufferPosXYZW);
		//var arr4Uint8_XYZW = this.clglLayout_nodes.CLGL_bufferPosXYZW.Float4;
		for(var n = 0, f = arr4Uint8_XYZW[0].length; n < f; n++) {
			var idx = n*4;
			this.arrayNodePosXYZW[idx] = arr4Uint8_XYZW[0][n];
			this.arrayNodePosXYZW[idx+1] = arr4Uint8_XYZW[1][n];
			this.arrayNodePosXYZW[idx+2] = arr4Uint8_XYZW[2][n];
			this.arrayNodePosXYZW[idx+3] = arr4Uint8_XYZW[3][n];
		}
		
	}
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
	this.clglLayout_nodes.set_lifeDistance(0);
	this.clglLayout_nodes.set_enableDrag(0);
	this.clglLayout_nodes.set_idToDrag(0);
	this.clglLayout_nodes.set_MouseDragTranslationX(0);
	this.clglLayout_nodes.set_MouseDragTranslationY(0);
	this.clglLayout_nodes.set_MouseDragTranslationZ(0);
	this.clglLayout_nodes.set_islink(0);
};
StormGraph.prototype.updateLinks = function(jsonIn) {
	var arrPP = [];
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				
				arrPP.push({"x": oper.e[3], "y": oper.e[7], "z": oper.e[11],
							"polarity": stormEngineC.polarityPoints[n].polarity,
							"orbit": stormEngineC.polarityPoints[n].orbit,
							"force": stormEngineC.polarityPoints[n].force});
			}
		}
	}	
	this.clglLayout_links.set_polaritypoints(arrPP);
	
	var arrF = [];
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				
				arrF.push({"x": oper.e[3], "y": oper.e[7], "z": oper.e[11]});
			}
		}
	}
	this.clglLayout_links.set_forces(arrF);
	
	
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
	this.clglLayout_links.set_lifeDistance(0);
	this.clglLayout_links.set_enableDrag(0);
	this.clglLayout_links.set_idToDrag(0);
	this.clglLayout_links.set_MouseDragTranslationX(0);
	this.clglLayout_links.set_MouseDragTranslationY(0);
	this.clglLayout_links.set_MouseDragTranslationZ(0);
	this.clglLayout_links.set_islink(1);
}; 














/**
* Make prerender
* @type Void
*/
StormGraph.prototype.prerender = function() {
	this.clglLayout_nodes.prerender();
	this.clglLayout_links.prerender();
};
/**
* Make render
* @type Void
*/
StormGraph.prototype.render = function() {
	if(this.arrayNodeId.length > 0) {
		this.clglLayout_nodes.render((function() {
			this.clglLayout_nodes.set_PMatrix(stormEngineC.defaultCamera.mPMatrix.transpose().e);
			this.clglLayout_nodes.set_cameraWMatrix(stormEngineC.defaultCamera.MPOS.transpose().e);
			this.clglLayout_nodes.set_nodeWMatrix(this.MPOS.transpose().e);
			this.clglLayout_nodes.set_nodesSize(parseFloat(this.currentNodeId-1));
		}).bind(this), this.gl.TRIANGLES);
	}
	if(this.arrayLinkId.length > 0) {
		this.clglLayout_links.render((function() {
			this.clglLayout_links.set_PMatrix(stormEngineC.defaultCamera.mPMatrix.transpose().e);
			this.clglLayout_links.set_cameraWMatrix(stormEngineC.defaultCamera.MPOS.transpose().e);
			this.clglLayout_links.set_nodeWMatrix(this.MPOS.transpose().e);
			this.clglLayout_links.set_nodesSize(parseFloat(this.currentNodeId-1));
		}).bind(this), this.gl.LINES);
	}
};

/**
* Destination force
* @param	{Float} force
* @type Void
*/
StormGraph.prototype.set_destinationForce = function(value) { 
	this.destForce = value;
	this.clglLayout_nodes.set_destinationForce(this.destForce);
	this.clglLayout_links.set_destinationForce(this.destForce);
};
/**
* Disable destination
* @type Void
*/
StormGraph.prototype.set_disableDestination = function() { 	
	this.enDestination = 0;	
	this.clglLayout_nodes.set_enableDestination(this.enDestination);
	this.clglLayout_links.set_enableDestination(this.enDestination);
};
/**
* Enable destination
* @type Void
*/
StormGraph.prototype.set_enableDestination = function() { 	
	this.enDestination = 1;	
	this.clglLayout_nodes.set_enableDestination(this.enDestination);
	this.clglLayout_links.set_enableDestination(this.enDestination);
};
/**
* Life distance
* @param {Float} distance
* @type Void
*/
StormGraph.prototype.set_lifeDistance = function(value) { 
	this.lifeDistance = value;
	this.clglLayout_nodes.set_lifeDistance(this.lifeDistance);
	this.clglLayout_links.set_lifeDistance(this.lifeDistance);
};
/**
* Destination by width and height
* @param {Int} width
* @param {Int} height
* @type Void
*/
StormGraph.prototype.set_destinationWidthHeight = function(width, height) {
	this.set_enableDestination();
	this.set_destinationForce(0.5);
		
	this.arrayNodeDestination = [];	
	var totalNodes = this.currentNodeId-1;
	var totalDestinations = width*height;
	var nodesPerCell = totalNodes/totalDestinations;
	var nodesInCell = 0;	
	var currentNodeId = -1;
	var x = 0;
	var z = 0;
	var separation = 1.0;
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
			
			if(nodesInCell > nodesPerCell) {				
				x++;
				if(x > width-1) {
					x = 0;
					z++;
				}
				nodesInCell -= nodesPerCell;
			}
			nodesInCell++;
			
			this.arrayNodeDestination.push(x*separation, 0, z*separation, 255);			
		} else {
			this.arrayNodeDestination.push(x*separation, 0, z*separation, 255);
		}
	}
	this.clglLayout_nodes.setBuffer_Destination(this.arrayNodeDestination);
	
	this.updateLinkDestination();	
};
/**
* Destination to voxel volume
* @param {StormVoxelizator} voxelizator
* @type Void
*/
StormGraph.prototype.set_destinationVolume = function(voxelizator) {
	this.set_enableDestination();
	this.set_destinationForce(0.5);
		
	var vo = voxelizator;
	if(vo instanceof StormVoxelizator == false) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	if(vo.image3D_VoxelsColor == undefined) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	var data = vo.clglBuff_VoxelsColor.inData;
	
	this.arrayNodeDestination = [];	
	var numActCells = 0;
	for(var n = 0, f = data.length/4; n < f; n++) { // num of active cells
		var id = n*4;
		//if(data[id] > 30 && data[id+1] > 30 && data[id+2] > 30)
		if(data[id+3] > 0) numActCells++; 
	}
	var totalNodes = this.currentNodeId-1;
	var nodesPerCell = totalNodes/numActCells;
	var nodesInCell = 0;	
	var currentNodeId = -1;
	var CCX=0,CCY=0,CCZ=0;
	var CCXMAX=vo.resolution-1, CCYMAX=vo.resolution-1, CCZMAX=vo.resolution-1;
	var separation = 1.0;	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
			
			if(nodesInCell > nodesPerCell) {
				while(true) {
					if(CCX == CCXMAX && CCZ == CCZMAX && CCY == CCYMAX) {
						break;
					} else {
						if(CCX == CCXMAX && CCZ == CCZMAX) {
							CCX=0;CCZ=0;CCY++;
						} else {
							if(CCX == CCXMAX) {
								CCX=0;CCZ++;
							} else {
								CCX++;
							}
						}
					}
					
					var currentVoxelCell = (CCY*(vo.resolution*vo.resolution)) + (CCZ*(vo.resolution)) + CCX;
					//if(data[id] > 30 && data[id+1] > 30 && data[id+2] > 30)
					if(data[(currentVoxelCell*4)+3] > 0) {
						break;
					}
				}
				nodesInCell -= nodesPerCell;
			}
			nodesInCell++;
			
			this.arrayNodeDestination.push(CCX*separation, CCY*separation, CCZ*separation, 255);			
		} else {
			this.arrayNodeDestination.push(CCX*separation, CCY*separation, CCZ*separation, 255);
		}
	}
	this.clglLayout_nodes.setBuffer_Destination(this.arrayNodeDestination);
	
	this.setLinksDestinationToNodesDestination();
};
/**
* Set Destination of links to actual destination of nodes
* @type Void
*/
StormGraph.prototype.setLinksDestinationToNodesDestination = function() {
	// update destination for links
	this.arrayLinkDestination = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		var currentLinkNodeName = this.arrayLinkNodeName[n];		
		var nodeNameItemStart = this.nodes[currentLinkNodeName].itemStart;
		
		this.arrayLinkDestination.push(this.arrayNodeDestination[(nodeNameItemStart*4)],
										this.arrayNodeDestination[(nodeNameItemStart*4)+1],
										this.arrayNodeDestination[(nodeNameItemStart*4)+2],
										1.0);
	}
	this.clglLayout_links.setBuffer_Destination(this.arrayLinkDestination);
};

/**
* Set direction 
* @type Void
* @param {String|StormV3} [direction=undefined] 'random', StormV3 or undefined(0.0) 
*/
StormGraph.prototype.set_dir = function(direction) { 	
	this.arrayNodeDir = []; 
	var currentNodeId = -1;
	var currNodeDirection = -1;
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
			
			if(direction == undefined) {
				currNodeDirection = [0.0, 0.0, 0.0, 0.0];
			} else if(direction == 'random') {
				currNodeDirection = [1.0-(Math.random()*2.0), 1.0-(Math.random()*2.0), 1.0-(Math.random()*2.0), 0.0];
			} else if(direction instanceof StormV3) {
				currNodeDirection = [direction.e[0], direction.e[1], direction.e[2], 0.0];
			}
			
			this.arrayNodeDir.push(currNodeDirection[0], currNodeDirection[1], currNodeDirection[2], currNodeDirection[3]);
		} else {
			this.arrayNodeDir.push(currNodeDirection[0], currNodeDirection[1], currNodeDirection[2], currNodeDirection[3]);
		}
	}
	this.clglLayout_nodes.setBuffer_Dir(this.arrayNodeDir);
	
	this.setLinksDirToNodesDir();
};
/**
* Set Direction of links to actual direction of nodes
* @type Void
*/
StormGraph.prototype.setLinksDirToNodesDir = function() {
	// update direction for links
	this.arrayLinkDir = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		var currentLinkNodeName = this.arrayLinkNodeName[n];		
		var nodeNameItemStart = this.nodes[currentLinkNodeName].itemStart;
		
		this.arrayLinkDir.push(this.arrayNodeDir[(nodeNameItemStart*4)],
								this.arrayNodeDir[(nodeNameItemStart*4)+1],
								this.arrayNodeDir[(nodeNameItemStart*4)+2],
								1.0);
	}
	this.clglLayout_links.setBuffer_Dir(this.arrayLinkDir);
};
