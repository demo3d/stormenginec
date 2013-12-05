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

 
/**
 * Contructor
 */
StormUtils = function(elements) {
	
};
/**
* Get random vector from vecNormal with deviation in degrees with Ns 
* @param StormV3 vecNormal - normal
* @param int Ns - deviation
* @returns StormV3
*/
StormUtils.prototype.getVector = function(vecNormal, Ns) {
	var r = Math.sqrt((vecNormal.e[0]*vecNormal.e[0]) + (vecNormal.e[1]*vecNormal.e[1]) + (vecNormal.e[2]*vecNormal.e[2]))
	var angleLat = Math.acos(vecNormal.e[2]/1.0);
	var angleAzim = Math.atan2(vecNormal.e[1],vecNormal.e[0]);
			
	var desvX = -1.0+(Math.random()*2.0);
	var desvY = -1.0+(Math.random()*2.0);
	angleLat += (Ns*desvX)*1.6;
	angleAzim += (Ns*desvY)*1.6;

	var x = Math.sin(angleLat)*Math.cos(angleAzim);
	var y = Math.sin(angleLat)*Math.sin(angleAzim);
	var z = Math.cos(angleLat);
	
	return $V3([x,y,z]);
};

// degree to radian. Full circle = 360 degrees.
StormUtils.prototype.degToRad = function(deg) {
	return (deg*3.14159)/180;
};
// radian to degree
StormUtils.prototype.radToDeg = function(rad) {
	return rad*(180/3.14159);
};

StormUtils.prototype.dump = function(obj) {
	var out = '';
	for (var i in obj) {
		out += i + ": " + obj[i] + "\n";
	}
	alert(out);
};

