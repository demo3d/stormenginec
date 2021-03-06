/*----------------------------------------------------------------------------------------
     									LIGHT DEPTH
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_LightDepth = function() {
	var sourceVertex = 	 this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aTextureCoord;\n'+
		
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_lightWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'uniform int uLightType;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying vec4 vposition;\n'+
		'varying vec3 vTextureCoord;\n'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vposition = u_lightWMatrix * u_nodeWMatrix * vec4(vp, 1.0);\n'+
			'gl_Position = uPMatrix * vposition;\n'+
			
			'vTextureCoord = aTextureCoord;\n'+
		'}';
	var sourceFragment = this.precision+
		
		'uniform float uFar;\n'+
		
		'uniform sampler2D sampler_kdTexture;\n'+
		'uniform int viewLightDepth;\n'+
		
		'varying vec4 vNormal;\n'+
		'varying vec4 vposition;\n'+
		'varying vec3 vTextureCoord;\n'+
		
		'vec4 pack (float depth) {'+
			'const vec4 bias = vec4(1.0 / 255.0,'+
						'1.0 / 255.0,'+
						'1.0 / 255.0,'+
						'0.0);'+

			'float r = depth;'+
			'float g = fract(r * 255.0);'+
			'float b = fract(g * 255.0);'+
			'float a = fract(b * 255.0);'+
			'vec4 colour = vec4(r, g, b, a);'+
			
			'return colour - (colour.yzww * bias);'+
		'}'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'void main(void) {\n'+
			
			'vec4 kdTexture = texture2D(sampler_kdTexture, vec2(vTextureCoord.s, vTextureCoord.t));\n'+
			
			'float depth;\n'+
			'if(kdTexture.a == 0.0) {\n'+
				//'depth = length(uFar)*LinearDepthConstant;'+
				'depth = 1.0*LinearDepthConstant;'+
			'} else {\n'+
				'depth = length(vposition)*LinearDepthConstant;'+
			'}\n'+
			
			//'gl_FragColor = pack(depth);\n'+
			//'if(viewLightDepth==0) gl_FragColor = pack(depth); else gl_FragColor = vec4(kdTexture);\n'+  
			'if(viewLightDepth==0) gl_FragColor = vec4(depth,depth,depth,1.0); else gl_FragColor = vec4(kdTexture);\n'+  
			
		'}';
	this.shader_LightDepth = this.gl.createProgram();
	this.createShader(this.gl, "LIGHT DEPTH", sourceVertex, sourceFragment, this.shader_LightDepth, this.pointers_LightDepth.bind(this));
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_LightDepth = function() {
	this.u_LightDepth_far = this.gl.getUniformLocation(this.shader_LightDepth, "uFar");
	
	this.sampler_LightDepth_kdTexture = this.gl.getUniformLocation(this.shader_LightDepth, "sampler_kdTexture");
		
	this.attr_LightDepth_pos = this.gl.getAttribLocation(this.shader_LightDepth, "aVertexPosition");
	this.attr_LightDepth_UV = this.gl.getAttribLocation(this.shader_LightDepth, "aTextureCoord");
	
	
	this.u_LightDepth_lightType = this.gl.getUniformLocation(this.shader_LightDepth, "uLightType");
	this.u_LightDepth_viewLightDepth = this.gl.getUniformLocation(this.shader_LightDepth, "viewLightDepth");
	
	this.u_LightDepth_PMatrix = this.gl.getUniformLocation(this.shader_LightDepth, "uPMatrix");
	this.u_LightDepth_lightWMatrix = this.gl.getUniformLocation(this.shader_LightDepth, "u_lightWMatrix");
	this.u_LightDepth_nodeWMatrix = this.gl.getUniformLocation(this.shader_LightDepth, "u_nodeWMatrix");
	this.u_LightDepth_nodeVScale = this.gl.getUniformLocation(this.shader_LightDepth, "u_nodeVScale");
	this.Shader_LightDepth_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_LightDepth = function() {
	//this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer); 
	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_Shadows, 0);
	this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	
							
	for(var nL = 0, fL = this.lights.length; nL < fL; nL++) { 
		if(this.lights[nL].visibleOnContext == true) {
			if((this.view_LightDepth && nL == this.view_LightDepthNum) || !this.view_LightDepth) {
				if(this.lights[nL].type == 'sun') { 
					this.gl.viewport(0, 0, this.view_LightDepth ? this.viewportWidth : this.maxViewportWidth, this.view_LightDepth ? this.viewportHeight : this.maxViewportHeight);
					this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_LightDepth ? null : this.fBufferLightSun);
					this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_LightSun, 0);
				} else {
					this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
					this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_LightDepth ? null : this.fBufferLightSpot);
					this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_LightSpot, 0);
				}
				//guardamos en this.textureRTLightXX mapa de profundidad de la escena desde la vista de la luz
				var light =  this.lights[nL];
				this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
				
				
				
				for(var n = 0, f = this.nodes.length; n < f; n++) {
					if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light' && this.nodes[n].shadows==true) { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
						for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
							var kdName = this.nodes[n].materialUnits[0].textureKdName;
							if(kdName != undefined && kdName.match(/.png$/gim) == null) {
								this.renderFromLight(this.nodes[n], this.nodes[n].buffersObjects[nb], light);
							}
						}
					}
				}
				for(var n = 0, f = this.nodes.length; n < f; n++) {
					if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light' && this.nodes[n].shadows==true) { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
						for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
							var kdName = this.nodes[n].materialUnits[0].textureKdName;
							if(kdName != undefined && kdName.match(/.png$/gim) != null) {
								this.renderFromLight(this.nodes[n],this.nodes[n].buffersObjects[nb],light);
							}
						}
					}
				}
			}
			if(!this.view_LightDepth) {
				this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
				this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.view_Shadows ? null : this.fBuffer);
				if(!this.view_Shadows) this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.textureFB_Shadows, 0);
				if(nL > 0) {
					this.gl.enable(this.gl.BLEND);
					this.gl.blendEquation(this.gl.FUNC_ADD);
					this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
				}
				this.gl.useProgram(this.shader_Shadows);
				// una vez obtenemos (para la luz actual) el mapa de profundidad de la escena vista desde la luz y est� guardado
				// en this.textureRTLightXX, renderizaremos una mascara desde la vista actual de la c�mara (vposition en vertex program)
				// y que guardaremos en this.textureFB_Shadows para aplicar despues en RENDER ESCENE dando las zonas con luz o sombra.
				// Para obtener la m�scara (en vista de c�mara) para esta luz, desde el fragment program determinaremos si el pixel actual
				// deber�a ser blanco o negro. Para ello comprobamos la distancia de ese pixel visto desde la posici�n de la luz
				// compar�ndola con la que tenemos en el mapa de profundidad de this.textureRTLightXX.
				// Recorreremos todas las luces sum�ndolos a this.textureFB_Shadows.
				this.render_Shadows(light);
				if(nL > 0) {
					this.gl.disable(this.gl.BLEND);
				}
			}
		}
	}
	
	
};
/**
 * @private 
 */
StormGLContext.prototype.renderFromLight = function(node, buffersObject, light) {  
	this.gl.useProgram(this.shader_LightDepth);
	
	this.gl.uniform1i(this.u_LightDepth_viewLightDepth, this.view_LightDepth);
	this.gl.uniform1i(this.u_LightDepth_lightType, (light.type == 'sun')?0:1); // sun 0 ; spot 1   (light.type == 'sun')?0:1
				
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, node.materialUnits[0].textureObjectKd.items[0].textureData);
	this.gl.uniform1i(this.sampler_LightDepth_kdTexture, 0);
	 
	this.gl.uniform1f(this.u_LightDepth_far, this.far);
	this.gl.uniformMatrix4fv(this.u_LightDepth_PMatrix, false, light.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.u_LightDepth_lightWMatrix, false, light.MPOS.transpose().e);
	this.gl.uniformMatrix4fv(this.u_LightDepth_nodeWMatrix, false, node.MPOSFrame.transpose().e);
	this.gl.uniform3f(this.u_LightDepth_nodeVScale, node.VSCALE.e[0], node.VSCALE.e[1], node.VSCALE.e[2]);   

	this.gl.enableVertexAttribArray(this.attr_LightDepth_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshVertexBuffer);
	this.gl.vertexAttribPointer(this.attr_LightDepth_pos, 3, this.gl.FLOAT, false, 0, 0);
	if(buffersObject.nodeMeshTextureArray != undefined) {
		this.gl.enableVertexAttribArray(this.attr_LightDepth_UV);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffersObject.nodeMeshTextureBuffer);
		this.gl.vertexAttribPointer(this.attr_LightDepth_UV, 3, this.gl.FLOAT, false, 0, 0);
	}
	if(buffersObject.nodeMeshIndexArray != undefined) {
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffersObject.nodeMeshIndexBuffer);
		this.gl.drawElements(this.gl.TRIANGLES, buffersObject.nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
	} else {
		this.gl.drawArrays(this.gl.TRIANGLES, 0, buffersObject.nodeMeshVertexBufferNumItems);
	} 
};


/*----------------------------------------------------------------------------------------
									SHADOW LAYER
----------------------------------------------------------------------------------------*/
/**
 * @private 
 */
StormGLContext.prototype.initShader_Shadows = function() {
	var sourceVertex = 	this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec4 aVertexPositionX;\n'+
		'attribute vec4 aVertexPositionY;\n'+
		'attribute vec4 aVertexPositionZ;\n'+
		
		'uniform mat4 uPMatrix;\n'+
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 u_lightWMatrix;\n'+
		'uniform mat4 uPMatrixLight;\n'+
		
		'uniform int uLightType;\n'+
		
		'varying vec4 vpositionLightViewportRegion;\n'+
		'varying vec4 vpositionLight;\n'+
		'varying vec4 vNodeWMatrix;\n'+
		
		// http://devmaster.net/posts/3002/shader-effects-shadow-mapping
		// The scale matrix is used to push the projected vertex into the 0.0 - 1.0 region.
		// Similar in role to a * 0.5 + 0.5, where -1.0 < a < 1.0.
		'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			
			'vNodeWMatrix = u_nodeWMatrix * vec4(vp, 1.0);'+
			
			'vpositionLightViewportRegion = ScaleMatrix * uPMatrixLight * u_lightWMatrix * vNodeWMatrix;\n'+
			'vpositionLight = u_lightWMatrix * vNodeWMatrix;\n'+
			
			'gl_Position = uPMatrix * u_cameraWMatrix * vNodeWMatrix;\n'+
		'}';
	var sourceFragment = this.precision+
		
		'uniform float uFar;\n'+
		'uniform float uLightFov;\n'+
		
		'uniform sampler2D sampler_textureFBLightDepth;\n'+
		
		'uniform int uUseLight;\n'+
		'uniform int uLightType;\n'+
		'uniform vec3 uLightColor;\n'+
		
		'varying vec4 vpositionLightViewportRegion;\n'+
		'varying vec4 vpositionLight;\n'+
		'varying vec4 vNodeWMatrix;\n'+
		'uniform vec3 u_PositionLight;\n'+
		
		'float unpack (vec4 colour) {'+
			'const vec4 bitShifts = vec4(1.0,'+
							'1.0 / 255.0,'+
							'1.0 / (255.0 * 255.0),'+
							'1.0 / (255.0 * 255.0 * 255.0));'+
			'return dot(colour, bitShifts);'+
		'}'+
		'float LinearDepthConstant = 1.0/uFar;'+
		
		'void main(void) {\n'+
			'float light;\n'+

			'if(uUseLight == 1) {\n'+
				'float depthFromLight = length(vpositionLight) * LinearDepthConstant;'+
				
				'vec3 pixelCoord = vpositionLightViewportRegion.xyz / vpositionLightViewportRegion.w;'+
				'vec4 textureFBLightDepth = texture2D(sampler_textureFBLightDepth, pixelCoord.xy);\n'+
				//'float depthFromTexture = unpack(textureFBLightDepth)+0.001;\n'+
				'float depthFromTexture = textureFBLightDepth.x+(0.00001*(uLightFov/2.0));\n'+
				
				
				'light =  depthFromLight > depthFromTexture ? 0.0 : 1.0;\n'+  
				
				
				'if(uLightType == 1) {\n'+ // spot
					'light *=  1.0-smoothstep(0.45, 0.5, length(pixelCoord.xy - vec2(0.5, 0.5)));\n'+
				'} else {\n'+
					'light *=  1.0-smoothstep(0.0, 0.9, length(pixelCoord.xy - vec2(0.5, 0.5)));\n'+
					'light +=  smoothstep(0.0, 0.9, length(pixelCoord.xy - vec2(0.5, 0.5)));\n'+
				'}\n'+
				
				
				'gl_FragColor = vec4(uLightColor*light, 1.0);\n'+
				//'gl_FragColor = vec4(depthFromLight,depthFromLight,depthFromLight, 1.0);\n'+ // for testing depth from light
				//'gl_FragColor = vec4(depthFromTexture,depthFromTexture,depthFromTexture, 1.0);\n'+ // for testing depth from texture
			'} else {\n'+
				'gl_FragColor = vec4(0.0,0.0,0.0,1.0);\n'+
			'}\n'+
		'}';
	this.shader_Shadows = this.gl.createProgram();
	this.createShader(this.gl, "SHADOWS", sourceVertex, sourceFragment, this.shader_Shadows, this.pointers_Shadows.bind(this));
};
/**
 * @private 
 */
StormGLContext.prototype.pointers_Shadows = function() {
	this.u_Shadows_far = this.gl.getUniformLocation(this.shader_Shadows, "uFar");
	
	this.u_Shadows_textureFBLightDepth = this.gl.getUniformLocation(this.shader_Shadows, "sampler_textureFBLightDepth");// RT1 rgba zdepth light[0]
	
	this.u_Shadows_useLight = this.gl.getUniformLocation(this.shader_Shadows, "uUseLight");
	this.u_Shadows_lightType = this.gl.getUniformLocation(this.shader_Shadows, "uLightType");
	this.u_Shadows_lightColor = this.gl.getUniformLocation(this.shader_Shadows, "uLightColor");
	this.u_Shadows_lightFov = this.gl.getUniformLocation(this.shader_Shadows, "uLightFov");
	

	this.attr_Shadows_pos = this.gl.getAttribLocation(this.shader_Shadows, "aVertexPosition");
	this.attr_Shadows_posX = this.gl.getAttribLocation(this.shader_Shadows, "aVertexPositionX");
	this.attr_Shadows_posY = this.gl.getAttribLocation(this.shader_Shadows, "aVertexPositionY");
	this.attr_Shadows_posZ = this.gl.getAttribLocation(this.shader_Shadows, "aVertexPositionZ");

	this.u_Shadows_PMatrix = this.gl.getUniformLocation(this.shader_Shadows, "uPMatrix");
	this.u_Shadows_PMatrixLight = this.gl.getUniformLocation(this.shader_Shadows, "uPMatrixLight");
	this.u_Shadows_cameraWMatrix = this.gl.getUniformLocation(this.shader_Shadows, "u_cameraWMatrix");
	this.u_Shadows_nodeWMatrix = this.gl.getUniformLocation(this.shader_Shadows, "u_nodeWMatrix");
	this.u_Shadows_nodeVScale = this.gl.getUniformLocation(this.shader_Shadows, "u_nodeVScale");
	this.u_Shadows_lightWMatrix = this.gl.getUniformLocation(this.shader_Shadows, "u_lightWMatrix");
	
	this.u_Shadows_positionLight = this.gl.getUniformLocation(this.shader_Shadows, "u_positionLight");
	this.Shader_Shadows_READY = true;
};
/**
 * @private 
 */
StormGLContext.prototype.render_Shadows = function(currentLight) {
	
	var light =  currentLight;
	this.gl.uniform1i(this.u_Shadows_lightType, (light.type == 'sun')?0:1); // sun 0 ; spot 1   (light.type == 'sun')?0:1
	this.gl.uniform3f(this.u_Shadows_lightColor, light.color.e[0], light.color.e[1], light.color.e[2]);
    this.gl.uniform1f(this.u_Shadows_lightFov, light.getFov());
    this.gl.uniform1i(this.u_Shadows_useLight, currentLight.visibleOnContext);
	this.gl.uniform1f(this.u_Shadows_far, this.far);
	
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light' && this.nodes[n].shadows==true) { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
			for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {			
				this.gl.activeTexture(this.gl.TEXTURE0);
				
				if(light.type == 'sun') {
					this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSun); // texture framebuffer light sun
				} else {
					this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_LightSpot); // texture framebuffer light spot
				}
				
				this.gl.uniform1i(this.u_Shadows_textureFBLightDepth, 0);

				this.gl.uniformMatrix4fv(this.u_Shadows_PMatrix, false, this._sec.defaultCamera.mPMatrix.transpose().e); 
				this.gl.uniformMatrix4fv(this.u_Shadows_PMatrixLight, false, light.mPMatrix.transpose().e); 
				this.gl.uniformMatrix4fv(this.u_Shadows_lightWMatrix, false, light.MPOS.transpose().e);
				this.gl.uniformMatrix4fv(this.u_Shadows_nodeWMatrix, false, this.nodes[n].MPOSFrame.transpose().e);
				this.gl.uniform3f(this.u_Shadows_nodeVScale, this.nodes[n].VSCALE.e[0], this.nodes[n].VSCALE.e[1], this.nodes[n].VSCALE.e[2]); 
				this.gl.uniformMatrix4fv(this.u_Shadows_cameraWMatrix, false, this._sec.defaultCamera.MPOS.transpose().e);
				this.gl.uniform3f(this.u_Shadows_positionLight, false, light.getPosition().e[0], light.getPosition().e[1], light.getPosition().e[2]);
				
				this.gl.enableVertexAttribArray(this.attr_Shadows_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_Shadows_pos, 3, this.gl.FLOAT, false, 0, 0);
				
				if(this.nodes[n].buffersObjects[nb].nodeMeshIndexArray != undefined) {
					this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshIndexBuffer);
					this.gl.drawElements(this.gl.TRIANGLES, this.nodes[n].buffersObjects[nb].nodeMeshIndexBufferNumItems, this.gl.UNSIGNED_SHORT, 0);
				} else {
					this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nodes[n].buffersObjects[nb].nodeMeshVertexBufferNumItems);
				} 
				
			}
		}
	}
};