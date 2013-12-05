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
 // ENVIA ESCENA A DEVICE TRIANGULO x TRIANGULO, VARIOS PROCESADOS DEL COLOR POR CPU EN CADA SAMPLE (LENTO)
StormRender = function(DIVID,callback) {
	if(callback != undefined) this.callback = callback;
	this.canvasRenderObject = document.getElementById(DIVID);
	this.viewportWidth = this.canvasRenderObject.width;
	this.viewportHeight = this.canvasRenderObject.height;
	this.ctx2Drender = this.canvasRenderObject.getContext("2d");
	this.canvasData = this.ctx2Drender.getImageData(0, 0, this.viewportWidth, this.viewportHeight);
	
	

	
	this.canvasDataNoise = stormEngineC.stormGLContext.arrayTEX_noise;
	
	
	this.sample = 1;
	this.sampleNoise = 0;
	
	this.nodes = stormEngineC.nodes;
	this.lights = stormEngineC.lights;
	this.REALLIGHTLENGTH = stormEngineC.lights.length;
	
	this.MAXBOUNCES = 3; 
	this.ambientColor = stormEngineC.stormGLContext.ambientColor;
	var kernelSrc_X = ''+
	'__constant float3 ambientColor = (float3)('+this.ambientColor.e[0].toFixed(4)+'f,'+this.ambientColor.e[1].toFixed(4)+'f,'+this.ambientColor.e[2].toFixed(4)+'f);\n'+
	//'__constant float points[3] = {0.0000,1.0000,-0.0000};\n'+
	//'__constant uint MAXBOUNCES = 3;\n'+
	/*'float randR(float2 co){\n'+
		'float i;\n'+
		'return fabs(fract(sin(dot(co.xy ,(float2)(12.9898, 78.233))) * 43758.5453, &i));\n'+
	'}\n'+*/
	/*
	float3 refract(float3 V, float3 N, float refrIndex) {
        float cosI = -dot( N, V );
        float cosT2 = 1.0f - refrIndex * refrIndex * (1.0f - cosI * cosI);
        return (refrIndex * V) + (refrIndex * cosI - sqrt( cosT2 )) * N;
	}
	*/
	'float3 reflectA(float3 I, float3 N) {'+
		'return I - 2.0f * dot(N,I) * N;\n'+
	'}'+
	'float3 getVector(float3 vecNormal, float Ns, float2 vecNoise) {\n'+
		'float angleLat = acos(vecNormal.z);\n'+
		'float angleAzim = atan2(vecNormal.y,vecNormal.x);\n'+
				
		'float desvX = -1.0f+(vecNoise.x*2.0f);\n'+
		'float desvY = -1.0f+(vecNoise.y*2.0f);\n'+
		'angleLat += (Ns*desvX)*1.6f;\n'+
		'angleAzim += (Ns*desvY)*1.6f;\n'+

		'float x = sin(angleLat)*cos(angleAzim);\n'+
		'float y = sin(angleLat)*sin(angleAzim);\n'+
		'float z = cos(angleLat);\n'+
		
		'return (float3)(x,y,z);\n'+
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
	
	// PIXEL LOCATION IN TEXTURE
	'uint getUVTextureIdx(float3 coordTexA, float3 coordTexB, float3 coordTexC, float u, float v, int TEXwidth, int TEXheight) {\n'+
		'float wA = (1.0f-(u+v));\n'+
		'float wB = u;\n'+
		'float wC = v;\n'+
		
		'float s = ((coordTexA.x*wA)+(coordTexB.x*wB)+(coordTexC.x*wC))/(wA+wB+wC);\n'+
		'float t = ((coordTexA.y*wA)+(coordTexB.y*wB)+(coordTexC.y*wC))/(wA+wB+wC);\n'+
		
		//'s = 1.0-s;'+
		't = 1.0f-t;'+
		
		's *= TEXwidth;\n'+
		't *= TEXheight;\n'+
		
		'return ( ((uint)(t) * TEXwidth) +(uint)(s))*4;'+
	'}\n'+
	
	
	'__kernel void kernelPrimaryRays('+
							'float VAx,'+ // 0
							'float VAy,'+ // 1
							'float VAz,'+ // 2
							'float VBx,'+ // 3
							'float VBy,'+ // 4
							'float VBz,'+ // 5
							'float VCx,'+ // 6
							'float VCy,'+ // 7
							'float VCz,'+ // 8
							'float TEXAx,'+ // 9
							'float TEXAy,'+ // 10
							'float TEXAz,'+ // 11
							'float TEXBx,'+ // 12
							'float TEXBy,'+ // 13
							'float TEXBz,'+ // 14
							'float TEXCx,'+ // 15
							'float TEXCy,'+ // 16
							'float TEXCz,'+ // 17
							'float NORAx,'+ // 18
							'float NORAy,'+ // 19
							'float NORAz,'+ // 20
							'unsigned int TEXwidth,'+ // 21
							'unsigned int TEXheight,'+ // 22
							'unsigned int CurrentNode,'+ // 23
							'unsigned int CurrentBO,'+ // 24
							'unsigned int NodeTypeLight,'+ // 25
							'__global uint* NearNode,'+ // 26
							'__global uint* NearBO,'+ // 27
							'__global uint* NearNodeTypeLight,'+ // 28
							'__global float* NearDistance,'+ // 29
							'__global uint* TEXidx,'+ // 30
							'__global float* RayOriginx,'+ // 31
							'__global float* RayOriginy,'+ // 32
							'__global float* RayOriginz,'+ // 33
							'__global float* SecRayOriginx,'+ // 34
							'__global float* SecRayOriginy,'+ // 35
							'__global float* SecRayOriginz,'+ // 36
							'__global float* RayEndx,'+ // 37
							'__global float* RayEndy,'+ // 38
							'__global float* RayEndz,'+ // 39
							'__global float* SecNormalx,'+ // 40
							'__global float* SecNormaly,'+ // 41
							'__global float* SecNormalz,'+ // 42
							'__global float* SecDirInix,'+ // 43
							'__global float* SecDirIniy,'+ // 44
							'__global float* SecDirIniz'+ // 45
							') {\n'+

		'int x = get_global_id(1)*512+get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;float3 vecNorB;float3 vecNorC;\n'+
		
		'vecVertexA = (float3)(VAx, VAy, VAz);\n'+
		'vecVertexB = (float3)(VBx, VBy, VBz);\n'+
		'vecVertexC = (float3)(VCx, VCy, VCz);\n'+
		
		'vecRayOrigin = (float3)(RayOriginx[x], RayOriginy[x], RayOriginz[x]);\n'+
		
		'vecRayEnd = (float3)(RayEndx[x], RayEndy[x], RayEndz[x]);\n'+
		
		
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'float3 tmpNormal = cross(u,v);\n'+
		'float3 dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'if(dataRayTriangle.s0 > 0.0f){\n'+
			'if(dataRayTriangle.s0 < NearDistance[x]) {\n'+
				'NearDistance[x] = dataRayTriangle.s0;\n'+
				'NearNode[x] = CurrentNode;\n'+
				'NearBO[x] = CurrentBO;\n'+
				
				'float3 dirInicial = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
				'float3 vecSecRayOrigin = vecRayOrigin+(dirInicial*(dataRayTriangle.s0-0.005f));\n'+
				'SecRayOriginx[x] = vecSecRayOrigin.x;\n'+
				'SecRayOriginy[x] = vecSecRayOrigin.y;\n'+
				'SecRayOriginz[x] = vecSecRayOrigin.z;\n'+
				
				'vecNorA = (float3)(NORAx, NORAy, NORAz);\n'+
				'float3 pNormal = fast_normalize(vecNorA);\n'+
				'SecNormalx[x] = pNormal.x;\n'+
				'SecNormaly[x] = pNormal.y;\n'+
				'SecNormalz[x] = pNormal.z;\n'+
				
				'NearNodeTypeLight[x] = NodeTypeLight;\n'+
				
				'SecDirInix[x] = dirInicial.x;\n'+
				'SecDirIniy[x] = dirInicial.y;\n'+
				'SecDirIniz[x] = dirInicial.z;\n'+
				
				'coordTexA = (float3)(TEXAx, TEXAy, TEXAz);\n'+
				'coordTexB = (float3)(TEXBx, TEXBy, TEXBz);\n'+
				'coordTexC = (float3)(TEXCx, TEXCy, TEXCz);\n'+
				'TEXidx[x] = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth, TEXheight);\n'+
			'}\n'+
		'}\n'+
			
	'}\n'+
	
	'__kernel void kernelSecundaryRays('+
							'__global float* noiseX,'+ // 0
							'__global float* noiseY,'+ // 1
							'float VAx,'+ // 2
							'float VAy,'+ // 3
							'float VAz,'+ // 4
							'float VBx,'+ // 5
							'float VBy,'+ // 6
							'float VBz,'+ // 7
							'float VCx,'+ // 8
							'float VCy,'+ // 9
							'float VCz,'+ // 10
							'float TEXAx,'+ // 11
							'float TEXAy,'+ // 12
							'float TEXAz,'+ // 13
							'float TEXBx,'+ // 14
							'float TEXBy,'+ // 15
							'float TEXBz,'+ // 16
							'float TEXCx,'+ // 17
							'float TEXCy,'+ // 18
							'float TEXCz,'+ // 19
							'float NORAx,'+ // 20
							'float NORAy,'+ // 21
							'float NORAz,'+ // 22
							'unsigned int TEXwidth,'+ // 23
							'unsigned int TEXheight,'+ // 24
							'unsigned int CurrentNode,'+ // 25
							'unsigned int CurrentBO,'+ // 26
							'unsigned int NodeTypeLight,'+ // 27
							'__global uint* NearNode,'+ // 28
							'__global uint* NearBO,'+ // 29
							'__global uint* NearNodeTypeLight,'+ // 30
							'__global float* NearDistance,'+ // 31
							'__global float* Ns,'+ // 32
							'__global uint* TEXidx,'+ // 33
							'__global float* RayOriginx,'+ // 34
							'__global float* RayOriginy,'+ // 35
							'__global float* RayOriginz,'+ // 36
							'__global float* RayOriginSecx,'+ // 37
							'__global float* RayOriginSecy,'+ // 38
							'__global float* RayOriginSecz,'+ // 39
							'__global float* Normalx,'+ // 40
							'__global float* Normaly,'+ // 41
							'__global float* Normalz,'+ // 42
							'__global float* NormalSecx,'+ // 43
							'__global float* NormalSecy,'+ // 44
							'__global float* NormalSecz,'+ // 45
							'__global float* DirInix,'+ // 46
							'__global float* DirIniy,'+ // 47
							'__global float* DirIniz,'+ // 48
							'__global float* SecDirInix,'+ // 49
							'__global float* SecDirIniy,'+ // 50
							'__global float* SecDirIniz,'+ // 51
							'__global float* BRDFx,'+ // 52
							'__global float* BRDFy,'+ // 53
							'__global float* BRDFz'+ // 54
							') {\n'+

		'int x = get_global_id(1)*512+get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;\n'+
		
		'vecVertexA = (float3)(VAx, VAy, VAz);\n'+
		'vecVertexB = (float3)(VBx, VBy, VBz);\n'+
		'vecVertexC = (float3)(VCx, VCy, VCz);\n'+
		
		'vecRayOrigin = (float3)(RayOriginx[x], RayOriginy[x], RayOriginz[x]);\n'+
		
		'float3 pNormal = (float3)(Normalx[x],Normaly[x],Normalz[x]);\n'+
		'float3 dirInicial = (float3)(DirInix[x], DirIniy[x], DirIniz[x]);\n'+
		'if(Ns[x] == 0.0f) {\n'+
			'float3 vecSPECULAR = reflectA(dirInicial, pNormal);\n'+
			'BRDFx[x] = vecSPECULAR.x;\n'+
			'BRDFy[x] = vecSPECULAR.y;\n'+
			'BRDFz[x] = vecSPECULAR.z;\n'+
			'vecRayEnd = vecRayOrigin+(vecSPECULAR*20000.0f);\n'+
		'} else {\n'+
			'float3 vecBRDF = getVector(pNormal, Ns[x], (float2)(noiseX[x],noiseY[x]));\n'+
			//'if(dot(vecBRDF,pNormal) < 0.0f) {vecBRDF = -vecBRDF;}'+
			'BRDFx[x] = vecBRDF.x;\n'+
			'BRDFy[x] = vecBRDF.y;\n'+
			'BRDFz[x] = vecBRDF.z;\n'+
			'vecRayEnd = vecRayOrigin+(vecBRDF*20000.0f);\n'+
		'}\n'+
		
		
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'float3 tmpNormal = cross(u,v);\n'+
		'float3 dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'if(dataRayTriangle.s0 > 0.0f){\n'+
			'if(dataRayTriangle.s0 < NearDistance[x]) {\n'+
				'NearDistance[x] = dataRayTriangle.s0;\n'+
				'NearNode[x] = CurrentNode;\n'+
				'NearBO[x] = CurrentBO;\n'+
				
				'float3 dirInicialSec = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
				'float3 vecRayOriginSec = vecRayOrigin+(dirInicialSec*(dataRayTriangle.s0-0.005f));\n'+
				'RayOriginSecx[x] = vecRayOriginSec.x;\n'+
				'RayOriginSecy[x] = vecRayOriginSec.y;\n'+
				'RayOriginSecz[x] = vecRayOriginSec.z;\n'+
				
				'vecNorA = (float3)(NORAx, NORAy, NORAz);\n'+
				'float3 pNormalSec = fast_normalize(vecNorA);\n'+
				'NormalSecx[x] = pNormalSec.x;\n'+
				'NormalSecy[x] = pNormalSec.y;\n'+
				'NormalSecz[x] = pNormalSec.z;\n'+
				
				'NearNodeTypeLight[x] = NodeTypeLight;\n'+
				
				'SecDirInix[x] = dirInicialSec.x;\n'+
				'SecDirIniy[x] = dirInicialSec.y;\n'+
				'SecDirIniz[x] = dirInicialSec.z;\n'+
				
				'coordTexA = (float3)(TEXAx, TEXAy, TEXAz);\n'+
				'coordTexB = (float3)(TEXBx, TEXBy, TEXBz);\n'+
				'coordTexC = (float3)(TEXCx, TEXCy, TEXCz);\n'+
				'TEXidx[x] = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth, TEXheight);\n'+
			'}\n'+
		'}\n'+
			
	'}\n'+
	'__kernel void kernelShadowRays('+
							'float VAx,'+ // 0
							'float VAy,'+ // 1
							'float VAz,'+ // 2
							'float VBx,'+ // 3
							'float VBy,'+ // 4
							'float VBz,'+ // 5
							'float VCx,'+ // 6
							'float VCy,'+ // 7
							'float VCz,'+ // 8
							'float TEXAx,'+ // 9
							'float TEXAy,'+ // 10
							'float TEXAz,'+ // 11
							'float TEXBx,'+ // 12
							'float TEXBy,'+ // 13
							'float TEXBz,'+ // 14
							'float TEXCx,'+ // 15
							'float TEXCy,'+ // 16
							'float TEXCz,'+ // 17
							'unsigned int TEXwidth,'+ // 18
							'unsigned int TEXheight,'+ // 19
							'unsigned int CurrentNode,'+ // 20
							'unsigned int CurrentBO,'+ // 21
							'unsigned int NodeTypeLight,'+ // 22
							'__global uint* NearShadowNode,'+ // 23
							'__global uint* NearShadowBO,'+ // 24
							'__global uint* NearShadowNodeTypeLight,'+ // 25
							'__global float* NearShadowDistance,'+ // 26
							'__global uint* TEXShadowidx,'+ // 27
							'__global float* RayShadowOriginx,'+ // 28
							'__global float* RayShadowOriginy,'+ // 29
							'__global float* RayShadowOriginz,'+ // 30
							'float RayShadowEndx,'+ // 31
							'float RayShadowEndy,'+ // 32
							'float RayShadowEndz'+ // 33
							') {\n'+

		'int x = get_global_id(1)*512+get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		
		'vecVertexA = (float3)(VAx, VAy, VAz);\n'+
		'vecVertexB = (float3)(VBx, VBy, VBz);\n'+
		'vecVertexC = (float3)(VCx, VCy, VCz);\n'+
		
		'vecRayOrigin = (float3)(RayShadowOriginx[x], RayShadowOriginy[x], RayShadowOriginz[x]);\n'+
		
		'vecRayEnd = (float3)(RayShadowEndx, RayShadowEndy, RayShadowEndz);\n'+

		
		'u = vecVertexB-vecVertexA;\n'+
		'v = vecVertexC-vecVertexA;\n'+
		'float3 tmpNormal = cross(u,v);\n'+
		'float3 dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
		'if(dataRayTriangle.s0 > 0.0f){\n'+
			'if(dataRayTriangle.s0 < NearShadowDistance[x]) {\n'+
				
				'NearShadowDistance[x] = dataRayTriangle.s0;\n'+
				'NearShadowNode[x] = CurrentNode;\n'+
				'NearShadowBO[x] = CurrentBO;\n'+

				'NearShadowNodeTypeLight[x] = NodeTypeLight;\n'+
				
				'coordTexA = (float3)(TEXAx, TEXAy, TEXAz);\n'+
				'coordTexB = (float3)(TEXBx, TEXBy, TEXBz);\n'+
				'coordTexC = (float3)(TEXCx, TEXCy, TEXCz);\n'+
				'TEXShadowidx[x] = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth, TEXheight);\n'+
			'}\n'+
				
		'}\n'+
			
	'}\n';
		
	var clProgram_X = clContext.createProgramWithSource(kernelSrc_X);
	try {
		clProgram_X.buildProgram([clDevices[0]], "");
	} catch(e) {
		alert("Failed to build WebCL program. Error "+clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_STATUS)+":  "+ clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_LOG));
		throw e;
	}
	this.clKernel_PrimaryRays = clProgram_X.createKernel("kernelPrimaryRays");
	this.clKernel_SecundaryRays = clProgram_X.createKernel("kernelSecundaryRays");
	this.clKernel_ShadowRays = clProgram_X.createKernel("kernelShadowRays");

	this.arrSize = (this.viewportWidth*this.viewportHeight); // typed arrays length
	this.bufferSize = (this.arrSize*4); // buffers length
	


	
	this.arrayPrimaryColorx = new Float32Array(this.arrSize);
	this.arrayPrimaryColory = new Float32Array(this.arrSize);
	this.arrayPrimaryColorz = new Float32Array(this.arrSize);
	
	this.arraySecundaryColorx = new Float32Array(this.arrSize);
	this.arraySecundaryColory = new Float32Array(this.arrSize);
	this.arraySecundaryColorz = new Float32Array(this.arrSize);
	this.arraySecundaryColorAcumx = new Float32Array(this.arrSize);
	this.arraySecundaryColorAcumy = new Float32Array(this.arrSize);
	this.arraySecundaryColorAcumz = new Float32Array(this.arrSize);
	
	this.arraylight = new Float32Array(this.arrSize);
	this.arraylightAcums = new Float32Array(this.arrSize);
	
	this.arrayColorlightx = new Float32Array(this.arrSize);
	this.arrayColorlighty = new Float32Array(this.arrSize);
	this.arrayColorlightz = new Float32Array(this.arrSize);
	
	this.arrayTotalColorX = new Float32Array(this.arrSize);
	this.arrayTotalColorY = new Float32Array(this.arrSize);
	this.arrayTotalColorZ = new Float32Array(this.arrSize);
	this.arrayTotalShadow = new Float32Array(this.arrSize);
	
	//CL_MEM_READ_ONLY - CL_MEM_WRITE_ONLY - CL_MEM_READ_WRITE
	this.buffNearNode = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNearNode = new Uint32Array(this.arrSize);
	this.buffNearBO = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNearBO = new Uint32Array(this.arrSize);
	
	this.buffNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNearNodeTypeLight = new Uint32Array(this.arrSize);
	this.buffSecNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNearNodeTypeLight = new Uint32Array(this.arrSize);
	this.buffShadowNearNodeTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayShadowNearNodeTypeLight = new Uint32Array(this.arrSize);
	
	this.buffNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNearDistance = new Float32Array(this.arrSize);
	this.buffSecNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNearDistance = new Float32Array(this.arrSize);
	this.buffShadowNearDistance = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayShadowNearDistance = new Float32Array(this.arrSize);
	
	this.buffNs = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize); this.arrayNs = new Float32Array(this.arrSize);
		this.arrayStoreSecNs = new Float32Array(this.arrSize);
		
	this.buffTEXidx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayTEXidx = new Uint32Array(this.arrSize);
	
	this.buffRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginx = new Float32Array(this.arrSize);
	this.buffRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginy = new Float32Array(this.arrSize);
	this.buffRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayOriginz = new Float32Array(this.arrSize);
	this.buffSecRayOriginx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecRayOriginx = new Float32Array(this.arrSize);
	this.buffSecRayOriginy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecRayOriginy = new Float32Array(this.arrSize);
	this.buffSecRayOriginz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecRayOriginz = new Float32Array(this.arrSize);
		
	this.buffRayEndx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayEndx = new Float32Array(this.arrSize);
	this.buffRayEndy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayEndy = new Float32Array(this.arrSize);
	this.buffRayEndz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayRayEndz = new Float32Array(this.arrSize);
	
	this.buffNormalx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNormalx = new Float32Array(this.arrSize);
	this.buffNormaly = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNormaly = new Float32Array(this.arrSize);
	this.buffNormalz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayNormalz = new Float32Array(this.arrSize);
	this.buffSecNormalx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNormalx = new Float32Array(this.arrSize);
	this.buffSecNormaly = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNormaly = new Float32Array(this.arrSize);
	this.buffSecNormalz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecNormalz = new Float32Array(this.arrSize);
		
	this.buffDirInix = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayDirInix = new Float32Array(this.arrSize);
	this.buffDirIniy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayDirIniy = new Float32Array(this.arrSize);
	this.buffDirIniz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayDirIniz = new Float32Array(this.arrSize);
	this.buffSecDirInix = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecDirInix = new Float32Array(this.arrSize);
	this.buffSecDirIniy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecDirIniy = new Float32Array(this.arrSize);
	this.buffSecDirIniz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arraySecDirIniz = new Float32Array(this.arrSize);
		
	this.buffNoisex = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize); this.arrayNoisex = new Float32Array(this.arrSize);
	this.buffNoisey = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, this.bufferSize); this.arrayNoisey = new Float32Array(this.arrSize);
	
	this.buffBRDFx = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayBRDFx = new Float32Array(this.arrSize);
	this.buffBRDFy = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayBRDFy = new Float32Array(this.arrSize);
	this.buffBRDFz = clContext.createBuffer(WebCL.CL_MEM_READ_WRITE, this.bufferSize); this.arrayBRDFz = new Float32Array(this.arrSize);
	
	// primary rays
	this.clKernel_PrimaryRays.setKernelArg(26, this.buffNearNode);
	this.clKernel_PrimaryRays.setKernelArg(27, this.buffNearBO);
	this.clKernel_PrimaryRays.setKernelArg(28, this.buffNearNodeTypeLight);
	this.clKernel_PrimaryRays.setKernelArg(29, this.buffNearDistance);
	this.clKernel_PrimaryRays.setKernelArg(30, this.buffTEXidx);
	this.clKernel_PrimaryRays.setKernelArg(31, this.buffRayOriginx);
	this.clKernel_PrimaryRays.setKernelArg(32, this.buffRayOriginy);
	this.clKernel_PrimaryRays.setKernelArg(33, this.buffRayOriginz);
	this.clKernel_PrimaryRays.setKernelArg(34, this.buffSecRayOriginx);
	this.clKernel_PrimaryRays.setKernelArg(35, this.buffSecRayOriginy);
	this.clKernel_PrimaryRays.setKernelArg(36, this.buffSecRayOriginz);
	this.clKernel_PrimaryRays.setKernelArg(37, this.buffRayEndx);
	this.clKernel_PrimaryRays.setKernelArg(38, this.buffRayEndy);
	this.clKernel_PrimaryRays.setKernelArg(39, this.buffRayEndz);
	this.clKernel_PrimaryRays.setKernelArg(40, this.buffSecNormalx);
	this.clKernel_PrimaryRays.setKernelArg(41, this.buffSecNormaly);
	this.clKernel_PrimaryRays.setKernelArg(42, this.buffSecNormalz);
	this.clKernel_PrimaryRays.setKernelArg(43, this.buffSecDirInix);
	this.clKernel_PrimaryRays.setKernelArg(44, this.buffSecDirIniy);
	this.clKernel_PrimaryRays.setKernelArg(45, this.buffSecDirIniz);

	// secundary rays
	this.clKernel_SecundaryRays.setKernelArg(0, this.buffNoisex);
	this.clKernel_SecundaryRays.setKernelArg(1, this.buffNoisey);
	this.clKernel_SecundaryRays.setKernelArg(28, this.buffNearNode);
	this.clKernel_SecundaryRays.setKernelArg(29, this.buffNearBO);
	this.clKernel_SecundaryRays.setKernelArg(30, this.buffSecNearNodeTypeLight);
	this.clKernel_SecundaryRays.setKernelArg(31, this.buffSecNearDistance);
	this.clKernel_SecundaryRays.setKernelArg(32, this.buffNs);
	this.clKernel_SecundaryRays.setKernelArg(33, this.buffTEXidx);
	this.clKernel_SecundaryRays.setKernelArg(34, this.buffRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(35, this.buffRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(36, this.buffRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(37, this.buffSecRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(38, this.buffSecRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(39, this.buffSecRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(40, this.buffNormalx);
	this.clKernel_SecundaryRays.setKernelArg(41, this.buffNormaly);
	this.clKernel_SecundaryRays.setKernelArg(42, this.buffNormalz);
	this.clKernel_SecundaryRays.setKernelArg(43, this.buffSecNormalx);
	this.clKernel_SecundaryRays.setKernelArg(44, this.buffSecNormaly);
	this.clKernel_SecundaryRays.setKernelArg(45, this.buffSecNormalz);
	this.clKernel_SecundaryRays.setKernelArg(46, this.buffDirInix);
	this.clKernel_SecundaryRays.setKernelArg(47, this.buffDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(48, this.buffDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(49, this.buffSecDirInix);
	this.clKernel_SecundaryRays.setKernelArg(50, this.buffSecDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(51, this.buffSecDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(52, this.buffBRDFx);
	this.clKernel_SecundaryRays.setKernelArg(53, this.buffBRDFy);
	this.clKernel_SecundaryRays.setKernelArg(54, this.buffBRDFz);
	
	// shadow rays
	this.clKernel_ShadowRays.setKernelArg(23, this.buffNearNode);
	this.clKernel_ShadowRays.setKernelArg(24, this.buffNearBO);
	this.clKernel_ShadowRays.setKernelArg(25, this.buffShadowNearNodeTypeLight);
	this.clKernel_ShadowRays.setKernelArg(26, this.buffShadowNearDistance);
	this.clKernel_ShadowRays.setKernelArg(27, this.buffTEXidx);
	this.clKernel_ShadowRays.setKernelArg(28, this.buffRayOriginx);
	this.clKernel_ShadowRays.setKernelArg(29, this.buffRayOriginy);
	this.clKernel_ShadowRays.setKernelArg(30, this.buffRayOriginz);
	
	
	
	
	var maxLocalWS = clDevices[0].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE);
	this.localWS = [16,16];
	this.globalWS = [512,256]; // Global work item size. Numero total de work-items (kernel en ejecucion)

	var d = new Date();
	this.oldTime = d.getTime();
	
	this.updateObjects();
};
StormRender.prototype.updateObjects = function() {
	var N_VAx = [];	var N_VAy = [];	var N_VAz = [];
	var N_VBx = [];	var N_VBy = [];	var N_VBz = [];
	var N_VCx = [];	var N_VCy = [];	var N_VCz = [];
	var N_TAx = [];	var N_TAy = [];	var N_TAz = [];
	var N_TBx = [];	var N_TBy = [];	var N_TBz = [];
	var N_TCx = [];	var N_TCy = [];	var N_TCz = [];
	var N_NAx = [];	var N_NAy = [];	var N_NAz = [];
	var L_VAx = [];	var L_VAy = [];	var L_VAz = [];
	var L_VBx = [];	var L_VBy = [];	var L_VBz = [];
	var L_VCx = [];	var L_VCy = [];	var L_VCz = [];
	var L_TAx = [];	var L_TAy = [];	var L_TAz = [];
	var L_TBx = [];	var L_TBy = [];	var L_TBz = [];
	var L_TCx = [];	var L_TCy = [];	var L_TCz = [];
	var L_NAx = [];	var L_NAy = [];	var L_NAz = [];
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			for(var b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
				var saltosIdx = b*3;
				var idxA = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
				var idxB = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+1] * 3;
				var idxC = this.nodes[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+2] * 3;
				
				// VERTEXS
				var VA = this.nodes[n].mWMatrixFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA],
															0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA+1],
															0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxA+2],
															0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
				N_VAx.push(VA.e[3]);N_VAy.push(VA.e[7]);N_VAz.push(VA.e[11]);
				var VB = this.nodes[n].mWMatrixFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
															0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
															0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
															0.0,0.0,0.0,1.0]));
				N_VBx.push(VB.e[3]);N_VBy.push(VB.e[7]);N_VBz.push(VB.e[11]);
				var VC = this.nodes[n].mWMatrixFrame.x($M16([1.0,0.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
															0.0,1.0,0.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
															0.0,0.0,1.0,this.nodes[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
															0.0,0.0,0.0,1.0]));
				N_VCx.push(VC.e[3]);N_VCy.push(VC.e[7]);N_VCz.push(VC.e[11]);
				
				// TEXTURES
				var TEXA = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxA+2]]);
				N_TAx.push('0.'+TEXA.e[0].toString().split('.')[1]);N_TAy.push('0.'+TEXA.e[1].toString().split('.')[1]);N_TAz.push('0.'+TEXA.e[2].toString().split('.')[1]);
				var TEXB = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxB+2]]);
				N_TBx.push('0.'+TEXB.e[0].toString().split('.')[1]);N_TBy.push('0.'+TEXB.e[1].toString().split('.')[1]);N_TBz.push('0.'+TEXB.e[2].toString().split('.')[1]);
				var TEXC = $V3([this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC+1], this.nodes[n].buffersObjects[nb].nodeMeshTextureArray[idxC+2]]);
				N_TCx.push('0.'+TEXC.e[0].toString().split('.')[1]);N_TCy.push('0.'+TEXC.e[1].toString().split('.')[1]);N_TCz.push('0.'+TEXC.e[2].toString().split('.')[1]);
				
				// NORMALS
				var NORA = $V3([this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[idxA], this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[idxA+1], this.nodes[n].buffersObjects[nb].nodeMeshNormalArray[idxA+2]]);
				N_NAx.push(NORA.e[0]);N_NAy.push(NORA.e[1]);N_NAz.push(NORA.e[2]);
			}
		}
	}
	for(var n = 0; n < this.lights.length; n++) {
		for(var nb = 0; nb < this.lights[n].buffersObjects.length; nb++) {
			for(var b = 0; b < this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
				var saltosIdx = b*3;
				var idxA = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx] * 3; // )* 3 = itemSize
				var idxB = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+1] * 3;
				var idxC = this.lights[n].buffersObjects[nb].nodeMeshIndexArray[saltosIdx+2] * 3;
				
				// VERTEXS
				var VA = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA],
															0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA+1],
															0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxA+2],
															0.0,0.0,0.0,1.0])); // posicion xyz en WORLD SPACE de un vertice
				L_VAx.push(VA.e[3]);L_VAy.push(VA.e[7]);L_VAz.push(VA.e[11]);
				var VB = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
															0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
															0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
															0.0,0.0,0.0,1.0]));
				L_VBx.push(VB.e[3]);L_VBy.push(VB.e[7]);L_VBz.push(VB.e[11]);
				var VC = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
															0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
															0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
															0.0,0.0,0.0,1.0]));
				L_VCx.push(VC.e[3]);L_VCy.push(VC.e[7]);L_VCz.push(VC.e[11]);
				
				// TEXTURES
				var TEXA = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA+2]]);
				L_TAx.push('0.'+TEXA.e[0].toString().split('.')[1]);L_TAy.push('0.'+TEXA.e[1].toString().split('.')[1]);L_TAz.push('0.'+TEXA.e[2].toString().split('.')[1]);
				var TEXB = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB+2]]);
				L_TBx.push('0.'+TEXB.e[0].toString().split('.')[1]);L_TBy.push('0.'+TEXB.e[1].toString().split('.')[1]);L_TBz.push('0.'+TEXB.e[2].toString().split('.')[1]);
				var TEXC = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC+2]]);
				L_TCx.push('0.'+TEXC.e[0].toString().split('.')[1]);L_TCy.push('0.'+TEXC.e[1].toString().split('.')[1]);L_TCz.push('0.'+TEXC.e[2].toString().split('.')[1]);
				
				// NORMALS
				var NORA = $V3([this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA], this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA+1], this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA+2]]);
				L_NAx.push(NORA.e[0]);L_NAy.push(NORA.e[1]);L_NAz.push(NORA.e[2]);
			}
		}
	}
	this.arrayN_VAx = new Float32Array(N_VAx);	this.arrayN_VAy = new Float32Array(N_VAy);	this.arrayN_VAz = new Float32Array(N_VAz);
	this.arrayN_VBx = new Float32Array(N_VBx);	this.arrayN_VBy = new Float32Array(N_VBy);	this.arrayN_VBz = new Float32Array(N_VBz);
	this.arrayN_VCx = new Float32Array(N_VCx);	this.arrayN_VCy = new Float32Array(N_VCy);	this.arrayN_VCz = new Float32Array(N_VCz);
	this.arrayN_TAx = new Float32Array(N_TAx);	this.arrayN_TAy = new Float32Array(N_TAy);	this.arrayN_TAz = new Float32Array(N_TAz);
	this.arrayN_TBx = new Float32Array(N_TBx);	this.arrayN_TBy = new Float32Array(N_TBy);	this.arrayN_TBz = new Float32Array(N_TBz);
	this.arrayN_TCx = new Float32Array(N_TCx);	this.arrayN_TCy = new Float32Array(N_TCy);	this.arrayN_TCz = new Float32Array(N_TCz);
	this.arrayN_NAx = new Float32Array(N_NAx);	this.arrayN_NAy = new Float32Array(N_NAy);	this.arrayN_NAz = new Float32Array(N_NAz);
	this.arrayL_VAx = new Float32Array(L_VAx);	this.arrayL_VAy = new Float32Array(L_VAy);	this.arrayL_VAz = new Float32Array(L_VAz);
	this.arrayL_VBx = new Float32Array(L_VBx);	this.arrayL_VBy = new Float32Array(L_VBy);	this.arrayL_VBz = new Float32Array(L_VBz);
	this.arrayL_VCx = new Float32Array(L_VCx);	this.arrayL_VCy = new Float32Array(L_VCy);	this.arrayL_VCz = new Float32Array(L_VCz);
	this.arrayL_TAx = new Float32Array(L_TAx);	this.arrayL_TAy = new Float32Array(L_TAy);	this.arrayL_TAz = new Float32Array(L_TAz);
	this.arrayL_TBx = new Float32Array(L_TBx);	this.arrayL_TBy = new Float32Array(L_TBy);	this.arrayL_TBz = new Float32Array(L_TBz);
	this.arrayL_TCx = new Float32Array(L_TCx);	this.arrayL_TCy = new Float32Array(L_TCy);	this.arrayL_TCz = new Float32Array(L_TCz);
	this.arrayL_NAx = new Float32Array(L_NAx);	this.arrayL_NAy = new Float32Array(L_NAy);	this.arrayL_NAz = new Float32Array(L_NAz);
};

StormRender.prototype.setCam = function(nodeCam) {
	// PRIMARY RAYS
	//clCmdQueue.flush();
	this.sample = 1;
	
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
			var idx = ((row * this.viewportWidth) + col);	
			
			this.arrayTotalColorX[idx] = 0.0;
			this.arrayTotalColorY[idx] = 0.0;
			this.arrayTotalColorZ[idx] = 0.0;
			
			this.arrayTotalShadow[idx] = 0.0;
			
			
			
			// PRIMARY RAYS
			var pixelPos = pixelOrigin.add(vecXPlanoProyeccion.x(-1.0).x( col*widthPixel));
			pixelPos = pixelPos.add(vecYPlanoProyeccion.x(-1.0).x(row*heightPixel));
			var currentPixelDir = $V3([pixelPos.e[0], pixelPos.e[1], pixelPos.e[2]]).subtract(posCamera).normalize();
			
			var origin = posCamera.e;
			var end = posCamera.add(currentPixelDir.x(20000.0)).e;
			this.arrayRayOriginx[idx] = origin[0];
			this.arrayRayOriginy[idx] = origin[1];
			this.arrayRayOriginz[idx] = origin[2];
			
			this.arrayRayEndx[idx] = end[0];
			this.arrayRayEndy[idx] = end[1];
			this.arrayRayEndz[idx] = end[2];
			
			this.arrayNearDistance[idx] = 1000000.0;
			this.arraySecNearDistance[idx] = 1000000.0;
			this.arrayShadowNearDistance[idx] = 1000000.0;
		}
	}
	
	
	
	clCmdQueue.enqueueWriteBuffer(this.buffRayOriginx, false, 0, this.bufferSize, this.arrayRayOriginx, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffRayOriginy, false, 0, this.bufferSize, this.arrayRayOriginy, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffRayOriginz, false, 0, this.bufferSize, this.arrayRayOriginz, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffRayEndx, false, 0, this.bufferSize, this.arrayRayEndx, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffRayEndy, false, 0, this.bufferSize, this.arrayRayEndy, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffRayEndz, false, 0, this.bufferSize, this.arrayRayEndz, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffNearDistance, false, 0, this.bufferSize, this.arrayNearDistance, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffSecNearDistance, false, 0, this.bufferSize, this.arraySecNearDistance, []);// this.bufferSize = vectorLength * 4
	clCmdQueue.enqueueWriteBuffer(this.buffShadowNearDistance, false, 0, this.bufferSize, this.arrayShadowNearDistance, []);// this.bufferSize = vectorLength * 4
	
	
	
	var numb = 0;
	for(var n = 0; n < this.nodes.length; n++) {
		for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
			for(var b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
				this.clKernel_PrimaryRays.setKernelArg(0, this.arrayN_VAx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(1, this.arrayN_VAy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(2, this.arrayN_VAz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(3, this.arrayN_VBx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(4, this.arrayN_VBy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(5, this.arrayN_VBz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(6, this.arrayN_VCx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(7, this.arrayN_VCy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(8, this.arrayN_VCz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(9, this.arrayN_TAx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(10, this.arrayN_TAy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(11, this.arrayN_TAz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(12, this.arrayN_TBx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(13, this.arrayN_TBy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(14, this.arrayN_TBz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(15, this.arrayN_TCx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(16, this.arrayN_TCy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(17, this.arrayN_TCz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(18, this.arrayN_NAx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(19, this.arrayN_NAy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(20, this.arrayN_NAz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(21, this.nodes[n].buffersObjects[nb].imageElement_Kd.width, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(22, this.nodes[n].buffersObjects[nb].imageElement_Kd.height, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(23, n, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(24, nb, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(25, 0, WebCL.types.UINT);
				// Init ND-range
				clCmdQueue.enqueueNDRangeKernel(this.clKernel_PrimaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
				clCmdQueue.flush();
				numb++;
			}
		}
	}
	numb = 0;
	for(var n = 0; n < this.lights.length; n++) {
		for(var nb = 0; nb < this.lights[n].buffersObjects.length; nb++) {
			for(var b = 0; b < this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
				this.clKernel_PrimaryRays.setKernelArg(0, this.arrayL_VAx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(1, this.arrayL_VAy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(2, this.arrayL_VAz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(3, this.arrayL_VBx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(4, this.arrayL_VBy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(5, this.arrayL_VBz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(6, this.arrayL_VCx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(7, this.arrayL_VCy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(8, this.arrayL_VCz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(9, this.arrayL_TAx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(10, this.arrayL_TAy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(11, this.arrayL_TAz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(12, this.arrayL_TBx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(13, this.arrayL_TBy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(14, this.arrayL_TBz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(15, this.arrayL_TCx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(16, this.arrayL_TCy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(17, this.arrayL_TCz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(18, this.arrayL_NAx[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(19, this.arrayL_NAy[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(20, this.arrayL_NAz[numb], WebCL.types.FLOAT);
				this.clKernel_PrimaryRays.setKernelArg(21, this.lights[n].buffersObjects[nb].imageElement_Kd.width, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(22, this.lights[n].buffersObjects[nb].imageElement_Kd.height, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(23, n, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(24, nb, WebCL.types.UINT);
				this.clKernel_PrimaryRays.setKernelArg(25, 1, WebCL.types.UINT);
				// Init ND-range
				clCmdQueue.enqueueNDRangeKernel(this.clKernel_PrimaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
				clCmdQueue.flush();
				numb++;
			}
		}
	}
	clCmdQueue.finish();
	
	
	clCmdQueue.enqueueReadBuffer(this.buffTEXidx, false, 0, (this.bufferSize), this.arrayTEXidx, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginx, false, 0, (this.bufferSize), this.arraySecRayOriginx, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginy, false, 0, (this.bufferSize), this.arraySecRayOriginy, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginz, false, 0, (this.bufferSize), this.arraySecRayOriginz, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecNormalx, false, 0, (this.bufferSize), this.arraySecNormalx, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecNormaly, false, 0, (this.bufferSize), this.arraySecNormaly, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecNormalz, false, 0, (this.bufferSize), this.arraySecNormalz, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecDirInix, false, 0, (this.bufferSize), this.arraySecDirInix, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecDirIniy, false, 0, (this.bufferSize), this.arraySecDirIniy, []);
	clCmdQueue.enqueueReadBuffer(this.buffSecDirIniz, false, 0, (this.bufferSize), this.arraySecDirIniz, []);
	clCmdQueue.enqueueReadBuffer(this.buffNearNode, false, 0, (this.bufferSize), this.arrayNearNode, []);
	clCmdQueue.enqueueReadBuffer(this.buffNearBO, false, 0, (this.bufferSize), this.arrayNearBO, []);
	clCmdQueue.enqueueReadBuffer(this.buffNearDistance, false, 0, (this.bufferSize), this.arrayNearDistance, []);
	clCmdQueue.enqueueReadBuffer(this.buffNearNodeTypeLight, false, 0, (this.bufferSize), this.arrayNearNodeTypeLight, []);

	
	for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
			var idx = ((row * this.viewportWidth) + col);
			
			this.arrayPrimaryColorx[idx] = (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]])/255;
			this.arrayPrimaryColory[idx] = (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+1])/255;
			this.arrayPrimaryColorz[idx] = (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+2])/255;
			
			this.arrayNs[idx] = this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].Ns;
			
		}
	}
	this.arrayStoreSecNs = new Float32Array(this.arrayNs);
	
	this.arrayRayOriginx = this.arraySecRayOriginx;
	this.arrayRayOriginy = this.arraySecRayOriginy;
	this.arrayRayOriginz = this.arraySecRayOriginz;
	this.arrayStoreRayOriginx = new Float32Array(this.arrayRayOriginx);
	this.arrayStoreRayOriginy = new Float32Array(this.arrayRayOriginy);
	this.arrayStoreRayOriginz = new Float32Array(this.arrayRayOriginz);
	
	this.arrayNormalx = this.arraySecNormalx;
	this.arrayNormaly = this.arraySecNormaly;
	this.arrayNormalz = this.arraySecNormalz;
	this.arrayStoreNormalx = new Float32Array(this.arrayNormalx);
	this.arrayStoreNormaly = new Float32Array(this.arrayNormaly);
	this.arrayStoreNormalz = new Float32Array(this.arrayNormalz);
	
	this.arrayDirInix = this.arraySecDirInix;
	this.arrayDirIniy = this.arraySecDirIniy;
	this.arrayDirIniz = this.arraySecDirIniz;
	this.arrayStoreDirInix = new Float32Array(this.arrayDirInix);
	this.arrayStoreDirIniy = new Float32Array(this.arrayDirIniy);
	this.arrayStoreDirIniz = new Float32Array(this.arrayDirIniz);
	
};
StormRender.prototype.makeRender = function() {	
	if(typeof(this.callback)== 'function') {
		var d = new Date();
		var currTime = d.getTime();
		var diffTime = (currTime-this.oldTime)/1000;
		this.oldTime = currTime;
		var req = {'sample':this.sample, 'sampleTime':diffTime}
		this.callback(req);
	}
  
	clCmdQueue.enqueueWriteBuffer(this.buffNs, false, 0, this.bufferSize, this.arrayStoreSecNs, []);
	clCmdQueue.enqueueWriteBuffer(this.buffRayOriginx, false, 0, this.bufferSize, this.arrayStoreRayOriginx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffRayOriginy, false, 0, this.bufferSize, this.arrayStoreRayOriginy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffRayOriginz, false, 0, this.bufferSize, this.arrayStoreRayOriginz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffNormalx, false, 0, this.bufferSize, this.arrayStoreNormalx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffNormaly, false, 0, this.bufferSize, this.arrayStoreNormaly, []);
	clCmdQueue.enqueueWriteBuffer(this.buffNormalz, false, 0, this.bufferSize, this.arrayStoreNormalz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffDirInix, false, 0, this.bufferSize, this.arrayStoreDirInix, []);
	clCmdQueue.enqueueWriteBuffer(this.buffDirIniy, false, 0, this.bufferSize, this.arrayStoreDirIniy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffDirIniz, false, 0, this.bufferSize, this.arrayStoreDirIniz, []);
	
	for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
			var idx = ((row * this.viewportWidth) + col);
			
			this.arraySecundaryColorx[idx] = 0.0;
			this.arraySecundaryColory[idx] = 0.0;
			this.arraySecundaryColorz[idx] = 0.0;
			this.arraylight[idx] = 0.0;
		}
	}
	for(var currBounce = 1; currBounce <= this.MAXBOUNCES; currBounce++) {
	
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
				
				this.arrayNoisey[idx] = Math.random();
				this.arrayNoisex[idx] = Math.random();
				
				rowNoise++;
				colNoise++;
			}
		}
		this.sampleNoise++;
		
		clCmdQueue.enqueueWriteBuffer(this.buffNoisex, false, 0, this.bufferSize, this.arrayNoisex, []);// this.bufferSize = vectorLength * 4
		clCmdQueue.enqueueWriteBuffer(this.buffNoisey, false, 0, this.bufferSize, this.arrayNoisey, []);// this.bufferSize = vectorLength * 4

		
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////// SECUNDARY RAYS ///////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		
		var numb = 0;
		for(var n = 0; n < this.nodes.length; n++) {
			for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
				for(var b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
					this.clKernel_SecundaryRays.setKernelArg(2, this.arrayN_VAx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(3, this.arrayN_VAy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(4, this.arrayN_VAz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(5, this.arrayN_VBx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(6, this.arrayN_VBy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(7, this.arrayN_VBz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(8, this.arrayN_VCx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(9, this.arrayN_VCy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(10, this.arrayN_VCz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(11, this.arrayN_TAx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(12, this.arrayN_TAy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(13, this.arrayN_TAz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(14, this.arrayN_TBx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(15, this.arrayN_TBy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(16, this.arrayN_TBz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(17, this.arrayN_TCx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(18, this.arrayN_TCy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(19, this.arrayN_TCz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(20, this.arrayN_NAx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(21, this.arrayN_NAy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(22, this.arrayN_NAz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(23, this.nodes[n].buffersObjects[nb].imageElement_Kd.width, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(24, this.nodes[n].buffersObjects[nb].imageElement_Kd.height, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(25, n, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(26, nb, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(27, 0, WebCL.types.UINT);
					
					// Init ND-range
					clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
					clCmdQueue.flush();
					//clCmdQueue.finish();
					numb++;
				}
			}
		}
		numb = 0;
		for(var n = 0; n < this.lights.length; n++) {
			for(var nb = 0; nb < this.lights[n].buffersObjects.length; nb++) {
				for(var b = 0; b < this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
					this.clKernel_SecundaryRays.setKernelArg(2, this.arrayL_VAx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(3, this.arrayL_VAy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(4, this.arrayL_VAz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(5, this.arrayL_VBx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(6, this.arrayL_VBy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(7, this.arrayL_VBz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(8, this.arrayL_VCx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(9, this.arrayL_VCy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(10, this.arrayL_VCz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(11, this.arrayL_TAx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(12, this.arrayL_TAy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(13, this.arrayL_TAz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(14, this.arrayL_TBx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(15, this.arrayL_TBy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(16, this.arrayL_TBz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(17, this.arrayL_TCx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(18, this.arrayL_TCy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(19, this.arrayL_TCz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(20, this.arrayL_NAx[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(21, this.arrayL_NAy[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(22, this.arrayL_NAz[numb], WebCL.types.FLOAT);
					this.clKernel_SecundaryRays.setKernelArg(23, this.lights[n].buffersObjects[nb].imageElement_Kd.width, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(24, this.lights[n].buffersObjects[nb].imageElement_Kd.height, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(25, n, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(26, nb, WebCL.types.UINT);
					this.clKernel_SecundaryRays.setKernelArg(27, 1, WebCL.types.UINT);

					// Init ND-range
					clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
					clCmdQueue.flush();
					numb++;
				}
			}
		}
		clCmdQueue.finish();
		
		
		clCmdQueue.enqueueReadBuffer(this.buffTEXidx, false, 0, (this.bufferSize), this.arrayTEXidx, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginx, false, 0, (this.bufferSize), this.arraySecRayOriginx, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginy, false, 0, (this.bufferSize), this.arraySecRayOriginy, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecRayOriginz, false, 0, (this.bufferSize), this.arraySecRayOriginz, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecNormalx, false, 0, (this.bufferSize), this.arraySecNormalx, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecNormaly, false, 0, (this.bufferSize), this.arraySecNormaly, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecNormalz, false, 0, (this.bufferSize), this.arraySecNormalz, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecDirInix, false, 0, (this.bufferSize), this.arraySecDirInix, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecDirIniy, false, 0, (this.bufferSize), this.arraySecDirIniy, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecDirIniz, false, 0, (this.bufferSize), this.arraySecDirIniz, []);
		clCmdQueue.enqueueReadBuffer(this.buffNearNode, false, 0, (this.bufferSize), this.arrayNearNode, []);
		clCmdQueue.enqueueReadBuffer(this.buffNearBO, false, 0, (this.bufferSize), this.arrayNearBO, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecNearDistance, false, 0, (this.bufferSize), this.arraySecNearDistance, []);
		clCmdQueue.enqueueReadBuffer(this.buffSecNearNodeTypeLight, false, 0, (this.bufferSize), this.arraySecNearNodeTypeLight, []);
		clCmdQueue.enqueueReadBuffer(this.buffBRDFx, false, 0, (this.bufferSize), this.arrayBRDFx, []);
		clCmdQueue.enqueueReadBuffer(this.buffBRDFy, false, 0, (this.bufferSize), this.arrayBRDFy, []);
		clCmdQueue.enqueueReadBuffer(this.buffBRDFz, false, 0, (this.bufferSize), this.arrayBRDFz, []);
		
		for (var row = 0; row < this.viewportHeight; row++) {
			for (var col = 0; col < this.viewportWidth; col++) {
				var idx = ((row * this.viewportWidth) + col);
				
				if(this.arraySecNearDistance[idx] != 1000000.0) {
					if(this.arraySecNearNodeTypeLight[idx] == 0) {
						this.arraySecundaryColorAcumx[idx] = (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]])/255;
						this.arraySecundaryColorAcumy[idx] = (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+1])/255;
						this.arraySecundaryColorAcumz[idx] = (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+2])/255;
						this.arrayNs[idx] = this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].Ns;
					} else {
						this.arraySecundaryColorAcumx[idx] = (this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]])/255;
						this.arraySecundaryColorAcumy[idx] = (this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+1])/255;
						this.arraySecundaryColorAcumz[idx] = (this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+2])/255;
						this.arrayNs[idx] = this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].Ns;
					}
				}
				
				this.arraylightAcums[idx] = 0.0;
				this.arrayColorlightx[idx] = 0.0;
				this.arrayColorlighty[idx] = 0.0;
				this.arrayColorlightz[idx] = 0.0;
			}
		}
		
		clCmdQueue.enqueueWriteBuffer(this.buffNs, false, 0, this.bufferSize, this.arrayNs, []);
		
		
		
		
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////// SHADOW RAYS ///////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		this.LNx = -0.1+(Math.random()*0.2);
		this.LNy = -0.1+(Math.random()*0.2);
		this.LNz = -0.1+(Math.random()*0.2);
		for(var nL = 0; nL < this.lights.length; nL++) {
				numb = 0;
				for(var n = 0; n < this.nodes.length; n++) {
					for(var nb = 0; nb < this.nodes[n].buffersObjects.length; nb++) {
						for(var b = 0; b < this.nodes[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {						
							this.clKernel_ShadowRays.setKernelArg(0, this.arrayN_VAx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(1, this.arrayN_VAy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(2, this.arrayN_VAz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(3, this.arrayN_VBx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(4, this.arrayN_VBy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(5, this.arrayN_VBz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(6, this.arrayN_VCx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(7, this.arrayN_VCy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(8, this.arrayN_VCz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(9, this.arrayN_TAx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(10, this.arrayN_TAy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(11, this.arrayN_TAz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(12, this.arrayN_TBx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(13, this.arrayN_TBy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(14, this.arrayN_TBz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(15, this.arrayN_TCx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(16, this.arrayN_TCy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(17, this.arrayN_TCz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(18, this.nodes[n].buffersObjects[nb].imageElement_Kd.width, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(19, this.nodes[n].buffersObjects[nb].imageElement_Kd.height, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(20, n, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(21, nb, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(22, 0, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(31, this.lights[nL].mrealWMatrixFrame.e[3]+this.LNx, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(32, this.lights[nL].mrealWMatrixFrame.e[7]+this.LNy, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(33, this.lights[nL].mrealWMatrixFrame.e[11]+this.LNz, WebCL.types.FLOAT);
							// Init ND-range
							clCmdQueue.enqueueNDRangeKernel(this.clKernel_ShadowRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
							clCmdQueue.flush();
							//clCmdQueue.finish();
							numb++;
						}
					}
				}
				numb = 0;
				for(var n = 0; n < this.lights.length; n++) {
					for(var nb = 0; nb < this.lights[n].buffersObjects.length; nb++) {
						for(var b = 0; b < this.lights[n].buffersObjects[nb].nodeMeshIndexArray.length/3; b++) {
							if(this.lights[n].id == this.lights[nL].id) {
								this.rNVAx = this.arrayL_VAx[numb]+this.LNx;
								this.rNVAy = this.arrayL_VAy[numb]+this.LNy;
								this.rNVAz = this.arrayL_VAz[numb]+this.LNz;
								this.rNVBx = this.arrayL_VBx[numb]+this.LNx;
								this.rNVBy = this.arrayL_VBy[numb]+this.LNy;
								this.rNVBz = this.arrayL_VBz[numb]+this.LNz;
								this.rNVCx = this.arrayL_VCx[numb]+this.LNx;
								this.rNVCy = this.arrayL_VCy[numb]+this.LNy;
								this.rNVCz = this.arrayL_VCz[numb]+this.LNz;
							} else {
								this.rNVAx = this.arrayL_VAx[numb];
								this.rNVAy = this.arrayL_VAy[numb];
								this.rNVAz = this.arrayL_VAz[numb];
								this.rNVBx = this.arrayL_VBx[numb];
								this.rNVBy = this.arrayL_VBy[numb];
								this.rNVBz = this.arrayL_VBz[numb];
								this.rNVCx = this.arrayL_VCx[numb];
								this.rNVCy = this.arrayL_VCy[numb];
								this.rNVCz = this.arrayL_VCz[numb];
							}
							this.clKernel_ShadowRays.setKernelArg(0, this.rNVAx, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(1, this.rNVAy, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(2, this.rNVAz, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(3, this.rNVBx, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(4, this.rNVBy, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(5, this.rNVBz, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(6, this.rNVCx, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(7, this.rNVCy, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(8, this.rNVCz, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(9, this.arrayL_TAx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(10, this.arrayL_TAy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(11, this.arrayL_TAz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(12, this.arrayL_TBx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(13, this.arrayL_TBy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(14, this.arrayL_TBz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(15, this.arrayL_TCx[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(16, this.arrayL_TCy[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(17, this.arrayL_TCz[numb], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(18, this.lights[n].buffersObjects[nb].imageElement_Kd.width, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(19, this.lights[n].buffersObjects[nb].imageElement_Kd.height, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(20, n, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(21, nb, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(22, 1, WebCL.types.UINT);
							this.clKernel_ShadowRays.setKernelArg(31, this.lights[nL].mrealWMatrixFrame.e[3]+this.LNx, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(32, this.lights[nL].mrealWMatrixFrame.e[7]+this.LNy, WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(33, this.lights[nL].mrealWMatrixFrame.e[11]+this.LNz, WebCL.types.FLOAT);
							// Init ND-range
							clCmdQueue.enqueueNDRangeKernel(this.clKernel_ShadowRays, this.globalWS.length, [], this.globalWS, this.localWS, []);
							clCmdQueue.flush();
							numb++;
						}
					}
				}
				clCmdQueue.finish();
				
				
				clCmdQueue.enqueueReadBuffer(this.buffTEXidx, false, 0, (this.bufferSize), this.arrayTEXidx, []);
				clCmdQueue.enqueueReadBuffer(this.buffNearNode, false, 0, (this.bufferSize), this.arrayNearNode, []);
				clCmdQueue.enqueueReadBuffer(this.buffNearBO, false, 0, (this.bufferSize), this.arrayNearBO, []);
				clCmdQueue.enqueueReadBuffer(this.buffShadowNearDistance, false, 0, (this.bufferSize), this.arrayShadowNearDistance, []);
				clCmdQueue.enqueueReadBuffer(this.buffShadowNearNodeTypeLight, false, 0, (this.bufferSize), this.arrayShadowNearNodeTypeLight, []);
				

				
				for (var row = 0; row < this.viewportHeight; row++) {
					for (var col = 0; col < this.viewportWidth; col++) {
						var idx = ((row * this.viewportWidth) + col);
						
						if(this.arrayShadowNearDistance[idx] == 1000000.0) {
							this.arrayColorlightx[idx] += this.ambientColor.e[0];
							this.arrayColorlighty[idx] += this.ambientColor.e[1];
							this.arrayColorlightz[idx] += this.ambientColor.e[2];
							this.arraylightAcums[idx] += 1.0;
						} else {
							if(this.arrayShadowNearNodeTypeLight[idx] == 0) {
								if(currBounce > 1) {
									this.arrayColorlightx[idx] += (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]])/255;
									this.arrayColorlighty[idx] += (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+1])/255;
									this.arrayColorlightz[idx] += (this.nodes[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+2])/255;
								} else {
									this.arrayColorlightx[idx] += this.arraySecundaryColorAcumx[idx];
									this.arrayColorlighty[idx] += this.arraySecundaryColorAcumy[idx];
									this.arrayColorlightz[idx] += this.arraySecundaryColorAcumz[idx];
								}
							} else {
								this.arrayColorlightx[idx] += (this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]])/255;
								this.arrayColorlighty[idx] += (this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+1])/255;
								this.arrayColorlightz[idx] += (this.lights[this.arrayNearNode[idx]].buffersObjects[this.arrayNearBO[idx]].arrayTEX_Kd[this.arrayTEXidx[idx]+2])/255;
								
								var lightR = $V3([this.arraySecRayOriginx[idx],this.arraySecRayOriginy[idx+1],this.arraySecRayOriginz[idx+2]]).subtract($V3([this.lights[nL].mrealWMatrixFrame.e[3],this.lights[nL].mrealWMatrixFrame.e[7],this.lights[nL].mrealWMatrixFrame.e[11]]));
								var vecBRDF = $V3([this.arrayBRDFx[idx],this.arrayBRDFy[idx+1],this.arrayBRDFz[idx+2]]);
								var dif = Math.abs(vecBRDF.dot(lightR.normalize()));
								var IS = this.lights[this.arrayNearNode[idx]].type == 'spot' ? dif*(1.0-this.smoothstep(0.0,10.0,lightR.modulus())) : dif;
								this.arraylightAcums[idx] += Math.max(0.001,IS);
								//this.arraylightAcums[idx] += 1.0;
							}
						}
						
						
						
						this.arrayShadowNearDistance[idx] = 1000000.0;
						this.arrayShadowNearNodeTypeLight[idx] = 0;
					}
				}
				
				clCmdQueue.enqueueWriteBuffer(this.buffShadowNearDistance, false, 0, this.bufferSize, this.arrayShadowNearDistance, []);// this.bufferSize = vectorLength * 4
				clCmdQueue.enqueueWriteBuffer(this.buffShadowNearNodeTypeLight, false, 0, this.bufferSize, this.arrayShadowNearNodeTypeLight, []);// this.bufferSize = vectorLength * 4
			
		}
		
		
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////// BOUNCE UNION ///////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		
		for (var row = 0; row < this.viewportHeight; row++) {
			for (var col = 0; col < this.viewportWidth; col++) {
				var idx = ((row * this.viewportWidth) + col);

				if(this.arrayNearDistance[idx] == 1000000.0) {
					this.arrayPrimaryColorx[idx] = this.ambientColor.e[0];
					this.arrayPrimaryColory[idx] = this.ambientColor.e[1];
					this.arrayPrimaryColorz[idx] = this.ambientColor.e[2];
					this.arraySecundaryColorx[idx] += this.ambientColor.e[0];
					this.arraySecundaryColory[idx] += this.ambientColor.e[1];
					this.arraySecundaryColorz[idx] += this.ambientColor.e[2];
					this.arraylight[idx] += 1.0;
				} else if(this.arrayNearNodeTypeLight[idx] == 1) {
					this.arraySecundaryColorx[idx] += this.arrayPrimaryColorx[idx];
					this.arraySecundaryColory[idx] += this.arrayPrimaryColory[idx];
					this.arraySecundaryColorz[idx] += this.arrayPrimaryColorz[idx];
					this.arraylight[idx] += 1.0;
				} else {
					var change = true;
					if(this.arraySecNearDistance[idx] == 1000000.0) {
						this.arraySecundaryColorAcumx[idx] = this.ambientColor.e[0];
						this.arraySecundaryColorAcumy[idx] = this.ambientColor.e[1];
						this.arraySecundaryColorAcumz[idx] = this.ambientColor.e[2];
						
						this.arraylight[idx] += 1.0;
						change = false;
					} else if(this.arraySecNearNodeTypeLight[idx] == 1) {
						
						this.arraylight[idx] += 1.0;
						change = false;
					} else {
						if(this.REALLIGHTLENGTH > 1) {
							this.arrayColorlightx[idx] /= this.REALLIGHTLENGTH;
							this.arrayColorlighty[idx] /= this.REALLIGHTLENGTH;
							this.arrayColorlightz[idx] /= this.REALLIGHTLENGTH;
							this.arraylightAcums[idx] /= this.REALLIGHTLENGTH;
						}	
						this.arraySecundaryColorAcumx[idx] *= this.arrayColorlightx[idx];
						this.arraySecundaryColorAcumy[idx] *= this.arrayColorlighty[idx];
						this.arraySecundaryColorAcumz[idx] *= this.arrayColorlightz[idx];
						this.arraylight[idx] += this.arraylightAcums[idx];
					}
					this.arraySecundaryColorx[idx] += this.arraySecundaryColorAcumx[idx];
					this.arraySecundaryColory[idx] += this.arraySecundaryColorAcumy[idx];
					this.arraySecundaryColorz[idx] += this.arraySecundaryColorAcumz[idx];
					
					if(change == false) {
						this.arrayNs[idx] = this.arrayStoreSecNs[idx];
						this.arraySecRayOriginx[idx] = this.arrayStoreRayOriginx[idx];
						this.arraySecRayOriginy[idx] = this.arrayStoreRayOriginy[idx];
						this.arraySecRayOriginz[idx] = this.arrayStoreRayOriginz[idx];
						this.arraySecNormalx[idx] = this.arrayStoreNormalx[idx];
						this.arraySecNormaly[idx] = this.arrayStoreNormaly[idx];
						this.arraySecNormalz[idx] = this.arrayStoreNormalz[idx];
						this.arraySecDirInix[idx] = this.arrayStoreDirInix[idx];
						this.arraySecDirIniy[idx] = this.arrayStoreDirIniy[idx];
						this.arraySecDirIniz[idx] = this.arrayStoreDirIniz[idx];
					}
					
				}
				
				this.arraySecNearDistance[idx] = 1000000.0;
				this.arraySecNearNodeTypeLight[idx] = 0;
			}
		}
		clCmdQueue.enqueueWriteBuffer(this.buffSecNearDistance, false, 0, this.bufferSize, this.arraySecNearDistance, []);// this.bufferSize = vectorLength * 4
		clCmdQueue.enqueueWriteBuffer(this.buffSecNearNodeTypeLight, false, 0, this.bufferSize, this.arraySecNearNodeTypeLight, []);// this.bufferSize = vectorLength * 4

		
		clCmdQueue.enqueueWriteBuffer(this.buffRayOriginx, false, 0, this.bufferSize, this.arraySecRayOriginx, []);
		clCmdQueue.enqueueWriteBuffer(this.buffRayOriginy, false, 0, this.bufferSize, this.arraySecRayOriginy, []);
		clCmdQueue.enqueueWriteBuffer(this.buffRayOriginz, false, 0, this.bufferSize, this.arraySecRayOriginz, []);
		clCmdQueue.enqueueWriteBuffer(this.buffNormalx, false, 0, this.bufferSize, this.arraySecNormalx, []);
		clCmdQueue.enqueueWriteBuffer(this.buffNormaly, false, 0, this.bufferSize, this.arraySecNormaly, []);
		clCmdQueue.enqueueWriteBuffer(this.buffNormalz, false, 0, this.bufferSize, this.arraySecNormalz, []);
		clCmdQueue.enqueueWriteBuffer(this.buffDirInix, false, 0, this.bufferSize, this.arraySecDirInix, []);
		clCmdQueue.enqueueWriteBuffer(this.buffDirIniy, false, 0, this.bufferSize, this.arraySecDirIniy, []);
		clCmdQueue.enqueueWriteBuffer(this.buffDirIniz, false, 0, this.bufferSize, this.arraySecDirIniz, []);
	} // END FOR BOUNCES
	
	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////// BOUNCES UNION ///////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////
	
	for (var row = 0; row < this.viewportHeight; row++) {
		for (var col = 0; col < this.viewportWidth; col++) {
			var idx = ((row * this.viewportWidth) + col);
			var idxData = idx*4;
			
			if(this.MAXBOUNCES > 1) {
				this.arraySecundaryColorx[idx] /= this.MAXBOUNCES;
				this.arraySecundaryColory[idx] /= this.MAXBOUNCES;
				this.arraySecundaryColorz[idx] /= this.MAXBOUNCES;
				this.arraylight[idx] /= this.MAXBOUNCES;
			}
			
			this.arrayTotalColorX[idx] += ((this.arrayPrimaryColorx[idx]+this.arraySecundaryColorx[idx])/2.0);
			this.arrayTotalColorY[idx] += ((this.arrayPrimaryColory[idx]+this.arraySecundaryColory[idx])/2.0);
			this.arrayTotalColorZ[idx] += ((this.arrayPrimaryColorz[idx]+this.arraySecundaryColorz[idx])/2.0);
			this.arrayTotalShadow[idx] += this.arraylight[idx];
			
			this.canvasData.data[idxData+0] = ((this.arrayTotalColorX[idx]/this.sample)*(this.arrayTotalShadow[idx]/this.sample))*255;
			this.canvasData.data[idxData+1] = ((this.arrayTotalColorY[idx]/this.sample)*(this.arrayTotalShadow[idx]/this.sample))*255;
			this.canvasData.data[idxData+2] = ((this.arrayTotalColorZ[idx]/this.sample)*(this.arrayTotalShadow[idx]/this.sample))*255;
			this.canvasData.data[idxData+3] = 255;
		}
	}
    this.ctx2Drender.putImageData(this.canvasData, 0, 0);
    this.sample++;
	
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
StormRender.prototype.smoothstep = function(edge0, edge1, x) {
    if (x < edge0) return 0;
    if (x >= edge1) return 1;
    if (edge0 == edge1) return -1;
    var p = (x - edge0) / (edge1 - edge0);
	
    return (p * p * (3 - 2 * p));
};

