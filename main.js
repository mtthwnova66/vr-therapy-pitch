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
  
  // Check if required loaders are available
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
    
    // Camera setup with improved depth of field settings
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);
    
    // Enhanced renderer with physically-based settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      precision: 'highp', // High precision for better visual quality
      powerPreference: 'high-performance' // Request high performance GPU
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x to avoid performance issues
    
    // Advanced rendering features - enable as browser supports
    try {
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; // Better tone mapping for photorealism
      renderer.toneMappingExposure = 1.1; // Slightly brighter exposure
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
    
    // Add OrbitControls with improved settings
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.7, 0); // Target the jar better
      controls.enableDamping = true;
      controls.dampingFactor = 0.07; // Increased for smoother movement
      controls.minDistance = 2;
      controls.maxDistance = 8;
      controls.maxPolarAngle = Math.PI * 0.85; // Limit how far down user can look
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.3; // Slower for more cinematic rotation
      controls.update();
    } else {
      console.warn('OrbitControls not available');
    }
    
    // Texture loader with better mipmap settings
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    
    // Setup Post-Processing
    let composer;
    let effectFXAA;
    let bloomPass;
    let filmPass;
    let bokehPass;
    
    // Initialize post-processing
    function setupPostProcessing() {
      // Check if required post-processing components are available
      if (typeof THREE.EffectComposer === 'undefined' || 
          typeof THREE.RenderPass === 'undefined' ||
          typeof THREE.UnrealBloomPass === 'undefined' ||
          typeof THREE.FilmPass === 'undefined' || 
          typeof THREE.BokehPass === 'undefined' ||
          typeof THREE.ShaderPass === 'undefined' ||
          typeof THREE.FXAAShader === 'undefined') {
        console.warn('Post-processing libraries not fully available, using standard renderer');
        return false;
      }
      
      try {
        // Create composer
        composer = new THREE.EffectComposer(renderer);
        const renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);
        
        // Add UnrealBloomPass for realistic glow
        bloomPass = new THREE.UnrealBloomPass(
          new THREE.Vector2(container.clientWidth, container.clientHeight),
          0.15,  // strength (subtle bloom)
          0.3,   // radius
          0.85   // threshold
        );
        composer.addPass(bloomPass);
        
        // Add FilmPass for grain and scanlines
        filmPass = new THREE.FilmPass(
          0.15,  // noise intensity
          0.025, // scanline intensity 
          648,   // scanline count
          0      // grayscale (0 = color)
        );
        filmPass.renderToScreen = false;
        composer.addPass(filmPass);
        
        // Add Bokeh (depth of field) pass
        const bokehParams = {
          focus: 3.0,
          aperture: 0.00045,
          maxblur: 0.01,
          width: container.clientWidth,
          height: container.clientHeight
        };
        
        bokehPass = new THREE.BokehPass(scene, camera, bokehParams);
        bokehPass.renderToScreen = false;
        composer.addPass(bokehPass);
        
        // Add FXAA pass for anti-aliasing
        effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
        effectFXAA.uniforms.resolution.value.set(
          1 / (container.clientWidth * renderer.getPixelRatio()),
          1 / (container.clientHeight * renderer.getPixelRatio())
        );
        effectFXAA.renderToScreen = true;
        composer.addPass(effectFXAA);
        
        return true;
      } catch (e) {
        console.warn('Error setting up post-processing', e);
        return false;
      }
    }
    
    // Flag to track if post-processing is enabled
    const postProcessingEnabled = setupPostProcessing();
    
    // Camera jitter for handheld effect
    let cameraJitter = {
      enabled: true,
      originalPosition: new THREE.Vector3(),
      jitterAmount: 0.005,
      breathingAmount: 0.001,
      breathingSpeed: 0.5
    };
    
    // Store the camera's original position
    cameraJitter.originalPosition.copy(camera.position);
    
    // Load HDRI environment map for reflections
    let envMap;
    try {
      // Use an HDRI loader if available (more realistic)
      if (typeof THREE.RGBELoader !== 'undefined') {
        const rgbeLoader = new THREE.RGBELoader();
        rgbeLoader.setDataType(THREE.HalfFloatType);
        
        rgbeLoader.load('https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.hdr', function(texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture;
          
          // Apply HDRI to background with subtle blur
          if (typeof THREE.PMREMGenerator !== 'undefined') {
            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            pmremGenerator.compileEquirectangularShader();
            
            const envScene = pmremGenerator.fromEquirectangular(texture).texture;
            scene.background = envScene;
            
            pmremGenerator.dispose();
          } else {
            scene.background = texture;
          }
          
          // Update all materials that need the environment map
          scene.traverse((node) => {
            if (node.isMesh && node.material) {
              if (node.material.envMap !== undefined) {
                node.material.envMap = texture;
                node.material.needsUpdate = true;
              }
            }
          });
        });
      } else {
        // Fallback to cubemap
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
        scene.background = envMap;
      }
      
      // Create a subtle backdrop (visible if HDRI fails)
      const bgGeometry = new THREE.PlaneGeometry(100, 100);
      const bgMaterial = new THREE.MeshBasicMaterial({
        color: 0xf5f5f7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const background = new THREE.Mesh(bgGeometry, bgMaterial);
      background.position.z = -20;
      scene.add(background);
      
    } catch (e) {
      console.warn('Environment mapping not fully supported', e);
      scene.background = new THREE.Color(0xf5f5f7);
    }
    
    // Create enhanced lighting for photorealism
    
    // Ambient light (subtle)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);
    
    // Key light (main light) - improved with IES profile
    const keyLight = new THREE.DirectionalLight(0xffefd5, 1.2); // Warm light
    keyLight.position.set(3, 6, 3);
    keyLight.castShadow = true;
    
    // Enhanced shadow quality
    keyLight.shadow.mapSize.width = 2048; // Doubled for better quality
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02; // Reduce shadow acne
    keyLight.shadow.radius = 2; // Soft shadows
    scene.add(keyLight);
    
    // Fill light (softer, from opposite side) - with slight blue tint for contrast
    const fillLight = new THREE.DirectionalLight(0xe1f5fe, 0.6);
    fillLight.position.set(-3, 4, -3);
    fillLight.castShadow = true;
    fillLight.shadow.mapSize.width = 1024;
    fillLight.shadow.mapSize.height = 1024;
    fillLight.shadow.camera.near = 0.1;
    fillLight.shadow.camera.far = 20;
    fillLight.shadow.camera.left = -5;
    fillLight.shadow.camera.right = 5;
    fillLight.shadow.camera.top = 5;
    fillLight.shadow.camera.bottom = -5;
    fillLight.shadow.bias = -0.0005;
    scene.add(fillLight);
    
    // Rim light (highlight edges)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    // Add a subtle spotlight to highlight the spider
    const spotlight = new THREE.SpotLight(0xffffeb, 0.8);
    spotlight.position.set(0, 3, 2);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.5;
    spotlight.decay = 2;
    spotlight.distance = 10;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    spotlight.shadow.bias = -0.0005;
    spotlight.target.position.set(0, 0.5, 0); // Target the spider
    scene.add(spotlight);
    scene.add(spotlight.target);
    
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
    
    // Load textures for wood table with added imperfections
    const woodTextures = {
      map: null,
      normalMap: null,
      roughnessMap: null,
      aoMap: null, // Added ambient occlusion for realism
      bumpMap: null // Added bump map for additional texture
    };
    
    // Load wood textures with the loading manager
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_diffuse.jpg', function(texture) {
      woodTextures.map = texture;
      woodTextures.map.wrapS = THREE.RepeatWrapping;
      woodTextures.map.wrapT = THREE.RepeatWrapping;
      woodTextures.map.repeat.set(3, 3); // More repeats for finer grain
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
    
    // Load additional maps for realism
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(texture) {
      woodTextures.aoMap = texture; // Reuse as AO map
      woodTextures.aoMap.wrapS = THREE.RepeatWrapping;
      woodTextures.aoMap.wrapT = THREE.RepeatWrapping;
      woodTextures.aoMap.repeat.set(3, 3);
      createTableIfTexturesLoaded();
    });
    
    textureLoader.load('https://threejs.org/examples/textures/hardwood2_roughness.jpg', function(texture) {
      woodTextures.bumpMap = texture; // Reuse as bump map
      woodTextures.bumpMap.wrapS = THREE.RepeatWrapping;
      woodTextures.bumpMap.wrapT = THREE.RepeatWrapping;
      woodTextures.bumpMap.repeat.set(3, 3);
      createTableIfTexturesLoaded();
    });
    
    // Load smudge and fingerprint textures for glass
    const glassImperfections = {
      smudgeMap: null,
      fingerprintMap: null
    };
    
    // Synthetic smudge map (fallback if real textures unavailable)
    const smudgeCanvas = document.createElement('canvas');
    smudgeCanvas.width = 512;
    smudgeCanvas.height = 512;
    const smudgeCtx = smudgeCanvas.getContext('2d');
    smudgeCtx.fillStyle = '#ffffff';
    smudgeCtx.fillRect(0, 0, 512, 512);
    
    // Generate random smudges
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = 20 + Math.random() * 80;
      const gradient = smudgeCtx.createRadialGradient(x, y, 0, x, y, radius);
      const alpha = 0.1 + Math.random() * 0.2;
      gradient.addColorStop(0, `rgba(200, 200, 200, ${alpha})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      smudgeCtx.fillStyle = gradient;
      smudgeCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    
    // Create texture from canvas
    glassImperfections.smudgeMap = new THREE.CanvasTexture(smudgeCanvas);
    
    // Fingerprint map (similarly generated)
    const fingerprintCanvas = document.createElement('canvas');
    fingerprintCanvas.width = 512;
    fingerprintCanvas.height = 512;
    const fpCtx = fingerprintCanvas.getContext('2d');
    fpCtx.fillStyle = '#ffffff';
    fpCtx.fillRect(0, 0, 512, 512);
    
    // Generate subtle fingerprint-like patterns
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      
      // Create fingerprint-like pattern
      const size = 10 + Math.random() * 30;
      const alpha = 0.05 + Math.random() * 0.15;
      
      fpCtx.save();
      fpCtx.translate(x, y);
      fpCtx.rotate(Math.random() * Math.PI * 2);
      
      // Draw curved lines for fingerprint
      fpCtx.strokeStyle = `rgba(100, 100, 100, ${alpha})`;
      fpCtx.lineWidth = 1;
      
      for (let j = 0; j < 5 + Math.random() * 8; j++) {
        fpCtx.beginPath();
        const startX = -size / 2;
        const startY = j * 2 - size / 2 + Math.random() * 4;
        
        fpCtx.moveTo(startX, startY);
        
        // Create a curved line
        const cp1x = -size / 6 + Math.random() * 5;
        const cp1y = startY + Math.random() * 10 - 5;
        const cp2x = size / 6 + Math.random() * 5;
        const cp2y = startY + Math.random() * 10 - 5;
        const endX = size / 2;
        const endY = startY + Math.random() * 10 - 5;
        
        fpCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        fpCtx.stroke();
      }
      
      fpCtx.restore();
    }
    
    // Create texture from canvas
    glassImperfections.fingerprintMap = new THREE.CanvasTexture(fingerprintCanvas);
    
    // Create scratch texture for metal lid
    const scratchCanvas = document.createElement('canvas');
    scratchCanvas.width = 1024;
    scratchCanvas.height = 1024;
    const scratchCtx = scratchCanvas.getContext('2d');
    scratchCtx.fillStyle = '#ffffff';
    scratchCtx.fillRect(0, 0, 1024, 1024);
    
    // Add random scratches
    for (let i = 0; i < 50; i++) {
      const x1 = Math.random() * 1024;
      const y1 = Math.random() * 1024;
      const length = 5 + Math.random() * 40;
      const angle = Math.random() * Math.PI * 2;
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length;
      
      scratchCtx.beginPath();
      scratchCtx.moveTo(x1, y1);
      scratchCtx.lineTo(x2, y2);
      scratchCtx.strokeStyle = `rgba(100, 100, 100, ${0.1 + Math.random() * 0.3})`;
      scratchCtx.lineWidth = 0.5 + Math.random();
      scratchCtx.stroke();
    }
    
    const scratchMap = new THREE.CanvasTexture(scratchCanvas);
    
    // Track texture loading
    let texturesLoaded = 0;
    const requiredTextures = 5; // Updated count
    
    function createTableIfTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        createTable();
      }
    }
    
    // Create wooden table with imperfections
    function createTable() {
      // Create a slightly uneven table geometry for more realism
      const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3, 64, 4, 32);
      
      // Add slight imperfections to the table geometry
      const positionAttribute = tableGeometry.getAttribute('position');
      for (let i = 0; i < positionAttribute.count; i++) {
        // Only modify top vertices slightly (y near 0.1) for a worn look
        if (positionAttribute.getY(i) > 0.09) {
          // Add very small random offsets
          positionAttribute.setY(
            i, 
            positionAttribute.getY(i) + (Math.random() * 0.005 - 0.0025)
          );
        }
      }
      
      // Update normals after modifying vertices
      tableGeometry.computeVertexNormals();
      
      // Create a more realistic table material
      const tableMaterial = new THREE.MeshStandardMaterial({
        map: woodTextures.map,
        normalMap: woodTextures.normalMap,
        normalScale: new THREE.Vector2(1.5, 1.5), // Enhance normal effect
        roughnessMap: woodTextures.roughnessMap,
        roughness: 0.85, // Slightly rougher
        metalness: 0.05,
        aoMap: woodTextures.aoMap,
        aoMapIntensity: 1.0,
        bumpMap: woodTextures.bumpMap,
        bumpScale: 0.01,
        envMap: scene.environment || envMap,
        envMapIntensity: 0.5,
        color: 0xeadfca // Slightly warmer wood tone
      });
      
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.y = -0.1; // Slightly below the jar
      table.receiveShadow = true;
      table.castShadow = true;
      scene.add(table);
      
      // Add subtle dust to the table
      addTableDust(table);
      
      // Now that table is loaded, create the jar
      createJar();
    }
    
    // Add subtle dust to the table surface
    function addTableDust(table) {
      // Create a subtle dust layer on the table
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
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 2;
        
        dustCtx.fillStyle = `rgba(245, 245, 245, ${Math.random() * 0.05})`;
        dustCtx.fillRect(x, y, size, size);
      }
      
      // Add a few larger dust clumps
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const radius = 1 + Math.random() * 3;
        const gradient = dustCtx.createRadialGradient(x, y, 0, x, y, radius);
        
        gradient.addColorStop(0, 'rgba(245, 245, 245, 0.1)');
        gradient.addColorStop(1, 'rgba(245, 245, 245, 0)');
        
        dustCtx.fillStyle = gradient;
        dustCtx.beginPath();
        dustCtx.arc(x, y, radius, 0, Math.PI * 2);
        dustCtx.fill();
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
      dust.position.y = 0.01; // Just above the table
      dust.position.z = 0; // Center
      
      scene.add(dust);
    }
    
    // Create the glass jar with hyperrealistic details
    function createJar() {
      // Create more detailed jar - higher poly count for better reflections
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 128, 64, false);
      
      // Add subtle imperfections to jar
      const jarPositionAttribute = jarGeometry.getAttribute('position');
      for (let i = 0; i < jarPositionAttribute.count; i++) {
        // Get the current position
        const x = jarPositionAttribute.getX(i);
        const y = jarPositionAttribute.getY(i);
        const z = jarPositionAttribute.getZ(i);
        
        // Calculate distance from center axis (for cylindrical distortion)
        const dist = Math.sqrt(x * x + z * z);
        
        // Only modify if point is on the outer surface (not top/bottom)
        if (dist > 0.75 && y > -0.7 && y < 0.7) {
          // Add very subtle random variations for imperfections
          const noise = (Math.random() - 0.5) * 0.01;
          
          // Normalize x,z to get direction
          const nx = x / dist;
          const nz = z / dist;
          
          // Apply noise in the radial direction
          jarPositionAttribute.setX(i, x + nx * noise);
          jarPositionAttribute.setZ(i, z + nz * noise);
        }
      }
      
      // Recompute normals after vertex modifications
      jarGeometry.computeVertexNormals();
      
      // Create advanced glass material with imperfections
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.95, // glass transparency
        transparent: true,
        thickness: 0.05,    // glass thickness
        envMapIntensity: 1.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        ior: 1.5, // glass IOR
        specularIntensity: 1.0,
        specularColor: 0xffffff,
        envMap: scene.environment || envMap,
        side: THREE.DoubleSide, // For proper refraction
        depthWrite: false, // Help with transparency sorting
        attenuationColor: new THREE.Color(0xcceeff), // Subtle blue glass tint
        attenuationDistance: 5.0, // How far light travels through glass
        reflectivity: 0.2 // Glass reflectivity
      });
      
      // Add imperfections if textures were created
      if (glassImperfections.smudgeMap) {
        jarMaterial.roughnessMap = glassImperfections.smudgeMap;
        jarMaterial.clearcoatRoughnessMap = glassImperfections.fingerprintMap;
        jarMaterial.clearcoatNormalScale = new THREE.Vector2(0.05, 0.05); // Subtle normal effect
