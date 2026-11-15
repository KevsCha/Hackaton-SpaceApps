window.cambiarModelo = function(tipo) {
  // Verificamos si las variables de los modelos ya existen y están cargadas
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