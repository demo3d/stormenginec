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
 // CARGA ESCENA INICIALMENTE EN MEMORIA CONSTANTE (RAPIDO, PERO NO PERMITE ESCENAS GRANDES)
StormRender = function(DIVID) {
	this.canvasRenderObject = document.getElementById(DIVID);
	this.viewportWidth = this.canvasRenderObject.width;
	this.viewportHeight = this.canvasRenderObject.height;
	this.ctx2Drender = this.canvasRenderObject.getContext("2d");
	this.canvasData = this.ctx2Drender.getImageData(0, 0, this.viewportWidth, this.viewportHeight);
	
	

	
	this.canvasDataNoise = stormEngineC.stormGLContext.arrayTEX_noise;
	
	
	this.displace = 0;
	this.sampleNoise = 0;
	
	this.nodes = stormEngineC.nodes;
	this.lights = stormEngineC.lights;
	this.REALLIGHTLENGTH = 0;
	
	this.MAXDEPTH = 5;
	this.ambientColor = stormEngineC.stormGLContext.ambientColor;
	var kernelSrc_X = ''+
	'__constant float3 ambientColor = (float3)('+this.ambientColor.e[0].toFixed(4)+'f,'+this.ambientColor.e[1].toFixed(4)+'f,'+this.ambientColor.e[2].toFixed(4)+'f);\n'+
	//'__constant float points[3] = {0.0000,1.0000,-0.0000};\n'+
	//'__constant uint MAXBOUNCES = 3;\n'+
	this.objects()+
	/*'float randR(float2 co){\n'+
		'float i;\n'+
		'return fabs(fract(sin(dot(co.xy ,(float2)(12.9898, 78.233))) * 43758.5453, &i));\n'+
	'}\n'+*/
	'float3 reflectA(float3 I, float3 N) {'+
		'return I - 2.0f * dot(N,I) * N;\n'+
	'}'+
	'float3 getVector(float3 vecNormal, float Ns, uint displace, float2 vecNoise) {\n'+
		'float angleLat = asin(vecNormal.y/1.0f);\n'+
		'float angleAzim = asin(vecNormal.x/cos(angleLat));\n'+
				
		
		'float desvX = -1.0f+(vecNoise.x*2.0f);\n'+
		'float desvY = -1.0f+(vecNoise.y*2.0f);\n'+
		'float angleRandLat = angleLat+((Ns*desvX)*100);\n'+
		'float angleRandAzim = angleAzim+((Ns*desvY)*100);\n'+

		'float z = cos(angleRandLat)*cos(angleRandAzim);\n'+
		'float x = cos(angleRandLat)*sin(angleRandAzim);\n'+
		'float y = sin(angleRandLat);\n'+
		'float3 vec = ((float3)(x,y,z));\n'+
		
		
		'return fast_normalize((float3)(vec.x,vec.y,vec.z));\n'+

	'}\n'+
	
	
	
	//RAY TRIANGLE INTERSECT http://www.softsurfer.com/Archive/algorithm_0105/algorithm_0105.htm
	'float3 setRayTriangle(float3 vecRayOrigin, float3 vecRayEnd, float3 vecVertexA, float3 vecVertexB, float3 vecVertexC, float3 u, float3 v, float3 n) {\n'+
		'float SMALL_NUM = 0.00000001f;\n'+

		'float3 dir = vecRayEnd-vecRayOrigin;\n'+ // direccion del rayo
		'float3 w0 = vecRayOrigin-vecVertexA;\n'+
		'float a = -dot(n, w0);\n'+
		'float b = dot(n, dir);\n'+
		'if(fabs(b) < SMALL_NUM) {\n'+
			'if(a == 0.0f) {\n'+ // intersecta paralelo a triangulo 
				//this.p = 0.01;
				//return 0.0;
			'} else {return 0.0f;}\n'+
		'}\n'+

		'float r = a / b;\n'+ // distancia al punto de interseccion
		'if (r < 0.0f && r > 1.0f) {return 0.0f;}\n'+ // si mayor a vecRayEnd no intersecta

		'float3 I = vecRayOrigin+r*dir;\n'+ // vector desde origen a punto de intersección

		'float uu = dot(u,u);\n'+
		'float uv = dot(u,v);\n'+
		'float vv = dot(v,v);\n'+
		'float3 w = I-vecVertexA;\n'+
		'float wu = dot(w,u);\n'+
		'float wv = dot(w,v);\n'+
		'float D = (uv * uv) - (uu * vv);\n'+
		
		'float s = ((uv * wv) - (vv * wu)) / D;\n'+
		'if(s < 0.0f || s > 1.0f) {return 0.0f;}\n'+ // interseccion esta fuera del triangulo
			 
		'float t = ((uv * wu) - (uu * wv)) / D;\n'+
		'if(t < 0.0f || (s + t) > 1.0f) {return 0.0f;}\n'+ // interseccion esta fuera del triangulo
		
		'return (float3)(fast_length(dir)*r, s, t);\n'+ // interseccion esta dentro del triangulo
	'}\n\n'+
	
	'float16 rayTriangle(float3 vecRayOrigin, float3 vecRayEnd){\n'+
		this.rayTriangle()+
	'}\n\n'+

	this.bounces()+

	
	
	
	


	'__kernel void kernelX(const __global float* Ax,'+
							'const __global float* Ay,'+
							'const __global float* Az,'+
							'const __global float* Bx,'+
							'const __global float* By,'+
							'const __global float* Bz,'+
							'__global float* noiseX,'+
							'__global float* noiseY,'+
							'__global uint* outColorX,'+
							'__global uint* outColorY,'+
							'__global uint* outColorZ,'+
							'__global float* totalColorX,'+
							'__global float* totalColorY,'+
							'__global float* totalColorZ,'+
							'__global float* totalShadow,'+
							'__global uint* sample,'+
							'uint displace'+
							') {\n'+

		'int x = get_global_id(0);\n'+
		
		
		'float4 datas = rayScene((float3)(Ax[x],Ay[x],Az[x]), (float3)(Bx[x],By[x],Bz[x]), (float2)(noiseX[x],noiseY[x]), displace);\n'+
		
		'sample[x]+=1;\n'+
		'totalColorX[x] += datas.s0;\n'+
		'totalColorY[x] += datas.s1;\n'+
		'totalColorZ[x] += datas.s2;\n'+
		
		'totalShadow[x] += datas.s3;\n'+
		
		
		'outColorX[x] = (totalColorX[x]/(float)(sample[x]))*(totalShadow[x]/sample[x])*255;\n'+
		'outColorY[x] = (totalColorY[x]/(float)(sample[x]))*(totalShadow[x]/sample[x])*255;\n'+
		'outColorZ[x] = (totalColorZ[x]/(float)(sample[x]))*(totalShadow[x]/sample[x])*255;\n'+
			
	'}\n';
		
	var clProgram_X = clContext.createProgramWithSource(kernelSrc_X);
	try {
		clProgram_X.buildProgram([clDevices[0]], "");
	} catch(e) {
		alert("Failed to build WebCL program. Error "+clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_STATUS)+":  "+ clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_LOG));
		throw e;
	}
	this.clKernel_X = clProgram_X.createKernel("kernelX");


	this.bufferSize = ((this.viewportWidth*this.viewportHeight)*4); // vectorLength * 4

	this.buffIn1x = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);//CL_MEM_READ_ONLY - CL_MEM_WRITE_ONLY - CL_MEM_READ_WRITE
	this.buffIn1y = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffIn1z = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffIn2x = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffIn2y = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffIn2z = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffInNoisex = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffInNoisey = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize);
	this.buffOutColorX = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffOutColorY = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffOutColorZ = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalColorX = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalColorY = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalColorZ = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.buffTotalShadow = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);
	this.bufferSample = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize);

	this.clKernel_X.setKernelArg(0, this.buffIn1x);
	this.clKernel_X.setKernelArg(1, this.buffIn1y);
	this.clKernel_X.setKernelArg(2, this.buffIn1z);
	this.clKernel_X.setKernelArg(3, this.buffIn2x);
	this.clKernel_X.setKernelArg(4, this.buffIn2y);
	this.clKernel_X.setKernelArg(5, this.buffIn2z);
	this.clKernel_X.setKernelArg(6, this.buffInNoisex);
	this.clKernel_X.setKernelArg(7, this.buffInNoisey);
	this.clKernel_X.setKernelArg(8, this.buffOutColorX);
	this.clKernel_X.setKernelArg(9, this.buffOutColorY);
	this.clKernel_X.setKernelArg(10, this.buffOutColorZ);
	this.clKernel_X.setKernelArg(11, this.buffTotalColorX);
	this.clKernel_X.setKernelArg(12, this.buffTotalColorY);
	this.clKernel_X.setKernelArg(13, this.buffTotalColorZ);
	this.clKernel_X.setKernelArg(14, this.buffTotalShadow);
	this.clKernel_X.setKernelArg(15, this.bufferSample);
	//this.clKernel_X.setKernelArg(11, this.sample, WebCL.types.UINT);

	this.clDataObject_1x = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_1y = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_1z = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_2x = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_2y = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_2z = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_Noisex = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.clDataObject_Noisey = new Float32Array((this.viewportWidth*this.viewportHeight)); // vectorLength
	this.outBufferx = new Uint32Array((this.viewportWidth*this.viewportHeight));
	this.outBuffery = new Uint32Array((this.viewportWidth*this.viewportHeight));
	this.outBufferz = new Uint32Array((this.viewportWidth*this.viewportHeight));
	this.arrayTotalColorX = new Float32Array(this.viewportWidth*this.viewportHeight);
	this.arrayTotalColorY = new Float32Array(this.viewportWidth*this.viewportHeight);
	this.arrayTotalColorZ = new Float32Array(this.viewportWidth*this.viewportHeight);
	this.arrayTotalShadow = new Float32Array(this.viewportWidth*this.viewportHeight);
	this.arraySample = new Uint32Array((this.viewportWidth*this.viewportHeight));
	
	
};
StormRender.prototype.bounces = function() {
	var string = '';
	
			
	for(var d = this.MAXDEPTH; d >= 0;d--) {
		string += ''+
			'float4 raySceneS'+d+'(float3 vecRayOrigin, float3 vecRayEnd, float2 vecNoise, uint displace, uint depth, float4 color){\n'+
				this.raySceneS(d)+
			'}\n\n';
	}
	string += ''+
			'float4 rayScene(float3 vecRayOrigin, float3 vecRayEnd, float2 vecNoise, uint displace){\n'+
				this.rayScene()+
			'}\n\n';
	return string;
};
StormRender.prototype.objects = function() {
	var string = '';
	var NUM = 0;
	for(var n = 0; n < this.nodes.length; n++) {
			
		
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			
			
			
			string += ''+
				'__constant float NODE'+NUM+'_pNs = '+this.nodes[n].buffersObjects[nb].Ns.toFixed(4)+'f;\n'+
				'__constant float3 NODE'+NUM+'_pKd = (float3)('+this.nodes[n].buffersObjects[nb].Kd.e[0].toFixed(4)+'f,'+this.nodes[n].buffersObjects[nb].Kd.e[1].toFixed(4)+'f,'+this.nodes[n].buffersObjects[nb].Kd.e[2].toFixed(4)+'f);\n';
			
			var strArrayKd = '';
			var separat = '';
			var textureLength = 0;
			for(var b = 0; b < this.nodes[n].buffersObjects[nb].arrayTEX_Kd.length/4; b++) {
				var jump = b*4;
				strArrayKd += separat+(this.nodes[n].buffersObjects[nb].arrayTEX_Kd[jump]/255).toFixed(7)+'f, '+(this.nodes[n].buffersObjects[nb].arrayTEX_Kd[jump+1]/255).toFixed(7)+'f, '+(this.nodes[n].buffersObjects[nb].arrayTEX_Kd[jump+2]/255).toFixed(7)+'f';
				
				separat = ',';
				textureLength++;
			}
			string += ''+
				'__constant float NODE'+NUM+'_arrKd['+textureLength*3+'] = {'+strArrayKd+'};\n'+
				'__constant uint NODE'+NUM+'_arrKdWidth = '+this.nodes[n].buffersObjects[nb].imageElement_Kd.width+';\n'+
				'__constant uint NODE'+NUM+'_arrKdHeight = '+this.nodes[n].buffersObjects[nb].imageElement_Kd.height+';\n';
			
			var strVA = '';
			var strVB = '';
			var strVC = '';
			var strTEXA = '';
			var strTEXB = '';
			var strTEXC = '';
			var separat = '';
			var arrayLength = 0;
			for(var b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
				var saltosIdx = b*3;
				idxA = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
				idxB = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+1] * 3;
				idxC = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+2] * 3;

				// VERTEXS
				var VA = this.nodes[n].mWMatrixFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA],
															0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA+1],
															0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA+2],
															0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
				var VB = this.nodes[n].mWMatrixFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
															0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
															0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
															0.0,0.0,0.0,1.0]));
				var VC = this.nodes[n].mWMatrixFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
															0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
															0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
															0.0,0.0,0.0,1.0]));
				
				strVA += separat+VA.e[3].toFixed(4)+'f, '+VA.e[7].toFixed(4)+'f, '+VA.e[11].toFixed(4)+'f'; // posicion xyz en WORLD SPACE de un vertice
				strVB += separat+VB.e[3].toFixed(4)+'f, '+VB.e[7].toFixed(4)+'f, '+VB.e[11].toFixed(4)+'f';
				strVC += separat+VC.e[3].toFixed(4)+'f, '+VC.e[7].toFixed(4)+'f, '+VC.e[11].toFixed(4)+'f';
				
				
				// TEXTURES
				var TEXA = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA+2]]);
				var TEXB = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB+2]]);
				var TEXC = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC+2]]);
				strTEXA += separat+TEXA.e[0].toFixed(4)+'f, '+TEXA.e[1].toFixed(4)+'f, '+TEXA.e[2].toFixed(4)+'f'; 
				strTEXB += separat+TEXB.e[0].toFixed(4)+'f, '+TEXB.e[1].toFixed(4)+'f, '+TEXB.e[2].toFixed(4)+'f';
				strTEXC += separat+TEXC.e[0].toFixed(4)+'f, '+TEXC.e[1].toFixed(4)+'f, '+TEXC.e[2].toFixed(4)+'f';
				
				
				separat = ',';
				arrayLength++;
			}
			string += ''+
				'__constant float NODE'+NUM+'_vA['+arrayLength*3+'] = {'+strVA+'};\n'+
				'__constant float NODE'+NUM+'_vB['+arrayLength*3+'] = {'+strVB+'};\n'+
				'__constant float NODE'+NUM+'_vC['+arrayLength*3+'] = {'+strVC+'};\n'+
				'__constant float NODE'+NUM+'_texA['+arrayLength*3+'] = {'+strTEXA+'};\n'+
				'__constant float NODE'+NUM+'_texB['+arrayLength*3+'] = {'+strTEXB+'};\n'+
				'__constant float NODE'+NUM+'_texC['+arrayLength*3+'] = {'+strTEXC+'};\n'+
				'__constant uint NODE'+NUM+'_length = '+arrayLength+';\n';
			NUM++;
		}
	}
	
	
	
	var sepa = '';
	var strLights = '';
	for(var nL = 0; nL < this.lights.length; nL++) {
		if(this.lights[nL].type != 'sun') {
			strLights += sepa+'(float3)('+this.lights[nL].mrealWMatrixFrame.e[3].toFixed(4)+'f,'+this.lights[nL].mrealWMatrixFrame.e[7].toFixed(4)+'f,'+this.lights[nL].mrealWMatrixFrame.e[11].toFixed(4)+'f)';
			sepa = ',';
			this.REALLIGHTLENGTH++; 
		}
	}
	
	string += '__constant float3 LIGHT_pos['+(this.REALLIGHTLENGTH)+'] = {'+strLights+'};\n';
	
	NUM = 0;
	for(var n = 0; n < this.lights.length; n++) {
		if(this.lights[n].type != 'sun') {
			for(var nb = 0; nb < this.lights[n].buffersObjects.length; nb++) {
				var strVA = '';
				var strVB = '';
				var strVC = '';
				var separat = '';
				var arrayLength = 0;
				string += ''+
						'__constant float LIGHT'+NUM+'_pNs = '+this.lights[n].buffersObjects[nb].Ns.toFixed(4)+'f;\n'+
						'__constant float3 LIGHT'+NUM+'_pKd = (float3)('+this.lights[n].color.e[0].toFixed(4)+'f,'+this.lights[n].color.e[1].toFixed(4)+'f,'+this.lights[n].color.e[2].toFixed(4)+'f);\n';
						
				for(var b = 0; b < this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
					var saltosIdx = b*3;
					idxA = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
					idxB = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+1] * 3;
					idxC = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+2] * 3;

					//var m = stormEngineC.stormGLContext.nodeViewportCamera.mWMatrix.e;
					var VA = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA+2],
																0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
					var VB = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
																0.0,0.0,0.0,1.0]));
					var VC = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
																0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
																0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
																0.0,0.0,0.0,1.0]));
					
					strVA += separat+VA.e[3].toFixed(4)+'f, '+VA.e[7].toFixed(4)+'f, '+VA.e[11].toFixed(4)+'f'; // posicion xyz en WORLD SPACE de un vertice
					strVB += separat+VB.e[3].toFixed(4)+'f, '+VB.e[7].toFixed(4)+'f, '+VB.e[11].toFixed(4)+'f';
					strVC += separat+VC.e[3].toFixed(4)+'f, '+VC.e[7].toFixed(4)+'f, '+VC.e[11].toFixed(4)+'f';
					
					separat = ',';
					arrayLength++;
				}
				string += ''+
					'__constant float LIGHT'+NUM+'_vA['+arrayLength*3+'] = {'+strVA+'};\n'+
					'__constant float LIGHT'+NUM+'_vB['+arrayLength*3+'] = {'+strVB+'};\n'+
					'__constant float LIGHT'+NUM+'_vC['+arrayLength*3+'] = {'+strVC+'};\n'+
					'__constant uint LIGHT'+NUM+'_length = '+arrayLength+';\n';
				NUM++;
			}
		}
	}
		
	//string += '__constant uint NUMNODES = '+this.nodes.length+';\n';
	
	return string;
};
StormRender.prototype.rayTriangle = function() {
	var string = ''+
	'float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
	'float3 coordTexA;float3 coordTexB;float3 coordTexC;float wA;float wB;float wC;float s;float t;uint idxTEX;\n'+
	'float nearDistance = 1000000.0f;\n'+
	'float3 dataRayTriangle;\n'+
	'float tmpDistance = 0.0f;\n'+
	'float3 pNormal;\n'+
	'float3 tmpNormal;\n'+
	'float pNs;\n'+
	'float3 pKd;\n'+
	'float typeLight = 0.0f;\n';
	
	var NUM = 0;
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			string += 'for(uint n = 0; n < NODE'+NUM+'_length; n++) {\n'+
				'uint id = n*3;\n'+
				//var m = stormEngineC.stormGLContext.nodeViewportCamera.mWMatrix.e;
				'vecVertexA = (float3)(NODE'+NUM+'_vA[id], NODE'+NUM+'_vA[id+1], NODE'+NUM+'_vA[id+2]);\n'+ // posicion xyz en WORLD SPACE de un vertice
				'vecVertexB = (float3)(NODE'+NUM+'_vB[id], NODE'+NUM+'_vB[id+1], NODE'+NUM+'_vB[id+2]);\n'+ // posicion xyz en WORLD SPACE de un vertice
				'vecVertexC = (float3)(NODE'+NUM+'_vC[id], NODE'+NUM+'_vC[id+1], NODE'+NUM+'_vC[id+2]);\n'+ // posicion xyz en WORLD SPACE de un vertice
				
				
				
				'u = vecVertexB-vecVertexA;\n'+
				'v = vecVertexC-vecVertexA;\n'+
				'tmpNormal = cross(u,v);\n'+
				//'tmpNormal = u*v;\n'+
				
				'if(tmpNormal.x == 0.0f && tmpNormal.y == 0.0f && tmpNormal.z == 0.0f) {\n'+
					'tmpDistance = 0.0f;\n'+
				'} else {\n'+
					'dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
					'tmpDistance = dataRayTriangle.s0;\n'+
				'}\n'+
				
		
				'if(tmpDistance > 0.0f){\n'+
					'if(tmpDistance < nearDistance) {\n'+
				
						'nearDistance = tmpDistance;\n'+
						'pNormal = fast_normalize(tmpNormal);\n'+
						'pNs = NODE'+NUM+'_pNs;\n'+
						//'pKd = (float3)(NODE'+NUM+'_arrKd[0],NODE'+NUM+'_arrKd[1],NODE'+NUM+'_arrKd[2]);\n'+
						'typeLight = 0.0f;\n'+
						
						
						// PIXEL LOCATION IN TEXTURE
						'coordTexA = (float3)(NODE'+NUM+'_texA[id], NODE'+NUM+'_texA[id+1], NODE'+NUM+'_texA[id+2]);\n'+
						'coordTexB = (float3)(NODE'+NUM+'_texB[id], NODE'+NUM+'_texB[id+1], NODE'+NUM+'_texB[id+2]);\n'+
						'coordTexC = (float3)(NODE'+NUM+'_texC[id], NODE'+NUM+'_texC[id+1], NODE'+NUM+'_texC[id+2]);\n'+
						
						'wA = (1.0f-(dataRayTriangle.s1+dataRayTriangle.s2));\n'+
						'wB = dataRayTriangle.s1;\n'+
						'wC = dataRayTriangle.s2;\n'+
						
						's = ((coordTexA.x*wA)+(coordTexB.x*wB)+(coordTexC.x*wC))/(wA+wB+wC);\n'+
						't = ((coordTexA.y*wA)+(coordTexB.y*wB)+(coordTexC.y*wC))/(wA+wB+wC);\n'+
						
						//'s = 1.0-s;'+
						't = 1.0f-t;'+
						
						's *= NODE'+NUM+'_arrKdWidth;\n'+
						't *= NODE'+NUM+'_arrKdHeight;\n'+
						
						'idxTEX = ( ((uint)(t) * NODE'+NUM+'_arrKdWidth) +(uint)(s))*3;'+
						'pKd = (float3)(NODE'+NUM+'_arrKd[idxTEX],NODE'+NUM+'_arrKd[idxTEX+1],NODE'+NUM+'_arrKd[idxTEX+2]);\n'+
					'}\n'+
				'}\n'+
				
			'}\n';
			NUM++;
		}
	}
	
	NUM = 0;
	for(var n = 0; n < this.lights.length; n++) {
		if(this.lights[n].type != 'sun') {
			for(var nb = 0; nb < this.lights[n].buffersObjects.length; nb++) {
				string += 'for(uint n = 0; n < LIGHT'+NUM+'_length; n++) {\n'+
					'uint id = n*3;\n'+
					//var m = stormEngineC.stormGLContext.nodeViewportCamera.mWMatrix.e;
					'vecVertexA = (float3)(LIGHT'+NUM+'_vA[id], LIGHT'+NUM+'_vA[id+1], LIGHT'+NUM+'_vA[id+2]);\n'+ // posicion xyz en WORLD SPACE de un vertice
					'vecVertexB = (float3)(LIGHT'+NUM+'_vB[id], LIGHT'+NUM+'_vB[id+1], LIGHT'+NUM+'_vB[id+2]);\n'+ // posicion xyz en WORLD SPACE de un vertice
					'vecVertexC = (float3)(LIGHT'+NUM+'_vC[id], LIGHT'+NUM+'_vC[id+1], LIGHT'+NUM+'_vC[id+2]);\n'+ // posicion xyz en WORLD SPACE de un vertice
					
					
					
					'u = vecVertexB-vecVertexA;\n'+
					'v = vecVertexC-vecVertexA;\n'+
					'tmpNormal = cross(u,v);\n'+
					//'tmpNormal = u*v;\n'+
					
					'if(tmpNormal.x == 0.0f && tmpNormal.y == 0.0f && tmpNormal.z == 0.0f) {\n'+
						'tmpDistance = 0.0f;\n'+
					'} else {\n'+
						'dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
						'tmpDistance = dataRayTriangle.s0;\n'+
					'}\n'+
					
			
					'if(tmpDistance > 0.0f && tmpDistance < 1000000.0f){\n'+
						'if(tmpDistance < nearDistance) {\n'+
					
							'nearDistance = tmpDistance;\n'+
							'pNormal = fast_normalize(tmpNormal);\n'+
							'pNs = LIGHT'+NUM+'_pNs;\n'+
							'pKd = LIGHT'+NUM+'_pKd;\n'+
							'typeLight = 1.0f;\n'+
							
							
						'}\n'+
					'}\n'+
					
				'}\n';
				NUM++;
			}
		}
	}
	string += ''+
				'if(typeLight == 1.0f) {\n'+
					'return (float16)(nearDistance, pNormal.x, pNormal.y, pNormal.z, pNs, pKd.x, pKd.y, pKd.z, typeLight, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);\n'+
				'} else {\n'+
					''+
					''+
					
					'return (float16)(nearDistance, pNormal.x, pNormal.y, pNormal.z, pNs, pKd.x, pKd.y, pKd.z, typeLight, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f, 0.0f);\n'+
				'}\n';
	return string;
};
StormRender.prototype.rayScene = function() {
	var string = ''+
	'float pDistance = 1000000.0f;\n'+
	
	
	'float16 data = rayTriangle(vecRayOrigin, vecRayEnd);\n'+
	
	'pDistance = data.s0;\n'+
	'float3 pNormal = (float3)(data.s1,data.s2,data.s3);\n'+
	'float pNs = data.s4;\n'+
	'float3 pKd = (float3)(data.s5,data.s6,data.s7);\n'+
	'float typeLight = data.s8;\n'+
	
	
	
	'if(typeLight == 1.0f) {'+
		'return (float4)(pKd.x, pKd.y, pKd.z, 1.0f);\n'+
	'}'+
	
	
	'if(pDistance < 1000000.0f) {\n'+ // hit
		'float3 dirInicial = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
		'vecRayOrigin = vecRayOrigin+(dirInicial*(pDistance-0.005f));\n'+
		'uint depth = 0;\n'+
		'if(pNs == 0.0f) {\n'+
			'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
			'vecRayEnd = vecRayOrigin+(vecSPECULAR*1000.0f);\n'+
			//'depth = '+this.MAXDEPTH+';\n'+
		'} else {\n'+
			'float3 vecBRDF = getVector(pNormal,pNs,displace,vecNoise);\n'+
			'vecRayEnd = vecRayOrigin+(vecBRDF*1000.0f);\n'+
			//'depth = 0;\n'+
		'}\n'+
		
		//'float3 vecRayEnd = reflectA(dirInicial, vecBRDF);\n'+
		
		//'float cos_omega = dot(vecRayEnd, pNormal);\n'+
		
		
		
		'float4 color = raySceneS0(vecRayOrigin, vecRayEnd, vecNoise, displace, depth, (float4)(0.0f,0.0f,0.0f,0.0f));\n'+
		
		'return (float4)((((pKd.x)+(color.s0))/2.0f), (((pKd.y)+(color.s1))/2.0f), (((pKd.z)+(color.s2))/2.0f), color.s3);\n'+
		
	'} else {\n'+
		'return (float4)(ambientColor.x,ambientColor.y,ambientColor.z,1.0f);\n'+ // ambiente
	'}\n';
	
	return string;
};
StormRender.prototype.raySceneS = function(currentDepth) {
	var string = ''+
	'float pDistance = 1000000.0f;\n'+
	
	
	'float16 data = rayTriangle(vecRayOrigin, vecRayEnd);\n'+
	
	'pDistance = data.s0;\n'+
	'float3 pNormal = (float3)(data.s1,data.s2,data.s3);\n'+
	'float pNs = data.s4;\n'+
	'float3 pKd = (float3)(data.s5,data.s6,data.s7);\n'+
	'float typeLight = data.s8;\n'+
	
	
	
	'float3 vecBRDF = getVector(pNormal,pNs,displace,vecNoise);\n'+
	
	'float light = 0.0f;\n'+
	'float3 colorLight = (float3)(0.0f,0.0f,0.0f);\n'+
	'for(uint n = 0; n < '+(this.REALLIGHTLENGTH)+'; n++) {\n'+
		'float16 sR = rayTriangle(vecRayOrigin,(float3)(LIGHT_pos[n].x,LIGHT_pos[n].y,LIGHT_pos[n].z));\n'+
		'float sRhitLight = sR.s8;\n'+
		'if(sRhitLight == 0.0f) {'+ // 0.0 está en sombra (no ve la luz)
			'colorLight += (float3)(0.0f,0.0f,0.0f);\n'+
			'light += 0.0f;\n'+
		'} else {'+
			'colorLight += (float3)(sR.s5,sR.s6,sR.s7);\n'+
			'float3 lightR = vecRayOrigin-(float3)(LIGHT_pos[n].x,LIGHT_pos[n].y,LIGHT_pos[n].z);'+
			'float dif = fabs(dot((vecBRDF),fast_normalize(lightR)));\n'+
			'light += fmax(0.001f,(dif*(1.0f-smoothstep(0.0f,10.0f,fast_length(lightR)))));\n'+
		'}'+
	'}\n'+
	'if('+this.REALLIGHTLENGTH+' > 0) {'+
		'light /= '+(this.REALLIGHTLENGTH)+';\n'+
		'colorLight /= '+(this.REALLIGHTLENGTH)+';\n'+
	'}'+
	
	
	
	'if(typeLight == 1.0f || pDistance == 1000000.0f || depth == '+this.MAXDEPTH+') {'+ // object is light (end); ambient (end); maxdepth (end)
		'if(pDistance == 1000000.0f) {'+
			'light = 1.0f;\n'+
			'pKd = (float3)(ambientColor.x,ambientColor.y,ambientColor.z);\n'+ // color ambiente
			'colorLight = (float3)(ambientColor.x,ambientColor.y,ambientColor.z);\n'+ // color ambiente
		'}'+
		'return (float4)((((pKd.x*colorLight.x))+color.s0)/'+(currentDepth+1).toFixed(1)+'f, (((pKd.y*colorLight.y))+color.s1)/'+(currentDepth+1).toFixed(1)+'f, (((pKd.z*colorLight.z))+color.s2)/'+(currentDepth+1).toFixed(1)+'f, (light+color.s3)/'+(currentDepth+1).toFixed(1)+'f);\n'+
	'}'+
		
	'if(pDistance < 1000000.0f) {\n'+ // object and next bounce
		'float3 dirInicial = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
		'vecRayOrigin = vecRayOrigin+(dirInicial*(pDistance-0.005f));\n'+
		'if(pNs == 0.0f) {\n'+
			'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
			'vecRayEnd = vecRayOrigin+(vecSPECULAR*1000.0f);\n'+
			//'depth = depth-1;\n'+
		'} else {\n'+
			'vecRayEnd = vecRayOrigin+(vecBRDF*1000.0f);\n'+
		'}\n'+
		//'float3 vecRayEnd = reflectA(dirInicial, pNormal);\n'+
		//'float3 vecRayEnd = reflectA(dirInicial, vecBRDF);\n'+
		
		//'float cos_omega = dot(vecRayEnd, pNormal);\n'+
		
		
		'return raySceneS'+(currentDepth+1)+'(vecRayOrigin, vecRayEnd, vecNoise, displace, depth+1, (float4)(((pKd.x*colorLight.x))+color.s0, ((pKd.y*colorLight.y))+color.s1, ((pKd.z*colorLight.z))+color.s2, color.s3+light));\n'+
		
	'}\n';
	
	return string;
};



StormRender.prototype.setCam = function(nodeCam) {
	clCmdQueue.flush();
	
	this.nodeCam = nodeCam;
	
	var distanciaAlPlano = 1.0;
    
	var posCamera = $V3([this.nodeCam.nodeGoal.mWMatrix.e[3], this.nodeCam.nodeGoal.mWMatrix.e[7], this.nodeCam.nodeGoal.mWMatrix.e[11]]);
	var posCameraPivot = $V3([this.nodeCam.nodePivot.mWMatrix.e[3], this.nodeCam.nodePivot.mWMatrix.e[7], this.nodeCam.nodePivot.mWMatrix.e[11]]);
    
    var vecView = posCameraPivot.subtract(posCamera).normalize();
    
    var centroPlanoProyeccion = posCamera.add(vecView.x(distanciaAlPlano));
    
    var vecXPlanoProyeccion = $V3([0.0, 1.0, 0.0]).cross(vecView).normalize();
    var vecYPlanoProyeccion = vecView.cross(vecXPlanoProyeccion).normalize();
    
    //var widthPlanoProyeccion =   this.viewportWidth/this.viewportHeight;
    //var heightPlanoProyeccion = this.viewportWidth / this.viewportHeight;
    var widthPixel = 1.0 / this.viewportHeight;
    var heightPixel = 1.0 / this.viewportHeight;
    
    var locFirstX = vecXPlanoProyeccion.x( ( (this.viewportWidth/2.0)*widthPixel));
    var locFirstY = vecYPlanoProyeccion.x( ( (this.viewportHeight/2.0)*heightPixel));
    var pixelOrigin = centroPlanoProyeccion.add(locFirstX);
    pixelOrigin = pixelOrigin.add(locFirstY);
    

	for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
			var pixelPos = pixelOrigin.add(vecXPlanoProyeccion.x(-1.0).x( col*widthPixel));
			pixelPos = pixelPos.add(vecYPlanoProyeccion.x(-1.0).x(row*heightPixel));
			var currentPixelDir = $V3([pixelPos.e[0], pixelPos.e[1], pixelPos.e[2]]).subtract(posCamera).normalize();
			
			var origin = posCamera.e;
			var end = posCamera.add(currentPixelDir.x(1000.0)).e;
			
			//this.arrayAlbedo = [];
			
			var idx = ((row * this.viewportWidth) + col);
			this.clDataObject_1x[idx] = origin[0];
			this.clDataObject_1y[idx] = origin[1];
			this.clDataObject_1z[idx] = origin[2];
			
			this.clDataObject_2x[idx] = end[0];
			this.clDataObject_2y[idx] = end[1];
			this.clDataObject_2z[idx] = end[2];
			
			this.arrayTotalColorX[idx] = 0.0;
			this.arrayTotalColorY[idx] = 0.0;
			this.arrayTotalColorZ[idx] = 0.0;
			
			this.arrayTotalShadow[idx] = 0.0;
			
			this.arraySample[idx] = 0;
		}
	}
	clCmdQueue.enqueueWriteBuffer(this.buffIn1x, false, 0, this.bufferSize, this.clDataObject_1x, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffIn1y, false, 0, this.bufferSize, this.clDataObject_1y, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffIn1z, false, 0, this.bufferSize, this.clDataObject_1z, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffIn2x, false, 0, this.bufferSize, this.clDataObject_2x, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffIn2y, false, 0, this.bufferSize, this.clDataObject_2y, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffIn2z, false, 0, this.bufferSize, this.clDataObject_2z, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffOutColorX, false, 0, this.bufferSize, this.outBufferx, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffOutColorY, false, 0, this.bufferSize, this.outBuffery, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffOutColorZ, false, 0, this.bufferSize, this.outBufferz, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffTotalColorX, false, 0, this.bufferSize, this.arrayTotalColorX, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffTotalColorY, false, 0, this.bufferSize, this.arrayTotalColorY, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffTotalColorZ, false, 0, this.bufferSize, this.arrayTotalColorZ, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffTotalShadow, false, 0, this.bufferSize, this.arrayTotalShadow, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.bufferSample, false, 0, this.bufferSize, this.arraySample, []);// this.bufferSize = vectorLength * 4
};
StormRender.prototype.makeRender = function() {	
	if(this.sampleNoise == 33) this.sampleNoise = 0;
	var rowNoise = this.sampleNoise;
	var colNoise = this.sampleNoise;
	for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
			var idx = ((row * this.viewportWidth) + col);
			
			if(rowNoise == 33) rowNoise = this.sampleNoise;
			if(colNoise == 33) colNoise = this.sampleNoise;
			var idxNoise = ((rowNoise * 32) + colNoise)*3;
			//this.clDataObject_Noisey[idx] = this.canvasDataNoise.data[idxNoise+1]/255;
			//this.clDataObject_Noisex[idx] = this.canvasDataNoise.data[idxNoise]/255;
			
			this.clDataObject_Noisey[idx] = Math.random();
			this.clDataObject_Noisex[idx] = Math.random();
			
			rowNoise++;
			colNoise++;
		}
	}
	this.sampleNoise++;
	
	
	this.clKernel_X.setKernelArg(16, this.displace, WebCL.types.UINT);
	clCmdQueue.enqueueWriteBuffer(this.buffInNoisex, false, 0, this.bufferSize, this.clDataObject_Noisex, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffInNoisey, false, 0, this.bufferSize, this.clDataObject_Noisey, []);// this.bufferSize = vectorLength * 4

	// Init ND-range
	var maxLocalWS = clDevices[0].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE);
	var currentLocalWS = this.viewportWidth; // Local work item size. Tamaño de cada work-group
	while(currentLocalWS > maxLocalWS) {
		currentLocalWS /= 2;
	}
	var localWS = [256];
	var globalWS = [Math.ceil(((this.viewportWidth*this.viewportHeight)) / localWS) * localWS]; // Global work item size. Numero total de work-items (kernel en ejecucion)

	clCmdQueue.enqueueNDRangeKernel(this.clKernel_X, globalWS.length, [], globalWS, localWS, []);
	//clCmdQueue.flush();
	clCmdQueue.finish();
	
	clCmdQueue.enqueueReadBuffer(this.buffOutColorX, false, 0, ((this.viewportWidth*this.viewportHeight)*4), this.outBufferx, []);
	clCmdQueue.enqueueReadBuffer(this.buffOutColorY, false, 0, ((this.viewportWidth*this.viewportHeight)*4), this.outBuffery, []);
	clCmdQueue.enqueueReadBuffer(this.buffOutColorZ, false, 0, ((this.viewportWidth*this.viewportHeight)*4), this.outBufferz, []);
	
	
	for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
		
			var idx = ((row * this.viewportWidth) + col);
			var idxData = idx*4;
			
			this.canvasData.data[idxData+0] = this.outBufferx[idx];
			this.canvasData.data[idxData+1] = this.outBuffery[idx];
			this.canvasData.data[idxData+2] = this.outBufferz[idx];
			this.canvasData.data[idxData+3] = 255;
			
		}
	}

	
	
			
    this.ctx2Drender.putImageData(this.canvasData, 0, 0);
    this.displace++;
	
    if(!stormEngineC.pauseRender){
		this.timerRender = setTimeout("stormEngineC.stormRender.makeRender();",2);
	}
	
	
    /*var pixels =  new Uint8Array(this.canvasData.data);
	
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureRT0);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.viewportWidth, this.viewportHeight, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
	this.gl.bindTexture(this.gl.TEXTURE_2D, null);*/
	
	
	//this.glMiniCam.readPixels(0, 0, this.widthHeightMiniCam, this.widthHeightMiniCam, this.glMiniCam.RGBA, this.glMiniCam.UNSIGNED_BYTE, this.arrayImageMiniCam);
};
StormRender.prototype.releaseMemory = function() {
	clearTimeout(this.timerRender);
	clCmdQueue.releaseCLResources();
	stormEngineC.pauseRender = true;
};

