@echo off
title JSDOC STORMENGINEC

set jsdocdir=jsdoc 3
set sourcesDir=..\StormEngineC\
set outputDir=APIdoc


cd /D %jsdocdir%
echo GENERATING API DOC
jsdoc -t templates/docstrap-master/template -c confStormEngineC.json -d ..\%outputDir% ..\%sourcesDir%ActionHelpers.class.js ..\%sourcesDir%StormBufferObject.class.js ..\%sourcesDir%StormCamera.class.js ..\%sourcesDir%StormControllerFollow.class.js ..\%sourcesDir%StormControllerPlayer.class.js ..\%sourcesDir%StormControllerPlayerCar.class.js ..\%sourcesDir%StormControllerTargetCam.class.js ..\%sourcesDir%StormEngineC.class.js ..\%sourcesDir%StormForceField.class.js ..\%sourcesDir%StormGI.class.js ..\%sourcesDir%StormGLContext.class.js ..\%sourcesDir%StormGraph.class.js ..\%sourcesDir%StormGrid.class.js ..\%sourcesDir%StormGroupNodes.class.js ..\%sourcesDir%StormLight.class.js ..\%sourcesDir%StormLine.class.js ..\%sourcesDir%StormLineSceneCollision.class.js ..\%sourcesDir%StormMaterial.class.js ..\%sourcesDir%StormMath.class.js ..\%sourcesDir%StormNode.class.js ..\%sourcesDir%StormPanelAnimationTimeline.class.js ..\%sourcesDir%StormPolarityPoint.class.js ..\%sourcesDir%StormTriangleBox.class.js ..\%sourcesDir%StormUtils.class.js ..\%sourcesDir%StormVoxelizator.class.js ..\%sourcesDir%WebCLGL.class.js ..\%sourcesDir%WebCLGLBuffer.class.js ..\%sourcesDir%WebCLGLBufferItem.class.js ..\%sourcesDir%WebCLGLKernel.class.js ..\%sourcesDir%WebCLGLKernelProgram.class.js ..\%sourcesDir%WebCLGLUtils.class.js ..\%sourcesDir%WebCLGLVertexFragmentProgram.class.js ..\%sourcesDir%WebCLGLWork.class.js

echo.
echo.
echo API DOC GENERATED
pause

chrome.exe ..\%outputDir%\StormEngineC.html

