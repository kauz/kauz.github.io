import type { IOutput } from './types.ts';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class Terminal implements IOutput {
  private readonly output: HTMLElement;
  private readonly termBody: HTMLElement;
  private readonly getPrompt: () => string;

  constructor(output: HTMLElement, termBody: HTMLElement, getPrompt: () => string) {
    this.output = output;
    this.termBody = termBody;
    this.getPrompt = getPrompt;
  }

  private el(tag: string, cls?: string, text?: string): HTMLElement {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (text !== undefined) d.textContent = text;
    return d;
  }

  out(text: string, cls = 'out'): void {
    this.output.appendChild(this.el('div', cls, text));
  }

  outHTML(html: string, cls = 'out'): void {
    const d = this.el('div', cls);
    d.innerHTML = html;
    this.output.appendChild(d);
  }

  gap(): void {
    this.output.appendChild(this.el('div', 'gap'));
  }

  scrollBottom(): void {
    this.termBody.scrollTop = this.termBody.scrollHeight;
  }

  clear(): void {
    this.output.innerHTML = '';
  }

  echoCmd(cmd: string): void {
    const row = this.el('div', 'cmd-line');
    row.appendChild(this.el('span', 'prompt', this.getPrompt()));
    row.appendChild(this.el('span', '', cmd));
    this.output.appendChild(row);
  }

  async typewrite(lines: [string | null, string?][], charMs = 15): Promise<void> {
    for (const [text, cls] of lines) {
      if (text === null) {
        this.gap();
        await sleep(80);
        continue;
      }
      const d = this.el('div', cls);
      this.output.appendChild(d);
      for (const ch of text) {
        d.textContent += ch;
        await sleep(charMs);
      }
      this.scrollBottom();
      await sleep(110);
    }
  }
}
