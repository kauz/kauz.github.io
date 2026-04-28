const PROMPT = 'apopov.dev:~$';

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function createHelpers(output: HTMLElement, termBody: HTMLElement) {
  function el(tag: string, cls?: string, text?: string): HTMLElement {
    const d = document.createElement(tag);
    if (cls) d.className = cls;
    if (text !== undefined) d.textContent = text;
    return d;
  }

  function out(text: string, cls = 'out') {
    output.appendChild(el('div', cls, text));
  }

  function outHTML(html: string, cls = 'out') {
    const d = el('div', cls);
    d.innerHTML = html;
    output.appendChild(d);
  }

  function gap() {
    output.appendChild(el('div', 'gap'));
  }

  function scrollBottom() {
    termBody.scrollTop = termBody.scrollHeight;
  }

  function echoCmd(cmd: string) {
    const row = el('div', 'cmd-line');
    row.appendChild(el('span', 'prompt', PROMPT));
    row.appendChild(el('span', '', ' ' + cmd));
    output.appendChild(row);
  }

  async function typewrite(lines: [string | null, string?][], charMs = 15) {
    for (const [text, cls] of lines) {
      if (text === null) {
        gap();
        await sleep(80);
        continue;
      }
      const d = el('div', cls);
      output.appendChild(d);
      for (const ch of text) {
        d.textContent += ch;
        await sleep(charMs);
      }
      scrollBottom();
      await sleep(110);
    }
  }

  return { out, outHTML, gap, scrollBottom, echoCmd, typewrite };
}
