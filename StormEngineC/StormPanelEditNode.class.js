/**
* @class
* @constructor
*/
StormEngineC_PanelEditNode = function(sec) {
	this._sec = sec;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.loadPanel = function() {
	var html = '<span style="font-weight:bold" id="DIVID_StormEditNode_name"></span>'+
				'<div id="DIVID_StormEditNode_edits"></div>';
	this.panel = new StormPanel({"id": 'DIVID_StormPanelEditNode',
								"paneltitle": 'EDIT OBJECT',
								"html": html});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.show = function() {
	this.panel.show();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.updateNearNode = function() {
	if(this._sec.nearNode == undefined) {
		$('#DIVID_StormEditNode_name').html("");
		$('#DIVID_StormEditNode_edits').html('');
	} else {
		if(this._sec.nearNode.name != undefined) $('#DIVID_StormEditNode_name').html(this._sec.nearNode.name);
		$('#DIVID_StormEditNode_edits').html('');
		
		
		lines_rotation = (function(target) {
			var str = '<div>'+
							'ROTATE: '+
							"<input type='text' id='StormEN_tlVal' value='90.0' style='width:30px' />"+
							' X<input id="StormEN_spinnerRotX" name="value" value="0.0" style="color:#FFF;width:1px">'+
							' Y<input id="StormEN_spinnerRotY" name="value" value="0.0" style="color:#FFF;width:1px">'+
							' Z<input id="StormEN_spinnerRotZ" name="value" value="0.0" style="color:#FFF;width:1px">'+
						'</div>';
			this._sec.actHelpers.appendStringChild(str, DGE('DIVID_StormEditNode_edits'));
			
			$("#StormEN_spinnerRotX").spinner({numberFormat:"n",
												spin: (function(event, ui) {
													if(event.currentTarget.textContent == '▲') {
														this._sec.nearNode.setRotationX(this._sec.utils.degToRad(+$('#StormEN_tlVal').val())); 
													} else {
														this._sec.nearNode.setRotationX(this._sec.utils.degToRad(-$('#StormEN_tlVal').val())); 
													}
												}).bind(this)
											});
			$("#StormEN_spinnerRotY").spinner({numberFormat:"n",
												spin: (function(event, ui) {
													if(event.currentTarget.textContent == '▲') {
														this._sec.nearNode.setRotationY(this._sec.utils.degToRad(+$('#StormEN_tlVal').val())); 
													} else {
														this._sec.nearNode.setRotationY(this._sec.utils.degToRad(-$('#StormEN_tlVal').val())); 
													}
												}).bind(this)
											});
			$("#StormEN_spinnerRotZ").spinner({numberFormat:"n",
												spin: (function(event, ui) {
													if(event.currentTarget.textContent == '▲') {
														this._sec.nearNode.setRotationZ(this._sec.utils.degToRad(+$('#StormEN_tlVal').val())); 
													} else {
														this._sec.nearNode.setRotationZ(this._sec.utils.degToRad(-$('#StormEN_tlVal').val())); 
													}
												}).bind(this)
											});
		}).bind(this);
		add_removeBtn = (function(clickCallback) {
			var str = '<button id="BUTTONID_remove">REMOVE</button><br />';
			this._sec.actHelpers.appendStringChild(str, DGE('DIVID_StormEditNode_edits'));
			
			document.getElementById("BUTTONID_remove").addEventListener("click", (function() {
				clickCallback();
				
				this._sec.PanelListObjects.showListObjects();
				this._sec.nearNode = undefined;
				this._sec.PanelEditNode.updateNearNode();
			}).bind(this));
		}).bind(this);
		
		
		
		
		
		if(this._sec.nearNode.objectType == 'node') {								
			add_removeBtn((function() {
				this._sec.nearNode.remove();
			}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "VISIBILITY", this._sec.nearNode.visibleOnContext,
					(function() {
						this._sec.nearNode.visible(true);
						this._sec.PanelListObjects.showListObjects();
						this._sec.PanelEditNode.updateNearNode();
					}).bind(this), (function() {
						this._sec.nearNode.visible(false);
						this._sec.PanelListObjects.showListObjects();
						this._sec.PanelEditNode.updateNearNode();
					}).bind(this));	
			
			var pos = [this._sec.nearNode.getPosition().e[0], this._sec.nearNode.getPosition().e[1], this._sec.nearNode.getPosition().e[2]];
			this._sec.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, (function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				this._sec.nearNode.setPosition(pos);
				this._sec.debugValues = [];
				this._sec.setDebugValue(0, pos, this._sec.nearNode.name);
			}).bind(this));
			
			lines_rotation();
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "EDITMODE", this._sec.nearNode.selectedNodeIsInEditionMode(),
					(function() {
						this._sec.nearNode.editSelectedNode();
					}).bind(this), (function() {
						this._sec.nearNode.uneditSelectedNode();
					}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DRAGGABLE", this._sec.nearNode.isDraggable,
					(function() {
						this._sec.nearNode.draggable(true);
					}).bind(this), (function() {
						this._sec.nearNode.draggable(false);
					}).bind(this));
		}
		if(this._sec.nearNode.objectType == 'polarityPoint') {	
			add_removeBtn((function() {
				this._sec.nearNode.remove();
			}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "VISIBILITY", this._sec.nearNode.visibleOnContext,
					(function() {
						this._sec.nearNode.visible(true);
						this._sec.PanelListObjects.showListObjects();
						this._sec.PanelEditNode.updateNearNode();
					}).bind(this), (function() {
						this._sec.nearNode.visible(false);
						this._sec.PanelListObjects.showListObjects();
						this._sec.PanelEditNode.updateNearNode();
					}).bind(this));
			
			var pos = [this._sec.nearNode.getPosition().e[0], this._sec.nearNode.getPosition().e[1], this._sec.nearNode.getPosition().e[2]];
			this._sec.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, (function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				this._sec.nearNode.setPosition(pos);
				this._sec.debugValues = [];
				this._sec.setDebugValue(0, pos, this._sec.nearNode.name);
			}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DRAGGABLE", this._sec.nearNode.isDraggable,
					(function() {
						this._sec.nearNode.draggable(true);
					}).bind(this), (function() {
						this._sec.nearNode.draggable(false);
					}).bind(this));	
			
			this._sec.actHelpers.add_select(DGE('DIVID_StormEditNode_edits'), "POLARITY", [1,0], this._sec.nearNode.polarity,
					(function(value) {
						this._sec.nearNode.setPolarity(parseFloat(value));
					}).bind(this));	
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "ORBIT", this._sec.nearNode.orbit,
					(function() {
						this._sec.nearNode.enableOrbit();
					}).bind(this), (function() {
						this._sec.nearNode.disableOrbit();
					}).bind(this));
			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FORCE", this._sec.nearNode.force, 0.0, 1.0, 0.05, (function(value) {
				this._sec.nearNode.setForce(value);
			}).bind(this));
			
			this._sec.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "GET_", (function() {
				this._sec.pickingCall='get({node:_selectedNode_});';  
				this._sec.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			}).bind(this));
			var str = "";
			for(var n = 0, f = this._sec.nearNode.nodesProc.length; n < f; n++)
				str += '<br />'+this._sec.nearNode.nodesProc[n].name;
			$('#DIVID_StormEditNode_edits').append(str);
		}
		if(this._sec.nearNode.objectType == 'forceField') {
			//lines_position();
			add_removeBtn((function() {
				this._sec.nearNode.deleteForceField();
			}).bind(this));
					
			var dir = [this._sec.nearNode.direction.e[0], this._sec.nearNode.direction.e[1], this._sec.nearNode.direction.e[2]];
			this._sec.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "DIRECTION", dir, -1.0, 1.0, 0.1, (function(vector) {
				var dir = $V3([vector[0], vector[1], vector[2]]);
				this._sec.nearNode.setDirection(dir);
			}).bind(this));
			
			this._sec.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "GET_", (function() {
				this._sec.pickingCall='get({node:_selectedNode_});';  
				this._sec.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			}).bind(this));
			var str = "";
			for(var n = 0, f = this._sec.nearNode.nodesProc.length; n < f; n++) 
				str += '<br />'+this._sec.nearNode.nodesProc[n].name;
			$('#DIVID_StormEditNode_edits').append(str);
		}
		if(this._sec.nearNode.objectType == 'graph') {		
			add_removeBtn((function() {
				this._sec.nearNode.remove();
			}).bind(this));
			
			var str = 	"<div>"+(this._sec.nearNode.currentNodeId)+" nodes: [vertices: "+this._sec.nearNode.arrayNodeVertexPos.length+", indices: "+this._sec.nearNode.arrayNodeIndices.length+"]</div>"+
						"<div>"+(this._sec.nearNode.currentLinkId/2)+" links: [vertices: "+this._sec.nearNode.arrayLinkVertexPos.length+", indices: "+this._sec.nearNode.arrayLinkIndices.length+"]</div>";						
			$('#DIVID_StormEditNode_edits').append(str);
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "EDITMODE", this._sec.nearNode.selectedNodeIsInEditionMode(),
					(function() {
						this._sec.nearNode.editSelectedNode();
					}).bind(this), (function() {
						this._sec.nearNode.uneditSelectedNode();
					}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SELFSHADOWS", this._sec.nearNode.selfShadows,
					(function() {
						this._sec.nearNode.setSelfShadows(true);
					}).bind(this), (function() {
						this._sec.nearNode.setSelfShadows(false);
					}).bind(this));		
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SHADOWS", this._sec.nearNode.shadows,
					(function() {
						this._sec.nearNode.setShadows(true);
					}).bind(this), (function() {
						this._sec.nearNode.setShadows(false);
					}).bind(this));	
			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "POINTSIZE", this._sec.nearNode.pointSize, 0.0, 50.0, 0.1, (function(value) {
				this._sec.nearNode.set_pointSize(value);
			}).bind(this));
			
			this._sec.actHelpers.add_select(DGE('DIVID_StormEditNode_edits'), "POLARITY", [1,0], this._sec.nearNode.polarity,	(function(value) {
				this._sec.nearNode.set_polarity(parseFloat(value));
			}).bind(this));
			
			this._sec.actHelpers.add_colorpicker(DGE('DIVID_StormEditNode_edits'), "NODE_COLOR", "#000", (function(colorValue) {
				var rgb = this._sec.utils.hexToRgb(colorValue);
				
				this._sec.nearNode.set_color($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
			}).bind(this));
			
			this._sec.actHelpers.add_imageSelection(DGE('DIVID_StormEditNode_edits'), "NODE_COLOR_BY_IMG", (function(img) {
				this._sec.nearNode.set_color(img);
			}).bind(this));
			
			this._sec.actHelpers.add_colorpicker(DGE('DIVID_StormEditNode_edits'), "LINK_COLOR", "#000", (function(colorValue) {
				var rgb = this._sec.utils.hexToRgb(colorValue);
				
				this._sec.nearNode.set_linkColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
			}).bind(this));
			
			this._sec.actHelpers.add_imageSelection(DGE('DIVID_StormEditNode_edits'), "LINK_COLOR_BY_IMG", (function(img) {
				this._sec.nearNode.set_linkColor(img);
			}).bind(this));
			
			this._sec.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DIRECTION_TO_0", (function() {
				this._sec.nearNode.set_dir();
			}).bind(this));
			
			this._sec.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DIRECTION_TO_RANDOM", (function() {
				this._sec.nearNode.set_dir('random');
			}).bind(this));
			
			this._sec.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "POSITION_WidthHeight", "number", ["width", "height", "spacing"], ["128", "128", "1.5"], (function(arrayValues) {				
				this._sec.nearNode.set_pos({"width": parseFloat(arrayValues[0]), "height": parseFloat(arrayValues[1]), "spacing": parseFloat(arrayValues[2])});
			}).bind(this));
			
			this._sec.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "POSITION_RADIUS", "number", ["radius"], ["1.5"], (function(arrayValues) {	
				this._sec.nearNode.set_pos({"radius": arrayValues[0]});
			}).bind(this));
			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "LIFE_DISTANCE", this._sec.nearNode.lifeDistance, 0.0, 1000.0, 0.1, (function(value) {
				this._sec.nearNode.set_lifeDistance(value);
			}).bind(this));
			
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "ENABLE_DESTINATION", this._sec.nearNode.enDestination,
					(function() {
						this._sec.nearNode.set_enableDestination();
					}).bind(this), (function() {
						this._sec.nearNode.set_disableDestination();
					}).bind(this));	
			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DESTINATION_FORCE", this._sec.nearNode.destinationForce, 0.0, 1.0, 0.05, (function(value) {
				this._sec.nearNode.set_destinationForce(value);
			}).bind(this));
			
			this._sec.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "DESTINATION_WidthHeight", "number", ["width", "height", "spacing"], ["128", "128", "1.5"], (function(arrayValues) {				
				this._sec.nearNode.set_destinationWidthHeight({"width": arrayValues[0], "height": arrayValues[1], "spacing": arrayValues[2]});
			}).bind(this));
			
			this._sec.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DESTINATION_VOLUME", (function() {
				this._sec.pickingCall='setDestinationVolume({voxelizator:_selectedNode_});';  
				this._sec.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			}).bind(this));
		}
		if(this._sec.nearNode.objectType == 'camera') {
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SET_ACTIVE", (this._sec.nearNode.idNum == this._sec.defaultCamera.idNum),
					(function() {
						this._sec.setWebGLCam(this._sec.nearNode);
						this._sec.PanelEditNode.updateNearNode();
					}).bind(this), (function() {
						
					}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "LOCK_ROTATION_X", this._sec.nearNode.lockRotX,
					(function() {
						this._sec.nearNode.lockRotationX();
					}).bind(this), (function() {
						this._sec.nearNode.unlockRotationX();
					}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "LOCK_ROTATION_Y", this._sec.nearNode.lockRotY,
					(function() {
						this._sec.nearNode.lockRotationY();
					}).bind(this), (function() {
						this._sec.nearNode.unlockRotationY();
					}).bind(this));
			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FOV", this._sec.nearNode.fov, 0.1, 180.0, 0.1, (function(fvalue) {
						this._sec.nearNode.setFov(fvalue);
					}).bind(this));
							
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FOCUS_DISTANCE", this._sec.nearNode.focusExtern, 0.55, 1000.0, 0.1, (function(fvalue) {
						this._sec.nearNode.focusExtern = fvalue; 
						this._sec.nearNode.setFocusIntern();
					}).bind(this));
						
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "VIEW_FOCUS", this._sec.nearNode.nodePivot.nodeFocus.visibleOnContext,
					(function() {
						this._sec.nearNode.nodePivot.nodeFocus.visibleOnContext = true;
					}).bind(this), (function() {
						this._sec.nearNode.nodePivot.nodeFocus.visibleOnContext = false;
					}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DOF", this._sec.defaultCamera.DOFenable,
					(function() {
						this._sec.defaultCamera.DOFenable = true;
					}).bind(this), (function() {
						this._sec.defaultCamera.DOFenable = false;
					}).bind(this));
			
			this._sec.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "AUTO_FOCUS", this._sec.defaultCamera.autofocus,
					(function() {
						this._sec.defaultCamera.autofocus = true;
					}).bind(this), (function() {
						this._sec.defaultCamera.autofocus = false;
					}).bind(this));
		}
		if(this._sec.nearNode.objectType == 'light') {
			if(this._sec.nearNode.type != "sun") {
				var pos = [this._sec.nearNode.getPosition().e[0], this._sec.nearNode.getPosition().e[1], this._sec.nearNode.getPosition().e[2]];
				this._sec.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, (function(vector) {
					var pos = $V3([vector[0], vector[1], vector[2]]);
					this._sec.nearNode.setPosition(pos);
					this._sec.debugValues = [];
					this._sec.setDebugValue(0, pos, this._sec.nearNode.name);
				}).bind(this));
			}
			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FOV", this._sec.nearNode.fov, 0.1, 180.0, 0.1, (function(fvalue) {
				this._sec.nearNode.setFov(fvalue);
			}).bind(this));
			
			// COLOR
			var currentColor = this._sec.nearNode.color;
		    var hexColor = this._sec.utils.rgbToHex([currentColor.e[0]*255, currentColor.e[1]*255, currentColor.e[2]*255]);
		    this._sec.actHelpers.add_colorpicker(DGE('DIVID_StormEditNode_edits'), "Color", hexColor, (function(colorValue) {
				var rgb = this._sec.utils.hexToRgb(colorValue);
		    	
				this._sec.nearNode.setLightColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
			}).bind(this));
			

		    this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "KELVINS", this._sec.nearNode.fov, 1000, 15000, 0.1, (function(fvalue) {
				this._sec.nearNode.setLightColor(fvalue);
				//$('#DIVID_StormEditNode_color_paramColor').css('background','rgb('+parseInt(this._sec.nearNode.color.e[0]*255)+','+parseInt(this._sec.nearNode.color.e[1]*255)+','+parseInt(this._sec.nearNode.color.e[2]*255)+')');
			}).bind(this));
			
			this.lightDirectionX = this._sec.nearNode.direction.e[0];
			this.lightDirectionZ = this._sec.nearNode.direction.e[2];
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DIRECTION_X", this.lightDirectionX, -1.0, 1.0, 0.001, (function(fvalue) {
				this._sec.lights[0].setDirection($V3([fvalue, -0.5, this.lightDirectionZ])); 
			}).bind(this));			
			this._sec.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DIRECTION_Y", this.lightDirectionZ, -1.0, 1.0, 0.001, (function(fvalue) {
				this._sec.lights[0].setDirection($V3([this.lightDirectionX, -0.5, fvalue])); 
			}).bind(this));
		}
		
		if(this._sec.nearNode.objectType == 'line') {
			var pos = [this._sec.nearNode.origin.e[0], this._sec.nearNode.origin.e[1], this._sec.nearNode.origin.e[2]];
			this._sec.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "ORIGIN", pos, -100000.0, 100000.0, 0.1, (function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				this._sec.nearNode.setOrigin(pos);
				this._sec.debugValues = [];
				this._sec.setDebugValue(0, pos, this._sec.nearNode.name+' origin');
			}).bind(this));
			var pos = [this._sec.nearNode.end.e[0], this._sec.nearNode.end.e[1], this._sec.nearNode.end.e[2]];
			this._sec.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "END", pos, -100000.0, 100000.0, 0.1, (function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				this._sec.nearNode.setEnd(pos);
				this._sec.debugValues = [];
				this._sec.setDebugValue(1, pos, this._sec.nearNode.name+' end');
			}).bind(this));
		}
		
		if(this._sec.nearNode.objectType == 'voxelizator') {
			var str = ''+ 
				'<br />Grid size: <span id="DIVID_StormEditNode_GImake_size"></span>m'+
				'<div id="DIVID_StormEditNode_GImake_SLIDER_size"></div>'+
				'<br />Grid resolution: <span id="DIVID_StormEditNode_GImake_resolution"></span>'+
				'<div id="DIVID_StormEditNode_GImake_SLIDER_resolution"></div>'+
				'<br />Fill mode:'+
				'<div>'+
					'Albedo:<input type="checkbox" id="CHECKBOX_StormEditNode_GImake_albedo"/>'+
					'Position:<input type="checkbox" id="CHECKBOX_StormEditNode_GImake_position"/>'+
					'Normal:<input type="checkbox" id="CHECKBOX_StormEditNode_GImake_normal"/>'+
				'</div>'+
				'<button type="button" id="DIVID_StormEditNode_GImake">generateFromScene</button>'+
				'<div id="DIVID_StormEditNode_GImakeOUTPUT"></div>'; 
			$("#DIVID_StormEditNode_edits").append(str);
			
			$('#DIVID_StormEditNode_GImake_size').text(this._sec.nearNode.size); 
			$('#DIVID_StormEditNode_GImake_resolution').text(this._sec.nearNode.resolution); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').html(''); 
			if(this._sec.nearNode.image3D_VoxelsColor != undefined) {
				var image = this._sec.nearNode.image3D_VoxelsColor;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('3D ImageElement Albedo<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_albedo').checked = true;
			}
			if(this._sec.nearNode.image3D_VoxelsPositionX != undefined) {
				var image = this._sec.nearNode.image3D_VoxelsPositionX;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionX<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
			}
			if(this._sec.nearNode.image3D_VoxelsPositionY != undefined) {
				var image = this._sec.nearNode.image3D_VoxelsPositionY;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionY<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
			}
			if(this._sec.nearNode.image3D_VoxelsPositionZ != undefined) {
				var image = this._sec.nearNode.image3D_VoxelsPositionZ;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionZ<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
			}
			if(this._sec.nearNode.image3D_VoxelsNormal != undefined) {
				var image = this._sec.nearNode.image3D_VoxelsNormal;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement Normal<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_normal').checked = true;
			}
			
			// GI functions
			$("#DIVID_StormEditNode_GImake_SLIDER_size").slider({max:150.0,
														min:1.0,
														value:this._sec.nearNode.size,
														step:1,
														slide: (function(event,ui){
																this._sec.nearNode.size = ui.value;
																$('#DIVID_StormEditNode_GImake_size').text(ui.value); 
															}).bind(this)});
	
			var currentResSLIDER = 0; 
			for(var cr=2, maxr=this._sec.nearNode.resolution; cr <= maxr; cr*=2) currentResSLIDER++;
			$("#DIVID_StormEditNode_GImake_SLIDER_resolution").slider({max:9,
														min:4,
														value:currentResSLIDER,
														step:1,
														slide: (function(event,ui){
																var res = 2;
																for(var n=1; n < ui.value; n++) res *= 2;
																
																this._sec.nearNode.resolution = res;
																$('#DIVID_StormEditNode_GImake_resolution').text(res);
															}).bind(this)});
			$("#DIVID_StormEditNode_GImake").on('click', (function() { 
					$('#DIVID_StormEditNode_GImakeOUTPUT').text('Performing voxelization...');
					
					setTimeout((function() { 
									var arraFillmodes = [];
									if(document.getElementById('CHECKBOX_StormEditNode_GImake_albedo').checked == true) arraFillmodes.push("albedo");
									if(document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked == true) arraFillmodes.push("position");
									if(document.getElementById('CHECKBOX_StormEditNode_GImake_normal').checked == true) arraFillmodes.push("normal");
									if(arraFillmodes.length > 0) {
										var voxelizator = this._sec.nearNode;   
										voxelizator.generateFromScene({size: this._sec.nearNode.size,
																		resolution: this._sec.nearNode.resolution,
																		fillmode: arraFillmodes,
																		ongenerate: (function() {
																			$('#DIVID_StormEditNode_GImakeOUTPUT').html('');
																			var image = voxelizator.get3DImageElement("albedo");
																			if(image) {
																				image.style.width = '50px';
																				image.style.border = '1px solid #FFF';
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('3D ImageElement Albedo<br />');  
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																			}
																			var image = voxelizator.get3DImageElement("positionX")
																			if(image) {
																				image.style.width = '50px';
																				image.style.border = '1px solid #FFF';
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionX<br />');  
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																			}
																			var image = voxelizator.get3DImageElement("positionY")
																			if(image) {
																				image.style.width = '50px';
																				image.style.border = '1px solid #FFF';
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionY<br />');  
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																			}
																			var image = voxelizator.get3DImageElement("positionZ")
																			if(image) {
																				image.style.width = '50px';
																				image.style.border = '1px solid #FFF';
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionZ<br />');  
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																			}
																			var image = voxelizator.get3DImageElement("normal")
																			if(image) {
																				image.style.width = '50px';
																				image.style.border = '1px solid #FFF';
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement Normal<br />');  
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image);
																				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
																			}
																		}).bind(this)});      
									} else {
										alert("Check at least one fillmode");
										$('#DIVID_StormEditNode_GImakeOUTPUT').text('');
									}
								}).bind(this),10);
				}).bind(this));	
		}
	
	}
};
