import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setClearColor(0x000000, 0)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
renderer.outputColorSpace = THREE.SRGBColorSpace
Object.assign(renderer.domElement.style, { position: 'fixed', inset: '0', zIndex: '0' })
document.body.prepend(renderer.domElement)

// --- Scene & Camera ---
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x1a0800, 0.00028)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 10000)
camera.position.set(0, 80, 300)

// --- Post-processing ---
const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.6,   // strength
  0.4,   // radius
  0.85   // threshold
)
composer.addPass(bloomPass)
composer.addPass(new OutputPass())

// --- Lights ---
scene.add(new THREE.AmbientLight(0x201030, 1.2))

const keyLight = new THREE.DirectionalLight(0xff8830, 5.0)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
keyLight.shadow.camera.near = 1
keyLight.shadow.camera.far = 2000
keyLight.shadow.camera.left = -400
keyLight.shadow.camera.right = 400
keyLight.shadow.camera.top = 400
keyLight.shadow.camera.bottom = -400
keyLight.shadow.bias = -0.001
scene.add(keyLight, keyLight.target)

const fillLight = new THREE.DirectionalLight(0xffbb55, 1.8)
scene.add(fillLight, fillLight.target)

const purpleLight = new THREE.DirectionalLight(0x6633aa, 0.6)
purpleLight.position.set(0, 500, 0)
scene.add(purpleLight)

const helmetGlow = new THREE.PointLight(0x44aaff, 0, 80)
scene.add(helmetGlow)

// --- Suns ---
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

const glowTexture = createGlowTexture();

function makeSun(radius, color) {
  const group = new THREE.Group()
  group.add(new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({ color })
  ))
const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture,
    color, 
    transparent: true, 
    opacity: 0.03,
    blending: THREE.AdditiveBlending, 
    depthWrite: false,
  }))
  sprite.scale.set(radius * 14, radius * 14, 1)
  group.add(sprite)
  return group
}
const sun1 = makeSun(20, 0xff8822)
const sun2 = makeSun(12, 0x83d0fc)
scene.add(sun1, sun2)

// --- Droid ---
function makeDroid() {
  const g = new THREE.Group()
  g.scale.setScalar(0.7)
  const METAL = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.7, roughness: 0.25 })
  const DARK  = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5, roughness: 0.4 })
  const GLOW  = new THREE.MeshBasicMaterial({ color: 0x44ccff })
  const add = (geo, mat, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    g.add(m)
  }
  add(new THREE.SphereGeometry(5, 16, 16), METAL)
  add(new THREE.SphereGeometry(3.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), METAL, 0, 6)
  add(new THREE.TorusGeometry(3.6, 0.6, 8, 24), DARK, 0, 5)
  add(new THREE.SphereGeometry(1, 8, 8), GLOW, 2.5, 6.5, 2.8)
  add(new THREE.CylinderGeometry(0.2, 0.2, 5, 8), new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 }), -1, 10)
  add(new THREE.SphereGeometry(0.5, 8, 8), GLOW, -1, 12.5)
  return g
}
const droid = makeDroid()
scene.add(droid)

// --- Dust particles ---
const DUST_COUNT  = 1000
const DUST_SPREAD = 700
const dustPos = new Float32Array(DUST_COUNT * 3)
const dustVel = new Float32Array(DUST_COUNT * 3)
const dustGeo  = new THREE.BufferGeometry()
const dustAttr = new THREE.BufferAttribute(dustPos, 3)
dustAttr.setUsage(THREE.DynamicDrawUsage)
dustGeo.setAttribute('position', dustAttr)

const dustSprite = (() => {
  const c = document.createElement('canvas')
  c.width = 32; c.height = 32
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  g.addColorStop(0,   'rgba(255,255,255,1)')
  g.addColorStop(0.4, 'rgba(255,255,255,0.4)')
  g.addColorStop(1,   'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  return new THREE.CanvasTexture(c)
})()

scene.add(new THREE.Points(dustGeo, new THREE.PointsMaterial({
  color: 0xbb7722, size: 2.5, map: dustSprite,
  transparent: true, opacity: 0.25, alphaTest: 0.001,
  depthWrite: false, blending: THREE.AdditiveBlending,
})))

function initDust() {
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPos[i*3]   = helmPos.x + (Math.random() - 0.5) * DUST_SPREAD
    dustPos[i*3+1] = helmPos.y + Math.random() * 100
    dustPos[i*3+2] = helmPos.z + (Math.random() - 0.5) * DUST_SPREAD
    dustVel[i*3]   = (Math.random() - 0.5) * 0.09
    dustVel[i*3+1] = (Math.random() - 0.4) * 0.025
    dustVel[i*3+2] = (Math.random() - 0.5) * 0.09
  }
}

function updateDust() {
  const half = DUST_SPREAD / 2
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPos[i*3]   += dustVel[i*3]
    dustPos[i*3+1] += dustVel[i*3+1]
    dustPos[i*3+2] += dustVel[i*3+2]
    if (dustPos[i*3]   - helmPos.x >  half) dustPos[i*3]   -= DUST_SPREAD
    if (dustPos[i*3]   - helmPos.x < -half) dustPos[i*3]   += DUST_SPREAD
    if (dustPos[i*3+2] - helmPos.z >  half) dustPos[i*3+2] -= DUST_SPREAD
    if (dustPos[i*3+2] - helmPos.z < -half) dustPos[i*3+2] += DUST_SPREAD
    if (dustPos[i*3+1] > helmPos.y + 100)   dustPos[i*3+1]  = helmPos.y
    if (dustPos[i*3+1] < helmPos.y - 5)     dustPos[i*3+1] += DUST_SPREAD * 0.003
  }
  dustAttr.needsUpdate = true
}

// --- State ---
const helmPos     = new THREE.Vector3()
const camBase     = new THREE.Vector3(0, 80, 300)
const camTarget   = new THREE.Vector3()
const mouseTarget = new THREE.Vector2()
const mouse       = new THREE.Vector2()
const raycaster   = new THREE.Raycaster()
let helmetMesh  = null
let helmetLoaded = false
let isHovering  = false

// --- GLTF ---
const loaderEl   = document.getElementById('loader')
const loaderText = document.querySelector('.loader-text')

const manager = new THREE.LoadingManager(
  () => {
    loaderEl.style.opacity = '0'
    setTimeout(() => loaderEl.remove(), 900)
  },
  (_url, loaded, total) => {
    loaderText.textContent = `ACQUIRING SIGNAL… ${Math.round(loaded / total * 100)}%`
  }
)

const draco = new DRACOLoader()
draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.168.0/examples/jsm/libs/draco/gltf/')
const gltfLoader = new GLTFLoader(manager)
gltfLoader.setDRACOLoader(draco)

gltfLoader.load('/404/mando_405.gltf', (gltf) => {
  const meshes = []
  let helmet = null
  gltf.scene.traverse((node) => {
    if (!node.isMesh) return
    node.castShadow = true
    node.receiveShadow = true
    meshes.push(node)
    if (node.name === 'defaultMaterial') helmet = node
  })
  if (!helmet && meshes.length >= 2) helmet = meshes[1]
  if (!helmet) return

  helmetMesh = helmet
  helmet.getWorldPosition(helmPos)

  camBase.set(helmPos.x + 10, helmPos.y + 15, helmPos.z - 40)
  camTarget.set(helmPos.x + 10, helmPos.y + 15, helmPos.z)
  camera.position.copy(camBase)
  camera.lookAt(camTarget)

  sun1.position.set(helmPos.x + 420, helmPos.y + 90, helmPos.z + 900)
  sun2.position.set(helmPos.x + 280, helmPos.y + 62, helmPos.z + 930)
  helmetGlow.position.set(helmPos.x, helmPos.y + 18, helmPos.z)

  keyLight.position.set(helmPos.x + 500, helmPos.y + 250, helmPos.z - 700)
  keyLight.target.position.copy(helmPos)
  keyLight.target.updateMatrixWorld()

  fillLight.position.set(helmPos.x - 350, helmPos.y + 180, helmPos.z - 600)
  fillLight.target.position.copy(helmPos)
  fillLight.target.updateMatrixWorld()

  scene.add(gltf.scene)
  initDust()
  droid.position.set(helmPos.x + 60, helmPos.y + 25, helmPos.z + 50)
  helmetLoaded = true
})

// --- Events ---
window.addEventListener('mousemove', (e) => {
  mouseTarget.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  )
})

const wayText = document.getElementById('way-text')
let typed = ''
window.addEventListener('keydown', (e) => {
  if (e.key.length !== 1) return
  typed += e.key.toLowerCase()
  if (typed.length > 20) typed = typed.slice(-20)
  if (!typed.endsWith('this is the way')) return
  typed = ''
  wayText.classList.add('show')
  setTimeout(() => wayText.classList.remove('show'), 4000)
  if (helmetMesh) {
    const origZ = helmetMesh.rotation.z
    helmetMesh.rotation.z += 0.25
    setTimeout(() => { if (helmetMesh) helmetMesh.rotation.z = origZ }, 700)
  }
})

const soundBtn = document.getElementById('sound-btn')
let soundOn = false
soundBtn?.addEventListener('click', () => {
  soundOn = !soundOn
  soundBtn.querySelector('.sound-icon').textContent = soundOn ? '🔊' : '🔇'
  soundBtn.querySelector('.sound-label').textContent = `SOUND: ${soundOn ? 'ON' : 'OFF'}`
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
  bloomPass.resolution.set(window.innerWidth, window.innerHeight)
})

// --- Loop ---
const clock = new THREE.Clock()
let prevTime = 0

function animate() {
  requestAnimationFrame(animate)
  const t     = clock.getElapsedTime()
  const delta = Math.min(t - prevTime, 0.05)
  prevTime = t

  mouse.x += (mouseTarget.x - mouse.x) * 0.06
  mouse.y += (mouseTarget.y - mouse.y) * 0.06

  camera.position.x = camBase.x + mouse.x * 18 + Math.sin(t * 0.38) * 2.5
  camera.position.y = camBase.y - mouse.y * 10 + Math.sin(t * 0.27) * 1.2
  camera.lookAt(camTarget)

  sun1.position.y = helmPos.y + 90 + Math.sin(t * 0.18) * 1.2
  sun2.position.y = helmPos.y + 62 + Math.sin(t * 0.13 + 1) * 0.8

  if (helmetMesh) {
    raycaster.setFromCamera(mouse, camera)
    isHovering = raycaster.intersectObject(helmetMesh, true).length > 0
    const glowTarget = isHovering ? 3.0 + Math.sin(t * 4) * 0.6 : 0
    helmetGlow.intensity += (glowTarget - helmetGlow.intensity) * 0.1
  }

  if (helmetLoaded) {
    droid.position.x += (helmPos.x - 60 + mouse.x * 25 - droid.position.x) * 0.025
    droid.position.z += (helmPos.z + 50 + mouse.y * 15 - droid.position.z) * 0.025
    droid.position.y  = helmPos.y + 15 + Math.sin(t * 1.4) * 3
    droid.rotation.y  = (Math.sin(t * 1) * 0.3) - 30
    droid.rotation.z  = Math.sin(t * 0.6) * 0.12 - 0.08
    droid.rotation.x  = Math.sin(t * 0.2) * 0.12 - 0.08
    updateDust()
  }

  composer.render()
}

animate()
