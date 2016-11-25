var createRoom2 = function (world, scene) {
  // floor
  var floorGeo = new THREE.PlaneGeometry(100, 300, 5, 5);
  var floorTex = new THREE.TextureLoader().load('textures/bricks.png' );
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(4, 8);
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
  var roofMesh = new THREE.Mesh(floorGeo, floorMat);
  roofMesh.rotation.x = -Math.PI/1.9;
  roofMesh.position.set(0,60,0);
  scene.add( roofMesh );

  // walls
  var wallGeo = new THREE.PlaneGeometry(100, 170, 5, 5);
	var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
	wallTex.wrapS = wallTex.wrapT = THREE.RepeatWrapping;
	wallTex.repeat.set(8, 8);
	var wallMat = new THREE.MeshLambertMaterial({ map: wallTex, side: THREE.DoubleSide});

  var wallMesh = new THREE.Mesh(wallGeo, floorMat);
  wallMesh.position.set(0, 85, 150);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  var wallShape = new CANNON.Plane();
  var wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI);
  wallBody.position.set(0, 0, 150);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(0, 85, -150);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.position.set(0, 0, -150);
  world.addBody(wallBody);

  wallGeo = new THREE.PlaneGeometry(300, 100, 5, 5);
  wallGeo.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(50, 50, 0);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),-Math.PI/2);
  wallBody.position.set(50, 50, 0);
  world.addBody(wallBody);

  wallMesh = new THREE.Mesh(wallGeo, wallMat);
  wallMesh.position.set(-50, 50, 0);
  wallMesh.receiveShadow = true;
  scene.add(wallMesh);

  wallBody = new CANNON.Body({ mass: 0 });
  wallBody.addShape(wallShape);
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0),Math.PI/2);
  wallBody.position.set(-50, 50, 0);
  world.addBody(wallBody);

  var light;
  var torch;
  var torchgeometry = new THREE.SphereGeometry( 1, 16, 16 );
  var torchmaterial = new THREE.MeshBasicMaterial( { color: "rgb(241, 148, 61)" } );
  var positions = [35, -15];
  for (var i in positions) {

    light = new THREE.PointLight( "rgb(241, 148, 61)", 0.4, 80 );
    light.position.set( -40, 25, positions[i] );
    scene.add( light );
    torch = new THREE.Mesh( torchgeometry, torchmaterial );
    torch.position.set( -50, 25, positions[i]);
    scene.add( torch );
  }

  var geometry = new THREE.BoxGeometry( 10, 40, 40 );
  var wallTex = new THREE.TextureLoader().load('textures/bricks.png');
  var material = new THREE.MeshLambertMaterial( { map: wallTex } );

  var boxShape = new CANNON.Box(new CANNON.Vec3(5,20,20));

  var wall = new THREE.Mesh( geometry, material );
  wall.position.set(-54.999, 20, 10);
  wall.castShadow = true;
  scene.add( wall );

  var boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(-60, 20, 10);
  world.add(boxBody)

  material = new THREE.MeshLambertMaterial( {color: "rgb(177, 177, 177)", map: wallTex } );
  wall = new THREE.Mesh( geometry, material );
  wall.rotation.y = Math.PI/2;
  wall.position.set(0, 20, -150);
  wall.castShadow = true;
  scene.add( wall );

  boxShape = new CANNON.Box(new CANNON.Vec3(20,20,5));
  boxBody = new CANNON.Body({ mass: 0 });
  boxBody.addShape(boxShape);
  boxBody.position.set(0, 20, -150);
  boxBody.name = "levelEnd";
  world.add(boxBody)
}
