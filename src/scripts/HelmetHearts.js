import * as THREE from 'three'

function makeHeartTexture(size = 256) {
  const c = document.createElement('canvas')
  c.width = size; c.height = size
  const ctx = c.getContext('2d')
  const h = size / 2

  ctx.shadowColor = '0xff3377'
  ctx.shadowBlur = size * 0.15
  ctx.fillStyle = '0xff3377'
  
  const drawShape = (scale) => {
    ctx.save()
    ctx.translate(h, h)
    ctx.scale(scale, scale)
    ctx.translate(-h, -h)
    
    ctx.beginPath()
    ctx.arc(h * 0.5, h * 0.72, h * 0.48, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(h * 1.5, h * 0.72, h * 0.48, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(h * 0.08, h * 0.95)
    ctx.lineTo(h, h * 1.92)
    ctx.lineTo(h * 1.92, h * 0.95)
    ctx.fill()
    ctx.restore()
  }

  ctx.shadowColor = '#ff3377'
  ctx.shadowBlur = size * 0.15
  ctx.fillStyle = '#ff3377'
  drawShape(0.8)
  drawShape(0.8)

  ctx.shadowBlur = 0
  ctx.fillStyle = 'white'
  drawShape(0.4)

  return new THREE.CanvasTexture(c)
}

const EYE_POSITIONS   = [[-1.5, 9.5, -3.8], [0.89, 9.5, -3.8]]
const SPRITE_SCALE    = 0.5
const SPRITE_ROTATION = -0.2
const LERP_SPEED      = 0.05

export class HelmetHearts {
  constructor() {
    this._sprites = []
    this._opacity = 0
    this._target  = 0
    this._timeout = null
  }

  attach(helmMesh) {
    const tex = makeHeartTexture()
    for (const [x, y, z] of EYE_POSITIONS) {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        // color: 0xff3377, // Vibrant neon pink
        transparent: true,
        opacity: 0,
        rotation: SPRITE_ROTATION,
        blending: THREE.AdditiveBlending, // Light adds to background (Glow effect)
        depthWrite: false, // Ensures transparency doesn't clip the visor
        depthTest: true,
      })
      const sprite = new THREE.Sprite(mat)
      sprite.scale.setScalar(SPRITE_SCALE)
      sprite.position.set(x, y, z)
      helmMesh.add(sprite)
      this._sprites.push(sprite)
    }
  }

  listenFor(phrase, onActivate) {
    let typed = ''
    window.addEventListener('keydown', (e) => {
      if (e.key.length !== 1) return
      typed += e.key.toLowerCase()
      if (typed.length > phrase.length + 5) typed = typed.slice(-(phrase.length + 5))
      if (!typed.endsWith(phrase)) return
      typed = ''
      this.show()
      onActivate?.()
    })
  }

  show(durationMs = 4000) {
    this._target = 1
    if (this._timeout) clearTimeout(this._timeout)
    this._timeout = setTimeout(() => { this._target = 0 }, durationMs)
  }

  update() {
    // Smooth transition for activation
    this._opacity += (this._target - this._opacity) * LERP_SPEED
    
    // Electronic Flicker logic: 
    // Adds a tiny, high-speed random variance to the opacity to mimic a digital display
    const flicker = this._target > 0 ? (0.92 + Math.random() * 0.08) : 1
    
    // Pulse logic:
    // A slow "breathing" effect using time
    const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.04 * this._opacity

    for (const s of this._sprites) {
      s.material.opacity = this._opacity * flicker
      s.scale.setScalar(SPRITE_SCALE * pulse)
    }
  }
}