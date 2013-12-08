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
*/
StormEngineC_PanelListObjects = function() {
	
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.loadPanel = function() {
	var html = '<div id="DIVID_STORMOBJECTS_LIST"></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelListObjects', 'LIST OBJECTS', html);
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
	
	this.showListObjects();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.showListObjects = function() {
	var str = '';
	for(var n=0, f = stormEngineC.nodes.length; n < f; n++) {
		if(stormEngineC.nodes[n].objectType != 'light' && stormEngineC.nodes[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'node' && stormEngineC.nearNode.idNum == stormEngineC.nodes[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.nodes[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.nodes["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.nodes[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.nodesCam.length; n < f; n++) {
		if(stormEngineC.nodesCam[n].systemVisible == true && stormEngineC.nodesCam[n].idNum != 0) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'camera' && stormEngineC.nearNode.idNum == stormEngineC.nodesCam[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.nodesCam[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.nodesCam["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.nodesCam[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.lines.length; n < f; n++) {
		if(stormEngineC.lines[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'line' && stormEngineC.nearNode.idNum == stormEngineC.lines[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.lines[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.lines["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.lines[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.lights.length; n < f; n++) {
		if(stormEngineC.lights[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'light' && stormEngineC.nearNode.idNum == stormEngineC.lights[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.lights[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.lights["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.lights[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.polarityPoints.length; n < f; n++) {
		if(stormEngineC.polarityPoints[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'polarityPoint' && stormEngineC.nearNode.idNum == stormEngineC.polarityPoints[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.polarityPoints[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.polarityPoints["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.polarityPoints[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.forceFields.length; n < f; n++) {
		if(stormEngineC.forceFields[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'forceField' && stormEngineC.nearNode.idNum == stormEngineC.forceFields[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.forceFields[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.forceFields["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.forceFields[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.particles.length; n < f; n++) {
		if(stormEngineC.particles[n].systemVisible == true) {
			var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'particles' && stormEngineC.nearNode.idNum == stormEngineC.particles[n].idNum) ? '#444' : '#000';
			var colorText = (stormEngineC.particles[n].visibleOnContext == true) ? '#FFF': '#999';
			str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.particles["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.particles[n].name+"</div>";
		}
	}
	for(var n=0, f = stormEngineC.voxelizators.length; n < f; n++) {
		var colorBg = (stormEngineC.nearNode != undefined && stormEngineC.nearNode.objectType == 'voxelizator' && stormEngineC.nearNode.idNum == stormEngineC.voxelizators[n].idNum) ? '#444' : '#000';
		var colorText = '#FFF';
		str += "<div id='TDID_StormObjectNum_"+n+"' onclick='stormEngineC.PanelListObjects.select($(this),stormEngineC.voxelizators["+n+"]);' style='background-color:"+colorBg+";color:"+colorText+";'>"+stormEngineC.voxelizators[n].name+"</div>";
	} 
	str += '';
	$('#DIVID_STORMOBJECTS_LIST').html(str);
	
	
	$("#DIVID_STORMOBJECTS_LIST div").css({	'cursor':'pointer',
											'border':'1px solid #444'});
	$("#DIVID_STORMOBJECTS_LIST div").bind('mouseover', function() {
											$(this).css({'border':'1px solid #CCC'});
										});
	$("#DIVID_STORMOBJECTS_LIST div").bind('mouseout', function() {
											$(this).css({'border':'1px solid #444'});
										});
};
/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.select = function(element, node) {
	var selectedNode = node; 
	if(stormEngineC.pickingCall != undefined) {
		if(element != undefined) element.css("background-color","#444");
		var strEv = "stormEngineC.nearNode."+stormEngineC.pickingCall.replace(/_selectedNode_/g,"selectedNode"); 
		try {
			eval(strEv);
		}catch(e) {
		}
		stormEngineC.pickingCall = undefined;
		document.body.style.cursor='default'; 
		if(element != undefined) element.css("background-color","#000");
		stormEngineC.PanelEditNode.updateNearNode(); 
	} else {
		$("#DIVID_STORMOBJECTS_LIST div").css("background-color","#000");
		if(element != undefined) element.css("background-color","#444");  
		stormEngineC.selectNode(node);
	}
};

