import type { AppCtx, ShellState } from './types.ts';
import type { FileSystem } from './file-system.ts';
import { CHARACTER_DATA } from './characterData.ts';

const SOCIAL_GITHUB = import.meta.env.PUBLIC_SOCIAL_GITHUB ?? '';
const SOCIAL_LINKEDIN = import.meta.env.PUBLIC_SOCIAL_LINKEDIN ?? '';
const SOCIAL_EMAIL = import.meta.env.PUBLIC_SOCIAL_EMAIL ?? '';

export const THEMES = [
  'default',
  'light',
  'high-contrast',
  'deuteranopia',
  'solarized-light',
] as const;
export type Theme = (typeof THEMES)[number];

export const COMMAND_NAMES = [
  'help',
  'about',
  'skills',
  'cv',
  'blog',
  'open',
  'feed',
  'rss',
  'social',
  'clear',
  'date',
  'ls',
  'cd',
  'echo',
  'theme',
  'projects',
  'timeline',
  'whoami',
  'pwd',
  'cat',
  'history',
  'man',
  'vim',
  'nano',
  'cowsay',
] as const;

export class Commands {
  private readonly ctx: AppCtx;
  private readonly base: string;
  private readonly fileSystem: FileSystem;
  private readonly state: ShellState;

  constructor(ctx: AppCtx, state: ShellState, fileSystem: FileSystem) {
    this.ctx = ctx;
    this.state = state;
    this.base = import.meta.env.BASE_URL;
    this.fileSystem = fileSystem;
  }

  help(_args: string[]): void {
    const rows: [string, string][] = [
      ['help', 'Show this message'],
      ['about', 'Who I am'],
      ['skills', 'Tech stack'],
      ['cv', 'Download my CV (PDF)'],
      ['blog', 'List blog posts'],
      ['blog -w', 'Open blog listing in browser'],
      ['blog <slug>', 'Open a post'],
      ['open <slug>', 'Open a post (alias)'],
      ['feed', 'Open Atom feed'],
      ['social', 'Links — GitHub, LinkedIn, email'],
      ['projects', 'List projects'],
      ['projects -w', 'Open projects listing in browser'],
      ['projects <slug>', 'Open a project'],
      ['timeline', 'Career timeline'],
      ['whoami', 'Who are you?'],
      ['ls [path]', 'List directory contents'],
      ['cd [path]', 'Change directory'],
      ['pwd', 'Print working directory'],
      ['cat <file>', 'Open a file'],
      ['clear', 'Clear the terminal'],
      ['history', 'Show session history'],
      ['date', 'Print current date'],
      ['echo <text>', 'Echo text'],
      ['theme [name]', 'List or switch color themes'],
      ['man <cmd>', 'Manual page for a command'],
      ['cowsay <text>', 'Important announcements'],
    ];
    this.ctx.io.out('Available commands:');
    rows.forEach(([cmd, desc]) => this.ctx.io.out('  ' + cmd.padEnd(24) + desc));
  }

  about(_args: string[]): void {
    this.ctx.io.out('Artem Popov');
    this.ctx.io.out('Software Engineer');
    this.ctx.io.gap();
    this.ctx.io.out('I build products for the web — backend-leaning, with a taste for clean');
    this.ctx.io.out('interfaces and reliable systems.');
    this.ctx.io.gap();
    this.ctx.io.out(
      "This site is an Astro SSG app hosted on Github Pages. Type 'help' to explore."
    );
  }

  skills(_args: string[]): void {
    this.ctx.io.out('Languages:    JavaScript/TypeScript · Python · Go · C++ · PHP');
    this.ctx.io.out('Backend:      Node.js · PostgreSQL · NoSQL · Redis · Kafka');
    this.ctx.io.out('Frontend:     Astro · Next.js · React · HTML/CSS · Three.js');
    this.ctx.io.out('Tools:        Git · Docker · Linux · Kubernetes');
  }

  cv(_args: string[]): void {
    this.ctx.io.out('Opening CV…', 'out-dim');
    window.open('/cv.pdf', '_blank');
  }

  blog(args: string[]): void {
    const flag = args[0];
    if (flag === '-w' || flag === '--web') {
      this.ctx.io.out('Opening blog listing…', 'out-dim');
      setTimeout(() => window.open(this.base + 'blog/', '_self'), 150);
    } else if (flag) {
      this.#openContent(flag, this.ctx.postData, 'blog', 'Post');
    } else {
      this.#listContent(this.ctx.postData, 'blog', 'blog posts');
    }
  }

  feed(_args: string[]): void {
    this.ctx.io.out('Opening Atom feed…', 'out-dim');
    setTimeout(() => window.open(this.base + 'feed.xml', '_blank'), 150);
  }

  open(args: string[]): void {
    if (args.length > 0) this.#openContent(args[0], this.ctx.postData, 'blog', 'Post');
    else this.ctx.io.out('Usage: open <slug>', 'out-err');
  }

  social(_args: string[]): void {
    if (SOCIAL_GITHUB)
      this.ctx.io.outHTML(
        `GitHub    <a href="${SOCIAL_GITHUB}" target="_blank" rel="noopener">${SOCIAL_GITHUB.replace('https://', '')}</a>`
      );
    if (SOCIAL_LINKEDIN)
      this.ctx.io.outHTML(
        `LinkedIn  <a href="${SOCIAL_LINKEDIN}" target="_blank" rel="noopener">${SOCIAL_LINKEDIN.replace('https://', '')}</a>`
      );
    if (SOCIAL_EMAIL) {
      const rev = (s: string) => s.split('').reverse().join('');
      const [user, domain] = SOCIAL_EMAIL.split('@');
      const p1 = rev(user);
      const p2 = rev(domain);
      this.ctx.io.outHTML(
        `Email     <span class="dont-look-here" role="button" tabindex="0" aria-label="Reveal email address" data-p1="${p1}" data-p2="${p2}" onclick="var r=function(s){return s.split('').reverse().join('')};var e=r(this.dataset.p1)+'@'+r(this.dataset.p2);var a=document.createElement('a');a.href='mailto:'+e;a.textContent=e;this.replaceWith(a)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</span>`
      );
    }
  }

  clear(_args: string[]): void {
    this.ctx.io.clear();
  }

  date(_args: string[]): void {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    };
    this.ctx.io.out(new Intl.DateTimeFormat('en-GB', options).format(new Date()).replace(',', ''));
  }

  ls(args: string[]): void {
    const target = args[0];
    const dir = target ? this.fileSystem.resolveDir(target) : this.fileSystem.getCwd();
    if (dir === null) {
      this.ctx.io.out(`ls: ${args[0]}: No such file or directory`, 'out-err');
      return;
    }
    const entries = this.fileSystem.entries(dir);
    if (entries.length === 0) return;
    const dirs: string[] = [];
    const files: string[] = [];
    for (const e of entries) (e.endsWith('/') ? dirs : files).push(e);
    if (dirs.length)
      this.ctx.io.outHTML(
        dirs.map((d) => `<span style="color:var(--green)">${d}</span>`).join('  ')
      );
    if (files.length) this.ctx.io.out(files.join('  '));
  }

  cd(args: string[]): void {
    const target = args[0] ?? '~';
    if (target === '-') {
      this.fileSystem.back();
      return;
    }
    const dir = this.fileSystem.resolveDir(target);
    if (dir === null) {
      this.ctx.io.out(`cd: ${target}: No such file or directory`, 'out-err');
      return;
    }
    this.fileSystem.setCwd(dir);
  }

  echo(args: string[]): void {
    this.ctx.io.out(args.join(' '));
  }

  projects(args: string[]): void {
    const flag = args[0];
    if (flag === '-w' || flag === '--web') {
      this.ctx.io.out('Opening projects listing…', 'out-dim');
      setTimeout(() => window.open(this.base + 'projects/', '_self'), 150);
    } else if (flag) {
      this.#openContent(flag, this.ctx.projectData, 'projects', 'Project');
    } else {
      this.#listContent(this.ctx.projectData, 'projects', 'projects');
    }
  }

  timeline(_args: string[]): void {
    const rows: [string, string][] = [
      // ['2024 – present', 'Software Engineer @ Acme Corp'],
      // ['2022 – 2024', 'Backend Developer @ Startup Inc'],
      // ['2018 – 2022', 'B.Sc. Computer Science, University of Somewhere'],
    ];
    this.ctx.io.out('Career timeline:');
    this.ctx.io.gap();
    rows.forEach(([period, role]) => {
      this.ctx.io.out(`  ${period.padEnd(16)}${role}`);
    });
  }

  whoami(_args: string[]): void {
    const g = (s: string) => `<span style="color:var(--green);font-weight:bold">${s}</span>`;
    const slug = this.state.userSlug;
    const name = this.ctx.userName;
    const info = CHARACTER_DATA[slug];

    if (slug === 'ivanna') {
      this.ctx.io.outHTML(g('Fluoriteen'));
      this.ctx.io.out('─'.repeat(Math.min(slug.length + 2, 42)));
      this.ctx.io.gap();
      this.ctx.io.out('My beloved');
      return;
    }

    this.ctx.io.outHTML(g(name));
    this.ctx.io.out('─'.repeat(Math.min(name.length + 2, 42)));
    if (info) {
      this.ctx.io.out(info.affiliation, 'out-dim');
      this.ctx.io.gap();
      this.ctx.io.out(info.description);
    } else {
      this.ctx.io.out('No further information available.', 'out-dim');
    }
  }

  pwd(_args: string[]): void {
    this.ctx.io.out(this.fileSystem.getCwd());
  }

  cat(args: string[]): void {
    if (!args[0]) {
      this.ctx.io.out('Usage: cat <file>', 'out-err');
      return;
    }
    const target = args[0];
    const lastSlash = target.lastIndexOf('/');
    const fileName = lastSlash >= 0 ? target.slice(lastSlash + 1) : target;
    const dirPart = lastSlash >= 0 ? target.slice(0, lastSlash) : null;

    const dir = dirPart !== null ? this.fileSystem.resolveDir(dirPart) : this.fileSystem.getCwd();
    if (dir === null) {
      this.ctx.io.out(`cat: ${target}: No such file or directory`, 'out-err');
      return;
    }

    const entries = this.fileSystem.entries(dir);
    if (!entries.includes(fileName)) {
      this.ctx.io.out(`cat: ${target}: No such file or directory`, 'out-err');
      return;
    }

    const slug = fileName.replace(/\.md$/, '');
    if (dir === '~/blog') {
      this.#openContent(slug, this.ctx.postData, 'blog', 'Post');
    } else if (dir === '~/projects') {
      this.#openContent(slug, this.ctx.projectData, 'projects', 'Project');
    } else {
      this.ctx.io.out(`cat: ${target}: binary or unreadable file`, 'out-dim');
    }
  }

  history(_args: string[]): void {
    const hist = this.ctx.getHistory();
    if (hist.length === 0) {
      this.ctx.io.out('No commands in history.', 'out-dim');
      return;
    }
    [...hist].reverse().forEach((cmd, i) => {
      this.ctx.io.out(`  ${String(i + 1).padStart(3)}  ${cmd}`);
    });
  }

  man(args: string[]): void {
    const cmd = args[0];
    if (!cmd) {
      this.ctx.io.out('Usage: man <command>', 'out-err');
      this.ctx.io.out('Example: man blog', 'out-dim');
      return;
    }

    const pages: Record<string, () => void> = {
      help: () => {
        this.ctx.io.outHTML(this.#bold('help') + ' — show all available commands');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: help');
      },
      about: () => {
        this.ctx.io.outHTML(this.#bold('about') + ' — display info about the site author');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: about');
      },
      skills: () => {
        this.ctx.io.outHTML(this.#bold('skills') + ' — display the tech stack');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: skills');
      },
      cv: () => {
        this.ctx.io.outHTML(this.#bold('cv') + ' — open the CV PDF in a new tab');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: cv');
      },
      blog: () => {
        this.ctx.io.outHTML(this.#bold('blog') + ' — list and navigate blog posts');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: blog [options | slug]');
        this.ctx.io.gap();
        this.ctx.io.outHTML(
          '  ' + this.#dim('(no args)') + '       List all posts with dates and slugs'
        );
        this.ctx.io.outHTML(
          '  ' + this.#dim('-w, --web') + '       Open the blog listing page in the browser'
        );
        this.ctx.io.outHTML('  ' + this.#dim('<slug>') + '          Navigate to a specific post');
        this.ctx.io.gap();
        this.ctx.io.out('See also: open, feed');
      },
      open: () => {
        this.ctx.io.outHTML(
          this.#bold('open') + ' — open a blog post by slug (alias for blog <slug>)'
        );
        this.ctx.io.gap();
        this.ctx.io.out('Usage: open <slug>');
      },
      feed: () => {
        this.ctx.io.outHTML(this.#bold('feed') + ' — open the Atom/RSS feed in a new tab');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: feed');
        this.ctx.io.out('       rss   (alias)');
      },
      rss: () => {
        this.ctx.io.outHTML(this.#bold('rss') + ' — alias for ' + this.#bold('feed'));
        this.ctx.io.gap();
        this.ctx.io.out('See also: feed');
      },
      social: () => {
        this.ctx.io.outHTML(this.#bold('social') + ' — display social/contact links');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: social');
        this.ctx.io.gap();
        this.ctx.io.out('  Shows GitHub, LinkedIn, and email (click to reveal).');
      },
      projects: () => {
        this.ctx.io.outHTML(this.#bold('projects') + ' — list and navigate projects');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: projects [options | slug]');
        this.ctx.io.gap();
        this.ctx.io.outHTML('  ' + this.#dim('(no args)') + '       List all projects');
        this.ctx.io.outHTML(
          '  ' + this.#dim('-w, --web') + '       Open the projects listing page in the browser'
        );
        this.ctx.io.outHTML(
          '  ' + this.#dim('<slug>') + '          Navigate to a specific project'
        );
      },
      timeline: () => {
        this.ctx.io.outHTML(this.#bold('timeline') + ' — display career and education timeline');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: timeline');
      },
      whoami: () => {
        this.ctx.io.outHTML(this.#bold('whoami') + ' — show info about your current character');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: whoami');
        this.ctx.io.gap();
        this.ctx.io.out(
          '  Your identity is assigned at first visit based on your browser fingerprint.'
        );
        this.ctx.io.out('  99 Star Wars characters are possible.');
      },
      pwd: () => {
        this.ctx.io.outHTML(this.#bold('pwd') + ' — print working directory');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: pwd');
        this.ctx.io.gap();
        this.ctx.io.out('See also: ls, cd');
      },
      cat: () => {
        this.ctx.io.outHTML(
          this.#bold('cat') + ' — open a file (navigates to blog post or project)'
        );
        this.ctx.io.gap();
        this.ctx.io.out('Usage: cat <file>');
        this.ctx.io.gap();
        this.ctx.io.out('  cat hello-world.md         open post (from ~/blog)');
        this.ctx.io.out('  cat blog/hello-world.md    open post (from anywhere)');
        this.ctx.io.gap();
        this.ctx.io.out('See also: ls, cd, blog, projects');
      },
      ls: () => {
        this.ctx.io.outHTML(this.#bold('ls') + ' — list directory contents');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: ls [path]');
        this.ctx.io.gap();
        this.ctx.io.out(
          '  Directories are shown in green. Omit path to list the current directory.'
        );
        this.ctx.io.gap();
        this.ctx.io.out('See also: cd, pwd, cat');
      },
      cd: () => {
        this.ctx.io.outHTML(this.#bold('cd') + ' — change the working directory');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: cd [path]');
        this.ctx.io.gap();
        this.ctx.io.outHTML('  ' + this.#dim('(no args)') + '    Go to home (~)');
        this.ctx.io.outHTML('  ' + this.#dim('..') + '           Go up one level');
        this.ctx.io.outHTML('  ' + this.#dim('-') + '            Go to previous directory');
        this.ctx.io.gap();
        this.ctx.io.out('See also: ls, pwd');
      },
      history: () => {
        this.ctx.io.outHTML(this.#bold('history') + ' — show commands typed this session');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: history');
        this.ctx.io.gap();
        this.ctx.io.out('  Commands are listed oldest-first with sequential numbers.');
      },
      clear: () => {
        this.ctx.io.outHTML(this.#bold('clear') + ' — clear the terminal output');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: clear');
        this.ctx.io.gap();
        this.ctx.io.out('  Tip: Ctrl+L does the same thing.');
      },
      date: () => {
        this.ctx.io.outHTML(this.#bold('date') + ' — print the current date and time');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: date');
      },
      echo: () => {
        this.ctx.io.outHTML(this.#bold('echo') + ' — print text to the terminal');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: echo <text>');
      },
      theme: () => {
        this.ctx.io.outHTML(this.#bold('theme') + ' — list or switch color themes');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: theme [name]');
        this.ctx.io.gap();
        this.ctx.io.outHTML(
          '  ' + this.#dim('(no args)') + '    List themes and show the active one'
        );
        this.ctx.io.outHTML('  ' + this.#dim('<name>') + '       Switch to the named theme');
        this.ctx.io.gap();
        this.ctx.io.out('  Available: ' + [...THEMES].join(', '));
      },
      man: () => {
        this.ctx.io.outHTML(this.#bold('man') + ' — show the manual page for a command');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: man <command>');
        this.ctx.io.gap();
        this.ctx.io.out('  Tab-completes command names.');
      },
      vim: () => {
        this.ctx.io.outHTML(this.#bold('vim') + ' — open vim');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: vim [file]');
        this.ctx.io.gap();
        this.ctx.io.out('  Famous for being impossible to exit. You have been warned.');
        this.ctx.io.out('  Type :q! to attempt escape.');
      },
      nano: () => {
        this.ctx.io.outHTML(this.#bold('nano') + ' — command not found');
        this.ctx.io.gap();
        this.ctx.io.out("  nano isn't installed. Have you tried vim?");
        this.ctx.io.gap();
        this.ctx.io.out('See also: vim');
      },
      cowsay: () => {
        this.ctx.io.outHTML(this.#bold('cowsay') + ' — let a cow deliver your message');
        this.ctx.io.gap();
        this.ctx.io.out('Usage: cowsay <text>');
        this.ctx.io.gap();
        this.ctx.io.out('  For important announcements only.');
      },
    };

    const page = pages[cmd];
    if (!page) {
      this.ctx.io.out(`No manual entry for ${cmd}`, 'out-err');
    } else {
      page();
    }
  }

  vim(args: string[]): void {
    const file = args[0] ?? 'untitled';
    const g = (s: string) => `<span style="color:var(--fg-dim)">${s}</span>`;
    this.ctx.io.out('');
    this.ctx.io.out('~');
    this.ctx.io.out('~');
    this.ctx.io.out('~');
    this.ctx.io.out(`"${file}" [New File] 0L, 0C`);
    this.ctx.io.out('-- INSERT --');
    this.ctx.io.outHTML(
      `${g('You appear to be stuck. Type ')}` +
        `<span style="font-weight:bold">:q!</span>` +
        `${g(" to exit. (It won't work here.)")}`
    );
  }

  nano(_args: string[]): void {
    this.ctx.io.out("nano: command not found. Did you mean 'vim'?", 'out-err');
  }

  cowsay(args: string[]): void {
    const message = args.join(' ') || 'Moo';
    const len = message.length;
    const top = ' ' + '_'.repeat(len + 2);
    const mid = `< ${message} >`;
    const bot = ' ' + '-'.repeat(len + 2);
    this.ctx.io.out(top);
    this.ctx.io.out(mid);
    this.ctx.io.out(bot);
    this.ctx.io.out('        \\   ^__^');
    this.ctx.io.out('         \\  (oo)\\_______');
    this.ctx.io.out('            (__)\\       )\\/\\');
    this.ctx.io.out('                ||----w |');
    this.ctx.io.out('                ||     ||');
  }

  sudo(_args: string[]): void {
    this.ctx.io.out("I'm sorry, Dave. I'm afraid I can't do that.", 'out-err');
  }

  rm(args: string[]): void {
    const recursive = args.some((a) => /^-[a-z]*r/i.test(a) || a === '--recursive');
    if (recursive) {
      this.ctx.io.out("I'm sorry, Dave. I'm afraid I can't do that.", 'out-err');
    } else {
      this.ctx.io.out('rm: missing operand', 'out-err');
    }
  }

  neofetch(_args?: string[]): void {
    const theme = document.documentElement.dataset.theme ?? 'default';
    const browser = (() => {
      const ua = navigator.userAgent;
      if (ua.includes('Firefox/')) return 'Firefox';
      if (ua.includes('Edg/')) return 'Edge';
      if (ua.includes('Chrome/')) return 'Chrome';
      if (ua.includes('Safari/')) return 'Safari';
      return 'Unknown';
    })();
    const os = (() => {
      const ua = navigator.userAgent;
      if (ua.includes('Win')) return 'Windows';
      if (ua.includes('Mac')) return 'MacOS';
      if (ua.includes('Linux')) return 'Linux';
      if (ua.includes('Android')) return 'Android';
      if (ua.includes('like Mac')) return 'iOS';
      return 'Unknown';
    })();

    const upSec = Math.floor((Date.now() - performance.timeOrigin) / 1000);
    const uptime = upSec < 60 ? `${upSec}s` : `${Math.floor(upSec / 60)}m ${upSec % 60}s`;
    const g = (s: string) => `<span style="color:var(--green);font-weight:bold">${s}</span>`;

    const info: string[] = [
      g(`${this.state.userSlug}@holonet`),
      '─────────────────────',
      `${g('OS')}: ${os}`,
      `${g('Host')}: GitHub Pages`,
      `${g('Kernel')}: [DELETED]`,
      `${g('Packages')}: [DELETED]`,
      `${g('Shell')}: [DELETED]`,
      `${g('Resolution')}: ${screen.width}x${screen.height}`,
      `${g('Browser')}: ${browser}`,
      `${g('Theme')}: ${theme}`,
      `${g('Font')}: Courier New 0.95rem`,
      `${g('Uptime')}: ${uptime}`,
      '',
      '<span style="background:var(--fg-dim)">   </span>' +
        '<span style="background:var(--fg)">   </span>' +
        '<span style="background:var(--green)">   </span>' +
        '<span style="background:var(--red)">   </span>',
    ];

    const infoHtml = info.map((line) => `<div>${line}</div>`).join('');
    this.ctx.io.outHTML(
      `<div style="display:flex;gap:1.5rem;align-items:flex-start">` +
        `<img src="${this.base}assets/ricing_girl.png" alt="" style="height: auto; width: 13.5rem" />` +
        `<div style="line-height:1.5">${infoHtml}</div>` +
        `</div>`
    );
  }

  theme(args: string[]): void {
    const name = args[0];
    if (!name) {
      this.ctx.io.out('Available themes:');
      THEMES.forEach((t) => {
        const active = (document.documentElement.dataset.theme ?? 'default') === t;
        this.ctx.io.out('  ' + t + (active ? '  ← active' : ''));
      });
      this.ctx.io.out('Usage: theme <name>', 'out-dim');
      return;
    }
    if (!THEMES.includes(name as Theme)) {
      this.ctx.io.out('Unknown theme: ' + name, 'out-err');
      this.ctx.io.out('Available: ' + THEMES.join(', '), 'out-dim');
      return;
    }
    if (name === 'default') {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem('term-theme');
    } else {
      document.documentElement.dataset.theme = name;
      localStorage.setItem('term-theme', name);
    }
    this.ctx.io.out('Theme: ' + name);
  }

  ivanna() {
    this.state.userSlug = 'ivanna';
    this.state.promptSymbol = '💜';
    this.ctx.onCwdChange();
    return true;
  }

  #listContent(
    items: { slug: string; date: string; title: string }[],
    urlPrefix: string,
    noun: string
  ): void {
    if (items.length === 0) {
      this.ctx.io.out(`No ${noun} yet.`);
      return;
    }
    this.ctx.io.out(`${noun[0].toUpperCase() + noun.slice(1)}:`);
    items.forEach((p) => {
      const pad = ' '.repeat(Math.max(1, 28 - p.slug.length));
      this.ctx.io.outHTML(
        `  ${p.date}  <a href="${this.base}${urlPrefix}/${p.slug}">${p.slug}</a>${pad}${p.title}`
      );
    });
  }

  #openContent(
    slug: string,
    data: { slug: string; title: string }[],
    urlPrefix: string,
    noun: string
  ): void {
    const item = data.find((p) => p.slug === slug);
    if (item) {
      this.ctx.io.out(`Opening "${item.title}"…`, 'out-dim');
      setTimeout(() => {
        window.location.href = `${this.base}${urlPrefix}/${slug}/`;
      }, 250);
    } else {
      this.ctx.io.out(`${noun} not found: ${slug}`, 'out-err');
      this.ctx.io.out(`Type '${urlPrefix}' to list available ${noun.toLowerCase()}s.`, 'out-dim');
    }
  }

  #bold(s: string): string {
    return `<span style="font-weight:bold">${s}</span>`;
  }

  #dim(s: string): string {
    return `<span style="color:var(--fg-dim)">${s}</span>`;
  }
}
