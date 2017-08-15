"use strict";

function createRoom4() {
    scene = new THREE.Scene();
    levelGeometry = new THREE.Object3D();
    disappearingObjects = new Array();
    movingObjects = new Array();
    torches = new Array();
    scene.add(levelGeometry);
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    world.solver = new CANNON.SplitSolver(solver);

    world.gravity.set(0, -100, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    var physicsMaterial = new CANNON.Material("slipperyMaterial");
    var physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, 0.0, 0.0);
    world.addContactMaterial(physicsContactMaterial);

    // Player object.
    var playerShape = new CANNON.Sphere(10);
    var player = new CANNON.Body({mass: 5});
    player.addShape(playerShape);
    // @kdzTODO: position the player
    player.position.set(0, 10, 7.5);
    player.linearDamping = 0.9;
    player.name = 'player';
    world.addBody(player);

    var ambientLight = new THREE.AmbientLight("rgb(48, 48, 61)");
    scene.add(ambientLight);
    ambientLight.intensity = 1.5;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 1000);
    scene.add(camera);

    controls = new PointerLockControls(camera, player, 0, 10, 7.5, true);
    scene.add(controls.getObject());

    // Load texture used for walls, floors and ceilings.
    var brickTexture = new THREE.TextureLoader().load('textures/bricks.png');
    var displacement = new THREE.TextureLoader().load('textures/DisplacementMap.png');
    displacement.wrapS = displacement.wrapT = THREE.RepeatWrapping;
  	displacement.repeat.set(8, 8);
    var normal = new THREE.TextureLoader().load('textures/NormalMap.png');
    normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  	normal.repeat.set(8, 8);
    var specular = new THREE.TextureLoader().load('textures/SpecularMap.png');
    specular.wrapS = specular.wrapT = THREE.RepeatWrapping;
  	specular.repeat.set(8, 8);
    var ambient = new THREE.TextureLoader().load('textures/AmbientOcclusionMap.png');
    ambient.wrapS = ambient.wrapT = THREE.RepeatWrapping;
  	ambient.repeat.set(8, 8);

    // Floor.
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 5, 5);

    brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
    brickTexture.repeat.set(4, 4);
    var floorMaterial = new THREE.MeshPhongMaterial({map: brickTexture, side: THREE.DoubleSide, normalMap: normal, bumpMap: displacement, specularMap: specular});
    var floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.rotation.x = Math.PI/2;
    floorMesh.receiveShadow = true;
    levelGeometry.add(floorMesh);

    var groundBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane()});
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);
    world.addBody(groundBody);

    // Roof.
    var roofMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    roofMesh.rotation.x -= Math.PI/2;
    roofMesh.position.y += 60;
    levelGeometry.add(roofMesh);

    // Walls.
    var shortWallGeometry = new THREE.PlaneGeometry(80, 60, 5, 5);
    var shortWall = new THREE.Mesh(shortWallGeometry, floorMaterial);
    shortWall.position.set(0, 30, 30);
    shortWall.receiveShadow = true;
    levelGeometry.add(shortWall);
    var shortWallShape = new CANNON.Box(new CANNON.Vec3(40, 30, 0.5));
    var wallBody = new CANNON.Body({mass: 0, shape: shortWallShape});
    wallBody.position.set(0, 30, 30);
    world.addBody(wallBody);

    var longWallGeometry = new THREE.PlaneGeometry(110, 60, 5, 5);
    var longWall = new THREE.Mesh(longWallGeometry, floorMaterial);
    longWall.position.set(-15, 30, 0);
    longWall.receiveShadow = true;
    levelGeometry.add(longWall);
    var longWallShape = new CANNON.Box(new CANNON.Vec3(55, 30, 0.5));
    var wallBody = new CANNON.Body({mass: 0, shape: longWallShape});
    wallBody.position.set(-15, 0, 0);
    world.addBody(wallBody);

    longWall = new THREE.Mesh(longWallGeometry, floorMaterial);
    longWall.position.set(-40, 30, 85);
    longWall.receiveShadow = true;
    longWall.rotation.y += 90 * Math.PI/180;
    levelGeometry.add(longWall);
    wallBody = new CANNON.Body({mass: 0, shape: longWallShape});
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 90 * Math.PI/180);
    wallBody.position.set(-40, 30, 85);
    world.addBody(wallBody);

    longWall = new THREE.Mesh(longWallGeometry, floorMaterial);
    longWall.position.set(-70, 30, 55);
    longWall.receiveShadow = true;
    longWall.rotation.y += 90 * Math.PI/180;
    levelGeometry.add(longWall);
    wallBody = new CANNON.Body({mass: 0, shape: longWallShape});
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 90 * Math.PI/180);
    wallBody.position.set(-70, 30, 55);
    world.addBody(wallBody);

    longWall = new THREE.Mesh(longWallGeometry, floorMaterial);
    longWall.position.set(-95, 30, 140);
    longWall.receiveShadow = true;
    levelGeometry.add(longWall);
    wallBody = new CANNON.Body({mass: 0, shape: longWallShape});
    wallBody.position.set(-95, 30, 140);
    world.addBody(wallBody);

    shortWall = new THREE.Mesh(shortWallGeometry, floorMaterial);
    shortWall.position.set(-110, 30, 110);
    shortWall.receiveShadow = true;
    levelGeometry.add(shortWall);
    wallBody = new CANNON.Body({mass: 0, shape: shortWallShape});
    wallBody.position.set(-110, 30, 110);
    world.addBody(wallBody);

    // Entrance
    floorMaterial = new THREE.MeshPhongMaterial({color:0x000, map: brickTexture, side: THREE.DoubleSide, normalMap: normal, bumpMap: displacement, specularMap: specular});
    shortWall = new THREE.Mesh(shortWallGeometry, floorMaterial);
    shortWall.position.set(40, 30, 0);
    shortWall.rotation.y = 90 * Math.PI/180;
    shortWall.receiveShadow = true;
    levelGeometry.add(shortWall);
    wallBody = new CANNON.Body({mass: 0, shape: shortWallShape});
    wallBody.position.set(40, 30, 0);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 90 * Math.PI/180);
    world.addBody(wallBody);

    // Exit
    shortWall = new THREE.Mesh(shortWallGeometry, floorMaterial);
    shortWall.position.set(-150, 30, 125);
    shortWall.rotation.y = 90 * Math.PI/180;
    shortWall.receiveShadow = true;
    levelGeometry.add(shortWall);
    wallBody = new CANNON.Body({mass: 0, shape: shortWallShape});
    wallBody.position.set(-150, 30, 125);
    wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 90 * Math.PI/180);
    world.addBody(wallBody);
    wallBody.addEventListener("collide",
        function(e) {
            if(e.body.name == 'player') createRoom3(true);
        });
}
