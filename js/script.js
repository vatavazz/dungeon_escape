"use strict";

Physijs.scripts.worker = "js/physijs_worker.js";
Physijs.scripts.ammo = "js/ammo.js";

var clock;
var scene, camera, renderer, world;
var pLockEnabled = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var controls;
var footstep = new Audio('sfx/step.wav');
var projector = new THREE.Projector();
var time = Date.now();

initPointerLock();
init();
animate();

function init() {
  // cannon
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  var solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  var split = true;
  if (split) world.solver = new CANNON.SplitSolver(solver);
  else world.solver = solver;

  world.gravity.set(0,-10,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  var physicsMaterial = new CANNON.Material( "slipperyMaterial" );
  var physicsContactMaterial = new CANNON.ContactMaterial( physicsMaterial, physicsMaterial, 0.0, 0.3 );
  world.addContactMaterial(physicsContactMaterial);

  var playerShape = new CANNON.Sphere( 10 );
  var playerBody = new CANNON.Body({ mass: 5 });
  playerBody.addShape(playerShape);
  playerBody.position.set(0, 10, 85);
  playerBody.linearDamping = 0.98;
  world.addBody(playerBody);

  clock = new THREE.Clock();
  scene = new THREE.Scene;

	var loader = new THREE.TextureLoader();

  // light
  var ambientLight = new THREE.AmbientLight( "rgb(48, 48, 61)" );
  scene.add( ambientLight );

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	scene.add(camera);

  controls = new PointerLockControls( camera , playerBody );
  scene.add( controls.getObject() );

  createRoom1();

  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor("rgb(20, 20, 34)");

  document.body.appendChild(renderer.domElement);
  window.addEventListener( 'resize', onWindowResize, false );
}

var dt = 1/60;
function animate() {
  requestAnimationFrame(animate);
  if (controls.enabled) world.step(dt);
  controls.update( Date.now() - time );
  renderer.render( scene, camera );
  time = Date.now();
}

function createRoom1() {
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

  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  world.addBody(groundBody);

  // roof
	var roofTex = new THREE.TextureLoader().load('textures/bricks.png');
	roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
	roofTex.repeat.set(8, 8);
	var roofMat = new THREE.MeshLambertMaterial({ map: roofTex, side: THREE.DoubleSide});

  var roofGeo = new THREE.CylinderGeometry( 70, 70, 200, 32, 32, true, 0, 3.15 );
  var roofMesh = new Physijs.ConeMesh( roofGeo, roofMat );
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

  var wallShape = new CANNON.Plane();
  var wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI);
  wallBody.position.set(0, 0, 100);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, -100);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.position.set(0, 0, -100);
  world.addBody(wallBody);

  wallGeo = new THREE.PlaneGeometry(200, 100, 5, 5);
  wallGeo.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(70, 50, 0);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI/2);
  wallBody.position.set(70, 0, 0);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(-70, 50, 0);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),Math.PI/2);
  wallBody.position.set(-70, 0, 0);
  world.addBody(wallBody);

  createWall();
  createPillars();
  createTorches();
}

function createWall() {
  var geometry = new THREE.BoxGeometry( 10, 40, 40 );
  var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
  var material = new THREE.MeshLambertMaterial( { map: wallTex } );

  var halfExtents = new CANNON.Vec3(5,20,20);
  var boxShape = new CANNON.Box(halfExtents);

  var wall = new Physijs.BoxMesh( geometry, material );
  wall.position.set(30, 20, 80);
  wall.castShadow = true;
  scene.add( wall );

  var boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(30, 20, 80);
  world.add(boxBody)

  wall = new THREE.Mesh( geometry, material );
  wall.position.set(-30, 20, 80);
  wall.castShadow = true;
  scene.add( wall );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-30, 20, 80);
  world.add(boxBody)

  material = new THREE.MeshLambertMaterial( {color: "rgb(177, 177, 177)", map: wallTex } );
  wall = new THREE.Mesh( geometry, material );
  wall.rotation.y = Math.PI/2;
  wall.position.set(0, 20, -95);
  wall.castShadow = true;
  scene.add( wall );

  halfExtents = new CANNON.Vec3(20,20,5);
  boxShape = new CANNON.Box(halfExtents);
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0, 20, -95);
  world.add(boxBody)
}

function createPillars() {
  var geometry = new THREE.BoxGeometry( 10, 170, 10 );
  var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(0.5, 4);
  var material = new THREE.MeshLambertMaterial( { map: wallTex } );

  var halfExtents = new CANNON.Vec3(5,85,5);
  var boxShape = new CANNON.Box(halfExtents);

  // 1st row
  var pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(30, 85, 55);
  pillar.castShadow = true;
  scene.add( pillar );

  var boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(30, 85, 55);
  world.add(boxBody)

  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(-30, 85, 55);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-30, 85, 55);
  world.add(boxBody)

  // 2nd row
  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(30, 85, 5);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(30, 85, 5);
  world.add(boxBody)

  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(-30, 85, 5);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-30, 85, 5);
  world.add(boxBody)

  // 3rd row
  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(30, 85, -45);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(30, 85, -45);
  world.add(boxBody)

  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(-30, 85, -45);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-30, 85, -45);
  world.add(boxBody)

  // 4th row
  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(30, 85, -95);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(30, 85, -95);
  world.add(boxBody)

  pillar = new Physijs.BoxMesh( geometry, material );
  pillar.position.set(-30, 85, -95);
  pillar.castShadow = true;
  scene.add( pillar );

  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-30, 85, -95);
  world.add(boxBody)
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

function initPointerLock() {
  var element = document.body;
  if (pLockEnabled) {
    var pointerlockchange = function (event) {
      if (document.pointerLockElement === element ||
          document.mozPointerLockElement === element ||
          document.webkitPointerLockElement === element) {
        controls.enabled = true;
      } else controls.enabled = false;
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

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
