document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing mixed reality VR scene...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Check for THREE and GLTFLoader
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Make sure Three.js is loaded.');
    container.innerHTML = '<p style="padding:20px;text-align:center;">Failed to load 3D libraries.</p>';
    return;
  }
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('THREE.GLTFLoader is not defined. Make sure GLTFLoader is loaded.');
    container.innerHTML = '<p style="padding:20px;text-align:center;">Failed to load model loader.</p>';
    return;
  }
  
  try {
    // --- Loading Bar ---
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
  
    // --- Loading Manager ---
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
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Start with an exterior view
    camera.position.set(0, 1.6, 3.5);
  
    // --- OrbitControls (optional for debugging) ---
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
    } else {
      console.warn('OrbitControls not available');
    }
  
    // --- Groups: VR Headset and Environment ---
    const vrGroup = new THREE.Group();   // Contains the VR headset
    const envGroup = new THREE.Group();    // Contains table, jar, spider
    envGroup.visible = false;              // Hidden initially
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
      console.warn('Environment mapping not supported, using fallback color');
      scene.background = new THREE.Color(0xf5f5f7);
    }
  
    // --- Lighting Setup ---
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
      let texLoaded = 0;
      const required = 3;
      function onTextureLoaded() {
        texLoaded++;
        if (texLoaded >= required) {
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
      // Position the headset so it hovers at eye level in front of the jar scene.
      vrHeadset.position.set(0, 1.6, 0);
      vrGroup.add(vrHeadset);
    },
    undefined,
    function(error) {
      console.error("Error loading VR headset model:", error);
    });
  
    // --- Camera Transition Setup ---
    // We want to move from the initial camera position to the headset's left eye.
    const transitionDelay = 3;       // seconds before starting transition
    const transitionDuration = 5;    // duration in seconds
    let transitionStarted = false;
    let transitionStartTime = 0;
    const initialCamPos = camera.position.clone();
    let targetCamPos = null;
    let vr

