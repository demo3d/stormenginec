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
  // CARGA ESCENA INICIALMENTE EN MEMORIA GLOBAL (RAPIDO, PERO NO PERMITE ESCENAS GRANDES)
StormRender = function(DIVID) {
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
							'__global float* VAx,'+ // 0
							'__global float* VAy,'+ // 1
							'__global float* VAz,'+ // 2
							'__global float* VBx,'+ // 3
							'__global float* VBy,'+ // 4
							'__global float* VBz,'+ // 5
							'__global float* VCx,'+ // 6
							'__global float* VCy,'+ // 7
							'__global float* VCz,'+ // 8
							'__global float* TEXAx,'+ // 9
							'__global float* TEXAy,'+ // 10
							'__global float* TEXAz,'+ // 11
							'__global float* TEXBx,'+ // 12
							'__global float* TEXBy,'+ // 13
							'__global float* TEXBz,'+ // 14
							'__global float* TEXCx,'+ // 15
							'__global float* TEXCy,'+ // 16
							'__global float* TEXCz,'+ // 17
							'__global float* NORAx,'+ // 18
							'__global float* NORAy,'+ // 19
							'__global float* NORAz,'+ // 20
							'__global uint* TEXwidth,'+ // 21
							'__global uint* TEXheight,'+ // 22
							'__global uint* CurrentNode,'+ // 23
							'__global uint* CurrentBO,'+ // 24
							'__global uint* NodeTypeLight,'+ // 25
							'unsigned int nums,'+ // 26
							'__global uint* NearNode,'+ // 27
							'__global uint* NearBO,'+ // 28
							'__global uint* NearNodeTypeLight,'+ // 29
							'__global float* NearDistance,'+ // 30
							'__global uint* TEXidx,'+ // 31
							'__global float* RayOriginx,'+ // 32
							'__global float* RayOriginy,'+ // 33
							'__global float* RayOriginz,'+ // 34
							'__global float* SecRayOriginx,'+ // 35
							'__global float* SecRayOriginy,'+ // 36
							'__global float* SecRayOriginz,'+ // 37
							'__global float* RayEndx,'+ // 38
							'__global float* RayEndy,'+ // 39
							'__global float* RayEndz,'+ // 40
							'__global float* SecNormalx,'+ // 41
							'__global float* SecNormaly,'+ // 42
							'__global float* SecNormalz,'+ // 43 
							'__global float* SecDirInix,'+ // 44
							'__global float* SecDirIniy,'+ // 45
							'__global float* SecDirIniz'+ // 46
							') {\n'+

		'int x = get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;float3 vecNorB;float3 vecNorC;\n'+
		'float NearDist = 1000000.0f;'+
		'for(uint n = 0; n < nums; n++) {\n'+
			'vecVertexA = (float3)(VAx[n], VAy[n], VAz[n]);\n'+
			'vecVertexB = (float3)(VBx[n], VBy[n], VBz[n]);\n'+
			'vecVertexC = (float3)(VCx[n], VCy[n], VCz[n]);\n'+
			
			'vecRayOrigin = (float3)(RayOriginx[x], RayOriginy[x], RayOriginz[x]);\n'+
			
			'vecRayEnd = (float3)(RayEndx[x], RayEndy[x], RayEndz[x]);\n'+
			
			
			'u = vecVertexB-vecVertexA;\n'+
			'v = vecVertexC-vecVertexA;\n'+
			'float3 tmpNormal = cross(u,v);\n'+ 
			'float3 dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
			'if(dataRayTriangle.s0 > 0.0f){\n'+
				'if(dataRayTriangle.s0 < NearDist) {\n'+
					'NearDist = dataRayTriangle.s0;\n'+
					'NearDistance[x] = dataRayTriangle.s0;\n'+
					'NearNode[x] = CurrentNode[n];\n'+
					'NearBO[x] = CurrentBO[n];\n'+
					
					'float3 dirInicial = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
					'float3 vecSecRayOrigin = vecRayOrigin+(dirInicial*(dataRayTriangle.s0-0.005f));\n'+
					'SecRayOriginx[x] = vecSecRayOrigin.x;\n'+
					'SecRayOriginy[x] = vecSecRayOrigin.y;\n'+
					'SecRayOriginz[x] = vecSecRayOrigin.z;\n'+
					
					'vecNorA = (float3)(NORAx[n], NORAy[n], NORAz[n]);\n'+
					'float3 pNormal = fast_normalize(vecNorA);\n'+
					'SecNormalx[x] = pNormal.x;\n'+
					'SecNormaly[x] = pNormal.y;\n'+
					'SecNormalz[x] = pNormal.z;\n'+
					
					'NearNodeTypeLight[x] = NodeTypeLight[n];\n'+
					
					'SecDirInix[x] = dirInicial.x;\n'+
					'SecDirIniy[x] = dirInicial.y;\n'+
					'SecDirIniz[x] = dirInicial.z;\n'+
					
					'coordTexA = (float3)(TEXAx[n], TEXAy[n], TEXAz[n]);\n'+
					'coordTexB = (float3)(TEXBx[n], TEXBy[n], TEXBz[n]);\n'+
					'coordTexC = (float3)(TEXCx[n], TEXCy[n], TEXCz[n]);\n'+
					'TEXidx[x] = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth[n], TEXheight[n]);\n'+
				'}\n'+
			'}\n'+
		'}\n'+
		
	'}\n'+
	
	'__kernel void kernelSecundaryRays('+
							'__global float* noiseX,'+ // 0
							'__global float* noiseY,'+ // 1
							'__global float* VAx,'+ // 2
							'__global float* VAy,'+ // 3
							'__global float* VAz,'+ // 4
							'__global float* VBx,'+ // 5
							'__global float* VBy,'+ // 6
							'__global float* VBz,'+ // 7
							'__global float* VCx,'+ // 8
							'__global float* VCy,'+ // 9
							'__global float* VCz,'+ // 10
							'__global float* TEXAx,'+ // 11
							'__global float* TEXAy,'+ // 12
							'__global float* TEXAz,'+ // 13
							'__global float* TEXBx,'+ // 14
							'__global float* TEXBy,'+ // 15
							'__global float* TEXBz,'+ // 16
							'__global float* TEXCx,'+ // 17
							'__global float* TEXCy,'+ // 18
							'__global float* TEXCz,'+ // 19
							'__global float* NORAx,'+ // 20
							'__global float* NORAy,'+ // 21
							'__global float* NORAz,'+ // 22
							'__global uint* TEXwidth,'+ // 23
							'__global uint* TEXheight,'+ // 24
							'__global uint* CurrentNode,'+ // 25
							'__global uint* CurrentBO,'+ // 26
							'__global uint* NodeTypeLight,'+ // 27
							'unsigned int nums,'+ // 28
							'__global uint* NearNode,'+ // 29
							'__global uint* NearBO,'+ // 30
							'__global uint* NearNodeTypeLight,'+ // 31
							'__global float* NearDistance,'+ // 32
							'__global float* Ns,'+ // 33
							'__global uint* TEXidx,'+ // 34
							'__global float* RayOriginx,'+ // 35
							'__global float* RayOriginy,'+ // 36
							'__global float* RayOriginz,'+ // 37
							'__global float* RayOriginSecx,'+ // 38
							'__global float* RayOriginSecy,'+ // 39
							'__global float* RayOriginSecz,'+ // 40
							'__global float* Normalx,'+ // 41
							'__global float* Normaly,'+ // 42
							'__global float* Normalz,'+ // 43
							'__global float* NormalSecx,'+ // 44
							'__global float* NormalSecy,'+ // 45
							'__global float* NormalSecz,'+ // 46
							'__global float* DirInix,'+ // 47
							'__global float* DirIniy,'+ // 48
							'__global float* DirIniz,'+ // 49
							'__global float* SecDirInix,'+ // 50
							'__global float* SecDirIniy,'+ // 51
							'__global float* SecDirIniz,'+ // 52
							'__global float* BRDFx,'+ // 53
							'__global float* BRDFy,'+ // 54
							'__global float* BRDFz'+ // 55
							') {\n'+

		'int x = get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float3 vecNorA;\n'+
		'float NearDist = 1000000.0f;'+
		'for(uint n = 0; n < nums; n++) {\n'+
			'vecVertexA = (float3)(VAx[n], VAy[n], VAz[n]);\n'+
			'vecVertexB = (float3)(VBx[n], VBy[n], VBz[n]);\n'+
			'vecVertexC = (float3)(VCx[n], VCy[n], VCz[n]);\n'+
			
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
				'if(dataRayTriangle.s0 < NearDist) {\n'+
					'NearDist = dataRayTriangle.s0;\n'+
					'NearDistance[x] = dataRayTriangle.s0;\n'+
					'NearNode[x] = CurrentNode[n];\n'+
					'NearBO[x] = CurrentBO[n];\n'+
					
					'float3 dirInicialSec = fast_normalize(vecRayEnd-vecRayOrigin);\n'+
					'float3 vecRayOriginSec = vecRayOrigin+(dirInicialSec*(dataRayTriangle.s0-0.005f));\n'+
					'RayOriginSecx[x] = vecRayOriginSec.x;\n'+
					'RayOriginSecy[x] = vecRayOriginSec.y;\n'+
					'RayOriginSecz[x] = vecRayOriginSec.z;\n'+
					
					'vecNorA = (float3)(NORAx[n], NORAy[n], NORAz[n]);\n'+
					'float3 pNormalSec = fast_normalize(vecNorA);\n'+
					'NormalSecx[x] = pNormalSec.x;\n'+
					'NormalSecy[x] = pNormalSec.y;\n'+
					'NormalSecz[x] = pNormalSec.z;\n'+
					
					'NearNodeTypeLight[x] = NodeTypeLight[n];\n'+
					
					'SecDirInix[x] = dirInicialSec.x;\n'+
					'SecDirIniy[x] = dirInicialSec.y;\n'+
					'SecDirIniz[x] = dirInicialSec.z;\n'+
					
					'coordTexA = (float3)(TEXAx[n], TEXAy[n], TEXAz[n]);\n'+
					'coordTexB = (float3)(TEXBx[n], TEXBy[n], TEXBz[n]);\n'+
					'coordTexC = (float3)(TEXCx[n], TEXCy[n], TEXCz[n]);\n'+
					'TEXidx[x] = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth[n], TEXheight[n]);\n'+
				'}\n'+
			'}\n'+
		'}\n'+
		
	'}\n'+
	'__kernel void kernelShadowRays('+
							'__global float* VAx,'+ // 0
							'__global float* VAy,'+ // 1
							'__global float* VAz,'+ // 2
							'__global float* VBx,'+ // 3
							'__global float* VBy,'+ // 4
							'__global float* VBz,'+ // 5
							'__global float* VCx,'+ // 6
							'__global float* VCy,'+ // 7
							'__global float* VCz,'+ // 8
							'__global float* TEXAx,'+ // 9
							'__global float* TEXAy,'+ // 10
							'__global float* TEXAz,'+ // 11
							'__global float* TEXBx,'+ // 12
							'__global float* TEXBy,'+ // 13
							'__global float* TEXBz,'+ // 14
							'__global float* TEXCx,'+ // 15
							'__global float* TEXCy,'+ // 16
							'__global float* TEXCz,'+ // 17
							'__global uint* TEXwidth,'+ // 18
							'__global uint* TEXheight,'+ // 19
							'__global uint* CurrentNode,'+ // 20
							'__global uint* CurrentBO,'+ // 21
							'__global uint* NodeTypeLight,'+ // 22
							'unsigned int nums,'+ // 23
							'__global uint* NearShadowNode,'+ // 24
							'__global uint* NearShadowBO,'+ // 25
							'__global uint* NearShadowNodeTypeLight,'+ // 26
							'__global float* NearShadowDistance,'+ // 27
							'__global uint* TEXShadowidx,'+ // 28
							'__global float* RayShadowOriginx,'+ // 29
							'__global float* RayShadowOriginy,'+ // 30
							'__global float* RayShadowOriginz,'+ // 31
							'float RayShadowEndx,'+ // 32
							'float RayShadowEndy,'+ // 33
							'float RayShadowEndz'+ // 34
							') {\n'+

		'int x = get_global_id(0);\n'+
		
		'float3 vecRayOrigin;float3 vecRayEnd;float3 vecVertexA;float3 vecVertexB;float3 vecVertexC;float3 u; float3 v;\n'+
		'float3 coordTexA;float3 coordTexB;float3 coordTexC;\n'+
		'float NearDist = 1000000.0f;'+
		'for(uint n = 0; n < nums; n++) {\n'+
			'vecVertexA = (float3)(VAx[n], VAy[n], VAz[n]);\n'+
			'vecVertexB = (float3)(VBx[n], VBy[n], VBz[n]);\n'+
			'vecVertexC = (float3)(VCx[n], VCy[n], VCz[n]);\n'+
			
			'vecRayOrigin = (float3)(RayShadowOriginx[x], RayShadowOriginy[x], RayShadowOriginz[x]);\n'+
			
			'vecRayEnd = (float3)(RayShadowEndx, RayShadowEndy, RayShadowEndz);\n'+

			
			'u = vecVertexB-vecVertexA;\n'+
			'v = vecVertexC-vecVertexA;\n'+
			'float3 tmpNormal = cross(u,v);\n'+
			'float3 dataRayTriangle = setRayTriangle(vecRayOrigin, vecRayEnd, vecVertexA, vecVertexB, vecVertexC, u, v, tmpNormal);\n'+
			'if(dataRayTriangle.s0 > 0.0f){\n'+
				'if(dataRayTriangle.s0 < NearDist) {\n'+
					'NearDist = dataRayTriangle.s0;\n'+
					'NearShadowDistance[x] = dataRayTriangle.s0;\n'+
					'NearShadowNode[x] = CurrentNode[n];\n'+
					'NearShadowBO[x] = CurrentBO[n];\n'+

					'NearShadowNodeTypeLight[x] = NodeTypeLight[n];\n'+
					
					'coordTexA = (float3)(TEXAx[n], TEXAy[n], TEXAz[n]);\n'+
					'coordTexB = (float3)(TEXBx[n], TEXBy[n], TEXBz[n]);\n'+
					'coordTexC = (float3)(TEXCx[n], TEXCy[n], TEXCz[n]);\n'+
					'TEXShadowidx[x] = getUVTextureIdx(coordTexA, coordTexB, coordTexC, dataRayTriangle.s1, dataRayTriangle.s2, TEXwidth[n], TEXheight[n]);\n'+
				'}\n'+
					
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

	this.updateObjects();
	
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
	this.clKernel_PrimaryRays.setKernelArg(0, this.buffVAx);
	this.clKernel_PrimaryRays.setKernelArg(1, this.buffVAy);
	this.clKernel_PrimaryRays.setKernelArg(2, this.buffVAz);
	this.clKernel_PrimaryRays.setKernelArg(3, this.buffVBx);
	this.clKernel_PrimaryRays.setKernelArg(4, this.buffVBy);
	this.clKernel_PrimaryRays.setKernelArg(5, this.buffVBz);
	this.clKernel_PrimaryRays.setKernelArg(6, this.buffVCx);
	this.clKernel_PrimaryRays.setKernelArg(7, this.buffVCy);
	this.clKernel_PrimaryRays.setKernelArg(8, this.buffVCz);
	this.clKernel_PrimaryRays.setKernelArg(9, this.buffTAx);
	this.clKernel_PrimaryRays.setKernelArg(10, this.buffTAy);
	this.clKernel_PrimaryRays.setKernelArg(11, this.buffTAz);
	this.clKernel_PrimaryRays.setKernelArg(12, this.buffTBx);
	this.clKernel_PrimaryRays.setKernelArg(13, this.buffTBy);
	this.clKernel_PrimaryRays.setKernelArg(14, this.buffTBz);
	this.clKernel_PrimaryRays.setKernelArg(15, this.buffTCx);
	this.clKernel_PrimaryRays.setKernelArg(16, this.buffTCy);
	this.clKernel_PrimaryRays.setKernelArg(17, this.buffTCz);
	this.clKernel_PrimaryRays.setKernelArg(18, this.buffNAx);
	this.clKernel_PrimaryRays.setKernelArg(19, this.buffNAy);
	this.clKernel_PrimaryRays.setKernelArg(20, this.buffNAz);
	this.clKernel_PrimaryRays.setKernelArg(21, this.buffTEXwidth);
	this.clKernel_PrimaryRays.setKernelArg(22, this.buffTEXheight);
	this.clKernel_PrimaryRays.setKernelArg(23, this.buffCurrentNode);
	this.clKernel_PrimaryRays.setKernelArg(24, this.buffCurrentBO);
	this.clKernel_PrimaryRays.setKernelArg(25, this.buffTypeLight);
	this.clKernel_PrimaryRays.setKernelArg(26, this.NUMOBJECTS, WebCL.types.UINT);
	this.clKernel_PrimaryRays.setKernelArg(27, this.buffNearNode);
	this.clKernel_PrimaryRays.setKernelArg(28, this.buffNearBO);
	this.clKernel_PrimaryRays.setKernelArg(29, this.buffNearNodeTypeLight);
	this.clKernel_PrimaryRays.setKernelArg(30, this.buffNearDistance);
	this.clKernel_PrimaryRays.setKernelArg(31, this.buffTEXidx);
	this.clKernel_PrimaryRays.setKernelArg(32, this.buffRayOriginx);
	this.clKernel_PrimaryRays.setKernelArg(33, this.buffRayOriginy);
	this.clKernel_PrimaryRays.setKernelArg(34, this.buffRayOriginz);
	this.clKernel_PrimaryRays.setKernelArg(35, this.buffSecRayOriginx);
	this.clKernel_PrimaryRays.setKernelArg(36, this.buffSecRayOriginy);
	this.clKernel_PrimaryRays.setKernelArg(37, this.buffSecRayOriginz);
	this.clKernel_PrimaryRays.setKernelArg(38, this.buffRayEndx);
	this.clKernel_PrimaryRays.setKernelArg(39, this.buffRayEndy);
	this.clKernel_PrimaryRays.setKernelArg(40, this.buffRayEndz);
	this.clKernel_PrimaryRays.setKernelArg(41, this.buffSecNormalx);
	this.clKernel_PrimaryRays.setKernelArg(42, this.buffSecNormaly);
	this.clKernel_PrimaryRays.setKernelArg(43, this.buffSecNormalz);
	this.clKernel_PrimaryRays.setKernelArg(44, this.buffSecDirInix);
	this.clKernel_PrimaryRays.setKernelArg(45, this.buffSecDirIniy);
	this.clKernel_PrimaryRays.setKernelArg(46, this.buffSecDirIniz);

	// secundary rays
	this.clKernel_SecundaryRays.setKernelArg(0, this.buffNoisex);
	this.clKernel_SecundaryRays.setKernelArg(1, this.buffNoisey);
	this.clKernel_SecundaryRays.setKernelArg(2, this.buffVAx);
	this.clKernel_SecundaryRays.setKernelArg(3, this.buffVAy);
	this.clKernel_SecundaryRays.setKernelArg(4, this.buffVAz);
	this.clKernel_SecundaryRays.setKernelArg(5, this.buffVBx);
	this.clKernel_SecundaryRays.setKernelArg(6, this.buffVBy);
	this.clKernel_SecundaryRays.setKernelArg(7, this.buffVBz);
	this.clKernel_SecundaryRays.setKernelArg(8, this.buffVCx);
	this.clKernel_SecundaryRays.setKernelArg(9, this.buffVCy);
	this.clKernel_SecundaryRays.setKernelArg(10, this.buffVCz);
	this.clKernel_SecundaryRays.setKernelArg(11, this.buffTAx);
	this.clKernel_SecundaryRays.setKernelArg(12, this.buffTAy);
	this.clKernel_SecundaryRays.setKernelArg(13, this.buffTAz);
	this.clKernel_SecundaryRays.setKernelArg(14, this.buffTBx);
	this.clKernel_SecundaryRays.setKernelArg(15, this.buffTBy);
	this.clKernel_SecundaryRays.setKernelArg(16, this.buffTBz);
	this.clKernel_SecundaryRays.setKernelArg(17, this.buffTCx);
	this.clKernel_SecundaryRays.setKernelArg(18, this.buffTCy);
	this.clKernel_SecundaryRays.setKernelArg(19, this.buffTCz);
	this.clKernel_SecundaryRays.setKernelArg(20, this.buffNAx);
	this.clKernel_SecundaryRays.setKernelArg(21, this.buffNAy);
	this.clKernel_SecundaryRays.setKernelArg(22, this.buffNAz);
	this.clKernel_SecundaryRays.setKernelArg(23, this.buffTEXwidth);
	this.clKernel_SecundaryRays.setKernelArg(24, this.buffTEXheight);
	this.clKernel_SecundaryRays.setKernelArg(25, this.buffCurrentNode);
	this.clKernel_SecundaryRays.setKernelArg(26, this.buffCurrentBO);
	this.clKernel_SecundaryRays.setKernelArg(27, this.buffTypeLight);
	this.clKernel_SecundaryRays.setKernelArg(28, this.NUMOBJECTS, WebCL.types.UINT);
	this.clKernel_SecundaryRays.setKernelArg(29, this.buffNearNode);
	this.clKernel_SecundaryRays.setKernelArg(30, this.buffNearBO);
	this.clKernel_SecundaryRays.setKernelArg(31, this.buffSecNearNodeTypeLight);
	this.clKernel_SecundaryRays.setKernelArg(32, this.buffSecNearDistance);
	this.clKernel_SecundaryRays.setKernelArg(33, this.buffNs);
	this.clKernel_SecundaryRays.setKernelArg(34, this.buffTEXidx);
	this.clKernel_SecundaryRays.setKernelArg(35, this.buffRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(36, this.buffRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(37, this.buffRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(38, this.buffSecRayOriginx);
	this.clKernel_SecundaryRays.setKernelArg(39, this.buffSecRayOriginy);
	this.clKernel_SecundaryRays.setKernelArg(40, this.buffSecRayOriginz);
	this.clKernel_SecundaryRays.setKernelArg(41, this.buffNormalx);
	this.clKernel_SecundaryRays.setKernelArg(42, this.buffNormaly);
	this.clKernel_SecundaryRays.setKernelArg(43, this.buffNormalz);
	this.clKernel_SecundaryRays.setKernelArg(44, this.buffSecNormalx);
	this.clKernel_SecundaryRays.setKernelArg(45, this.buffSecNormaly);
	this.clKernel_SecundaryRays.setKernelArg(46, this.buffSecNormalz);
	this.clKernel_SecundaryRays.setKernelArg(47, this.buffDirInix);
	this.clKernel_SecundaryRays.setKernelArg(48, this.buffDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(49, this.buffDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(50, this.buffSecDirInix);
	this.clKernel_SecundaryRays.setKernelArg(51, this.buffSecDirIniy);
	this.clKernel_SecundaryRays.setKernelArg(52, this.buffSecDirIniz);
	this.clKernel_SecundaryRays.setKernelArg(53, this.buffBRDFx);
	this.clKernel_SecundaryRays.setKernelArg(54, this.buffBRDFy);
	this.clKernel_SecundaryRays.setKernelArg(55, this.buffBRDFz);
	
	// shadow rays
	this.clKernel_ShadowRays.setKernelArg(0, this.buffVAx);
	this.clKernel_ShadowRays.setKernelArg(1, this.buffVAy);
	this.clKernel_ShadowRays.setKernelArg(2, this.buffVAz);
	this.clKernel_ShadowRays.setKernelArg(3, this.buffVBx);
	this.clKernel_ShadowRays.setKernelArg(4, this.buffVBy);
	this.clKernel_ShadowRays.setKernelArg(5, this.buffVBz);
	this.clKernel_ShadowRays.setKernelArg(6, this.buffVCx);
	this.clKernel_ShadowRays.setKernelArg(7, this.buffVCy);
	this.clKernel_ShadowRays.setKernelArg(8, this.buffVCz);
	this.clKernel_ShadowRays.setKernelArg(9, this.buffTAx);
	this.clKernel_ShadowRays.setKernelArg(10, this.buffTAy);
	this.clKernel_ShadowRays.setKernelArg(11, this.buffTAz);
	this.clKernel_ShadowRays.setKernelArg(12, this.buffTBx);
	this.clKernel_ShadowRays.setKernelArg(13, this.buffTBy);
	this.clKernel_ShadowRays.setKernelArg(14, this.buffTBz);
	this.clKernel_ShadowRays.setKernelArg(15, this.buffTCx);
	this.clKernel_ShadowRays.setKernelArg(16, this.buffTCy);
	this.clKernel_ShadowRays.setKernelArg(17, this.buffTCz);
	this.clKernel_ShadowRays.setKernelArg(18, this.buffTEXwidth);
	this.clKernel_ShadowRays.setKernelArg(19, this.buffTEXheight);
	this.clKernel_ShadowRays.setKernelArg(20, this.buffCurrentNode);
	this.clKernel_ShadowRays.setKernelArg(21, this.buffCurrentBO);
	this.clKernel_ShadowRays.setKernelArg(22, this.buffTypeLight);
	this.clKernel_ShadowRays.setKernelArg(23, this.NUMOBJECTS, WebCL.types.UINT);
	this.clKernel_ShadowRays.setKernelArg(24, this.buffNearNode);
	this.clKernel_ShadowRays.setKernelArg(25, this.buffNearBO);
	this.clKernel_ShadowRays.setKernelArg(26, this.buffShadowNearNodeTypeLight);
	this.clKernel_ShadowRays.setKernelArg(27, this.buffShadowNearDistance);
	this.clKernel_ShadowRays.setKernelArg(28, this.buffTEXidx);
	this.clKernel_ShadowRays.setKernelArg(29, this.buffRayOriginx);
	this.clKernel_ShadowRays.setKernelArg(30, this.buffRayOriginy);
	this.clKernel_ShadowRays.setKernelArg(31, this.buffRayOriginz);
	
	
	
	
	var maxLocalWS = clDevices[0].getDeviceInfo(WebCL.CL_DEVICE_MAX_WORK_GROUP_SIZE);
	this.localWS = [32];
	this.globalWS = [Math.ceil((this.arrSize) / this.localWS) * this.localWS]; // Global work item size. Numero total de work-items (kernel en ejecucion)

						
	
};
StormRender.prototype.updateObjects = function() {
	var N_VAx = [];	var N_VAy = [];	var N_VAz = [];
	var N_VBx = [];	var N_VBy = [];	var N_VBz = [];
	var N_VCx = [];	var N_VCy = [];	var N_VCz = [];
	var N_TAx = [];	var N_TAy = [];	var N_TAz = [];
	var N_TBx = [];	var N_TBy = [];	var N_TBz = [];
	var N_TCx = [];	var N_TCy = [];	var N_TCz = [];
	var N_NAx = [];	var N_NAy = [];	var N_NAz = [];
	var N_TEXwidth = [];
	var N_TEXheight = [];
	var N_CurrentNode = [];
	var N_CurrentBO = [];
	var N_TypeLight = [];
	var NUM = 0;
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
				
				N_TEXwidth.push(this.nodes[n].buffersObjects[nb].imageElement_Kd.width);
				N_TEXheight.push(this.nodes[n].buffersObjects[nb].imageElement_Kd.height);
				N_CurrentNode.push(n);
				N_CurrentBO.push(nb);
				N_TypeLight.push(0);
				
				NUM++;
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
				N_VAx.push(VA.e[3]);N_VAy.push(VA.e[7]);N_VAz.push(VA.e[11]);
				var VB = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB],
															0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+1],
															0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxB+2],
															0.0,0.0,0.0,1.0]));
				N_VBx.push(VB.e[3]);N_VBy.push(VB.e[7]);N_VBz.push(VB.e[11]);
				var VC = this.lights[n].mrealWMatrixFrame.x($M16([1.0,0.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC],
															0.0,1.0,0.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+1],
															0.0,0.0,1.0,this.lights[n].buffersObjects[nb].nodeMeshVertexArray[idxC+2],
															0.0,0.0,0.0,1.0]));
				N_VCx.push(VC.e[3]);N_VCy.push(VC.e[7]);N_VCz.push(VC.e[11]);
				
				// TEXTURES
				var TEXA = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxA+2]]);
				N_TAx.push('0.'+TEXA.e[0].toString().split('.')[1]);N_TAy.push('0.'+TEXA.e[1].toString().split('.')[1]);N_TAz.push('0.'+TEXA.e[2].toString().split('.')[1]);
				var TEXB = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxB+2]]);
				N_TBx.push('0.'+TEXB.e[0].toString().split('.')[1]);N_TBy.push('0.'+TEXB.e[1].toString().split('.')[1]);N_TBz.push('0.'+TEXB.e[2].toString().split('.')[1]);
				var TEXC = $V3([this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC+1], this.lights[n].buffersObjects[nb].nodeMeshTextureArray[idxC+2]]);
				N_TCx.push('0.'+TEXC.e[0].toString().split('.')[1]);N_TCy.push('0.'+TEXC.e[1].toString().split('.')[1]);N_TCz.push('0.'+TEXC.e[2].toString().split('.')[1]);
				
				// NORMALS
				var NORA = $V3([this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA], this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA+1], this.lights[n].buffersObjects[nb].nodeMeshNormalArray[idxA+2]]);
				N_NAx.push(NORA.e[0]);N_NAy.push(NORA.e[1]);N_NAz.push(NORA.e[2]);
				
				N_TEXwidth.push(this.lights[n].buffersObjects[nb].imageElement_Kd.width);
				N_TEXheight.push(this.lights[n].buffersObjects[nb].imageElement_Kd.height);
				N_CurrentNode.push(n);
				N_CurrentBO.push(nb);
				N_TypeLight.push(1);
				
				NUM++;
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
	this.arrayN_TEXwidth = new Uint32Array(N_TEXwidth);
	this.arrayN_TEXheight = new Uint32Array(N_TEXheight);
	this.arrayN_CurrentNode = new Uint32Array(N_CurrentNode);
	this.arrayN_CurrentBO = new Uint32Array(N_CurrentBO);
	this.arrayN_TypeLight = new Uint32Array(N_TypeLight);
	
	var buffSizeO = NUM*4;
	this.buffVAx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVAy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVAz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVBx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVBy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVBz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVCx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVCy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffVCz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTAx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTAy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTAz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTBx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTBy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTBz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTCx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTCy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTCz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffNAx = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffNAy = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffNAz = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTEXwidth = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTEXheight = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffCurrentNode = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffCurrentBO = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	this.buffTypeLight = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, buffSizeO);
	
	clCmdQueue.enqueueWriteBuffer(this.buffVAx, false, 0, buffSizeO, this.arrayN_VAx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVAy, false, 0, buffSizeO, this.arrayN_VAy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVAz, false, 0, buffSizeO, this.arrayN_VAz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVBx, false, 0, buffSizeO, this.arrayN_VBx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVBy, false, 0, buffSizeO, this.arrayN_VBy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVBz, false, 0, buffSizeO, this.arrayN_VBz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVCx, false, 0, buffSizeO, this.arrayN_VCx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVCy, false, 0, buffSizeO, this.arrayN_VCy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffVCz, false, 0, buffSizeO, this.arrayN_VCz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTAx, false, 0, buffSizeO, this.arrayN_TAx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTAy, false, 0, buffSizeO, this.arrayN_TAy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTAz, false, 0, buffSizeO, this.arrayN_TAz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTBx, false, 0, buffSizeO, this.arrayN_TBx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTBy, false, 0, buffSizeO, this.arrayN_TBy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTBz, false, 0, buffSizeO, this.arrayN_TBz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTCx, false, 0, buffSizeO, this.arrayN_TCx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTCy, false, 0, buffSizeO, this.arrayN_TCy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTCz, false, 0, buffSizeO, this.arrayN_TCz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffNAx, false, 0, buffSizeO, this.arrayN_NAx, []);
	clCmdQueue.enqueueWriteBuffer(this.buffNAy, false, 0, buffSizeO, this.arrayN_NAy, []);
	clCmdQueue.enqueueWriteBuffer(this.buffNAz, false, 0, buffSizeO, this.arrayN_NAz, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTEXwidth, false, 0, buffSizeO, this.arrayN_TEXwidth, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTEXheight, false, 0, buffSizeO, this.arrayN_TEXheight, []);
	clCmdQueue.enqueueWriteBuffer(this.buffCurrentNode, false, 0, buffSizeO, this.arrayN_CurrentNode, []);
	clCmdQueue.enqueueWriteBuffer(this.buffCurrentBO, false, 0, buffSizeO, this.arrayN_CurrentBO, []);
	clCmdQueue.enqueueWriteBuffer(this.buffTypeLight, false, 0, buffSizeO, this.arrayN_TypeLight, []);
	
	this.NUMOBJECTS = NUM;
};

StormRender.prototype.setCam = function(nodeCam) {
	// PRIMARY RAYS
	clCmdQueue.flush();
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
	
	
	

	clCmdQueue.enqueueNDRangeKernel(this.clKernel_PrimaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);

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
		

		clCmdQueue.enqueueNDRangeKernel(this.clKernel_SecundaryRays, this.globalWS.length, [], this.globalWS, this.localWS, []);

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

							this.clKernel_ShadowRays.setKernelArg(32, this.lights[0].mrealWMatrixFrame.e[3], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(33, this.lights[0].mrealWMatrixFrame.e[7], WebCL.types.FLOAT);
							this.clKernel_ShadowRays.setKernelArg(34, this.lights[0].mrealWMatrixFrame.e[11], WebCL.types.FLOAT);
							// Init ND-range
							clCmdQueue.enqueueNDRangeKernel(this.clKernel_ShadowRays, this.globalWS.length, [], this.globalWS, this.localWS, []);

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
								
								var lightR = $V3([this.arraySecRayOriginx[idx],this.arraySecRayOriginy[idx+1],this.arraySecRayOriginz[idx+2]]).subtract($V3([this.lights[0].mrealWMatrixFrame.e[3],this.lights[0].mrealWMatrixFrame.e[7],this.lights[0].mrealWMatrixFrame.e[11]]));
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

