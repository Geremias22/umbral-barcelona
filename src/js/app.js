// src/js/app.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mountBrandPin } from '../three/brandPin.js';
import { Chip3D } from '../three/Chip3D.js';
import { initHome } from "./pages/home.js";
import { initMapPage } from "./pages/map.js";
import { initPlansPage } from "./pages/plans.js";
import { initFavsPage } from "./pages/favs.js";


const brandEl = document.getElementById('brand3d');
const page = document.body.dataset.page;
if (brandEl) mountBrandPin(brandEl);

function initCategoryIcons() {
  document.querySelectorAll('.chip3d').forEach(span => {
    const label = span.closest('label');

    // input asociado al label (robusto)
    let input = null;
    if (label?.htmlFor) input = document.getElementById(label.htmlFor);
    if (!input) input = label?.querySelector('input[type="checkbox"]');

    const chip = new Chip3D(span, {
      modelUrl: span.dataset.model,
      width: Number(span.dataset.width) || 56,
      height: Number(span.dataset.height) || 28,
      viewHeight: Number(span.dataset.viewheight) || 3.0,
      autoFit: true,
      fitBox: Number(span.dataset.fitbox) || 0.42,
      tiltXDeg: Number(span.dataset.tilt) || -12,
      yawBaseDeg: Number(span.dataset.yaw) || 20,
      yawAmpDeg: Number(span.dataset.amp) || 35,
      periodSec: Number(span.dataset.period) || 4.5,
      // colores por defecto (puedes sobreescribir con data-* si quieres)
    }).mount();

    if (input) {
      chip.setActive(input.checked);
      input.addEventListener('change', () => chip.setActive(input.checked));
    } else {
      console.warn('chip3d sin checkbox asociado:', span);
    }
  });
}

document.addEventListener('DOMContentLoaded', initCategoryIcons);







(async () => {
  try {
    if (page === "home") await initHome();
    if (page === "map") await initMapPage();
    if (page === "plans") await initPlansPage();
    if (page === "favs") await initFavsPage();
  } catch (e) {
    console.error(e);
  }
})();

// …tu código del canvas de prueba puede quedarse como está…
