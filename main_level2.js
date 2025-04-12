// ===== BEGIN main_level2.js =====

function initLevel2() {
  console.log('Initializing Level 2 scene...');

  // --- Minimal Modification 1: Permanently append a voice icon ("🔊") to the Level 2 button ---
  var levelButtons = document.getElementById('level-buttons');
  if (levelButtons) {
    var buttons = levelButtons.getElementsByTagName('button');
    // Assuming Level 2 is the second button (index 1)
    if (buttons.length >= 2 && !buttons[1].querySelector('.voice-icon')) {
      var voiceIcon = document.createElement('span');
      voiceIcon.className = 'voice-icon';
      voiceIcon.textContent = " 🔊";
      voiceIcon.style.fontSize = "16px";
      voiceIcon.style.marginLeft = "5px";
      buttons[1].appendChild(voiceIcon);
    }
  }

  // --- Minimal Modification 2: Play or shut off Level 2 voice recording ---
  if (window.level2AudioInstance && !window.level2AudioInstance.paused) {
    // If the voice is already playing, shut it off.
    window.level2AudioInstance.pause();
    window.level2AudioInstance.currentTime = 0;
  } else {
    // Otherwise, create and play the audio.
    window.level2AudioInstance = new Audio('recordinglevel2.mp3');
    window.level2AudioInstance.play().catch(function(error) {
      console.error("Error playing Level 2 audio:", error);
    });
  }

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

  // References for spider animation
  let spiderModelRef = null;
  let spiderLegNodes = [];       // for leg-twitch animations
  let spiderBasePosition = new THREE.Vector3();

  try {
    // --------------------------------------------------------------------
    // LOADING UI: Message only (blue loading bar removed)
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

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
      const percent = Math.round((loaded / total) * 100);
      loadingElement.textContent = `Loading scene assets... ${percent}%`;
    };
    loadingManager.onLoad = function() {
      setTimeout(() => {
        loadingElement.style.transition = 'opacity 1s ease';
        loadingElement.style.opacity = 0;
        setTimeout(() => {
          loadingElement.remove();
        }, 1000);
      }, 500);
    };

    // --------------------------------------------------------------------
    // SCENE, CAMERA, RENDERER
    // --------------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);

    // Camera is a bit higher, looking at spider’s eyes
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 4.5);
    camera.lookAt(0, 0.6, 0);

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

      // Large plane behind the scene
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.MeshBasicMaterial({
        color: 0xf5f5f7,
        side: THREE.DoubleSide
      });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      background.position.z = -20;
      scene.add(background);
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
      scene.background = new THREE.Color(0xf5f5f7);
    }

    // --------------------------------------------------------------------
    // Lighting Setup (Enhanced for better shadows)
    // --------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 6, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
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

    // Add a spot light for enhanced spider shadow
    const spotLight = new THREE.SpotLight(0xffffff, 0.8);
    spotLight.position.set(2, 5, 2);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 20;
    scene.add(spotLight);

    // --------------------------------------------------------------------
    // VR Headset Entrance Animation Setup
    // --------------------------------------------------------------------
    // All main scene objects (table, spider, dust) are grouped in mainScene and are initially hidden.
    let vrHeadset;
    let mainScene = new THREE.Group();
    mainScene.visible = false;
    scene.add(mainScene);

    let animationPhase = 0; // 0: Wait, 1: Rotate, 2: Zoom, 3: Inside
    let animationProgress = 0;
    const animationDuration = { 
      rotate: 3.0, 
      zoom: 1.5,    
      transition: 1.5
    };
    let leftEyePosition = new THREE.Vector3();

    // Function to load the VR headset model
    function loadVRHeadset() {
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Loading VR headset model...';
      }
      const gltfLoader = new THREE.GLTFLoader(loadingManager);
      gltfLoader.load(
        'oculus_quest_vr_headset.glb',
        function(gltf) {
          vrHeadset = gltf.scene;
          vrHeadset.scale.set(5, 5, 5);
          vrHeadset.position.set(0, 0.8, 0);
          vrHeadset.rotation.set(0, 0, 0);

          // Find the left eye lens for zooming
          vrHeadset.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.name.toLowerCase().includes('eye') && node.name.toLowerCase().includes('left')) {
                leftEyePosition.copy(node.position);
                console.log('Found left eye:', node.name, leftEyePosition);
              }
              if (node.material) {
                node.material.envMap = envMap;
                node.material.needsUpdate = true;
              }
            }
          });
          if (leftEyePosition.length() === 0) {
            leftEyePosition.set(-0.03, 0, -0.05);
            leftEyePosition.applyMatrix4(vrHeadset.matrixWorld);
          }
          scene.add(vrHeadset);

          camera.position.set(0, 1.6, 4.5);
          camera.lookAt(vrHeadset.position);

          if (loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Loading scene assets...';
          }
          animationPhase = 0;
          animationProgress = 0;
          loadMainScene(); // Begin loading the main scene into mainScene
        },
        undefined,
        function(error) {
          console.error('Error loading VR headset model:', error);
          loadMainScene();
        }
      );
    }

    // Update VR headset animation between phases
    function updateVRHeadsetAnimation(delta) {
      if (!vrHeadset) return;
      animationProgress += delta;
      switch(animationPhase) {
        case 0: 
          if (animationProgress > 1.5) {
            animationPhase = 1;
            animationProgress = 0;
          }
          break;
        case 1: 
          {
            const rotationProgress = Math.min(animationProgress / animationDuration.rotate, 1.0);
            const easedRotation = easeInOutCubic(rotationProgress);
            vrHeadset.rotation.y = Math.PI * easedRotation;
            if (rotationProgress >= 1.0) {
              animationPhase = 2;
              animationProgress = 0;
            }
          }
          break;
        case 2: 
          {
            const zoomProgress = Math.min(animationProgress / animationDuration.zoom, 1.0);
            const easedZoom = easeInOutCubic(zoomProgress);
            const leftEyeWorld = new THREE.Vector3();
            leftEyePosition.clone().applyMatrix4(vrHeadset.matrixWorld);
            vrHeadset.localToWorld(leftEyeWorld.copy(leftEyePosition));

            const startPos = new THREE.Vector3(0, 1.2, 2.0);
            const targetPos = leftEyeWorld.clone().add(new THREE.Vector3(0, 0, 0.05));
            camera.position.lerpVectors(startPos, targetPos, easedZoom);

            const startTarget = vrHeadset.position.clone();
            const endTarget = leftEyeWorld.clone().add(new THREE.Vector3(0, 0, -1));
            const currentTarget = new THREE.Vector3();
            currentTarget.lerpVectors(startTarget, endTarget, easedZoom);
            camera.lookAt(currentTarget);

            if (zoomProgress > 0.7) {
              const fadeProgress = (zoomProgress - 0.7) / 0.3;
              mainScene.visible = true;
              vrHeadset.traverse(node => {
                if (node.material) {
                  node.material.transparent = true;
                  node.material.opacity = 1 - fadeProgress;
                }
              });
              if (zoomProgress >= 1.0) {
                animationPhase = 3;
                animationProgress = 0;
                vrHeadset.visible = false;
                camera.position.set(0, 1.6, 4.5);
                camera.lookAt(0, 0.6, 0);
                if (controls) {
                  controls.target.set(0, 0.6, 0);
                  controls.update();
                }
              }
            }
          }
          break;
        case 3:
          // VR animation complete; mainScene is active.
          break;
      }
    }

    // Easing function for smoother animation
    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // --------------------------------------------------------------------
    // Main Photorealistic Scene (Group: mainScene)
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
      const tableGeometry = new THREE.BoxGeometry(14, 0.2, 10);
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
      mainScene.add(table);

      loadSpiderModel();
    }

    // --------------------------------------------------------------------
    // Load the Spider Model
    // --------------------------------------------------------------------
    let mixer;
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
        'jumping_spider_habronattus_coecatus_compressed.glb',
        function(gltf) {
          spiderModelRef = gltf.scene;
          // Make the spider half its original size
          spiderModelRef.scale.set(0.5, 0.5, 0.5);
          spiderModelRef.updateMatrixWorld(true);

          // Compute bounding box to place spider on table
          const bbox = new THREE.Box3().setFromObject(spiderModelRef);
          const minY = bbox.min.y;
          const center = new THREE.Vector3();
          bbox.getCenter(center);

          // Place the spider so that bounding box bottom is at y=0.6
          spiderModelRef.position.set(
            -center.x,
            -minY + 0.6,
            -center.z
          );
          spiderModelRef.updateMatrixWorld(true);

          // Rotate spider 180 degrees so it faces the camera
          spiderModelRef.rotation.y = Math.PI;

          // Save base position for gentle bobbing
          spiderBasePosition.copy(spiderModelRef.position);

          // Collect legs for twitch animation
          spiderModelRef.traverse(function(node) {
            if (node.name && node.name.toLowerCase().includes('leg')) {
              spiderLegNodes.push(node);
            }
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (node.material) {
                node.material.envMap = envMap;
                node.material.shadowSide = THREE.FrontSide;
                node.material.needsUpdate = true;
              }
            }
          });

          mainScene.add(spiderModelRef);
          spotLight.target = spiderModelRef;

          // Built-in animations (if any)
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Spider model has ${gltf.animations.length} animations`);
            mixer = new THREE.AnimationMixer(spiderModelRef);
            const idleAnimation = gltf.animations[0];
            const action = mixer.clipAction(idleAnimation);
            action.timeScale = 0.75;
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
      mainScene.add(particles);
      window.dustParticles = particles;
    }

    // --------------------------------------------------------------------
    // Gentle “alive” motion + leg twitch for the spider
    // --------------------------------------------------------------------
    function animateSpiderModel(elapsedTime, delta) {
      if (!spiderModelRef) return;

      // Gentle bobbing
      const amplitude = 0.02;
      const speed = 2.0;
      const offsetY = amplitude * Math.sin(elapsedTime * speed);
      spiderModelRef.position.y = spiderBasePosition.y + offsetY;

      // Gentle slow body rotation
      const rotationSpeed = 0.1;
      spiderModelRef.rotation.y += rotationSpeed * delta;

      // Leg twitch: small, quick rotation
      // Each leg gets a slightly different frequency/phase
      spiderLegNodes.forEach((leg, index) => {
        const legAmplitude = 0.05;
        const legSpeed = 10 + index; // vary speed by index
        const legRotation = legAmplitude * Math.sin(elapsedTime * legSpeed);
        // You can rotate around X, Y, or Z depending on the leg's orientation
        leg.rotation.x = legRotation;
      });
    }

    // --------------------------------------------------------------------
    // FINALIZE THE SCENE & START THE ANIMATION LOOP
    // --------------------------------------------------------------------
    const mainClock = new THREE.Clock();
    function finalizeScene() {
      loadVRHeadset();

      function animate() {
        requestAnimationFrame(animate);
        const delta = mainClock.getDelta();
        const elapsedTime = mainClock.getElapsedTime();

        // VR Headset entrance animation
        if (animationPhase < 3) {
          updateVRHeadsetAnimation(delta);
        }

        // Update built-in GLTF animations (if any)
        if (mixer) mixer.update(delta);

        // Custom spider bobbing + leg twitch
        animateSpiderModel(elapsedTime, delta);

        // Dust float animations
        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin((elapsedTime + i) * 0.1) * 0.0005;
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta * 0.01;
        }

        // Controls handling
        if (controls && animationPhase === 3) {
          controls.enabled = true;
          controls.update();
        } else if (controls) {
          controls.enabled = false;
        }

        renderer.render(scene, camera);
      }
      animate();

      // ------------------------------
      // UI CONTROLS: Fullscreen, Auto-Rotate, Instructions, Resize Handling
      // ------------------------------
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

        function resetContainerStyle() {
          container.style.width = '';
          container.style.height = '600px';
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
      console.log('Scene setup completed (Level 2 photorealistic scene with VR headset entrance).');
    }

    // --------------------------------------------------------------------
    // Fallback if textures do not load
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
