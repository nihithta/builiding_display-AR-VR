import * as THREE from 'three';
import { setSkySphere_JPG } from './helper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;
let object;
const imagePath = './example.png';

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(1.8, 0, 0.4);

renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.LinearToneMapping; 
renderer.toneMappingExposure = 1.55; 
const container = document.querySelector('.image-container-cover');
renderer.setSize(container.clientWidth, container.clientHeight);
document.getElementById("container3Dcover").appendChild(renderer.domElement);

setSkySphere_JPG(scene, imagePath);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
hemisphereLight.position.set(0, 20, 0);
scene.add(hemisphereLight);

controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
camera.lookAt(controls.target);

const angleLimit = THREE.MathUtils.degToRad(10);
controls.minPolarAngle = Math.PI / 2 - angleLimit;
controls.maxPolarAngle = Math.PI / 2 + angleLimit; 

controls.minAzimuthAngle = -Infinity;  
controls.maxAzimuthAngle = Infinity;   

controls.update(); 

const loader = new GLTFLoader();
loader.load(
  '/final3.glb',
  function (gltf) {
    object = gltf.scene;
    object.position.set(0, -1.25, 0);
    object.scale.set(1, 1, 1);
    scene.add(object);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('An error occurred loading the model:', error);
  }
);

window.addEventListener('resize', () => {
  const container = document.querySelector('.image-container');
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
