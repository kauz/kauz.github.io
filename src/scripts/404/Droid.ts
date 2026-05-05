import * as THREE from 'three';

const _tl = new THREE.TextureLoader();

function _tex(path: string, srgb = false): THREE.Texture {
  const t = _tl.load(path);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  return t;
}

function _pbrMat(
  prefix: string,
  repeatU = 2,
  repeatV = 2,
  metalnessMax = 1.0,
  displacementScale = 0.12
): THREE.MeshStandardMaterial {
  const b = `/404/${prefix}`;
  const r = new THREE.Vector2(repeatU, repeatV);
  const t = (p: string, srgb = false) => {
    const tx = _tex(p, srgb);
    tx.repeat.copy(r);
    return tx;
  };
  return new THREE.MeshStandardMaterial({
    map: t(`${b}_albedo.webp`, true),
    normalMap: t(`${b}_normal-ogl.webp`),
    roughnessMap: t(`${b}_roughness.webp`),
    metalnessMap: t(`${b}_metallic.webp`),
    aoMap: t(`${b}_ao.webp`),
    displacementMap: t(`${b}_height.webp`),
    displacementScale,
    metalness: metalnessMax,
  });
}

export class Droid {
  group: THREE.Group;
  eyeLight: THREE.PointLight;

  constructor() {
    const g = new THREE.Group();
    g.scale.setScalar(0.7);
    const BODY = _pbrMat('worn-modern-panels', 2, 2, 1.0, 0.12);
    const HEAD = _pbrMat('worn-modern-panels2', 2, 2, 1.0, 0.08);
    const COLLAR = _pbrMat('worn-modern-panels', 30, 0.06, 0.5, 0.02);
    const ANTENNA = _pbrMat('worn-modern-panels', 1, 1, 0.5, 0.01);
    const GLOW = new THREE.MeshBasicMaterial({ color: 0x44ccff });
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
      const uv = geo.getAttribute('uv');
      if (uv) geo.setAttribute('uv1', uv);
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      g.add(m);
    };
    add(new THREE.SphereGeometry(5, 32, 32), BODY);
    add(new THREE.SphereGeometry(3.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2), HEAD, 0, 6);
    add(new THREE.TorusGeometry(3.6, 0.6, 16, 48), COLLAR, 0, 5);
    add(new THREE.SphereGeometry(1, 8, 8), GLOW, 2.5, 7.5, 2);
    add(new THREE.CylinderGeometry(0.09, 0.09, 5, 16), ANTENNA, -1, 10);
    add(new THREE.SphereGeometry(0.5, 8, 8), GLOW, -1, 12.5);

    this.eyeLight = new THREE.PointLight(0x44ccff, 0, 120, 1.8);
    this.eyeLight.position.set(4, 8, 3);
    g.add(this.eyeLight);

    this.group = g;
  }

  update(helmPos: THREE.Vector3, mouse: THREE.Vector2, t: number, sunAlt: number): void {
    const g = this.group;
    g.position.x += (helmPos.x - 20 + mouse.x * 25 - g.position.x) * 0.025;
    g.position.z += (helmPos.z + 60 + mouse.y * 15 - g.position.z) * 0.025;
    g.position.y = helmPos.y + 25 + Math.sin(t * 1.4) * 3;
    g.rotation.y = Math.sin(t * 1) * 0.3 - 30;
    g.rotation.z = Math.sin(t * 0.6) * 0.12 - 0.08;
    g.rotation.x = Math.sin(t * 0.2) * 0.12 - 0.08;
    const nightT = Math.max(0, Math.min(1, 1 - (sunAlt + 0.1) / 0.2));
    this.eyeLight.intensity = nightT * 200;
  }
}
