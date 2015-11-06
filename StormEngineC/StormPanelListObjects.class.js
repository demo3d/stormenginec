/**
* @class
* @constructor
*/
StormEngineC_PanelListObjects = function(sec) {
	this._sec = sec;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.loadPanel = function() {
	this.panel = new StormPanel({"id": 'DIVID_StormPanelListObjects',
								"paneltitle": 'LIST OBJECTS'});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.show = function() {
	this.panel.show(); 
	
	this.showListObjects();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.showListObjects = function() {
	$('#DIVID_StormPanelListObjects_content').html("");
	var str = '';
	for(var n=0, f = this._sec.nodes.length; n < f; n++) {
		if(this._sec.nodes[n].objectType != 'light' && this._sec.nodes[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'node' && this._sec.nearNode == this._sec.nodes[n]) ? '#444' : '#000';
			var colorText = (this._sec.nodes[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_nodes"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.nodes[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_nodes"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.nodes[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.nodesCam.length; n < f; n++) {
		if(this._sec.nodesCam[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'camera' && this._sec.nearNode == this._sec.nodesCam[n]) ? '#444' : '#000';
			var colorText = (this._sec.nodesCam[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_nodesCam"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.nodesCam[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_nodesCam"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.nodesCam[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.lines.length; n < f; n++) {
		if(this._sec.lines[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'line' && this._sec.nearNode == this._sec.lines[n]) ? '#444' : '#000';
			var colorText = (this._sec.lines[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_lines"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.lines[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_lines"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.lines[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.lights.length; n < f; n++) {
		if(this._sec.lights[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'light' && this._sec.nearNode == this._sec.lights[n]) ? '#444' : '#000';
			var colorText = (this._sec.lights[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_lights"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.lights[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_lights"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.lights[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.polarityPoints.length; n < f; n++) {
		if(this._sec.polarityPoints[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'polarityPoint' && this._sec.nearNode == this._sec.polarityPoints[n]) ? '#444' : '#000';
			var colorText = (this._sec.polarityPoints[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_polarityPoints"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.polarityPoints[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_polarityPoints"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.polarityPoints[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.forceFields.length; n < f; n++) {
		if(this._sec.forceFields[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'forceField' && this._sec.nearNode == this._sec.forceFields[n]) ? '#444' : '#000';
			var colorText = (this._sec.forceFields[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_forceFields"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.forceFields[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_forceFields"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.forceFields[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.graphs.length; n < f; n++) {
		if(this._sec.graphs[n].systemVisible == true) {
			var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'graphs' && this._sec.nearNode == this._sec.graphs[n]) ? '#444' : '#000';
			var colorText = (this._sec.graphs[n].visibleOnContext == true) ? '#FFF': '#999';
			str = "<div id='TDID_StormObjectNum_graphs"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.graphs[n].name+"</div>";
			$('#DIVID_StormPanelListObjects_content').append(str);
			
			var e = document.getElementById("TDID_StormObjectNum_graphs"+n);
			e.addEventListener("click", (function(e, n) {
				this._sec.PanelListObjects.select($(e), this._sec.graphs[n]);
			}).bind(this, e, n));
		}
	}
	for(var n=0, f = this._sec.voxelizators.length; n < f; n++) {
		var colorBg = (this._sec.nearNode != undefined && this._sec.nearNode.objectType == 'voxelizator' && this._sec.nearNode == this._sec.voxelizators[n]) ? '#444' : '#000';
		var colorText = '#FFF';
		str = "<div id='TDID_StormObjectNum_voxelizators"+n+"' style='background-color:"+colorBg+";color:"+colorText+";'>"+this._sec.voxelizators[n].name+"</div>";
		$('#DIVID_StormPanelListObjects_content').append(str);
		
		var e = document.getElementById("TDID_StormObjectNum_voxelizators"+n);
		e.addEventListener("click", (function(e, n) {
			this._sec.PanelListObjects.select($(e), this._sec.voxelizators[n]);
		}).bind(this, e, n));
	}
	
	
	
	$("#DIVID_StormPanelListObjects_content div").css({	'cursor':'pointer',
											'border':'1px solid #444'});
	$("#DIVID_StormPanelListObjects_content div").bind('mouseover', function() {
											$(this).css({'border':'1px solid #CCC'});
										});
	$("#DIVID_StormPanelListObjects_content div").bind('mouseout', function() {
											$(this).css({'border':'1px solid #444'});
										});
};
/**
* @type Void
* @private
*/
StormEngineC_PanelListObjects.prototype.select = function(element, node) {
	var selectedNode = node; 
	if(this._sec.pickingCall != undefined) {
		if(element != undefined) element.css("background-color","#444");
		var strEv = "this._sec.nearNode."+this._sec.pickingCall.replace(/_selectedNode_/g,"selectedNode"); 
		try {
			eval(strEv);
		}catch(e) {
		}
		this._sec.pickingCall = undefined;
		document.body.style.cursor='default'; 
		if(element != undefined) element.css("background-color","#000");
		this._sec.PanelEditNode.updateNearNode(); 
	} else {
		$("#DIVID_StormPanelListObjects_content div").css("background-color","#000");
		if(element != undefined) element.css("background-color","#444");  
		this._sec.selectNode(node);
	}
};

