/**
* Controller type targetcam
* @class
* @constructor
* @param {Float} camDistance Distance to target
*/
StormControllerTargetCam = function(camDistance) {
	this.controllerType = stormEngineC.ControllerTypes["TARGETCAM"];
	this.g_forwardFC = 0;
	this.g_backwardFC = 0;
	this.g_strafeLeftFC = 0;
	this.g_strafeRightFC = 0;
	this.leftButton = 0;
	this.middleButton = 0;
	this.rightButton = 0;
	
	this.lastX = 0;
	this.lastY = 0;
	this.camDistance = (camDistance==undefined)?5.0:camDistance; 
	
	this.meshNode;
	this.cameraNode;
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerTargetCam.prototype.keyDownFC = function(event) {
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
* @type Void
* @private 
* @param event event
*/
StormControllerTargetCam.prototype.keyUpFC = function(event) {
	if (String.fromCharCode(event.keyCode) == "W") {
		this.g_forwardFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "S") {
		this.g_backwardFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "A") {
		this.g_strafeLeftFC = 0;
    }
	if (String.fromCharCode(event.keyCode) == "D") {
		this.g_strafeRightFC = 0;
    }
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerTargetCam.prototype.mouseMoveFC = function(event) {
	this.updateCameraGoalFC(event);
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerTargetCam.prototype.mouseDownFC = function(event) {
	if(event.button == 0) { // LEFT BUTTON
		this.leftButton = 1;
	} else if(event.button == 1) { // MIDDLE BUTTON
		this.middleButton = 1;
	} else if(event.button == 2) { // RIGHT BUTTON
		this.rightButton = 1;
	}
	this.updateCameraGoalFC(event);
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerTargetCam.prototype.mouseUpFC = function(event) {
	this.leftButton = 0;
	this.middleButton = 0;
	this.rightButton = 0;
};

/**
* @type Void
* @private 
* @param event event
*/
StormControllerTargetCam.prototype.mouseWheel = function(event) {
	var currFov =(stormEngineC.defaultCamera.proy == 1) ? stormEngineC.defaultCamera.fov : stormEngineC.defaultCamera.fovOrtho;
	var weightX;
	var weightY;	
	
	if(stormEngineC.defaultCamera.proy == 1) { // perspective
		if(stormEngineC.defaultCamera.autofocus == false) {// then changing the focus
			if(event.wheelDeltaY >= 0) {
				stormEngineC.defaultCamera.focus({distance:stormEngineC.defaultCamera.focusExtern+1.0});// FRONT
			} else {
				stormEngineC.defaultCamera.focus({distance:stormEngineC.defaultCamera.focusExtern-1.0});// BACK
			}			
		} else { // perspective fov
			if(event.wheelDeltaY >= 0) {
				weightX = (stormEngineC.mousePosX-(stormEngineC.stormGLContext.viewportWidth/2.0))*(this.cameraNode.getFov()*-0.0004);
				weightY = (stormEngineC.mousePosY-(stormEngineC.stormGLContext.viewportHeight/2.0))*(this.cameraNode.getFov()*-0.0004);				
				stormEngineC.defaultCamera.setFov(currFov/1.1);// FRONT
			} else {
				weightX = (stormEngineC.mousePosX-(stormEngineC.stormGLContext.viewportWidth/2.0))*(this.cameraNode.getFov()*0.0004);
				weightY = (stormEngineC.mousePosY-(stormEngineC.stormGLContext.viewportHeight/2.0))*(this.cameraNode.getFov()*0.0004);
				stormEngineC.defaultCamera.setFov(currFov*1.1);// BACK    
			}
		}
	} else { // ortho fov
		if(event.wheelDeltaY >= 0) { // zoom in
			weightX = (stormEngineC.mousePosX-(stormEngineC.stormGLContext.viewportWidth/2.0))*(this.cameraNode.getFov()*-0.0004);
			weightY = (stormEngineC.mousePosY-(stormEngineC.stormGLContext.viewportHeight/2.0))*(this.cameraNode.getFov()*-0.0004);
			stormEngineC.defaultCamera.setFov(currFov/1.1);// FRONT
		} else { // zoom out
			weightX = (stormEngineC.mousePosX-(stormEngineC.stormGLContext.viewportWidth/2.0))*(this.cameraNode.getFov()*0.0004);
			weightY = (stormEngineC.mousePosY-(stormEngineC.stormGLContext.viewportHeight/2.0))*(this.cameraNode.getFov()*0.0004);
			stormEngineC.defaultCamera.setFov(currFov*1.1);// BACK   
		} 
		
	}
	
	var X = this.cameraNode.nodePivot.getLeft().x(weightX);
	var Y = this.cameraNode.nodePivot.getUp().x(weightY);
	this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add($V3([X.e[0]*-1.0,0.0,Y.e[2]]))); 
	//this.cameraNode.nodeGoal.setPosition(this.cameraNode.nodeGoal.getPosition().add($V3([X.e[0],0.0,Y.e[2]]))); 
};

/**
* @type Void
* @private 
*/
StormControllerTargetCam.prototype.cameraSetupFC = function(cameraNode, meshNode) {
	this.cameraNode = cameraNode;
	this.meshNode = (meshNode == undefined) ? new StormNode() : meshNode;
	this.meshNode.shadows = false;
	
	if(this.meshNode != undefined) {
		this.cameraNode.nodePivot.MROTX = this.meshNode.MROTX;
		this.cameraNode.nodePivot.MROTY = this.meshNode.MROTY;
		this.cameraNode.nodePivot.MROTZ = this.meshNode.MROTZ;
		this.cameraNode.nodePivot.MROTXYZ = this.meshNode.MROTXYZ;
		
		if(this.meshNode.body != undefined) {
			this.meshNode.body.setInactive();
			stormEngineC.stormJigLibJS.dynamicsWorld.removeBody(this.meshNode.body);
			stormEngineC.stormJigLibJS.colSystem.removeCollisionBody(this.meshNode.body);
		}
	}  
		
	this.lastTime = new Date().getTime();
};

/**
* @type Void
* @private 
* @param {Float} elapsed
*/
StormControllerTargetCam.prototype.updateFC = function(elapsed) {	
	var dir;
	if(this.g_forwardFC == 1) {
		dir = this.cameraNode.nodePivot.getForward().x(-1.0);
		this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add(dir));
	}
	if(this.g_backwardFC == 1) {
		dir = this.cameraNode.nodePivot.getForward();
		this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add(dir));
	}
	if(this.g_strafeLeftFC == 1) {
		dir = this.cameraNode.nodePivot.getLeft().x(-1.0);
		this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add(dir));
	}
	if(this.g_strafeRightFC == 1) {
		dir = this.cameraNode.nodePivot.getLeft();
		this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add(dir));
	}	
	
	if(this.meshNode != undefined) {
		dir = this.cameraNode.nodePivot.getForward();
		this.meshNode.setPosition($V3([this.cameraNode.nodePivot.getPosition().e[0],this.cameraNode.nodePivot.getPosition().e[1], this.cameraNode.nodePivot.getPosition().e[2]]));
	}
	
	// goal position
	var newPosGoal = this.cameraNode.nodePivot.getPosition().add(this.cameraNode.nodePivot.getForward().x(this.camDistance));
	var vecForGoal = newPosGoal.subtract(this.cameraNode.nodeGoal.getPosition());
	this.cameraNode.nodeGoal.setPosition(this.cameraNode.nodeGoal.getPosition().add(vecForGoal.x(1.0))); 
	
	var timeNow = new Date().getTime();
	var elap = timeNow - this.lastTime;
	if(elap > (1000/20)) {  
		this.lastTime = timeNow;
		if(ws != undefined) {
			ws.emit('dataclient', {
				netID: stormEngineC.netID,
				WM0: this.meshNode.MPOS.e[0],
				WM1: this.meshNode.MPOS.e[1],
				WM2: this.meshNode.MPOS.e[2],
				WM3: this.meshNode.MPOS.e[3],
				WM4: this.meshNode.MPOS.e[4],
				WM5: this.meshNode.MPOS.e[5],
				WM6: this.meshNode.MPOS.e[6],
				WM7: this.meshNode.MPOS.e[7],
				WM8: this.meshNode.MPOS.e[8],
				WM9: this.meshNode.MPOS.e[9],
				WM10: this.meshNode.MPOS.e[10],
				WM11: this.meshNode.MPOS.e[11],
				WM12: this.meshNode.MPOS.e[12],
				WM13: this.meshNode.MPOS.e[13],
				WM14: this.meshNode.MPOS.e[14],
				WM15: this.meshNode.MPOS.e[15],
				RM0: this.meshNode.MROTXYZ.e[0],
				RM1: this.meshNode.MROTXYZ.e[1],
				RM2: this.meshNode.MROTXYZ.e[2],
				RM3: this.meshNode.MROTXYZ.e[3],
				RM4: this.meshNode.MROTXYZ.e[4],
				RM5: this.meshNode.MROTXYZ.e[5],
				RM6: this.meshNode.MROTXYZ.e[6],
				RM7: this.meshNode.MROTXYZ.e[7],
				RM8: this.meshNode.MROTXYZ.e[8],
				RM9: this.meshNode.MROTXYZ.e[9],
				RM10: this.meshNode.MROTXYZ.e[10],
				RM11: this.meshNode.MROTXYZ.e[11],
				RM12: this.meshNode.MROTXYZ.e[12],
				RM13: this.meshNode.MROTXYZ.e[13],
				RM14: this.meshNode.MROTXYZ.e[14],
				RM15: this.meshNode.MROTXYZ.e[15]
			});
		}
	}
};

/**
* @type Void
* @private 
*/
StormControllerTargetCam.prototype.updateCameraGoalFC = function(event) {
	if(stormEngineC.draggingNodeNow != false) {
		event.preventDefault(); 
	} else {
		if(this.middleButton == 1) {
			event.preventDefault(); 
			var X = this.cameraNode.nodePivot.getLeft().x((this.lastX - event.screenX)*(this.cameraNode.getFov()*0.0005));
			var Y = this.cameraNode.nodePivot.getUp().x((this.lastY - event.screenY)*(this.cameraNode.getFov()*-0.0005));  
			this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add(X)); 
			this.cameraNode.nodePivot.setPosition(this.cameraNode.nodePivot.getPosition().add(Y));
		} else {
			var factorRot = 0.01;
			if(stormEngineC.defaultCamera.lockRotY == false) {
				if(this.lastX > event.screenX) {
					this.cameraNode.nodePivot.setRotationY((this.lastX - event.screenX)*factorRot);
					
					if(this.meshNode != undefined) this.meshNode.setRotationY((this.lastX - event.screenX)*factorRot);
				} else {
					this.cameraNode.nodePivot.setRotationY(-(event.screenX - this.lastX)*factorRot);
					
					if(this.meshNode != undefined) this.meshNode.setRotationY(-(event.screenX - this.lastX)*factorRot);
				}
			}
			if(stormEngineC.defaultCamera.lockRotX == false) {
				if(this.lastY > event.screenY) {
					this.cameraNode.nodePivot.setRotationX((this.lastY - event.screenY)*factorRot);
				} else {
					this.cameraNode.nodePivot.setRotationX(-(event.screenY - this.lastY)*factorRot);
				}
			}
		}
	}
	this.lastX = event.screenX;
	this.lastY = event.screenY;
};