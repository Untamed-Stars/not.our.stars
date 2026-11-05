import * as THREE from 'three';

// ========================================
// SCENE
// ========================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x080d18);

// ========================================
// CAMERA
// ========================================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);

camera.position.set(0, 2, 6);

// ========================================
// RENDERER
// ========================================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.75)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

document.getElementById("world").appendChild(
    renderer.domElement
);

// ========================================
// LIGHTING
// ========================================

const ambient = new THREE.HemisphereLight(
    0xb8d8ff,
    0x25202b,
    1.5
);

scene.add(ambient);

const sunlight = new THREE.DirectionalLight(
    0xffffff,
    2
);

sunlight.position.set(-30, 50, 20);

scene.add(sunlight);

// ========================================
// TEST ENVIRONMENT
// ========================================

const groundGeometry = new THREE.PlaneGeometry(
    1000,
    1000
);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x303b32,
    roughness: 0.95
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;

scene.add(ground);

// ========================================
// RESIZE
// ========================================

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

// ========================================
// MAIN LOOP
// ========================================

function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

}

animate();
