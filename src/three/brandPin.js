// src/three/brandPin.js
import * as THREE from 'three';
import { GLBModel } from './GLBModel.js';

export function mountBrandPin(container) {
  if (!container) return;

  console.log('[BrandPin] init');

  // Aseguramos que el contenedor tenga algo de tamaño visible
  container.style.display = 'inline-block';
  container.style.width = '40px';
  container.style.height = '40px';

  // Renderer transparente
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Escena + cámara ortográfica (ideal para iconos)
  const scene = new THREE.Scene();
  const frustum = 1.4;
  const camera = new THREE.OrthographicCamera(
    -frustum, frustum,
    frustum, -frustum,
    0.1, 100
  );
  camera.position.set(2.2, 2.2, 2.2);
  camera.lookAt(0, 0, 0);

  function resize() {
    const w = container.clientWidth || 40;
    const h = container.clientHeight || 40;
    renderer.setSize(w, h, false);

    const aspect = w / Math.max(h, 1);
    camera.left   = -frustum * aspect;
    camera.right  =  frustum * aspect;
    camera.top    =  frustum;
    camera.bottom = -frustum;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Luces
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 3, 4);
  scene.add(dir);

  // Placeholder (cubo) mientras carga el pin
  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff8a3d })
  );
  scene.add(placeholder);

  let model = null;
  let raf;

  // Bucle de render (gira el cubo hasta que tengamos el modelo)
  const loop = () => {
    raf = requestAnimationFrame(loop);

    if (model) {
      model.rotation.y += 0.03;
      placeholder.visible = false;
    } else {
      placeholder.rotation.y += 0.03;
    }

    renderer.render(scene, camera);
  };
  loop();

  // -----------------------------
  // CARGA DEL PIN CON GLBModel
  // -----------------------------

  // Con Vite:
  // - si el archivo está en public/models/icon_pin.glb,
  //   la URL pública es "/models/icon_pin.glb"
  const pinModel = new GLBModel(
    '/models/icon_pin.glb',                 // ruta pública del modelo
    new THREE.Vector3(0, -1, 0),            // centro
    new THREE.Vector3(0.5, 0.5, 0.5)    // escala (ajústala si se ve muy pequeño/grande)
  );

  pinModel
    .load(scene)
    .then((model3DCarregat) => {
      console.log('[BrandPin] Pin cargado con GLBModel:', model3DCarregat);

      model = model3DCarregat;
      model.rotation.set(0.2, 0.6, 0);     // inclinación “bonita”

      scene.remove(placeholder);
      container.closest('.brand')?.classList.add('brand--3d');
    })
    .catch((error) => {
      console.error('[BrandPin] Error cargando el pin 3D:', error);
      // Si falla, se queda el cubo + el SVG
    });

  // Cleanup opcional
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    renderer.dispose();
    container.innerHTML = '';
  };
}
