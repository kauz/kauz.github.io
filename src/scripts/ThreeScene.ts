import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { CameraController } from './CameraController.js';

export class ThreeScene {
  scene: THREE.Scene;
  cam: CameraController;
  keyLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  private _renderer: THREE.WebGLRenderer;
  private _composer: EffectComposer;
  private _bloomPass: UnrealBloomPass;

  constructor() {
    this._renderer = this._makeRenderer();
    this.scene = this._makeScene();
    this.cam = new CameraController();
    const { composer, bloomPass } = this._makeComposer();
    this._composer = composer;
    this._bloomPass = bloomPass;
    const { keyLight, fillLight } = this._makeLights();
    this.keyLight = keyLight;
    this.fillLight = fillLight;
    window.addEventListener('resize', () => this._onResize());
  }

  render(): void {
    this._composer.render();
  }

  private _makeRenderer(): THREE.WebGLRenderer {
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setClearColor(0x000000, 0);
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.15;
    r.outputColorSpace = THREE.SRGBColorSpace;
    Object.assign(r.domElement.style, { position: 'fixed', inset: '0', zIndex: '0' });
    document.body.prepend(r.domElement);
    return r;
  }

  private _makeScene(): THREE.Scene {
    const s = new THREE.Scene();
    s.fog = new THREE.FogExp2(0x0a0414, 0.00058);
    return s;
  }

  private _makeComposer(): { composer: EffectComposer; bloomPass: UnrealBloomPass } {
    const composer = new EffectComposer(this._renderer);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.6,
      0.4,
      0.85
    );
    composer.addPass(new RenderPass(this.scene, this.cam.camera));
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    return { composer, bloomPass };
  }

  private _makeLights(): { keyLight: THREE.DirectionalLight; fillLight: THREE.DirectionalLight } {
    this.scene.add(new THREE.AmbientLight(0x201030, 1.2));

    const keyLight = new THREE.DirectionalLight(0xff8830, 5.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 2000;
    keyLight.shadow.camera.left = -400;
    keyLight.shadow.camera.right = 400;
    keyLight.shadow.camera.top = 400;
    keyLight.shadow.camera.bottom = -400;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight, keyLight.target);

    const fillLight = new THREE.DirectionalLight(0xffbb55, 1.8);
    this.scene.add(fillLight, fillLight.target);

    const purpleLight = new THREE.DirectionalLight(0x6633aa, 0.6);
    purpleLight.position.set(0, 500, 0);
    this.scene.add(purpleLight);

    return { keyLight, fillLight };
  }

  private _onResize(): void {
    this.cam.onResize();
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._composer.setSize(window.innerWidth, window.innerHeight);
    this._bloomPass.resolution.set(window.innerWidth, window.innerHeight);
  }
}
