"use strict";

// @kdz CONSTANTS
const SHOOTING_INTERVAL = 1.25;
const MAGIC_SPEED = 0.125;
const NOT_IN_YOUR_FACE = 10;
var player;

function shoot(type) {
    if(projectileClock.running && projectileClock.getElapsedTime() < SHOOTING_INTERVAL) {
        return;
    }
    projectileClock.start();
    const projectileGeometry = new THREE.BoxGeometry(1, 1, 1);
    const fireballMaterial = new THREE.MeshBasicMaterial({color: 0xff3300});
    const frostboltMaterial = new THREE.MeshBasicMaterial({color: 0x66a3ff});
    var projectile = new THREE.Object3D();
    switch(type) {
        case "fireball":
            projectile.add(new THREE.Mesh(projectileGeometry, fireballMaterial));
            heroProjectiles.fireballs.push(projectile);
            break;
        case "frostbolt":
            projectile.add(new THREE.Mesh(projectileGeometry, frostboltMaterial));
            heroProjectiles.frostbolts.push(projectile);
            break;
    }
    projectile.velocity = new THREE.Vector3();


    // controls.getDirection(projectile.velocity);
    var dirVec = new THREE.Vector3();
    dirVec.set(0,0,1);
    dirVec.unproject(camera);
    var ray = new THREE.Ray(controls.getObject().position, dirVec.sub(controls.getObject().position).normalize() );
    dirVec.copy(ray.direction);
    console.log(dirVec);
    projectile.position.copy(controls.getObject().position);
    projectile.velocity.copy(dirVec);
    projectile.velocity.multiplyScalar(MAGIC_SPEED);

    // We don't want to obstruct the player's view with the projectile, so we move it a bit forward.
    var notInYourFace = new THREE.Vector3();
    controls.getDirection(notInYourFace);
    notInYourFace.normalize();
    // projectile.position.addScaledVector(notInYourFace, NOT_IN_YOUR_FACE);

    scene.add(projectile);
}

function updateHeroProjectiles(deltaTime) {
    // Update fireballs.
    var p = heroProjectiles.fireballs;
    for(var i = 0; i < p.length; i++) {
        p[i].position.addScaledVector(p[i].velocity, deltaTime);
    }

    // Update frostbolts.
    p = heroProjectiles.frostbolts;
    for(var i = 0; i < p.length; i++) {
        p[i].position.addScaledVector(p[i].velocity, deltaTime);
    }
}

// @kdz Detect and resolve collisions between the player's projectiles and other objects in the world.
function checkHeroProjectileCollisions() {
    // Check collisions between projectiles and level geometry
    var p;
    var geometry = levelGeometry.children;
    for(var i = 0; i < geometry.length; i++) {
        var levelBox = new THREE.Box3().setFromObject(geometry[i]);
        var j = 0;
        p = heroProjectiles.fireballs;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            if(projectileBox.intersectsBox(levelBox)) {
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
            if(projectileBox.intersectsBox(levelBox)) {
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }
    }

    // Check collisions between projectiles and torches
    for(var i = 0; i < torches.length; i++) {
        var torchBox = new THREE.Box3().setFromObject(torches[i]);
        var j = 0;
        p = heroProjectiles.fireballs;
        while(j < p.length) {
            var projectileBox = new THREE.Box3().setFromObject(p[j]);
            // console.log(torchBox, projectileBox);
            if(projectileBox.intersectsBox(torchBox)) {
                lightTorch(torches[i]);
                // We need to remove the projectile from the scene and from the game's logic
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
            if(projectileBox.intersectsBox(torchBox)) {
                extinguishTorch(torches[i]);
                scene.remove(p[j]);
                p.splice(j, 1);
            } else {
                j++;
            }
        }
    }
}
