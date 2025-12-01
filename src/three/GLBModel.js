// src/three/GLBModel.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLBModel {
  constructor(
    url,
    position = new THREE.Vector3(0, 0, 0),
    scale = new THREE.Vector3(1, 1, 1)
  ) {
    this.url = url;
    this.position = position;
    this.scale = scale;
    this.model = null; // Placeholder para el glTF cargado
  }

  load(scene) {
    const loader = new GLTFLoader();

    return new Promise((resolve, reject) => {
      loader.load(
        this.url,
        (gltf) => {
          this.model = gltf.scene;
          this.model.position.copy(this.position);
          this.model.scale.copy(this.scale);
          scene.add(this.model);

          resolve(this.model);
        },
        (xhr) => {
          if (xhr.total) {
            console.log(
              `Model 3D ${this.url}: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% carregat`
            );
          }
        },
        (error) => {
          console.error(`Error carregant el model 3D ${this.url}:`, error);
          reject(error);
        }
      );
    });
  }

  getModel() {
    return this.model;
  }
}
