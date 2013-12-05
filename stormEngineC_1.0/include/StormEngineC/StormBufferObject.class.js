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

StormBufferObject = function() {
	this.gl = stormEngineC.stormGLContext.gl;
	// buffers del objeto para opengl
	this.nodeMeshVertexBuffer;
	this.nodeMeshVertexBufferItemSize;
	this.nodeMeshVertexBufferNumItems;

	this.nodeMeshNormalBuffer;
	this.nodeMeshNormalBufferItemSize;
	this.nodeMeshNormalBufferNumItems;
	
	this.nodeMeshTextureBuffer;
	this.nodeMeshTextureBufferItemSize;
	this.nodeMeshTextureBufferNumItems;
	
	this.nodeMeshIndexBuffer;
	this.nodeMeshIndexBufferItemSize;
	this.nodeMeshIndexBufferNumItems;
	
	// arrays nativos del objeto
	this.nodeMeshVertexArray;
	this.nodeMeshVertexArrayFrameWSpace;
	
	this.nodeMeshNormalArray;
	
	this.nodeMeshTextureArray;
	
	this.nodeMeshIndexArray;
	
	// matrix WSpace temporal de este bufferObject. (por cada frame se actualiza)
	this.mWMatrixFrame = $M16([
	                      1, 0, 0, 0,
	                      0, 1, 0, 0,
		                  0, 0, 1, 0,
		                  0, 0, 0, 1
		                ]);
	
	// material asociado
	this.Kd;
	this.textureObjectKd = undefined;
	this.textureKdName = undefined;
	
	this.textureObjectBump = undefined;
	this.textureBumpName = undefined;
	
};

StormBufferObject.prototype.attachBuffers = function(stormMeshObject) {
	// buffers del objeto para opengl
	this.nodeMeshVertexBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshVertexBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(stormMeshObject.vertexArray), this.gl.STATIC_DRAW);
	this.nodeMeshVertexBufferItemSize = stormMeshObject.vertexItemSize;
	this.nodeMeshVertexBufferNumItems = stormMeshObject.vertexNumItems;
	
	this.nodeMeshNormalBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshNormalBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(stormMeshObject.normalArray), this.gl.STATIC_DRAW);
	this.nodeMeshNormalBufferItemSize = stormMeshObject.normalItemSize;
	this.nodeMeshNormalBufferNumItems = stormMeshObject.normalNumItems;
	
	this.nodeMeshTextureBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodeMeshTextureBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(stormMeshObject.textureArray), this.gl.STATIC_DRAW);
	this.nodeMeshTextureBufferItemSize = stormMeshObject.textureItemSize;
	this.nodeMeshTextureBufferNumItems = stormMeshObject.textureNumItems;
	
	this.nodeMeshIndexBuffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodeMeshIndexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(stormMeshObject.indexArray), this.gl.STATIC_DRAW);
	this.nodeMeshIndexBufferItemSize = stormMeshObject.indexItemSize;
	this.nodeMeshIndexBufferNumItems = stormMeshObject.indexNumItems;

	
	// arrays nativos del objeto
	this.nodeMeshVertexArray = new Float32Array(stormMeshObject.vertexArray);
	this.nodeMeshVertexArrayFrameWSpace = new Float32Array(stormMeshObject.vertexArray.length);
	
	this.nodeMeshNormalArray = new Float32Array(stormMeshObject.normalArray);
	
	this.nodeMeshTextureArray = new Float32Array(stormMeshObject.textureArray);
	
	this.nodeMeshIndexArray = new Uint16Array(stormMeshObject.indexArray);
	
};

StormBufferObject.prototype.attachTexture = function(textureUrl, mtlsFile, bObject, typeTextureUrl) {
	var mtlsFileLoc = undefined;
	mtlsFileLoc = mtlsFile;
	var bufObject = undefined;
	bufObject = bObject;
	
	var typeTexture = 'map_kd';
	if(typeTextureUrl != undefined) {
		typeTexture = typeTextureUrl;
	}
	
	if(mtlsFileLoc == undefined) {
		
			if(typeTexture == 'map_kd') {
				if(this.textureObjectKd == undefined) {
					this.textureObjectKd = this.gl.createTexture();
					var arrKdName = textureUrl.split('/');
					this.textureKdName = arrKdName[arrKdName.length-1];
					var imageElement = new Image();
					imageElement.textureObj = this.textureObjectKd;
					
					imageElement.ctx = this.gl;
					imageElement.onload = function() {
						stormEngineC.stormGLContext.addGLTexture(imageElement);
					};
					imageElement.src = textureUrl;
				}
			} else if(typeTexture == 'map_bump') {
				if(this.textureObjectBump == undefined) {
					this.textureObjectBump = this.gl.createTexture();
					var imageElement = new Image();
					imageElement.textureObj = this.textureObjectBump;
					
					imageElement.ctx = this.gl;
					imageElement.onload = function() {
						stormEngineC.stormGLContext.addGLTexture(imageElement);
					};
					imageElement.src = textureUrl;
				}
			}
			
		
	} else {
		// leemos antes su archivo .mtl
		var req = new XMLHttpRequest();
		req.materialName = textureUrl;
		req.materialDirectory = mtlsFileLoc;
		req.bObject = bufObject;
		
		req.onreadystatechange = function () {
			if (req.readyState == 4) {
				var stringObjDirectory = '';
			    var separat = '';
			    var expl = req.materialDirectory.split("/");
			    for(var n = 0; n < expl.length-1; n++) {
			    	stringObjDirectory = stringObjDirectory+separat+expl[n];
			    	separat = '/';
			    }
			    
			    
				var encontradoMaterial;
				var lines = req.responseText.split("\r\n");
			    for(var n = 0; n < lines.length; n++) {
			    	
			        var line = lines[n].replace(/\t+/gi,"");
			        
			        if (line[0] == "#") {
			            continue;
			        }

			        if(encontradoMaterial == true) {
			        	if(line.match(/^Kd/gi) != null) {
					        var array = line.split(" ");
					        req.bObject.Kd = $V3([array[1],array[2],array[3]]);
				        }
				        if(line.match(/^map_Kd/gi) != null) {
					        var array = line.split("\\");
					        req.bObject.attachTexture(stringObjDirectory+'/'+array[array.length-1], undefined, undefined, 'map_kd');
					        req.bObject.textureKdName = array[array.length-1];
				        }
				        if(line.match(/^map_bump/gi) != null) {
					        var array = line.split("\\");
					        req.bObject.attachTexture(stringObjDirectory+'/'+array[array.length-1], undefined, undefined, 'map_bump');
					        req.bObject.textureBumpName = array[array.length-1];
				        }
				        if(line.match(/^newmtl /gi) != null) {
				        	encontradoMaterial = false;
				        }
			        }
			        if(line == "newmtl "+req.materialName) {
			        	encontradoMaterial = true;
			        }
			    }
				
		    }
		};
	    req.open("GET", mtlsFileLoc, true);
	    req.send(null);
	}
};