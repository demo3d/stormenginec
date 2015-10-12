/** 
* KernelSources Object
* @class
* @constructor
*/
KernelSources = function() { 
	
};


/**
* Update the vertex source 
* @type Void
* @param {String} vertexSource
* @param {String} vertexHeader
*/
KernelSources.prototype.positionByDirection = function() {
	
};
/** @private **/
KernelSources.prototype.positionByDirection = function() { 
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
KernelSources.prototype.direction = function(objectType, idNum) { 
	lines_argumentsPoles = (function() {
		var str = '';
		var currentPP = 0;
		for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
			for(var nb = 0, fb = stormEngineC.polarityPoints[n].nodesProc.length; nb < fb; nb++) {
				if(objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
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
				if(objectType == stormEngineC.forceFields[n].nodesProc[nb].objectType && idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
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
				if(objectType == stormEngineC.polarityPoints[n].nodesProc[nb].objectType && idNum == stormEngineC.polarityPoints[n].nodesProc[nb].idNum) {
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
				if(objectType == stormEngineC.forceFields[n].nodesProc[nb].objectType && idNum == stormEngineC.forceFields[n].nodesProc[nb].idNum) {
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