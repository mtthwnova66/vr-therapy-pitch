document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing mixed reality VR scene for Level 1...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Check for THREE and GLTFLoader
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Ensure Three.js is loaded.');
    container.innerHTML = '<p style="padding:20px;text-align:center;">Failed to load 3D libraries.</p>';
    return;
  }
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('THREE.GLTFLoader is not defined. Ensure GLTFLoader is loaded.');
    container.innerHTML = '<p style="padding:20px;text-align:center;">Failed to load model loader.</p>';
    return;
  }
  
  try {
    // --- Create a Loading Bar ---
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
      setTimeout(() => {
        loadingBarContainer.style.transition = 'opacity 1s ease';
        loadingBarContainer.style.opacity = 0;
        setTimeout(() => { loadingBarContainer.style.display = 'none'; }, 1000);
      }, 500);
    };
  
    // --- Create the Scene ---
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
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText =
      "width: 100%; height: 100%; display: block; position: absolute; top: 0; left: 0;";
  
    // --- Camera Setup ---
    // Start with an exterior view so the VR headset is visible
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 3.5);
  
    // --- Optional OrbitControls (for debugging) ---
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 1, 0);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 10;
      controls.autoRotate = false;
      controls.update();
    }
  
    // --- Create Two Groups: VR and Environment ---
    const vrGroup = new THREE.Group();    // For the VR headset model
    const envGroup = new THREE.Group();     // For the photorealistic table, jar, spider
    envGroup.visible = false;               // Hide environment initially
    scene.add(vrGroup);
    scene.add(envGroup);
  
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
      console.warn('Environment map failed, using fallback color');
      scene.background = new THREE.Color(0xf5f5f7);
    }
  
    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 4, -3);
    scene.add(fillLight);
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rightLight.position.set(6, 2, 0);
    scene.add(rightLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
  
    // --- Build the Photorealistic Environment (envGroup) ---
    function buildEnvironment() {
      const textureLoader = new THREE.TextureLoader(loadingManager);
      const woodTextures = { map: null, normalMap: null, roughnessMap: null };
      let loadedCount = 0;
      const required = 3;
      function onTextureLoaded() {
        loadedCount++;
        if (loadedCount >= required) {
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
          // Spider
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
            const offset = -bbox.min.y;
            spider.position.set(-center.x, offset, -center.z);
            spider.traverse(function(node) {
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
            if (gltf.animations && gltf.animations.length > 0) {
              const mixer = new THREE.AnimationMixer(spider);
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
      }
      textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function(tex) {
        woodTextures.map = tex;
        woodTextures.map.wrapS = THREE.RepeatWrapping;
        woodTextures.map.wrapT = THREE.RepeatWrapping;
        woodTextures.map.repeat.set(2,2);
        onTextureLoaded();
      });
      textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function(tex) {
        woodTextures.normalMap = tex;
        woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
        woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
        woodTextures.normalMap.repeat.set(2,2);
        onTextureLoaded();
      });
      textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(tex) {
        woodTextures.roughnessMap = tex;
        woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
        woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
        woodTextures.roughnessMap.repeat.set(2,2);
        onTextureLoaded();
      });
    }
    buildEnvironment();
  
    // --- Build VR Group: Load the VR Headset Model ---
    let vrHeadset = null;
    const vrLoader = new THREE.GLTFLoader(loadingManager);
    if (THREE.DRACOLoader) {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      vrLoader.setDRACOLoader(dracoLoader);
    }
    vrLoader.load('oculus_quest_vr_headset.glb', function(gltf) {
      vrHeadset = gltf.scene;
      // Position the headset so it hovers at eye level in front of the environment
      vrHeadset.position.set(0, 1.6, 0);
      vrGroup.add(vrHeadset);
    },
    undefined,
    function(error) {
      console.error("Error loading VR headset model:", error);
    });
  
    // --- Camera Transition Setup ---
    // We want to move the camera from its initial position to the headset's left eye.
    const transitionDelay = 3;       // seconds before transition begins
    const transitionDuration = 5;    // seconds duration of transition
    let transitionStarted = false;
    let transitionStartTime = 0;
    const initialCameraPos = camera.position.clone();
    let targetCameraPos = null;
    let vrReady = false;
    const vrInterval = setInterval(() => {
      if (vrHeadset) {
        // Assume the headset's left eye local coordinate is (-0.15, 1.65, 0.1)
        const localEyePos = new THREE.Vector3(-0.15, 1.65, 0.1);
        vrHeadset.updateMatrixWorld();
        targetCameraPos = localEyePos.applyMatrix4(vrHeadset.matrixWorld);
        vrReady = true;
        clearInterval(vrInterval);
        console.log("VR headset ready. Target camera position:", targetCameraPos);
      }
    }, 100);
  
    // --- Add UI Controls ---
    function addUIControls() {
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
  
      // Rotate the VR headset slowly (hovering effect)
      if (vrHeadset) {
        vrHeadset.rotation.y += 0.005;
      }
  
      // Begin camera transition after delay, if VR is ready
      if (elapsed > transitionDelay && vrReady && !transitionStarted) {
        transitionStarted = true;
        transitionStartTime = elapsed;
        console.log("Camera transition started");
      }
      if (transitionStarted && targetCameraPos) {
        const t = Math.min((elapsed - transitionStartTime) / transitionDuration, 1);
        camera.position.lerpVectors(initialCameraPos, targetCameraPos, t);
        // Keep the camera focused on the jar's center (approximate)
        camera.lookAt(new THREE.Vector3(0, 0.75, 0));
        // When transition completes, fade out the VR headset and reveal the environment
        if (t === 1 && vrHeadset) {
          vrGroup.traverse(child => {
            if (child.material) {
              child.material.transparent = true;
              child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, 0, 0.02);
            }
          });
          envGroup.visible = true;
        }
      }
  
      // Update any animations (e.g., spider)
      if (window.spiderMixer) {
        window.spiderMixer.update(clock.getDelta());
      }
      if (controls) controls.update();
      renderer.render(scene, camera);
    }
    animate();
  
  } catch (error) {
    console.error('Error creating VR scene:', error);
    container.innerHTML = '<p style="padding:20px;text-align:center;">Error creating 3D scene. Check console for details.</p>';
  }
});
