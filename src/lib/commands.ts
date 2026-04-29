type Post = { slug: string; title: string; date: string; description: string };
type OutFn = (text: string, cls?: string) => void;

interface Ctx {
  postData: Post[];
  out: OutFn;
  outHTML: (html: string, cls?: string) => void;
  gap: () => void;
  clear: () => void;
  getCwd: () => string;
  getPrevCwd: () => string;
  setCwd: (path: string) => void;
}

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
] as const;

type CommandName = (typeof COMMAND_NAMES)[number];

export class Commands {
  private readonly postData: Post[];
  private readonly out: OutFn;
  private readonly outHTML: (html: string, cls?: string) => void;
  private readonly gap: () => void;
  private readonly clearOutput: () => void;
  private readonly getCwd: () => string;
  private readonly getPrevCwd: () => string;
  private readonly setCwd: (path: string) => void;
  private readonly base: string;
  private readonly fs: Record<string, string[]>;
  private readonly slugs: string[];

  constructor(ctx: Ctx) {
    this.postData = ctx.postData;
    this.out = ctx.out;
    this.outHTML = ctx.outHTML;
    this.gap = ctx.gap;
    this.clearOutput = ctx.clear;
    this.getCwd = ctx.getCwd;
    this.getPrevCwd = ctx.getPrevCwd;
    this.setCwd = ctx.setCwd;
    this.base = import.meta.env.BASE_URL;
    this.slugs = ctx.postData.map((p) => p.slug);
    this.fs = {
      '~': ['blog/'],
      '~/blog': this.slugs.map((s) => s + '.md'),
    };
  }

  dispatch(name: string, args: string[]): boolean {
    switch (name as CommandName) {
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
      default:
        return false;
    }
    return true;
  }

  commandNames(): readonly string[] {
    return COMMAND_NAMES;
  }

  complete(cmd: string, partial: string): string[] {
    const candidates =
      cmd === 'blog' || cmd === 'open'
        ? this.slugs
        : cmd === 'cd' || cmd === 'ls'
          ? (this.fs[this.getCwd()] ?? [])
          : null;
    return candidates ? candidates.filter((s) => s.startsWith(partial)) : [];
  }

  private resolveDir(target: string): string | null {
    const cwd = this.getCwd();
    const t = target.replace(/\/+$/, '');
    if (!t || t === '~') return '~';
    if (t === '..') return cwd === '~' ? '~' : cwd.slice(0, cwd.lastIndexOf('/'));
    const abs = t.startsWith('~') ? t : `${cwd}/${t}`;
    return abs in this.fs ? abs : null;
  }

  private listPosts(): void {
    if (this.postData.length === 0) {
      this.out('No posts yet.');
      return;
    }
    this.out('Blog posts:');
    this.postData.forEach((p) => {
      const pad = ' '.repeat(Math.max(1, 28 - p.slug.length));
      this.outHTML(
        `  ${p.date}  <a href="${this.base}blog/${p.slug}">${p.slug}</a>${pad}${p.title}`
      );
    });
  }

  private openPost(slug: string): void {
    const post = this.postData.find((p) => p.slug === slug);
    if (post) {
      this.out(`Opening "${post.title}"…`, 'out-dim');
      setTimeout(() => {
        window.location.href = this.base + 'blog/' + slug;
      }, 250);
    } else {
      this.out('Post not found: ' + slug, 'out-err');
      this.out("Type 'blog' to list available posts.", 'out-dim');
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
    ];
    this.out('Available commands:');
    rows.forEach(([cmd, desc]) => this.out('  ' + cmd.padEnd(22) + desc));
  }

  private about(_args: string[]): void {
    this.out('Artem Popov');
    this.out('Software Engineer');
    this.gap();
    this.out('I build products for the web — backend-leaning, with a taste for clean');
    this.out('interfaces and reliable systems.');
    this.gap();
    this.out("This site is an Astro SSG app hosted on Github Pages. Type 'help' to explore.");
  }

  private skills(_args: string[]): void {
    this.out('Languages:    TypeScript · Python · Go');
    this.out('Frontend:     Astro · React · HTML/CSS');
    this.out('Backend:      Node.js · PostgreSQL · Redis');
    this.out('Tools:        Git · Docker · Linux');
  }

  private cv(_args: string[]): void {
    this.out('Opening CV…  (add your PDF to /public/cv.pdf)', 'out-dim');
    window.open('/cv.pdf', '_blank');
  }

  private blog(args: string[]): void {
    if (args.length > 0) this.openPost(args[0]);
    else this.listPosts();
  }

  private open(args: string[]): void {
    if (args.length > 0) this.openPost(args[0]);
    else this.out('Usage: open <slug>', 'out-err');
  }

  private social(_args: string[]): void {
    this.outHTML(
      'GitHub    <a href="https://github.com/kauz" target="_blank" rel="noopener">github.com/apopov</a>'
    );
    this.outHTML(
      'LinkedIn  <a href="https://www.linkedin.com/in/artyom-popov/" target="_blank" rel="noopener">linkedin.com/in/apopov</a>'
    );
    this.outHTML('Email     <a href="mailto:hello@apopov.dev">hello@apopov.dev</a>');
  }

  private clear(_args: string[]): void {
    this.clearOutput();
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
    this.out(new Intl.DateTimeFormat('en-GB', options).format(new Date()).replace(',', ''));
  }

  private ls(args: string[]): void {
    const target = args[0];
    const dir = target ? this.resolveDir(target) : this.getCwd();
    if (dir === null) {
      this.out(`ls: ${args[0]}: No such file or directory`, 'out-err');
      return;
    }
    const entries = this.fs[dir];
    if (entries.length === 0) return;
    const dirs: string[] = [];
    const files: string[] = [];
    for (const e of entries) (e.endsWith('/') ? dirs : files).push(e);
    if (dirs.length)
      this.outHTML(dirs.map((d) => `<span style="color:var(--green)">${d}</span>`).join('  '));
    if (files.length) this.out(files.join('  '));
  }

  private cd(args: string[]): void {
    const target = args[0] ?? '~';
    if (target === '-') {
      this.setCwd(this.getPrevCwd());
      return;
    }
    const dir = this.resolveDir(target);
    if (dir === null) {
      this.out(`cd: ${target}: No such file or directory`, 'out-err');
      return;
    }
    this.setCwd(dir);
  }

  private echo(args: string[]): void {
    this.out(args.join(' '));
  }
}
