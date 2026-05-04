import * as THREE from 'three'

const LAT_RAD       = 33.5 * Math.PI / 180
const LNG_DEG       = 10.7
const SKY_R         = 900
const DEG           = Math.PI / 180
const SPEED         = 144   // 1 real second = 144 virtual seconds → 24 h per 10 min
const CALC_INTERVAL = 200   // ms between solar recalculations (~0.03° sun movement)

function solarAltAz(date) {
  const JD = date.getTime() / 86400000 + 2440587.5
  const T  = (JD - 2451545.0) / 36525

  const L0   = (280.46646 + 36000.76983 * T) % 360
  const M    = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
  const Mrad = M * DEG

  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
           + 0.000289 * Math.sin(3 * Mrad)

  const omega  = 125.04 - 1934.136 * T
  const lambda = (L0 + C) - 0.00569 - 0.00478 * Math.sin(omega * DEG)

  const epsilon    = 23.439291111 - 0.013004167 * T + 0.00256 * Math.cos(omega * DEG)
  const epsilonRad = epsilon * DEG
  const lambdaRad  = lambda * DEG

  const declination = Math.asin(Math.sin(epsilonRad) * Math.sin(lambdaRad))

  // Equation of time (minutes)
  const y    = Math.tan(epsilonRad / 2) ** 2
  const L0r  = L0 * DEG
  const e    = 0.016708634
  const eot  = (180 / Math.PI) * 4 * (
    y * Math.sin(2 * L0r)
    - 2 * e * Math.sin(Mrad)
    + 4 * e * y * Math.sin(Mrad) * Math.cos(2 * L0r)
    - 0.5 * y * y * Math.sin(4 * L0r)
    - 1.25 * e * e * Math.sin(2 * Mrad)
  )

  const solarNoonMin  = 720 - 4 * LNG_DEG - eot
  const utcMin        = date.getUTCHours() * 60 + date.getUTCMinutes()
                      + date.getUTCSeconds() / 60 + date.getUTCMilliseconds() / 60000
  const hourAngleRad  = ((utcMin - solarNoonMin) / 4) * DEG

  const sinAlt  = Math.sin(LAT_RAD) * Math.sin(declination)
                + Math.cos(LAT_RAD) * Math.cos(declination) * Math.cos(hourAngleRad)
  const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt)))

  // Azimuth: 0 = North, π/2 = East, π = South, 3π/2 = West
  const rawAz  = Math.atan2(
    -Math.sin(hourAngleRad) * Math.cos(declination),
    Math.cos(hourAngleRad) * Math.cos(declination) * Math.sin(LAT_RAD)
      - Math.sin(declination) * Math.cos(LAT_RAD)
  )
  const azimuth = ((rawAz % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

  return { altitude, azimuth }
}

// North = −Z, East = +X, Up = +Y
function altAzToVec3(altitude, azimuth, center) {
  const cosAlt = Math.cos(altitude)
  return new THREE.Vector3(
    center.x + Math.sin(azimuth) * cosAlt * SKY_R,
    center.y + Math.sin(altitude) * SKY_R,
    center.z - Math.cos(azimuth) * cosAlt * SKY_R
  )
}

function lerpHex(a, b, t) {
  const r  = Math.round(((a >> 16) & 0xff) + (((b >> 16) & 0xff) - ((a >> 16) & 0xff)) * t)
  const g  = Math.round(((a >> 8)  & 0xff) + (((b >> 8)  & 0xff) - ((a >> 8)  & 0xff)) * t)
  const bl = Math.round(( a        & 0xff) + (( b        & 0xff) - ( a        & 0xff)) * t)
  return (r << 16) | (g << 8) | bl
}

function makeGlowTexture() {
  const c = document.createElement('canvas')
  c.width = 64; c.height = 64
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0,   'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,255,255,0.5)')
  g.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

function makeSun(radius, color, texture) {
  const group = new THREE.Group()
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({ color })
  ))
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture, color, transparent: true, opacity: 0.03,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }))
  sprite.scale.set(radius * 14, radius * 14, 1)
  group.add(sprite)
  return group
}

export class BinarySunSystem {
  constructor(keyLight, fillLight) {
    const tex      = makeGlowTexture()
    this.sun1      = makeSun(20, 0xff8822, tex)
    this.sun2      = makeSun(12, 0x83d0fc, tex)
    this.keyLight  = keyLight
    this.fillLight = fillLight
    this._keyBase  = 5.0
    this._fillBase = 1.8
    this._t0real   = Date.now()
    this._t0virt   = new Date()
    this._lastCalc = -Infinity
  }

  update(center) {
    const now = Date.now()
    if (now - this._lastCalc < CALC_INTERVAL) return
    this._lastCalc = now

    const elapsed = (now - this._t0real) * SPEED
    const vDate1  = new Date(this._t0virt.getTime() + elapsed)
    const vDate2  = new Date(vDate1.getTime() - 45 * 60 * 1000) // 45 min lag

    const p1 = solarAltAz(vDate1)
    const p2 = solarAltAz(vDate2)
    p2.azimuth += 15 * DEG  // angular offset for second sun

    const pos1 = altAzToVec3(p1.altitude, p1.azimuth, center)
    const pos2 = altAzToVec3(p2.altitude, p2.azimuth, center)

    this.sun1.position.copy(pos1)
    this.sun2.position.copy(pos2)

    const i1 = Math.max(0, Math.sin(p1.altitude))
    const i2 = Math.max(0, Math.sin(p2.altitude))

    const t1 = Math.min(1, Math.max(0, p1.altitude / (Math.PI / 4)))
    this.keyLight.position.copy(pos1)
    this.keyLight.intensity = i1 * this._keyBase
    this.keyLight.color.setHex(lerpHex(0xff4400, 0xffcc88, t1))

    const t2 = Math.min(1, Math.max(0, p2.altitude / (Math.PI / 4)))
    this.fillLight.position.copy(pos2)
    this.fillLight.intensity = i2 * this._fillBase
    this.fillLight.color.setHex(lerpHex(0x4466ff, 0xaaddff, t2))
  }
}
