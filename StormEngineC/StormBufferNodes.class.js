/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
StormBufferNodes = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'buffernodes';

	this.gl = stormEngineC.stormGLContext.gl;
	this.webCLGL = stormEngineC.clglBufferNodes;
	
	this.workAreaSize = (jsonIn != undefined && jsonIn.workAreaSize != undefined) ? jsonIn.workAreaSize : 100.0;
	
	this.enDestination = 0;
	this.destinationForce = 1.0;
	this.enableDrag = 0.0;
	this.idToDrag = 0.0;
	this.MouseDragTranslationX = 0.0;
	this.MouseDragTranslationY = 0.0;
	this.MouseDragTranslationZ = 0.0;
	
	//*******************************************************************************************************************
	// NODES
	//*******************************************************************************************************************
	// NODES POSITION KERNEL
	var kernelPos_Source = 'void main(	float4* posXYZW,'+
										'float4* dir) {'+
									'vec2 x = get_global_id();'+
									'vec3 currentPos = posXYZW[x].xyz;\n'+ 
									'vec4 dir = dir[x];'+
									'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
									'vec3 newPos = (currentPos+currentDir);\n'+
									
									'out_float4 = vec4(newPos, 1.0);\n'+ 
							'}';
	this.kernelNodePos = this.webCLGL.createKernel();
	this.kernelNodePos.setKernelSource(kernelPos_Source);
	
	// NODES DIRECTION KERNEL
	this.kernelNodeDir = this.webCLGL.createKernel(); 
	this.kernelNodeDir.setKernelSource(this.generatekernelDir_Source());
	
	// NODES VERTEX AND FRAGMENT PROGRAMS 
	var vfNode_vertexSource = 'void main(float* nodeId,'+
										'float4*kernel nodePos,'+
										'float4* nodeVertexPos,'+
										'float4* nodeVertexCol,'+
										'mat4 PMatrix,'+
										'mat4 cameraWMatrix,'+
										'mat4 nodeWMatrix,'+
										'float workAreaSize,'+
										'float nodesSize) {'+
									'vec2 x = get_global_id();'+
									'float nodeIdx = nodeId[x];\n'+  
									'vec4 nodePosition = nodePos[x];\n'+
									'vec4 nodeVertexPosition = nodeVertexPos[x];\n'+
									'vec4 nodeVertexColor = nodeVertexCol[x];\n'+
									
									
									'mat4 nodepos = nodeWMatrix;'+
									'nodepos[3][0] = nodePosition.x;'+
									'nodepos[3][1] = nodePosition.y;'+
									'nodepos[3][2] = nodePosition.z;'+
									'gl_Position = PMatrix * cameraWMatrix * nodepos * nodeVertexPosition;\n'+
							'}';
	var vfNode_fragmentSource = 'void main(	float nodesSize) {'+
										'vec2 x = get_global_id();'+
										
										'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
									'}';
	this.vfNode = this.webCLGL.createVertexFragmentProgram();
	this.vfNode.setVertexSource(vfNode_vertexSource);
	this.vfNode.setFragmentSource(vfNode_fragmentSource);
	
	
	// default mesh to use
	var meshNode = new StormNode();
	meshNode.loadBox();
	
	this.currentNodeId = 0;	
	this.nodeArrayItemStart = 0;
	
	///////////////////////////////////////
	// NodeId
	///////////////////////////////////////
	this.arrayNodeId = [];
	
	this.CLGL_bufferNodeId;
	this.CLGL_bufferNodeId_TEMP;
	
	///////////////////////////////////////
	// NodePos
	///////////////////////////////////////
	this.arrayNodePosXYZW = [];
	this.arrayNodePosX = [];
	this.arrayNodePosY = [];
	this.arrayNodePosZ = [];
	
	this.CLGL_bufferNodePosXYZW;
	this.CLGL_bufferNodePosXYZW_TEMP;
	
	this.GL_bufferNodePosX;
	this.GL_bufferNodePosY;
	this.GL_bufferNodePosZ;
	
	///////////////////////////////////////
	// NodeVertexPos
	///////////////////////////////////////
	this.arrayNodeVertexPos = [];
	
	this.GL_bufferNodeVertexPos;
	
	///////////////////////////////////////
	// NodeVertexColor
	///////////////////////////////////////
	this.arrayNodeVertexColor = [];
	
	this.GL_bufferNodeVertexColor;
	
	///////////////////////////////////////
	// NodeIndices
	///////////////////////////////////////
	this.startIndexId = 0;
	this.arrayNodeIndices = [];
	
	this.GL_bufferNodeIndices;
	
	///////////////////////////////////////
	// NodeDir
	///////////////////////////////////////
	this.arrayNodeDir = [];
	
	this.CLGL_bufferNodeDir;
	this.CLGL_bufferNodeDir_TEMP;
	
	///////////////////////////////////////
	// NodePolaritys
	///////////////////////////////////////
	this.arrayNodePolaritys = [];
	
	this.CLGL_bufferNodePolaritys;
	
	///////////////////////////////////////
	// NodeDestination
	///////////////////////////////////////
	this.arrayNodeDestination = [];
	
	this.CLGL_bufferNodeDestination;
	
	//*******************************************************************************************************************
	// LINKS
	//*******************************************************************************************************************
	//POS
	var kernelPos_Source = 'void main(	float4* posXYZW,'+
										'float4* dir) {'+
									'vec2 x = get_global_id();'+
									'vec3 currentPos = posXYZW[x].xyz;\n'+ 
									'vec4 dir = dir[x];'+
									'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
									'vec3 newPos = (currentPos+currentDir);\n'+
	
									'out_float4 = vec4(newPos, 1.0);\n'+ 
								'}';
	this.kernelLinkPos = this.webCLGL.createKernel();
	this.kernelLinkPos.setKernelSource(kernelPos_Source);
	
	this.kernelLinkDir = this.webCLGL.createKernel(); 
	this.kernelLinkDir.setKernelSource(this.generatekernelDir_Source());
	
	
	this.currentLinkId = 0;
	
	///////////////////////////////////////
	// LinkId
	///////////////////////////////////////
	this.arrayLinkId = [];
	
	this.CLGL_bufferLinkId;
	
	///////////////////////////////////////
	// LinkNodeId
	///////////////////////////////////////
	this.arrayLinkNodeId = [];
	
	this.CLGL_bufferLinkNodeId;
	
	///////////////////////////////////////
	// LinkPos
	///////////////////////////////////////
	this.arrayLinkPosXYZW = [];
	this.arrayLinkPosX = [];
	this.arrayLinkPosY = [];
	this.arrayLinkPosZ = [];
	
	this.CLGL_bufferLinkPosXYZW;
	this.CLGL_bufferLinkPosXYZW_TEMP;
	
	this.GL_bufferLinkPosX;
	this.GL_bufferLinkPosY;
	this.GL_bufferLinkPosZ;
	
	///////////////////////////////////////
	// LinkDir
	///////////////////////////////////////
	this.arrayLinkDir = [];
	
	this.CLGL_bufferLinkDir;
	this.CLGL_bufferLinkDir_TEMP; 
	
	///////////////////////////////////////
	// LinkPolaritys
	///////////////////////////////////////
	this.arrayLinkPolaritys = [];
	
	this.CLGL_bufferLinkPolaritys;
	
	///////////////////////////////////////
	// LinkDestination
	///////////////////////////////////////
	this.arrayLinkDestination = [];
	
	this.CLGL_bufferLinkDestination;
};
StormBufferNodes.prototype = Object.create(StormNode.prototype);

/**
* @private 
*/
StormBufferNodes.prototype.generatekernelDir_Source = function() { 
	lines_argumentsPoles = (function() {
		var str = '';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
					str += ',float pole'+currentPP+'X'+
							',float pole'+currentPP+'Y'+
							',float pole'+currentPP+'Z'+
							',float pole'+currentPP+'Polarity'+
							',float pole'+currentPP+'Orbit'+
							',float pole'+currentPP+'Force';
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	lines_argumentsForces = (function() {
		var str = '';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.forceFields[n].nodesProc[nb].objectType && this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
					str += ',float force'+currentPP+'X'+
							',float force'+currentPP+'Y'+
							',float force'+currentPP+'Z';
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	
	lines_poles = (function() {
		var str = 'float workAreaSize;vec3 polePos;float toDir; vec3 cc;float distanceToPole;\n';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
					str += 'polePos = vec3(pole'+currentPP+'X,pole'+currentPP+'Y,pole'+currentPP+'Z);\n'+ 
							'toDir = 1.0;\n'+  
							'if(sign(particlePolarity[x]) == 0.0 && sign(pole'+currentPP+'Polarity) == 1.0) toDir = -1.0;\n'+
							'if(sign(particlePolarity[x]) == 1.0 && sign(pole'+currentPP+'Polarity) == 0.0) toDir = -1.0;\n'+
							'workAreaSize = '+stormEngineC.polarityPoints[n].nodesProc[nb].workAreaSize.toFixed(20)+';'+
							'distanceToPole = distance(currentPos,polePos);'+
							
								//'cc = normalize(currentPos-polePos)*( abs(distanceToPole)*1.0 )*toDir;\n'+
							
							//'if(pole'+n+'Orbit == 0.0)'+			
							'cc = normalize(polePos-currentPos)*( abs(distanceToPole)*0.1*(pole'+currentPP+'Force) )*toDir*-1.0;\n'+	
							'cc += normalize(polePos-currentPos)*( abs(workAreaSize-distanceToPole)*0.1*(1.0-pole'+currentPP+'Force) )*toDir;\n'+
							
							'if(pole'+currentPP+'Orbit == 1.0) cc = normalize(polePos-currentPos)*( abs(workAreaSize-distanceToPole)*0.1*(pole'+currentPP+'Force) )*toDir*-1.0;\n'+
							//'else if(pole'+n+'Atraction == 1.0) cc = normalize(polePos-currentPos)*( abs(distanceToPole)*0.1*(pole'+n+'Force) )*toDir*-1.0;\n'+	
							
							'currentDir = (currentDir)+(cc);\n';
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	lines_forces = (function() {
		var str = 'vec3 force;\n';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
				if(this.objectType == stormEngineC.forceFields[n].nodesProc[nb].objectType && this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
					str += 'force = vec3(force'+currentPP+'X,force'+currentPP+'Y,force'+currentPP+'Z);\n'+ 
							'currentDir = currentDir+(force*0.0001);\n';   
					currentPP++;
				}
			}
		} 
		return str;
	}).bind(this);
	var kernelDir_Source =	'void main(	float* idx'+
										',float* nodeid'+
										',float4* posXYZW'+
										',float4* dir'+
										',float* particlePolarity'+
										',float4* dest'+
										',float enableDestination'+
										',float destinationForce'+
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
								'float nodeidBN = nodeid[x];'+	
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
								
								'currentDir = currentDir*0.8;'+ // air resistence
								
								
								
								'vec3 newDir = currentDir;\n'+
	
								'out_float4 = vec4(newDir,1.0);\n'+
							'}';
	return kernelDir_Source;
};










//**********************************************************************************************************************************
//**********************************************************************************************************************************
//										NODES
//**********************************************************************************************************************************
//**********************************************************************************************************************************
/**
* Create new node for the graph
* @param	{Object} jsonIn
* 	@param {StormV3} jsonIn.position Position of node
* 	@param {StormNode} jsonIn.node Node with the mesh for the node
* 	@param {StormV3} jsonIn.color Color of the node (values from 0.0 to 1.0)
 * @returns {Int}
 */
StormBufferNodes.prototype.addNode = function(jsonIn) { 
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
			
			///////////////////////////////////////
			// NodeId
			///////////////////////////////////////
			this.arrayNodeId.push(this.currentNodeId);
			
			///////////////////////////////////////
			// NodePos
			///////////////////////////////////////
			this.arrayNodePosXYZW.push(nodePosX, nodePosY, nodePosZ, 1.0);
			this.arrayNodePosX.push(nodePosX);
			this.arrayNodePosY.push(nodePosY);
			this.arrayNodePosZ.push(nodePosZ);
			
			///////////////////////////////////////
			// NodeVertexPos
			///////////////////////////////////////
			this.arrayNodeVertexPos.push(bo.nodeMeshVertexArray[idxVertex], bo.nodeMeshVertexArray[idxVertex+1], bo.nodeMeshVertexArray[idxVertex+2], 1.0);
			//console.log(bo.nodeMeshVertexArray[idxVertex]);
			
			///////////////////////////////////////
			// NodeVertexColor
			///////////////////////////////////////
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
			
			///////////////////////////////////////
			// NodeIndices
			///////////////////////////////////////
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
/** @private **/
StormBufferNodes.prototype.updateNodes = function() {
	this.writeNodeId();
	this.writeNodePos();
	this.writeNodeVertexPos();
	this.writeNodeVertexColor();
	this.writeNodeIndices();
	
	this.writeNodeDir();
	this.writeNodePolaritys();
	this.writeNodeDestination();
	
	this.updatekernelNodesPos_Arguments();
	this.updatekernelNodesDir_Arguments();
};

/** @private **/
StormBufferNodes.prototype.writeNodeId = function() {	
	// VERTEX AND FRAGMENT | FLOAT
	// CLGL buffers
	if(this.CLGL_bufferNodeId != undefined) {
		this.CLGL_bufferNodeId.remove();
		this.CLGL_bufferNodeId_TEMP.remove();
	}
	this.CLGL_bufferNodeId = this.webCLGL.createBuffer(this.arrayNodeId.length, "FLOAT", this.workAreaSize);
	this.CLGL_bufferNodeId_TEMP = this.webCLGL.createBuffer(this.arrayNodeId.length, "FLOAT", this.workAreaSize);
	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeId, this.arrayNodeId);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeId_TEMP, this.arrayNodeId);
	
	// GL buffers
	if(this.GL_bufferNodeId != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeId);
	}
	this.GL_bufferNodeId = this.gl.createBuffer();
	
	this.enqueueWriteVertexBuffer(this.GL_bufferNodeId, this.arrayNodeId, false, "FLOAT", "ARRAY_BUFFER");
};
/** @private **/
StormBufferNodes.prototype.writeNodePos = function() {	
	// VERTEX FROM FRAGMENT | VECTOR4
	// CLGL buffers
	if(this.CLGL_bufferNodePosXYZW != undefined) { 
		this.CLGL_bufferNodePosXYZW.remove();
		this.CLGL_bufferNodePosXYZW_TEMP.remove();
	}
	this.CLGL_bufferNodePosXYZW = this.webCLGL.createBuffer(this.arrayNodePosXYZW.length/4, "FLOAT4", this.workAreaSize);
	this.CLGL_bufferNodePosXYZW_TEMP = this.webCLGL.createBuffer(this.arrayNodePosXYZW.length/4, "FLOAT4", this.workAreaSize);
	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodePosXYZW, this.arrayNodePosXYZW);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodePosXYZW_TEMP, this.arrayNodePosXYZW);
	
	// GL buffers
	if(this.GL_bufferNodePosX != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodePosX);
		this.gl.deleteBuffer(this.GL_bufferNodePosY);
		this.gl.deleteBuffer(this.GL_bufferNodePosZ);
	}
	this.GL_bufferNodePosX = this.gl.createBuffer();
	this.GL_bufferNodePosY = this.gl.createBuffer();
	this.GL_bufferNodePosZ = this.gl.createBuffer();
	
	this.enqueueWriteVertexBuffer(this.GL_bufferNodePosX, this.arrayNodePosX, true, "UINT", "ARRAY_BUFFER");
	this.enqueueWriteVertexBuffer(this.GL_bufferNodePosY, this.arrayNodePosY, true, "UINT", "ARRAY_BUFFER");
	this.enqueueWriteVertexBuffer(this.GL_bufferNodePosZ, this.arrayNodePosZ, true, "UINT", "ARRAY_BUFFER");
};
/** @private **/
StormBufferNodes.prototype.writeNodeVertexPos = function() {
	// VERTEX | VECTOR4
	// GL buffers
	if(this.GL_bufferNodeVertexPos != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeVertexPos);
	}
	this.GL_bufferNodeVertexPos = this.gl.createBuffer();
	
	this.enqueueWriteVertexBuffer(this.GL_bufferNodeVertexPos, this.arrayNodeVertexPos, false, "FLOAT", "ARRAY_BUFFER");
};
/** @private **/
StormBufferNodes.prototype.writeNodeVertexColor = function() {	
	// VERTEX | VECTOR4
	// GL buffers
	if(this.GL_bufferNodeVertexColor != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeVertexColor);
	}
	this.GL_bufferNodeVertexColor = this.gl.createBuffer();
	
	this.enqueueWriteVertexBuffer(this.GL_bufferNodeVertexColor, this.arrayNodeVertexColor, false, "FLOAT", "ARRAY_BUFFER");
};
/** @private **/
StormBufferNodes.prototype.writeNodeIndices = function() {	
	// VERTEX_INDICES | FLOAT
	// GL buffers
	if(this.GL_bufferNodeIndices != undefined) {
		this.gl.deleteBuffer(this.GL_bufferNodeIndices);
	}
	this.GL_bufferNodeIndices = this.gl.createBuffer();
	
	this.enqueueWriteVertexBuffer(this.GL_bufferNodeIndices, this.arrayNodeIndices, false, "FLOAT", "ELEMENT_ARRAY_BUFFER");
};
/** @private **/
StormBufferNodes.prototype.writeNodeDir = function() {	
	this.arrayNodeDir = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDir.push(0, 0, 0, 255);
	}
		
	// FRAGMENT | VECTOR4
	// CLGL buffers
	if(this.CLGL_bufferNodeDir != undefined) {
		this.CLGL_bufferNodeDir.remove();
		this.CLGL_bufferNodeDir_TEMP.remove();
	}
	this.CLGL_bufferNodeDir = this.webCLGL.createBuffer(this.arrayNodeDir.length/4, "FLOAT4", this.workAreaSize);
	this.CLGL_bufferNodeDir_TEMP = this.webCLGL.createBuffer(this.arrayNodeDir.length/4, "FLOAT4", this.workAreaSize);
	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeDir, this.arrayNodeDir);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeDir_TEMP, this.arrayNodeDir);
};
/** @private **/
StormBufferNodes.prototype.writeNodePolaritys = function() {	
	this.arrayNodePolaritys = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodePolaritys.push(0);
	}
		
	// FRAGMENT | FLOAT
	// CLGL buffers
	if(this.CLGL_bufferNodePolaritys != undefined) {
		this.CLGL_bufferNodePolaritys.remove();
	}
	this.CLGL_bufferNodePolaritys = this.webCLGL.createBuffer(this.arrayNodePolaritys.length, "FLOAT", this.workAreaSize);
	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodePolaritys, this.arrayNodePolaritys);
};
/** @private **/
StormBufferNodes.prototype.writeNodeDestination = function() {	
	this.arrayNodeDestination = [];	
	for(var n=0; n < this.arrayNodeId.length; n++) {
		this.arrayNodeDestination.push(0, 0, 0, 255);
	}
	
	// FRAGMENT | VECTOR4
	// CLGL buffers
	if(this.CLGL_bufferNodeDestination != undefined) {
		this.CLGL_bufferNodeDestination.remove();
	}
	this.CLGL_bufferNodeDestination = this.webCLGL.createBuffer(this.arrayNodeDestination.length/4, "FLOAT4", this.workAreaSize); 
		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeDestination, this.arrayNodeDestination);
};

/** @private **/
StormBufferNodes.prototype.updatekernelNodesPos_Arguments = function() {
	this.kernelNodePos.setKernelArg("posXYZW", this.CLGL_bufferNodePosXYZW);
	this.kernelNodePos.setKernelArg("dir", this.CLGL_bufferNodeDir);
};
/** @private **/
StormBufferNodes.prototype.updatekernelNodesDir_Arguments = function() {
	this.kernelNodeDir.setKernelArg("idx", this.CLGL_bufferNodeId); 
	this.kernelNodeDir.setKernelArg("nodeid", this.CLGL_bufferNodeId); 
	this.kernelNodeDir.setKernelArg("posXYZW", this.CLGL_bufferNodePosXYZW);
	this.kernelNodeDir.setKernelArg("dir", this.CLGL_bufferNodeDir); 
	this.kernelNodeDir.setKernelArg("particlePolarity", this.CLGL_bufferNodePolaritys); 
	this.kernelNodeDir.setKernelArg("dest", this.CLGL_bufferNodeDestination); 
	this.kernelNodeDir.setKernelArg("enableDestination", this.enDestination); 
	this.kernelNodeDir.setKernelArg("destinationForce", this.destinationForce); 
	this.kernelNodeDir.setKernelArg("enableDrag", this.enableDrag); 
	this.kernelNodeDir.setKernelArg("idToDrag", this.idToDrag); 
	this.kernelNodeDir.setKernelArg("MouseDragTranslationX", this.MouseDragTranslationX); 
	this.kernelNodeDir.setKernelArg("MouseDragTranslationY", this.MouseDragTranslationY); 
	this.kernelNodeDir.setKernelArg("MouseDragTranslationZ", this.MouseDragTranslationZ); 
	this.kernelNodeDir.setKernelArg("islink", 0);  // islink
	
	var currentPP = 0;
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'X', oper.e[3]); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Y', oper.e[7]); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Z', oper.e[11]); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Polarity', stormEngineC.polarityPoints[n].polarity); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Orbit', stormEngineC.polarityPoints[n].orbit); 
				this.kernelNodeDir.setKernelArg('pole'+currentPP+'Force', stormEngineC.polarityPoints[n].force); 
				
				currentPP++;
			}
		}
	}	
	
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				this.kernelNodeDir.setKernelArg('force'+n+'X', oper.e[0]); 
				this.kernelNodeDir.setKernelArg('force'+n+'Y', oper.e[1]); 
				this.kernelNodeDir.setKernelArg('force'+n+'Z', oper.e[2]); 
			}
		}
	}	
};









//**********************************************************************************************************************************
//**********************************************************************************************************************************
//										LINKS
//**********************************************************************************************************************************
//**********************************************************************************************************************************
/**
* Create new link for the graph
* @param	{Object} jsonIn
* 	@param {Int} jsonIn.origin Origin for this link (nodeArrayItemStart)
* 	@param {Int} jsonIn.target Target for this link (nodeArrayItemStart)
 * @returns {Int}
 */
StormBufferNodes.prototype.addLink = function(jsonIn) { 
	//*******************************************************************************************************************
	// FILL ARRAYS
	//*******************************************************************************************************************
		//console.log(jsonIn.origin);
		//console.log(jsonIn.target);
	var arr4Uint8_XYZW = this.webCLGL.enqueueReadBuffer_Float4(this.CLGL_bufferNodePosXYZW);
		

		//console.log(arr4Uint8_X);
		//console.log(arr4Uint8_Y);
		//console.log(arr4Uint8_Z); 
	
	///////////////////////////////////////
	// LinkId (origin)
	///////////////////////////////////////
	this.arrayLinkId.push(this.currentLinkId);
	
	///////////////////////////////////////
	// LinkNodeId (origin)
	///////////////////////////////////////
	this.arrayLinkNodeId.push(jsonIn.origin_nodeId);
	
	///////////////////////////////////////
	// LinkPos (origin)
	///////////////////////////////////////
	this.arrayLinkPosXYZW.push(arr4Uint8_XYZW[0][jsonIn.origin_itemStart], arr4Uint8_XYZW[1][jsonIn.origin_itemStart], arr4Uint8_XYZW[2][jsonIn.origin_itemStart], 1.0);
	this.arrayLinkPosX.push(arr4Uint8_XYZW[0][jsonIn.origin_itemStart]);			
	this.arrayLinkPosY.push(arr4Uint8_XYZW[1][jsonIn.origin_itemStart]);
	this.arrayLinkPosZ.push(arr4Uint8_XYZW[2][jsonIn.origin_itemStart]);
	
	
	
	///////////////////////////////////////
	// LinkId (target)
	///////////////////////////////////////
	this.arrayLinkId.push(this.currentLinkId+1);
	
	///////////////////////////////////////
	// LinkNodeId (target)
	///////////////////////////////////////
	this.arrayLinkNodeId.push(jsonIn.target_nodeId);
	
	///////////////////////////////////////
	// LinkPos (target)
	///////////////////////////////////////
	this.arrayLinkPosXYZW.push(arr4Uint8_XYZW[0][jsonIn.target_itemStart], arr4Uint8_XYZW[1][jsonIn.target_itemStart], arr4Uint8_XYZW[2][jsonIn.target_itemStart], 1.0);	
	this.arrayLinkPosX.push(arr4Uint8_XYZW[0][jsonIn.target_itemStart]);			
	this.arrayLinkPosY.push(arr4Uint8_XYZW[1][jsonIn.target_itemStart]);
	this.arrayLinkPosZ.push(arr4Uint8_XYZW[2][jsonIn.target_itemStart]);
	
	
	this.currentLinkId += 2; // augment link id
	
	return this.currentLinkId-2;
};
/** @private **/
StormBufferNodes.prototype.updateLinks = function() {
	this.writeLinkId();
	this.writeLinkNodeId();
	this.writeLinkPos();
	
	this.writeLinkDir();
	this.writeLinkPolaritys();
	this.writeLinkDestination();
	
	this.updatekernelLinksPos_Arguments();
	this.updatekernelLinksDir_Arguments();
};

/** @private **/
StormBufferNodes.prototype.writeLinkId = function() {	
	// CLGL buffers
	if(this.CLGL_bufferLinkId != undefined) {
		this.CLGL_bufferLinkId.remove();
		this.CLGL_bufferLinkId_TEMP.remove();
	}
	this.CLGL_bufferLinkId = this.webCLGL.createBuffer(this.arrayLinkId.length, "FLOAT", this.workAreaSize);
	this.CLGL_bufferLinkId_TEMP = this.webCLGL.createBuffer(this.arrayLinkId.length, "FLOAT", this.workAreaSize);
		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkId, this.arrayLinkId);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkId_TEMP, this.arrayLinkId);
};
/** @private **/
StormBufferNodes.prototype.writeLinkNodeId = function() {	
	// CLGL buffers
	if(this.CLGL_bufferLinkNodeId  != undefined) {
		this.CLGL_bufferLinkNodeId.remove();
		this.CLGL_bufferLinkNodeId_TEMP.remove();
	}
	this.CLGL_bufferLinkNodeId = this.webCLGL.createBuffer(this.arrayLinkNodeId.length, "FLOAT", this.workAreaSize);
	this.CLGL_bufferLinkNodeId_TEMP = this.webCLGL.createBuffer(this.arrayLinkNodeId.length, "FLOAT", this.workAreaSize);
		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkNodeId, this.arrayLinkNodeId);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkNodeId_TEMP, this.arrayLinkNodeId);
};
/** @private **/
StormBufferNodes.prototype.writeLinkPos = function() {	
	// CLGL buffers
	if(this.CLGL_bufferLinkPosXYZW  != undefined) {
		this.CLGL_bufferLinkPosXYZW.remove();
		this.CLGL_bufferLinkPosXYZW_TEMP.remove();
	}
	this.CLGL_bufferLinkPosXYZW = this.webCLGL.createBuffer(this.arrayLinkPosXYZW.length/4, "FLOAT4", this.workAreaSize);
	this.CLGL_bufferLinkPosXYZW_TEMP = this.webCLGL.createBuffer(this.arrayLinkPosXYZW.length/4, "FLOAT4", this.workAreaSize);
	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkPosXYZW, this.arrayLinkPosXYZW);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkPosXYZW_TEMP, this.arrayLinkPosXYZW);
	
	// GL buffers
	if(this.GL_bufferLinkPosX  != undefined) {
		this.gl.deleteBuffer(this.GL_bufferLinkPosX);
		this.gl.deleteBuffer(this.GL_bufferLinkPosY);
		this.gl.deleteBuffer(this.GL_bufferLinkPosZ);
	}
	this.GL_bufferLinkPosX = this.gl.createBuffer();
	this.GL_bufferLinkPosY = this.gl.createBuffer();
	this.GL_bufferLinkPosZ = this.gl.createBuffer();
	
	this.enqueueWriteVertexBuffer(this.GL_bufferLinkPosX, this.arrayLinkPosX, true, "UINT", "ARRAY_BUFFER");
	this.enqueueWriteVertexBuffer(this.GL_bufferLinkPosY, this.arrayLinkPosY, true, "UINT", "ARRAY_BUFFER");
	this.enqueueWriteVertexBuffer(this.GL_bufferLinkPosZ, this.arrayLinkPosZ, true, "UINT", "ARRAY_BUFFER");
};
/** @private **/
StormBufferNodes.prototype.writeLinkDir = function() {	
	this.arrayLinkDir = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDir.push(0, 0, 0, 255);
	}
		
	// CLGL buffers
	if(this.CLGL_bufferLinkDir  != undefined) {
		this.CLGL_bufferLinkDir.remove();
		this.CLGL_bufferLinkDir_TEMP.remove();
	}
	this.CLGL_bufferLinkDir = this.webCLGL.createBuffer(this.arrayLinkDir.length/4, "FLOAT4", this.workAreaSize);
	this.CLGL_bufferLinkDir_TEMP = this.webCLGL.createBuffer(this.arrayLinkDir.length/4, "FLOAT4", this.workAreaSize);
		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkDir, this.arrayLinkDir);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkDir_TEMP, this.arrayLinkDir);
};
/** @private **/
StormBufferNodes.prototype.writeLinkPolaritys = function() {	
	this.arrayLinkPolaritys = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkPolaritys.push(0);
	}
		
	// CLGL buffers
	if(this.CLGL_bufferLinkPolaritys  != undefined) {
		this.CLGL_bufferLinkPolaritys.remove();
	}
	this.CLGL_bufferLinkPolaritys = this.webCLGL.createBuffer(this.arrayLinkPolaritys.length, "FLOAT", this.workAreaSize);
		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkPolaritys, this.arrayLinkPolaritys);
};
/** @private **/
StormBufferNodes.prototype.writeLinkDestination = function() {	
	this.arrayLinkDestination = [];	
	for(var n=0; n < this.arrayLinkId.length; n++) {
		this.arrayLinkDestination.push(0, 0, 0, 255);  
	}
		
	// CLGL buffers
	if(this.CLGL_bufferLinkDestination  != undefined) {
		this.CLGL_bufferLinkDestination.remove();
	}
	this.CLGL_bufferLinkDestination = this.webCLGL.createBuffer(this.arrayLinkDestination.length/4, "FLOAT4", this.workAreaSize);
		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferLinkDestination, this.arrayLinkDestination);
};

/** @private **/
StormBufferNodes.prototype.updatekernelLinksPos_Arguments = function() {
	this.kernelLinkPos.setKernelArg("posXYZW", this.CLGL_bufferLinkPosXYZW);
	this.kernelLinkPos.setKernelArg("dir", this.CLGL_bufferLinkDir);
};
/** @private **/
StormBufferNodes.prototype.updatekernelLinksDir_Arguments = function() {
	this.kernelLinkDir.setKernelArg("idx", this.CLGL_bufferLinkId); 
	this.kernelLinkDir.setKernelArg("nodeid", this.CLGL_bufferLinkNodeId); 
	this.kernelLinkDir.setKernelArg("posXYZW", this.CLGL_bufferLinkPosXYZW); 
	this.kernelLinkDir.setKernelArg("dir", this.CLGL_bufferLinkDir); 
	this.kernelLinkDir.setKernelArg("particlePolarity", this.CLGL_bufferLinkPolaritys); 
	this.kernelLinkDir.setKernelArg("dest", this.CLGL_bufferLinkDestination); 
	this.kernelLinkDir.setKernelArg("enableDestination", this.enDestination); 
	this.kernelLinkDir.setKernelArg("destinationForce", this.destinationForce); 
	this.kernelLinkDir.setKernelArg("enableDrag", this.enableDrag); 
	this.kernelLinkDir.setKernelArg("idToDrag", this.idToDrag); 
	this.kernelLinkDir.setKernelArg("MouseDragTranslationX", this.MouseDragTranslationX); 
	this.kernelLinkDir.setKernelArg("MouseDragTranslationY", this.MouseDragTranslationY); 
	this.kernelLinkDir.setKernelArg("MouseDragTranslationZ", this.MouseDragTranslationZ); 
	this.kernelLinkDir.setKernelArg("islink", 1);  // islink
	
	var currentPP = 0;
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
			if(this.objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && this.idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
				var oper = this.MPOS.x(stormEngineC.polarityPoints[n].getPosition());
				this.kernelLinkDir.setKernelArg('pole'+n+'X', oper.e[3]); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Y', oper.e[7]); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Z', oper.e[11]); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Polarity', stormEngineC.polarityPoints[n].polarity); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Orbit', stormEngineC.polarityPoints[n].orbit); 
				this.kernelLinkDir.setKernelArg('pole'+n+'Force', stormEngineC.polarityPoints[n].force); 
				
				currentPP++;
			}
		}
	}	
	
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		for(var nb = 0, fb = stormEngineC.forceFields[n].nodesProc.length; nb < fb; nb++) {
			if(this.idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
				var oper = stormEngineC.forceFields[n].direction;
				this.kernelLinkDir.setKernelArg('force'+n+'X', oper.e[0]); 
				this.kernelLinkDir.setKernelArg('force'+n+'Y', oper.e[1]); 
				this.kernelLinkDir.setKernelArg('force'+n+'Z', oper.e[2]); 
			}
		}
	}	
};
























//*******************************************************************************************************************
// FUNCTION FOR CREATION & UPDATE OF CLGL & GL BUFFERS
//*******************************************************************************************************************
StormBufferNodes.prototype.enqueueWriteVertexBuffer = function(buffer_GL, arr, packet, type, arrayType) {
	var pack = (packet != undefined && packet == false) ? false : true;
	
	if(pack == true) {
		var arrayUint = new Uint8Array(arr.length*4); 	
		for(var n = 0, f = arr.length; n < f; n++) {  
			var idd = n*4;
			var arrPack = stormEngineC.utils.pack((arr[n]+(((this.workAreaSize*2.0))/2))/((this.workAreaSize*2.0))); 
			arrayUint[idd+0] = arrPack[0]*255;
			arrayUint[idd+1] = arrPack[1]*255;
			arrayUint[idd+2] = arrPack[2]*255;
			arrayUint[idd+3] = arrPack[3]*255;
		}	
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arrayUint), this.gl.DYNAMIC_DRAW);
	} else {
		if(arrayType != undefined && arrayType == "ELEMENT_ARRAY_BUFFER") {
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer_GL);
			this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(arr), this.gl.DYNAMIC_DRAW);					
		} else { // ARRAY_BUFFER
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer_GL);
			if(type == "UINT") {
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Uint8Array(arr), this.gl.DYNAMIC_DRAW);
			} else {
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arr), this.gl.DYNAMIC_DRAW);
			}
		}
	}
};
