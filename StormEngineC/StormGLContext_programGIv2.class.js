/*----------------------------------------------------------------------------------------
     									GI VOXEL TRAVERSAL
----------------------------------------------------------------------------------------*/ 
/** @private  */
StormGLContext.prototype.initShader_GIv2 = function() {
	var sourceVertex = 	this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec3 aVertexNormal;\n'+
		
		'uniform mat4 u_nodeWMatrix;\n'+
		'uniform vec3 u_nodeVScale;\n'+
		'uniform mat4 u_cameraWMatrix;\n'+
		'uniform mat4 uPMatrix;\n'+
		
		'varying vec4 vposition;\n'+
		'varying vec4 vnormal;\n'+
		'varying vec4 vposScreen;\n'+
		
		'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'+
		
		'void main(void) {\n'+
			'vec3 vp = vec3(aVertexPosition.x*u_nodeVScale.x, aVertexPosition.y*u_nodeVScale.y, aVertexPosition.z*u_nodeVScale.z);\n'+
			'vposition = u_nodeWMatrix * vec4(vp*vec3(1.0,1.0,1.0), 1.0);\n'+
			'vnormal = vec4(aVertexNormal*vec3(1.0,1.0,1.0), 1.0);\n'+
			'vec4 pos = uPMatrix * u_cameraWMatrix * u_nodeWMatrix * vec4(vp, 1.0);'+
			'vposScreen = ScaleMatrix * pos;\n'+
			'gl_Position = pos;\n'+
		'}';
	var sourceFragment = this.precision+
		'uniform float randX1;\n'+
		'uniform float randY1;\n'+
		'uniform float uTotalSamples;\n'+
		'uniform int uTypePass;\n'+
		'uniform int uMaxBounds;\n'+
		
		'uniform mat4 u_cameraWMatrix;\n'+
		'vec4 cm = u_cameraWMatrix*vec4(1.0,1.0,1.0,1.0);\n'+
		
		'uniform sampler2D sampler_voxelColor;\n\n\n'+
		'uniform sampler2D sampler_voxelPosX;\n\n\n'+
		'uniform sampler2D sampler_voxelPosY;\n\n\n'+
		'uniform sampler2D sampler_voxelPosZ;\n\n\n'+
		'uniform sampler2D sampler_voxelNormal;\n\n\n'+
		
		'uniform sampler2D sampler_screenColor;\n\n\n'+
		'uniform sampler2D sampler_screenPos;\n\n\n'+
		'uniform sampler2D sampler_screenNormal;\n\n\n'+
		'uniform sampler2D sampler_finalShadow;\n\n\n'+
		
		'varying vec4 vposition;\n'+
		'varying vec4 vnormal;\n'+
		'varying vec4 vposScreen;\n'+
		
		'vec3 getVector(vec3 vecNormal, float Ns, vec2 vecNoise) {\n'+
			'float angleLat = acos(vecNormal.z);\n'+
			'float angleAzim = atan(vecNormal.y,vecNormal.x);\n'+
					
			'float desvLat = (vecNoise.x*180.0)-90.0;\n'+
			'float desvAzim = (vecNoise.y*360.0)-180.0;\n'+
			'angleLat += (Ns*desvLat);\n'+
			'angleAzim += (Ns*desvAzim);\n'+

			'float x = sin(angleLat)*cos(angleAzim);\n'+
			'float z = sin(angleLat)*sin(angleAzim);\n'+
			'float y = cos(angleLat);\n'+
			
			'return vec3(x,y,z);\n'+
			//'return vecNormal;\n'+ 
		'}\n'+	
	
		this._sec.utils.unpackGLSLFunctionString()+
		 
		this.stormVoxelizatorObject.rayTraversalInitSTR()+
		'vec4 getVoxel_Color(vec3 voxel, vec3 RayOrigin) {\n'+
			'vec4 rgba = vec4(0.0,0.0,0.0,0.0);\n'+
			
			'int tex3dId = (int(voxel.y)*('+this.stormVoxelizatorObject.resolution+'*'+this.stormVoxelizatorObject.resolution+'))+(int(voxel.z)*('+this.stormVoxelizatorObject.resolution+'))+int(voxel.x);\n'+ 	   
			'float num = float(tex3dId)/wh;\n'+
			'float col = fract(num)*wh;\n'+ 	 
			'float row = floor(num);\n'+ 
			'vec2 texVec = vec2(col*texelSize, row*texelSize);\n'+
			'vec4 texture = texture2D(sampler_voxelColor,vec2(texVec.x, texVec.y));\n'+
			'if(texture.a/255.0 > 0.5) {\n'+ // existen triángulos dentro? 
				'rgba = vec4(texture.rgb/255.0,1.0);\n'+
			'}\n'+
					
			'return rgba;\n'+
		'}\n'+
		'vec4 getVoxel_Pos(vec3 voxel, vec3 RayOrigin) {\n'+
			'vec4 rgba = vec4(0.0,0.0,0.0,0.0);\n'+
			
			'int tex3dId = (int(voxel.y)*('+this.stormVoxelizatorObject.resolution+'*'+this.stormVoxelizatorObject.resolution+'))+(int(voxel.z)*('+this.stormVoxelizatorObject.resolution+'))+int(voxel.x);\n'+ 	   
			'float num = float(tex3dId)/wh;\n'+
			'float col = fract(num)*wh;\n'+ 	 
			'float row = floor(num);\n'+ 
			'vec2 texVec = vec2(col*texelSize, row*texelSize);\n'+
			'vec4 texture = texture2D(sampler_voxelNormal,vec2(texVec.x, texVec.y));\n'+
			'if(texture.a/255.0 > 0.5) {\n'+ // existen triángulos dentro? 
				'float texVoxelPosX = unpack(texture2D(sampler_voxelPosX,  vec2(texVec.x,texVec.y))/255.0);\n'+ 
				'float texVoxelPosY = unpack(texture2D(sampler_voxelPosY,  vec2(texVec.x,texVec.y))/255.0);\n'+ 
				'float texVoxelPosZ = unpack(texture2D(sampler_voxelPosZ,  vec2(texVec.x,texVec.y))/255.0);\n'+ 
				
				'rgba = vec4( (texVoxelPosX*'+this.stormVoxelizatorObject.size.toFixed(2)+')-'+(this.stormVoxelizatorObject.size/2.0).toFixed(2)+','+
				'			  (texVoxelPosY*'+this.stormVoxelizatorObject.size.toFixed(2)+')-'+(this.stormVoxelizatorObject.size/2.0).toFixed(2)+','+
				'			  (texVoxelPosZ*'+this.stormVoxelizatorObject.size.toFixed(2)+')-'+(this.stormVoxelizatorObject.size/2.0).toFixed(2)+','+
				'			1.0);\n'+
				//'rgba = vec4(texVoxelPosX,texVoxelPosY,texVoxelPosZ,1.0);\n'+ 
			'}\n'+
					
			'return rgba;\n'+
		'}\n'+
		'vec4 getVoxel_Normal(vec3 voxel, vec3 RayOrigin) {\n'+
			'vec4 rgba = vec4(0.0,0.0,0.0,0.0);\n'+
			
			'int tex3dId = (int(voxel.y)*('+this.stormVoxelizatorObject.resolution+'*'+this.stormVoxelizatorObject.resolution+'))+(int(voxel.z)*('+this.stormVoxelizatorObject.resolution+'))+int(voxel.x);\n'+ 	   
			'float num = float(tex3dId)/wh;\n'+
			'float col = fract(num)*wh;\n'+ 	 
			'float row = floor(num);\n'+ 
			'vec2 texVec = vec2(col*texelSize, row*texelSize);\n'+
			'vec4 texture = texture2D(sampler_voxelNormal,vec2(texVec.x, texVec.y));\n'+
			'if(texture.a/255.0 > 0.5) {\n'+ // existen triángulos dentro? 				
				'rgba = vec4(((texture.rgb/255.0)*2.0)-1.0,1.0);\n'+  
				//'rgba = vec4(texture.rgb/255.0,1.0);\n'+  
			'}\n'+
					
			'return rgba;\n'+
		'}\n'+
		
		this.stormVoxelizatorObject.rayTraversalSTR(''+
			'if(uTypePass == 0) gv = getVoxel_Color(voxel, RayOrigin);'+
			'else if(uTypePass == 1) gv = getVoxel_Pos(voxel, RayOrigin);'+ 
			'else gv = getVoxel_Normal(voxel, RayOrigin);'+ 
			'if(gv.a != 0.0) {'+
				'color = gv;\n'+
				'break;\n'+
			'}'+
		'')+ 
		
		'void main(void) {\n'+
			'vec3 pixelCoord = vposScreen.xyz / vposScreen.w;'+
			'vec3 RayOrigin; vec3 RayDir; vec3 ro; vec3 rd;'+
			
			'float maxBound = float(uMaxBounds);'+
			'vec4 color;'+		
			'float maxang=0.8928571428571429;'+   
			//'float maxang=(uTotalSamples == 0.0)?0.0:0.8928571428571429;'+  
			//'float maxang=(uTotalSamples == 0.0)?0.0:1.0;'+ 
			
			'vec4 texScreenColor = texture2D(sampler_screenColor,  vec2(pixelCoord.x,pixelCoord.y));\n'+
			'vec4 texScreenPos = texture2D(sampler_screenPos,  vec2(pixelCoord.x,pixelCoord.y));\n'+ 
			'vec4 texScreenNormal = texture2D(sampler_screenNormal,  vec2(pixelCoord.x,pixelCoord.y));\n'+
			'if(texScreenNormal.a == 0.0) {'+ // IF texScreenNormal.a == 0.0 Return to origin.
				'if(uTypePass == 0) color = vec4(1.0,1.0,1.0, 0.0);\n'+ // save in textureFB_GIv2_screenColorTEMP
				'else if(uTypePass == 1) color = vec4(0.0,0.0,0.0, 0.0);\n'+ // save in textureFB_GIv2_screenPosTEMP
				'else color = vec4(0.0,0.0,0.0, 0.5);\n'+ // save in textureFB_GIv2_screenNormalTEMP // alpha 1.0 (found solid)
			'} else if(texScreenNormal.a == 0.5) {'+ // IF texScreenNormal.a == 0.5 Start.	
				'RayOrigin = vec3(vposition.x,vposition.y,vposition.z);\n'+
				'RayDir = vec3(vnormal.x,vnormal.y,vnormal.z);\n'+
				'ro = RayOrigin*vec3(1.0,1.0,-1.0);'+
				//'ro = RayOrigin;'+
				'rd = RayDir*vec3(1.0,1.0,-1.0);'+
				//'rd = RayDir;'+
			'} else if(texScreenNormal.a == 1.0) {'+ 
				'RayOrigin = vec3(texScreenPos.xyz);\n'+
				'RayDir = vec3(texScreenNormal.xyz);\n'+
				'ro = RayOrigin;'+
				'rd = RayDir;'+
			'}'+
			'if(texScreenNormal.a > 0.0) {'+
				'vec3 vectorRandom = getVector(reflect(normalize(ro),rd), maxang, vec2(randX1,randY1));'+
				'vec4 rayT = rayTraversal(ro+(rd*(cs+cs)), vectorRandom);\n'+     // rX 0.0 perpend to normal; 0.5 parallel; 1.0 perpend    
				//'vec4 rayT = rayTraversal(ro+(rd*(cs+cs)), vectorRandom);\n'+     // rX 0.0 perpend to normal; 0.5 parallel; 1.0 perpend
				
				//'if(texScreenColor.a < maxBound) {'+   
					'if(rayT.a > 0.0) {'+ // hit in solid
						'float rx = abs((randX1-0.5)*2.0);'+
						'rx = 1.0-rx;'+
						'float ry = abs((randY1-0.5)*2.0);'+
						'ry = 1.0-ry;'+ 
						
						'if(uTypePass == 0) color = vec4(texScreenColor.r*rayT.r,texScreenColor.g*rayT.g,texScreenColor.b*rayT.b, texScreenColor.a+1.0);\n'+ // save in textureFB_GIv2_screenColorTEMP
						'else if(uTypePass == 1) color = vec4(rayT.r,rayT.g,rayT.b, texScreenPos.a+(1.0));\n'+ // save in textureFB_GIv2_screenPosTEMP
						'else color = vec4(rayT.r,rayT.g,rayT.b, 1.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP // alpha 1.0 (found solid)
					'} else {'+ // hit in light
						'if(uTypePass == 0) color = vec4(texScreenColor.r,texScreenColor.g,texScreenColor.b, texScreenColor.a+1.0);\n'+ // save in textureFB_GIv2_screenColorTEMP
						'else if(uTypePass == 1) color = vec4(1.0,1.0,1.0, texScreenPos.a-1.0);\n'+ // save in textureFB_GIv2_screenPosTEMP
						'else color = vec4(1.0,1.0,1.0, 0.0);\n'+ // save in textureFB_GIv2_screenNormalTEMP  // alpha 0.0 (make process and return to origin).
					'}'+
				//'}'+
			'}'+	
			
				
			//'color = vec4(vposition.xyz, 1.0);\n'+              
			//'color = vec4(vnormal.xyz, 1.0);\n'+  // for view dir
			
			'gl_FragColor = color;\n'+
			
		'}';
	this.shader_GIv2 = this.gl.createProgram();
	this.createShader(this.gl, "GIv2", sourceVertex, sourceFragment, this.shader_GIv2, this.pointers_GIv2.bind(this));
};
/** @private  */
StormGLContext.prototype.pointers_GIv2 = function() {
	this.attr_GIv2_pos = this.gl.getAttribLocation(this.shader_GIv2, "aVertexPosition");
	this.attr_GIv2_normal = this.gl.getAttribLocation(this.shader_GIv2, "aVertexNormal");
	
	this.sampler_GIv2_voxelColor = this.gl.getUniformLocation(this.shader_GIv2, "sampler_voxelColor");
	this.sampler_GIv2_voxelPosX = this.gl.getUniformLocation(this.shader_GIv2, "sampler_voxelPosX");
	this.sampler_GIv2_voxelPosY = this.gl.getUniformLocation(this.shader_GIv2, "sampler_voxelPosY");
	this.sampler_GIv2_voxelPosZ = this.gl.getUniformLocation(this.shader_GIv2, "sampler_voxelPosZ");
	this.sampler_GIv2_voxelNormal = this.gl.getUniformLocation(this.shader_GIv2, "sampler_voxelNormal");
	
	this.sampler_GIv2_screenColor = this.gl.getUniformLocation(this.shader_GIv2, "sampler_screenColor");
	this.sampler_GIv2_screenPos = this.gl.getUniformLocation(this.shader_GIv2, "sampler_screenPos");
	this.sampler_GIv2_screenNormal = this.gl.getUniformLocation(this.shader_GIv2, "sampler_screenNormal");
	this.sampler_GIv2_finalShadow = this.gl.getUniformLocation(this.shader_GIv2, "sampler_finalShadow");
	
	this.u_GIv2_randX1 = this.gl.getUniformLocation(this.shader_GIv2, "randX1");
	this.u_GIv2_randY1 = this.gl.getUniformLocation(this.shader_GIv2, "randY1");
	this.u_GIv2_totalSamples = this.gl.getUniformLocation(this.shader_GIv2, "uTotalSamples");
	this.u_GIv2_typePass = this.gl.getUniformLocation(this.shader_GIv2, "uTypePass");
	this.u_GIv2_maxBounds = this.gl.getUniformLocation(this.shader_GIv2, "uMaxBounds");
	
	this.u_GIv2_PMatrix = this.gl.getUniformLocation(this.shader_GIv2, "uPMatrix");
	this.u_GIv2_cameraWMatrix = this.gl.getUniformLocation(this.shader_GIv2, "u_cameraWMatrix");
	this.u_GIv2_nodeWMatrix = this.gl.getUniformLocation(this.shader_GIv2, "u_nodeWMatrix");
	this.u_GIv2_nodeVScale = this.gl.getUniformLocation(this.shader_GIv2, "u_nodeVScale");
	this.Shader_GIv2_READY = true;
	this._sec.setZeroSamplesGIVoxels();
};
/** @private  */
StormGLContext.prototype.render_GIv2 = function() { 
	this.render_GIv2_AUX();
	this.gl.uniform1i(this.u_GIv2_maxBounds, this._sec.giv2.maxBounds);
};
/** @private  */
StormGLContext.prototype.render_GIv2_AUX = function() { 
	for(var n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].visibleOnContext == true && this.nodes[n].objectType != 'light') { // this.nodes[n].objectType != 'light' por malla nodeCtxWebGL de luces
			for(var nb = 0, fb = this.nodes[n].buffersObjects.length; nb < fb; nb++) {	
				this.gl.uniformMatrix4fv(this.u_GIv2_PMatrix, false, this._sec.defaultCamera.mPMatrix.transpose().e);
				this.gl.uniformMatrix4fv(this.u_GIv2_cameraWMatrix, false, this._sec.defaultCamera.MPOS.transpose().e);
				this.gl.uniformMatrix4fv(this.u_GIv2_nodeWMatrix, false, this.nodes[n].MPOSFrame.transpose().e); 
				this.gl.uniform3f(this.u_GIv2_nodeVScale, this.nodes[n].VSCALE.e[0], this.nodes[n].VSCALE.e[1], this.nodes[n].VSCALE.e[2]);   
				
				this.gl.activeTexture(this.gl.TEXTURE0);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsColor.items[0].textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelColor, 0);
				
				this.gl.activeTexture(this.gl.TEXTURE1);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsPositionX.items[0].textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelPosX, 1);
				
				this.gl.activeTexture(this.gl.TEXTURE2);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsPositionY.items[0].textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelPosY, 2);
				
				this.gl.activeTexture(this.gl.TEXTURE3);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsPositionZ.items[0].textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelPosZ, 3);
				
				this.gl.activeTexture(this.gl.TEXTURE4);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.stormVoxelizatorObject.clglBuff_VoxelsNormal.items[0].textureData);
				this.gl.uniform1i(this.sampler_GIv2_voxelNormal, 4);
				
				this.gl.activeTexture(this.gl.TEXTURE5);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenColor);
				this.gl.uniform1i(this.sampler_GIv2_screenColor, 5);	
				
				this.gl.activeTexture(this.gl.TEXTURE6);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos);
				this.gl.uniform1i(this.sampler_GIv2_screenPos, 6);		
				
				this.gl.activeTexture(this.gl.TEXTURE7);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal);
				this.gl.uniform1i(this.sampler_GIv2_screenNormal, 7);		
	
				this.gl.activeTexture(this.gl.TEXTURE8);
				this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel);
				this.gl.uniform1i(this.sampler_GIv2_finalShadow, 8);
				
				this.gl.uniform1f(this.u_GIv2_randX1, Math.random());
				this.gl.uniform1f(this.u_GIv2_randY1, Math.random());
				this.gl.uniform1f(this.u_GIv2_totalSamples, this.sampleGiVoxels);
				
				this.gl.enableVertexAttribArray(this.attr_GIv2_pos);
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshVertexBuffer);
				this.gl.vertexAttribPointer(this.attr_GIv2_pos, 3, this.gl.FLOAT, false, 0, 0);
				if(this.nodes[n].buffersObjects[nb].nodeMeshNormalArray != undefined) {
					this.gl.enableVertexAttribArray(this.attr_GIv2_normal);
					this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.nodes[n].buffersObjects[nb].nodeMeshNormalBuffer);
					this.gl.vertexAttribPointer(this.attr_GIv2_normal, 3, this.gl.FLOAT, false, 0, 0);
				}
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





/*----------------------------------------------------------------------------------------
     									GI VOXEL TRAVERSAL EXEC
----------------------------------------------------------------------------------------*/
/** @private  */
StormGLContext.prototype.initShader_GIv2Exec = function() {
	var sourceVertex = 	this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec2 aTextureCoord;\n'+
	
		'varying vec2 vTextureCoord;\n'+ 
		
		'void main(void) {\n'+
			'gl_Position = vec4(aVertexPosition, 1.0);\n'+
			'vTextureCoord = aTextureCoord;\n'+
		'}';
	var sourceFragment = this.precision+
		
		'uniform int uMaxBounds;\n'+
		
		'uniform sampler2D sampler_GIVoxel;\n'+
		'uniform sampler2D sampler_screenColor;\n'+
		'uniform sampler2D sampler_screenPos;\n'+
		'uniform sampler2D sampler_screenNormal;\n'+
		
		'varying vec2 vTextureCoord;\n'+ 
		
		'void main(void) {\n'+
			'float maxBound = float(uMaxBounds);'+
			'vec4 color;'+
			'vec4 texScreenColor = texture2D(sampler_screenColor, vTextureCoord);\n'+ 
			'vec4 texScreenPos = texture2D(sampler_screenPos, vTextureCoord);\n'+ 
			'vec4 texScreenNormal = texture2D(sampler_screenNormal, vTextureCoord);\n'+ 
			'vec4 texScreenGIVoxel = texture2D(sampler_GIVoxel, vTextureCoord);\n'+ 
			'if(texScreenNormal.a == 0.0) {'+ // texScreenNormal.a == 0.0 (Se encontro luz o maxbounds). 
				'float am = (texScreenColor.a-texScreenPos.a)/(texScreenColor.a);'+
				'vec3 amount = vec3(am, am, am);'+ 
				//'color = vec4(texScreenGIVoxel.xyz+amount, texScreenGIVoxel.a+1.0);'+ // alpha is samples
				'color = vec4(texScreenGIVoxel.xyz+(amount*texScreenColor.rgb), texScreenGIVoxel.a+1.0);'+ // alpha is samples
			'} else {'+ // golpea en solido. No hacemos nada
				'color = texScreenGIVoxel;'+
				//'color = vec4(texScreenGIVoxel.xyz-((texScreenColor.xyz*amount)*0.001), texScreenGIVoxel.a);'+ 
			'}'+
			
			//'color = texScreenNormal;'+ // for view dir
			
			'gl_FragColor = color;'+
		'}';
	this.shader_GIv2Exec = this.gl.createProgram();
	this.createShader(this.gl, "GIv2 EXEC", sourceVertex, sourceFragment, this.shader_GIv2Exec, this.pointers_GIv2Exec.bind(this));
};
/** @private  */
StormGLContext.prototype.pointers_GIv2Exec = function() {
	this.u_GIv2EXEC_maxBounds = this.gl.getUniformLocation(this.shader_GIv2Exec, "uMaxBounds");
	
	this.attr_GIv2EXEC_pos = this.gl.getAttribLocation(this.shader_GIv2Exec, "aVertexPosition");
	this.attr_GIv2EXEC_tex = this.gl.getAttribLocation(this.shader_GIv2Exec, "aTextureCoord");
	
	this.sampler_GIv2EXEC_GIVoxel = this.gl.getUniformLocation(this.shader_GIv2Exec, "sampler_GIVoxel");
	this.sampler_GIv2EXEC_screenColor = this.gl.getUniformLocation(this.shader_GIv2Exec, "sampler_screenColor");
	this.sampler_GIv2EXEC_screenPos = this.gl.getUniformLocation(this.shader_GIv2Exec, "sampler_screenPos");
	this.sampler_GIv2EXEC_screenNormal = this.gl.getUniformLocation(this.shader_GIv2Exec, "sampler_screenNormal");
	
	this.Shader_GIv2Exec_READY = true;
};
/** @private  */
StormGLContext.prototype.render_GIv2Exec = function() { 	
	this.gl.uniform1i(this.u_GIv2EXEC_maxBounds, this._sec.giv2.maxBounds); 
	
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIVoxel);
	this.gl.uniform1i(this.sampler_GIv2EXEC_GIVoxel, 0);				
	
	this.gl.activeTexture(this.gl.TEXTURE1);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenColor);
	this.gl.uniform1i(this.sampler_GIv2EXEC_screenColor, 1);	
	
	this.gl.activeTexture(this.gl.TEXTURE2);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenPos);
	this.gl.uniform1i(this.sampler_GIv2EXEC_screenPos, 2);		
	
	this.gl.activeTexture(this.gl.TEXTURE3);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureFB_GIv2_screenNormal);
	this.gl.uniform1i(this.sampler_GIv2EXEC_screenNormal, 3);		
	
	
	
	this.gl.enableVertexAttribArray(this.attr_GIv2EXEC_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer_QUAD);
	this.gl.vertexAttribPointer(this.attr_GIv2EXEC_pos, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.enableVertexAttribArray(this.attr_GIv2EXEC_tex);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureBuffer_QUAD);
	this.gl.vertexAttribPointer(this.attr_GIv2EXEC_tex, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer_QUAD);
	this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);	

};