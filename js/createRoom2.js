var createRoom2 = function (start) {
  scene = new THREE.Scene;
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

  world.gravity.set(0,-100,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  var physicsMaterial = new CANNON.Material( "slipperyMaterial" );
  var physicsContactMaterial = new CANNON.ContactMaterial( physicsMaterial, physicsMaterial, 0.0, 0.3 );
  world.addContactMaterial(physicsContactMaterial);

  // player object
  var playerShape = new CANNON.Sphere( 10 );
  var player = new CANNON.Body({ mass: 5 });
  player.addShape(playerShape);
  if (start) var x = 0, y = 10, z = 125;
  else var x = 0, y = 10, z = -125;
  player.position.set(x, y, z);
  player.linearDamping = 0.9;
  player.name = 'player';
  world.addBody(player);

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

  var ambientLight = new THREE.AmbientLight( "rgb(48, 48, 61)" );
  scene.add( ambientLight );
  ambientLight.intensity = 1.5;

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	scene.add(camera);

  controls = new PointerLockControls( camera , player, x, y, z, true );
  scene.add( controls.getObject() );

  // floor
  var floorGeo = new THREE.PlaneGeometry(100, 300, 5, 5);
  var floorTex = new THREE.TextureLoader().load('textures/bricks.png' );
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(4, 8);
  var floorMat = new THREE.MeshPhongMaterial({ map: floorTex,normalMap: normal, bumpMap: displacement, specularMap: specular, side: THREE.DoubleSide });
  var floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = Math.PI/2;
  floorMesh.receiveShadow = true;
  levelGeometry.add(floorMesh);

  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  world.addBody(groundBody);

  // roof
  var roofMesh = new THREE.Mesh(floorGeo, floorMat);
  roofMesh.rotation.x = -Math.PI/1.9;
  roofMesh.position.set(0,60,0);
  levelGeometry.add( roofMesh );

  // walls
  var wallGeo = new THREE.PlaneGeometry(100, 170, 5, 5);
	var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
	wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(8, 8);
	var wallMat = new THREE.MeshPhongMaterial({ map: wallTex, normalMap: normal, bumpMap: displacement, specularMap: specular,side: THREE.DoubleSide});

  var wallMesh = new THREE.Mesh(wallGeo, floorMat);
  wallMesh.position.set(0, 85, 150);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  var wallShape = new CANNON.Plane();
  var wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI);
  wallBody.position.set(0, 0, 150);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, -150);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.position.set(0, 0, -150);
  world.addBody(wallBody);

  wallGeo = new THREE.PlaneGeometry(300, 100, 5, 5);
  wallGeo.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(50, 50, 0);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI/2);
  wallBody.position.set(50, 50, 0);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(-50, 50, 0);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),Math.PI/2);
  wallBody.position.set(-50, 50, 0);
  world.addBody(wallBody);

  var light;
  var torch;
  var positions = [35, -15];
  for (var i = 0; i<positions.length; i++)
    torch = createTorch(new THREE.Vector3(-50, 25, positions[i]), 180, true);

  var geometry = new THREE.BoxGeometry( 10, 40, 40 );
  var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
  var material = new THREE.MeshPhongMaterial( {color: 0x000, map: wallTex,normalMap: normal, bumpMap: displacement, specularMap: specular } );

  var boxShape = new CANNON.Box(new CANNON.Vec3(5,20,20));

  var wall = new THREE.Mesh( geometry, material );
  wall.position.set(-54.999, 20, 10);
  wall.castShadow = true;
  levelGeometry.add( wall );
  var boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-54, 20, 10);
  world.add(boxBody)
  boxBody.addEventListener("collide",function(e){if (e.body.name == 'player') createRoom4();});


  boxShape = new CANNON.Box(new CANNON.Vec3(20,20,5));

  wall = new THREE.Mesh( geometry, material );
  wall.rotation.y = Math.PI/2;
  wall.position.set(0, 20, -150);
  wall.castShadow = true;
  levelGeometry.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0, 20, -150);
  boxBody.name = "levelEnd";
  world.add(boxBody)
  boxBody.addEventListener("collide",function(e){if (e.body.name == 'player') createRoom3(false);});

  // door back
  wall = new THREE.Mesh( geometry, material );
  wall.rotation.y = Math.PI/2;
  wall.position.set(0, 20, 150);
  wall.castShadow = true;
  levelGeometry.add( wall );
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0, 20, 150);
  boxBody.name = "levelEnd";
  world.add(boxBody)
  boxBody.addEventListener("collide",function(e){if (e.body.name == 'player') createRoom1(false);});

  // @kdz DisappearingObject that blocks the path to the secret corridor.
    var dGeometry = new THREE.BoxGeometry(10, 40, 40);
    var dTex = new THREE.TextureLoader().load('textures/bricks.png');
    dTex.wrapS = dTex.wrapT = THREE.RepeatWrapping;
    dTex.repeat.set(2, 4);
    var dMaterial = new THREE.MeshLambertMaterial({map: dTex, side: THREE.DoubleSide});
    var dBody = new CANNON.Body({mass: 0, shape: new CANNON.Box(new CANNON.Vec3(10, 40, 40))});
    var dMesh = new THREE.Mesh(dGeometry, dMaterial);
    var dObject = new THREE.Object3D();
    dObject.add(dMesh);
    var secretBlocker = new DisappearingObject(new THREE.Vector3(-54, 20, 10), dObject, dBody, torches[0], torches[1]);
}
