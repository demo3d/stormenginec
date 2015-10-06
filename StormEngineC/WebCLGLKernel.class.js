/** 
* WebCLGLKernel Object
* @class
* @constructor
*/
WebCLGLKernel = function(gl, source, header) { 
	this.gl = gl;
	var highPrecisionSupport = this.gl.getShaderPrecisionFormat(this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT);
	this.precision = (highPrecisionSupport.precision != 0) ? 'precision highp float;\n\nprecision highp int;\n\n' : 'precision lowp float;\n\nprecision lowp int;\n\n';
	
	this.utils = new WebCLGLUtils(this.gl);
	
	this.in_values = [];
	
	this.samplers = []; // {location,value}
	this.uniforms = []; // {location,value}
	if(source != undefined) this.setKernelSource(source, header); 
};

/**
* Update the kernel source 
* @type Void
* @param {String} source
* @param {String} header Additional functions
*/
WebCLGLKernel.prototype.setKernelSource = function(source, header) {
	this.head =(header!=undefined)?header:''; 
	this.in_values = [];//{value,type,name,idPointer} 
	// type: 'buffer_vec4'(RGBA channels), 'buffer_float'(Red channel), 'buffer_int'(Red channel), 'float'(uniform1f) or 'int'(uniform1i)  
	// idPointer to: this.samplers or this.uniforms (according to type)
	
	var argumentsSource = source.split(')')[0].split('(')[1].split(','); // "float* A", "float* B", "float C", "float4* D"
	//console.log(argumentsSource);
	for(var n = 0, f = argumentsSource.length; n < f; n++) {
		if(argumentsSource[n].match(/\*/gm) != null) {
			if(argumentsSource[n].match(/vec4/gm) != null || argumentsSource[n].match(/float4/gm) != null) {
				this.in_values[n] = {value:undefined,
									type:'buffer_vec4',
									name:argumentsSource[n].split('*')[1].trim()};
			} else if(argumentsSource[n].match(/float/gm) != null) {
				this.in_values[n] = {value:undefined,
									type:'buffer_float',
									name:argumentsSource[n].split('*')[1].trim()};
			} else if(argumentsSource[n].match(/int/gm) != null) {
				this.in_values[n] = {value:undefined,
									type:'buffer_int',
									name:argumentsSource[n].split('*')[1].trim()};
			}
		} else {
			if(argumentsSource[n].match(/float/gm) != null) {
				this.in_values[n] = {value:undefined,
									type:'float',
									name:argumentsSource[n].split(' ')[1].trim()};
			} else if(argumentsSource[n].match(/int/gm) != null) {
				this.in_values[n] = {value:undefined,
									type:'int',
									name:argumentsSource[n].split(' ')[1].trim()};
			}
		}
	}
	//console.log(this.in_values);
	
	//console.log('original source: '+source);
	this.source = source.replace(/\r\n/gi, '').replace(/\r/gi, '').replace(/\n/gi, '');
	this.source = this.source.replace(/^\w* \w*\([\w\s\*,]*\) {/gi, '').replace(/}(\s|\t)*$/gi, '');
	//console.log('minified source: '+this.source);
	this.source = this.parse(this.source);
	this.compile();
};
/**
* @private 
*/
WebCLGLKernel.prototype.parse = function(source) {
	//console.log(source);
	for(var n = 0, f = this.in_values.length; n < f; n++) { // for each in_values (in argument)
		var regexp = new RegExp(this.in_values[n].name+'\\[\\w*\\]',"gm"); 
		var varMatches = source.match(regexp);// "Search current "in_values.name[xxx]" in source and store in array varMatches
		//console.log(varMatches);
		if(varMatches != null) {
			for(var nB = 0, fB = varMatches.length; nB < fB; nB++) { // for each varMatches ("A[x]", "A[x]")
				var regexpNativeGL = new RegExp('```(\s|\t)*gl.*'+varMatches[nB]+'.*```[^```(\s|\t)*gl]',"gm");
				var regexpNativeGLMatches = source.match(regexpNativeGL);
				if(regexpNativeGLMatches == null) {
					var name = varMatches[nB].split('[')[0];
					var vari = varMatches[nB].split('[')[1].split(']')[0];
					var regexp = new RegExp(name+'\\['+vari.trim()+'\\]',"gm");
					
					if(this.in_values[n].type == 'buffer_vec4') 
						source = source.replace(regexp, 'buffer_vec4_data('+name+','+vari+')');
					if(this.in_values[n].type == 'buffer_float') 
						source = source.replace(regexp, 'buffer_float_data('+name+','+vari+')');
					if(this.in_values[n].type == 'buffer_int') 
						source = source.replace(regexp, 'buffer_int_data('+name+','+vari+')');
				}
			}
		}
	}
	source = source.replace(/```(\s|\t)*gl/gi, "").replace(/```/gi, "");
	//console.log('%c translated source:'+source, "background-color:#000;color:#FFF");
	return source;
};
/**
* @private 
*/
WebCLGLKernel.prototype.compile = function() {
	lines_attrs = (function() {
		str = '';
		for(var n = 0, f = this.in_values.length; n < f; n++) {
			if(this.in_values[n].type == 'buffer_vec4' || this.in_values[n].type == 'buffer_float' || this.in_values[n].type == 'buffer_int') {
				str += 'uniform sampler2D '+this.in_values[n].name+';\n';
			} else if(this.in_values[n].type == 'float') {
				str += 'uniform float '+this.in_values[n].name+';\n';
			} else if(this.in_values[n].type == 'int') {
				str += 'uniform int '+this.in_values[n].name+';\n';
			}
		}
		return str;
	}).bind(this);
	var sourceVertex = 	this.precision+
		'attribute vec3 aVertexPosition;\n'+
		'attribute vec2 aTextureCoord;\n'+
		
		'varying vec2 global_id;\n'+ 
		
		'void main(void) {\n'+
			'gl_Position = vec4(aVertexPosition, 1.0);\n'+
			'global_id = aTextureCoord;\n'+
		'}\n';
	var sourceFragment = this.precision+
		
		lines_attrs()+
		
		'varying vec2 global_id;\n'+ 
		
		'vec4 buffer_vec4_data(sampler2D arg, vec2 coord) {\n'+
			'vec4 textureColor = texture2D(arg, coord);\n'+
			'return textureColor;\n'+
		'}\n'+
		'float buffer_float_data(sampler2D arg, vec2 coord) {\n'+
			'vec4 textureColor = texture2D(arg, coord);\n'+
			'return textureColor.x;\n'+
		'}\n'+
		'int buffer_int_data(sampler2D arg, vec2 coord) {\n'+
			'vec4 textureColor = texture2D(arg, coord);\n'+
			'return int(textureColor.x);\n'+
		'}\n'+
		
		'vec2 get_global_id() {\n'+
			'return global_id;\n'+
		'}\n'+
		
		this.head+
		
		'void main(void) {\n'+
			'float out_float = -999.99989;\n'+
			'vec4 out_float4;\n'+
			
			this.source+  
			
			'if(out_float != -999.99989) gl_FragColor = vec4(out_float,0.0,0.0,1.0);\n'+
			'else gl_FragColor = out_float4;\n'+ 
		'}\n';
	this.kernel = this.gl.createProgram();
	//console.log(sourceFragment);
	this.utils.createShader("WEBCLGL", sourceVertex, sourceFragment, this.kernel);
	
	this.updatePointers();
	
	this.attr_VertexPos = this.gl.getAttribLocation(this.kernel, "aVertexPosition");
	this.attr_TextureCoord = this.gl.getAttribLocation(this.kernel, "aTextureCoord");
	
	return true;
};
/**
 * @private 
 */
WebCLGLKernel.prototype.updatePointers = function() {
	this.samplers = [];
	this.uniforms = [];
	for(var n = 0, f = this.in_values.length; n < f; n++) {
		if(this.in_values[n].type == 'buffer_vec4' || this.in_values[n].type == 'buffer_float' || this.in_values[n].type == 'buffer_int') {
			this.samplers.push({location:this.gl.getUniformLocation(this.kernel, this.in_values[n].name),
								value:this.in_values[n].value});
			this.in_values[n].idPointer = this.samplers.length-1;
		} else if(this.in_values[n].type == 'float' || this.in_values[n].type == 'int') {
			this.uniforms.push({location:this.gl.getUniformLocation(this.kernel, this.in_values[n].name),
									value:this.in_values[n].value});
			this.in_values[n].idPointer = this.uniforms.length-1;
		}
	}
};
/**
* Bind float or a WebCLGLBuffer to a kernel argument
* @type Void
* @param {Int|String} argument Id of argument or name of this
* @param {Float|Int|WebCLGLBuffer} data
*/
WebCLGLKernel.prototype.setKernelArg = function(argument, data) {
	var numArg;
	if(typeof argument != "string") {
		numArg = argument;
	} else {
		for(var n=0, fn = this.in_values.length; n < fn; n++) {
			if(this.in_values[n].name == argument) {
				numArg = n;
				break;
			}
		}
	}
	
	if(this.in_values[numArg] == undefined) {
		console.log("argument "+argument+" not exist in this kernel");
		return;
	}
	this.in_values[numArg].value = data;
	
	if(this.in_values[numArg].type == 'buffer_vec4' || this.in_values[numArg].type == 'buffer_float' || this.in_values[numArg].type == 'buffer_int') {
		this.samplers[this.in_values[numArg].idPointer].value = this.in_values[numArg].value;
	} else if(this.in_values[numArg].type == 'float' || this.in_values[numArg].type == 'int') {
		this.uniforms[this.in_values[numArg].idPointer].value = this.in_values[numArg].value;
	}
};



