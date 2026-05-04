import * as THREE from 'three';
import SunCalc from 'suncalc';

const LAT = 50.45;
const LNG = 30.52;
const SKY_R = 900;
const SPEED = 144;
const CALC_INTERVAL = 200; // ms between solar recalculations
// Orbit center pushed south so the sun arc sits near the camera horizon,
// and shifted east so the camera's actual center line lands at noon.
// Camera looks from helmPos+(-5,15,-40) toward helmPos+(10,15,0), so its
// center line at Z+1800 passes through helmPos.x + 685.
const ORBIT_Z = 1800;
const ORBIT_X = 685;

// SunCalc azimuth: 0=south, +π/2=west, -π/2=east
// Scene coords:    North=-Z, East=+X, Up=+Y  →  South=+Z
function sunToVec3(alt: number, scAz: number, center: THREE.Vector3): THREE.Vector3 {
  const cosAlt = Math.cos(alt);
  return new THREE.Vector3(
    center.x - Math.sin(scAz) * cosAlt * SKY_R,
    center.y + Math.sin(alt) * SKY_R,
    center.z + Math.cos(scAz) * cosAlt * SKY_R
  );
}

function lerpHex(a: number, b: number, t: number): number {
  const r = Math.round(((a >> 16) & 0xff) + (((b >> 16) & 0xff) - ((a >> 16) & 0xff)) * t);
  const g = Math.round(((a >> 8) & 0xff) + (((b >> 8) & 0xff) - ((a >> 8) & 0xff)) * t);
  const bl = Math.round((a & 0xff) + ((b & 0xff) - (a & 0xff)) * t);
  return (r << 16) | (g << 8) | bl;
}

function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function makeSun(radius: number, color: number, texture: THREE.Texture): THREE.Group {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color });
  mat.color.multiplyScalar(4); // HDR — exceeds bloom threshold
  group.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), mat));
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: texture,
      color,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  sprite.scale.set(radius * 18, radius * 18, 1);
  group.add(sprite);
  return group;
}

export class BinarySunSystem {
  sun1: THREE.Group;
  sun2: THREE.Group;
  private _keyLight: THREE.DirectionalLight;
  private _fillLight: THREE.DirectionalLight;
  private _keyBase: number;
  private _fillBase: number;
  private _t0real: number;
  private _t0virt: Date;
  private _lastCalc: number;
  private _lastAlt = -Math.PI / 2;
  private _sun1Target = new THREE.Vector3();
  private _sun2Target = new THREE.Vector3();
  private _lastFrame = Date.now();
  private _initialized = false;

  constructor(keyLight: THREE.DirectionalLight, fillLight: THREE.DirectionalLight) {
    const tex = makeGlowTexture();
    this.sun1 = makeSun(20, 0xff8822, tex);
    this.sun2 = makeSun(12, 0x83d0fc, tex);
    this._keyLight = keyLight;
    this._fillLight = fillLight;
    this._keyBase = 5.0;
    this._fillBase = 1.8;
    this._t0real = Date.now();
    this._t0virt = new Date(); // start from user's real current time
    this._lastCalc = -Infinity;
  }

  update(center: THREE.Vector3): number {
    const now = Date.now();
    const dt = Math.min((now - this._lastFrame) / 1000, 0.1);
    this._lastFrame = now;

    if (now - this._lastCalc >= CALC_INTERVAL) {
      this._lastCalc = now;

      const elapsed = (now - this._t0real) * SPEED;
      const vDate1 = new Date(this._t0virt.getTime() + elapsed);
      const vDate2 = new Date(vDate1.getTime() - 45 * 60 * 1000); // sun2 lags 45 min

      const p1 = SunCalc.getPosition(vDate1, LAT, LNG);
      const p2 = SunCalc.getPosition(vDate2, LAT, LNG);
      const az2 = p2.azimuth + (15 * Math.PI) / 180;

      const oc = new THREE.Vector3(center.x + ORBIT_X, center.y, center.z + ORBIT_Z);
      this._sun1Target.copy(sunToVec3(p1.altitude, p1.azimuth, oc));
      this._sun2Target.copy(sunToVec3(p2.altitude, az2, oc));

      const t1 = Math.min(1, Math.max(0, p1.altitude / (Math.PI / 4)));
      this._keyLight.intensity = Math.max(0, Math.sin(p1.altitude)) * this._keyBase;
      this._keyLight.color.setHex(lerpHex(0xff4400, 0xffcc88, t1));

      const t2 = Math.min(1, Math.max(0, p2.altitude / (Math.PI / 4)));
      this._fillLight.intensity = Math.max(0, Math.sin(p2.altitude)) * this._fillBase;
      this._fillLight.color.setHex(lerpHex(0x4466ff, 0xaaddff, t2));

      this._lastAlt = p1.altitude;

      if (!this._initialized) {
        this.sun1.position.copy(this._sun1Target);
        this.sun2.position.copy(this._sun2Target);
        this._initialized = true;
      }
    }

    if (this._initialized) {
      const alpha = 1 - Math.exp(-8 * dt);
      this.sun1.position.lerp(this._sun1Target, alpha);
      this.sun2.position.lerp(this._sun2Target, alpha);
      this._keyLight.position.copy(this.sun1.position);
      this._fillLight.position.copy(this.sun2.position);
    }

    return this._lastAlt;
  }
}
