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

/*
StormM16.rotation
Copyright (C) 2007 James Coglan Sylvester.js

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
*/

/*
StormM16.inverse
Copyright (C) 2004 - Geotechnical Software Services
 
This code is free software; you can redistribute it and/or
modify it under the terms of the GNU Lesser General Public 
License as published by the Free Software Foundation; either 
version 2.1 of the License, or (at your option) any later version.

This code is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public 
License along with this program; if not, write to the Free 
Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, 
MA  02111-1307, USA.
*/

// En la version Min quedan eliminados: comments, \t+, \r\n+, espacios+ (menos return, new y var)
/*
 * VECTOR3
 */
StormV3 = function(elements) {
	this.e = new Float32Array(elements);
};

StormV3.prototype.add = function(stormV3) {

    return $V3([ this.e[0] + stormV3.e[0], this.e[1] + stormV3.e[1], this.e[2] + stormV3.e[2] ]);
};

StormV3.prototype.cross = function(stormV3) {
	
	return $V3([ this.e[1] * stormV3.e[2] - this.e[2] * stormV3.e[1], this.e[2] * stormV3.e[0] - this.e[0] * stormV3.e[2], this.e[0] * stormV3.e[1] - this.e[1] * stormV3.e[0] ]);
};

StormV3.prototype.distance = function(stormV3) {
	
	return Math.sqrt( (this.e[0] - stormV3.e[0]) * (this.e[0] - stormV3.e[0]) + (this.e[1] - stormV3.e[1]) * (this.e[1] - stormV3.e[1]) + (this.e[2] - stormV3.e[2]) * (this.e[2] - stormV3.e[2]) );
};

StormV3.prototype.dot = function(stormV3) {
		
	return this.e[0]*stormV3.e[0] + this.e[1]*stormV3.e[1] + this.e[2]*stormV3.e[2];
};

StormV3.prototype.equal = function(stormV3) {
	
	return (this.e[0] == stormV3.e[0])&&(this.e[1] == stormV3.e[1])&&(this.e[2] == stormV3.e[2]);
};

StormV3.prototype.modulus = function() {
	
	return Math.sqrt(this.sumComponentSqrs());
};
StormV3.prototype.sumComponentSqrs = function() {
	var V3 = this.sqrComponents();
	
	return V3[0] + V3[1] + V3[2];
};
StormV3.prototype.sqrComponents = function(){
	var V3 = new Float32Array(3);
	V3.set([ this.e[0] * this.e[0], this.e[1] * this.e[1], this.e[2] * this.e[2] ]);
	
	return V3;
};

StormV3.prototype.x = function(floatVal) {
	
	return $V3([this.e[0] * floatVal, this.e[1] * floatVal, this.e[2] * floatVal]);
};

StormV3.prototype.reflect = function(stormV3) {
	var I = $V3([this.e[0], this.e[1], this.e[2]]);
	var N = $V3([stormV3.e[0], stormV3.e[1], stormV3.e[2]]);
	
	var vec = N.x(this.dot(N, I));
	vec = vec.x(2.0);
	vec = I.subtract(vec);
	

	return vec;
};

StormV3.prototype.subtract = function(stormV3) {
	
	return $V3([this.e[0] - stormV3.e[0], this.e[1] - stormV3.e[1], this.e[2] - stormV3.e[2]]);
};

StormV3.prototype.normalize = function() {
	var inverse = 1.0 / this.modulus();
	
	return $V3([this.e[0] * inverse, this.e[1] * inverse, this.e[2] * inverse]);
};

createV3 = function(elements) {
	return new StormV3(elements);
};
var $V3 = createV3;




/*
 * MATRIX16
 */
// StormM16.prototype.x
var kernelSrc_X = 	'__kernel void kernelX(__global float* A, __global float* B, __global float* C, unsigned int w) {'

	   +'int tx = get_local_id(0);'
	   +'int ty = get_local_id(1);'

	   +'float value = 0;'
	   +'for (int k = 0; k < w; ++k) {'
	      +'float elementA = A[ty * w + k];'
	      +'float elementB = B[k * w + tx];'
	      +'value += elementA * elementB;'
	   +'}'

	   +'C[ty * w + tx] = value;'
					+'}';
var clProgram_X = clContext.createProgramWithSource(kernelSrc_X);
try {
	clProgram_X.buildProgram([clDevices[0]], "");
} catch(e) {
    alert("Failed to build WebCL program. Error "+clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_STATUS)+":  "+ clProgram_X.getProgramBuildInfo(clDevices[0], WebCL.CL_PROGRAM_BUILD_LOG));
    throw e;
}
var clKernel_X = clProgram_X.createKernel("kernelX");


var bufferSize16 = 16 * Float32Array.BYTES_PER_ELEMENT; // 16*4
var clMemoryBuffer_X_In1 = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, bufferSize16);
var clMemoryBuffer_X_In2 = clContext.createBuffer(WebCL.CL_MEM_READ_ONLY, bufferSize16);
var clMemoryBuffer_X_Out = clContext.createBuffer(WebCL.CL_MEM_WRITE_ONLY, bufferSize16);

clKernel_X.setKernelArg(0, clMemoryBuffer_X_In1);    
clKernel_X.setKernelArg(1, clMemoryBuffer_X_In2);
clKernel_X.setKernelArg(2, clMemoryBuffer_X_Out);
clKernel_X.setKernelArg(3, 4, WebCL.types.UINT);

var clDataObject_1 = WebCL.createDataObject();
clDataObject_1.allocate(bufferSize16);
var clDataObject_2 = WebCL.createDataObject();
clDataObject_2.allocate(bufferSize16);
var outBuffer = new Float32Array(16);

StormM16 = function(elements) {
	this.e = new Float32Array(elements);
};

StormM16.prototype.x = function(stormM16) {
	
	clDataObject_1.set(this.e);
	clDataObject_2.set(stormM16.e);
	
	clCmdQueue.enqueueWriteBuffer(clMemoryBuffer_X_In1, false, 0, clDataObject_1.length, clDataObject_1, []);
	clCmdQueue.enqueueWriteBuffer(clMemoryBuffer_X_In2, false, 0, clDataObject_2.length, clDataObject_2, []);

    clCmdQueue.enqueueNDRangeKernel(clKernel_X, 2, [], [32,32], [4,4], []);
    clCmdQueue.enqueueReadBuffer(clMemoryBuffer_X_Out, false, 0, bufferSize16, clDataObject_1, []);

    clCmdQueue.finish();
    
	//var outBuffer = clDataObject_1.get(WebCL.types.FLOAT,0,0);
    
	
	utils.writeDataObjectToTypedArray(clDataObject_1, outBuffer);

    
	return $M16(outBuffer);
};

StormM16.prototype.transpose = function() {
	return $M16([
	              this.e[0],
	              this.e[4],
	              this.e[8],
	              this.e[12],
	              
	              this.e[1],
	              this.e[5],
	              this.e[9],
	              this.e[13],
	              
	              this.e[2],
	              this.e[6],
	              this.e[10],
	              this.e[14],
	              
	              this.e[3],
	              this.e[7],
	              this.e[11],
	              this.e[15]
	             ]);
};

StormM16.prototype.inverse = function() {
	var mm = $M16(this.e).transpose();
	mm.e[0] = mm.e[0]*-1.0;
	mm.e[1] = mm.e[1]*-1.0;
	mm.e[2] = mm.e[2]*-1.0;
	mm.e[3] = mm.e[3]*-1.0;
	mm.e[4] = mm.e[4]*-1.0;
	mm.e[5] = mm.e[5]*-1.0;
	mm.e[6] = mm.e[6]*-1.0;
	mm.e[7] = mm.e[7]*-1.0;
	mm.e[8] = mm.e[8]*-1.0;
	mm.e[9] = mm.e[9]*-1.0;
	mm.e[10] = mm.e[10]*-1.0;
	mm.e[11] = mm.e[11]*-1.0;
	mm.e[12] = mm.e[12]*-1.0;
	mm.e[13] = mm.e[13]*-1.0;
	mm.e[14] = mm.e[14]*-1.0;
	mm.e[15] = mm.e[15]*-1.0;
    return mm;
};

StormM16.prototype.rotation = function(theta, a) {
	var mod = a.modulus();
	var x = new Float32Array(3);
	var x = a.e[0]/mod;
	var y = a.e[1]/mod;
	var z = a.e[2]/mod;
	var s = Math.sin(theta);
	var c = Math.cos(theta);
	var t = 1 - c;
	// Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
	// That proof rotates the co-ordinate system so theta
	// becomes -theta and sin becomes -sin here.

	return $M16([
	              t*x*x + c,
	              t*x*y - s*z,
	              t*x*z + s*y,
	              0.0,
		              
	              t*x*y + s*z,
	              t*y*y + c,
	              t*y*z - s*x,
	              0.0,
		              
	              t*x*z - s*y,
	              t*y*z + s*x,
	              t*z*z + c,
	              0.0,
		              
	              0.0,
	              0.0,
	              0.0,
	              1.0
	              ]);
};

createM16 = function(elements) {
	return new StormM16(elements);
};
var $M16 = createM16;

