/**
* @class
* @constructor
*/
StormEngineC_PanelEditNode = function() {
	this.actHelpers = new ActionHelpers();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.loadPanel = function() {
	var html = '<span style="font-weight:bold" id="DIVID_StormEditNode_name"></span>'+
				'<div id="DIVID_StormEditNode_edits"></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelEditNode', 'EDIT OBJECT', html);
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEditNode.prototype.updateNearNode = function() {
	if(stormEngineC.nearNode == undefined) {
		$('#DIVID_StormEditNode_name').html("");
		$('#DIVID_StormEditNode_edits').html('');
	} else {
		if(stormEngineC.nearNode.name != undefined) $('#DIVID_StormEditNode_name').html(stormEngineC.nearNode.name);
		$('#DIVID_StormEditNode_edits').html('');
		
		
		lines_rotation = (function(target) {
			var str = '<div>'+
							'ROTATE: '+
							"<input type='text' id='StormEN_tlVal' value='90.0' style='width:30px' />"+
							' X<input id="StormEN_spinnerRotX" name="value" value="0.0" style="color:#FFF;width:1px">'+
							' Y<input id="StormEN_spinnerRotY" name="value" value="0.0" style="color:#FFF;width:1px">'+
							' Z<input id="StormEN_spinnerRotZ" name="value" value="0.0" style="color:#FFF;width:1px">'+
						'</div>';
			DGE('DIVID_StormEditNode_edits').appendChild(this.actHelpers.stringToDom(str));
			
			$("#StormEN_spinnerRotX").spinner({numberFormat:"n",
												spin: function(event, ui) {
													if(event.currentTarget.textContent == '▲') {
														stormEngineC.nearNode.setRotationX(stormEngineC.utils.degToRad(+$('#StormEN_tlVal').val())); 
													} else {
														stormEngineC.nearNode.setRotationX(stormEngineC.utils.degToRad(-$('#StormEN_tlVal').val())); 
													}
												}
											});
			$("#StormEN_spinnerRotY").spinner({numberFormat:"n",
												spin: function(event, ui) {
													if(event.currentTarget.textContent == '▲') {
														stormEngineC.nearNode.setRotationY(stormEngineC.utils.degToRad(+$('#StormEN_tlVal').val())); 
													} else {
														stormEngineC.nearNode.setRotationY(stormEngineC.utils.degToRad(-$('#StormEN_tlVal').val())); 
													}
												}
											});
			$("#StormEN_spinnerRotZ").spinner({numberFormat:"n",
												spin: function(event, ui) {
													if(event.currentTarget.textContent == '▲') {
														stormEngineC.nearNode.setRotationZ(stormEngineC.utils.degToRad(+$('#StormEN_tlVal').val())); 
													} else {
														stormEngineC.nearNode.setRotationZ(stormEngineC.utils.degToRad(-$('#StormEN_tlVal').val())); 
													}
												}
											});
		}).bind(this);
		add_removeBtn = (function(clickCallback) {
			var str = '<button id="BUTTONID_remove">REMOVE</button><br />';
			DGE('DIVID_StormEditNode_edits').appendChild(this.actHelpers.stringToDom(str));
			
			document.getElementById("BUTTONID_remove").addEventListener("click", function() {
				clickCallback();
				
				stormEngineC.PanelListObjects.showListObjects();
				stormEngineC.nearNode = undefined;
				stormEngineC.PanelEditNode.updateNearNode();
			});
		}).bind(this);
		
		
		
		
		
		if(stormEngineC.nearNode.objectType == 'node') {								
			add_removeBtn(function() {
				stormEngineC.nearNode.remove();
			});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "VISIBILITY", stormEngineC.nearNode.visibleOnContext,
					function() {
						stormEngineC.nearNode.visible(true);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					}, function() {
						stormEngineC.nearNode.visible(false);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					});	
			
			var pos = [stormEngineC.nearNode.getPosition().e[0], stormEngineC.nearNode.getPosition().e[1], stormEngineC.nearNode.getPosition().e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setPosition(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name);
			});
			
			lines_rotation();
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "EDITMODE", stormEngineC.nearNode.selectedNodeIsInEditionMode(),
					function() {
						stormEngineC.nearNode.editSelectedNode();
					}, function() {
						stormEngineC.nearNode.uneditSelectedNode();
					});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DRAGGABLE", stormEngineC.nearNode.isDraggable,
					function() {
						stormEngineC.nearNode.draggable(true);
					}, function() {
						stormEngineC.nearNode.draggable(false);
					});
		}
		if(stormEngineC.nearNode.objectType == 'polarityPoint') {	
			add_removeBtn(function() {
				stormEngineC.nearNode.remove();
			});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "VISIBILITY", stormEngineC.nearNode.visibleOnContext,
					function() {
						stormEngineC.nearNode.visible(true);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					}, function() {
						stormEngineC.nearNode.visible(false);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					});
			
			var pos = [stormEngineC.nearNode.getPosition().e[0], stormEngineC.nearNode.getPosition().e[1], stormEngineC.nearNode.getPosition().e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setPosition(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name);
			});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DRAGGABLE", stormEngineC.nearNode.isDraggable,
					function() {
						stormEngineC.nearNode.draggable(true);
					}, function() {
						stormEngineC.nearNode.draggable(false);
					});	
			
			this.actHelpers.add_select(DGE('DIVID_StormEditNode_edits'), "POLARITY", [1,0], stormEngineC.nearNode.polarity,
					function(value) {
						stormEngineC.nearNode.setPolarity(parseFloat(value));
					});	
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "ORBIT", stormEngineC.nearNode.orbit,
					function() {
						stormEngineC.nearNode.enableOrbit();
					}, function() {
						stormEngineC.nearNode.disableOrbit();
					});
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FORCE", stormEngineC.nearNode.force, 0.0, 1.0, 0.05, function(value) {
				stormEngineC.nearNode.setForce(value);
			});
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "GET_PARTICLES", function() {
				stormEngineC.pickingCall='get({node:_selectedNode_});';  
				stormEngineC.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			});
			var str = "";
			for(var n = 0, f = stormEngineC.nearNode.nodesProc.length; n < f; n++)
				str += '<br />'+stormEngineC.nearNode.nodesProc[n].name;
			$('#DIVID_StormEditNode_edits').append(str);
		}
		if(stormEngineC.nearNode.objectType == 'forceField') {
			//lines_position();
			add_removeBtn(function() {
				stormEngineC.nearNode.deleteForceField();
			});
					
			var dir = [stormEngineC.nearNode.direction.e[0], stormEngineC.nearNode.direction.e[1], stormEngineC.nearNode.direction.e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "DIRECTION", dir, -1.0, 1.0, 0.1, function(vector) {
				var dir = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setDirection(dir);
			});
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "GET_PARTICLES", function() {
				stormEngineC.pickingCall='get({node:_selectedNode_});';  
				stormEngineC.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			});
			var str = "";
			for(var n = 0, f = stormEngineC.nearNode.nodesProc.length; n < f; n++) 
				str += '<br />'+stormEngineC.nearNode.nodesProc[n].name;
			$('#DIVID_StormEditNode_edits').append(str);
		}
		if(stormEngineC.nearNode.objectType == 'particles') {		
			add_removeBtn(function() {
				stormEngineC.nearNode.deleteParticles();
			});
			
			var pos = [stormEngineC.nearNode.getPosition().e[0], stormEngineC.nearNode.getPosition().e[1], stormEngineC.nearNode.getPosition().e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setPosition(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name);
			});
			
			lines_rotation();
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SELFSHADOWS", stormEngineC.nearNode.selfshadows,
					function() {
						stormEngineC.nearNode.setSelfshadows(true);
					}, function() {
						stormEngineC.nearNode.setSelfshadows(false);
					});		
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SHADOWS", stormEngineC.nearNode.shadows,
					function() {
						stormEngineC.nearNode.setShadows(true);
					}, function() {
						stormEngineC.nearNode.setShadows(false);
					});	
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "POINTSIZE", stormEngineC.nearNode.pointSize, 0.0, 50.0, 0.1, function(value) {
				stormEngineC.nearNode.setPointSize(value);
			});
			
			this.actHelpers.add_select(DGE('DIVID_StormEditNode_edits'), "POLARITY", [1,0], stormEngineC.nearNode.polarity,
					function(value) {
						stormEngineC.nearNode.setPolarity(parseFloat(value));
					});	
			
			var str = "<table style='width:100%'><tr>"+
						"<td style='width:18px;text-align:left'>setColor</td>"+
						"<td style='text-align:left'>"+
							"<input id='INPUTID_StormEditNode_particles_colorButton' type='file' style='display:none'/>"+
							"<div id='DIVID_StormEditNode_particles_color' title='setColor' onclick='$(this).prev().click();' onmouseover='$(this).css(\"border\", \"1px solid #EEE\");' onmouseout='$(this).css(\"border\", \"1px solid #CCC\");' style='cursor:pointer;width:16px;height:16px;border:1px solid #CCC'></div>"+
						"</td>"+
					"</tr></table>";						
			$('#DIVID_StormEditNode_edits').append(str);			
			document.getElementById('INPUTID_StormEditNode_particles_colorButton').onchange=function() {
				var filereader = new FileReader();
				filereader.onload = function(event) {
					var img = new Image();
					img.onload = function() {
						var splitName = $('#INPUTID_StormEditNode_particles_colorButton').val().split('/');
						splitName = splitName[splitName.length-1];
						
						stormEngineC.nearNode.setColor(img);
						$('#INPUTID_StormEditNode_setDisposal_width').val(img.width);
						$('#INPUTID_StormEditNode_setDisposal_height').val(img.height);
						$('#INPUTID_StormEditNode_particlesDestination_width').val(img.width);
						$('#INPUTID_StormEditNode_particlesDestination_height').val(img.height);
						img.style.width = '16px';
						img.style.height = '16px';
						$('#DIVID_StormEditNode_particles_color').html(img);
						$('#DIVID_StormEditNode_particles_color').attr('title',splitName);
					};
					img.src = event.target.result; // Set src from upload, original byte sequence
				};
				filereader.readAsDataURL(this.files[0]);
			};
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DIRECTION_TO_0", function() {
				stormEngineC.nearNode.setDirection();
			});
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DIRECTION_TO_RANDOM", function() {
				stormEngineC.nearNode.setDirection('random');
			});
			
			this.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "DISPOSAL_WidthHeight", ["width", "height"], ["128", "128"], function(arrayValues) {				
					stormEngineC.nearNode.setDisposal({width: arrayValues[0], height: arrayValues[1]});
			});
			
			this.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "DISPOSAL_RADIUS", ["radius"], ["0.5"], function(arrayValues) {				
				stormEngineC.nearNode.setDisposal({width: arrayValues[0], height: arrayValues[1]});
				stormEngineC.nearNode.setDisposal({radius: arrayValues[0]});
			});
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "LIFE_DISTANCE", stormEngineC.nearNode.lifeDistance, 0.0, 1000.0, 0.1, function(value) {
				stormEngineC.nearNode.setLifeDistance(value);
			});
			
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DESTINATION", stormEngineC.nearNode.enDestination,
					function() {
						stormEngineC.nearNode.enableDestination();
					}, function() {
						stormEngineC.nearNode.disableDestination();
					});	
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DESTINATION_FORCE", stormEngineC.nearNode.destinationForce, 0.0, 1.0, 0.05, function(value) {
				stormEngineC.nearNode.setDestinationForce(value);
			});
			
			this.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "DESTINATION_WidthHeight", ["width", "height"], ["128", "128"], function(arrayValues) {				
				stormEngineC.nearNode.setDestinationWidthHeight(arrayValues[0], arrayValues[1]);
			});
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DESTINATION_VOLUME", function() {
				stormEngineC.pickingCall='setDestinationVolume({voxelizator:_selectedNode_});';  
				stormEngineC.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			});
		}
		if(stormEngineC.nearNode.objectType == 'graph') {		
			/*add_removeBtn(function() {
				stormEngineC.nearNode.deleteParticles();
			});*/
			
			var str = 	"<div>"+(stormEngineC.nearNode.currentNodeId)+" nodes: [vertices: "+stormEngineC.nearNode.arrayNodeVertexPos.length+", indices: "+stormEngineC.nearNode.arrayNodeIndices.length+"]</div>"+
						"<div>"+(stormEngineC.nearNode.currentLinkId/2)+" links: [vertices: "+stormEngineC.nearNode.arrayLinkVertexPos.length+", indices: "+stormEngineC.nearNode.arrayLinkIndices.length+"]</div>";						
			$('#DIVID_StormEditNode_edits').append(str);

			var pos = [stormEngineC.nearNode.getPosition().e[0], stormEngineC.nearNode.getPosition().e[1], stormEngineC.nearNode.getPosition().e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setPosition(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name);
			});
			
			//lines_rotation();
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SELFSHADOWS", stormEngineC.nearNode.selfshadows,
					function() {
						stormEngineC.nearNode.setSelfshadows(true);
					}, function() {
						stormEngineC.nearNode.setSelfshadows(false);
					});		
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SHADOWS", stormEngineC.nearNode.shadows,
					function() {
						stormEngineC.nearNode.setShadows(true);
					}, function() {
						stormEngineC.nearNode.setShadows(false);
					});	
			
			/*this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "POINTSIZE", stormEngineC.nearNode.pointSize, 0.0, 50.0, 0.1, function(value) {
				stormEngineC.nearNode.setPointSize(value);
			});*/
			
			this.actHelpers.add_select(DGE('DIVID_StormEditNode_edits'), "POLARITY", [1,0], stormEngineC.nearNode.polarity,
					function(value) {
						stormEngineC.nearNode.set_polarity(parseFloat(value));
					});	
			
			var str = "<table style='width:100%'><tr>"+
						"<td style='width:18px;text-align:left'>setColor</td>"+
						"<td style='text-align:left'>"+
							"<input id='INPUTID_StormEditNode_particles_colorButton' type='file' style='display:none'/>"+
							"<div id='DIVID_StormEditNode_particles_color' title='setColor' onclick='$(this).prev().click();' onmouseover='$(this).css(\"border\", \"1px solid #EEE\");' onmouseout='$(this).css(\"border\", \"1px solid #CCC\");' style='cursor:pointer;width:16px;height:16px;border:1px solid #CCC'></div>"+
						"</td>"+
					"</tr></table>";						
			$('#DIVID_StormEditNode_edits').append(str);			
			document.getElementById('INPUTID_StormEditNode_particles_colorButton').onchange=function() {
				var filereader = new FileReader();
				filereader.onload = function(event) {
					var img = new Image();
					img.onload = function() {
						var splitName = $('#INPUTID_StormEditNode_particles_colorButton').val().split('/');
						splitName = splitName[splitName.length-1];
						
						stormEngineC.nearNode.setColor(img);
						$('#INPUTID_StormEditNode_setDisposal_width').val(img.width);
						$('#INPUTID_StormEditNode_setDisposal_height').val(img.height);
						$('#INPUTID_StormEditNode_particlesDestination_width').val(img.width);
						$('#INPUTID_StormEditNode_particlesDestination_height').val(img.height);
						img.style.width = '16px';
						img.style.height = '16px';
						$('#DIVID_StormEditNode_particles_color').html(img);
						$('#DIVID_StormEditNode_particles_color').attr('title',splitName);
					};
					img.src = event.target.result; // Set src from upload, original byte sequence
				};
				filereader.readAsDataURL(this.files[0]);
			};
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DIRECTION_TO_0", function() {
				stormEngineC.nearNode.set_dir();
			});
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DIRECTION_TO_RANDOM", function() {
				stormEngineC.nearNode.set_dir('random');
			});
			
			this.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "POSITION_WidthHeight", ["width", "height", "spacing"], ["128", "128", "1.5"], function(arrayValues) {				
				stormEngineC.nearNode.set_pos({"width": parseFloat(arrayValues[0]), "height": parseFloat(arrayValues[1]), "spacing": parseFloat(arrayValues[2])});
			});
			
			this.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "POSITION_RADIUS", ["radius"], ["1.5"], function(arrayValues) {	
				stormEngineC.nearNode.set_pos({"radius": arrayValues[0]});
			});
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "LIFE_DISTANCE", stormEngineC.nearNode.lifeDistance, 0.0, 1000.0, 0.1, function(value) {
				stormEngineC.nearNode.set_lifeDistance(value);
			});
			
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "ENABLE_DESTINATION", stormEngineC.nearNode.enDestination,
					function() {
						stormEngineC.nearNode.set_enableDestination();
					}, function() {
						stormEngineC.nearNode.set_disableDestination();
					});	
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DESTINATION_FORCE", stormEngineC.nearNode.destinationForce, 0.0, 1.0, 0.05, function(value) {
				stormEngineC.nearNode.set_destinationForce(value);
			});
			
			this.actHelpers.add_valuesAndBtn(DGE('DIVID_StormEditNode_edits'), "DESTINATION_WidthHeight", ["width", "height", "spacing"], ["128", "128", "1.5"], function(arrayValues) {				
				stormEngineC.nearNode.set_destinationWidthHeight({"width": arrayValues[0], "height": arrayValues[1], "spacing": arrayValues[2]});
			});
			
			this.actHelpers.add_btn(DGE('DIVID_StormEditNode_edits'), "DESTINATION_VOLUME", function() {
				stormEngineC.pickingCall='setDestinationVolume({voxelizator:_selectedNode_});';  
				stormEngineC.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			});
		}
		if(stormEngineC.nearNode.objectType == 'buffernodes') {
			var pos = [stormEngineC.nearNode.getPosition().e[0], stormEngineC.nearNode.getPosition().e[1], stormEngineC.nearNode.getPosition().e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setPosition(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name);
			});
			
			lines_rotation();
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "EDITMODE", stormEngineC.nearNode.selectedNodeIsInEditionMode(),
					function() {
						stormEngineC.nearNode.editSelectedNode();
					}, function() {
						stormEngineC.nearNode.uneditSelectedNode();
					});
		}	
		if(stormEngineC.nearNode.objectType == 'camera') {
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "SET_ACTIVE", (stormEngineC.nearNode.idNum == stormEngineC.defaultCamera.idNum),
					function() {
						stormEngineC.setWebGLCam(stormEngineC.nearNode);
						stormEngineC.PanelEditNode.updateNearNode();
					}, function() {
						
					});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "LOCK_ROTATION_X", stormEngineC.nearNode.lockRotX,
					function() {
						stormEngineC.nearNode.lockRotationX();
					}, function() {
						stormEngineC.nearNode.unlockRotationX();
					});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "LOCK_ROTATION_Y", stormEngineC.nearNode.lockRotY,
					function() {
						stormEngineC.nearNode.lockRotationY();
					}, function() {
						stormEngineC.nearNode.unlockRotationY();
					});
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FOV", stormEngineC.nearNode.fov, 0.1, 180.0, 0.1, function(fvalue) {
						stormEngineC.nearNode.setFov(fvalue);
					});
							
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FOCUS_DISTANCE", stormEngineC.nearNode.focusExtern, 0.55, 1000.0, 0.1, function() {
						stormEngineC.nearNode.focusExtern = $(this).val();
						stormEngineC.nearNode.setFocusIntern();
					});
						
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "VIEW_FOCUS", stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext,
					function() {
						stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext = true;
					}, function() {
						stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext = false;
					});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "DOF", stormEngineC.defaultCamera.DOFenable,
					function() {
						stormEngineC.defaultCamera.DOFenable = true;
					}, function() {
						stormEngineC.defaultCamera.DOFenable = false;
					});
			
			this.actHelpers.add_checkbox(DGE('DIVID_StormEditNode_edits'), "AUTO_FOCUS", stormEngineC.defaultCamera.autofocus,
					function() {
						stormEngineC.defaultCamera.autofocus = true;
					}, function() {
						stormEngineC.defaultCamera.autofocus = false;
					});
		}
		if(stormEngineC.nearNode.objectType == 'light') {
			if(stormEngineC.nearNode.type != "sun") {
				var pos = [stormEngineC.nearNode.getPosition().e[0], stormEngineC.nearNode.getPosition().e[1], stormEngineC.nearNode.getPosition().e[2]];
				this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "POSITION", pos, -100000.0, 100000.0, 0.1, function(vector) {
					var pos = $V3([vector[0], vector[1], vector[2]]);
					stormEngineC.nearNode.setPosition(pos);
					stormEngineC.debugValues = [];
					stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name);
				});
			}
			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "FOV", stormEngineC.nearNode.fov, 0.1, 180.0, 0.1, function(fvalue) {
				stormEngineC.nearNode.setFov(fvalue);
			});
			
			// COLOR
			var currentColor = stormEngineC.nearNode.color;
		    var hexColor = stormEngineC.utils.rgbToHex([currentColor.e[0]*255, currentColor.e[1]*255, currentColor.e[2]*255]);
		    this.actHelpers.add_colorpicker(DGE('DIVID_StormEditNode_edits'), "Color", hexColor, (function(colorValue) {
				var rgb = stormEngineC.utils.hexToRgb(colorValue);
		    	
				stormEngineC.nearNode.setLightColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
			}).bind(this));
			

		    this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "KELVINS", stormEngineC.nearNode.fov, 1000, 15000, 0.1, function(fvalue) {
				stormEngineC.nearNode.setLightColor(fvalue);
				//$('#DIVID_StormEditNode_color_paramColor').css('background','rgb('+parseInt(stormEngineC.nearNode.color.e[0]*255)+','+parseInt(stormEngineC.nearNode.color.e[1]*255)+','+parseInt(stormEngineC.nearNode.color.e[2]*255)+')');
			});
			
			this.lightDirectionX = stormEngineC.nearNode.direction.e[0];
			this.lightDirectionZ = stormEngineC.nearNode.direction.e[2];
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DIRECTION_X", this.lightDirectionX, -1.0, 1.0, 0.001, (function(fvalue) {
				stormEngineC.lights[0].setDirection($V3([fvalue, -0.5, this.lightDirectionZ])); 
			}).bind(this));			
			this.actHelpers.add_slider(DGE('DIVID_StormEditNode_edits'), "DIRECTION_Y", this.lightDirectionZ, -1.0, 1.0, 0.001, (function(fvalue) {
				stormEngineC.lights[0].setDirection($V3([this.lightDirectionX, -0.5, fvalue])); 
			}).bind(this));
		}
		
		if(stormEngineC.nearNode.objectType == 'line') {
			var pos = [stormEngineC.nearNode.origin.e[0], stormEngineC.nearNode.origin.e[1], stormEngineC.nearNode.origin.e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "ORIGIN", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setOrigin(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, pos, stormEngineC.nearNode.name+' origin');
			});
			var pos = [stormEngineC.nearNode.end.e[0], stormEngineC.nearNode.end.e[1], stormEngineC.nearNode.end.e[2]];
			this.actHelpers.add_3dslider(DGE('DIVID_StormEditNode_edits'), "END", pos, -100000.0, 100000.0, 0.1, function(vector) {
				var pos = $V3([vector[0], vector[1], vector[2]]);
				stormEngineC.nearNode.setEnd(pos);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(1, pos, stormEngineC.nearNode.name+' end');
			});
		}
		
		if(stormEngineC.nearNode.objectType == 'voxelizator') {
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
			
			$('#DIVID_StormEditNode_GImake_size').text(stormEngineC.nearNode.size); 
			$('#DIVID_StormEditNode_GImake_resolution').text(stormEngineC.nearNode.resolution); 
			$('#DIVID_StormEditNode_GImakeOUTPUT').html(''); 
			if(stormEngineC.nearNode.image3D_VoxelsColor != undefined) {
				var image = stormEngineC.nearNode.image3D_VoxelsColor;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('3D ImageElement Albedo<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_albedo').checked = true;
			}
			if(stormEngineC.nearNode.image3D_VoxelsPositionX != undefined) {
				var image = stormEngineC.nearNode.image3D_VoxelsPositionX;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionX<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
			}
			if(stormEngineC.nearNode.image3D_VoxelsPositionY != undefined) {
				var image = stormEngineC.nearNode.image3D_VoxelsPositionY;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionY<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
			}
			if(stormEngineC.nearNode.image3D_VoxelsPositionZ != undefined) {
				var image = stormEngineC.nearNode.image3D_VoxelsPositionZ;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement PositionZ<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked = true;
			}
			if(stormEngineC.nearNode.image3D_VoxelsNormal != undefined) {
				var image = stormEngineC.nearNode.image3D_VoxelsNormal;
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('<br />3D ImageElement Normal<br />'); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append(image); 
				$('#DIVID_StormEditNode_GImakeOUTPUT').append('('+image.width+'*'+image.height+')');
				document.getElementById('CHECKBOX_StormEditNode_GImake_normal').checked = true;
			}
			
			// GI functions
			$("#DIVID_StormEditNode_GImake_SLIDER_size").slider({max:150.0,
														min:1.0,
														value:stormEngineC.nearNode.size,
														step:1,
														slide:function(event,ui){
																stormEngineC.nearNode.size = ui.value;
																$('#DIVID_StormEditNode_GImake_size').text(ui.value); 
															}});
	
			var currentResSLIDER = 0; 
			for(var cr=2, maxr=stormEngineC.nearNode.resolution; cr <= maxr; cr*=2) currentResSLIDER++;
			$("#DIVID_StormEditNode_GImake_SLIDER_resolution").slider({max:9,
														min:4,
														value:currentResSLIDER,
														step:1,
														slide:function(event,ui){
																var res = 2;
																for(var n=1; n < ui.value; n++) res *= 2;
																
																stormEngineC.nearNode.resolution = res;
																$('#DIVID_StormEditNode_GImake_resolution').text(res);
															}});
			$("#DIVID_StormEditNode_GImake").on('click', function() { 
					$('#DIVID_StormEditNode_GImakeOUTPUT').text('Performing voxelization...');
					
					setTimeout(function() { 
									var arraFillmodes = [];
									if(document.getElementById('CHECKBOX_StormEditNode_GImake_albedo').checked == true) arraFillmodes.push("albedo");
									if(document.getElementById('CHECKBOX_StormEditNode_GImake_position').checked == true) arraFillmodes.push("position");
									if(document.getElementById('CHECKBOX_StormEditNode_GImake_normal').checked == true) arraFillmodes.push("normal");
									if(arraFillmodes.length > 0) {
										var voxelizator = stormEngineC.nearNode;   
										voxelizator.generateFromScene({size: stormEngineC.nearNode.size,
																		resolution: stormEngineC.nearNode.resolution,
																		fillmode: arraFillmodes,
																		ongenerate:function() {
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
																		}});      
									} else {
										alert("Check at least one fillmode");
										$('#DIVID_StormEditNode_GImakeOUTPUT').text('');
									}
								},10);
				});	
		}
	
	}
};
