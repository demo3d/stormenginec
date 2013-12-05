/*
StormEngineC. 3D Engine Javascript.
Copyright (C) 2010 Roberto Gonzalez. Stormcolor.com.

This file is part of StormEngineC.

StormEngineC is free software; you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

StormEngineC is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with StormEngineC; If not, see <http://www.gnu.org/licenses/>.
 */

StormScene = function() {
	this.nodes = stormEngineC.nodes;
	this.nodesCam = stormEngineC.nodesCam;
};
StormScene.prototype.save = function() {
	var sceneSource = '';
	
	// NODOS
	for(var n = 0; n < this.nodes.length; n++) {
		sceneSource = sceneSource+'NODE'+"\r\n";
		var e = this.nodes[n].mWMatrix.e;
		sceneSource = sceneSource+'NODEmWMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
												+e[4]+','+e[5]+','+e[6]+','+e[7]+','
												+e[8]+','+e[9]+','+e[10]+','+e[11]+','
												+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
		var e = this.nodes[n].mRotationLocalSpaceMatrix.e;
		sceneSource = sceneSource+'NODEmRotationLocalSpaceMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
																+e[4]+','+e[5]+','+e[6]+','+e[7]+','
																+e[8]+','+e[9]+','+e[10]+','+e[11]+','
																+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
		
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			sceneSource = sceneSource+'BO'+"\r\n";
			
			// StormBufferObject native vertex
			sceneSource = sceneSource+'v ';
			var separat = '';
			var stringBOArray = '';
			for(b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshVertexArray.length; b++) {
				stringBOArray = stringBOArray+separat+this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[b];
				separat = ',';
			}
			sceneSource = sceneSource+stringBOArray+"\r\n";
			
			// StormBufferObject native normal
			sceneSource = sceneSource+'n ';
			var separat = '';
			var stringBOArray = '';
			for(b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshNormalArray.length; b++) {
				stringBOArray = stringBOArray+separat+this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[b];
				separat = ',';
			}
			sceneSource = sceneSource+stringBOArray+"\r\n";
			
			// StormBufferObject native texture
			sceneSource = sceneSource+'t ';
			var separat = '';
			var stringBOArray = '';
			for(b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshTextureArray.length; b++) {
				stringBOArray = stringBOArray+separat+this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[b];
				separat = ',';
			}
			sceneSource = sceneSource+stringBOArray+"\r\n";
			
			// StormBufferObject native index
			sceneSource = sceneSource+'i ';
			var separat = '';
			var stringBOArray = '';
			for(b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length; b++) {
				stringBOArray = stringBOArray+separat+this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[b];
				separat = ',';
			}
			sceneSource = sceneSource+stringBOArray+"\r\n";
			
			
			// StormBufferObject textureKdName
			sceneSource = sceneSource+'textureKdName '+this.nodes[n].buffersObjects[nb].textureKdName+"\r\n";
			
			// StormBufferObject textureKdName
			sceneSource = sceneSource+'textureBumpName '+this.nodes[n].buffersObjects[nb].textureBumpName+"\r\n";
		}
	}
	
	// CAMARAS
	for(var n = 0; n < this.nodesCam.length; n++) {
		sceneSource = sceneSource+'CAM'+"\r\n";
		
		var e = this.nodesCam[n].mWMatrix.e;
		sceneSource = sceneSource+'CAMmWMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
												+e[4]+','+e[5]+','+e[6]+','+e[7]+','
												+e[8]+','+e[9]+','+e[10]+','+e[11]+','
												+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
		var e = this.nodesCam[n].mRotationLocalSpaceMatrix.e;
		sceneSource = sceneSource+'CAMmRotationLocalSpaceMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
																+e[4]+','+e[5]+','+e[6]+','+e[7]+','
																+e[8]+','+e[9]+','+e[10]+','+e[11]+','
																+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
		
		if(this.nodesCam[n].usedByGLContext == true) {
			var e = this.nodesCam[n].nodeGoal.mWMatrix.e;
			sceneSource = sceneSource+'CAMGOALmWMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
													+e[4]+','+e[5]+','+e[6]+','+e[7]+','
													+e[8]+','+e[9]+','+e[10]+','+e[11]+','
													+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
			var e = this.nodesCam[n].nodeGoal.mRotationLocalSpaceMatrix.e;
			sceneSource = sceneSource+'CAMGOALmRotationLocalSpaceMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
																	+e[4]+','+e[5]+','+e[6]+','+e[7]+','
																	+e[8]+','+e[9]+','+e[10]+','+e[11]+','
																	+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
			
			var e = this.nodesCam[n].nodePivot.mWMatrix.e;
			sceneSource = sceneSource+'CAMPIVOTmWMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
													+e[4]+','+e[5]+','+e[6]+','+e[7]+','
													+e[8]+','+e[9]+','+e[10]+','+e[11]+','
													+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
			var e = this.nodesCam[n].nodePivot.mRotationLocalSpaceMatrix.e;
			sceneSource = sceneSource+'CAMPIVOTmRotationLocalSpaceMatrix '	+e[0]+','+e[1]+','+e[2]+','+e[3]+','
																	+e[4]+','+e[5]+','+e[6]+','+e[7]+','
																	+e[8]+','+e[9]+','+e[10]+','+e[11]+','
																	+e[12]+','+e[13]+','+e[14]+','+e[15]+"\r\n";
			
			sceneSource = sceneSource+'CAM_USED_BY_GLCONTEXT'+"\r\n";
		}
	}
	return sceneSource;
};

StormScene.prototype.load = function(stormSceneUrl) {
	stormEngineC.clearScene();
	
	var stringDirectory = '';
    var separat = '';
    var expl = stormSceneUrl.split('/');
    for(var n = 0; n < expl.length-1; n++) {
    	stringDirectory = stringDirectory+separat+expl[n];
    	separat = '/';
    }
    
	var req = new XMLHttpRequest();
	stormEngineC.setStatus('Loading scene...', req);
	req.textureDir = stringDirectory;
	req.onreadystatechange = function() {
		if(req.readyState == 4) {
			stormEngineC.setStatus('');
			var lines = req.responseText.split("\r\n");
			
			var objectMesh = new Object();
			
			for(var n = 0; n < lines.length; n++) {
				// NODOS
				if(lines[n] == 'NODE') {
					var node = stormEngineC.createNode();
				}
				if(lines[n].match(/^NODEmWMatrix /gi) != null) {
					var strArray = lines[n].replace(/^NODEmWMatrix /gi, '').split(',');
					node.mWMatrix = $M16(strArray);
				}
				if(lines[n].match(/^NODEmRotationLocalSpaceMatrix /gi) != null) {
					var strArray = lines[n].replace(/^NODEmRotationLocalSpaceMatrix /gi, '').split(',');
					node.mRotationLocalSpaceMatrix = $M16(strArray);
				}
				if(lines[n] == 'BO') {
					var bObject = new StormBufferObject();
					node.attachStormBufferObject(bObject);
				}
				if(lines[n].match(/^v /gi) != null) {
					objectMesh.vertexArray = lines[n].replace(/^v /gi, '').split(',');
					objectMesh.vertexItemSize = 3;
					objectMesh.vertexNumItems = objectMesh.vertexArray.length/3;
				}
				if(lines[n].match(/^n /gi) != null) {
					objectMesh.normalArray = lines[n].replace(/^n /gi, '').split(',');
					objectMesh.normalItemSize = 3;
					objectMesh.normalNumItems = objectMesh.normalArray.length/3;
				}
				if(lines[n].match(/^t /gi) != null) {
					objectMesh.textureArray = lines[n].replace(/^t /gi, '').split(',');
					objectMesh.textureItemSize = 2;
					objectMesh.textureNumItems = objectMesh.textureArray.length/2;
				}
				if(lines[n].match(/^i /gi) != null) {
					objectMesh.indexArray = lines[n].replace(/^i /gi, '').split(',');
					objectMesh.indexItemSize = 1;
					objectMesh.indexNumItems = objectMesh.indexArray.length;
					
					bObject.attachBuffers(objectMesh);
				}
				if(lines[n].match(/^textureKdName /gi) != null) {
					bObject.attachTexture(req.textureDir+'/'+lines[n].replace(/^textureKdName /gi, ''), undefined, undefined, 'map_kd');
					bObject.textureKdName = lines[n].replace(/^textureKdName /gi, '');
				}
				if(lines[n].match(/^textureBumpName /gi) != null) {
					if(lines[n].replace(/^textureBumpName /gi, '') != 'undefined') {
						bObject.attachTexture(req.textureDir+'/'+lines[n].replace(/^textureBumpName /gi, ''), undefined, undefined, 'map_bump');
						bObject.textureBumpName = lines[n].replace(/^textureBumpName /gi, '');
					}
				}
				
				// CAMARAS
				if(lines[n] == 'CAM') {
					var nodeCam = stormEngineC.createCamera();
				}
				if(lines[n].match(/^CAMmWMatrix /gi) != null) {
					var strArray = lines[n].replace(/^CAMmWMatrix /gi, '').split(',');
					nodeCam.mWMatrix = $M16(strArray);
				}
				if(lines[n].match(/^CAMmRotationLocalSpaceMatrix /gi) != null) {
					var strArray = lines[n].replace(/^CAMmRotationLocalSpaceMatrix /gi, '').split(',');
					nodeCam.mRotationLocalSpaceMatrix = $M16(strArray);
				}
				
				if(lines[n].match(/^CAMGOALmWMatrix /gi) != null) {
					var strArray = lines[n].replace(/^CAMGOALmWMatrix /gi, '').split(',');
					nodeCam.nodeGoal.mWMatrix = $M16(strArray);
				}
				if(lines[n].match(/^CAMGOALmRotationLocalSpaceMatrix /gi) != null) {
					var strArray = lines[n].replace(/^CAMGOALmRotationLocalSpaceMatrix /gi, '').split(',');
					nodeCam.nodeGoal.mRotationLocalSpaceMatrix = $M16(strArray);
				}
				if(lines[n].match(/^CAMPIVOTmWMatrix /gi) != null) {
					var strArray = lines[n].replace(/^CAMPIVOTmWMatrix /gi, '').split(',');
					nodeCam.nodePivot.mWMatrix = $M16(strArray);
				}
				if(lines[n].match(/^CAMPIVOTmRotationLocalSpaceMatrix /gi) != null) {
					var strArray = lines[n].replace(/^CAMPIVOTmRotationLocalSpaceMatrix /gi, '').split(',');
					nodeCam.nodePivot.mRotationLocalSpaceMatrix = $M16(strArray);
				}
				
				if(lines[n] == 'CAM_USED_BY_GLCONTEXT') {
					stormEngineC.setWebGLCam(nodeCam);
				}
			}
		}
	};
	req.open("GET", stormSceneUrl, true);
	req.send(null);
	
	
};