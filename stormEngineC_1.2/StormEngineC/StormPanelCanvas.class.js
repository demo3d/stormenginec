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
StormEngineC_PanelCanvas = function() {

};

/**
* @type Void
* @private
*/
StormEngineC_PanelCanvas.prototype.loadPanel = function() {
	var html = '<canvas id="CANVASID_STORM" ></canvas><br />'+
				'<div id="DIVID_StormPanelCanvas_proc"></div>'+
				'<button type="button" id="BTNID_StormPanelCanvas_renderBtn" >Render</button>'+
				'<button type="button" onclick="stormEngineC.renderFrameStop();" ><div style="width:14px;height:14px;background:#FF0000;"></div></button>';
	
	var _this = this;
	stormEngineC.makePanel(_this, 'DIVID_StormPanelCanvas', 'RENDER', html);
	
	
										
	$("#DIVID_StormPanelCanvas #BTNID_StormPanelCanvas_renderBtn").bind('click', function() {
												stormEngineC.PanelRenderSettings.pushRender();
											});
};

/**
* @type Void
* @private
*/
StormEngineC_PanelCanvas.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* @type Void
* @private
* @param {Int} width
* @param {Int} height
*/
StormEngineC_PanelCanvas.prototype.setDimensions = function(width, height) {
	$('#CANVASID_STORM').attr('width',width);
	$('#CANVASID_STORM').attr('height',height);
};
