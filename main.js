document.addEventListener('DOMContentLoaded', initVRExperience);

function initVRExperience() {
  // Get container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error("Container not found");
    return;
  }

  // --- Create a loading bar overlay ---
  const loadingBarContainer = document.createElement('div');
  loadingBarContainer.id = "loading-bar-container";
  loadingBarContainer.style.position = "absolute";
  loadingBarContainer.style.top = "50%";
  loadingBarContainer.style.left = "50%";
  loadingBarContainer.style.transform = "translate(-50%, -50%)";
  loadingBarContainer.style.width = "300px";
  loadingBarContainer.style.height = "20px";
  loadingBarContainer.style.background = "#ccc";
  loadingBarContainer.style.borderRadius = "10px";
  loadingBarContainer.style.overflow = "hidden";
  loadingBarContainer.style.zIndex = "1000";
  container.appendChild(loadingBarContainer);

  const loadingBar = document.createElement('div');
  loadingBar.id = "loading-bar";
  loadingBar.style.width = "0%";
  loadingBar.style.height = "100%";
  loadingBar.style.background = "#0071e3";
  loadingBarContainer.appendChild(loadingBar);

  // --- Setup a unified loading manager ---
  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = (url, loaded, total) => {
    const percent = Math.round((loaded / total) * 100);
    loadingBar.style.width = percent + "%";
  };
  loadingManager.onLoad = () => {
    loadingBarContainer.style.transition = "opacity 1s ease";
    loadingBarContainer.style.opacity = 0;
    setTimeout(() => { loadingBarContainer.style.display = "none"; }, 1000);
  };

  // --- Scene Setup ---
  const scene = new THREE.Scene();

  // --- Renderer Setup ---
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.physicallyCorrectLights = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = "";
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText =
    "width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;";

  // --- Camera Setup ---
  // Start with an exterior view
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  // --- Basic Lighting ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.position.set(3, 5, 3);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // --- Environment Map (for reflections) ---
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

  // --- (Optional) OrbitControls for debugging ---
  let controls;
  if (typeof THREE.OrbitControls !== "undefined") {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.autoRotate = false;
    controls.update();
  }

  // --- Create the Environment Group (Jar & Spider) ---
  // This group remains hidden until the VR transition is complete.
  const envGroup = new THREE.Group();
  envGroup.visible = false;
  scene.add(envGroup);

  function createEnvironment() {
    // Create table, jar, and spider (similar to your Level 1)
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const woodTextures = { map: null, normalMap: null, roughnessMap: null };
    let texturesLoaded = 0;
    const requiredTextures = 3;
    function onTexturesLoaded() {
      if (texturesLoaded >= requiredTextures) {
        // Table
        const tableGeom = new THREE.BoxGeometry(5, 0.2, 3);
        const tableMat = new THREE.MeshStandardMaterial({
          map: woodTextures.map,
          normalMap: woodTextures.normalMap,
          roughnessMap: woodTextures.roughnessMap,
          roughness: 0.8,
          metalness: 0.1,
          envMap: envMap
        });
        const table = new THREE.Mesh(tableGeom, tableMat);
        table.position.y = -0.1;
        table.receiveShadow = true;
        envGroup.add(table);
        // Jar
        const jarGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, false);
        const jarMat = new THREE.MeshPhysicalMaterial({
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
        const jar = new THREE.Mesh(jarGeom, jarMat);
        jar.position.y = 0.75;
        jar.castShadow = true;
        jar.receiveShadow = true;
        envGroup.add(jar);
        // Lid
        const lidGeom = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
        const lidMat = new THREE.MeshStandardMaterial({
          color: 0x777777,
          metalness: 0.9,
          roughness: 0.1,
          envMap: envMap
        });
        const lid = new THREE.Mesh(lidGeom, lidMat);
        lid.position.set(0, 1.55, 0);
        lid.castShadow = true;
        envGroup.add(lid);
        // Spider (loaded from spider_with_animation.glb)
        const gltfLoader = new THREE.GLTFLoader(loadingManager);
        if (THREE.DRACOLoader) {
          const dracoLoader = new THREE.DRACOLoader();
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
          gltfLoader.setDRACOLoader(dracoLoader);
        }
        gltfLoader.load('spider_with_animation.glb', function(gltf) {
          const spider = gltf.scene;
          spider.scale.set(1.5, 1.5, 1.5);
          const bbox = new THREE.Box3().setFromObject(spider);
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          const minY = bbox.min.y;
          const heightOffset = -minY;
          spider.position.set(-center.x, heightOffset, -center.z);
          spider.traverse(node => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.material) {
                node.material.envMap = envMap;
                node.material.needsUpdate = true;
              }
            }
          });
          envGroup.add(spider);
        },
        undefined,
        function(error) {
          console.error("Error loading spider model:", error);
        });
      }
    }
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function(tex) {
      woodTextures.map = tex;
      woodTextures.map.wrapS = THREE.RepeatWrapping;
      woodTextures.map.wrapT = THREE.RepeatWrapping;
      woodTextures.map.repeat.set(2, 2);
      texturesLoaded++;
      onTexturesLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function(tex) {
      woodTextures.normalMap = tex;
      woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
      woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
      woodTextures.normalMap.repeat.set(2, 2);
      texturesLoaded++;
      onTexturesLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(tex) {
      woodTextures.roughnessMap = tex;
      woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
      woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
      woodTextures.roughnessMap.repeat.set(2, 2);
      texturesLoaded++;
      onTexturesLoaded();
    });
  }
  createEnvironment();

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
    // Position the headset hovering in the center at eye level
    vrHeadset.position.set(0, 1.6, 0);
    scene.add(vrHeadset);
  },
  undefined,
  function(error) {
    console.error("Error loading VR headset model:", error);
  });

  // --- Camera Transition Setup ---
  // We want to zoom from the initial camera position to the left eye of the headset.
  const transitionDelay = 3;      // seconds before transition starts
  const transitionDuration = 5;   // duration of transition in seconds
  let transitionStarted = false;
  let transitionStartTime = 0;
  const initialCameraPos = camera.position.clone();
  let targetCameraPos = null;
  let vrReady = false;
  const vrInterval = setInterval(() => {
    if (vrHeadset) {
      // Assume the headset's left eye local coordinate is approximately (-0.15, 1.65, 0.1)
      const localEye = new THREE.Vector3(-0.15, 1.65, 0.1);
      vrHeadset.updateMatrixWorld();
      targetCameraPos = localEye.applyMatrix4(vrHeadset.matrixWorld);
      vrReady = true;
      clearInterval(vrInterval);
      console.log("VR headset ready. Target camera position:", targetCameraPos);
    }
  }, 100);

  // --- Optional UI Controls ---
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
        container.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen().catch(err => console.error(err));
      }
    });
    container.appendChild(fsButton);
    
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

    // Rotate VR headset slowly (hover effect)
    if (vrHeadset) {
      vrHeadset.rotation.y += 0.005;
    }
    
    // Start the camera transition after the delay, if VR is ready
    if (elapsed > transitionDelay && vrReady && !transitionStarted) {
      transitionStarted = true;
      transitionStartTime = elapsed;
      console.log("Camera transition started");
    }
    if (transitionStarted && targetCameraPos) {
      const t = Math.min((elapsed - transitionStartTime) / transitionDuration, 1);
      camera.position.lerpVectors(initialCameraPos, targetCameraPos, t);
      // For a smooth experience, keep the camera looking at the jar area (approximate center)
      camera.lookAt(new THREE.Vector3(0, 0.75, 0));
      // Once transition completes, fade out the headset and reveal the environment.
      if (t === 1 && vrHeadset) {
        vrHeadset.traverse(child => {
          if (child.material) {
            child.material.transparent = true;
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, 0, 0.02);
          }
        });
        envGroup.visible = true;
      }
    }

    // Update any animations (e.g. spider)
    if (window.spiderMixer) {
      window.spiderMixer.update(clock.getDelta());
    }
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
