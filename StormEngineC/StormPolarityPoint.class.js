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
StormPolarityPoint = function(jsonIn) {
	this.objectType = 'polarityPoint';
	
	this.pointSize = 2.0;
	this.polarity = (jsonIn != undefined && jsonIn.polarity != undefined) ? jsonIn.polarity : 1;  
	this.orbit = (jsonIn != undefined && jsonIn.orbit != undefined) ? jsonIn.orbit : 0;
	this.force = (jsonIn != undefined && jsonIn.force != undefined) ? jsonIn.force : 0.5;  
	this.nodesProc = [];
	//this.loadSphere();
	if(this.polarity == 1) this.color = $V3([1.0,0.0,0.0]);
	else this.color = $V3([0.0,0.0,1.0]);
	
	this.pointDisplay =  new StormNode();
	this.pointDisplay.loadSphere({color:this.color,radius:0.1});
	this.buffersObjects = this.pointDisplay.buffersObjects;
};
StormPolarityPoint.prototype = new StormNode();

/**
* Delete this polarity point
* @type Void
*/
StormPolarityPoint.prototype.deletePolarityPoint = function() {
	var idToRemove = undefined;
	for(var n = 0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		if(stormEngineC.polarityPoints[n].idNum == this.idNum) idToRemove = n;
	}
	stormEngineC.polarityPoints.splice(idToRemove,1);
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) {
		var kernelDir_Source = this.nodesProc[n].generatekernelDir_Source(); 
		var kernelDirX_Source = kernelDir_Source+
								'out_float4 = vec4(newDir,1.0);\n'+
								'}';
		this.nodesProc[n].kernelDirX.setKernelSource(kernelDirX_Source);	
		this.nodesProc[n].updatekernelDir_Arguments(); 
	}
};

/**
* Get a node of particles
* @type Void
* @param	{Object} jsonIn
* 	@param {StormNode} jsonIn.node The node.
*/
StormPolarityPoint.prototype.get = function(jsonIn) {   
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
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments(); 
};

/**
* Set the force
* @type Void
* @param {Float} force from 0.0 to 1.0
*/
StormPolarityPoint.prototype.setForce = function(force) {  
	this.force = force;
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments(); 
};

/**
* Enable orbit mode
* @type Void
*/
StormPolarityPoint.prototype.enableOrbit = function() {  
	this.orbit = 1;
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments(); 
};

/**
* Disable orbit mode
* @type Void
*/
StormPolarityPoint.prototype.disableOrbit = function(force) {  
	this.orbit = 0;
	
	for(var n = 0, f = this.nodesProc.length; n < f; n++) this.nodesProc[n].updatekernelDir_Arguments(); 
};