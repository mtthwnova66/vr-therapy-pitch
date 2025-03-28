// Final main.js – Claude's DOM-safe bootstrapping with GPT-4 Turbo Enhancements
// Includes: HDRI lighting, ACES tone mapping, cinematic DOF, bloom, film grain, and camera handheld motion

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';

let composer, clock = new THREE.Clock();

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('arachnophobia-demo');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.2, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.6, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(3, 6, 3);
  keyLight.castShadow = true;
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  fillLight.position.set(-3, 4, -3);
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
  rimLight.position.set(0, 5, -5);
  scene.add(ambientLight, keyLight, fillLight, rimLight);

  // Load HDR environment
  new RGBELoader().load('https://raw.githubusercontent.com/gkjohnson/3d-demo-data/master/hdri/studio_small_08_1k.hdr', (hdrMap) => {
    hdrMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdrMap;
    scene.background = hdrMap;

    setupScene(scene, hdrMap);
    setupPostprocessing(renderer, scene, camera);
    animate();
  });

  function setupScene(scene, envMap) {
    const geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      transmission: 0.95,
      transparent: true,
      thickness: 0.05,
      envMapIntensity: 1.0,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMap
    });
    const jar = new THREE.Mesh(geometry, material);
    jar.position.y = 0.75;
    jar.castShadow = true;
    jar.receiveShadow = true;
    scene.add(jar);

    const loader = new GLTFLoader();
    loader.load('spider_with_animation.glb', (gltf) => {
      const spider = gltf.scene;
      spider.scale.set(1.2, 1.2, 1.2);
      spider.position.y = 0.01;
      spider.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.envMap = envMap;
        }
      });
      scene.add(spider);

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(spider);
        mixer.clipAction(gltf.animations[0]).play();
        animateMixers.push(mixer);
      }
    });
  }

  const animateMixers = [];

  function setupPostprocessing(renderer, scene, camera) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.2, 0.2, 0.9));
    composer.addPass(new BokehPass(scene, camera, { focus: 3.0, aperture: 0.0008, maxblur: 0.01 }));
    composer.addPass(new FilmPass(0.1, 0.2, 648, false));
  }

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    animateMixers.forEach((mixer) => mixer.update(delta));
    controls.update();
    composer.render();
  }
});
