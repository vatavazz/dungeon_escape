
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
		switch (e.keyCode) {
			case 37:
				cube.translateX(0.05);
			break;
			case 38:
				cube.translateY(0.05);
			break;
			case 39:
				cube.translateX(-0.05);
			break;
			case 40:
				cube.translateY(-0.05);
			break;
		}
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
