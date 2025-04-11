import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaddee);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 80, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 100);
scene.add(light);

// Load heightmap and generate terrain
const loader = new THREE.TextureLoader();
loader.load('/assets/heightmap.png', texture => {
  const geometry = new THREE.PlaneGeometry(100, 100, 199, 199);
  const material = new THREE.MeshStandardMaterial({
    color: 0x88cc88,
    displacementMap: texture,
    displacementScale: 20,
    flatShading: true,
    side: THREE.DoubleSide
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);

  animate();
}, undefined, err => {
  console.error('Could not load heightmap:', err);
});

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
