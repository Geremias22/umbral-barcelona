// src/three/brandPin.js
import * as THREE from 'three';
import { GLBModel } from './GLBModel.js';
import { configureRenderer, addIconLights, sunsetMinimal } from './style3d.js';

export function mountBrandPin(container) {
  if (!container) return;

  // Tamaño del contenedor (icono)
  container.style.display = 'inline-block';
  container.style.width = '40px';
  container.style.height = '40px';

  // Renderer transparente
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // >>> 1) Config global de renderer desde style3d
  configureRenderer(renderer, { exposure: 1 });

  // Escena + cámara ortográfica
  const scene = new THREE.Scene();
  const frustum = 1.4;
  const camera = new THREE.OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 100);
  camera.position.set(2.2, 2.2, 2.2);
  camera.lookAt(0, 0, 0);

  function resize() {
    const w = container.clientWidth || 40;
    const h = container.clientHeight || 40;
    renderer.setSize(w, h, false);

    const aspect = w / Math.max(h, 1);
    camera.left = -frustum * aspect;
    camera.right =  frustum * aspect;
    camera.top =    frustum;
    camera.bottom = -frustum;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // >>> 2) Luces coherentes desde style3d
  addIconLights(scene);

  // Placeholder mientras carga
  const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff8a3d })
  );
  scene.add(placeholder);

  let model = null;
  let raf;

  const loop = () => {
    raf = requestAnimationFrame(loop);
    (model || placeholder).rotation.y += 0.02;
    renderer.render(scene, camera);
  };
  loop();

  // Cargar el GLB
  const pinModel = new GLBModel('/models/icon_pin.glb', new THREE.Vector3(0,-1,0), new THREE.Vector3(0.5,0.5,0.5));
  pinModel.load(scene)
    .then((root) => {
      model = root;

      // >>> 3) Aplica el look a TODO el modelo con UNA línea
      sunsetMinimal({
        color: 0xff8a3d,          // puedes cambiar la paleta aquí si quieres
        emissive: 0xA00060,
        metalness: 0.15,
        roughness: 0.35,
        emissiveIntensity: 0.18,
        shared: true
      }).applyTo(model);

      model.rotation.set(0, 0.6, 0); // pose “bonita”
      scene.remove(placeholder);
      container.closest('.brand')?.classList.add('brand--3d');
    })
    .catch((err) => {
      console.error('[BrandPin] Error al cargar el pin:', err);
    });

  // Cleanup
  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    renderer.dispose();
    container.innerHTML = '';
  };
}
