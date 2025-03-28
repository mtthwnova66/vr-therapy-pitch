// Spider Simulation - Level 1 (Mild Exposure)
// Main controller script for the mild exposure level with spider in jar

let level1Scene, level1Camera, level1Renderer, level1Controls;

function initLevel1() {
  console.log('Initializing Level 1 spider simulation');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Create a flag to track initialization
  if (window.level1Initialized) {
    console.log('Level 1 already initialized, refreshing instead');
    refreshLevel1();
    return;
  }
  
  // Check if THREE is available
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Make sure Three.js is loaded.');
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Failed to load 3D libraries. Please check your browser settings or try a different browser.</p>';
    return;
  }
  
  // Add a loading status element
  const loadingStatus = document.createElement('div');
  loadingStatus.className = 'loading-status';
  loadingStatus.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Loading photorealistic scene...</p>
  `;
  loadingStatus.style.position = 'absolute';
  loadingStatus.style.top = '50%';
  loadingStatus.style.left = '50%';
  loadingStatus.style.transform = 'translate(-50%, -50%)';
  loadingStatus.style.textAlign = 'center';
  loadingStatus.style.zIndex = '100';
  
  // Clear the container and add loading message
  container.innerHTML = '';
  container.appendChild(loadingStatus);
  
  try {
    // Scene setup
    level1Scene = new THREE.Scene();
    level1Scene.background = new THREE.Color(0xf5f5f7);
    
    // Camera setup - closer initial view
    level1Camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    level1Camera.position.set(0.5, 1.0, 2.5); // Zoomed in closer than original
    
    // Enhanced renderer with physically-based settings
    level1Renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    level1Renderer.setSize(container.clientWidth, container.clientHeight);
    level1Renderer.setPixelRatio(window.devicePixelRatio);
    
    // Advanced rendering features - enable as browser supports
    try {
      level1Renderer.physicallyCorrectLights = true;
      level1Renderer.outputEncoding = THREE.sRGBEncoding;
      level1Renderer.toneMapping = THREE.ACESFilmicToneMapping;
      level1Renderer.toneMappingExposure = 1.0;
      level1Renderer.shadowMap.enabled = true;
      level1Renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (e) {
      console.warn('Advanced rendering features not fully supported in this browser', e);
    }
    
    // Add canvas to container
    container.appendChild(level1Renderer.domElement);
    
    // Ensure the renderer's canvas uses correct styles for fullscreen
    level1Renderer.domElement.style.width = '100%';
    level1Renderer.domElement.style.height = '100%';
    level1Renderer.domElement.style.display = 'block';
    level1Renderer.domElement.style.position = 'absolute';
    level1Renderer.domElement.style.top = '0';
    level1Renderer.domElement.style.left = '0';
    
    // Add OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      level1Controls = new THREE.OrbitControls(level1Camera, level1Renderer.domElement);
      level1Controls.target.set(0, 0.6, 0); // Lower target to look more at the bottom of the jar
      level1Controls.enableDamping = true;
      level1Controls.dampingFactor = 0.05;
      level1Controls.minDistance = 1.8; // Allow closer zoom
      level1Controls.maxDistance = 6;
      level1Controls.autoRotate = false;
      level1Controls.autoRotateSpeed = 0.5;
      level1Controls.update();
    } else {
      console.warn('OrbitControls not available');
    }
    
    // Add simulation controls
    addSimControls(container, true);
    
    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Load environment map for reflections
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
      
      // Set as scene environment
      level1Scene.environment = envMap;
      
      // Create a subtle background
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.MeshBasicMaterial({
        color: 0xf5f5f7,
        side: THREE.DoubleSide
      });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      background.position.z = -20;
      level1Scene.add(background);
      
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
      level1Scene.background = new THREE.Color(0xf5f5f7);
    }
    
    // Create Lights
    // Ambient light (subtle)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    level1Scene.add(ambientLight);
    
    // Key light (main light)
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
    level1Scene.add(keyLight);
    
    // Fill light (softer, from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 4, -3);
    level1Scene.add(fillLight);
    
    // Add an extra light for the right side of the jar
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rightLight.position.set(6, 2, 0); // Position to the right side
    level1Scene.add(rightLight);
    
    // Rim light (highlight edges)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 5, -5);
    level1Scene.add(rimLight);
    
    // Setup loading manager for tracking load progress
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
      const percent = Math.round(loaded / total * 100);
      if(loadingStatus) {
        loadingStatus.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Loading scene assets... ${percent}%</p>
        `;
      }
    };
    
    // Clock for animations
    const clock = new THREE.Clock();
    let mixer; // Will hold the animation mixer
    
    // Load wood texture for table
    const woodTextures = {
      map: null,
      normalMap: null,
      roughnessMap: null
    };
    
    // Load wood textures with the loading manager
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
    
    // Track texture loading
    let texturesLoaded = 0;
    const requiredTextures = 3;
    
    function createTableIfTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        createTable();
      }
    }
    
    // Create wooden table
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
      level1Scene.add(table);
      
      // Now that table is loaded, create the jar
      createJar();
    }
    
    // Create the glass jar
    function createJar() {
      // Create realistic glass jar - using a closed cylinder for complete glass
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, false); // closed cylinder
      
      // Enhanced glass material (improved properties)
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0, // Reduced metalness for better glass look
        roughness: 0.05,
        transmission: 0.95, // glass transparency
        transparent: true,
        thickness: 0.05,    // glass thickness
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        ior: 1.5 // Added for better refraction
      });
      
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      level1Scene.add(jar);
      
      // Jar lid with metallic look
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
      level1Scene.add(lid);
      
      // Now load the spider model
      loadSpiderModel();
    }
    
    // Load the spider model
    function loadSpiderModel() {
      if(loadingStatus) {
        loadingStatus.innerHTML = `
          <div class="loading-spinner"></div>
          <p>Loading spider model...</p>
        `;
      }
      
      // Create a GLTFLoader instance
      const gltfLoader = new THREE.GLTFLoader(loadingManager);
      
      // Optional: Setup Draco decoder for compressed models
      if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }
      
      // Try to load the spider model
      gltfLoader.load(
        // Model URL
        'spider.glb',
        
        // Success callback
        function(gltf) {
          // Get the model from the loaded gltf file
          const spiderModel = gltf.scene;
          
          // Adjust scale - make it larger
          spiderModel.scale.set(1.5, 1.5, 1.5);
          
          // First, get the bounding box to properly position the spider
          const boundingBox = new THREE.Box3().setFromObject(spiderModel);
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          
          // Calculate appropriate position to make the spider sit on jar bottom
          // Position at the bottom of the jar (0 is jar bottom), adjust based on model's min Y
          const minY = boundingBox.min.y;
          const heightOffset = -minY;  // This moves the bottom of the model to Y=0
          
          spiderModel.position.set(
            -center.x,  // Center horizontally
            0 + heightOffset, // Place exactly at the bottom of the jar
            -center.z   // Center horizontally
          );
          
          // Rotate to match desired initial view - diagonal orientation
          spiderModel.rotation.y = Math.PI / 4; // 45 degrees
          
          // Apply shadows and improve materials
          spiderModel.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Improve materials if needed
              if (node.material) {
                node.material.envMap = envMap;
                node.material.needsUpdate = true;
              }
            }
          });
          
          // Add to scene
          level1Scene.add(spiderModel);
          
          // Handle animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Model has ${gltf.animations.length} animations`);
            
            // Create an animation mixer
            mixer = new THREE.AnimationMixer(spiderModel);
            
            // Get the first animation
            const idleAnimation = gltf.animations[0];
            
            // Create an animation action
            const action = mixer.clipAction(idleAnimation);
            
            // Slow down animation for more realism
            action.timeScale = 0.5;
            
            // Play the animation
            action.play();
          }
          
          // Add dust particles and finalize
          addDustParticles();
          finalizeScene();
          
          // Update loading status
          if(loadingStatus && loadingStatus.parentNode) {
            loadingStatus.style.opacity = '0';
            loadingStatus.style.transition = 'opacity 1s ease';
            setTimeout(() => {
              if(loadingStatus && loadingStatus.parentNode) {
                loadingStatus.remove();
              }
            }, 1000);
          }
        },
        
        // Progress callback - handled by loading manager
        undefined,
        
        // Error callback
        function(error) {
          console.error('Error loading spider model:', error);
          if(loadingStatus) {
            loadingStatus.innerHTML = `
              <div class="loading-spinner"></div>
              <p>Using fallback spider model...</p>
            `;
          }
          
          // Create a fallback procedural spider
          createProceduralSpider();
        }
      );
    }
    
    // Fallback: Create a procedural spider if model loading fails
    function createProceduralSpider() {
      console.log('Creating procedural spider as fallback');
      
      // Create a simple spider
      const spider = new THREE.Group();
      
      // Spider body (abdomen) - increased size
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
      
      // Spider head (cephalothorax) - increased size
      const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const head = new THREE.Mesh(headGeometry, spiderMaterial);
      head.position.set(0, 0, 0.25); // Adjusted position
      head.castShadow = true;
      spider.add(head);
      
      // Simple legs - increased size and length
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
      
      // Position spider in jar
      spider.position.y = 0.05;
      
      // Rotate to match desired initial view - diagonal orientation
      spider.rotation.y = Math.PI / 4; // 45 degrees
      
      level1Scene.add(spider);
      
      // Continue with dust particles and scene finalization
      addDustParticles();
      finalizeScene();
      
      // Update loading status
      if(loadingStatus && loadingStatus.parentNode) {
        loadingStatus.style.opacity = '0';
        loadingStatus.style.transition = 'opacity 1s ease';
        setTimeout(() => {
          if(loadingStatus && loadingStatus.parentNode) {
            loadingStatus.remove();
          }
        }, 1000);
      }
    }
    
    // Add dust particles inside the jar
    function addDustParticles() {
      const particlesCount = 100;
      const positions = new Float32Array(particlesCount * 3);
      const particleGeometry = new THREE.BufferGeometry();
      
      for (let i = 0; i < particlesCount; i++) {
        // Random positions inside jar
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        
        positions[i * 3] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = Math.random() * 1.4 + 0.05; // y (within jar height)
        positions[i * 3 + 2] = Math.sin(angle) * radius; // z
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
      particles.position.y = 0.75; // Center of jar
      level1Scene.add(particles);
      
      // Store for animation
      window.level1DustParticles = particles;
    }
    
    // Add simulation controls (instructions, fullscreen button, rotation toggle)
    function addSimControls(container, isLevel1) {
      const prefix = isLevel1 ? 'level1' : 'level2';
      
      // Add instructions
      const instructions = document.createElement('div');
      instructions.className = 'sim-instructions';
      instructions.innerHTML = 'Click and drag to rotate<br>Scroll to zoom';
      instructions.id = `${prefix}-instructions`;
      container.appendChild(instructions);
      
      // Add control buttons container
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'sim-controls';
      controlsDiv.id = `${prefix}-controls`;
      controlsDiv.style.position = 'absolute';
      controlsDiv.style.bottom = '20px';
      controlsDiv.style.right = '20px';
      controlsDiv.style.zIndex = '100';
      controlsDiv.style.display = 'flex';
      controlsDiv.style.gap = '10px';
      
      // Add fullscreen button
      const fullscreenButton = document.createElement('button');
      fullscreenButton.innerHTML = '⛶';
      fullscreenButton.title = 'Toggle fullscreen';
      fullscreenButton.id = `${prefix}-fullscreen`;
      fullscreenButton.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      fullscreenButton.style.color = '#000';
      fullscreenButton.style.width = '40px';
      fullscreenButton.style.height = '40px';
      fullscreenButton.style.border = 'none';
      fullscreenButton.style.borderRadius = '50%';
      fullscreenButton.style.fontSize = '18px';
      fullscreenButton.style.cursor = 'pointer';
      fullscreenButton.style.display = 'flex';
      fullscreenButton.style.alignItems = 'center';
      fullscreenButton.style.justifyContent = 'center';
      fullscreenButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
      fullscreenButton.style.transition = 'all 0.3s ease';
      fullscreenButton.addEventListener('click', () => toggleFullscreen(container));
      
      // Add rotation toggle button
      const rotateButton = document.createElement('button');
      rotateButton.innerHTML = '↻';
      rotateButton.title = 'Toggle auto-rotation';
      rotateButton.id = `${prefix}-rotate`;
      rotateButton.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
      rotateButton.style.color = '#000';
      rotateButton.style.width = '40px';
      rotateButton.style.height = '40px';
      rotateButton.style.border = 'none';
      rotateButton.style.borderRadius = '50%';
      rotateButton.style.fontSize = '18px';
      rotateButton.style.cursor = 'pointer';
      rotateButton.style.display = 'flex';
      rotateButton.style.alignItems = 'center';
      rotateButton.style.justifyContent = 'center';
      rotateButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
      rotateButton.style.transition = 'all 0.3s ease';
      rotateButton.addEventListener('click', () => {
        const controls = isLevel1 ? level1Controls : level2Controls;
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
          rotateButton.style.background = controls.autoRotate ? 
            'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
          rotateButton.style.color = controls.autoRotate ? '#fff' : '#000';
        }
      });
