// ***** BEGIN REFINED main_level2.js *****
/**
 * Synaeon - Level 2 VR Demo Initialization
 *
 * Initializes and manages the Three.js scene for the Level 2 (intense exposure)
 * arachnophobia demo, featuring a different spider model and potentially
 * adjusted scene parameters compared to Level 1. Includes VR headset entrance.
 */

// Encapsulate level logic in a self-contained scope
(function() {
  'use strict';

  // Module-level variables for scene state (Level 2 specific)
  let scene, camera, renderer, controls, mainScene, vrHeadset, animationMixer;
  let animationRequestId = null;
  let containerElement = null;
  let loadingManager = null;
  let loadingElement = null;
  let envMap = null;
  let audioInstance = null; // For Level 2 audio

  // Constants for animation timings (can be same or different from Level 1)
  const ANIMATION_DURATION = {
    WAIT: 1.0,
    ROTATE: 2.5,
    ZOOM: 1.8,
    FADE_OUT: 0.5
  };

  // VR Headset Animation State (Level 2 specific instance)
  let animationState = {
      phase: 0, // 0: Wait, 1: Rotating, 2: Zooming, 3: Inside
      progress: 0,
      leftEyeWorldPosition: new THREE.Vector3(),
      initialCameraPosition: new THREE.Vector3(0, 1.4, 4.0), // Same start as Lvl 1
      headsetTargetPosition: new THREE.Vector3(0, 0.8, 0)
  };

  /**
   * Initializes the Level 2 scene.
   * @param {HTMLElement} container - The DOM element for Level 2 rendering.
   */
  window.initLevel2 = function(container) {
    console.log('Initializing Synaeon Level 2 Scene...');
    containerElement = container;

    // --- Cleanup previous instance ---
    cleanupScene(); // Ensure clean state

    // Basic checks
    if (!containerElement) {
      console.error('FATAL: Container element not provided for initLevel2.');
      return;
    }
    if (typeof THREE === 'undefined') {
      console.error('FATAL: THREE object not found.');
      containerElement.innerHTML = '<p class="error-message">Error: 3D Library (THREE) missing.</p>';
      return;
    }

    // --- Setup ---
    try {
        setupLoadingUI();
        setupScene();
        setupCamera(); // Use specific Level 2 camera settings if needed later
        setupRenderer();
        setupControls();
        setupLighting(); // Can have different lighting for Level 2
        loadEnvironmentMap();
        loadAssets(); // Load Level 2 specific assets
    } catch (error) {
        console.error('Error during Level 2 Three.js initialization:', error);
        displayErrorMessage('Failed to initialize Level 2 scene.');
        cleanupScene();
    }
  };

  /**
   * Sets up the loading UI for Level 2.
   */
  function setupLoadingUI() {
    loadingManager = new THREE.LoadingManager();
    loadingElement = document.createElement('div');
    loadingElement.id = 'loading-status-level2'; // Unique ID
    loadingElement.className = 'loading-status-indicator'; // Use shared class
    loadingElement.textContent = 'Initializing Intense Scene...';
    containerElement.appendChild(loadingElement);

     // Apply styles (same as Level 1)
     Object.assign(loadingElement.style, {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', color: '#f0f8ff',
        fontSize: '16px', fontWeight: '500', zIndex: '100',
        padding: '10px 15px', background: 'rgba(8, 15, 33, 0.7)',
        borderRadius: '8px', backdropFilter: 'blur(5px)', textAlign: 'center'
    });

    loadingManager.onProgress = (url, loaded, total) => {
      const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
      loadingElement.textContent = `Loading Intense Assets... ${percent}%`;
      console.log(`Lvl 2 Loading: ${url} (${loaded}/${total})`);
    };

    loadingManager.onLoad = () => {
      console.log('All Level 2 assets loaded.');
      setTimeout(() => {
          if (loadingElement) {
             loadingElement.style.transition = 'opacity 0.8s ease-out';
             loadingElement.style.opacity = '0';
             setTimeout(() => { loadingElement?.remove(); loadingElement = null; }, 800);
          }
          if (vrHeadset) {
              startHeadsetAnimation();
          } else {
              console.warn("Lvl 2: VR Headset model not loaded when onLoad triggered.");
              displayErrorMessage('VR Headset failed to load.');
          }
      }, 300);
    };

     loadingManager.onError = (url) => {
      console.error(`Lvl 2 Error loading asset: ${url}`);
      displayErrorMessage(`Failed to load asset: ${url.split('/').pop()}`);
    };
  }

  // --- Core Setup Functions (Scene, Camera, Renderer, Controls, Lighting, EnvMap) ---
  // These can be mostly identical to main.js, with minor adjustments if needed
  // for Level 2 specifics (e.g., different fog, camera start, lighting intensity).

  function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x010204); // Dark background
    // Maybe slightly denser fog for intense scene?
    scene.fog = new THREE.Fog(0x010204, 10, 35); // Closer fog start/end
  }

  function setupCamera() {
    const aspect = containerElement.clientWidth / containerElement.clientHeight;
    camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000); // Slightly different FOV?
    camera.position.copy(animationState.initialCameraPosition);
    camera.lookAt(animationState.headsetTargetPosition);
  }

  function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0; // Maybe slightly brighter/darker exposure?
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerElement.innerHTML = ''; // Clear previous
    containerElement.appendChild(renderer.domElement);
    if(loadingElement) containerElement.appendChild(loadingElement);

    renderer.domElement.style.cssText = `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; outline: none;`;
  }

  function setupControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0); // Initial target
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 1.0; // Allow closer zoom?
      controls.maxDistance = 20; // Allow further zoom out for larger table
      controls.minPolarAngle = Math.PI * 0.1;
      controls.maxPolarAngle = Math.PI * 0.65; // Allow looking slightly higher?
      controls.enablePan = false;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.4;
      controls.enabled = false; // Disabled during animation
      controls.update();
    } else {
      console.warn('Lvl 2: OrbitControls library not loaded.');
    }
  }

  function setupLighting() {
     // Similar lighting setup, maybe slightly more intense or dramatic?
     scene.add(new THREE.AmbientLight(0x80bfff, 0.3)); // Slightly less ambient?

     const keyLight = new THREE.DirectionalLight(0xffffff, 0.9); // Slightly stronger key
     keyLight.position.set(4, 9, 6); // Different angle?
     keyLight.castShadow = true;
     keyLight.shadow.mapSize.width = 2048;
     keyLight.shadow.mapSize.height = 2048;
     keyLight.shadow.camera.near = 1;
     keyLight.shadow.camera.far = 35;
     keyLight.shadow.camera.left = -12;
     keyLight.shadow.camera.right = 12;
     keyLight.shadow.camera.top = 12;
     keyLight.shadow.camera.bottom = -12;
     keyLight.shadow.bias = -0.001;
     scene.add(keyLight);

     const fillLight = new THREE.DirectionalLight(0x80bfff, 0.4); // Stronger fill?
     fillLight.position.set(-6, 5, -4);
     scene.add(fillLight);

     const hemiLight = new THREE.HemisphereLight( 0x80dfff, 0x080f21, 0.25 ); // Slightly stronger hemi
     scene.add( hemiLight );
  }

  function loadEnvironmentMap() {
     // Use the same environment map or a different one for Level 2
     try {
      const urls = [ // Using Pisa again, replace if needed
        'https://threejs.org/examples/textures/cube/pisa/px.png', 'https://threejs.org/examples/textures/cube/pisa/nx.png',
        'https://threejs.org/examples/textures/cube/pisa/py.png', 'https://threejs.org/examples/textures/cube/pisa/ny.png',
        'https://threejs.org/examples/textures/cube/pisa/pz.png', 'https://threejs.org/examples/textures/cube/pisa/nz.png'
      ];
      const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);
      envMap = cubeTextureLoader.load(urls, () => {
          scene.environment = envMap;
          console.log("Lvl 2: Environment map loaded.");
      }, undefined, (error) => {
          console.error("Lvl 2: Failed to load environment map:", error);
          scene.background = new THREE.Color(0x010204);
      });
    } catch (e) {
      console.warn('Lvl 2: Environment mapping might not be fully supported:', e);
      scene.background = new THREE.Color(0x010204);
    }
  }

  // --- Asset Loading (Level 2 Specific) ---
  function loadAssets() {
      mainScene = new THREE.Group();
      mainScene.visible = false;
      scene.add(mainScene);

      loadVRHeadsetModel(); // Load headset (same model as Level 1)
      loadTableTextures(); // Load table textures (can reuse Lvl 1 logic)
  }

  // --- VR Headset Logic (Mostly identical to main.js) ---
  function loadVRHeadsetModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.error('Lvl 2: GLTFLoader not available.');
        displayErrorMessage('VR Headset loader unavailable.');
        return;
    }
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
     if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
    }

    gltfLoader.load('oculus_quest_vr_headset.glb', (gltf) => {
        console.log('Lvl 2: VR headset model loaded.');
        vrHeadset = gltf.scene;
        vrHeadset.scale.set(5, 5, 5);
        vrHeadset.position.copy(animationState.headsetTargetPosition);
        vrHeadset.rotation.set(0, 0, 0);
        let leftEyeObject = null;
        vrHeadset.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; node.receiveShadow = true;
            if (node.material) {
                node.material.envMap = envMap;
                node.material.envMapIntensity = 0.7; // Adjust intensity
                node.material.needsUpdate = true;
            }
             if (!leftEyeObject && node.name.toLowerCase().includes('lens') && node.name.toLowerCase().includes('left')) {
                leftEyeObject = node;
            }
          }
        });
        // Calculate left eye world position
        if (leftEyeObject) {
            vrHeadset.updateMatrixWorld(true);
            leftEyeObject.getWorldPosition(animationState.leftEyeWorldPosition);
        } else {
            console.warn("Lvl 2: Left eye lens object not found. Using fallback.");
            const fallbackOffset = new THREE.Vector3(-0.03, 0, 0.05);
            animationState.leftEyeWorldPosition.copy(vrHeadset.position).add(fallbackOffset);
        }
        scene.add(vrHeadset);
      },
      undefined,
      (error) => {
        console.error('Lvl 2: Error loading VR headset model:', error);
        displayErrorMessage('Failed to load VR Headset.');
        mainScene.visible = true; // Fallback: show main scene
        animationState.phase = 3;
      }
    );
  }

  function startHeadsetAnimation() {
      animationState.phase = 0;
      animationState.progress = 0;
      if (vrHeadset) {
          vrHeadset.visible = true;
           vrHeadset.traverse(node => {
             if(node.material) {
                 node.material.opacity = 1.0;
                 node.material.transparent = false;
             }
          });
      }
       if (!animationRequestId) animate();
       // Initialize Level 2 audio playback
       playLevelAudio('recordinglevel2.mp3'); // Use Level 2 recording
  }

   function playLevelAudio(audioFile) {
      if (audioInstance && !audioInstance.paused) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
      }
      audioInstance = new Audio(audioFile);
      audioInstance.play().catch(error => {
          console.error(`Error playing Lvl 2 audio (${audioFile}):`, error);
      });

       // Append voice icon if not present
       const levelButton = document.getElementById('level2-btn'); // Target Level 2 button
       if (levelButton && !levelButton.querySelector('.voice-icon')) {
           const voiceIcon = document.createElement('span');
           voiceIcon.className = 'voice-icon';
           voiceIcon.textContent = " 🔊";
           Object.assign(voiceIcon.style, { fontSize: "1em", marginLeft: "5px" });
           levelButton.appendChild(voiceIcon);
       }
  }

  // updateVRHeadsetAnimation remains the same as main.js, using the Level 2 animationState
  function updateVRHeadsetAnimation(delta) {
      if (!vrHeadset || animationState.phase === 3) return;
      animationState.progress += delta;

      switch(animationState.phase) {
        case 0: // Wait
            if (animationState.progress >= ANIMATION_DURATION.WAIT) {
                animationState.phase = 1; animationState.progress = 0;
            }
            break;
        case 1: // Rotate
            const rotProg = Math.min(animationState.progress / ANIMATION_DURATION.ROTATE, 1.0);
            vrHeadset.rotation.y = Math.PI * easeInOutCubic(rotProg);
            if (rotProg >= 1.0) {
                animationState.phase = 2; animationState.progress = 0;
                // Recalculate eye position precisely after rotation
                vrHeadset.updateMatrixWorld(true);
                const leftEyeObject = vrHeadset.getObjectByName("Left_Lens_Mesh_Name"); // Find by name if possible
                if (leftEyeObject) {
                    leftEyeObject.getWorldPosition(animationState.leftEyeWorldPosition);
                } else {
                     const fallbackOffset = new THREE.Vector3(0.03, 0, 0.05);
                     animationState.leftEyeWorldPosition.copy(vrHeadset.position).add(fallbackOffset.applyQuaternion(vrHeadset.quaternion));
                }
            }
            break;
        case 2: // Zoom
            const zoomProg = Math.min(animationState.progress / ANIMATION_DURATION.ZOOM, 1.0);
            const easedZoom = easeInOutSine(zoomProg);
            const zoomTargetPos = animationState.leftEyeWorldPosition.clone().add(new THREE.Vector3(0, 0, 0.02));
            camera.position.lerpVectors(animationState.initialCameraPosition, zoomTargetPos, easedZoom);
            const lookAtTarget = new THREE.Vector3().lerpVectors(
                animationState.headsetTargetPosition,
                animationState.leftEyeWorldPosition.clone().add(new THREE.Vector3(0, 0, -0.5)),
                easedZoom
            );
            camera.lookAt(lookAtTarget);

            const fadeStartTime = ANIMATION_DURATION.ZOOM - ANIMATION_DURATION.FADE_OUT;
            if (animationState.progress > fadeStartTime) {
                mainScene.visible = true;
                const fadeProgress = Math.min((animationState.progress - fadeStartTime) / ANIMATION_DURATION.FADE_OUT, 1.0);
                const opacity = 1.0 - fadeProgress;
                vrHeadset.traverse(node => {
                    if (node.material) {
                       if (!node.material.userData?.originalOpacity) {
                           node.material.userData = node.material.userData || {};
                           node.material.userData.originalOpacity = node.material.opacity;
                           node.material.userData.originalTransparent = node.material.transparent;
                       }
                       node.material.transparent = true;
                       node.material.opacity = opacity * (node.material.userData.originalOpacity ?? 1.0);
                    }
                });
                if (fadeProgress >= 1.0) {
                    animationState.phase = 3; animationState.progress = 0;
                    vrHeadset.visible = false;
                    // Restore headset materials
                     vrHeadset.traverse(node => {
                        if (node.material?.userData?.originalOpacity !== undefined) {
                           node.material.opacity = node.material.userData.originalOpacity;
                           node.material.transparent = node.material.userData.originalTransparent;
                           delete node.material.userData.originalOpacity;
                           delete node.material.userData.originalTransparent;
                        }
                     });

                    // Set final camera for Level 2 scene - maybe wider/further back?
                    camera.position.set(0, 2.5, 8.0); // Higher and further back
                    const mainSceneCenter = new THREE.Vector3(0, 0.5, 0); // Approx center of table
                    camera.lookAt(mainSceneCenter);
                    if (controls) {
                        controls.enabled = true;
                        controls.target.copy(mainSceneCenter);
                        controls.minDistance = 1.5; // Update min distance if needed
                        controls.maxDistance = 25; // Update max distance
                        controls.update();
                    }
                    addSceneUIControls();
                }
            }
            break;
        case 3: break; // Animation complete
      }
  }

  // Easing functions (can be shared or defined locally)
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

  // --- Main Scene Creation (Level 2 Specifics) ---
  function loadTableTextures() {
    // Reuse the same texture loading logic as main.js if textures are the same
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const texturePaths = {
        map: 'https://threejs.org/examples/textures/hardwood2_diffuse.jpg',
        normalMap: 'https://threejs.org/examples/textures/hardwood2_normal.jpg',
        roughnessMap: 'https://threejs.org/examples/textures/hardwood2_roughness.jpg'
    };
    const woodTextures = {};
    let texturesLoadedCount = 0;
    const requiredTextures = Object.keys(texturePaths).length;

    Object.entries(texturePaths).forEach(([key, path]) => {
        textureLoader.load(path, (texture) => {
            texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(6, 4); // More tiling for a larger table
            if (key === 'map') texture.encoding = THREE.sRGBEncoding;
            woodTextures[key] = texture;
            texturesLoadedCount++;
            if (texturesLoadedCount === requiredTextures) {
                console.log("Lvl 2: Table textures loaded.");
                createLargeTable(woodTextures); // Create the specific Level 2 table
            }
        }, undefined, (error) => {
            console.error(`Lvl 2: Failed to load texture ${key}:`, error);
            texturesLoadedCount++;
            if (texturesLoadedCount === requiredTextures) {
                 console.warn("Lvl 2: Creating table with missing textures.");
                 createLargeTable(woodTextures);
            }
        });
    });
  }

  function createLargeTable(textures) {
    const tableGeometry = new THREE.BoxGeometry(12, 0.3, 8); // Larger table dimensions
    const tableMaterial = new THREE.MeshStandardMaterial({
      map: textures.map, normalMap: textures.normalMap, roughnessMap: textures.roughnessMap,
      roughness: 0.7, metalness: 0.1, // Slightly less rough?
      envMap: envMap, envMapIntensity: 0.4
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.15; // Position top surface at y=0
    table.receiveShadow = true;
    mainScene.add(table);
    console.log("Level 2 Table created.");

    // Load the jumping spider model for Level 2
    loadJumpingSpiderModel();
  }

  function loadJumpingSpiderModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
         console.error('Lvl 2: GLTFLoader not available for jumping spider.');
         displayErrorMessage('Jumping Spider loader unavailable.');
         // Fallback? Maybe use the Level 1 procedural spider?
         return;
    }
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    // DRACO should be set already

    gltfLoader.load(
      'jumping_spider_habronattus_coecatus_compressed.glb', // Level 2 spider model
      (gltf) => {
        console.log('Jumping spider model loaded successfully.');
        const spiderModel = gltf.scene;

        // Scale and position for Level 2 - maybe larger or smaller?
        spiderModel.scale.set(1.2, 1.2, 1.2); // Slightly larger?
        spiderModel.position.y = 0.01; // Place on table

        // Center and place (adjust based on model's pivot)
        const bbox = new THREE.Box3().setFromObject(spiderModel);
        spiderModel.position.y -= bbox.min.y; // Place bottom on table (y=0)

        spiderModel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true; node.receiveShadow = true;
            if (node.material) {
               node.material.envMap = envMap;
               node.material.envMapIntensity = 0.5;
               // Specific material tweaks for jumping spider if needed
               // node.material.roughness = 0.5;
               node.material.needsUpdate = true;
            }
          }
        });
        mainScene.add(spiderModel);

        // Animation setup for jumping spider
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`Jumping spider model has ${gltf.animations.length} animations.`);
          animationMixer = new THREE.AnimationMixer(spiderModel);
          // Play a suitable animation - maybe 'Idle' or 'Walk' if available
          const idleAnimation = THREE.AnimationClip.findByName(gltf.animations, 'Idle') || gltf.animations[0];
          if (idleAnimation) {
              const action = animationMixer.clipAction(idleAnimation);
              action.setLoop(THREE.LoopRepeat);
              action.play();
              console.log(`Playing animation: ${idleAnimation.name}`);
          } else {
              console.warn("Could not find 'Idle' animation, playing first available.");
              const action = animationMixer.clipAction(gltf.animations[0]);
              action.setLoop(THREE.LoopRepeat);
              action.play();
          }

        } else {
          console.log('No animations found in the jumping spider model.');
        }

        addDustParticles(); // Add dust specific to Level 2 context
        // Don't call finalize, wait for loadingManager.onLoad
      },
      undefined,
      (error) => {
        console.error('Error loading jumping spider model:', error);
        displayErrorMessage('Failed to load Jumping Spider model.');
        // Maybe add Level 1 spider as fallback?
      }
    );
  }

  function addDustParticles() {
     // Same dust particle logic as Level 1, maybe adjust count or area
    const particlesCount = 200; // More dust for larger scene?
    const positions = new Float32Array(particlesCount * 3);
    const geometry = new THREE.BufferGeometry();
    const tableRadius = 5; // Approx radius of the larger table

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const radius = Math.random() * tableRadius;
        const angle = Math.random() * Math.PI * 2;
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = 0.1 + Math.random() * 2.0; // Wider height range?
        positions[i3 + 2] = Math.sin(angle) * radius;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.01, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    mainScene.add(particles);
    window.dustParticlesLvl2 = particles; // Unique name
    console.log("Level 2 Dust particles added.");
  }

  // --- UI Controls (Identical setup logic to main.js) ---
   function addSceneUIControls() {
    if (!containerElement || containerElement.querySelector('.scene-ui-button')) return;

    const commonStyle = `position: absolute; bottom: 15px; font-size: 22px; padding: 8px 12px; background: rgba(8, 15, 33, 0.6); border: 1px solid rgba(255,255,255,0.2); color: #f0f8ff; border-radius: 8px; cursor: pointer; z-index: 10; backdrop-filter: blur(5px); transition: background 0.3s ease;`;

    const fsButton = document.createElement('button');
    fsButton.textContent = '⛶'; fsButton.className = 'scene-ui-button'; fsButton.title = 'Toggle Fullscreen';
    fsButton.style.cssText = commonStyle + 'right: 15px;';
    fsButton.addEventListener('click', toggleFullscreen);
    containerElement.appendChild(fsButton);

    if (controls) {
      const rotateButton = document.createElement('button');
      rotateButton.textContent = '↻'; rotateButton.className = 'scene-ui-button'; rotateButton.title = 'Toggle Auto-Rotation';
      rotateButton.style.cssText = commonStyle + 'right: 70px;';
      rotateButton.addEventListener('click', () => {
          controls.autoRotate = !controls.autoRotate;
          rotateButton.style.background = controls.autoRotate ? 'rgba(0, 170, 255, 0.7)' : 'rgba(8, 15, 33, 0.6)';
          rotateButton.style.borderColor = controls.autoRotate ? 'rgba(0, 170, 255, 0.5)' : 'rgba(255,255,255,0.2)';
      });
      containerElement.appendChild(rotateButton);
    }

     const instructions = document.createElement('div');
     instructions.className = 'scene-instructions';
     instructions.innerHTML = '<strong>Controls:</strong> Drag to rotate, Scroll to zoom';
     Object.assign(instructions.style, {
        position: 'absolute', top: '15px', left: '15px', padding: '8px 12px',
        background: 'rgba(8, 15, 33, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
        color: '#f0f8ff', borderRadius: '8px', fontSize: '13px', zIndex: '10',
        backdropFilter: 'blur(5px)', opacity: '1', transition: 'opacity 1s ease 4s'
     });
     containerElement.appendChild(instructions);
     setTimeout(() => { instructions.style.opacity = '0'; }, 100);

    console.log('Level 2 Scene UI controls added.');
  }

   function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerElement.requestFullscreen().catch(err => console.error(`Lvl 2 Fullscreen Error: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  }

  // --- Resize Handling ---
  function handleResize() {
      if (!renderer || !camera || !containerElement) return;
      const width = containerElement.clientWidth;
      const height = containerElement.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      console.log(`Resized Level 2 to: ${width}x${height}`);
  }

  // --- Cleanup ---
  function cleanupScene() {
    console.log("Cleaning up Level 2 scene...");
    if (animationRequestId) cancelAnimationFrame(animationRequestId);
    animationRequestId = null;

    if (audioInstance) { audioInstance.pause(); audioInstance = null; }

    window.removeEventListener('resize', handleResize);
    document.removeEventListener('fullscreenchange', handleResize);

    if (scene) {
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(mat => {
             Object.keys(mat).forEach(key => {
                const value = mat[key];
                if (value && typeof value.dispose === 'function') {
                   value.dispose(); // Dispose textures
                }
             });
             mat.dispose();
          });
        }
      });
      scene = null;
    }

    if (renderer) {
      renderer.dispose();
      renderer.domElement?.remove();
      renderer = null;
    }
    if (controls) { controls.dispose(); controls = null; }

    vrHeadset = null; mainScene = null; mixer = null; animationMixer = null;
    containerElement = null; loadingManager = null;
    loadingElement?.remove(); loadingElement = null;
    envMap = null; window.dustParticlesLvl2 = null;

    animationState.phase = 0; animationState.progress = 0;
    console.log("Level 2 cleanup complete.");
  }
  window.cleanupLevel2 = cleanupScene; // Expose for external cleanup if needed

  // --- Error Display ---
  function displayErrorMessage(message) {
      if (containerElement) {
          containerElement.innerHTML = `<p style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#dc3545; background:rgba(255,0,0,0.1); border:1px solid #dc3545; padding:15px 20px; border-radius:8px; text-align:center; font-size: 16px; z-index: 101;">${message}</p>`;
      }
      console.error("Scene Error (Level 2):", message);
  }

  // --- Animation Loop ---
  const clock = new THREE.Clock(); // Shared clock instance
  function animate() {
    animationRequestId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (animationState.phase < 3) updateVRHeadsetAnimation(delta);

    if (mainScene?.visible) {
        if (animationMixer) animationMixer.update(delta);

        // Animate Dust Particles Lvl 2
        if (window.dustParticlesLvl2) {
          const particles = window.dustParticlesLvl2;
          const positions = particles.geometry.attributes.position.array;
          const time = clock.getElapsedTime();
          for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            positions[i3 + 1] += (Math.sin(time * 0.25 + i * 0.4) * 0.001); // Slightly different movement
            positions[i3] += (Math.cos(time * 0.2 + i * 0.9) * 0.0008);
            positions[i3 + 2] += (Math.sin(time * 0.22 + i * 0.7) * 0.0008);
            if (positions[i3 + 1] > 2.1) positions[i3 + 1] -= 2.0;
            if (positions[i3 + 1] < 0.1) positions[i3 + 1] += 2.0;
          }
          particles.geometry.attributes.position.needsUpdate = true;
          particles.rotation.y += delta * 0.015; // Slightly faster rotation?
        }
    }

    if (controls?.enabled) controls.update();

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    } else {
        console.warn("Lvl 2 Render skipped: Missing components.");
        if (animationRequestId) cancelAnimationFrame(animationRequestId);
    }
  }

  // --- Event Listeners ---
  document.addEventListener('fullscreenchange', handleResize);
  window.addEventListener('resize', handleResize, { passive: true });

})(); // IIFE Ends

// ***** END REFINED main_level2.js *****
