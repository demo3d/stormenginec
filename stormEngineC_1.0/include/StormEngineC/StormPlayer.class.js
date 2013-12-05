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
 * Clase StormPlayer basada en tercera persona  para WebGL con librería física jiglibJS
 * @author Roberto Gonzalez Dominguez. StormColor.com
 */
StormPlayer = function(camDistance) {
	
	
	this.g_forwardFC = 0;
	this.g_backwardFC = 0;
	this.g_strafeLeftFC = 0;
	this.g_strafeRightFC = 0;
	this.leftButton = 0;
	this.middleButton = 0;
	this.rightButton = 0;
	this.startDrag = false;
	
	this.cameraPivotFC;
	this.cameraGoalFC;
	this.meshNode;
	
	this.lastX;
	this.lastY;
	
	
	// inicializamos algunos valores
	this.lastX = 0;
	this.lastY = 0;
	this.pivotPitch = 0;
	this.camDistance = camDistance;
	
	this.alwaysMove = false;
};
/**
 * Al pulsar tecla
 * @param event event
 */
StormPlayer.prototype.keyDownFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 1;
    }
};
/**
 * Al levantar tecla
 * @param event event
 */
StormPlayer.prototype.keyUpFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 0;
		this.cameraPivotFC.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 0;
		this.cameraPivotFC.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 0;
		this.cameraPivotFC.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 0;
		this.cameraPivotFC.body.setLineVelocity( new Vector3D(0,0,0), false );
    }
};
StormPlayer.prototype.mouseMoveFC = function(event) {
	this.updateCameraGoalFC(event);
};
StormPlayer.prototype.mouseDownFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 1;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 1;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 1;
	}
	this.updateCameraGoalFC(event);
};
StormPlayer.prototype.mouseUpFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 0;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 0;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 0;
	}
	this.updateCameraGoalFC(event);
};

StormPlayer.prototype.playerSetupFC = function(node) {
	if(node != undefined) {
		this.meshNode = node;
	} else {
		this.meshNode = new StormNode();
	}
	this.meshNode.setPosition($V3([0.0, 0.0, 0.0]));
};

StormPlayer.prototype.cameraSetupFC = function(cameraNode) {
	this.cameraGoalFC = cameraNode.nodeGoal;
	this.cameraPivotFC = cameraNode.nodePivot;

	this.meshNode.setPosition($V3([this.cameraPivotFC.getPosition().e[0], this.cameraPivotFC.getPosition().e[1], this.cameraPivotFC.getPosition().e[2]]));
	
};
StormPlayer.prototype.enableCollision = function(jsonIn) {
	if(jsonIn.conf.type == "capsule") var shape = new jiglib.JCapsule(null,jsonIn.conf.r,jsonIn.conf.l);
	if(jsonIn.conf.type == "sphere") var shape = new jiglib.JSphere(null, jsonIn.conf.dimensions);
	if(jsonIn.conf.type == "box") var shape = new jiglib.JBox(null,jsonIn.conf.dimensions.e[0],jsonIn.conf.dimensions.e[2],jsonIn.conf.dimensions.e[1]);//width, depth, height
			
	shape.set_friction(jsonIn.friction);
	shape.set_restitution(jsonIn.restitution);
	shape.set_rotVelocityDamping(new Vector3D(0.999,0.999,0.999,0));
	shape.set_linVelocityDamping(new Vector3D(0.999,0.999,0.999,0));
	shape.set_mass(jsonIn.mass);
	
	
	
	this.cameraPivotFC.body = shape;
	
	stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.cameraPivotFC.body);
	stormEngineC.stormJigLibJS.colSystem.addCollisionBody(this.cameraPivotFC.body);
	
	this.cameraPivotFC.body.moveTo(new Vector3D(this.cameraPivotFC.mWMatrix.e[3],this.cameraPivotFC.mWMatrix.e[7],this.cameraPivotFC.mWMatrix.e[11],0));
};

StormPlayer.prototype.updateFC = function(elapsed) {
	var acumF = 0;
	var acumR = 0;
	if(this.g_forwardFC == 1) {
		acumF = -10.0;
	}
	if(this.g_backwardFC == 1) {
		acumF = 10.0;
	}
	if(this.g_strafeLeftFC == 1) {
		acumR = -10.0;
	}
	if(this.g_strafeRightFC == 1) {
		acumR = 10.0;
	}	
			
	var x = this.cameraPivotFC.body.get_currentState().position.x;
	var y = this.cameraPivotFC.body.get_currentState().position.y;
	var z = this.cameraPivotFC.body.get_currentState().position.z;
	var b = this.cameraPivotFC.body.get_currentState().orientation.get_rawData();
	this.cameraPivotFC.setPosition($V3([x,y,z]));
	this.meshNode.setPosition($V3([x,y,z]));
	
	if(this.cameraPivotFC.body._collideBodies.length > 0) {
		var vF = $V3([this.meshNode.mRotationLocalSpaceMatrix.e[2], this.meshNode.mRotationLocalSpaceMatrix.e[6], this.meshNode.mRotationLocalSpaceMatrix.e[10]]).x(acumF);
		var vR = $V3([this.meshNode.mRotationLocalSpaceMatrix.e[0], this.meshNode.mRotationLocalSpaceMatrix.e[4], this.meshNode.mRotationLocalSpaceMatrix.e[8]]).x(acumR);
		if(this.g_forwardFC == 1 || this.g_backwardFC == 1) {
			//this.cameraPivotFC.body.moveTo(new Vector3D(this.cameraPivotFC.mWMatrix.e[3],this.cameraPivotFC.mWMatrix.e[7],this.cameraPivotFC.mWMatrix.e[11]));
			this.cameraPivotFC.body.setLineVelocity( new Vector3D( vF.e[0],vF.e[1],vF.e[2]));
		}
		if(this.g_strafeLeftFC == 1 || this.g_strafeRightFC == 1) {
			//this.cameraPivotFC.body.moveTo(new Vector3D(this.cameraPivotFC.mWMatrix.e[3],this.cameraPivotFC.mWMatrix.e[7],this.cameraPivotFC.mWMatrix.e[11]));
			this.cameraPivotFC.body.setLineVelocity( new Vector3D( vR.e[0],vR.e[1],vR.e[2]));
		}
	}

	
	
	var matDist = $M16([
          				1, 0, 0, 0,
	          			0, 1, 0, 0,
	          			0, 0, 1, this.camDistance,
	          			0, 0, 0, 1
          			]);
	var matTmp = (this.cameraPivotFC.mWMatrix.x(this.cameraPivotFC.mRotationLocalSpaceMatrix)).x(matDist);
	var vec = $V3([matTmp.e[3], matTmp.e[7], matTmp.e[11]]).subtract(this.cameraGoalFC.getPosition());
	
	this.cameraGoalFC.setTranslate($V3([vec.e[0]*0.3, vec.e[1]*0.3, vec.e[2]*0.3]), 'OBJECT');
};
StormPlayer.prototype.updateCameraGoalFC = function(event) {
	if(this.alwaysMove == true) {
		if(this.lastX == 0) {
			this.lastX = event.screenX;
		}
		if(this.lastY == 0) {
			this.lastY = event.screenY;
		}
		var diff = this.lastY - event.screenY;
		
		if(this.lastX > event.screenX) {
			this.cameraPivotFC.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]));
			this.meshNode.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]), "OBJECT");
		} else if(this.lastX < event.screenX){
			this.cameraPivotFC.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]));
			this.meshNode.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]), "OBJECT");
		}
		
		if((this.pivotPitch + diff) < 140 && (this.pivotPitch + diff) > -140) {
			if(this.lastY > event.screenY) {
				this.cameraPivotFC.setRotation(0.01*(this.lastY - event.screenY), $V3([1,0,0]), "OBJECT");
			} else if(this.lastY < event.screenY){
				this.cameraPivotFC.setRotation(-0.01*(event.screenY - this.lastY), $V3([1,0,0]), "OBJECT");
			}
			this.pivotPitch = this.pivotPitch+(diff);
		} else {
			if(this.pivotPitch > 0) {
				this.pivotPitch = 140;
			} else {
				this.pivotPitch = -140;
			}
		}
		
		this.lastX = event.screenX;
		this.lastY = event.screenY;
	} else {
		if(this.leftButton == 1 && this.startDrag == false) {
			this.startDrag = true;
			this.lastX = event.screenX;
			this.lastY = event.screenY;
		}
		if(this.leftButton == 0) {
			this.startDrag = false;
		}
		if(this.startDrag == true) {
			
			
			if(this.lastX > event.screenX) {
				this.cameraPivotFC.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]));
				this.meshNode.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]), "OBJECT");
			} else if(this.lastX < event.screenX){
				this.cameraPivotFC.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]));
				this.meshNode.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]), "OBJECT");
			}
			
			if(this.lastY > event.screenY) {
				this.cameraPivotFC.setRotation(0.01*(this.lastY - event.screenY), $V3([1,0,0]), "OBJECT");
			} else if(this.lastY < event.screenY){
				this.cameraPivotFC.setRotation(-0.01*(event.screenY - this.lastY), $V3([1,0,0]), "OBJECT");
			}
			
			
		}
		
		this.lastX = event.screenX;
		this.lastY = event.screenY;
	}
};