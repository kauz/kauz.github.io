import type { IOutput } from './types.ts';

type Post = { slug: string; title: string; date: string; description: string };

interface Ctx {
  postData: Post[];
  output: IOutput;
  visitorSlug: string;
  onCwdChange: () => void;
}

const THEMES = ['default', 'light', 'high-contrast', 'deuteranopia', 'solarized-light'] as const;
type Theme = (typeof THEMES)[number];

const COMMAND_NAMES = [
  'help',
  'about',
  'skills',
  'cv',
  'blog',
  'open',
  'social',
  'clear',
  'date',
  'ls',
  'cd',
  'echo',
  'theme',
] as const;

export class Shell {
  private readonly postData: Post[];
  private readonly output: IOutput;
  private readonly visitorSlug: string;
  private readonly onCwdChange: () => void;
  private readonly base: string;
  private readonly fs: Record<string, string[]>;
  private readonly slugs: string[];
  private readonly completions: Record<string, () => string[]>;
  private cwd = '~';
  private prevCwd = '~';
  private promptSymbol = '$';

  constructor(ctx: Ctx) {
    this.postData = ctx.postData;
    this.output = ctx.output;
    this.visitorSlug = ctx.visitorSlug;
    this.onCwdChange = ctx.onCwdChange;
    this.base = import.meta.env.BASE_URL;
    this.slugs = ctx.postData.map((p) => p.slug);
    this.fs = {
      '~': ['blog/'],
      '~/blog': this.slugs.map((s) => s + '.md'),
    };
    this.completions = {
      blog: () => this.slugs,
      open: () => this.slugs,
      cd: () => this.fs[this.cwd] ?? [],
      ls: () => this.fs[this.cwd] ?? [],
      theme: () => [...THEMES],
    };
  }

  getPrompt(): string {
    return `${this.visitorSlug}@holonet:${this.cwd}${this.promptSymbol}`;
  }

  dispatch(name: string, args: string[]): boolean {
    switch (name) {
      case 'help':
        this.help(args);
        break;
      case 'about':
        this.about(args);
        break;
      case 'skills':
        this.skills(args);
        break;
      case 'cv':
        this.cv(args);
        break;
      case 'blog':
        this.blog(args);
        break;
      case 'open':
        this.open(args);
        break;
      case 'social':
        this.social(args);
        break;
      case 'clear':
        this.clear(args);
        break;
      case 'date':
        this.date(args);
        break;
      case 'ls':
        this.ls(args);
        break;
      case 'cd':
        this.cd(args);
        break;
      case 'echo':
        this.echo(args);
        break;
      case 'theme':
        this.theme(args);
        break;
      case 'sudo':
        this.sudo(args);
        break;
      case 'rm':
        this.rm(args);
        break;
      case 'neofetch':
        this.neofetch();
        break;
      case 'ivanna':
        this.promptSymbol = '💜';
        this.onCwdChange();
        break;
      default:
        return false;
    }
    return true;
  }

  commandNames(): readonly string[] {
    return COMMAND_NAMES;
  }

  complete(cmd: string, partial: string): string[] {
    const getCandidates = this.completions[cmd];
    if (!getCandidates) return [];
    return getCandidates().filter((s) => s.startsWith(partial));
  }

  private resolveDir(target: string): string | null {
    const t = target.replace(/\/+$/, '');
    if (!t || t === '~') return '~';
    if (t === '..') return this.cwd === '~' ? '~' : this.cwd.slice(0, this.cwd.lastIndexOf('/'));
    const abs = t.startsWith('~') ? t : `${this.cwd}/${t}`;
    return abs in this.fs ? abs : null;
  }

  private setCwd(cwd: string): void {
    this.prevCwd = this.cwd;
    this.cwd = cwd;
    this.onCwdChange();
  }

  private listPosts(): void {
    if (this.postData.length === 0) {
      this.output.out('No posts yet.');
      return;
    }
    this.output.out('Blog posts:');
    this.postData.forEach((p) => {
      const pad = ' '.repeat(Math.max(1, 28 - p.slug.length));
      this.output.outHTML(
        `  ${p.date}  <a href="${this.base}blog/${p.slug}">${p.slug}</a>${pad}${p.title}`
      );
    });
  }

  private openPost(slug: string): void {
    const post = this.postData.find((p) => p.slug === slug);
    if (post) {
      this.output.out(`Opening "${post.title}"…`, 'out-dim');
      setTimeout(() => {
        window.location.href = this.base + 'blog/' + slug;
      }, 250);
    } else {
      this.output.out('Post not found: ' + slug, 'out-err');
      this.output.out("Type 'blog' to list available posts.", 'out-dim');
    }
  }

  private help(_args: string[]): void {
    const rows: [string, string][] = [
      ['help', 'Show this message'],
      ['about', 'Who I am'],
      ['skills', 'Tech stack'],
      ['cv', 'Download my CV (PDF)'],
      ['blog', 'List blog posts'],
      ['blog <slug>', 'Open a post'],
      ['open <slug>', 'Open a post (alias)'],
      ['social', 'Links — GitHub, LinkedIn, email'],
      ['ls [path]', 'List directory contents'],
      ['cd [path]', 'Change directory'],
      ['clear', 'Clear the terminal'],
      ['date', 'Print current date'],
      ['echo <text>', 'Echo text'],
      ['theme [name]', 'List or switch color themes'],
    ];
    this.output.out('Available commands:');
    rows.forEach(([cmd, desc]) => this.output.out('  ' + cmd.padEnd(22) + desc));
  }

  private about(_args: string[]): void {
    this.output.out('Artem Popov');
    this.output.out('Software Engineer');
    this.output.gap();
    this.output.out('I build products for the web — backend-leaning, with a taste for clean');
    this.output.out('interfaces and reliable systems.');
    this.output.gap();
    this.output.out(
      "This site is an Astro SSG app hosted on Github Pages. Type 'help' to explore."
    );
  }

  private skills(_args: string[]): void {
    this.output.out('Languages:    TypeScript · Python · Go');
    this.output.out('Frontend:     Astro · React · HTML/CSS');
    this.output.out('Backend:      Node.js · PostgreSQL · Redis');
    this.output.out('Tools:        Git · Docker · Linux');
  }

  private cv(_args: string[]): void {
    this.output.out('Opening CV…  (add your PDF to /public/cv.pdf)', 'out-dim');
    window.open('/cv.pdf', '_blank');
  }

  private blog(args: string[]): void {
    if (args.length > 0) this.openPost(args[0]);
    else this.listPosts();
  }

  private open(args: string[]): void {
    if (args.length > 0) this.openPost(args[0]);
    else this.output.out('Usage: open <slug>', 'out-err');
  }

  private social(_args: string[]): void {
    this.output.outHTML(
      'GitHub    <a href="https://github.com/kauz" target="_blank" rel="noopener">github.com/apopov</a>'
    );
    this.output.outHTML(
      'LinkedIn  <a href="https://www.linkedin.com/in/artyom-popov/" target="_blank" rel="noopener">linkedin.com/in/apopov</a>'
    );
    this.output.outHTML('Email     <a href="mailto:hello@apopov.dev">hello@apopov.dev</a>');
  }

  private clear(_args: string[]): void {
    this.output.clear();
  }

  private date(_args: string[]): void {
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
    this.output.out(new Intl.DateTimeFormat('en-GB', options).format(new Date()).replace(',', ''));
  }

  private ls(args: string[]): void {
    const target = args[0];
    const dir = target ? this.resolveDir(target) : this.cwd;
    if (dir === null) {
      this.output.out(`ls: ${args[0]}: No such file or directory`, 'out-err');
      return;
    }
    const entries = this.fs[dir];
    if (entries.length === 0) return;
    const dirs: string[] = [];
    const files: string[] = [];
    for (const e of entries) (e.endsWith('/') ? dirs : files).push(e);
    if (dirs.length)
      this.output.outHTML(
        dirs.map((d) => `<span style="color:var(--green)">${d}</span>`).join('  ')
      );
    if (files.length) this.output.out(files.join('  '));
  }

  private cd(args: string[]): void {
    const target = args[0] ?? '~';
    if (target === '-') {
      this.setCwd(this.prevCwd);
      return;
    }
    const dir = this.resolveDir(target);
    if (dir === null) {
      this.output.out(`cd: ${target}: No such file or directory`, 'out-err');
      return;
    }
    this.setCwd(dir);
  }

  private echo(args: string[]): void {
    this.output.out(args.join(' '));
  }

  private sudo(_args: string[]): void {
    this.output.out("I'm sorry, Dave. I'm afraid I can't do that.", 'out-err');
  }

  private rm(args: string[]): void {
    const recursive = args.some((a) => /^-[a-z]*r/i.test(a) || a === '--recursive');
    if (recursive) {
      this.output.out("I'm sorry, Dave. I'm afraid I can't do that.", 'out-err');
    } else {
      this.output.out('rm: missing operand', 'out-err');
    }
  }

  private neofetch(): void {
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
      g(`${this.visitorSlug}@holonet`),
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
    this.output.outHTML(
      `<div style="display:flex;gap:1.5rem;align-items:flex-start">` +
        `<img src="${this.base}assets/ricing_girl.png" alt="" style="height: auto; width: 13.5rem" />` +
        `<div style="line-height:1.5">${infoHtml}</div>` +
        `</div>`
    );
  }

  private theme(args: string[]): void {
    const name = args[0];
    if (!name) {
      this.output.out('Available themes:');
      THEMES.forEach((t) => {
        const active = (document.documentElement.dataset.theme ?? 'default') === t;
        this.output.out('  ' + t + (active ? '  ← active' : ''));
      });
      this.output.out('Usage: theme <name>', 'out-dim');
      return;
    }
    if (!THEMES.includes(name as Theme)) {
      this.output.out('Unknown theme: ' + name, 'out-err');
      this.output.out('Available: ' + THEMES.join(', '), 'out-dim');
      return;
    }
    if (name === 'default') {
      delete document.documentElement.dataset.theme;
      localStorage.removeItem('term-theme');
    } else {
      document.documentElement.dataset.theme = name;
      localStorage.setItem('term-theme', name);
    }
    this.output.out('Theme: ' + name);
  }
}
