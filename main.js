document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing VR scene with a big headset...');

  // Get container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }

  // Check for THREE and GLTFLoader
  if (typeof THREE === 'undefined') {
    console.error('THREE not found. Make sure Three.js is loaded.');
    container.innerHTML = '<p style="padding:20px;text-align:center;">Three.js not loaded.</p>';
    return;
  }
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('GLTFLoader not found. Make sure it is loaded.');
    container.innerHTML = '<p style="padding:20px;text-align:center;">GLTFLoader not loaded.</p>';
    return;
  }

  // --- Simple Loading Bar ---
  const loadingBarContainer = document.createElement('div');
  loadingBarContainer.style.position = 'absolute';
  loadingBarContainer.style.top = '50%';
  loadingBarContainer.style.left = '50%';
  loadingBarContainer.style.transform = 'translate(-50%, -50%)';
  loadingBarContainer.style.width = '300px';
  loadingBarContainer.style.height = '20px';
  loadingBarContainer.style.background = '#ccc';
  loadingBarContainer.style.borderRadius = '10px';
  loadingBarContainer.style.overflow = 'hidden';
  loadingBarContainer.style.zIndex = '1000';
  container.appendChild(loadingBarContainer);

  const loadingBar = document.createElement('div');
  loadingBar.style.width = '0%';
  loadingBar.style.height = '100%';
  loadingBar.style.background = '#0071e3';
  loadingBarContainer.appendChild(loadingBar);

  // LoadingManager
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function(url, loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    loadingBar.style.width = percent + '%';
  };
  loadingManager.onLoad = function() {
    setTimeout(() => {
      loadingBarContainer.style.transition = 'opacity 1s ease';
      loadingBarContainer.style.opacity = 0;
      setTimeout(() => { loadingBarContainer.style.display = 'none'; }, 1000);
    }, 500);
  };

  // --- Scene Setup ---
  const scene = new THREE.Scene();
  // Plain gray background to avoid confusion
  scene.background = new THREE.Color(0xa0a0a0);

  // Renderer
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
  renderer.domElement.style.cssText =
    "width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;";

  // Camera
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3.5); // Eye-level vantage

  // OrbitControls (optional)
  let controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 10;
    controls.autoRotate = false;
    controls.update();
  }

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(3, 5, 3);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Groups
  const vrGroup = new THREE.Group();  // VR headset group
  const envGroup = new THREE.Group(); // Table, jar, spider
  envGroup.visible = false;           // Hidden initially
  // Move envGroup behind the VR headset so it's obviously behind
  envGroup.position.z = -2;
  scene.add(vrGroup);
  scene.add(envGroup);

  // 1) Load the VR Headset
  let vrHeadset = null;
  const gltfLoader = new THREE.GLTFLoader(loadingManager);
  gltfLoader.load('oculus_quest_vr_headset.glb', function(gltf) {
    vrHeadset = gltf.scene;
    // Make it big so it's clearly visible
    vrHeadset.scale.set(2, 2, 2);
    // Place at eye level in front of the environment
    vrHeadset.position.set(0, 1.6, 0);
    vrGroup.add(vrHeadset);
  },
  undefined,
  function(error) {
    console.error('Error loading VR headset:', error);
  });

  // 2) Build the table/jar/spider environment
  function buildEnvironment() {
    // Table geometry
    const tableGeom = new THREE.BoxGeometry(5, 0.2, 3);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = -0.1;
    table.receiveShadow = true;
    envGroup.add(table);

    // Jar
    const jarGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, false);
    const jarMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.05,
      transmission: 0.95,
      transparent: true,
      thickness: 0.05,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      ior: 1.5
    });
    const jar = new THREE.Mesh(jarGeom, jarMat);
    jar.position.y = 0.75;
    jar.castShadow = true;
    jar.receiveShadow = true;
    envGroup.add(jar);

    // Lid
    const lidGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.9, roughness: 0.1 });
    const lid = new THREE.Mesh(lidGeom, lidMat);
    lid.position.set(0, 1.55, 0);
    lid.castShadow = true;
    envGroup.add(lid);

    // Spider
    const spiderLoader = new THREE.GLTFLoader(loadingManager);
    spiderLoader.load('spider_with_animation.glb', function(gltf) {
      const spiderModel = gltf.scene;
      spiderModel.scale.set(1.5, 1.5, 1.5);
      const bbox = new THREE.Box3().setFromObject(spiderModel);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      const offset = -bbox.min.y;
      spiderModel.position.set(-center.x, offset, -center.z);
      spiderModel.traverse(node => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
      envGroup.add(spiderModel);
      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(spiderModel);
        const action = mixer.clipAction(gltf.animations[0]);
        action.timeScale = 0.5;
        action.play();
        window.spiderMixer = mixer;
      }
    },
    undefined,
    function(error) {
      console.error('Error loading spider model:', error);
    });
  }
  buildEnvironment();

  // 3) Camera Transition
  const transitionDelay = 3;     // seconds
  const transitionDuration = 5;  // seconds
  let transitionStarted = false;
  let transitionStartTime = 0;
  const initialCamPos = camera.position.clone();
  let targetCamPos = null;
  let vrReady = false;

  // Poll for VR headset readiness
  const checkVRInterval = setInterval(() => {
    if (vrHeadset) {
      // Assume left eye local offset is (-0.15, 1.65, 0.1)
      const localEye = new THREE.Vector3(-0.15, 1.65, 0.1);
      vrHeadset.updateMatrixWorld();
      targetCamPos = localEye.applyMatrix4(vrHeadset.matrixWorld);
      vrReady = true;
      clearInterval(checkVRInterval);
      console.log('VR headset ready, targetCamPos:', targetCamPos);
    }
  }, 200);

  // 4) UI Controls (Fullscreen & Rotate)
  function addUIControls() {
    // Fullscreen
    const fsBtn = document.createElement('button');
    fsBtn.textContent = '⛶';
    fsBtn.style.position = 'absolute';
    fsBtn.style.bottom = '10px';
    fsBtn.style.right = '10px';
    fsBtn.style.fontSize = '20px';
    fsBtn.style.padding = '5px 10px';
    fsBtn.style.background = 'rgba(255,255,255,0.7)';
    fsBtn.style.border = 'none';
    fsBtn.style.borderRadius = '5px';
    fsBtn.style.cursor = 'pointer';
    fsBtn.style.zIndex = '10';
    fsBtn.title = 'Toggle Fullscreen';
    fsBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen().catch(err => console.error(err));
      }
    });
    container.appendChild(fsBtn);

    if (controls) {
      const rotateBtn = document.createElement('button');
      rotateBtn.textContent = '↻';
      rotateBtn.style.position = 'absolute';
      rotateBtn.style.bottom = '10px';
      rotateBtn.style.right = '60px';
      rotateBtn.style.fontSize = '20px';
      rotateBtn.style.padding = '5px 10px';
      rotateBtn.style.background = 'rgba(255,255,255,0.7)';
      rotateBtn.style.border = 'none';
      rotateBtn.style.borderRadius = '5px';
      rotateBtn.style.cursor = 'pointer';
      rotateBtn.style.zIndex = '10';
      rotateBtn.title = 'Toggle Auto-Rotation';
      rotateBtn.addEventListener('click', () => {
        controls.autoRotate = !controls.autoRotate;
        rotateBtn.style.background = controls.autoRotate ? 'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
        rotateBtn.style.color = controls.autoRotate ? '#fff' : '#000';
      });
      container.appendChild(rotateBtn);
    }
  }
  addUIControls();

  // 5) Resize Handling
  function handleResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleResize);
  document.addEventListener('fullscreenchange', handleResize);

  // 6) Animation Loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Slowly rotate the VR headset so it’s obviously visible
    if (vrHeadset) {
      vrHeadset.rotation.y += 0.005;
    }

    // Start camera transition after delay
    if (elapsed > transitionDelay && vrReady && !transitionStarted) {
      transitionStarted = true;
      transitionStartTime = elapsed;
      console.log('Camera transition started');
    }
    // Perform the transition
    if (transitionStarted && targetCamPos) {
      const t = Math.min((elapsed - transitionStartTime) / transitionDuration, 1);
      camera.position.lerpVectors(initialCamPos, targetCamPos, t);
      camera.lookAt(0, 0.75, -2); // Focus on jar center behind the headset
      // If done, fade out VR group and show environment
      if (t === 1 && vrHeadset) {
        vrGroup.traverse(child => {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, 0, 0.03);
          }
        });
        envGroup.visible = true;
      }
    }

    // Update spider animation
    if (window.spiderMixer) {
      window.spiderMixer.update(clock.getDelta());
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();
});
