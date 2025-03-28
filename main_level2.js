document.addEventListener('DOMContentLoaded', function () {
  initLevel2();
});

function initLevel2() {
  console.log('Initializing Level 2 scene with VR headset transition...');
  const container = document.getElementById('arachnophobia-level2');
  if (!container) {
    console.error('Container not found: #arachnophobia-level2');
    return;
  }
  
  // --- Create a Loading Bar Overlay ---
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
  
  // --- Setup a Loading Manager ---
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = function(url, loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    loadingBar.style.width = percent + '%';
  };
  loadingManager.onLoad = function() {
    loadingBarContainer.style.transition = 'opacity 1s ease';
    loadingBarContainer.style.opacity = 0;
    setTimeout(() => {
      loadingBarContainer.style.display = 'none';
    }, 1000);
  };
  
  // --- Create the Scene ---
  const scene = new THREE.Scene();
  
  // --- Renderer ---
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
  
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.top = '0';
  renderer.domElement.style.left = '0';
  
  // --- Camera Setup (Start with an Exterior View) ---
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);
  
  // --- Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(3, 5, 3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // --- Environment Map ---
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
  
  // --- Build Photorealistic Environment: Table, Jar, Spider₂ ---
  function createTableAndJar() {
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const woodTextures = { map: null, normalMap: null, roughnessMap: null };
    let texturesLoaded = 0;
    const requiredTextures = 3;
    
    function onTextureLoaded() {
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
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function(texture) {
      woodTextures.map = texture;
      woodTextures.map.wrapS = THREE.RepeatWrapping;
      woodTextures.map.wrapT = THREE.RepeatWrapping;
      woodTextures.map.repeat.set(2, 2);
      onTextureLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function(texture) {
      woodTextures.normalMap = texture;
      woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
      woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
      woodTextures.normalMap.repeat.set(2, 2);
      onTextureLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(texture) {
      woodTextures.roughnessMap = texture;
      woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
      woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
      woodTextures.roughnessMap.repeat.set(2, 2);
      onTextureLoaded();
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
    
    loadSpider2();
  }
  
  function loadSpider2() {
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    if (THREE.DRACOLoader) {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      gltfLoader.setDRACOLoader(dracoLoader);
    }
    gltfLoader.load('spider2.glb', function(gltf) {
      const spiderModel = gltf.scene;
      spiderModel.scale.set(1.5, 1.5, 1.5);
      const bbox = new THREE.Box3().setFromObject(spiderModel);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      const minY = bbox.min.y;
      const heightOffset = -minY;
      spiderModel.position.set(-center.x, heightOffset, -center.z);
      // Rotate spider diagonally (-45°)
      spiderModel.rotation.y = -Math.PI / 4;
      spiderModel.traverse(function(node) {
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
        window.spider2Mixer = mixer;
      }
    },
    undefined,
    function(error) {
      console.error('Error loading spider2.glb:', error);
    });
  }
  
  // Build the photorealistic jar/spider environment.
  createTableAndJar();
  
  // --- Load the VR Headset Model ---
  let vrHeadset = null;
  const vrLoader = new THREE.GLTFLoader(loadingManager);
  if (THREE.DRACOLoader) {
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    vrLoader.setDRACOLoader(dracoLoader);
  }
  vrLoader.load('oculus_quest_vr_headset.glb', function(gltf) {
    vrHeadset = gltf.scene;
    // Position the headset so its "eye" can cover the jar view.
    // Adjust position and scale as needed for a photorealistic look.
    vrHeadset.position.set(0, 0, 0);
    scene.add(vrHeadset);
  },
  undefined,
  function(error) {
    console.error('Error loading VR headset model:', error);
  });
  
  // --- Camera Transition Setup ---
  const transitionDelay = 3;       // Seconds to wait before starting the transition
  const transitionDuration = 5;    // Duration of the camera move in seconds
  let transitionStarted = false;
  let transitionStartTime = 0;
  const initialCameraPos = camera.position.clone();
  let targetCameraPos = null;
  let vrReady = false;
  const checkVRInterval = setInterval(() => {
    if (vrHeadset) {
      // Assume the headset's left eye in local space is approximately at (-0.15, 1.65, 0.1)
      const localEyePos = new THREE.Vector3(-0.15, 1.65, 0.1);
      vrHeadset.updateMatrixWorld();
      targetCameraPos = localEyePos.applyMatrix4(vrHeadset.matrixWorld);
      vrReady = true;
      clearInterval(checkVRInterval);
      console.log('VR headset ready. Target camera position set:', targetCameraPos);
    }
  }, 100);
  
  // --- Add UI Controls ---
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
    fsButton.addEventListener('click', function() {
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
          console.error(`Error enabling fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen().catch(err => {
          console.error(`Error exiting fullscreen: ${err.message}`);
        });
      }
    });
    container.appendChild(fsButton);
  
    // Auto-rotate button
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
      rotateButton.addEventListener('click', function() {
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
    
    // Slowly rotate the VR headset for visual flair
    if (vrHeadset) {
      vrHeadset.rotation.y += 0.005;
    }
    
    // Start camera transition after delay if VR is ready
    if (elapsed > transitionDelay && vrReady && !transitionStarted) {
      transitionStarted = true;
      transitionStartTime = elapsed;
      console.log('Camera transition started');
    }
    if (transitionStarted && targetCameraPos) {
      const t = Math.min((elapsed - transitionStartTime) / transitionDuration, 1);
      camera.position.lerpVectors(initialCameraPos, targetCameraPos, t);
      // Optionally, have the camera look at the jar (approximate center at (0,0.75,0))
      camera.lookAt(new THREE.Vector3(0, 0.75, 0));
      
      // Fade out the VR headset gradually once transition is complete
      if (t === 1 && vrHeadset) {
        vrHeadset.traverse(child => {
          if (child.material) {
            child.material.transparent = true;
            // Lerp opacity toward 0
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, 0, 0.02);
          }
        });
      }
    }
    
    // Update spider2 animation mixer if available
    if (window.spider2Mixer) {
      window.spider2Mixer.update(clock.getDelta());
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
