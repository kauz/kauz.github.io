import * as THREE from 'three';

const vert = `
varying float vY;
void main() {
  vY = normalize(position).y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Three-band gradient: horizon → midsky → zenith above the horizon line,
// horizon → ground below. The midsky band captures the purple/magenta
// twilight belt visible just above the orange horizon at dawn/dusk.
const frag = `
uniform vec3 uZenith;
uniform vec3 uMidsky;
uniform vec3 uHorizon;
uniform vec3 uGround;
varying float vY;
void main() {
  vec3 color;
  if (vY >= 0.0) {
    float t1 = smoothstep(0.0, 0.18, vY);
    float t2 = smoothstep(0.12, 0.9, vY);
    color = mix(mix(uHorizon, uMidsky, t1), uZenith, t2);
  } else {
    color = mix(uHorizon, uGround, clamp(-vY * 4.0, 0.0, 1.0));
  }
  gl_FragColor = vec4(color, 1.0);
}
`;

interface Stop {
  alt: number;
  zenith: number;
  midsky: number;
  horizon: number;
  ground: number;
}

// Sun altitude stops in radians → sky color palette.
// Palette mirrors the desert-planet aesthetic of the existing scene
// (warm orange-brown at ground level, dark purple above).
const STOPS: Stop[] = [
  { alt: -1.57, zenith: 0x060310, midsky: 0x08031a, horizon: 0x0a0414, ground: 0x060210 }, // deep night
  { alt: -0.2, zenith: 0x060310, midsky: 0x08031a, horizon: 0x0a0414, ground: 0x060210 }, // night
  { alt: -0.06, zenith: 0x07050f, midsky: 0x140525, horizon: 0x1e0830, ground: 0x060210 }, // deep twilight
  { alt: 0.0, zenith: 0x0a0820, midsky: 0x5a1240, horizon: 0xc04010, ground: 0x140608 }, // horizon crossing
  { alt: 0.08, zenith: 0x0c0a22, midsky: 0x3a1030, horizon: 0xa04010, ground: 0x180808 }, // low sun
  { alt: 0.25, zenith: 0x081428, midsky: 0x1a1020, horizon: 0x7a3010, ground: 0x0c0c18 }, // morning/afternoon
  { alt: 0.6, zenith: 0x1a3868, midsky: 0x0d1840, horizon: 0x2a4a6a, ground: 0x0a1428 }, // midday
  { alt: 1.57, zenith: 0x1a3868, midsky: 0x0d1840, horizon: 0x2a4a6a, ground: 0x0a1428 }, // zenith
];

function lerpColor(a: number, b: number, t: number): THREE.Color {
  return new THREE.Color(
    (((a >> 16) & 0xff) + (((b >> 16) & 0xff) - ((a >> 16) & 0xff)) * t) / 255,
    (((a >> 8) & 0xff) + (((b >> 8) & 0xff) - ((a >> 8) & 0xff)) * t) / 255,
    ((a & 0xff) + ((b & 0xff) - (a & 0xff)) * t) / 255
  );
}

function colorsAt(rawAlt: number) {
  const alt = Math.max(STOPS[0].alt, Math.min(STOPS[STOPS.length - 1].alt, rawAlt));
  let lo = STOPS[0],
    hi = STOPS[1];
  for (let i = 0; i < STOPS.length - 1; i++) {
    if (alt <= STOPS[i + 1].alt) {
      lo = STOPS[i];
      hi = STOPS[i + 1];
      break;
    }
  }
  const t = hi.alt === lo.alt ? 0 : (alt - lo.alt) / (hi.alt - lo.alt);
  return {
    zenith: lerpColor(lo.zenith, hi.zenith, t),
    midsky: lerpColor(lo.midsky, hi.midsky, t),
    horizon: lerpColor(lo.horizon, hi.horizon, t),
    ground: lerpColor(lo.ground, hi.ground, t),
  };
}

export class SkyDome {
  mesh: THREE.Mesh;
  readonly horizonColor = new THREE.Color();
  private _u: {
    uZenith: { value: THREE.Color };
    uMidsky: { value: THREE.Color };
    uHorizon: { value: THREE.Color };
    uGround: { value: THREE.Color };
  };

  constructor() {
    this._u = {
      uZenith: { value: new THREE.Color() },
      uMidsky: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGround: { value: new THREE.Color() },
    };
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(8000, 32, 16),
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: this._u,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      })
    );
    this.mesh.renderOrder = -1;
    this.mesh.frustumCulled = false;
    this.update(-1.57); // initialise to night
  }

  update(sunAlt: number): void {
    const c = colorsAt(sunAlt);
    this._u.uZenith.value.copy(c.zenith);
    this._u.uMidsky.value.copy(c.midsky);
    this._u.uHorizon.value.copy(c.horizon);
    this._u.uGround.value.copy(c.ground);
    this.horizonColor.copy(c.horizon);
  }
}
