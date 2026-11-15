import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 1. Contenedor y Escena
const container = document.getElementById("canvas-container");
const scene = new THREE.Scene();

// 2. Cámara
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000,
);
camera.position.set(0, 0, 3.5);

// 3. Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// 4. Controles de órbita
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 6;
controls.maxPolarAngle = Math.PI / 1.5;

// 5. Iluminación realista estilo estudio
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 1.2);
frontLight.position.set(0, 5, 5);
scene.add(frontLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-5, 0, 2);
scene.add(fillLight);

const loader = new GLTFLoader();

// Variables globales para guardar ambos modelos
let esqueletoModel = null;
let ecorcheModel = null;

// ==========================================
// CARGAR MODELO 1: Esqueleto Humano
// ==========================================
loader.load(
  "../../src/models/esqueleto-humano/source/Esqueleto humano.glb",
  (gltf) => {
    esqueletoModel = gltf.scene;

    const box = new THREE.Box3().setFromObject(esqueletoModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    esqueletoModel.position.x = -center.x;
    esqueletoModel.position.y = -center.y - 0.9;
    esqueletoModel.position.z = -center.z ;

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.0 / maxDim;
    esqueletoModel.scale.set(scale, scale, scale);

    scene.add(esqueletoModel);
    console.log("Esqueleto cargado y visible.");
  },
  undefined,
  (error) => {
    console.error("Error cargando esqueleto:", error);
  },
);

// ==========================================
// CARGAR MODELO 2: Cuerpo Ecorché / Músculos
// ==========================================
loader.load(
  "../../src/models/male_full_body/male_full_body_ecorche.glb", // <--- Pon aquí la ruta real de tu segundo modelo .glb
  (gltf) => {
    ecorcheModel = gltf.scene;

    // 1. Posición por defecto (en el centro exacto del mundo 3D)
    ecorcheModel.position.set(0, 0.2, 0);

    // 2. Auto-escalado seguro (calcula el tamaño sin mover la posición con el centro fallido)
    const box = new THREE.Box3().setFromObject(ecorcheModel);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (maxDim > 0) {
      const scale = 2.0 / maxDim;
      ecorcheModel.scale.set(scale, scale, scale);
    }

    // Lo ocultamos por defecto al iniciar
    ecorcheModel.visible = false; 

    scene.add(ecorcheModel);
    console.log("Cuerpo Ecorché cargado en posición por defecto.");
  },
  undefined,
  (error) => { console.error("Error cargando el cuerpo:", error); }
);

// ==========================================
// FUNCIÓN PARA ALTERNAR ENTRE MODELOS
// ==========================================
window.cambiarModelo = function (tipo) {
  if (!esqueletoModel || !ecorcheModel) return; // Si aún se están cargando, no hace nada

  if (tipo === "esqueleto") {
    esqueletoModel.visible = true;
    ecorcheModel.visible = false;
    console.log("Mostrando: Esqueleto");
  } else if (tipo === "ecorche") {
    esqueletoModel.visible = false;
    ecorcheModel.visible = true;
    console.log("Mostrando: Cuerpo / Ecorché");
  }
};

// 7. Bucle de animación
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// 8. Responsividad
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

/*
"Esqueleto Humano" (https://skfb.ly/p8wYZ) by Guillermo Gutiérrez is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
"Male Full Body Ecorche" (https://skfb.ly/KFyA) by Diego Luján García is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
*/
