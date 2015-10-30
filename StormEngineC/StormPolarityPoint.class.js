/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormPolarityPoint = function(sec, jsonIn) {	StormNode.call(this); 
	this._sec = sec;
	
	this.objectType = 'polarityPoint';
	
	this.pointSize = 2.0;
	this.polarity = (jsonIn != undefined && jsonIn.polarity != undefined) ? jsonIn.polarity : 1;  
	this.orbit = (jsonIn != undefined && jsonIn.orbit != undefined) ? jsonIn.orbit : 0;
	this.force = (jsonIn != undefined && jsonIn.force != undefined) ? jsonIn.force : 0.5;  
	this.nodesProc = [];
	
	if(this.polarity == 1) this.color = $V3([1.0,0.0,0.0]);
	else this.color = $V3([0.0,0.0,1.0]); 
};
StormPolarityPoint.prototype = Object.create(StormNode.prototype);

/**
* Delete this polarity point
* @type Void
*/
StormPolarityPoint.prototype.remove = function() {
	var idToRemove = undefined;
	for(var n = 0, f = this._sec.polarityPoints.length; n < f; n++) {
		if(this._sec.polarityPoints[n].idNum == this.idNum) idToRemove = n;
	}
	this._sec.polarityPoints.splice(idToRemove,1);
	
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
	
	this.nodesProc = [];
};

/**
* Get a graph node
* @type Void
* @param	{Object} jsonIn
* 	@param {StormNode} jsonIn.node The node.
*/
StormPolarityPoint.prototype.get = function(jsonIn) {   	
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
* @param	{Object} jsonIn
* 	@param {StormNode} jsonIn.node The node.
*/
StormPolarityPoint.prototype.removeParticles = function(jsonIn) {
	var idToRemove = undefined;
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		if(jsonIn.node.idNum == this.nodesProc[n].idNum) idToRemove = n;
	}
	this.nodesProc.splice(idToRemove,1);
};

/**
* Set the polarity
* @type Void
* @param {Int} polarity 1=positive 0=negative  
*/
StormPolarityPoint.prototype.setPolarity = function(polarity) {  
	this.polarity = polarity;
	if(this.polarity == 1) this.color = $V3([1.0,0.0,0.0]);
	else this.color = $V3([0.0,0.0,1.0]);
	this.setAlbedo(this.color);
	
	for(var p = 0, fp = this._sec.polarityPoints.length; p < fp; p++) {
		if(this._sec.polarityPoints[p] == this) {
			for(var n = 0, fn = this.nodesProc.length; n < fn; n++) {				
				var selectedKernel;
				if(this.nodesProc[n].kernelDir != undefined) {
					selectedKernel = this.nodesProc[n].kernelDir;	
					selectedKernel.setKernelArg('pole'+p+'Polarity', polarity); 
				}
				if(this.nodesProc[n].clglWork_nodes != undefined) {
					this.nodesProc[n].clglWork_nodes.setArg('pole'+p+'Polarity', polarity);
					this.nodesProc[n].clglWork_links.setArg('pole'+p+'Polarity', polarity);
				}
			}
		}
	}
};

/**
* Set the force
* @type Void
* @param {Float} force from 0.0 to 1.0
*/
StormPolarityPoint.prototype.setForce = function(force) {  
	this.force = force;
	
	for(var p = 0, fp = this._sec.polarityPoints.length; p < fp; p++) {
		if(this._sec.polarityPoints[p] == this) {
			for(var n = 0, fn = this.nodesProc.length; n < fn; n++) {				
				var selectedKernel;
				if(this.nodesProc[n].kernelDir != undefined) {
					selectedKernel = this.nodesProc[n].kernelDir;	
					selectedKernel.setKernelArg('pole'+p+'Force', force); 
				}
				if(this.nodesProc[n].clglWork_nodes != undefined) {
					this.nodesProc[n].clglWork_nodes.setArg('pole'+p+'Force', force);
					this.nodesProc[n].clglWork_links.setArg('pole'+p+'Force', force);
				}
			}
		}
	}
};

/**
* Enable orbit mode
* @type Void
*/
StormPolarityPoint.prototype.enableOrbit = function() {  
	this.orbit = 1;
	
	for(var p = 0, fp = this._sec.polarityPoints.length; p < fp; p++) {
		if(this._sec.polarityPoints[p] == this) {
			for(var n = 0, fn = this.nodesProc.length; n < fn; n++) {				
				var selectedKernel;
				if(this.nodesProc[n].kernelDir != undefined) {
					selectedKernel = this.nodesProc[n].kernelDir;	
					selectedKernel.setKernelArg('pole'+p+'Orbit', 1.0); 
				}
				if(this.nodesProc[n].clglWork_nodes != undefined) {
					this.nodesProc[n].clglWork_nodes.setArg('pole'+p+'Orbit', 1.0);
					this.nodesProc[n].clglWork_links.setArg('pole'+p+'Orbit', 1.0); 
				}
			}
		}
	}
};

/**
* Disable orbit mode
* @type Void
*/
StormPolarityPoint.prototype.disableOrbit = function(force) {  
	this.orbit = 0;
	
	for(var p = 0, fp = this._sec.polarityPoints.length; p < fp; p++) {
		if(this._sec.polarityPoints[p] == this) {
			for(var n = 0, fn = this.nodesProc.length; n < fn; n++) {				
				var selectedKernel;
				if(this.nodesProc[n].kernelDir != undefined) {
					selectedKernel = this.nodesProc[n].kernelDir;	
					selectedKernel.setKernelArg('pole'+p+'Orbit', 0.0); 
				}
				if(this.nodesProc[n].clglWork_nodes != undefined) {
					this.nodesProc[n].clglWork_nodes.setArg('pole'+p+'Orbit', 0.0);
					this.nodesProc[n].clglWork_links.setArg('pole'+p+'Orbit', 0.0);
				}
			}
		}
	}
};