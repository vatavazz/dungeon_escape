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
  var velocity = new THREE.Vector3();
  var INTERSECTED;
  var selObj = null;
  var vPrev = new THREE.Vector3();

  init();
  animate();

  function init() {
    initControls();
    initPointerLock();
    projector = new THREE.Projector();

    clock = new THREE.Clock();
    scene = new THREE.Scene();

		var tLoader = new THREE.TextureLoader();
		var texture = tLoader.load( 'wall.jpg' );
		var backgroundMesh = new THREE.Mesh(  new THREE.PlaneGeometry(2048, 2048),
                                          new THREE.MeshBasicMaterial({map: texture}));

		backgroundMesh.material.depthTest = false;
		backgroundMesh.material.depthWrite = false;

    scene.fog = new THREE.Fog("rgb(20, 20, 34)", 0, 750);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

		scene.add(camera);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    // floor
    scene.add(createFloor());

		//addObject('skull.json');

    var loader = new THREE.ObjectLoader();
    var jLoader = new THREE.JSONLoader();
    var jObj;
    $.ajax({
      url: 'skull.json',
      async: false,
      dataType: 'json',
      success: function (response) {
        jObj = response;
      }
    });

    var skull = loader.parse(jObj);
    skull.position.z = 50;
    scene.add(skull);

    var geometry = new THREE.BoxGeometry( 6, 6, 6 );
		var material = new THREE.MeshLambertMaterial( { map: new THREE.TextureLoader().load('floor.jpg') } );
		var cube = new THREE.Mesh( geometry, material );
    cube.position.z = -50;
    cube.position.y = 3;
		scene.add( cube );

    var sphere =  new THREE.Mesh( new THREE.SphereGeometry(3,16,16),
                  new THREE.MeshLambertMaterial( {color: "rgb(221, 28, 28)" } ));
    scene.add(sphere);

    for (var i in scene.children) {
      //console.log(scene.children[i]);
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(20, 20, 34)");
    document.body.appendChild(renderer.domElement);
  }

  // TODO
  function checkCollision() {
    return false;
  }

  function updateRay() {
    var dir = new THREE.Vector3();
    controls.getDirection(dir);
    dir.normalize();

    var ray = new THREE.Raycaster();
    ray.set( controls.getObject().position, dir );
    var intersects = ray.intersectObjects(scene.children, true );
    if (intersects.length > 1) //console.log(scene.children);

  	if ( intersects.length >  0 && intersects[0].object.geometry.type != 'PlaneGeometry' ) {
  		if ( intersects[ 0 ].object != INTERSECTED )	{
  			// if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
  			INTERSECTED = intersects[ 0 ].object;
  			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
        //if ( INTERSECTED && !selObj ) INTERSECTED.originalHex = INTERSECTED.currentHex;
  			INTERSECTED.material.color.setHex( 0x6bdae9 );
  		}
  	}
  	else {
  		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
  		INTERSECTED = null;
  	}
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!vPrev) controls.getDirection(vPrev);
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
        } else { controls.enabled = false; }
      };

      var pointerlockerror = function (event) { element.innerHTML = 'PointerLock Error'; };

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

  function clicked(e) {
    //alert("hello");
  }

  window.addEventListener("click",clicked);

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
        if (canJump === true) velocity.y += 100;
        canJump = false;
        break;
      case 16: // shift
        sprint=true;
        break;
        case 69: // e
          if (INTERSECTED !== null) {
            selObj = INTERSECTED;
            selObj.pickedUp = true;
          }
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
      case 69: // e
        if (INTERSECTED !== null) {
          selObj.pickedUp = false;
        }
        break;
    }
  }

  function pickUpObject (o) {
    selObj = o;

    var pos = new THREE.Vector3();
    pos = controls.getObject().position;
    var dir = new THREE.Vector3();
    controls.getDirection(dir);

    selObj.material.color.setHex( 0xe4326d );
    selObj.position.x = dir.x+pos.x;
    selObj.position.y = dir.y+pos.y;
    if (dir.z > 0) selObj.position.z = dir.z+pos.z+10;
    if (dir.z < 0) selObj.position.z = dir.z+pos.z-10;
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
      if (sprint) walkingSpeed = 600;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 25.0 * delta;

      if (moveForward) velocity.z -= walkingSpeed * delta;
      if (moveBackward) velocity.z += walkingSpeed * delta;

      if (moveLeft) velocity.x -= walkingSpeed * delta;
      if (moveRight) velocity.x += walkingSpeed * delta;

      // TODO
      if (checkCollision) {
        // collision checking
      }

      controls.getObject().translateX(velocity.x * delta);
      controls.getObject().translateY(velocity.y * delta);
      controls.getObject().translateZ(velocity.z * delta);

      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }

      // FIXME interaction
      if (selObj && selObj.pickedUp) {
          //camera.add(selObj);
        var pos = new THREE.Vector3();
        pos = controls.getObject().position;
        var dir = new THREE.Vector3();
        controls.getDirection(dir);
        var vCurr = new THREE.Vector3();
        controls.getDirection(vCurr);
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(vPrev, vCurr);
        controls.getDirection(vPrev);

        selObj.position = selObj.position.addVectors(dir.multiplyScalar(15),pos).applyQuaternion(quat);

        // TODO rotate cube along with camera
      }
      if (selObj && !selObj.pickedUp) {
        selObj.material.color.setHex( INTERSECTED.originalHex );
        selObj.position.y = 3;
        selObj = null;
      }
    }
  }

})();
