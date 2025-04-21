// ***** BEGIN REFINED main.js *****
/**
 * Synaeon - Level 1 VR Demo Initialization
 *
 * Initializes and manages the Three.js scene for the Level 1 (mild exposure)
 * arachnophobia demo, including a VR headset entrance animation.
 */

// Encapsulate level logic in a self-contained scope
(function() {
  'use strict';

  // Module-level variables to manage scene state
  let scene, camera, renderer, controls, mainScene, vrHeadset, mixer, animationMixer;
  let animationRequestId = null; // To manage animation loop
  let containerElement = null;   // Reference to the DOM container
  let loadingManager = null;
  let loadingElement = null;
  let envMap = null;
  let audioInstance = null; // For Level 1 audio

  // Constants for animation timings (adjust as needed)
  const ANIMATION_DURATION = {
    WAIT: 1.0,       // Initial wait before animation starts
    ROTATE: 2.5,     // Duration for headset rotation
    ZOOM: 1.8,       // Duration for zooming into the lens
    FADE_OUT: 0.5    // Duration for headset fade-out (part of zoom)
  };

  // VR Headset Animation State
  let animationState = {
      phase: 0, // 0: Initial Wait, 1: Rotating, 2: Zooming, 3: Inside (Complete)
      progress: 0,
      leftEyeWorldPosition: new THREE.Vector3(), // Cached world position of left eye
      initialCameraPosition: new THREE.Vector3(0, 1.4, 4.0), // Slightly adjusted start
      headsetTargetPosition: new THREE.Vector3(0, 0.8, 0)   // Center of headset
  };

  /**
   * Initializes the Level 1 scene.
   * @param {HTMLElement} container - The DOM element to render the scene into.
   */
  window.initLevel1 = function(container) {
    console.log('Initializing Synaeon Level 1 Scene...');
    containerElement = container;

    // --- Cleanup previous instance if exists ---
    cleanupScene(); // Ensure a clean state before initializing

    // Basic checks
    if (!containerElement) {
      console.error('FATAL: Container element not provided for initLevel1.');
      return;
    }
    if (typeof THREE === 'undefined') {
      console.error('FATAL: THREE object not found. Three.js library is required.');
      containerElement.innerHTML = '<p class="error-message">Error: 3D Library (THREE) missing.</p>';
      return;
    }

    // --- Setup Loading UI ---
    setupLoadingUI();

    // --- Initialize Core Three.js Components ---
    try {
        setupScene();
        setupCamera();
        setupRenderer();
        setupControls(); // Optional orbit controls
        setupLighting();
        loadEnvironmentMap(); // Load environment map first

        // Start asset loading managed by loadingManager
        loadAssets();

    } catch (error) {
        console.error('Error during Three.js initialization:', error);
        displayErrorMessage('Failed to initialize 3D scene.');
        cleanupScene(); // Attempt cleanup on error
    }
  };

  /**
   * Sets up the loading manager and UI element.
   */
  function setupLoadingUI() {
    loadingManager = new THREE.LoadingManager();

    loadingElement = document.createElement('div');
    loadingElement.id = 'loading-status-level1'; // Unique ID
    loadingElement.className = 'loading-status-indicator'; // Use class for styling
    loadingElement.textContent = 'Initializing Scene...';
    containerElement.appendChild(loadingElement); // Append immediately

     // Basic styles inline, prefer CSS class for better management
     Object.assign(loadingElement.style, {
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', color: '#f0f8ff', // Use text-primary
        fontSize: '16px', fontWeight: '500', zIndex: '100',
        padding: '10px 15px', background: 'rgba(8, 15, 33, 0.7)', // bg-medium alpha
        borderRadius: '8px', backdropFilter: 'blur(5px)', textAlign: 'center'
    });


    loadingManager.onProgress = (url, loaded, total) => {
      const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
      loadingElement.textContent = `Loading Assets... ${percent}%`;
      console.log(`Loading: ${url} (${loaded}/${total})`);
    };

    loadingManager.onLoad = () => {
      console.log('All assets loaded.');
      // Small delay before hiding loading message for smoother transition
      setTimeout(() => {
          if (loadingElement) {
             loadingElement.style.transition = 'opacity 0.8s ease-out';
             loadingElement.style.opacity = '0';
             setTimeout(() => {
                 loadingElement?.remove(); // Safely remove
                 loadingElement = null;
             }, 800); // Match transition duration
          }
          // Start VR Headset animation now that assets are loaded
          if (vrHeadset) {
              startHeadsetAnimation();
          } else {
              console.warn("VR Headset model not loaded when onLoad triggered.");
              // Fallback? Or assume headset load failure handled elsewhere
              displayErrorMessage('VR Headset failed to load.');
          }
      }, 300); // Short delay after load completes
    };

    loadingManager.onError = (url) => {
      console.error(`Error loading asset: ${url}`);
      displayErrorMessage(`Failed to load required asset: ${url.split('/').pop()}`);
      // Potentially halt initialization or use fallbacks
    };
  }

  /**
   * Sets up the Three.js scene.
   */
  function setupScene() {
    scene = new THREE.Scene();
    // Set background color matching the theme (can be overridden by env map)
    scene.background = new THREE.Color(0x010204); // var(--bg-dark)
    // Add subtle fog for depth
    scene.fog = new THREE.Fog(0x010204, 15, 40); // Color, near, far
  }

  /**
   * Sets up the perspective camera.
   */
  function setupCamera() {
    const aspect = containerElement.clientWidth / containerElement.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000); // Slightly wider FOV
    camera.position.copy(animationState.initialCameraPosition);
    camera.lookAt(animationState.headsetTargetPosition); // Initial lookAt
  }

  /**
   * Sets up the WebGL renderer.
   */
  function setupRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true, // For potential transparency effects
        powerPreference: "high-performance"
    });
    renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Enable more realistic rendering pipeline
    renderer.physicallyCorrectLights = true; // Use physically correct lighting intensity
    renderer.outputEncoding = THREE.sRGBEncoding; // Correct color space
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Industry standard tone mapping
    renderer.toneMappingExposure = 1.0; // Adjust exposure if needed

    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    // Clear container and append renderer
    containerElement.innerHTML = ''; // Clear any previous content/errors
    containerElement.appendChild(renderer.domElement);
    // Re-append loading element if it was cleared
    if(loadingElement) containerElement.appendChild(loadingElement);

    // Style the canvas - absolute position to fill container
    renderer.domElement.style.cssText = `
        display: block; position: absolute; top: 0; left: 0;
        width: 100%; height: 100%; outline: none;
    `;
  }

  /**
   * Sets up OrbitControls for user interaction (optional).
   */
  function setupControls() {
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0); // Initial target (will update after animation)
      controls.enableDamping = true;
      controls.dampingFactor = 0.08; // Smoother damping
      controls.minDistance = 1.5;
      controls.maxDistance = 15; // Allow zooming out further
      controls.minPolarAngle = Math.PI * 0.1; // Limit looking straight down
      controls.maxPolarAngle = Math.PI * 0.6; // Limit looking too far up
      controls.enablePan = false; // Disable panning
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.4;
      controls.enabled = false; // Disabled during VR headset animation
      controls.update();
    } else {
      console.warn('OrbitControls library not loaded.');
    }
  }

  /**
   * Sets up the scene lighting for realism.
   */
  function setupLighting() {
    // Ambient light for overall illumination
    scene.add(new THREE.AmbientLight(0x80bfff, 0.4)); // Use primary-light tone, softer intensity

    // Main directional light (Key Light)
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048; // Higher resolution shadows
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    keyLight.shadow.bias = -0.001; // Fine-tune shadow bias
    scene.add(keyLight);
    // Optional: Visualize light source
    // scene.add(new THREE.DirectionalLightHelper(keyLight, 1));

    // Fill light to soften shadows
    const fillLight = new THREE.DirectionalLight(0x80bfff, 0.3);
    fillLight.position.set(-5, 4, -5);
    scene.add(fillLight);

    // Rim light for highlights (optional, can add depth)
    // const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    // rimLight.position.set(0, 5, -8);
    // scene.add(rimLight);

     // Hemisphere Light for softer ambient sky/ground light
     const hemiLight = new THREE.HemisphereLight( 0x80dfff, 0x080f21, 0.2 ); // Sky (primary-light), Ground (bg-medium)
     scene.add( hemiLight );
  }

  /**
   * Loads the environment map for reflections and ambient lighting.
   */
  function loadEnvironmentMap() {
    try {
      // Use a more neutral/studio environment map if available, or stick to Pisa
      const urls = [ // Example using Pisa - replace with custom/neutral map if possible
        'https://threejs.org/examples/textures/cube/pisa/px.png', 'https://threejs.org/examples/textures/cube/pisa/nx.png',
        'https://threejs.org/examples/textures/cube/pisa/py.png', 'https://threejs.org/examples/textures/cube/pisa/ny.png',
        'https://threejs.org/examples/textures/cube/pisa/pz.png', 'https://threejs.org/examples/textures/cube/pisa/nz.png'
      ];
      const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager); // Use manager
      envMap = cubeTextureLoader.load(urls, () => {
          scene.environment = envMap; // Apply as environment map for reflections
          // scene.background = envMap; // Optional: Use env map as background
          console.log("Environment map loaded.");
      }, undefined, (error) => {
          console.error("Failed to load environment map:", error);
          scene.background = new THREE.Color(0x010204); // Fallback background
      });
    } catch (e) {
      console.warn('CubeTextureLoader or environment mapping might not be fully supported:', e);
      scene.background = new THREE.Color(0x010204); // Fallback background
    }
  }

  /**
   * Loads all necessary 3D models and textures.
   */
  function loadAssets() {
      // Group main scene elements - initially invisible
      mainScene = new THREE.Group();
      mainScene.visible = false;
      scene.add(mainScene);

      // Load VR Headset first as it's part of the intro
      loadVRHeadsetModel();

      // Load table textures and then the table/jar/spider
      loadTableTextures(); // This function will chain the loading process
  }

   /**
   * Loads the VR headset GLB model.
   */
  function loadVRHeadsetModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
        console.error('GLTFLoader not available.');
        displayErrorMessage('VR Headset loader unavailable.');
        return;
    }
    const gltfLoader = new THREE.GLTFLoader(loadingManager);

    // Optional: Setup DRACOLoader if models are compressed
    if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        // Provide the path to the DRACO decoder files (host them locally or use CDN)
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
    }

    gltfLoader.load(
      'oculus_quest_vr_headset.glb', // Ensure path is correct
      (gltf) => {
        console.log('VR headset model loaded successfully.');
        vrHeadset = gltf.scene;
        vrHeadset.scale.set(5, 5, 5); // Keep original scale
        vrHeadset.position.copy(animationState.headsetTargetPosition);
        vrHeadset.rotation.set(0, 0, 0); // Start facing forward

        let leftEyeObject = null;
        vrHeadset.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            // Apply environment map to materials for realism
            if (node.material) {
                // Clone material to avoid modifying shared resources if needed
                // node.material = node.material.clone();
                node.material.envMap = envMap;
                // Adjust material properties if needed (e.g., roughness, metalness)
                // node.material.roughness = Math.min(node.material.roughness + 0.1, 1.0);
                node.material.needsUpdate = true;
            }
            // Find the left eye object more reliably
            if (!leftEyeObject && node.name.toLowerCase().includes('lens') && node.name.toLowerCase().includes('left')) {
                leftEyeObject = node;
            }
          }
        });

        // Calculate left eye world position
        if (leftEyeObject) {
            // Ensure matrices are updated
            vrHeadset.updateMatrixWorld(true);
            leftEyeObject.getWorldPosition(animationState.leftEyeWorldPosition);
            console.log('Calculated left eye world position:', animationState.leftEyeWorldPosition);
        } else {
            // Fallback position relative to headset center if lens isn't found
            console.warn("Left eye lens object not found in VR headset model. Using fallback position.");
            const fallbackOffset = new THREE.Vector3(-0.03, 0, 0.05); // Adjust as needed based on model pivot
            animationState.leftEyeWorldPosition.copy(vrHeadset.position).add(fallbackOffset);
        }

        scene.add(vrHeadset);
        // Don't start animation yet, wait for loadingManager.onLoad
      },
      undefined, // Progress callback (handled by loadingManager)
      (error) => {
        console.error('Error loading VR headset model:', error);
        displayErrorMessage('Failed to load VR Headset.');
        // Handle failure: maybe load main scene directly?
        mainScene.visible = true; // Show main scene as fallback?
        animationState.phase = 3; // Skip animation
      }
    );
  }

  /**
   * Starts the VR headset entrance animation sequence.
   */
  function startHeadsetAnimation() {
      animationState.phase = 0; // Ensure starting from wait phase
      animationState.progress = 0;
      // Ensure headset is visible and opaque initially
      if (vrHeadset) {
          vrHeadset.visible = true;
          vrHeadset.traverse(node => {
             if(node.material) {
                 node.material.opacity = 1.0;
                 node.material.transparent = false;
             }
          });
      }
      // Start the main animation loop if not already running
      if (!animationRequestId) {
          animate();
      }
      // Initialize Level 1 audio playback
      playLevelAudio('recordinglevel1.mp3');
  }

  /**
   * Plays or toggles the specified audio file for the level.
   * @param {string} audioFile - Path to the audio file.
   */
  function playLevelAudio(audioFile) {
      // Stop any existing audio first
      if (audioInstance && !audioInstance.paused) {
          audioInstance.pause();
          audioInstance.currentTime = 0;
      }
      // Play new audio
      audioInstance = new Audio(audioFile); // Assumes audio files are in the same directory
      audioInstance.play().catch(error => {
          console.error(`Error playing audio (${audioFile}):`, error);
          // Handle browsers blocking autoplay etc. Maybe show a "play audio" button.
      });

       // Append voice icon if not present
      const levelButton = document.getElementById('level1-btn'); // Assumes Level 1 button ID
      if (levelButton && !levelButton.querySelector('.voice-icon')) {
            const voiceIcon = document.createElement('span');
            voiceIcon.className = 'voice-icon'; // For styling/selection
            voiceIcon.textContent = " 🔊"; // Unicode speaker icon
            Object.assign(voiceIcon.style, { fontSize: "1em", marginLeft: "5px" });
            levelButton.appendChild(voiceIcon);
      }
  }

  /**
   * Updates the VR headset animation based on the current phase and progress.
   * @param {number} delta - Time delta since last frame.
   */
  function updateVRHeadsetAnimation(delta) {
      if (!vrHeadset || animationState.phase === 3) return; // No headset or animation complete

      animationState.progress += delta;

      switch(animationState.phase) {
        case 0: // Wait Phase
            if (animationState.progress >= ANIMATION_DURATION.WAIT) {
                animationState.phase = 1; // Move to Rotate Phase
                animationState.progress = 0;
            }
            break;

        case 1: // Rotate Phase
            const rotationProgress = Math.min(animationState.progress / ANIMATION_DURATION.ROTATE, 1.0);
            const easedRotation = easeInOutCubic(rotationProgress);
            vrHeadset.rotation.y = Math.PI * easedRotation; // Rotate 180 degrees

            if (rotationProgress >= 1.0) {
                animationState.phase = 2; // Move to Zoom Phase
                animationState.progress = 0;
                // Recalculate eye position precisely after rotation
                vrHeadset.updateMatrixWorld(true);
                const leftEyeObject = vrHeadset.getObjectByName("Left_Lens_Mesh_Name"); // Replace with actual name if known
                if (leftEyeObject) {
                    leftEyeObject.getWorldPosition(animationState.leftEyeWorldPosition);
                } else {
                    // Fallback if object not found by name after rotation
                    const fallbackOffset = new THREE.Vector3(0.03, 0, 0.05); // Adjust offset for rotated view
                     animationState.leftEyeWorldPosition.copy(vrHeadset.position).add(fallbackOffset.applyQuaternion(vrHeadset.quaternion));
                }
                console.log("Eye position after rotation:", animationState.leftEyeWorldPosition);
            }
            break;

        case 2: // Zoom Phase
            const zoomProgress = Math.min(animationState.progress / ANIMATION_DURATION.ZOOM, 1.0);
            const easedZoom = easeInOutSine(zoomProgress); // Smoother ease for zoom

            // Interpolate camera position towards the left eye
            const zoomTargetPos = animationState.leftEyeWorldPosition.clone().add(new THREE.Vector3(0, 0, 0.02)); // Target slightly in front of lens
            camera.position.lerpVectors(animationState.initialCameraPosition, zoomTargetPos, easedZoom);

            // Interpolate camera lookAt target smoothly from headset center towards inside the lens
            const lookAtTarget = new THREE.Vector3().lerpVectors(
                animationState.headsetTargetPosition, // Start looking at headset center
                animationState.leftEyeWorldPosition.clone().add(new THREE.Vector3(0, 0, -0.5)), // End looking "through" the lens
                easedZoom
            );
            camera.lookAt(lookAtTarget);

            // Fade out headset and reveal main scene during the latter part of the zoom
            const fadeStartTime = ANIMATION_DURATION.ZOOM - ANIMATION_DURATION.FADE_OUT;
            if (animationState.progress > fadeStartTime) {
                mainScene.visible = true; // Reveal main scene
                const fadeProgress = Math.min((animationState.progress - fadeStartTime) / ANIMATION_DURATION.FADE_OUT, 1.0);
                const opacity = 1.0 - fadeProgress;

                vrHeadset.traverse(node => {
                    if (node.material) {
                       // Ensure materials are clonable or handle shared materials carefully
                       if (!node.material.userData?.originalOpacity) {
                           node.material.userData = node.material.userData || {};
                           node.material.userData.originalOpacity = node.material.opacity;
                           node.material.userData.originalTransparent = node.material.transparent;
                       }
                       node.material.transparent = true;
                       node.material.opacity = opacity * (node.material.userData.originalOpacity || 1.0);
                    }
                });

                if (fadeProgress >= 1.0) {
                    animationState.phase = 3; // Animation Complete
                    animationState.progress = 0;
                    vrHeadset.visible = false; // Hide headset completely

                    // Restore headset material properties (important if reusing headset)
                     vrHeadset.traverse(node => {
                        if (node.material?.userData?.originalOpacity !== undefined) {
                           node.material.opacity = node.material.userData.originalOpacity;
                           node.material.transparent = node.material.userData.originalTransparent;
                           delete node.material.userData.originalOpacity;
                           delete node.material.userData.originalTransparent;
                        }
                     });


                    // Set final camera position and target for the main scene
                    camera.position.set(0, 1.6, 5.0); // Adjust final viewing position
                    const mainSceneCenter = new THREE.Vector3(0, 0.6, 0); // Assuming center of table/jar
                    camera.lookAt(mainSceneCenter);

                    // Enable OrbitControls now
                    if (controls) {
                        controls.enabled = true;
                        controls.target.copy(mainSceneCenter);
                        controls.update();
                    }
                    // Add UI controls for the main scene
                    addSceneUIControls();
                }
            }
            break;

        case 3: // Inside Phase (Animation complete)
            // Do nothing further for headset animation
            break;
      }
  }

  // Easing functions
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

  /**
   * Loads table textures. Chains to createTable on completion.
   */
  function loadTableTextures() {
    const textureLoader = new THREE.TextureLoader(loadingManager); // Use manager
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
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 2); // Adjust tiling as needed
            if (key === 'map') texture.encoding = THREE.sRGBEncoding; // Color texture
            woodTextures[key] = texture;
            texturesLoadedCount++;
            if (texturesLoadedCount === requiredTextures) {
                console.log("Table textures loaded.");
                createTable(woodTextures); // Chain to table creation
            }
        }, undefined, (error) => {
            console.error(`Failed to load texture ${key}:`, error);
            // Handle error - maybe use fallback color?
            texturesLoadedCount++;
            if (texturesLoadedCount === requiredTextures) {
                 console.warn("Creating table with missing textures.");
                 createTable(woodTextures); // Still attempt to create table
            }
        });
    });
  }

  /**
   * Creates the table, jar, and loads the spider model.
   * @param {object} textures - Loaded wood textures.
   */
  function createTable(textures) {
    const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3); // Keep original size
    const tableMaterial = new THREE.MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      roughnessMap: textures.roughnessMap,
      roughness: 0.8,
      metalness: 0.1,
      envMap: envMap, // Apply environment map
      envMapIntensity: 0.5 // Adjust intensity
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.y = -0.1; // Top surface at y=0
    table.receiveShadow = true;
    table.castShadow = false; // Usually tables don't cast significant shadows upwards
    mainScene.add(table);
    console.log("Table created.");

    createJar(); // Chain to jar creation
  }

  /**
   * Creates the glass jar and lid. Chains to spider loading.
   */
  function createJar() {
    // Jar Body - More realistic glass
    const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, true); // Open ended cylinder
    const jarMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 1.0, // Use transmission for glass
      thickness: 0.1,    // Required for transmission
      transparent: true,
      envMap: envMap,
      envMapIntensity: 1.0,
      // clearcoat: 1, // Optional: adds extra reflection layer
      // clearcoatRoughness: 0.1,
      ior: 1.5, // Index of refraction for glass
      side: THREE.DoubleSide // Render both sides for thickness effect
    });
    const jar = new THREE.Mesh(jarGeometry, jarMaterial);
    jar.position.y = 0.75; // Center of cylinder height
    jar.castShadow = true; // Glass can cast subtle shadows
    jar.receiveShadow = false;
    mainScene.add(jar);

    // Jar Lid - Metallic
    const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
    const lidMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa, // Slightly brighter metal
      metalness: 0.95,
      roughness: 0.2,
      envMap: envMap,
      envMapIntensity: 0.8
    });
    const lid = new THREE.Mesh(lidGeometry, lidMaterial);
    lid.position.y = 1.5 + 0.05; // Place on top of jar body
    lid.castShadow = true;
    lid.receiveShadow = true;
    mainScene.add(lid);
    console.log("Jar and lid created.");

    loadSpiderModel(); // Load the spider last
  }

  /**
   * Loads the animated spider GLB model.
   */
  function loadSpiderModel() {
    if (typeof THREE.GLTFLoader === 'undefined') {
         console.error('GLTFLoader not available for spider.');
         displayErrorMessage('Spider model loader unavailable.');
         createProceduralSpider(); // Attempt fallback
         return;
    }
    const gltfLoader = new THREE.GLTFLoader(loadingManager); // Use the main manager
    // DRACO setup should already be done on the loader if needed

    gltfLoader.load(
      'spider_with_animation.glb', // Ensure path is correct
      (gltf) => {
        console.log('Spider model loaded successfully.');
        const spiderModel = gltf.scene;
        spiderModel.scale.set(1.5, 1.5, 1.5); // Keep original scale
        spiderModel.position.y = 0.01; // Place slightly above table surface

        // Center and place on table (adjust if pivot point is off)
        const bbox = new THREE.Box3().setFromObject(spiderModel);
        const center = new THREE.Vector3();
        bbox.getCenter(center);
        // Assuming table top is at y=0, place bottom of bbox at y=0
        spiderModel.position.y -= bbox.min.y;
        // spiderModel.position.x -= center.x; // Only if centering is needed
        // spiderModel.position.z -= center.z;

        spiderModel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true; // Spider can receive shadows from lid etc.
            if (node.material) {
               // node.material = node.material.clone(); // Clone if modifying
               node.material.envMap = envMap;
               node.material.envMapIntensity = 0.6; // Tone down env map influence if needed
               node.material.needsUpdate = true;
            }
          }
        });
        mainScene.add(spiderModel);

        // Setup Animation
        if (gltf.animations && gltf.animations.length > 0) {
          console.log(`Spider model has ${gltf.animations.length} animations.`);
          animationMixer = new THREE.AnimationMixer(spiderModel);
          // Play the first animation (assuming it's idle)
          const action = animationMixer.clipAction(gltf.animations[0]);
          action.setLoop(THREE.LoopRepeat);
          action.play();
          console.log(`Playing animation: ${gltf.animations[0].name}`);
        } else {
          console.log('No animations found in the spider model.');
        }

        addDustParticles(); // Add atmospheric effect
        // Don't call finalizeScene here, wait for loadingManager.onLoad
      },
      undefined, // Progress handled by manager
      (error) => {
        console.error('Error loading spider model:', error);
        displayErrorMessage('Failed to load spider model. Using fallback.');
        createProceduralSpider(); // Create fallback
        addDustParticles();
        // Don't call finalizeScene here, wait for loadingManager.onLoad
      }
    );
  }

  /**
   * Creates a simple procedural spider as a fallback.
   */
  function createProceduralSpider() {
    console.warn('Creating procedural fallback spider.');
    const spiderGroup = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222, roughness: 0.6, metalness: 0.1, envMap: envMap, envMapIntensity: 0.4
    });

    // Body parts
    const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), bodyMaterial);
    abdomen.scale.y = 0.8; // Flatten slightly
    abdomen.position.y = 0.15;
    spiderGroup.add(abdomen);

    const cephalothorax = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), bodyMaterial);
    cephalothorax.position.set(0, 0.1, 0.3); // Position relative to abdomen center
    cephalothorax.scale.y = 0.7;
    spiderGroup.add(cephalothorax);

    // Legs
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const legSegmentGeom = new THREE.CylinderGeometry(0.02, 0.015, 0.4, 6);
    for (let i = 0; i < 8; i++) {
        const leg = new THREE.Group();
        const upperLeg = new THREE.Mesh(legSegmentGeom, legMaterial);
        const lowerLeg = new THREE.Mesh(legSegmentGeom, legMaterial);

        upperLeg.position.y = 0.2; // Pivot point for upper leg
        lowerLeg.position.y = 0.2; // Pivot point for lower leg (relative to upper)
        upperLeg.add(lowerLeg);

        const angle = (i < 4 ? 1 : -1) * (Math.PI / 5 * (i % 4 + 1)); // Spread legs
        const sideSign = i < 4 ? 1 : -1;
        leg.position.set(sideSign * 0.15, 0.1, 0.3); // Attach near cephalothorax
        leg.rotation.y = angle;
        upperLeg.rotation.z = sideSign * Math.PI / 4; // Angle upper segment out
        lowerLeg.rotation.z = sideSign * -Math.PI / 6; // Angle lower segment down

        upperLeg.castShadow = true;
        lowerLeg.castShadow = true;
        spiderGroup.add(leg);
    }

    spiderGroup.traverse(node => { if(node.isMesh) node.castShadow = true; });
    spiderGroup.position.y = 0.01; // Place on table
    mainScene.add(spiderGroup);
    console.log("Fallback spider created.");
  }

  /**
   * Adds subtle dust particles to the scene.
   */
  function addDustParticles() {
    const particlesCount = 150; // Fewer particles
    const positions = new Float32Array(particlesCount * 3);
    const geometry = new THREE.BufferGeometry();

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Distribute within the jar radius and height more realistically
        const radius = Math.random() * 0.75; // Within jar radius
        const angle = Math.random() * Math.PI * 2;
        positions[i3] = Math.cos(angle) * radius;
        positions[i3 + 1] = 0.05 + Math.random() * 1.4; // Height within jar
        positions[i3 + 2] = Math.sin(angle) * radius;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.008, // Slightly larger, more visible
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending, // Brighter where overlapping
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    // Position relative to jar center (which is at 0, 0.75, 0)
    particles.position.y = 0; // Particles origin at table level
    mainScene.add(particles);
    window.dustParticlesLvl1 = particles; // Use unique name
    console.log("Dust particles added.");
  }

  /**
   * Adds UI controls (fullscreen, rotation toggle) to the scene container.
   */
  function addSceneUIControls() {
    if (!containerElement || containerElement.querySelector('.scene-ui-button')) return; // Prevent adding multiple times

    const commonStyle = `
        position: absolute; bottom: 15px; font-size: 22px; padding: 8px 12px;
        background: rgba(8, 15, 33, 0.6); border: 1px solid rgba(255,255,255,0.2);
        color: #f0f8ff; border-radius: 8px; cursor: pointer; z-index: 10;
        backdrop-filter: blur(5px); transition: background 0.3s ease;`;

    // Fullscreen Button
    const fsButton = document.createElement('button');
    fsButton.textContent = '⛶'; // Fullscreen symbol
    fsButton.className = 'scene-ui-button';
    fsButton.title = 'Toggle Fullscreen';
    fsButton.style.cssText = commonStyle + 'right: 15px;';
    fsButton.addEventListener('click', toggleFullscreen);
    containerElement.appendChild(fsButton);

    // Auto-Rotate Button (only if controls exist)
    if (controls) {
      const rotateButton = document.createElement('button');
      rotateButton.textContent = '↻'; // Rotate symbol
      rotateButton.className = 'scene-ui-button';
      rotateButton.title = 'Toggle Auto-Rotation';
      rotateButton.style.cssText = commonStyle + 'right: 70px;'; // Position left of fullscreen
      rotateButton.addEventListener('click', () => {
          controls.autoRotate = !controls.autoRotate;
          rotateButton.style.background = controls.autoRotate ? 'rgba(0, 170, 255, 0.7)' : 'rgba(8, 15, 33, 0.6)';
          rotateButton.style.borderColor = controls.autoRotate ? 'rgba(0, 170, 255, 0.5)' : 'rgba(255,255,255,0.2)';
      });
      containerElement.appendChild(rotateButton);
    }

     // Instructions Text
     const instructions = document.createElement('div');
     instructions.className = 'scene-instructions';
     instructions.innerHTML = '<strong>Controls:</strong> Drag to rotate, Scroll to zoom';
     Object.assign(instructions.style, {
        position: 'absolute', top: '15px', left: '15px', padding: '8px 12px',
        background: 'rgba(8, 15, 33, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
        color: '#f0f8ff', borderRadius: '8px', fontSize: '13px', zIndex: '10',
        backdropFilter: 'blur(5px)', opacity: '1', transition: 'opacity 1s ease 4s' // Fade out after 4s delay
     });
     containerElement.appendChild(instructions);
     setTimeout(() => { instructions.style.opacity = '0'; }, 100); // Start fade out timer immediately

    console.log('Scene UI controls added.');
  }

  /**
   * Toggles fullscreen mode for the container element.
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerElement.requestFullscreen().catch(err => {
        console.error(`Error enabling fullscreen: ${err.message}`);
        alert("Fullscreen mode failed. Your browser might not support it or permissions are denied.");
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Handles window resize events to update camera and renderer.
   */
  function handleResize() {
      if (!renderer || !camera || !containerElement) return;

      const width = containerElement.clientWidth;
      const height = containerElement.clientHeight;

      // Prevent issues if container has zero size temporarily
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      // No need to adjust pixel ratio on resize unless devicePixelRatio changes
      // renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      console.log(`Resized Level 1 to: ${width}x${height}`);
  }

  /**
   * Cleans up the scene, renderer, controls, and listeners.
   */
  function cleanupScene() {
    console.log("Cleaning up Level 1 scene...");
    if (animationRequestId) {
      cancelAnimationFrame(animationRequestId);
      animationRequestId = null;
    }

    // Stop audio
    if (audioInstance) {
        audioInstance.pause();
        audioInstance = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('fullscreenchange', handleResize); // Need specific listener for exit

    // Dispose Three.js objects
    if (scene) {
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
        // Dispose textures associated with materials (important!)
        if (object.material?.map) object.material.map.dispose();
        if (object.material?.normalMap) object.material.normalMap.dispose();
        if (object.material?.roughnessMap) object.material.roughnessMap.dispose();
        if (object.material?.envMap) object.material.envMap.dispose();
        // Add more texture types if used (aoMap, metalnessMap, etc.)
      });
      scene = null;
    }

    if (renderer) {
      renderer.dispose(); // Release WebGL context resources
      renderer.domElement?.remove(); // Remove canvas from DOM
      renderer = null;
    }

    if (controls) {
      controls.dispose(); // Remove event listeners
      controls = null;
    }

    // Clear references
    vrHeadset = null;
    mainScene = null;
    mixer = null;
    animationMixer = null;
    containerElement = null;
    loadingManager = null;
    loadingElement?.remove(); // Ensure loading indicator is removed
    loadingElement = null;
    envMap = null; // Env map is disposed via scene traversal if applied
    window.dustParticlesLvl1 = null; // Clear global reference if used

    // Reset animation state
    animationState.phase = 0;
    animationState.progress = 0;

    console.log("Level 1 cleanup complete.");
  }

  // Expose cleanup function globally if needed from outside
  window.cleanupLevel1 = cleanupScene;

  /**
   * Displays an error message within the container.
   * @param {string} message - The error message to display.
   */
  function displayErrorMessage(message) {
      if (containerElement) {
          // Use a more prominent error style
          containerElement.innerHTML = `<p style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#dc3545; background:rgba(255,0,0,0.1); border:1px solid #dc3545; padding:15px 20px; border-radius:8px; text-align:center; font-size: 16px; z-index: 101;">${message}</p>`;
      }
      console.error("Scene Error:", message);
  }

  /**
   * The main animation loop.
   */
  function animate() {
    // Schedule next frame
    animationRequestId = requestAnimationFrame(animate);

    const delta = clock.getDelta(); // Use a shared clock instance

    // Update VR Headset Animation if active
    if (animationState.phase < 3) {
      updateVRHeadsetAnimation(delta);
    }

    // Update main scene animations (spider, dust) only when visible
    if (mainScene?.visible) {
        if (animationMixer) animationMixer.update(delta);

        // Animate Dust Particles
        if (window.dustParticlesLvl1) {
          const particles = window.dustParticlesLvl1;
          const positions = particles.geometry.attributes.position.array;
          const time = clock.getElapsedTime();
          for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            // More subtle, varied movement
            positions[i3 + 1] += (Math.sin(time * 0.2 + i * 0.5) * 0.0008); // Vertical drift
            positions[i3] += (Math.cos(time * 0.15 + i * 0.8) * 0.0005); // Horizontal drift X
            positions[i3 + 2] += (Math.sin(time * 0.18 + i * 0.6) * 0.0005); // Horizontal drift Z

            // Wrap particles around (optional)
            if (positions[i3 + 1] > 1.5) positions[i3 + 1] -= 1.45;
            if (positions[i3 + 1] < 0.05) positions[i3 + 1] += 1.45;
          }
          particles.geometry.attributes.position.needsUpdate = true;
          particles.rotation.y += delta * 0.01; // Slow rotation
        }
    }

    // Update OrbitControls if enabled
    if (controls?.enabled) {
      controls.update();
    }

    // Render the scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    } else {
        console.warn("Render skipped: Missing renderer, scene, or camera.");
        if (animationRequestId) cancelAnimationFrame(animationRequestId); // Stop loop if core components missing
    }
  }

  // Create a single clock instance for the animation loop
  const clock = new THREE.Clock();

  // Add listener for fullscreen changes to trigger resize
  document.addEventListener('fullscreenchange', handleResize);

  // Add listener for resize events
  window.addEventListener('resize', handleResize, { passive: true });


})(); // Immediately invoke the function expression to encapsulate scope

// ***** END REFINED main.js *****
