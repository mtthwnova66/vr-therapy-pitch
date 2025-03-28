// Wait for the DOM to be fully loaded
function initLevel2() {
  console.log('Initializing Level 2 scene...');

  const container = document.getElementById('arachnophobia-level2');
  if (!container) {
    console.error('Container not found: #arachnophobia-level2');
    return;
  }

  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined. Make sure Three.js is loaded.');
    container.innerHTML = '<p style="padding: 20px; text-align: center;">Failed to load 3D libraries. Please check your browser settings or try a different browser.</p>';
    return;
  }

  // Clear the container first
  container.innerHTML = '';

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

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.2, 2.0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.6, 0);
  controls.enableDamping = true;
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(3, 6, 3);
  scene.add(directionalLight);

  const tableGeometry = new THREE.BoxGeometry(5, 0.2, 3);
  const tableMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.y = -0.1;
  scene.add(table);

  const loader = new THREE.GLTFLoader();
  loader.load(
    'spider2.glb',
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      model.position.set(0, 0.2, 0);
      model.traverse(node => {
        if (node.isMesh) {
          node.castShadow = true;
        }
      });
      scene.add(model);

      let mixer;
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(gltf.animations[0]);
        action.timeScale = 0.5;
        action.play();
      }

      const clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        if (mixer) mixer.update(clock.getDelta());
        controls.update();
        renderer.render(scene, camera);
      }
      animate();

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
    function (error) {
      console.error('Error loading spider2.glb', error);
      loadingElement.textContent = 'Failed to load spider model.';
    }
  );

  // Resize logic
  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', handleResize);
  handleResize();
}
// end of initLevel2
