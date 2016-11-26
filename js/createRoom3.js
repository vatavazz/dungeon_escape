var createRoom3 = function (secret) {
  scene = new THREE.Scene;
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;
  var ai;

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

  // player object
  var playerShape = new CANNON.Sphere( 10 );
  var player = new CANNON.Body({ mass: 5 });
  player.addShape(playerShape);

  // player positioning if entered from secret passage
  if (secret) var x = 0, y = 90, z = 160;
  else var x = 75, y = 10, z = 160;

  player.position.set(x, y, z);
  player.linearDamping = 0.9;
  player.name = 'player';
  world.addBody(player);

  var ambientLight = new THREE.AmbientLight( "rgb(48, 48, 61)" );
  scene.add( ambientLight );

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	scene.add(camera);

  controls = new PointerLockControls( camera , player, x, y, z, true );
  scene.add( controls.getObject() );

  var skellies = [
    [150, 17.5, 125],
    [0, 17.5, 125],
    [150, 17.5, 30],
    [0, 17.5, 30],

    [-30, 17.5, 0],
    [-125, 17.5, 0],
    [-30, 17.5, -150],
    [-125, 17.5, -150]
  ];

  for (var i = 0; i<skellies.length; i++) {
    ai = new skeleton(skellies[i][0], skellies[i][1], skellies[i][2]);
    ais.push(ai);
  }

  // floor
  var floorGeo = new THREE.PlaneGeometry(350, 350, 5, 5);
	var brickTexture = new THREE.TextureLoader().load('textures/bricks.png' );
	brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
	brickTexture.repeat.set(10, 10);
	var floorMat = new THREE.MeshLambertMaterial({ map: brickTexture, side: THREE.DoubleSide });
  var floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = Math.PI/2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  world.addBody(groundBody);

  // TODO roof
  var roofMesh = new THREE.Mesh(floorGeo, floorMat);
  roofMesh.rotation.x = Math.PI/2;
  roofMesh.position.set(0,170,0);
  roofMesh.receiveShadow = true;
  scene.add(roofMesh);

  // walls
  var wallGeo = new THREE.PlaneGeometry(350, 170, 5, 5);
	brickTexture = new THREE.TextureLoader().load('textures/bricks.png');
	brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
	brickTexture.repeat.set(8, 8);
	var wallMat = new THREE.MeshLambertMaterial({ map: brickTexture, side: THREE.DoubleSide});

  var wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, 175);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  var wallShape = new CANNON.Plane();
  var wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI);
  wallBody.position.set(0, 0, 175);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, -175);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.position.set(0, 0, -175);
  world.addBody(wallBody);

  wallGeo = new THREE.PlaneGeometry(350, 170, 5, 5);
  wallGeo.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(175, 85, 0);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI/2);
  wallBody.position.set(175, 0, 0);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(-175, 85, 0);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),Math.PI/2);
  wallBody.position.set(-175, 0, 0);
  world.addBody(wallBody);

  // door back
  geometry = new THREE.BoxGeometry( 10, 40, 40 );
  material = new THREE.MeshLambertMaterial( {color: "rgb(177, 177, 177)", map: brickTexture } );
  boxShape = new CANNON.Box(new CANNON.Vec3(20,20,5));

  wall = new THREE.Mesh( geometry, material );
  wall.rotation.y = Math.PI/2;
  wall.position.set(75, 20, 175);
  wall.castShadow = true;
  scene.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(75, 20, 175);
  boxBody.name = "levelEnd";
  world.add(boxBody)
  boxBody.addEventListener("collide",function(e){if (e.body.name == 'player')createRoom2(false);});

  wall = new THREE.Mesh( geometry, material );
  wall.rotation.y = Math.PI/2;
  wall.position.set(0, 95, 175);
  wall.castShadow = true;
  scene.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0, 95, 175);
  boxBody.name = "levelEnd";
  world.add(boxBody)
  boxBody.addEventListener("collide",function(e){if (e.body.name == 'player') createRoom2(true);});

  // FIXME collision
  var curvegeometry = new THREE.CylinderGeometry( 175, 175, 170, 32, 2, true, Math.PI/2, Math.PI/2);
  var curvematerial = new THREE.MeshLambertMaterial( { map: brickTexture, side: THREE.DoubleSide  } );
  var curveShape = new CANNON.Cylinder(22.5, 25, 2.5, 32);
  var curve = new THREE.Mesh(curvegeometry, curvematerial);
  curve.position.set(0, 85, 0);
  scene.add(curve);

  // tombs
  var geometry = new THREE.BoxGeometry( 200, 15, 50 );
  brickTexture = new THREE.TextureLoader().load('textures/bricks.png');
  brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
	brickTexture.repeat.set(13.33, 1);
  var material = new THREE.MeshLambertMaterial( { map: brickTexture, color: "rgb(105, 122, 111)" } );

  var positions = [
    [0, 7.5, 75],
    [150, 7.5, 75],

    [-75, 7.5, 0],
    [-75, 7.5, -150],

    [0, 67.5, 75],
    [-75, 67.5, 0]
  ];
  var wall;
  var boxBody, boxShape;
  for (var pos = 0; pos<positions.length; pos++){
    wall = new THREE.Mesh( geometry, material );
    wall.position.set(positions[pos][0], positions[pos][1], positions[pos][2]);
    if (positions[pos][2] == 75 ) {
      boxShape = new CANNON.Box(new CANNON.Vec3(25,7.5,100));
      wall.rotation.y = Math.PI/2;
    } else if (positions[pos][1] != 85) boxShape = new CANNON.Box(new CANNON.Vec3(100,7.5,25));
    wall.castShadow = true;
    scene.add( wall );
    boxBody = new CANNON.Body({ mass: 0 });
    boxBody.addShape(boxShape);
    boxBody.position.set(positions[pos][0], positions[pos][1], positions[pos][2]);
    world.add(boxBody);
  }

  // extra walls
  geometry = new THREE.BoxGeometry( 150, 170, 1 );
  brickTexture.repeat.set(8, 8);
  material = new THREE.MeshLambertMaterial( { map: brickTexture } );

  wall = new THREE.Mesh( geometry, material );
  wall.position.set(-25, 85, 100);
  boxShape = new CANNON.Box(new CANNON.Vec3(0.5,85,75));
  wall.rotation.y = Math.PI/2;
  wall.castShadow = true;
  scene.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-25, 85, 100);
  world.add(boxBody);

  wall = new THREE.Mesh( geometry, material );
  wall.position.set(-100, 85, 25);
  boxShape = new CANNON.Box(new CANNON.Vec3(75,85,0.5));
  wall.castShadow = true;
  scene.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-100, 85, 25);
  world.add(boxBody);

  geometry = new THREE.BoxGeometry( 50, 170, 1 );
  brickTexture.repeat.set(8, 8);

  wall = new THREE.Mesh( geometry, material );
  wall.position.set(25, 85, -150);
  boxShape = new CANNON.Box(new CANNON.Vec3(0.1,85,25));
  wall.rotation.y = Math.PI/2;
  wall.castShadow = true;
  scene.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(25, 85, -150);
  world.add(boxBody);

  wall = new THREE.Mesh( geometry, material );
  wall.position.set(150, 85, -25);
  boxShape = new CANNON.Box(new CANNON.Vec3(25,85,0.1));
  wall.castShadow = true;
  scene.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(150, 85, -25);
  world.add(boxBody);


  // pillars
  var pillargeometry = new THREE.BoxGeometry( 10, 170, 10 );
  brickTexture = new THREE.TextureLoader().load('textures/bricks.png');
  brickTexture.wrapS = brickTexture.wrapT = THREE.RepeatWrapping;
	brickTexture.repeat.set(1, 17);
  var pillarmaterial = new THREE.MeshLambertMaterial( { map:brickTexture, color: "rgb(169, 177, 172)" } );
  var pillarShape = new CANNON.Box(new CANNON.Vec3(5,85,5));

  // TODO torches
  var torch;
  var light;

  var positions = [
    [30, 85, 170],
    [30, 85, 75],
    [30, 85, -20],
    [120, 85, 170],
    [120, 85, 74],
    [120, 85, -20],

    [-170, 85, -30],
    [-75, 85, -30],
    [20, 85, -30],
    [-170, 85, -120],
    [-75, 85, -120],
    [20, 85, -120],

    [30, 85, -30],
    [110, 85, -110]
  ];
  var pillar;
  var pillarBody;
  for (var pos = 0; pos<positions.length; pos++) {
    pillar = new THREE.Mesh( pillargeometry, pillarmaterial );
    pillar.position.set(positions[pos][0], positions[pos][1], positions[pos][2]);
    pillar.castShadow = true;
    scene.add( pillar );
    pillarBody = new CANNON.Body({ mass: 0 });
    pillarBody.addShape(pillarShape);
    pillarBody.position.set(positions[pos][0], positions[pos][1], positions[pos][2]);
    world.add(pillarBody);
  }

  // altar
  var altar;
  var altarBody;
  var altargeometry = new THREE.CylinderGeometry( 45, 50, 5, 32 );
  var altarmaterial = new THREE.MeshLambertMaterial( { color: 0x8888ff } );
  var altarShape = new CANNON.Cylinder(22.5, 25, 2.5, 32);

  altar = new THREE.Mesh(altargeometry, altarmaterial);
  altar.position.set(110, 2.5, -110);
  scene.add(altar);

  // FIXME wrong???
  // var altarBody = new CANNON.Body({ mass: 0 });
  // altarBody.addShape(altarShape);
  // altarBody.position.set(110, 2.5, -110);
  // world.add(altarBody);

  // temporary lights
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( -85, 50, -85);
  scene.add( light );
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( 85, 50, 85);
  scene.add( light );
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( -85, 50, 85);
  scene.add( light );
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( 85, 50, -85);
  scene.add( light );
}
