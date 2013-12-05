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
	
	this.mWMatrix = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.mRotationLocalSpaceMatrix = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
										 
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
	
	// StormRenderCL
	this.renderTypeEmitter = 0;
	//
	

};



StormNode.prototype.attachMesh = function(stormMeshObject) {
	var bObject = new StormBufferObject();
	bObject.attachBuffers(stormMeshObject);
	this.attachStormBufferObject(bObject); 
		
	if(stormMeshObject.textureUniqueUrl != undefined) {
		this.attachTextureUnique(stormMeshObject.textureUniqueUrl);
    } else if(stormMeshObject.currentMtl) {
    	bObject.attachTexture(stormMeshObject.currentMtl, stormMeshObject.objDirectory+'/'+stormMeshObject.MtlsFile);
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
StormNode.prototype.setKdTexture = function(textureUrl) {
	this.attachTextureUnique(textureUrl, 'map_kd');
};
StormNode.prototype.setKdColor = function(vecColor) {
	for(var n = 0; n < this.buffersObjects.length; n++) {
		this.buffersObjects[n].Kd = vecColor;
	}
};
StormNode.prototype.attachTextureUnique = function(textureUrl, type) {
	var typeTexture = type == undefined ? 'map_kd' : type;
	for(var n = 0; n < this.buffersObjects.length; n++) {
		this.buffersObjects[n].attachTexture(textureUrl, undefined, typeTexture); 
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
	this.mWMatrix = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
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
	
	if(this.objectType == 'light') {
		this.mrealWMatrix = mm;
		
		var vecEyeLight = this.getPosition();
		var vecPosLight = vecEyeLight.add(this.direction);

		this.makeLookAt(vecEyeLight.e[0], vecEyeLight.e[1], vecEyeLight.e[2],
					vecPosLight.e[0], vecPosLight.e[1], vecPosLight.e[2],
					0.0,1.0,0.0);
	}
};

StormNode.prototype.getPosition = function() {
	if(this.nodePivot == undefined) {
		return $V3([this.mWMatrix.e[3], this.mWMatrix.e[7], this.mWMatrix.e[11]]);
	} else {
		return $V3([this.nodePivot.mWMatrix.e[3], this.nodePivot.mWMatrix.e[7], this.nodePivot.mWMatrix.e[11]]);
	}
};
StormNode.prototype.setDirection = function(direction) {
	if(this.objectType == 'light') {
		this.direction = direction;
		if(this.type == 'sun') {
			var vecEyeLight = this.direction.x(-10000.0);
			
			this.mrealWMatrix.e[3] = vecEyeLight.e[0];
			this.mrealWMatrix.e[7] = vecEyeLight.e[1];
			this.mrealWMatrix.e[11] = vecEyeLight.e[2];
		}
	}
};
StormNode.prototype.setRotation = function(radian, vecAxis, enumTransform) {
	var transform = "WORLD";
	if(enumTransform) {
		var transform = enumTransform;
	}
	
	var m16 = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
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
	
	var m16 = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
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
	this.mWMatrix = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
	this.mRotationLocalSpaceMatrix = $M16([1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,0.0,0.0,0.0,1.0]);
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
// type light
StormNode.prototype.setLightColor = function(color) {
	var typeV3 = color instanceof StormV3;
	if(typeV3) {
		var vecColor = color;	
	} else {
		// http://en.wikipedia.org/wiki/Color_temperature
		// CIE 1931  2 degree CMFs with Judd Vos corrections http://www.vendian.org/mncharity/dir3/blackbody/UnstableURLs/bbr_color.html
		// 1000k - 15000k
		var arrK = new Float32Array([1.0000,0.0337,0.0000,1.0000,0.0592,0.0000,1.0000,0.0846,0.0000,1.0000,0.1096,0.0000,1.0000,0.1341,0.0000,1.0000,0.1578,0.0000,1.0000,0.1806,0.0000,1.0000,0.2025,0.0000,1.0000,0.2235,0.0000,1.0000,0.2434,0.0000,1.0000,0.2647,0.0033,1.0000,0.2889,0.0120,1.0000,0.3126,0.0219,1.0000,0.3360,0.0331,1.0000,0.3589,0.0454,1.0000,0.3814,0.0588,1.0000,0.4034,0.0734,1.0000,0.4250,0.0889,1.0000,0.4461,0.1054,1.0000,0.4668,0.1229,1.0000,0.4870,0.1411,1.0000,0.5067,0.1602,1.0000,0.5259,0.1800,1.0000,0.5447,0.2005,1.0000,0.5630,0.2216,1.0000,0.5809,0.2433,1.0000,0.5983,0.2655,1.0000,0.6153,0.2881,1.0000,0.6318,0.3112,1.0000,0.6480,0.3346,1.0000,0.6636,0.3583,1.0000,0.6789,0.3823,1.0000,0.6938,0.4066,1.0000,0.7083,0.4310,1.0000,0.7223,0.4556,1.0000,0.7360,0.4803,1.0000,0.7494,0.5051,1.0000,0.7623,0.5299,1.0000,0.7750,0.5548,1.0000,0.7872,0.5797,1.0000,0.7992,0.6045,1.0000,0.8108,0.6293,1.0000,0.8221,0.6541,1.0000,0.8330,0.6787,1.0000,0.8437,0.7032,1.0000,0.8541,0.7277,1.0000,0.8642,0.7519,1.0000,0.8740,0.7760,1.0000,0.8836,0.8000,1.0000,0.8929,0.8238,1.0000,0.9019,0.8473,1.0000,0.9107,0.8707,1.0000,0.9193,0.8939,1.0000,0.9276,0.9168,1.0000,0.9357,0.9396,1.0000,0.9436,0.9621,1.0000,0.9513,0.9844,0.9937,0.9526,1.0000,0.9726,0.9395,1.0000,0.9526,0.9270,1.0000,0.9337,0.9150,1.0000,0.9157,0.9035,1.0000,0.8986,0.8925,1.0000,0.8823,0.8819,1.0000,0.8668,0.8718,1.0000,0.8520,0.8621,1.0000,0.8379,0.8527,1.0000,0.8244,0.8437,1.0000,0.8115,0.8351,1.0000,0.7992,0.8268,1.0000,0.7874,0.8187,1.0000,0.7761,0.8110,1.0000,0.7652,0.8035,1.0000,0.7548,0.7963,1.0000,0.7449,0.7894,1.0000,0.7353,0.7827,1.0000,0.7260,0.7762,1.0000,0.7172,0.7699,1.0000,0.7086,0.7638,1.0000,0.7004,0.7579,1.0000,0.6925,0.7522,1.0000,0.6848,0.7467,1.0000,0.6774,0.7414,1.0000,0.6703,0.7362,1.0000,0.6635,0.7311,1.0000,0.6568,0.7263,1.0000,0.6504,0.7215,1.0000,0.6442,0.7169,1.0000,0.6382,0.7124,1.0000,0.6324,0.7081,1.0000,0.6268,0.7039,1.0000,0.6213,0.6998,1.0000,0.6161,0.6958,1.0000,0.6109,0.6919,1.0000,0.6060,0.6881,1.0000,0.6012,0.6844,1.0000,0.5965,0.6808,1.0000,0.5919,0.6773,1.0000,0.5875,0.6739,1.0000,0.5833,0.6706,1.0000,0.5791,0.6674,1.0000,0.5750,0.6642,1.0000,0.5711,0.6611,1.0000,0.5673,0.6581,1.0000,0.5636,0.6552,1.0000,0.5599,0.6523,1.0000,0.5564,0.6495,1.0000,0.5530,0.6468,1.0000,0.5496,0.6441,1.0000,0.5463,0.6415,1.0000,0.5431,0.6389,1.0000,0.5400,0.6364,1.0000,0.5370,0.6340,1.0000,0.5340,0.6316,1.0000,0.5312,0.6293,1.0000,0.5283,0.6270,1.0000,0.5256,0.6247,1.0000,0.5229,0.6225,1.0000,0.5203,0.6204,1.0000,0.5177,0.6183,1.0000,0.5152,0.6162,1.0000,0.5128,0.6142,1.0000,0.5104,0.6122,1.0000,0.5080,0.6103,1.0000,0.5057,0.6084,1.0000,0.5035,0.6065,1.0000,0.5013,0.6047,1.0000,0.4991,0.6029,1.0000,0.4970,0.6012,1.0000,0.4950,0.5994,1.0000,0.4930,0.5978,1.0000,0.4910,0.5961,1.0000,0.4891,0.5945,1.0000,0.4872,0.5929,1.0000,0.4853,0.5913,1.0000,0.4835,0.5898,1.0000,0.4817,0.5882,1.0000,0.4799,0.5868,1.0000,0.4782,0.5853,1.0000,0.4765,0.5839,1.0000,0.4749,0.5824,1.0000]);
		var selK = Math.round(color/100)-10;
		var idARRK = selK*3;
		var vecColor = $V3([arrK[idARRK], arrK[idARRK+1], arrK[idARRK+2]]);
		
	}
	
	this.color = vecColor;
		
	for(var n = 0; n < this.buffersObjects.length; n++) {
		this.buffersObjects[n].Kd = vecColor;
		this.buffersObjects[n].arrayTEX_Kd = new Uint8Array([parseInt(vecColor.e[0]*255),parseInt(vecColor.e[1]*255),parseInt(vecColor.e[2]*255),255]); // Typed array map albedo
	}
};