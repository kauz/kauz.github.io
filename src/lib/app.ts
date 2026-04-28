import { createHelpers } from './terminal';
import { createCommands } from './commands';

export async function boot() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' });
    });
  }

  const termBody = document.getElementById('t-body') as HTMLElement;
  const output = document.getElementById('output') as HTMLElement;
  const input = document.getElementById('cmd-input') as HTMLInputElement;
  const cmdTyped = document.getElementById('cmd-typed') as HTMLElement;
  const blinkCursor = document.getElementById('blink-cursor') as HTMLElement;
  const promptEl = document.getElementById('prompt') as HTMLElement;
  const postData = JSON.parse(
    (document.getElementById('terminal') as HTMLElement).dataset.posts ?? '[]'
  );

  let cwd = '~';
  let prevCwd = '~';

  function getPrompt() {
    return `apopov.dev:${cwd}$`;
  }

  function setCwd(path: string) {
    prevCwd = cwd;
    cwd = path;
    promptEl.textContent = getPrompt();
  }

  const history: string[] = [];
  let histIdx = -1;
  let cursorTimer: ReturnType<typeof setTimeout>;
  let booting = true;

  const { out, outHTML, gap, scrollBottom, echoCmd, typewrite } = createHelpers(
    output,
    termBody,
    getPrompt
  );
  const COMMANDS = createCommands({
    postData,
    output,
    out,
    outHTML,
    gap,
    scrollBottom,
    getCwd: () => cwd,
    getPrevCwd: () => prevCwd,
    setCwd,
  });

  function syncDisplay() {
    cmdTyped.textContent = input.value;
  }

  input.addEventListener('input', () => {
    syncDisplay();
    blinkCursor.classList.add('is-paused');
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => blinkCursor.classList.remove('is-paused'), 600);
  });

  input.addEventListener('blur', () => blinkCursor.classList.add('is-hidden'));
  input.addEventListener('focus', () => blinkCursor.classList.remove('is-hidden'));

  function execute(raw: string) {
    const parts = raw.trim().split(/\s+/);
    const command = parts[0].toLowerCase() as keyof typeof COMMANDS;
    const args = parts.slice(1);

    if (!command) return;

    if (command in COMMANDS) {
      COMMANDS[command](args);
    } else {
      out('bash: ' + command + ': command not found', 'out-err');
    }

    gap();
    scrollBottom();
  }

  input.addEventListener('keydown', (e) => {
    if (booting) return;
    if (e.key === 'Enter') {
      const raw = input.value;
      echoCmd(raw);
      input.value = '';
      syncDisplay();
      if (raw.trim()) {
        history.unshift(raw.trim());
        histIdx = -1;
      }
      execute(raw);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) {
        histIdx++;
        input.value = history[histIdx];
        syncDisplay();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) {
        histIdx--;
        input.value = history[histIdx];
      } else {
        histIdx = -1;
        input.value = '';
      }
      syncDisplay();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = input.value;
      const spaceIdx = val.indexOf(' ');
      if (spaceIdx === -1) {
        const matches = Object.keys(COMMANDS).filter((cmd) => cmd.startsWith(val));
        if (matches.length === 1) {
          input.value = matches[0] + ' ';
          syncDisplay();
        } else if (matches.length > 1) {
          echoCmd(val);
          out(matches.join('    '), 'out-dim');
          gap();
          scrollBottom();
        }
      } else {
        const cmd = val.slice(0, spaceIdx).toLowerCase();
        const partial = val.slice(spaceIdx + 1);
        const matches = COMMANDS.complete(cmd, partial);
        if (matches.length === 1) {
          input.value = cmd + ' ' + matches[0];
          syncDisplay();
        } else if (matches.length > 1) {
          echoCmd(val);
          out(matches.join('    '), 'out-dim');
          gap();
          scrollBottom();
        }
      }
    }
  });

  document.addEventListener('click', () => input.focus());

  blinkCursor.classList.add('is-hidden');

  await typewrite([
    ['apopov.dev — software engineer', 'out'],
    ['──────────────────────────────', 'out-dim'],
    ["Type 'help' to see available commands.", 'out-dim'],
  ]);

  booting = false;
  blinkCursor.classList.remove('is-hidden');
  input.focus();
}
