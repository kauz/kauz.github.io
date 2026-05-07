import type { IOutput, Post, Project } from './types.ts';
import { CHARACTER_DATA } from './characterData.ts';

const SOCIAL_GITHUB = import.meta.env.PUBLIC_SOCIAL_GITHUB ?? '';
const SOCIAL_LINKEDIN = import.meta.env.PUBLIC_SOCIAL_LINKEDIN ?? '';
const SOCIAL_EMAIL = import.meta.env.PUBLIC_SOCIAL_EMAIL ?? '';

export interface CommandsCtx {
  postData: Post[];
  projectData: Project[];
  output: IOutput;
  getCwd: () => string;
  setCwd: (cwd: string) => void;
  getPrevCwd: () => string;
  base: string;
  fs: Record<string, string[]>;
  slugs: string[];
  projectSlugs: string[];
  getVisitorSlug: () => string;
  getVisitorName: () => string;
  getHistory: () => readonly string[];
}

const THEMES = ['default', 'light', 'high-contrast', 'deuteranopia', 'solarized-light'] as const;
type Theme = (typeof THEMES)[number];

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
  private readonly postData: Post[];
  private readonly projectData: Project[];
  private readonly output: IOutput;
  private readonly getCwd: () => string;
  private readonly setCwd: (cwd: string) => void;
  private readonly getPrevCwd: () => string;
  private readonly base: string;
  private readonly fs: Record<string, string[]>;
  private readonly slugs: string[];
  private readonly projectSlugs: string[];
  private readonly getVisitorSlug: () => string;
  private readonly getVisitorName: () => string;
  private readonly getHistory: () => readonly string[];
  private readonly completions: Record<string, () => string[]>;

  constructor(ctx: CommandsCtx) {
    this.postData = ctx.postData;
    this.projectData = ctx.projectData;
    this.output = ctx.output;
    this.getCwd = ctx.getCwd;
    this.setCwd = ctx.setCwd;
    this.getPrevCwd = ctx.getPrevCwd;
    this.base = ctx.base;
    this.fs = ctx.fs;
    this.slugs = ctx.slugs;
    this.projectSlugs = ctx.projectSlugs;
    this.getVisitorSlug = ctx.getVisitorSlug;
    this.getVisitorName = ctx.getVisitorName;
    this.getHistory = ctx.getHistory;
    this.completions = {
      blog: () => ['-w', ...this.slugs],
      open: () => this.slugs,
      cd: () => this.fs[this.getCwd()] ?? [],
      ls: () => this.fs[this.getCwd()] ?? [],
      cat: () => this.fs[this.getCwd()] ?? [],
      theme: () => [...THEMES],
      projects: () => ['-w', ...this.projectSlugs],
      man: () => [...COMMAND_NAMES],
    };
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
      case 'feed':
      case 'rss':
        this.feed(args);
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
      case 'projects':
        this.projects(args);
        break;
      case 'timeline':
        this.timeline(args);
        break;
      case 'whoami':
        this.whoami(args);
        break;
      case 'pwd':
        this.pwd(args);
        break;
      case 'cat':
        this.cat(args);
        break;
      case 'history':
        this.history(args);
        break;
      case 'man':
        this.man(args);
        break;
      case 'vim':
        this.vim(args);
        break;
      case 'nano':
        this.nano(args);
        break;
      case 'cowsay':
        this.cowsay(args);
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
    const cwd = this.getCwd();
    const t = target.replace(/\/+$/, '');
    if (!t || t === '~') return '~';
    if (t === '..') return cwd === '~' ? '~' : cwd.slice(0, cwd.lastIndexOf('/'));
    const abs = t.startsWith('~') ? t : `${cwd}/${t}`;
    return abs in this.fs ? abs : null;
  }

  private listContent(
    items: { slug: string; date: string; title: string }[],
    urlPrefix: string,
    noun: string
  ): void {
    if (items.length === 0) {
      this.output.out(`No ${noun} yet.`);
      return;
    }
    this.output.out(`${noun[0].toUpperCase() + noun.slice(1)}:`);
    items.forEach((p) => {
      const pad = ' '.repeat(Math.max(1, 28 - p.slug.length));
      this.output.outHTML(
        `  ${p.date}  <a href="${this.base}${urlPrefix}/${p.slug}">${p.slug}</a>${pad}${p.title}`
      );
    });
  }

  private openContent(
    slug: string,
    data: { slug: string; title: string }[],
    urlPrefix: string,
    noun: string
  ): void {
    const item = data.find((p) => p.slug === slug);
    if (item) {
      this.output.out(`Opening "${item.title}"…`, 'out-dim');
      setTimeout(() => {
        window.location.href = `${this.base}${urlPrefix}/${slug}/`;
      }, 250);
    } else {
      this.output.out(`${noun} not found: ${slug}`, 'out-err');
      this.output.out(`Type '${urlPrefix}' to list available ${noun.toLowerCase()}s.`, 'out-dim');
    }
  }

  private help(_args: string[]): void {
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
    this.output.out('Available commands:');
    rows.forEach(([cmd, desc]) => this.output.out('  ' + cmd.padEnd(24) + desc));
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
    const flag = args[0];
    if (flag === '-w' || flag === '--web') {
      this.output.out('Opening blog listing…', 'out-dim');
      setTimeout(() => window.open(this.base + 'blog/', '_self'), 150);
    } else if (flag) {
      this.openContent(flag, this.postData, 'blog', 'Post');
    } else {
      this.listContent(this.postData, 'blog', 'blog posts');
    }
  }

  private feed(_args: string[]): void {
    this.output.out('Opening Atom feed…', 'out-dim');
    setTimeout(() => window.open(this.base + 'feed.xml', '_blank'), 150);
  }

  private open(args: string[]): void {
    if (args.length > 0) this.openContent(args[0], this.postData, 'blog', 'Post');
    else this.output.out('Usage: open <slug>', 'out-err');
  }

  private social(_args: string[]): void {
    if (SOCIAL_GITHUB)
      this.output.outHTML(
        `GitHub    <a href="${SOCIAL_GITHUB}" target="_blank" rel="noopener">${SOCIAL_GITHUB.replace('https://', '')}</a>`
      );
    if (SOCIAL_LINKEDIN)
      this.output.outHTML(
        `LinkedIn  <a href="${SOCIAL_LINKEDIN}" target="_blank" rel="noopener">${SOCIAL_LINKEDIN.replace('https://', '')}</a>`
      );
    if (SOCIAL_EMAIL) {
      const rev = (s: string) => s.split('').reverse().join('');
      const [user, domain] = SOCIAL_EMAIL.split('@');
      const p1 = rev(user);
      const p2 = rev(domain);
      this.output.outHTML(
        `Email     <span class="dont-look-here" role="button" tabindex="0" aria-label="Reveal email address" data-p1="${p1}" data-p2="${p2}" onclick="var r=function(s){return s.split('').reverse().join('')};var e=r(this.dataset.p1)+'@'+r(this.dataset.p2);var a=document.createElement('a');a.href='mailto:'+e;a.textContent=e;this.replaceWith(a)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}">▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</span>`
      );
    }
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
    const dir = target ? this.resolveDir(target) : this.getCwd();
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
      this.setCwd(this.getPrevCwd());
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

  private projects(args: string[]): void {
    const flag = args[0];
    if (flag === '-w' || flag === '--web') {
      this.output.out('Opening projects listing…', 'out-dim');
      setTimeout(() => window.open(this.base + 'projects/', '_self'), 150);
    } else if (flag) {
      this.openContent(flag, this.projectData, 'projects', 'Project');
    } else {
      this.listContent(this.projectData, 'projects', 'projects');
    }
  }

  private timeline(_args: string[]): void {
    const rows: [string, string][] = [
      ['2024 – present', 'Software Engineer @ Acme Corp'],
      ['2022 – 2024', 'Backend Developer @ Startup Inc'],
      ['2018 – 2022', 'B.Sc. Computer Science, University of Somewhere'],
    ];
    this.output.out('Career timeline:');
    this.output.gap();
    rows.forEach(([period, role]) => {
      this.output.out(`  ${period.padEnd(16)}${role}`);
    });
  }

  private whoami(_args: string[]): void {
    const slug = this.getVisitorSlug();
    const name = this.getVisitorName();
    const info = CHARACTER_DATA[slug];
    const g = (s: string) => `<span style="color:var(--green);font-weight:bold">${s}</span>`;
    this.output.outHTML(g(name));
    this.output.out('─'.repeat(Math.min(name.length + 2, 42)));
    if (info) {
      this.output.out(info.affiliation, 'out-dim');
      this.output.gap();
      this.output.out(info.description);
    } else {
      this.output.out('No further information available.', 'out-dim');
    }
  }

  private pwd(_args: string[]): void {
    this.output.out(this.getCwd());
  }

  private cat(args: string[]): void {
    if (!args[0]) {
      this.output.out('Usage: cat <file>', 'out-err');
      return;
    }
    const target = args[0];
    const lastSlash = target.lastIndexOf('/');
    const fileName = lastSlash >= 0 ? target.slice(lastSlash + 1) : target;
    const dirPart = lastSlash >= 0 ? target.slice(0, lastSlash) : null;

    const dir = dirPart !== null ? this.resolveDir(dirPart) : this.getCwd();
    if (dir === null) {
      this.output.out(`cat: ${target}: No such file or directory`, 'out-err');
      return;
    }

    const entries = this.fs[dir] ?? [];
    if (!entries.includes(fileName)) {
      this.output.out(`cat: ${target}: No such file or directory`, 'out-err');
      return;
    }

    const slug = fileName.replace(/\.md$/, '');
    if (dir === '~/blog') {
      this.openContent(slug, this.postData, 'blog', 'Post');
    } else if (dir === '~/projects') {
      this.openContent(slug, this.projectData, 'projects', 'Project');
    } else {
      this.output.out(`cat: ${target}: binary or unreadable file`, 'out-dim');
    }
  }

  private history(_args: string[]): void {
    const hist = this.getHistory();
    if (hist.length === 0) {
      this.output.out('No commands in history.', 'out-dim');
      return;
    }
    [...hist].reverse().forEach((cmd, i) => {
      this.output.out(`  ${String(i + 1).padStart(3)}  ${cmd}`);
    });
  }

  private bold(s: string): string {
    return `<span style="font-weight:bold">${s}</span>`;
  }

  private dim(s: string): string {
    return `<span style="color:var(--fg-dim)">${s}</span>`;
  }

  private man(args: string[]): void {
    const cmd = args[0];
    if (!cmd) {
      this.output.out('Usage: man <command>', 'out-err');
      this.output.out('Example: man blog', 'out-dim');
      return;
    }

    const pages: Record<string, () => void> = {
      help: () => {
        this.output.outHTML(this.bold('help') + ' — show all available commands');
        this.output.gap();
        this.output.out('Usage: help');
      },
      about: () => {
        this.output.outHTML(this.bold('about') + ' — display info about the site author');
        this.output.gap();
        this.output.out('Usage: about');
      },
      skills: () => {
        this.output.outHTML(this.bold('skills') + ' — display the tech stack');
        this.output.gap();
        this.output.out('Usage: skills');
      },
      cv: () => {
        this.output.outHTML(this.bold('cv') + ' — open the CV PDF in a new tab');
        this.output.gap();
        this.output.out('Usage: cv');
      },
      blog: () => {
        this.output.outHTML(this.bold('blog') + ' — list and navigate blog posts');
        this.output.gap();
        this.output.out('Usage: blog [options | slug]');
        this.output.gap();
        this.output.outHTML(
          '  ' + this.dim('(no args)') + '       List all posts with dates and slugs'
        );
        this.output.outHTML(
          '  ' + this.dim('-w, --web') + '       Open the blog listing page in the browser'
        );
        this.output.outHTML('  ' + this.dim('<slug>') + '          Navigate to a specific post');
        this.output.gap();
        this.output.out('See also: open, feed');
      },
      open: () => {
        this.output.outHTML(
          this.bold('open') + ' — open a blog post by slug (alias for blog <slug>)'
        );
        this.output.gap();
        this.output.out('Usage: open <slug>');
      },
      feed: () => {
        this.output.outHTML(this.bold('feed') + ' — open the Atom/RSS feed in a new tab');
        this.output.gap();
        this.output.out('Usage: feed');
        this.output.out('       rss   (alias)');
      },
      rss: () => {
        this.output.outHTML(this.bold('rss') + ' — alias for ' + this.bold('feed'));
        this.output.gap();
        this.output.out('See also: feed');
      },
      social: () => {
        this.output.outHTML(this.bold('social') + ' — display social/contact links');
        this.output.gap();
        this.output.out('Usage: social');
        this.output.gap();
        this.output.out('  Shows GitHub, LinkedIn, and email (click to reveal).');
      },
      projects: () => {
        this.output.outHTML(this.bold('projects') + ' — list and navigate projects');
        this.output.gap();
        this.output.out('Usage: projects [options | slug]');
        this.output.gap();
        this.output.outHTML('  ' + this.dim('(no args)') + '       List all projects');
        this.output.outHTML(
          '  ' + this.dim('-w, --web') + '       Open the projects listing page in the browser'
        );
        this.output.outHTML('  ' + this.dim('<slug>') + '          Navigate to a specific project');
      },
      timeline: () => {
        this.output.outHTML(this.bold('timeline') + ' — display career and education timeline');
        this.output.gap();
        this.output.out('Usage: timeline');
      },
      whoami: () => {
        this.output.outHTML(this.bold('whoami') + ' — show info about your current character');
        this.output.gap();
        this.output.out('Usage: whoami');
        this.output.gap();
        this.output.out(
          '  Your identity is assigned at first visit based on your browser fingerprint.'
        );
        this.output.out('  99 Star Wars characters are possible.');
      },
      pwd: () => {
        this.output.outHTML(this.bold('pwd') + ' — print working directory');
        this.output.gap();
        this.output.out('Usage: pwd');
        this.output.gap();
        this.output.out('See also: ls, cd');
      },
      cat: () => {
        this.output.outHTML(
          this.bold('cat') + ' — open a file (navigates to blog post or project)'
        );
        this.output.gap();
        this.output.out('Usage: cat <file>');
        this.output.gap();
        this.output.out('  cat hello-world.md         open post (from ~/blog)');
        this.output.out('  cat blog/hello-world.md    open post (from anywhere)');
        this.output.gap();
        this.output.out('See also: ls, cd, blog, projects');
      },
      ls: () => {
        this.output.outHTML(this.bold('ls') + ' — list directory contents');
        this.output.gap();
        this.output.out('Usage: ls [path]');
        this.output.gap();
        this.output.out(
          '  Directories are shown in green. Omit path to list the current directory.'
        );
        this.output.gap();
        this.output.out('See also: cd, pwd, cat');
      },
      cd: () => {
        this.output.outHTML(this.bold('cd') + ' — change the working directory');
        this.output.gap();
        this.output.out('Usage: cd [path]');
        this.output.gap();
        this.output.outHTML('  ' + this.dim('(no args)') + '    Go to home (~)');
        this.output.outHTML('  ' + this.dim('..') + '           Go up one level');
        this.output.outHTML('  ' + this.dim('-') + '            Go to previous directory');
        this.output.gap();
        this.output.out('See also: ls, pwd');
      },
      history: () => {
        this.output.outHTML(this.bold('history') + ' — show commands typed this session');
        this.output.gap();
        this.output.out('Usage: history');
        this.output.gap();
        this.output.out('  Commands are listed oldest-first with sequential numbers.');
      },
      clear: () => {
        this.output.outHTML(this.bold('clear') + ' — clear the terminal output');
        this.output.gap();
        this.output.out('Usage: clear');
        this.output.gap();
        this.output.out('  Tip: Ctrl+L does the same thing.');
      },
      date: () => {
        this.output.outHTML(this.bold('date') + ' — print the current date and time');
        this.output.gap();
        this.output.out('Usage: date');
      },
      echo: () => {
        this.output.outHTML(this.bold('echo') + ' — print text to the terminal');
        this.output.gap();
        this.output.out('Usage: echo <text>');
      },
      theme: () => {
        this.output.outHTML(this.bold('theme') + ' — list or switch color themes');
        this.output.gap();
        this.output.out('Usage: theme [name]');
        this.output.gap();
        this.output.outHTML(
          '  ' + this.dim('(no args)') + '    List themes and show the active one'
        );
        this.output.outHTML('  ' + this.dim('<name>') + '       Switch to the named theme');
        this.output.gap();
        this.output.out('  Available: ' + [...THEMES].join(', '));
      },
      man: () => {
        this.output.outHTML(this.bold('man') + ' — show the manual page for a command');
        this.output.gap();
        this.output.out('Usage: man <command>');
        this.output.gap();
        this.output.out('  Tab-completes command names.');
      },
      vim: () => {
        this.output.outHTML(this.bold('vim') + ' — open vim');
        this.output.gap();
        this.output.out('Usage: vim [file]');
        this.output.gap();
        this.output.out('  Famous for being impossible to exit. You have been warned.');
        this.output.out('  Type :q! to attempt escape.');
      },
      nano: () => {
        this.output.outHTML(this.bold('nano') + ' — command not found');
        this.output.gap();
        this.output.out("  nano isn't installed. Have you tried vim?");
        this.output.gap();
        this.output.out('See also: vim');
      },
      cowsay: () => {
        this.output.outHTML(this.bold('cowsay') + ' — let a cow deliver your message');
        this.output.gap();
        this.output.out('Usage: cowsay <text>');
        this.output.gap();
        this.output.out('  For important announcements only.');
      },
    };

    const page = pages[cmd];
    if (!page) {
      this.output.out(`No manual entry for ${cmd}`, 'out-err');
    } else {
      page();
    }
  }

  private vim(args: string[]): void {
    const file = args[0] ?? 'untitled';
    const g = (s: string) => `<span style="color:var(--fg-dim)">${s}</span>`;
    this.output.out('');
    this.output.out('~');
    this.output.out('~');
    this.output.out('~');
    this.output.out(`"${file}" [New File] 0L, 0C`);
    this.output.out('-- INSERT --');
    this.output.outHTML(
      `${g('You appear to be stuck. Type ')}` +
        `<span style="font-weight:bold">:q!</span>` +
        `${g(" to exit. (It won't work here.)")}`
    );
  }

  private nano(_args: string[]): void {
    this.output.out("nano: command not found. Did you mean 'vim'?", 'out-err');
  }

  private cowsay(args: string[]): void {
    const message = args.join(' ') || 'Moo';
    const len = message.length;
    const top = ' ' + '_'.repeat(len + 2);
    const mid = `< ${message} >`;
    const bot = ' ' + '-'.repeat(len + 2);
    this.output.out(top);
    this.output.out(mid);
    this.output.out(bot);
    this.output.out('        \\   ^__^');
    this.output.out('         \\  (oo)\\_______');
    this.output.out('            (__)\\       )\\/\\');
    this.output.out('                ||----w |');
    this.output.out('                ||     ||');
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
      g(`${this.getVisitorSlug()}@holonet`),
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
