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
StormJigLibJS = function() {
	this.dynamicsWorld;
	var t0=new Date().getTime(),ta=0,oi=0;
	this.nodes = stormEngineC.nodes;
	this.nodesCam = stormEngineC.nodesCam;
};


StormJigLibJS.prototype.createJigLibWorld = function() {
	this.dynamicsWorld = jiglib.PhysicsSystem.getInstance();
	this.dynamicsWorld.setCollisionSystem(true);
	this.colSystem = this.dynamicsWorld.getCollisionSystem();
	//this.dynamicsWorld.setCollisionSystem(true,-100,-100,-100,200,200,200,3,3,3);

	this.dynamicsWorld.setGravity(new Vector3D( 0, -100.0, 0, 0 ));
	this.dynamicsWorld.setSolverType("NORMAL");
};

StormJigLibJS.prototype.update = function(elapsed) {
	this.dynamicsWorld.integrate(0.01);

	// NODOS
	for(var n = 0; n < this.nodes.length; n++) {
		
		if(this.nodes[n].body != undefined) {
			var x = this.nodes[n].body.get_currentState().position.x;
			var y = this.nodes[n].body.get_currentState().position.y;
			var z = this.nodes[n].body.get_currentState().position.z;
			var b = this.nodes[n].body._currState.orientation._rawData;
		
			this.nodes[n].mWMatrix = $M16([
								b[0], b[1], b[2], x,
								b[4], b[5], b[6], y,
								b[8], b[9], b[10], z,
								this.nodes[n].mWMatrix.e[12], this.nodes[n].mWMatrix.e[13], this.nodes[n].mWMatrix.e[14], this.nodes[n].mWMatrix.e[15]
									]);
		}
		if(this.nodes[n].car != undefined) {
		
			this.nodes[n].ndWheelFL.mWMatrix.e[3] = this.nodes[n].wheelFL.worldPos.x;
			this.nodes[n].ndWheelFL.mWMatrix.e[7] = this.nodes[n].wheelFL.worldPos.y;
			this.nodes[n].ndWheelFL.mWMatrix.e[11] = this.nodes[n].wheelFL.worldPos.z;
			
			this.nodes[n].ndWheelFR.mWMatrix.e[3] = this.nodes[n].wheelFR.worldPos.x;
			this.nodes[n].ndWheelFR.mWMatrix.e[7] = this.nodes[n].wheelFR.worldPos.y;
			this.nodes[n].ndWheelFR.mWMatrix.e[11] = this.nodes[n].wheelFR.worldPos.z;
			
			this.nodes[n].ndWheelBL.mWMatrix.e[3] = this.nodes[n].wheelBL.worldPos.x;
			this.nodes[n].ndWheelBL.mWMatrix.e[7] = this.nodes[n].wheelBL.worldPos.y;
			this.nodes[n].ndWheelBL.mWMatrix.e[11] = this.nodes[n].wheelBL.worldPos.z;
			
			this.nodes[n].ndWheelBR.mWMatrix.e[3] = this.nodes[n].wheelBR.worldPos.x;
			this.nodes[n].ndWheelBR.mWMatrix.e[7] = this.nodes[n].wheelBR.worldPos.y;
			this.nodes[n].ndWheelBR.mWMatrix.e[11] = this.nodes[n].wheelBR.worldPos.z;
			
			this.nodes[n].ndWheelFL.mWMatrix.e = [	this.nodes[n].mWMatrix.e[0],this.nodes[n].mWMatrix.e[1],this.nodes[n].mWMatrix.e[2],this.nodes[n].ndWheelFL.mWMatrix.e[3],
													this.nodes[n].mWMatrix.e[4],this.nodes[n].mWMatrix.e[5],this.nodes[n].mWMatrix.e[6],this.nodes[n].ndWheelFL.mWMatrix.e[7],
													this.nodes[n].mWMatrix.e[8],this.nodes[n].mWMatrix.e[9],this.nodes[n].mWMatrix.e[10],this.nodes[n].ndWheelFL.mWMatrix.e[11],
													this.nodes[n].ndWheelFL.mWMatrix.e[12],this.nodes[n].ndWheelFL.mWMatrix.e[13],this.nodes[n].ndWheelFL.mWMatrix.e[14],this.nodes[n].ndWheelFL.mWMatrix.e[15]];
													
			this.nodes[n].ndWheelFR.mWMatrix.e = [	this.nodes[n].mWMatrix.e[0],this.nodes[n].mWMatrix.e[1],this.nodes[n].mWMatrix.e[2],this.nodes[n].ndWheelFR.mWMatrix.e[3],
													this.nodes[n].mWMatrix.e[4],this.nodes[n].mWMatrix.e[5],this.nodes[n].mWMatrix.e[6],this.nodes[n].ndWheelFR.mWMatrix.e[7],
													this.nodes[n].mWMatrix.e[8],this.nodes[n].mWMatrix.e[9],this.nodes[n].mWMatrix.e[10],this.nodes[n].ndWheelFR.mWMatrix.e[11],
													this.nodes[n].ndWheelFR.mWMatrix.e[12],this.nodes[n].ndWheelFR.mWMatrix.e[13],this.nodes[n].ndWheelFR.mWMatrix.e[14],this.nodes[n].ndWheelFR.mWMatrix.e[15]];
													
			this.nodes[n].ndWheelBL.mWMatrix.e = [	this.nodes[n].mWMatrix.e[0],this.nodes[n].mWMatrix.e[1],this.nodes[n].mWMatrix.e[2],this.nodes[n].ndWheelBL.mWMatrix.e[3],
													this.nodes[n].mWMatrix.e[4],this.nodes[n].mWMatrix.e[5],this.nodes[n].mWMatrix.e[6],this.nodes[n].ndWheelBL.mWMatrix.e[7],
													this.nodes[n].mWMatrix.e[8],this.nodes[n].mWMatrix.e[9],this.nodes[n].mWMatrix.e[10],this.nodes[n].ndWheelBL.mWMatrix.e[11],
													this.nodes[n].ndWheelBL.mWMatrix.e[12],this.nodes[n].ndWheelBL.mWMatrix.e[13],this.nodes[n].ndWheelBL.mWMatrix.e[14],this.nodes[n].ndWheelBL.mWMatrix.e[15]];
													
			this.nodes[n].ndWheelBR.mWMatrix.e = [	this.nodes[n].mWMatrix.e[0],this.nodes[n].mWMatrix.e[1],this.nodes[n].mWMatrix.e[2],this.nodes[n].ndWheelBR.mWMatrix.e[3],
													this.nodes[n].mWMatrix.e[4],this.nodes[n].mWMatrix.e[5],this.nodes[n].mWMatrix.e[6],this.nodes[n].ndWheelBR.mWMatrix.e[7],
													this.nodes[n].mWMatrix.e[8],this.nodes[n].mWMatrix.e[9],this.nodes[n].mWMatrix.e[10],this.nodes[n].ndWheelBR.mWMatrix.e[11],
													this.nodes[n].ndWheelBR.mWMatrix.e[12],this.nodes[n].ndWheelBR.mWMatrix.e[13],this.nodes[n].ndWheelBR.mWMatrix.e[14],this.nodes[n].ndWheelBR.mWMatrix.e[15]];
													
			
													
			

			var mult = -(this.nodes[n].getCurrentVelocity()/this.nodes[n].carMaxVelocity)/4;

			this.nodes[n].ndWheelFL.setRotation(degToRad(this.nodes[n].wheelFL.getSteerAngle()), $V3([0.0, 1.0, 0.0]));
			this.nodes[n].ndWheelFL.setRotation(mult, $V3([1.0, 0.0, 0.0]), 'OBJECT');
			//this.nodes[n].ndWheelFL.setRotation(this.nodes[n].wheelFL.getRollAngle(), $V3([0.0, 0.0, 1.0]));
			
			this.nodes[n].ndWheelFR.setRotation(degToRad(this.nodes[n].wheelFR.getSteerAngle()), $V3([0.0, 1.0, 0.0]));
			this.nodes[n].ndWheelFR.setRotation(mult, $V3([1.0, 0.0, 0.0]), 'OBJECT');
			//this.nodes[n].ndWheelFR.setRotation(this.nodes[n].wheelFR.getRollAngle(), $V3([0.0, 0.0, 1.0]));
			
			this.nodes[n].ndWheelBL.setRotation(degToRad(this.nodes[n].wheelBL.getSteerAngle()), $V3([0.0, 1.0, 0.0]));
			this.nodes[n].ndWheelBL.setRotation(mult, $V3([1.0, 0.0, 0.0]), 'OBJECT');
			//this.nodes[n].ndWheelBL.setRotation(this.nodes[n].wheelBL.getRollAngle(), $V3([0.0, 0.0, 1.0]));
			
			this.nodes[n].ndWheelBR.setRotation(degToRad(this.nodes[n].wheelBR.getSteerAngle()), $V3([0.0, 1.0, 0.0]));
			this.nodes[n].ndWheelBR.setRotation(mult, $V3([1.0, 0.0, 0.0]), 'OBJECT');
			//this.nodes[n].ndWheelBR.setRotation(this.nodes[n].wheelBR.getRollAngle(), $V3([0.0, 0.0, 1.0]));
			
			
		}
		
	}
	
	// NODOS CAMARA
	for(var n = 0; n < this.nodesCam.length; n++) {
		if(this.nodesCam[n].nodePivot.body != undefined) {
			
		}
	}
	
	
	
};