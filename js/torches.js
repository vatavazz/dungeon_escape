// STRICT MODE
"use strict";

// GLOBALS
var scene;
var camera;
var renderer;
var keyboard;
var clock;
var projectileClock; // To prevent the player from shooting non-stop.
var hero;
var levelGeometry;
var projectiles;
var torches;
var testCube;
var triggers;
var disappearingObjects;
var movingObjects;

// GLOBAL CONSTS
const HERO_SPEED = 5;
const HERO_SIZE = 5;
const HERO_MAX_HEALTH = 100;
const MAGIC_SPEED = 10; // @kdzTODO: Move this to shootFireball?
const SHOOTING_INTERVAL = 1.25;

// OBJECT PROTOTYPES AND DEFINITIONS
// Trigger: object that will represent a trigger in the environment - when you walk through it, something happens!
function Trigger(position, size, behavior, oneTime, ...objects) {
    this.position = position;
    this.size = size;
    this.behavior = behavior; // Function that will determine what happens to the trigger's related objects when the player walks through it.
    this.oneTime = oneTime; // Whether the trigger works just once or is toggled on and off.
    this.objects = objects // An array of objects that will be affected by the trigger being, well, triggered.
}

Trigger.prototype.checkTrigger = function() {
    var position = this.position;
    var halfSize = this.size/2;
    var tLeft = position.x - halfSize;
    var tRight = position.x + halfSize;
    var tTop = position.z - halfSize;
    var tBottom = position.z + halfSize;
    var heroObj = hero.controls.getObject();

    if(heroObj.position.x < tLeft) return false;
    if(heroObj.position.x > tRight) return false;
    if(heroObj.position.z > tBottom) return false;
    if(heroObj.position.z < tTop) return false;
    return true;
}

// Disappearing object: if all the torches related to it are lit, it is visible and a part of the world. If any of the torches is extinguished, it disappears. Exciting!
function DisappearingObject(position, startState, physicalObject, ...torches) {
    physicalObject.position.copy(position);
    this.object = physicalObject;
    this.state = startState;
    this.torches = torches;
    if(this.state === "visible") {
        this.appear();
    } else {
        this.disappear();
    }
}

// Checks if all torches related to this object are lit. If they are, returns true, else returns false.
DisappearingObject.prototype.checkTorches = function() {
    for(var i = 0; i < this.torches.length; i++) {
        if(!this.torches[i].onFire) {
            return false;
        }
    }
    return true;
}

DisappearingObject.prototype.disappear = function() {
    this.state = "invisible";
    levelGeometry.remove(this.object);
}

DisappearingObject.prototype.appear = function() {
    this.state = "visible";
    levelGeometry.add(this.object);
}

DisappearingObject.prototype.changeState = function() {
    if(this.state === "visible") {
        this.disappear();
    } else {
        this.appear();
    }
}

// Updates the DisappearingObject's state.
DisappearingObject.prototype.update = function() {
    switch(this.state) {
        case "visible":
            if(!this.checkTorches()) {
                this.disappear();
            }
            break;
        case "invisible":
            if(this.checkTorches()) {
                this.appear();
            }
            break;
    }
}

// Moving objects: lighting or extinguishing torches related to it makes it move from one place to another. It doesn't teleport (though it could, why not, possible @kdzTODO), instead moves smoothly between locations.
// THEY DO NOT YET WORK!!!
function MovingObject(positionA, positionB, startState, physicalObject, speed, ...torches) {
    this.A = positionA; // A is the "torches lit" position.
    this.B = positionB; // B is the "torches not lit" position.
    this.state = startState; // Can be: A, B, MovingToA, MovingToB.
    this.torches = torches;
    this.speed = speed; // Speed of going from A to B and vice-versa.

    // Set up the physical object that will represent this MovingObject in the scene.
    if(this.state === "A") {
        physicalObject.position.copy(this.A);
    } else {
        physicalObject.position.copy(this.B);
    }
    physicalObject.velocity = new THREE.Vector3(0, 0, 0);
    levelGeometry.add(physicalObject);
    this.object = physicalObject;
}

MovingObject.prototype.checkTorches = function() {
    for(var i = 0; i < this.torches.length; i++) {
        if(!this.torches[i].onFire) {
            return false;
        }
    }
    return true;
}

// Gets the party rolling!
// ... That is, the object moving.
MovingObject.prototype.startMoving = function() {
    var directionVector = new THREE.Vector3();
    if(this.state === "A") {
        directionVector.copy(this.A);
        directionVector.sub(this.B);
        this.object.velocity = directionVector.multiplyScalar(this.speed);
    } else if(this.state === "B") {
        directionVector.copy(this.B);
        directionVector.sub(this.A);
        this.object.velocity = directionVector.multiplyScalar(this.speed);
    } else {
        this.object.velocity.multiplyScalar(-1);
    }
}

MovingObject.prototype.startMovingToA = function() {
    var directionVector = new THREE.Vector3();
    directionVector.copy(this.B);
    directionVector.sub(this.A);
    this.object.velocity = directionVector.multiplyScalar(this.speed);
}

MovingObject.prototype.startMovingToB = function() {
    var directionVector = new THREE.Vector3();
    directionVector.copy(this.A);
    directionVector.sub(this.B);
    this.object.velocity = directionVector.multiplyScalar(this.speed);
}

MovingObject.prototype.changeDirection = function() {
    this.object.velocity.multiplyScalar(-1);
}

// Updates the MovingObject's state
MovingObject.prototype.update = function(deltaTime) {
    switch(this.state) {
        case "A":
            if(!this.checkTorches()) {
                this.startMovingToB();
                this.state = "MovingToB";
            }
            break;
        case "B":
            if(this.checkTorches()) {
                this.startMovingToA();
                this.state = "MovingToA";
            }
            break;
        case "MovingToA":
            if(!this.checkTorches()) {
                this.changeDirection();
            } else {
                if(!this.object.position === this.A) {
                    this.object.translateX(this.object.velocity.x * deltaTime);
                    this.object.translateY(this.object.velocity.y * deltaTime);
                    this.object.translateZ(this.object.velocity.z * deltaTime);
                } else {
                    this.object.velocity.set(0, 0, 0);
                    this.state = "B";
                }
            }
            break;
        case "MovingToB":
            if(this.checkTorches()) {
                this.changeDirection();
            } else {
                if(!this.object.position === this.B) {
                    this.object.translateX(this.object.velocity.x * deltaTime);
                    this.object.translateY(this.object.velocity.y * deltaTime);
                    this.object.translateZ(this.object.velocity.z * deltaTime);
                } else {
                    this.object.velocity.set(0, 0, 0);
                    this.state = "A";
                }
            }
    }
}

// Checks all the triggers for, uhm, triggeration.
function checkTriggers() {
    var i = 0;
    while(i < triggers.length) {
        if(triggers[i].checkTrigger()) {
            triggers[i].behavior();
            if(triggers[i].oneTime) {
                triggers.splice(i, 1);
                continue;
            }
        }
        i++;
    }
}

function buildLevel() {
    var floorGeometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    var floorMaterial = new THREE.MeshBasicMaterial({color: 0x909090});
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotateX(-90 * Math.PI/180);
    scene.add(floor);
    levelGeometry.add(floor);
}

function updateObjects(deltaTime) {
    // Update fireballs
    var p = projectiles.fireballs;
    for(var i = 0; i < p.length; i++) {
        p[i].translateX(p[i].velocity.x * deltaTime);
        p[i].translateY(p[i].velocity.y * deltaTime);
        p[i].translateZ(p[i].velocity.z * deltaTime);
    }

    // Update frostbolts
    p = projectiles.frostbolts;
    for(var i = 0; i < p.length; i++) {
        p[i].translateX(p[i].velocity.x * deltaTime);
        p[i].translateY(p[i].velocity.y * deltaTime);
        p[i].translateZ(p[i].velocity.z * deltaTime);
    }

    // Update disappearing world objects
    p = disappearingObjects;
    for(var i = 0; i < p.length; i++) {
        p[i].update();
    }

    // Update moving world objects
    p = movingObjects;
    for(var i = 0; i < p.length; i++) {
        p[i].update(deltaTime);
    }
}

function runGameLoop() {
    requestAnimationFrame( runGameLoop );

    var delta = clock.getDelta();

    updateHero(delta);
    updateObjects(delta);
    checkProjectileCollisions();
    checkTriggers();

    renderer.render(scene, camera);
};

setUpScene();
buildLevel();
runGameLoop();

// @kdz Detect and resolve collisions between the player's projectiles and other objects in the world.
function checkProjectileCollisions() {
    // Check collisions between projectiles and level geometry
    var p;
    var geometry = levelGeometry.children;
    for(var i = 0; i < geometry.length; i++) {
        var levelBox = new THREE.Box3().setFromObject(geometry[i]);
        var j = 0;
        p = projectiles.fireballs;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            if(projectileBox.intersectsBox(levelBox)) {
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }

        j = 0;
        p = projectiles.frostbolts;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            if(projectileBox.intersectsBox(levelBox)) {
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }
    }

    // Check collisions between projectiles and torches
    for(var i = 0; i < torches.length; i++) {
        var torchBox = new THREE.Box3().setFromObject(torches[i]);
        var j = 0;
        p = projectiles.fireballs;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            // console.log(torchBox, projectileBox);
            if(projectileBox.intersectsBox(torchBox)) {
                lightTorch(torches[i]);
                // We need to remove the projectile from the scene and from the game's logic
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }

        j = 0;
        p = projectiles.frostbolts;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            if(projectileBox.intersectsBox(torchBox)) {
                extinguishTorch(torches[i]);
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }
    }
}

// @kdz Shoots a projectile of the specified type from the player, gives it a direction and velocity and adds it to the array of projectiles.
function shoot(type) {
    if(projectileClock.running && projectileClock.getElapsedTime() < SHOOTING_INTERVAL) {
        return;
    }
    projectileClock.start();
    const projectileGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    const fireballMaterial = new THREE.MeshBasicMaterial({color: 0xff3300});
    const frostboltMaterial = new THREE.MeshBasicMaterial({color: 0x66a3ff});
    var projectile = new THREE.Object3D();
    switch(type) {
        case "fireball":
            projectile.add(new THREE.Mesh(projectileGeometry, fireballMaterial));
            projectiles.fireballs.push(projectile);
            break;
        case "frostbolt":
            projectile.add(new THREE.Mesh(projectileGeometry, frostboltMaterial));
            projectiles.frostbolts.push(projectile);
            break;
    }
    projectile.velocity = new THREE.Vector3();
    hero.controls.getDirection(projectile.velocity);
    projectile.velocity.multiplyScalar(MAGIC_SPEED);
    projectile.position.copy(hero.controls.getObject().position);

    // We don't want to obstruct the player's view with the projectile, so we move it a bit forward.
    var notInYourFace = new THREE.Vector3();
    hero.controls.getDirection(notInYourFace);
    notInYourFace.normalize();
    projectile.position.add(notInYourFace);

    scene.add(projectile);
}

// @kdz Creates and returns a torch Object3D, nicely position (right above y = 0) and rotated so that during any further transformations we don't need to concern ourselves with its size.
function createTorch(position, onFire, torchName) {
    var torchTopGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
    var torchHandleGeometry = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    var torchTopMaterial = new THREE.MeshBasicMaterial({color: 0xffeaa8});
    var torchHandleMaterial = new THREE.MeshBasicMaterial({color: 0x663300});
    var torchTop = new THREE.Mesh(torchTopGeometry, torchTopMaterial);
    var torchHandle = new THREE.Mesh(torchHandleGeometry, torchHandleMaterial);
    torchTop.position.y += 0.875;
    torchHandle.position.y += 0.375;
    var torch = new THREE.Object3D({name: torchName});
    torch.add(torchTop);
    torch.add(torchHandle);
    torch.rotation.z += 22.5 * Math.PI/180;

    // Set up logic for lighting up/extinguishing the torch.
    // torch["onFire"] = onFire;
    if (onFire) lightTorch(torch);
    else extinguishTorch(torch);

    torch.position.copy(position);

    return torch;
}

// @kdz Function to light torches.
function lightTorch(torch) {
    torch.onFire = true;
    torch.children[0].material.color.set(0xff3300);
}

// @kdz Function to extuinguish torches.
function extinguishTorch(torch) {
    torch.onFire = false;
    torch.children[0].material.color.set(0xffeaa8);
}

function setUpScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
    testCube = new THREE.Mesh( geometry, material );
    testCube.position.y = 0.5;
    // scene.add( testCube );

    var ambientLight = new THREE.AmbientLight(0x404040, 25);
    scene.add(ambientLight);

    keyboard = new THREEx.KeyboardState();
    clock = new THREE.Clock(true);
    projectileClock = new THREE.Clock(false);

    var controls = new THREE.PointerLockControls(camera);
    controls.getObject().position.set(0, 1, 5);
    scene.add(controls.getObject());
    initPointerLock(controls);

    // Set up our player character
    hero = new THREE.Object3D();
    hero["controls"] = controls;
    hero["size"] = 10; // It will be used to remember every game object's size @kdzTODO: we don't really need this since we're going to use THREE.Box3.
    hero["velocity"] = new THREE.Vector3(0, 0, 0);
    hero["hp"] = HERO_MAX_HEALTH;

    // Initialize other globals
    projectiles = new Object();
    projectiles["fireballs"] = new Array();
    projectiles["frostbolts"] = new Array();

    // levelGeometry = new Array();
    levelGeometry = new THREE.Object3D();
    scene.add(levelGeometry);

    torches = new Array();
    var testTorch = createTorch(new THREE.Vector3(0, 0, 0), true,"AllMightyTorch");
    torches.push(testTorch);
    scene.add(testTorch);

    triggers = new Array();
    var trig = new Trigger(new THREE.Vector3(0, 0, 3), 2, function() {
        for(var i = 0; i < this.objects.length; i++) {
            extinguishTorch(this.objects[i]);
        }
    }, true, testTorch);
    triggers.push(trig);

    var trig2 = new Trigger(new THREE.Vector3(0, 0, 0), 2, function() {
        for(var i = 0; i < this.objects.length; i++) {
            lightTorch(this.objects[i]);
        }
    }, true, testTorch);
    triggers.push(trig2);

    disappearingObjects = new Array();
    // @kdzTEST disappearing object test
    var dGeometry = new THREE.BoxGeometry(3, 3, 3);
    var dMaterial = new THREE.MeshBasicMaterial({color: 0x990033});
    var dObject = new THREE.Object3D();
    dObject.add(new THREE.Mesh(dGeometry, dMaterial));
    var dTest = new DisappearingObject(new THREE.Vector3(5, 3/2, -5), "visible", dObject, testTorch);
    disappearingObjects.push(dTest);

    movingObjects = new Array();
    // @kdzTEST moving object test
    var mMaterial = new THREE.MeshBasicMaterial({color: 0xff9900});
    var mObject = new THREE.Object3D();
    mObject.add(new THREE.Mesh(dGeometry, mMaterial));
    var mTest = new MovingObject(new THREE.Vector3(-5, 3/2, -5), new THREE.Vector3(-5, 3/2, 5), "A", mObject, 2.5, testTorch);
    movingObjects.push(mTest);
}

// @kdz
// Updates the hero: position based on velocity, maybe other factors based on future updates.
// @kdzTODO: Add jumping?
function updateHero(deltaTime) {
    var heroDirection = new THREE.Vector3(0, 0, 0);
    if(keyboard.pressed("A")) {
        heroDirection.x = -1;
    } else if(keyboard.pressed("D")) {
        heroDirection.x = 1;
    }
    if(keyboard.pressed("W")) {
        heroDirection.z = -1;
    } else if(keyboard.pressed("S")) {
        heroDirection.z = 1;
    }
    if(keyboard.pressed("F")) {
        shoot("fireball");
    }
    if(keyboard.pressed("E")) {
        shoot("frostbolt");
    }
    if(heroDirection.x !== 0 && heroDirection.z !== 0) {
        heroDirection.x /= Math.sqrt(2);
        heroDirection.z /= Math.sqrt(2);
    }

    hero.velocity.copy(heroDirection);
    hero.velocity.x *= HERO_SPEED;
    hero.velocity.z *= HERO_SPEED;

    var hObj = hero.controls.getObject();
    hObj.translateX(hero.velocity.x * deltaTime);
    hObj.translateZ(hero.velocity.z * deltaTime);
}
