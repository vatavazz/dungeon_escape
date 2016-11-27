"use strict";

// Disappearing object: if all the torches related to it are lit, it is visible and a part of the world. If any of the torches is extinguished, it disappears. Exciting!
function DisappearingObject(position, physicalObject, body, ...torches) {
    physicalObject.position.copy(position);
    body.position.copy(position);
    this.object = physicalObject;
    this.body = body;
    this.torches = torches;
    if(this.checkTorches()) {
        this.appear();
    } else {
        this.disappear();
    }
    
    disappearingObjects.push(this);
}

// Checks if all torches related to this object are lit. If they are, returns true, else returns false.
DisappearingObject.prototype.checkTorches = function() {
    for(var i = 0; i < this.torches.length; i++) {
        if(!this.torches[i].onFire) {
            return false;
        }
    }
    return true;
}

DisappearingObject.prototype.disappear = function() {
    this.state = "invisible";
    levelGeometry.remove(this.object);
    // @kdzTODO Not sure if this will work.
    world.removeBody(this.body);
}

DisappearingObject.prototype.appear = function() {
    this.state = "visible";
    levelGeometry.add(this.object);
    // @kdzTODO Same thing.
    world.add(this.body);
}

// Updates the DisappearingObject's state.
DisappearingObject.prototype.update = function() {
    switch(this.state) {
        case "visible":
            if(!this.checkTorches()) {
                this.disappear();
            }
            break;
        case "invisible":
            if(this.checkTorches()) {
                this.appear();
            }
            break;
    }
}

function updateDisappearingObjects() {
    for(var i = 0; i < disappearingObjects.length; i++) {
        disappearingObjects[i].update();
    }
}