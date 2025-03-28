// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing hyperrealistic Three.js scene...');
  
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
    loadingElement.textContent = 'Loading hyperrealistic scene...';
    loadingElement.style.zIndex = '100';
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
      renderer.toneMappingExposure = 1.2; // Increased exposure for better brightness
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
    
    // Create Enhanced Lights
    // Ambient light (increased for better overall illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Enhanced key light (main light)
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.1); // Warmer, slightly brighter
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
    
    // Add an extra light for the right side of the jar
    const rightLight = new THREE.DirectionalLight(0xffefd5, 0.7); // Warm light for right side
    rightLight.position.set(6, 2, 0); // Position to the right side
    rightLight.castShadow = true;
    rightLight.shadow.mapSize.width = 1024;
    rightLight.shadow.mapSize.height = 1024;
    scene.add(rightLight);
    
    // Add a front-facing light for better illumination of spider from viewer's perspective
    const frontLight = new THREE.SpotLight(0xfffaf0, 0.8); // Warm white spotlight
    frontLight.position.set(0, 1.2, 5); // Position in front of jar
    frontLight.angle = Math.PI / 6; // Narrow angle
    frontLight.penumbra = 0.2; // Soft edge
    frontLight.decay = 1.5;
    frontLight.distance = 10;
    frontLight.castShadow = true;
    frontLight.shadow.mapSize.width = 1024;
    frontLight.shadow.mapSize.height = 1024;
    scene.add(frontLight);
    
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
      woodTextures.map.repeat.set(3, 3); // Increased repeat for finer grain
      createTableIfTexturesLoaded();
    });
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function(texture) {
      woodTextures.normalMap = texture;
      woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
      woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
      woodTextures.normalMap.repeat.set(3, 3);
      createTableIfTexturesLoaded();
    });
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(texture) {
      woodTextures.roughnessMap = texture;
      woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
      woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
      woodTextures.roughnessMap.repeat.set(3, 3);
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
    
    // Create wooden table with enhanced properties
    function createTable() {
      // Create a slightly uneven table for more realism
      const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3, 1, 1, 1);
      
      // Add very subtle random height variations to vertices
      const positionAttribute = tableGeometry.getAttribute('position');
      for (let i = 0; i < positionAttribute.count; i++) {
        // Only modify y positions slightly for top vertices
        if (positionAttribute.getY(i) > 0.09) {
          positionAttribute.setY(
            i, 
            positionAttribute.getY(i) + (Math.random() * 0.005 - 0.0025)
          );
        }
      }
      tableGeometry.computeVertexNormals();
      
      const tableMaterial = new THREE.MeshStandardMaterial({
        map: woodTextures.map,
        normalMap: woodTextures.normalMap,
        roughnessMap: woodTextures.roughnessMap,
        roughness: 0.8,
        metalness: 0.1,
        envMap: envMap,
        color: 0xeadfca // Slightly warmer wood tone for realism
      });
      
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.y = -0.1; // Slightly below the jar
      table.receiveShadow = true;
      scene.add(table);
      
      // Add subtle dust to the table
      addTableDust();
      
      // Now that table is loaded, create the jar
      createJar();
    }
    
    // Add subtle dust on the table
    function addTableDust() {
      // Create a subtle dust plane on the table
      const dustGeometry = new THREE.PlaneGeometry(4.8, 2.8);
      
      // Create a canvas for the dust texture
      const dustCanvas = document.createElement('canvas');
      dustCanvas.width = 512;
      dustCanvas.height = 512;
      const dustCtx = dustCanvas.getContext('2d');
      
      // Fill with transparent base
      dustCtx.fillStyle = 'rgba(255, 255, 255, 0)';
      dustCtx.fillRect(0, 0, 512, 512);
      
      // Add random dust spots
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 2;
        
        dustCtx.fillStyle = `rgba(245, 245, 245, ${Math.random() * 0.03})`;
        dustCtx.fillRect(x, y, size, size);
      }
      
      const dustTexture = new THREE.CanvasTexture(dustCanvas);
      
      const dustMaterial = new THREE.MeshBasicMaterial({
        map: dustTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      const dust = new THREE.Mesh(dustGeometry, dustMaterial);
      dust.rotation.x = -Math.PI / 2; // Lay flat on table
      dust.position.y = -0.09; // Just above the table
      dust.position.z = 0; // Center
      
      scene.add(dust);
    }
    
    // Create the glass jar
    function createJar() {
      // Create realistic glass jar - using a closed cylinder for complete glass
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 16, false); // Higher segments for better quality
      
      // Add subtle imperfections to jar
      const jarPositionAttribute = jarGeometry.getAttribute('position');
      for (let i = 0; i < jarPositionAttribute.count; i++) {
        // Get current position
        const x = jarPositionAttribute.getX(i);
        const y = jarPositionAttribute.getY(i);
        const z = jarPositionAttribute.getZ(i);
        
        // Calculate distance from center axis
        const dist = Math.sqrt(x * x + z * z);
        
        // Only modify if point is on the outer surface (not top/bottom)
        if (dist > 0.7 && y > -0.7 && y < 0.7) {
          // Add subtle imperfection
          const noise = (Math.random() - 0.5) * 0.01;
          
          // Normalize x,z to get direction
          const nx = x / dist;
          const nz = z / dist;
          
          // Apply noise in the radial direction
          jarPositionAttribute.setX(i, x + nx * noise);
          jarPositionAttribute.setZ(i, z + nz * noise);
        }
      }
      jarGeometry.computeVertexNormals();
      
      // Enhanced glass material
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0, // Reduced metalness for better glass look
        roughness: 0.05,
        transmission: 0.95, // glass transparency
        transparent: true,
        thickness: 0.05,    // glass thickness
        envMapIntensity: 1.2, // Slightly stronger reflections
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        ior: 1.5, // Add realistic refraction index for glass
        attenuationDistance: 5.0, // Distance that light travels through glass
        attenuationColor: new THREE.Color(0xf1f8ff) // Very subtle blue tint
      });
      
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      scene.add(jar);
      
      // Add condensation effect inside jar
      const condensationGeometry = new THREE.CylinderGeometry(0.79, 0.79, 1.49, 64, 16, true);
      const condensationMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0.0,
        transmission: 0.7,
        transparent: true,
        opacity: 0.03, // Very subtle
        side: THREE.BackSide // Only render inside
      });
      
      const condensation = new THREE.Mesh(condensationGeometry, condensationMaterial);
      condensation.position.copy(jar.position);
      scene.add(condensation);
      
      // Create a realistic metal lid
      createDetailedLid();
      
      // Now load the spider model
      loadSpiderModel();
    }
    
    // Create a detailed jar lid with realistic features
    function createDetailedLid() {
      // Main lid body
      const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.15, // Slightly rougher for realism
        envMap: envMap
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 1.55, 0);
      lid.castShadow = true;
      scene.add(lid);
      
      // Add a rim around the lid
      const lidRimGeometry = new THREE.TorusGeometry(0.85, 0.03, 8, 64);
      const lidRimMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.9,
        roughness: 0.2,
        envMap: envMap
      });
      const lidRim = new THREE.Mesh(lidRimGeometry, lidRimMaterial);
      lidRim.position.set(0, 1.51, 0);
      lidRim.rotation.x = Math.PI / 2;
      lidRim.castShadow = true;
      scene.add(lidRim);
      
      // Add a top plate to the lid
      const lidTopGeometry = new THREE.CircleGeometry(0.8, 32);
      const lidTopMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.15,
        envMap: envMap
      });
      const lidTop = new THREE.Mesh(lidTopGeometry, lidTopMaterial);
      lidTop.position.set(0, 1.601, 0);
      lidTop.rotation.x = -Math.PI / 2;
      scene.add(lidTop);
      
      // Add concentric circles to the top of the lid
      for (let i = 0; i < 3; i++) {
        const radius = 0.7 - (i * 0.2);
        const circleGeometry = new THREE.TorusGeometry(radius, 0.01, 4, 32);
        const circleMaterial = new THREE.MeshStandardMaterial({
          color: 0x666666,
          metalness: 0.9,
          roughness: 0.3
        });
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.position.set(0, 1.602, 0);
        circle.rotation.x = Math.PI / 2;
        scene.add(circle);
      }
    }
    
    // Load the spider model
    function loadSpiderModel() {
      if(loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Loading spider model...';
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
        // Model path - adjust this to your file location
        'spider_with_animation.glb',
        
        // Success callback
        function(gltf) {
          // Get the model from the loaded gltf file
          const spiderModel = gltf.scene;
          
          // Make the spider larger - increased scale from 1.2 to 1.8
          spiderModel.scale.set(1.8, 1.8, 1.8);
          
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
          
          // Apply shadows and improve materials
          spiderModel.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Improve materials with enhanced reflections
              if (node.material) {
                node.material.envMap = envMap;
                node.material.envMapIntensity = 0.6; // Enhanced environment reflections
                
                // Add eye glints if this might be an eye part
                if (node.name.toLowerCase().includes('eye') || 
                    (node.material.color && node.material.color.getHex() === 0x000000 && 
                     node.geometry.type === 'SphereGeometry')) {
                  // Make eyes slightly reflective
                  node.material.roughness = 0.3;
                  node.material.envMapIntensity = 1.2;
                } 
                // For regular body parts
                else {
                  // Subtle subsurface effect for organic look
                  if (node.material.color && node.material.color.getHex() === 0x000000) {
                    // For black parts, add slight sheen
                    node.material.roughness = 0.75;
                  }
                }
                
                node.material.needsUpdate = true;
              }
            }
          });
          
          // Add to scene
          scene.add(spiderModel);
          
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
            
            // Slow down animation for more natural movement
            action.timeScale = 0.3;
            
            // Play the animation
            action.play();
          } else {
            console.log('No animations found in the model');
          }
          
          // Add dust particles and finalize
          addDustParticles();
          addWebStrands();
          finalizeScene();
          
          // Update loading status
          if(loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Scene loaded!';
            
            // Hide loading message after a short delay
            setTimeout(() => {
              loadingElement.style.opacity = '0';
              loadingElement.style.transition = 'opacity 1s ease';
              setTimeout(() => {
                if(loadingElement && loadingElement.parentNode) {
                  loadingElement.remove();
                }
              }, 1000);
            }, 1000);
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
      const abdomenGeometry = new THREE.SphereGeometry(0.3, 32, 32); // Increased size
      const spiderMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.1, // Slightly reduced metalness for more natural look
        envMap: envMap
      });
      const abdomen = new THREE.Mesh(abdomenGeometry, spiderMaterial);
      abdomen.castShadow = true;
      spider.add(abdomen);
      
      // Spider head (cephalothorax)
      const headGeometry = new THREE.SphereGeometry(0.22, 32, 32); // Increased size
      const head = new THREE.Mesh(headGeometry, spiderMaterial);
      head.position.set(0, 0, 0.3); // Adjusted position for larger spider
      head.castShadow = true;
      spider.add(head);
      
      // Add eyes
      for (let i = 0; i < 8; i++) {
        const eyeSize = 0.02 + (i < 2 ? 0.01 : 0); // Two slightly larger front eyes
        const eyeGeometry = new THREE.SphereGeometry(eyeSize, 16, 16);
        const eyeMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x000000,
          roughness: 0.1,
          metalness: 0.0,
          envMap: envMap,
          envMapIntensity: 1.5,
          clearcoat: 1.0
        });
        
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        
        // Position eyes in a pattern on the head
        const row = Math.floor(i / 4); // 0 for first row, 1 for second row
        const col = i % 4; // 0-3 for position in row
        
        // Calculate eye position
        const angle = (Math.PI / 8) * (col - 1.5); // Spread eyes across the front
        const radius = row === 0 ? 0.18 : 0.16; // Front row further out
        const height = row === 0 ? 0.04 : 0.02; // Front row higher
        
        eye.position.set(
          Math.sin(angle) * 0.1,
          height,
          head.position.z + Math.cos(angle) * 0.1 + 0.1
        );
        
        head.add(eye);
        
        // Add subtle eye glint (catch-light)
        const glintGeometry = new THREE.SphereGeometry(eyeSize * 0.2, 8, 8);
        const glintMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.7
        });
        
        const glint = new THREE.Mesh(glintGeometry, glintMaterial);
        glint.position.set(eyeSize * 0.3, eyeSize * 0.3, eyeSize * 0.5);
        eye.add(glint);
      }
      
      // Simple legs
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.03, 0.015, 0.6, 8); // Increased size
        const leg = new THREE.Mesh(legGeometry, spiderMaterial);
        
        const angle = (Math.PI / 4) * (i % 4);
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        
        leg.position.set(Math.cos(angle) * 0.3 * sideSign, 0, Math.sin(angle) * 0.3);
        leg.rotation.z = sideSign * Math.PI / 4;
        leg.rotation.y = angle;
        
        leg.castShadow = true;
        spider.add(leg);
        
        // Store initial rotation for animation
        leg.userData = {
          initialRotation: leg.rotation.clone(),
          animationSpeed: 0.5 + Math.random() * 0.5,
          animationOffset: Math.random() * Math.PI * 2
        };
      }
      
      // Position spider in jar - exactly on the bottom
      spider.position.y = 0.05; // Slightly raised for better visibility
      scene.add(spider);
      
      // Continue with dust particles and scene finalization
      addDustParticles();
      addWebStrands();
      finalizeScene();
      
      // Update loading status
      if(loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Scene loaded (using fallback spider)';
        setTimeout(() => {
          loadingElement.style.opacity = '0';
          loadingElement.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            if(loadingElement && loadingElement.parentNode) {
              loadingElement.remove();
            }
          }, 1000);
        }, 1000);
      }
    }
    
    // Add spider web strands inside the jar for realism
    function addWebStrands() {
      const webCount = 5 + Math.floor(Math.random() * 5);
      const webGroup = new THREE.Group();
      webGroup.position.y = 0.75; // Same center as jar
      
      for (let i = 0; i < webCount; i++) {
        // Create a thin line for web strand
        const points = [];
        const segmentCount = 5 + Math.floor(Math.random() * 5);
        
        // Starting point - higher in the jar
        const startY = 0.3 + Math.random() * 0.7;
        const startAngle = Math.random() * Math.PI * 2;
        const startRadius = Math.random() * 0.6;
        const startPoint = new THREE.Vector3(
          Math.cos(startAngle) * startRadius,
          startY,
          Math.sin(startAngle) * startRadius
        );
        
        // End point - lower in the jar, near spider
        const endY = -0.6 + Math.random() * 0.6;
        const endAngle = startAngle + (Math.random() * Math.PI/2 - Math.PI/4);
        const endRadius = Math.random() * 0.7;
        const endPoint = new THREE.Vector3(
          Math.cos(endAngle) * endRadius,
          endY,
          Math.sin(endAngle) * endRadius
        );
        
        // Create intermediate points for a curved strand
        points.push(startPoint);
        
        for (let j = 1; j < segmentCount; j++) {
          const t = j / segmentCount;
          
          // Base interpolation
          const x = startPoint.x * (1 - t) + endPoint.x * t;
          const y = startPoint.y * (1 - t) + endPoint.y * t;
          const z = startPoint.z * (1 - t) + endPoint.z * t;
          
          // Add a slight curve with sine wave
          const sag = Math.sin(t * Math.PI) * (0.05 + Math.random() * 0.15);
          const sagPoint = new THREE.Vector3(
            x - Math.sin(startAngle) * sag,
            y - sag,
            z - Math.cos(startAngle) * sag
          );
          
          points.push(sagPoint);
        }
        
        points.push(endPoint);
        
        // Create the strand
        const webGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const webMaterial = new THREE.LineBasicMaterial({ 
          color: 0xf8f8f8,
          transparent: true,
          opacity: 0.4 + Math.random() * 0.3
        });
        
        const webStrand = new THREE.Line(webGeometry, webMaterial);
        webGroup.add(webStrand);
        
        // Occasionally add a small droplet of moisture along the web
        if (Math.random() > 0.7) {
          const dropletPosition = points[Math.floor(Math.random() * points.length)];
          const dropletGeometry = new THREE.SphereGeometry(0.01 + Math.random() * 0.02, 8, 8);
          const dropletMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0,
            metalness: 0,
            transmission: 0.98,
            transparent: true,
            ior: 1.4
          });
          
          const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
          droplet.position.copy(dropletPosition);
          webGroup.add(droplet);
        }
      }
      
      scene.add(webGroup);
      window.webGroup = webGroup;
    }
    
    // Enhanced dust particles
    function addDustParticles() {
      const particlesCount = 200; // More particles for realism
      const positions = new Float32Array(particlesCount * 3);
      const sizes = new Float32Array(particlesCount); // Add variable sizes
      const particleGeometry = new THREE.BufferGeometry();
      
      for (let i = 0; i < particlesCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        
        positions[i * 3] = Math.cos(angle) * radius; // x
        positions[i * 3 + 1] = Math.random() * 1.4 + 0.05; // y (within jar height)
        positions[i * 3 + 2] = Math.sin(angle) * radius; // z
        
        // Varied particle sizes for realism
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
        sizeAttenuation: true // Size based on distance for realism
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.position.y = 0.75; // Center of jar
      scene.add(particles);
      
      // Store for animation
      window.dustParticles = particles;
    }
    
    // Finalize the scene setup
    function finalizeScene() {
      // Animation loop with enhanced dust and web animation
      function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Update animation mixer if available
        if (mixer) {
          mixer.update(delta);
        }
        
        // Enhanced dust animation
        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          
          for (let i = 0; i < positions.length; i += 3) {
            // More natural 3D floating motion
            positions[i] += Math.sin((elapsedTime + i) * 0.05) * 0.0002; // X-axis drift
            positions[i + 1] += Math.sin((elapsedTime + i) * 0.1) * 0.0005; // Y-axis lift
            positions[i + 2] += Math.cos((elapsedTime + i) * 0.07) * 0.0002; // Z-axis drift
            
            // Keep particles inside jar bounds
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta * 0.01;
        }
        
        // Animate web strands with subtle movement
        if (window.webGroup) {
          // Gentle sway of web
          window.webGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.01;
          
          // Animate droplets on web
          window.webGroup.children.forEach((child) => {
            if (child.isMesh) {
              // Animate water droplets
              child.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;
              child.rotation.z = Math.cos(elapsedTime * 0.3) * 0.2;
            }
          });
        }
        
        // Animate procedural spider legs if available
        if (mixer === undefined) {
          // Only animate spider legs if no animation mixer (means using procedural spider)
          scene.traverse(function(child) {
            if (child.isMesh && child.userData && child.userData.initialRotation) {
              // Reset to initial rotation
              child.rotation.copy(child.userData.initialRotation);
              
              // Apply subtle sine-wave animation
              const legAngle = Math.sin(elapsedTime * child.userData.animationSpeed + 
                              child.userData.animationOffset) * 0.03;
              child.rotation.z += legAngle;
            }
          });
        }
        
        // Add subtle camera breathing motion
        const cameraBreathing = Math.sin(elapsedTime * 0.5) * 0.0005;
        camera.position.y += cameraBreathing;
        
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
          
          // Force resize after going fullscreen
          setTimeout(() => {
            handleResize();
          }, 100);
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
        }
      });
      
      container.appendChild(fullscreenButton);
      
      // Add auto-rotate toggle
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
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
          rotateButton.style.background = controls.autoRotate ? 
            'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
          rotateButton.style.color = controls.autoRotate ? '#fff' : '#000';
        }
      });
      
      container.appendChild(rotateButton);
      
      // Add a light toggle button for "flashlight" effect
      const lightButton = document.createElement('button');
      lightButton.textContent = '💡';
      lightButton.style.position = 'absolute';
      lightButton.style.bottom = '10px';
      lightButton.style.right = '110px';
      lightButton.style.fontSize = '20px';
      lightButton.style.padding = '5px 10px';
      lightButton.style.background = 'rgba(255,255,255,0.7)';
      lightButton.style.border = 'none';
      lightButton.style.borderRadius = '5px';
      lightButton.style.cursor = 'pointer';
      lightButton.style.zIndex = '10';
      lightButton.title = 'Toggle extra light';
      
      // Track whether extra light is on
      let extraLightOn = true;
      
      lightButton.addEventListener('click', function() {
        extraLightOn = !extraLightOn;
        lightButton.style.background = extraLightOn ? 
          'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
        lightButton.style.color = extraLightOn ? '#fff' : '#000';
        
        // Toggle the front-facing light
        frontLight.intensity = extraLightOn ? 0.8 : 0;
      });
      
      container.appendChild(lightButton);
      
      // Add instructions
      const instructions = document.createElement('div');
      instructions.style.position = 'absolute';
      instructions.style.top = '10px';
      instructions.style.left = '10px';
      instructions.style.padding = '10px';
      instructions.style.background = 'rgba(255,255,255,0.7)';
      instructions.style.borderRadius = '5px';
      instructions.style.fontSize = '14px';
      instructions.style.zIndex = '10';
      instructions.innerHTML = 'Click and drag to rotate<br>Scroll to zoom<br>Use buttons for special effects';
      container.appendChild(instructions);
      
      // Hide instructions after 5 seconds
      setTimeout(() => {
        instructions.style.opacity = '0';
        instructions.style.transition = 'opacity 1s ease';
      }, 5000);
      
      // Handle window resize and fullscreen changes
      function handleResize() {
        // If in fullscreen, use screen dimensions
        let width, height;
        
        if (document.fullscreenElement === container) {
          width = window.innerWidth; 
          height = window.innerHeight;
          
          // Ensure the canvas fills the entire fullscreen space
          renderer.domElement.style.width = "100vw";
          renderer.domElement.style.height = "100vh";
          
          // Additional styles to fix fullscreen issues
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
      
      // Listen for resize events
      window.addEventListener('resize', handleResize);
      
      // Listen for fullscreen change events with additional fix for exiting fullscreen
      document.addEventListener('fullscreenchange', function() {
        handleResize();
        // Force additional resize after slight delay to catch any browser quirks
        setTimeout(handleResize, 100);
      });
      document.addEventListener('webkitfullscreenchange', function() {
        handleResize();
        setTimeout(handleResize, 100);
      });
      document.addEventListener('mozfullscreenchange', function() {
        handleResize();
        setTimeout(handleResize, 100);
      });
      document.addEventListener('MSFullscreenChange', function() {
        handleResize();
        setTimeout(handleResize, 100);
      });
      
      // Initial resize
      handleResize();
      
      console.log('Scene setup completed');
    }
