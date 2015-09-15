/**
* @class
* @constructor
* @augments StormNode

* @property {String} objectType
*/
StormGraph = function(jsonIn) { StormNode.call(this); 
	this.objectType = 'graph';
};
StormGraph.prototype = Object.create(StormNode.prototype);

/** @private */
StormGraph.prototype.u = function() {  
	
};


