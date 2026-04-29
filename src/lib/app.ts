import { Terminal } from './terminal';
import { Commands } from './commands';
import type { IVisitor } from './visitor.ts';

export class App {
  public visitor: IVisitor;
  private terminal!: Terminal;
  private commands!: Commands;
  private history: string[] = [];
  private histIdx = -1;
  private cursorTimer!: ReturnType<typeof setTimeout>;
  private booting = true;
  private cwd = '~';
  private prevCwd = '~';

  private input!: HTMLInputElement;
  private cmdTyped!: HTMLElement;
  private blinkCursor!: HTMLElement;
  private promptEl!: HTMLElement;

  constructor(visitor: IVisitor) {
    this.visitor = visitor;
  }

  async boot(): Promise<void> {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' });
      });
    }

    const termBody = document.getElementById('t-body') as HTMLElement;
    const output = document.getElementById('output') as HTMLElement;
    this.input = document.getElementById('cmd-input') as HTMLInputElement;
    this.cmdTyped = document.getElementById('cmd-typed') as HTMLElement;
    this.blinkCursor = document.getElementById('blink-cursor') as HTMLElement;
    this.promptEl = document.getElementById('prompt') as HTMLElement;
    const postData = JSON.parse(
      (document.getElementById('terminal') as HTMLElement).dataset.posts ?? '[]'
    );

    this.promptEl.textContent = this.getPrompt();

    this.terminal = new Terminal(output, termBody, () => this.getPrompt());
    this.commands = new Commands({
      postData,
      out: this.terminal.out.bind(this.terminal),
      outHTML: this.terminal.outHTML.bind(this.terminal),
      gap: this.terminal.gap.bind(this.terminal),
      clear: this.terminal.clear.bind(this.terminal),
      getCwd: () => this.cwd,
      getPrevCwd: () => this.prevCwd,
      setCwd: this.setCwd.bind(this),
    });

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

    await this.terminal.typewrite([
      ['Artem Popov — Software Engineer', 'out'],
      ['──────────────────────────────', 'out-dim'],
      ["Type 'help' to see available commands.", 'out-dim'],
    ]);

    this.booting = false;
    this.blinkCursor.classList.remove('is-hidden');
    this.input.focus();
  }

  private getPrompt(): string {
    return `${this.visitor.slug}@holonet:${this.cwd}$`;
  }

  private setCwd(path: string): void {
    this.prevCwd = this.cwd;
    this.cwd = path;
    this.promptEl.textContent = this.getPrompt();
  }

  private syncDisplay(): void {
    this.cmdTyped.textContent = this.input.value;
  }

  private execute(raw: string): void {
    const parts = raw.trim().split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (!name) return;

    if (!this.commands.dispatch(name, args)) {
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

  private handleKeydown(e: KeyboardEvent): void {
    if (this.booting) return;

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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = this.input.value;
      const spaceIdx = val.indexOf(' ');
      if (spaceIdx === -1) {
        const matches = this.commands.commandNames().filter((cmd) => cmd.startsWith(val));
        this.applyCompletion(matches, matches[0] + ' ');
      } else {
        const cmd = val.slice(0, spaceIdx).toLowerCase();
        const matches = this.commands.complete(cmd, val.slice(spaceIdx + 1));
        this.applyCompletion(matches, cmd + ' ' + matches[0]);
      }
    }
  }
}
