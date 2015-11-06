/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormGraph = function(sec, jsonIn) { StormNode.call(this);
	this._sec = sec;
	
	this.objectType = 'graph';
	
	this.gl = this._sec.stormGLContext.gl;
	this.selfShadows = true;
	
	this.offset = (jsonIn != undefined && jsonIn.offset != undefined) ? jsonIn.offset : 100.0;
	
	this.webCLGL = new WebCLGL(this.gl);
	
	
	// WebCLGL Sources
	this.arrPP = [];
	this.arrF = [];
	var str_vfp = this.source_vertexFragmentProgram();
	var str_vfp_nd = this.source_vertexFragmentProgram_NormalsDepth();
	var str_posdir = this.source_positionByDirection();
	var str_dir = this.source_direction();
	
	
	// NODES 
	this.clglWork_nodes = this.webCLGL.createWork(this.offset);	
	
	// VERTEX AND FRAGMENT PROGRAMS	
	this.vfProgram_nodes = this.webCLGL.createVertexFragmentProgram();
	this.vfProgram_nodes.setVertexSource(str_vfp[1][0], str_vfp[0][0]);
	this.vfProgram_nodes.setFragmentSource(str_vfp[3][0], str_vfp[2][0]);
	
	// VERTEX AND FRAGMENT PROGRAMS	NORMALS AND DEPTH
	this.vfProgram_ND_nodes = this.webCLGL.createVertexFragmentProgram();
	this.vfProgram_ND_nodes.setVertexSource(str_vfp_nd[1][0], str_vfp_nd[0][0]);
	this.vfProgram_ND_nodes.setFragmentSource(str_vfp_nd[3][0], str_vfp_nd[2][0]);
	
	// KERNEL POSITION BY DIRECTION
	this.kernel_positionByDirection_nodes = this.webCLGL.createKernel();
	this.kernel_positionByDirection_nodes.setKernelSource(str_posdir);
	
	// KERNEL DIRECTION
	this.kernel_direction_nodes = this.webCLGL.createKernel(); 
	this.kernel_direction_nodes.setKernelSource(str_dir);
	
	// ADD TO WORK
	this.clglWork_nodes.addVertexFragmentProgram(this.vfProgram_nodes, "graph");
	this.clglWork_nodes.addVertexFragmentProgram(this.vfProgram_ND_nodes, "graph_nd");
	this.clglWork_nodes.addKernel(this.kernel_positionByDirection_nodes, "posXYZW");
	this.clglWork_nodes.addKernel(this.kernel_direction_nodes, "dir");
		
	this.nodeDrawMode = 4; // 4 TRIANGLES
		
	// LINKS
	this.clglWork_links = this.webCLGL.createWork(this.offset);
	
	//VERTEX AND FRAGMENT PROGRAMS	
	this.vfProgram_links = this.webCLGL.createVertexFragmentProgram();
	this.vfProgram_links.setVertexSource(str_vfp[1][0], str_vfp[0][0]);
	this.vfProgram_links.setFragmentSource(str_vfp[3][0], str_vfp[2][0]);
	
	// VERTEX AND FRAGMENT PROGRAMS	NORMALS AND DEPTH
	this.vfProgram_ND_links = this.webCLGL.createVertexFragmentProgram();
	this.vfProgram_ND_links.setVertexSource(str_vfp_nd[1][0], str_vfp_nd[0][0]);
	this.vfProgram_ND_links.setFragmentSource(str_vfp_nd[3][0], str_vfp_nd[2][0]);
	
	// KERNEL POSITION BY DIRECTION
	this.kernel_positionByDirection_links = this.webCLGL.createKernel();
	this.kernel_positionByDirection_links.setKernelSource(str_posdir);
	
	// KERNEL DIRECTION
	this.kernel_direction_links = this.webCLGL.createKernel(); 
	this.kernel_direction_links.setKernelSource(str_dir);	
	
	// ADD TO WORK
	this.clglWork_links.addVertexFragmentProgram(this.vfProgram_links, "graph");
	this.clglWork_links.addVertexFragmentProgram(this.vfProgram_ND_links, "graph_nd");
	this.clglWork_links.addKernel(this.kernel_positionByDirection_links, "posXYZW");
	this.clglWork_links.addKernel(this.kernel_direction_links, "dir");
	
	this.linkDrawMode = 1; // 1 LINES
	
	
	
	
	
	
	
	
	
	
	

	
	this._nodesByName = {};
	this._nodesById = {};
	this._links = {};
	
	
	
	
	this.splitNodes;
	this.splitNodesIndices;
	this.splitNodesEvery = parseInt((256*256)/36); // 36 box indices
	
	this.arrayNodeId = [];
	this.arrayNodePosXYZW = [];
	this.arrayNodeVertexPos = [];
	this.arrayNodeVertexNormal = [];
	this.arrayNodeVertexColor = [];
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.arrayInitPos = [];	
	this.arrayInitDir = [];	
	this.arrayNodeDir = [];
	this.arrayNodePolaritys = [];
	this.arrayNodeDestination = [];
	
	this.currentNodeId = 0;	
	this.nodeArrayItemStart = 0;
	
	
	
	
	
	this.splitLinks;
	this.splitLinksIndices;
	this.splitLinksEvery = parseInt((256*256)/2); // 2 line indices
	
	this.arrayLinkId = [];
	this.arrayLinkNodeName = [];
	this.arrayLinkNodeId = [];
	this.arrayLinkPosXYZW = [];
	this.arrayLinkVertexPos = [];
	this.arrayLinkVertexNormal = [];
	this.arrayLinkVertexColor = [];
	this.startIndexId_link = 0;
	this.arrayLinkIndices = [];
	
	this.arrayLinkDir = [];
	this.arrayLinkPolaritys = [];
	this.arrayLinkDestination = [];
	
	this.currentLinkId = 0;
	
	
	
	
	
	this.enDestination = 0;
	this.polarity = 1; // positive
	this.lifeDistance = 0.0;
	this.pointSize = 1.0;
	this.destinationForce = 0.5;
};
StormGraph.prototype = Object.create(StormNode.prototype);

/**
* Delete this graph
* @type Void
*/
StormGraph.prototype.remove = function() {  	
	for(var n = 0, f = this._sec.polarityPoints.length; n < f; n++) {
		this._sec.polarityPoints[n].removeParticles({node:this});
	}
	for(var n = 0, f = this._sec.forceFields.length; n < f; n++) {
		this._sec.forceFields[n].removeParticles({node:this});
	}

	var idToRemove = undefined;
	for(var n = 0, f = this._sec.graphs.length; n < f; n++) {
		if(this._sec.graphs[n].idNum == this.idNum) idToRemove = n;
	}
	this._sec.graphs.splice(idToRemove,1);
};

/** @private **/
StormGraph.prototype.source_vertexFragmentProgram = function() {
	var str_vfp = [
	    // vertex head
		['varying vec4 vVertexColor;\n'+
		 'varying vec4 vWNMatrix;\n'],
		
		// vertex source
		['void main(float* nodeId,'+
			'float4*kernel posXYZW,'+
			'float4* nodeVertexPos,'+
			'float4* nodeVertexNormal,'+
			'float4* nodeVertexCol,'+
			'mat4 PMatrix,'+
			'mat4 cameraWMatrix,'+
			'mat4 nodeWMatrix,'+
			'float nodesSize,'+
			'float pointSize) {'+
				'vec2 x = get_global_id();'+
		
				'float nodeIdx = nodeId[x];\n'+  
				'vec4 nodePosition = posXYZW[x];\n'+
				'vec4 nodeVertexPosition = nodeVertexPos[x];\n'+
				'vec4 nodeVertexColor = nodeVertexCol[x];\n'+
				
				'mat4 nodepos = nodeWMatrix;'+
				'nodepos[3][0] = nodePosition.x;'+
				'nodepos[3][1] = nodePosition.y;'+
				'nodepos[3][2] = nodePosition.z;'+
				
				'mat4 nodeposG = nodeWMatrix;'+
				'nodepos[3][0] = nodePosition.x;'+
				'nodepos[3][1] = nodePosition.y;'+
				'nodepos[3][2] = nodePosition.z;'+
				
				'vWNMatrix = nodeposG * nodeVertexNormal[x];\n'+
				
				'vVertexColor = nodeVertexColor;'+
								
				'gl_Position = PMatrix * cameraWMatrix * nodepos * nodeVertexPosition;\n'+
				'gl_PointSize = pointSize;\n'+
		'}'],
		
		// fragment head
		['varying vec4 vVertexColor;\n'+
		 'varying vec4 vWNMatrix;\n'],
		 
		[// fragment source
		 'void main(float nodesSize,'+
					'float4 sunPos,'+
					'float selfShadows,'+
					'float4 ambientColor) {'+
		 	'vec2 x = get_global_id();'+
		 	
		 	// difusa
			'vec3 lightDirection = normalize(sunPos.xyz * -1.0);\n'+ // direccion hacia arriba
			'float lightWeighting = max(dot(normalize(vWNMatrix.xyz), -lightDirection)*-1.0, 0.0);\n'+
			'vec3 weightDiffuse = min(vec3(1.0,1.0,1.0),vec3(lightWeighting,lightWeighting,lightWeighting));\n'+
			
			'if(selfShadows == 1.0) gl_FragColor = (vVertexColor*vec4(weightDiffuse,1.0))+(ambientColor*vVertexColor);\n'+
			'else gl_FragColor = vVertexColor;\n'+
		 '}']];
	
	return str_vfp;
};
/** @private **/
StormGraph.prototype.source_vertexFragmentProgram_NormalsDepth = function() {
	var str_vfp_nd = [// vertex head
   		['varying vec4 vposition;\n'+
   		 'varying vec4 vNormal;\n'],
   		
   		// vertex source
   		['void main(float4*kernel posXYZW,'+
   			'float4* nodeVertexPos,'+
   			'float4* nodeVertexNormal,'+
   			'mat4 PMatrix,'+
   			'mat4 cameraWMatrix,'+
   			'mat4 nodeWMatrix,'+
   			'float pointSize) {'+
   				'vec2 x = get_global_id();'+
   		
   				'vec4 nodePosition = posXYZW[x];\n'+
   				'vec4 nodeVertexPosition = nodeVertexPos[x];\n'+
   				//'vec4 nodeVertexColor = nodeVertexCol[x];\n'+
   				
   				'mat4 nodepos = nodeWMatrix;'+
   				'nodepos[3][0] = nodePosition.x;'+
   				'nodepos[3][1] = nodePosition.y;'+
   				'nodepos[3][2] = nodePosition.z;'+
   				
   				
   				'vposition = cameraWMatrix * nodepos * nodeVertexPosition;\n'+
   				//'vWNMatrix = nodeposG * nodeVertexNormal[x];\n'+
   				
   				'vNormal = nodeVertexNormal;\n'+
   				//'vVertexColor = nodeVertexColor;'+
   								
   				'gl_Position = PMatrix * vposition;\n'+
   				'gl_PointSize = pointSize;\n'+
   		'}'],
   		
   		// fragment head
   		['varying vec4 vposition;\n'+
   		 'varying vec4 vNormal;\n'+
   		'float LinearDepthConstant = 1.0/uFar;'],
   		 
   		[// fragment source
   		 'void main(float uFar) {'+
   		 	'vec2 x = get_global_id();'+
   		 	
   		 	'float linearDepth = length(vposition) * LinearDepthConstant;'+
   		 	'gl_FragColor = vec4((vNormal.r+1.0)/2.0,(vNormal.g+1.0)/2.0,(vNormal.b+1.0)/2.0, linearDepth);\n'+
   		 '}']];
   	
   	return str_vfp_nd;
};
/** @private **/
StormGraph.prototype.source_positionByDirection = function() {
	var str = 'void main(float4* initPos,'+
						'float4* posXYZW,'+
						'float4* dir,'+
						'float lifeDistance) {'+
							'vec2 x = get_global_id();'+
							'vec3 currentPos = posXYZW[x].xyz;\n'+ 
							'vec4 dir = dir[x];'+
							'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
							'vec3 newPos = (currentPos+currentDir);\n'+
							
							'vec4 initPos = initPos[x];'+
							'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance)'+
								'newPos = vec3(initPos.x,initPos.y,initPos.z);'+
								
							'out_float4 = vec4(newPos, 1.0);\n'+ 
			'}';
	return str;
};
/** @private **/
StormGraph.prototype.source_direction = function() {
	lines_argumentsPoles = (function() {
		var str = '';
		for(var n = 0, f = this.arrPP.length; n < f; n++) {
			str += ',float pole'+n+'X'+
					',float pole'+n+'Y'+
					',float pole'+n+'Z'+
					',float pole'+n+'Polarity'+
					',float pole'+n+'Orbit'+
					',float pole'+n+'Force';
		}
		return str;
	}).bind(this);
	lines_argumentsForces = (function() {
		var str = '';
		for(var n = 0, f = this.arrF.length; n < f; n++) {
			str += ',float force'+n+'X'+
					',float force'+n+'Y'+
					',float force'+n+'Z';
		} 
		return str;
	}).bind(this);
	
	lines_poles = (function() {
		var str = 'float offset;vec3 polePos;vec3 vecN; float toDir; vec3 cc;float distanceToPole;\n';
		for(var n = 0, f = this.arrPP.length; n < f; n++) {
			str += 'polePos = vec3(pole'+n+'X,pole'+n+'Y,pole'+n+'Z);\n'+ 
					'toDir = -1.0;\n'+  
					'if(sign(particlePolarity[x]) == 0.0 && sign(pole'+n+'Polarity) == 1.0) toDir = 1.0;\n'+
					'if(sign(particlePolarity[x]) == 1.0 && sign(pole'+n+'Polarity) == 0.0) toDir = 1.0;\n'+
					'offset = '+this.offset.toFixed(20)+';'+
					
					'distanceToPole = 1.0-sqrt(length(vec3(polePos-currentPos)/offset));'+
					
					'vecN = ((vec3(polePos-currentPos)-(-1.0))/(1.0-(-1.0)) - 0.5 ) *2.0 * pole'+n+'Force * toDir;'+
					'cc = vecN*distanceToPole ;\n'+
					
					'currentDir = clamp(currentDir+(cc*0.001),-1.0,1.0);\n'+
					
					//'if(pole'+n+'Orbit == 1.0) cc = 
					'';
		}
		return str;
	}).bind(this);
	lines_forces = (function() {
		var str = 'vec3 force;\n';
		for(var n = 0, f = this.arrF.length; n < f; n++) {
			str += 'force = vec3(force'+n+'X,force'+n+'Y,force'+n+'Z);\n'+ 
					'currentDir = currentDir+(force*0.0001);\n';
		} 
		return str;
	}).bind(this);
var str =	'void main(					float* idx'+
										',float* nodeId'+
										',float4* initPos'+
										',float4* initDir'+
										',float4* posXYZW'+
										',float4* dir'+
										',float* particlePolarity'+
										',float4* dest'+
										',float enableDestination'+
										',float destinationForce'+
										',float lifeDistance'+
										',float enableDrag'+
										',float idToDrag'+
										',float MouseDragTranslationX'+
										',float MouseDragTranslationY'+
										',float MouseDragTranslationZ'+
										',float islink'+
										lines_argumentsPoles()+ 
										lines_argumentsForces()+ 
										') {\n'+
								'vec2 x = get_global_id();\n'+	 
								'float idBN = idx[x];'+
								'float nodeidBN = nodeId[x];'+	
								'vec4 dirA = dir[x];'+								
								'vec3 currentDir = vec3(dirA.x,dirA.y,dirA.z);\n'+ 
								'vec3 currentPos = posXYZW[x].xyz;\n'+ 
								'vec4 dest = dest[x];'+
								'vec3 destinationPos = vec3(dest.x,dest.y,dest.z);\n'+ 
								
								
								
								
								// particles interact with others particles
								/*'int width = '+Math.sqrt(this.particlesLength)+';'+
								'int height = '+Math.sqrt(this.particlesLength)+';'+
								'float workItemWidth = 1.0/float(width);'+
								'float workItemHeight = 1.0/float(height);'+
								'int currentCol = 0;'+
								'int currentRow = 0;'+
								'const int f = '+this.particlesLength+';\n'+
								'vec3 dirOthers = vec3(0.0,0.0,0.0);\n'+ 
								'int h = 0;'+ 
								'vec4 dirB;'+
								
								'for(int i =0; i < 32*32; i++) {'+
									'vec2 xb = vec2(float(currentCol)*workItemWidth, float(currentRow)*workItemHeight);'+
									'dirB = dir[xb];'+
									'vec3 currentDirB = vec3(dirB.x,dirB.y,dirB.z);\n'+ 
									'vec3 currentPosB = vec3(posX[xb],posY[xb],posZ[xb]);\n'+ 
									
									'float dist = distance(currentPos,currentPosB);'+
									'if(abs(dist) < 0.1) {'+
										'float ww = (0.1-abs(dist))/0.1;'+
										'dirOthers += (currentDirB*ww);'+    
										'h++;'+
									'}'+
									
									'if(currentCol >= width) {'+
										'currentRow++;'+
										'currentCol = 0;'+
									'} else currentCol++;'+
								'}'+
								'dirOthers = (dirOthers/float(h))*0.1;'+
								'currentDir = currentDir+(dirOthers);'+*/
														
								
								
								lines_poles()+
								
								'if(enableDrag == 1.0) {'+
									'if(islink == 0.0) {'+
										'if(idBN == idToDrag) {'+
											'vec3 dp = vec3(MouseDragTranslationX, MouseDragTranslationY, MouseDragTranslationZ);'+ 
											'currentDir = dp;\n'+
										'}\n'+
									'} else {'+
										'if(nodeidBN == idToDrag) {'+
											'vec3 dp = vec3(MouseDragTranslationX, MouseDragTranslationY, MouseDragTranslationZ);'+ 
											'currentDir = dp;\n'+
										'}\n'+
									'}\n'+
								'}\n'+
								
								'if(enableDestination == 1.0) {\n'+
									'vec3 dirDestination = normalize(destinationPos-currentPos);\n'+
									'float distan = abs(distance(currentPos,destinationPos));\n'+
									'float dirDestWeight = sqrt(distan);\n'+  
									'currentDir = (currentDir+(dirDestination*dirDestWeight*destinationForce))*dirDestWeight*0.1;\n'+
								'}\n'+
								
								lines_forces()+
								
								'currentDir = currentDir*0.995;'+ // air resistence
								
								'vec3 newPos = (currentPos+currentDir);\n'+
								'vec4 initPos = initPos[x];'+
								'if(lifeDistance > 0.0 && distance(vec3(initPos.x,initPos.y,initPos.z),newPos) > lifeDistance) {'+
									'vec4 initDir = vec4(initDir[x]);'+
									'currentDir = vec3(initDir.x,initDir.y,initDir.z);'+
								'}'+
								
								'vec3 newDir = currentDir;\n'+
	
								'out_float4 = vec4(newDir,1.0);\n'+
							'}';
	return str;
};








/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.name Name of node
*  	@param {Object} jsonIn.data 
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
* 	@param {Function} jsonIn.onmousedown
* 	@param {Function} jsonIn.onmouseup
 * @returns {String}
 */
StormGraph.prototype.addNode = function(jsonIn) {
	if(this._nodesByName.hasOwnProperty(jsonIn.name) == false) {
		var node = this.addNodeNow({"position": jsonIn.position,
									"node": jsonIn.node,
									"color": jsonIn.color});
			
		// add event onmousedown & onmouseup if exists
		node.data = (jsonIn != undefined && jsonIn.data != undefined) ? jsonIn.data : undefined;
		node.onmousedown = (jsonIn != undefined && jsonIn.onmousedown != undefined) ? jsonIn.onmousedown : undefined;
		node.onmouseup = (jsonIn != undefined && jsonIn.onmouseup != undefined) ? jsonIn.onmouseup : undefined;
		
		
		/* this._nodesByName[__STRING_USER_NODENAME__] = {	"nodeId": __INT_this.currentNodeId__,
															"itemStart": __INT_this.nodeArrayItemStart__,
															"data": {},
															"onmousedown": Function,
															"onmouseup": Function }*/
		this._nodesByName[jsonIn.name] = node;
		
		/* this._nodesById[__INT_this.currentNodeId__] = {	"nodeName": __STRING_USER_NODENAME__,
		  													"itemStart": __INT_this.nodeArrayItemStart__,
		  													"data": {},
		  													"onmousedown": Function,
		  													"onmouseup": Function }*/
		this._nodesById[node.nodeId] = {"nodeName": jsonIn.name,
										"itemStart": node.itemStart,
										"data": node.data,
										"onmousedown": node.onmousedown,
										"onmouseup": node.onmouseup};
		
		return jsonIn.name;
	} else console.log("node "+jsonIn.name+" already exists");
};
/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {Object}
 * 
 * @private
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
			this.arrayNodeVertexNormal.push(bo.nodeMeshNormalArray[idxVertex], bo.nodeMeshNormalArray[idxVertex+1], bo.nodeMeshNormalArray[idxVertex+2], 1.0);
			//console.log(bo.nodeMeshVertexArray[idxVertex]);
			this.arrayNodeVertexColor.push(color.e[0], color.e[1], color.e[2], 1.0);
			
			
			this.nodeArrayItemStart++;
		}
	}
		
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
	
	if(this.startIndexId == 0) {
		if(this.splitNodes == undefined) {
			this.splitNodes = [];
			this.splitNodesIndices = [];
			this.splitNodes.push(this.arrayNodeId.length*this.splitNodesEvery);
			this.splitNodesIndices.push(this.arrayNodeIndices.length*this.splitNodesEvery);
		} else {
			this.splitNodes.push(this.splitNodes[0]*(this.splitNodes.length+1));
			this.splitNodesIndices.push(this.splitNodesIndices[0]*(this.splitNodesIndices.length+1)); 
		}		
	}
	this.startIndexId += (maxNodeIndexId+1);
	if(this.arrayNodeIndices.length == this.splitNodesIndices[this.splitNodesIndices.length-1]) { 
		this.startIndexId = 0;
	}
	
	this.currentNodeId++; // augment node id
	
	//return this.currentNodeId-1;
	return {"nodeId": this.currentNodeId-1, "itemStart": nAIS}; // nodeArrayItemStart
};
/**
 * Update nodes
 */
StormGraph.prototype.updateNodes = function() {
	this.updateForcesAndPP(this.clglWork_nodes);
	
	this.clglWork_nodes.setArg("idx", this.arrayNodeId, this.splitNodes);
	this.clglWork_nodes.setArg("nodeId", this.arrayNodeId, this.splitNodes);
	
	if(this.clglWork_nodes.buffers_TEMP["posXYZW"] != undefined) {
		var arr4Uint8_XYZW = this.webCLGL.enqueueReadBuffer_Float4(this.clglWork_nodes.buffers_TEMP["posXYZW"]);
		//var arr4Uint8_XYZW = this.clglLayout_nodes.CLGL_bufferPosXYZW.Float4;
		for(var n = 0, f = arr4Uint8_XYZW[0].length; n < f; n++) {
			var idx = n*4;
			this.arrayNodePosXYZW[idx] = arr4Uint8_XYZW[0][n];
			this.arrayNodePosXYZW[idx+1] = arr4Uint8_XYZW[1][n];
			this.arrayNodePosXYZW[idx+2] = arr4Uint8_XYZW[2][n];
			this.arrayNodePosXYZW[idx+3] = arr4Uint8_XYZW[3][n];
		}
		
	}
	this.clglWork_nodes.setArg("posXYZW", this.arrayNodePosXYZW, this.splitNodes);
	this.clglWork_nodes.setArg("initPos", this.arrayNodePosXYZW, this.splitNodes);
	
	this.clglWork_nodes.setArg("nodeVertexPos", this.arrayNodeVertexPos, this.splitNodes);
	this.clglWork_nodes.setArg("nodeVertexNormal", this.arrayNodeVertexNormal, this.splitNodes);
	this.clglWork_nodes.setArg("nodeVertexCol", this.arrayNodeVertexColor, this.splitNodes);
	this.clglWork_nodes.setIndices(this.arrayNodeIndices, this.splitNodesIndices);
	
	this.arrayNodeDir = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDir.push(0, 0, 0, 255);
	}
	this.clglWork_nodes.setArg("dir", this.arrayNodeDir, this.splitNodes);
	this.clglWork_nodes.setArg("initDir", this.arrayNodeDir, this.splitNodes);
	
	this.arrayNodePolaritys = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodePolaritys.push(1);
	}
	this.clglWork_nodes.setArg("particlePolarity", this.arrayNodePolaritys, this.splitNodes);
	
	this.arrayNodeDestination = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDestination.push(0, 0, 0, 255);
	}
	this.clglWork_nodes.setArg("dest", this.arrayNodeDestination, this.splitNodes);
	
	this.clglWork_nodes.setArg("PMatrix", this._sec.defaultCamera.mPMatrix.transpose().e);
	this.clglWork_nodes.setArg("cameraWMatrix", this._sec.defaultCamera.MPOS.transpose().e);
	this.clglWork_nodes.setArg("nodeWMatrix", this.MPOS.transpose().e);
	this.clglWork_nodes.setArg("nodesSize", parseFloat(this.currentNodeId-1));
	this.clglWork_nodes.setArg("sunPos", [this._sec.lights[0].direction.e[0], this._sec.lights[0].direction.e[1], this._sec.lights[0].direction.e[2], 1.0]);
	this.clglWork_nodes.setArg("selfShadows", ((this.selfShadows == true)?1.0:0.0));
	this.clglWork_nodes.setArg("ambientColor", [this._sec.getAmbientColor()[0], this._sec.getAmbientColor()[1], this._sec.getAmbientColor()[2], 1.0]);
	
	this.clglWork_nodes.setArg("enableDestination", this.enDestination);
	this.clglWork_nodes.setArg("destinationForce", this.destinationForce);
	this.clglWork_nodes.setArg("lifeDistance", this.lifeDistance);
	this.clglWork_nodes.setArg("pointSize", this.pointSize);
	this.clglWork_nodes.setArg("enableDrag", 0);
	this.clglWork_nodes.setArg("idToDrag", 0);
	this.clglWork_nodes.setArg("MouseDragTranslationX", 0);
	this.clglWork_nodes.setArg("MouseDragTranslationY", 0);
	this.clglWork_nodes.setArg("MouseDragTranslationZ", 0);
	this.clglWork_nodes.setArg("islink", 0);
};














/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {String} jsonIn.origin NodeName Origin for this link
* 	@param {String} jsonIn.target NodeName Target for this link
* 	@param {Array<Float>} jsonIn.origin_color Vector3F for the origin color
* 	@param {Array<Float>} jsonIn.target_color Vector3F for the target color
 */
StormGraph.prototype.addLink = function(jsonIn) {
	if(this._links.hasOwnProperty(jsonIn.origin+"->"+jsonIn.target) == false) {
		var orig_color = (jsonIn != undefined && jsonIn.origin_color != undefined) ? jsonIn.origin_color : [1.0, 1.0, 1.0];
		var targ_color = (jsonIn != undefined && jsonIn.target_color != undefined) ? jsonIn.target_color : [1.0, 1.0, 1.0];
		
		var json = {
				"origin_nodeName": jsonIn.origin,
				"target_nodeName": jsonIn.target,
				"origin_nodeId": this._nodesByName[jsonIn.origin].nodeId,
				"target_nodeId": this._nodesByName[jsonIn.target].nodeId,
				"origin_itemStart": this._nodesByName[jsonIn.origin].itemStart,
				"target_itemStart": this._nodesByName[jsonIn.target].itemStart,
				"origin_color": orig_color,
				"target_color": targ_color
				};
		
		var blId = this.addLinkNow(json);
		
		// ADD LINK TO ARRAY LINKS
		this._links[jsonIn.origin+"->"+jsonIn.target] = json;
	} else console.log("link "+jsonIn.origin+"->"+jsonIn.target+" already exists");
};
/**
* Create new link for the graph
* @private
* @param	{Object} jsonIn
* 	@param {Int} jsonIn.origin_nodeName
* 	@param {Int} jsonIn.target_nodeName
* 	@param {Int} jsonIn.origin_nodeId
* 	@param {Int} jsonIn.target_nodeId
* 	@param {Int} jsonIn.origin_itemStart
* 	@param {Int} jsonIn.target_itemStart
* 	@param {Array<Float>} jsonIn.origin_color Vector3F for the origin color
* 	@param {Array<Float>} jsonIn.target_color Vector3F for the target color
 * @returns {Int}
 * 
 * @private
 */
StormGraph.prototype.addLinkNow = function(jsonIn) {
	// (origin)
	this.arrayLinkId.push(this.currentLinkId);
	this.arrayLinkNodeName.push(jsonIn.origin_nodeName);
	this.arrayLinkNodeId.push(jsonIn.origin_nodeId);
	this.arrayLinkPosXYZW.push(	0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexPos.push(0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexNormal.push(0.0, 1.0, 0.0, 1.0);
	this.arrayLinkVertexColor.push(jsonIn.origin_color[0], jsonIn.origin_color[1], jsonIn.origin_color[2], 1.0);
	
	// (target)
	this.arrayLinkId.push(this.currentLinkId+1);
	this.arrayLinkNodeName.push(jsonIn.target_nodeName);
	this.arrayLinkNodeId.push(jsonIn.target_nodeId);
	this.arrayLinkPosXYZW.push(	0.0, 0.0, 0.0, 1.0);	
	this.arrayLinkVertexPos.push(0.0, 0.0, 0.0, 1.0);
	this.arrayLinkVertexNormal.push(0.0, 1.0, 0.0, 1.0);
	this.arrayLinkVertexColor.push(jsonIn.target_color[0], jsonIn.target_color[1], jsonIn.target_color[2], 1.0);
	
	
	this.arrayLinkIndices.push(this.startIndexId_link, this.startIndexId_link+1);
	
	if(this.startIndexId_link == 0) {
		if(this.splitLinks == undefined) {
			this.splitLinks = [];
			this.splitLinksIndices = [];
			this.splitLinks.push(this.arrayLinkId.length*this.splitLinksEvery);
			this.splitLinksIndices.push(this.arrayLinkIndices.length*this.splitLinksEvery);
		} else {
			this.splitLinks.push(this.splitLinks[0]*(this.splitLinks.length+1));
			this.splitLinksIndices.push(this.splitLinksIndices[0]*(this.splitLinksIndices.length+1)); 
		}	
	}
	this.startIndexId_link += 2;
	if(this.arrayLinkIndices.length == this.splitLinksIndices[this.splitLinksIndices.length-1]) { 
		this.startIndexId_link = 0;
	}
	
	this.currentLinkId += 2; // augment link id
	
	return this.currentLinkId-2;
};
/**
 * Update links
 */
StormGraph.prototype.updateLinks = function() {
	this.updateForcesAndPP(this.clglWork_links);
	
	this.clglWork_links.setArg("idx", this.arrayLinkId, this.splitLinks); 
	this.clglWork_links.setArg("nodeId", this.arrayLinkNodeId, this.splitLinks);
	
	if(this.clglWork_nodes.buffers_TEMP["posXYZW"] != undefined) {
		var arr4Uint8_XYZW = this.webCLGL.enqueueReadBuffer_Float4(this.clglWork_nodes.buffers_TEMP["posXYZW"]);
		//var arr4Uint8_XYZW = this.clglLayout_nodes.CLGL_bufferPosXYZW.Float4;
		var n = 0;
		for(var key in this._links) {
		     var idx = n*8;
			this.arrayLinkPosXYZW[idx+0] = arr4Uint8_XYZW[0][this._links[key].origin_itemStart];
			this.arrayLinkPosXYZW[idx+1] = arr4Uint8_XYZW[1][this._links[key].origin_itemStart];
			this.arrayLinkPosXYZW[idx+2] = arr4Uint8_XYZW[2][this._links[key].origin_itemStart];
			this.arrayLinkPosXYZW[idx+3] = arr4Uint8_XYZW[3][this._links[key].origin_itemStart];
			
			this.arrayLinkPosXYZW[idx+4] = arr4Uint8_XYZW[0][this._links[key].target_itemStart];
			this.arrayLinkPosXYZW[idx+5] = arr4Uint8_XYZW[1][this._links[key].target_itemStart];
			this.arrayLinkPosXYZW[idx+6] = arr4Uint8_XYZW[2][this._links[key].target_itemStart];
			this.arrayLinkPosXYZW[idx+7] = arr4Uint8_XYZW[3][this._links[key].target_itemStart];
			
			n++;
		}
	}
	
	this.clglWork_links.setArg("posXYZW", this.arrayLinkPosXYZW, this.splitLinks);	
	this.clglWork_links.setArg("initPos", this.arrayLinkPosXYZW, this.splitLinks);
	this.clglWork_links.setArg("nodeVertexPos", this.arrayLinkVertexPos, this.splitLinks);
	this.clglWork_links.setArg("nodeVertexNormal", this.arrayLinkVertexNormal, this.splitLinks);
	this.clglWork_links.setArg("nodeVertexCol", this.arrayLinkVertexColor, this.splitLinks);
	this.clglWork_links.setIndices(this.arrayLinkIndices, this.splitLinksIndices);
	
	this.arrayLinkDir = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDir.push(0, 0, 0, 255);
	}
	this.clglWork_links.setArg("dir", this.arrayLinkDir, this.splitLinks);
	this.clglWork_links.setArg("initDir", this.arrayLinkDir, this.splitLinks);
	
	this.arrayLinkPolaritys = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkPolaritys.push(1);
	}
	this.clglWork_links.setArg("particlePolarity", this.arrayLinkPolaritys, this.splitLinks);
	
	this.arrayLinkDestination = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDestination.push(0, 0, 0, 255);
	}
	this.clglWork_links.setArg("dest", this.arrayLinkDestination, this.splitLinks);
	
	this.clglWork_links.setArg("PMatrix", this._sec.defaultCamera.mPMatrix.transpose().e);
	this.clglWork_links.setArg("cameraWMatrix", this._sec.defaultCamera.MPOS.transpose().e);
	this.clglWork_links.setArg("nodeWMatrix", this.MPOS.transpose().e);
	this.clglWork_links.setArg("nodesSize", this.currentLinkId-2);
	this.clglWork_links.setArg("sunPos", [this._sec.lights[0].direction.e[0], this._sec.lights[0].direction.e[1], this._sec.lights[0].direction.e[2], 1.0]);
	this.clglWork_links.setArg("selfShadows", ((this.selfShadows == true)?1.0:0.0));
	this.clglWork_links.setArg("ambientColor", [this._sec.getAmbientColor()[0], this._sec.getAmbientColor()[1], this._sec.getAmbientColor()[2], 1.0]);
	
	this.clglWork_links.setArg("enableDestination", this.enDestination);
	this.clglWork_links.setArg("destinationForce", this.destinationForce);
	this.clglWork_links.setArg("lifeDistance", this.lifeDistance);
	this.clglWork_links.setArg("pointSize", this.pointSize);
	this.clglWork_links.setArg("enableDrag", 0);
	this.clglWork_links.setArg("idToDrag", 0);
	this.clglWork_links.setArg("MouseDragTranslationX", 0);
	this.clglWork_links.setArg("MouseDragTranslationY", 0);
	this.clglWork_links.setArg("MouseDragTranslationZ", 0);
	this.clglWork_links.setArg("islink", 1);
}; 














/**
* Make prerender
* @type Void
* 
* @private
*/
StormGraph.prototype.prerender = function() {
	if(this.arrayNodeId.length > 0) this.clglWork_nodes.enqueueNDRangeKernel();
	if(this.arrayLinkId.length > 0) this.clglWork_links.enqueueNDRangeKernel();
};
/**
* Render Normals and depth
* @type Void
* 
* @private
*/
StormGraph.prototype.render_ND = function() {
	if(this.arrayNodeId.length > 0) {
		this.clglWork_nodes.enqueueVertexFragmentProgram("posXYZW", "graph_nd", (function() {
			//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			if(this._sec.stormGLContext.view_Normals) { 
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			} else {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._sec.stormGLContext.fBuffer); 
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._sec.stormGLContext.textureFB_Normals, 0);
				//this.gl.enable(this.gl.BLEND);
				//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
			}
			
			this.clglWork_nodes.setArg("PMatrix", this._sec.defaultCamera.mPMatrix.transpose().e);
			this.clglWork_nodes.setArg("cameraWMatrix", this._sec.defaultCamera.MPOS.transpose().e);
			this.clglWork_nodes.setArg("nodeWMatrix", this.MPOS.transpose().e);
			this.clglWork_nodes.setArg("uFar", this._sec.stormGLContext.far);
		}).bind(this), this.nodeDrawMode);
	}
	if(this.arrayLinkId.length > 0) {
		this.clglWork_links.enqueueVertexFragmentProgram("posXYZW", "graph_nd", (function() {
			//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			if(this._sec.stormGLContext.view_Normals) {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			} else {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._sec.stormGLContext.fBuffer); 
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._sec.stormGLContext.textureFB_Normals, 0);
				//this.gl.enable(this.gl.BLEND);
				//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
			}
			
			this.clglWork_links.setArg("PMatrix", this._sec.defaultCamera.mPMatrix.transpose().e);
			this.clglWork_links.setArg("cameraWMatrix", this._sec.defaultCamera.MPOS.transpose().e);
			this.clglWork_links.setArg("nodeWMatrix", this.MPOS.transpose().e);
			this.clglWork_links.setArg("uFar", this._sec.stormGLContext.far);
		}).bind(this), this.linkDrawMode);
	}
};
/**
* Make render
* @type Void
* 
* @private
*/
StormGraph.prototype.render = function() {
	if(this.arrayNodeId.length > 0) {
		this.clglWork_nodes.enqueueVertexFragmentProgram("posXYZW", "graph", (function() {
			//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			if(this._sec.stormGLContext.view_SceneNoDOF || this._sec.defaultCamera.DOFenable == false) { 
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			} else {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._sec.stormGLContext.fBuffer); 
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._sec.stormGLContext.textureObject_DOF, 0);
				//this.gl.enable(this.gl.BLEND);
				//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
			}
			
			this.clglWork_nodes.setArg("PMatrix", this._sec.defaultCamera.mPMatrix.transpose().e);
			this.clglWork_nodes.setArg("cameraWMatrix", this._sec.defaultCamera.MPOS.transpose().e);
			this.clglWork_nodes.setArg("nodeWMatrix", this.MPOS.transpose().e);
			this.clglWork_nodes.setArg("nodesSize", parseFloat(this.currentNodeId-1));
		}).bind(this), this.nodeDrawMode);
	}
	if(this.arrayLinkId.length > 0) {
		this.clglWork_links.enqueueVertexFragmentProgram("posXYZW", "graph", (function() {
			//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			if(this._sec.stormGLContext.view_SceneNoDOF || this._sec.defaultCamera.DOFenable == false) {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
			} else {
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this._sec.stormGLContext.fBuffer); 
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this._sec.stormGLContext.textureObject_DOF, 0);
				//this.gl.enable(this.gl.BLEND);
				//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
			}
			
			this.clglWork_links.setArg("PMatrix", this._sec.defaultCamera.mPMatrix.transpose().e);
			this.clglWork_links.setArg("cameraWMatrix", this._sec.defaultCamera.MPOS.transpose().e);
			this.clglWork_links.setArg("nodeWMatrix", this.MPOS.transpose().e);
			this.clglWork_links.setArg("nodesSize", parseFloat(this.currentNodeId-1));
		}).bind(this), this.linkDrawMode);
	}
};

/**
 * Set self shadows
 * @param {Bool} [bselfShadows=true]
 */
StormGraph.prototype.setSelfShadows = function(bselfShadows) {
	var ss = (bselfShadows != undefined) ? bselfShadows : true;
	this.selfShadows = ss;
	
	this.clglWork_nodes.setArg("selfShadows", ((this.selfShadows == true)?1.0:0.0));
	this.clglWork_links.setArg("selfShadows", ((this.selfShadows == true)?1.0:0.0));
};

/**
 * Set node draw mode
 * @param {Int} [drawElementsMode=4] 0=POINTS, 3=LINE_STRIP, 2=LINE_LOOP, 1=LINES, 5=TRIANGLE_STRIP, 6=TRIANGLE_FAN and 4=TRIANGLES
 */
StormGraph.prototype.setNodeDrawMode = function(drawElementsMode) {
	var drawMode = (drawElementsMode != undefined) ? drawElementsMode : 4;
	this.nodeDrawMode = drawMode;
};

/**
 * Set links draw mode
 * @param {Int} [drawElementsMode=1] 0=POINTS, 3=LINE_STRIP, 2=LINE_LOOP, 1=LINES, 5=TRIANGLE_STRIP, 6=TRIANGLE_FAN and 4=TRIANGLES
 */
StormGraph.prototype.setLinkDrawMode = function(drawElementsMode) {
	var drawMode = (drawElementsMode != undefined) ? drawElementsMode : 1;
	this.linkDrawMode = drawMode;
};

/**
 * Split nodes buffer every 
 * @param {Int} value
 */
StormGraph.prototype.setNodesSplitEvery = function(value) {
	this.splitNodesEvery = value;
};

/**
 * Split links buffer every
 * @param {Int} value
 */
StormGraph.prototype.setLinksSplitEvery = function(value) {
	this.splitLinksEvery = value;
};

/** @private **/
StormGraph.prototype.updateForcesAndPP = function(clglwork) {
	// POLARITY POINTS
	this.arrPP = [];
	for(var n = 0, f = this._sec.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = this._sec.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == this._sec.polarityPoints[n].nodesProc[nb].objectType && this.idNum == this._sec.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(this._sec.polarityPoints[n].getPosition());
				
				this.arrPP.push({"x": oper.e[0], "y": oper.e[1], "z": oper.e[2],
							"polarity": this._sec.polarityPoints[n].polarity,
							"orbit": this._sec.polarityPoints[n].orbit,
							"force": this._sec.polarityPoints[n].force});
			}
		}
	}
	// FORCES
	this.arrF = [];
	for(var n = 0, f = this._sec.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = this._sec.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == this._sec.forceFields[n].nodesProc[nb].objectType && this.idNum == this._sec.forceFields[n].nodesProc[nb].idNum) {
				var oper = this._sec.forceFields[n].direction;
				
				this.arrF.push({"x": oper.e[0], "y": oper.e[1], "z": oper.e[2]});
			}
		}
	}
	
	var kernel = clglwork.getKernel("dir");
	kernel.setKernelSource(this.source_direction());
	clglwork.addKernel(kernel, "dir");
	
	for(var n = 0, f = this.arrPP.length; n < f; n++) {
		clglwork.setArg('pole'+n+'X', this.arrPP[n].x);
		clglwork.setArg('pole'+n+'Y', this.arrPP[n].y); 
		clglwork.setArg('pole'+n+'Z', this.arrPP[n].z); 
		clglwork.setArg('pole'+n+'Polarity', this.arrPP[n].polarity); 
		clglwork.setArg('pole'+n+'Orbit', this.arrPP[n].orbit); 
		clglwork.setArg('pole'+n+'Force', this.arrPP[n].force); 
	}
	for(var n = 0, f = this.arrF.length; n < f; n++) {
		clglwork.setArg('force'+n+'X', this.arrF[n].x); 
		clglwork.setArg('force'+n+'Y', this.arrF[n].y); 
		clglwork.setArg('force'+n+'Z', this.arrF[n].z);
	}
};
/**
* Destination force
* @param	{Float} force
* @type Void
*/
StormGraph.prototype.set_destinationForce = function(value) { 
	this.destinationForce = value;
	this.clglWork_nodes.setArg("destinationForce", this.destinationForce);
	this.clglWork_links.setArg("destinationForce", this.destinationForce);
};
/**
* Disable destination
* @type Void
*/
StormGraph.prototype.set_disableDestination = function() { 	
	this.enDestination = 0;	
	this.clglWork_nodes.setArg("enableDestination", this.enDestination);
	this.clglWork_links.setArg("enableDestination", this.enDestination);
};
/**
* Enable destination
* @type Void
*/
StormGraph.prototype.set_enableDestination = function() { 	
	this.enDestination = 1;	
	this.clglWork_nodes.setArg("enableDestination", this.enDestination);
	this.clglWork_links.setArg("enableDestination", this.enDestination);
};
/**
* Life distance
* @param {Float} distance
* @type Void
*/
StormGraph.prototype.set_lifeDistance = function(value) { 
	this.lifeDistance = value;
	this.clglWork_nodes.setArg("lifeDistance", this.lifeDistance);
	this.clglWork_links.setArg("lifeDistance", this.lifeDistance);
};
/**
* Point size
* @param {Float} size
* @type Void
*/
StormGraph.prototype.set_pointSize = function(value) { 
	this.pointSize = value;
	this.clglWork_nodes.setArg("pointSize", this.pointSize);
	this.clglWork_links.setArg("pointSize", this.pointSize);
};
/**
* Polarity
* @param {Array<Float>} polarity
* @type Void
*/
StormGraph.prototype.set_polarity = function(arr) {
	this.arrayNodePolaritys = arr;
	this.arrayLinkPolaritys = arr;
	this.clglWork_nodes.setArg("particlePolarity", this.arrayNodePolaritys, this.splitNodes);
	this.clglWork_links.setArg("particlePolarity", this.arrayLinkPolaritys, this.splitLinks);
};

/**
* Set color
* @type Void
* @param {StormV3|HTMLImageElement} color Vector3 or HTMLImageElement
*/
StormGraph.prototype.set_color = function(color) {
	var arr;
	if(color != undefined && color instanceof HTMLImageElement) {
		arr = this._sec.utils.getUint8ArrayFromHTMLImageElement(color);
	} else if(color != undefined && color instanceof StormV3) {
		arr = new Uint8Array([color.e[0]*255, color.e[1]*255, color.e[2]*255, 255]);
	} else {
		arr = new Uint8Array([255, 255, 255, 255]);
	}
	
	this.arrayNodeVertexColor = []; 
	
	var currentNodeId = -1;
	var x = 0;
	var y = 0;
	var z = 0;
	for(var n = 0, f = this.arrayNodeId.length; n < f; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
			
			if(arr.length > 4) {
				x = parseFloat(arr[(currentNodeId*4)]/255);
				y = parseFloat(arr[(currentNodeId*4)+1]/255);
				z = parseFloat(arr[(currentNodeId*4)+2]/255);
				w = parseFloat(arr[(currentNodeId*4)+3]/255);
			} else {
				x = parseFloat(arr[0]/255);
				y = parseFloat(arr[1]/255);
				z = parseFloat(arr[2]/255);
				w = parseFloat(arr[3]/255);
			}
			
			this.arrayNodeVertexColor.push(x, y, z, w);
		} else {
			this.arrayNodeVertexColor.push(x, y, z, w);
		}
	}	
	
	this.clglWork_nodes.setArg("nodeVertexCol", this.arrayNodeVertexColor, this.splitNodes);
};

/**
* Set link color
* @type Void
* @param {StormV3|HTMLImageElement} color Vector3 or HTMLImageElement
*/
StormGraph.prototype.set_linkColor = function(color) {
	var arr;
	if(color != undefined && color instanceof HTMLImageElement) {
		arr = this._sec.utils.getUint8ArrayFromHTMLImageElement(color);
	} else if(color != undefined && color instanceof StormV3) {
		arr = new Uint8Array([color.e[0]*255, color.e[1]*255, color.e[2]*255, 255]);
	} else {
		arr = new Uint8Array([255, 255, 255, 255]);
	}
	
	this.arrayLinkVertexColor = []; 
	
	var currentLinkId = -1;
	var x = 0;
	var y = 0;
	var z = 0;
	for(var n = 0, f = this.arrayLinkId.length; n < f; n++) {
		if(currentLinkId != this.arrayLinkId[n]) {
			currentLinkId = this.arrayLinkId[n];
			
			if(arr.length > 4) {
				x = parseFloat(arr[(currentLinkId*4)]/255);
				y = parseFloat(arr[(currentLinkId*4)+1]/255);
				z = parseFloat(arr[(currentLinkId*4)+2]/255);
				w = parseFloat(arr[(currentLinkId*4)+3]/255);
			} else {
				x = parseFloat(arr[0]/255);
				y = parseFloat(arr[1]/255);
				z = parseFloat(arr[2]/255);
				w = parseFloat(arr[3]/255);
			}
			
			this.arrayLinkVertexColor.push(x, y, z, w);
		} else {
			this.arrayLinkVertexColor.push(x, y, z, w);
		}
	}	
	
	this.clglWork_links.setArg("nodeVertexCol", this.arrayLinkVertexColor, this.splitLinks);
};

/**
* Destination by array XYZ
* @type Void
* @param {Array<Float3>} arr 
* @param {Float} spacing
*/
StormGraph.prototype.set_destinationArray = function(arr, spacing) {
	this.set_enableDestination();
	this.set_destinationForce(0.1);
		
	this.arrayNodeDestination = [];	
	
	var currentNodeId = -1;
	var x = 0;
	var y = 0;
	var z = 0;
	var spac = (spacing != undefined) ? spacing : 0.01; 
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
		
			x = parseFloat(arr[(currentNodeId*3)]);
			y = parseFloat(arr[(currentNodeId*3)+1]);
			z = parseFloat(arr[(currentNodeId*3)+2]);
			
			this.arrayNodeDestination.push(x*spac, y*spac, z*spac, 255);	
		} else {
			this.arrayNodeDestination.push(x*spac, y*spac, z*spac, 255);
		}
	}
	this.clglWork_nodes.setArg("dest", this.arrayNodeDestination, this.splitNodes);
	
	this.setLinksDestinationToNodesDestination();	
};
/**
* Destination by width and height
* @param {Object} position For make a square or spherical disposal
* 	@param {Float} position.width width
* 	@param {Float} position.height height
* 	@param {Float} position.spacing Spacing
* @type Void
*/
StormGraph.prototype.set_destinationWidthHeight = function(jsonIn) {
	this.set_enableDestination();
	this.set_destinationForce(0.5);
		
	this.arrayNodeDestination = [];	
	
	var totalNodes = this.currentNodeId;
	var totalDestinations = jsonIn.width*jsonIn.height;
	var nodesPerCell = totalNodes/totalDestinations;
	var nodesInCell = 0;	
	var currentNodeId = -1;
	var x = 0;
	var z = 0;
	var spacing = (jsonIn.spacing != undefined) ? jsonIn.spacing : 0.01;
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
			
			if(nodesInCell >= nodesPerCell) {				
				x++;
				if(x > jsonIn.width-1) {
					x = 0;
					z++;
				}
				nodesInCell -= nodesPerCell;
			}
			nodesInCell += 1;
			
			this.arrayNodeDestination.push(x*spacing, 0, z*spacing, 255);			
		} else {
			this.arrayNodeDestination.push(x*spacing, 0, z*spacing, 255);
		}
	}
	this.clglWork_nodes.setArg("dest", this.arrayNodeDestination, this.splitNodes);
	
	this.setLinksDestinationToNodesDestination();	
};
/**
* Destination to voxel volume
* @param {StormVoxelizator} voxelizator
* @type Void
*/
StormGraph.prototype.set_destinationVolume = function(voxelizator) {
	this.set_enableDestination();
	this.set_destinationForce(0.5);
		
	this.arrayNodeDestination = [];	
	this.arrayNodeVertexColor = [];
	
	this.vo = voxelizator;
	if(this.vo instanceof StormVoxelizator == false) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	if(this.vo.image3D_VoxelsColor == undefined) { alert("You must select a voxelizator object with albedo fillmode enabled."); return false;}
	this.data = this.vo.clglBuff_VoxelsColor.items[0].inData;
	
	var numActCells = 0;
	for(var n = 0, f = this.data.length/4; n < f; n++) { // num of active cells
		var id = n*4;
		//if(data[id] > 30 && data[id+1] > 30 && data[id+2] > 30)
		if(this.data[id+3] > 0) {
			numActCells++;
		}
	}
	var totalNodes = this.currentNodeId-1;
	var nodesPerCell = totalNodes/numActCells;
	
	this.incremNodesCell = 0;	
	var currentNodeId = -1;
	
	this.currentVoxelCell;
	this.CCX=0,this.CCY=0,this.CCZ=0;
	this.CCXMAX=this.vo.resolution-1, this.CCYMAX=this.vo.resolution-1, this.CCZMAX=this.vo.resolution-1;
	var separation = 1.0;
	var p;
	var c;
	var make = false;
	
	var next = (function() {
		while(true) {
			if(this.CCX == this.CCXMAX && this.CCZ == this.CCZMAX && this.CCY == this.CCYMAX) {
				break;
			} else {
				if(this.CCX == this.CCXMAX && this.CCZ == this.CCZMAX) {
					this.CCX=0;this.CCZ=0;this.CCY++;
				} else {
					if(this.CCX == this.CCXMAX) {
						this.CCX=0;this.CCZ++;
					} else {
						this.CCX++;
					}
				}
			}
			
			this.currentVoxelCell = (this.CCY*(this.vo.resolution*this.vo.resolution)) + (this.CCZ*(this.vo.resolution)) + this.CCX;
			
			if(this.data[(this.currentVoxelCell*4)+3] > 0) {
				this.incremNodesCell += nodesPerCell;
				if(this.incremNodesCell >= 1.0) {
					this.incremNodesCell -= 1.0;
					break;
				}
			}
		}
	}).bind(this);
	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
								
			if(this.incremNodesCell >= 1.0) {
				this.incremNodesCell -= 1.0;
			} else {
				next();
			}
			
			// position
			p = $V3([0.0,0.0,0.0]).add($V3([-(this.vo.size/2.0), -(this.vo.size/2.0), -(this.vo.size/2.0)]));  
			p = p.add($V3([ this.vo.cs*this.CCX*separation, this.vo.cs*this.CCY*separation, this.vo.cs*(this.CCZMAX-this.CCZ)*separation ])); 
			p = p.add($V3([ this.vo.cs*Math.random(), this.vo.cs*Math.random(), this.vo.cs*Math.random() ]));
			
			// color
			c = $V3([ this.data[(this.currentVoxelCell*4)]/255, this.data[(this.currentVoxelCell*4)+1]/255, this.data[(this.currentVoxelCell*4)+2]/255 ]);
			
			this.arrayNodeDestination.push(p.e[0], p.e[1], p.e[2], 1.0);	
			this.arrayNodeVertexColor.push(c.e[0], c.e[1], c.e[2], 1.0);
		} else {
			this.arrayNodeDestination.push(p.e[0], p.e[1], p.e[2], 1.0);
			this.arrayNodeVertexColor.push(c.e[0], c.e[1], c.e[2], 1.0);
		}
	}
	this.clglWork_nodes.setArg("dest", this.arrayNodeDestination, this.splitNodes);
	this.clglWork_nodes.setArg("nodeVertexCol", this.arrayNodeVertexColor, this.splitNodes);
	
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
		var nodeNameItemStart = this._nodesByName[currentLinkNodeName].itemStart;
		
		this.arrayLinkDestination.push(this.arrayNodeDestination[(nodeNameItemStart*4)],
										this.arrayNodeDestination[(nodeNameItemStart*4)+1],
										this.arrayNodeDestination[(nodeNameItemStart*4)+2],
										1.0);
	}
	this.clglWork_links.setArg("dest", this.arrayLinkDestination, this.splitLinks);
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
	this.clglWork_nodes.setArg("dir", this.arrayNodeDir, this.splitNodes);
	
	this.setLinksDirToNodesDir();
};
/**
* Set Direction of links to actual direction of nodes
* @type Void
*/
StormGraph.prototype.setLinksDirToNodesDir = function() {
	this.arrayLinkDir = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		var currentLinkNodeName = this.arrayLinkNodeName[n];		
		var nodeNameItemStart = this._nodesByName[currentLinkNodeName].itemStart;
		
		this.arrayLinkDir.push(this.arrayNodeDir[(nodeNameItemStart*4)],
								this.arrayNodeDir[(nodeNameItemStart*4)+1],
								this.arrayNodeDir[(nodeNameItemStart*4)+2],
								1.0);
	}
	this.clglWork_links.setArg("dir", this.arrayLinkDir, this.splitLinks);
};
/**
* Set position
* @type Void
* @param {Array<StormV3>} position For make through a Array
* @param {Object} position For make a square or spherical disposal
* 	@param {Float} position.width Width
* 	@param {Float} position.height Height
* 	@param {Float} position.spacing Spacing
* 	@param {Float} [position.radius=0.5] Radius for type spherical (Anule width/height)
*/
StormGraph.prototype.set_pos = function(jsonIn) { 	
	this.arrayNodePosXYZW = []; 
	var currentNodeId = -1;
	var currentNodePos;
	
	var h = 0, hP = 0, vP = 0;	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		if(currentNodeId != this.arrayNodeId[n]) {
			currentNodeId = this.arrayNodeId[n];
			
			if(jsonIn != undefined && jsonIn.constructor === Array) {			
				var v = this.getPosition().add(jsonIn[n]);
				
				currentNodePos = [v.e[0], v.e[1], v.e[2], 0.0];
				
			} else if(jsonIn == undefined || jsonIn.radius != undefined) {
				var rad = (jsonIn == undefined) ? 1.0 : jsonIn.radius;
				var currAngleH = Math.random()*360.0;
				var currAngleV = Math.random()*180.0;
				var v = $V3([	cos(currAngleH) * Math.abs(sin(currAngleV)) * rad,  
								cos(currAngleV) * rad * Math.random(),
								sin(currAngleH) * Math.abs(sin(currAngleV)) * rad]);
								
				v = this.getPosition().add(v);
				
				currentNodePos = [v.e[0], v.e[1], v.e[2], 0.0];
				
			} else if(jsonIn.width != undefined) {
				var spac = (jsonIn.spacing != undefined) ? jsonIn.spacing : 0.01; 
				var oper = this.MPOS.x($V3([hP,0.0,vP]));
				
				currentNodePos = [oper.e[3], oper.e[7], oper.e[11], 0.0];
				
				h++;
				hP+=spac;
				if(h > jsonIn.width-1) {h=0;hP=0;vP+=spac;}
			}
			
			
			this.arrayNodePosXYZW.push(currentNodePos[0], currentNodePos[1], currentNodePos[2], currentNodePos[3]);
		} else {
			this.arrayNodePosXYZW.push(currentNodePos[0], currentNodePos[1], currentNodePos[2], currentNodePos[3]);
		}
	}
	
	this.clglWork_nodes.setArg("posXYZW", this.arrayNodePosXYZW, this.splitNodes);
	
	this.setLinksPosToNodesPos();
};
/**
 * setLinksPosToNodesPos
 */
StormGraph.prototype.setLinksPosToNodesPos = function() {
	this.arrayLinkPos = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		var currentLinkNodeName = this.arrayLinkNodeName[n];		
		var nodeNameItemStart = this._nodesByName[currentLinkNodeName].itemStart;
		
		this.arrayLinkPos.push(this.arrayNodePosXYZW[(nodeNameItemStart*4)],
								this.arrayNodePosXYZW[(nodeNameItemStart*4)+1],
								this.arrayNodePosXYZW[(nodeNameItemStart*4)+2],
								1.0);
	}
	this.clglWork_links.setArg("posXYZW", this.arrayLinkPos, this.splitLinks);
};