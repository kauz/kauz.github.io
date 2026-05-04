import * as THREE from 'three';

export class DustSystem {
  private _count: number;
  private _spread: number;
  private _pos: Float32Array;
  private _vel: Float32Array;
  private _attr: THREE.BufferAttribute;
  points: THREE.Points;

  constructor(count = 1000, spread = 700) {
    this._count = count;
    this._spread = spread;
    this._pos = new Float32Array(count * 3);
    this._vel = new Float32Array(count * 3);
    this._attr = new THREE.BufferAttribute(this._pos, 3);
    this._attr.setUsage(THREE.DynamicDrawUsage);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', this._attr);
    this.points = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xbb7722,
        size: 2.5,
        map: DustSystem._sprite(),
        transparent: true,
        opacity: 0.25,
        alphaTest: 0.001,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
  }

  private static _sprite(): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.4)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }

  init(origin: THREE.Vector3): void {
    const { _count: n, _spread: s, _pos: pos, _vel: vel } = this;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = origin.x + (Math.random() - 0.5) * s;
      pos[i * 3 + 1] = origin.y + Math.random() * 100;
      pos[i * 3 + 2] = origin.z + (Math.random() - 0.5) * s;
      vel[i * 3] = (Math.random() - 0.5) * 0.09;
      vel[i * 3 + 1] = (Math.random() - 0.4) * 0.025;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.09;
    }
  }

  update(origin: THREE.Vector3): void {
    const { _count: n, _spread: s, _pos: pos, _vel: vel } = this;
    const half = s / 2;
    for (let i = 0; i < n; i++) {
      pos[i * 3] += vel[i * 3];
      pos[i * 3 + 1] += vel[i * 3 + 1];
      pos[i * 3 + 2] += vel[i * 3 + 2];
      if (pos[i * 3] - origin.x > half) pos[i * 3] -= s;
      if (pos[i * 3] - origin.x < -half) pos[i * 3] += s;
      if (pos[i * 3 + 2] - origin.z > half) pos[i * 3 + 2] -= s;
      if (pos[i * 3 + 2] - origin.z < -half) pos[i * 3 + 2] += s;
      if (pos[i * 3 + 1] > origin.y + 100) pos[i * 3 + 1] = origin.y;
      if (pos[i * 3 + 1] < origin.y - 5) pos[i * 3 + 1] += s * 0.003;
    }
    this._attr.needsUpdate = true;
  }
}
