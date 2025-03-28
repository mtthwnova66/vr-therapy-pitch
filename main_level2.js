function initLevel2() {
  const container = document.getElementById('arachnophobia-level2');
  container.innerHTML = '';

  // Create and show loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.textContent = 'Loading 3D Simulation...';
  loadingMessage.style.position = 'absolute';
  loadingMessage.style.top = '50%';
  loadingMessage.style.left = '50%';
  loadingMessage.style.transform = 'translate(-50%, -50%)';
  loadingMessage.style.color = '#555';
  loadingMessage.style.fontSize = '1rem';
  container.appendChild(loadingMessage);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f7);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 2.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const loader = new THREE.GLTFLoader();

  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
  loader.setDRACOLoader(dracoLoader);

  let spider;
  let clock = new THREE.Clock();

  loader.load(
    'spider2.glb',
    function (gltf) {
      spider = gltf.scene;
      spider.scale.set(1.8, 1.8, 1.8);
      spider.position.set(0, 0, 0);
      scene.add(spider);

      // Remove loading message
      container.removeChild(loadingMessage);

      animate();
    },
    function (xhr) {
      // Optional: update loading message with percent
      if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        loadingMessage.textContent = `Loading 3D Simulation... ${Math.round(percentComplete)}%`;
      }
    },
    function (error) {
      console.error('An error occurred loading spider2.glb:', error);
      loadingMessage.textContent = 'Failed to load model.';
    }
  );

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    if (spider) {
      spider.rotation.y = elapsed * 0.2;
      spider.position.y = Math.sin(elapsed * 1.5) * 0.05;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

