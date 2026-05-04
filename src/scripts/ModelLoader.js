import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const DRACO_PATH = 'https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/draco/gltf/'

export class ModelLoader {
  constructor() {
    const loaderEl   = document.getElementById('loader')
    const loaderText = document.querySelector('.loader-text')

    const manager = new THREE.LoadingManager(
      () => { loaderEl.style.opacity = '0'; setTimeout(() => loaderEl.remove(), 900) },
      (_url, loaded, total) => {
        loaderText.textContent = `ACQUIRING SIGNAL… ${Math.round(loaded / total * 100)}%`
      }
    )

    const draco = new DRACOLoader()
    draco.setDecoderPath(DRACO_PATH)

    this._loader = new GLTFLoader(manager)
    this._loader.setDRACOLoader(draco)
  }

  load(url) {
    return new Promise((resolve, reject) => this._loader.load(url, resolve, undefined, reject))
  }
}

export function findHelmet(gltf) {
  const meshes = []
  let helmet = null
  gltf.scene.traverse((node) => {
    if (!node.isMesh) return
    node.castShadow = true
    node.receiveShadow = true
    meshes.push(node)
    if (node.name === 'defaultMaterial') helmet = node
  })
  return helmet ?? meshes[1] ?? null
}
