document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('arachnophobia-level2');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.2, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.6, 0);
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(3, 6, 3);
  scene.add(directionalLight);

  const loader = new THREE.GLTFLoader();
  loader.load(
    'https://cdn.jsdelivr.net/gh/mtthwnova66/vr-therapy-pitch@main/pc_spider.glb',
    function (gltf) {
      const model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error('Error loading Level 2 model:', error);
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
});

