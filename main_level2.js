function initLevel2() {
  const container = document.getElementById('arachnophobia-level2');

  // Clear any previous rendering
  container.innerHTML = '';

  // Set up the scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f7);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 3);

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

  // Load GLB model
  const loader = new THREE.GLTFLoader();
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    'pc_spider.glb',
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error('An error occurred while loading the spider model:', error);
    }
  );

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}
