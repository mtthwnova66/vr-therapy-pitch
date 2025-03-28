// Hyperrealistic Spider in Jar Scene
// Full main.js file with advanced effects and realism

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing hyperrealistic Three.js scene...');

  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }

  const requiredLibraries = [
    'THREE', 
    'THREE.GLTFLoader', 
    'THREE.OrbitControls', 
    'THREE.EffectComposer', 
    'THREE.RenderPass', 
    'THREE.UnrealBloomPass', 
    'THREE.FilmPass',
    'THREE.BokehPass'
  ];

  const missingLibraries = requiredLibraries.filter(lib => {
    const parts = lib.split('.');
    return parts.length === 1 
      ? (typeof window[parts[0]] === 'undefined')
      : (typeof window[parts[0]][parts[1]] === 'undefined');
  });

  if (missingLibraries.length > 0) {
    console.error(`Missing libraries: ${missingLibraries.join(', ')}`);
    container.innerHTML = `<p>Please load the following libraries: ${missingLibraries.join(', ')}</p>`;
    return;
  }

  try {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-status';
    loadingElement.style.position = 'absolute';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.color = '#333';
    loadingElement.style.fontSize = '16px';
    loadingElement.style.fontWeight = 'bold';
    loadingElement.textContent = 'Loading hyperrealistic scene...';
    loadingElement.style.zIndex = '100';
    container.appendChild(loadingElement);

    // Core Three.js setup (scene, camera, renderer)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;

    // Clock
    const clock = new THREE.Clock();
    let mixer = null;

    // Load full upgraded finalizeScene from canvas
    finalizeScene();

    function finalizeScene() {
      const composer = new THREE.EffectComposer(renderer);
      const renderPass = new THREE.RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.4, 0.45, 0.85
      );
      composer.addPass(bloomPass);

      const bokehPass = new THREE.BokehPass(scene, camera, {
        focus: 3.0,
        aperture: 0.00065,
        maxblur: 0.015
      });
      composer.addPass(bokehPass);

      const filmPass = new THREE.FilmPass(0.06, 0.2, 648, false);
      composer.addPass(filmPass);

      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 8, false);
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.05,
        roughness: 0.04,
        ior: 1.52,
        transmission: 0.95,
        thickness: 0.06,
        specularIntensity: 1.0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 1.5,
        reflectivity: 0.4
      });

      const fingerprintTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/gkjohnson/3d-demo-data/master/textures/smudges/smudges_01.jpg');
      fingerprintTexture.wrapS = fingerprintTexture.wrapT = THREE.RepeatWrapping;
      jarMaterial.roughnessMap = fingerprintTexture;
      jarMaterial.roughnessMap.repeat.set(3, 3);

      const realisticJar = new THREE.Mesh(jarGeometry, jarMaterial);
      realisticJar.position.y = 0.75;
      realisticJar.castShadow = true;
      realisticJar.receiveShadow = true;
      scene.add(realisticJar);

      const lidBase = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
      const lidRidges = new THREE.CylinderGeometry(0.87, 0.87, 0.02, 64);
      const scratchedMetal = new THREE.TextureLoader().load('https://raw.githubusercontent.com/gkjohnson/3d-demo-data/master/textures/roughness/roughness_metal_scratched.jpg');
      scratchedMetal.wrapS = scratchedMetal.wrapT = THREE.RepeatWrapping;
      scratchedMetal.repeat.set(10, 1);

      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.3,
        bumpMap: scratchedMetal,
        bumpScale: 0.008,
        envMap: scene.environment
      });

      const topLid = new THREE.Mesh(lidBase, lidMaterial);
      topLid.position.set(0, 1.55, 0);
      topLid.rotation.y = Math.PI * 0.03;
      topLid.castShadow = true;
      scene.add(topLid);

      const ridgedTop = new THREE.Mesh(lidRidges, lidMaterial);
      ridgedTop.position.set(0, 1.61, 0);
      ridgedTop.rotation.y = Math.PI * 0.03;
      ridgedTop.castShadow = true;
      scene.add(ridgedTop);

      // Twitch fallback
      let spiderTwitchAngle = 0;
      let spiderModel = scene.children.find(o => o.name && o.name.toLowerCase().includes('spider'));
      const twitchSpeed = 1.5;

      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin((clock.getElapsedTime() + i) * 0.1) * 0.0005;
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta * 0.01;
        }

        if (spiderModel && spiderModel.children) {
          spiderTwitchAngle += delta * twitchSpeed;
          const twitch = Math.sin(spiderTwitchAngle) * 0.05;
          spiderModel.children.forEach((part, idx) => {
            if (part.geometry && part.name === '') {
              part.rotation.z += twitch * (idx % 2 === 0 ? 1 : -1);
            }
          });
        }

        const time = clock.getElapsedTime();
        const jitterAmount = 0.0015;
        camera.position.x += (Math.sin(time * 1.2) * jitterAmount);
        camera.position.y += (Math.cos(time * 1.5) * jitterAmount);
        camera.lookAt(controls.target);

        if (controls) controls.update();
        composer.render();
      }

      animate();
    }
  } catch (err) {
    console.error('Error creating scene:', err);
    container.innerHTML = '<p>Error loading scene. Open browser console for details.</p>';
  }
});
