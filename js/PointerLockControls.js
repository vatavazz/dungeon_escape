/**
 * @author mrdoob / http://mrdoob.com/
 * edited by vatavazz
 */
 // pass the camera, the player object, the x y and z position of the controls, and lvl > 1
 var PointerLockControls = function ( camera, player, x, y, z, change ) {
  var eyeYPos = 10;
  var velocityFactor = 1.5;
  var jumpVelocity = 80;
  var scope = this;
  var isMoving = true;

  var pitchObject = new THREE.Object3D();
  pitchObject.add( camera );

  var yawObject = new THREE.Object3D();
  yawObject.position.x = x;
	yawObject.position.y = y+10;
	yawObject.position.z = z;
  yawObject.add( pitchObject );

  var quat = new THREE.Quaternion();
  var iQuat = new THREE.Quaternion();

  var moveForward = false;
  var moveBackward = false;
  var moveLeft = false;
  var moveRight = false;

  var canJump = false;

  var contactNormal = new CANNON.Vec3();
  var upAxis = new CANNON.Vec3(0,1,0);
  var contactNormal = new CANNON.Vec3();
  var upAxis = new CANNON.Vec3(0,1,0);
  player.addEventListener("collide",function(e){
    var contact = e.contact;
    if(contact.bi.id == player.id) contact.ni.negate(contactNormal);
    else contactNormal.copy(contact.ni);
    if(contactNormal.dot(upAxis) > 0.5) canJump = true;
  });

  var velocity = player.velocity;

  var PI_2 = Math.PI / 2;

  var onMouseMove = function ( event ) {
    if ( scope.enabled === false ) return;

    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;

    pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
  };

  var onKeyDown = function ( e ) {
    switch ( e.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = true;
        isMoving = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true;
        isMoving = true;
				break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        isMoving = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        isMoving = true;
        break;
      case 32: // space
        if (canJump) velocity.y = jumpVelocity;
        canJump = false;
        break;
    }
  };
  var onKeyUp = function ( e ) {
    switch( e.keyCode ) {
      case 38: // up
      case 87: // w
        moveForward = false;
        isMoving = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        isMoving = false;
        break;
      case 40: // down
      case 83: // a
        moveBackward = false;
        isMoving = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        isMoving = false;
        break;
    }
  };

  document.addEventListener( 'mousemove', onMouseMove, false );
  document.addEventListener( 'keydown', onKeyDown, false );
  document.addEventListener( 'keyup', onKeyUp, false );

  this.enabled = false;
  if (change) this.enabled = true;

  this.getObject = function () { return yawObject; };

  this.getDirection = function (targetVec) {
    targetVec.set(0,0,-1);
    quat.multiplyVector3(targetVec);
  }

  var inputVelocity = new THREE.Vector3();
  var euler = new THREE.Euler();
  var vel = new THREE.Vector3();

  this.update = function (delta) {
		if ( !this.enabled ) return;

		delta *= 0.1;

		inputVelocity.set(0,0,0);

		if ( moveForward ) inputVelocity.z = -velocityFactor * delta;
		if ( moveBackward ) inputVelocity.z = velocityFactor * delta;
		if ( moveLeft ) inputVelocity.x = -velocityFactor * delta;
		if ( moveRight ) inputVelocity.x = velocityFactor * delta;

    if (moveRight || moveLeft || moveBackward || moveForward) steps.play();

		euler.x = pitchObject.rotation.x;
		euler.y = yawObject.rotation.y;
		euler.order = "XYZ";
		quat.setFromEuler(euler);

    iQuat.copy(quat);
    iQuat.inverse();
    var tempVel = new THREE.Vector3();

		inputVelocity.applyQuaternion(quat);

		velocity.x += inputVelocity.x;
		velocity.z += inputVelocity.z;

    // get rid of momentum after stopping
    tempVel.copy(velocity);
    tempVel.applyQuaternion(iQuat);
    if (!moveForward && !moveBackward && canJump) tempVel.z = 0;
    if (!moveLeft && !moveRight && canJump) tempVel.x = 0;
    tempVel.applyQuaternion(quat);
    velocity.set(tempVel.x, velocity.y, tempVel.z);

		yawObject.position.copy(player.position);
    yawObject.position.y+=10;
	};
};
