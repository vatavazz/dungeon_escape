"use strict";

// Trigger: object that will represent a trigger in the environment - when you walk through it, something happens!
function Trigger(position, size, behavior, oneTime, interval = 0, ...objects) {
    this.position = position;
    this.size = size;
    this.behavior = behavior; // Function that will determine what happens to the trigger's related objects when the player walks through it.
    this.oneTime = oneTime; // Whether the trigger works just once or is toggled on and off.
    this.objects = objects // An array of objects that will be affected by the trigger being, well, triggered.
    
    // The trigger can have a timer associated with it - it will stop it from, for example, triggering multiple times if a player steps on it only once.
    if(interval != 0) {
        this.timer = new THREE.Clock(false);
        this.interval = interval;
    } else {
        this.timer = null;
        this.interval = null;
    }
    
    // Add the trigger to the global array of all triggers.
    triggers.push(this);
}

Trigger.prototype.checkTrigger = function() {
    // If the trigger uses an interval timer and not enough time has passed since it was last triggered, it shouldn't be triggered.
    if(this.timer && this.timer.running && this.timer.getElapsedTime() < this.interval) {
        return;
    }
    
    var position = this.position;
    var halfSize = this.size/2;
    var tLeft = position.x - halfSize;
    var tRight = position.x + halfSize;
    var tTop = position.z - halfSize;
    var tBottom = position.z + halfSize;
    var heroPosition = controls.getObject().position;
    
    if(heroPosition.x < tLeft) return false;
    if(heroPosition.x > tRight) return false;
    if(heroPosition.z > tBottom) return false;
    if(heroPosition.z < tTop) return false;
    
    // If it has an interval timer, we should start it now.
    if(this.timer) {
        this.timer.start();
    }
    return true;
}

// Checks all the triggers for, uhm, triggeration.
// @kdzTODO: Move this somewhere else OR move triggers here?
function checkTriggers() {
    var i = 0;
    while(i < triggers.length) {
        if(triggers[i].checkTrigger()) {
            triggers[i].behavior();
            if(triggers[i].oneTime) {
                triggers.splice(i, 1);
                continue;
            }
        }
        i++;
    }
}