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
StormRayLens = function() {
	this.N1 = null;
};
/**
* Aqui damos el conjunto linea-triangulo que debe ser procesado
* @type Void
* @private 
* @param {StormV3} vecRayOrigin Line origin position
* @param {StormV3} vecRayEnd Line end position
* @param {Float} m1 Refract index way 1
* @param {Float} m2 Refract index way 2

* @returns {Array} [	float col, // 1.0 col | 0.0 nocol
				float posColX, float posColY, float posColZ,
				float vecNormalOutRayX, vecNormalOutRayY, vecNormalOutRayZ ]
*/
StormRayLens.prototype.setRayLens = function(vecRayOrigin, vecRayEnd, m1, m2) {
	var col = -1.0;
	var rayOrigin = $V3([vecRayOrigin.e[0], vecRayOrigin.e[1], vecRayOrigin.e[2]]);
	var rayEnd = $V3([vecRayEnd.e[0], vecRayEnd.e[1], vecRayEnd.e[2]]);
	
	var dir = rayEnd.subtract(rayOrigin);
	dir = dir.normalize();
	
	var dC = stormEngineC.defaultCamera;
	var vecVertexA = dC.centroPlanoProyeccion.add(dC.vecXPlanoProyeccion.x(-dC.widthLens)); //top-left
	vecVertexA = vecVertexA.add(dC.vecYPlanoProyeccion.x(dC.widthLens));
	var vecVertexB = dC.centroPlanoProyeccion.add(dC.vecXPlanoProyeccion.x(-dC.widthLens)); //bottom-left
	vecVertexB = vecVertexB.add(dC.vecYPlanoProyeccion.x(-dC.widthLens));
	var vecVertexC = dC.centroPlanoProyeccion.add(dC.vecXPlanoProyeccion.x(dC.widthLens)); //top-right
	vecVertexC = vecVertexC.add(dC.vecYPlanoProyeccion.x(dC.widthLens));
	var vecVertexD = dC.centroPlanoProyeccion.add(dC.vecXPlanoProyeccion.x(dC.widthLens)); //bottom-right
	vecVertexD = vecVertexD.add(dC.vecYPlanoProyeccion.x(-dC.widthLens));
		
	var ang = 0.4; // lens curvature
	var rayEndF = $V3([0.0, 0.0, 0.0]);
	var outRayend = $V3([0.0, 0.0, 0.0]);
	
	var rayTriangle = new StormRayTriangle();
	rayTriangle.setRayTriangle(rayOrigin, rayEnd, vecVertexA, vecVertexB, vecVertexC);
	var intersectDistance = rayTriangle.getP();
	if(intersectDistance != 0.0) {
		rayEndF = rayOrigin.add(dir.x(intersectDistance)); 
			
			var norA = dC.vecView.add( dC.vecXPlanoProyeccion.x(-ang).add(dC.vecYPlanoProyeccion.x(ang)) );
			var norB = dC.vecView.add( dC.vecXPlanoProyeccion.x(-ang).add(dC.vecYPlanoProyeccion.x(-ang)) );
			var norC = dC.vecView.add( dC.vecXPlanoProyeccion.x(ang).add(dC.vecYPlanoProyeccion.x(ang)) );
			norA.normalize();norB.normalize();norC.normalize();
			
			var wA = (1.0-(rayTriangle.getS()+rayTriangle.getT()));
			var wB = rayTriangle.getS();
			var wC = rayTriangle.getT();
			
			norA = norA.subtract(dC.vecView).x(wA);
			norB = norB.subtract(dC.vecView).x(wB);
			norC = norC.subtract(dC.vecView).x(wC);
			var normal = dC.vecView.add(norA);
			normal = normal.add(norB);
			normal = normal.add(norC);
			normal = normal.normalize();
			this.N1 = normal;
			
		var vecNormalRefract = stormEngineC.utils.refract(dir, normal, m1, m2);
		var outRayend = vecNormalRefract.normalize();
		
		col = 1.0;
	}
 
	if(col == -1.0) { 
		rayTriangle.setRayTriangle(rayOrigin, rayEnd, vecVertexD, vecVertexB, vecVertexC);
		var intersectDistance = rayTriangle.getP();
		if(intersectDistance != 0.0) {
			rayEndF = rayOrigin.add(dir.x(intersectDistance)); 
			 
				var norD = dC.vecView.add( dC.vecXPlanoProyeccion.x(ang).add(dC.vecYPlanoProyeccion.x(-ang)) );
				var norB = dC.vecView.add( dC.vecXPlanoProyeccion.x(-ang).add(dC.vecYPlanoProyeccion.x(-ang)) );
				var norC = dC.vecView.add( dC.vecXPlanoProyeccion.x(ang).add(dC.vecYPlanoProyeccion.x(ang)) );
				norD.normalize();norB.normalize();norC.normalize();
			
				var wA = (1.0-(rayTriangle.getS()+rayTriangle.getT()));
				var wB = rayTriangle.getS();
				var wC = rayTriangle.getT();
				
				norD = norD.subtract(dC.vecView).x(wA);
				norB = norB.subtract(dC.vecView).x(wB);
				norC = norC.subtract(dC.vecView).x(wC);
				var normal = dC.vecView.add(norD);
				normal = normal.add(norB);
				normal = normal.add(norC);
				normal = normal.normalize();
				this.N1 = normal;
				
			var vecNormalRefract = stormEngineC.utils.refract(dir, normal, m1, m2);
			var outRayend = vecNormalRefract.normalize();
			
			col = 1.0;
		}
	}
	
	return [col, rayEndF.e[0], rayEndF.e[1], rayEndF.e[2], outRayend.e[0], outRayend.e[1], outRayend.e[2]];
};

// Normal punto hit 1
/**
* @returns {StormV3}
* @private 
*/
StormRayLens.prototype.getN1 = function() {
	
	return this.N1;
};