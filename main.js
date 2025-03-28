// Hyperrealistic Spider in Jar Scene
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing hyperrealistic Three.js scene...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Check for required libraries
  const requiredLibraries = [
    'THREE', 
    'THREE.GLTFLoader', 
    'THREE.OrbitControls', 
    'THREE.EffectComposer', 
    'THREE.RenderPass', 
    'THREE.UnrealBloomPass', 
    'THREE.FilmPass',
    'THREE.BokehPass'
  ];
  
  const missingLibraries = requiredLibraries.filter(lib => {
    const parts = lib.split('.');
    return parts.length === 1 
      ? (typeof window[parts[0]] === 'undefined')
      : (typeof window[parts[0]][parts[1]] === 'undefined');
  });
  
  if (missingLibraries.length > 0) {
    console.error(`Missing libraries: ${missingLibraries.join(', ')}`);
    container.innerHTML = `<p>Please load the following libraries: ${missingLibraries.join(', ')}</p>`;
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
    
    // Scene setup with enhanced settings
    const scene = new THREE.Scene();
    
    // Camera setup with more cinematic properties
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);
    
    // Enhanced renderer with physically-based settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Advanced rendering features
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear the container and add canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);
    
    // Post-processing setup
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect for subtle glow
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);
    
    // Film grain for added realism
    const filmPass = new THREE.FilmPass(
      0.35,  // noise intensity
      0.025, // scanline intensity
      648,   // scanline count
      false  // grayscale
    );
    filmPass.renderToScreen = true;
    composer.addPass(filmPass);
    
    // Bokeh (depth of field) pass
    const bokehPass = new THREE.BokehPass(scene, camera, {
      focus: 1.0,
      aperture: 0.025,
      maxblur: 1.0
    });
    composer.addPass(bokehPass);
    
    // Camera jitter for handheld simulation
    const cameraJitterStrength = 0.005;
    function applyCameraJitter() {
      camera.position.x += (Math.random() - 0.5) * cameraJitterStrength;
      camera.position.y += (Math.random() - 0.5) * cameraJitterStrength;
    }
    
    // OrbitControls with enhanced settings
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    // Texture loaders with more detailed loading
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    
    // Advanced environment mapping
    const envMapUrls = [
      'https://threejs.org/examples/textures/cube/Park2/posx.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negx.jpg',
      'https://threejs.org/examples/textures/cube/Park2/posy.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negy.jpg',
      'https://threejs.org/examples/textures/cube/Park2/posz.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negz.jpg'
    ];
    
    const envMap = cubeTextureLoader.load(envMapUrls);
    scene.environment = envMap;
    scene.background = envMap;
    
    // Create realistic lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -7);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);
    
    // Volumetric light effect (simple approximation)
    const volumetricGeometry = new THREE.PlaneGeometry(10, 10);
    const volumetricMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending
    });
    const volumetricLight = new THREE.Mesh(volumetricGeometry, volumetricMaterial);
    volumetricLight.position.z = -5;
    scene.add(volumetricLight);
    
    // Realistic jar creation function
    function createHyperRealisticJar() {
      // Glass material with advanced properties
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.98,
        thickness: 0.05,
        roughness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.99
      });
      
      // Add subtle imperfections via normal map
      textureLoader.load('path/to/glass_imperfections_normal.jpg', (normalMap) => {
        glassMaterial.normalMap = normalMap;
        glassMaterial.normalScale.set(0.1, 0.1);
        glassMaterial.needsUpdate = true;
      });
      
      // Jar geometry with more segments for detailed refraction
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 128, 8, true);
      const jar = new THREE.Mesh(jarGeometry, glassMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      scene.add(jar);
      
      // Scratched metal lid
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.4,
        envMap: envMap
      });
      
      // Add metal scratches via normal map
      textureLoader.load('path/to/metal_scratches_normal.jpg', (normalMap) => {
        lidMaterial.normalMap = normalMap;
        lidMaterial.normalScale.set(0.2, 0.2);
        lidMaterial.needsUpdate = true;
      });
      
      const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 128);
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 1.55, 0);
      lid.castShadow = true;
      scene.add(lid);
      
      return { jar, lid };
    }
    
    // Hyperrealistic spider loading
    function loadHyperRealisticSpider() {
      const gltfLoader = new THREE.GLTFLoader();
      
      // Optional Draco decoder
      if (THREE.DRACOLoader) {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }
      
      gltfLoader.load(
        'hyperrealistic_spider.glb',
        (gltf) => {
          const spiderModel = gltf.scene;
          
          // Advanced material enhancement
          spiderModel.traverse((node) => {
            if (node.isMesh) {
              // Subsurface scattering for organic look
              if (node.material) {
                node.material.onBeforeCompile = (shader) => {
                  shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <color_fragment>',
                    `
                    #include <color_fragment>
                    // Subtle subsurface scattering simulation
                    float subsurface = 0.1;
                    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), subsurface);
                    `
                  );
                };
              }
              
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          
          // Positioning and scaling
          spiderModel.scale.set(1.2, 1.2, 1.2);
          spiderModel.position.set(0, 0.05, 0);
          scene.add(spiderModel);
          
          // Animation mixer for subtle twitches
          const mixer = new THREE.AnimationMixer(spiderModel);
          const twitchClips = gltf.animations.filter(clip => 
            clip.name.toLowerCase().includes('twitch') || 
            clip.name.toLowerCase().includes('idle')
          );
          
          if (twitchClips.length > 0) {
            twitchClips.forEach(clip => {
              const action = mixer.clipAction(clip);
              action.setLoop(THREE.LoopOnce);
              action.clampWhenFinished = true;
              
              // Random interval for twitches
              const randomTrigger = () => {
                if (Math.random() < 0.3) {
                  action.reset().play();
                }
                setTimeout(randomTrigger, Math.random() * 5000 + 2000);
              };
              
              randomTrigger();
            });
          }
          
          // Store mixer for animation update
          window.spiderMixer = mixer;
        },
        (xhr) => {
          // Progress callback
          console.log(`Spider model loading: ${(xhr.loaded / xhr.total * 100)}%`);
        },
        (error) => {
          console.error('Spider model loading failed', error);
          // Fallback procedural spider
          createProceduralSpider();
        }
      );
    }
    
    // Dust and atmospheric particles
    function createAtmosphericParticles() {
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 500;
      const posArray = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i++) {
        // Confined to jar volume with more complex distribution
        posArray[i] = (Math.random() - 0.5) * 1.6 * (i % 3 === 1 ? 0.5 : 1);
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.002,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      particlesMesh.position.y = 0.75;
      scene.add(particlesMesh);
      
      // Animate particles for subtle movement
      window.atmosphericParticles = particlesMesh;
    }
    
    // Clock for animations
    const clock = new THREE.Clock();
    
    // Render loop with enhanced features
    function animate() {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Animate mixers
      if (window.spiderMixer) {
        window.spiderMixer.update(delta);
      }
      
      // Atmospheric particles subtle motion
      if (window.atmosphericParticles) {
        window.atmosphericParticles.rotation.y += delta * 0.05;
      }
      
      // Camera jitter for handheld feel
      applyCameraJitter();
      
      //      // Update controls
      controls.update();
      
      // Render using composer for post-processing
      composer.render(delta);
    }
    
    // Initialize scene components
    function initializeScene() {
      // Create hyperrealistic jar
      createHyperRealisticJar();
      
      // Load hyperrealistic spider
      loadHyperRealisticSpider();
      
      // Create atmospheric particles
      createAtmosphericParticles();
      
      // Start animation loop
      animate();
      
      // Add UI controls
      addSceneControls();
      
      // Remove loading message
      setTimeout(() => {
        if (loadingElement && loadingElement.parentNode) {
          loadingElement.style.opacity = '0';
          loadingElement.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            loadingElement.remove();
          }, 1000);
        }
      }, 2000);
    }
    
    // Add scene controls and interactions
    function addSceneControls() {
      // Fullscreen button
      const fullscreenButton = document.createElement('button');
      fullscreenButton.innerHTML = '⛶';
      fullscreenButton.style.position = 'absolute';
      fullscreenButton.style.bottom = '10px';
      fullscreenButton.style.right = '10px';
      fullscreenButton.style.zIndex = '10';
      fullscreenButton.style.background = 'rgba(255,255,255,0.7)';
      fullscreenButton.style.border = 'none';
      fullscreenButton.style.borderRadius = '5px';
      fullscreenButton.style.padding = '5px 10px';
      fullscreenButton.style.cursor = 'pointer';
      
      fullscreenButton.addEventListener('click', toggleFullscreen);
      container.appendChild(fullscreenButton);
      
      // Depth of field adjustment
      const dofButton = document.createElement('button');
      dofButton.innerHTML = '🔍';
      dofButton.style.position = 'absolute';
      dofButton.style.bottom = '10px';
      dofButton.style.right = '60px';
      dofButton.style.zIndex = '10';
      dofButton.style.background = 'rgba(255,255,255,0.7)';
      dofButton.style.border = 'none';
      dofButton.style.borderRadius = '5px';
      dofButton.style.padding = '5px 10px';
      dofButton.style.cursor = 'pointer';
      
      let dofEnabled = true;
      dofButton.addEventListener('click', () => {
        dofEnabled = !dofEnabled;
        if (bokehPass) {
          bokehPass.enabled = dofEnabled;
          dofButton.style.background = dofEnabled 
            ? 'rgba(255,255,255,0.7)' 
            : 'rgba(0,0,0,0.5)';
        }
      });
      container.appendChild(dofButton);
      
      // Resize and fullscreen handlers
      function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update camera
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        // Update renderer and composer
        renderer.setSize(width, height);
        composer.setSize(width, height);
      }
      
      // Resize listener
      window.addEventListener('resize', handleResize);
      
      // Ambient audio (optional, requires user interaction)
      function addAmbientAudio() {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Subtle breathing sound
        const bufferSize = 4096;
        const noiseNode = audioContext.createScriptProcessor(bufferSize, 1, 1);
        noiseNode.onaudioprocess = function(e) {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            // Generate subtle noise with breathing-like rhythm
            output[i] = Math.random() * 0.1 * Math.sin(i * 0.01);
          }
        };
        
        // Connect and start
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.1; // Very low volume
        noiseNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { noiseNode, gainNode };
      }
      
      // Optional audio initialization (user-triggered)
      let audioSystem;
      const audioButton = document.createElement('button');
      audioButton.innerHTML = '🔊';
      audioButton.style.position = 'absolute';
      audioButton.style.bottom = '10px';
      audioButton.style.left = '10px';
      audioButton.style.zIndex = '10';
      audioButton.style.background = 'rgba(255,255,255,0.7)';
      audioButton.style.border = 'none';
      audioButton.style.borderRadius = '5px';
      audioButton.style.padding = '5px 10px';
      audioButton.style.cursor = 'pointer';
      
      audioButton.addEventListener('click', () => {
        if (!audioSystem) {
          audioSystem = addAmbientAudio();
          audioButton.style.background = 'rgba(0,113,227,0.7)';
        } else {
          audioSystem.gainNode.gain.value = 0;
          audioSystem = null;
          audioButton.style.background = 'rgba(255,255,255,0.7)';
        }
      });
      container.appendChild(audioButton);
    }
    
    // Fullscreen toggle function
    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.mozRequestFullScreen) { // Firefox
          container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) { // Chrome, Safari and Opera
          container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) { // IE/Edge
          container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
          document.msExitFullscreen();
        }
      }
    }
    
    // Procedural spider as fallback
    function createProceduralSpider() {
      const spider = new THREE.Group();
      
      // Body materials with enhanced texture
      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.1,
        envMap: envMap
      });
      
      // Detailed body parts
      const abdomenGeometry = new THREE.SphereGeometry(0.22, 64, 64);
      const abdomen = new THREE.Mesh(abdomenGeometry, bodyMaterial);
      abdomen.castShadow = true;
      spider.add(abdomen);
      
      const headGeometry = new THREE.SphereGeometry(0.15, 64, 64);
      const head = new THREE.Mesh(headGeometry, bodyMaterial);
      head.position.set(0, 0, 0.2);
      head.castShadow = true;
      spider.add(head);
      
      // More detailed legs
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.4, 32);
        const leg = new THREE.Mesh(legGeometry, bodyMaterial);
        
        const angle = (Math.PI / 4) * (i % 4);
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        
        leg.position.set(
          Math.cos(angle) * 0.2 * sideSign, 
          0, 
          Math.sin(angle) * 0.2
        );
        leg.rotation.z = sideSign * Math.PI / 4;
        leg.rotation.y = angle;
        
        leg.castShadow = true;
        spider.add(leg);
      }
      
      // Position and add to scene
      spider.position.y = 0.05;
      scene.add(spider);
      
      // Basic animation for procedural spider
      let twitchDirection = 1;
      function animateSpider() {
        requestAnimationFrame(animateSpider);
        
        // Subtle leg movement
        spider.children.forEach((leg, index) => {
          if (leg !== abdomen && leg !== head) {
            leg.rotation.x += 0.01 * twitchDirection * (index % 2 ? 1 : -1);
          }
        });
        
        // Reverse direction periodically
        if (Math.random() < 0.02) {
          twitchDirection *= -1;
        }
      }
      
      animateSpider();
    }
    
    // Initialize the entire scene
    initializeScene();
  } catch (error) {
    console.error('Critical error in scene setup:', error);
    container.innerHTML = '<p>Unable to create scene. Please check browser console.</p>';
  }
});
 Hyperrealistic Spider in Jar Scene
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing hyperrealistic Three.js scene...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Check for required libraries
  const requiredLibraries = [
    'THREE', 
    'THREE.GLTFLoader', 
    'THREE.OrbitControls', 
    'THREE.EffectComposer', 
    'THREE.RenderPass', 
    'THREE.UnrealBloomPass', 
    'THREE.FilmPass',
    'THREE.BokehPass'
  ];
  
  const missingLibraries = requiredLibraries.filter(lib => {
    const parts = lib.split('.');
    return parts.length === 1 
      ? (typeof window[parts[0]] === 'undefined')
      : (typeof window[parts[0]][parts[1]] === 'undefined');
  });
  
  if (missingLibraries.length > 0) {
    console.error(`Missing libraries: ${missingLibraries.join(', ')}`);
    container.innerHTML = `<p>Please load the following libraries: ${missingLibraries.join(', ')}</p>`;
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
    
    // Scene setup with enhanced settings
    const scene = new THREE.Scene();
    
    // Camera setup with more cinematic properties
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);
    
    // Enhanced renderer with physically-based settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Advanced rendering features
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear the container and add canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);
    
    // Post-processing setup
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect for subtle glow
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);
    
    // Film grain for added realism
    const filmPass = new THREE.FilmPass(
      0.35,  // noise intensity
      0.025, // scanline intensity
      648,   // scanline count
      false  // grayscale
    );
    filmPass.renderToScreen = true;
    composer.addPass(filmPass);
    
    // Bokeh (depth of field) pass
    const bokehPass = new THREE.BokehPass(scene, camera, {
      focus: 1.0,
      aperture: 0.025,
      maxblur: 1.0
    });
    composer.addPass(bokehPass);
    
    // Camera jitter for handheld simulation
    const cameraJitterStrength = 0.005;
    function applyCameraJitter() {
      camera.position.x += (Math.random() - 0.5) * cameraJitterStrength;
      camera.position.y += (Math.random() - 0.5) * cameraJitterStrength;
    }
    
    // OrbitControls with enhanced settings
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    // Texture loaders with more detailed loading
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    
    // Advanced environment mapping
    const envMapUrls = [
      'https://threejs.org/examples/textures/cube/Park2/posx.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negx.jpg',
      'https://threejs.org/examples/textures/cube/Park2/posy.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negy.jpg',
      'https://threejs.org/examples/textures/cube/Park2/posz.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negz.jpg'
    ];
    
    const envMap = cubeTextureLoader.load(envMapUrls);
    scene.environment = envMap;
    scene.background = envMap;
    
    // Create realistic lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    scene.add(keyLight);
    
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 5, -7);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 10, -10);
    scene.add(rimLight);
    
    // Volumetric light effect (simple approximation)
    const volumetricGeometry = new THREE.PlaneGeometry(10, 10);
    const volumetricMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending
    });
    const volumetricLight = new THREE.Mesh(volumetricGeometry, volumetricMaterial);
    volumetricLight.position.z = -5;
    scene.add(volumetricLight);
    
    // Realistic jar creation function
    function createHyperRealisticJar() {
      // Glass material with advanced properties
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.98,
        thickness: 0.05,
        roughness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.99
      });
      
      // Add subtle imperfections via normal map
      textureLoader.load('path/to/glass_imperfections_normal.jpg', (normalMap) => {
        glassMaterial.normalMap = normalMap;
        glassMaterial.normalScale.set(0.1, 0.1);
        glassMaterial.needsUpdate = true;
      });
      
      // Jar geometry with more segments for detailed refraction
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 128, 8, true);
      const jar = new THREE.Mesh(jarGeometry, glassMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      scene.add(jar);
      
      // Scratched metal lid
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        metalness: 0.9,
        roughness: 0.4,
        envMap: envMap
      });
      
      // Add metal scratches via normal map
      textureLoader.load('path/to/metal_scratches_normal.jpg', (normalMap) => {
        lidMaterial.normalMap = normalMap;
        lidMaterial.normalScale.set(0.2, 0.2);
        lidMaterial.needsUpdate = true;
      });
      
      const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 128);
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 1.55, 0);
      lid.castShadow = true;
      scene.add(lid);
      
      return { jar, lid };
    }
    
    // Hyperrealistic spider loading
    function loadHyperRealisticSpider() {
      const gltfLoader = new THREE.GLTFLoader();
      
      // Optional Draco decoder
      if (THREE.DRACOLoader) {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }
      
      gltfLoader.load(
        'hyperrealistic_spider.glb',
        (gltf) => {
          const spiderModel = gltf.scene;
          
          // Advanced material enhancement
          spiderModel.traverse((node) => {
            if (node.isMesh) {
              // Subsurface scattering for organic look
              if (node.material) {
                node.material.onBeforeCompile = (shader) => {
                  shader.fragmentShader = shader.fragmentShader.replace(
                    '#include <color_fragment>',
                    `
                    #include <color_fragment>
                    // Subtle subsurface scattering simulation
                    float subsurface = 0.1;
                    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), subsurface);
                    `
                  );
                };
              }
              
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          
          // Positioning and scaling
          spiderModel.scale.set(1.2, 1.2, 1.2);
          spiderModel.position.set(0, 0.05, 0);
          scene.add(spiderModel);
          
          // Animation mixer for subtle twitches
          const mixer = new THREE.AnimationMixer(spiderModel);
          const twitchClips = gltf.animations.filter(clip => 
            clip.name.toLowerCase().includes('twitch') || 
            clip.name.toLowerCase().includes('idle')
          );
          
          if (twitchClips.length > 0) {
            twitchClips.forEach(clip => {
              const action = mixer.clipAction(clip);
              action.setLoop(THREE.LoopOnce);
              action.clampWhenFinished = true;
              
              // Random interval for twitches
              const randomTrigger = () => {
                if (Math.random() < 0.3) {
                  action.reset().play();
                }
                setTimeout(randomTrigger, Math.random() * 5000 + 2000);
              };
              
              randomTrigger();
            });
          }
          
          // Store mixer for animation update
          window.spiderMixer = mixer;
        },
        (xhr) => {
          // Progress callback
          console.log(`Spider model loading: ${(xhr.loaded / xhr.total * 100)}%`);
        },
        (error) => {
          console.error('Spider model loading failed', error);
          // Fallback procedural spider
          createProceduralSpider();
        }
      );
    }
    
    // Dust and atmospheric particles
    function createAtmosphericParticles() {
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 500;
      const posArray = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount * 3; i++) {
        // Confined to jar volume with more complex distribution
        posArray[i] = (Math.random() - 0.5) * 1.6 * (i % 3 === 1 ? 0.5 : 1);
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.002,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      
      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      particlesMesh.position.y = 0.75;
      scene.add(particlesMesh);
      
      // Animate particles for subtle movement
      window.atmosphericParticles = particlesMesh;
    }
    
    // Clock for animations
    const clock = new THREE.Clock();
    
    // Render loop with enhanced features
    function animate() {
      requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      
      // Animate mixers
      if (window.spiderMixer) {
        window.spiderMixer.update(delta);
      }
      
      // Atmospheric particles subtle motion
      if (window.atmosphericParticles) {
        window.atmosphericParticles.rotation.y += delta * 0.05;
      }
      
      // Camera jitter for handheld feel
      applyCameraJitter();
      
      //
