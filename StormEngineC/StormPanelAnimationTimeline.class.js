/**
* @class
* @constructor

* @property {Int} start 
* @property {Int} end
*/
StormEngineC_PanelAnimationTimeline = function(sec) {
	this._sec = sec;
	
	this.current = 0;
	this.start = 0;this.tempKeyFrameStart = 0;
	this.end = 25;
	
	this.SL = undefined;
	this.SLFrames = undefined;
	this.intervalPlay = undefined;
};

/**
* @type Void
* @private
*/
StormEngineC_PanelAnimationTimeline.prototype.loadPanel = function() {
	var html = '<table id="HANDLEDRAG_StormPanelAnimationTimeline" style="width:100%;padding:0px 6px 0px 6px;border:0px;cursor:move;">'+
					'<tr>'+
						'<td style="width:120px;text-align:left;vertical-align:middle">'+
							"<div id='INPUTID_StormPanelAnimationTimeline_current' style='width:100px;margin:auto;background-color:rgba(0,0,30,0.5);color:#AAA;text-align:center;' class='StormShadowInset StormRound'></div>"+
						'</td>'+
						'<td style="text-align:left;vertical-align:middle">'+
							"Start <input id='INPUTID_StormPanelAnimationTimeline_start' type='text' value='"+this.start+"' style='width:100px;background-color:transparent;border:0;color:#FFF;text-align:center;' class='StormShadowInset' /> "+
							"End <input id='INPUTID_StormPanelAnimationTimeline_end' type='text' value='"+this.end+"' style='width:100px;background-color:transparent;border:0;color:#FFF;text-align:center;' class='StormShadowInset' />"+
						'</td>'+
						'<td style="text-align:left;vertical-align:middle">'+
							"<button id='BUTTONID_StormPanelAnimationTimeline_key'>Set Key</button> "+
							"<button id='BUTTONID_StormPanelAnimationTimeline_prev' class='SEC_PanelAnimation_control SEC_PanelAnimation_controlPrev'></button>"+
							"<button id='BUTTONID_StormPanelAnimationTimeline_play' class='SEC_PanelAnimation_control SEC_PanelAnimation_controlPlay'></button>"+
							"<button id='BUTTONID_StormPanelAnimationTimeline_stop' class='SEC_PanelAnimation_control SEC_PanelAnimation_controlStop'></button>"+
							"<button id='BUTTONID_StormPanelAnimationTimeline_next' class='SEC_PanelAnimation_control SEC_PanelAnimation_controlNext'></button>"+
						'</td>'+
					'</tr>'+
				'</table>'+
				'<div style="padding:6px" class="StormModalWindowInt StormRound">'+
					
					'<div id="CANVASID_STORMANIMATIONTIMELINE_frames" style="height:10px;"></div>'+
					'<div id="CANVASID_STORMANIMATIONTIMELINE_slider" class="StormShadowInset"><canvas id="CANVASID_STORMANIMATIONTIMELINE" height="30"></canvas></div><br />'+
					
				'</div>';
	
	var _this = this;
	this._sec.makePanel(_this, 'DIVID_StormPanelAnimationTimeline', 'TIMELINE', html);	
	
	
	
	
	
	
	$("#DIVID_StormPanelAnimationTimeline #INPUTID_StormPanelAnimationTimeline_start").bind('keyup', (function() {
												this._sec.PanelAnimationTimeline.setStart($(this).val());
											}).bind(this));
	$("#DIVID_StormPanelAnimationTimeline #INPUTID_StormPanelAnimationTimeline_end").bind('keyup', (function() {
												this._sec.PanelAnimationTimeline.setEnd($(this).val());
											}).bind(this));
											
	$('#CANVASID_STORMANIMATIONTIMELINE').attr('width', ($(document).width()-100));
	
	
	
	
	this.SL = $("#CANVASID_STORMANIMATIONTIMELINE_slider").slider({min: this.start,
														max: this.end,
														value: this.current}); 
	this.SL.slider({
		slide: (function( event, ui ) {
			this._sec.PanelAnimationTimeline.setFrame(ui.value);
		}).bind(this)
	});
	
	
	this.drawTimelineGrid();
	
	
	
	
	$("#BUTTONID_StormPanelAnimationTimeline_key").bind('click', (function() {
												if(this._sec.nearNode != undefined) {
													this._sec.nearNode.setAnimKey(this._sec.PanelAnimationTimeline.current);
												} else {
													alert('No object selected');
												}
											}).bind(this));
	$("#BUTTONID_StormPanelAnimationTimeline_prev").bind('click', (function() {
												this._sec.PanelAnimationTimeline.prevFrame();
											}).bind(this));
	$("#BUTTONID_StormPanelAnimationTimeline_play").bind('click', (function() {
												this._sec.PanelAnimationTimeline.play();
											}).bind(this));
	$("#BUTTONID_StormPanelAnimationTimeline_stop").bind('click', (function() {
												this._sec.PanelAnimationTimeline.stop();
											}).bind(this));
	$("#BUTTONID_StormPanelAnimationTimeline_next").bind('click', (function() {
												this._sec.PanelAnimationTimeline.nextFrame();
											}).bind(this));
};

/**
* @type Void
* @private
*/
StormEngineC_PanelAnimationTimeline.prototype.show = function() {
	$(".SECmenu").css('z-index','0');
	this.$.css('z-index','99').show(); 
};

/**
* Set the Global Timeline start
* @type Void
* @param {Int} frameStart
*/
StormEngineC_PanelAnimationTimeline.prototype.setStart = function(frame) {
	if(frame != '') {
		this._sec.PanelAnimationTimeline.start = frame;
		if(frame > this._sec.PanelAnimationTimeline.end) {
			$("#INPUTID_StormPanelAnimationTimeline_end").val(frame);
			this._sec.PanelAnimationTimeline.end = frame;
		}
		this._sec.PanelAnimationTimeline.drawTimelineGrid();
		$("#DIVID_StormPanelAnimationTimeline #INPUTID_StormPanelAnimationTimeline_start").val(frame);
	}
};

/**
* Set the Global Timeline end
* @type Void
* @param {Int} frameEnd
*/
StormEngineC_PanelAnimationTimeline.prototype.setEnd = function(frame) {
	if(frame != '') {
		this._sec.PanelAnimationTimeline.end = frame;
		if(frame < this._sec.PanelAnimationTimeline.start) {
			$("#INPUTID_StormPanelAnimationTimeline_start").val(frame);
			this._sec.PanelAnimationTimeline.start = frame;
		}
		this._sec.PanelAnimationTimeline.drawTimelineGrid();
		$("#DIVID_StormPanelAnimationTimeline #INPUTID_StormPanelAnimationTimeline_end").val(frame);
	}
};

/**
* @type Void
* @private
* @param {Int} frame
*/
StormEngineC_PanelAnimationTimeline.prototype.setFrame = function(frame) {
	this.current = frame;
	this.applyAnimFrame(this.current);
	this.SL.slider("option", "value", parseInt(this.current));
};

/**
* @type Void
* @private
*/
StormEngineC_PanelAnimationTimeline.prototype.prevFrame = function() {
	this.current = (this.current <= this.start) ? this.start : this.current-1;
	this.applyAnimFrame(this.current);
	this.SL.slider("option", "value", parseInt(this.current));
};

/**
* @type Void
* @private
*/
StormEngineC_PanelAnimationTimeline.prototype.nextFrame = function() {
	this.current = (this.current >= this.end) ? this.start : this.current+1;
	this.applyAnimFrame(this.current);
	this.SL.slider("option", "value", parseInt(this.current));
};

/**
* Play Global Timeline
* @type Void
*/
StormEngineC_PanelAnimationTimeline.prototype.play = function() {  
	if(this.intervalPlay == undefined) {
		this.intervalPlay = setInterval(this._sec.PanelAnimationTimeline.nextFrame.bind(this), 1000/25);
	}
};

/**
* Stop Global Timeline
* @type Void
*/
StormEngineC_PanelAnimationTimeline.prototype.stop = function() {
	if(this.intervalPlay != undefined) {
		clearInterval(this.intervalPlay);
		this.intervalPlay = undefined;
	}
};

/**
* @type Void
* @private
*/
StormEngineC_PanelAnimationTimeline.prototype.drawTimelineGrid = function() {	
	var divisorPixel = (1/(this.end-this.start));
	divisorPixel *= $('#CANVASID_STORMANIMATIONTIMELINE').attr('width');
	
	this.ctxAnimationTimeline = document.getElementById('CANVASID_STORMANIMATIONTIMELINE').getContext("2d");
	this.ctxAnimationTimeline.clearRect(0,0,$('#CANVASID_STORMANIMATIONTIMELINE').attr('width'),30);
	
	
	this.ctxAnimationTimeline.beginPath();
	this.ctxAnimationTimeline.lineWidth = 1;
	this.ctxAnimationTimeline.strokeStyle = 'rgba(255, 255, 255, 1.0)';
	makingLine = false;
	var aumentoDivisorPixel = 0;
	var currentFrame = this.start;
	var arrFrames = [];
	for(var n=0,f = $('#CANVASID_STORMANIMATIONTIMELINE').attr('width'); n <= f; n++) {
		if(n == Math.round(aumentoDivisorPixel)) {
			makingLine = true;
			this.ctxAnimationTimeline.moveTo(n, 15);
			this.ctxAnimationTimeline.lineTo(n, 0);
			this.ctxAnimationTimeline.stroke();
			
			
		} else if(makingLine == true) {
			if(this._sec.nearNode != undefined) {
				if(this._sec.nearNode.nodePivot == undefined) {
					if(this._sec.nearNode.animWMatrix != undefined && this._sec.nearNode.animWMatrix[currentFrame] != undefined) {
						arrFrames.push(currentFrame);
					}
				} else {
					if(this._sec.nearNode.animWMatrix != undefined && this._sec.nearNode.nodePivot.animWMatrix[currentFrame] != undefined) {
						arrFrames.push(currentFrame);
					}
				}
			} 
			this.ctxAnimationTimeline.strokeText(currentFrame, (n-6), 30);
			
			currentFrame++;
			makingLine = false;
			aumentoDivisorPixel += divisorPixel;
		}
	}
	if(this._sec.nearNode != undefined) {
		if(this._sec.nearNode.nodePivot == undefined) {
			if(this._sec.nearNode.animWMatrix != undefined && this._sec.nearNode.animWMatrix[currentFrame] != undefined) {
				arrFrames.push(currentFrame);
			}
		} else {
			if(this._sec.nearNode.animWMatrix != undefined && this._sec.nearNode.nodePivot.animWMatrix[currentFrame] != undefined) {
				arrFrames.push(currentFrame);
			}
		}
	} 
	this.ctxAnimationTimeline.strokeText(currentFrame, (n-6), 30);
	
	
	
	
	
	
	if((this.current < this.start) || (this.current > this.end)) this.current = parseInt(this.start);
	this.SL.slider("option", "min", parseInt(this.start));
	this.SL.slider("option", "max", parseInt(this.end));
	this.SL.slider("option", "value", parseInt(this.current));
	
	
	if(this.SLFrames != undefined) {
		this.SLFrames.slider("destroy");
		this.SLFrames = undefined;
	}
	if(arrFrames.length > 0) {
		this.SLFrames = $("#CANVASID_STORMANIMATIONTIMELINE_frames").slider({min: this.start,
															max: this.end,
															values: arrFrames}); 
		$("#CANVASID_STORMANIMATIONTIMELINE_frames").removeClass('ui-widget-content');
		$("#CANVASID_STORMANIMATIONTIMELINE_frames a").removeClass('ui-state-default ui-corner-all').css({'margin-left':'-0.4%',
																							'width':'10px',
																							'background-color':'#FF0000'});
		this.SLFrames.slider({
			slide: (function( event, ui ) {
				$("#CANVASID_STORMANIMATIONTIMELINE_frames a").removeClass('ui-state-focus ui-state-active ui-state-hover').css({'background-color':'#FF0000'});
			}).bind(this),
			start: (function( event, ui ) {
				this._sec.PanelAnimationTimeline.tempKeyFrameStart = ui.value;
				$("#CANVASID_STORMANIMATIONTIMELINE_frames a").removeClass('ui-state-focus ui-state-active ui-state-hover').css({'background-color':'#FF0000'});
			}).bind(this),
			stop: (function( event, ui ) {
				this._sec.nearNode.changeAnimKey(this._sec.PanelAnimationTimeline.tempKeyFrameStart, ui.value);
				$("#CANVASID_STORMANIMATIONTIMELINE_frames a").removeClass('ui-state-focus ui-state-active ui-state-hover').css({'background-color':'#FF0000'});
			}).bind(this)
		});
		$("#CANVASID_STORMANIMATIONTIMELINE_frames a").bind('mouseover', function() {
													$(this).removeClass('ui-state-focus ui-state-active ui-state-hover').css({'background-color':'#FF0000'});
												});
		
	}
};

/**
* Apply anim matrixs to all scene nodes
* @type Void
* @private
* @param {Int} frame 
*/
StormEngineC_PanelAnimationTimeline.prototype.applyAnimFrame = function(frame) {
	$('#INPUTID_StormPanelAnimationTimeline_current').html(frame);
	this.current = frame;
	this._sec.runningAnim = true;
	// objetos
	for(n = 0, f = this._sec.nodes.length; n < f; n++) {
		if(this._sec.nodes[n].animMin != undefined) { // existe animación
			if(this._sec.nodes[n].animController == 'GlobalTimeline') {
				var jsonM = this.getNodeMatrixForFrame(this._sec.nodes[n], this.current);
				this._sec.nodes[n].MPOS = jsonM.vec;
			}
		}
	}
	// lights
	for(n = 0, f = this._sec.lights.length; n < f; n++) {
		if(this._sec.lights[n].animMin != undefined) { // existe animación
			if(this._sec.lights[n].animController == 'GlobalTimeline') {
				var jsonM = this.getNodeMatrixForFrame(this._sec.lights[n], this.current);
				this._sec.lights[n].MPOS = jsonM.vec;
				this._sec.lights[n].nodeCtxWebGL.MPOS = jsonM.vec.inverse();
			}
		}
	}
	// cámaras
	for(n = 0, f = this._sec.nodesCam.length; n < f; n++) {
		if(this._sec.nodesCam[n].animMin != undefined) { // existe animación
			if(this._sec.nodesCam[n].animController == 'GlobalTimeline') { 
				var jsonM = this.getNodeMatrixForFrame(this._sec.nodesCam[n], this.current);
				this._sec.nodesCam[n].nodePivot.MPOS = jsonM.vec;
				this._sec.nodesCam[n].nodeGoal.MPOS = jsonM.vecb;
			}
		}
	}
	
};
 
/**
* Get the matrix for a node in a desired frame
* @type Void
* @private
* @param {StormNode} node
* @param {Int} frameNumber
*/
StormEngineC_PanelAnimationTimeline.prototype.getNodeMatrixForFrame = function(node, frame) { 
	
	if(node.animMin != undefined) { // animation exists
			
			if(node.nodePivot == undefined) { // objects and lights
				if(node.animWMatrix[frame] != undefined) {
					return {'vec':$M16(node.animWMatrix[frame].e)};
				} else {
					for(var nb = frame, fnb = this.start; nb >= fnb; nb--) {
						if(node.animWMatrix[nb] != undefined) {
							var prevFrame = nb;	break;
						}
					}
					for(var nb = frame, fnb = this.end; nb <= fnb; nb++) {
						if(node.animWMatrix[nb] != undefined) {
							var nextFrame = nb;	break;
						}
					}
					if(prevFrame == undefined) return {'vec':$M16(node.animWMatrix[nextFrame].e)};
					if(nextFrame == undefined) return {'vec':$M16(node.animWMatrix[prevFrame].e)};
					
					
					var unitPosPrevNext = (nextFrame-frame)/(nextFrame-prevFrame);
					var pivotPrevFrameWMatrix = node.animWMatrix[prevFrame].e; var ppM = pivotPrevFrameWMatrix;
					var pivotNextFrameWMatrix = node.animWMatrix[nextFrame].e; var pnM = pivotNextFrameWMatrix;
					var arrWMatrix = [];
					var tt;
					arrWMatrix[0] = pnM[0]-((pnM[0]-ppM[0])*unitPosPrevNext);
					arrWMatrix[1] = pnM[1]-((pnM[1]-ppM[1])*unitPosPrevNext);
					arrWMatrix[2] = pnM[2]-((pnM[2]-ppM[2])*unitPosPrevNext);
					arrWMatrix[3] = pnM[3]-((pnM[3]-ppM[3])*unitPosPrevNext);
					arrWMatrix[4] = pnM[4]-((pnM[4]-ppM[4])*unitPosPrevNext);
					arrWMatrix[5] = pnM[5]-((pnM[5]-ppM[5])*unitPosPrevNext);
					arrWMatrix[6] = pnM[6]-((pnM[6]-ppM[6])*unitPosPrevNext);
					arrWMatrix[7] = pnM[7]-((pnM[7]-ppM[7])*unitPosPrevNext);
					arrWMatrix[8] = pnM[8]-((pnM[8]-ppM[8])*unitPosPrevNext);
					arrWMatrix[9] = pnM[9]-((pnM[9]-ppM[9])*unitPosPrevNext);
					arrWMatrix[10] = pnM[10]-((pnM[10]-ppM[10])*unitPosPrevNext);
					arrWMatrix[11] = pnM[11]-((pnM[11]-ppM[11])*unitPosPrevNext);
					arrWMatrix[12] = pnM[12]-((pnM[12]-ppM[12])*unitPosPrevNext);
					arrWMatrix[13] = pnM[13]-((pnM[13]-ppM[13])*unitPosPrevNext);
					arrWMatrix[14] = pnM[14]-((pnM[14]-ppM[14])*unitPosPrevNext);
					arrWMatrix[15] = pnM[15]-((pnM[15]-ppM[15])*unitPosPrevNext);
					return {'vec':$M16(arrWMatrix)};
				}
			} else { // cámaras
				if(node.nodePivot.animWMatrix[frame] != undefined) {
					return {'vec':$M16(node.nodePivot.animWMatrix[frame].e),'vecb':$M16(node.nodeGoal.animWMatrix[frame].e)};
				} else {
					for(var nb = frame, fnb = this.start; nb >= fnb; nb--) {
						if(node.nodePivot.animWMatrix[nb] != undefined) {
							var prevFrame = nb;	break;
						}
					}
					for(var nb = frame, fnb = this.end; nb <= fnb; nb++) {
						if(node.nodePivot.animWMatrix[nb] != undefined) {
							var nextFrame = nb;	break;
						}
					}
					if(prevFrame == undefined) return {'vec':$M16(node.nodePivot.animWMatrix[nextFrame].e),'vecb':$M16(node.nodeGoal.animWMatrix[nextFrame].e)};
					if(nextFrame == undefined) return {'vec':$M16(node.nodePivot.animWMatrix[prevFrame].e),'vecb':$M16(node.nodeGoal.animWMatrix[prevFrame].e)};
					
					
					var unitPosPrevNext = (nextFrame-frame)/(nextFrame-prevFrame);
					var pivotPrevFrameWMatrix = node.nodePivot.animWMatrix[prevFrame].e; var ppM = pivotPrevFrameWMatrix;
					var pivotNextFrameWMatrix = node.nodePivot.animWMatrix[nextFrame].e; var pnM = pivotNextFrameWMatrix;
					var arrPivotWMatrix = [];
					var tt;
					arrPivotWMatrix[0] = pnM[0]-((pnM[0]-ppM[0])*unitPosPrevNext);
					arrPivotWMatrix[1] = pnM[1]-((pnM[1]-ppM[1])*unitPosPrevNext);
					arrPivotWMatrix[2] = pnM[2]-((pnM[2]-ppM[2])*unitPosPrevNext);
					arrPivotWMatrix[3] = pnM[3]-((pnM[3]-ppM[3])*unitPosPrevNext);
					arrPivotWMatrix[4] = pnM[4]-((pnM[4]-ppM[4])*unitPosPrevNext);
					arrPivotWMatrix[5] = pnM[5]-((pnM[5]-ppM[5])*unitPosPrevNext);
					arrPivotWMatrix[6] = pnM[6]-((pnM[6]-ppM[6])*unitPosPrevNext);
					arrPivotWMatrix[7] = pnM[7]-((pnM[7]-ppM[7])*unitPosPrevNext);
					arrPivotWMatrix[8] = pnM[8]-((pnM[8]-ppM[8])*unitPosPrevNext);
					arrPivotWMatrix[9] = pnM[9]-((pnM[9]-ppM[9])*unitPosPrevNext);
					arrPivotWMatrix[10] = pnM[10]-((pnM[10]-ppM[10])*unitPosPrevNext);
					arrPivotWMatrix[11] = pnM[11]-((pnM[11]-ppM[11])*unitPosPrevNext);
					arrPivotWMatrix[12] = pnM[12]-((pnM[12]-ppM[12])*unitPosPrevNext);
					arrPivotWMatrix[13] = pnM[13]-((pnM[13]-ppM[13])*unitPosPrevNext);
					arrPivotWMatrix[14] = pnM[14]-((pnM[14]-ppM[14])*unitPosPrevNext);
					arrPivotWMatrix[15] = pnM[15]-((pnM[15]-ppM[15])*unitPosPrevNext);
					
					var goalPrevFrameWMatrix = node.nodeGoal.animWMatrix[prevFrame].e; var gpM = goalPrevFrameWMatrix;
					var goalNextFrameWMatrix = node.nodeGoal.animWMatrix[nextFrame].e; var gnM = goalNextFrameWMatrix;
					var arrGoalWMatrix = [];
					arrGoalWMatrix[0] = gnM[0]-((gnM[0]-gpM[0])*unitPosPrevNext);
					arrGoalWMatrix[1] = gnM[1]-((gnM[1]-gpM[1])*unitPosPrevNext);
					arrGoalWMatrix[2] = gnM[2]-((gnM[2]-gpM[2])*unitPosPrevNext);
					arrGoalWMatrix[3] = gnM[3]-((gnM[3]-gpM[3])*unitPosPrevNext);
					arrGoalWMatrix[4] = gnM[4]-((gnM[4]-gpM[4])*unitPosPrevNext);
					arrGoalWMatrix[5] = gnM[5]-((gnM[5]-gpM[5])*unitPosPrevNext);
					arrGoalWMatrix[6] = gnM[6]-((gnM[6]-gpM[6])*unitPosPrevNext);
					arrGoalWMatrix[7] = gnM[7]-((gnM[7]-gpM[7])*unitPosPrevNext);
					arrGoalWMatrix[8] = gnM[8]-((gnM[8]-gpM[8])*unitPosPrevNext);
					arrGoalWMatrix[9] = gnM[9]-((gnM[9]-gpM[9])*unitPosPrevNext);
					arrGoalWMatrix[10] = gnM[10]-((gnM[10]-gpM[10])*unitPosPrevNext);
					arrGoalWMatrix[11] = gnM[11]-((gnM[11]-gpM[11])*unitPosPrevNext);
					arrGoalWMatrix[12] = gnM[12]-((gnM[12]-gpM[12])*unitPosPrevNext);
					arrGoalWMatrix[13] = gnM[13]-((gnM[13]-gpM[13])*unitPosPrevNext);
					arrGoalWMatrix[14] = gnM[14]-((gnM[14]-gpM[14])*unitPosPrevNext);
					arrGoalWMatrix[15] = gnM[15]-((gnM[15]-gpM[15])*unitPosPrevNext);
					
					return {'vec':$M16(arrPivotWMatrix),'vecb':$M16(arrGoalWMatrix)};
				}
			}
			
		
	} else {
		if(node.nodePivot == undefined) { // objects and lights
			return {'vec':$M16(node.MPOS.e)};
		} else { // cámaras
			return {'vec':$M16(node.nodePivot.MPOS.e),'vecb':$M16(node.nodeGoal.MPOS.e)};
		}
	}
		
};
