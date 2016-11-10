var vertexShaderText =
[
	'precision mediump float;',
	'',
	'attribute vec3 vertPosition;',
	'attribute vec3 vertColor;',
	'varying vec3 fragColor;',
	'uniform mat4 mWorld;',
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'',
	'void main()',
	'{',
	'	fragColor = vertColor;',
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
	'}'
].join('\n');

var fragmentShaderText =
[
	'precision mediump float;',
	'',
	'varying vec3 fragColor;',
	'void main()',
	'{',
	'	gl_FragColor = vec4(fragColor, 1.0);',
	'}'
].join('\n');

function InitDemo() {
	var canvas = document.getElementById('game-surface');
	var gl = canvas.getContext('webgl');

	//canvas.width = window.innerWidth;
	//canvas.height = window.innerHeight;

	gl.clearColor(0.7, 0.8, 0.85, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// enable depth = only draw closest to camera
	gl.enable(gl.DEPTH_TEST);
	// optimisation = dont draw behind front elements
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW);
	gl.cullFace(gl.BACK);

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	gl.compileShader(fragmentShader);
	// shader error checking
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
			return;
		}
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	// if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { console.log(gl.getProgramInfoLog(program)); }
	gl.validateProgram(program);

	//
	// create buffer
	//
	var boxVertices =
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	var boxIndices =
	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	var boxVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
	gl.vertexAttribPointer(
		positionAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT,
		0
	);

	gl.vertexAttribPointer(
		colorAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		6 * Float32Array.BYTES_PER_ELEMENT,
		3 * Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	gl.useProgram(program);

	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);
	mat4.identity(worldMatrix);
	mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	//
	// render
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);

	var rotateX = new Float32Array(16);
	var rotateY = new Float32Array(16);

	var angle = 0;
	var loop = function() {
		angle = performance.now() / 6000 * (2 * Math.PI);
		mat4.rotate(rotateY, identityMatrix, angle, [0,1,0]);
		mat4.rotate(rotateX, identityMatrix, angle/4, [1,0,0]);
		mat4.mul(worldMatrix, rotateY, rotateX);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.7, 0.8, 0.85, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

};
