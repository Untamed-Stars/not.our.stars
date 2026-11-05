import * as THREE from 'three';
import { PlayerController } from './player.js';
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
// PLAYER CONTROLLER
// ========================================

const player = new PlayerController(
    camera,
    renderer.domElement,
    scene,
    {
        gravity: 24,
        groundY: -1
    }
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

// Ground

const groundGeometry = new THREE.PlaneGeometry(500, 500);

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x52604c,
    roughness: 1
});

const ground = new THREE.Mesh(
    groundGeometry,
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;

scene.add(ground);

// Grid

const grid = new THREE.GridHelper(
    500,
    100,
    0x9aab8b,
    0x64745e
);

grid.position.y = -0.98;

scene.add(grid);

// Reference pillars

function createPillar(x, z, color) {

    const geometry = new THREE.BoxGeometry(2, 5, 2);

    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.7
    });

    const pillar = new THREE.Mesh(
        geometry,
        material
    );

    pillar.position.set(x, 1.5, z);

    scene.add(pillar);

}

createPillar(0, -15, 0xff4444);
createPillar(15, 0, 0x4488ff);
createPillar(-15, 0, 0x44ff88);
createPillar(0, 15, 0xffcc44);


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
// MAIN GAME LOOP
// ========================================

let previousTime = performance.now();

function animate(now) {

    requestAnimationFrame(animate);

    const dt = Math.min(
        (now - previousTime) / 1000,
        0.05
    );

    previousTime = now;

    // Update player physics.

    player.update(dt);

    // Render scene.

    renderer.render(scene, camera);

}

requestAnimationFrame(animate);
