// ===== BEGIN main_level2.js =====

function initLevel2() {
  console.log('Initializing Level 2 scene...');

  // Get the container for Level 2
  const container = document.getElementById('arachnophobia-level2');
  if (!container) {
    console.error('Container not found: #arachnophobia-level2');
    return;
  }

  // Check if THREE and GLTFLoader are available
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
    // --------------------------------------------------------------------
    // LOADING UI: Message & Loading Bar
    // --------------------------------------------------------------------
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
        }, 1000);
      }, 500);
    };

    // --------------------------------------------------------------------
    // SCENE, CAMERA, RENDERER
    // --------------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
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

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);
    container.appendChild(loadingBarContainer);
    renderer.domElement.style.cssText =
      "width:100%;height:100%;display:block;position:absolute;top:0;left:0;";

    // --------------------------------------------------------------------
    // OrbitControls (Optional)
    // --------------------------------------------------------------------
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

    // --------------------------------------------------------------------
    // Texture Loader & Environment Map
    // --------------------------------------------------------------------
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
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xf5f5f7, side: THREE.DoubleSide });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      background.position.z = -20;
      scene.add(background);
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
      scene.background = new THREE.Color(0xf5f5f7);
    }

    // --------------------------------------------------------------------
    // Lighting Setup (Same as Level 1)
    // --------------------------------------------------------------------
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
    // Build the Scene: No Jar/Lid – Enlarged Table and Spider on Top
    // --------------------------------------------------------------------
    // Table dimensions: 7×0.2×5, so its center is at y=0.5 (making the top at y=0.6)
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
      const tableGeometry = new THREE.BoxGeometry(7, 0.2, 5);
      const tableMaterial = new THREE.MeshStandardMaterial({
        map: woodTextures.map,
        normalMap: woodTextures.normalMap,
        roughnessMap: woodTextures.roughnessMap,
        roughness: 0.8,
        metalness: 0.1,
        envMap: envMap
      });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      // Table's center at y=0.5 => top at y=0.6
      table.position.y = 0.5;
      table.receiveShadow = true;
      scene.add(table);

      loadSpiderModel();
    }

    // --------------------------------------------------------------------
    // Load the Spider Model ("spider2.glb") and Position It on the Table
    // --------------------------------------------------------------------
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
        'spider2.glb',
        function(gltf) {
          const spiderModel = gltf.scene;
          spiderModel.scale.set(1.5, 1.5, 1.5);

          // IMPORTANT: Update world matrix so bounding box reflects scaling
          spiderModel.updateMatrixWorld(true);

          // Compute the bounding box and center
          const bbox = new THREE.Box3().setFromObject(spiderModel);
          console.log('Spider bounding box:', bbox);
          const center = new THREE.Vector3();
          bbox.getCenter(center);
          const spiderMinY = bbox.min.y;
          // In Level 1, the spider was positioned at (-bbox.min.y).
          // For Level 2, we want its lowest point at the table top (y=0.6).
          // Thus: desiredY = (-bbox.min.y) + 0.6.
          const desiredY = (-spiderMinY) + 0.6;
          console.log('spiderMinY:', spiderMinY, '=> desiredY:', desiredY);

          spiderModel.position.set(
            -center.x,
            desiredY,
            -center.z
          );

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
          console.error('Error loading spider2.glb:', error);
          loadingElement.textContent = 'Failed to load spider model.';
        }
      );
    }

    // --------------------------------------------------------------------
    // Add Dust Particles
    // --------------------------------------------------------------------
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
      scene.add(particles);
      window.dustParticles = particles;
    }

    // --------------------------------------------------------------------
    // FINALIZE THE SCENE & START THE ANIMATION LOOP
    // --------------------------------------------------------------------
    const mainClock = new THREE.Clock();
    let mixer; // Spider animation mixer
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
        if (controls) controls.update();
        renderer.render(scene, camera);
      }
      animate();

      // ----------------------------------------------------------------
      // UI CONTROLS: Fullscreen, Auto-Rotate, Instructions, Resize Handling
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

        // Helper to reset container style when exiting fullscreen.
        function resetContainerStyle() {
          container.style.width = '';
          container.style.height = '600px'; // Adjust to your default container height.
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
      
      addUIControls();
      console.log('Scene setup completed (Level 2 photorealistic scene).');
    }

    // --------------------------------------------------------------------
    // Fallback: If textures do not load within 5 seconds, use fallback materials.
    // --------------------------------------------------------------------
    setTimeout(() => {
      if (texturesLoaded < requiredTextures) {
        console.warn('Not all textures loaded in time, using fallback materials.');
        woodTextures.map = woodTextures.map || new THREE.Texture();
        woodTextures.normalMap = woodTextures.normalMap || new THREE.Texture();
        woodTextures.roughnessMap = woodTextures.roughnessMap || new THREE.Texture();
        createTable();
      }
    }, 5000);

    // --------------------------------------------------------------------
    // Resize logic
    // --------------------------------------------------------------------
    function handleResize() {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);
    handleResize();

  } catch (error) {
    console.error('Error creating 3D scene:', error);
    container.innerHTML = '<p style="padding:20px;text-align:center;">Error creating 3D scene. Please check the browser console for details.</p>';
  }
}

// ===== END main_level2.js =====

