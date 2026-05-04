import * as THREE from 'three';

export class Droid {
  group: THREE.Group;

  constructor() {
    const g = new THREE.Group();
    g.scale.setScalar(0.7);
    const METAL = new THREE.MeshStandardMaterial({
      color: 0x999999,
      metalness: 0.7,
      roughness: 0.25,
    });
    const DARK = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.5,
      roughness: 0.4,
    });
    const GLOW = new THREE.MeshBasicMaterial({ color: 0x44ccff });
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      g.add(m);
    };
    add(new THREE.SphereGeometry(5, 16, 16), METAL);
    add(new THREE.SphereGeometry(3.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), METAL, 0, 6);
    add(new THREE.TorusGeometry(3.6, 0.6, 8, 24), DARK, 0, 5);
    add(new THREE.SphereGeometry(1, 8, 8), GLOW, 2.5, 6.5, 2.8);
    add(
      new THREE.CylinderGeometry(0.2, 0.2, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 }),
      -1,
      10
    );
    add(new THREE.SphereGeometry(0.5, 8, 8), GLOW, -1, 12.5);
    this.group = g;
  }

  update(helmPos: THREE.Vector3, mouse: THREE.Vector2, t: number): void {
    const g = this.group;
    g.position.x += (helmPos.x - 20 + mouse.x * 25 - g.position.x) * 0.025;
    g.position.z += (helmPos.z + 60 + mouse.y * 15 - g.position.z) * 0.025;
    g.position.y = helmPos.y + 25 + Math.sin(t * 1.4) * 3;
    g.rotation.y = Math.sin(t * 1) * 0.3 - 30;
    g.rotation.z = Math.sin(t * 0.6) * 0.12 - 0.08;
    g.rotation.x = Math.sin(t * 0.2) * 0.12 - 0.08;
  }
}
