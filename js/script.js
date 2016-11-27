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
var playerHealth = 100;

// @kdz GLOBALS
var torches; // An array that holds all the torches in the world.
var triggers; // An array that hold all the triggers.
var heroProjectiles;
var projectileClock; // Timer that stops the player from shooting non-stop.
var keyboard;
var levelGeometry;
var disappearingObjects;
var movingObjects;
var projector = new THREE.Projector();

// @kdz Initializes global variables.
function kInit() {
    torches = new Array();
    triggers = new Array();
    heroProjectiles = new Object();
    heroProjectiles["fireballs"] = new Array();
    heroProjectiles["frostbolts"] = new Array();
    projectileClock = new THREE.Clock(false);
    keyboard = new THREEx.KeyboardState();
    levelGeometry = new THREE.Object3D();
}

// @kdz Perform actions based on keyboard input.
function getInput() {
    if(keyboard.pressed("F")) {
        shoot("fireball");
    }
    if(keyboard.pressed("E")) {
        shoot("frostbolt");
    }
    if(keyboard.pressed("Q")) {
        spawnProjectile("arrow", new THREE.Vector3(-5, 1, -5), controls.getObject().position);
    }
}

var bgm = new Audio('sfx/background.ogg');
var steps = new Audio('sfx/step.wav');
bgm.preload = 'auto';
steps.preload = 'auto';
bgm.loop = true;
bgm.play();

var clock;
kInit();
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
  for (var i = 0; i < ais.length; i++) ais[i].update( Date.now() -  time );

  // @kdz Check triggers.
    checkTriggers(); // Obviously.
    updateHeroProjectiles(Date.now() - time);
    getInput();
    checkHeroProjectileCollisions();
    updateDisappearingObjects();
    updateMovingObjects(Date.now() - time);
    checkSkeletonCollisions();

    if (playerHealth <= 0) {
      controls.enabled = false;
      var gover = document.getElementById( 'gocont' );
      gover.style.display = '-webkit-box';
      gover.style.display = '-moz-box';
      gover.style.display = 'box';
    }//show gameover screen

  renderer.render( scene, camera );
  time = Date.now();
}

var container = document.getElementById( 'container' );
var pointer = document.getElementById( 'pointer' );

var bardiv = document.getElementById( 'bar' );
var healthdiv = document.getElementById( 'health' );

function initPointerLock() {
  var element = document.body;
  if (pLockEnabled) {
    var pointerlockchange = function (event) {
      if (document.pointerLockElement === element ||
          document.mozPointerLockElement === element ||
          document.webkitPointerLockElement === element) {
        controls.enabled = true;
        container.style.display = 'none';
        // pointer.style.display = '';
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

function dealDamage(dmg) {
  playerHealth-=dmg;
  updateHealthDisplay();
  // return true if dead
  if (playerHealth <= 0) return true;
}

function updateHealthDisplay () {
  var hValue = playerHealth +"%";
  document.querySelector("#health").style.width =hValue;
}
