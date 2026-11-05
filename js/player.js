
import * as THREE from 'three';

// ========================================
// PLAYER CONFIGURATION
// ========================================

export class PlayerController {

    constructor(camera, renderer, scene, options = {}) {

        this.camera = camera;
        this.renderer = renderer;
        this.scene = scene;

        // ------------------------------------
        // PLAYER SETTINGS
        // ------------------------------------

        this.eyeHeight = 1.7;
        this.groundY = options.groundY ?? -1;

        this.gravity = options.gravity ?? 24;

        this.moveSpeed = 7;
        this.acceleration = 30;
        this.airControl = 0.35;

        this.jumpVelocity = 8.5;

        // ------------------------------------
        // JETPACK SETTINGS
        // ------------------------------------

        this.jetpackAcceleration = 18;

        this.maxJetpackFuel = 100;
        this.jetpackFuel = 100;

        this.jetpackConsumption = 24;
        this.jetpackRecharge = 14;

        this.jetpackActive = false;

        // ------------------------------------
        // PLAYER PHYSICS
        // ------------------------------------

        this.position = new THREE.Vector3(
            0,
            this.groundY,
            6
        );

        this.velocity = new THREE.Vector3(0, 0, 0);

        this.grounded = false;

        this.yaw = 0;
        this.pitch = 0;

        this.mouseSensitivity = 0.002;

        // ------------------------------------
        // INPUT
        // ------------------------------------

        this.keys = {};

        this.jumpQueued = false;

        // ------------------------------------
        // CAMERA RIG
        // ------------------------------------

        this.rig = new THREE.Group();

        this.pitchPivot = new THREE.Group();

        this.rig.add(this.pitchPivot);
        this.pitchPivot.add(this.camera);

        this.camera.position.set(0, 0, 0);
        this.camera.rotation.set(0, 0, 0);

        this.scene.add(this.rig);

        // ------------------------------------
        // INITIAL POSITION
        // ------------------------------------

        this.updateCameraPosition();

        // ------------------------------------
        // EVENT LISTENERS
        // ------------------------------------

        this.setupInput();

    }

    // ========================================
    // INPUT SETUP
    // ========================================

    setupInput() {

        // KEY DOWN

        window.addEventListener("keydown", (event) => {

            if (
                event.code === "Space" ||
                event.code.startsWith("Arrow")
            ) {
                event.preventDefault();
            }

            if (event.repeat) return;

            this.keys[event.code] = true;

            if (event.code === "Space") {
                this.jumpQueued = true;
            }

        });

        // KEY UP

        window.addEventListener("keyup", (event) => {

            this.keys[event.code] = false;

        });

        // MOUSE LOCK

        this.renderer.addEventListener("click", () => {

            if (
                document.pointerLockElement !== this.renderer
            ) {
                this.renderer.requestPointerLock();
            }

        });

        // MOUSE LOOK

        document.addEventListener("mousemove", (event) => {

            if (
                document.pointerLockElement !== this.renderer
            ) return;

            this.yaw -= event.movementX * this.mouseSensitivity;

            this.pitch -= event.movementY * this.mouseSensitivity;

            const limit = Math.PI / 2 - 0.01;

            this.pitch = THREE.MathUtils.clamp(
                this.pitch,
                -limit,
                limit
            );

            this.rig.rotation.y = this.yaw;

            this.pitchPivot.rotation.x = this.pitch;

        });

    }

    // ========================================
    // PLANET GRAVITY
    // ========================================

    setGravity(value) {

        this.gravity = Math.max(0, value);

    }

    // ========================================
    // JUMP
    // ========================================

    jump() {

        if (!this.grounded) return;

        this.velocity.y = this.jumpVelocity;

        this.grounded = false;

    }

    // ========================================
    // JETPACK
    // ========================================

    useJetpack(dt) {

        if (!this.keys.KeyX) return;

        if (this.grounded) return;

        if (this.jetpackFuel <= 0) return;

        this.jetpackActive = true;

        this.velocity.y += this.jetpackAcceleration * dt;

        this.jetpackFuel -= this.jetpackConsumption * dt;

        this.jetpackFuel = Math.max(
            0,
            this.jetpackFuel
        );

    }

    rechargeJetpack(dt) {

        if (!this.grounded) return;

        this.jetpackFuel += this.jetpackRecharge * dt;

        this.jetpackFuel = Math.min(
            this.maxJetpackFuel,
            this.jetpackFuel
        );

    }

    refillJetpack() {

        this.jetpackFuel = this.maxJetpackFuel;

    }

    // ========================================
    // HORIZONTAL MOVEMENT
    // ========================================

    updateMovement(dt) {

        let inputX = 0;
        let inputZ = 0;

        if (this.keys.KeyW) inputZ -= 1;
        if (this.keys.KeyS) inputZ += 1;

        if (this.keys.KeyA) inputX -= 1;
        if (this.keys.KeyD) inputX += 1;

        // Prevent diagonal movement from being faster.

        const input = new THREE.Vector2(
            inputX,
            inputZ
        );

        if (input.lengthSq() > 1) {
            input.normalize();
        }

        // Convert movement into camera-relative movement.

        const forward = new THREE.Vector3(
            -Math.sin(this.yaw),
            0,
            -Math.cos(this.yaw)
        );

        const right = new THREE.Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        );

        const direction = new THREE.Vector3();

        direction.addScaledVector(forward, -inputZ);
        direction.addScaledVector(right, inputX);

        // Desired horizontal velocity.

        direction.multiplyScalar(this.moveSpeed);

        // Ground movement has stronger control than air movement.

        const control = this.grounded
            ? 1
            : this.airControl;

        const maxChange = this.acceleration * control * dt;

        const currentHorizontal = new THREE.Vector3(
            this.velocity.x,
            0,
            this.velocity.z
        );

        currentHorizontal.lerp(
            direction,
            Math.min(1, maxChange / Math.max(
                currentHorizontal.distanceTo(direction),
                0.0001
            ))
        );

        this.velocity.x = currentHorizontal.x;
        this.velocity.z = currentHorizontal.z;

    }

    // ========================================
    // GRAVITY
    // ========================================

    updateGravity(dt) {

        if (!this.grounded) {

            this.velocity.y -= this.gravity * dt;

        }

    }

    // ========================================
    // GROUND COLLISION
    // ========================================

    updateGroundCollision() {

        this.grounded = false;

        if (this.position.y <= this.groundY) {

            this.position.y = this.groundY;

            if (this.velocity.y < 0) {
                this.velocity.y = 0;
            }

            this.grounded = true;

        }

    }

    // ========================================
    // CAMERA POSITION
    // ========================================

    updateCameraPosition() {

        this.rig.position.set(
            this.position.x,
            this.position.y + this.eyeHeight,
            this.position.z
        );

    }

    // ========================================
    // MAIN PLAYER UPDATE
    // ========================================

    update(dt) {

        // Prevent physics spikes from large frame times.

        dt = Math.min(dt, 0.05);

        this.updateGroundCollision();

        // Jump request.

        if (this.jumpQueued) {

            this.jump();

            this.jumpQueued = false;

        }

        // Movement.

        this.updateMovement(dt);

        // Gravity.

        this.updateGravity(dt);

        // Jetpack.

        this.jetpackActive = false;

        this.useJetpack(dt);

        // Fuel recharge.

        this.rechargeJetpack(dt);

        // Integrate velocity into position.

        this.position.addScaledVector(
            this.velocity,
            dt
        );

        // Resolve ground collision.

        this.updateGroundCollision();

        // Update camera.

        this.updateCameraPosition();

    }

}
