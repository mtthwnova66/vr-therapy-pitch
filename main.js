// Import Three.js module from CDN
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// Basic variables for scene setup
let scene, camera, renderer;

const canvas = document.getElementById("arachnoCanvas");

init();

function init() {
  // 1. Create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020); // dark background

  // 2. Create the camera
  camera = new THREE.PerspectiveCamera(
    75,                         // Field of view
    canvas.clientWidth / canvas.clientHeight,  // Aspect ratio
    0.1,                        // Near clipping plane
    1000                        // Far clipping plane
  );
  camera.position.z = 5; // Pull the camera back a bit

  // 3. Create the renderer and connect it to the canvas
  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // 4. Add a simple light so we can see things
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(3, 5, 2);
  scene.add(light);

  // 5. Render loop (empty for now)
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
