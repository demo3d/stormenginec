/**
* @class
* @constructor
*/
StormEngineC_PanelMaterials = function(sec) {
	this._sec = sec;
	
	this.selectedMaterial;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.loadPanel = function() {
	var html = '<div id="DIVID_STORMMATERIALS_LIST" style="cursor:pointer;height:200px;overflow-y:scroll"></div>'+
				'<div style="border-top:1px solid #CCC"></div>'+
				'<button type="button" id="BUTTONID_newmaterial">New material</button>'+
				
				'<div id="DIVID_STORMMATERIALS_MATERIAL" ></div>';
	
	var _this = this;
	this._sec.makePanel(_this, 'DIVID_StormPanelMaterials', 'MATERIALS', html);
	
	document.getElementById("BUTTONID_newmaterial").addEventListener("click", (function() {
		this._sec.PanelMaterials.createMaterial();
	}).bind(this));
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
	var str;
	var sep = 3, row = 0;
	for(var n=0, f = this._sec.materials.length; n < f; n++) {
		if(this._sec.materials[n].textureObjectKd != undefined) {
			if(sep == 3) {
				sep = 0;
				$('#DIVID_STORMMATERIALS_LIST').html('<div id="TDID_StormMaterial_row'+row+'" style="display:table;">');
				row++;
			} else sep++;
			
			var colorBg = (n == this._sec.selectedMaterial) ? '#444' : '#000';
			str = "<div id='TDID_StormMaterial_"+n+"' class='boxMat' data-matnum='"+n+"' style='display:table-cell;width:25%;max-width:25%;min-width:25%;border:1px solid #444;background-color:"+colorBg+"'>"+
						"<div id='TDID_StormMaterial_thumb"+n+"' style='width:16px;height:16px;margin:auto;'></div>"+
					"</div>";
			$('#DIVID_STORMMATERIALS_LIST').append(str);
			
			var _n = n;
			$('#TDID_StormMaterial_'+n).on('click', (function() {
					this._sec.PanelMaterials.showMaterial($(this).attr('data-matnum'));
					$("#DIVID_STORMMATERIALS_LIST .boxMat").css("background-color","#000");
					$(this).css("background-color","#444");
				}).bind(this));
			$('#TDID_StormMaterial_'+n).on('mouseover', function() {
					$(this).css({"border-color":"#CCC"});
				});
			$('#TDID_StormMaterial_'+n).on('mouseout', function() {
					$(this).css({"border-color":"#444"});
				});
		}
	}
	
	for(var n=0, f = this._sec.materials.length; n < f; n++) {
		if(this._sec.materials[n].textureObjectKd != undefined) {
			if(!this._sec.materials[n].solid) {
				var canvasBOtexture = this._sec.utils.getCanvasFromUint8Array(this._sec.materials[n].textureObjectKd.items[0].inData, this._sec.materials[n].textureObjectKd.items[0].W, this._sec.materials[n].textureObjectKd.items[0].H);
				canvasBOtexture.style.width = '16px';
				canvasBOtexture.style.height = '16px';
				$('#TDID_StormMaterial_thumb'+n).append(canvasBOtexture);
			} else {
				$('#TDID_StormMaterial_thumb'+n).html('');
				$('#TDID_StormMaterial_thumb'+n).css('background-color','rgb('+this._sec.materials[n].textureObjectKd.items[0].inData[0]+','+this._sec.materials[n].textureObjectKd.items[0].inData[1]+','+this._sec.materials[n].textureObjectKd.items[0].inData[2]+')');
			}
			$('#TDID_StormMaterial_'+n).append(this._sec.materials[n].name);
		}
	}
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.createMaterial = function() {
	this._sec.createMaterial();
	
	this.showListMaterials(); 
};

/**
* @type Void
* @private
* @param {Int} idMaterial
*/
StormEngineC_PanelMaterials.prototype.showMaterial = function(idMaterial) {
	var material = this._sec.materials[idMaterial];
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
				'<button type="button" id="BTN_STORMMATERIALS_APPLY">Apply material to selected object</button><br />'+
				'<button type="button" id="BUTTONID_deletematerial">Delete material</button>'+
				'';
	$('#DIVID_STORMMATERIALS_MATERIAL').html(str);
	
	document.getElementById("BUTTONID_deletematerial").addEventListener("click", (function() {
		this._sec.PanelMaterials.deleteMaterial();
	}).bind(this));
	
	// COLOR SOLID
	if(!material.solid) {
		$('#ID_STORMMATERIALS_COLOR_KD').css('background','rgb(0,0,0)');
	} else {
		$('#ID_STORMMATERIALS_COLOR_KD').css('background','rgb('+material.textureObjectKd.items[0].inData[0]+','+material.textureObjectKd.items[0].inData[1]+','+material.textureObjectKd.items[0].inData[2]+')');
	}
	$('#INPUTID_STORMMATERIALS_COLOR_KD').ColorPicker({'onChange':(function(hsb, hex, rgb) {
															this._sec.materials[idMaterial].write($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
															$('#ID_STORMMATERIALS_COLOR_KD').css('background-color','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
															$('#ID_STORMMATERIALS_MATERIAL_KD').html('');
															
															$('#TDID_StormMaterial_thumb'+idMaterial).html('');
															$('#TDID_StormMaterial_thumb'+idMaterial).css('background-color','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
														}).bind(this)});
	$("#ID_STORMMATERIALS_COLOR_KD").on('click', (function() {
											$('#INPUTID_STORMMATERIALS_COLOR_KD').css('display','block');
											$('#INPUTID_STORMMATERIALS_COLOR_KD').click();
											$('#INPUTID_STORMMATERIALS_COLOR_KD').css('display','none');
											$('.colorpicker').css('zIndex',currentStormZIndex);
										}).bind(this));
	// COLOR TEXTURE
	if(!material.solid) {
		var canvasBOtexture = this._sec.utils.getCanvasFromUint8Array(material.textureObjectKd.items[0].inData, material.textureObjectKd.items[0].W, material.textureObjectKd.items[0].H); 
		canvasBOtexture.style.width = '16px';
		canvasBOtexture.style.height = '16px';
		$('#ID_STORMMATERIALS_MATERIAL_KD').append(canvasBOtexture);
	} else {
		$('#ID_STORMMATERIALS_MATERIAL_KD').html('');
		$('#ID_STORMMATERIALS_MATERIAL_KD').css('background','rgb(0,0,0)');
	}
	document.getElementById('INPUT_STORMMATERIALS_KD').onchange=(function() {
		var filereader = new FileReader();
		filereader.onload = (function(event) {
			var img = new Image();
			img.onload = (function() {
			
				var material = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
				
				var splitName = $('#INPUT_STORMMATERIALS_KD').val().split('/');
				material.textureKdName = splitName[splitName.length-1];
				
				material.write(img);
				this._sec.PanelMaterials.showListMaterials();
				this._sec.PanelMaterials.showMaterial(this._sec.PanelMaterials.selectedMaterial);
				
			}).bind(this);
			img.src = event.target.result; // Set src from upload, original byte sequence
		}).bind(this);
		filereader.readAsDataURL(this.files[0]);
	}).bind(this);
	
	// BUMP TEXTURE
	if(material.textureObjectBump != undefined) {
		var canvasBOtextureBump = this._sec.utils.getCanvasFromUint8Array(material.textureObjectBump.items[0].inData, material.textureObjectBump.W, material.textureObjectBump.H); 
		canvasBOtextureBump.style.width = '16px';
		canvasBOtextureBump.style.height = '16px';
		$('#ID_STORMMATERIALS_MATERIAL_BUMP').append(canvasBOtextureBump);
	} else {
		$('#ID_STORMMATERIALS_MATERIAL_BUMP').html('');
		$('#ID_STORMMATERIALS_MATERIAL_BUMP').css('background','rgb(0,0,0)');
	}
	document.getElementById('INPUT_STORMMATERIALS_BUMP').onchange=(function() {
		var filereader = new FileReader();
		filereader.onload = (function(event) {
			var img = new Image();
			img.onload = (function() {
			
				var material = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
				
				var splitName = $('#INPUT_STORMMATERIALS_BUMP').val().split('/');
				material.textureBumpName = splitName[splitName.length-1];
				
				material.write(img, 'bump');
				this._sec.PanelMaterials.showListMaterials();
				this._sec.PanelMaterials.showMaterial(this._sec.PanelMaterials.selectedMaterial);
						
			}).bind(this);
			img.src = event.target.result; // Set src from upload, original byte sequence
		}).bind(this);
		filereader.readAsDataURL(this.files[0]);
	}).bind(this);
	
	
	
	$('#INPUT_STORMMATERIALS_NS').val(material.Ns*112);
	$('#INPUT_STORMMATERIALS_NS').on('keyup', (function() {
												var material = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
												
												material.Ns = $('#INPUT_STORMMATERIALS_NS').val()/112.0;
											}).bind(this));
											
											
	$('#BTN_STORMMATERIALS_APPLY').on('click', (function() {
												this._sec.PanelMaterials.applyMaterial();
											}).bind(this));
};

/**
* @type Void
* @private
*/
StormEngineC_PanelMaterials.prototype.applyMaterial = function() {
	if(this._sec.nearNode != undefined) {
		for(var nb = 0, fb = this._sec.nearNode.materialUnits.length; nb < fb; nb++) {
			this._sec.nearNode.materialUnits[nb] = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
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
	
	for(var n = 0, f = this._sec.materials.length; n < f; n++) {
		if(n != this._sec.PanelMaterials.selectedMaterial) {tmArray.push(this._sec.materials[n])}
	}
	this._sec.materials = tmArray;
	this.showListMaterials();
	$('#DIVID_STORMMATERIALS_MATERIAL').html('');
};

