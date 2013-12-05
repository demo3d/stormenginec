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
StormPlayerCar = function(camDistance) {
	
	this.g_forwardFC = 0;
	this.g_backwardFC = 0;
	this.g_strafeLeftFC = 0;
	this.g_strafeRightFC = 0;
	this.leftButton = 0;
	this.middleButton = 0;
	this.rightButton = 0;
	this.startDrag = false;
	
	this.cameraNode;
	this.meshNode;
	this.nodeCar;
	this.inactiveMouseTime = 0;
	
	
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
StormPlayerCar.prototype.keyDownFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 1;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 1;
		this.nodeCar.car.setSteer([0, 1], 1);
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 1;
		this.nodeCar.car.setSteer([0, 1], -1);
    }
};
/**
 * Al levantar tecla
 * @param event event
 */
StormPlayerCar.prototype.keyUpFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 0;
		this.nodeCar.car.setSteer([0, 1], 0);
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 0;
		this.nodeCar.car.setSteer([0, 1], 0);
    }
};
StormPlayerCar.prototype.mouseMoveFC = function(event) {
	this.updateCameraGoalFC(event);
	this.inactiveMouseTime = 0;
};
StormPlayerCar.prototype.mouseDownFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 1;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 1;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 1;
	}
	this.updateCameraGoalFC(event);
};
StormPlayerCar.prototype.mouseUpFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 0;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 0;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 0;
	}
	this.updateCameraGoalFC(event);
};

StormPlayerCar.prototype.playerSetupFC = function(node) {
	if(node != undefined) {
		this.meshNode = node;
	} else {
		this.meshNode = new StormNode();
	}
	this.meshNode.setPosition($V3([0.0, 0.0, 0.0]));
};

StormPlayerCar.prototype.cameraSetupFC = function(cameraNode, nodeCar, meshNode) {
	this.cameraNode = cameraNode;
	this.nodeCar = nodeCar;
	this.meshNode = meshNode;
	
	this.cameraNode.nodePivot.setPosition(this.nodeCar.getPosition());
	this.meshNode.setPosition(this.nodeCar.getPosition());
};


StormPlayerCar.prototype.updateFC = function(elapsed) {
	var maxVelocity = this.nodeCar.getMaxVelocityValue();
	var currentVel = this.nodeCar.getCurrentVelocity();
	var engineBreak = this.nodeCar.getEngineBreakValue();
	
	if(this.g_forwardFC == 1) {
		this.nodeCar.car.setHBrake(0);
		this.nodeCar.car.setAccelerate(-0.1);
		if(currentVel > maxVelocity) this.nodeCar.car.setAccelerate(0);
	}
	if(this.g_backwardFC == 1) {
		this.nodeCar.car.setHBrake(0);
		this.nodeCar.car.setAccelerate(0.1);
		if(currentVel < -maxVelocity) this.nodeCar.car.setAccelerate(0);
	}
	
	if(this.g_strafeLeftFC == 1) {
	}
	if(this.g_strafeRightFC == 1) {
	}
	
	if(this.g_forwardFC == 0 && this.g_backwardFC == 0) {
		//this.nodeCar.car.setHBrake(1);
		if(currentVel > 0.1) this.nodeCar.car.setAccelerate((engineBreak/1000)*(Math.abs(currentVel)/maxVelocity));
		if(currentVel < -0.1) this.nodeCar.car.setAccelerate((-engineBreak/1000)*(Math.abs(currentVel)/maxVelocity));
	}
	if((this.g_forwardFC == 0 && this.g_backwardFC == 0) && currentVel < 0.2 && currentVel > -0.2) this.nodeCar.car.setHBrake(1);
	
	if(this.g_strafeLeftFC == 0) {
	}
	if(this.g_strafeRightFC == 1) {
	}	
			
	var x = this.nodeCar.body.get_currentState().position.x;
	var y = this.nodeCar.body.get_currentState().position.y;
	var z = this.nodeCar.body.get_currentState().position.z;
	var b = this.nodeCar.body.get_currentState().orientation.get_rawData();
	
	this.cameraNode.nodePivot.setPosition($V3([x, y, z]));
	this.meshNode.setPosition($V3([x, y, z]));

	
	
	
	
	this.inactiveMouseTime++;
	if(this.inactiveMouseTime > 100) {
		var vecPlayer = this.nodeCar.getPosition();
		var dirPlayer = $V3([this.nodeCar.mWMatrix.e[2], this.nodeCar.mWMatrix.e[6], this.nodeCar.mWMatrix.e[10]]).normalize();
		vecPlayer = vecPlayer.add(dirPlayer.x(this.camDistance));
		
		var vecGoal = this.cameraNode.nodeGoal.getPosition();
		
		var vec = vecPlayer.subtract(vecGoal).x(0.5);
		vec = vec.add($V3([0.0, 2.0, 0.0]));
		
		
		this.cameraNode.nodePivot.mWMatrix = this.nodeCar.mWMatrix;
		//this.cameraNode.nodePivot.mRotationLocalSpaceMatrix = this.nodeCar.mRotationLocalSpaceMatrix;
	} else {
		var matDist = $M16([
							1, 0, 0, 0,
							0, 1, 0, 0,
							0, 0, 1, this.camDistance,
							0, 0, 0, 1
						]);
		var matTmp = (this.cameraNode.nodePivot.mWMatrix.x(this.cameraNode.nodePivot.mRotationLocalSpaceMatrix)).x(matDist);
		var vec = $V3([matTmp.e[3], matTmp.e[7], matTmp.e[11]]).subtract(this.cameraNode.nodeGoal.getPosition());
	}
	
	this.cameraNode.nodeGoal.setTranslate($V3([vec.e[0]*0.3, vec.e[1]*0.3, vec.e[2]*0.3]), 'OBJECT');
};
StormPlayerCar.prototype.updateCameraGoalFC = function(event) {
	if(this.alwaysMove == true) {
		if(this.lastX == 0) {
			this.lastX = event.screenX;
		}
		if(this.lastY == 0) {
			this.lastY = event.screenY;
		}
		var diff = this.lastY - event.screenY;
		
		if(this.lastX > event.screenX) {
			this.cameraNode.nodePivot.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]));
			this.meshNode.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]), "OBJECT");
		} else if(this.lastX < event.screenX){
			this.cameraNode.nodePivot.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]));
			this.meshNode.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]), "OBJECT");
		}
		
		if((this.pivotPitch + diff) < 140 && (this.pivotPitch + diff) > -140) {
			if(this.lastY > event.screenY) {
				this.cameraNode.nodePivot.setRotation(0.01*(this.lastY - event.screenY), $V3([1,0,0]), "OBJECT");
			} else if(this.lastY < event.screenY){
				this.cameraNode.nodePivot.setRotation(-0.01*(event.screenY - this.lastY), $V3([1,0,0]), "OBJECT");
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
				this.cameraNode.nodePivot.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]));
				this.meshNode.setRotation(0.01*(this.lastX - event.screenX), $V3([0,1,0]), "OBJECT");
			} else if(this.lastX < event.screenX){
				this.cameraNode.nodePivot.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]));
				this.meshNode.setRotation(-0.01*(event.screenX - this.lastX), $V3([0,1,0]), "OBJECT");
			}
			
			if(this.lastY > event.screenY) {
				this.cameraNode.nodePivot.setRotation(0.01*(this.lastY - event.screenY), $V3([1,0,0]), "OBJECT");
			} else if(this.lastY < event.screenY){
				this.cameraNode.nodePivot.setRotation(-0.01*(event.screenY - this.lastY), $V3([1,0,0]), "OBJECT");
			}
			
			
		}
		
		this.lastX = event.screenX;
		this.lastY = event.screenY;
	}
};