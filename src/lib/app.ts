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
