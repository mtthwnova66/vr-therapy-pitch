// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing Three.js scene...');
  
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
  
  // Start with a very simple scene to ensure basic rendering works
  try {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    // Clear the container (removing loading message)
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    // Add a simple cube to verify rendering works
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    // Simple animation function
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
    
    // Add a success message
    console.log('Basic cube rendering successfully!');
    
    // If the cube renders successfully, we'll build the full spider scene
    setTimeout(buildFullScene, 2000);
    
    // Full spider scene function
    function buildFullScene() {
      console.log('Building full spider scene...');
      
      // Remove the cube
      scene.remove(cube);
      
      // Camera repositioning
      camera.position.set(0, 1.5, 3);
      camera.lookAt(0, 0.75, 0);
      
      // Add orbit controls if available
      let controls;
      if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.75, 0);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.update();
      } else {
        console.warn('OrbitControls not available');
      }
      
      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 10, 5);
      scene.add(dirLight);
      
      // Create a ground
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0;
      scene.add(ground);
      
      // Create jar
      const jarGeometry = new THREE.CylinderGeometry(0.8, 0.8, 1.5, 32, 1, true);
      const jarMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      jar.position.y = 0.75;
      scene.add(jar);
      
      // Create lid
      const lidGeometry = new THREE.CircleGeometry(0.8, 32);
      const lidMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.rotation.x = -Math.PI / 2;
      lid.position.set(0, 1.5, 0);
      scene.add(lid);
      
      // Create spider
      const spider = new THREE.Group();
      
      // Spider body
      const bodyGeometry = new THREE.SphereGeometry(0.2, 16, 16);
      const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.2;
      spider.add(body);
      
      // Spider head
      const headGeometry = new THREE.SphereGeometry(0.12, 16, 16);
      const headMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.set(0, 0.2, 0.15);
      spider.add(head);
      
      // Spider legs
      for (let i = 0; i < 8; i++) {
        const legGeometry = new THREE.CylinderGeometry(0.02, 0.01, 0.5, 8);
        const legMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        
        const angle = (Math.PI / 4) * (i % 4);
        const xDir = Math.cos(angle) * 0.25;
        const zDir = Math.sin(angle) * 0.25;
        
        leg.position.set(xDir, 0.2, zDir);
        leg.rotation.z = (i < 4 ? 0.8 : -0.8);
        leg.rotation.y = angle + (i < 4 ? 0 : Math.PI);
        
        spider.add(leg);
      }
      
      // Position spider in jar
      spider.position.y = 0.4;
      scene.add(spider);
      
      // Update animation function to include spider movement
      function animateSpider() {
        requestAnimationFrame(animateSpider);
        
        // Simple animation for the spider
        const time = Date.now() * 0.001;
        spider.rotation.y = Math.sin(time) * 0.1;
        spider.position.y = 0.4 + Math.sin(time * 1.5) * 0.05;
        
        // Update controls if they exist
        if (controls) controls.update();
        
        // Render the scene
        renderer.render(scene, camera);
      }
      
      // Start the new animation function
      animateSpider();
      
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
      
      console.log('Full spider scene built successfully!');
    }
    
  } catch (error) {
    console.error('Error creating Three.js scene:', error);
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Error creating 3D scene. Please check the browser console for details.</p>';
  }
});
