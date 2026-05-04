import { Terminal } from './terminal';
import { Shell } from './shell';
import type { IVisitor, IAppElements } from './types';

export class App {
  public visitor: IVisitor;
  private terminal!: Terminal;
  private shell!: Shell;
  private history: string[] = [];
  private histIdx = -1;
  private cursorTimer!: ReturnType<typeof setTimeout>;
  private booting = true;
  private readonly konamiSeq = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  private konamiProgress = 0;

  private input: HTMLInputElement;
  private cmdTyped: HTMLElement;
  private blinkCursor: HTMLElement;
  private promptEl: HTMLElement;
  private titleEl: HTMLElement;

  constructor(visitor: IVisitor, elements: IAppElements) {
    this.visitor = visitor;
    this.input = elements.input;
    this.cmdTyped = elements.cmdTyped;
    this.blinkCursor = elements.blinkCursor;
    this.promptEl = elements.promptEl;
    this.titleEl = elements.titleEl;

    this.terminal = new Terminal(elements.output, elements.termBody, () => this.shell.getPrompt());
    this.shell = new Shell({
      postData: elements.postData,
      output: this.terminal,
      visitorSlug: visitor.slug,
      onCwdChange: () => {
        const prompt = this.shell.getPrompt();
        this.promptEl.textContent = prompt;
        this.titleEl.textContent = prompt.slice(0, -1);
      },
    });

    this.promptEl.textContent = this.shell.getPrompt();
    this.titleEl.textContent = this.shell.getPrompt().slice(0, -1);

    this.input.addEventListener('input', () => {
      this.syncDisplay();
      this.blinkCursor.classList.add('is-paused');
      clearTimeout(this.cursorTimer);
      this.cursorTimer = setTimeout(() => this.blinkCursor.classList.remove('is-paused'), 600);
    });

    this.input.addEventListener('blur', () => this.blinkCursor.classList.add('is-hidden'));
    this.input.addEventListener('focus', () => this.blinkCursor.classList.remove('is-hidden'));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    document.addEventListener('click', () => this.input.focus());

    this.blinkCursor.classList.add('is-hidden');
  }

  async boot(): Promise<void> {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' });
      });
    }

    await this.terminal.typewrite([
      ['Artem Popov — Software Engineer', 'out'],
      ['──────────────────────────────', 'out-dim'],
      ["Type 'help' to see available commands.", 'out-dim'],
    ]);

    this.booting = false;
    this.blinkCursor.classList.remove('is-hidden');
    this.input.focus();
  }

  private syncDisplay(): void {
    this.cmdTyped.textContent = this.input.value;
  }

  private execute(raw: string): void {
    const parts = raw.trim().split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!name) return;

    if (!this.shell.dispatch(name, args)) {
      this.terminal.out('bash: ' + name + ': command not found', 'out-err');
    }

    this.terminal.gap();
    this.terminal.scrollBottom();
  }

  private applyCompletion(matches: readonly string[], completed: string): void {
    if (matches.length === 1) {
      this.input.value = completed;
      this.syncDisplay();
    } else if (matches.length > 1) {
      this.terminal.echoCmd(this.input.value);
      this.terminal.out(matches.join('    '), 'out-dim');
      this.terminal.gap();
      this.terminal.scrollBottom();
    }
  }

  private zeroGRaf = 0;

  private triggerKonami(): void {
    this.terminal.gap();
    setTimeout(() => this.startZeroG(), 50);
  }

  private startZeroG(): void {
    if (this.zeroGRaf) return;

    const body = document.getElementById('t-body') as HTMLElement;
    const output = document.getElementById('output') as HTMLElement;
    const inputRow = document.querySelector('.input-row') as HTMLElement;

    body.classList.add('zero-g-active');

    const rand = (scale: number) => (Math.random() - 0.5) * scale;
    const margin = 20;

    const states = ([...Array.from(output.children), inputRow] as HTMLElement[]).map((el) => ({
      el: el as HTMLElement,
      x: 0,
      y: 0,
      rot: 0,
      vx: rand(0.5),
      vy: rand(0.5),
      vr: rand(0.07),
    }));

    const tick = () => {
      // Read all visual rects before any writes to avoid per-element layout thrash.
      // getBoundingClientRect accounts for rotation, so bounds work for any angle.
      const bRect = body.getBoundingClientRect();
      const W = body.clientWidth;
      const H = body.clientHeight;
      const rects = states.map((s) => s.el.getBoundingClientRect());

      for (let i = 0; i < states.length; i++) {
        const s = states[i];
        const r = rects[i];

        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.vr;

        // Visual edges relative to the body container (previous frame, ~0.3 px behind — imperceptible).
        const vLeft = r.left - bRect.left;
        const vRight = r.right - bRect.left;
        const vTop = r.top - bRect.top;
        const vBottom = r.bottom - bRect.top;

        if (vRight < margin) {
          s.x += margin - vRight;
          s.vx = Math.abs(s.vx);
        } else if (vLeft > W - margin) {
          s.x -= vLeft - (W - margin);
          s.vx = -Math.abs(s.vx);
        }

        if (vBottom < margin) {
          s.y += margin - vBottom;
          s.vy = Math.abs(s.vy);
        } else if (vTop > H - margin) {
          s.y -= vTop - (H - margin);
          s.vy = -Math.abs(s.vy);
        }

        s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`;
      }

      this.zeroGRaf = requestAnimationFrame(tick);
    };

    this.zeroGRaf = requestAnimationFrame(tick);
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (this.booting) return;

    if (e.key === this.konamiSeq[this.konamiProgress]) {
      this.konamiProgress++;
      if (this.konamiProgress === this.konamiSeq.length) {
        this.konamiProgress = 0;
        this.input.value = '';
        this.syncDisplay();
        this.triggerKonami();
        return;
      }
    } else {
      this.konamiProgress = e.key === this.konamiSeq[0] ? 1 : 0;
    }

    if (e.key === 'Enter') {
      const raw = this.input.value;
      this.terminal.echoCmd(raw);
      this.input.value = '';
      this.syncDisplay();
      if (raw.trim()) {
        this.history.unshift(raw.trim());
        this.histIdx = -1;
      }
      this.execute(raw);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.histIdx < this.history.length - 1) {
        this.histIdx++;
        this.input.value = this.history[this.histIdx];
        this.syncDisplay();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIdx > 0) {
        this.histIdx--;
        this.input.value = this.history[this.histIdx];
      } else {
        this.histIdx = -1;
        this.input.value = '';
      }
      this.syncDisplay();
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this.terminal.echoCmd(this.input.value + '^C');
      this.input.value = '';
      this.histIdx = -1;
      this.syncDisplay();
      this.terminal.gap();
      this.terminal.scrollBottom();
    } else if (e.key === 'Escape') {
      this.input.value = '';
      this.syncDisplay();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      this.terminal.clear();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = this.input.value;
      const spaceIdx = val.indexOf(' ');
      if (spaceIdx === -1) {
        const matches = this.shell.commandNames().filter((cmd) => cmd.startsWith(val));
        this.applyCompletion(matches, matches[0] + ' ');
      } else {
        const cmd = val.slice(0, spaceIdx).toLowerCase();
        const matches = this.shell.complete(cmd, val.slice(spaceIdx + 1));
        this.applyCompletion(matches, cmd + ' ' + matches[0]);
      }
    }
  }
}
