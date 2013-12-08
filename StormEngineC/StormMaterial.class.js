/*
The MIT License (MIT)

Copyright (c) <2010> <Roberto Gonzalez. http://stormcolour.appspot.com/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

 
/**
* @class
* @constructor
*/
StormMaterial = function() {
	this.gl = stormEngineC.stormGLContext.gl;
	
	this.idNum;
	this.Ns = 0.8928571428571429; // roughness 0.0-100.0 ->/112=(0.0 - 0.8928571428571429) 
	this.illumination = 0.0;
	
	this.materialType = 'color'; // color | texture
	
	this.imageElement_Kd = undefined; // HTML image object map albedo //imageElement_Kd.width imageElement_Kd.height
	this.canvasKd = document.createElement('canvas');
	this.textureKdName = undefined; // string name map albedo
	this.Kd = $V3([1.0,1.0,1.0]); // vector3 color albedo
	this.textureObjectKd = undefined; // WebGL texture albedo
	this.arrayTEX_Kd = new Uint8Array([255,255,255,255]); // Typed array map albedo
	
	this.imageElement_bump = undefined; // HTML image object map bump
	this.canvasBump = document.createElement('canvas');
	this.textureBumpName = undefined; // string name map bump
	this.textureObjectBump = undefined; // WebGL texture map bump
	this.arrayTEX_bump = new Uint8Array(); // Typed array map bump
};

/**
* Attach a solid color
* @type Void
* @param {StormV3} color normalize vector
*/
StormMaterial.prototype.attachColor = function(vecColor) {
	var gl = this.gl;
	
	this.materialType = 'color';
	
	this.textureObjectKd = gl.createTexture();
	textureObj = this.textureObjectKd;
	
	this.canvasKd = document.createElement('canvas');
	this.canvasKd.width = 1;
	this.canvasKd.height = 1;
	this.canvasKd.data = new Uint8Array([vecColor.e[0]*255,vecColor.e[1]*255,vecColor.e[2]*255,255]);
	this.arrayTEX_Kd = this.canvasKd.data;
	this.textureKdName = 'color '+this.arrayTEX_Kd[0]+','+this.arrayTEX_Kd[1]+','+this.arrayTEX_Kd[2];
	
	
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, this.textureObjectKd);
	//gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageElement);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.arrayTEX_Kd);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
};

/**
* Attach a image in this material.
* @type Void
* @param {String} textureUrl
* @param {String} [typeTexture="map_kd"] 'map_kd' or 'map_bump'
*/
StormMaterial.prototype.attachTexture = function(textureUrl, typeTexture) { 
	var typeTexture = typeTexture == undefined ? 'map_kd' : typeTexture;
	
	this.materialType = 'texture';
	
	var explTextureUrl = textureUrl.split('/');
	var tt;
	if(typeTexture == 'map_kd') {
		tt = 'Kd';
		this.textureKdName = explTextureUrl[explTextureUrl.length-1];
	} else if(typeTexture == 'map_bump') {
		tt = 'Bump';
		this.textureBumpName = explTextureUrl[explTextureUrl.length-1];
	}
	
	var req = new XMLHttpRequest();
	req.material = this;
	req.tt = tt;
	req.open("GET", textureUrl, true);
	req.responseType = "blob";
	
	req.onload = function() {
		var filereader = new FileReader();
		filereader.onload = function(event) {
			var dataUrl = event.target.result;
			
			var image = new Image();
			image.onload = function() {
				stormEngineC.setStatus({id:'texture'+textureUrl,
									str:''});
				stormEngineC.addGLTexture(image, req.material, req.tt);
			};
			image.src = dataUrl;
		};
		filereader.readAsDataURL(req.response);
	};
	stormEngineC.setStatus({id:'texture'+textureUrl,
							str:'Loading texture...'+textureUrl,
							req:req});
	req.send(null);
};

/**
* Attach the image corresponding to the existing 'materialName' on the materials file 'mtlsFile'.
* @type Void
* @param {String} materialName
* @param {String} materialFileUrl .mtl file url
*/
StormMaterial.prototype.attachTextureFromMTLFile = function(materialName, mtlsFile) { 
	var req = new XMLHttpRequest();
	req.bObject = this;
	req.open("GET", mtlsFile, true);
	req.responseType = "blob";
	
	req.onload = function () {
		var filereader = new FileReader();
		filereader.onload = function(event) {
			var text = event.target.result;
			
			stormEngineC.setStatus({id:'material'+mtlsFile,
								str:''});
								
			var stringObjDirectory = '';
			var separat = '';
			var expl = mtlsFile.split("/");
			for(var n = 0, f = expl.length-1; n < f; n++) {
				stringObjDirectory = stringObjDirectory+expl[n]+'/';
			}
			
			var encontradoMaterial;
			var lines = text.split("\r\n");
			for(var n = 0, f = lines.length; n < f; n++) {
				
				var line = lines[n].replace(/\t+/gi,"");
				
				if (line[0] == "#") {
					continue;
				}

				if(encontradoMaterial == true) {
					if(line.match(/^Ns/gi) != null) { // roughness (.obj exports = 0.0 - 100.0) 
						var array = line.split(" ");
						req.bObject.Ns = array[1]/112.0; // 100/112.0 -> 0.0-0.8928571428571429
					}
					if(line.match(/^Kd/gi) != null) { // albedo
						var array = line.split(" ");
						req.bObject.Kd = $V3([array[1],array[2],array[3]]);
					}
					if(line.match(/^map_Kd/gi) != null) { // map albedo
						var array = line.split("\\");
						req.bObject.attachTexture(stringObjDirectory+array[array.length-1], 'map_kd');
						req.bObject.textureKdName = array[array.length-1];
					}
					if(line.match(/^map_bump/gi) != null) { // map bump
						var array = line.split("\\");
						req.bObject.attachTexture(stringObjDirectory+array[array.length-1], 'map_bump');
						req.bObject.textureBumpName = array[array.length-1];
					}
					if(line.match(/^newmtl /gi) != null) {
						encontradoMaterial = false;
					}
				}
				if(line == "newmtl "+materialName) {
					encontradoMaterial = true;
				}
			}
		}; 
		filereader.readAsText(req.response);
	}; 
	stormEngineC.setStatus({id:'material'+mtlsFile,
							str:'Loading material...'+mtlsFile,
							req:req});
	req.send(null);
};

/**
* Set the illumination of this material. Default = 0.0.
* @type Void
* @param {Float} value
*/
StormMaterial.prototype.setIllumination = function(value) { 
	this.illumination = value;
};
