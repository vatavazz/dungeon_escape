var createRoom1 = function (start) {
  scene = new THREE.Scene;
  // Get rid of all the old objects in the level geometry.
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
  var physicsContactMaterial = new CANNON.ContactMaterial( physicsMaterial, physicsMaterial, 0.0, 0.0 );
  world.addContactMaterial(physicsContactMaterial);

  // player object
  var playerShape = new CANNON.Sphere( 10 );
  var player = new CANNON.Body({ mass: 5});
  player.addShape(playerShape);
  if (start) var x = 0, y = 10, z = 85;
  else var x = 0, y = 10, z = -75;
  player.position.set(x, y, z);
  player.linearDamping = 0.9;
  player.name = 'player';
  world.addBody(player);

  var texture = new THREE.TextureLoader().load('textures/bricks.png');
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

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	scene.add(camera);

  if (start) controls = new PointerLockControls( camera , player, x, y, z, false );
  else controls = new PointerLockControls( camera , player, x, y, z, true );
  scene.add( controls.getObject() );

  // floor
  var floorGeo = new THREE.PlaneGeometry(140, 200, 5, 5);
	var floorTex = new THREE.TextureLoader().load('textures/bricks.png' );
	floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
	floorTex.repeat.set(8, 8);
	var floorMat = new THREE.MeshPhongMaterial({ map: floorTex, normalMap: normal, bumpMap: displacement, specularMap: specular, side: THREE.DoubleSide });
  var floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = Math.PI/2;
  floorMesh.receiveShadow = true;
  // scene.add(floorMesh);
  levelGeometry.add(floorMesh);
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  world.addBody(groundBody);

  // roof
	var roofTex = new THREE.TextureLoader().load('textures/bricks.png');
	roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
	roofTex.repeat.set(8, 8);
	var roofMat = new THREE.MeshPhongMaterial({ map: floorTex, normalMap: normal, bumpMap: displacement, specularMap: specular, side: THREE.DoubleSide});
  var roofGeo = new THREE.CylinderGeometry( 70, 70, 200, 32, 32, true, 0, 3.15 );
  var roofMesh = new THREE.Mesh( roofGeo, roofMat );
  roofMesh.rotation.x = Math.PI/2;
  roofMesh.rotation.y = Math.PI/2;
  roofMesh.position.set(0,100,0);
  levelGeometry.add( roofMesh );

  // walls
  var wallGeo = new THREE.PlaneGeometry(140, 170, 5, 5);
	var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
	wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(8, 8);
  var wallShape = new CANNON.Plane();

	var wallMat = new THREE.MeshPhongMaterial({ map: wallTex, normalMap: normal, bumpMap: displacement, specularMap: specular, side: THREE.DoubleSide});

  var wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, 100);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);

  var wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI);
  wallBody.position.set(0, 0, 100);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, -100);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.position.set(0, 0, -100);
  world.addBody(wallBody);

  wallGeo = new THREE.PlaneGeometry(200, 100, 5, 5);
  wallGeo.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(70, 50, 0);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI/2);
  wallBody.position.set(70, 0, 0);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(-70, 50, 0);
  wallMesh.receiveShadow = true;
  levelGeometry.add(wallMesh);
  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),Math.PI/2);
  wallBody.position.set(-70, 0, 0);
  world.addBody(wallBody);

  createWall();
  createPillars();
  
  // Door that will close when not all torches are lit.
    var dg = new THREE.BoxGeometry(40, 40, 10);
    var doorTex = new THREE.TextureLoader().load('textures/steel_door.png');
    doorTex.wrapS = doorTex.wrapT = THREE.RepeatWrapping;
    doorTex.repeat.set(8, 8);
    var dm = new THREE.MeshLambertMaterial({map: doorTex, side: THREE.DoubleSide});
    var db = new CANNON.Body({mass: 0, shape: new CANNON.Box(new CANNON.Vec3(40, 40, 10))});
    var dMesh = new THREE.Mesh(dg, dm);
    var dObj = new THREE.Object3D();
    dObj.add(dMesh);
    var d = new MovingObject(new THREE.Vector3(0, 80, -80), new THREE.Vector3(0, 20, -80), "A", dObj, db, 0.05, torches[0], torches[1], torches[2], torches[3], torches[4], torches[5], torches[6], torches[7]);
    
    var trig = new Trigger(new THREE.Vector3(0, 0, 5), 50,
        function() {
            extinguishTorch(this.objects[0]);
        },
        true, 0, torches[4]);


  function createWall() {
    var geometry = new THREE.BoxGeometry( 10, 40, 40 );

    wallTex = new THREE.TextureLoader().load('textures/bricks.png');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(2, 2);

    var material = new THREE.MeshPhongMaterial( { map: wallTex, normalMap: normal,bumpMap: displacement,  specularMap: specular } );

    var boxShape = new CANNON.Box(new CANNON.Vec3(5,20,20));

    var wall = new THREE.Mesh( geometry, material );
    wall.position.set(30, 20, 80);
    wall.castShadow = true;
    levelGeometry.add( wall );
    var boxBody = new CANNON.Body({ mass: 0 });
    boxBody.addShape(boxShape);
    boxBody.position.set(30, 20, 80);
    world.add(boxBody)

    wall = new THREE.Mesh( geometry, material );
    wall.position.set(-30, 20, 80);
    wall.castShadow = true;
    levelGeometry.add( wall );
    boxBody = new CANNON.Body({ mass: 0 });
    boxBody.addShape(boxShape);
    boxBody.position.set(-30, 20, 80);
    world.add(boxBody)

    material = new THREE.MeshPhongMaterial( {color: 0x000000, map: wallTex, normalMap: normal, bumpMap: displacement, specularMap: specular, } );
    wall = new THREE.Mesh( geometry, material );
    wall.rotation.y = Math.PI/2;
    wall.position.set(0, 20, -95);
    wall.castShadow = true;
    levelGeometry.add( wall );

    halfExtents = new CANNON.Vec3(20,20,5);
    boxShape = new CANNON.Box(halfExtents);
    var levelEnd = new CANNON.Body({ mass: 0 });
    levelEnd.addShape(boxShape);
    levelEnd.position.set(0, 20, -95);
    levelEnd.name = "levelEnd";
    world.add(levelEnd)

    levelEnd.addEventListener("collide",function(e){if (e.body.name == 'player') createRoom2(true);});
  }
  function createPillars() {
    // pillar info
    var pillar;
    var pillarBody;
    var pillargeometry = new THREE.BoxGeometry( 10, 170, 10 );
    var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
    wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	  wallTex.repeat.set(0.5, 8);
    var pillarmaterial = new THREE.MeshPhongMaterial( { map: wallTex, normalMap: normal,  bumpMap: displacement, specularMap: specular, } );
    var pillarShape = new CANNON.Box(new CANNON.Vec3(5,85,5));

    // torch info
    var torch;
    var light;
    var torchgeometry = new THREE.SphereGeometry( 1, 16, 16 );
    var torchmaterial = new THREE.MeshBasicMaterial( { color: "rgb(241, 148, 61)" } );

    var positions = [55, 5, -45, -95];
    for (var i = 0; i < positions.length; i++) {
      // right side
      pillar = new THREE.Mesh( pillargeometry, pillarmaterial );
      pillar.position.set(30, 85, positions[i]);
      pillar.castShadow = true;
      levelGeometry.add( pillar );
      pillarBody = new CANNON.Body({ mass: 0 });
      pillarBody.addShape(pillarShape);
      pillarBody.position.set(30, 85, positions[i]);
      world.add(pillarBody)

      // torch = new THREE.Mesh( torchgeometry, torchmaterial );
      // torch.position.set(25, 25, positions[i]);
      torch = createTorch(new THREE.Vector3(25, 25, positions[i]), 0, true);
      // scene.add( torch );
      // light = new THREE.PointLight( "rgb(241, 148, 61)", 0.4-i/4, 80 );
      // light.position.set( 25, 25, positions[i] );
      // scene.add( light );

      // left side
      pillar = new THREE.Mesh( pillargeometry, pillarmaterial );
      pillar.position.set(-30, 85, positions[i]);
      pillar.castShadow = true;
      levelGeometry.add( pillar );
      pillarBody = new CANNON.Body({ mass: 0 });
      pillarBody.addShape(pillarShape);
      pillarBody.position.set(-30, 85, positions[i]);
      world.add(pillarBody)

      torch = createTorch(new THREE.Vector3(-25, 25, positions[i]), 180, true);
      // torch.position.set( -25, 25, positions[i] );
      // scene.add( torch );
      // light = new THREE.PointLight( "rgb(241, 148, 61)", 0.4-i/4, 80 );
      // light.position.set( -25, 25, positions[i] );
      // scene.add( light );
    }
  }
}
