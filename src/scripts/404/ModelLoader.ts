import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/draco/gltf/';

export class ModelLoader {
  private _loader: GLTFLoader;

  constructor() {
    const loaderEl = document.getElementById('loader')!;
    const loaderText = document.querySelector('.loader-text')!;

    const manager = new THREE.LoadingManager(
      () => {
        loaderEl.style.opacity = '0';
        setTimeout(() => loaderEl.remove(), 900);
      },
      (_url: string, loaded: number, total: number) => {
        loaderText.textContent = `ACQUIRING SIGNAL… ${Math.round((loaded / total) * 100)}%`;
      }
    );

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);

    this._loader = new GLTFLoader(manager);
    this._loader.setDRACOLoader(draco);
  }

  load(url: string): Promise<GLTF> {
    return new Promise((resolve, reject) => this._loader.load(url, resolve, undefined, reject));
  }
}

export function findHelmet(gltf: GLTF): THREE.Mesh | null {
  const meshes: THREE.Mesh[] = [];
  let helmet: THREE.Mesh | null = null;
  gltf.scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return;
    node.castShadow = true;
    node.receiveShadow = true;
    meshes.push(node);
    if (node.name === 'defaultMaterial') helmet = node;
  });
  return helmet ?? meshes[1] ?? null;
}
