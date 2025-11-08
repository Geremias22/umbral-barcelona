import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

(() => {
  const canvas = document.getElementById('pin3d');
  if (!canvas) return;

  let scene, camera, renderer, cube, controls;
  init();

  function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 400;

    camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.set(5,5,5);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.setSize(w, h, false);

    const geometry = new THREE.BoxGeometry(2,2,2);
    const material = new THREE.MeshLambertMaterial({ color: 0x44aa88 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    addLights();
    setupOrbitControls();

    window.addEventListener('resize', onResize);
    animate();
  }

  function addLights(){
    scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10,10,5);
    scene.add(dir);
  }

  function setupOrbitControls(){
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
  }

  function onResize(){
    const w = canvas.clientWidth || 600;
    const h = canvas.clientHeight || 400;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }

  function animate(){
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    controls.update();
    renderer.render(scene, camera);
  }
})();
