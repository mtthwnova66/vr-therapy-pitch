// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing photorealistic scene + VR intro...');
  
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
    loadingElement.textContent = 'Loading photorealistic scene...';
    loadingElement.style.zIndex = '100';
    container.appendChild(loadingElement);
    
    // Create the scene
    const scene = new THREE.Scene();
    // Instead of environment map or plane background, use plain gray
    scene.background = new THREE.Color(0xa0a0a0);
    
    // Camera setup (start so that VR headset is clearly in front)
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 3.5); // Eye level, somewhat close
    
    // Renderer with physically-based settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
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
    
    // Clear the container and add the renderer
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    container.appendChild(loadingElement);
    
    // Make sure the renderer's canvas can fill the container
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    
    // OrbitControls (optional)
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0.6, 0);
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
    
    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 6, 3);
    keyLight.castShadow = true;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 4, -3);
    scene.add(fillLight);
    const rightLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rightLight.position.set(6, 2, 0);
    scene.add(rightLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);
    
    // Setup loading manager for tracking load progress
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
      const percent = Math.round((loaded / total) * 100);
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = `Loading scene assets... ${percent}%`;
      }
    };
    
    // Create two groups:
    // 1) vrGroup: the big VR headset
    // 2) envGroup: the table, jar, spider environment
    const vrGroup = new THREE.Group();
    scene.add(vrGroup);
    
    const envGroup = new THREE.Group();
    envGroup.visible = false; // hidden initially
    scene.add(envGroup);
    
    // Clock for animations
    const clock = new THREE.Clock();
    let mixer; // For spider animations
    
    // -------------------------------------------------------------------------
    // 1) LOAD VR HEADSET
    // -------------------------------------------------------------------------
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    if (typeof THREE.DRACOLoader !== 'undefined') {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
      gltfLoader.setDRACOLoader(dracoLoader);
    }
    
    let vrHeadset = null;
    gltfLoader.load(
      'oculus_quest_vr_headset.glb',
      function(gltf) {
        vrHeadset = gltf.scene;
        
        // Make the headset big and oriented so front is facing the user
        vrHeadset.scale.set(2, 2, 2);
        // You might need to tweak rotation to ensure the front is facing the camera
        // e.g. rotate 180 degrees around Y:
        vrHeadset.rotation.y = Math.PI;
        
        // Place at eye level in front of the jar scene
        vrHeadset.position.set(0, 1.2, 0);
        
        // Add to vrGroup
        vrGroup.add(vrHeadset);
      },
      undefined,
      function(error) {
        console.error('Error loading VR headset model:', error);
      }
    );
    
    // -------------------------------------------------------------------------
    // 2) BUILD TABLE, JAR, SPIDER EXACTLY AS IN YOUR ORIGINAL CODE
    //    BUT ADD THEM TO envGroup INSTEAD OF SCENE
    // -------------------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader();
    
    // We'll skip environment map usage for the table (to keep it simple),
    // but keep the same logic otherwise.
    const woodTextures = {
      map: null,
      normalMap: null,
      roughnessMap: null
    };
    let texturesLoaded = 0;
    const requiredTextures = 3;
    
    function createTableIfTexturesLoaded() {
      texturesLoaded++;
      if (texturesLoaded >= requiredTextures) {
        createTable();
      }
    }
    
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
    
    function createTable() {
      const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3);
      const tableMaterial = new THREE.MeshStandardMaterial({
        map: woodTextures.map,
        normalMap: woodTextures.normalMap,
        roughnessMap: woodTextures.roughnessMap,
        roughness: 0.8,
        metalness: 0.1
      });
      
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.y = -0.1;
      table.receiveShadow = true;
      envGroup.add(table);
      
      createJar();
    }
    
    function createJar() {
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 64, 4, false);
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.95,
        transparent: true,
        thickness: 0.05,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        ior: 1.5
      });
      
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.y = 0.75;
      jar.castShadow = true;
      jar.receiveShadow = true;
      envGroup.add(jar);
      
      const lidGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 64);
      const lidMaterial = new THREE.MeshStandardMaterial({
        color: 0x777777,
        metalness: 0.9,
        roughness: 0.1
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.set(0, 1.55, 0);
      lid.castShadow = true;
      envGroup.add(lid);
      
      loadSpiderModel();
    }
    
    function loadSpiderModel() {
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Loading spider model...';
      }
      
      const spiderLoader = new THREE.GLTFLoader(loadingManager);
      if (typeof THREE.DRACOLoader !== 'undefined') {
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        spiderLoader.setDRACOLoader(dracoLoader);
      }
      
      spiderLoader.load(
        'spider_with_animation.glb',
        function(gltf) {
          const spiderModel = gltf.scene;
          spiderModel.scale.set(1.5, 1.5, 1.5);
          
          const boundingBox = new THREE.Box3().setFromObject(spiderModel);
          const center = new THREE.Vector3();
          boundingBox.getCenter(center);
          const minY = boundingBox.min.y;
          const heightOffset = -minY;
          
          spiderModel.position.set(-center.x, heightOffset, -center.z);
          
          spiderModel.traverse(function(node) {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          
          envGroup.add(spiderModel);
          
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Spider model has ${gltf.animations.length} animations`);
            mixer = new THREE.AnimationMixer(spiderModel);
            const idleAnim = gltf.animations[0];
            const action = mixer.clipAction(idleAnim);
            action.timeScale = 0.5;
            action.play();
          }
          
          // Add dust particles, finalize
          addDustParticles();
          finalizeScene();
          
          // Loading done
          if (loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Scene loaded!';
            setTimeout(() => {
              loadingElement.style.opacity = '0';
              loadingElement.style.transition = 'opacity 1s ease';
              setTimeout(() => {
                if (loadingElement && loadingElement.parentNode) {
                  loadingElement.remove();
                }
              }, 1000);
            }, 1000);
          }
        },
        undefined,
        function(error) {
          console.error('Error loading spider model:', error);
          if (loadingElement && loadingElement.parentNode) {
            loadingElement.textContent = 'Failed to load spider model. Using fallback...';
          }
          createProceduralSpider();
        }
      );
    }
    
    function createProceduralSpider() {
      console.log('Creating procedural spider as fallback');
      const spider = new THREE.Group();
      const abdomenGeometry = new THREE.SphereGeometry(0.28, 32, 32);
      const spiderMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.2
      });
      const abdomen = new THREE.Mesh(abdomenGeometry, spiderMaterial);
      abdomen.castShadow = true;
      spider.add(abdomen);
      
      const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
      const head = new THREE.Mesh(headGeometry, spiderMaterial);
      head.position.set(0, 0, 0.25);
      head.castShadow = true;
      spider.add(head);
      
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.025, 0.015, 0.5, 8);
        const leg = new THREE.Mesh(legGeometry, spiderMaterial);
        const angle = (Math.PI / 4) * (i % 4);
        const isLeftSide = i < 4;
        const sideSign = isLeftSide ? 1 : -1;
        leg.position.set(Math.cos(angle)*0.25*sideSign, 0, Math.sin(angle)*0.25);
        leg.rotation.z = sideSign * Math.PI / 4;
        leg.rotation.y = angle;
        leg.castShadow = true;
        spider.add(leg);
      }
      
      spider.position.y = 0.05;
      envGroup.add(spider);
      addDustParticles();
      finalizeScene();
      
      if (loadingElement && loadingElement.parentNode) {
        loadingElement.textContent = 'Scene loaded (fallback spider)';
        setTimeout(() => {
          loadingElement.style.opacity = '0';
          loadingElement.style.transition = 'opacity 1s ease';
          setTimeout(() => {
            if (loadingElement && loadingElement.parentNode) {
              loadingElement.remove();
            }
          }, 1000);
        }, 1000);
      }
    }
    
    // Dust particles
    function addDustParticles() {
      const particlesCount = 100;
      const positions = new Float32Array(particlesCount * 3);
      const particleGeometry = new THREE.BufferGeometry();
      
      for (let i = 0; i < particlesCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.7;
        positions[i*3]   = Math.cos(angle)*radius;
        positions[i*3+1] = Math.random()*1.4 + 0.05;
        positions[i*3+2] = Math.sin(angle)*radius;
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
      particles.position.y = 0.75;
      envGroup.add(particles);
      window.dustParticles = particles;
    }
    
    // Camera transition variables
    const transitionDelay = 3;      // seconds before we start zooming in
    const transitionDuration = 5;   // seconds to complete the camera move
    let transitionStarted = false;
    let transitionStartTime = 0;
    const initialCamPos = camera.position.clone();
    let targetCamPos = null;
    let vrReady = false;
    
    // Poll for VR readiness (the model might load asynchronously)
    const checkVRInterval = setInterval(() => {
      if (vrHeadset) {
        // We assume the left eye is at local offset (-0.15, 1.65, 0.1)
        const localEye = new THREE.Vector3(-0.15, 1.65, 0.1);
        vrHeadset.updateMatrixWorld();
        targetCamPos = localEye.applyMatrix4(vrHeadset.matrixWorld);
        vrReady = true;
        clearInterval(checkVRInterval);
        console.log('VR headset ready, targetCamPos:', targetCamPos);
      }
    }, 200);
    
    // Final scene setup & animate
    function finalizeScene() {
      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        
        // If there's a spider animation, update it
        if (mixer) {
          mixer.update(delta);
        }
        
        // Dust particle floating
        if (window.dustParticles) {
          const positions = window.dustParticles.geometry.attributes.position.array;
          for (let i = 0; i < positions.length; i+=3) {
            positions[i+1] += Math.sin((clock.getElapsedTime()+i)*0.1)*0.0005;
            if (positions[i+1] > 1.45) positions[i+1] = 0.05;
            if (positions[i+1] < 0.05) positions[i+1] = 1.45;
          }
          window.dustParticles.geometry.attributes.position.needsUpdate = true;
          window.dustParticles.rotation.y += delta*0.01;
        }
        
        // Slowly rotate the VR headset so it’s obviously in front
        if (vrHeadset) {
          vrHeadset.rotation.y += 0.005;
        }
        
        // After transitionDelay seconds, start the camera move if VR is ready
        const elapsed = clock.getElapsedTime();
        if (!transitionStarted && elapsed > transitionDelay && vrReady) {
          transitionStarted = true;
          transitionStartTime = elapsed;
          console.log('Camera transition started');
        }
        
        // Perform the camera interpolation
        if (transitionStarted && targetCamPos) {
          const t = Math.min((elapsed - transitionStartTime)/transitionDuration, 1);
          camera.position.lerpVectors(initialCamPos, targetCamPos, t);
          // Aim camera at the jar center
          camera.lookAt(0, 0.75, 0);
          
          // Once done, fade out the VR group and reveal the environment
          if (t === 1 && vrHeadset) {
            vrGroup.traverse(child => {
              if (child.material) {
                child.material.transparent = true;
                child.material.opacity = THREE.MathUtils.lerp(child.material.opacity || 1, 0, 0.02);
              }
            });
            envGroup.visible = true;
          }
        }
        
        if (controls) controls.update();
        renderer.render(scene, camera);
      }
      animate();
      
      // Add fullscreen & rotate buttons
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
      container.appendChild(fullscreenButton);
      
      fullscreenButton.addEventListener('click', function() {
        if (!document.fullscreenElement) {
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.margin = '0';
          container.style.padding = '0';
          container.style.overflow = 'hidden';
          container.style.position = 'relative';
          
          try {
            container.requestFullscreen().catch(err => {
              console.error('Error enabling fullscreen:', err);
            });
          } catch (e) {
            console.error('Fullscreen not supported', e);
          }
          setTimeout(() => {
            handleResize();
          }, 100);
        } else {
          document.exitFullscreen().catch(err => {
            console.error('Error exiting fullscreen:', err);
          });
        }
      });
      
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
      container.appendChild(rotateButton);
      
      rotateButton.addEventListener('click', function() {
        if (controls) {
          controls.autoRotate = !controls.autoRotate;
          rotateButton.style.background = controls.autoRotate ? 'rgba(0,113,227,0.7)' : 'rgba(255,255,255,0.7)';
          rotateButton.style.color = controls.autoRotate ? '#fff' : '#000';
        }
      });
      
      // Optionally add instructions
      const instructions = document.createElement('div');
      instructions.style.position = 'absolute';
      instructions.style.top = '10px';
      instructions.style.left = '10px';
      instructions.style.padding = '10px';
      instructions.style.background = 'rgba(255,255,255,0.7)';
      instructions.style.borderRadius = '5px';
      instructions.style.fontSize = '14px';
      instructions.style.zIndex = '10';
      instructions.innerHTML = 'VR Headset in front<br>Click & drag to rotate<br>Scroll to zoom';
      container.appendChild(instructions);
      setTimeout(() => {
        instructions.style.opacity = '0';
        instructions.style.transition = 'opacity 1s ease';
      }, 5000);
      
      // Handle resizing
      function handleResize() {
        let width = container.clientWidth;
        let height = container.clientHeight;
        
        if (document.fullscreenElement === container) {
          width = window.innerWidth;
          height = window.innerHeight;
          renderer.domElement.style.width = '100vw';
          renderer.domElement.style.height = '100vh';
          document.body.style.overflow = 'hidden';
        } else {
          renderer.domElement.style.width = '100%';
          renderer.domElement.style.height = '100%';
          document.body.style.overflow = '';
        }
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        console.log(`Resized to: ${width}x${height}`);
      }
      
      window.addEventListener('resize', handleResize);
      document.addEventListener('fullscreenchange', handleResize);
      document.addEventListener('webkitfullscreenchange', handleResize);
      document.addEventListener('mozfullscreenchange', handleResize);
      document.addEventListener('MSFullscreenChange', handleResize);
      
      // Initial size
      handleResize();
      console.log('Scene setup completed, now animating...');
    }
    
    // If textures fail to load, proceed with fallback after 5s
    setTimeout(() => {
      if (texturesLoaded < requiredTextures) {
        console.warn('Not all textures loaded in time, proceeding with fallback');
        woodTextures.map = woodTextures.map || new THREE.Texture();
        woodTextures.normalMap = woodTextures.normalMap || new THREE.Texture();
        woodTextures.roughnessMap = woodTextures.roughnessMap || new THREE.Texture();
        createTable();
      }
    }, 5000);
    
  } catch (error) {
    console.error('Error creating photorealistic scene:', error);
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Error creating 3D scene. Please check the browser console for details.</p>';
  }
});
