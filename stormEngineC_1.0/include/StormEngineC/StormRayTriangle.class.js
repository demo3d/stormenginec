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
RayTriangleIntersect de softSurfer modificado y portado a javascript por Roberto Gonzalez.
Copyright 2001, softSurfer (www.softsurfer.com)
This code may be freely used and modified for any purpose
providing that this copyright notice is included with it.
SoftSurfer makes no warranty for this code, and cannot be held
liable for any real or imagined damage resulting from its use.
Users of this code must verify correctness for their application.
*/

/*
 * Chequear interseccion entre una linea y un triangulo
 */
StormRayTriangle = function() {
	this.vecN = null;
	this.p = null;
};
/*
 * Aqui damos el conjunto linea-triangulo que debe ser procesado
 * @param $V3 vecRayOrigin - posicion del origen de la linea
 * @param $V3 vecRayEnd - posicion del fin de la linea
 * @param $V3 vecVertexA - posicion del 1º vertice del triangulo
 * @param $V3 vecVertexB - posicion del 2º vertice del triangulo
 * @param $V3 vecVertexC - posicion del 3º vertice del triangulo
 */
StormRayTriangle.prototype.setRayTriangle = function(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC) {
	var SMALL_NUM = 0.00000001;

	var u = vecVertexB.subtract(vecVertexA);
	var v = vecVertexC.subtract(vecVertexA);
	this.vecN = u.cross(v); // normal al triangulo
	
	if(this.vecN.equal($V3([0.0, 0.0, 0.0]))) { // triangulo mal formado
		return 0;
	}
	var vecDir = vecRayEnd.subtract(vecRayOrigin); // direccion del rayo
	var vecW0 = vecRayOrigin.subtract(vecVertexA);
	var a = this.vecN.dot(vecW0)*-1.0;
	var b = this.vecN.dot(vecDir);
	if(Math.abs(b) < SMALL_NUM) {
		if(a == 0) { // intersecta paralelo a triangulo 
			//this.pRender = 0.01;
			//return 0;
		} else {
			return 0; // no intersecta
		}
	}

	
	var r = a / b; // distancia al punto de interseccion
	if (-r < 0.0 && -r > 1.0) {
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

	this.p = vecDir.modulus()*r; // interseccion esta dentro del triangulo
	
	return 0;
};

/*
 * Si existe interseccion a lo largo de la linea dada devuelve la distancia desde vecRayOrigin al punto de interseccion
 * de lo contrario devuelve null
 * Ejemplo: si la linea tiene un modulo de 10.0 y a la mitad de la linea hay algo intersectando, getP devuelve 5.0
 * si intersecta por el principio: de 0.0 a 5.0; por el final: de 5.0 a 10.0
 */
StormRayTriangle.prototype.getP = function() {
	return this.p;
};

/*
 * Si existe interseccion devuelve la normal de lo contrario devuelve null
 */
StormRayTriangle.prototype.getN = function() {
	return this.vecN.normalize();
};