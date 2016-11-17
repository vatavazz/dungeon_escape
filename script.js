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
  var selected = false;
  var vPrev = new THREE.Vector3();

  var pewpew = new Audio('pew.mp3');
  pewpew.preload = true;

  var projectileMaterial = new THREE.MeshBasicMaterial({color: "rgb(0, 215, 67)"});
  var projectileGeo = new THREE.SphereGeometry(0.5,8,8);
  var projectiles = [];

  var evilGeo = new THREE.BoxGeometry( 6, 6, 6 );
  var evilMat = new THREE.MeshBasicMaterial( { color:"rgb(99, 58, 124)" } );
  var enemies = [];

  function shootProj(o) {
    var projectile = new THREE.Mesh(projectileGeo, projectileMaterial);
    projectile.position.set(o.position.x, o.position.y, o.position.z);
    projectile.direction = new THREE.Vector3();
    projectile.dist = 0;
    controls.getDirection(projectile.direction);
    scene.add(projectile);
    pewpew.play();
    projectiles.push(projectile);
    return projectile;
  }

  function moveProj() {
    for (var i in projectiles) {
      if (projectiles[i].dist < 50) {
        projectiles[i].position.addVectors(projectiles[i].position, projectiles[i].direction);
        projectiles[i].dist += 1;
      } else scene.remove(projectiles[i]);
    }
  }

  init();
  spawnEnemy(0,-50);
  animate();

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

    scene.fog = new THREE.Fog("rgb(20, 20, 34)", 0, 750);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);

		scene.add(camera);

    controls = new THREE.PointerLockControls(camera);
    scene.add(controls.getObject());

    // floor
    scene.add(createFloor());

    // var loader = new THREE.ObjectLoader();
    // var jLoader = new THREE.JSONLoader();
    // var jObj;
    // $.ajax({
    //   url: 'skull.json',
    //   async: false,
    //   dataType: 'json',
    //   success: function (response) {
    //     jObj = response;
    //   }
    // });

    // var skull = loader.parse(jObj);
    // skull.position.z = 50;
    // scene.add(skull);

    // var sphere =  new THREE.Mesh( new THREE.SphereGeometry(3,16,16),
    //               new THREE.MeshLambertMaterial( {color: "rgb(221, 28, 28)" } ));
    // sphere.position.y = 3;
    // scene.add(sphere);
    //
    // var geometry = new THREE.BoxGeometry( 6, 6, 6 );
		// var material = new THREE.MeshBasicMaterial( { map: new THREE.TextureLoader().load('floor.jpg') } );
		// var cube = new THREE.Mesh( geometry, material );
    // cube.position.z = -50;
    // cube.position.y = 3;
		// scene.add( cube );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("rgb(20, 20, 34)");
    document.body.appendChild(renderer.domElement);
  }

  function updateRay() {
    var dir = new THREE.Vector3();
    controls.getDirection(dir);
    dir.normalize();

    var ray = new THREE.Raycaster();
    ray.set( controls.getObject().position, dir );
    var intersects = ray.intersectObjects(scene.children, true );

  	if ( intersects.length >  0 && intersects[0].object.geometry.type != 'PlaneGeometry' ) {
  		if ( intersects[ 0 ].object != INTERSECTED )	{
  			INTERSECTED = intersects[ 0 ].object;
  			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
  			INTERSECTED.material.color.setHex( 0x6bdae9 );
  		}
    } else {
  		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
  		INTERSECTED = null;
  	}
  }

  function animate() {
    requestAnimationFrame(animate);
    if (!vPrev) controls.getDirection(vPrev);
    updateControls();
    updateRay();
    moveEnemy();
    moveProj();
    renderer.render(scene, camera);
  }

  function spawnEnemy(x, z) {
    var enemy = new THREE.Mesh( evilGeo, evilMat );
    enemy.direction = -1;
    enemy.dist = 0;
    enemy.position.y = 3;
    enemy.position.z = z;
    enemy.position.x = x;
    scene.add(enemy);
    enemies.push(enemy);
    return enemy;
  }

  function moveEnemy() {
    for (var i in enemies) {
      if (enemies[i].dist == 50 || enemies[i].dist === 0) {
        enemies[i].direction *= -1;
      }
      enemies[i].position.z += enemies[i].direction*0.5;
      enemies[i].dist += enemies[i].direction*0.5;
    }
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
    // raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 2);
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

      // TODO check collision

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
        selObj.position.y = 3;
        selObj = null;
      }
    }
  }

})();
