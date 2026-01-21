// src/three/style3d.js
import * as THREE from 'three';

/* Renderer coherente (color + tone mapping) */
export function configureRenderer(renderer, { exposure = 1 } = {}) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
}

/* Luces para iconos/mini 3D (no duplica si lo llamas varias veces) */
export function addIconLights(scene, { hemi = 0.6, dir = 0.8, rim = 0.4 } = {}) {
  if (scene.userData.__iconLights) return;
  scene.userData.__iconLights = true;

  const amb = new THREE.AmbientLight(0xffffff, 0.9);
  const h = new THREE.HemisphereLight(0xffe0cc, 0x101018, hemi);
  const d = new THREE.DirectionalLight(0xffffff, dir);
  d.position.set(2, 3, 4);
  const r = new THREE.PointLight(0xff1493, rim, 2.5);
  r.position.set(-1.2, 0.8, 1.0);

  scene.add(amb, h, d, r);
}

/* Utilidad interna: aplica material a todos los Mesh */
function applyMaterialToModel(root, materialFactory) {
  root.traverse(o => {
    if (!o.isMesh) return;
    const mat = materialFactory(o);
    if (mat) o.material = mat;
    if (o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals();
    o.castShadow = o.receiveShadow = false;
  });
}

/* Look PBR “Sunset Minimal” */
export function sunsetMinimal({
  color = 0xff8a3d,        // naranja
  emissive = 0xA00060,     // magenta suave
  metalness = 0.15,
  roughness = 0.35,
  emissiveIntensity = 0.18,
  shared = true
} = {}) {
  const base = new THREE.MeshStandardMaterial({
    color, metalness, roughness, emissive, emissiveIntensity,
  });
  return {
    applyTo(root) {
      applyMaterialToModel(root, () => (shared ? base : base.clone()));
    }
  };
}
