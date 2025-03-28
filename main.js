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
  
  try {
    // Create loading message
    const loadingElement = document.createElement('div');
    loadingElement.style.position = 'absolute';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.color = '#333';
    loadingElement.style.fontSize = '16px';
    loadingElement.style.fontWeight = 'bold';
    loadingElement.textContent = 'Loading photorealistic scene...';
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
    
    // Add OrbitControls
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.75, 0);
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
    
    // Load wood texture for table asynchronously
    const woodTextures = {
      map: null,
      normalMap: null,
      roughnessMap: null
    };
    
    let texturesLoaded = 0;
    const requiredTextures = 3;
    
    function checkAllTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        createTable();
      }
    }
    
    // Load wood textures
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function(texture) {
      woodTextures.map = texture;
      woodTextures.map.wrapS = THREE.RepeatWrapping;
      woodTextures.map.wrapT = THREE.RepeatWrapping;
      woodTextures.map.repeat.set(2, 2);
      checkAllTexturesLoaded();
    });
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_normal.jpg', function(texture) {
      woodTextures.normalMap = texture;
      woodTextures.normalMap.wrapS = THREE.RepeatWrapping;
      woodTextures.normalMap.wrapT = THREE.RepeatWrapping;
      woodTextures.normalMap.repeat.set(2, 2);
      checkAllTexturesLoaded();
    });
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(texture) {
      woodTextures.roughnessMap = texture;
      woodTextures.roughnessMap.wrapS = THREE.RepeatWrapping;
      woodTextures.roughnessMap.wrapT = THREE.RepeatWrapping;
      woodTextures.roughnessMap.repeat.set(2, 2);
      checkAllTexturesLoaded();
    });
    
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
      
      // Now that table is loaded, create other elements
      createJar();
    }
    
    // Create the glass jar
    function createJar() {
      // Create realistic glass jar
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, true);
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
      
      // Add jar bottom (glass base)
      const jarBottomGeometry = new THREE.CircleGeometry(0.8, 64);
      const jarBottom = new THREE.Mesh(jarBottomGeometry, jarMaterial);
      jarBottom.rotation.x = -Math.PI / 2;
      jarBottom.position.set(0, 0, 0);
      scene.add(jarBottom);
      
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
      
      // Now create the spider
      createSpider();
    }
    
    // Create the realistic spider
    function createSpider() {
      // Create a realistic spider
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
      
      // Spider eyes
      const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x440000,
        roughness: 0.2,
        metalness: 0.5,
        envMap: envMap
      });
      
      // Add 8 small eyes
      for (let i = 0; i < 8; i++) {
        const angle = Math.PI * 0.1 * (i - 2);
        const eyeGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const eyeRadius = 0.06;
        eye.position.set(
          eyeRadius * Math.sin(angle),
          eyeRadius * Math.cos(angle) * 0.5 + 0.03,
          0.34 // Positioned on the front of the head
        );
        head.add(eye);
      }
      
      // Spider legs - more detailed with joints
      const legMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.9,
        metalness: 0.1,
        envMap: envMap
      });
      
      // Create detailed legs with multiple segments
      for (let i = 0; i < 8; i++) {
        const legGroup = new THREE.Group();
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        const angle = Math.PI / 8 + (Math.PI / 4) * (i % 4);
        
        // Each leg has 3 segments
        const femurGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.3, 8);
        const femur = new THREE.Mesh(femurGeometry, legMaterial);
        femur.castShadow = true;
        
        const tibiaGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8);
        const tibia = new THREE.Mesh(tibiaGeometry, legMaterial);
        tibia.castShadow = true;
        
        const tarsusGeometry = new THREE.CylinderGeometry(0.005, 0.002, 0.25, 8);
        const tarsus = new THREE.Mesh(tarsusGeometry, legMaterial);
        tarsus.castShadow = true;
        
        // Position leg to side of body
        legGroup.position.x = Math.cos(angle) * 0.18 * sideSign;
        legGroup.position.z = Math.sin(angle) * 0.18;
        
        // Rotate and position segments
        femur.rotation.z = sideSign * Math.PI / 4;
        femur.position.x = sideSign * 0.1;
        femur.position.y = -0.12;
        
        tibia.position.x = sideSign * 0.25;
        tibia.position.y = -0.3;
        tibia.rotation.z = sideSign * Math.PI / 3;
        
        tarsus.position.x = sideSign * 0.4;
        tarsus.position.y = -0.5;
        tarsus.rotation.z = sideSign * Math.PI / 6;
        
        legGroup.add(femur);
        legGroup.add(tibia);
        legGroup.add(tarsus);
        spider.add(legGroup);
      }
      
      // Position spider in jar
      spider.position.y = 0.4;
      spider.castShadow = true;
      scene.add(spider);
      
      // Add more subtle ambient effects - dust particles in the jar
      addDustParticles();
      
      // Setup animation and finalize
      setupAnimation(spider);
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
      scene.add(particles);
      
      // Store in global scope for animation
      window.dustParticles = particles;
    }
    
    // Setup animation function
    function setupAnimation(spider) {
      let clock = new THREE.Clock();
      
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Spider subtle movement
        spider.rotation.y = Math.sin(elapsedTime * 0.5) * 0.1;
        spider.position.y = 0.4 + Math.sin(elapsedTime * 0.8) * 0.02;
        
        // Slightly move spider legs for natural effect
        spider.children.forEach((child, index) => {
          if (index > 1) { // Skip body and head
            child.rotation.x = Math.sin(elapsedTime * 0.8 + index * 0.3) * 0.05;
          }
        });
        
        // Animate dust particles
        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          
          for (let i = 0; i < positions.length; i += 3) {
            // Slow floating motion
            positions[i + 1] += Math.sin((elapsedTime + i) * 0.1) * 0.0005;
            
            // Keep particles inside jar bounds
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta * 0.01;
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
          container.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
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
      instructions.innerHTML = 'Click and drag to rotate<br>Scroll to zoom';
      container.appendChild(instructions);
      
      // Hide instructions after 5 seconds
      setTimeout(() => {
        instructions.style.opacity = '0';
        instructions.style.transition = 'opacity 1s ease';
      }, 5000);
      
      // Handle window resize
      window.addEventListener('resize', function() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      });
      
      console.log('Photorealistic scene built successfully!');
    }
    
    // If textures fail to load, start anyway with fallbacks
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
    console.error('Error creating photorealistic scene:', error);
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Error creating 3D scene. Please check the browser console for details.</p>';
  }
});
