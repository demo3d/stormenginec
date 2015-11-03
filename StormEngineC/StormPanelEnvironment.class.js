/**
* @class
* @constructor
*/
StormEngineC_PanelEnvironment = function(sec) {
	this._sec = sec;
	
	this.$;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEnvironment.prototype.loadPanel = function() {
	this.panel = new StormPanel({"id": 'DIVID_StormPanelEnvironment', 
								"paneltitle": 'LIST ENVIRONMENT'});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEnvironment.prototype.show = function() {
	this.panel.show();
	
	this.update();
};

/**
* @type Void
* @private
*/
StormEngineC_PanelEnvironment.prototype.update = function() {
	document.getElementById("DIVID_StormPanelEnvironment_content").innerHTML = "";
	
	var currentAmbientColor = this._sec.getAmbientColor();
	var hexColor = this._sec.utils.rgbToHex([currentAmbientColor[0]*255, currentAmbientColor[1]*255, currentAmbientColor[2]*255]);
    this._sec.actHelpers.add_colorpicker(DGE('DIVID_StormPanelEnvironment_content'), "AMBIENT_COLOR", hexColor, (function(colorValue) {
    	var rgb = this._sec.utils.hexToRgb(colorValue);
    	
    	this._sec.setAmbientColor($V3([rgb.r/255, rgb.g/255, rgb.b/255]));
	}).bind(this));
	
    this._sec.actHelpers.add_slider(DGE('DIVID_StormPanelEnvironment_content'), "AMBIENT_OCCLUSION", this._sec.stormGLContext.SSAOlevel, 0.0, 5.0, 0.1, (function(value) {
    	this._sec.setWebGLSSAO(true, value);
    	if(this._sec.stormGLContext.SSAOlevel >= 4.99) {
    		this._sec.setWebGLSSAO(false, 5.0);
		}
	}).bind(this));
	
    this._sec.actHelpers.add_btn(DGE('DIVID_StormPanelEnvironment_content'), "SET_GLOBAL_ILLUMINATION_VOXELIZATOR", (function() {
    	this._sec.selectNode(stormEngineC.giv2);
    	this._sec.pickingCall='setVoxelizator(_selectedNode_); this._sec.PanelEnvironment.show();';  
    	this._sec.PanelListObjects.show();
		$('#DIVID_STORMOBJECTS_LIST div').effect('highlight');
		document.body.style.cursor='pointer';
	}).bind(this));	
    
    this._sec.actHelpers.add_checkbox(DGE('DIVID_StormPanelEnvironment_content'), "ENABLE_GI", this._sec.stormGLContext.GIv2enable,
			(function() {
    			this._sec.stormGLContext.GIv2enable = true;
			}).bind(this), (function() {
				this._sec.stormGLContext.GIv2enable = false;
			}).bind(this));	
    
    this._sec.actHelpers.add_checkbox(DGE('DIVID_StormPanelEnvironment_content'), "GI_STOP_ONCAMERAMOVE", this._sec.stormGLContext.GIstopOncameramove,
			(function() {
				this._sec.stormGLContext.GIstopOncameramove = true;
			}).bind(this), (function() {
				this._sec.stormGLContext.GIstopOncameramove = false;
			}).bind(this));	
    
    this._sec.actHelpers.add_slider(DGE('DIVID_StormPanelEnvironment_content'), "GI_MAX_BOUNDS", this._sec.giv2.maxBounds, 1.0, 10.0, 1.0, (function(value) {
    	this._sec.giv2.setMaxBounds(ui.value);
    	this._sec.setZeroSamplesGIVoxels();
	}).bind(this));
	
    this._sec.actHelpers.add_checkbox(DGE('DIVID_StormPanelEnvironment_content'), "SHADOWS", this._sec.stormGLContext.shadowsEnable,
			(function() {
				this._sec.stormGLContext.shadowsEnable = true;
			}).bind(this), (function() {
				this._sec.stormGLContext.shadowsEnable = false;
			}).bind(this));	
    
    this._sec.actHelpers.add_checkbox(DGE('DIVID_StormPanelEnvironment_content'), "SHOW_GRID", this._sec.grid.gridEnabled,
			(function() {
				this._sec.grid.gridEnabled = true;
			}).bind(this), (function() {
				this._sec.grid.gridEnabled = false;
			}).bind(this));
};




