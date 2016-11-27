var skeleton = function (x, y, z) {
  var scope = this;

  var skeletonShape = new CANNON.Sphere( 5 );
  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

  var skele = new CANNON.Body({ mass: 4 });
  skele.addShape(skeletonShape);
  skele.position.set(x, y, z);
  skele.linearDamping = 0.98;
  world.addBody(skele);

  var sphere = new THREE.Mesh( geometry, material );
  sphere.position.set(x, y, z);
  scene.add( sphere );

  var velocity = skele.velocity;
  this.getSkeleton = function () { return skeleton; };
  this.getMesh = function () { return sphere; };

  skele.addEventListener("collide",function(e){
    if (e.body.name == 'player')
      dealDamage(10);
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

    euler.order = "XYZ";
    quat.setFromEuler(euler);
    inputVelocity.applyQuaternion(quat);

    velocity.x += inputVelocity.x;
    velocity.z += inputVelocity.z;

    sphere.position.copy(skele.position);
  };
}
