/**
* @class
* @constructor
*/
StormEngineC_PanelEditNode = function() {

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
		
		
		
		
		lines_rotation = function() {
			var strMoves = 	'<div>'+
								'ROTATE: '+
								"<input type='text' id='StormEN_tlVal' value='90.0' style='width:30px' />"+
								' X<input id="StormEN_spinnerRotX" name="value" value="0.0" style="color:#FFF;width:1px">'+
								' Y<input id="StormEN_spinnerRotY" name="value" value="0.0" style="color:#FFF;width:1px">'+
								' Z<input id="StormEN_spinnerRotZ" name="value" value="0.0" style="color:#FFF;width:1px">'+
							'</div>';
			$('#DIVID_StormEditNode_edits').append(strMoves);
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
		};
		add_removeBtn = function(clickCallback) {
			var str = '<button id="BUTTONID_remove">REMOVE</button><br />';
			$('#DIVID_StormEditNode_edits').append(str);
			
			document.getElementById("BUTTONID_remove").addEventListener("click", function() {
				clickCallback();
				
				stormEngineC.PanelListObjects.showListObjects();
				stormEngineC.nearNode = undefined;
				stormEngineC.PanelEditNode.updateNearNode();
			});
		};
		add_checkbox = function(name, variable, checkCallback, uncheckCallback) {
			var str = 	name+': <input type="checkbox" id="INPUTID_StormEditNode_'+name+'" /><br />';
			$('#DIVID_StormEditNode_edits').append(str);
			
			if(variable === true || variable === 1) {
				document.getElementById("INPUTID_StormEditNode_"+name).checked = true;
			} else {
				document.getElementById("INPUTID_StormEditNode_"+name).checked = false;
			}
			
			$("#INPUTID_StormEditNode_"+name).on('click', function() {
				if(document.getElementById("INPUTID_StormEditNode_"+name).checked == false) {
					uncheckCallback();
				} else {
					checkCallback();
				}
			});
		};		
		add_radio = function(name, text1, text2, variable, check1Callback, check2Callback) {
			var str = 	name+': '+
						text1+' <input type="radio" name="INPUTNAME_StormEditNode_'+name+'"  id="INPUTID_StormEditNode_'+name+'_'+text1+'" /> '+
						text2+' <input type="radio" name="INPUTNAME_StormEditNode_'+name+'"  id="INPUTID_StormEditNode_'+name+'_'+text2+'" /><br />';
			$('#DIVID_StormEditNode_edits').append(str);
			
			if(variable === true || variable === 1) {
				document.getElementById("INPUTID_StormEditNode_"+name+"_"+text1).checked = true;
			} else {
				document.getElementById("INPUTID_StormEditNode_"+name+"_"+text2).checked = true;
			}
			
			$("#INPUTID_StormEditNode_"+name+"_"+text1).on('click', function() {
				check1Callback();
			});
			$("#INPUTID_StormEditNode_"+name+"_"+text2).on('click', function() {
				check2Callback();
			});
		};
		add_spinner = function(name, variable, steps, onSpinCallback) {
			var str = name+' <input id="INPUTID_StormEditNode_'+name+'" value="'+variable+'" style="color:#FFF;width:40px"><br />';
			$('#DIVID_StormEditNode_edits').append(str);
			$("#INPUTID_StormEditNode_"+name).spinner({numberFormat:"n", step: steps,
															spin: function(event, ui) {
																onSpinCallback(ui.value);
															}
														});
		};
		add_3dspinner = function(name, vectorVariable, steps, onSpinCallback) {
			var str = '<div>'+
						name+': '+
						'<input id="StormEN_spinner'+name+'X" name="value" value="'+vectorVariable.e[0]+'" style="background:red;color:#FFF;width:40px">'+
						'<input id="StormEN_spinner'+name+'Y" name="value" value="'+vectorVariable.e[1]+'" style="background:green;color:#FFF;width:40px">'+
						'<input id="StormEN_spinner'+name+'Z" name="value" value="'+vectorVariable.e[2]+'" style="background:blue;color:#FFF;width:40px">'+
					'</div>';
					$('#DIVID_StormEditNode_edits').append(str);
					$("#StormEN_spinner"+name+"X").spinner({numberFormat:"n", step: steps,
										spin: function(event, ui) {
											var vector = $V3([ui.value, $("#StormEN_spinner"+name+"Y").val(), $("#StormEN_spinner"+name+"Z").val()]);
											onSpinCallback(vector);
										},
										change: function(event, ui) {
											var vector = $V3([$(this).val(), $("#StormEN_spinner"+name+"Y").val(), $("#StormEN_spinner"+name+"Z").val()]);
											onSpinCallback(vector);
										}
										});
					$("#StormEN_spinner"+name+"Y").spinner({numberFormat:"n", step: steps,
										spin: function(event, ui) {
											var vector = $V3([$("#StormEN_spinner"+name+"X").val(), ui.value, $("#StormEN_spinner"+name+"Z").val()]);
											onSpinCallback(vector);
										},
										change: function(event, ui) {
											var vector = $V3([$("#StormEN_spinner"+name+"X").val(), $(this).val(), $("#StormEN_spinner"+name+"Z").val()]);
											onSpinCallback(vector);
										}
										});
					$("#StormEN_spinner"+name+"Z").spinner({numberFormat:"n", step: steps,
										spin: function(event, ui) {
											var vector = $V3([$("#StormEN_spinner"+name+"X").val(), $("#StormEN_spinner"+name+"Y").val(), ui.value]);
											onSpinCallback(vector);
										},
										change: function(event, ui) {
											var vector = $V3([$("#StormEN_spinner"+name+"X").val(), $("#StormEN_spinner"+name+"Y").val(), $(this).val()]);
											onSpinCallback(vector);
										}
										}); 
		};
		add_slider = function(name, min, max, fvalue, steps, onSlideCallback) {
			var str = 	name+': <span id="DIVID_StormEditNode_'+name+'">'+fvalue+'</span>'+
						'<div id="DIVID_StormEditNode_'+name+'_SLIDER"></div>';
			$("#DIVID_StormEditNode_edits").append(str);
			$("#DIVID_StormEditNode_"+name+"_SLIDER").slider({	"max": max,
																"min": min,
																"value": fvalue,
																"step": steps,
																"slide":function(event,ui) {
																		onSlideCallback(ui.value);
																		$('#DIVID_StormEditNode_'+name).text(ui.value);
																	}});
		};
		add_input = function(name, min, fvalue, onKeyupCallback) {
			var str = 	name+': <input id="INPUTID_StormEditNode_'+name+'" type="text" value="'+fvalue+'" style="width:40px"/>m<br />';
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#INPUTID_StormEditNode_"+name).on('keyup', function() {
												if($(this).val() > min) {
													onKeyupCallback();
												} else {
													$(this).val(min);
													onKeyupCallback();
												}
											});
		};
		add_valuesAndBtn = function(name, arrayTexts, arrayDefaultValues, onClickCallback) {
			var str = "<button id='BUTTONID_StormEditNode_"+name+"'>"+name+"</button>";
			for(var n=0; n < arrayTexts.length; n++) {
				str += arrayTexts[n]+' <input type="text" id="INPUTID_StormEditNode_'+name+'_'+arrayTexts[n]+'" value="'+arrayDefaultValues[n]+'" style="width:40px"/>';			
			}
			str += "<br />";
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#BUTTONID_StormEditNode_"+name).on('click', function() {
				var settedValues = [];
				for(var n=0; n < arrayTexts.length; n++) {
					settedValues.push($('#INPUTID_StormEditNode_'+name+'_'+arrayTexts[n]).val());
				}
				onClickCallback(settedValues);
			});
		};
		add_btn = function(name, onClickCallback) {
			var str = "<button id='BUTTONID_StormEditNode_"+name+"'>"+name+"</button><br />";
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#BUTTONID_StormEditNode_"+name).on('click', function() {
				onClickCallback();
			});
		};
		
		
		
		
		if(stormEngineC.nearNode.objectType == 'node') {								
			add_removeBtn(function() {
				stormEngineC.nearNode.remove();
			});
			
			add_checkbox("VISIBILITY", stormEngineC.nearNode.visibleOnContext,
					function() {
						stormEngineC.nearNode.visible(true);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					}, function() {
						stormEngineC.nearNode.visible(false);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					});	
			
			add_3dspinner("POSITION", stormEngineC.nearNode.getPosition(), 0.1, function(vector) {
				stormEngineC.nearNode.setPosition(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name);
			});
			
			lines_rotation();
			
			add_checkbox("EDITMODE", stormEngineC.nearNode.selectedNodeIsInEditionMode(),
					function() {
						stormEngineC.nearNode.editSelectedNode();
					}, function() {
						stormEngineC.nearNode.uneditSelectedNode();
					});
			
			add_checkbox("DRAGGABLE", stormEngineC.nearNode.isDraggable,
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
			
			add_checkbox("VISIBILITY", stormEngineC.nearNode.visibleOnContext,
					function() {
						stormEngineC.nearNode.visible(true);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					}, function() {
						stormEngineC.nearNode.visible(false);
						stormEngineC.PanelListObjects.showListObjects();
						stormEngineC.PanelEditNode.updateNearNode();
					});
			
			add_3dspinner("POSITION", stormEngineC.nearNode.getPosition(), 0.1, function(vector) {
				stormEngineC.nearNode.setPosition(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name);
			});
			
			add_checkbox("DRAGGABLE", stormEngineC.nearNode.isDraggable,
					function() {
						stormEngineC.nearNode.draggable(true);
					}, function() {
						stormEngineC.nearNode.draggable(false);
					});	
			
			add_radio("POLARITY", "positive", "negative", stormEngineC.nearNode.polarity,
					function() {
						stormEngineC.nearNode.setPolarity(1);
					}, function() {
						stormEngineC.nearNode.setPolarity(0);
					});	
			
			add_checkbox("ORBIT", stormEngineC.nearNode.orbit,
					function() {
						stormEngineC.nearNode.enableOrbit();
					}, function() {
						stormEngineC.nearNode.disableOrbit();
					});
			
			add_spinner("FORCE", stormEngineC.nearNode.force, 0.05, function(value) {
				stormEngineC.nearNode.setForce(value);
			});
			
			add_btn("GET_PARTICLES", function() {
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
						
			add_3dspinner("DIRECTION", stormEngineC.nearNode.direction, 0.1, function(vector) {
				stormEngineC.nearNode.setDirection(vector);
			});
			
			add_btn("GET_PARTICLES", function() {
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
			
			add_3dspinner("POSITION", stormEngineC.nearNode.getPosition(), 0.1, function(vector) {
				stormEngineC.nearNode.setPosition(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name);
			});
			
			lines_rotation();
			
			add_checkbox("SELFSHADOWS", stormEngineC.nearNode.selfshadows,
					function() {
						stormEngineC.nearNode.setSelfshadows(true);
					}, function() {
						stormEngineC.nearNode.setSelfshadows(false);
					});		
			
			add_checkbox("SHADOWS", stormEngineC.nearNode.shadows,
					function() {
						stormEngineC.nearNode.setShadows(true);
					}, function() {
						stormEngineC.nearNode.setShadows(false);
					});	
			
			add_spinner("POINTSIZE", stormEngineC.nearNode.pointSize, 0.1, function(value) {
				stormEngineC.nearNode.setPointSize(value);
			});
			
			add_radio("POLARITY", "positive", "negative", stormEngineC.nearNode.polarity,
					function() {
						stormEngineC.nearNode.setPolarity(1);
					}, function() {
						stormEngineC.nearNode.setPolarity(0);
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
			
			add_btn("DIRECTION_TO_0", function() {
				stormEngineC.nearNode.setDirection();
			});
			
			add_btn("DIRECTION_TO_RANDOM", function() {
				stormEngineC.nearNode.setDirection('random');
			});
			
			add_valuesAndBtn("DISPOSAL_WidthHeight", ["width", "height"], ["128", "128"], function(arrayValues) {				
					stormEngineC.nearNode.setDisposal({width: arrayValues[0], height: arrayValues[1]});
			});
			
			add_valuesAndBtn("DISPOSAL_RADIUS", ["radius"], ["0.5"], function(arrayValues) {				
				stormEngineC.nearNode.setDisposal({width: arrayValues[0], height: arrayValues[1]});
				stormEngineC.nearNode.setDisposal({radius: arrayValues[0]});
			});
			
			add_spinner("LIFE_DISTANCE", stormEngineC.nearNode.lifeDistance, 0.1, function(value) {
				stormEngineC.nearNode.setLifeDistance(value);
			});
			
			
			add_checkbox("DESTINATION", stormEngineC.nearNode.enDestination,
					function() {
						stormEngineC.nearNode.enableDestination();
					}, function() {
						stormEngineC.nearNode.disableDestination();
					});	
			
			add_spinner("DESTINATION_FORCE", stormEngineC.nearNode.destinationForce, 0.1, function(value) {
				stormEngineC.nearNode.setDestinationForce(value);
			});
			
			add_valuesAndBtn("DESTINATION_WidthHeight", ["width", "height"], ["128", "128"], function(arrayValues) {				
				stormEngineC.nearNode.setDestinationWidthHeight(arrayValues[0], arrayValues[1]);
			});
			
			add_btn("DESTINATION_VOLUME", function() {
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

			add_3dspinner("POSITION", stormEngineC.nearNode.getPosition(), 0.1, function(vector) {
				stormEngineC.nearNode.setPosition(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name);
			});
			
			//lines_rotation();
			
			add_checkbox("SELFSHADOWS", stormEngineC.nearNode.selfshadows,
					function() {
						stormEngineC.nearNode.setSelfshadows(true);
					}, function() {
						stormEngineC.nearNode.setSelfshadows(false);
					});		
			
			add_checkbox("SHADOWS", stormEngineC.nearNode.shadows,
					function() {
						stormEngineC.nearNode.setShadows(true);
					}, function() {
						stormEngineC.nearNode.setShadows(false);
					});	
			
			/*add_spinner("POINTSIZE", stormEngineC.nearNode.pointSize, 0.1, function(value) {
				stormEngineC.nearNode.setPointSize(value);
			});*/
			
			add_radio("POLARITY", "positive", "negative", stormEngineC.nearNode.polarity,
					function() {
						stormEngineC.nearNode.set_polarity(1);
					}, function() {
						stormEngineC.nearNode.set_polarity(0);
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
			
			add_btn("DIRECTION_TO_0", function() {
				stormEngineC.nearNode.set_dir();
			});
			
			add_btn("DIRECTION_TO_RANDOM", function() {
				stormEngineC.nearNode.set_dir('random');
			});
			
			add_valuesAndBtn("POSITION_WidthHeight", ["width", "height", "spacing"], ["128", "128", "1.5"], function(arrayValues) {				
				stormEngineC.nearNode.set_pos({"width": parseFloat(arrayValues[0]), "height": parseFloat(arrayValues[1]), "spacing": parseFloat(arrayValues[2])});
			});
			
			add_valuesAndBtn("POSITION_RADIUS", ["radius"], ["1.5"], function(arrayValues) {	
				stormEngineC.nearNode.set_pos({"radius": arrayValues[0]});
			});
			
			add_spinner("LIFE_DISTANCE", stormEngineC.nearNode.lifeDistance, 0.1, function(value) {
				stormEngineC.nearNode.set_lifeDistance(value);
			});
			
			
			add_checkbox("DESTINATION", stormEngineC.nearNode.enDestination,
					function() {
						stormEngineC.nearNode.set_enableDestination();
					}, function() {
						stormEngineC.nearNode.set_disableDestination();
					});	
			
			add_spinner("DESTINATION_FORCE", stormEngineC.nearNode.destinationForce, 0.1, function(value) {
				stormEngineC.nearNode.set_destinationForce(value);
			});
			
			add_valuesAndBtn("DESTINATION_WidthHeight", ["width", "height", "spacing"], ["128", "128", "1.5"], function(arrayValues) {				
				stormEngineC.nearNode.set_destinationWidthHeight({"width": arrayValues[0], "height": arrayValues[1], "spacing": arrayValues[2]});
			});
			
			add_btn("DESTINATION_VOLUME", function() {
				stormEngineC.pickingCall='setDestinationVolume({voxelizator:_selectedNode_});';  
				stormEngineC.PanelListObjects.show();
				$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
				document.body.style.cursor='pointer';
			});
		}
		if(stormEngineC.nearNode.objectType == 'buffernodes') {
			add_3dspinner("POSITION", stormEngineC.nearNode.getPosition(), 0.1, function(vector) {
				stormEngineC.nearNode.setPosition(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name);
			});
			lines_rotation();
			add_checkbox("EDITMODE", stormEngineC.nearNode.selectedNodeIsInEditionMode(),
					function() {
						stormEngineC.nearNode.editSelectedNode();
					}, function() {
						stormEngineC.nearNode.uneditSelectedNode();
					});
		}	
		if(stormEngineC.nearNode.objectType == 'camera') {
			add_checkbox("SET_ACTIVE", (stormEngineC.nearNode.idNum == stormEngineC.defaultCamera.idNum),
					function() {
						stormEngineC.setWebGLCam(stormEngineC.nearNode);
						stormEngineC.PanelEditNode.updateNearNode();
					}, function() {
						
					});
			
			add_checkbox("LOCK_ROTATION_X", stormEngineC.nearNode.lockRotX,
					function() {
						stormEngineC.nearNode.lockRotationX();
					}, function() {
						stormEngineC.nearNode.unlockRotationX();
					});
			
			add_checkbox("LOCK_ROTATION_Y", stormEngineC.nearNode.lockRotY,
					function() {
						stormEngineC.nearNode.lockRotationY();
					}, function() {
						stormEngineC.nearNode.unlockRotationY();
					});
			
			add_slider("FOV", 0.1, 180.0, stormEngineC.nearNode.fov, 0.1, function(fvalue) {
						stormEngineC.nearNode.setFov(fvalue);
					});
							
			add_input("FOCUS_DISTANCE", 0.55, stormEngineC.nearNode.focusExtern, function() {
						stormEngineC.nearNode.focusExtern = $(this).val();
						stormEngineC.nearNode.setFocusIntern();
					});
						
			add_checkbox("VIEW_FOCUS", stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext,
					function() {
						stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext = true;
					}, function() {
						stormEngineC.nearNode.nodePivot.nodeFocus.visibleOnContext = false;
					});
			
			add_checkbox("DOF", stormEngineC.defaultCamera.DOFenable,
					function() {
						stormEngineC.defaultCamera.DOFenable = true;
					}, function() {
						stormEngineC.defaultCamera.DOFenable = false;
					});
			
			add_checkbox("AUTO_FOCUS", stormEngineC.defaultCamera.autofocus,
					function() {
						stormEngineC.defaultCamera.autofocus = true;
					}, function() {
						stormEngineC.defaultCamera.autofocus = false;
					});
		}
		if(stormEngineC.nearNode.objectType == 'light') {
			if(stormEngineC.nearNode.type != "sun") {
				add_3dspinner("POSITION", stormEngineC.nearNode.getPosition(), 0.1, function(vector) {
					stormEngineC.nearNode.setPosition(vector);
					stormEngineC.debugValues = [];
					stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name);
				});
			}
			
			add_slider("FOV", 0.1, 180.0, stormEngineC.nearNode.fov, 0.1, function(fvalue) {
				stormEngineC.nearNode.setFov(fvalue);
			});
			
			// COLOR
			var str = 'Color: <div id="DIVID_StormEditNode_color_paramColor" style="width:16px;height:16px;border:1px solid #CCC;cursor:pointer;background:rgb('+parseInt(stormEngineC.nearNode.color.e[0]*255)+','+parseInt(stormEngineC.nearNode.color.e[1]*255)+','+parseInt(stormEngineC.nearNode.color.e[2]*255)+');" ></div>'+
						'<input id="INPUTID_StormEditNode_color" type="text" style="display:none"/>'; 
			$('#DIVID_StormEditNode_edits').append(str);
			
			$("#DIVID_StormEditNode_color_paramColor").on('click', function() {
				$('#INPUTID_StormEditNode_color').css('display','block');
				$('#INPUTID_StormEditNode_color').click();
				$('#INPUTID_StormEditNode_color').css('display','none');
				$('.colorpicker').css('zIndex',currentStormZIndex);
			});
			
			$('#INPUTID_StormEditNode_color').ColorPicker({'onChange':function(hsb, hex, rgb) {
																			stormEngineC.nearNode.setLightColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
																			$('#DIVID_StormEditNode_color_paramColor').css('background','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
																		}
															});
			$('#INPUTID_StormEditNode_color').ColorPickerSetColor({'r':stormEngineC.nearNode.color.e[0], 'g': stormEngineC.nearNode.color.e[1], 'b':stormEngineC.nearNode.color.e[2]});//normalizado 0.0-1.0
			

			add_slider("KELVINS", 1000, 15000, stormEngineC.nearNode.fov, 0.1, function(fvalue) {
				stormEngineC.nearNode.setLightColor(fvalue);
				$('#DIVID_StormEditNode_color_paramColor').css('background','rgb('+parseInt(stormEngineC.nearNode.color.e[0]*255)+','+parseInt(stormEngineC.nearNode.color.e[1]*255)+','+parseInt(stormEngineC.nearNode.color.e[2]*255)+')');
			});
			
			this.lightDirectionX = stormEngineC.nearNode.direction.e[0];
			this.lightDirectionZ = stormEngineC.nearNode.direction.e[2];
			add_slider("DIRECTION_X", -1.0, 1.0, this.lightDirectionX, 0.001, (function(fvalue) {
				stormEngineC.lights[0].setDirection($V3([fvalue, -0.5, this.lightDirectionZ])); 
			}).bind(this));			
			add_slider("DIRECTION_Y", -1.0, 1.0, this.lightDirectionZ, 0.001, (function(fvalue) {
				stormEngineC.lights[0].setDirection($V3([this.lightDirectionX, -0.5, fvalue])); 
			}).bind(this));
		}
		
		if(stormEngineC.nearNode.objectType == 'line') {
			add_3dspinner("ORIGIN", stormEngineC.nearNode.origin, 0.1, function(vector) {
				stormEngineC.nearNode.setOrigin(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(0, vector, stormEngineC.nearNode.name+' origin');
			});
			add_3dspinner("END", stormEngineC.nearNode.end, 0.1, function(vector) {
				stormEngineC.nearNode.setEnd(vector);
				stormEngineC.debugValues = [];
				stormEngineC.setDebugValue(1, vector, stormEngineC.nearNode.name+' end');
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
