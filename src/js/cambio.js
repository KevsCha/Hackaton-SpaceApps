// ==========================================
window.cambiarModelo = function(tipo) {
  if (!esqueletoModel || !ecorcheModel) {
    console.warn("Los modelos todavía se están cargando. Espera un momento.");
    return; 
  }

  if (tipo === 'esqueleto') {
    esqueletoModel.visible = true;
    ecorcheModel.visible = false;
    console.log("Mostrando: Esqueleto Humano");
  } else if (tipo === 'ecorche') {
    esqueletoModel.visible = false;
    ecorcheModel.visible = true;
    console.log("Mostrando: Sistema Muscular / Ecorché");
  }
};

// ==========================================
// 2. EVENTOS DE REDIRECCIÓN (Doble Clic / Doble Toque Táctil)
// ==========================================
const canvasContainer = document.getElementById("canvas-container");
let lastTap = 0;

// Doble toque para móviles (responsive)
canvasContainer.addEventListener("touchend", function(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 300 && tapLength > 0) {
        e.preventDefault(); // Evita zoom o comportamientos extraños
        window.location.href = "./cuarto.html";
    }
    
    lastTap = currentTime;
});

// Doble clic para PC / Escritorio
canvasContainer.addEventListener("dblclick", function(e) {
    window.location.href = "../../cuarto.html";
});

// ==========================================
// 3. EVENTO RESIZE (Adaptabilidad Responsive)
// ==========================================
window.addEventListener("resize", () => {
  const currentContainer = document.getElementById("canvas-container");
  if (!currentContainer || typeof camera === 'undefined' || typeof renderer === 'undefined') return;
  
  // Actualiza la proporción de la cámara para que el modelo no se deforme
  camera.aspect = currentContainer.clientWidth / currentContainer.clientHeight;
  camera.updateProjectionMatrix();

  // Redimensiona el renderizador al nuevo ancho y alto del contenedor HUD
  renderer.setSize(currentContainer.clientWidth, currentContainer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});