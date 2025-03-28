// Spider Simulation - Level 2 (Moderate Exposure)
// This is the more intense version with a closer view of the spider

let level2Scene, level2Camera, level2Renderer, level2Controls;

function initLevel2() {
  console.log('Initializing Level 2 spider simulation');
  
  // Get the container
  const container = document.getElementById('arachnophobia-level2');
  if (!container) {
    console.error('Container not found: #arachnophobia-level2');
    return;
  }
  
  // Create a flag to track initialization
  if (window.level2Initialized) {
    console.log('Level 2 already initialized, refreshing instead');
    refreshLevel2();
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
    <p>Loading Level 2 simulation...</p>
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
    // Scene setup - use same scene properties as Level 1
    level2Scene = new THREE.Scene();
    level2Scene.background = new THREE.Color(0xf5f5f7);
    
    // Camera setup - closer view than Level 1
    level2Camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    // Position camera at a more diagonal angle (similar to Level 1 but closer)
    level2Camera.position.set(1.5, 0.8, 2.0);
    
    // Enhanced renderer with physically-based settings
    level2Renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    level2Renderer.setSize(container.clientWidth, container.clientHeight);
    level2Renderer.setPixelRatio(window.devicePixelRatio);
    
    // Advanced rendering features - same as Level 1
    try {
      level2Renderer.physicallyCorrectLights = true;
      level2Renderer.outputEncoding = THREE.sRGBEncoding;
      level2Renderer.toneMapping = THREE.ACESFilmicToneMapping;
      level2Renderer.toneMappingExposure = 1.0;
      level2Renderer.shadowMap.enabled = true;
      level2Renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } catch (e) {
      console.warn('Advanced rendering features not fully supported in this browser', e);
    }
    
    // Add canvas to container
    container.appendChild(level2Renderer.domElement);
    
    // Ensure the renderer's canvas uses correct styles
    level2Renderer.domElement.style.width = '100%';
    level2Renderer.domElement.style.height = '100%';
    level2Renderer.domElement.style.display = 'block';
    level2Renderer.domElement.style.position = 'absolute';
    level2Renderer.domElement.style.top = '0';
    level2Renderer.domElement.style.left = '0';
    
    // Add OrbitControls - same as Level 1
    if (typeof THREE.OrbitControls !== 'undefined') {
      level2Controls = new THREE.OrbitControls(level2Camera, level2Renderer.domElement);
      level2Controls.target.set(0, 0.4, 0); // Look at spider body
      level2Controls.enableDamping = true;
      level2Controls.dampingFactor = 0.05;
      level2Controls.minDistance = 1.5;  // Allow closer zoom than Level 1
      level2Controls.maxDistance = 8;
      level2Controls.autoRotate = false;
      level2Controls.autoRotateSpeed = 0.5;
      level2Controls.update();
    } else {
      console.warn('OrbitControls not available');
    }
    
    // Add simulation controls - the same as Level 1
    addSimControls(container, false);
    
    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Load environment map for reflections - same as Level 1
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
      level2Scene.environment = envMap;
      
      // Create a subtle background - same as Level 1
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.MeshBasicMaterial({
        color: 0xf5f5f7,
        side: THREE.DoubleSide
      });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      background.position.z = -20;
      level2Scene.add(background);
      
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
      level2Scene.background = new THREE.Color(0xf5f5f7);
    }
    
    // Create Lights - same as Level 1
    // Ambient light (subtle)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    level2Scene.add(ambientLight);
    
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
    level2Scene.add(keyLight);
    
    // Fill light (softer, from opposite side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 4, -3);
    level2Scene.add(fillLight);
    
    // Add an extra light for the right side
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rightLight.position.set(6, 2, 0);
    level2Scene.add(rightLight);
    
    // Rim light (highlight edges)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 5, -5);
    level2Scene.add(rimLight);
    
    // Setup loading manager
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
    
    // Load wood texture for table - same as Level 1
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
    
    // Create wooden table - same as Level 1
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
      table.position.y = -0.1; // Slightly below the spider
      table.receiveShadow = true;
      level2Scene.add(table);
      
      // Now load the spider model
      loadSpiderModel();
    }
    
    // Load the spider model - for level 2, we directly create it on the table
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
      
      // Load the spider model
      gltfLoader.load(
        // Model URL - falls back to procedural spider if this fails
        'spider_with_animation.glb',
        
        // Success callback
        function(gltf) {
          // Get the model from the loaded gltf file
          const spiderModel = gltf.scene;
          
          // Adjust scale - increased from 1.2 to 1.8 times larger for level 2
          spiderModel.scale.set(1.8, 1.8, 1.8);
          
          // First, get the bounding box to properly position the spider
          const boundingBox = new THREE.Box3().setFromObject(spiderModel);
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          
          // Calculate appropriate position to make the spider sit on the table
          const minY = boundingBox.min.y;
          const heightOffset = -minY;
          
          spiderModel.position.set(
            -center.x,           // Center horizontally
            0 + heightOffset,    // Place on the table
            -center.z            // Center horizontally
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
          level2Scene.add(spiderModel);
          
          // Handle animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Level 2 model has ${gltf.animations.length} animations`);
            
            // Create an animation mixer
            mixer = new THREE.AnimationMixer(spiderModel);
            
            // Get the first animation
            const idleAnimation = gltf.animations[0];
            
            // Create an animation action
            const action = mixer.clipAction(idleAnimation);
            
            // Slow down animation for more realism
            action.timeScale = 0.7; // Slightly faster than level 1
            
            // Play the animation
            action.play();
          }
          
          // Add environmental elements
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
          console.error('Error loading Level 2 spider model:', error);
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
      console.log('Creating procedural spider as fallback for Level 2');
      
      // Create a simple spider - larger than Level 1
      const spider = new THREE.Group();
      
      // Spider body (abdomen) - increased size
      const abdomenGeometry = new THREE.SphereGeometry(0.35, 32, 32);
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
      const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
      const head = new THREE.Mesh(headGeometry, spiderMaterial);
      head.position.set(0, 0, 0.28);
      head.castShadow = true;
      spider.add(head);
      
      // Spider eyes (more detailed for Level 2)
      const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const eyeGeometry = new THREE.SphereGeometry(0.035, 16, 16);
      
      // Create 8 eyes in a pattern
      const eyePositions = [
        { x: -0.1, y: 0.08, z: 0.4 },
        { x: 0.1, y: 0.08, z: 0.4 },
        { x: -0.15, y: 0.12, z: 0.35 },
        { x: 0.15, y: 0.12, z: 0.35 },
        { x: -0.18, y: 0.06, z: 0.33 },
        { x: 0.18, y: 0.06, z: 0.33 },
        { x: -0.12, y: 0.0, z: 0.42 },
        { x: 0.12, y: 0.0, z: 0.42 }
      ];
      
      eyePositions.forEach(pos => {
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        eye.position.set(pos.x, pos.y, pos.z);
        spider.add(eye);
      });
      
      // Simple legs - larger and longer than Level 1
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.03, 0.02, 0.6, 8);
        const leg = new THREE.Mesh(legGeometry, spiderMaterial);
        
        const angle = (Math.PI / 4) * (i % 4);
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        
        leg.position.set(Math.cos(angle) * 0.3 * sideSign, 0, Math.sin(angle) * 0.3);
        leg.rotation.z = sideSign * Math.PI / 4;
        leg.rotation.y = angle;
        
        leg.castShadow = true;
        spider.add(leg);
      }
      
      // Position spider on table
      spider.position.y = 0.05;
      level2Scene.add(spider);
      
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
    
    // Add dust particles around the scene
    function addDustParticles() {
      const particlesCount = 120; // More particles than Level 1
      const positions = new Float32Array(particlesCount * 3);
      const particleGeometry = new THREE.BufferGeometry();
      
      for (let i = 0; i < particlesCount; i++) {
        // Random positions in a wider area
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.2;
        
        positions[i * 3] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = Math.random() * 0.5 + 0.05; // y (just above table)
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
      particles.position.y = 0.2; // Just above the table
      level2Scene.add(particles);
      
      // Store for animation
      window.level2DustParticles = particles;
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
      
      // Hide instructions after 5 seconds
      setTimeout(() => {
        instructions.style.opacity = '0';
      }, 5000);
      
      // Add control buttons container
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'sim-controls';
      controlsDiv.id = `${prefix}-controls`;
      
      // Add fullscreen button
      const fullscreenButton = document.createElement('button');
      fullscreenButton.innerHTML = '⛶';
      fullscreenButton.title = 'Toggle fullscreen';
      fullscreenButton.id = `${prefix}-fullscreen`;
      fullscreenButton.addEventListener('click', () => toggleFullscreen(container));
      
      // Add rotation toggle button
      const rotateButton = document.createElement('button');
      rotateButton.innerHTML = '↻';
      rotateButton.title = 'Toggle auto-rotation';
      rotateButton.id = `${prefix}-rotate`;
      rotateButton.addEventListener('click', () => {
        const controls = isLevel1 ? level1Controls : level2Controls;
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
          rotateButton.style.background = controls.autoRotate ? 
            'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
          rotateButton.style.color = controls.autoRotate ? '#fff' : '#000';
        }
      });
      
      // Add buttons to controls div
      controlsDiv.appendChild(rotateButton);
      controlsDiv.appendChild(fullscreenButton);
      
      // Add controls to container
      container.appendChild(controlsDiv);
    }
    
    // Toggle fullscreen function
    function toggleFullscreen(container) {
      if (!document.fullscreenElement) {
        // Going fullscreen
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      } else {
        // Exiting fullscreen
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
      }
    }
    
    // Finalize the scene setup and start animation
    function finalizeScene() {
      // Animation loop
      function animate() {
        // Check if canvas is still in the DOM
        if (!level2Renderer.domElement.isConnected) {
          console.log('Level 2 canvas removed from DOM, stopping animation loop');
          return;
        }
        
        window.level2AnimationFrame = requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        
        // Update animation mixer if available
        if (mixer) {
          mixer.update(delta);
        }
        
        // Animate dust particles
        if (window.level2DustParticles) {
          const positions = window.level2DustParticles.geometry.attributes.position.array;
          
          for (let i = 0; i < positions.length; i += 3) {
            // Slow floating motion
            positions[i + 1] += Math.sin((clock.getElapsedTime() + i) * 0.1) * 0.0005;
            
            // Keep particles above the table
            if (positions[i + 1] > 0.55) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 0.55;
          }
          
          window.level2DustParticles.geometry.attributes.position.needsUpdate = true;
          window.level2DustParticles.rotation.y += delta * 0.01;
        }
        
        // Update controls
        if (level2Controls) level2Controls.update();
        
        // Render
        level2Renderer.render(level2Scene, level2Camera);
      }
      
      // Start animation
      animate();
      
      // Handle resizing
      function handleResize() {
        const container = document.getElementById('arachnophobia-level2');
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update camera aspect ratio
        level2Camera.aspect = width / height;
        level2Camera.updateProjectionMatrix();
        
        // Update renderer size
        level2Renderer.setSize(width, height);
      }
      
      // Listen for resize events
      window.addEventListener('resize', handleResize);
      
      // Set flag to indicate level 2 is initialized
      window.level2Initialized = true;
      
      console.log('Level 2 scene setup completed');
    }
    
    // If textures fail to load, start anyway with fallbacks after timeout
    setTimeout(() => {
      if (texturesLoaded < requiredTextures) {
        console.warn('Not all textures loaded in time, proceeding with fallbacks');
        
        // Fallback materials
        woodTextures.map = woodTextures.map || new THREE.Texture();
        woodTextures.normalMap = woodTextures.normalMap || new THREE.Texture();
        woodTextures.roughnessMap = woodTextures.roughnessMap || new THREE.Texture();
        
        createTable();
      }
    }, 5000); // 5 second timeout
  } catch (error) {
    console.error('Error creating Level 2 scene:', error);
    const container = document.getElementById('arachnophobia-level2');
    if (container) {
      container.innerHTML = '<p style="padding: 20px; text-align: center;">Error creating 3D scene. Please check the browser console for details.</p>';
    }
  }
}

// Function to refresh Level 2 if already initialized
function refreshLevel2() {
  const container = document.getElementById('arachnophobia-level2');
  if (!container) return;
  
  // Make sure the container is displayed
  container.style.display = 'block';
  
  // Force a resize event to refresh the renderer
  if (level2Renderer && level2Camera) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    level2Camera.aspect = width / height;
    level2Camera.updateProjectionMatrix();
    level2Renderer.setSize(width, height);
    
    // Re-render once
    if (level2Scene) {
      level2Renderer.render(level2Scene, level2Camera);
    }
  }
}
