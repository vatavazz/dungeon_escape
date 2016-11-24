// TODO create more levels (2-3 more)
// TODO ad object interaction
// TODO shoot projectile
// TODO torch puzzle
// TODO bridge

var clock = new THREE.Clock();
var scene, camera, renderer, world;
var player;
var pLockEnabled = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var controls;
var footstep = new Audio('sfx/step.wav');
var time = Date.now();

var lvl = 1;

initPointerLock();
init();
animate();

function init() {
  initWorld();
  createScene();
  createRoom1(world, scene);

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor("rgb(20, 20, 34)");

  document.body.appendChild(renderer.domElement);
  window.addEventListener( 'resize', onWindowResize, false );
}

function createScene() {
  scene = new THREE.Scene;

  // player object
  var playerShape = new CANNON.Sphere( 10 );
  var player = new CANNON.Body({ mass: 5 });
  player.addShape(playerShape);
  player.position.set(0, 10, 85);
  player.linearDamping = 0.98;
  world.addBody(player);

  var ambientLight = new THREE.AmbientLight( "rgb(48, 48, 61)" );
  scene.add( ambientLight );

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	scene.add(camera);

  controls = new PointerLockControls( camera , player );
  scene.add( controls.getObject() );
}

function initWorld() {
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  var solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);

  world.gravity.set(0,-100,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  var physicsMaterial = new CANNON.Material( "slipperyMaterial" );
  var physicsContactMaterial = new CANNON.ContactMaterial( physicsMaterial, physicsMaterial, 0.0, 0.3 );
  world.addContactMaterial(physicsContactMaterial);
}

var dt = 1/60;
function animate() {
  requestAnimationFrame(animate);
  if (controls.enabled) world.step(dt);
  controls.update( Date.now() - time );
  renderer.render( scene, camera );
  time = Date.now();
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

//     player.addEventListener("collide",function(e){
//       if (e.body.name == "levelEnd") {
//         console.log("next level!");
//         lvl++;
//         switch (lvl) {
//           case 2:
//             createRoom2(world, scene);
//             break;
//           case 3:
//             createRoom3(world, scene);
//             break;
//         }
//         // destroy scene, destroy world
//         initWorld();
//         createScene();
//       }
// });
