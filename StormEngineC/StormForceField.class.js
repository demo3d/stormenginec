/*
The MIT License (MIT)

Copyright (c) <2010> <Roberto Gonzalez. http://stormcolour.appspot.com/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */


/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormForceField = function(jsonIn) {
	this.objectType = 'forceField';
	this.forceFieldType = 'direction'; // direction or gravity
	
	this.direction = (jsonIn != undefined && jsonIn.direction != undefined) ? jsonIn.direction : $V3([0.0,-9.8,0.0]);   
	this.nodesProc = [];
};
StormForceField.prototype = new StormNode();

/** @private */
StormForceField.prototype.updateJigLib = function() {  
	if(this.forceFieldType == 'gravity') {  
		stormEngineC.stormJigLibJS.dynamicsWorld.setGravity(new Vector3D( this.direction.e[0], this.direction.e[1], this.direction.e[2], 0 ));
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
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments(); 
	
	this.updateJigLib();
};
/**
* Delete this force field
* @type Void
*/
StormForceField.prototype.deleteForceField = function() {
	var idToRemove = undefined;
	for(var n = 0, f = stormEngineC.forceFields.length; n < f; n++) {
		if(stormEngineC.forceFields[n].idNum == this.idNum) idToRemove = n;
	}
	stormEngineC.forceFields.splice(idToRemove,1);
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		var kernelDir_Source = this.nodesProc[n].generatekernelDir_Source(); 
		var kernelDirX_Source = kernelDir_Source+
								'out_float4 = vec4(newDir,1.0);\n'+
								'}';
		this.nodesProc[n].kernelDirX.setKernelSource(kernelDirX_Source);
		this.nodesProc[n].updatekernelDir_Arguments(); 
	}
	
	this.updateJigLib();
};

/**
* Get a node of particles
* @type Void
* @param {Object} jsonIn
* 	@param {StormNode} jsonIn.node The node
*/
StormForceField.prototype.get = function(jsonIn) {   
	var push = true;
	if(jsonIn.node.objectType != 'particles') {
		alert('No particle node');
		return;
	}
	for(var n = 0, f = this.nodesProc.length; n < f; n++) if(jsonIn.node.idNum == this.nodesProc[n].idNum) {push = false; break;}
	if(push == true) {
		this.nodesProc.push(jsonIn.node);
		
		var kernelDir_Source = jsonIn.node.generatekernelDir_Source(); 
		var kernelDirX_Source = kernelDir_Source+
								'out_float4 = vec4(newDir,1.0);\n'+
								'}';
		jsonIn.node.kernelDirX.setKernelSource(kernelDirX_Source);
		jsonIn.node.updatekernelDir_Arguments(); 
	} else alert('This particle already exist in this polarity point');
};

/**
* Remove a node of particles
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


