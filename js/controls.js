"use strict";

DUN.controls = function(obj, handl, element) {
  this.object = object;
  this.handlers = handlers || {};
	this.target = new THREE.Vector3(0, 0, 0);
	this.domElement = (domElement !== undefined) ? domElement : document;
  this.movement = new THREE.Vector3();

  this.pointerLockEnabled = false;
  this.mouseEnabled = true;
  this.active = true;

  this.mouseX = 0;
  this.mouseY = 0;


	var moveForward = false, moveBackward = false;
  var moveLeft = false, moveRight = false;

  this.onMouseMove = function (event) {
		function limit(a, lo, hi) { return a < lo ? lo : (a > hi ? hi : a); }
		if (!this.mouseEnabled || !this.active) return;
		if (this.pointerLockEnabled) {
			if (event.mozMovementX === 0 && event.mozMovementY === 0) return; // Firefox fires 0-movement event right after real one
			this.mouseX = event.movementX || event.webkitMovementX || event.mozMovementX || 0;
			this.mouseY = event.movementY || event.webkitMovementY || event.mozMovementY || 0;
			this.mouseX = limit(this.mouseX * 20, -600, 600);
			this.mouseY = limit(this.mouseY * 20, -600, 600);
		} else if (this.domElement === document) {
			this.mouseX = event.pageX - viewHalfX;
			this.mouseY = event.pageY - viewHalfY;
		} else {
			this.mouseX = event.pageX - this.domElement.offsetLeft - viewHalfX;
			this.mouseY = event.pageY - this.domElement.offsetTop - viewHalfY;
		}
  };

  function onKeyDown(e) {
    switch (e.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true;
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
      case 69: // e
        break;
      case 81: //q
        break;
    }
  }
  function onKeyUp(e) {
    switch(e.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
      case 69: // e
        break;
    }
  }

  this.element.addEventListener('contextmenu', function (event) { event.preventDefault(); }, false);
	this.element.addEventListener('mousemove', bind(this, this.onMouseMove), false);
	// this.element.addEventListener('mousedown', bind(this, this.onMouseDown), false);
	// this.element.addEventListener('mouseup', bind(this, this.onMouseUp), false);
	this.element.addEventListener('keydown', bind(this, this.onKeyDown), false);
  this.element.addEventListener('keyup', bind(this, this.onKeyUp), false);

}
