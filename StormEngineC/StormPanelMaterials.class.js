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
			
			var e = $('#TDID_StormMaterial_'+n);
			e.on('click', (function(e) {
					this._sec.PanelMaterials.showMaterial(e.attr('data-matnum'));
					$("#DIVID_STORMMATERIALS_LIST .boxMat").css("background-color","#000");
					$(this).css("background-color","#444");
				}).bind(this, e));
			e.on('mouseover', function() {
					$(this).css({"border-color":"#CCC"});
				});
			e.on('mouseout', function() {
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
				'<span style="font-weight:bold">'+material.name+'</span>';
	$('#DIVID_STORMMATERIALS_MATERIAL').html(str);
	
	var currentColor = material.textureObjectKd.items[0].inData;
	var hexColor = this._sec.utils.rgbToHex([currentColor[0], currentColor[1], currentColor[2]]);
	this._sec.actHelpers.add_colorpicker(DGE('DIVID_STORMMATERIALS_MATERIAL'), "ALBEDO_COLOR", hexColor, (function(idMaterial, colorValue) {
    	var rgb = this._sec.utils.hexToRgb(colorValue);
    	
    	this._sec.materials[idMaterial].write($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
    	//$('#ID_STORMMATERIALS_MATERIAL_KD').html('');
    	$('#TDID_StormMaterial_thumb'+idMaterial).html('');
		$('#TDID_StormMaterial_thumb'+idMaterial).css('background-color','rgb('+rgb.r+','+rgb.g+','+rgb.b+')');
	}).bind(this, idMaterial));
		
	this._sec.actHelpers.add_imageSelection(DGE('DIVID_STORMMATERIALS_MATERIAL'), "ALBEDO_IMAGE", (function(idMaterial, img) {
		var material = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
		material.write(img);
		this._sec.PanelMaterials.showListMaterials();
		this._sec.PanelMaterials.showMaterial(this._sec.PanelMaterials.selectedMaterial);
		
		//this._sec.nearNode.setAlbedo(img);
	}).bind(this, idMaterial));
	var canvasBOtexture = this._sec.utils.getCanvasFromUint8Array(material.textureObjectKd.items[0].inData, material.textureObjectKd.items[0].W, material.textureObjectKd.items[0].H); 
	canvasBOtexture.style.width = '16px';
	canvasBOtexture.style.height = '16px';
	$('#DIVID_STORMMATERIALS_MATERIAL').append(canvasBOtexture);
	
	this._sec.actHelpers.add_imageSelection(DGE('DIVID_STORMMATERIALS_MATERIAL'), "BUMP_IMAGE", (function(idMaterial, img) {
		var material = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
		material.write(img, 'bump');
		this._sec.PanelMaterials.showListMaterials();
		this._sec.PanelMaterials.showMaterial(this._sec.PanelMaterials.selectedMaterial);
		
		//this._sec.nearNode.setAlbedo(img);
	}).bind(this, idMaterial));
	if(material.textureObjectBump != undefined && material.textureObjectBump.items[0].inData != undefined) {
		var canvasBOtextureBump = this._sec.utils.getCanvasFromUint8Array(material.textureObjectBump.items[0].inData, material.textureObjectBump.items[0].W, material.textureObjectBump.items[0].H); 
		canvasBOtextureBump.style.width = '16px';
		canvasBOtextureBump.style.height = '16px';
		$('#DIVID_STORMMATERIALS_MATERIAL').append(canvasBOtextureBump);	
	}
	
	this._sec.actHelpers.add_slider(DGE('DIVID_STORMMATERIALS_MATERIAL'), "ROUGHNESS", material.Ns*112, 0.0, 100.0, 5.0, (function(value) {
		var material = this._sec.materials[this._sec.PanelMaterials.selectedMaterial];
		
		material.Ns = value/112.0;
	}).bind(this));											
	
	this._sec.actHelpers.add_btn(DGE('DIVID_STORMMATERIALS_MATERIAL'), "APPLY_TO_SELECTION", (function() {
		this._sec.PanelMaterials.applyMaterial();
	}).bind(this));
	
	this._sec.actHelpers.add_btn(DGE('DIVID_STORMMATERIALS_MATERIAL'), "DELETE_MATERIAL", (function() {
		this._sec.PanelMaterials.deleteMaterial();
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

