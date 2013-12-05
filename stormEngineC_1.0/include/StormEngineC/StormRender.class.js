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
StormRender = function(width, height) {
	this.viewportWidth = width;
	this.viewportHeight = height;
	
	this.g_targetCanvas2DId = document.getElementById("stormCanvas2D");
	this.g_targetCanvas2DId.width = width;
	this.g_targetCanvas2DId.height = height;
	this.gl2D = this.g_targetCanvas2DId.getContext("2d");
	this.gl2D.fillStyle = "rgba(255, 255, 255, 255)";
	this.gl2D.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
	this.canvasData = this.gl2D.getImageData(0, 0, this.viewportWidth, this.viewportHeight);
	
	//this.Coloffsets = [0,16,32,48,64,80,96,112]; // 128
	//this.Coloffsets = [0,16,32,48,64,80,96,112,128,144,160,176,192,208,224,240]; // 256
	this.Coloffsets = [0,16,32,48,64,80,96,112,128,144,160,176,192,208,224,240,256,272,288,304,320,336,352,368,384,400,416,432,448,464,480,496]; // 512
	//this.Coloffsets = new Uint16Array([0,16,32,48,64,80,96,112,128,144,160,176,192,208,224,240,256,272,288,304,320,336,352,368,384,400,416,432,448,464,480,496,512,528,544,560,576,592,608,624,640,656,672,688,704,720,736,752,768,784,800,816,832,848,864,880,896,912,928,944,960,976,992,1008]); // 1024
	this.currentColOffset = 0;
	this.row = 0;
	this.maxBounces = 1;
};
StormRender.prototype.makeRender = function(nodeCam) {
	document.getElementById("stormRenderContext").style.display = "block";
	
	this.arrayAlbedo = [];
	
	var distanciaAlPlano = 1.0;
    
	var posCamera;
	var posCameraPivot;
	if(nodeCam != undefined) {
		this.posCamera = $V3([nodeCam.nodeGoal.mWMatrix.e[3], nodeCam.nodeGoal.mWMatrix.e[7], nodeCam.nodeGoal.mWMatrix.e[11]]);
		this.posCameraPivot = $V3([nodeCam.nodePivot.mWMatrix.e[3], nodeCam.nodePivot.mWMatrix.e[7], nodeCam.nodePivot.mWMatrix.e[11]]);
		posCamera = this.posCamera;
		posCameraPivot = this.posCameraPivot;
	} else {
		posCamera = this.posCamera;
		posCameraPivot = this.posCameraPivot;
	}
    
    var vecView = posCameraPivot.subtract(posCamera).normalize();
    
    var centroPlanoProyeccion = posCamera.add(vecView.x(distanciaAlPlano));
    
    var vecXPlanoProyeccion = $V3([0.0, 1.0, 0.0]).cross(vecView).normalize();
    var vecYPlanoProyeccion = vecView.cross(vecXPlanoProyeccion).normalize();
    
    var widthPlanoProyeccion = 2 * (Math.tan(34.96)*2.0) * distanciaAlPlano;
    var heightPlanoProyeccion = 2 * Math.tan(34.96) * distanciaAlPlano;
    var widthPixel = widthPlanoProyeccion / this.viewportWidth;
    var heightPixel = heightPlanoProyeccion / this.viewportHeight;
    
    var locFirstX = vecXPlanoProyeccion.x( ( (this.viewportWidth/2.0)*widthPixel));
    var locFirstY = vecYPlanoProyeccion.x( ( (this.viewportHeight/2.0)*heightPixel));
    var pixelOrigin = centroPlanoProyeccion.add(locFirstX);
    pixelOrigin = pixelOrigin.add(locFirstY);
    
    if(this.row >= this.viewportHeight) {
    	this.row = 0;
    	this.currentColOffset++;
    }
    if(this.currentColOffset >= 16) {
    	this.currentColOffset = 0;
    }
    for (var id = 0; id < this.Coloffsets.length; id++) {
    		var col = (this.Coloffsets[id])+this.currentColOffset;
    		if(col < this.viewportWidth) {
    			var pixelPos = pixelOrigin.add(vecXPlanoProyeccion.x(-1.0).x( col*widthPixel));
        		pixelPos = pixelPos.add(vecYPlanoProyeccion.x(-1.0).x(this.row*heightPixel));
        		var currentPixelDir = $V3([pixelPos.e[0], pixelPos.e[1], pixelPos.e[2]]).subtract(posCamera).normalize();
        		
        		this.arrayAlbedo = [];
        		var color = this.trace(posCamera, posCamera.add(currentPixelDir.x(10.0)), 0);
        		//this.trace(posCamera, posCamera.add($V3([0.0,0.0,-1.0]).x(100.0)), 1);
        		

        		
        		
        		var idx = ((this.row * this.viewportWidth) + col) * 4;
        		this.canvasData.data[idx + 0] = color.e[0];
                this.canvasData.data[idx + 1] = color.e[1];
                this.canvasData.data[idx + 2] = color.e[2];
                this.canvasData.data[idx + 3] = 255;
                
    	    }
    		
    		
    }
    	
    this.gl2D.putImageData(this.canvasData, 0, 0);
    this.row++;
    
    if(!stormEngineC.pauseRender)setTimeout("stormEngineC.renderImage.makeRender();",1);
    else document.getElementById("stormRenderContext").style.display="none";
    /*var pixels =  new Uint8Array(this.canvasData.data);
	
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);*/
};
StormRender.prototype.renderMakeFinalColor = function(currentBounce, primaryAlbedo) {
	var luminance = 1.0/currentBounce;
	var pixelColor = primaryAlbedo.x(luminance);
	return pixelColor;
};
StormRender.prototype.trace = function(vecRayOrigin, vecRayEnd, currentBounce, primaryAlbedo) {
	this.nearNode = null;
	this.nearDistance = 1000000000.0;
	this.nearNormal = null;

	this.renderRayScene(vecRayOrigin, vecRayEnd);
		
	if(this.nearDistance < 1000000000.0) { // hit
		if(this.nearNode.renderTypeEmitter == false) {
			if(primaryAlbedo == undefined) {
				var primaryAlbedo = this.nearNode.renderAlbedo;
			} else {
				this.arrayAlbedo.push(this.nearNode.renderAlbedo);
			}
			
			currentBounce++;
			
			var dirInicial = vecRayEnd.subtract(vecRayOrigin).normalize();
			vecRayOrigin = vecRayOrigin.add(dirInicial.x(this.nearDistance-0.005));
			var reflectedRay = dirInicial.reflect(this.nearNormal);
			vecRayEnd = vecRayOrigin.add(reflectedRay.x(10.0));

			return this.trace(vecRayOrigin, vecRayEnd, currentBounce, primaryAlbedo);
		}
	}
	

	if(primaryAlbedo == undefined) {
		return $V3([255, 255, 255]); // directo al cielo desde el principio
	} else {
		return this.renderMakeFinalColor(currentBounce, primaryAlbedo);
	}
	
	
	return false;
};
StormRender.prototype.renderRayScene = function(vecRayOrigin, vecRayEnd) {
	var n;
	var nb;
	var b;
	this.nodes = stormEngineC.nodes;
	this.lines = stormEngineC.lines;
	for(n = 0; n < this.nodes.length; n++) {
		
		for(nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			// recorremos vertices del objeto(nodo) segun su indice
			var bO = this.nodes[n].buffersObjects[nb];
			for(b = 0; b < bO.nodeMeshIndexArray.length/3; b++) {
				var saltosIdx = b*3; 

				var vtxA = bO.nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
				var vtxB = bO.nodeMeshIndexArray[saltosIdx+1] * 3;
				var vtxC = bO.nodeMeshIndexArray[saltosIdx+2] * 3;
				
				// vertice
				var matVertexA = $M16([
					                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[vtxA],
					                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[vtxA+1],
					                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[vtxA+2],
					                     0.0, 0.0, 0.0, 1.0
					                     ]);
				matVertexA = this.nodes[n].mWMatrixFrame.x(matVertexA);
				
				var matVertexB = $M16([
					                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[vtxB],
					                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[vtxB+1],
					                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[vtxB+2],
					                     0.0, 0.0, 0.0, 1.0
					                     ]);
				matVertexB = this.nodes[n].mWMatrixFrame.x(matVertexB);
				
				var matVertexC = $M16([
					                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[vtxC],
					                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[vtxC+1],
					                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[vtxC+2],
					                     0.0, 0.0, 0.0, 1.0
					                     ]);
				matVertexC = this.nodes[n].mWMatrixFrame.x(matVertexC);

					
					
					
				var vecVertexA = $V3([matVertexA.e[3], matVertexA.e[7], matVertexA.e[11]]); // posicion xyz en WORLD SPACE de un vertice
				var vecVertexB = $V3([matVertexB.e[3], matVertexB.e[7], matVertexB.e[11]]);
				var vecVertexC = $V3([matVertexC.e[3], matVertexC.e[7], matVertexC.e[11]]);
				
				
				// si tenemos 3 vertices podemos comprobar interseccion de vecRayOrigin, vecRayEnd con el triangulo dado por los 3 vertices

				var stormRayTriangle = new StormRayTriangle();
				stormRayTriangle.setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC);
				var p = stormRayTriangle.getP();
				var normal = stormRayTriangle.getN();

			    if(p > 0.0 && p < 1000000000.0){
			    	if(p < this.nearDistance) {
			    		this.nearDistance = p;			    		
			    		this.nearNode = this.nodes[n];
			    		this.nearNormal = normal;
			    	}
			    }

			    
			    
			}
		}	
	}
};
StormRender.prototype.intersectRayTriangleG = function( vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC) {
	var SMALL_NUM = 0.00000001;

	var u = vecVertexB.subtract(vecVertexA);
	var v = vecVertexC.subtract(vecVertexA);
	this.vecNRender = u.cross(v); // normal al triangulo
	
	if(this.vecNRender.equal($V3([0.0, 0.0, 0.0]))) { // triangulo mal formado
		return 0;
	}
	var vecDir = vecRayEnd.subtract(vecRayOrigin); // direccion del rayo
	var vecW0 = vecRayOrigin.subtract(vecVertexA);
	var a = this.vecNRender.dot(vecW0)*-1.0;
	var b = this.vecNRender.dot(vecDir);
	if(Math.abs(b) < SMALL_NUM) {
		if(a == 0) { // intersecta paralelo a triangulo 
			//this.pRender = 0.01;
			//return 0;
		} else {
			return 0; // no intersecta
		}
	}

	
	var r = a / b; // distancia al punto de interseccion
	if (-r < 0.0 && -r > 1.0) { // si mayor a vecRayEnd no intersecta
		return 0; // no intersecta
	}

	var vecIntersect = vecRayOrigin.add(vecDir.x(r)); // vector desde origen a punto de intersección


	var uu = u.dot(u);
	var uv = u.dot(v);
	var vv = v.dot(v);
	var vecW = vecIntersect.subtract(vecVertexA);
	var wu = vecW.dot(u);
	var wv = vecW.dot(v);
	var D = (uv * uv) - (uu * vv);
	
	
	var s = ((uv * wv) - (vv * wu)) / D;
	if (s < 0.0 || s > 1.0) {
		return 0; // interseccion esta fuera del triangulo
	}
	var t = ((uv * wu) - (uu * wv)) / D;
	if (t < 0.0 || (s + t) > 1.0) {
		return 0; // interseccion esta fuera del triangulo
	}
	
	this.pRender = r; // interseccion esta dentro del triangulo
	return 0;
};