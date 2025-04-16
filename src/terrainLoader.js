import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Load heightmap from localStorage
const base64 = localStorage.getItem('terrain-heightmap');
if (!base64) {
  alert('No terrain data found. Please generate terrain from the sketch view first.');
  throw new Error('Missing terrain in localStorage');
}

// Setup scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaddee);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 80, 120);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.AmbientLight(0x888888));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(50, 100, 100);
scene.add(light);

// Load heightmap as image texture from base64
const heightTexture = new Image();
heightTexture.src = base64;
heightTexture.onload = () => {
  const map = new THREE.CanvasTexture(heightTexture);
  map.minFilter = THREE.LinearFilter;

  const geometry = new THREE.PlaneGeometry(100, 100, 199, 199);

  // Load pixel data from canvas
  const canvas = document.createElement('canvas');
  canvas.width = heightTexture.width;
  canvas.height = heightTexture.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(heightTexture, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Build height array
  const heights = [];
  for (let i = 0; i < imageData.length; i += 4) {
    heights.push(imageData[i] / 255); // R channel = grayscale
  }

  // Displace vertices based on height
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    geometry.attributes.position.setZ(i, heights[i] * 20);
  }
  geometry.computeVertexNormals();

  // Texture blend: assign UVs to reuse the same textures
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: false,
    displacementScale: 0,
  });

  // Use vertex color for basic procedural mapping
  const colors = [];
  for (let i = 0; i < heights.length; i++) {
    const h = heights[i];
    if (h < 0.3) colors.push(0.2, 0.4, 0.9); // water
    else if (h < 0.75) colors.push(0.2, 0.8, 0.3); // grass
    else if (h < 0.9) colors.push(0.5, 0.5, 0.5); // hill
    else colors.push(1.0, 1.0, 1.0); // mountain
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);

  animate();
};

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
