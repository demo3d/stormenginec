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

/* 
StormLineSceneCollision

 */
StormLineSceneCollision = function() {
	this.nodes = stormEngineC.nodes;
	this.lines = stormEngineC.lines;
};

StormLineSceneCollision.prototype.checkCollision = function(vecOrigin, vecEnd) {	
	/*var line = new Object; // mostrar normales
	line.origin = vecRayOrigin;
	line.end = vecRayEnd;
	this.lines.push(line);*/
	
	this.nearNode = null;
	this.nearDistance = 1000000000.0;
	this.nearNormal = null;
	
	var n;
	var nb;
	var b;
	var margin = 0.02;
	for(n = 0; n < this.nodes.length; n++) {
		// recorremos de nuevo objetos de la escena para comprobar si existe interseccion con algun triangulo de la escena del vector vecRayOrigin-vecRayEnd

		for(nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			// recorremos vertices del objeto(nodo) segun su indice
			var bO = this.nodes[n].buffersObjects[nb];
			for(b = 0; b < bO.nodeMeshIndexArray.length/3; b++) {
				// AABB por caras
				var saltosIdx = b*3; 
				var idxA = bO.nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
				var idxB = bO.nodeMeshIndexArray[saltosIdx+1] * 3;
				var idxC = bO.nodeMeshIndexArray[saltosIdx+2] * 3;
				
				// vertice
				var matVertexA = $M16([
					                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxA],
					                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxA+1],
					                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxA+2],
					                     0.0, 0.0, 0.0, 1.0
					                     ]);
				matVertexA = this.nodes[n].mWMatrixFrame.x(matVertexA);
				
				var matVertexB = $M16([
					                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxB],
					                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxB+1],
					                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxB+2],
					                     0.0, 0.0, 0.0, 1.0
					                     ]);
				matVertexB = this.nodes[n].mWMatrixFrame.x(matVertexB);
				
				var matVertexC = $M16([
					                     1.0, 0.0, 0.0, bO.nodeMeshVertexArray[idxC],
					                     0.0, 1.0, 0.0, bO.nodeMeshVertexArray[idxC+1],
					                     0.0, 0.0, 1.0, bO.nodeMeshVertexArray[idxC+2],
					                     0.0, 0.0, 0.0, 1.0
					                     ]);
				matVertexC = this.nodes[n].mWMatrixFrame.x(matVertexC);

					
					
					
				var vecVertexA = $V3([matVertexA.e[3], matVertexA.e[7], matVertexA.e[11]]); // posicion xyz en WORLD SPACE de un vertice
				var vecVertexB = $V3([matVertexB.e[3], matVertexB.e[7], matVertexB.e[11]]);
				var vecVertexC = $V3([matVertexC.e[3], matVertexC.e[7], matVertexC.e[11]]);
				
				
				// tenemos 3 vertices podemos comprobar interseccion de vecRayOrigin, vecRayEnd con el triangulo dado por los 3 vertices
				var stormRayTriangle = new StormRayTriangle();
				stormRayTriangle.setRayTriangle(vecOrigin, vecEnd, vecVertexA, vecVertexB, vecVertexC);
				var p = stormRayTriangle.getP();
				var normal = stormRayTriangle.getN();
				
			    if(p > 0.0){
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

StormLineSceneCollision.prototype.getCollisionDistance = function() {	
	return this.nearDistance;
};
StormLineSceneCollision.prototype.getCollisionNode = function() {	
	return this.nearNode;
};
StormLineSceneCollision.prototype.getCollisionNormal = function() {	
	return this.nearNormal;
};