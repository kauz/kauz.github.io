import * as THREE from 'three';
import { ThreeScene } from './ThreeScene.js';
import { BinarySunSystem } from './SunSystem.js';
import { SkyDome } from './SkyDome.js';
import { ModelLoader, findHelmet } from './ModelLoader.js';
import { Droid } from './Droid.js';
import { DustSystem } from './DustSystem.js';
import { HelmetNod } from './HelmetNod.js';
import { HelmetHearts } from './HelmetHearts.js';

const ts = new ThreeScene();
const skyDome = new SkyDome();
ts.scene.add(skyDome.mesh);

const droid = new Droid();
const dust = new DustSystem();
const helmetNod = new HelmetNod();
const helmetHearts = new HelmetHearts();
const timer = new THREE.Timer();
ts.scene.add(droid.group, dust.points);

const helmPos = new THREE.Vector3();
let sunSystem: BinarySunSystem | null = null;

const wayText = document.getElementById('way-text')!;
helmetNod.listenFor('thisistheway', () => {
  wayText.classList.add('show');
  setTimeout(() => wayText.classList.remove('show'), 4000);
});
helmetHearts.listenFor('ivanna');

const soundBtn = document.getElementById('sound-btn');
if (soundBtn) {
  const audio = new Audio('/404/193c8f58-03c1-474f-af2a-cfe459d85ddc.m4a');
  audio.loop = true;
  const soundIcon = soundBtn.querySelector('.sound-icon')!;
  const soundLabel = soundBtn.querySelector('.sound-label')!;
  soundBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    const on = !audio.paused;
    soundIcon.textContent = on ? '🔊' : '🔇';
    soundLabel.textContent = `SOUND: ${on ? 'ON' : 'OFF'}`;
  });
}

new ModelLoader().load('/404/mando_405.gltf').then((gltf) => {
  const helmet = findHelmet(gltf);
  if (!helmet) return;

  helmetNod.attach(helmet);
  helmetHearts.attach(helmet);
  helmet.getWorldPosition(helmPos);

  ts.cam.aim(
    new THREE.Vector3(helmPos.x - 5, helmPos.y + 15, helmPos.z - 40),
    new THREE.Vector3(helmPos.x + 10, helmPos.y + 15, helmPos.z)
  );

  ts.keyLight.target.position.copy(helmPos);
  ts.keyLight.target.updateMatrixWorld();
  ts.fillLight.target.position.copy(helmPos);
  ts.fillLight.target.updateMatrixWorld();

  const camLight = new THREE.DirectionalLight(0xd0e8ff, 1.5);
  camLight.position.set(helmPos.x - 5, helmPos.y + 15, helmPos.z - 40);
  camLight.target.position.copy(helmPos);
  ts.scene.add(camLight, camLight.target);
  camLight.target.updateMatrixWorld();

  skyDome.mesh.position.copy(helmPos);

  sunSystem = new BinarySunSystem(ts.keyLight, ts.fillLight);
  ts.scene.add(sunSystem.sun1, sunSystem.sun2, gltf.scene);
  const initAlt = sunSystem.update(helmPos);
  skyDome.update(initAlt);
  (ts.scene.fog as THREE.Fog).color.copy(skyDome.horizonColor);

  dust.init(helmPos);
  droid.group.position.set(helmPos.x + 60, helmPos.y + 25, helmPos.z + 50);
});

import type { Debug as DebugType } from './Debug.js';
let dbg: DebugType | null = null;
if (import.meta.env.DEV) {
  import('./Debug.js').then(({ Debug }) => {
    dbg = new Debug(ts.scene);
    dbg.pointLight(droid.eyeLight, 'Droid Eye Light');
    dbg.object3D(droid.group, 'Droid');
    dbg.directionalLight(ts.keyLight, 'Key Light');
    dbg.directionalLight(ts.fillLight, 'Fill Light');
  });
}

function animate() {
  requestAnimationFrame(animate);
  timer.update();
  const t = timer.getElapsed();
  ts.cam.update();
  if (sunSystem) {
    const sunAlt = sunSystem.update(helmPos);
    skyDome.update(sunAlt);
    (ts.scene.fog as THREE.Fog).color.copy(skyDome.horizonColor);
    helmetNod.update();
    helmetHearts.update();
    droid.update(helmPos, ts.cam.mouse, t, sunAlt);
    dust.update(helmPos, sunAlt);
  }
  dbg?.update();
  ts.render();
}
animate();
