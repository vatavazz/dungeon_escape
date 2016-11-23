(function() {
  var clock;
  var scene, camera, renderer;
  var geometry, material, mesh;
  var pLockEnabled = checkPointerLock();
  var controls, controlsEnabled;
  var moveForward,
      moveBackward,
      moveLeft,
      moveRight,
      sprint,
      canJump;
  var velocity = new THREE.Vector3();

  init();
  animate();

  function init() {
    initControls();
    initPointerLock();

    projector = new THREE.Projector();

    clock = new THREE.Clock();
    scene = new THREE.Scene();

		var loader = new THREE.TextureLoader();

    // cool fog effect, think bedrock in minecraft
    // scene.fog = new THREE.FogExp2("rgb(0,0,0)", 0.015);

    // light
    var light = new THREE.AmbientLight( "rgb(48, 48, 61)" );
    scene.add( light );

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

		scene.add(camera);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    createRoom();

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(20, 20, 34)");
    document.body.appendChild(renderer.domElement);
  }

  function animate() {
    requestAnimationFrame(animate);
    updateControls();
    renderer.render(scene, camera);
  }

  function createRoom() {
    // floor
    var floorGeo = new THREE.PlaneGeometry(140, 200, 5, 5);
		var floorTex = new THREE.TextureLoader().load('textures/bricks.png' );
		floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
		floorTex.repeat.set(8, 8);
		var floorMat = new THREE.MeshLambertMaterial({ map: floorTex, side: THREE.DoubleSide });

	  var floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = Math.PI/2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // roof
		var roofTex = new THREE.TextureLoader().load('textures/bricks.png');
		roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
		roofTex.repeat.set(8, 8);
		var roofMat = new THREE.MeshLambertMaterial({ map: roofTex, side: THREE.DoubleSide});

    var roofGeo = new THREE.CylinderGeometry( 70, 70, 200, 32, 32, true, 0, 3.15 );
    var roofMesh = new THREE.Mesh( roofGeo, roofMat );
    roofMesh.rotation.x = Math.PI/2;
    roofMesh.rotation.y = Math.PI/2;
    roofMesh.position.set(0,100,0);
    scene.add( roofMesh );

    // walls
    var wallGeo = new THREE.PlaneGeometry(140, 170, 5, 5);
		var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
		wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
		wallTex.repeat.set(8, 8);
		var wallMat = new THREE.MeshLambertMaterial({ map: wallTex, side: THREE.DoubleSide});

    var wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 85, 100);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 85, -100);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    wallGeo = new THREE.PlaneGeometry(200, 100, 5, 5);
    wallGeo.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));

    wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(70, 50, 0);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(-70, 50, 0);
    wallMesh.receiveShadow = true;
    scene.add(wallMesh);

    createWall();
    createPillars();
    createTorches();
  }

  function createWall() {
    var geometry = new THREE.BoxGeometry( 10, 40, 40 );
    var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
    var material = new THREE.MeshLambertMaterial( { map: wallTex } );
    var wall = new THREE.Mesh( geometry, material );
    wall.position.set(30, 20, 80);
    wall.castShadow = true;
    scene.add( wall );

    wall = new THREE.Mesh( geometry, material );
    wall.position.set(-30, 20, 80);
    wall.castShadow = true;
    scene.add( wall );
  }

  function createPillars() {
    var geometry = new THREE.BoxGeometry( 10, 170, 10 );
    var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
		wallTex.repeat.set(0.5, 4);
    var material = new THREE.MeshLambertMaterial( { map: wallTex } );

    // 1st row
    var pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(30, 85, 55);
    pillar.castShadow = true;
    scene.add( pillar );

    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(-30, 85, 55);
    pillar.castShadow = true;
    scene.add( pillar );

    // 2nd row
    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(30, 85, 5);
    pillar.castShadow = true;
    scene.add( pillar );

    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(-30, 85, 5);
    pillar.castShadow = true;
    scene.add( pillar );

    // 3rd row
    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(30, 85, -45);
    pillar.castShadow = true;
    scene.add( pillar );

    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(-30, 85, -45);
    pillar.castShadow = true;
    scene.add( pillar );

    // 4th row
    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(30, 85, -95);
    pillar.castShadow = true;
    scene.add( pillar );

    pillar = new THREE.Mesh( geometry, material );
    pillar.position.set(-30, 85, -95);
    pillar.castShadow = true;
    scene.add( pillar );
  }

  function createTorches() {
    var geometry = new THREE.SphereGeometry( 1, 16, 16 );
    var material = new THREE.MeshBasicMaterial( { color: "rgb(241, 148, 61)" } );

    var light;

    // 1st row
    var torch = new THREE.Mesh( geometry, material );
    torch.position.set(25, 25, 55);
    scene.add( torch );

    torch = new THREE.Mesh( geometry, material );
    torch.position.set(-25, 25, 55);
    scene.add( torch );

    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.6, 80 );
    light.position.set( 25, 25, 55 );
    scene.add( light );
    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.6, 80 );
    light.position.set( -25, 25, 55 );
    scene.add( light );

    // 2nd row
    torch = new THREE.Mesh( geometry, material );
    torch.position.set(25, 25, 5);
    scene.add( torch );

    torch = new THREE.Mesh( geometry, material );
    torch.position.set(-25, 25, 5);
    scene.add( torch );

    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.3, 80 );
    light.position.set( 25, 25, 5 );
    scene.add( light );
    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.3, 80 );
    light.position.set( -25, 25, 5 );
    scene.add( light );

    // 3rd row
    torch = new THREE.Mesh( geometry, material );
    torch.position.set(25, 25, -45);
    scene.add( torch );

    torch = new THREE.Mesh( geometry, material );
    torch.position.set(-25, 25, -45);
    scene.add( torch );

    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.2, 80 );
    light.position.set( 25, 25, -45 );
    scene.add( light );
    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.2, 80 );
    light.position.set( -25, 25, -45 );
    scene.add( light );
  }

  function checkPointerLock() {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  }

  function initPointerLock() {
    var element = document.body;
    if (pLockEnabled) {
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
        if (canJump) velocity.y += 100;
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
      case 81: //q
        shootProj(controls.getObject());
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
        if (INTERSECTED !== null) selObj.pickedUp = false;
        break;
    }
  }

  function initControls() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
  }

  function updateControls() {
    if (controlsEnabled) {
      var delta = clock.getDelta();
      var walkSpd = 200.0;
      if (sprint) walkSpd = 600;

      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;
      velocity.y -= 9.8 * 25.0 * delta;

      if (moveForward) velocity.z -= walkSpd * delta;
      if (moveBackward) velocity.z += walkSpd * delta;
      if (moveLeft) velocity.x -= walkSpd * delta;
      if (moveRight) velocity.x += walkSpd * delta;

      controls.getObject().translateX(velocity.x * delta);
      controls.getObject().translateY(velocity.y * delta);
      controls.getObject().translateZ(velocity.z * delta);

      // out of bounds
      if (controls.getObject().position.y < 10) {
        velocity.y = 0;
        controls.getObject().position.y = 10;
        canJump = true;
      }
      //
      // if (controls.getObject().position.x < -95) {
      //   velocity.x = 0;
      //   controls.getObject().position.x = -95;
      // }
      // if (controls.getObject().position.x > 95) {
      //   velocity.x = 0;
      //   controls.getObject().position.x = 95;
      // }
      //
      // if (controls.getObject().position.z < -95) {
      //   velocity.z = 0;
      //   controls.getObject().position.z = -95;
      // }
      // if (controls.getObject().position.z > 95) {
      //   velocity.z = 0;
      //   controls.getObject().position.z = 95;
      // }
    }
  }

})();
