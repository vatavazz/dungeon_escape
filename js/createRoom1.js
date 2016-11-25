var createRoom1 = function () {
  scene = new THREE.Scene;
  world = new CANNON.World();
  world.quatNormalizeSkip = 0;
  world.quatNormalizeFast = false;

  var solver = new CANNON.GSSolver();

  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  solver.iterations = 7;
  solver.tolerance = 0.1;
  world.solver = new CANNON.SplitSolver(solver);

  world.gravity.set(0,-200,0);
  world.broadphase = new CANNON.NaiveBroadphase();

  var physicsMaterial = new CANNON.Material( "slipperyMaterial" );
  var physicsContactMaterial = new CANNON.ContactMaterial( physicsMaterial, physicsMaterial, 0.0, 0.3 );
  world.addContactMaterial(physicsContactMaterial);

  // player object
  var playerShape = new CANNON.Sphere( 10 );
  var player = new CANNON.Body({ mass: 5 });
  player.addShape(playerShape);
  // TODO fix player positioning
  player.position.set(0, 10, 85);
  player.linearDamping = 0.98;
  world.addBody(player);

  var ambientLight = new THREE.AmbientLight( "rgb(48, 48, 61)" );
  scene.add( ambientLight );

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	scene.add(camera);

  controls = new PointerLockControls( camera , player, 0, 10, 85, false );
  scene.add( controls.getObject() );

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


  function createWall() {
    var geometry = new THREE.BoxGeometry( 10, 40, 40 );
    var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
    var material = new THREE.MeshLambertMaterial( { map: wallTex } );

    var boxShape = new CANNON.Box(new CANNON.Vec3(5,20,20));

    var wall = new THREE.Mesh( geometry, material );
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
    var levelEnd = new CANNON.Body({ mass: 0 });
    levelEnd.addShape(boxShape);
    levelEnd.position.set(0, 20, -95);
    levelEnd.name = "levelEnd";
    world.add(levelEnd)

    levelEnd.addEventListener("collide",function(e){createRoom2();});
  }
  function createPillars() {
    // pillar info
    var pillar;
    var pillarBody;
    var pillargeometry = new THREE.BoxGeometry( 10, 170, 10 );
    var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
      wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
  	  wallTex.repeat.set(0.5, 4);
    var pillarmaterial = new THREE.MeshLambertMaterial( { map: wallTex } );
    var pillarShape = new CANNON.Box(new CANNON.Vec3(5,85,5));

    // torch info
    var torch;
    var light;
    var torchgeometry = new THREE.SphereGeometry( 1, 16, 16 );
    var torchmaterial = new THREE.MeshBasicMaterial( { color: "rgb(241, 148, 61)" } );

    var positions = [55, 5, -45, -95];
    for (var i in positions) {
      // right side
      pillar = new THREE.Mesh( pillargeometry, pillarmaterial );
      pillar.position.set(30, 85, positions[i]);
      pillar.castShadow = true;
      scene.add( pillar );

      pillarBody = new CANNON.Body({ mass: 0 });
      pillarBody.addShape(pillarShape);
      pillarBody.position.set(30, 85, positions[i]);
      world.add(pillarBody)

      torch = new THREE.Mesh( torchgeometry, torchmaterial );
      torch.position.set(25, 25, positions[i]);
      scene.add( torch );

      light = new THREE.PointLight( "rgb(241, 148, 61)", 0.4-i/4, 80 );
      light.position.set( 25, 25, positions[i] );
      scene.add( light );

      // left side
      pillar = new THREE.Mesh( pillargeometry, pillarmaterial );
      pillar.position.set(-30, 85, positions[i]);
      pillar.castShadow = true;
      scene.add( pillar );

      pillarBody = new CANNON.Body({ mass: 0 });
      pillarBody.addShape(pillarShape);
      pillarBody.position.set(-30, 85, positions[i]);
      world.add(pillarBody)

      torch = new THREE.Mesh( torchgeometry, torchmaterial );
      torch.position.set( -25, 25, positions[i] );
      scene.add( torch );

      light = new THREE.PointLight( "rgb(241, 148, 61)", 0.4-i/4, 80 );
      light.position.set( -25, 25, positions[i] );
      scene.add( light );
    }
  }
}
