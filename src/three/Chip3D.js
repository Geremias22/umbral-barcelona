// src/three/Chip3D.js
import * as THREE from 'three';
import { GLBModel } from './GLBModel.js';
import { configureRenderer, addIconLights, sunsetMinimal } from './style3d.js';

export class Chip3D {
  constructor(container, {
    modelUrl,

    // Tamaño del contenedor 
    width  = 60,  
    height = 20,  

    // sube este valor para que TODO se vea más pequeño
    viewHeight = 2,  

    // Encaje del modelo
    autoFit = true,    // recomendado
    fitBox  = 2,    // el modelo se escalará para caber en un cubo de este tamaño
    manualScale = 1.0, // usado solo si autoFit=false
    position = [0, 0, 0],

    // Look
    baseColor = 0xff8a3d,
    activeColor = 0xffa657,
    baseEmissive = 0xA00060,
    baseEmissiveIntensity = 0.18,
    activeEmissiveIntensity = 0.35,

    // Animación vaivén
    tiltXDeg = -20,
    yawBaseDeg = 20,
    yawAmpDeg  = 45,
    periodSec  = 10,
  } = {}) {
    this.el = container;
    this.opts = { modelUrl, width, height, viewHeight, autoFit, fitBox, manualScale, position,
      baseColor, activeColor, baseEmissive, baseEmissiveIntensity, activeEmissiveIntensity,
      tiltXDeg, yawBaseDeg, yawAmpDeg, periodSec
    };
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.model = null;
    this.materials = [];
    this.clock = new THREE.Clock();
    this.raf = 0;
  }

  mount() {
    // 1) Contenedor
    this.el.style.display = 'inline-block';
    this.el.style.width  = `${this.opts.width}px`;
    this.el.style.height = `${this.opts.height}px`;

    // 2) Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.el.innerHTML = '';
    this.el.appendChild(this.renderer.domElement);
    configureRenderer(this.renderer, { exposure: 1 });

    // 3) Escena + cámara ortográfica
    this.scene = new THREE.Scene();
    const halfH = this.opts.viewHeight / 2;        // alto-mundo/2
    const setCamera = () => {
      const w = this.el.clientWidth  || this.opts.width;
      const h = this.el.clientHeight || this.opts.height;
      const aspect = w / Math.max(h, 1);
      if (!this.camera) {
        this.camera = new THREE.OrthographicCamera(-halfH*aspect, halfH*aspect, halfH, -halfH, 0.1, 100);
        this.camera.position.set(1, 1, 2);
        this.camera.lookAt(1.2, -1, 0);
      } else {
        this.camera.left   = -halfH * aspect;
        this.camera.right  =  halfH * aspect;
        this.camera.top    =  halfH;
        this.camera.bottom = -halfH;
        this.camera.updateProjectionMatrix();
      }
      this.renderer.setSize(w, h, false);
    };
    setCamera();
    const onResize = () => setCamera();
    window.addEventListener('resize', onResize);

    addIconLights(this.scene);

    // 4) Placeholder
    const placeholder = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.22, 1),
      new THREE.MeshStandardMaterial({ color: this.opts.baseColor })
    );
    this.scene.add(placeholder);

    // 5) Cargar modelo
    const glb = new GLBModel(
      this.opts.modelUrl,
      new THREE.Vector3(...this.opts.position),
      new THREE.Vector3(this.opts.manualScale, this.opts.manualScale, this.opts.manualScale)
    );

    glb.load(this.scene).then(root => {
      this.model = root;

      // AutoFit al cubo 'fitBox'
      if (this.opts.autoFit) {
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const s = this.opts.fitBox / maxAxis;
        this.model.scale.multiplyScalar(s);

        // centrar en origen y aplicar position
        this.model.position.sub(center.multiplyScalar(s));
        this.model.position.add(new THREE.Vector3(...this.opts.position));
      }

      // Look
      const look = sunsetMinimal({
        color: this.opts.baseColor,
        emissive: this.opts.baseEmissive,
        metalness: 0.15,
        roughness: 0.35,
        emissiveIntensity: this.opts.baseEmissiveIntensity,
        shared: false
      });
      look.applyTo(this.model);

      this.model.traverse(o => { if (o.isMesh && o.material) this.materials.push(o.material); });

      // Pose inicial
      this._applyPose(0);
      this.scene.remove(placeholder);
    });

    // 6) Animación
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      const t = this.clock.getElapsedTime();
      this._applyPose(t);
      this.renderer.render(this.scene, this.camera);
    };
    loop();

    // Cleanup
    this._cleanup = () => {
      cancelAnimationFrame(this.raf);
      this.clock.stop();
      window.removeEventListener('resize', onResize);
      this.renderer.dispose();
      this.el.innerHTML = '';
    };

    return this;
  }

  _applyPose(t) {
    if (!this.model) return;
    const tiltX = THREE.MathUtils.degToRad(this.opts.tiltXDeg);
    const yaw0  = THREE.MathUtils.degToRad(this.opts.yawBaseDeg);
    const amp   = THREE.MathUtils.degToRad(this.opts.yawAmpDeg);
    const w     = (Math.PI * 2) / this.opts.periodSec;
    const yaw   = yaw0 + Math.sin(t * w) * amp;
    this.model.rotation.set(tiltX, yaw, 0);
  }

  setActive(isActive) {
    const color = new THREE.Color(isActive ? this.opts.activeColor : this.opts.baseColor);
    const emiI  = isActive ? this.opts.activeEmissiveIntensity : this.opts.baseEmissiveIntensity;
    this.materials.forEach(m => {
      if (m.color) m.color.copy(color);
      if ('emissiveIntensity' in m) m.emissiveIntensity = emiI;
      m.needsUpdate = true;
    });
  }

  destroy() { if (this._cleanup) this._cleanup(); }
}
