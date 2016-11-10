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

	// canvas.width = window.innerWidth;
	// canvas.height = window.innerHeight;

	gl.clearColor(0.7, 0.8, 0.85, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
	var triangleVertices =
	[ // x,y						// rgb
		0, 0.5, 0,				1, 0.8, 0,
		-0.5, -0.5, 0,		0.5, 0.34, 0.9,
		0.5, -0.5, 0,			0.1, 0.7, 0.2
	];

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

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
	mat4.lookAt(viewMatrix, [0, 0, -2], [0, 0, 0], [0, 1, 0]);
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000);

	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	//
	// render
	//
	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	var loop = function() {
		angle = performance.now() / 6000 * (2 * Math.PI);
		mat4.rotate(worldMatrix, identityMatrix, angle, [1,1,1]);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		gl.clearColor(0.7, 0.8, 0.85, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

};
