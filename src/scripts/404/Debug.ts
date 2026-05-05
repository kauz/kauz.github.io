import GUI from 'lil-gui';
import * as THREE from 'three';

type UpdatableHelper = { update(): void };

export class Debug {
  private _gui: GUI;
  private _scene: THREE.Scene;
  private _helpers: UpdatableHelper[] = [];

  constructor(scene: THREE.Scene, title = 'Debug') {
    this._gui = new GUI({ title });
    this._scene = scene;
  }

  pointLight(light: THREE.PointLight, name = 'PointLight'): this {
    const helper = new THREE.PointLightHelper(light, 10);
    this._scene.add(helper);
    this._helpers.push(helper);

    const f = this._gui.addFolder(name);
    f.add(light.position, 'x', -500, 500, 0.01).name('pos x');
    f.add(light.position, 'y', -500, 500, 0.01).name('pos y');
    f.add(light.position, 'z', -500, 500, 0.01).name('pos z');
    f.add(light, 'intensity', 0, 2000, 0.1);
    f.add(light, 'distance', 0, 1000, 0.1);
    f.add(light, 'decay', 0, 5, 0.1);
    const col = { color: '#' + light.color.getHexString() };
    f.addColor(col, 'color').onChange((v: string) => light.color.set(v));
    return this;
  }

  directionalLight(light: THREE.DirectionalLight, name = 'DirectionalLight'): this {
    const helper = new THREE.DirectionalLightHelper(light, 50);
    this._scene.add(helper);
    this._helpers.push(helper);

    const f = this._gui.addFolder(name);
    f.add(light.position, 'x', -1000, 1000, 0.1).name('pos x');
    f.add(light.position, 'y', -1000, 1000, 0.1).name('pos y');
    f.add(light.position, 'z', -1000, 1000, 0.1).name('pos z');
    f.add(light, 'intensity', 0, 20, 0.1);
    const col = { color: '#' + light.color.getHexString() };
    f.addColor(col, 'color').onChange((v: string) => light.color.set(v));
    return this;
  }

  object3D(obj: THREE.Object3D, name = 'Object3D'): this {
    const f = this._gui.addFolder(name);
    const pf = f.addFolder('position');
    pf.add(obj.position, 'x', -500, 500, 0.1);
    pf.add(obj.position, 'y', -500, 500, 0.1);
    pf.add(obj.position, 'z', -500, 500, 0.1);
    const rf = f.addFolder('rotation');
    rf.add(obj.rotation, 'x', -Math.PI, Math.PI, 0.1);
    rf.add(obj.rotation, 'y', -Math.PI, Math.PI, 0.1);
    rf.add(obj.rotation, 'z', -Math.PI, Math.PI, 0.1);
    const sf = f.addFolder('scale');
    const s = { uniform: obj.scale.x };
    sf.add(s, 'uniform', 0, 10, 0.1).onChange((v: number) => obj.scale.setScalar(v));
    return this;
  }

  material(mat: THREE.MeshStandardMaterial, name = 'Material'): this {
    const f = this._gui.addFolder(name);
    const col = { color: '#' + mat.color.getHexString() };
    f.addColor(col, 'color').onChange((v: string) => mat.color.set(v));
    f.add(mat, 'metalness', 0, 1, 0.1);
    f.add(mat, 'roughness', 0, 1, 0.1);
    f.add(mat, 'aoMapIntensity', 0, 2, 0.1);
    const ns = f.addFolder('normalScale');
    ns.add(mat.normalScale, 'x', 0, 5, 0.1);
    ns.add(mat.normalScale, 'y', 0, 5, 0.1);
    if (mat.displacementMap) {
      f.add(mat, 'displacementScale', -1, 1, 0.1);
      f.add(mat, 'displacementBias', -1, 1, 0.1);
    }
    return this;
  }

  update(): void {
    for (const h of this._helpers) h.update();
  }

  destroy(): void {
    for (const h of this._helpers) this._scene.remove(h as unknown as THREE.Object3D);
    this._helpers = [];
    this._gui.destroy();
  }
}
