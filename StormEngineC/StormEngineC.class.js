/*
The MIT License (MIT)

Copyright (c) <2010> <Roberto Gonzalez. http://stormcolour.appspot.com/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
var e = document.createElement('canvas');
e.width = 32;
e.height = 32;

var webglExist = undefined;
try {
	webglExist = e.getContext("webgl");
} catch (x) {}
if(webglExist == undefined) {
	try {
		webglExist = e.getContext("experimental-webgl");
	} catch (x) {
		webglExist = undefined;
	}
}
if(webglExist != undefined) {

// includes
var stormEngineCDirectory = document.querySelector('script[src$="StormEngineC.class.js"]').getAttribute('src');
var page = stormEngineCDirectory.split('/').pop(); 
stormEngineCDirectory = stormEngineCDirectory.replace('/'+page,"");

// CSS
if(window.jQuery == undefined) {
	document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/JQuery/ui/jquery-ui-1.10.3.custom.min.css" />');
}
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/css/style.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/stormPanel/stormPanel.css" />');
document.write('<link rel="stylesheet" type="text/css" href="'+stormEngineCDirectory+'/stormMenu/stormMenu.css" />');

// JS
if(window.jQuery == undefined) {
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JQuery/jquery-1.9.1.js"></script>');	
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/JQuery/ui/jquery-ui-1.10.3.custom.min.js"></script>');
}


var includesF = ['/ActionHelpers.class.js',
                 //'/StormMathMin.class.js',
                 '/StormMath.class.js',
				'/StormMaterial.class.js',
				'/StormGLContext.class.js',
				'/StormGLContext_programBackground.class.js',
				'/StormGLContext_programCtx2D.class.js',
				'/StormGLContext_programDOF.class.js',
				'/StormGLContext_programGIv2.class.js',
				'/StormGLContext_programLines.class.js',
				'/StormGLContext_programNormalsDepth.class.js',
				'/StormGLContext_programPick.class.js',
				'/StormGLContext_programOverlay.class.js',
				'/StormGLContext_programScene.class.js',
				'/StormGLContext_programShadows.class.js',
				/*'/WebCLGL_2.0.Min.class.js',*/
				'/WebCLGLUtils.class.js',
				'/WebCLGLBuffer.class.js',
				'/WebCLGLBufferItem.class.js',
				'/WebCLGLKernel.class.js',
				'/WebCLGLKernelProgram.class.js',
				'/WebCLGLVertexFragmentProgram.class.js',
				'/WebCLGLWork.class.js', 
				'/WebCLGL.class.js',
				'/StormNode.class.js',
				'/StormGroupNodes.class.js',
				'/StormMesh.class.js',
				'/StormBufferObject.class.js',				
				'/StormLine.class.js',
				'/StormCamera.class.js',
				'/StormLight.class.js',
				'/StormPolarityPoint.class.js',
				'/StormForceField.class.js',
				'/StormGraph.class.js',
				'/StormTriangulate2D.class.js',
				'/StormRayLens.class.js',
				'/StormTriangleBox.class.js',
				'/StormVoxelizator.class.js',
				'/StormGI.class.js',
				'/StormRayTriangle.class.js',
				'/StormLineSceneCollision.class.js',
				'/StormGrid.class.js',
				'/stormPanel/stormPanel.js',
				'/stormMenu/stormMenu.js',
				'/StormPanelEnvironment.class.js',
				'/StormPanelListObjects.class.js',
				'/StormPanelEditNode.class.js',
				'/StormPanelMaterials.class.js',
				'/StormPanelRenderSettings.class.js',
				'/StormPanelCanvas.class.js',
				'/StormPanelAnimationTimeline.class.js',
				'/StormPanelBottomMenu.class.js',
				'/StormRenderCLv4_Timeline.class.js',
				'/StormRenderCL_EMR_MaterialEditor.class.js',
				'/StormPanelEMRMaterialsDatabase.class.js', 
				'/JigLibJS/geom/glMatrix.js',
				'/JigLibJS/jiglib.js',
				'/JigLibJS/geom/Vector3D.js',
				'/JigLibJS/geom/Matrix3D.js',
				'/JigLibJS/math/JMatrix3D.js',
				'/JigLibJS/math/JMath3D.js',
				'/JigLibJS/math/JNumber3D.js',
				'/JigLibJS/cof/JConfig.js',
				'/JigLibJS/data/CollOutData.js',
				'/JigLibJS/data/ContactData.js',
				'/JigLibJS/data/PlaneData.js',
				'/JigLibJS/data/EdgeData.js',
				'/JigLibJS/data/TerrainData.js',
				'/JigLibJS/data/OctreeCell.js',
				'/JigLibJS/data/CollOutBodyData.js',
				'/JigLibJS/data/TriangleVertexIndices.js',
				'/JigLibJS/data/SpanData.js',
				'/JigLibJS/physics/constraint/JConstraint.js',
				'/JigLibJS/physics/constraint/JConstraintMaxDistance.js',
				'/JigLibJS/physics/constraint/JConstraintWorldPoint.js',
				'/JigLibJS/physics/constraint/JConstraintPoint.js',
				'/JigLibJS/physics/MaterialProperties.js',
				'/JigLibJS/collision/CollPointInfo.js',
				'/JigLibJS/collision/CollisionInfo.js',
				'/JigLibJS/collision/CollDetectInfo.js',
				'/JigLibJS/collision/CollDetectFunctor.js',
				'/JigLibJS/collision/CollDetectBoxTerrain.js',
				'/JigLibJS/collision/CollDetectSphereMesh.js',
				'/JigLibJS/collision/CollDetectCapsuleBox.js',
				'/JigLibJS/collision/CollDetectSphereCapsule.js',
				'/JigLibJS/collision/CollDetectCapsuleTerrain.js',
				'/JigLibJS/collision/CollDetectSphereBox.js',
				'/JigLibJS/collision/CollDetectSphereTerrain.js',
				'/JigLibJS/collision/CollDetectBoxBox.js',
				'/JigLibJS/collision/CollDetectBoxMesh.js',
				'/JigLibJS/collision/CollDetectBoxPlane.js',
				'/JigLibJS/collision/CollDetectCapsuleCapsule.js',
				'/JigLibJS/collision/CollDetectSphereSphere.js',
				'/JigLibJS/collision/CollDetectSpherePlane.js',
				'/JigLibJS/collision/CollDetectCapsulePlane.js',
				'/JigLibJS/collision/CollisionSystemAbstract.js',
				'/JigLibJS/collision/CollisionSystemGridEntry.js',
				'/JigLibJS/collision/CollisionSystemGrid.js',
				'/JigLibJS/collision/CollisionSystemBrute.js',
				'/JigLibJS/geometry/JIndexedTriangle.js',
				'/JigLibJS/geometry/JOctree.js',
				'/JigLibJS/geometry/JRay.js',
				'/JigLibJS/geometry/JAABox.js',
				'/JigLibJS/geometry/JTriangle.js',
				'/JigLibJS/geometry/JSegment.js',
				'/JigLibJS/events/JCollisionEvent.js',
				'/JigLibJS/physics/constraint/JConstraint.js',
				'/JigLibJS/physics/constraint/JConstraintMaxDistance.js',
				'/JigLibJS/physics/constraint/JConstraintWorldPoint.js',
				'/JigLibJS/physics/constraint/JConstraintPoint.js',
				'/JigLibJS/physics/PhysicsController.js',
				'/JigLibJS/physics/CachedImpulse.js',
				'/JigLibJS/physics/HingeJoint.js',
				'/JigLibJS/physics/BodyPair.js',
				'/JigLibJS/physics/PhysicsState.js',
				'/JigLibJS/physics/PhysicsSystem.js',
				'/JigLibJS/physics/RigidBody.js',
				'/JigLibJS/geometry/JSphere.js',
				'/JigLibJS/geometry/JTriangleMesh.js',
				'/JigLibJS/geometry/JPlane.js',
				'/JigLibJS/geometry/JTerrain.js',
				'/JigLibJS/geometry/JBox.js',
				'/JigLibJS/geometry/JCapsule.js',
				'/JigLibJS/debug/Stats.js',
				'/JigLibJS/vehicles/JChassis.js',
				'/JigLibJS/vehicles/JWheel.js',
				'/JigLibJS/vehicles/JCar.js',
				'/StormJigLibJS.class.js',
				'/StormUtils.class.js',
				'/StormControllerTargetCam.class.js',
				'/StormControllerPlayerCar.class.js',
				'/StormControllerPlayer.class.js',
				'/StormControllerFollow.class.js',
				'/nodeClient/socket.io.min.js'];
for(var n = 0, f = includesF.length; n < f; n++) document.write('<script type="text/javascript" src="'+stormEngineCDirectory+includesF[n]+'"></script>');

if(window.WebCL == undefined) {
	//document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRender.class.js"></script>'); // raytracing cpu
} else {
	var clPlatforms = WebCL.getPlatformIDs();
	//CL_DEVICE_TYPE_GPU - CL_DEVICE_TYPE_CPU - CL_DEVICE_TYPE_DEFAULT - CL_DEVICE_TYPE_ACCELERATOR - CL_DEVICE_TYPE_ALL
    var clContext = WebCL.createContextFromType([WebCL.CL_CONTEXT_PLATFORM, clPlatforms[0]], WebCL.CL_DEVICE_TYPE_GPU); 
    var clDevices = clContext.getContextInfo(WebCL.CL_CONTEXT_DEVICES);
    var clCmdQueue = clContext.createCommandQueue(clDevices[0], 0); // CL_QUEUE_OUT_OF_ORDER_EXEC_MODE_ENABLE - CL_QUEUE_PROFILING_ENABLE
    //var utils = WebCL.getUtils();
    
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRenderCLv4.class.js"></script>'); // path tracing
	document.write('<script type="text/javascript" src="'+stormEngineCDirectory+'/StormRenderCL_EMR.class.js"></script>'); // Electromagnetic radiation
}

/** @private */
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
})();
 
/**
* Engine contructor
* @class
* @constructor
* @property {HTMLCanvasElement} target
* @property {JqueryDivElement} $
* @property {Int} mousePosX x mouse position on the canvas
* @property {Int} mousePosY y mouse position on the canvas
* @property {StormGLContext} stormGLContext object
* @property {WebCLGL} clgl WebCLGL object
* @property {StormUtils} utils StormUtils object
* @property {StormMesh} stormMesh StormMesh object
*/
StormEngineC = function() {
	this.target;
	this.divPositionX = 0;
	this.divPositionY = 0;
	this.mousePosX = 0;
	this.mousePosY = 0;
	this.mouseOldPosX = 0;
	this.mouseOldPosY = 0;
	this.oldMousePosClickX = 0;
	this.oldMousePosClickY = 0; 
	this.isMouseDown = false;
	this.dragging = false;
	
	this.stormGLContext,this.clgl,this.utils,this.stormMesh;
	this.giv2;
	this.callback;
	this.nodes = [];this.idxNodes = 0;
	this.groups = [];this.idxGroups = 0;
	this.nodesCam = [];this.idxNodesCam = 0;
	this.lines = [];this.idxLines = 0;
	this.lights = [];this.idxLights = 0;
	this.graphs = [];this.idxGraphs = 0;
	this.polarityPoints = [];this.idxPolarityPoint = 0;
	this.forceFields = [];this.idxForceField = 0;
	this.materials = [];this.idxMaterials = 0;
	this.voxelizators = [];this.idxVoxelizators = 0;	
	this.arrHitsRectRegions = [];this.idxHitsRectRegions = 0;
	this.arrFonts = [];
	
	this.defaultCamera;
	this.ControllerTypes = {
		"TARGETCAM": 0,
		"PLAYER": 1,
		"NODECAR": 2,
		"FOLLOW": 3,
	};
	
	this.nearNode; // selectedNode
	this.nearDistance = 1000000000.0;
	this.nearNormal;
	
	this.pickingCall;
	
	this.selectedMaterial;
	
	this.showGrid = true;
	
	this.pause = false;
	this.pauseRender = true;
	
	this.preloads = 0;
	
	this.debugValues = [];
	this.debugResult;
	this.statusValues = [];
	
	this.runningAnim = false;
	
	this.lastTime = 0;
	this.elapsed;
	
	this.arrNetUsers = [];
	this.netID;
	this.netNode;
};

/**
* Init WebGL Context
* @type Void
* @param	{Object} jsonIn
* 	@param {HTMLCanvasElement|String} jsonIn.target Name of the atribute ID of the canvas or one element HTMLCanvasElement.
* 	@param {Function} jsonIn.callback Function fired at every frame
* 	@param {Bool} [jsonIn.editMode=true] Edit mode
* 	@param {Int} [jsonIn.resizable=2] 0:No resizable, 1:resizable(maintain the aspect ratio), 2:resizable, 3:screen autoadjust(maintain the aspect ratio)
* 	@param {Bool} [jsonIn.enableRender=true] Enable render
*/
StormEngineC.prototype.createWebGL = function(jsonIn) {
	if(jsonIn != undefined && jsonIn.target != undefined) {
		this.target = (jsonIn.target instanceof HTMLCanvasElement) ? jsonIn.target : DGE(jsonIn.target);
		var e = DCE('div');
		e.id = "SEC_"+this.target.id;
		this.target.parentNode.insertBefore(e,this.target);
		this.target.parentNode.removeChild(this.target);
		e.appendChild(this.target);  
		this.$ = $('#'+this.target.id);
		this.target.style.marginLeft = "0px";
		
		this.editMode = (jsonIn != undefined && jsonIn.editMode != undefined) ? jsonIn.editMode : true;
		this.resizable = (jsonIn != undefined && jsonIn.resizable != undefined) ? jsonIn.resizable : 2; 
		this.enableRender = (jsonIn != undefined && jsonIn.enableRender != undefined) ? jsonIn.enableRender : true;
		
		if(jsonIn.callback != undefined) {this.callback = jsonIn.callback;}
		
		this.loadManager();
		this.next();
	} else {
		alert('Target canvas required');
	}
};

/** @private */
StormEngineC.prototype.loadManager = function() {	
	this.stormGLContext = new StormGLContext(this, this.target);
	
	this.utils = new StormUtils(this);
	this.clgl = new WebCLGL(this.stormGLContext.gl);
	
	this.stormMesh = new StormMesh(this);
	this.giv2 = new StormGI(this);
	
	this.grid = new StormGrid(this);
	this.grid.generate(100.0, 1.0);
	
	// OVERLAY TRANSFORMS  
	this.defaultTransform = 0; // 0=position, 1=rotation, 2=scale
	this.defaultTransformMode = 0; // 0=world, 1=local
	// ►pos detector and display
	this.stormGLContext.nodeOverlayPosX = new StormNode(this);
	this.stormGLContext.nodeOverlayPosX.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayPosX.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayPosY = new StormNode(this);
	this.stormGLContext.nodeOverlayPosY.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayPosY.setRotationZ(this.utils.degToRad(180));
	
	this.stormGLContext.nodeOverlayPosZ = new StormNode(this);
	this.stormGLContext.nodeOverlayPosZ.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayPosZ.setRotationX(this.utils.degToRad(-90));
	
	// ►rot detector
	this.stormGLContext.nodeOverlayRotDetX = new StormNode(this);
	this.stormGLContext.nodeOverlayRotDetX.loadTube({height: 0.1, outerRadius: 1.0, innerRadius: 0.9, segments: 14}); 
	this.stormGLContext.nodeOverlayRotDetX.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotDetY = new StormNode(this);
	this.stormGLContext.nodeOverlayRotDetY.loadTube({height: 0.1, outerRadius: 1.0, innerRadius: 0.9, segments: 14}); 
	//this.stormGLContext.nodeOverlayRotDetY.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotDetZ = new StormNode(this);
	this.stormGLContext.nodeOverlayRotDetZ.loadTube({height: 0.1, outerRadius: 1.0, innerRadius: 0.9, segments: 14}); 
	this.stormGLContext.nodeOverlayRotDetZ.setRotationX(this.utils.degToRad(-90));
	// ►rot display
	this.stormGLContext.nodeOverlayRotX = new StormNode(this);
	this.stormGLContext.nodeOverlayRotX.loadTube({height: 0.01, outerRadius: 1.0, innerRadius: 0.99, segments: 14}); 
	this.stormGLContext.nodeOverlayRotX.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotY = new StormNode(this);
	this.stormGLContext.nodeOverlayRotY.loadTube({height: 0.01, outerRadius: 1.0, innerRadius: 0.99, segments: 14}); 
	//this.stormGLContext.nodeOverlayRotY.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayRotZ = new StormNode(this);
	this.stormGLContext.nodeOverlayRotZ.loadTube({height: 0.01, outerRadius: 1.0, innerRadius: 0.99, segments: 14}); 
	this.stormGLContext.nodeOverlayRotZ.setRotationX(this.utils.degToRad(-90));
	
	// ►scale detector
	this.stormGLContext.nodeOverlayScaDetX = new StormNode(this);
	this.stormGLContext.nodeOverlayScaDetX.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayScaDetX.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayScaDetY = new StormNode(this);
	this.stormGLContext.nodeOverlayScaDetY.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayScaDetY.setRotationZ(this.utils.degToRad(180));
	
	this.stormGLContext.nodeOverlayScaDetZ = new StormNode(this);
	this.stormGLContext.nodeOverlayScaDetZ.loadBox($V3([0.1,1.0,0.1]));
	this.stormGLContext.nodeOverlayScaDetZ.setRotationX(this.utils.degToRad(-90));
	
	// ►scale display
	this.stormGLContext.nodeOverlayScaX = new StormNode(this);
	this.stormGLContext.nodeOverlayScaX.loadBox($V3([0.1,0.1,0.1]));
	this.stormGLContext.nodeOverlayScaX.setRotationZ(this.utils.degToRad(90));
	
	this.stormGLContext.nodeOverlayScaY = new StormNode(this);
	this.stormGLContext.nodeOverlayScaY.loadBox($V3([0.1,0.1,0.1]));
	this.stormGLContext.nodeOverlayScaY.setRotationZ(this.utils.degToRad(180));
	
	this.stormGLContext.nodeOverlayScaZ = new StormNode(this);
	this.stormGLContext.nodeOverlayScaZ.loadBox($V3([0.1,0.1,0.1]));
	this.stormGLContext.nodeOverlayScaZ.setRotationX(this.utils.degToRad(-90));
	
	// DEFAULT VIEWS
	this.mainCamera = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.mainCamera.name = "MAIN CAMERA";
	this.leftView = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.leftView.name = "LEFT VIEW";
	this.rightView = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.rightView.name = "RIGHT VIEW";
	this.frontView = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.frontView.name = "FRONT VIEW";
	this.backView = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.backView.name = "BACK VIEW";
	this.topView = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.topView.name = "TOP VIEW";
	this.bottomView = this.createCamera($V3([0.0, 0.0, 0.0]), 1.0);
	this.bottomView.name = "BOTTOM VIEW";
	
	this.setWebGLCam(this.mainCamera); 
	this.cameraGoalCurrentPos = this.defaultCamera.nodeGoal.getPosition();
	
	// DEFAULT SUN LIGHT
	var light = this.createLight({	'type':'sun', // first light must be sun light
							'direction':$V3([-0.12,-0.5,0.20]),
							'color':5770
							});
	light.visibleOnContext = false;
	light.visibleOnRender = false;
	light.nodeCtxWebGL.visibleOnContext = false;
	
	// PHYSICS
	this.stormJigLibJS = new StormJigLibJS(this);
	this.stormJigLibJS.createJigLibWorld();
	
	
	// MENU & PANELS
	this.actHelpers = new ActionHelpers();
	
	this.PanelEnvironment = new StormEngineC_PanelEnvironment(this);
	this.PanelEnvironment.loadPanel();
	this.PanelListObjects = new StormEngineC_PanelListObjects(this);
	this.PanelListObjects.loadPanel();
	this.PanelEditNode = new StormEngineC_PanelEditNode(this);
	this.PanelEditNode.loadPanel();
	this.PanelMaterials = new StormEngineC_PanelMaterials(this);
	this.PanelMaterials.loadPanel();
	this.PanelCanvas = new StormEngineC_PanelCanvas(this);
	this.PanelCanvas.loadPanel();
	this.PanelRenderSettings = new StormEngineC_PanelRenderSettings(this);
	this.PanelRenderSettings.loadPanel();
	this.PanelAnimationTimeline = new StormEngineC_PanelAnimationTimeline(this);
	this.PanelAnimationTimeline.loadPanel();  
	//if(window.WebCL != undefined) {
		this.timelinePathTracing = new StormRender_Timeline(this);
		this.timelinePathTracing.loadPanel();
		
		this.EMR_Materials = [];this.idxEMR_Materials = 0;
		this.selectedEMRMaterial = undefined;
		this.MaterialEditor = new StormRenderEMR_MaterialEditor(this);
		this.MaterialEditor.loadMaterialEditor();
		this.PanelEMRMaterialsDatabase = new StormEngineC_PanelEMRMaterialsDatabase(this);
		this.PanelEMRMaterialsDatabase.loadPanel();
	//}
	
	if(this.editMode) {
		this.PanelBottomMenu = new StormEngineC_PanelBottomMenu(this);
		this.PanelBottomMenu.loadPanel();
	}
	
	
	// WINDOW & DOCUMENT EVENTS
	$(document).ready(this.updateDivPosition.bind(this));
	window.addEventListener("resize", this.updateDivPosition.bind(this), false);
	window.addEventListener("orientationchange", this.updateDivPosition.bind(this), false); 
	
	this.orientation = {alpha:0.0, beta:0.0, gamma:0.0}
	if(navigator.accelerometer) { // DEVICEORIENTATION FOR APACHE CORDOVA XYZ
		navigator.accelerometer.watchAcceleration(this.handleOrientationEvent.bind(this), console.log('NO ACCELEROMETER FOR CORDOVA'), {frequency: 3000});	
	}
	if(window.DeviceOrientationEvent) { // DEVICEORIENTATION FOR DOM gamma beta alpha
		window.addEventListener("MozOrientation", this.handleOrientationEvent.bind(this), true);
		window.addEventListener("deviceorientation", this.handleOrientationEvent.bind(this), true);
	} 	
	if(window.DeviceMotionEvent) { // DEVICEMOTION FOR DOM event.accelerationIncludingGravity.x event.accelerationIncludingGravity.y event.accelerationIncludingGravity.z
		window.addEventListener("devicemotion", this.handleOrientationEvent.bind(this), true);
	}
	
	document.body.addEventListener("keydown", (function(e) { 
		//e.preventDefault();   
		this.setZeroSamplesGIVoxels();
		
		if(this.preloads == 0) this.defaultCamera.controller.keyDownFC(e);
	}).bind(this), false);
	
	document.body.addEventListener("keyup", (function(e) {
		//e.preventDefault();
		this.setZeroSamplesGIVoxels();
				
		if(String.fromCharCode(e.keyCode) == "P") {
			this.setView("MAIN_CAMERA");
	    } else if(String.fromCharCode(e.keyCode) == "L") {
	    	this.setView("LEFT");
	    } else if(String.fromCharCode(e.keyCode) == "R") {
	    	this.setView("RIGHT");
	    } else if(String.fromCharCode(e.keyCode) == "F") {
	    	this.setView("FRONT");
	    } else if(String.fromCharCode(e.keyCode) == "B") {
	    	this.setView("BACK");
	    } else if(String.fromCharCode(e.keyCode) == "T") {
	    	this.setView("TOP");
	    } else if(String.fromCharCode(e.keyCode) == "G") {
	    	if(this.grid.isEnabled()) {
	    		this.grid.hide();
	    	} else {
	    		this.grid.show();
	    	}
	    } else if(String.fromCharCode(e.keyCode) == "1") {
	    	this.stormGLContext.drawElementsMode(4);
	    } else if(String.fromCharCode(e.keyCode) == "2") {
	    	this.stormGLContext.drawElementsMode(1);
	    }
		
    	if(this.preloads == 0) this.defaultCamera.controller.keyUpFC(e);
    }).bind(this),false);
	
	document.body.addEventListener("mouseup", this.mouseup.bind(this), false);
	document.body.addEventListener("touchend", this.mouseup.bind(this), false);
	this.target.addEventListener("mousedown", this.mousedown.bind(this), false);
	this.target.addEventListener("touchstart", this.mousedown.bind(this), false);
	document.body.addEventListener("mousemove", this.mousemove.bind(this), false); 
	document.body.addEventListener("touchmove", this.mousemove.bind(this), false); 
	
	this.target.addEventListener("click", (function(e) {
		this.runningAnim = false;
		this.defaultCamera.enableAnimFrames = false;
    }).bind(this), false);
	
	this.target.addEventListener("mousewheel", (function(e) {
		e.preventDefault();
		this.setZeroSamplesGIVoxels();
		
		if(this.defaultCamera.controller.mouseWheel != undefined) this.defaultCamera.controller.mouseWheel(e);  
	}).bind(this), false);
	
	
	// CONFIG RESIZE
	if(this.resizable == 1 || this.resizable == 2) {
		var ar = (this.resizable == 1) ? true : false;
		this.$.resizable({	aspectRatio: ar,
							resize: (function(event,ui) {
								this.setWebGLResize(ui.size.width, ui.size.height);  
							}).bind(this)});
	}
	
	if(this.resizable == 3) { // screen autoadjust(maintain the aspect ratio)
		this.resizable = 0; // Set no-resizable and we make autoadjust
		
		var width = this.target.getAttribute('width');
		var height = this.target.getAttribute('height');
		function gcd (width, height) { // greatest common divisor (GCD) 
			return (height == 0) ? width : gcd(height, width%height);
		}
		
		var widthScreen = document.documentElement.clientWidth;
		var heightScreen = document.documentElement.clientHeight;
		
		var r = gcd(width, height);
		var aspectW = (width/r); // 800/r = 4
		var aspectH = (height/r); // 600/r = 3
		
		// scale style 
		var newCanvasWidth = ((heightScreen/aspectH)*aspectW);
		var newCanvasHeight = ((widthScreen/aspectW)*aspectH);
		if(newCanvasHeight <= heightScreen)
			this.setWebGLResize(widthScreen, newCanvasHeight);
		else
			this.setWebGLResize(newCanvasWidth, heightScreen);
	}
};
/** @private */
StormEngineC.prototype.handleOrientationEvent = function(event) {
	var gamma = undefined;
	var beta = undefined;
	var alpha = undefined;
	
	// gamma is the left-to-right tilt in degrees, where right is positive
	if(event.x != undefined) gamma = event.x;
	else if(event.gamma != undefined) gamma = event.gamma;
	else if(event.accelerationIncludingGravity != undefined && event.accelerationIncludingGravity.x != undefined) gamma = event.accelerationIncludingGravity.x;
	
	// beta is the front-to-back tilt in degrees, where front is positive
	if(event.y != undefined) beta = event.y;
	else if(event.beta != undefined) beta = event.beta;
	else if(event.accelerationIncludingGravity != undefined && event.accelerationIncludingGravity.y != undefined) beta = event.accelerationIncludingGravity.y;
	
	// alpha is the compass direction the device is facing in degrees
	if(event.z != undefined) alpha = event.z;
	else if(event.alpha != undefined) alpha = event.alpha;
	else if(event.accelerationIncludingGravity != undefined && event.accelerationIncludingGravity.z != undefined) alpha = event.accelerationIncludingGravity.z;
	
	if(gamma != undefined && beta != undefined && alpha != undefined) {
		this.orientation.gamma = gamma;
		this.orientation.beta = beta;
		this.orientation.alpha = alpha;
	}
	/*console.log('tiltLR GAMMA X: '+this.orientation.gamma+'<br />'+
				'tiltFB BETA Y: '+this.orientation.beta+'<br />'+
				'dir ALPHA Z: '+this.orientation.alpha+'<br />');*/
};
/**
* Get the device orientation tiltLeftRight (GAMMA X)
* @returns {Float} Float tiltLR.
*/
StormEngineC.prototype.getDeviceGamma = function() {
	return this.orientation.gamma;
};
/**
* Get the device orientation tiltFrontBack (BETA Y)
* @returns {Float} Float tiltFB.
*/
StormEngineC.prototype.getDeviceBeta = function() {
	return this.orientation.beta;
};
/**
* Get the device orientation dir (ALPHA Z)
* @returns {Float} Float dir.
*/
StormEngineC.prototype.getDeviceAlpha = function() {
	return this.orientation.alpha;
};
/**
* Set the tranform
* @type Void
* @param {Int} [mode=0] 0 for world transform; 1 for local transform
*/
StormEngineC.prototype.transformMode = function(mode) {
	this.defaultTransformMode = mode||0;
};
/**  @private */
StormEngineC.prototype.updateDivPosition = function(e) {
	this.divPositionX = this.utils.getElementPosition(this.target).x;
	this.divPositionY = this.utils.getElementPosition(this.target).y;
};
/**  @private */
StormEngineC.prototype.makePanel = function(panelobj, strAttrID, paneltitle, html) {
	var p = new StormPanel(strAttrID, paneltitle, html);
	panelobj.$ = p.$;
	panelobj.De = p.De;
};
/**  @private */
StormEngineC.prototype.mouseup = function(e) {
	this.isMouseDown = false;
	//e.preventDefault();
	this.stormGLContext.makeMouseUp = true;
	
	this.setZeroSamplesGIVoxels();
	
	if(this.preloads == 0) this.defaultCamera.controller.mouseUpFC(e);
	if(this.stormRender != undefined && this.renderStop == false) {
		this.pauseRender = false;
		this.stormRender.setCam(this.defaultCamera);
		this.stormRender.makeRender();
		
		this.pause = true;
	}
};
/**  @private */
StormEngineC.prototype.mousedown = function(e) {
	this.isMouseDown = true;
	
	if(e.targetTouches != undefined) {
		//console.log(e.targetTouches)
		e = e.targetTouches[0];
		e.button = 0;
		this.identifierTouchMoveOwner = e.identifier;
		
		this.oldMousePosClickX = this.mousePosX;
		this.oldMousePosClickY = this.mousePosY; 
		
		this.mousePosX = (e.clientX - this.divPositionX);
		this.mousePosY = (e.clientY - this.divPositionY);
		this.mouseOldPosX = this.mousePosX;   
		this.mouseOldPosY = this.mousePosY;  
	}
	//e.preventDefault(); // si se habilita no funciona sobre un iframe
	
	if(e.button == 2) { // right button
		if(this.editMode) {
			DGE('STORMMENU_MOUSE').style.display = "block";
			DGE('STORMMENU_MOUSE').style.left = this.mousePosX+"px";
			DGE('STORMMENU_MOUSE').style.top = this.mousePosY+"px";
			return false;
		}
	} else {
		this.oldMousePosClickX = this.mousePosX;
		this.oldMousePosClickY = this.mousePosY; 
		
		this.stormGLContext.makeMouseDown = true;
		
		this.setZeroSamplesGIVoxels();
		
		this.PanelAnimationTimeline.stop();
		this.runningAnim = false;
		this.defaultCamera.enableAnimFrames = false;
		if(this.preloads == 0) {
			this.defaultCamera.controller.lastX = e.screenX;
			this.defaultCamera.controller.lastY = e.screenY;
			this.defaultCamera.controller.mouseDownFC(e);
		}
		if(this.stormRender != undefined && this.renderStop == false) {
			this.pauseRender = true;
			clearTimeout(this.stormRender.timerRender);
			
			this.pause = false;
		}
	}
};
/**  @private */
StormEngineC.prototype.mousemove = function(e) {
	e.preventDefault();
	var isMoveOwner = false;
	if(e.targetTouches != undefined) {
		for(var n = 0, fn = e.targetTouches.length; n < fn; n++) {
			if(e.targetTouches[n].identifier == this.identifierTouchMoveOwner) {
				//console.log(e.targetTouches)
				e = e.targetTouches[n];
				e.button = 0;
				isMoveOwner = true;
			}
		}
	}
	if(e.targetTouches == undefined || (e.targetTouches != undefined && isMoveOwner)) {
		this.mouseOldPosX = this.mousePosX;   
		this.mouseOldPosY = this.mousePosY;
		this.mousePosX = (e.clientX - this.divPositionX);
		this.mousePosY = (e.clientY - this.divPositionY);
		//console.log(this.mousePosX+' '+this.mousePosY);
		
		this.stormGLContext.makeMouseMove = true;
		
		if(this.defaultCamera.controller.leftButton == 1 || this.defaultCamera.controller.middleButton == 1) {
			this.setZeroSamplesGIVoxels();
			if(this.preloads == 0) this.defaultCamera.controller.mouseMoveFC(e);
		}
	}
};
/**  @private */
StormEngineC.prototype.setZeroSamplesGIVoxels = function() {
	if(this.intervalCheckCameraGoalStaticStatus != undefined) {
		clearInterval(this.intervalCheckCameraGoalStaticStatus);
		this.intervalCheckCameraGoalStaticStatus = undefined;
	}
	
	this.intervalCheckCameraGoalStaticStatus = setInterval((function() {
		this.stormGLContext.sampleGiVoxels = 0;  
		this.stormGLContext.cameraIsStatic = 0;  
		//console.log('nostatic');
		if((this.defaultCamera.nodeGoal.getPosition().distance(this.cameraGoalCurrentPos) < 0.0001)) {  
			clearInterval(this.intervalCheckCameraGoalStaticStatus);
			this.intervalCheckCameraGoalStaticStatus = undefined;
			this.stormGLContext.sampleGiVoxels = 0;  
			this.stormGLContext.cameraIsStatic = 1;  
		}
		this.cameraGoalCurrentPos = this.defaultCamera.nodeGoal.getPosition();
	}).bind(this), 30);
};
/**  @private */
StormEngineC.prototype.selectNode = function(node) {
	this.nearNode = node;   
	
	if(this.editMode == true && this.nearNode != undefined) {
		if(this.PanelAnimationTimeline.De.style.display == 'block')
			this.PanelAnimationTimeline.drawTimelineGrid();
			
		//if(this.PanelListObjects.De.style.display == "block") {
			this.PanelListObjects.showListObjects(); 
			this.PanelListObjects.show();
		//}
		//if(this.PanelListObjects.De.style.display == "block") {
			this.PanelEditNode.show();
			this.PanelEditNode.updateNearNode();
		//}
		
		this.debugValues = [];
		if(this.nearNode.objectType == 'line') {
			var vecTranslation = this.nearNode.origin;
			var vecTranslationE = this.nearNode.end; 
			this.debugValues = [];
			this.setDebugValue(0, vecTranslation, this.nearNode.name+' origin');
			this.setDebugValue(1, vecTranslationE, this.nearNode.name+' end');
		} else if(this.nearNode.objectType == 'camera') {
			var vecGoal = this.nearNode.nodeGoal.getPosition();
			var vecPivot = this.nearNode.nodePivot.getPosition();
			this.debugValues = [];
			this.setDebugValue(0, vecGoal, this.nearNode.name+' nodeGoal');
			this.setDebugValue(1, vecPivot, this.nearNode.name+' nodePivot');
		} else if(this.nearNode.getPosition != undefined) {    
			var vec = this.nearNode.getPosition();
			this.debugValues = [];
			this.setDebugValue(0, vec, this.nearNode.name); 
		} 
	}
};

/**
* Get the selected node
* @returns {StormNode} 
*/
StormEngineC.prototype.getSelectedNode = function() {
	return this.nearNode;
};

/** @private */
StormEngineC.prototype.go = function() {};
/** @private */
StormEngineC.prototype.next = function() {
	window.requestAnimFrame(this.next.bind(this));
	this.render();
	this.nextFrameLocalTimeline();
};
/** @private */
StormEngineC.prototype.render = function() {
	if(!this.pause) {
		if(this.preloads == 0) {
			this.stormJigLibJS.update(this.elapsed);
		}
		
		if(this.callback != undefined) this.callback();
		
		var timeNow = new Date().getTime();
		if(this.lastTime != 0) this.elapsed = timeNow - this.lastTime;
		this.lastTime = timeNow;
	   
		

		this.defaultCamera.posCamera = $V3([this.defaultCamera.nodeGoal.MPOS.e[3], this.defaultCamera.nodeGoal.MPOS.e[7], this.defaultCamera.nodeGoal.MPOS.e[11]]);
		this.defaultCamera.posCameraPivot = $V3([this.defaultCamera.nodePivot.MPOS.e[3], this.defaultCamera.nodePivot.MPOS.e[7], this.defaultCamera.nodePivot.MPOS.e[11]]);
		this.defaultCamera.vecView = this.defaultCamera.posCameraPivot.subtract(this.defaultCamera.posCamera).normalize();
		this.defaultCamera.centroPlanoProyeccion = this.defaultCamera.posCamera.add(this.defaultCamera.vecView.x(this.defaultCamera.distanciaAlPlano));
		this.defaultCamera.vecXPlanoProyeccion = $V3([0.0, 1.0, 0.0]).cross(this.defaultCamera.vecView).normalize();//◄
		this.defaultCamera.vecYPlanoProyeccion = this.defaultCamera.vecView.cross(this.defaultCamera.vecXPlanoProyeccion).normalize();//▲
		
		var xcc = this.defaultCamera.vecView.x(1.0).x(this.defaultCamera.focusExtern); 
		var posFF = this.defaultCamera.getPosition().add(xcc);
		this.defaultCamera.nodePivot.nodeFocus.setPosition(posFF);
		
		if(	this.runningAnim == false &&
			this.defaultCamera.enableAnimFrames == false &&
			this.defaultCamera.animController == 'GlobalTimeline') {
			this.defaultCamera.controller.updateFC(this.elapsed);
		}
		
		
		var cameraP = this.defaultCamera.nodeGoal.getPosition();
		var center = this.defaultCamera.nodePivot.getPosition();
		
		this.defaultCamera.MPOS = $M16().makeLookAt(cameraP.e[0], cameraP.e[1], cameraP.e[2],
													center.e[0], center.e[1], center.e[2],
													0.0,1.0,0.0);
		
		
		// update sun light
		this.lights[0].setDirection(this.lights[0].direction);
		
		// guardar operaciones generales para este frame
		for(var n = 0, f = this.nodes.length; n < f; n++) {
			this.nodes[n].MPOSFrame = this.nodes[n].MPOS.x(this.nodes[n].MROTXYZ);
			this.nodes[n].MCAMPOSFrame = this.defaultCamera.MPOS.x(this.nodes[n].MPOSFrame);
		}
		for(var n = 0, f = this.polarityPoints.length; n < f; n++) {
			this.polarityPoints[n].MPOSFrame = this.polarityPoints[n].MPOS.x(this.polarityPoints[n].MROTXYZ);
			this.polarityPoints[n].MCAMPOSFrame = this.defaultCamera.MPOS.x(this.polarityPoints[n].MPOSFrame);
		}
		for(var n = 0, f = this.lights.length; n < f; n++) {
			this.lights[n].MPOSFrame = this.lights[n].MPOS.x(this.lights[n].MROTXYZ);
			this.lights[n].MCAMPOSFrame = this.defaultCamera.MPOS.x(this.lights[n].MPOSFrame);
			
			this.lights[n].mrealWMatrixFrame = this.lights[n].mrealWMatrix.x(this.lights[n].mrealRotationLocalSpaceMatrix);
			this.lights[n].mrealWVMatrixFrame = this.defaultCamera.MPOS.x(this.lights[n].mrealWMatrixFrame);
		}
		
		this.stormGLContext.renderGLContext();
		
		// debug values
		this.showDebugValues();
	}
};

/** @private */
StormEngineC.prototype.nextFrameLocalTimeline = function() { 
	for(n = 0, f = this.nodes.length; n < f; n++) {
		if(this.nodes[n].animController == 'LocalTimeline' && this.nodes[n].playLocalTimeline == true) {  
			var start = this.nodes[n].animMinLayerLocalTimeline[this.nodes[n].currLanimL];
			var end = this.nodes[n].animMaxLayerLocalTimeline[this.nodes[n].currLanimL];
			var curr = this.nodes[n].animCurrentLayerLocalTimeline[this.nodes[n].currLanimL];
			
			if(curr >= end) {
				if(this.nodes[n].animLoopLayerLocalTimeline[this.nodes[n].currLanimL]) {
					curr = start
					this.nodes[n].applyAnimFrame(curr); 
				}
			} else {
				curr = curr+1;
				this.nodes[n].applyAnimFrame(curr); 
			} 
			//this.SL.slider("option", "value", parseInt(this.current));  
		}
	}
	for(n = 0, f = this.lights.length; n < f; n++) {
		if(this.lights[n].animController == 'LocalTimeline' && this.lights[n].playLocalTimeline == true) {  
			var start = this.lights[n].animMinLayerLocalTimeline[this.lights[n].currLanimL];
			var end = this.lights[n].animMaxLayerLocalTimeline[this.lights[n].currLanimL];
			var curr = this.lights[n].animCurrentLayerLocalTimeline[this.lights[n].currLanimL];
			
			if(curr >= end) {
				if(this.lights[n].animLoopLayerLocalTimeline[this.lights[n].currLanimL]) {
					curr = start
					this.lights[n].applyAnimFrame(curr); 
				}
			} else {
				curr = curr+1;
				this.lights[n].applyAnimFrame(curr); 
			} 
			//this.SL.slider("option", "value", parseInt(this.current));  
		}
	}
	for(n = 0, f = this.nodesCam.length; n < f; n++) {
		if(this.nodesCam[n].animController == 'LocalTimeline' && this.nodesCam[n].playLocalTimeline == true) {  
			var start = this.nodesCam[n].animMinLayerLocalTimeline[this.nodesCam[n].currLanimL];
			var end = this.nodesCam[n].animMaxLayerLocalTimeline[this.nodesCam[n].currLanimL];
			var curr = this.nodesCam[n].animCurrentLayerLocalTimeline[this.nodesCam[n].currLanimL];
			
			if(curr >= end) {
				if(this.nodesCam[n].animLoopLayerLocalTimeline[this.nodesCam[n].currLanimL]) {
					curr = start
					this.nodesCam[n].applyAnimFrame(curr); 
				}
			} else {
				curr = curr+1;
				this.nodesCam[n].applyAnimFrame(curr);  
			} 
			//this.SL.slider("option", "value", parseInt(this.current));  
		}
	}
};

var ws = undefined;
/**
* Up Websocket Game Server
* @type Void
* @param {String} ip
* @param {Int} port
*/
StormEngineC.prototype.upWebsocket = function(ip, port) {
	ws = io.connect('ws://'+ip+':'+port+'/');
	
	ws.on('newconnection', (function(data) {
		if(data.netID != this.netID ) {
			console.log(data);
			
			var node = new StormNode(this);
			node.idNum = this.nodes.length;
			node.name = 'node '+this.idxNodes++;
			this.nodes.push(node);
			
			node.netID = data.netID;
			this.arrNetUsers.push({	'netID':data.netID,
											'node':node});
			var mesh = new StormMesh(this);
			//mesh.loadBox(node, $V3([1.0,1.0,1.0]));
			//node.setAlbedo($V3([1.0,1.0,1.0])); 
			mesh.loadBox($V3([1.0,1.0,1.0])); // the mesh to be used should be placed at the point 0,0,0 before exporting
			node.setPosition($V3([-13.0, 2.0, -30.0]));
		}
	}).bind(this));
	
	ws.emit('getNetNodes', {
		notinuse: this.nodes.length
	});
	ws.on('getNetNodesResponse', (function(data) { // clientes que se encuentran conectados
		var node = new StormNode(this);
		node.idNum = this.nodes.length;
		node.name = 'node '+this.idxNodes++;
		this.nodes.push(node);
		
		node.netID = data.netID;
		this.arrNetUsers.push({	'netID':data.netID,
										'node':node});
		
		var mesh = new StormMesh(this);
		//mesh.loadBox(node, $V3([1.0,1.0,1.0]));
		//node.setAlbedo($V3([1.0,1.0,1.0])); 
		mesh.loadBox($V3([1.0,1.0,1.0])); // the mesh to be used should be placed at the point 0,0,0 before exporting
		node.setPosition($V3([-13.0, 2.0, -30.0]));
	}).bind(this));
	
	
	ws.on('newNetNodeConnectionResponse', (function(data) { // data.netID = my net id
		this.netID = data.netID;
		
		this.netNode = new StormNode(this);
		this.netNode.idNum = this.nodes.length;
		this.netNode.name = 'node '+this.idxNodes++;
		this.nodes.push(this.netNode);
		
		this.netNode.netID = data.netID;
		this.arrNetUsers.push({	'netID':data.netID,
										'node':this.netNode});
										
		this.newNetNodeConnectionResponse(this.netNode); 
		//alert(data.netID);
	}).bind(this));
	
	/*ws.onerror = function(error) {
		alert(error); 
	};*/
	/*ws.onclose = function() {

	};*/
	
	ws.on('serverNodeData', (function(data) {
		//alert('serverNodeData '+data.netID);
		if(data.netID != this.netID ) {
			var nodeIdNum = 0;
			for(var n = 0, f = this.arrNetUsers.length; n < f; n++) {
				if(this.arrNetUsers[n].netID == data.netID) {
					nodeIdNum = this.arrNetUsers[n].node.idNum;
					break;
				}
			}
			for(var n = 0, f = this.nodes.length; n < f; n++) {
				if(this.nodes[n].idNum == nodeIdNum) {
					this.nodes[n].MPOS = $M16([
									  data.WM0, data.WM1, data.WM2, data.WM3,
									  data.WM4, data.WM5, data.WM6, data.WM7,
									  data.WM8, data.WM9, data.WM10, data.WM11,
									  data.WM12, data.WM13, data.WM14, data.WM15
									]);
					this.nodes[n].MROTXYZ = $M16([
									  data.RM0, data.RM1, data.RM2, data.RM3,
									  data.RM4, data.RM5, data.RM6, data.RM7,
									  data.RM8, data.RM9, data.RM10, data.RM11,
									  data.RM12, data.RM13, data.RM14, data.RM15
									]);
				}
			}
			
			
		}
	}).bind(this));	
	ws.on('disconnectNetNode', (function(data) {
		//alert('disconnectNetNode '+data.netID);
		var nodeIdNum = 0;
		for(var n = 0, f = this.arrNetUsers.length; n < f; n++) {
			if(this.arrNetUsers[n].netID == data.netID) {
				nodeIdNum = this.arrNetUsers[n].node.idNum;
				break;
			}
		}
		for(var n = 0, f = this.nodes.length; n < f; n++) {
			if(this.nodes[n].idNum == nodeIdNum) {
				this.nodes[n].visibleOnContext = false; 
			}
		}
	}).bind(this));
	
	ws.on('setPrincipalNetNodeResponse', (function(data) {
		//alert('setPrincipalNetNodeResponse '+data.netID);
		var nodeIdNum = 0;
		for(var n = 0, f = this.arrNetUsers.length; n < f; n++) {
			if(this.arrNetUsers[n].netID == data.netID) {
				nodeIdNum = this.arrNetUsers[n].node.idNum;
				break;
			}
		}
		for(var n = 0, f = this.nodes.length; n < f; n++) {
			if(this.nodes[n].idNum == nodeIdNum) {
				if(data.netID != this.netID) { 
					this.globalResponsePrincipalNetNode(this.nodes[n]);
				}
			}
		}
	}).bind(this));
};

/**
* Create StormNode object
* @returns {StormNode}
*/
StormEngineC.prototype.createNode = function() {
	var node = new StormNode(this);
	node.idNum = this.nodes.length;
	node.name = 'node '+this.idxNodes++;
	var material = this.createMaterial();
	node.materialUnits[0] = material; 
	this.nodes.push(node);
	return node;
};

/**
* Make a websocket player
* @type Void
*/
StormEngineC.prototype.createNetNode = function() { // llamar al final del código, después de cargar todos los nodos estáticos
	if(this.GAESceneChannel != undefined) {
		this.netID = this.netID; // my net id
		
		this.netNode = new StormNode(this);
		this.netNode.idNum = this.nodes.length;
		this.netNode.name = 'node '+this.idxNodes++;
		var material = this.createMaterial();
		this.netNode.materialUnits[0] = material; 
		this.nodes.push(this.netNode);
		
		this.netNode.netID = this.netID;
		this.arrNetUsers.push({	'netID':this.netID,
								'node':this.netNode});
										
		this.newNetNodeConnectionResponse(this.netNode); 
	} else {
		if(ws != undefined && (ws.socket.connected == true || ws.socket.connecting == true)) {
			ws.emit('newNetNode', {
				notinuse: this.nodes.length
			});
		} else {
			this.netNode = new StormNode(this);
			this.netNode.idNum = this.nodes.length;
			this.netNode.name = 'node '+this.idxNodes++;
			var material = this.createMaterial();
			this.netNode.materialUnits[0] = material; 
			this.nodes.push(this.netNode);
		
			this.newNetNodeConnectionResponse(this.netNode); 
		}
	}
};

/**
* @private 
* @returns {Array} Net Nodes Connected
*/
StormEngineC.prototype.getArrayNetNodes = function() {
	var arrNetNodes = [];
	for(var n = 0, f = this.arrNetUsers.length; n < f; n++) {
		arrNetNodes.push(this.arrNetUsers[n].node);
	}
	return arrNetNodes;
};

/**
* Make this client the principal Net Player
* @type Void
*/
StormEngineC.prototype.setPrincipalNetNode = function() {
	//alert(this.netID);
	ws.emit('setPrincipalNetNode', {
		netID: this.netID
	});
};

/**
* Return websocket status for Game Server
* @returns {String} 
*/
StormEngineC.prototype.getServerStatus = function() {
	return ws.socket.connected.toString();
};


wsPathTracing = undefined;
/**
* Up Websocket PathTracing Server
* @type Void
* @param {String} ip
* @param {Int} port
*/
StormEngineC.prototype.upWebsocketPathTracing = function(ip, port) {
	wsPathTracing = io.connect('ws://'+ip+':'+port+'/', {
		'connect timeout':1000000
	});
	
	wsPathTracing.emit('newNetNode', {
		notinuse: this.nodes.length
	});
		
	wsPathTracing.on('newNetNodeConnectionResponse', (function(data) { // data.netID = my net id
		this.netID = data.netID;
		if(data.netID == 0) {
			$('#DIVID_StormRenderTypeNet').html('<span style="font-weight:bold;color:green;">CLOUD RENDER DETECTED</span><br /><span style="font-weight:bold;color:#000;">HOST MACHINE</span>');
		} else {
			$('#DIVID_StormRenderTypeNet').html('<span style="font-weight:bold;color:green;">CLOUD RENDER DETECTED</span><br /><span style="font-weight:bold;color:#000;">CLIENT '+data.netID+'</span>');
			$('#DIVID_StormRenderConf').css("display",'none'); 
			$('#BTNID_StormRenderBtn').html("Collaborate");
			$('#BTNID_StormRenderTimelineBtn').css('display','none');
		}
		this.arrNetUsers.push({	'netID':data.netID});
	}).bind(this));
		
	wsPathTracing.on('newconnection', (function(data) {
		if(data.netID != this.netID ) {
			console.log(data);
			
			this.arrNetUsers.push({	'netID':data.netID});
		}
	}).bind(this));
	
	wsPathTracing.emit('getNetNodes', {
		notinuse: this.nodes.length
	});
	wsPathTracing.on('getNetNodesResponse', (function(data) { // clientes que se encuentran conectados
		this.arrNetUsers.push({	'netID':data.netID});
	}).bind(this));
	
	wsPathTracing.on('setFrameTotalColorXResponse', (function(data) {
		if(this.netID == 0) {
			if(this.stormRender != undefined) this.stormRender.receiveFromClient = 1;
			$('#DIVID_StormRenderNetReceive').html('<span style="color:blue;">- Receiving <span style="font-weight:bold;">FRAME '+data.frameNumber+'</span> from <span style="font-weight:bold;">CLIENT '+data.netID+'</span></span>');
			this.timelinePathTracing.setFrameTotalColorX(data.frameNumber, data.arrayTotalColorX, data.width, data.height, data.offset);
		}
	}).bind(this));	
	wsPathTracing.on('setFrameTotalColorYResponse', (function(data) {
		if(this.netID == 0) {
			if(this.stormRender != undefined) this.stormRender.receiveFromClient = 1;
			this.timelinePathTracing.setFrameTotalColorY(data.frameNumber, data.arrayTotalColorY, data.offset);
		}
	}).bind(this));	
	wsPathTracing.on('setFrameTotalColorZResponse', (function(data) {
		if(this.netID == 0) {
			if(this.stormRender != undefined) this.stormRender.receiveFromClient = 1;
			this.timelinePathTracing.setFrameTotalColorZ(data.frameNumber, data.arrayTotalColorZ, data.offset);
		}
	}).bind(this));	
	wsPathTracing.on('setFrameTotalShadowResponse', (function(data) {
		if(this.netID == 0) {
			if(this.stormRender != undefined) this.stormRender.receiveFromClient = 1;
			this.timelinePathTracing.setFrameTotalShadow(data.frameNumber, data.arrayTotalShadow, data.offset);
		}
	}).bind(this));	
	wsPathTracing.on('setFrameSampleResponse', (function(data) {
		if(this.netID == 0) {
			if(this.stormRender != undefined) this.stormRender.receiveFromClient = 0;
			$('#DIVID_StormRenderNetReceive').html('');
			this.timelinePathTracing.setFrameSample(data.frameNumber, data.arraySample, true);
		}
	}).bind(this));	
	wsPathTracing.on('disconnectNetNode', (function(data) {
		//alert('disconnectNetNode '+data.netID);
	}).bind(this));
	wsPathTracing.on('getFrame', (function(data) {		
		if(data.netID == this.netID && this.netID != 0) {
			if(this.pauseRender == false) {
				this.stormRender.sendFrameToHost = 1;
			} else {
				wsPathTracing.emit('hostUnhold', {
					notinuse: this.nodes.length
				});
			}
		}
	}).bind(this));
	wsPathTracing.on('nextFrame', (function(data) {		
		if(data.netID == this.netID && this.netID != 0) {
			this.stormRender.nextFrame();
		}
	}).bind(this));
	wsPathTracing.on('getRenderDimensionsResponse', (function(data) {
		if(this.netID == 0) {
			var jsonS = [];
			for(var n = this.defaultCamera.animMin, f = this.defaultCamera.animMax; n <= f; n++) {
				if(this.defaultCamera.nodePivot.animWMatrix[n] != undefined) {
					jsonS.push({'frame':n,
								'WMatrixPivot':this.defaultCamera.nodePivot.animWMatrix[n].e,
								'WMatrixGoal':this.defaultCamera.nodeGoal.animWMatrix[n].e});
				}
			}
			wsPathTracing.emit('sendRenderDimensions', {
				netID: data.netID,
				width: $('#INPUTID_StormRenderSettings_width').val(),
				height: $('#INPUTID_StormRenderSettings_height').val(),
				camMatrixFrames: jsonS
			}); 
		}
	}).bind(this));
	wsPathTracing.on('sendRenderDimensionsResponse', (function(data) {	
		if(data.netID == this.netID && this.netID != 0) {
			//console.log(data.camMatrixFrames);
			for(var n = 0, f = data.camMatrixFrames.length; n < f; n++) {
				var arrPivot = [];
				var arrGoal = [];
				$.each(data.camMatrixFrames[n].WMatrixPivot, function(k,v){
					arrPivot.push(v);
				});
				$.each(data.camMatrixFrames[n].WMatrixGoal, function(k,v){
					arrGoal.push(v);
				});
				this.defaultCamera.setAnimKey(data.camMatrixFrames[n].frame, $M16(arrPivot), $M16(arrGoal));
			}
			this.PanelRenderSettings.render(data.width, data.height);
		}
	}).bind(this));
};

/**
* Create material
* @returns {StormMaterial}
*/
StormEngineC.prototype.createMaterial = function() {
	var material = new StormMaterial(this);
	material.idNum = this.materials.length;
	material.name = 'material '+this.idxMaterials++;
	this.materials.push(material);
	return material;
};

/**
* Create StormGroupNodes object
* @returns {StormGroupNodes}
*/
StormEngineC.prototype.createGroup = function() {
	var group = new StormGroupNodes(this);
	group.idNum = this.groups.length;
	group.name = 'group '+this.idxGroups++;
	this.groups.push(group);
	return group;
};
 
/**
* Create camera. If distance is given the type of controller is 'targetcam' else 'freecam'.
* @returns {StormCamera}
* @param {StormV3} [position=$V3([0.0,0.0,0.0])] The position
* @param {Float} [distance=undefined] Distance to camera target
*/
StormEngineC.prototype.createCamera = function(vec, distance) {
	var dist = (distance != undefined) ? distance : 1.0;
	
	var nodeCam = new StormCamera(this);
	nodeCam.idNum = this.nodesCam.length;
	nodeCam.name = 'camera '+this.idxNodesCam++;
	this.nodesCam.push(nodeCam);
	
	nodeCam.nodePivot = new StormNode(this);
	nodeCam.nodePivot.setPosition((vec == undefined)?$V3([0.0, 0.0, 0.0]):vec);
	nodeCam.nodeGoal = new StormNode(this);	 
	
	nodeCam.nodePivot.nodeFocus = this.createNode();
	nodeCam.nodePivot.nodeFocus.systemVisible = false; 
	nodeCam.nodePivot.nodeFocus.name = nodeCam.name+' focus';
	nodeCam.nodePivot.nodeFocus.visibleOnContext = false; 
	nodeCam.nodePivot.nodeFocus.visibleOnRender = false; 
	nodeCam.nodePivot.nodeFocus.loadBox($V3([0.12,0.12,0.12]));
	nodeCam.nodePivot.nodeFocus.setAlbedo($V3([0.3,0.8,0.3])); 
	
	var posGoal = nodeCam.nodePivot.getPosition().add($V3([0.0,0.0,dist]));  
	nodeCam.nodeGoal.setPosition(posGoal);
	nodeCam.setController({'mode': 'targetcam',
							'distance': dist});
	
	nodeCam.setProjectionType('p');
	
	return nodeCam;
};

/**
* Create line
* @returns {StormLine}
* @param {StormV3} vecOrigin Origin point
* @param {StormV3} vecEnd End point
* @param {StormV3} [vecOriginColor=$V3([1.0,1.0,1.0])] Color of origin point
* @param {StormV3} [vecEndColor=$V3([0.0,0.0,0.0])] Color of end point
*/
StormEngineC.prototype.createLine = function(vecOrigin, vecEnd, vecOriginColor, vecEndColor) {
	var cutLine = new StormLine(this);
	cutLine.idNum = this.lines.length;
	cutLine.name = 'line '+this.idxLines++;
	//var material = this.createMaterial();
	//cutLine.materialUnits[0] = material; 
	this.lines.push(cutLine);
	
	cutLine.origin = vecOrigin;
	cutLine.end = vecEnd;
	cutLine.vecOriginColor = (vecOriginColor != undefined) ? vecOriginColor : $V3([1.0,1.0,1.0]);
	cutLine.vecEndColor = (vecEndColor != undefined) ? vecEndColor : $V3([0.0,0.0,0.0]);
	
	var linesVertexArray = [];
	var linesVertexLocArray = [];
	var linesIndexArray = [];
	linesVertexArray.push(cutLine.origin.e[0], cutLine.origin.e[1], cutLine.origin.e[2], cutLine.end.e[0], cutLine.end.e[1], cutLine.end.e[2]);	
	linesVertexLocArray.push(cutLine.vecOriginColor.e[0],cutLine.vecOriginColor.e[1],cutLine.vecOriginColor.e[2], cutLine.vecEndColor.e[0],cutLine.vecEndColor.e[1],cutLine.vecEndColor.e[2]);
	linesIndexArray.push(0, 1);
		
	cutLine.vertexBuffer = this.stormGLContext.gl.createBuffer();
	this.stormGLContext.gl.bindBuffer(this.stormGLContext.gl.ARRAY_BUFFER, cutLine.vertexBuffer);
	this.stormGLContext.gl.bufferData(this.stormGLContext.gl.ARRAY_BUFFER, new Float32Array(linesVertexArray), this.stormGLContext.gl.STATIC_DRAW);
	
	cutLine.vertexLocBuffer = this.stormGLContext.gl.createBuffer();
	this.stormGLContext.gl.bindBuffer(this.stormGLContext.gl.ARRAY_BUFFER, cutLine.vertexLocBuffer);
	this.stormGLContext.gl.bufferData(this.stormGLContext.gl.ARRAY_BUFFER, new Float32Array(linesVertexLocArray), this.stormGLContext.gl.STATIC_DRAW);
	
	cutLine.indexBuffer = this.stormGLContext.gl.createBuffer();
	this.stormGLContext.gl.bindBuffer(this.stormGLContext.gl.ELEMENT_ARRAY_BUFFER, cutLine.indexBuffer);
	this.stormGLContext.gl.bufferData(this.stormGLContext.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linesIndexArray), this.stormGLContext.gl.STATIC_DRAW);
	
	return cutLine;
};

/**
* Create light
* @returns {StormLight}
* @param	{Object} jsonIn
* 	@param {String} jsonIn.type 'sun' or 'spot' (Max 10 spots lights)
* 	@param {StormV3} jsonIn.position The position. (Only for spot lights)
* 	@param {Int} [jsonIn.color=5770] Color in kelvins(1000K-15000K)
* 	@param {StormV3} [jsonIn.color=5770] Color through vector
* 	@param {StormV3} [jsonIn.direction=$V3([0.01,-0.5,0.01])] The direction vector. (If type is 'sun' only direction option).
*/
StormEngineC.prototype.createLight = function(jsonIn) {
	var create = false;
	if(jsonIn.type == 'sun') {
		if(this.lights.length == 0) {
			create = true;
		} else {
			light = this.lights[0];
			light.visibleOnContext = true;
			light.visibleOnRender = true;
			light.nodeCtxWebGL.visibleOnContext = true;
			light.setProjectionType('o');  
			//light.mPMatrix = $M16().setOrthographicProjection(-150, 150, -150, 150, 0.0, 200.0); 
			light.setFov(45);
		}
	} else {
		create = true;
	}
	
	if(create) {
		var light = new StormLight(this);
		light.idNum = this.lights.length;
		light.name = 'light '+jsonIn.type+' '+this.idxLights++;
		var material = this.createMaterial();
		light.materialUnits[0] = material; 
		this.lights.push(light); 
		
		light.nodeCtxWebGL = this.createNode();//malla nodeCtxWebGL para luz 
		light.nodeCtxWebGL.visibleOnContext = true; 
		light.nodeCtxWebGL.visibleOnRender = false; 
		var meshCtxWebGL = new StormMesh(this);
		meshCtxWebGL.loadBox(light.nodeCtxWebGL, $V3([0.1,0.1,0.1])); 
		
		var mesh = new StormMesh(this);
		mesh.loadBox(light, $V3([0.03,0.03,0.03])); 
		
		light.type = jsonIn.type; // sun | spot
		light.setProjectionType('p');
	}
	 
	
										 
	if(jsonIn.color != undefined) {
		light.setLightColor(jsonIn.color);
	} else {
		light.setLightColor(5770);
	}
	light.nodeCtxWebGL.setAlbedo(light.color);  
	
	if(jsonIn.direction != undefined) {
		light.setDirection($V3([jsonIn.direction.e[0], jsonIn.direction.e[1], jsonIn.direction.e[2]]));
	}
	
	if(jsonIn.position != undefined) {
		light.setPosition($V3([jsonIn.position.e[0], jsonIn.position.e[1], jsonIn.position.e[2]]));
	}

	
			
	return light;
};

/**
* Create polarity point
* @returns {StormPolarityPoint}
* @param	{Object} jsonIn
* 	@param {Int} [jsonIn.polarity=1] 1=positive 0=negative
* 	@param {Int} [jsonIn.orbit=0] Orbit mode (0 or 1)
* 	@param {Float} [jsonIn.force=0.5] The force.
*/
StormEngineC.prototype.createPolarityPoint = function(jsonIn) {
	var polarityPoint = new StormPolarityPoint(this, jsonIn);
	polarityPoint.idNum = this.polarityPoints.length;
	polarityPoint.name = 'polarityPoint '+this.idxPolarityPoint++;
	var material = this.createMaterial();  
	polarityPoint.materialUnits[0] = material; 
	polarityPoint.loadSphere({color: polarityPoint.color, radius: 0.5});   
	this.polarityPoints.push(polarityPoint); 
	return polarityPoint;
};
/**
* Create force field
* @returns {StormForceField}
* @param	{Object} jsonIn
* 	@param {StormV3} [jsonIn.direction=$V3([0.0,-9.8,0.0])] The direction.
*/
StormEngineC.prototype.createForceField = function(jsonIn) {
	var forceField = new StormForceField(this, jsonIn);
	forceField.idNum = this.forceFields.length;
	forceField.name = 'forceField '+this.idxForceField++;
	var material = this.createMaterial();
	forceField.materialUnits[0] = material; 
	this.forceFields.push(forceField); 
	return forceField;
};
/**
* Create gravity force 
* @returns {StormForceField}
*/
StormEngineC.prototype.createGravityForce = function() {   
	var forceField = new StormForceField(this);
	forceField.idNum = this.forceFields.length;
	forceField.name = 'gravityForce '+this.idxForceField++;  
	var material = this.createMaterial();
	forceField.materialUnits[0] = material; 
	forceField.forceFieldType = 'gravity';
	forceField.updateJigLib();
	this.forceFields.push(forceField); 
	return forceField;
};
/**
* Create voxelizator
* @returns {StormVoxelizator}
*/
StormEngineC.prototype.createVoxelizator = function() {   
	var vox = new StormVoxelizator(this);
	vox.idNum = this.voxelizators.length;
	vox.name = 'voxelizator '+this.idxVoxelizators++; 
	this.voxelizators.push(vox); 
	return vox;
};
/**
* Create graph
* @returns {StormGraph}
* 	@param	{Object} jsonIn
* 	@param {Float} [jsonIn.offset=100.0]
*/
StormEngineC.prototype.createGraph = function(jsonIn) {   
	var graph = new StormGraph(this, jsonIn);
	graph.idNum = this.graphs.length;
	graph.name = 'graph '+this.idxGraphs++; 
	this.graphs.push(graph); 
	return graph;
};
/**
* Set side view. This change the projection to orthographic.
* @type Void
* @param {String} view 'MAIN_CAMERA','LEFT','RIGHT','FRONT','BACK','TOP','BOTTOM'
 */
StormEngineC.prototype.setView = function(view) {	
	switch(view) {
		case 'MAIN_CAMERA':
			this.setWebGLCam(this.mainCamera); 
			break;
		case 'LEFT':
			this.setWebGLCam(this.leftView); 
			this.defaultCamera.setView(view);
			break;
		case 'RIGHT':
			this.setWebGLCam(this.rightView);  
			this.defaultCamera.setView(view);
			break;
		case 'FRONT':
			this.setWebGLCam(this.frontView); 
			this.defaultCamera.setView(view);
			break;
		case 'BACK':
			this.setWebGLCam(this.backView);
			this.defaultCamera.setView(view);
			break;
		case 'TOP':
			this.setWebGLCam(this.topView);
			this.defaultCamera.setView(view);
			break;
		case 'BOTTOM':
			this.setWebGLCam(this.bottomView);
			this.defaultCamera.setView(view);
			break;
	}	
};
/**
* Mostrar progreso de una peticion XMLHttpRequest acompañado de un texto pasado en string.
* Una vez que req se encuentre en readyState == 4 hay que volver a llamar a esta funcion pasando solo string vacio para borrar lo que haya
* @private 
* @type Void
* @param	{Object} JSON
* 			<b>'id' : {String}</b> id <br>
* 			<b>'str' : {String}</b> direction <i>Optional, Default: ''</i> <br>
* 			<b>'req' : {XMLHttpRequest}</b> Show XHR progress 
*/
StormEngineC.prototype.setStatus = function(jsonIn) {
	var exist = false;
	for(var n = 0, f = this.statusValues.length; n < f; n++) {
		if(this.statusValues[n].id == jsonIn.id) {  
			this.statusValues[n] = jsonIn;
			exist = true; break;
		}
	} 
	if(jsonIn.str == "") { // update the array
		var tmpArr = [];
		for(var n = 0, f = this.statusValues.length; n < f; n++) {
			if(this.statusValues[n].str != '') tmpArr.push(this.statusValues[n]);
		}
		this.statusValues = tmpArr;
	} else if(exist == false) { // add the new value to the array
		this.statusValues.push({id:jsonIn.id, str:jsonIn.str});
	}
	
	var bars = 0, barsAcum = 0; 
	var ctx = this.stormGLContext.ctx2DStatus; 
	ctx.clearRect(0, 0, this.stormGLContext.viewportWidth, this.stormGLContext.viewportHeight);
	for(var n = 0, f = this.statusValues.length; n < f; n++) { // messages
		ctx.fillStyle="#333";
		ctx.fillRect(0,0,this.stormGLContext.viewportWidth,20);
		ctx.fillStyle = "#CCC";
		ctx.strokeStyle = "#FFF";
		ctx.font = 'italic bold 12px sans-serif';
		ctx.textBaseline = 'bottom';
		ctx.fillText(this.statusValues[n].str, 5, 18); 
		
		if(this.statusValues[n].reqProgress != undefined || this.statusValues[n].req != undefined) {
			bars++;
			if(this.statusValues[n].reqProgress == undefined) this.statusValues[n].reqProgress = 0.1;
		}
	}
	for(var n = 0, f = this.statusValues.length; n < f; n++) { // progress bars
		if(this.statusValues[n].reqProgress != undefined)
			barsAcum += (this.statusValues[n].reqProgress/bars);
	}
	ctx.fillStyle="#22ACAC";
	ctx.fillRect(0,0,barsAcum*this.stormGLContext.viewportWidth,2);
	
	
	if(jsonIn.req != undefined) {
		jsonIn.req.onprogress = (function(evt) {
			if(evt.lengthComputable) {
				var current = evt.loaded/evt.total;
				this.setStatus({id:jsonIn.id, str: jsonIn.str, reqProgress:current});
			}
		}).bind(this);
	}
};

/**
* Add debug information for displaying values
* @type Void
* @param {Int} idx
* @param {StormM16|StormV3|Int|Float} value
* @param {String} [text=""]
*/
StormEngineC.prototype.setDebugValue = function(idx, value, string) {
	this.typeVector = value instanceof StormV3;
	this.typeMatrix = value instanceof StormM16;
	
	if(this.typeVector == true) {
		var v1 = value.e[0].toString().substr(0, 5);
		var v2 = value.e[1].toString().substr(0, 5);
		var v3 = value.e[2].toString().substr(0, 5);
		this.debugValues[idx] = '<b>'+string+':</b>	$V3(['+v1+',	'+v2+',	'+v3+'])<br />';
	} else if(this.typeMatrix == true) {
		var m00 = value.e[0].toString().substr(0, 5);
		var m01 = value.e[1].toString().substr(0, 5);
		var m02 = value.e[2].toString().substr(0, 5);
		var m03 = value.e[3].toString().substr(0, 5);
		
		var m10 = value.e[4].toString().substr(0, 5);
		var m11 = value.e[5].toString().substr(0, 5);
		var m12 = value.e[6].toString().substr(0, 5);
		var m13 = value.e[7].toString().substr(0, 5);
		
		var m20 = value.e[8].toString().substr(0, 5);
		var m21 = value.e[9].toString().substr(0, 5);
		var m22 = value.e[10].toString().substr(0, 5);
		var m23 = value.e[11].toString().substr(0, 5);
		
		var m30 = value.e[12].toString().substr(0, 5);
		var m31 = value.e[13].toString().substr(0, 5);
		var m32 = value.e[14].toString().substr(0, 5);
		var m33 = value.e[15].toString().substr(0, 5);
		
		this.debugValues[idx] = '<b>'+string+':</b>	<div align="right">$M16(['+m00+',	'+m01+',	'+m02+',	'+m03+',<br />'+m10+',	'+m11+',	'+m12+',	'+m13+',<br />'+m20+',	'+m21+',	'+m22+',	'+m23+',<br />'+m30+',	'+m31+',	'+m32+',	'+m33+'])</div>';
	} else {
		this.debugValues[idx] = '<b>'+string+':</b>	'+value.toString().substr(0, 5)+'<br />';
	}
};

/**
* Muestra los valores de debug almacenados
* @private
* @type Void
*/
StormEngineC.prototype.showDebugValues = function() {
	if(this.editMode) {
		this.debugResult = '';
		for(var n = 0; n < this.debugValues.length; n++) this.debugResult += this.debugValues[n];
		this.stormGLContext.divDebug.innerHTML  = this.debugResult;
	}
};

/**
* Clear the actual scene
* @type Void
*/
StormEngineC.prototype.clearScene = function() {
	this.setWebGLpause(true);
	this.nodes = [];
	this.nodesCam = [];
	this.lines = [];
	this.lights = [];
	
	this.stormGLContext = new StormGLContext(this, this.target);
	this.loadManager();
	
	//this.go();
	this.setWebGLpause(false);
};

/**
* Realiza un render (stormRender) basado en path tracing o EMR
* jsonIn{target, callback, mode}
* @private 
* @type Void
* @param	{Object} JSON
*			<b>'mode': {Int}</b> 0=PathTracing, 1=EMR Render <br>
*			<b>'target': {String}</b> ID target canvas. <i>Optional, Default: $V3([-0.5,-0.3,-0.5])</i> <br>
*			<b>'callback': function(){}</b> <br>
*			<b>'width': {Int}</b> <br>
*			<b>'height': {Int}</b> <br>
*			<b>'frameStart': {Int}</b> <br>
*			<b>'frameEnd': {Int}</b> <br>
*/
StormEngineC.prototype.renderFrame = function(jsonIn) {
	var modeRender = 0;
	if(jsonIn.mode == 1) {modeRender = 1;}
			
	this.renderStop = false;
	this.pauseRender = false;
	
	if(window.WebCL == undefined) {
		alert('Your browser does not support experimental-nokia-webcl. See http://webcl.nokiaresearch.com/');
	} else {
		if(modeRender == 0) {nelAnimationTimeline.setFrame(jsonIn.frameStart);			
			this.stormRender = new StormRender(this, {'target':jsonIn.target,
												'callback':jsonIn.callback,
												'width':jsonIn.width,
												'height':jsonIn.height,
												'frameStart':jsonIn.frameStart,
												'frameEnd':jsonIn.frameEnd});
		} else if(modeRender == 1) {
			this.PanelAnimationTimeline.setFrame(jsonIn.frameStart);
			this.stormRender = new StormRenderEMR(this, {	'target':jsonIn.target,
													'callback':jsonIn.callback,
													'width':jsonIn.width,
													'height':jsonIn.height,
													'frameStart':jsonIn.frameStart,
													'frameEnd':jsonIn.frameEnd});
		}
		this.stormRender.setCam(this.defaultCamera);
		this.stormRender.makeRender();
		
		this.pause = true;
	}
};

/**
* Detiene el render stormRender
* @private 
* @type Void
*/
StormEngineC.prototype.renderFrameStop = function() {
	this.renderStop = true;
	
	this.pauseRender = true;
	clearTimeout(this.stormRender.timerRender);
	$('#DIVID_StormPanelCanvas_proc').html('STOPPED');
	//clCmdQueue.releaseCLResources();
	
	this.pause = false;
};

/**
* Get the WebGL context
* @returns {WebGLRenderingContext} WebGLRenderingContext
*/
StormEngineC.prototype.getWebGL = function() {
	return this.stormGLContext.gl;
};

/**
* Get the 2D context
* @returns {CanvasRenderingContext2D} CanvasRenderingContext2D
*/
StormEngineC.prototype.get2DContext = function() {
	return this.stormGLContext.ctx2D;
};
/**
* Update the 2D context
* @type Void
*/
StormEngineC.prototype.update2DContext = function() {
	this.stormGLContext.gl.pixelStorei(this.stormGLContext.gl.UNPACK_FLIP_Y_WEBGL, true);
	this.stormGLContext.gl.pixelStorei(this.stormGLContext.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
	this.stormGLContext.gl.bindTexture(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.textureObject_Ctx2D);   
	this.stormGLContext.gl.texImage2D(this.stormGLContext.gl.TEXTURE_2D, 0, this.stormGLContext.gl.RGBA, this.stormGLContext.gl.RGBA, this.stormGLContext.gl.UNSIGNED_BYTE, this.stormGLContext.ctx2D.getImageData(0, 0, this.stormGLContext.viewportWidth, this.stormGLContext.viewportHeight));
	//this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_MAG_FILTER, this.stormGLContext.gl.LINEAR);
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_MIN_FILTER, this.stormGLContext.gl.LINEAR); //  not a power of 2
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_WRAP_S, this.stormGLContext.gl.CLAMP_TO_EDGE);
	this.stormGLContext.gl.texParameteri(this.stormGLContext.gl.TEXTURE_2D, this.stormGLContext.gl.TEXTURE_WRAP_T, this.stormGLContext.gl.CLAMP_TO_EDGE);
};
/**
* Define a hit region in the canvas area
* @returns {Int} id The id of the region object
* @param {Object} jsonIn
* 	@param {Int} jsonIn.x X pos.
* 	@param {Int} jsonIn.y Y pos.
* 	@param {Int} jsonIn.width Width.
* 	@param {Int} jsonIn.height Height.
* 	@param {Hex} jsonIn.fillStyle Fill color.
* 	@param {Hex} jsonIn.strokeStyle Stroke color.
* 	@param {Int} jsonIn.lineWidth Line width.
* 	@param {Function} jsonIn.onclick On click function.
* 	@param {Function} jsonIn.onmouseover On mouse over function.
* 	@param {Function} jsonIn.onmouseout On mouse out function.
*/
StormEngineC.prototype.addHitRectRegion = function(jsonIn) {
	var idx = this.idxHitsRectRegions;
	this.idxHitsRectRegions++;
	this.arrHitsRectRegions.push({	_id: idx,
									_over: false,
									x: jsonIn.x, y: jsonIn.y,
									width: jsonIn.width, height: jsonIn.height,
									onclick: jsonIn.onclick,
									onmouseover: jsonIn.onmouseover,
									onmouseout: jsonIn.onmouseout});
	
	var ctx;
	if(jsonIn.fillStyle != undefined || jsonIn.strokeStyle != undefined) {
		ctx = this.get2DContext();
		ctx.beginPath();
		ctx.rect(jsonIn.x,jsonIn.y,jsonIn.width,jsonIn.height);
		if(jsonIn.fillStyle != undefined) {
			ctx.fillStyle = jsonIn.fillStyle;
			ctx.fill();
		}
		if(jsonIn.strokeStyle != undefined) {
			if(jsonIn.lineWidth != undefined) ctx.lineWidth = jsonIn.lineWidth;
			ctx.strokeStyle = jsonIn.strokeStyle;
			ctx.stroke();
		}
		this.update2DContext();
	}
	
	return idx;
};
/**
* Remove a hit region in the canvas area
* @type Void
* @param {Int} id The id of the region object
*/
StormEngineC.prototype.removeHitRectRegion = function(idx) {
	var tmpArr = [];
	for(var n=0; n < this.arrHitsRectRegions.length; n++) if(this.arrHitsRectRegions[n]._id != idx) tmpArr.push(this.arrHitsRectRegions[n]);

	this.arrHitsRectRegions = tmpArr;
};

/**
* Set the visibility of the WebGL shadows
* @type Void
* @param {Bool} active
*/
StormEngineC.prototype.shadows = function(active) {
	this.stormGLContext.shadowsEnable = active;
};

/**
* Pause or unpause the execution.
* @type Void
* @param {Bool} pause Pause or unpause
*/
StormEngineC.prototype.setWebGLpause = function(pau) {
	if(this.pause == false || (pau != undefined && pau == true)) {
		this.pause = true;
		this.setStatus({id:'paused', str:'PAUSED'});
	} else if(this.pause == true || (pau != undefined && pau == false)) {
		this.pause = false;
		this.setStatus({id:'paused', str:''});
		//this.stormRender.makeRender();
	}
};

/**
* Enable AO
* @type Void
* @param {Bool} enable Enable or disable AO
* @param {Float} level The level of AO
*/
StormEngineC.prototype.setWebGLSSAO = function(enable, level) {
	this.stormGLContext.SSAOenable = enable;
	if(level != undefined) {
		this.stormGLContext.SSAOlevel = 5-level;
	}
};

/**
* Enable GI
* @type Void
* @param {StormGI} gi The global illumination object
* @private
*/
StormEngineC.prototype.setWebGLGI = function(gi) {
	this.giv2 = gi;
	this.stormGLContext.stormVoxelizatorObject = this.giv2.svo;
	this.stormGLContext.initShader_GIv2();
	this.stormGLContext.initShader_GIv2Exec();  
}; 

/**
* WebGL environment map
* @type Void
* @param {String} fileURL File URL
*/
StormEngineC.prototype.setWebGLEnvironmentMap = function(fileURL) {
	this.stormGLContext.setWebGLEnvironmentMap(fileURL); 
};

/**
* Set the WebGL background. Disable by default.
* @type Void
* @param {String|StormV3} value 'transparent','environmentMap','ambientColor' or StormV3 color. <i>Default: 'ambientColor'</i>
*/
StormEngineC.prototype.setWebGLBackground = function(value) {
	this.stormGLContext.useBGTrans = false;
	this.stormGLContext.useBGSolid = false;
	this.stormGLContext.useBGAmbient = false; 
	
	if(value == 'transparent') {
		this.stormGLContext.useBGTrans = true;
	} else if(value == 'environmentMap') {
		this.stormGLContext.useEnvironment = true; 
	} else if(value == 'ambientColor') {
		this.stormGLContext.useBGAmbient = true; 
	} else {
		this.stormGLContext.useBGSolid = true;
		this.stormGLContext.useBGSolidColor = $V3([value.e[0],value.e[1],value.e[2]]);
	}
};

/**
* WebGL resize
* @type Void
* @param {Int} width The width
* @param {Int} height The height
*/
StormEngineC.prototype.setWebGLResize = function(width,height) {
	this.$.css('width','auto');
	this.$.css('height','auto');
	this.$.attr('width',width);
	this.$.attr('height',height);
	var dim = (this.$.width() > this.$.height()) ? this.$.width() : this.$.height();
	this.stormGLContext.viewportWidth = dim;
	this.stormGLContext.viewportHeight = dim;
	this.stormGLContext.updateInfoElements();
	$("#TABLEID_STORMMENU td").css({'width':parseInt(this.stormGLContext.viewportWidth/6)+'px', 
									'padding':'0px'});
	this.updateDivPosition();
	this.stormGLContext.updateTexturesFB(); 
};

/**
* Get the ambient color. (0.0 to 1.0 values)
* @returns {Array<Float>} colors
*/
StormEngineC.prototype.getAmbientColor = function() {
	return [this.stormGLContext.ambientColor.e[0], this.stormGLContext.ambientColor.e[1], this.stormGLContext.ambientColor.e[2]];
};

/**
* Set the ambient color. (0.0 to 1.0 values)
* @type Void
* @param {StormV3} color Set the ambient color through a normalized vector
*/
StormEngineC.prototype.setAmbientColor = function(vec) {
	this.stormGLContext.ambientColor = vec;
};

/**
* Making a camera takes the view
* @type Void
* @param {StormCamera} cameraNode
*/
StormEngineC.prototype.setWebGLCam = function(nodeCam) {
	if(this.defaultCamera != undefined) this.defaultCamera.usedByGLContext = false;
	
	this.defaultCamera = nodeCam;
	this.defaultCamera.usedByGLContext = true;
};

/**
* Get the current active camera
* @returns {StormCamera} cameraNode Active camera node
*/
StormEngineC.prototype.getWebGLCam = function() {
	return this.defaultCamera;
};



} else alert('Your browser does not support WebGL. Download <a href="http://www.mozilla.com/">Firefox</a> o <a href="http://www.google.es/chrome">Chrome</a>');

