// src/three/icons/iceCreamChip.js
import { Chip3D } from '../Chip3D.js';

export function mountIceCreamChip(el) {
  if (!el) return null;

  return new Chip3D(el, {
    modelUrl: '/models/icon_helado.glb',
    // Contenedor (chip horizontal)
    width: 56,
    height: 28,
    // El helado suele ser “alto”; subimos viewHeight para verlo más pequeño
    viewHeight: 3.2,
    // Encaje uniforme
    autoFit: true,
    fitBox: 0.42,        // reduce si aún se ve grande (0.38, 0.36…)
    // Pose/animación
    tiltXDeg: -12,       // ligera inclinación hacia atrás
    yawBaseDeg: 20,
    yawAmpDeg: 35,
    periodSec: 4.5,
    // Look
    baseColor: 0xff8a3d,
    activeColor: 0xffb07a,
    baseEmissive: 0xA00060,
    baseEmissiveIntensity: 0.18,
    activeEmissiveIntensity: 0.35
  }).mount();
}
