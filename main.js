// ***** BEGIN MAIN.JS *****
// This function builds the entire photorealistic scene.
// It is not invoked automatically; it should be called only when the user presses Level 1.
window.initLevel1 = function() {
  console.log('Initializing photorealistic Three.js scene...');

  // Get the container element (make sure your index.html contains, for example,
  // <div id="arachnophobia-demo" class="level-container"></div> with appropriate CSS)
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }

  // (Library Checks)
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Make sure Three.js is loaded.');
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Failed to load 3D libraries.</p>';
    return;
  }
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.error('THREE.GLTFLoader is not defined. Make sure GLTFLoader is loaded.');
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Failed to load model loader.</p>';
    return;
  }

  try {
    // ==============================
    // 1. Loading UI (message & bar)
    // ==============================
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

    // Unified loading manager for all assets.
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
      const percent = Math.round((loaded / total) * 100);
      loadingElement.textContent = `Loading scene assets... ${percent}%`;
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
        }
      
      addUIControls();
      console.log('Scene setup completed (photorealistic scene with VR entrance).');
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
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Error creating 3D scene. Please check the browser console for details.</p>';
  }
};
// ***** END MAIN.JS *****, 1000);
      }, 500);
    };

    // ==============================
    // 2. Scene, Camera, Renderer
    // ==============================
    const scene = new THREE.Scene();
    // Use a plain gray background so the scene stands out.
    scene.background = new THREE.Color(0xa0a0a0);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);

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

    // IMPORTANT: DO NOT load the scene until the user presses Level 1.
    // (At this point, initLevel1() is called only on user action.)
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

    // ==============================
    // 3. OrbitControls (Optional)
    // ==============================
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0);
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

    // ==============================
    // 4. Texture Loader & Environment Map
    // ==============================
    const textureLoader = new THREE.TextureLoader();
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
      const cubeTextureLoader = new THREE.CubeTextureLoader();
      envMap = cubeTextureLoader.load(urls);
      scene.environment = envMap;
      // Create a subtle background plane
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5f7, side: THREE.DoubleSide });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      background.position.z = -20;
      scene.add(background);
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
      scene.background = new THREE.Color(0xf5f5f7);
    }

    // ==============================
    // 5. Lighting Setup (As in original)
    // ==============================
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

    // ==============================
    // NEW: VR Headset Entrance Animation
    // ==============================
    let vrHeadset;
    let spiderScene = new THREE.Group(); // Group to hold the original spider scene
    let animationPhase = 0; // 0: Initial view, 1: Rotating, 2: Zooming through, 3: Final scene
    let animationProgress = 0;
    let animationDuration = { 
      rotate: 2.5,  // seconds for rotation
      zoom: 3.0,    // seconds for zoom
      transition: 1.5 // seconds for fade
    };
    let leftEyePosition = new THREE.Vector3(); // Will store position of left eye lens
    let cameraStartPosition = new THREE.Vector3();
    
    // Initially hide the spider scene
    spiderScene.visible = false;
    scene.add(spiderScene);
    
    // Function to load the VR headset
    function loadVRHeadset() {
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Loading VR headset model...';
      }
      
      const gltfLoader = new THREE.GLTFLoader(loadingManager);
      gltfLoader.load(
        'oculus_quest_vr_headset.glb',
        function(gltf) {
          vrHeadset = gltf.scene;
          
          // Scale and position the headset to show interior view (lenses facing camera)
          vrHeadset.scale.set(5, 5, 5);
          vrHeadset.position.set(0, 0.8, 0);
          vrHeadset.rotation.set(0, 0, 0); // Lenses facing camera
          
          // Find the left eye lens to zoom through
          let leftEyeLens = null;
          vrHeadset.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Try to find eye lens by name
              if (node.name.toLowerCase().includes('lens') && 
                  node.name.toLowerCase().includes('left')) {
                leftEyeLens = node;
                leftEyePosition.copy(node.position);
                console.log('Found left eye lens:', node.name);
              } else if (node.name.toLowerCase().includes('eye') && 
                         node.name.toLowerCase().includes('left')) {
                leftEyeLens = node;
                leftEyePosition.copy(node.position);
                console.log('Found left eye:', node.name);
              }
              
              // Apply materials
              if (node.material) {
                node.material.envMap = envMap;
                node.material.needsUpdate = true;
              }
            }
          });
          
          // If we can't find the left eye by name, estimate position
          if (!leftEyeLens) {
            console.log('Left eye lens not found by name, estimating position');
            leftEyePosition.set(-0.04, 0, -0.02); // Adjust based on headset model
          }
          
          scene.add(vrHeadset);
          
          // Position camera inside the headset looking at left eye
          // Calculate global position of left eye
          const leftEyeWorld = new THREE.Vector3();
          vrHeadset.localToWorld(leftEyeWorld.copy(leftEyePosition));
          
          // Position camera slightly behind the left eye (inside the headset)
          cameraStartPosition.set(leftEyeWorld.x, leftEyeWorld.y, leftEyeWorld.z + 0.03);
          camera.position.copy(cameraStartPosition);
          
          // Look toward where the lens would be
          camera.lookAt(leftEyeWorld.x, leftEyeWorld.y, leftEyeWorld.z - 0.1);
          
          if (controls) {
            controls.enabled = false; // Disable controls during animation
          }
          
          animationPhase = 0;
          animationProgress = 0;
          
          // Begin loading the original spider scene
          loadOriginalScene();
        },
        undefined,
        function(error) {
          console.error('Error loading VR headset model:', error);
          // Fallback to loading the original spider scene directly
          loadOriginalSceneDirectly();
        }
      );
    }
    
    // Animation update function
    function updateVRAnimation(delta) {
      if (!vrHeadset) return;
      
      animationProgress += delta;
      
      switch(animationPhase) {
        case 0: // Initial view inside headset
          if (animationProgress > 1.0) {
            animationPhase = 1;
            animationProgress = 0;
          }
          break;
          
        case 1: // Rotating headset
          const rotationProgress = Math.min(animationProgress / animationDuration.rotate, 1.0);
          const easedRotation = easeInOutQuad(rotationProgress);
          
          // Calculate global position of left eye for each frame
          const leftEyeWorld = new THREE.Vector3();
          vrHeadset.localToWorld(leftEyeWorld.copy(leftEyePosition));
          
          // Rotate headset around the Y axis, keeping eye position relatively constant
          vrHeadset.rotation.y = Math.PI * easedRotation;
          
          // Keep camera positioned behind eye
          const camOffset = new THREE.Vector3(0, 0, 0.03 - (0.06 * easedRotation)); // Move from inside to just outside
          camera.position.copy(leftEyeWorld).add(camOffset);
          
          // Look toward the lens
          const lookOffset = new THREE.Vector3(0, 0, -0.1 - (0.2 * easedRotation));
          const lookTarget = leftEyeWorld.clone().add(lookOffset);
          camera.lookAt(lookTarget);
          
          if (rotationProgress >= 1.0) {
            animationPhase = 2;
            animationProgress = 0;
          }
          break;
          
        case 2: // Zoom through the lens
          const zoomProgress = Math.min(animationProgress / animationDuration.zoom, 1.0);
          const easedZoom = easeInOutQuad(zoomProgress);
          
          // Get updated world position of the left eye lens
          const eyeWorld = new THREE.Vector3();
          vrHeadset.localToWorld(eyeWorld.copy(leftEyePosition));
          
          // Initial position: just outside the lens
          const startPos = eyeWorld.clone().add(new THREE.Vector3(0, 0, -0.03));
          
          // Target position: in the main scene
          const targetPos = new THREE.Vector3(0, 1.2, 3.5); // Original camera position
          
          // Interpolate camera position
          camera.position.lerpVectors(startPos, targetPos, easedZoom);
          
          // Adjust look target from lens to scene center
          const startLook = eyeWorld.clone().add(new THREE.Vector3(0, 0, -1));
          const targetLook = new THREE.Vector3(0, 0.6, 0); // Original target
          
          const currentLook = new THREE.Vector3();
          currentLook.lerpVectors(startLook, targetLook, easedZoom);
          camera.lookAt(currentLook);
          
          // Make the transition to the main scene
          if (zoomProgress > 0.5) {
            // Start revealing the spider scene
            const fadeProgress = (zoomProgress - 0.5) / 0.5; // Normalize to 0-1 for last 50%
            spiderScene.visible = true;
            
            // Adjust opacity of headset if possible
            vrHeadset.traverse(node => {
              if (node.material && node.material.opacity !== undefined) {
                node.material.transparent = true;
                node.material.opacity = Math.max(0, 1 - fadeProgress);
              }
            });
            
            if (zoomProgress >= 1.0) {
              animationPhase = 3;
              vrHeadset.visible = false; // Hide headset completely
              
              // Restore original camera and controls
              if (controls) {
                controls.enabled = true;
                controls.target.set(0, 0.6, 0);
                controls.update();
              }
            }
          }
          break;
          
        case 3: // Final state - original scene
          // Nothing to do here, main scene is visible
          break;
      }
    }
    
    // Easing function for smoother animation
    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    // This function is called to load the spider scene elements
    // We'll just move the existing scene loading code here
    function loadOriginalScene() {
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
    }
    
    // This is called if the VR headset fails to load
    function loadOriginalSceneDirectly() {
      console.warn('Loading original scene directly due to VR headset failure');
      spiderScene.visible = true; // Make sure spider scene is visible
      
      // Use the original loading code
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
    }

    // ==============================
    // 6. Original Spider Scene
    // ==============================
    // Track wood texture loading
    const woodTextures = { map: null, normalMap: null, roughnessMap: null };
    let texturesLoaded = 0;
    const requiredTextures = 3;

    function createTableIfTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        createTable();
      }
    }

    function createTable() {
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
      table.position.y = -0.1; // Slightly below the jar
      table.receiveShadow = true;
      spiderScene.add(table); // Add to spiderScene instead of scene directly
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
      spiderScene.add(jar); // Add to spiderScene instead of scene directly

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
      spiderScene.add(lid); // Add to spiderScene instead of scene directly

      loadSpiderModel();
    }

    function loadSpiderModel() {
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Loading spider model...';
      }
      const gltfLoader = new THREE.GLTFLoader(loadingManager);
      if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }
      gltfLoader.load(
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
                node.material.envMap = envMap;
                node.material.needsUpdate = true;
              }
            }
          });
          spiderScene.add(spiderModel); // Add to spiderScene instead of scene directly
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Spider model has ${gltf.animations.length} animations`);
            mixer = new THREE.AnimationMixer(spiderModel);
            const idleAnimation = gltf.animations[0];
            const action = mixer.clipAction(idleAnimation);
            action.timeScale = 0.5;
            action.play();
          } else {
            console.log('No animations found in the model');
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
        envMap: envMap
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
      spiderScene.add(spider); // Add to spiderScene instead of scene directly
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
      spiderScene.add(particles); // Add to spiderScene instead of scene directly
      window.dustParticles = particles;
    }

    // --------------------------------------------------------------------
    // FINALIZE THE SCENE SETUP & START THE ANIMATION LOOP
    // --------------------------------------------------------------------
    const mainClock = new THREE.Clock();
    let mixer; // Spider animation mixer
    function finalizeScene() {
      // Start by loading the VR headset
      loadVRHeadset();
      
      function animate() {
        requestAnimationFrame(animate);
        const delta = mainClock.getDelta();
        
        // Update VR headset animation
        if (animationPhase < 3) {
          updateVRAnimation(delta);
        }
        
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
        if (controls && animationPhase === 3) controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // ----------------------------------------------------------------
      // UI CONTROLS: Fullscreen, Auto-Rotate, Instructions, and Resize Handling
      // ----------------------------------------------------------------
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
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.margin = '0';
            container.style.padding = '0';
            container.style.overflow = 'hidden';
            container.style.position = 'relative';
            try {
              container.requestFullscreen().catch(err => console.error(`Error attempting to enable fullscreen: ${err.message}`));
            } catch (e) {
              console.error('Fullscreen API not supported', e);
            }
            setTimeout(() => { handleResize(); }, 100);
          } else {
            document.exitFullscreen().catch(err => console.error(`Error attempting to exit fullscreen: ${err.message}`));
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
        instructions.innerHTML = 'Click and drag to rotate<br>Scroll to zoom';
        container.appendChild(instructions);
        setTimeout(() => {
          instructions.style.opacity = '0';
          instructions.style.transition = 'opacity 1s ease';
        }, 5000);

        // Helper: Reset container style when exiting fullscreen.
        function resetContainerStyle() {
          container.style.width = '';
          container.style.height = '600px'; // Set this to your intended default height.
          container.style.margin = '';
          container.style.padding = '';
          container.style.overflow = '';
          container.style.position = '';
        }
        
        function handleResize() {
          let width, height;
          if (document.fullscreenElement === container) {
            width = window.innerWidth;
            height = window.innerHeight;
            renderer.domElement.style.width = "100vw";
            renderer.domElement.style.height = "100vh";
            document.body.style.overflow = "hidden";
          } else {
            resetContainerStyle();
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
        document.addEventListener('fullscreenchange', function() {
          if (!document.fullscreenElement) {
            resetContainerStyle();
            handleResize();
          }
        });
        document.addEventListener('webkitfullscreenchange', function() {
          if (!document.webkitIsFullScreen) {
            resetContainerStyle();
            handleResize();
          }
        });
        document.addEventListener('mozfullscreenchange', function() {
          if (!document.mozFullScreen) {
            resetContainerStyle();
            handleResize();
          }
        });
        document.addEventListener('MSFullscreenChange', function() {
          if (!document.msFullscreenElement) {
            resetContainerStyle();
            handleResize();
          }
        });
        
        handleResize();
        console.log('UI controls added.');
      }
