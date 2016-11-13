(function() {
  var clock;
  var scene, camera, renderer;
  var geometry, material, mesh;
  var controls, controlsEnabled;
  var moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      sprint,
      canJump;
	var mouseMesh;
  var MOVESPEED = 200;
  var controls;
  var velocity = new THREE.Vector3();
  var mouse = { x: 0, y: 0 };

  init();
  animate();

	function addObject(objName) {
		var cube = null;
		var loader = new THREE.ObjectLoader();
		cube = loader.load( objName, function ( o ) {
			scene.add(o);
		});
	}

  function mouseMove( event ) {
  	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  document.addEventListener("mousemove", mouseMove, false);

  function init() {
    //initControls();

    projector = new THREE.Projector();

    clock = new THREE.Clock();
    scene = new THREE.Scene();

		var loader = new THREE.TextureLoader();
		var texture = loader.load( 'wall.jpg' );
		var backgroundMesh = new THREE.Mesh(  new THREE.PlaneGeometry(2048, 2048),
                                          new THREE.MeshBasicMaterial({map: texture}));

		backgroundMesh.material.depthTest = false;
		backgroundMesh.material.depthWrite = false;

    //scene.fog = new THREE.Fog("rgb(178, 225, 242)", 0, 750);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.y = 10;
    scene.add(camera);

    controls = new THREE.FirstPersonControls(camera);
  	controls.movementSpeed = 200; // How fast the player can walk around
  	controls.lookSpeed = 1;
  	controls.lookVertical = false;
  	controls.noFly = true;


    // TODO raycasting



    // floor
    scene.add(createFloor());

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(178, 225, 242)");
    document.body.appendChild(renderer.domElement);
  }

  function updateRay() {}

  function animate() {
    requestAnimationFrame(animate);
    var delta = clock.getDelta();
	controls.update(delta); // Move camera
    //updateControls();
    updateRay();
    renderer.render(scene, camera);
  }

  function createFloor() {
    geometry = new THREE.PlaneGeometry(2000, 2000, 5, 5);
		geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI/2));
		var texture = new THREE.TextureLoader().load('wall.jpg');
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(16, 16);
		material = new THREE.MeshBasicMaterial({ color: "rgb(255, 255, 255)", map: texture});
	  return new THREE.Mesh(geometry, material);
  }

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
      case 32: // space
        if (canJump === true) velocity.y += 250;
        canJump = false;
        break;
      case 16: // shift
        sprint=true;
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
      case 16: // shift
        sprint = false;
        break;
    }
  }

  function initControls() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);
  }

  function updateControls() {
    if (controlsEnabled) {
      var delta = clock.getDelta();
      var walkingSpeed = 200.0;
      if (sprint) walkingSpeed += 400;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 100.0 * delta;

      if (moveForward) velocity.z -= walkingSpeed * delta;
      if (moveBackward) velocity.z += walkingSpeed * delta;

      if (moveLeft) velocity.x -= walkingSpeed * delta;
      if (moveRight) velocity.x += walkingSpeed * delta;

      controls.getObject().translateX(velocity.x * delta);
      controls.getObject().translateY(velocity.y * delta);
      controls.getObject().translateZ(velocity.z * delta);

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }
    }
  }


})();
