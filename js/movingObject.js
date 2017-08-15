"use strict";

// Moving objects: lighting or extinguishing torches related to it makes it move from one place to another. It doesn't teleport (though it could, why not, possible @kdzTODO), but instead moves smoothly between locations.
function MovingObject(positionA, positionB, startState, physicalObject, body, speed, ...torches) {
    this.A = positionA; // A is the "torches lit" position.
    this.B = positionB; // B is the "torches not lit" position.
    this.torches = torches;
    this.speed = speed; // Speed of going from A to B and vice-versa.
    
    // Set up the physical object that will represent this MovingObject in the scene.
    if(this.checkTorches()) {
        this.state = "A";
        physicalObject.position.copy(this.A);
        body.position.copy(this.A);
    } else {
        this.state = "B";
        physicalObject.position.copy(this.B);
        body.position.copy(this.B);
    }
    this.velocity = new THREE.Vector3(0, 0, 0);
    levelGeometry.add(physicalObject);
    world.add(body);
    this.object = physicalObject;
    this.body = body;
    
    movingObjects.push(this);
    levelGeometry.add(this.object);
    world.add(this.body);
}

// Same as with DisappearingObject's checkTorches function - true if all are lit, false if any of them are not.
MovingObject.prototype.checkTorches = function() {
    for(var i = 0; i < this.torches.length; i++) {
        if(!this.torches[i].onFire) {
            return false;
        }
    }
    return true;
}

MovingObject.prototype.startMovingToA = function() {
    var directionVector = new THREE.Vector3();
    directionVector.copy(this.A);
    directionVector.sub(this.B);
    directionVector.normalize();
    directionVector.multiplyScalar(this.speed);
    this.velocity.copy(directionVector);
}

MovingObject.prototype.startMovingToB = function() {
    var directionVector = new THREE.Vector3();
    directionVector.copy(this.B);
    directionVector.sub(this.A);
    directionVector.normalize();
    directionVector.multiplyScalar(this.speed);
    this.velocity.copy(directionVector);
}

MovingObject.prototype.changeDirection = function() {
    this.velocity.negate();
}

// Updates the MovingObject's state
MovingObject.prototype.update = function(deltaTime) {
    switch(this.state) {
        case "A":
            if(!this.checkTorches()) {
                this.startMovingToB();
                this.state = "MovingToB";
            }
            break;
        case "B":
            if(this.checkTorches()) {
                this.startMovingToA();
                this.state = "MovingToA";
            }
            break;
        case "MovingToA":
            if(!this.checkTorches()) {
                this.changeDirection();
                this.state = "MovingToB";
            } else {
                // We calculate the difference between the objects current and target positions.
                var positionDifference = new THREE.Vector3();
                positionDifference.subVectors(this.object.position, this.A);
                // If it is close enough, it should stop moving. @kdzTODO: get rid of the magic number?
                if(positionDifference.length() <= 1 /* Fudge factor */) {
                    this.velocity.set(0, 0, 0);
                    this.object.position.copy(this.A); // We make sure the object is precisely where we want it.
                    this.body.position.copy(this.A);
                    this.state = "A";
                } else {
                    this.object.position.addScaledVector(this.velocity, deltaTime);
                    // @kdz This is terrible.
                    this.body.position.copy(this.object.position.x,
                                            this.object.position.y,
                                            this.object.position.z);
                }
            }
            break;
        case "MovingToB":
            if(this.checkTorches()) {
                this.changeDirection();
                this.state = "MovingToA";
            } else {
                var positionDiff = new THREE.Vector3();
                positionDiff.subVectors(this.object.position, this.B);
                if(positionDiff.length() <= 1) {
                    this.velocity.set(0, 0, 0);
                    this.object.position.copy(this.B);
                    this.body.position.copy(this.B);
                    this.state = "B";
                } else {
                    this.object.position.addScaledVector(this.velocity, deltaTime);
                    // @kdz This is terrible.
                    this.body.position.copy(this.object.position.x,
                                            this.object.position.y,
                                            this.object.position.z);
                }
            }
            break;
    }
}

function updateMovingObjects(deltaTime) {
    for(var i = 0; i < movingObjects.length; i++) {
        movingObjects[i].update(deltaTime);
    }
}