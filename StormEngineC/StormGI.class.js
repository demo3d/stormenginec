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
/**
* @class
* @constructor
* @property {StormVoxelizator} svo
*/
StormGI = function() {
	this.svo;
	this.maxBounds = 5;    
};
/**
* Set the stormVoxelizator object and enable the GIv2 in the WebGL context
* @type Void
* @param	{StormVoxelizator} voxelizator Voxelizator object with "albedo", "position" and "normal" fillmodes enabled
*/
StormGI.prototype.setVoxelizator = function(svo) {   
	if(	svo instanceof StormVoxelizator == false ||
		svo.image3D_VoxelsColor == undefined ||
		svo.image3D_VoxelsPositionX == undefined ||
		svo.image3D_VoxelsPositionY == undefined ||
		svo.image3D_VoxelsPositionZ == undefined ||
		svo.image3D_VoxelsNormal == undefined) {
			alert("You must select a voxelizator object with albedo,position and normal fillmodes enabled.");
			return false;
	}
	stormEngineC.setStatus({id:'gi', str:'PROCESSING GI'});
	this.svo = svo;
	stormEngineC.setWebGLGI(this);
	stormEngineC.setStatus({id:'gi', str:''});
};

/**
* Stop GI on camera move
* @type Void
* @param {Bool} [stop=true]
*/
StormGI.prototype.stopOncameramove = function(stop) {
	stormEngineC.stormGLContext.GIstopOncameramove = stop;
};

/**
* Enable GI
* @type Void
*/
StormGI.prototype.enable = function() {
	stormEngineC.stormGLContext.GIv2enable = true;
};

/**
* Disable GI
* @type Void
*/
StormGI.prototype.disable = function() {
	stormEngineC.stormGLContext.GIv2enable = false;
};

/**
* Set max bounds
* @param {Int} [maxbounds=5]
*/
StormGI.prototype.setMaxBounds = function(maxbounds) {
	this.maxBounds = (maxbounds != undefined) ? maxbounds : 5; 
};