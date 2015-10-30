/**
* @class
* @constructor
*/
StormEngineC_PanelRenderSettings = function(sec) {
	this._sec = sec;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelRenderSettings.prototype.loadPanel = function() {
	var html = '<fieldset>'+
					'<legend style="font-weight:bold;padding:2px">Render mode</legend>'+
					'<input id="INPUTVALUE_StormRenderMode" type="hidden" value="0"/>'+
					"Path Tracing <input type='radio' id='INPUTRADIO_StormRenderMode' name='INPUTRADIO_StormRenderMode' onclick='$(\"#INPUTVALUE_StormRenderMode\").val($(this).val());' value='0' checked='true'/><br />"+
					"EMR <input type='radio' id='INPUTRADIO_StormRenderMode' name='INPUTRADIO_StormRenderMode' onclick='$(\"#INPUTVALUE_StormRenderMode\").val($(this).val());' value='1'/><br />"+
					"<a href='#' style='color:#FFF' onclick='$(\"#DIVID_aboutEMRvsPATHTRACING\").dialog({ width:696,height:677,title:\"EMRvsPATHTRACING\" });'>View info..</a>"+
				'</fieldset>'+
				 
				 '<div id="DIVID_StormRenderConf">'+ 
					'Width: <input id="INPUTID_StormRenderSettings_width" type="text" value="256" /><br />'+
					'Height: <input id="INPUTID_StormRenderSettings_height" type="text" value="256" /><br />'+
					'Max samples: <input id="INPUTID_StormRenderSettings_maxSamples" type="text" value="60" /><br />'+
				'</div>'+
				'<br />'+
				'Frame start: <input id="INPUTID_StormRenderSettings_frameStart" type="text" value="0"/><br />'+
				'Frame end: <input id="INPUTID_StormRenderSettings_frameEnd" type="text" value="5" /><br />'+
				
				'<button id="BTNID_StormRenderBtn" type="button">Render</button>'+
				'<br />'+
				'<button id="BTNID_StormRenderTimelineBtn" type="button">Frames..</button>'+
				
				'<div style="background-color:#FFF;padding:5px;">'+
					'<div id="DIVID_StormRenderTypeNet"></div>'+
					'<div id="DIVID_StormRenderNetReceive"></div>'+
				'</div>'+
				'<div id="DIVID_aboutEMRvsPATHTRACING" style="display:none;"><img src="'+stormEngineCDirectory+'/resources/EMRvsPATHTRACING.jpg" /></div>';
	
	var _this = this;
	this._sec.makePanel(_this, 'DIVID_StormRenderSettings', 'RENDER SETTINGS', html);	
	
	document.getElementById("BTNID_StormRenderTimelineBtn").addEventListener("click", (function() {
		this._sec.timelinePathTracing.show();
	}).bind(this));
	
	$("#BTNID_StormRenderBtn").bind('click', (function() {
												this._sec.PanelRenderSettings.pushRender();
											}).bind(this));
};

/**
* @type Void
* @private
*/
StormEngineC_PanelRenderSettings.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
* @param {Int} width
* @param {Int} height
*/
StormEngineC_PanelRenderSettings.prototype.render = function(width, height) {
	console.log("making render");
	var w = (width != undefined) ? width : $('#INPUTID_StormRenderSettings_width').val();
	var h = (height != undefined) ? height : $('#INPUTID_StormRenderSettings_height').val();
	
	this._sec.PanelCanvas.show(); 
	this._sec.PanelCanvas.setDimensions(w, h); 
	this._sec.renderFrame({	'target':'CANVASID_STORM',
								'mode':$('#INPUTVALUE_StormRenderMode').val(),
								'width':w,
								'height':h,
								'frameStart':$('#INPUTID_StormRenderSettings_frameStart').val(),
								'frameEnd':$('#INPUTID_StormRenderSettings_frameEnd').val()});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelRenderSettings.prototype.pushRender = function() {
	if(wsPathTracing != undefined && (wsPathTracing.socket.connected == true || wsPathTracing.socket.connecting == true)) {
		if(this._sec.netID != 0) {
			wsPathTracing.emit('getRenderDimensions', {
				netID: this._sec.netID
			});
		} else {
			this._sec.PanelRenderSettings.render();
		}
	} else {
		this._sec.PanelRenderSettings.render();
	}
};