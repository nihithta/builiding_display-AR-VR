import * as THREE from 'three';
import { setSkySphere_JPG } from './helper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;
let object;
let intersectedObjects = [];
let currentlyHoveredObject = null;
let targetPosition = new THREE.Vector3(1.3, 1.4, 1.3);
let secondTargetPosition = new THREE.Vector3(2, 0, 0);
let isTransitioning = false;
let firstTransitionDone = false;
let secondTransitionDone = false;
let southeastObject = null;
const imagePath = './example.png';

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2.3, 1.9, 2.4);

renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 1.55;
const container = document.querySelector('.image-container');
renderer.setSize(container.clientWidth, container.clientHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

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
controls.update();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const objectNameDiv = document.getElementById('object-name');

const objectNames = {
  'Cube001': '12th Floor',
  'Cube002': '11th Floor',
  'Cube003': '10th Floor',
  'Cube004': '9th Floor',
  'Cube005': '8th Floor',
  'southeast': 'Southeast Region',
  'northeast': 'Northeast Region',
  'northwest': 'Northwest Region',
  'southwest': 'Southwest Region',
  'Cube036': 'Block 8B',
  'Cube038': 'Block 4B',
  'Cube039': 'Block 4A',
  'Cube040': 'Block 4C',
};

const loader = new GLTFLoader();
loader.load(
  '/final5.glb', 
  function (gltf) {
    object = gltf.scene;
    object.position.set(0, -1, 0);
    object.scale.set(1, 1, 1);
    scene.add(object);

    object.traverse((child) => {
      if (child.isMesh && Object.keys(objectNames).some(prefix => child.name.startsWith(prefix))) {
        child.material.metalness = 0;
        child.material.roughness = 0.5;
        intersectedObjects.push(child);
      }
      if (child.isMesh && child.name === 'southeast') {
        southeastObject = child;
      }
    });

    console.log("Objects to be detected:", intersectedObjects);
    
    document.getElementById('loading-percentage').style.display = 'none';
  },
  function (xhr) {
    const percentage = Math.round((xhr.loaded / xhr.total) * 100);
    document.getElementById('loading-percentage').innerText = `${percentage}%`;
  },
  function (error) {
    console.error('An error occurred loading the model:', error);
  }
);

window.addEventListener('mousemove', (event) => {
  const rect = renderer.domElement.getBoundingClientRect();

  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  objectNameDiv.style.left = `${event.clientX + window.scrollX}px`;
  objectNameDiv.style.top = `${event.clientY + window.scrollY}px`;
});

window.addEventListener('mousedown', function () {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(intersectedObjects, false);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    if (!firstTransitionDone) {
      isTransitioning = true;
      firstTransitionDone = true;
    } else if (clickedObject === southeastObject && !secondTransitionDone) {
      isTransitioning = true;
      secondTransitionDone = true;
      targetPosition.copy(secondTargetPosition);
    } else if (clickedObject.name.startsWith('Cube001')) {
      window.location.href = "https://kuula.co/share/5SFhP/collection/7KWkR?logo=1&info=1&fs=1&vr=0&zoom=1&thumbs=-1";
    }
  }
});

window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

function animate() {
  controls.update();

  if (isTransitioning) {
    camera.position.lerp(targetPosition, 0.05);

    if (camera.position.distanceTo(targetPosition) < 0.01) {
      camera.position.copy(targetPosition);
      isTransitioning = false;
    }
  }

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(intersectedObjects, false);

  if (intersects.length > 0) {
    const hoveredObject = intersects[0].object;
    const objectName = hoveredObject.name;

    const matchingPrefix = Object.keys(objectNames).find(prefix => objectName.startsWith(prefix));

    if (matchingPrefix) {
      if (currentlyHoveredObject !== hoveredObject) {
        currentlyHoveredObject = hoveredObject;

        objectNameDiv.style.display = 'block';
        objectNameDiv.innerText = objectNames[matchingPrefix];

        if (['Cube036', 'Cube038', 'Cube039', 'Cube040'].some(prefix => objectName.startsWith(prefix))) {
          objectNameDiv.style.fontSize = '24px';
        } else {
          objectNameDiv.style.fontSize = '16px';
        }
      }
    }
  } else {
    if (currentlyHoveredObject) {
      objectNameDiv.style.display = 'none';
      currentlyHoveredObject = null;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
