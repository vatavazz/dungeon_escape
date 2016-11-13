(function() {
  var clock;
  var scene, camera, renderer;
  var geometry, material, mesh;
  var havePointerLock = checkForPointerLock();
  var controls, controlsEnabled;
  var moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      sprint,
      canJump;
	var mouseMesh;
  var velocity = new THREE.Vector3();
  var projector, mouse = { x: 0, y: 0 }, INTERSECTED;

  init();
  animate();

	function addObject(objName) {
		var cube = null;
		var loader = new THREE.ObjectLoader();
		loader.load( objName, function ( o ) {
			scene.add(o);
		});
	}

  function mouseMove( event ) {

  	// calculate mouse position in normalized device coordinates
  	// (-1 to +1) for both components

  	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  }
  document.addEventListener("mousemove", mouseMove, false);

  function init() {
    initControls();
    initPointerLock();
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

		var pointer = null;

    // pointer
    var mouseGeometry = new THREE.SphereGeometry(0.005, 0, 0);
  	var mouseMaterial = new THREE.MeshBasicMaterial({ color: "rgb(255, 255, 255)" });
  	mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);
  	mouseMesh.position.z = -1.05;
  	camera.add(mouseMesh);

    // TODO raycasting

		scene.add(camera);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    // floor
    scene.add(createFloor());
		addObject('skull.json');

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(178, 225, 242)");
    document.body.appendChild(renderer.domElement);
  }

  function updateRay() {
    var vector = mouseMesh.geometry.boundingSphere.center;
  	projector.unprojectVector( vector, camera );
  	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = ray.intersectObjects( scene.children );
    if ( intersects.length > 0 )
{
  // if the closest object intersected is not the currently stored intersection object
  if ( intersects[ 0 ].object != INTERSECTED )
  {
      // restore previous intersection object (if it exists) to its original color
    if ( INTERSECTED )
      INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
    // store reference to closest object as current intersection object
    INTERSECTED = intersects[ 0 ].object;
    // store color of closest object (for later restoration)
    INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
    // set a new color for closest object
    INTERSECTED.material.color.setHex( 0xffff00 );
  }
}
else // there are no intersections
{
  // restore previous intersection object (if it exists) to its original color
  if ( INTERSECTED )
    INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
  // remove previous intersection object reference
  //     by setting current intersection object to "nothing"
  INTERSECTED = null;
}
  }

  function animate() {
    raycaster.setFromCamera( mouse, camera );
  	// calculate objects intersecting the picking ray
  	var intersects = raycaster.intersectObjects( scene.children );
  	for ( var i = 0; i < intersects.length; i++ ) {
  		intersects[ i ].object.material.color.set( 0xff0000 );
	   }

    requestAnimationFrame(animate);
    updateControls();
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

  function checkForPointerLock() {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  }

  function initPointerLock() {
    var element = document.body;
    if (havePointerLock) {
      var pointerlockchange = function (event) {
        if (document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element) {
          controlsEnabled = true;
          controls.enabled = true;
        } else {
          controls.enabled = false;
        }
      };

      var pointerlockerror = function (event) {
        element.innerHTML = 'PointerLock Error';
      };

      document.addEventListener('pointerlockchange', pointerlockchange, false);
      document.addEventListener('mozpointerlockchange', pointerlockchange, false);
      document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

      document.addEventListener('pointerlockerror', pointerlockerror, false);
      document.addEventListener('mozpointerlockerror', pointerlockerror, false);
      document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

      var requestPointerLock = function(event) {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
      };

      element.addEventListener('click', requestPointerLock, false);
    } else {
      element.innerHTML = 'Bad browser; No pointer lock';
    }
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

  $('body').append('<canvas id="radar" width="200" height="200"></canvas>');
	$('body').append('<div id="hud"><p>Health: <span id="health">100</span><br />Score: <span id="score">0</span></p></div>');
	$('body').append('<div id="credits"><p>Created by <a href="http://www.isaacsukin.com/">Isaac Sukin</a> using <a href="http://mrdoob.github.com/three.js/">Three.js</a><br />WASD to move, mouse to look, click to shoot</p></div>');

	// Set up the brief red flash that shows when you get hurt
	$('body').append('<div id="hurt"></div>');
})();
