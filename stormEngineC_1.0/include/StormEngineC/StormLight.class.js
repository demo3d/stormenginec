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
StormLight = function() {
	this.objectType = 'light';
	this.type = 'directional'; // directional or omni
	this.direction = $V3([-0.5,-0.3,-0.5]);
	this.color = $V3([1.0, 1.0, 1.0]);
};
StormLight.prototype = new StormNode();




