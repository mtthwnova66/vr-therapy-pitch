function initLevel2() {
  const container = document.getElementById('arachnophobia-level2');
  container.innerHTML = '';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f7);

  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.5, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7.5);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const loader = new THREE.GLTFLoader();

  // Optional: Set DRACOLoader path if you're using compressed GLBs
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    'spider2.glb',
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(1.8, 1.8, 1.8);
      model.position.set(0, 0, 0);
      scene.add(model);

      animate();
    },
    undefined,
    function (error) {
      console.error('An error occurred loading spider2.glb:', error);
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

