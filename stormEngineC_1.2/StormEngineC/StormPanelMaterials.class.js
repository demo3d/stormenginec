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
StormEngineC_PanelMaterials = function() {
	this.selectedMaterial;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.loadPanel = function() {
	var html = '<div id="DIVID_STORMMATERIALS_LIST" style="cursor:pointer;height:200px;overflow-y:scroll"></div>'+
				'<div style="border-top:1px solid #CCC"></div>'+
				'<button type="button" onclick="stormEngineC.PanelMaterials.createMaterial();">New material</button>'+
				
				'<div id="DIVID_STORMMATERIALS_MATERIAL" ></div>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelMaterials', 'MATERIALS', html);	
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
	
	this.showListMaterials();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.showListMaterials = function() {
	var str = '<table style="text-align:center"><tr>';
	var sep = 0;
	for(var n=0, f = stormEngineC.materials.length; n < f; n++) {
		if(stormEngineC.materials[n].canvasKd != undefined) {
			var colorBg = (n == stormEngineC.selectedMaterial) ? '#444' : '#000';
			str += "<td id='TDID_StormMaterial_"+n+"' style='border:1px solid #444;background-color:"+colorBg+"' onclick='stormEngineC.PanelMaterials.showMaterial("+n+");$(\"#DIVID_STORMMATERIALS_LIST td\").css(\"background-color\",\"#000\");$(this).css(\"background-color\",\"#444\");' onmouseover='$(this).css({\"border-color\":\"#CCC\"});' onmouseout='$(this).css({\"border-color\":\"#444\"});'>"+
						"<div id='TDID_StormMaterial_thumb"+n+"' style='width:16px;height:16px;margin:auto;'></div>"+
					"</td>";
			
			if(sep == 3) {
				str += '</tr><tr>';sep = 0;
			} else {
				sep++;
			}
		}
	}
	str += '</tr></table>';
	$('#DIVID_STORMMATERIALS_LIST').html(str);
	
	for(var n=0, f = stormEngineC.materials.length; n < f; n++) {
		if(stormEngineC.materials[n].canvasKd != undefined) {
			if(stormEngineC.materials[n].materialType == 'texture') {
				var canvasBOtexture = stormEngineC.utils.getImageFromCanvas(stormEngineC.materials[n].canvasKd);
				canvasBOtexture.style.width = '16px';
				canvasBOtexture.style.height = '16px';
				$('#TDID_StormMaterial_thumb'+n).append(canvasBOtexture);
			} else if(stormEngineC.materials[n].materialType == 'color') {
				$('#TDID_StormMaterial_thumb'+n).html('');
				$('#TDID_StormMaterial_thumb'+n).css('background-color','rgb('+stormEngineC.materials[n].arrayTEX_Kd[0]+','+stormEngineC.materials[n].arrayTEX_Kd[1]+','+stormEngineC.materials[n].arrayTEX_Kd[2]+')');
			}
			$('#TDID_StormMaterial_'+n).append(stormEngineC.materials[n].name);
		}
	}
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.createMaterial = function() {
	stormEngineC.createMaterial();
	
	this.showListMaterials(); 
};

/**
* @type Void
* @private
* @param {Int} idMaterial
*/
StormEngineC_PanelMaterials.prototype.showMaterial = function(idMaterial) {
	var material = stormEngineC.materials[idMaterial];
	this.selectedMaterial = idMaterial;
	
	
	var str = 	'<div style="border-top:1px solid #CCC"></div>'+
				'<span style="font-weight:bold">'+material.name+'</span>'+
				'<table>'+
					'<tr>'+
						'<td>'+
							'Albedo:'+
						'</td>'+
						'<td>'+
							'<table>'+
								'<tr>'+
									'<td style="text-align:left;vertical-align:top">'+
										'Solid'+
									'</td>'+
									'<td style="text-align:left;vertical-align:top">'+
										"<div id='ID_STORMMATERIALS_COLOR_KD' onmouseover='$(this).css(\"border\", \"1px solid #EEE\");' onmouseout='$(this).css(\"border\", \"1px solid #CCC\");' style='cursor:pointer;width:16px;height:16px;border:1px solid #CCC'></div>"+
										'<input id="INPUTID_STORMMATERIALS_COLOR_KD" type="text" style="display:none"/>'+
									'</td>'+
									'<td style="text-align:left;vertical-align:top">'+
										'Map'+
									'</td>'+
									'<td style="text-align:left;vertical-align:top">'+
										"<input id='INPUT_STORMMATERIALS_KD' type='file' style='display:none'/>"+
										"<div id='ID_STORMMATERIALS_MATERIAL_KD' title='"+material.textureKdName+"' onclick='$(this).prev().click();' onmouseover='$(this).css(\"border\", \"1px solid #EEE\");' onmouseout='$(this).css(\"border\", \"1px solid #CCC\");' style='cursor:pointer;width:16px;height:16px;border:1px solid #CCC'></div>"+
									'</td>'+
								'</tr>'+
							'</table>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+
							'Bump:'+
						'</td>'+
						'<td>'+
							'<table>'+
								'<tr>'+
									'<td style="text-align:left;vertical-align:top">'+
										'Map'+
									'</td>'+
									'<td style="text-align:left;vertical-align:top">'+
										"<input id='INPUT_STORMMATERIALS_BUMP' type='file' style='display:none'/>"+
										"<div id='ID_STORMMATERIALS_MATERIAL_BUMP' title='"+material.textureBumpName+"' onclick='$(this).prev().click();' onmouseover='$(this).css(\"border\", \"1px solid #EEE\");' onmouseout='$(this).css(\"border\", \"1px solid #CCC\");' style='cursor:pointer;width:16px;height:16px;border:1px solid #CCC'></div>"+
									'</td>'+
								'</tr>'+
							'</table>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+
							'Roughness:'+
						'</td>'+
						'<td>'+
							'<input id="INPUT_STORMMATERIALS_NS" type="text" /> '+
						'</td>'+
					'</tr>'+
				'</table>'+
				'<button type="button" onclick="stormEngineC.PanelMaterials.applyMaterial();">Apply material to selected object</button><br />'+
				'<button type="button" onclick="stormEngineC.PanelMaterials.deleteMaterial();">Delete material</button>'+
				'';
	$('#DIVID_STORMMATERIALS_MATERIAL').html(str);
	
	// COLOR SOLID
	if(material.materialType == 'texture') {
		$('#ID_STORMMATERIALS_COLOR_KD').css('background','rgb(0,0,0)');
	} else {
		$('#ID_STORMMATERIALS_COLOR_KD').css('background','rgb('+material.arrayTEX_Kd[0]+','+material.arrayTEX_Kd[1]+','+material.arrayTEX_Kd[2]+')');
	}
	$('#INPUTID_STORMMATERIALS_COLOR_KD').ColorPicker({'onChange':function(hsb, hex, rgb) {
															stormEngineC.materials[idMaterial].attachColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
															$('#ID_STORMMATERIALS_COLOR_KD').css('background-color','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
															$('#ID_STORMMATERIALS_MATERIAL_KD').html('');
															
															$('#TDID_StormMaterial_thumb'+idMaterial).html('');
															$('#TDID_StormMaterial_thumb'+idMaterial).css('background-color','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
														}});
	$("#ID_STORMMATERIALS_COLOR_KD").bind('click', function() {
											$('#INPUTID_STORMMATERIALS_COLOR_KD').css('display','block');
											$('#INPUTID_STORMMATERIALS_COLOR_KD').click();
											$('#INPUTID_STORMMATERIALS_COLOR_KD').css('display','none');
											$('.colorpicker').css('zIndex',currentStormZIndex);
										});
	// COLOR TEXTURE
	if(material.materialType == 'texture') {
		var canvasBOtexture = stormEngineC.utils.getImageFromCanvas(material.canvasKd);
		canvasBOtexture.style.width = '16px';
		canvasBOtexture.style.height = '16px';
		$('#ID_STORMMATERIALS_MATERIAL_KD').append(canvasBOtexture);
	} else {
		$('#ID_STORMMATERIALS_MATERIAL_KD').html('');
		$('#ID_STORMMATERIALS_MATERIAL_KD').css('background','rgb(0,0,0)');
	}
	
	
	document.getElementById('INPUT_STORMMATERIALS_KD').onchange=function() {
		var filereader = new FileReader();
		filereader.onload = function(event) {
			var img = new Image();
			img.onload = function() {
			
				var material = stormEngineC.materials[stormEngineC.PanelMaterials.selectedMaterial];
				
				var splitName = $('#INPUT_STORMMATERIALS_KD').val().split('/');
				material.textureKdName = splitName[splitName.length-1];
				
				stormEngineC.addGLTexture(img, material, 'Kd');
				stormEngineC.PanelMaterials.showListMaterials();
				stormEngineC.PanelMaterials.showMaterial(stormEngineC.PanelMaterials.selectedMaterial);
				
			};
			img.src = event.target.result; // Set src from upload, original byte sequence
		};
		filereader.readAsDataURL(this.files[0]);
	};
	
	// BUMP TEXTURE
	var canvasBOtextureBump = stormEngineC.utils.getImageFromCanvas(material.canvasBump);
	canvasBOtextureBump.style.width = '16px';
	canvasBOtextureBump.style.height = '16px';
	$('#ID_STORMMATERIALS_MATERIAL_BUMP').append(canvasBOtextureBump);
	
	document.getElementById('INPUT_STORMMATERIALS_BUMP').onchange=function() {
		var filereader = new FileReader();
		filereader.onload = function(event) {
			var img = new Image();
			img.onload = function() {
			
				var material = stormEngineC.materials[stormEngineC.PanelMaterials.selectedMaterial];
				
				var splitName = $('#INPUT_STORMMATERIALS_BUMP').val().split('/');
				material.textureBumpName = splitName[splitName.length-1];
				
				stormEngineC.addGLTexture(img, material, 'Bump');
				stormEngineC.PanelMaterials.showListMaterials();
				stormEngineC.PanelMaterials.showMaterial(stormEngineC.PanelMaterials.selectedMaterial);
						
			};
			img.src = event.target.result; // Set src from upload, original byte sequence
		};
		filereader.readAsDataURL(this.files[0]);
	};
	
	
	
	$('#INPUT_STORMMATERIALS_NS').val(material.Ns*112);
	$('#INPUT_STORMMATERIALS_NS').bind('keyup', function() {
												var material = stormEngineC.materials[stormEngineC.PanelMaterials.selectedMaterial];
												
												material.Ns = $('#INPUT_STORMMATERIALS_NS').val()/112.0;
											});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.applyMaterial = function() {
	if(stormEngineC.nearNode != undefined) {
		for(var nb = 0, fb = stormEngineC.nearNode.materialUnits.length; nb < fb; nb++) {
			stormEngineC.nearNode.materialUnits[nb] = stormEngineC.materials[stormEngineC.PanelMaterials.selectedMaterial];
		}
	} else {
		alert('You must select an object');
	}
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.deleteMaterial = function() {
	var tmArray = [];
	
	for(var n = 0, f = stormEngineC.materials.length; n < f; n++) {
		if(n != stormEngineC.PanelMaterials.selectedMaterial) {tmArray.push(stormEngineC.materials[n])}
	}
	stormEngineC.materials = tmArray;
	this.showListMaterials();
	$('#DIVID_STORMMATERIALS_MATERIAL').html('');
};

