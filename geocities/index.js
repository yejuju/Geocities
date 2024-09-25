import * as THREE from "three";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/OBJLoader.js";

// Enable transparency in the renderer and set the renderer size to window size
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);  // Full window size
renderer.setClearColor(0x000000, 0);  // Transparent background
document.body.appendChild(renderer.domElement);

// Define the dimensions of the orthographic view
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 50;  // You can adjust this value for zoom in/out

// OrthographicCamera(left, right, top, bottom, near, far)
const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,  // left
    (frustumSize * aspect) / 2,   // right
    frustumSize / 2,              // top
    frustumSize / -2,             // bottom
    0.1,                          // near clipping plane
    1000                          // far clipping plane
);

camera.position.z = 10;  // Set the camera's distance from the scene

// Create a scene
const scene = new THREE.Scene();

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 5, 5);  // Position the light to illuminate the model
scene.add(directionalLight);

// Add ambient light for softer illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 1);  // Add soft ambient light
scene.add(ambientLight);

// Load texture using TextureLoader
const textureLoader = new THREE.TextureLoader();
const appleTexture = textureLoader.load('./images/texture/blue.jpeg');

// Load apple-1.obj using OBJLoader
const loader = new OBJLoader();
let appleModel;

loader.load('./3dobject/apple-1.obj', function (object) {
    appleModel = object;

    // Apply the texture to the model's material
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                map: appleTexture  // Apply the loaded texture to the material
            });
        }
    });

    console.log("Model loaded:", appleModel);
    scene.add(appleModel);
    appleModel.position.set(-50, 0, 0);  // Set initial position (X-axis starts at -50, Y and Z are 0)
    appleModel.scale.set(0.08, 0.08, 0.08);  // Scale down the model
},
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');  // Progress logging
    },
    function (error) {
        console.error('An error happened during loading the model:', error);
    });

let speedX = 0.05;  // Speed of movement along the X-axis

function animate(t = 0) {
    requestAnimationFrame(animate);

    if (appleModel) {
        // Move the object along the X-axis only, keep Y and Z constant
        appleModel.position.x += speedX;

        // When the object reaches the end (right boundary), reset to start (left boundary)
        if (appleModel.position.x > 50) {
            appleModel.position.x = -50;  // Loop back to the left
        }

        // Optional: Rotate the object for additional effect
        appleModel.rotation.y += 0.01;  // Rotation on the Y-axis (optional)
        appleModel.rotation.x += 0.005;  // Optional: Rotation on the X-axis
    }

    renderer.render(scene, camera);
}

// Start the animation loop
animate();

// Handle window resizing dynamically AFTER the camera is defined
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Resize the renderer to match the new window size
    renderer.setSize(width, height);

    // Update the camera aspect ratio and the camera's projection matrix
    camera.aspect = width / height;
    camera.left = (-frustumSize * camera.aspect) / 2;
    camera.right = (frustumSize * camera.aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
});
