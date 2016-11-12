// QUICK FINDING CHEATSHEET
// camera view (adjust camera position)
// rotation
// translation
// events (user interaction)
// touchscreen support
// !IMPROVE (stuff to imrpove n fix)

function initialise() {
	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var cube = null;
	var loader = new THREE.ObjectLoader();
	loader.load( './skull.json', function ( object ) {
		cube = object;
		scene.add( cube );
		cube.rotation.y = 3.2;
		cube.rotation.x = 0.5;
	});

	camera.position.z = 13;

	var drag = false;
	var old_x;
	var old_y;
	var dX = 0;
	var dY = 0;
	var mouseDown = function(e) {
		// prevent other click functions from being executed
		e.preventDefault();
		drag = true;
		old_x = e.pageX;
		old_y = e.pageY;
		return false;
	};
	var mouseUp = function(e) { drag = false; };
	var mouseMove = function(e) {
		if (!drag) return false;
		dX = (e.pageX-old_x)*2*Math.PI/window.innerWidth,
		dY = (e.pageY-old_y)*2*Math.PI/window.innerHeight;
		cube.rotation.x += dY;
		cube.rotation.y += dX;
		old_x = e.pageX, old_y = e.pageY;
		e.preventDefault();
	};
	var keyPress = function(e) {
		if (e.keyCode == 37) { // left
			cube.translateX(-0.05); }
		if (e.keyCode == 38) { // up
			cube.translateY(0.05); }
		if (e.keyCode == 39) { // right
			cube.translateX(0.05); }
		if (e.keyCode == 40) { // down
			cube.translateY(-0.05); }
	}
	var mouseWheel = function(e) {
		if (e.deltaY > 0) { cube.scale.add(new THREE.Vector3(0.1, 0.1, 0.1)); }
		if (e.deltaY < 0) { cube.scale.sub(new THREE.Vector3(0.1, 0.1, 0.1)); }
	}

	document.addEventListener("mousedown", mouseDown, false);
	document.addEventListener("mouseup", mouseUp, false);
	document.addEventListener("mouseout", mouseUp, false);
	document.addEventListener("mousemove", mouseMove, false);
	document.addEventListener("keydown", keyPress, false);
	document.addEventListener("wheel", mouseWheel);

	var render = function () {
		// draws scene 60 times per second
		requestAnimationFrame( render );

		renderer.render(scene, camera);
	};

	render();
};
