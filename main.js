// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing photorealistic Three.js scene...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Set explicit container dimensions if not already set
  if (!container.style.height || container.style.height === 'auto') {
    container.style.height = '600px';
  }
  if (!container.style.width || container.style.width === 'auto') {
    container.style.width = '100%';
  }
  container.style.position = 'relative';
  
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
    loadingElement.style.fontSize = '18px';
    loadingElement.style.fontWeight = 'bold';
    loadingElement.textContent = 'Loading photorealistic scene...';
    loadingElement.style.zIndex = '100';
    loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    loadingElement.style.padding = '15px 20px';
    loadingElement.style.borderRadius = '8px';
    loadingElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    loadingElement.style.textAlign = 'center';
    container.appendChild(loadingElement);
    
    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);
    
    // Enhanced renderer with physically-based settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Advanced rendering features - enable as browser supports
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
    
    // Clear the container and add canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement); // Re-add the loading element
    
    // Ensure the renderer's canvas uses correct styles for fullscreen
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    
    // Add OrbitControls
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0); // Lower target to look more at the bottom of the jar
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
      
      // Set as scene environment and background
      scene.environment = envMap;
      
      // Create a subtle background
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
    
    // Create Lights
    // Ambient light (subtle)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
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
    scene.add(keyLight);
    
    // Fill light (softer, from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 4, -3);
    scene.add(fillLight);
    
    // Rim light (highlight edges)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    // Setup loading manager for tracking load progress
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
      const percent = Math.round(loaded / total * 100);
      if(loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = `Loading scene assets... ${percent}%`;
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
      scene.add(table);
      
      // Now that table is loaded, create the jar
      createJar();
    }
    
    // Create the glass jar
    function createJar() {
      // Create realistic glass jar - using a closed cylinder for complete glass
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, false); // closed cylinder
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.95, // glass transparency
        transparent: true,
        thickness: 0.05,    // glass thickness
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1
      });
      
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      scene.add(jar);
      
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
      scene.add(lid);
      
      // Now load the spider model
      loadSpiderModel();
    }
    
    // Load the spider model
    function loadSpiderModel() {
      if(loadingElement && loadingElement.parentNode) {
        loadingElement.innerHTML = 'Loading spider model...<div id="loading-spinner"></div>';
        
        // Add spinner style
        const spinnerStyle = document.createElement('style');
        spinnerStyle.textContent = `
          #loading-spinner {
            margin: 10px auto 0;
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left: 4px solid #333;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(spinnerStyle);
      }
      
      // Create a GLTFLoader instance
      const gltfLoader = new THREE.GLTFLoader(loadingManager);
      
      // Optional: Setup Draco decoder for compressed models
      if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }
      
      // Spider micro-animation system for subtle movements (will be used if model fails)
      window.spiderAnimations = {
        enabled: true,
        legMovements: [],
        breathingScale: 0.0005,
        breathingSpeed: 0.5,
        twitchProbability: 0.01,
        lastTwitchTime: 0,
        coolingPeriod: 2.0
      };
      
      // Load the spider model
      gltfLoader.load(
        // Model path - adjust this to your file location
        'spider_with_animation.glb',
        
        // Success callback
        function(gltf) {
          // Get the model from the loaded gltf file
          const spiderModel = gltf.scene;
          
          // Adjust scale - making it 1.2 times larger (more proportional to jar)
          spiderModel.scale.set(1.2, 1.2, 1.2);
          
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
            0.05 + heightOffset, // Place slightly above the bottom for better visibility
            -center.z   // Center horizontally
          );
          
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
          scene.add(spiderModel);
          
          // Store reference to model for animations
          window.spiderModel = spiderModel;
          
          // Handle animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Model has ${gltf.animations.length} animations`);
            
            // Log animation names for debugging
            gltf.animations.forEach((clip, index) => {
              console.log(`Animation ${index}: ${clip.name || 'unnamed'}`);
            });
            
            // Create an animation mixer
            mixer = new THREE.AnimationMixer(spiderModel);
            
            // Get the first animation (or pick a specific one)
            const idleAnimation = gltf.animations[0];
            
            // Create an animation action
            const action = mixer.clipAction(idleAnimation);
            action.timeScale = 0.5; // Slow down animation for subtle movement
            
            // Play the animation
            action.play();
          } else {
            console.log('No animations found in the model');
          }
          
          // Add dust particles and finalize
          addDustParticles();
          finalizeScene();
          
          // Update loading status
          if(loadingElement && loadingElement.parentNode) {
            loadingElement.innerHTML = '<div>Scene loaded successfully!</div>';
            
            // Add some instructions in the loading element
            const instructions = document.createElement('div');
            instructions.style.marginTop = '10px';
            instructions.style.fontSize = '14px';
            instructions.style.fontWeight = 'normal';
            instructions.innerHTML = 'Click and drag to rotate<br>Scroll to zoom';
            loadingElement.appendChild(instructions);
            
            // Hide loading message after a short delay
            setTimeout(() => {
              loadingElement.style.opacity = '0';
              loadingElement.style.transition = 'opacity 1s ease';
              setTimeout(() => {
                if(loadingElement && loadingElement.parentNode) {
                  loadingElement.remove();
                }
              }, 1000);
            }, 1500);
          }
        },
        
        // Progress callback
        function(xhr) {
          // This is handled by the loadingManager
        },
        
        // Error callback
        function(error) {
          console.error('Error loading spider model:', error);
          if(loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Failed to load spider model. Using fallback...';
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
      
      // Spider body (abdomen)
      const abdomenGeometry = new THREE.SphereGeometry(0.22, 32, 32);
      const spiderMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.2,
        envMap: envMap
      });
      const abdomen = new THREE.Mesh(abdomenGeometry, spiderMaterial);
      abdomen.castShadow = true;
      spider.add(abdomen);
      
      // Spider head (cephalothorax)
      const headGeometry = new THREE.SphereGeometry(0.15, 32, 32);
      const head = new THREE.Mesh(headGeometry, spiderMaterial);
      head.position.set(0, 0, 0.2);
      head.castShadow = true;
      spider.add(head);
      
      // Simple legs
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.4, 8);
        const leg = new THREE.Mesh(legGeometry, spiderMaterial);
        
        const angle = (Math.PI / 4) * (i % 4);
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        
        leg.position.set(Math.cos(angle) * 0.2 * sideSign, 0, Math.sin(angle) * 0.2);
        leg.rotation.z = sideSign * Math.PI / 4;
        leg.rotation.y = angle;
        
        leg.castShadow = true;
        spider.add(leg);
        
        // Store the leg for animations
        window.spiderAnimations.legMovements.push({
          node: leg,
          initialRotation: leg.rotation.clone(),
          rotationAxis: new THREE.Vector3(
            Math.random() > 0.5 ? 1 : 0, 
            Math.random() > 0.5 ? 1 : 0, 
            Math.random() > 0.5 ? 1 : 0
          ).normalize(),
          magnitude: 0.01 + Math.random() * 0.02,
          speed: 0.5 + Math.random() * 2
        });
      }
      
      // Position spider in jar - slightly elevated from bottom for better visibility
      spider.position.y = 0.05; // Slightly raised from the jar bottom
      scene.add(spider);
      
      // Store spider reference for animations
      window.spiderModel = spider;
      
      // Continue with dust particles and scene finalization
      addDustParticles();
      finalizeScene();
      
      // Update loading status
      if(loadingElement && loadingElement.parentNode) {
        loadingElement.innerHTML = '<div>Scene loaded with fallback spider</div>';
        
        // Add instructions
        const instructions = document.createElement('div');
        instructions.style.marginTop = '10px';
        instructions.style.fontSize = '14px';
        instructions.style.fontWeight = 'normal';
        instructions.innerHTML = 'Click and drag to rotate<br>Scroll to zoom';
        loadingElement.appendChild(instructions);
        
        setTimeout(() => {
          loadingElement.style.opacity = '0';
          loadingElement.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            if(loadingElement && loadingElement.parentNode) {
              loadingElement.remove();
            }
          }, 1000);
        }, 1500);
      }
    }
    
    // Add dust particles inside the jar
    function addDustParticles() {
      const particlesCount = 150;
      const positions = new Float32Array(particlesCount * 3);
      const sizes = new Float32Array(particlesCount);
      const particleGeometry = new THREE.BufferGeometry();
      
      // Create varied dust particles 
      for (let i = 0; i < particlesCount; i++) {
        // Random positions inside jar
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        
        positions[i * 3] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = Math.random() * 1.4 + 0.05; // y (within jar height)
        positions[i * 3 + 2] = Math.sin(angle) * radius; // z
        
        // Varied particle sizes
        sizes[i] = 0.002 + Math.random() * 0.005;
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.005,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.y = 0.75; // Center of jar
      scene.add(particles);
      
      // Store for animation
      window.dustParticles = particles;
    }
    
    // Finalize the scene setup
    function finalizeScene() {
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Update animation mixer if available
        if (mixer) {
          mixer.update(delta);
        }
        
        // Animate dust particles
        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          
          for (let i = 0; i < positions.length; i += 3) {
            // More natural floating motion
            positions[i] += Math.sin((elapsedTime + i) * 0.05) * 0.0002; // X-axis drift
            positions[i + 1] += Math.sin((elapsedTime + i) * 0.1) * 0.0005; // Y-axis stronger lift
            positions[i + 2] += Math.cos((elapsedTime + i) * 0.07) * 0.0003; // Z-axis drift
            
            // Keep particles inside jar bounds
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta * 0.01;
        }
        
        // Animate spider legs with micro-movements if available
        if (window.spiderAnimations && window.spiderAnimations.enabled && window.spiderAnimations.legMovements.length > 0) {
          window.spiderAnimations.legMovements.forEach(item => {
            if (item.node && item.initialRotation) {
              // Reset to initial rotation
              item.node.rotation.copy(item.initialRotation);
              
              // Apply subtle movement
              const angle = Math.sin(elapsedTime * item.speed) * item.magnitude;
              item.node.rotateOnAxis(item.rotationAxis, angle);
            }
          });
        }
        
        // Update controls
        if (controls) controls.update();
        
        // Render
        renderer.render(scene, camera);
      }
      
      // Start animation
      animate();
      
      // Add a fullscreen button
      const fullscreenButton = document.createElement('button');
      fullscreenButton.textContent = '⛶';
      fullscreenButton.style.position = 'absolute';
      fullscreenButton.style.bottom = '10px';
      fullscreenButton.style.right = '10px';
      fullscreenButton.style.fontSize = '20px';
      fullscreenButton.style.padding = '5px 10px';
      fullscreenButton.style.background = 'rgba(255,255,255,0.7)';
      fullscreenButton.style.border = 'none';
      fullscreenButton.style.borderRadius = '5px';
      fullscreenButton.style.cursor = 'pointer';
      fullscreenButton.style.zIndex = '10';
      fullscreenButton.title = 'Toggle fullscreen';
      
      fullscreenButton.addEventListener('click', function() {
        if (!document.fullscreenElement) {
          // Ensure container styles are correct before going fullscreen
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.margin = '0';
          container.style.padding = '0';
          container.style.overflow = 'hidden';
          container.style.position = 'relative';
          
          // Fix for handling fullscreen properly across browsers
          try {
            // Try standard method first
            container.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
          } catch (e) {
            // Fallbacks for various browsers
            try {
              if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
              else if (container.mozRequestFullScreen) container.mozRequestFullScreen();
              else if (container.msRequestFullscreen) container.msRequestFullscreen();
            } catch (innerErr) {
              console.error('Fullscreen API not supported', innerErr);
            }
          }
        } else {
          try {
            if (document.exitFullscreen) {
              document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit fullscreen: ${err.message}`);
              });
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
            }
          } catch (err) {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          }
