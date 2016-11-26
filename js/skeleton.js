var skeleton = function (x, z) {
  var scope = this;

  var skeletonShape = new CANNON.Sphere( 5 );
  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

  var skeleton = new CANNON.Body({ mass: 4 });
  skeleton.addShape(skeletonShape);
  skeleton.position.set(0, 5, 0);
  skeleton.linearDamping = 0.98;
  world.addBody(skeleton);
  var sphere = new THREE.Mesh( geometry, material );
  sphere.position.set(x, 5, z);
  scene.add( sphere );

  var velocity = skeleton.velocity;
  this.getSkeleton = function () { return skeleton; };
  this.getMesh = function () { return sphere; };

  skeleton.addEventListener("collide",function(e){
    if (e.body.name == 'player')
      console.log("EATEN BY SKELETON");
  });

  var velocityFactor = 0.5;
  var inputVelocity = new THREE.Vector3();
  var quat = new THREE.Quaternion();
  var euler = new THREE.Euler();
  var rotationClock = new THREE.Clock();

  // pick random direction
  euler.y = Math.random() * 2*Math.PI;

  this.update = function (delta) {
    if (rotationClock.getElapsedTime() > 1.5) {
      euler.y = Math.random() * 2*Math.PI;
      rotationClock.start();
    }
    delta *= 0.1;
    inputVelocity.set(0,0,0);

    inputVelocity.z = -velocityFactor * delta;
    inputVelocity.z = velocityFactor * delta;
    inputVelocity.x = -velocityFactor * delta;
    inputVelocity.x = velocityFactor * delta;

    // euler.x = pitchObject.rotation.x;
    // euler.y = yawObject.rotation.y;
    euler.order = "XYZ";
    // // get rid of gimble lock
    quat.setFromEuler(euler);
    inputVelocity.applyQuaternion(quat);

    velocity.x += inputVelocity.x;
    velocity.z += inputVelocity.z;

    sphere.position.copy(skeleton.position);
  };
}
