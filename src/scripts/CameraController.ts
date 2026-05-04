import * as THREE from 'three';

export class CameraController {
  camera: THREE.PerspectiveCamera;
  mouse: THREE.Vector2;
  private _mouseRaw: THREE.Vector2;
  private _base: THREE.Vector3;
  private _target: THREE.Vector3;

  constructor(fov = 40) {
    this.camera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      0.5,
      10000
    );
    this.mouse = new THREE.Vector2();
    this._mouseRaw = new THREE.Vector2();
    this._base = new THREE.Vector3();
    this._target = new THREE.Vector3();
    window.addEventListener('mousemove', (e) => {
      this._mouseRaw.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    });
  }

  aim(base: THREE.Vector3, target: THREE.Vector3): void {
    this._base.copy(base);
    this._target.copy(target);
    this.camera.position.copy(base);
    this.camera.lookAt(target);
  }

  onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(): void {
    this.mouse.x += (this._mouseRaw.x - this.mouse.x) * 0.06;
    this.mouse.y += (this._mouseRaw.y - this.mouse.y) * 0.06;
    this.camera.position.x = this._base.x + this.mouse.x * 1.5;
    this.camera.position.y = this._base.y - this.mouse.y * 1.5;
    this.camera.lookAt(this._target);
  }
}
