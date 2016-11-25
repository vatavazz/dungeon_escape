var createRoom3 = function (world, scene) {
  // floor
  var floorGeo = new THREE.PlaneGeometry(350, 350, 5, 5);
	var floorTex = new THREE.TextureLoader().load('textures/bricks.png' );
	floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
	floorTex.repeat.set(10, 10);
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

  // // roof
	// var roofTex = new THREE.TextureLoader().load('textures/bricks.png');
	// roofTex.wrapS = roofTex.wrapT = THREE.RepeatWrapping;
	// roofTex.repeat.set(8, 8);
	// var roofMat = new THREE.MeshLambertMaterial({ map: roofTex, side: THREE.DoubleSide});
  //
  // var roofGeo = new THREE.CylinderGeometry( 70, 70, 200, 32, 32, true, 0, 3.15 );
  // var roofMesh = new Physijs.ConeMesh( roofGeo, roofMat );
  // roofMesh.rotation.x = Math.PI/2;
  // roofMesh.rotation.y = Math.PI/2;
  // roofMesh.position.set(0,100,0);
  // scene.add( roofMesh );

  // walls
  var wallGeo = new THREE.PlaneGeometry(350, 170, 5, 5);
	var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
	wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(8, 8);
	var wallMat = new THREE.MeshLambertMaterial({ map: wallTex, side: THREE.DoubleSide});

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

  // FIXME collision
  var curvegeometry = new THREE.CylinderGeometry( 175, 175, 170, 32, 2, true, Math.PI/2, Math.PI/2);
  var curvematerial = new THREE.MeshLambertMaterial( { map: wallTex, side: THREE.DoubleSide  } );
  var curveShape = new CANNON.Cylinder(22.5, 25, 2.5, 32);
  var curve = new THREE.Mesh(curvegeometry, curvematerial);
  curve.position.set(0, 85, 0);
  scene.add(curve);

  // tombs
  var geometry = new THREE.BoxGeometry( 200, 15, 50 );
  var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(13.33, 1);
  var material = new THREE.MeshLambertMaterial( { map: wallTex, color: "rgb(105, 122, 111)" } );

  var positions = [
    [0, 7.5, 75],
    [150, 7.5, 75],

    [-75, 7.5, 0],
    [-75, 7.5, -150],

    [0, 57.5, 75],
    [-75, 57.5, 0]
  ];
  var wall;
  var boxBody, boxShape;
  for (var pos in positions) {
    wall = new THREE.Mesh( geometry, material );
    wall.position.set(positions[pos][0], positions[pos][1], positions[pos][2]);
    if (positions[pos][2] == 75) {
      boxShape = new CANNON.Box(new CANNON.Vec3(25,12.5,100));
      wall.rotation.y = Math.PI/2;
    } else boxShape = new CANNON.Box(new CANNON.Vec3(100,12.5,15));
    wall.castShadow = true;
    scene.add( wall );
    boxBody = new CANNON.Body({ mass: 0 });
    boxBody.addShape(boxShape);
    boxBody.position.set(positions[pos][0], positions[pos][1], positions[pos][2]);
    world.add(boxBody);
  }

  // pillars
  var pillargeometry = new THREE.BoxGeometry( 10, 170, 10 );
  wallTex = new THREE.TextureLoader().load('textures/bricks.png');
  wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(1, 17);
  var pillarmaterial = new THREE.MeshLambertMaterial( { map:wallTex, color: "rgb(169, 177, 172)" } );
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
  for (var pos in positions) {
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
  light.position.set( -85, 10, -85);
  scene.add( light );
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( 85, 10, 85);
  scene.add( light );
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( -85, 10, 85);
  scene.add( light );
  light = new THREE.PointLight( "rgb(241, 148, 61)", 10, 80 );
  light.position.set( 85, 10, -85);
  scene.add( light );

  // TODO doors (4)
  // TODO enemies
}
