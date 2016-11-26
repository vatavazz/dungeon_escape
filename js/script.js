// TODO secret corridor
// TODO integrate torch puzzle
// TODO skeleton fight


var scene, camera, renderer, world;
var player;
var pLockEnabled = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

var controls;
var footstep = new Audio('sfx/step.wav');
var time = Date.now();
var ais = [];

var clock;
initPointerLock();
init();
animate();

function init() {
  initWorld();
  clock = new THREE.Clock();
  scene = new THREE.Scene;
  createRoom1(true);

  // renderer
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor("rgb(162, 162, 208)");

  document.body.appendChild(renderer.domElement);
  window.addEventListener( 'resize', onWindowResize, false );
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
  controls.update( Date.now() -  time );
  for (var i = 0; i < ais.length; i++) {
    ais[i].update( Date.now() -  time );
  }
  // createRoom3.update( Date.now() - time );
  renderer.render( scene, camera );
  time = Date.now();
}

var container = document.getElementById( 'container' );
function initPointerLock() {
  var element = document.body;
  if (pLockEnabled) {
    var pointerlockchange = function (event) {
      if (document.pointerLockElement === element ||
          document.mozPointerLockElement === element ||
          document.webkitPointerLockElement === element) {
        controls.enabled = true;
        container.style.display = 'none';
      } else {
        controls.enabled = false;
        container.style.display = '-webkit-box';
        container.style.display = '-moz-box';
        container.style.display = 'box';
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

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
