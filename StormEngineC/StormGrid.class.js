/**
* @class
* @constructor
* @augments StormGrid
  
* @property {String} objectType
*/
StormGrid = function() { StormNode.call(this); 
	this.objectType = 'grid';
	
	this.gridEnabled = true;
	
	this.size = 100.0;
	this.separation = 1.0; // separation in meters
	this.gridColor = $V3([0.3,0.3,0.3]);
	this.arrayLines = [];
	
	
	this.stormGL = stormEngineC.stormGLContext;
	this.gl = this.stormGL.gl;
	
	this.vertexBuffer = this.gl.createBuffer();	
	this.vertexLocBuffer = this.gl.createBuffer();	
	this.indexBuffer = this.gl.createBuffer();
};
StormGrid.prototype = Object.create(StormNode.prototype);

/**
* Show the grid
* @type Void
* @param {Float} [separation=1.0] separation of the grid
*/
StormGrid.prototype.generate = function(gridsize, separation) {  
	this.gridEnabled = true;
	
	this.size = (gridsize != undefined) ? gridsize : this.size;
	this.separation = (separation != undefined) ? separation : this.separation;
	
	this.countLines = (this.size/this.separation)+1;
	this.countLines *= 2;
	
	var startX = -(this.size/2);
	var endX = (this.size/2);
	
	var startZ = -(this.size/2);
	var endZ = (this.size/2);	
	
	var currentX = startX;
	var currentZ = startZ;
	
	
	// generate lines for the grid
	var linesVertexArray = [];
	var linesVertexLocArray = [];
	var linesIndexArray = [];
	this.id = 0;
	for(var n = 0, f = this.countLines; n < f; n++) {
		
		
		if(currentZ <= endZ) {
			// generate lines in Z
			linesVertexArray.push(	startX, 0.0, currentZ,
									endX, 0.0, currentZ);	
			
			currentZ += this.separation;
		} else {
			// generate lines in X
			linesVertexArray.push(	currentX, 0.0, startZ,
									currentX, 0.0, endZ);
				
			currentX += this.separation;
		}
		
		linesVertexLocArray.push(this.gridColor.e[0], this.gridColor.e[1], this.gridColor.e[2],
								this.gridColor.e[0], this.gridColor.e[1], this.gridColor.e[2]);
		linesIndexArray.push(this.id, this.id+1);
		
		this.id += 2;
	}
	
	// generate lines for axis
	// X
	linesVertexArray.push(	0.0, 0.0, 0.0,
							10.0, 0.0, 0.0);
	linesVertexLocArray.push(1.0, 0.0, 0.0,
							1.0, 0.0, 0.0);
	linesIndexArray.push(this.id, this.id+1);
	this.id += 2;
	
	// Y
	linesVertexArray.push(	0.0, 0.0, 0.0,
							0.0, 10.0, 0.0);
	linesVertexLocArray.push(0.0, 1.0, 0.0,
							0.0, 1.0, 0.0);
	linesIndexArray.push(this.id, this.id+1);
	this.id += 2;
	
	// Z
	linesVertexArray.push(	0.0, 0.0, 0.0,
							0.0, 0.0, 10.0);
	linesVertexLocArray.push(0.0, 0.0, 1.0,
							0.0, 0.0, 1.0);
	linesIndexArray.push(this.id, this.id+1);

	
	// make opengl buffers
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexArray), this.gl.STATIC_DRAW);
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexLocBuffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linesVertexLocArray), this.gl.STATIC_DRAW);
	
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(linesIndexArray), this.gl.STATIC_DRAW);
};

/**
* Hide the grid
* @type Void
*/
StormGrid.prototype.hide = function() {  
	this.gridEnabled = false;
};

/**
* Show the grid
* @type Void
*/
StormGrid.prototype.show = function() {  
	this.gridEnabled = true;
};

/**
* Check if grid is enabled
* @returns {Bool}
*/
StormGrid.prototype.isEnabled = function() {  
	return this.gridEnabled;
};

/**
* Hide the grid
* @type Void
*/
StormGrid.prototype.render = function() {  
	if(this.stormGL.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	} else {
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.stormGL.fBuffer); 
		this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.stormGL.textureObject_DOF, 0);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFunc(this.gl.ONE_MINUS_DST_COLOR, this.gl.ONE);
	}
	this.gl.useProgram(this.stormGL.shader_Lines);
	
	this.gl.uniformMatrix4fv(this.stormGL.u_Lines_PMatrix, false, stormEngineC.defaultCamera.mPMatrix.transpose().e);
	this.gl.uniformMatrix4fv(this.stormGL.u_Lines_cameraWMatrix, false, stormEngineC.defaultCamera.MPOS.transpose().e);
	
	
	this.gl.enableVertexAttribArray(this.stormGL.attr_Lines_pos);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
	this.gl.vertexAttribPointer(this.stormGL.attr_Lines_pos, 3, this.gl.FLOAT, false, 0, 0);
	
	this.gl.enableVertexAttribArray(this.stormGL.attr_Lines_posLoc);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexLocBuffer);
	this.gl.vertexAttribPointer(this.stormGL.attr_Lines_posLoc, 3, this.gl.FLOAT, false, 0, 0);

	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	
	
	//this.gl.drawArrays(this.gl.LINES, 0, this.lines.length*2);
	this.gl.drawElements(this.gl.LINES, (this.countLines*2)+(3*2), this.gl.UNSIGNED_SHORT, 0);
	
	
	if(this.stormGL.view_SceneNoDOF || stormEngineC.defaultCamera.DOFenable == false) {
	} else {
		//this.gl.disable(this.gl.BLEND);
	}
};
