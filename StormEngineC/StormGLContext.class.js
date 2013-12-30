/**
* @class
* @constructor

* @property {WebGLRenderingContext} gl WebGLRenderingContext
*/
StormGLContext = function(stormCanvasObject, loadScene) {
	this.utils = new StormUtils();
	this.stormCanvasObject = stormCanvasObject; 
	var dim = (stormEngineC.$.width() > stormEngineC.$.height()) ? stormEngineC.$.width() : stormEngineC.$.height();
	this.viewportWidth = dim;
	this.viewportHeight = dim;
	this.maxViewportWidth = 2048;
	this.maxViewportHeight = 2048;
	
	this.nodes = stormEngineC.nodes;
	this.nodesCam = stormEngineC.nodesCam;
	this.lines = stormEngineC.lines;
	this.particles = stormEngineC.particles;
	this.polarityPoints = stormEngineC.polarityPoints;
	this.lights = stormEngineC.lights;
	
	this.far = 500.0;
	this.glowSize = 0.5;
	
	// AMBIENT
	this.ambientColor = $V3([0.7, 0.75, 0.8]);
	
	// SSAO
	this.SSAOenable = true;
	this.SSAOlevel = 3.2; // 0.1 max ssao; 5.0 min ssao
	
	// GI
	this.stormVoxelizatorObject = undefined;
	this.GIstopOncameramove = true;
	this.sampleGiVoxels = 0;
	this.GIv2enable = true;
	
	// SHADOWS
	this.shadowsEnable = true;
	
	// PICKING
	this.queryNodePickType = 0; // 0=noquery, 1=mousedown, 2=mouseup
	this.transformOverlaySelected = 0.0; //1=posx,2=posy,3=posz, 4=rotx,5=roty,6=rotz 
	
	// BG
	this.useEnvironment = false;
	this.useBGTrans = false;
	this.useBGSolid = false;
	this.useBGAmbient = true;
	
	// STACK SHADER COMPILATION
	this.stackShaders = []; 
	this.stackShadersRunning = false;
	this._SHOW_ANGLE_HLSL_SOURCE = false; // start chrome with –-enable-privileged-webgl-extensions (–-use-gl=desktop if stormEngineC.enableVO())
	
	// VIEW FBS 
	this.view_Normals = false;
	this.view_LightDepth = false;this.view_LightDepthNum = 0; // 0=sun
	this.view_Shadows = false;
	this.view_SceneNoDOF = false;
	
	
	
	
	// CANVAS FOR PUBLIC USE
	this.eStormCanvasPUB = document.createElement('canvas');
	this.eStormCanvasPUB.width = this.stormCanvasObject.width;
	this.eStormCanvasPUB.height = this.stormCanvasObject.height;
	this.eStormCanvasPUB.id = "stormCanvasPUB";
	this.ctx2D = this.eStormCanvasPUB.getContext("2d"); // this is used for this.textureObject_Ctx2D (no append)
	
	// CANVAS FOR STATUS INFOS
	this.eStormCanvasSTATUS = document.createElement('canvas');
	this.eStormCanvasSTATUS.width = this.stormCanvasObject.width;
	this.eStormCanvasSTATUS.height = 20;
	this.eStormCanvasSTATUS.id = "stormCanvasStatus";
	this.eStormCanvasSTATUS.style.position = "absolute";
	$('#'+this.stormCanvasObject.id).parent().append(this.eStormCanvasSTATUS);
	this.ctx2DStatus = this.eStormCanvasSTATUS.getContext("2d");
	
	// DIV DEBUG
	var eDiv = '<div id="stormDIVInfos" style="position:absolute;font-size:13px;font-weight:bold;background-color:#FFF;color:#000;text-shadow:rgb(0, 0, 0) 0px 0px 22px;"></div>';
	$('#'+this.stormCanvasObject.id).parent().append(eDiv);
	this.divInfos = document.getElementById('stormDIVInfos');
	
	var eDiv = '<div id="stormDIVDebug" style="text-align:left;"></div>'; 
	$('#stormDIVInfos').append(eDiv);
	this.divDebug = document.getElementById('stormDIVDebug'); 
	
	this.updateInfoElements();
		
	this.initContext();
};
/**
 * @private 
 */
StormGLContext.prototype.initContext = function() {
	// WEBGL CONTEXT
	if(!(this.gl = this.utils.getWebGLContextFromCanvas(this.stormCanvasObject))) { 
		alert('Your browser does not support WebGL. Download <a href="http://www.mozilla.com/">Firefox</a> o <a href="http://www.google.es/chrome">Chrome</a>');
		return false;
	} 
	this.gl.getExtension('OES_texture_float');
	this.gl.getExtension('OES_texture_float_linear');
	var highPrecisionSupport = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT);
	this.precision = (highPrecisionSupport != 0) ? 'precision highp float;\n\nprecision highp int;\n\n' : 'precision mediump float;\n\nprecision mediump int;\n\n';
	
	
	// SCREEN QUAD BUFFER
	var mesh = new StormMesh();
	mesh.loadQuad(undefined,1.0,1.0);
	this.vertexBuffer_QUAD = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_QUAD);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.vertexArray), this.gl.STATIC_DRAW);
	this.textureBuffer_QUAD = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer_QUAD);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(mesh.textureArray), this.gl.STATIC_DRAW);
	this.indexBuffer_QUAD = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_QUAD);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indexArray), this.gl.STATIC_DRAW);
	
	
	
	// WEBGL FB
	this.rBuffer = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	this.fBuffer = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rBuffer);
	
	this.rBufferLightSun = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBufferLightSun);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.maxViewportWidth, this.maxViewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	this.fBufferLightSun = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBufferLightSun);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rBufferLightSun);
	
	this.rBufferLightSpot = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBufferLightSpot);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	this.fBufferLightSpot = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBufferLightSpot);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rBufferLightSpot);
	
	// WEBGL FB TEXTURES
	// TEXTURE FRAMEBUFFER CTX2D
	this.textureObject_Ctx2D = this.gl.createTexture();	
	// TEXTURE FRAMEBUFFER GIv2 SCREEN POS
	this.textureFB_GIv2_screenPos = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER GIv2 SCREEN POS TEMP
	this.textureFB_GIv2_screenPosTEMP = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPosTEMP); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER GIv2 SCREEN NORMAL
	this.textureFB_GIv2_screenNormal = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER GIv2 SCREEN NORMAL TEMP
	this.textureFB_GIv2_screenNormalTEMP = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormalTEMP); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER GI VOXEL
	this.textureFB_GIVoxel = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER GI VOXEL TEMP
	this.textureFB_GIVoxel_TEMP = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel_TEMP); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);	
	// TEXTURE FRAMEBUFFER RGB NORMALS & ALPHA CAMERA DEPTH
	this.textureFB_Normals = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_Normals);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER DOF
	this.textureObject_DOF = this.gl.createTexture();	
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureObject_DOF);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER LIGHT SUN DEPTH
	this.textureFB_LightSun = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSun);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxViewportWidth, this.maxViewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER LIGHT SPOTS DEPTH
	this.textureFB_LightSpot = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSpot);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	// TEXTURE FRAMEBUFFER SUM LIGHT
	this.textureFB_Shadows = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_Shadows);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	//this.prepareTexturesFB();
	
	this.textureRandom = this.gl.createTexture();
	this.imageElementNoise = new Image();
	this.imageElementNoise.onload = function() {		
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.textureRandom);
		stormEngineC.stormGLContext.gl.texImage2D(stormEngineC.stormGLContext.gl.TEXTURE_2D, 0, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.UNSIGNED_BYTE, stormEngineC.stormGLContext.imageElementNoise);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MAG_FILTER, stormEngineC.stormGLContext.gl.NEAREST);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MIN_FILTER, stormEngineC.stormGLContext.gl.NEAREST);	
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_WRAP_S, stormEngineC.stormGLContext.gl.MIRRORED_REPEAT);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_WRAP_T, stormEngineC.stormGLContext.gl.MIRRORED_REPEAT);			
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, null);
		
		var e = document.createElement('canvas');
		e.width = 32;
		e.height = 32;
		var ctx2DTEX_noise = e.getContext("2d");		
		ctx2DTEX_noise.drawImage(stormEngineC.stormGLContext.imageElementNoise, 0, 0);
		stormEngineC.stormGLContext.arrayTEX_noise = ctx2DTEX_noise.getImageData(0, 0, 32, 32);
	};
	this.imageElementNoise.src = stormEngineCDirectory+'/resources/noise32x32.jpg';
	
	this.environmentMap = this.gl.createTexture();
	this.imageElementReflection = new Image();
	this.imageElementReflection.onload = function() {		
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.environmentMap);
		stormEngineC.stormGLContext.gl.texImage2D(stormEngineC.stormGLContext.gl.TEXTURE_2D, 0, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.UNSIGNED_BYTE, stormEngineC.stormGLContext.imageElementReflection);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MAG_FILTER, stormEngineC.stormGLContext.gl.LINEAR);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MIN_FILTER, stormEngineC.stormGLContext.gl.LINEAR);	
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_WRAP_S, stormEngineC.stormGLContext.gl.CLAMP_TO_EDGE);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_WRAP_T, stormEngineC.stormGLContext.gl.CLAMP_TO_EDGE);			
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, null);
	};
	this.imageElementReflection.src = stormEngineCDirectory+'/resources/landscape.jpg'; 
	
	
	// INITIAL WEBGL VALUES
	this.gl.clearColor(this.ambientColor.e[0], this.ambientColor.e[1], this.ambientColor.e[2], 1.0);
	this.gl.clearDepth(1.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.depthFunc(this.gl.LEQUAL);
};
/**
 * @private 
 */
StormGLContext.prototype.updateInfoElements = function() {
	$('#stormCanvasPUB').attr('width',$('#'+this.stormCanvasObject.id).width()+'px');
	$('#stormCanvasPUB').css({
		'left':$('#'+this.stormCanvasObject.id).offset().left,
		'top':$('#'+this.stormCanvasObject.id).offset().top
	}); 
	
	$('#stormCanvasStatus').attr('width',$('#'+this.stormCanvasObject.id).width()+'px');
	$('#stormCanvasStatus').css({
		'left':$('#'+this.stormCanvasObject.id).offset().left,
		'top':$('#'+this.stormCanvasObject.id).offset().top
	}); 
	
	$('#stormDIVInfos').css({
		'width':$('#'+this.stormCanvasObject.id).width()+'px',
		'left':$('#'+this.stormCanvasObject.id).offset().left,
		'top':$('#'+this.stormCanvasObject.id).offset().top
	}); 
};
/**
 * @private 
 */
StormGLContext.prototype.updateTexturesFB = function() {
	/* ================================================================================================================ */
	/*												TEXTURES FOR FRAMEBUFFERS 											*/
	/* ================================================================================================================ */
	// TEXTURE FRAMEBUFFER GIv2 SCREEN POS
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	// TEXTURE FRAMEBUFFER GIv2 SCREEN POS TEMP
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPosTEMP); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	// TEXTURE FRAMEBUFFER GIv2 SCREEN NORMAL
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	// TEXTURE FRAMEBUFFER GIv2 SCREEN NORMAL TEMP
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormalTEMP); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	// TEXTURE FRAMEBUFFER GI VOXEL
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	// TEXTURE FRAMEBUFFER GI VOXEL TEMP
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel_TEMP); 
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth,this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
	
	// TEXTURE FRAMEBUFFER RGB NORMALS & ALPHA CAMERA DEPTH
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_Normals);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
    
	// TEXTURE FRAMEBUFFER DOF
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureObject_DOF);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
    
	// TEXTURE FRAMEBUFFER LIGHT SUN DEPTH
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSun);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.maxViewportWidth, this.maxViewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
    
	// TEXTURE FRAMEBUFFER LIGHT SPOTS DEPTH
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSpot);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
    
	// TEXTURE FRAMEBUFFER SUM LIGHT
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_Shadows);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.FLOAT, null);
    
	
	/* ================================================================================================================ */
	/*												FRAMEBUFFERS														*/
	/* ================================================================================================================ */
    // FRAMEBUFFER FOR BACKGROUND OPERATIONS
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	// FRAMEBUFFER LIGHT SUN
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBufferLightSun);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.maxViewportWidth, this.maxViewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	// FRAMEBUFFER LIGHTS SPOTS
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBufferLightSpot);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
};
/**
 * @private 
 */
StormGLContext.prototype.nextStackShaders = function() {
	var stormgl = stormEngineC.stormGLContext;
	stormgl.stackShadersRunning = true;
	if(stormgl.stackShaders.length > 0) {
		stormEngineC.setStatus({id:'SHADER_'+stormgl.stackShaders[0].name,
								str:'GENERATING SHADER '+stormgl.stackShaders[0].name+'...'});
		stormgl.stackShaders[0].funct();
		stormgl.stackShaders.shift();
	} else stormgl.stackShadersRunning = false;
};
/**
 * @private 
 */
StormGLContext.prototype.addToStackShaders = function(name, funct) {
	var stormgl = stormEngineC.stormGLContext;
	stormgl.stackShaders.push({'name':name,'funct':funct});
	if(stormgl.stackShadersRunning == false) stormgl.nextStackShaders(); 
};
/**
 * @private 
 */
StormGLContext.prototype.createShader = function(gl, name, sourceVertex, sourceFragment, shaderProgram, functionInitShaderPointers) { 
	var _sv = false, _sf = false;
	
	// SV
	var shaderVertex = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(shaderVertex, sourceVertex);
	gl.compileShader(shaderVertex);
	if (!gl.getShaderParameter(shaderVertex, gl.COMPILE_STATUS)) {
		alert('Error sourceVertex of shader '+name+'. See console.');
		var infoLog = gl.getShaderInfoLog(shaderVertex);
		console.log('Error vertex-shader '+name+':\n '+infoLog);
		if(infoLog != undefined) {
			console.log(infoLog);
			var arrErrors = [];
			var errors = infoLog.split("\n");
			for(var n = 0, f = errors.length; n < f; n++) {
				if(errors[n].match(/^ERROR/gim) != null) {
					var expl = errors[n].split(':');
					var line = parseInt(expl[2]);
					arrErrors.push([line,errors[n]]);
				}
			}
			var sour = gl.getShaderSource(shaderVertex).split("\n");
			sour.unshift("");
			for(var n = 0, f = sour.length; n < f; n++) {
				var lineWithError = false;
				var errorStr = '';
				for(var e = 0, fe = arrErrors.length; e < fe; e++) {
					if(n == arrErrors[e][0]) {
						lineWithError = true;
						errorStr = arrErrors[e][1];
						break;
					}
				}
				if(lineWithError == false) {
					console.log(n+' '+sour[n]);
				} else {
					console.log('►►'+n+' '+sour[n]+'\n'+errorStr);
				}
			}
		}
	} else  {
		gl.attachShader(shaderProgram, shaderVertex);
		_sv = true;
	}
	if(this._SHOW_ANGLE_HLSL_SOURCE && gl.getExtension("WEBGL_debug_shaders")) {
		var hlsl = gl.getExtension("WEBGL_debug_shaders").getTranslatedShaderSource(shaderVertex);
		console.log('ANGLE HLSL vertex-shader '+name+':', hlsl);
	}
	
	// SF
	var shaderFragment = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(shaderFragment, sourceFragment);
	gl.compileShader(shaderFragment);
	if (!gl.getShaderParameter(shaderFragment, gl.COMPILE_STATUS)) {
		alert('Error sourceFragment of shader '+name+'. See console.');
		var infoLog = gl.getShaderInfoLog(shaderFragment);
		console.log('Error fragment-shader '+name+':\n '+infoLog);
		if(infoLog != undefined) {
			console.log(infoLog);
			var arrErrors = [];
			var errors = infoLog.split("\n");
			for(var n = 0, f = errors.length; n < f; n++) {
				if(errors[n].match(/^ERROR/gim) != null) {
					var expl = errors[n].split(':');
					var line = parseInt(expl[2]);
					arrErrors.push([line,errors[n]]);
				}
			}
			var sour = gl.getShaderSource(shaderFragment).split("\n");
			sour.unshift("");
			for(var n = 0, f = sour.length; n < f; n++) {
				var lineWithError = false;
				var errorStr = '';
				for(var e = 0, fe = arrErrors.length; e < fe; e++) {
					if(n == arrErrors[e][0]) {
						lineWithError = true;
						errorStr = arrErrors[e][1];
						break;
					}
				}
				if(lineWithError == false) {
					console.log(n+' '+sour[n]);
				} else {
					console.log('►►'+n+' '+sour[n]+'\n'+errorStr);
				}
			}
		}
	} else {
		gl.attachShader(shaderProgram, shaderFragment);	
		_sf = true;
	}
	if(this._SHOW_ANGLE_HLSL_SOURCE && gl.getExtension("WEBGL_debug_shaders")) {
		var hlsl = gl.getExtension("WEBGL_debug_shaders").getTranslatedShaderSource(shaderFragment);
		console.log('ANGLE HLSL fragment-shader '+name+':', hlsl);
	}
	
	//PROGRAM
	if(_sv == true && _sf == true) {
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			alert('Error in shader '+name);
			console.log('Error shader program '+name+':\n ');
			if(gl.getProgramInfoLog(shaderProgram) != undefined) {
				console.log(gl.getProgramInfoLog(shaderProgram));
			} 
		} else {
			if(functionInitShaderPointers != undefined) functionInitShaderPointers();
			
		}
	}
	setTimeout(function(){
					stormEngineC.setStatus({id:'SHADER_'+name,   
											str:''});
					stormEngineC.stormGLContext.nextStackShaders();
				},1);
}
/**
 * @private 
 */
StormGLContext.prototype.renderGLContext = function() {
	this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
	if(this.Shader_Pick_READY) {
		this.queryNodePick();
	} 
	if(this.Shader_GIv2_READY == true && this.GIv2enable == true) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
		this.gl.clearColor(1.0,1.0,1.0, 1.0);
		
		if(this.sampleGiVoxels == 0 && this.GIstopOncameramove == true) { // clear the static 
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIVoxel, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  
		} else {
			if(this.sampleGiVoxels == 0) {// clear the static
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos, 0);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal, 0);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  
				this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIVoxel, 0);
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);  
			}
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPosTEMP, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.gl.useProgram(this.shader_GIv2);
			this.gl.uniform1i(this.u_GIv2_typePass, 0);// position
			this.render_GIv2();
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormalTEMP, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.gl.useProgram(this.shader_GIv2);      
			this.gl.uniform1i(this.u_GIv2_typePass, 1);// normal
			this.render_GIv2(); 
			
			stormEngineC.clgl.copy(this.textureFB_GIv2_screenPosTEMP, this.textureFB_GIv2_screenPos);  
			stormEngineC.clgl.copy(this.textureFB_GIv2_screenNormalTEMP, this.textureFB_GIv2_screenNormal);  
			
			this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_GIVoxel_TEMP, 0);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
			this.render_GIv2Exec();  
			
			stormEngineC.clgl.copy(this.textureFB_GIVoxel_TEMP, this.textureFB_GIVoxel);  
		}
	}
	if(this.Shader_Normals_READY) {
		this.render_Normals();
		if(this.view_Normals) return;
	}
	if(	this.Shader_LightDepth_READY &&
		this.Shader_LightDepthParticles_READY &&
		this.Shader_Shadows_READY &&
		this.shadowsEnable) {
			this.render_LightDepth();
			if(this.view_LightDepth || this.view_Shadows) return;
	}
	if(this.Shader_BG_READY && this.useEnvironment) {
		this.render_BG();
	}
    if(this.Shader_Scene_READY) {
		this.render_Scene();
		if(this.view_SceneNoDOF) return;
	}
	if(this.Shader_Lines_READY && this.lines.length > 0) {
		this.render_Lines();
	}
	if(this.Shader_ParticlesAux_READY && this.particles.length > 0) {
		this.render_ParticlesAux();
	}
	
	
	this.hitRectRegion_onclick(); 
	if(this.Shader_DOF_READY && stormEngineC.defaultCamera.DOFenable) {
		this.render_DOF(); 
	}
	if(this.Shader_Overlay_READY && stormEngineC.editMode) { 
		this.render_Overlay();
	}   
	this.hitRectRegion_onmouseover();
	this.hitRectRegion_onmouseout();
	if(this.Shader_Ctx2D_READY) {
		this.render_Ctx2D();
	}
};







/** @private  */
StormGLContext.prototype.hitRectRegion_onclick = function() {
	if(stormEngineC.arrHitsRectRegions.length > 0) {
		this.arrHitsRectRegions = stormEngineC.arrHitsRectRegions;
		for(var n = 0, f = this.arrHitsRectRegions.length; n < f; n++) {
			if(this.arrHitsRectRegions[n].onclick != undefined) {
				if(	stormEngineC.mousePosX > (this.arrHitsRectRegions[n].x) &&
					stormEngineC.mousePosX < (this.arrHitsRectRegions[n].x+this.arrHitsRectRegions[n].width) &&
					stormEngineC.mousePosY > (this.arrHitsRectRegions[n].y) &&
					stormEngineC.mousePosY < (this.arrHitsRectRegions[n].y+this.arrHitsRectRegions[n].height) &&
					stormEngineC.isMouseDown	) {
					this.arrHitsRectRegions[n].onclick();
				}
			}
		}
	}
};
/** @private  */
StormGLContext.prototype.hitRectRegion_onmouseover = function() {
	if(stormEngineC.arrHitsRectRegions.length > 0) {
		this.arrHitsRectRegions = stormEngineC.arrHitsRectRegions;
		for(var n = 0, f = this.arrHitsRectRegions.length; n < f; n++) {
			if(	(stormEngineC.mousePosX > (this.arrHitsRectRegions[n].x) &&
				stormEngineC.mousePosX < (this.arrHitsRectRegions[n].x+this.arrHitsRectRegions[n].width) &&
				stormEngineC.mousePosY > (this.arrHitsRectRegions[n].y) &&
				stormEngineC.mousePosY < (this.arrHitsRectRegions[n].y+this.arrHitsRectRegions[n].height)) &&
				this.arrHitsRectRegions[n]._over == false) {
					this.arrHitsRectRegions[n]._over = true;
					if(this.arrHitsRectRegions[n].onmouseover != undefined)	this.arrHitsRectRegions[n].onmouseover();
			}
		}
	}
};
/** @private  */
StormGLContext.prototype.hitRectRegion_onmouseout = function() {
	if(stormEngineC.arrHitsRectRegions.length > 0) {
		this.arrHitsRectRegions = stormEngineC.arrHitsRectRegions;
		for(var n = 0, f = this.arrHitsRectRegions.length; n < f; n++) {
			if(	(stormEngineC.mousePosX < (this.arrHitsRectRegions[n].x) ||
				stormEngineC.mousePosX > (this.arrHitsRectRegions[n].x+this.arrHitsRectRegions[n].width) ||
				stormEngineC.mousePosY < (this.arrHitsRectRegions[n].y) ||
				stormEngineC.mousePosY > (this.arrHitsRectRegions[n].y+this.arrHitsRectRegions[n].height)) &&
				this.arrHitsRectRegions[n]._over == true) {
					this.arrHitsRectRegions[n]._over = false;
					if(this.arrHitsRectRegions[n].onmouseout != undefined) this.arrHitsRectRegions[n].onmouseout();
			}
		}
	}
};

/**
* Change the draw mode for the entire scene
* @type Void
* @param {Int} [mode=4] 0=POINTS, 3=LINE_STRIP, 2=LINE_LOOP, 1=LINES, 5=TRIANGLE_STRIP, 6=TRIANGLE_FAN and 4=TRIANGLES
*/
StormGLContext.prototype.drawElementsMode = function(mode) {
	for(var n = 0, f = this.nodes.length; n < f; n++) for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) this.nodes[n].buffersObjects[nb].drawElementsMode = mode;
};

//Change the glow size for particles
//@type Void
//@param {Float} [glowSize=0.5]
/** @private  */
StormGLContext.prototype.setGlowSize = function(glowSize) {
	this.glowSize = glowSize;
};

/** @private  */
StormGLContext.prototype.setWebGLEnvironmentMap = function(fileURL) {
	this.imageElementReflection = new Image();
	this.imageElementReflection.onload = function() {		
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.environmentMap);
		stormEngineC.stormGLContext.gl.texImage2D(stormEngineC.stormGLContext.gl.TEXTURE_2D, 0, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.UNSIGNED_BYTE, stormEngineC.stormGLContext.imageElementReflection);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MAG_FILTER, stormEngineC.stormGLContext.gl.LINEAR);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MIN_FILTER, stormEngineC.stormGLContext.gl.LINEAR);	
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_WRAP_S, stormEngineC.stormGLContext.gl.CLAMP_TO_EDGE);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_WRAP_T, stormEngineC.stormGLContext.gl.CLAMP_TO_EDGE);			
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, null);
	};
	this.imageElementReflection.src = fileURL;
};