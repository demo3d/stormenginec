/**
* @class
* @constructor
* @augments StormNode
  
* @property {String} objectType
*/
WebCLGLLayout_3DpositionByDirection = function(webCLGL, jsonIn) {
	this.objectType = 'webclgllayout';

	this.webCLGL = webCLGL;
	
	this.offset = (jsonIn != undefined && jsonIn.offset != undefined) ? jsonIn.offset : 100.0;
	
	this.verticesCount = 0;
	this.indicesCount = 0;
	
	this.arrPP = [];
	this.arrF = [];
	
	// KERNEL POSITION BY DIRECTION
	this.kernel_positionByDirection = this.webCLGL.createKernel();
	this.kernel_positionByDirection.setKernelSource(this.positionByDirectionSource());
	
	// KERNEL DIRECTION
	this.kernel_direction = this.webCLGL.createKernel(); 
	this.kernel_direction.setKernelSource(this.directionSource());
	
	// VERTEX AND FRAGMENT PROGRAMS 
	var vfProgram_vertexSource = 'void main(float* nodeId,'+
										'float4*kernel nodePos,'+
										'float4* nodeVertexPos,'+
										'float4* nodeVertexCol,'+
										'mat4 PMatrix,'+
										'mat4 cameraWMatrix,'+
										'mat4 nodeWMatrix,'+
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
	var vfProgram_fragmentSource = 'void main(float nodesSize) {'+
										'vec2 x = get_global_id();'+
										
										'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n'+
									'}';
	this.vfProgram = this.webCLGL.createVertexFragmentProgram();
	this.vfProgram.setVertexSource(vfProgram_vertexSource);
	this.vfProgram.setFragmentSource(vfProgram_fragmentSource);
};

/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.positionByDirectionSource = function() {
	var kernelPos_Source = 'void main(	float4* posXYZW,'+
										'float4* dir) {'+
										'vec2 x = get_global_id();'+
										'vec3 currentPos = posXYZW[x].xyz;\n'+ 
										'vec4 dir = dir[x];'+
										'vec3 currentDir = vec3(dir.x,dir.y,dir.z);\n'+   
										'vec3 newPos = (currentPos+currentDir);\n'+
										
										'out_float4 = vec4(newPos, 1.0);\n'+ 
									'}';
	return kernelPos_Source;
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.directionSource = function() {
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
		var str = 'float offset;vec3 polePos;float toDir; vec3 cc;float distanceToPole;\n';
		for(var n = 0, f = this.arrPP.length; n < f; n++) {
			str += 'polePos = vec3(pole'+n+'X,pole'+n+'Y,pole'+n+'Z);\n'+ 
					'toDir = 1.0;\n'+  
					'if(sign(particlePolarity[x]) == 0.0 && sign(pole'+n+'Polarity) == 1.0) toDir = -1.0;\n'+
					'if(sign(particlePolarity[x]) == 1.0 && sign(pole'+n+'Polarity) == 0.0) toDir = -1.0;\n'+
					'offset = '+this.offset.toFixed(20)+';'+
					'distanceToPole = distance(currentPos,polePos);'+
					
						//'cc = normalize(currentPos-polePos)*( abs(distanceToPole)*1.0 )*toDir;\n'+
					
					//'if(pole'+n+'Orbit == 0.0)'+			
					'cc = normalize(polePos-currentPos)*( abs(distanceToPole)*0.1*(pole'+n+'Force) )*toDir*-1.0;\n'+	
					'cc += normalize(polePos-currentPos)*( abs(offset-distanceToPole)*0.1*(1.0-pole'+n+'Force) )*toDir;\n'+
					
					'if(pole'+n+'Orbit == 1.0) cc = normalize(polePos-currentPos)*( abs(offset-distanceToPole)*0.1*(pole'+n+'Force) )*toDir*-1.0;\n'+
					//'else if(pole'+n+'Atraction == 1.0) cc = normalize(polePos-currentPos)*( abs(distanceToPole)*0.1*(pole'+n+'Force) )*toDir*-1.0;\n'+	
					
					'currentDir = (currentDir)+(cc);\n';
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

/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_PMatrix = function(arr) {
	this.vfProgram.setVertexArg("PMatrix", arr);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_cameraWMatrix = function(arr) {
	this.vfProgram.setVertexArg("cameraWMatrix", arr);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_nodeWMatrix = function(arr) {
	this.vfProgram.setVertexArg("nodeWMatrix", arr);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_nodesSize = function(nodesSize) {
	this.vfProgram.setVertexArg("nodesSize", nodesSize);
	
	this.vfProgram.setFragmentArg("nodesSize", nodesSize);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_enableDestination = function(enableDestination) {
	this.kernel_direction.setKernelArg("enableDestination", enableDestination); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_destinationForce = function(destinationForce) {
	this.kernel_direction.setKernelArg("destinationForce", destinationForce); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_enableDrag = function(enableDrag) {
	this.kernel_direction.setKernelArg("enableDrag", enableDrag); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_idToDrag = function(idToDrag) {
	this.kernel_direction.setKernelArg("idToDrag", idToDrag); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_MouseDragTranslationX = function(MouseDragTranslationX) {
	this.kernel_direction.setKernelArg("MouseDragTranslationX", MouseDragTranslationX); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_MouseDragTranslationY = function(MouseDragTranslationY) {
	this.kernel_direction.setKernelArg("MouseDragTranslationY", MouseDragTranslationY); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_MouseDragTranslationZ = function(MouseDragTranslationZ) {
	this.kernel_direction.setKernelArg("MouseDragTranslationZ", MouseDragTranslationZ); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_islink = function(islink) {
	this.kernel_direction.setKernelArg("islink", islink);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_Id = function(arr) {
	this.verticesCount = arr.length;
	this.CLGL_bufferId = this.webCLGL.createBuffer(arr.length, "FLOAT", this.offset, false, "VERTEX_AND_FRAGMENT");
	this.CLGL_bufferId_TEMP = this.webCLGL.createBuffer(arr.length, "FLOAT", this.offset, false, "VERTEX_AND_FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferId, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferId_TEMP, arr);
	
	this.kernel_direction.setKernelArg("idx", this.CLGL_bufferId);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_NodeId = function(arr) {
	this.CLGL_bufferNodeId = this.webCLGL.createBuffer(arr.length, "FLOAT", this.offset, false, "VERTEX_AND_FRAGMENT"); 
	this.CLGL_bufferNodeId_TEMP = this.webCLGL.createBuffer(arr.length, "FLOAT", this.offset, false, "VERTEX_AND_FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeId, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferNodeId_TEMP, arr);
	
	this.kernel_direction.setKernelArg("nodeid", this.CLGL_bufferNodeId); 
	this.vfProgram.setVertexArg("nodeId", this.CLGL_bufferNodeId);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_Pos = function(arr) {
	this.CLGL_bufferPosXYZW = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "VERTEX_FROM_KERNEL");
	this.CLGL_bufferPosXYZW_TEMP = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "VERTEX_FROM_KERNEL");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferPosXYZW, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferPosXYZW_TEMP, arr);
	
	this.kernel_positionByDirection.setKernelArg("posXYZW", this.CLGL_bufferPosXYZW);
	this.kernel_direction.setKernelArg("posXYZW", this.CLGL_bufferPosXYZW);
	this.vfProgram.setVertexArg("nodePos", this.CLGL_bufferPosXYZW); // this from kernel
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_VertexPos = function(arr) {
	this.CLGL_bufferVertexPos = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "VERTEX");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferVertexPos, arr);
	
	this.vfProgram.setVertexArg("nodeVertexPos", this.CLGL_bufferVertexPos);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_VertexColor = function(arr) {
	this.CLGL_bufferVertexColor = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "VERTEX");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferVertexColor, arr);
	
	this.vfProgram.setVertexArg("nodeVertexCol", this.CLGL_bufferVertexColor);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_Indices = function(arr) {
	this.indicesCount = arr.length;
	this.CLGL_bufferIndices = this.webCLGL.createBuffer(arr.length, "FLOAT", this.offset, false, "VERTEX_INDEX");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferIndices, arr);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_Dir = function(arr) {
	this.CLGL_bufferDir = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "FRAGMENT");
	this.CLGL_bufferDir_TEMP = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferDir, arr);
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferDir_TEMP, arr);
	
	this.kernel_positionByDirection.setKernelArg("dir", this.CLGL_bufferDir);
	this.kernel_direction.setKernelArg("dir", this.CLGL_bufferDir); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_Polaritys = function(arr) {
	this.CLGL_bufferPolaritys = this.webCLGL.createBuffer(arr.length, "FLOAT", this.offset, false, "FRAGMENT");	
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferPolaritys, arr);
	
	this.kernel_direction.setKernelArg("particlePolarity", this.CLGL_bufferPolaritys); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.setBuffer_Destination = function(arr) {
	this.CLGL_bufferDestination = this.webCLGL.createBuffer(arr.length/4, "FLOAT4", this.offset, false, "FRAGMENT"); 		
	this.webCLGL.enqueueWriteBuffer(this.CLGL_bufferDestination, arr);
	
	this.kernel_direction.setKernelArg("dest", this.CLGL_bufferDestination);
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_polaritypoints = function(arrPP) {
	this.arrPP = arrPP;
	this.kernel_direction.setKernelSource(this.directionSource());
	
	for(var n = 0, f = this.arrPP.length; n < f; n++) {
		this.kernel_direction.setKernelArg('pole'+n+'X', this.arrPP[n].x); 
		this.kernel_direction.setKernelArg('pole'+n+'Y', this.arrPP[n].y); 
		this.kernel_direction.setKernelArg('pole'+n+'Z', this.arrPP[n].z); 
		this.kernel_direction.setKernelArg('pole'+n+'Polarity', this.arrPP[n].polarity); 
		this.kernel_direction.setKernelArg('pole'+n+'Orbit', this.arrPP[n].orbit); 
		this.kernel_direction.setKernelArg('pole'+n+'Force', this.arrPP[n].force); 
	}
	for(var n = 0, f = this.arrF.length; n < f; n++) {
		this.kernel_direction.setKernelArg('force'+n+'X', this.arrF[n].x); 
		this.kernel_direction.setKernelArg('force'+n+'Y', this.arrF[n].y); 
		this.kernel_direction.setKernelArg('force'+n+'Z', this.arrF[n].z);
	}
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.set_forces = function(arrF) {
	this.arrF = arrF;
	this.kernel_direction.setKernelSource(this.directionSource());
	
	for(var n = 0, f = this.arrPP.length; n < f; n++) {
		this.kernel_direction.setKernelArg('pole'+n+'X', this.arrPP[n].x); 
		this.kernel_direction.setKernelArg('pole'+n+'Y', this.arrPP[n].y); 
		this.kernel_direction.setKernelArg('pole'+n+'Z', this.arrPP[n].z); 
		this.kernel_direction.setKernelArg('pole'+n+'Polarity', this.arrPP[n].polarity); 
		this.kernel_direction.setKernelArg('pole'+n+'Orbit', this.arrPP[n].orbit); 
		this.kernel_direction.setKernelArg('pole'+n+'Force', this.arrPP[n].force); 
	}
	for(var n = 0, f = this.arrF.length; n < f; n++) {
		this.kernel_direction.setKernelArg('force'+n+'X', this.arrF[n].x); 
		this.kernel_direction.setKernelArg('force'+n+'Y', this.arrF[n].y); 
		this.kernel_direction.setKernelArg('force'+n+'Z', this.arrF[n].z);
	}
};

/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.prerender = function() {
	this.webCLGL.enqueueNDRangeKernel(this.kernel_positionByDirection, this.CLGL_bufferPosXYZW_TEMP);  			
	this.webCLGL.enqueueNDRangeKernel(this.kernel_direction, this.CLGL_bufferDir_TEMP); 
	
	this.webCLGL.copy(this.CLGL_bufferPosXYZW_TEMP, this.CLGL_bufferPosXYZW);			
	this.webCLGL.copy(this.CLGL_bufferDir_TEMP, this.CLGL_bufferDir); 
	
	this.webCLGL.enqueueReadBuffer_Packet4Uint8Array_Float4(this.CLGL_bufferPosXYZW); 
};
/** @private **/
WebCLGLLayout_3DpositionByDirection.prototype.render = function(beforerender, drawMode) {
	beforerender();
	
	this.webCLGL.enqueueVertexFragmentProgram(this.vfProgram, this.CLGL_bufferIndices, this.indicesCount, drawMode);
};
