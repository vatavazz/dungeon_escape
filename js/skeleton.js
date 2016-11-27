var skeleton = function (x, y, z) {
  var scope = this;

  var skeletonShape = new CANNON.Sphere( 5 );
  var geometry = new THREE.SphereGeometry( 5, 32, 32 );
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );

      // @kdz Skeletons need to have a health component, too.
    this.health = 20;

    var skele = new CANNON.Body({ mass: 4 });
  skele.addShape(skeletonShape);
  skele.position.set(x, y, z);
  skele.linearDamping = 0.98;
  world.addBody(skele);

  var sphere = new THREE.Mesh( geometry, material );
  sphere.position.set(x, y, z);
  scene.add( sphere );

  var velocity = skele.velocity;
  // @kdz Fixed it so it returns an object (it used to return a function).
  this.getSkeleton = function () { return this; };
  this.getMesh = function () { return sphere; };
  this.getBody = function() { return skele; };

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
      // @If the enemy is close to the player, make them chase her.
        var directionVector = new THREE.Vector3().subVectors(sphere.position, controls.getObject().position);
        var distanceToPlayer = directionVector.length();
        directionVector.normalize();
        var rayCaster = new THREE.Raycaster(controls.getObject().position, directionVector, 0, distanceToPlayer);
        
        var intersections = rayCaster.intersectObject(levelGeometry, true);
        
        if(intersections.length == 0) {
            // @kdz No collision with the level's geometry - the enemy can see the player. They should start chasing her.
            euler.setFromVector3(directionVector);
            inputVelocity.z = -velocityFactor * delta;
            inputVelocity.z = velocityFactor * delta;
            inputVelocity.x = -velocityFactor * delta;
            inputVelocity.x = velocityFactor * delta;
            
            quat.setFromEuler(euler);
            inputVelocity.applyQuaternion(quat);
            
            velocity.x = inputVelocity.x * 2;
            velocity.z = inputVelocity.z * 2;
            sphere.position.copy(skele.position);
            return;
        }
        
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

// @kdz Detect and resolve collisions between the player's projectiles and the skeletons.
function checkSkeletonCollisions() {
    if(ais.length <= 0) return;
    var s = ais;
    var i = 0;
    while(i < s.length) {
        var skeletonBox = new THREE.Box3().setFromObject(s[i].getMesh());
        var j = 0;
        var p = heroProjectiles.fireballs;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            if(projectileBox.intersectsBox(skeletonBox)) {
                console.log("COLLISION");
                s[i].getSkeleton().health -= 10;
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }
        
        j = 0;
        p = heroProjectiles.frostbolts;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            if(projectileBox.intersectsBox(skeletonBox)) {
                console.log("COLLISION");
                s[i].getSkeleton().health -= 10;
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }
        if(s[i].getSkeleton().health <= 0) {
            console.log("Dead (again) skeleton");
            scene.remove(s[i].getMesh());
            world.remove(s[i].getBody());
            s.splice(i, 1);
        } else {
            i++;
        }
    }        
}