@echo off
title GENERAR JSDOC STORMENGINEC
C:

set jsdocdir=%ROBER%\_EXTRAS\SDK\jsdoc 3
set sourcesDir=%ROBER%\stormenginec\StormEngineC\
set outputDir=%ROBER%\stormcolor-gae\war\CONTENT\StormEngineC-1.2-API-Doc


cd /D %jsdocdir%
echo GENERANDO DOCUMENTACION
jsdoc -t templates/docstrap-master/template -c confStormEngineC.json -d %outputDir% %sourcesDir%StormBufferObject.class.js %sourcesDir%StormCamera.class.js %sourcesDir%StormEngineC.class.js %sourcesDir%StormPanelAnimationTimeline.class.js %sourcesDir%StormForceField.class.js %sourcesDir%StormGI.class.js %sourcesDir%StormGLContext.class.js %sourcesDir%StormGroupNodes.class.js %sourcesDir%StormLight.class.js %sourcesDir%StormLine.class.js %sourcesDir%StormLineSceneCollision.class.js %sourcesDir%StormMath.class.js %sourcesDir%StormMaterial.class.js %sourcesDir%StormNode.class.js %sourcesDir%StormParticles.class.js %sourcesDir%StormPolarityPoint.class.js %sourcesDir%StormTriangleBox.class.js %sourcesDir%StormUtils.class.js %sourcesDir%StormVoxelizator.class.js %sourcesDir%WebCLGL.class.js %sourcesDir%WebCLGLBuffer.class.js %sourcesDir%WebCLGLKernel.class.js %sourcesDir%WebCLGLUtils.class.js 

ren %outputDir%\index.html index.jsp

echo.
echo.
echo DOCUMENTACION GENERADA
pause

chrome.exe %outputDir%\symbols\StormEngineC.html

