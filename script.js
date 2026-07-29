// The render loop updates the scene once per frame.
// Three.js recalculates object transforms, camera movement, and lighting,
// then draws the next image to the canvas so the view feels animated.

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
// --- SCENE SETUP ---
const canvas = document.querySelector('#scene-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);
scene.fog = new THREE.Fog(0x121212, 6, 18);

// --- RENDERER ---
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x121212, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --- CAMERA ---
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.1, 6.5);

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(-3, 4, 4);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.2);
fillLight.position.set(3, 1.5, -2);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xffffff, 10, 10, 2);
rimLight.position.set(-2.2, 1.4, 3.2);
scene.add(rimLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111122, 0.55);
scene.add(hemiLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(4, 64),
  new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.9, metalness: 0.03 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.1;
floor.receiveShadow = true;
scene.add(floor);

// --- MODEL & FALLBACK MESH ---
const modelGroup = new THREE.Group();
scene.add(modelGroup);

// Create torus knot as temporary placeholder until model loads
const fallbackMesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.55, 0.16, 120, 16),
  new THREE.MeshStandardMaterial({ color: 0xf2efe8, metalness: 0.2, roughness: 0.25 })
);
fallbackMesh.position.set(0, 0, 0);
fallbackMesh.castShadow = true;
fallbackMesh.receiveShadow = true;
scene.add(fallbackMesh);

const loader = new GLTFLoader();

const prepareMaterial = (material) => {
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach(prepareMaterial);
    return;
  }

  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.alphaTest = 0;
  material.side = THREE.FrontSide;

  if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
    material.roughness = Math.max(material.roughness, 0.2);
    material.metalness = Math.min(material.metalness, 0.35);
    material.envMapIntensity = 1.2;
  }
};

const lensMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf5f7fb,
  metalness: 0.02,
  roughness: 0.02,
  transmission: 0.98,
  thickness: 0.055,
  transparent: true,
  opacity: 0.99,
  ior: 1.55,
  envMapIntensity: 2.2,
  clearcoat: 1.0,
  clearcoatRoughness: 0.01,
  sheen: 0.4,
  sheenColor: new THREE.Color(0xffffff),
});

// Helper function to safely attempt loading model paths
const loadModel = (url, fallbackUrl = null) => {
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            prepareMaterial(child.material);
          }

          if (child.name.toLowerCase().includes('lens') || child.name.toLowerCase().includes('glass')) {
            child.material = lensMaterial;
            child.scale.set(1.01, 1.01, 1.01);
          }
        }
      });

      // Reset position and center model geometry
      model.position.set(0, 0, 0);
      model.scale.setScalar(1);

      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Auto-scale to fit scene
      const size = box.getSize(new THREE.Vector3());
      const maxDimension = Math.max(size.x, size.y, size.z);
      const fitScale = 1.7 / maxDimension;
      model.scale.setScalar(fitScale);

      modelGroup.add(model);
      
      // Remove placeholder mesh once loaded
      scene.remove(fallbackMesh);
      modelGroup.position.y = 0.05;
      console.log('Model loaded successfully:', url);
    },
    undefined,
    (error) => {
      console.warn(`Failed to load model from ${url}:`, error);

      // Try fallback URL if available
      if (fallbackUrl) {
        console.log(`Attempting fallback model at ${fallbackUrl}...`);
        loadModel(fallbackUrl, null);
      } else {
        console.warn('Fallback failed or unavailable. Showing placeholder knot.');
      }
    }
  );
};

// Primary model path with fallback option
loadModel('./Assets/CanonModel.glb', './models/camera.glb');

// --- CONTROLS ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = false;
controls.target.set(0, 0.15, 0);
controls.minPolarAngle = 0.35;
controls.maxPolarAngle = Math.PI - 0.35;
controls.update();

let isDragging = false;

const handleDragStart = () => {
  isDragging = true;
};

const handleDragEnd = () => {
  isDragging = false;
};

renderer.domElement.addEventListener('pointerdown', handleDragStart);
renderer.domElement.addEventListener('pointerup', handleDragEnd);
renderer.domElement.addEventListener('pointerleave', handleDragEnd);
window.addEventListener('pointerup', handleDragEnd);
window.addEventListener('blur', handleDragEnd);

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // Slow idle rotation when user isn't dragging
  if (!isDragging) {
    modelGroup.rotation.y += 0.003;
    if (fallbackMesh.parent) {
      fallbackMesh.rotation.y += 0.008;
      fallbackMesh.rotation.x += 0.004;
    }
  }

  // Floating effect
  const floatOffset = Math.sin(elapsedTime * 1.2) * 0.08;
  modelGroup.position.y = 0.05 + floatOffset;
  fallbackMesh.position.y = 0.05 + floatOffset;

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// --- RESIZE HANDLER ---
function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

window.addEventListener('resize', handleResize);