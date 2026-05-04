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
const clock = new THREE.Clock();
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
  let soundOn = false;
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.querySelector('.sound-icon')!.textContent = soundOn ? '🔊' : '🔇';
    soundBtn.querySelector('.sound-label')!.textContent = `SOUND: ${soundOn ? 'ON' : 'OFF'}`;
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
  (ts.scene.fog as THREE.FogExp2).color.copy(skyDome.horizonColor);

  dust.init(helmPos);
  droid.group.position.set(helmPos.x + 60, helmPos.y + 25, helmPos.z + 50);
});

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  ts.cam.update();
  if (sunSystem) {
    const sunAlt = sunSystem.update(helmPos);
    skyDome.update(sunAlt);
    (ts.scene.fog as THREE.FogExp2).color.copy(skyDome.horizonColor);
    helmetNod.update();
    helmetHearts.update();
    droid.update(helmPos, ts.cam.mouse, t, sunAlt);
    dust.update(helmPos, sunAlt);
  }
  ts.render();
}
animate();
