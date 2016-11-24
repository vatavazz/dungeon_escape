var createRoom1 = function (world, scene) {
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
  var roofMesh = new Physijs.ConeMesh( roofGeo, roofMat );
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

    var wall = new Physijs.BoxMesh( geometry, material );
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
    boxBody = new CANNON.Body({ mass: 0 });
    boxBody.addShape(boxShape);
    boxBody.position.set(0, 20, -95);
    boxBody.name = "levelEnd";
    world.add(boxBody)
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
      pillar = new Physijs.BoxMesh( pillargeometry, pillarmaterial );
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
      pillar = new Physijs.BoxMesh( pillargeometry, pillarmaterial );
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