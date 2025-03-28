function initLevel2() {
  const container = document.getElementById('arachnophobia-level2');

  // Clear any previous rendering
  container.innerHTML = '';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f7);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 2.5); // Move camera closer

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7.5);
  scene.add(directionalLight);

  const loader = new THREE.GLTFLoader();
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    'pc_spider.glb',
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(2.5, 2.5, 2.5); // ENLARGE the spider
      model.position.set(0, 0, 0); // CENTER the spider
      scene.add(model);

      // Optional: subtle breathing motion
      const clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        model.rotation.y += 0.002; // slow spin
        model.position.y = Math.sin(t * 2) * 0.02; // breathing up/down
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    },
    undefined,
    function (error) {
      console.error('Error loading Level 2 spider:', error);
    }
  );
}

