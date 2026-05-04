import * as THREE from 'three'
import { ThreeScene } from './ThreeScene.js'
import { BinarySunSystem } from './SunSystem.js'
import { ModelLoader, findHelmet } from './ModelLoader.js'
import { Droid } from './Droid.js'
import { DustSystem } from './DustSystem.js'
import { HelmetNod } from './HelmetNod.js'
import { HelmetHearts } from './HelmetHearts.js'

const ts = new ThreeScene()
const droid       = new Droid()
const dust        = new DustSystem()
const helmetNod   = new HelmetNod()
const helmetHearts = new HelmetHearts()
const clock = new THREE.Clock()
ts.scene.add(droid.group, dust.points)

const helmPos   = new THREE.Vector3()
let sunSystem   = null

const wayText = document.getElementById('way-text')
helmetNod.listenFor('thisistheway', () => {
  wayText.classList.add('show')
  setTimeout(() => wayText.classList.remove('show'), 4000)
})
helmetHearts.listenFor('ivanna')

const soundBtn = document.getElementById('sound-btn')
let soundOn = false
soundBtn?.addEventListener('click', () => {
  soundOn = !soundOn
  soundBtn.querySelector('.sound-icon').textContent = soundOn ? '🔊' : '🔇'
  soundBtn.querySelector('.sound-label').textContent = `SOUND: ${soundOn ? 'ON' : 'OFF'}`
})

new ModelLoader().load('/404/mando_405.gltf').then((gltf) => {
  const helmet = findHelmet(gltf)
  if (!helmet) return

  helmetNod.attach(helmet)
  helmetHearts.attach(helmet)
  helmet.getWorldPosition(helmPos)

  ts.cam.aim(
    new THREE.Vector3(helmPos.x - 5,  helmPos.y + 15, helmPos.z - 40),
    new THREE.Vector3(helmPos.x + 10, helmPos.y + 15, helmPos.z)
  )

  ts.keyLight.target.position.copy(helmPos)
  ts.keyLight.target.updateMatrixWorld()
  ts.fillLight.target.position.copy(helmPos)
  ts.fillLight.target.updateMatrixWorld()

  sunSystem = new BinarySunSystem(ts.keyLight, ts.fillLight)
  ts.scene.add(sunSystem.sun1, sunSystem.sun2, gltf.scene)
  sunSystem.update(helmPos)

  dust.init(helmPos)
  droid.group.position.set(helmPos.x + 60, helmPos.y + 25, helmPos.z + 50)
})

function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()
  ts.cam.update()
  if (sunSystem) {
    sunSystem.update(helmPos)
    helmetNod.update()
    helmetHearts.update()
    droid.update(helmPos, ts.cam.mouse, t)
    dust.update(helmPos)
  }
  ts.render()
}
animate()
