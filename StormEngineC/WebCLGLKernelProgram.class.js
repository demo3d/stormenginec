/** 
* WebCLGLKernelProgram Object
* @class
* @constructor
*/
function WebCLGLKernelProgram(gl, sv, sf, in_values) { 
	this.gl = gl;
	this.utils = new WebCLGLUtils();
	
	this.kernel = this.gl.createProgram();
	this.utils.createShader(this.gl, "WEBCLGL", sv, sf, this.kernel);
	//console.log(sourceF);	
	
	this.samplers = []; // {location,value}
	this.uniforms = []; // {location,value}
	this.attr_VertexPos = this.gl.getAttribLocation(this.kernel, "aVertexPosition");
	this.attr_TextureCoord = this.gl.getAttribLocation(this.kernel, "aTextureCoord");	

	for(var n = 0, f = in_values.length; n < f; n++) {
		if(in_values[n].type == 'buffer_float4' || in_values[n].type == 'buffer_float') {
			this.samplers.push({location:[this.gl.getUniformLocation(this.kernel, in_values[n].name)],
								value:in_values[n].value});
			
			in_values[n].idPointer = this.samplers.length-1;
		} else if(in_values[n].type == 'float') {
			this.uniforms.push({location:this.gl.getUniformLocation(this.kernel, in_values[n].name),
									value:in_values[n].value});
			
			in_values[n].idPointer = this.uniforms.length-1;
		}
	}
};