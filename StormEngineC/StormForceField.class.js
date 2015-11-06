/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormForceField = function(sec, jsonIn) { StormNode.call(this); 
	this._sec = sec;
	
	this.objectType = 'forceField';
	this.forceFieldType = 'direction'; // direction or gravity
	
	this.direction = (jsonIn != undefined && jsonIn.direction != undefined) ? jsonIn.direction : $V3([0.0,-9.8,0.0]);   
	this.nodesProc = [];
};
StormForceField.prototype = Object.create(StormNode.prototype);

/** @private */
StormForceField.prototype.updateJigLib = function() {  
	if(this.forceFieldType == 'gravity') {  
		this._sec.stormJigLibJS.dynamicsWorld.setGravity(new Vector3D( this.direction.e[0], this.direction.e[1], this.direction.e[2], 0 ));
	} else {
	
	} 
};
/**
* Set the direction
* @type Void
* @param {StormV3} direction
*/
StormForceField.prototype.setDirection = function(direction) {  
	this.direction = direction;
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		if(this.nodesProc[n].kernelDir != undefined) {
			this.nodesProc[n].updatekernelDir_Arguments(); 
		}
		if(this.nodesProc[n].clglWork_nodes != undefined) { 
			this.nodesProc[n].updateNodes();
			this.nodesProc[n].updateLinks(); 
		}
	}
		
	this.updateJigLib();
};
/**
* Delete this force field
* @type Void
*/
StormForceField.prototype.remove = function() {
	var idToRemove = undefined;
	for(var n = 0, f = this._sec.forceFields.length; n < f; n++) {
		if(this._sec.forceFields[n].idNum == this.idNum) idToRemove = n;
	}
	this._sec.forceFields.splice(idToRemove,1);
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		if(this.nodesProc[n].kernelDir != undefined) {
			this.nodesProc[n].kernelDir.setKernelSource(this.nodesProc[n].generatekernelDir_Source());	
			this.nodesProc[n].updatekernelDir_Arguments(); 
		}
		if(this.nodesProc[n].clglWork_nodes != undefined) { 
			this.nodesProc[n].updateNodes();
			this.nodesProc[n].updateLinks(); 
		}
	}
	
	this.updateJigLib();
};

/**
* Get a graph node
* @type Void
* @param {Object} jsonIn
* 	@param {StormGraph} jsonIn.node The node
*/
StormForceField.prototype.get = function(jsonIn) {   
	if(jsonIn.node.objectType != 'graph') {
		alert('you must select a particle or graph');
		return;
	}
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		if(jsonIn.node.objectType == this.nodesProc[n].objectType && jsonIn.node.idNum == this.nodesProc[n].idNum) {
			alert('This particle or graph already exist in this polarity point');
			return;
		}
	}
	
	this.nodesProc.push(jsonIn.node);
	var nproc = this.nodesProc[this.nodesProc.length-1];
	console.log(nproc);
	
	
	if(nproc.kernelDir != undefined && nproc.kernelDir instanceof WebCLGLKernel) {
		var kernelDir_Source = jsonIn.node.generatekernelDir_Source(); 
		nproc.kernelDir.setKernelSource(kernelDir_Source);	
		nproc.updatekernelDir_Arguments(); 
	}
	if(nproc.clglWork_nodes != undefined) {
		nproc.updateNodes();
		nproc.updateLinks(); 		
	}
};

/**
* Remove a graph node
* @type Void
* @param {Object} jsonIn
* 	@param {StormNode} jsonIn.node The node
*/
StormForceField.prototype.removeParticles = function(jsonIn) {
	var idToRemove = undefined;
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		if(jsonIn.node.idNum == this.nodesProc[n].idNum) idToRemove = n;
	}
	this.nodesProc.splice(idToRemove,1);
};


