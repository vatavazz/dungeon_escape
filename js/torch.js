const TORCH_INTENSITY = 0.25;

// @kdz Creates and returns a torch Object3D, nicely positioned (right above y = 0) and rotated so that during any further transformations we don't need to concern ourselves with its size.
function createTorch(position, rotationY, onFire) {
    var torchTopGeometry = new THREE.BoxGeometry(1, 1.5, 1);
    var torchHandleGeometry = new THREE.BoxGeometry(1, 4, 1);
    var torchTopMaterial = new THREE.MeshBasicMaterial({color: 0xffeaa8});
    var torchHandleMaterial = new THREE.MeshBasicMaterial({color: 0x663300});
    var torchTop = new THREE.Mesh(torchTopGeometry, torchTopMaterial);
    var torchHandle = new THREE.Mesh(torchHandleGeometry, torchHandleMaterial);
    torchHandle.position.y += 2;
    torchTop.position.y += 4.75;
    var torch = new THREE.Object3D();
    torch.add(torchTop);
    torch.add(torchHandle);
    // Give the torch some light.
    var light = new THREE.PointLight(0xff6600, TORCH_INTENSITY, 100);
    light.position.copy(torchHandle.position);
    light.position.x += 1.5;
    torch.add(light);
    torch.light = light; // For easier access.
    torch.rotation.z += 22.5 * Math.PI/180;
    torch.rotation.y = rotationY * Math.PI/180;
    
    // Set up logic for lighting up/extinguishing the torch.
    // torch["onFire"] = onFire;
    if(onFire) {
        lightTorch(torch);
    } else {
        extinguishTorch(torch);
    }
    
    torch.position.copy(position);
    torches.push(torch);
    scene.add(torch);

    return torch;
}

// @kdz Function to light torches.
function lightTorch(torch) {
    torch.onFire = true;
    torch.children[0].material.color.set(0xff3300);
    torch.light.intensity = 0.5;
}

// @kdz Function to extuinguish torches.
function extinguishTorch(torch) {
    torch.onFire = false;
    torch.children[0].material.color.set(0xffeaa8);
    torch.light.intensity = 0;
}