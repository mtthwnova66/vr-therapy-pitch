document.addEventListener('DOMContentLoaded', function () {
  initVRExperience();
});

function initVRExperience() {
  // Get the container element (reuse your arachnophobia-demo container)
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error("Container not found");
    return;
  }

  // --- Create a simple loading bar overlay ---
  const loadingBarContainer = document.createElement('div');
  loadingBarContainer.id = 'loading-bar-container';
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
  loadingBar.id = 'loading-bar';
  loadingBar.style.width = '0%';
  loadingBar.style.height = '100%';
  loadingBar.style.background = '#0071e3';
  loadingBarContainer.appendChild(loadingBar);

  // --- Create a Loading Manager for all assets ---
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function (url, loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    loadingBar.style.width = percent + '%';
  };
  loadingManager.onLoad = function () {
    // Fade out the loading bar after assets load
    loadingBarContainer.style.transition = 'opacity 1s ease';
    loadingBarContainer.style.opacity = 0;
    setTimeout(() => {
      loadingBarContainer.style.display = 'none';
    }, 1000);
  };

  // --- Scene Setup ---
  const scene = new THREE.Scene();

  // Create a physically based renderer
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

  // Ensure canvas fills container
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';

  // --- Camera Setup ---
  // Start with an exterior view (simulating a viewer standing in front of the headset)
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(3, 5, 3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // --- Environment Map (for realistic reflections) ---
  let envMap;
  try {
    const urls = [
      'https://threejs.org/examples/textures/cube/pisa/px.png',
      'https://threejs.org/examples/textures/cube/pisa/nx.png',
      'https://threejs.org/examples/textures/cube/pisa/py.png',
      'https://threejs.org/examples/textures/cube/pisa/ny.png',
      'https://threejs.org/examples/textures/cube/pisa/pz.png',
      'https://threejs.org/examples/textures/cube/pisa/nz.png'
    ];
    envMap = new THREE.CubeTextureLoader(loadingManager).load(urls);
    scene.environment = envMap;
    scene.background = envMap;
  } catch (e) {
    scene.background = new THREE.Color(0xdddddd);
  }

  // --- OrbitControls ---
  let controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.update();
  } else {
    console.warn('OrbitControls not available');
  }

  // --- Create the Jar & Spider Scene (same as your photorealistic Level 1) ---
  // For brevity, we combine your table, jar, and spider functions here.
  // (In a production system, these could be modularized.)
  function createTable() {
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const woodTextures = { map: null, normalMap: null, roughnessMap: null };
    let texturesLoaded = 0;
    const requiredTextures = 3;
    function createTableIfTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3);
        const tableMaterial = new THREE.MeshStandardMaterial({
          map: woodTextures.map,
          normalMap: woodTextures.normalMap,
          roughnessMap: woodTextures.roughnessMap,
          roughness: 0.8,
          metalness: 0.1,
          envMap: envMap
        });
        const table = new THREE.Mesh(tableGeometry, tableMaterial);
        table.position.y = -0.1;
        table.receiveShadow = true;
        scene.add(table);
        createJar();
      }
    }
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function (texture) {
      woodTextures.map = texture;
      woodTextures.map.wrapS = THREE.RepeatWrapping;
      woodTextures.map.wrapT = THREE.RepeatWrapping;
      woodTextures.map.repeat.set(2, 2);
      createTableIfTexturesLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function (texture) {
      woodTextures.normalMap = texture;
      woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
      woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
      woodTextures.normalMap.repeat.set(2, 2);
      createTableIfTexturesLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function (texture) {
      woodTextures.roughnessMap = texture;
      woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
      woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
      woodTextures.roughnessMap.repeat.set(2, 2);
      createTableIfTexturesLoaded();
    });
  }

  function createJar() {
    const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, false);
    const jarMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.95,
      transparent: true,
      thickness: 0.05,
      envMapIntensity: 1,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      ior: 1.5
    });
    const jar = new THREE.Mesh(jarGeometry, jarMaterial);
    jar.position.y = 0.75;
    jar.castShadow = true;
    jar.receiveShadow = true;
    scene.add(jar);

    const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
    const lidMaterial = new THREE.MeshStandardMaterial({
      color: 0x777777,
      metalness: 0.9,
      roughness: 0.1,
      envMap: envMap
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.set(0, 1.55, 0);
    lid.castShadow = true;
    scene.add(lid);

    loadSpiderModel();
  }

  function loadSpiderModel() {
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    if (THREE.DRACOLoader) {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      gltfLoader.setDRACOLoader(dracoLoader);
    }
    // Here we assume the spider model (with animations) is loaded as before.
    gltfLoader.load('spider_with_animation.glb', function (gltf) {
      const spiderModel = gltf.scene;
      spiderModel.scale.set(1.5, 1.5, 1.5);
      const boundingBox = new THREE.Box3().setFromObject(spiderModel);
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      const minY = boundingBox.min.y;
      const heightOffset = -minY;
      spiderModel.position.set(-center.x, 0 + heightOffset, -center.z);
      spiderModel.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (node.material) {
            node.material.envMap = envMap;
            node.material.needsUpdate = true;
          }
        }
      });
      scene.add(spiderModel);
      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(spiderModel);
        const action = mixer.clipAction(gltf.animations[0]);
        action.timeScale = 0.5;
        action.play();
        window.spiderMixer = mixer;
      }
    },
      undefined,
      function (error) {
        console.error('Error loading spider model:', error);
      }
    );
  }

  // --- Load the VR Headset Model ---
  // Use your provided model path "oculus_quest_vr_headset.glb"
  const gltfLoader = new THREE.GLTFLoader(loadingManager);
  if (THREE.DRACOLoader) {
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  let vrHeadset;
  gltfLoader.load('oculus_quest_vr_headset.glb', function (gltf) {
    vrHeadset = gltf.scene;
    // Assume the model is pre-scaled/centered; position it in front of the jar scene.
    vrHeadset.position.set(0, 0, 0); // Adjust as needed so that its "eye" aligns with jar view.
    scene.add(vrHeadset);
  },
    undefined,
    function (error) {
      console.error('Error loading VR headset model:', error);
    }
  );

  // --- Define the camera transition parameters ---
  const transitionDelay = 3; // seconds delay before camera transition starts
  const transitionDuration = 5; // seconds duration for the camera move
  let transitionStarted = false;
  let transitionStartTime = 0;
  const initialCameraPosition = camera.position.clone();
  let targetCameraPosition = null;
  let vrHeadsetReady = false;

  // Check when the VR headset is loaded to compute the target position.
  const checkVRHeadsetInterval = setInterval(() => {
    if (vrHeadset) {
      // Assume the headset's local left eye position is approximately at (-0.15, 1.65, 0.1)
      const localEyePos = new THREE.Vector3(-0.15, 1.65, 0.1);
      vrHeadset.updateMatrixWorld();
      targetCameraPosition = localEyePos.applyMatrix4(vrHeadset.matrixWorld);
      vrHeadsetReady = true;
      clearInterval(checkVRHeadsetInterval);
    }
  }, 100);

  // --- Optionally add UI controls (fullscreen and auto-rotate buttons) ---
  function addUIControls() {
    // Fullscreen button
    const fsButton = document.createElement('button');
    fsButton.textContent = '⛶';
    fsButton.style.position = 'absolute';
    fsButton.style.bottom = '10px';
    fsButton.style.right = '10px';
    fsButton.style.fontSize = '20px';
    fsButton.style.padding = '5px 10px';
    fsButton.style.background = 'rgba(255,255,255,0.7)';
    fsButton.style.border = 'none';
    fsButton.style.borderRadius = '5px';
    fsButton.style.cursor = 'pointer';
    fsButton.style.zIndex = '10';
    fsButton.title = 'Toggle fullscreen';
    fsButton.addEventListener('click', function () {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    });
    container.appendChild(fsButton);

    // Auto-rotate (rotate) button – if OrbitControls are active
    if (controls) {
      const rotateButton = document.createElement('button');
      rotateButton.textContent = '↻';
      rotateButton.style.position = 'absolute';
      rotateButton.style.bottom = '10px';
      rotateButton.style.right = '60px';
      rotateButton.style.fontSize = '20px';
      rotateButton.style.padding = '5px 10px';
      rotateButton.style.background = 'rgba(255,255,255,0.7)';
      rotateButton.style.border = 'none';
      rotateButton.style.borderRadius = '5px';
      rotateButton.style.cursor = 'pointer';
      rotateButton.style.zIndex = '10';
      rotateButton.title = 'Toggle auto-rotation';
      rotateButton.addEventListener('click', function () {
        controls.autoRotate = !controls.autoRotate;
        rotateButton.style.background = controls.autoRotate ? 'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
        rotateButton.style.color = controls.autoRotate ? '#fff' : '#000';
      });
      container.appendChild(rotateButton);
    }
  }
  addUIControls();

  // --- Resize Handling ---
  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', handleResize);
  document.addEventListener('fullscreenchange', handleResize);

  // --- Animation Loop ---
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Slowly rotate the VR headset (if loaded)
    if (vrHeadset) {
      vrHeadset.rotation.y += 0.005;
    }

    // Once delay has passed and VR headset target is ready, start the camera transition.
    if (elapsed > transitionDelay && vrHeadsetReady && !transitionStarted) {
      transitionStarted = true;
      transitionStartTime = elapsed;
    }
    if (transitionStarted && targetCameraPosition) {
      const t = Math.min((elapsed - transitionStartTime) / transitionDuration, 1);
      camera.position.lerpVectors(initialCameraPosition, targetCameraPosition, t);
      // Optionally, have the camera look at the jar (e.g., at (0, 0.75, 0))
      camera.lookAt(new THREE.Vector3(0, 0.75, 0));
      // When the transition is complete, fade out the VR headset to reveal the jar/spider scene.
      if (t === 1 && vrHeadset) {
        vrHeadset.traverse((child) => {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, 0, 0.05);
          }
        });
      }
    }

    // Update any animation mixers (e.g. spider)
    if (window.spiderMixer) {
      window.spiderMixer.update(clock.getDelta());
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
