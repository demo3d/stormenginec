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

StormMesh = function() {
	this.vertexArray;
	this.vertexItemSize;
	this.vertexNumItems;
	
	this.normalArray;
	this.normalItemSize;
	this.normalNumItems;
	
	this.textureArray;
	this.textureItemSize;
	this.textureNumItems;
	
	this.indexArray;
	this.indexItemSize;
	this.indexNumItems;
    
    
};

StormMesh.prototype.loadTriangle = function(node) {
	this.vertexArray = [
						0.0,  1.0,  0.0,
						1.0, 0.0,  0.0,
						0.0, 0.0,  0.0						 
						];
	this.vertexItemSize = 3;
	this.vertexNumItems = 3;
	
	this.normalArray = [
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0
	                 ];
	this.normalItemSize = 3;
	this.normalNumItems = 3;
	
	this.textureArray = [
	                     0.0, 0.0,
	                     1.0, 0.0,
	                     1.0, 1.0
	                   ];
	this.textureItemSize = 2;
	this.textureNumItems = 3;
	
	this.indexArray = [0, 1, 2];
	this.indexItemSize = 1;
	this.indexNumItems = 3;
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.vertexItemSize = this.vertexItemSize;
	meshObject.vertexNumItems = this.vertexNumItems;
	
	meshObject.normalArray = this.normalArray;
	meshObject.normalItemSize = this.normalItemSize;
	meshObject.normalNumItems = this.normalNumItems;
	
	meshObject.textureArray = this.textureArray;
	meshObject.textureItemSize = this.textureItemSize;
	meshObject.textureNumItems = this.textureNumItems;
	
	meshObject.indexArray = this.indexArray;
	meshObject.indexItemSize = this.indexItemSize;
	meshObject.indexNumItems = this.indexNumItems;
	
	node.attachMesh(meshObject);
};

StormMesh.prototype.loadBox = function(node) {
	this.vertexArray = [
	                    // Front face
	                    -1.0, -1.0,  1.0,
	                     1.0, -1.0,  1.0,
	                     1.0,  1.0,  1.0,
	                    -1.0,  1.0,  1.0,

	                    // Back face
	                    -1.0, -1.0, -1.0,
	                    -1.0,  1.0, -1.0,
	                     1.0,  1.0, -1.0,
	                     1.0, -1.0, -1.0,

	                    // Top face
	                    -1.0,  1.0, -1.0,
	                    -1.0,  1.0,  1.0,
	                     1.0,  1.0,  1.0,
	                     1.0,  1.0, -1.0,

	                    // Bottom face
	                    -1.0, -1.0, -1.0,
	                     1.0, -1.0, -1.0,
	                     1.0, -1.0,  1.0,
	                    -1.0, -1.0,  1.0,

	                    // Right face
	                     1.0, -1.0, -1.0,
	                     1.0,  1.0, -1.0,
	                     1.0,  1.0,  1.0,
	                     1.0, -1.0,  1.0,

	                    // Left face
	                    -1.0, -1.0, -1.0,
	                    -1.0, -1.0,  1.0,
	                    -1.0,  1.0,  1.0,
	                    -1.0,  1.0, -1.0
	                  ];
	this.vertexItemSize = 3;
	this.vertexNumItems = 24;
	
	this.normalArray = [
	                    // Front face
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,

	                   // Back face
	                    0.0,  0.0, -1.0,
	                    0.0,  0.0, -1.0,
	                    0.0,  0.0, -1.0,
	                    0.0,  0.0, -1.0,

	                   // Top face
	                    0.0,  1.0,  0.0,
	                    0.0,  1.0,  0.0,
	                    0.0,  1.0,  0.0,
	                    0.0,  1.0,  0.0,

	                   // Bottom face
	                    0.0, -1.0,  0.0,
	                    0.0, -1.0,  0.0,
	                    0.0, -1.0,  0.0,
	                    0.0, -1.0,  0.0,

	                   // Right face
	                    1.0,  0.0,  0.0,
	                    1.0,  0.0,  0.0,
	                    1.0,  0.0,  0.0,
	                    1.0,  0.0,  0.0,

	                   // Left face
	                   -1.0,  0.0,  0.0,
	                   -1.0,  0.0,  0.0,
	                   -1.0,  0.0,  0.0,
	                   -1.0,  0.0,  0.0
	                 ];
	this.normalItemSize = 3;
	this.normalNumItems = 24;
	
	this.textureArray = [
	                     // Front face
	                     0.0, 0.0,
	                     1.0, 0.0,
	                     1.0, 1.0,
	                     0.0, 1.0,

	                     // Back face
	                     1.0, 0.0,
	                     1.0, 1.0,
	                     0.0, 1.0,
	                     0.0, 0.0,

	                     // Top face
	                     0.0, 1.0,
	                     0.0, 0.0,
	                     1.0, 0.0,
	                     1.0, 1.0,

	                     // Bottom face
	                     1.0, 1.0,
	                     0.0, 1.0,
	                     0.0, 0.0,
	                     1.0, 0.0,

	                     // Right face
	                     1.0, 0.0,
	                     1.0, 1.0,
	                     0.0, 1.0,
	                     0.0, 0.0,

	                     // Left face
	                     0.0, 0.0,
	                     1.0, 0.0,
	                     1.0, 1.0,
	                     0.0, 1.0
	                   ];
	this.textureItemSize = 2;
	this.textureNumItems = 24;
	
	this.indexArray = [
	                   0, 1, 2,      0, 2, 3,    // Front face
	                   4, 5, 6,      4, 6, 7,    // Back face
	                   8, 9, 10,     8, 10, 11,  // Top face
	                   12, 13, 14,   12, 14, 15, // Bottom face
	                   16, 17, 18,   16, 18, 19, // Right face
	                   20, 21, 22,   20, 22, 23  // Left face
	                 ];
	this.indexItemSize = 1;
	this.indexNumItems = 36;
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.vertexItemSize = this.vertexItemSize;
	meshObject.vertexNumItems = this.vertexNumItems;
	
	meshObject.normalArray = this.normalArray;
	meshObject.normalItemSize = this.normalItemSize;
	meshObject.normalNumItems = this.normalNumItems;
	
	meshObject.textureArray = this.textureArray;
	meshObject.textureItemSize = this.textureItemSize;
	meshObject.textureNumItems = this.textureNumItems;
	
	meshObject.indexArray = this.indexArray;
	meshObject.indexItemSize = this.indexItemSize;
	meshObject.indexNumItems = this.indexNumItems;
	
	node.attachMesh(meshObject);
};

StormMesh.prototype.loadQuad = function(node) {
	this.vertexArray = [
	                    // Front face
	                    -2.0, -1.0,  -1.0,
	                     2.0, -1.0,  -1.0,
	                     2.0,  1.0,  -1.0,
	                    -2.0,  1.0,  -1.0
	                  ];
	this.vertexItemSize = 3;
	this.vertexNumItems = 4;
	
	this.normalArray = [
	                    // Front face
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0,
	                    0.0,  0.0,  1.0
	                 ];
	this.normalItemSize = 3;
	this.normalNumItems = 4;
	
	this.textureArray = [
	                     // Front face
	                     0.0, 0.0,
	                     1.0, 0.0,
	                     1.0, 1.0,
	                     0.0, 1.0
	                   ];
	this.textureItemSize = 2;
	this.textureNumItems = 4;
	
	this.indexArray = [
	                   0, 1, 2,      0, 2, 3    // Front face
	                 ];
	this.indexItemSize = 1;
	this.indexNumItems = 6;
	
	var meshObject = new Object;
	meshObject.vertexArray = this.vertexArray;
	meshObject.vertexItemSize = this.vertexItemSize;
	meshObject.vertexNumItems = this.vertexNumItems;
	
	meshObject.normalArray = this.normalArray;
	meshObject.normalItemSize = this.normalItemSize;
	meshObject.normalNumItems = this.normalNumItems;
	
	meshObject.textureArray = this.textureArray;
	meshObject.textureItemSize = this.textureItemSize;
	meshObject.textureNumItems = this.textureNumItems;
	
	meshObject.indexArray = this.indexArray;
	meshObject.indexItemSize = this.indexItemSize;
	meshObject.indexNumItems = this.indexNumItems;
	
	node.attachMesh(meshObject);
};

StormMesh.prototype.loadObj = function(node, url, textureUniqueUrl) {
	stormEngineC.preloads++;
	
	var tUniqueUrl = undefined;
	tUniqueUrl = textureUniqueUrl;
	
    var req = new XMLHttpRequest();
    stormEngineC.setStatus('Opening import scene...', req);
    req.vertexArray = [];
    req.normalArray = [];
    req.textureArray = [];
    req.indexArray = [];
    
    req.vertexItemSize = 3;
    req.normalItemSize = 3;
    req.textureItemSize = 2;
    req.indexItemSize = 1;
    
    req.vertexNumItems = 0;
    req.normalNumItems = 0;
    req.textureNumItems = 0;
    req.indexNumItems = 0;
    
    req.node = node;
    req.textureUniqueUrl = tUniqueUrl;
    
    var stringObjDirectory = '';
    var separat = '';
    var expl = url.split("/");
    for(var n = 0; n < expl.length-1; n++) {
    	stringObjDirectory = stringObjDirectory+separat+expl[n];
    	separat = '/';
    }
    req.objDirectory = stringObjDirectory;

    req.onreadystatechange = function () {
    	if (req.readyState == 4) {
    		stormEngineC.setStatus('');
    		/**
    		 * Carga de ficheros obj basada en la librería J3DI de Apple Inc.
    		 * Adaptación a StormEngineC.
    		 * Añadida la distinción de materiales.
    		 */
        	var bufferEnCola = false;;
        	
            var vertex = [];
            var normal = [];
            var texture = [];
            var facemap = [];
            var index = 0;

            // This is a map which associates a range of indices with a name
            // The name comes from the 'g' tag (of the form "g NAME"). Indices
            // are part of one group until another 'g' tag is seen. If any indices
            // come before a 'g' tag, it is given the group name "_unnamed"
            // 'group' is an object whose property names are the group name and
            // whose value is a 2 element array with [<first index>, <num indices>]
            var groups = { };
            var currentGroup = [-1, 0];
            groups["_unnamed"] = currentGroup;

            var lines = req.responseText.split("\r\n");
            for(var n = 0; n < lines.length; n++) {
                var line = lines[n].replace(/\t+/gi, " ").replace(/\s+$/gi, "").replace(/\s+/gi, " ");

                // ignore comments
                if(line[0] == "#") {
                    continue;
                }
                
                var array = line.split(" ");
                
                if(array[0] == "mtllib") {
                	req.MtlsFile = array[1];
                }
                if(array[0] == "g") {
                    // new group
                    currentGroup = [req.indexArray.length, 0];
                    groups[array[1]] = currentGroup;
                }
                if(array[0] == "v") {
                	if(bufferEnCola == true) {
                		// crear buffer en cola
                		req.vertexNumItems = req.vertexArray.length/3;
                		req.normalNumItems = req.normalArray.length/3;
                		req.textureNumItems = req.textureArray.length/2;;
                	    req.indexNumItems = req.indexArray.length;
                	    req.node.attachMesh(req);
                	    if(req.node.useJigLibTrimesh)req.node.generateTrimesh(req);
						
                	    // reseteamos
                	    bufferEnCola = false;
                	    
                	    req.vertexArray = [];
                	    req.normalArray = [];
                	    req.textureArray = [];
                	    req.indexArray = [];
                	    
                	    req.vertexNumItems = 0;
                	    req.normalNumItems = 0;
                	    req.textureNumItems = 0;
                	    req.indexNumItems = 0;
                	    
                	    facemap = [];
                	    index = 0;
                	}
                    // vertex
                    vertex.push(parseFloat(array[1])); 
                    vertex.push(parseFloat(array[2]));
                    vertex.push(parseFloat(array[3]));
                }
                if(array[0] == "vn") {
                    // normal
                    normal.push(parseFloat(array[1]));
                    normal.push(parseFloat(array[2]));
                    normal.push(parseFloat(array[3]));
                }
                if(array[0] == "vt") {
                    // texture
                    texture.push(parseFloat(array[1]));
                    texture.push(parseFloat(array[2]));
                }
                if(array[0] == "usemtl") {
                	
                	
                	req.currentMtl = array[1];
                }
                if(array[0] == "f") {
                    // face
                    if(array.length != 4) {
                        obj.ctx.console.log("*** Error: face '"+line+"' not handled");
                        continue;
                    }

                    // f vtxA/texA/norA vtxB/texB/norB vtxC/texC/norC (los indices)
                    // recorremos cada vtx/tex/nor de la linea 'f vtxA/texA/norA vtxB/texB/norB vtxC/texC/norC'
                    // puede ser tambien de tipo f vtx vtx vtx
                    for(var i = 1; i < 4; ++i) { // primero vtxA/texA/norA, luego vtxB/texB/norB y luego vtxC/texC/norC
                    	bufferEnCola = true;
                        if(facemap[array[i]] == undefined) { //si no existe current vtx/tex/nor en array facemap se añade nueva entrada
                            // add a new entry to the map and arrays
                            var expl = array[i].split("/"); // 
                            var vtx, nor, tex;

                            if(expl.length == 1) { // si es de tipo vtx
                                vtx = parseInt(expl[0]) - 1; // current vtx
                                nor = vtx;
                                tex = vtx;
                            } else if(expl.length = 3) { // si es de tipo vtx/tex/nor
                                vtx = parseInt(expl[0]) - 1;
                                tex = parseInt(expl[1]) - 1;
                                nor = parseInt(expl[2]) - 1;
                                // se resta 1 por que en el formato obj el primero comienza en 1.
                                // en los arrays donde hemos almacenado vertex, normal y texture el primero comienza en 0.
                            } else {
                                obj.ctx.console.log("*** Error: did not understand face '"+array[i]+"'");
                                return null;
                            }

                            // primero vtx
                            // llenamos req.vertexArray con un vertice
                            var x = 0;
                            var y = 0;
                            var z = 0;
                            // en vertex tenemos un array con una coordenada por elemento
                            // vertex[0]=coordX, vertex[1]=coordY, vertex[2]=coordZ		3 coord=1 vertice
                            // current vtx hace referencia a 1 vertice completo v -0.500000 -0.500000 0.500000
                            // nos situamos en el respectivo coordX de array vertex para el actual current vtx
                            // 	desplazandonos de 3 en 3 (con *3)
                            // obtenemos tambien Y y Z sumando 1 y 2
                            if(vtx * 3 + 2 < vertex.length) { 
                                x = vertex[vtx*3];
                                y = vertex[vtx*3+1];
                                z = vertex[vtx*3+2];
                            }
                            req.vertexArray.push(x);
                            req.vertexArray.push(y);
                            req.vertexArray.push(z);

                            // llenamos req.textureArray
                            x = 0;
                            y = 0;
                            if (tex * 2 + 1 < texture.length) {
                                x = texture[tex*2];
                                y = texture[tex*2+1];
                            }
                            req.textureArray.push(x);
                            req.textureArray.push(y);

                            // llenamos req.normalArray
                            x = 0;
                            y = 0;
                            z = 1;
                            if (nor * 3 + 2 < normal.length) {
                                x = normal[nor*3];
                                y = normal[nor*3+1];
                                z = normal[nor*3+2];
                            }
                            req.normalArray.push(x);
                            req.normalArray.push(y);
                            req.normalArray.push(z);

                            facemap[array[i]] = index; // facemap[current vtx/tex/nor] = int
                            index++;
                        }

                        req.indexArray.push(facemap[array[i]]); // req.indexArray.push(int)
                        currentGroup[1]++;
                        
                    }
                    if(req.vertexArray.length/3 > 60000) {
                    	// crear buffer en cola
                		req.vertexNumItems = req.vertexArray.length/3;
                		req.normalNumItems = req.normalArray.length/3;
                		req.textureNumItems = req.textureArray.length/2;
                	    req.indexNumItems = req.indexArray.length;
                	    req.node.attachMesh(req);
                	    if(req.node.useJigLibTrimesh)req.node.generateTrimesh(req);
						
                	    // reseteamos
                	    bufferEnCola = false;
                	    
                	    req.vertexArray = [];
                	    req.normalArray = [];
                	    req.textureArray = [];
                	    req.indexArray = [];
                	    
                	    req.vertexNumItems = 0;
                	    req.normalNumItems = 0;
                	    req.textureNumItems = 0;
                	    req.indexNumItems = 0;
                	    
                	    facemap = [];
                	    index = 0;
                    }
                }
            }
//alert(vertex.length);
            // crear buffer en cola
        	req.vertexNumItems = req.vertexArray.length/3;
        	req.normalNumItems = req.normalArray.length/3;
        	req.textureNumItems = req.textureArray.length/2;;
            req.indexNumItems = req.indexArray.length;
            req.node.attachMesh(req);
			if(req.node.useJigLibTrimesh)req.node.generateTrimesh(req);
			
			stormEngineC.preloads--;
        }
    };
    req.open("GET", url, true);
    req.send(null);
};