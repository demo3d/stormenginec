/** 
* WebCLGLBuffer Object 
* @class
* @constructor
* @property {WebGLTexture} textureData
* @property {Array<Float>} inData Original array
* @property {Int} [offset=0] offset of buffer
*/
WebCLGLBuffer = function(gl, length, type, linear) { 
	this.gl = gl;
	 
	this._floatSupport = (this.gl.getExtension('OES_texture_float')) ? true : false;
	if(this._floatSupport)
		this._supportFormat = this.gl.FLOAT;
	else
		this._supportFormat = this.gl.UNSIGNED_BYTE;
	
	this._floatLinearSupport = (this.gl.getExtension('OES_texture_float_linear')) ? true : false; 
	if(this._floatLinearSupport)
		this._supportFormat = this.gl.FLOAT;
	else
		this._supportFormat = this.gl.UNSIGNED_BYTE; 
		
	this.type = (type != undefined) ? type : 'FLOAT'; // FLOAT OR FLOAT4
	if(length instanceof Object) { 
		this.length = length[0]*length[1];
		this.W = length[0];
		this.H = length[1];
	} else {
		this.length = length;
		this.W = Math.ceil(Math.sqrt(this.length)); 
		this.H = this.W;
	}
	this.utils = new WebCLGLUtils(this.gl);
	
	this.offset = 0;
	this.linear = linear;
	
	
	this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, false);
	this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	
	this.textureData = this.gl.createTexture();
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.textureData);  
	if(this.linear != undefined && this.linear) {
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.W,this.H, 0, this.gl.RGBA, this._supportFormat, null); 
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST); 
		this.gl.generateMipmap(this.gl.TEXTURE_2D);
	} else {
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.W,this.H, 0, this.gl.RGBA, this._supportFormat, null);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);  
	} 
	
	this.inData;
	this.outArray4Uint8Array = new Uint8Array((this.W*this.H)*4); 
	this.outArrayFloat32ArrayX = [];
	this.outArrayFloat32ArrayY = [];
	this.outArrayFloat32ArrayZ = [];
	this.outArrayFloat32ArrayW = [];
	this.outArray4Float32Array = [];
	
	// FRAMEBUFFER FOR enqueueNDRangeKernel
	this.rBuffer = this.gl.createRenderbuffer();
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.rBuffer);
	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.W, this.H);
	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	
	this.fBuffer = this.gl.createFramebuffer();
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fBuffer);
	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.rBuffer);
}; 

/**
 * Remove this buffer
* @type Void
 */
WebCLGLBuffer.prototype.remove = function() {
	this.gl.deleteTexture(this.textureData);
	this.gl.deleteRenderbuffer(this.rBuffer);
	this.gl.deleteFramebuffer(this.fBuffer);
};