import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Debug as DebugType } from './Debug.js';
import { ThreeScene } from './ThreeScene.js';
import { BinarySunSystem } from './SunSystem.js';
import { SkyDome } from './SkyDome.js';
import { ModelLoader, findHelmet } from './ModelLoader.js';
import { Droid } from './Droid.js';
import { DustSystem } from './DustSystem.js';
import { HelmetNod } from './HelmetNod.js';
import { HelmetHearts } from './HelmetHearts.js';

type Stats = { begin(): void; end(): void; dom: HTMLElement; showPanel(i: number): void };

class Scene404 {
  private readonly _ts = new ThreeScene();
  private readonly _skyDome = new SkyDome();
  private readonly _droid = new Droid();
  private readonly _dust = new DustSystem();
  private readonly _helmetNod = new HelmetNod();
  private readonly _helmetHearts = new HelmetHearts();
  private readonly _timer = new THREE.Timer();
  private readonly _helmPos = new THREE.Vector3();
  private _sunSystem: BinarySunSystem | null = null;
  private _fpsFrames = 0;
  private _fpsStart: number | null = null;
  private _qualitySet = false;
  private _dbg: DebugType | null = null;
  private _stats: Stats | null = null;

  constructor() {
    this._ts.scene.add(this._skyDome.mesh, this._droid.group, this._dust.points);
    this._bindUI();
    void new ModelLoader().load('/404/mando_405.gltf').then((gltf) => this._onModelLoaded(gltf));
    if (import.meta.env.DEV) void this._initDevTools();
    this._animate();
  }

  private _bindUI(): void {
    const wayText = document.getElementById('way-text')!;
    this._helmetNod.listenFor('thisistheway', () => {
      wayText.classList.add('show');
      setTimeout(() => wayText.classList.remove('show'), 4000);
    });
    this._helmetHearts.listenFor('ivanna');

    const soundBtn = document.getElementById('sound-btn');
    if (!soundBtn) return;
    const audio = new Audio('/404/193c8f58-03c1-474f-af2a-cfe459d85ddc.m4a');
    audio.loop = true;
    const soundIcon = soundBtn.querySelector('.sound-icon')!;
    const soundLabel = soundBtn.querySelector('.sound-label')!;
    soundBtn.addEventListener('click', () => {
      if (audio.paused) audio.play();
      else audio.pause();
      const on = !audio.paused;
      soundIcon.textContent = on ? '🔊' : '🔇';
      soundLabel.textContent = `SOUND: ${on ? 'ON' : 'OFF'}`;
    });
  }

  private _onModelLoaded(gltf: GLTF): void {
    const helmet = findHelmet(gltf);
    if (!helmet) return;

    this._helmetNod.attach(helmet);
    this._helmetHearts.attach(helmet);
    helmet.getWorldPosition(this._helmPos);
    const hp = this._helmPos;

    this._ts.cam.aim(
      new THREE.Vector3(hp.x - 5, hp.y + 15, hp.z - 40),
      new THREE.Vector3(hp.x + 10, hp.y + 15, hp.z)
    );

    this._ts.keyLight.target.position.copy(hp);
    this._ts.keyLight.target.updateMatrixWorld();
    this._ts.fillLight.target.position.copy(hp);
    this._ts.fillLight.target.updateMatrixWorld();

    const camLight = new THREE.DirectionalLight(0xd0e8ff, 1.5);
    camLight.position.set(hp.x - 5, hp.y + 15, hp.z - 40);
    camLight.target.position.copy(hp);
    this._ts.scene.add(camLight, camLight.target);
    camLight.target.updateMatrixWorld();

    this._skyDome.mesh.position.copy(hp);

    this._sunSystem = new BinarySunSystem(this._ts.keyLight, this._ts.fillLight);
    this._ts.scene.add(this._sunSystem.sun1, this._sunSystem.sun2, gltf.scene);
    const initAlt = this._sunSystem.update(hp);
    this._skyDome.update(initAlt);
    (this._ts.scene.fog as THREE.Fog).color.copy(this._skyDome.horizonColor);

    this._dust.init(hp);
    this._droid.group.position.set(hp.x + 60, hp.y + 25, hp.z + 50);
  }

  private _checkQuality(): void {
    const now = performance.now();
    if (this._fpsStart === null) this._fpsStart = now;
    this._fpsFrames++;
    const elapsed = now - this._fpsStart;
    if (elapsed < 3000) return;
    const fps = (this._fpsFrames * 1000) / elapsed;
    if (fps < 30) this._ts.setQualityTier('low');
    else if (fps < 45) this._ts.setQualityTier('medium');
    this._qualitySet = true;
  }

  private async _initDevTools(): Promise<void> {
    const [{ default: Stats }, { Debug }] = await Promise.all([
      import('three/examples/jsm/libs/stats.module.js'),
      import('./Debug.js'),
    ]);
    this._stats = new Stats();
    this._stats.showPanel(0);
    document.body.appendChild(this._stats.dom);
    this._dbg = new Debug(this._ts.scene);
    this._dbg.pointLight(this._droid.eyeLight, 'Droid Eye Light');
    this._dbg.object3D(this._droid.group, 'Droid');
    this._dbg.directionalLight(this._ts.keyLight, 'Key Light');
    this._dbg.directionalLight(this._ts.fillLight, 'Fill Light');
  }

  private _animate = (): void => {
    requestAnimationFrame(this._animate);
    this._stats?.begin();
    this._timer.update();
    const dt = this._timer.getDelta();
    const t = this._timer.getElapsed();
    this._ts.cam.update(dt);
    if (this._sunSystem) {
      if (!this._qualitySet) this._checkQuality();
      const sunAlt = this._sunSystem.update(this._helmPos);
      this._skyDome.update(sunAlt);
      (this._ts.scene.fog as THREE.Fog).color.copy(this._skyDome.horizonColor);
      this._helmetNod.update();
      this._helmetHearts.update();
      this._droid.update(this._helmPos, this._ts.cam.mouse, t, sunAlt, dt);
      this._dust.update(this._helmPos, sunAlt);
    }
    this._dbg?.update();
    this._ts.render();
    this._stats?.end();
  };
}

new Scene404();
