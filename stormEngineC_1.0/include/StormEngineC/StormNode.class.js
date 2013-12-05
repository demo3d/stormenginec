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
var numId = 0;
var numIdBullet = 0;
StormNode = function() {
	this.childNodes = [];
	this.buffersObjects = [];

	this.id = numId++;
	
	this.mWMatrix = $M16([
	                      1, 0, 0, 0,
	                      0, 1, 0, 0,
		                  0, 0, 1, 0,
		                  0, 0, 0, 1
		                ]);
	this.mRotationLocalSpaceMatrix = $M16([
	                                       1, 0, 0, 0,
			        	                   0, 1, 0, 0,
			        	                   0, 0, 1, 0,
			        	                   0, 0, 0, 1
			        	                 ]);
										 
	// jigLibJS2
	this.body = undefined;
	this.car = undefined;
	this.wheelFL;
	this.wheelFR;
	this.wheelBL;
	this.wheelBR;
	this.ndWheelFL;
	this.ndWheelFR;
	this.ndWheelBL;
	this.ndWheelBR;
	this.carMaxVelocity = 10;
	this.carEngineBreakValue = 0.5;
	this.carSteerAngle = 50;
	
	this.useJigLibTrimesh = false;
	this.jigLibTrimeshParams = {};
	//
	
	// StormRender
	this.renderAlbedo = $V3([255.0, 255.0, 255.0]);
	this.renderTypeEmitter = false;
	//
};



StormNode.prototype.attachMesh = function(stormMeshObject) {
	var bObject = new StormBufferObject();
	bObject.attachBuffers(stormMeshObject);
	this.buffersObjects.push(bObject);
		
	if(stormMeshObject.textureUniqueUrl != undefined) {
		this.attachTextureUnique(stormMeshObject.textureUniqueUrl);
    } else if(stormMeshObject.currentMtl) {
    	bObject.attachTexture(stormMeshObject.currentMtl, stormMeshObject.objDirectory+'/'+stormMeshObject.MtlsFile, bObject);
    }
	
	// crear AABBs para colision
	for(var n = 0; n < stormMeshObject.vertexArray.length/3; n++) {
		var idx = n * 3;
		if(stormMeshObject.vertexArray[idx] < this.collisionAABB_BLFarX) {
			this.collisionAABB_BLFarX = stormMeshObject.vertexArray[idx];
		} else if(stormMeshObject.vertexArray[idx] > this.collisionAABB_TRNearX) {
			this.collisionAABB_TRNearX = stormMeshObject.vertexArray[idx];
		}
		
		if(stormMeshObject.vertexArray[idx+1] < this.collisionAABB_BLFarY) {
			this.collisionAABB_BLFarY = stormMeshObject.vertexArray[idx+1];
		} else if(stormMeshObject.vertexArray[idx+1] > this.collisionAABB_TRNearY) {
			this.collisionAABB_TRNearY = stormMeshObject.vertexArray[idx+1];
		}
		
		if(stormMeshObject.vertexArray[idx+2] < this.collisionAABB_BLFarZ) {
			this.collisionAABB_BLFarZ = stormMeshObject.vertexArray[idx+2];
		} else if(stormMeshObject.vertexArray[idx+2] > this.collisionAABB_TRNearZ) {
			this.collisionAABB_TRNearZ = stormMeshObject.vertexArray[idx+2];
		}
	}
};
StormNode.prototype.attachTextureUnique = function(textureUrl) {
	for(var n = 0; n < this.buffersObjects.length; n++) {
		this.buffersObjects[n].attachTexture(textureUrl, undefined, undefined, 'map_kd');
	}
};
StormNode.prototype.attachStormBufferObject = function(stormBufferObject) {
	this.buffersObjects.push(stormBufferObject);
};

StormNode.prototype.makeLookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
	var eye = $V3([ex, ey, ez]);
	var center = $V3([cx, cy, cz]);
	var up = $V3([ux, uy, uz]);

	var mag;

	var z = eye.subtract(center).normalize();
	var x = up.cross(z).normalize();
	var y = z.cross(x).normalize();

	var m = $M16([
	              x.e[0], x.e[1], x.e[2], 0,
	              y.e[0], y.e[1], y.e[2], 0,
	              z.e[0], z.e[1], z.e[2], 0,
	              0, 0, 0, 1
	            ]);

	var t = $M16([
	              1, 0, 0, -ex,
	              0, 1, 0, -ey,
	              0, 0, 1, -ez,
	              0, 0, 0, 1
	            ]);
	this.mWMatrix = m.x(t);
};

StormNode.prototype.setMatrixIdentity = function() {
	this.mWMatrix = $M16([
	                      1, 0, 0, 0,
	                      0, 1, 0, 0,
	                      0, 0, 1, 0,
	                      0, 0, 0, 1
	                   ]);
};

StormNode.prototype.setTranslate = function(vec, enumTransform) {
	var m = $M16([
	              1.0, 0.0, 0.0, vec.e[0],
	              0.0, 1.0, 0.0, vec.e[1],
	              0.0, 0.0, 1.0, vec.e[2],
	              0.0, 0.0, 0.0, 1.0
	              ]);
	var matTmp;
	var transform = "WORLD";
	if(enumTransform) {
		var transform = enumTransform;
	}
	if(transform == "WORLD") {
		matTmp = this.mWMatrix;
	} else if(transform == "OBJECT") {
		matTmp = this.mWMatrix.x(this.mRotationLocalSpaceMatrix);
	}
	
	
	matTmp = matTmp.x(m);
	this.mWMatrix = $M16([
		         			this.mWMatrix.e[0], this.mWMatrix.e[1], this.mWMatrix.e[2], matTmp.e[3],
		         			this.mWMatrix.e[4], this.mWMatrix.e[5], this.mWMatrix.e[6], matTmp.e[7],
		         			this.mWMatrix.e[8], this.mWMatrix.e[9], this.mWMatrix.e[10], matTmp.e[11],
		         			0, 0, 0, 1
	         			]);
};

StormNode.prototype.setPosition = function(vec) {
	var mm = $M16([
     			this.mWMatrix.e[0], this.mWMatrix.e[1], this.mWMatrix.e[2], vec.e[0],
     			this.mWMatrix.e[4], this.mWMatrix.e[5], this.mWMatrix.e[6], vec.e[1],
     			this.mWMatrix.e[8], this.mWMatrix.e[9], this.mWMatrix.e[10], vec.e[2],
     			0, 0, 0, 1
     			    ]);
	if(this.nodePivot == undefined) {
		this.mWMatrix = mm;
	} else {
		var typeFreeCam = this.player instanceof FreeCam;
		var typeStormPlayer = this.player instanceof StormPlayer;
		if(typeStormPlayer) {
			this.nodePivot.body.moveTo(new Vector3D(vec.e[0],vec.e[1],vec.e[2]));
		} else {
			this.nodePivot.mWMatrix = mm;
		}
	}
};

StormNode.prototype.getPosition = function() {
	if(this.nodePivot == undefined) {
		return $V3([this.mWMatrix.e[3], this.mWMatrix.e[7], this.mWMatrix.e[11]]);
	} else {
		return $V3([this.nodePivot.mWMatrix.e[3], this.nodePivot.mWMatrix.e[7], this.nodePivot.mWMatrix.e[11]]);
	}
};
function degToRad(deg) { // degree to radian. Full circle = 360 degrees.
	return (deg*3.14159)/180;
}
function radToDeg(rad) { // radian to degree
	return rad*(180/3.14159);
}
StormNode.prototype.setRotation = function(radian, vecAxis, enumTransform) {
	var transform = "WORLD";
	if(enumTransform) {
		var transform = enumTransform;
	}
	
	var m16 = $M16([
	                        1.0, 0.0, 0.0, 0.0,
	                        0.0, 1.0, 0.0, 0.0,
	                        0.0, 0.0, 1.0, 0.0,
	                        0.0, 0.0, 0.0, 1.0
	                        ]);
	var m = m16.rotation(radian,vecAxis);
	var mm = $M16([
	               m.e[0], m.e[1], m.e[2], 0.0,
	               m.e[4], m.e[5], m.e[6], 0.0,
	               m.e[8], m.e[9], m.e[10], 0.0,
	               0.0, 0.0, 0.0, 1.0
	             ]);
	
	if(transform == "WORLD") {
		this.mWMatrix = this.mWMatrix.x(mm);
	} else if(transform == "OBJECT") {
		this.mRotationLocalSpaceMatrix = this.mRotationLocalSpaceMatrix.x(mm);
	}
	
};
StormNode.prototype.setOrientation = function(radian, vecAxis, enumTransform) {
	var transform = "WORLD";
	if(enumTransform) {
		var transform = enumTransform;
	}
	
	var m16 = $M16([
	                        1.0, 0.0, 0.0, 0.0,
	                        0.0, 1.0, 0.0, 0.0,
	                        0.0, 0.0, 1.0, 0.0,
	                        0.0, 0.0, 0.0, 1.0
	                        ]);
	var m = m16.rotation(radian,vecAxis);
	var mm = $M16([
	               m.e[0], m.e[1], m.e[2], 0.0,
	               m.e[4], m.e[5], m.e[6], 0.0,
	               m.e[8], m.e[9], m.e[10], 0.0,
	               0.0, 0.0, 0.0, 1.0
	             ]);
	
	if(transform == "WORLD") {
		this.mWMatrix = mm;
	} else if(transform == "OBJECT") {
		this.mRotationLocalSpaceMatrix = mm;
	}
	
};

StormNode.prototype.resetAxisRotation = function() {
	this.mWMatrix = $M16([
	                        1.0, 0.0, 0.0, 0.0,
	                        0.0, 1.0, 0.0, 0.0,
	                        0.0, 0.0, 1.0, 0.0,
	                        0.0, 0.0, 0.0, 1.0
	                        ]);
	this.mRotationLocalSpaceMatrix = $M16([
	           	                        1.0, 0.0, 0.0, 0.0,
	        	                        0.0, 1.0, 0.0, 0.0,
	        	                        0.0, 0.0, 1.0, 0.0,
	        	                        0.0, 0.0, 0.0, 1.0
	        	                        ]);
};



StormNode.prototype.createChildNode = function() {
	var node = new StormNode();
	this.childNodes.push(node);
	return node;
};

/**
 * Añade un nodo con malla al pivote de nodeCam
 */
StormNode.prototype.setCamPivotNodeMesh = function(node) {
	this.player.meshNode = node;
};
StormNode.prototype.setCollision = function(jsonIn) {
	this.jigLibTrimeshParams = jsonIn;
	
	var makeNow = false;
	if(this.nodePivot == undefined) {
		if(jsonIn.conf.type == "box") {
			var shape = new jiglib.JBox(null,jsonIn.conf.dimensions.e[0],jsonIn.conf.dimensions.e[2],jsonIn.conf.dimensions.e[1]);//width, depth, height
			makeNow = true;
		}
		if(jsonIn.conf.type == "sphere") {
			var shape = new jiglib.JSphere(null, jsonIn.conf.dimensions);
			makeNow = true;
		}
		if(jsonIn.conf.type == "ground") {
			var shape = new jiglib.JPlane(null,new Vector3D(0, 1, 0, 0));
			this.jigLibTrimeshParams.mass = 0;
			makeNow = true;
		}
		if(jsonIn.conf.type == "trimesh") {
			this.useJigLibTrimesh = true;
			
		}
		if(jsonIn.conf.type == "car") {
			this.carMaxVelocity = (jsonIn.maxVelocity != undefined) ? jsonIn.maxVelocity : this.carMaxVelocity;
			this.carEngineBreakValue = (jsonIn.engineBreak != undefined) ? jsonIn.engineBreak : this.carEngineBreakValue;
			
			this.car = new jiglib.JCar(null);
			this.carSteerAngle = (jsonIn.steerAngle != undefined) ? jsonIn.steerAngle : this.carSteerAngle;
			var steerRate = 8;
			var driveTorque = 3000000;
			this.car.setCar(this.carSteerAngle, steerRate, driveTorque);
			//this.car.setHBrake(1);
			this.body = this.car.get_chassis();
			this.body.set_sideLengths(new Vector3D(jsonIn.conf.dimensions.e[0],jsonIn.conf.dimensions.e[2],jsonIn.conf.dimensions.e[1], 0)); // width , height depth
			this.body._material.friction = 0.5;
			this.body._material.restitution = 0.1;
			this.body.set_mass(jsonIn.mass);
			
			stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.body);
			
			this.body.moveTo(new Vector3D(this.mWMatrix.e[3],this.mWMatrix.e[7],this.mWMatrix.e[11],0));
			
		}
		if(jsonIn.conf.type == "capsule") { // no funciona?
			var shape=new jiglib.JCapsule(null,jsonIn.conf.r,jsonIn.conf.l);
			makeNow = true;
		}
		
		if(makeNow) this.setCollisionBody(shape);
	} else {
		this.switchCam('player');
	
		this.player.enableCollision(jsonIn);
	}
};
StormNode.prototype.setCarWheels = function(jsonIn) {
	var wheelRadius = (jsonIn.r != undefined) ? jsonIn.r : 1.0;
	var travel = 1.0; // 1.0
	var sideFriction = 1.2; //1.2;
	var fwdFriction = 1.2; // 1.2;
	var restingFrac = 0.4; // 0.6; // 0.5; elasticity coefficient
	var dampingFrac = (jsonIn.damping != undefined) ? jsonIn.damping : 0.7; // 0.7; suspension damping
	var rays = 2;
	
	this.ndWheelFL = jsonIn.nodesWheels[0];
	this.car.setupWheel(0, new Vector3D(this.ndWheelFL.mWMatrix.e[3], this.ndWheelFL.mWMatrix.e[7],  this.ndWheelFL.mWMatrix.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, false);
	this.wheelFL = this.car.get_wheels()[0];
	
	this.ndWheelFR = jsonIn.nodesWheels[1];
	this.car.setupWheel(1, new Vector3D(this.ndWheelFR.mWMatrix.e[3], this.ndWheelFR.mWMatrix.e[7],  this.ndWheelFR.mWMatrix.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, false);
	this.wheelFR = this.car.get_wheels()[1];
	
	this.ndWheelBL = jsonIn.nodesWheels[2];
	this.car.setupWheel(2, new Vector3D(this.ndWheelBL.mWMatrix.e[3], this.ndWheelBL.mWMatrix.e[7],  this.ndWheelBL.mWMatrix.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, true);
	this.wheelBL = this.car.get_wheels()[2];
	
	this.ndWheelBR = jsonIn.nodesWheels[3];
	this.car.setupWheel(3, new Vector3D(this.ndWheelBR.mWMatrix.e[3], this.ndWheelBR.mWMatrix.e[7],  this.ndWheelBR.mWMatrix.e[11]), sideFriction, fwdFriction, travel, wheelRadius, restingFrac, dampingFrac, rays, true);
	this.wheelBR = this.car.get_wheels()[3];
};
StormNode.prototype.switchCam = function(mode, distance, node) {
	if(this.player.meshNode != undefined) var tmpMeshNode = this.player.meshNode; // si tiene malla la guardamos
	var dist =(distance != undefined) ? distance : this.player.camDistance;
	
	if(mode == 'player') {
		if(this.nodePivot.body != undefined) {
			this.nodePivot.body.setActive();
			this.nodePivot.body.moveTo(new Vector3D(this.nodePivot.mWMatrix.e[3],this.nodePivot.mWMatrix.e[7],this.nodePivot.mWMatrix.e[11],0));
			stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.nodePivot.body);
			stormEngineC.stormJigLibJS.colSystem.addCollisionBody(this.nodePivot.body);
		}
		this.player = new StormPlayer(dist);
	}
	if(mode == 'freecam') {
		if(this.nodePivot.body != undefined) {
			this.nodePivot.body.setInactive();
			stormEngineC.stormJigLibJS.dynamicsWorld.removeBody(this.nodePivot.body);
			stormEngineC.stormJigLibJS.colSystem.removeCollisionBody(this.nodePivot.body);
		}
		this.player = new FreeCam(distance);
	}
	if(mode == 'node') {
		if(this.nodePivot.body != undefined) {
			this.nodePivot.body.setInactive();
			stormEngineC.stormJigLibJS.dynamicsWorld.removeBody(this.nodePivot.body);
			stormEngineC.stormJigLibJS.colSystem.removeCollisionBody(this.nodePivot.body);
		}
		this.player = new StormPlayerCar(distance);
	}
	
	
	if(mode == 'node') {
		this.player.cameraSetupFC(this, node, tmpMeshNode); // node = node to get
	} else {
		if(this.player.meshNode == undefined) this.player.meshNode = tmpMeshNode; // devolvemos malla
		this.player.cameraSetupFC(this);
	}
};
StormNode.prototype.generateTrimesh = function(stormMeshObject) {
	arrayVertex = [];
	arrayIndex = [];
	for(var b = 0; b < stormMeshObject.vertexArray.length; b=b+3) {
		arrayVertex.push(new Vector3D(stormMeshObject.vertexArray[b], stormMeshObject.vertexArray[b+1], stormMeshObject.vertexArray[b+2]));
	}
	for(var b = 0; b < stormMeshObject.indexArray.length; b=b+3) {
		arrayIndex.push(new Vector3D(stormMeshObject.indexArray[b], stormMeshObject.indexArray[b+1], stormMeshObject.indexArray[b+2]));
	}

	var skin = {'vertices':arrayVertex, 'indices':arrayIndex}
	var shape=new jiglib.JTriangleMesh(skin,new Vector3D(this.mWMatrix.e[3],this.mWMatrix.e[7],this.mWMatrix.e[11],0), new jiglib.Matrix3D(),10,10);
	//shape.createMesh(arrayVertex, arrayIndex);
	
	this.setCollisionBody(shape);
};
StormNode.prototype.setCollisionBody = function(shape) {
	var jsonIn = this.jigLibTrimeshParams;
	
	shape.set_friction(jsonIn.friction);
	shape.set_restitution(jsonIn.restitution);
	if(jsonIn.mass != 0) {
		shape.set_rotVelocityDamping(new Vector3D(0.999,0.999,0.999,0));
		shape.set_linVelocityDamping(new Vector3D(0.999,0.999,0.999,0));
		
		shape.set_mass(jsonIn.mass);
	} else {
		shape.set_movable(false);
	}
	
	this.body=shape;
	this.body.id=this.id;
		
	stormEngineC.stormJigLibJS.dynamicsWorld.addBody(this.body);
	stormEngineC.stormJigLibJS.colSystem.addCollisionBody(this.body);
	
	this.body.moveTo(new Vector3D(this.mWMatrix.e[3],this.mWMatrix.e[7],this.mWMatrix.e[11],0));
};

StormNode.prototype.getCollisionNormalWithNode = function(node) {
	if(this.nodePivot != undefined) {
		if(this.nodePivot.body != undefined) body = this.nodePivot.body;
	} else {
		if(this.body != undefined) body = this.body;
	}

	for(var n = 0; n < body.collisions.length; n++) {
		if(node.nodePivot != undefined) {
			if(body.collisions[n].objInfo.body1.id == node.nodePivot.body.id) return body.collisions[n].dirToBody;
		} else {
			if(body.collisions[n].objInfo.body1.id == node.body.id) return body.collisions[n].dirToBody;
		}
	}
	
	return false;
};

StormNode.prototype.getCurrentDir = function() {
	return $V3([this.body._currState.linVelocity.x, this.body._currState.linVelocity.y, this.body._currState.linVelocity.z]);
};
StormNode.prototype.getCurrentVelocity = function() {
	var velocityDir = $V3([this.body._currState.linVelocity.x, this.body._currState.linVelocity.y, this.body._currState.linVelocity.z]);
	var meshDir = $V3([this.mWMatrix.e[2], this.mWMatrix.e[6], this.mWMatrix.e[10]]);

	var v = velocityDir.dot(meshDir)*-1;
	return (v != 0) ? v : 0.000000000000001;
};
StormNode.prototype.getMaxVelocityValue = function() {
	return this.carMaxVelocity;
};
StormNode.prototype.getEngineBreakValue = function() {
	return this.carEngineBreakValue;
};