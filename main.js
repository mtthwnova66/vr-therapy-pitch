// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing photorealistic Three.js scene...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Check if THREE is available
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Make sure Three.js is loaded.');
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Failed to load 3D libraries. Please check your browser settings or try a different browser.</p>';
    return;
  }
  
  // Check if GLTFLoader is available
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('THREE.GLTFLoader is not defined. Make sure GLTFLoader is loaded.');
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Failed to load model loader. Please check your browser settings or try a different browser.</p>';
    return;
  }
  
  try {
    // Create loading message
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-status';
    loadingElement.style.position = 'absolute';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.color = '#333';
    loadingElement.style.fontSize = '16px';
    loadingElement.style.fontWeight = 'bold';
    loadingElement.textContent = 'Loading photorealistic scene...';
    loadingElement.style.zIndex = '100';
    container.appendChild(loadingElement);
    
    // Create a loading bar overlay
    const loadingBarContainer = document.createElement('div');
    loadingBarContainer.style.position = 'absolute';
    loadingBarContainer.style.top = '55%';
    loadingBarContainer.style.left = '50%';
    loadingBarContainer.style.transform = 'translate(-50%, -50%)';
    loadingBarContainer.style.width = '300px';
    loadingBarContainer.style.height = '10px';
    loadingBarContainer.style.background = '#ccc';
    loadingBarContainer.style.borderRadius = '5px';
    loadingBarContainer.style.overflow = 'hidden';
    loadingBarContainer.style.zIndex = '1000';
    container.appendChild(loadingBarContainer);
    
    const loadingBar = document.createElement('div');
    loadingBar.style.width = '0%';
    loadingBar.style.height = '100%';
    loadingBar.style.background = '#0071e3';
    loadingBarContainer.appendChild(loadingBar);
    
    // Setup loading manager for all assets
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
      const percent = Math.round((loaded / total) * 100);
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = `Loading scene assets... ${percent}%`;
      }
      loadingBar.style.width = percent + '%';
    };
    loadingManager.onLoad = function() {
      setTimeout(() => {
        loadingElement.style.transition = 'opacity 1s ease';
        loadingBarContainer.style.transition = 'opacity 1s ease';
        loadingElement.style.opacity = 0;
        loadingBarContainer.style.opacity = 0;
        setTimeout(() => {
          loadingElement.remove();
          loadingBarContainer.remove();
        }, 1000);
      }, 500);
    };
    
    // Scene setup
    const scene = new THREE.Scene();
    // Use plain gray background so the VR headset stands out.
    scene.background = new THREE.Color(0xa0a0a0);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    try {
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (e) {
      console.warn('Advanced rendering features not fully supported in this browser', e);
    }
    
    // Clear container and add renderer
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);
    container.appendChild(loadingBarContainer);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    
    // Add OrbitControls (optional for debugging)
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0); // Lower target to look at the jar
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
    
    // Lighting (as in your original code)
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
    
    // --------------------------------------------------------------------
    // Create Groups: VR Headset Group and Environment Group
    // --------------------------------------------------------------------
    const vrGroup = new THREE.Group(); // For the VR headset portal
    scene.add(vrGroup);
    const envGroup = new THREE.Group(); // For your original table, jar, spider scene
    envGroup.visible = false;           // Hidden initially
    scene.add(envGroup);
    
    // --------------------------------------------------------------------
    // (Optional) Load an environment map for reflections if available.
    try {
      const cubeUrls = [
        'https://threejs.org/examples/textures/cube/pisa/px.png',
        'https://threejs.org/examples/textures/cube/pisa/nx.png',
        'https://threejs.org/examples/textures/cube/pisa/py.png',
        'https://threejs.org/examples/textures/cube/pisa/ny.png',
        'https://threejs.org/examples/textures/cube/pisa/pz.png',
        'https://threejs.org/examples/textures/cube/pisa/nz.png'
      ];
      const cubeLoader = new THREE.CubeTextureLoader(loadingManager);
      const cubeTexture = cubeLoader.load(cubeUrls);
      scene.environment = cubeTexture;
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
    }
    
    // --------------------------------------------------------------------
    // CAMERA TRANSITION VARIABLES
    // --------------------------------------------------------------------
    const transitionDelay = 3;     // Wait 3 seconds before zooming in
    const transitionDuration = 5;  // Transition lasts 5 seconds
    let transitionStarted = false;
    let transitionStartTime = 0;
    const initialCamPos = camera.position.clone();
    let targetCamPos = null;
    let vrReady = false;
    
    // --------------------------------------------------------------------
    // LOAD THE VR HEADSET MODEL (Portal)
    // --------------------------------------------------------------------
    const vrLoader = new THREE.GLTFLoader(loadingManager);
    if (typeof THREE.DRACOLoader !== 'undefined') {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      vrLoader.setDRACOLoader(dracoLoader);
    }
    
    let vrHeadset = null;
    vrLoader.load(
      'oculus_quest_vr_headset.glb',
      function(gltf) {
        vrHeadset = gltf.scene;
        // Scale up for a large, prominent headset
        vrHeadset.scale.set(2, 2, 2);
        // Rotate so the front faces the viewer.
        // If it still appears from above or awkwardly, adjust rotation.x or rotation.z as needed.
        vrHeadset.rotation.y = Math.PI;
        // Position the headset at eye level (modify if necessary)
        vrHeadset.position.set(0, 1.2, 0);
        vrGroup.add(vrHeadset);
        
        // Compute target camera position from the headset's left eye.
        // Adjust the local offset as needed; here we assume left eye at (-0.15, 0.0, 0.2)
        const leftEyeLocal = new THREE.Vector3(-0.15, 0.0, 0.2);
        vrHeadset.updateMatrixWorld();
        targetCamPos = leftEyeLocal.applyMatrix4(vrHeadset.matrixWorld);
        vrReady = true;
        console.log('VR headset loaded. Target camera position:', targetCamPos);
      },
      undefined,
      function(error) {
        console.error('Error loading VR headset model:', error);
      }
    );
    
    // --------------------------------------------------------------------
    // BUILD THE ORIGINAL ENVIRONMENT (TABLE, JAR, SPIDER)
    // This is kept exactly as in your original code.
    // --------------------------------------------------------------------
    const woodTextures = { map: null, normalMap: null, roughnessMap: null };
    let texturesLoaded = 0;
    const requiredTextures = 3;
    
    function createTableIfTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        createTable();
      }
    }
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function(texture) {
      woodTextures.map = texture;
      woodTextures.map.wrapS = THREE.RepeatWrapping;
      woodTextures.map.wrapT = THREE.RepeatWrapping;
      woodTextures.map.repeat.set(2, 2);
      createTableIfTexturesLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function(texture) {
      woodTextures.normalMap = texture;
      woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
      woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
      woodTextures.normalMap.repeat.set(2, 2);
      createTableIfTexturesLoaded();
    });
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(texture) {
      woodTextures.roughnessMap = texture;
      woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
      woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
      woodTextures.roughnessMap.repeat.set(2, 2);
      createTableIfTexturesLoaded();
    });
    
    function createTable() {
      const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3);
      const tableMaterial = new THREE.MeshStandardMaterial({
        map: woodTextures.map,
        normalMap: woodTextures.normalMap,
        roughnessMap: woodTextures.roughnessMap,
        roughness: 0.8,
        metalness: 0.1,
        envMap: scene.environment
      });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.y = -0.1;
      table.receiveShadow = true;
      // Add table to the environment group.
      envGroup.add(table);
      createJar();
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
      envGroup.add(jar);
      
      const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.1,
        envMap: scene.environment
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 1.55, 0);
      lid.castShadow = true;
      envGroup.add(lid);
      
      loadSpiderModel();
    }
    
    function loadSpiderModel() {
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Loading spider model...';
      }
      
      const spiderLoader = new THREE.GLTFLoader(loadingManager);
      if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        spiderLoader.setDRACOLoader(dracoLoader);
      }
      
      spiderLoader.load(
        'spider_with_animation.glb',
        function(gltf) {
          const spiderModel = gltf.scene;
          spiderModel.scale.set(1.5, 1.5, 1.5);
          const bbox = new THREE.Box3().setFromObject(spiderModel);
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          const offset = -bbox.min.y;
          spiderModel.position.set(-center.x, offset, -center.z);
          spiderModel.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.material) {
                node.material.envMap = scene.environment;
                node.material.needsUpdate = true;
              }
            }
          });
          envGroup.add(spiderModel);
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Spider model has ${gltf.animations.length} animations`);
            mixer = new THREE.AnimationMixer(spiderModel);
            const idleAnimation = gltf.animations[0];
            const action = mixer.clipAction(idleAnimation);
            action.timeScale = 0.5;
            action.play();
          }
          addDustParticles();
          finalizeScene();
          if (loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Scene loaded!';
            setTimeout(() => {
              loadingElement.style.opacity = '0';
              loadingElement.style.transition = 'opacity 1s ease';
              setTimeout(() => {
                if (loadingElement && loadingElement.parentNode) {
                  loadingElement.remove();
                }
              }, 1000);
            }, 1000);
          }
        },
        undefined,
        function(error) {
          console.error('Error loading spider model:', error);
          if (loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Failed to load spider model. Using fallback...';
          }
          createProceduralSpider();
        }
      );
    }
    
    function createProceduralSpider() {
      console.log('Creating procedural spider as fallback');
      const spider = new THREE.Group();
      const abdomenGeometry = new THREE.SphereGeometry(0.28, 32, 32);
      const spiderMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.2,
        envMap: scene.environment
      });
      const abdomen = new THREE.Mesh(abdomenGeometry, spiderMaterial);
      abdomen.castShadow = true;
      spider.add(abdomen);
      
      const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const head = new THREE.Mesh(headGeometry, spiderMaterial);
      head.position.set(0, 0, 0.25);
      head.castShadow = true;
      spider.add(head);
      
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.025, 0.015, 0.5, 8);
        const leg = new THREE.Mesh(legGeometry, spiderMaterial);
        const angle = (Math.PI / 4) * (i % 4);
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        leg.position.set(Math.cos(angle) * 0.25 * sideSign, 0, Math.sin(angle) * 0.25);
        leg.rotation.z = sideSign * Math.PI / 4;
        leg.rotation.y = angle;
        leg.castShadow = true;
        spider.add(leg);
      }
      
      spider.position.y = 0.05;
      envGroup.add(spider);
      addDustParticles();
      finalizeScene();
      
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Scene loaded (fallback spider)';
        setTimeout(() => {
          loadingElement.style.opacity = '0';
          loadingElement.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            if (loadingElement && loadingElement.parentNode) {
              loadingElement.remove();
            }
          }, 1000);
        }, 1000);
      }
    }
    
    function addDustParticles() {
      const particlesCount = 100;
      const positions = new Float32Array(particlesCount * 3);
      const particleGeometry = new THREE.BufferGeometry();
      for (let i = 0; i < particlesCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.random() * 1.4 + 0.05;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.005,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.y = 0.75;
      envGroup.add(particles);
      window.dustParticles = particles;
    }
    
    // --------------------------------------------------------------------
    // CAMERA TRANSITION & VR FADE LOGIC
    // --------------------------------------------------------------------
    // The camera starts at its initial position. After a 3-second delay (if the VR headset is loaded),
    // it smoothly moves over 5 seconds to the position of the headset's left eye.
    const checkVRInterval = setInterval(() => {
      if (vrHeadset) {
        // Assume the left eye is at local coordinates (-0.15, 0.0, 0.2) relative to the headset.
        const leftEyeLocal = new THREE.Vector3(-0.15, 0.0, 0.2);
        vrHeadset.updateMatrixWorld();
        targetCamPos = leftEyeLocal.applyMatrix4(vrHeadset.matrixWorld);
        vrReady = true;
        clearInterval(checkVRInterval);
        console.log('VR headset ready. Target camera position:', targetCamPos);
      }
    }, 200);
    
    // --------------------------------------------------------------------
    // FINALIZE SCENE & ANIMATION LOOP
    // --------------------------------------------------------------------
    const mainClock = new THREE.Clock();
    function finalizeScene() {
      function animate() {
        requestAnimationFrame(animate);
        const delta = mainClock.getDelta();
        if (mixer) mixer.update(delta);
        
        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin((mainClock.getElapsedTime() + i) * 0.1) * 0.0005;
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta * 0.01;
        }
        
        // Rotate the VR headset slowly so its presentation is dynamic.
        if (vrHeadset) {
          vrHeadset.rotation.y += 0.005;
        }
        
        // Begin camera transition after transitionDelay seconds, if VR is loaded.
        const elapsed = mainClock.getElapsedTime();
        if (!transitionStarted && elapsed > transitionDelay && vrReady) {
          transitionStarted = true;
          transitionStartTime = elapsed;
          console.log('Camera transition started...');
        }
        if (transitionStarted && vrHeadset && targetCamPos) {
          const t = Math.min((elapsed - transitionStartTime) / transitionDuration, 1);
          camera.position.lerpVectors(initialCamPos, targetCamPos, t);
          // Focus camera on the jar (assumed centered at (0, 0.75, 0))
          camera.lookAt(new THREE.Vector3(0, 0.75, 0));
          if (t === 1 && vrHeadset) {
            // Fade out the VR headset by reducing material opacity.
            vrGroup.traverse(child => {
              if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, 0, 0.03);
              }
            });
            envGroup.visible = true;
          }
        }
        
        if (controls) controls.update();
        renderer.render(scene, camera);
      }
      animate();
      
      // --------------------------------------------------------------------
      // UI CONTROLS (Fullscreen, Auto-Rotate, Instructions)
      // --------------------------------------------------------------------
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
        
        const instructions = document.createElement('div');
        instructions.style.position = 'absolute';
        instructions.style.top = '10px';
        instructions.style.left = '10px';
        instructions.style.padding = '10px';
        instructions.style.background = 'rgba(255,255,255,0.7)';
        instructions.style.borderRadius = '5px';
        instructions.style.fontSize = '14px';
        instructions.style.zIndex = '10';
        instructions.innerHTML = 'A large VR headset rotates in front.<br>After 3 seconds, you zoom into its left eye.<br>The spider scene is then revealed.';
        container.appendChild(instructions);
        setTimeout(() => {
          instructions.style.opacity = '0';
          instructions.style.transition = 'opacity 1s ease';
        }, 6000);
        
        function handleResize() {
          let width, height;
          if (document.fullscreenElement === container) {
            width = window.innerWidth;
            height = window.innerHeight;
            renderer.domElement.style.width = "100vw";
            renderer.domElement.style.height = "100vh";
            document.body.style.overflow = "hidden";
          } else {
            width = container.clientWidth;
            height = container.clientHeight;
            renderer.domElement.style.width = "100%";
            renderer.domElement.style.height = "100%";
            document.body.style.overflow = "";
          }
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          console.log(`Resized to: ${width}x${height}`);
        }
        
        window.addEventListener('resize', handleResize);
        document.addEventListener('fullscreenchange', handleResize);
        document.addEventListener('webkitfullscreenchange', handleResize);
        document.addEventListener('mozfullscreenchange', handleResize);
        document.addEventListener('MSFullscreenChange', handleResize);
        handleResize();
        console.log('UI controls added.');
      }
      
      addUIControls();
      console.log('Scene setup completed (VR portal + original spider scene).');
    }
    
    // If textures do not load within 5 seconds, use fallback materials.
    setTimeout(() => {
      if (texturesLoaded < requiredTextures) {
        console.warn('Not all textures loaded in time, using fallback materials.');
        woodTextures.map = woodTextures.map || new THREE.Texture();
        woodTextures.normalMap = woodTextures.normalMap || new THREE.Texture();
        woodTextures.roughnessMap = woodTextures.roughnessMap || new THREE.Texture();
        createTable();
      }
    }, 5000);
    
  } catch (error) {
    console.error('Error creating 3D scene:', error);
    container.innerHTML = '<p style="padding:20px;text-align:center;">Error creating 3D scene. Check console for details.</p>';
  }
});
