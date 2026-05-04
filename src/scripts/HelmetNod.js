export class HelmetNod {
  constructor(rotAmount = -0.35, liftAmount = 2, speed = 0.02, holdMs = 900) {
    this.rotAmount = rotAmount;
    this.liftAmount = liftAmount;
    this.speed = speed;
    this.holdMs = holdMs;
    this._mesh = null;
    this._baseRotX = 0;
    this._basePosY = 0;
    this._rotOffset = 0;
    this._rotTarget = 0;
    this._liftOffset = 0;
    this._liftTarget = 0;
  }
  attach(mesh) {
    this._mesh = mesh;
    this._baseRotX = mesh.rotation.x;
    this._basePosY = mesh.position.y;
  }
  trigger() {
    if (!this._mesh) return;
    this._rotTarget = this.rotAmount;
    this._liftTarget = this.liftAmount;
    setTimeout(() => {
      this._rotTarget = 0;
      this._liftTarget = 0;
    }, this.holdMs);
  }
  listenFor(phrase, onActivate) {
    let typed = '';
    window.addEventListener('keydown', (e) => {
      if (e.key.length !== 1) return;
      typed += e.key.toLowerCase();
      if (typed.length > phrase.length + 5) typed = typed.slice(-(phrase.length + 5));
      if (!typed.endsWith(phrase)) return;
      typed = '';
      this.trigger();
      onActivate?.();
    });
  }
  update() {
    if (!this._mesh) return;
    this._rotOffset += (this._rotTarget - this._rotOffset) * this.speed;
    this._liftOffset += (this._liftTarget - this._liftOffset) * this.speed;
    this._mesh.rotation.x = this._baseRotX + this._rotOffset;
    this._mesh.position.y = this._basePosY + this._liftOffset;
  }
}
