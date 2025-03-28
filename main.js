// Hyperrealistic Spider in a Jar Scene
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing hyperrealistic Three.js scene...');
  
  // Get the container
  const container = document.getElementById('arachnophobia-demo');
  if (!container) {
    console.error('Container not found: #arachnophobia-demo');
    return;
  }
  
  // Check if required libraries are available
  const requiredLibs = [
    'THREE', 
    'THREE.GLTFLoader', 
    'THREE.OrbitControls', 
    'THREE.EffectComposer', 
    'THREE.RenderPass', 
    'THREE.UnrealBloomPass', 
    'THREE.FilmPass',
    'THREE.BokehPass'
  ];
  
  const missingLibs = requiredLibs.filter(lib => {
    const parts = lib.split('.');
    return parts.reduce((obj, part) => obj && obj[part], window) === undefined;
  });
  
  if (missingLibs.length > 0) {
    console.error(`Missing required libraries: ${missingLibs.join(', ')}`);
    container.innerHTML = `<p style="padding: 20px; text-align: center;">Missing libraries: ${missingLibs.join(', ')}</p>`;
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
    
    // Scene setup with enhanced configurations
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera with realistic depth of field parameters
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5);
    
    // Renderer with advanced settings
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Clear the container and add canvas
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);
    
    // Renderer styles
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    
    // Post-processing setup
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect for subtle glow
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.5,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    composer.addPass(bloomPass);
    
    // Film grain for texture
    const filmPass = new THREE.FilmPass(
      0.35,   // noise intensity
      0.025,  // scanline intensity
      648,    // scanline count
      false   // grayscale
    );
    filmPass.renderToScreen = true;
    composer.addPass(filmPass);
    
    // Bokeh (depth of field) pass
    const bokehPass = new THREE.BokehPass(scene, camera, {
      focus: 1.0,
      aperture: 0.025,
      maxblur: 0.01
    });
    composer.addPass(bokehPass);
    
    // OrbitControls with enhanced settings
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.6, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    // Simulate slight camera jitter (handheld effect)
    function addCameraJitter() {
      const jitterStrength = 0.001;
      const time = performance.now() * 0.001;
      camera.position.x += Math.sin(time * 2) * jitterStrength;
      camera.position.y += Math.cos(time * 2.1) * jitterStrength;
    }
    
    // Sophisticated lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // HDRI Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envMapLoader = new THREE.CubeTextureLoader();
    const envMap = envMapLoader.load([
      'https://threejs.org/examples/textures/cube/Park2/posx.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negx.jpg',
      'https://threejs.org/examples/textures/cube/Park2/posy.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negy.jpg',
      'https://threejs.org/examples/textures/cube/Park2/posz.jpg',
      'https://threejs.org/examples/textures/cube/Park2/negz.jpg'
    ]);
    scene.environment = envMap;
    
    // Key light with advanced shadow mapping
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    
    // Texture loaders for detailed materials
    const textureLoader = new THREE.TextureLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
    
    // Complex jar creation with imperfections
    function createDetailedJar() {
      // Base glass material with advanced properties
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        size: 0.003,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
      });
      
      const dustParticles = new THREE.Points(particleGeometry, particleMaterial);
      dustParticles.position.y = 0.75;
      scene.add(dustParticles);
      
      return { dustParticles, positions, velocities };
    }
    
    // Main scene initialization
    function initScene() {
      // Create detailed components
      const { jar, lid } = createDetailedJar();
      const spiderMixer = loadSpiderModel();
      const fogMesh = addVolumeFog();
      const { dustParticles, positions, velocities } = createRealisticDustParticles();
      
      // Clock for animations
      const clock = new THREE.Clock();
      
      // Animation loop
      function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Update camera jitter
        addCameraJitter();
        
        // Update orbit controls
        controls.update();
        
        // Update dust particle animation
        if (dustParticles) {
          const positionAttribute = dustParticles.geometry.getAttribute('position');
          
          for (let i = 0; i < positions.length; i += 3) {
            // More complex dust movement
            positions[i] += velocities[i] + Math.sin(elapsedTime * 0.5 + i) * 0.0005;
            positions[i + 1] += velocities[i + 1] + Math.cos(elapsedTime * 0.3 + i) * 0.0003;
            positions[i + 2] += velocities[i + 2] + Math.sin(elapsedTime * 0.4 + i) * 0.0004;
            
            // Constrain particles within jar
            if (positions[i + 1] > 1.45) positions[i + 1] = 0.05;
            if (positions[i + 1] < 0.05) positions[i + 1] = 1.45;
          }
          
          positionAttribute.array.set(positions);
          positionAttribute.needsUpdate = true;
          
          // Subtle rotation
          dustParticles.rotation.y += delta * 0.02;
        }
        
        // Update animation mixer if exists
        if (spiderMixer) {
          spiderMixer.update(delta);
        }
        
        // Render with composer for post-processing effects
        composer.render();
      }
      
      // Start animation
      animate();
      
      // Resize handler
      function handleResize() {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Update camera
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        // Update renderer and composer
        renderer.setSize(width, height);
        composer.setSize(width, height);
        
        // Adjust post-processing passes
        bloomPass.setSize(width, height);
      }
      
      // Add resize listener
      window.addEventListener('resize', handleResize);
      
      // Initial resize call
      handleResize();
      
      // Optional: Add audio ambiance
      function addAmbientAudio() {
        try {
          const audioListener = new THREE.AudioListener();
          camera.add(audioListener);
          
          const ambientSound = new THREE.Audio(audioListener);
          const audioLoader = new THREE.AudioLoader();
          
          audioLoader.load('subtle_ambient.mp3', function(buffer) {
            ambientSound.setBuffer(buffer);
            ambientSound.setLoop(true);
            ambientSound.setVolume(0.3);
            ambientSound.play();
          });
        } catch (error) {
          console.warn('Failed to load ambient audio', error);
        }
      }
      
      // Add UI controls
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
        
        fullscreenButton.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
              console.error(`Error entering fullscreen: ${err.message}`);
            });
          } else {
            document.exitFullscreen().catch(err => {
              console.error(`Error exiting fullscreen: ${err.message}`);
            });
          }
        });
        
        container.appendChild(fullscreenButton);
        
        // Optional: Add warning/interaction disclaimer
        const disclaimer = document.createElement('div');
        disclaimer.innerHTML = 'Caution: Photorealistic Spider Simulation';
        disclaimer.style.position = 'absolute';
        disclaimer.style.top = '10px';
        disclaimer.style.left = '10px';
        disclaimer.style.background = 'rgba(255,0,0,0.7)';
        disclaimer.style.color = 'white';
        disclaimer.style.padding = '10px';
        disclaimer.style.borderRadius = '5px';
        disclaimer.style.zIndex = '10';
        
        container.appendChild(disclaimer);
        
        // Auto-hide disclaimer
        setTimeout(() => {
          disclaimer.style.opacity = '0';
          disclaimer.style.transition = 'opacity 1s ease';
          setTimeout(() => disclaimer.remove(), 1000);
        }, 5000);
      }
      
      // Initialize additional features
      addSceneControls();
      addAmbientAudio();
      
      // Remove loading element
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.style.opacity = '0';
        loadingElement.style.transition = 'opacity 1s ease';
        setTimeout(() => {
          loadingElement.remove();
        }, 1000);
      }
      
      console.log('Hyperrealistic spider scene initialized successfully');
    }
    
    // Initialize the entire scene
    initScene();
    
  } catch (error) {
    console.error('Fatal error in scene creation:', error);
    container.innerHTML = '<p style="color:red;">Failed to create scene. Check console for details.</p>';
  }
});

        transmission: 0.95,
        thickness: 0.05,
        roughness: 0.1,
        metalness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 0.5,
        transparent: true,
        opacity: 0.95
      });
      
      // Jar geometry with more segments for subtle imperfections
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 128, 32, true);
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      
      // Add fingerprint/smudge overlay
      textureLoader.load('fingerprint_texture.jpg', (texture) => {
        const smudgeMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.2,
          blending: THREE.AdditiveBlending
        });
        const smudgeGeometry = new THREE.CylinderGeometry(0.81, 0.81, 1.51, 128, 32, true);
        const smudgeLayer = new THREE.Mesh(smudgeGeometry, smudgeMaterial);
        smudgeLayer.position.copy(jar.position);
        scene.add(smudgeLayer);
      });
      
      // Scratched metal lid
      const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 128);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.9,
        roughness: 0.4,
        envMap: envMap,
        normalScale: new THREE.Vector2(1, 1)
      });
      
      // Add lid scratches
      textureLoader.load('metal_scratches.jpg', (texture) => {
        lidMaterial.normalMap = texture;
        lidMaterial.needsUpdate = true;
      });
      
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 1.55, 0);
      lid.castShadow = true;
      scene.add(lid);
      
      scene.add(jar);
      
      return { jar, lid };
    }
    
    // Hyperrealistic spider loading with advanced animations
    function loadSpiderModel() {
      const gltfLoader = new THREE.GLTFLoader();
      
      // Optional Draco decoder
      if (THREE.DRACOLoader) {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        gltfLoader.setDRACOLoader(dracoLoader);
      }
      
      gltfLoader.load(
        'spider_with_animation.glb',
        (gltf) => {
          const spiderModel = gltf.scene;
          spiderModel.scale.set(1.2, 1.2, 1.2);
          
          // Advanced material enhancements
          spiderModel.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Improve material with environment map and micro details
              if (node.material) {
                node.material.envMap = envMap;
                node.material.roughness = 0.6;
                node.material.metalness = 0.2;
                node.material.needsUpdate = true;
              }
            }
          });
          
          // Positioning logic
          const boundingBox = new THREE.Box3().setFromObject(spiderModel);
          const size = new THREE.Vector3();
          boundingBox.getSize(size);
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          
          const minY = boundingBox.min.y;
          const heightOffset = -minY;
          
          spiderModel.position.set(
            -center.x,
            0 + heightOffset,
            -center.z
          );
          
          scene.add(spiderModel);
          
          // Animation mixer for subtle twitching
          const mixer = new THREE.AnimationMixer(spiderModel);
          const twitchClips = gltf.animations.filter(clip => 
            clip.name.toLowerCase().includes('twitch') || 
            clip.name.toLowerCase().includes('idle')
          );
          
          if (twitchClips.length > 0) {
            const twitchAction = mixer.clipAction(twitchClips[0]);
            twitchAction.setLoop(THREE.LoopOnce);
            twitchAction.clampWhenFinished = true;
            twitchAction.play();
            
            // Randomize twitching
            function randomTwitch() {
              if (Math.random() < 0.3) {
                twitchAction.reset();
                twitchAction.play();
              }
              setTimeout(randomTwitch, Math.random() * 5000 + 2000);
            }
            randomTwitch();
          }
          
          return mixer;
        },
        null,
        (error) => {
          console.error('Spider model loading failed', error);
          // Fallback procedural spider
          createProceduralSpider();
        }
      );
    }
    
    // Volumetric fog/light beams
    function addVolumeFog() {
      const fogGeometry = new THREE.BoxGeometry(2, 2, 2);
      const fogMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
      });
      const fogMesh = new THREE.Mesh(fogGeometry, fogMaterial);
      fogMesh.position.y = 0.75;
      scene.add(fogMesh);
      
      return fogMesh;
    }
    
    // Dust particles with more realistic movement
    function createRealisticDustParticles() {
      const particlesCount = 200;
      const positions = new Float32Array(particlesCount * 3);
      const velocities = new Float32Array(particlesCount * 3);
      
      for (let i = 0; i < particlesCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.random() * 1.4 + 0.05;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        
        // Random initial velocities
        velocities[i * 3] = (Math.random() - 0.5) * 0.001;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.0005;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.001;
      }
      
      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
