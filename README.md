stormenginec
============

JavaScript 3D graphics library

<img width="200" src="http://stormcolour.appspot.com/CONTENT/stormviewer/elmarquesado/image.jpg" /><img width="200" src="http://stormcolour.appspot.com/CONTENT/stormviewer/sibenik/image.jpg" /><img width="200" src="http://stormcolour.appspot.com/CONTENT/stormviewer/embalse/image.jpg" />
<br />
StormEngineC provides the following features:<br />
► Real-time visualization by WebGL.<br />
► Sun and spot lights.<br />
► Shadows, SSAO, DOF...<br />
► Load objects on .obj format or Collada (.DAE) and adding physics easy. (<a href="http://brokstuk.com/jiglibjs2/" target="_blank">JigLibJS2 integrated</a>)
<br />
► 3D text, SVG shapes, particles..<br />
► Keyframe animations and animation layers.<br />
► Multiplayer using Websocket server with NODEJS.<br />
► HTML CanvasRenderingContext2D integrated.<br />
► WebGL global illumination with traversal ray voxel.<br />
<img alt="WebGL global illumination using traversal ray voxel" src="http://stormcolour.appspot.com/CONTENT/stormviewer/live/voxelGI.jpg" />
AO+DOF and AO+GI+DOF comparison.
<img alt="WebGL global illumination using traversal ray voxel" src="http://stormcolour.appspot.com/CONTENT/stormviewer/live/sibenikGI.jpg" />
AO and AO+GI comparison
<br />
Voxel resolution of 256
<br />
<br />

► WebCL Nokia Path Tracing Render (with triangles scenes)<br />
- Render Farm option using Websocket server with NODEJS<br />
<a href="http://stormcolour.appspot.com/?sec=stormViewer&secb=webcl-path-tracing" target="_blank"><img src="http://stormcolour.appspot.com/CONTENT/stormviewer/webcl-path-tracing/image.jpg" /></a>
<br />
<a href="http://stormcolour.appspot.com/?sec=stormViewer&secb=webcl-path-tracing-interior" target="_blank"><img src="http://stormcolour.appspot.com/CONTENT/stormviewer/webcl-path-tracing-interior/image.jpg" /></a>
<br />
<br />
<br />
<h2><a href="http://code.google.com/p/stormenginec/wiki/StormEngineC_1_2">Quick reference</a></h2>
<h2><a href="http://stormcolour.appspot.com/CONTENT/StormEngineC-1.2-API-Doc/StormEngineC.html">API Doc</a></h2>
<h2><a href="http://stormcolour.appspot.com/?sec=stormViewer">DEMOS</a></h2>
<br />
<h2><a href="https://plus.google.com/u/0/communities/104803988390152921139">G+ Community</a></h2>
<br />
<br />
<br />
<br />

<span style="font-size:10px">(WebCL only with <a href="http://webcl.nokiaresearch.com/">webcl nokia extension</a>)</span><br />
<span style="font-size:10px">(StormEngineC using HTTP requests. You must run on a server.)</span>

<br />
<br />
<h3>Last changes</h3>
<div style="font-size:9px">

<b>StormEngineC 1.2 BETA46</b> Dec 4, 2013<br />
Added function stormEngineC.setWebGLResize.<br />
<br />
<b>StormEngineC 1.2 BETA45</b> Dec 3, 2013<br />
New version of GI.<br />
Removed function stormEngineC.go<br />
Added functions getLeft,getUp,getForward in nodes.<br />
Added functions setRotationX,setRotationY,setRotationZ in nodes.<br />
Renamed functions rotX,rotY,rotZ to setRotationX,setRotationY,setRotationZ in M16 objects.<br />
Renamed function setPos to setPosition in M16 objects.<br />
Renamed function getPos to getPosition in M16 objects.<br />
Renamed function switchCam to setController in camera objects.<br />
The old camera controller type "freecam" is renamed to "targetcam".<br />
Added new camera controller type "freecam".<br />
<br />
<b>StormEngineC 1.2 BETA44</b> Nov 25, 2013<br />
Modified function node.setCollision().<br />
Added function stormEngineC.createVoxelizator().<br />
Removed function stormEngineC.setWebGLGI(StormGI gi). Enable GI directly with gi.setVoxelizator(StormVoxelizator v)<br />
<br />
<b>StormEngineC 1.2 BETA43</b> Nov 23, 2013<br />
Slight modifications to initialize GI.<br />
stormEngineC.useVoxelTexture renamed to voxelizator.generateFrom3DImageElement.<br />
stormEngineC.makeVoxelTextures renamed to voxelizator.generateFromScene.<br />
Added class StormGI.<br />
Added function stormEngineC.setWebGLGI(StormGI gi).<br />
Added function setDestinationVolume(voxelizator) in particles.<br />
<br />
<b>StormEngineC 1.2 BETA42</b> Nov 22, 2013<br />
stormEngineC.useVoxelTexture function added.<br />
stormEngineC.GIstopOncameramove function added.<br />
Fixed bug of phantom drawing when GI is enabled.<br />
Fixed several bugs with the shadows.<br />
<br />
<b>StormEngineC 1.2 BETA41</b> Nov 21, 2013<br />
Global illumination with traversal ray voxel.<br />
Improvement on particles calculations.<br />
Limit of 10 Texture units for multi texture.<br />
Bump temporarily disabled.<br />
<br />

</div>