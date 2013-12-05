/*
StormEngineC. 3D Engine Javascript.
Copyright (C) 2010 Roberto Gonzalez. Stormcolor.com.

This file is part of StormEngineC.

StormEngineC is free software; you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

StormEngineC is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with StormEngineC; If not, see <http://www.gnu.org/licenses/>.
 */

StormGLContext = function(DIVIDcanvas, loadScene) {
	this.stormCanvasObject = document.getElementById(DIVIDcanvas);
	try {
		this.gl = this.stormCanvasObject.getContext("experimental-webgl");
	} catch(e) {
    }
	if(!this.gl) {
		alert('Tu navegador no soporta WebGL. Descarga <a href="http://www.mozilla.com/">Firefox</a> o <a href="http://www.google.es/chrome">Chrome</a>');
	}
	
	this.viewportWidth = this.stormCanvasObject.width;
	this.viewportHeight = this.stormCanvasObject.height;
	
	if(loadScene == undefined) {
		// div status
		this.divStatus = document.createElement("div");
		this.divStatus.style.position = 'absolute';
		this.divStatus.style.width = this.viewportWidth+'px';
		this.divStatus.style.marginTop = (this.viewportHeight/2)+'px';
		this.divStatus.style.top = "0px";
		this.divStatus.style.textAlign = "center";
		this.divStatus.style.fontSize = "13px";
		this.divStatus.style.fontWeight = "bold";
		this.divStatus.style.color = "#FFF";
		this.divStatus.style.textShadow = "rgb(0, 0, 0) 0px 0px 22px";
		this.stormCanvasObject.parentNode.appendChild(this.divStatus);
		
		// div debug
		this.divDebug = document.createElement("div");
		this.divDebug.style.position = "absolute";
		this.divDebug.style.width = this.viewportWidth+'px';
		this.divDebug.style.marginTop = ((this.viewportHeight/2)+50)+'px';
		this.divDebug.style.top = "0px";
		this.divDebug.style.textAlign = "left";
		this.divDebug.style.fontSize = "13px";
		this.divDebug.style.background = "#FFF";
		this.divDebug.style.color = "#000";
		this.stormCanvasObject.parentNode.appendChild(this.divDebug);
	}	
	
	
	this.nodes = stormEngineC.nodes;
	this.nodesCam = stormEngineC.nodesCam;
	this.lines = stormEngineC.lines;
	this.linesRemovables = stormEngineC.linesRemovables;
	this.lights = stormEngineC.lights;
	
	this.nodeViewportCamera; // nodo camara para viewport
	
	this.mPMatrix;
	this.mPOrthoMatrix;
	this.ambientColor = $V3([0.7, 0.75, 0.8]);
	
	
	

		
		

	
	// inicializamos algunos valores en el contexto
	// VALORES CONTEXTO
	this.gl.clearColor(this.ambientColor.e[0], this.ambientColor.e[1], this.ambientColor.e[2], 1.0);
	this.gl.clearDepth(1.0);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.depthFunc(this.gl.LEQUAL);
	
	//QUAD SSAO
	this.SSAOenable = true;
	this.SSAOlevel = 3.2;
	
	
	// texture noise para SSAO
	this.textureRandom = this.gl.createTexture();
	this.imageElementNoise = new Image();
	this.imageElementNoise.textureObj = this.textureRandom;
	this.imageElementNoise.onload = function() {		
		stormEngineC.stormGLContext.gl.bindTexture(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.imageElementNoise.textureObj);
		stormEngineC.stormGLContext.gl.texImage2D(stormEngineC.stormGLContext.gl.TEXTURE_2D, 0, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.RGBA, stormEngineC.stormGLContext.gl.UNSIGNED_BYTE, stormEngineC.stormGLContext.imageElementNoise);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MAG_FILTER, stormEngineC.stormGLContext.gl.LINEAR);
		stormEngineC.stormGLContext.gl.texParameteri(stormEngineC.stormGLContext.gl.TEXTURE_2D, stormEngineC.stormGLContext.gl.TEXTURE_MIN_FILTER, stormEngineC.stormGLContext.gl.LINEAR);	
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
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	
	
	// creamos framebuffer
	/*
		  			RGB										A
	RT0		NORMALS 							DEPTH
	 */
	this.textureRT0 = this.gl.createTexture(); // RT0 rgb normals a zdepth
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	//this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    //this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
    
	this.textureRT1 = this.gl.createTexture(); // RT1 rgba zdepth luz[0]
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT1);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	
	this.textureRT2 = this.gl.createTexture(); // RT2 rgba zdepth camara
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT2);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	
	this.textureRTShadowLayer = this.gl.createTexture(); // RTShadowLayer 
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRTShadowLayer);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
	
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    
    
	this.rBuffer = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	this.fBuffer = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rBuffer);
	
	
	this.rBufferB = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBufferB);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.viewportWidth, this.viewportHeight);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	this.fBufferB = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBufferB);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rBufferB);
	
    /*if (!this.gl.isFramebuffer(this.fBuffer)) {
        alert("Invalid framebuffer");
    }
    var status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
    if(status == this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT)
    	alert("FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
    if(status == this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT)
    	alert("FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
    if(status == this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS)
    	alert("FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
    if(status == this.gl.FRAMEBUFFER_UNSUPPORTED)
    	alert("FRAMEBUFFER_UNSUPPORTED");*/
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	
	
	
	
};
StormGLContext.prototype.initShader = function() {
	this.initShaderRT0();
	this.initShaderShadows();
	this.initShaderRGBADepth();
	this.initShaderShadowLayer();
	this.initShaderManager();
	this.initShaderLines();
};
StormGLContext.prototype.renderGLContext = function() {
	this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
	this.setPerspective(45,  this.viewportWidth / this.viewportHeight, 0.1, 100.0);
	
	this.renderRT0();
	this.renderShadows();
	this.renderRGBADepth();
	//this.renderShadowLayer();
    this.renderSene();
	this.renderLines();
	this.renderLinesRemovables();
};
/*----------------------------------------------------------------------------------------
										CREATE SHADER PROGRAMS
----------------------------------------------------------------------------------------*/
StormGLContext.prototype.createShader = function(sourceVertex, sourceFragment, shaderProgram) {
	var shaderVertex = this.gl.createShader(this.gl.VERTEX_SHADER);
	this.gl.shaderSource(shaderVertex, sourceVertex);
	this.gl.compileShader(shaderVertex);
	if (!this.gl.getShaderParameter(shaderVertex, this.gl.COMPILE_STATUS)) alert('Error sourceVertex of \n'+shaderProgram);
	
	var shaderFragment = this.gl.createShader(this.gl.FRAGMENT_SHADER);
	this.gl.shaderSource(shaderFragment, sourceFragment);
	this.gl.compileShader(shaderFragment);
	if (!this.gl.getShaderParameter(shaderFragment, this.gl.COMPILE_STATUS)) alert('Error sourceFragment of \n'+shaderProgram);
	
		
	this.gl.attachShader(shaderProgram, shaderVertex);
	this.gl.attachShader(shaderProgram, shaderFragment);	
	this.gl.linkProgram(shaderProgram);
	if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) alert('Error \n'+shaderProgram);
}


/*----------------------------------------------------------------------------------------
     									RT0 - RGB NORMALS A ZDEPTH
----------------------------------------------------------------------------------------*/
StormGLContext.prototype.initShaderRT0 = function() {
	var sourceVertex001 = 	'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexNormal;\n'+
		
		'uniform float uZDepth;\n'+
		
		'uniform mat4 uWVMatrix;\n'+
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying float vZDepth;\n'+
			
		'void main(void) {\n'+
			'gl_Position = uPMatrix * uWVMatrix * vec4(aVertexPosition, 1.0);\n'+
			
			'vNormal = vec4(aVertexNormal, 1.0);\n'+
			'vZDepth = gl_Position.z / uZDepth;\n'+
		'}';
	var sourceFragment001 = '#ifdef GL_ES\n\n'+
		'precision highp float;\n\n'+
		'#endif\n\n'+
		
		'varying vec4 vNormal;\n'+
		'varying float vZDepth;\n'+
		
		'void main(void) {\n'+
			'float lej = 1.+vZDepth;\n'+

				'gl_FragColor = vec4(vec3(abs(vNormal.r), abs(vNormal.g), abs(vNormal.b)), vZDepth);\n'+
		'}';
	this.shaderProgramRT0 = this.gl.createProgram();
	this.createShader(sourceVertex001, sourceFragment001, this.shaderProgramRT0);
	
	
		
	this.attributeVertexPositionRT0 = this.gl.getAttribLocation(this.shaderProgramRT0, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.attributeVertexPositionRT0);
	this.attributeVertexNormalRT0 = this.gl.getAttribLocation(this.shaderProgramRT0, "aVertexNormal");
	this.gl.enableVertexAttribArray(this.attributeVertexNormalRT0);
	
	this.uniformZDepthRT0 = this.gl.getUniformLocation(this.shaderProgramRT0, "uZDepth");
	
	this.uniformPMatrixRT0 = this.gl.getUniformLocation(this.shaderProgramRT0, "uPMatrix");
	this.uniformWVMatrixRT0 = this.gl.getUniformLocation(this.shaderProgramRT0, "uWVMatrix");
	this.uniformWMatrixRT0 = this.gl.getUniformLocation(this.shaderProgramRT0, "uWMatrix");
};
StormGLContext.prototype.renderRT0 = function() {
	//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureRT0, 0);
	this.gl.clearColor(this.ambientColor.e[0], this.ambientColor.e[1], this.ambientColor.e[2], 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.gl.useProgram(this.shaderProgramRT0);
	
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {	
			this.gl.uniform1f(this.uniformZDepthRT0, 100.0);
			this.gl.uniformMatrix4fv(this.uniformPMatrixRT0, false, this.mPMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWVMatrixRT0, false, this.nodes[n].mWVMatrixFrame.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWMatrixRT0, false, this.nodes[n].mWMatrixFrame.transpose().e);
			
			
		
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attributeVertexPositionRT0, 3, this.gl.FLOAT, false, 0, 0);
				
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshNormalBuffer);
			this.gl.vertexAttribPointer(this.attributeVertexNormalRT0, 3, this.gl.FLOAT, false, 0, 0);
				
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
			
			
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
		}
	}
	/*this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	this.gl.generateMipmap(this.gl.TEXTURE_2D);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);*/
};

/*----------------------------------------------------------------------------------------
     									RT1 - RGBA ZDEPTH LIGHT[0]
----------------------------------------------------------------------------------------*/
StormGLContext.prototype.initShaderShadows = function() {
	var sourceVertex001 = 	'attribute vec3 aVertexPosition;\n'+
		'attribute vec2 aTextureCoord;\n'+
		
		
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uWLight;\n'+
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 uPOrthoMatrix;\n'+
		
		'uniform int uLightType;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying vec4 vposition;\n'+
		'varying vec2 vTextureCoord;\n'+
		
		'void main(void) {\n'+
			'if(uLightType == 0) {\n'+ // sun
				'vposition = uPOrthoMatrix * uWLight * uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'} else {;\n'+ // spot
				'vposition = uPMatrix * uWLight * uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'}\n'+
			'vposition = vec4(vposition.xyz / vposition.w,1.0);\n'+
			'gl_Position = vposition;\n'+
			'vTextureCoord = aTextureCoord;\n'+
			
		'}';
	var sourceFragment001 = '#ifdef GL_ES\n\n'+
		'precision highp float;\n\n'+
		'#endif\n\n'+
		
		'uniform sampler2D uSampler;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying vec4 vposition;\n'+
		'varying vec2 vTextureCoord;\n'+
		
		'void main(void) {\n'+
			
			'float textureAlpha = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)).a;\n'+
			
			'vec4 color;\n'+
			'float depth;\n'+
			'vec3 q = vposition.xyz;\n'+
			
			'if(textureAlpha == 0.0) {\n'+
				'depth = 0.5*(0.0 + 1.0);\n'+
			'} else {\n'+
				'depth = 0.5*(vposition.z + 1.0);\n'+
			'}\n'+
			
			'color.r = fract(16777216.0 * depth);\n'+
			'color.g = fract(65536.0 * depth);\n'+
			'color.b = fract(256.0 * depth);\n'+
			'color.a = depth;\n'+
				
			'gl_FragColor = color;\n'+
			
		'}';
	this.shaderProgramRT1 = this.gl.createProgram();
	this.createShader(sourceVertex001, sourceFragment001, this.shaderProgramRT1);
	
	
	
	this.samplerUniformRT1 = this.gl.getUniformLocation(this.shaderProgramRT1, "uSampler");
		
	this.attributeVertexPositionRT1 = this.gl.getAttribLocation(this.shaderProgramRT1, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.attributeVertexPositionRT1);
	this.textureCoordAttributeRT1 = this.gl.getAttribLocation(this.shaderProgramRT1, "aTextureCoord");
	this.gl.enableVertexAttribArray(this.textureCoordAttributeRT1);
	
	this.uniformLightTypeRT1 = this.gl.getUniformLocation(this.shaderProgramRT1, "uLightType");
	
	this.uniformPMatrixRT1 = this.gl.getUniformLocation(this.shaderProgramRT1, "uPMatrix");
	this.uniformPOrthoMatrixRT1 = this.gl.getUniformLocation(this.shaderProgramRT1, "uPOrthoMatrix");
	this.uniformWLightRT1 = this.gl.getUniformLocation(this.shaderProgramRT1, "uWLight");
	this.uniformWMatrixRT1 = this.gl.getUniformLocation(this.shaderProgramRT1, "uWMatrix");
};
StormGLContext.prototype.renderShadows = function() {
	//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBufferB);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureRTShadowLayer, 0);
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	for(var nL = 0; nL < this.lights.length; nL++) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureRT1, 0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.useProgram(this.shaderProgramRT1);
		
		var light =  this.lights[nL];
		this.gl.uniform1i(this.uniformLightTypeRT1, (light.type == 'sun')?0:1); // sun 0 ; spot 1   (light.type == 'sun')?0:1
		
		var kdName;
		for(var n = 0; n < this.nodes.length; n++) {
			for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {	
				kdName = this.nodes[n].buffersObjects[nb].textureKdName;
				if(kdName != undefined && kdName.match(/.png$/gim) == null) {
					this.renderShadowsNow(this.nodes[n],this.nodes[n].buffersObjects[nb],light);
				}
			}
		}
		for(var n = 0; n < this.nodes.length; n++) {
			for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {	
				kdName = this.nodes[n].buffersObjects[nb].textureKdName;
				if(kdName != undefined && kdName.match(/.png$/gim) != null) {
					this.renderShadowsNow(this.nodes[n],this.nodes[n].buffersObjects[nb],light);
				}
			}
		}
		
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBufferB);
		
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureRTShadowLayer, 0);
		

		if(nL > 0) {
			this.gl.enable(this.gl.BLEND);
			this.gl.blendEquation(this.gl.FUNC_ADD);
			this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
		}
		this.gl.useProgram(this.shaderProgramShadowLayer);
		this.renderShadowLayer(light);
		if(nL > 0) {
			this.gl.disable(this.gl.BLEND);
		}
		
	}
	
	
	/*this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	this.gl.generateMipmap(this.gl.TEXTURE_2D);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);*/
};
StormGLContext.prototype.renderShadowsNow = function(node, buffersObject, light) {
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, buffersObject.textureObjectKd);
	this.gl.uniform1i(this.samplerUniformRT1, 0);

	this.gl.uniformMatrix4fv(this.uniformPMatrixRT1, false, this.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.uniformPOrthoMatrixRT1, false, this.mPOrthoMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.uniformWLightRT1, false, light.mWMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.uniformWMatrixRT1, false, node.mWMatrixFrame.transpose().e);
	
	

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBuffer);
	this.gl.vertexAttribPointer(this.attributeVertexPositionRT1, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshTextureBuffer);
	this.gl.vertexAttribPointer(this.textureCoordAttributeRT1, 3, this.gl.FLOAT, false, 0, 0);
		
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffersObject.nodeMeshIndexBuffer);
	
	
	
	this.gl.drawElements(this.gl.TRIANGLES, buffersObject.nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
};

/*----------------------------------------------------------------------------------------
     									RT2 - RGBA ZDEPTH CAMERA
----------------------------------------------------------------------------------------*/
StormGLContext.prototype.initShaderRGBADepth = function() {
	var sourceVertex001 = 	'attribute vec3 aVertexPosition;\n'+
		
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uWCamera;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'varying vec4 vposition;\n'+
		
		'void main(void) {\n'+
			'gl_Position = uPMatrix * uWCamera * uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			
			'vposition = uPMatrix * uWCamera * uWMatrix * vec4(aVertexPosition, 1.0);\n'+
		'}';
	var sourceFragment001 = '#ifdef GL_ES\n\n'+
		'precision highp float;\n\n'+
		'#endif\n\n'+
		
		'varying vec4 vposition;\n'+
		
		'void main(void) {\n'+
				'vec4 color;\n'+
				'vec3 q = vposition.xyz / vposition.w;\n'+
				'float depth = 0.5*(q.z + 1.0);\n'+
				'color.r = fract(16777216.0 * depth);\n'+
				'color.g = fract(65536.0 * depth);\n'+
				'color.b = fract(256.0 * depth);\n'+
				'color.a = depth;\n'+
	
				'gl_FragColor = color;\n'+
		'}';
	this.shaderProgramRGBADepth = this.gl.createProgram();
	this.createShader(sourceVertex001, sourceFragment001, this.shaderProgramRGBADepth);
	
	
		
	this.attributeVertexPositionRGBADepth = this.gl.getAttribLocation(this.shaderProgramRGBADepth, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.attributeVertexPositionRGBADepth);
	
	this.uniformPMatrixRGBADepth = this.gl.getUniformLocation(this.shaderProgramRGBADepth, "uPMatrix");
	this.uniformWCameraRGBADepth = this.gl.getUniformLocation(this.shaderProgramRGBADepth, "uWCamera");
	this.uniformWMatrixRGBADepth = this.gl.getUniformLocation(this.shaderProgramRGBADepth, "uWMatrix");
};
StormGLContext.prototype.renderRGBADepth = function() {
	//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureRT2, 0);
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.gl.useProgram(this.shaderProgramRGBADepth);
	
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {	
			this.gl.uniform1f(this.uniformZDepthRT1, 100.0);
			this.gl.uniformMatrix4fv(this.uniformPMatrixRGBADepth, false, this.mPMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWCameraRGBADepth, false, this.nodeViewportCamera.mWMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWMatrixRGBADepth, false, this.nodes[n].mWMatrixFrame.transpose().e);
			
			
		
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.attributeVertexPositionRGBADepth, 3, this.gl.FLOAT, false, 0, 0);
				
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
			
			
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
		}
	}
	/*this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	this.gl.generateMipmap(this.gl.TEXTURE_2D);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);*/
};


/*----------------------------------------------------------------------------------------
									RENDER SHADOW LAYER
----------------------------------------------------------------------------------------*/
StormGLContext.prototype.initShaderShadowLayer = function() {
	var sourceVertex001 = 	'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexNormal;\n'+
		'attribute vec2 aTextureCoord;\n'+
		
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uVMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 uPOrthoMatrix;\n'+
		'uniform mat4 uWNMatrix;\n'+
		'uniform mat4 uWVNMatrix;\n'+
		
		'uniform int uLightType;\n'+
		
		'varying vec2 vTextureCoord;\n'+
		'varying vec4 vposition;\n'+
		'varying vec4 vLightCoord;\n'+
		'uniform mat4 uWLight;\n'+
		
		'varying vec4 vWNMatrix;\n'+
		'varying vec4 vWVNMatrix;\n'+
		'varying vec4 vWPos;\n'+
			
		'void main(void) {\n'+
			'vWPos = uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'vposition = uPMatrix * uVMatrix* uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'gl_Position = vposition;\n'+
			'vTextureCoord = aTextureCoord;\n'+
			'if(uLightType == 0) {\n'+ // sun
				'vLightCoord = uPOrthoMatrix * uWLight* uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'} else {;\n'+ // spot
				'vLightCoord = uPMatrix * uWLight* uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'}\n'+
			
			'vWNMatrix = uWNMatrix * vec4(aVertexNormal, 1.0);\n'+
			'vWVNMatrix = uWVNMatrix * vec4(aVertexNormal, 1.0);\n'+
		'}';
	var sourceFragment001 = '#ifdef GL_ES\n\n'+
		'precision highp float;\n\n'+
		'#endif\n\n'+
		
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uVMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 uWNMatrix;\n'+
		'uniform mat4 uWVNMatrix;\n'+
		
		'uniform vec3 uWPosLight;\n'+
		
		
		'uniform vec3 uLightDirection;\n'+
		

		'uniform sampler2D uSamplerShadow;\n'+// RT1 rgba zdepth light[0]
		
		'uniform int uUseLight;\n'+
		'uniform int uLightType;\n'+
		'uniform vec3 uLightColor;\n'+
		
		'varying vec2 vTextureCoord;\n'+
		'varying vec4 vposition;\n'+
		'varying vec4 vLightCoord;\n'+
		'varying vec4 vWNMatrix;\n'+
		'varying vec4 vWVNMatrix;\n'+
		'varying vec4 vWPos;\n'+
		
		'void main(void) {\n'+
			

			'vec4 AFragmentShadow;\n'+
			'float light;\n'+

					
					
			'if(uUseLight == 1) {\n'+
				'vec4 projCoords = vLightCoord;\n'+
				'projCoords = projCoords/projCoords.w;\n'+
				'projCoords = 0.5 * projCoords + 0.5;\n'+
				'float depth = projCoords.z;\n'+ // current pixel depth on light view
				
				'AFragmentShadow = texture2D(uSamplerShadow, projCoords.xy);\n'+
				'float distanceSamplerShadow = (AFragmentShadow.a + AFragmentShadow.b/256.0 + AFragmentShadow.g/65536.0 + AFragmentShadow.r/16777216.0)+0.0005;\n'+
				
				'light =  depth > distanceSamplerShadow ? 0.0 : 1.0;\n'+
				
				//'light =  depth >= distanceSamplerShadow ? 1.0-((depth-(depth-distanceSamplerShadow))/depth) : 1.0;\n'+ // <- menos sombra al alejarse
				
				'if(uLightType == 1) {\n'+ // spot
					'light *=  1.0-smoothstep(0.45, 0.5, length(projCoords.xy - vec2(0.5, 0.5)));\n'+
				'} else {\n'+
					'light *=  1.0-smoothstep(0.0, 0.5, length(projCoords.xy - vec2(0.5, 0.5)));\n'+
					'light +=  smoothstep(0.0, 0.5, length(projCoords.xy - vec2(0.5, 0.5)));\n'+
				'}\n'+
				
				'gl_FragColor = vec4(uLightColor*light, 1.0);\n'+
				
			'} else {\n'+
				'gl_FragColor = vec4(0.0,0.0,0.0,1.0);\n'+
			'}\n'+
		'}';
	this.shaderProgramShadowLayer = this.gl.createProgram();
	this.createShader(sourceVertex001, sourceFragment001, this.shaderProgramShadowLayer);
	
	
	

	this.uniformLightDirectionShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uLightDirection");
	

	this.uniformSamplerShadowShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uSamplerShadow");// RT1 rgba zdepth light[0]
	
	this.uniformUseLightShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uUseLight");
	this.uniformLightTypeShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uLightType");
	this.uniformLightColorShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uLightColor");
	

	this.vertexPositionAttributeShadowLayer = this.gl.getAttribLocation(this.shaderProgramShadowLayer, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.vertexPositionAttributeShadowLayer);
	this.vertexNormalAttributeShadowLayer = this.gl.getAttribLocation(this.shaderProgramShadowLayer, "aVertexNormal");
	this.gl.enableVertexAttribArray(this.vertexNormalAttributeShadowLayer);
	this.textureCoordAttributeShadowLayer = this.gl.getAttribLocation(this.shaderProgramShadowLayer, "aTextureCoord");
	this.gl.enableVertexAttribArray(this.textureCoordAttributeShadowLayer);

	
	this.uniformWMatrixShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uWMatrix");
	this.uniformVMatrixShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uVMatrix");
	this.uniformPMatrixShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uPMatrix");
	this.uniformPOrthoMatrixShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uPOrthoMatrix");
	this.uniformWNMatrixShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uWNMatrix");
	this.uniformWVNMatrixShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uWVNMatrix");
	
	this.uniformWPosLightShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uWPosLight");
	this.uniformWLightSShadowLayer = this.gl.getUniformLocation(this.shaderProgramShadowLayer, "uWLight");
};
StormGLContext.prototype.renderShadowLayer = function(currentLight) {
	
	var light =  currentLight;
	var adjustedLD = light.direction.normalize().x(-1.0);
	this.gl.uniform3f(this.uniformLightDirectionShadowLayer, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
	this.gl.uniform1i(this.uniformLightTypeShadowLayer, (light.type == 'sun')?0:1); // sun 0 ; spot 1   (light.type == 'sun')?0:1
	this.gl.uniform3f(this.uniformLightColorShadowLayer, light.color.e[0], light.color.e[1], light.color.e[2]);
    
    this.gl.uniform1i(this.uniformUseLightShadowLayer, 1);
	
	for(var n = 0; n < this.nodes.length; n++) {
	    for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {			
			this.gl.activeTexture(this.gl.TEXTURE0);
			this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT1); // RT1 rgba depth light[0]
			this.gl.uniform1i(this.uniformSamplerShadowShadowLayer, 0);
		

			
			this.gl.uniformMatrix4fv(this.uniformPMatrixShadowLayer, false, this.mPMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformPOrthoMatrixShadowLayer, false, this.mPOrthoMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWLightSShadowLayer, false, light.mWMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWMatrixShadowLayer, false, this.nodes[n].mWMatrixFrame.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformVMatrixShadowLayer, false, this.nodeViewportCamera.mWMatrix.transpose().e);
			this.gl.uniformMatrix4fv(this.uniformWNMatrixShadowLayer, false, this.nodes[n].mWMatrixFrame.inverse().e);
			this.gl.uniformMatrix4fv(this.uniformWVNMatrixShadowLayer, false, this.nodeViewportCamera.mWMatrix.x(this.nodes[n].mWMatrixFrame).inverse().e);
			
			this.gl.uniform3f(this.uniformWPosLightShadowLayer, light.getPosition().e[0], light.getPosition().e[1], light.getPosition().e[2]);
			
			
			
	    	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
			this.gl.vertexAttribPointer(this.vertexPositionAttributeShadowLayer, 3, this.gl.FLOAT, false, 0, 0);
				
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshNormalBuffer);
			this.gl.vertexAttribPointer(this.vertexNormalAttributeShadowLayer, 3, this.gl.FLOAT, false, 0, 0);

			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshTextureBuffer);
			this.gl.vertexAttribPointer(this.textureCoordAttributeShadowLayer, 3, this.gl.FLOAT, false, 0, 0);
			
			
	
			
			this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
			
			
			
			this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
	    }
	}
};


/*----------------------------------------------------------------------------------------
									RENDER ESCENE
----------------------------------------------------------------------------------------*/
StormGLContext.prototype.initShaderManager = function() {
	var sourceVertex001 = 	'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexNormal;\n'+
		'attribute vec2 aTextureCoord;\n'+
		
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uVMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 uPOrthoMatrix;\n'+
		'uniform mat4 uWNMatrix;\n'+
		'uniform mat4 uWVNMatrix;\n'+
		
		'varying vec2 vTextureCoord;\n'+
		'varying vec4 vposition;\n'+
		'uniform mat4 uWLight;\n'+
		
		'varying vec4 vWNMatrix;\n'+
		'varying vec4 vWVNMatrix;\n'+
		'varying vec4 vWPos;\n'+
			
		'void main(void) {\n'+
			'vWPos = uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'vposition = uPMatrix * uVMatrix* uWMatrix * vec4(aVertexPosition, 1.0);\n'+
			'gl_Position = vposition;\n'+
			'vTextureCoord = aTextureCoord;\n'+
			
			'vWNMatrix = uWNMatrix * vec4(aVertexNormal, 1.0);\n'+
			'vWVNMatrix = uWVNMatrix * vec4(aVertexNormal, 1.0);\n'+
		'}';
	var sourceFragment001 = '#ifdef GL_ES\n\n'+
		'precision highp float;\n\n'+
		'#endif\n\n'+
		
		'uniform mat4 uWMatrix;\n'+
		'uniform mat4 uVMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 uWNMatrix;\n'+
		'uniform mat4 uWVNMatrix;\n'+
		
		
		'uniform float uSpecularRoughness;\n'+
		'uniform vec3 uSpecularColor;\n'+
			
		'uniform vec3 uAmbientColor;\n'+
		
		'uniform vec3 uLightColor00;\n'+ // 00 sun
		'uniform vec3 uLightDirection00;\n'+
		'uniform vec3 uLightColor01;\n'+
		'uniform vec3 uLightDirection01;\n'+
		'uniform vec3 uLightColor02;\n'+
		'uniform vec3 uLightDirection02;\n'+
		'uniform vec3 uLightColor03;\n'+
		'uniform vec3 uLightDirection03;\n'+
		'uniform vec3 uLightColor04;\n'+
		'uniform vec3 uLightDirection04;\n'+
		'uniform vec3 uLightColor05;\n'+
		'uniform vec3 uLightDirection05;\n'+
		'uniform vec3 uLightColor06;\n'+
		'uniform vec3 uLightDirection06;\n'+
		'uniform vec3 uLightColor07;\n'+
		'uniform vec3 uLightDirection07;\n'+
		'uniform vec3 uLightColor08;\n'+
		'uniform vec3 uLightDirection08;\n'+
		'uniform vec3 uLightColor09;\n'+
		'uniform vec3 uLightDirection09;\n'+
		
		'uniform sampler2D uSampler;\n'+
		'uniform sampler2D uSamplerBump;\n'+
		'uniform sampler2D uSamplerRT0;\n'+// RT0 rgb normals a zdepth
		'uniform sampler2D uSamplerRT2;\n'+// RT2 rgba zdepth camera
		'uniform sampler2D uSamplerRandom;\n'+
		'uniform sampler2D uSamplerShadowLayer;\n'+
		
		'uniform float uOcclusionLevel;\n'+
		'uniform float uViewportWidth;\n'+
		'uniform float uViewportHeight;\n'+
		
		'uniform int uUseBump;\n'+
		'uniform int uUseSSAO;\n'+
		
		'varying vec2 vTextureCoord;\n'+
		'varying vec4 vposition;\n'+
		'varying vec4 vWNMatrix;\n'+
		'varying vec4 vWVNMatrix;\n'+
		'varying vec4 vWPos;\n'+
		
		'void main(void) {\n'+
			'vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n'+
			'vec3 weightAmbient = uAmbientColor;\n'+
			'vec3 restWeight = vec3(1.0,1.0,1.0)-weightAmbient;\n'+
			
			'vec3 eyeDirection = normalize(vec3(uVMatrix * vec4(vWPos.xyz,1.0)));\n'+
			
			'vec3 lightColor[10];\n'+
			'vec3 lightDirection[10];\n'+
			'lightColor[0] = uLightColor00;\n'+
			'lightDirection[0] = uLightDirection00;\n'+
			'lightColor[1] = uLightColor01;\n'+
			'lightDirection[1] = uLightDirection01;\n'+
			'lightColor[2] = uLightColor02;\n'+
			'lightDirection[2] = uLightDirection02;\n'+
			'lightColor[3] = uLightColor03;\n'+
			'lightDirection[3] = uLightDirection03;\n'+
			'lightColor[4] = uLightColor04;\n'+
			'lightDirection[4] = uLightDirection04;\n'+
			'lightColor[5] = uLightColor05;\n'+
			'lightDirection[5] = uLightDirection05;\n'+
			'lightColor[6] = uLightColor06;\n'+
			'lightDirection[6] = uLightDirection06;\n'+
			'lightColor[7] = uLightColor07;\n'+
			'lightDirection[7] = uLightDirection07;\n'+
			'lightColor[8] = uLightColor08;\n'+
			'lightDirection[8] = uLightDirection08;\n'+
			'lightColor[9] = uLightColor09;\n'+
			'lightDirection[9] = uLightDirection09;\n'+
			
			'vec3 weightMaterial = vec3(0.0,0.0,0.0);\n'+
			'vec3 acum;\n'+
			'for(int i =0; i<10; i++) {\n'+
				'acum = vec3(0.0,0.0,0.0);\n'+
				
				'if((lightColor[i].x != 0.0) || (lightColor[i].y != 0.0) || (lightColor[i].z != 0.0)) {\n'+
					// difusa
					'vec3 lightDirection = normalize(lightDirection[i] * -1.0);\n'+
					'float lightWeighting = max(dot(normalize(vWNMatrix.xyz), lightDirection)*-1.0, 0.0);\n'+
					'vec3 weightDiffuse = vec3(lightWeighting,lightWeighting,lightWeighting);\n'+
					
					// especular
					'vec3 reflectionDirection = reflect(lightDirection, normalize(vWVNMatrix.xyz));\n'+
					'float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection*-1.0), 0.0), uSpecularRoughness);\n'+// TODO uSpecularRoughness, uSpecularColor desde variable de StormBufferObject
					'vec3 weightSpecular = uSpecularColor * specularLightWeighting* weightDiffuse;\n'+
					
					'float restDiffuse = length(vec3(1.0,1.0,1.0)-(weightDiffuse));\n'+
					'acum = min(vec3(1.0,1.0,1.0),(weightDiffuse + weightSpecular));\n'+
					
					// bump
					'if(uUseBump == 1) {\n'+
						'vec4 textureColorBump = uWNMatrix*texture2D(uSamplerBump, vec2(vTextureCoord.s, vTextureCoord.t));\n'+
						'acum = acum - ((1.0-(dot(textureColorBump.rgb, lightDirection)*-1.0))*0.2) +(((dot(textureColorBump.rgb, lightDirection)*-1.0) * specularLightWeighting )*1.0);\n'+
					'}\n'+
				'}\n'+
					
				
				'weightMaterial += min(vec3(1.0,1.0,1.0),acum);\n'+
			'}\n'+
			
					
			
			
			
			'vec2 vecRandomA[36];\n'+
			'vecRandomA[0] = vec2(0.009, 1.0);\n'+
			'vecRandomA[1] = vec2(0.87, 0.492);\n'+
			'vecRandomA[2] = vec2(0.862, -0.508);\n'+
			'vecRandomA[3] = vec2(-0.009, -1.0);\n'+
			'vecRandomA[4] = vec2(-0.87, -0.492);\n'+
			'vecRandomA[5] = vec2(-0.862, 0.508);\n'+
			
			'vecRandomA[6] = vec2(0.508, 0.862);\n'+
			'vecRandomA[7] = vec2(1.0, -0.009);\n'+
			'vecRandomA[8] = vec2(0.492, -0.87);\n'+
			'vecRandomA[9] = vec2(-0.508, -0.862);\n'+
			'vecRandomA[10] = vec2(-1.0, 0.009);\n'+
			'vecRandomA[11] = vec2(-0.492, 0.87);\n'+
			
			'vecRandomA[12] = vec2(0.182, 0.983);\n'+
			'vecRandomA[13] = vec2(0.943, 0.334);\n'+
			'vecRandomA[14] = vec2(0.76, -0.649);\n'+
			'vecRandomA[15] = vec2(-0.182, -0.983);\n'+
			'vecRandomA[16] = vec2(-0.943, -0.334);\n'+
			'vecRandomA[17] = vec2(-0.76, 0.649);\n'+

			'vecRandomA[18] = vec2(0.35, 0.937);\n'+
			'vecRandomA[19] = vec2(0.986, 0.165);\n'+
			'vecRandomA[20] = vec2(0.636, -0.772);\n'+
			'vecRandomA[21] = vec2(-0.35, -0.937);\n'+
			'vecRandomA[22] = vec2(-0.986, -0.165);\n'+
			'vecRandomA[23] = vec2(-0.636, 0.772);\n'+
			
			'vecRandomA[24] = vec2(0.649, 0.76);\n'+
			'vecRandomA[25] = vec2(0.983, -0.182);\n'+
			'vecRandomA[26] = vec2(0.334, -0.943);\n'+
			'vecRandomA[27] = vec2(-0.649, -0.76);\n'+
			'vecRandomA[28] = vec2(-0.983, 0.182);\n'+
			'vecRandomA[29] = vec2(-0.334, 0.943);\n'+
			
			'vecRandomA[30] = vec2(0.772, 0.636);\n'+
			'vecRandomA[31] = vec2(0.937, -0.35);\n'+
			'vecRandomA[32] = vec2(0.165, -0.986);\n'+
			'vecRandomA[33] = vec2(-0.772, -0.636);\n'+
			'vecRandomA[34] = vec2(-0.937, 0.35);\n'+
			'vecRandomA[35] = vec2(-0.165, 0.986);\n'+
			
			
			'vec4 camCoords = vposition;\n'+
			'camCoords = camCoords/camCoords.w;\n'+
			'camCoords = 0.5 * camCoords + 0.5;\n'+
			
			'vec4 AFragmentDepthMap = texture2D(uSamplerRT2, camCoords.xy);\n'+
			'float AFragmentDepth = (AFragmentDepthMap.a + AFragmentDepthMap.b/256.0 + AFragmentDepthMap.g/65536.0 + AFragmentDepthMap.r/16777216.0) + 0.008;\n'+
			'float normDepth = (1.0-camCoords.z);\n'+
			'float normDepthLight = normDepth*0.5;\n'+
			
			'vec4 BFragmentDepthMap;\n'+
			'float ABDepthDifference;\n'+
			'vec4 AFragmentShadowLayer;\n'+
			'vec4 BFragmentShadowLayer;\n'+
			
			'vec2 noiseCoord = vec2(camCoords.x*(uViewportWidth/32.0),camCoords.y*(uViewportHeight/32.0));\n'+ // 32px map noise
			
			// BLUR SHADOW MAP
			'vec3 light;\n'+
			'vec2 vecTextureCoordLight;\n'+
			
			'int hl = 0;\n'+
			'vec3 lightB = vec3(0.0,0.0,0.0);\n'+
			'for(int i =0; i < 12; i++) {\n'+
				'vec2 vecRandomB = texture2D(uSamplerRandom, noiseCoord+(vecRandomA[i].xy)).xy;\n'+
				'vecRandomB = vecRandomA[i].xy*vecRandomB.xy;\n'+
				'if(i < 6) {\n'+
					'vecTextureCoordLight = vecRandomB*(2.0*normDepthLight);\n'+
				'} else if(i >= 6 && i < 12) {\n'+
					'vecTextureCoordLight = vecRandomB*(2.0*normDepthLight);\n'+
				'}\n'+
		
				'BFragmentDepthMap = texture2D(uSamplerRT2, camCoords.xy+vecTextureCoordLight.xy);\n'+
				'float BFragmentDepthL = (BFragmentDepthMap.a + BFragmentDepthMap.b/256.0 + BFragmentDepthMap.g/65536.0 + BFragmentDepthMap.r/16777216.0) + 0.008;\n'+
				
				'ABDepthDifference = abs(AFragmentDepth-BFragmentDepthL);\n'+
				'if((ABDepthDifference<0.005)) {\n'+
					'BFragmentShadowLayer = texture2D(uSamplerShadowLayer, camCoords.xy+vecTextureCoordLight.xy);\n'+
					'lightB += BFragmentShadowLayer.rgb;\n'+
					'hl++;'+
				'}\n'+
			'}\n'+
			'light = lightB/float(hl);\n'+
					
			
			
			
			'float ssao;\n'+
			'if(uUseSSAO == 1) {\n'+
				// SSAO STORMENGINEC
				'vec4 AFragmentNormal = texture2D(uSamplerRT0, camCoords.xy);\n'+
				
				'vec2 vecTextureCoordB;\n'+
				
				'int h = 0;\n'+
				'float acum = 0.0;\n'+
				'for(int i =0; i < 36; i++) {\n'+
					'vec2 vecRandomB = texture2D(uSamplerRandom, noiseCoord+(vecRandomA[i].xy)).xy;\n'+
					'vecRandomB = vecRandomA[i].xy*vecRandomB.xy;\n'+
					'if(i < 6) {\n'+
						'vecTextureCoordB = vecRandomB*(0.05*normDepth);\n'+
					'} else if(i >= 6 && i < 12) {\n'+
						'vecTextureCoordB = vecRandomB*(0.05*normDepth);\n'+
					'} else if(i >= 12 && i < 18) {\n'+
						'vecTextureCoordB = vecRandomB*(0.05*normDepth);\n'+
					'} else if(i >= 18 && i < 24) {\n'+
						'vecTextureCoordB = vecRandomB*(3.0*normDepth);\n'+
					'} else if(i >= 24 && i < 30) {\n'+
						'vecTextureCoordB = vecRandomB*(8.5*normDepth);\n'+
					'} else if(i >= 30 && i < 36) {\n'+
						'vecTextureCoordB = vecRandomB*(9.0*normDepth);\n'+
					'}\n'+
					
					'BFragmentDepthMap = texture2D(uSamplerRT2, camCoords.xy+vecTextureCoordB.xy);\n'+
					'float BFragmentDepth = (BFragmentDepthMap.a + BFragmentDepthMap.b/256.0 + BFragmentDepthMap.g/65536.0 + BFragmentDepthMap.r/16777216.0) + 0.008;\n'+
					'vec4 BFragmentNormal = texture2D(uSamplerRT0, camCoords.xy+vecTextureCoordB.xy);\n'+
				
					'ABDepthDifference = abs(AFragmentDepth-BFragmentDepth);\n'+
					'if(ABDepthDifference < 0.02) {\n'+
						'float ABNormalDifference = 1.0-abs(dot(AFragmentNormal.xyz, BFragmentNormal.xyz));\n'+
						'float t = (1.0-(ABDepthDifference/0.02))*ABNormalDifference;\n'+
						'float oAB = (ABNormalDifference+t)/uOcclusionLevel;\n'+
						'acum += oAB;\n'+
						'h++;\n'+
					'}\n'+
				'}\n'+
				'ssao = 1.0-(acum/float(h));\n'+
			'}\n'+
			
			
			'light *= weightMaterial;\n'+

			'vec3 weight = min(vec3(1.0,1.0,1.0),light+weightAmbient);\n'+
			
			'if(uUseSSAO == 1) {\n'+
				'weight *= ssao;\n'+
			'}\n'+
			
			
			
			'gl_FragColor = vec4(textureColor.rgb*weight, textureColor.a);\n'+
		'}';
	this.shaderProgramManager = this.gl.createProgram();
	this.createShader(sourceVertex001, sourceFragment001, this.shaderProgramManager);
	
	
	
	this.ambientColorUniform = this.gl.getUniformLocation(this.shaderProgramManager, "uAmbientColor");

	this.uniformLightColor00 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor00");
	this.uniformLightDirection00 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection00");
	this.uniformLightColor01 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor01");
	this.uniformLightDirection01 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection01");
	this.uniformLightColor02 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor02");
	this.uniformLightDirection02 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection02");
	this.uniformLightColor03 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor03");
	this.uniformLightDirection03 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection03");
	this.uniformLightColor04 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor04");
	this.uniformLightDirection04 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection04");
	this.uniformLightColor05 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor05");
	this.uniformLightDirection05 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection05");
	this.uniformLightColor06 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor06");
	this.uniformLightDirection06 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection06");
	this.uniformLightColor07 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor07");
	this.uniformLightDirection07 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection07");
	this.uniformLightColor08 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor08");
	this.uniformLightDirection08 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection08");
	this.uniformLightColor09 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightColor09");
	this.uniformLightDirection09 = this.gl.getUniformLocation(this.shaderProgramManager, "uLightDirection09");
	
	this.samplerUniform = this.gl.getUniformLocation(this.shaderProgramManager, "uSampler");
	this.uniformSamplerBump = this.gl.getUniformLocation(this.shaderProgramManager, "uSamplerBump");
	this.uniformSamplerManagerRT0 = this.gl.getUniformLocation(this.shaderProgramManager, "uSamplerRT0");// RT0 rgb normals a zdepth
	this.uniformSamplerManagerRT2 = this.gl.getUniformLocation(this.shaderProgramManager, "uSamplerRT2");// RT2 rgba zdepth camera
	this.uniformSamplerRandom = this.gl.getUniformLocation(this.shaderProgramManager, "uSamplerRandom");
	this.uniformSamplerShadowLayer = this.gl.getUniformLocation(this.shaderProgramManager, "uSamplerShadowLayer");
	this.uniformOcclusionLevel = this.gl.getUniformLocation(this.shaderProgramManager, "uOcclusionLevel");
	this.uniformViewportWidth = this.gl.getUniformLocation(this.shaderProgramManager, "uViewportWidth");
	this.uniformViewportHeight = this.gl.getUniformLocation(this.shaderProgramManager, "uViewportHeight");
	
	this.uniformUseBump = this.gl.getUniformLocation(this.shaderProgramManager, "uUseBump");
	this.uniformUseSSAO = this.gl.getUniformLocation(this.shaderProgramManager, "uUseSSAO");
	
	this.uniformSpecularRoughness = this.gl.getUniformLocation(this.shaderProgramManager, "uSpecularRoughness");
	this.uniformSpecularColor = this.gl.getUniformLocation(this.shaderProgramManager, "uSpecularColor");

	this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgramManager, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
	this.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgramManager, "aVertexNormal");
	this.gl.enableVertexAttribArray(this.vertexNormalAttribute);
	this.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgramManager, "aTextureCoord");
	this.gl.enableVertexAttribArray(this.textureCoordAttribute);

	
	this.uniformWMatrix = this.gl.getUniformLocation(this.shaderProgramManager, "uWMatrix");
	this.uniformVMatrix = this.gl.getUniformLocation(this.shaderProgramManager, "uVMatrix");
	this.uniformPMatrix = this.gl.getUniformLocation(this.shaderProgramManager, "uPMatrix");
	this.uniformPOrthoMatrix = this.gl.getUniformLocation(this.shaderProgramManager, "uPOrthoMatrix");
	this.uniformWNMatrix = this.gl.getUniformLocation(this.shaderProgramManager, "uWNMatrix");
	this.uniformWVNMatrix = this.gl.getUniformLocation(this.shaderProgramManager, "uWVNMatrix");
};
StormGLContext.prototype.renderSene = function() {
	
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.clearColor(this.ambientColor.e[0], this.ambientColor.e[1], this.ambientColor.e[2], 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

	this.gl.useProgram(this.shaderProgramManager);
	
	this.gl.uniform3f(this.ambientColorUniform,this.ambientColor.e[0],this.ambientColor.e[1],this.ambientColor.e[2]); 
	for(var n = 0; n < 10; n++) {
		var light =  this.lights[n];
		if(light != undefined) {
			var adjustedLD = light.direction.normalize().x(-1.0);
			if(n == 0) {
				this.gl.uniform3f(this.uniformLightDirection00, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor00, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 1) {
				this.gl.uniform3f(this.uniformLightDirection01, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor01, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 2) {
				this.gl.uniform3f(this.uniformLightDirection02, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor02, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 3) {
				this.gl.uniform3f(this.uniformLightDirection03, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor03, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 4) {
				this.gl.uniform3f(this.uniformLightDirection04, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor04, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 5) {
				this.gl.uniform3f(this.uniformLightDirection05, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor05, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 6) {
				this.gl.uniform3f(this.uniformLightDirection06, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor06, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 7) {
				this.gl.uniform3f(this.uniformLightDirection07, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor07, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 8) {
				this.gl.uniform3f(this.uniformLightDirection08, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor08, light.color.e[0], light.color.e[1], light.color.e[2]);
			} else if(n == 9) {
				this.gl.uniform3f(this.uniformLightDirection09, adjustedLD.e[0], adjustedLD.e[1], adjustedLD.e[2]);
				this.gl.uniform3f(this.uniformLightColor09, light.color.e[0], light.color.e[1], light.color.e[2]);
			}
		} else {
			if(n == 0) {
				this.gl.uniform3f(this.uniformLightDirection00, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor00, 0.0, 0.0, 0.0);
			} else if(n == 1) {
				this.gl.uniform3f(this.uniformLightDirection01, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor01, 0.0, 0.0, 0.0);
			} else if(n == 2) {
				this.gl.uniform3f(this.uniformLightDirection02, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor02, 0.0, 0.0, 0.0);
			} else if(n == 3) {
				this.gl.uniform3f(this.uniformLightDirection03, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor03, 0.0, 0.0, 0.0);
			} else if(n == 4) {
				this.gl.uniform3f(this.uniformLightDirection04, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor04, 0.0, 0.0, 0.0);
			} else if(n == 5) {
				this.gl.uniform3f(this.uniformLightDirection05, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor05, 0.0, 0.0, 0.0);
			} else if(n == 6) {
				this.gl.uniform3f(this.uniformLightDirection06, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor06, 0.0, 0.0, 0.0);
			} else if(n == 7) {
				this.gl.uniform3f(this.uniformLightDirection07, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor07, 0.0, 0.0, 0.0);
			} else if(n == 8) {
				this.gl.uniform3f(this.uniformLightDirection08, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor08, 0.0, 0.0, 0.0);
			} else if(n == 9) {
				this.gl.uniform3f(this.uniformLightDirection09, 0.0, 0.0, 0.0);
				this.gl.uniform3f(this.uniformLightColor09, 0.0, 0.0, 0.0);
			}
		}
	}
	
	this.gl.uniform1i(this.uniformUseSSAO, this.SSAOenable?1:0);
    this.gl.uniform1f(this.uniformOcclusionLevel, this.SSAOlevel);
	this.gl.uniform1f(this.uniformViewportWidth, this.viewportWidth);
	this.gl.uniform1f(this.uniformViewportHeight, this.viewportHeight);
	
	var kdName;
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			kdName = this.nodes[n].buffersObjects[nb].textureKdName;
			if(kdName != undefined && kdName.match(/.png$/gim) == null) {
				this.renderSceneNow(this.nodes[n],this.nodes[n].buffersObjects[nb]);
			}
		}
	}
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			kdName = this.nodes[n].buffersObjects[nb].textureKdName;
			if(kdName != undefined && kdName.match(/.png$/gim) != null) {
				this.renderSceneNow(this.nodes[n],this.nodes[n].buffersObjects[nb]);
			}
		}
	}
	this.gl.disable(this.gl.BLEND);
	
	
};
StormGLContext.prototype.renderSceneNow = function(node, buffersObject) {	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, buffersObject.textureObjectKd);
	this.gl.uniform1i(this.samplerUniform, 0);
	
	this.gl.activeTexture(this.gl.TEXTURE1);
	this.gl.bindTexture(this.gl.TEXTURE_2D, buffersObject.textureObjectBump);
	this.gl.uniform1i(this.uniformSamplerBump, 1);
	
	this.gl.activeTexture(this.gl.TEXTURE2);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0); // RT0 rgb normals a depth
	this.gl.uniform1i(this.uniformSamplerManagerRT0, 2);
	
	
	this.gl.activeTexture(this.gl.TEXTURE3); 
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT2); // RT2 rgba depth camera
	this.gl.uniform1i(this.uniformSamplerManagerRT2, 3);
	
	this.gl.activeTexture(this.gl.TEXTURE4);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRandom);
	this.gl.uniform1i(this.uniformSamplerRandom, 4);
	
	this.gl.activeTexture(this.gl.TEXTURE5);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRTShadowLayer);
	this.gl.uniform1i(this.uniformSamplerShadowLayer, 5);

	


	this.gl.uniform1i(this.uniformUseBump, 0);
	
	if(buffersObject.textureObjectBump != undefined) {
		this.gl.uniform1i(this.uniformUseBump, 1);
	}
	
	this.gl.uniform1f(this.uniformSpecularRoughness, 50.0);
	this.gl.uniform3f(this.uniformSpecularColor, 0.03, 0.03, 0.03);
	
	this.gl.uniformMatrix4fv(this.uniformPMatrix, false, this.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.uniformPOrthoMatrix, false, this.mPOrthoMatrix.transpose().e);
	
	this.gl.uniformMatrix4fv(this.uniformWMatrix, false, node.mWMatrixFrame.transpose().e);
	this.gl.uniformMatrix4fv(this.uniformVMatrix, false, this.nodeViewportCamera.mWMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.uniformWNMatrix, false, node.mWMatrixFrame.inverse().e);
	this.gl.uniformMatrix4fv(this.uniformWVNMatrix, false, this.nodeViewportCamera.mWMatrix.x(node.mWMatrixFrame).inverse().e);
	
	
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBuffer);
	this.gl.vertexAttribPointer(this.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
		
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshNormalBuffer);
	this.gl.vertexAttribPointer(this.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshTextureBuffer);
	this.gl.vertexAttribPointer(this.textureCoordAttribute, 3, this.gl.FLOAT, false, 0, 0);
	
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffersObject.nodeMeshIndexBuffer);
	
	
	
	this.gl.drawElements(this.gl.TRIANGLES, buffersObject.nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
};

/*----------------------------------------------------------------------------------------
										LINES
----------------------------------------------------------------------------------------*/

StormGLContext.prototype.initShaderLines = function() {
	var sourceVertex001 = 	'attribute vec3 aVertexPosition;\n'+
		'attribute float aVertexLocPosition;\n'+
		
		'uniform mat4 uVMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
			
		'varying float vVertexLocPosition;\n'+
		
		'void main(void) {\n'+
			'gl_Position = uPMatrix * uVMatrix * vec4(aVertexPosition, 1.0);\n'+
			
			'vVertexLocPosition = aVertexLocPosition;\n'+
		'}';
	var sourceFragment001 = '#ifdef GL_ES\n\n'+
		'precision highp float;\n\n'+
		'#endif\n\n'+
		
		'varying float vVertexLocPosition;\n'+
		
		'void main(void) {\n'+
			'gl_FragColor = vec4(vec3(1.0, 1.0, 1.0)*vVertexLocPosition, 1.0);\n'+
		'}';
	this.shaderProgramLines = this.gl.createProgram();
	this.createShader(sourceVertex001, sourceFragment001, this.shaderProgramLines);
	
	
	
	
		
	this.attributeVertexPositionLines = this.gl.getAttribLocation(this.shaderProgramLines, "aVertexPosition");
	this.gl.enableVertexAttribArray(this.attributeVertexPositionLines);
	
	this.attributeVertexLocPositionLines = this.gl.getAttribLocation(this.shaderProgramLines, "aVertexLocPosition");
	this.gl.enableVertexAttribArray(this.attributeVertexLocPositionLines);
	
	this.uniformPMatrixLines = this.gl.getUniformLocation(this.shaderProgramLines, "uPMatrix");
	this.uniformVMatrixLines = this.gl.getUniformLocation(this.shaderProgramLines, "uVMatrix");
};
StormGLContext.prototype.renderLines = function() {
	if(this.lines.length > 0) {
	
		this.gl.useProgram(this.shaderProgramLines);
		
		var linesVertexArray = [];
		var linesVertexLocArray = [];
		var linesIndexArray = [];
		for(var n = 0; n < this.lines.length; n++) {
			linesVertexArray.push(
					this.lines[n].origin.e[0], this.lines[n].origin.e[1], this.lines[n].origin.e[2],
					this.lines[n].end.e[0], this.lines[n].end.e[1], this.lines[n].end.e[2]);
			linesVertexLocArray.push(
					0.0,
					1.0);
			linesIndexArray.push(
								(2*n)+0,
								(2*n)+1);
		}
	
		this.gl.uniformMatrix4fv(this.uniformPMatrixLines, false, this.mPMatrix.transpose().e);
		this.gl.uniformMatrix4fv(this.uniformVMatrixLines, false, this.nodeViewportCamera.mWMatrix.transpose().e);
	
	
	
		var linesVertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, linesVertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexArray), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(this.attributeVertexPositionLines, 3, this.gl.FLOAT, false, 0, 0);
		
		var linesVertexLocBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, linesVertexLocBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexLocArray), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(this.attributeVertexLocPositionLines, 1, this.gl.FLOAT, false, 0, 0);
	
		var linesIndexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, linesIndexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linesIndexArray), this.gl.STATIC_DRAW);
		
		
		
		//this.gl.drawArrays(this.gl.LINES, 0, this.lines.length*2);
		this.gl.drawElements(this.gl.LINES, linesIndexArray.length, this.gl.UNSIGNED_SHORT, 0);
	
	}
};
StormGLContext.prototype.renderLinesRemovables = function() {
	if(this.linesRemovables.length > 0) {
	
		this.gl.useProgram(this.shaderProgramLines);
		
		var linesVertexArray = [];
		var linesVertexLocArray = [];
		var linesIndexArray = [];
		for(var n = 0; n < this.linesRemovables.length; n++) {
			linesVertexArray.push(
					this.linesRemovables[n].origin.e[0], this.linesRemovables[n].origin.e[1], this.linesRemovables[n].origin.e[2],
					this.linesRemovables[n].end.e[0], this.linesRemovables[n].end.e[1], this.linesRemovables[n].end.e[2]);
			linesVertexLocArray.push(
					0.0,
					1.0);
			linesIndexArray.push(
								(2*n)+0,
								(2*n)+1);
		}
		
		this.gl.uniformMatrix4fv(this.uniformPMatrixLines, false, this.mPMatrix.transpose().e);
		this.gl.uniformMatrix4fv(this.uniformVMatrixLines, false, this.nodeViewportCamera.mWMatrix.transpose().e);
		
		
		
		var linesVertexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, linesVertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexArray), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(this.attributeVertexPositionLines, 3, this.gl.FLOAT, false, 0, 0);
		
		var linesVertexLocBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, linesVertexLocBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexLocArray), this.gl.STATIC_DRAW);
		this.gl.vertexAttribPointer(this.attributeVertexLocPositionLines, 1, this.gl.FLOAT, false, 0, 0);
	
		var linesIndexBuffer = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, linesIndexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linesIndexArray), this.gl.STATIC_DRAW);
		
		
		
		//this.gl.drawArrays(this.gl.LINES, 0, this.lines.length*2);
		this.gl.drawElements(this.gl.LINES, linesIndexArray.length, this.gl.UNSIGNED_SHORT, 0);
	
	}
};























StormGLContext.prototype.setPerspective = function(fovy, aspect, znear, zfar, ortho) {
    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    this.setOrtho(-10, 10, -10, 10, 0.1, 100.0);
	this.setFrustum(xmin, xmax, ymin, ymax, znear, zfar);
};

StormGLContext.prototype.setFrustum = function(left, right, bottom, top, znear, zfar) {
	var X = 2*znear/(right-left);
	var Y = 2*znear/(top-bottom);
	var A = (right+left)/(right-left);
	var B = (top+bottom)/(top-bottom);
	var C = -(zfar+znear)/(zfar-znear);
	var D = -2*zfar*znear/(zfar-znear);

	this.mPMatrix = $M16([
	                 X, 0, A, 0,
	                 0, Y, B, 0,
	                 0, 0, C, D,
	                 0, 0, -1, 0
	                 ]);
};

StormGLContext.prototype.setOrtho = function(left, right, bottom, top, znear, zfar) {
	var tx = - (right + left) / (right - left);
	var ty = - (top + bottom) / (top - bottom);
	var tz = - (zfar + znear) / (zfar - znear);

	this.mPOrthoMatrix = $M16([
	                      2 / (right - left), 0, 0, tx,
		                 0, 2 / (top - bottom), 0, ty,
		                 0, 0, -2 / (zfar - znear), tz,
		                 0, 0, 0, 1
	                 ]);
};


StormGLContext.prototype.setViewportCamera = function(nodeCam) {
	if(this.nodeViewportCamera != undefined) {
		this.nodeViewportCamera.usedByGLContext = false;
	}
	
	
	this.nodeViewportCamera = nodeCam;
	this.nodeViewportCamera.usedByGLContext = true;
	
	
};



