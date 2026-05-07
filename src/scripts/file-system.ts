export class FileSystem {
  static readonly ROOT = '~';

  private readonly fs: Record<string, string[]>;
  private readonly onCwdChange: () => void;
  private cwd = FileSystem.ROOT;
  private prevCwd = FileSystem.ROOT;

  constructor(blogSlugs: string[], projectSlugs: string[], onCwdChange: () => void) {
    this.onCwdChange = onCwdChange;
    this.fs = {
      '~': ['blog/', 'projects/'],
      '~/blog': blogSlugs.map((s) => s + '.md'),
      '~/projects': projectSlugs.map((s) => s + '.md'),
    };
  }

  getCwd(): string {
    return this.cwd;
  }

  resolveDir(target: string): string | null {
    const t = target.replace(/\/+$/, '');
    if (!t || t === '~') return '~';
    if (t === '..') return this.cwd === '~' ? '~' : this.cwd.slice(0, this.cwd.lastIndexOf('/'));
    const abs = t.startsWith('~') ? t : `${this.cwd}/${t}`;
    return abs in this.fs ? abs : null;
  }

  setCwd(cwd: string): void {
    this.prevCwd = this.cwd;
    this.cwd = cwd;
    this.onCwdChange();
  }

  back(): void {
    this.setCwd(this.prevCwd);
  }

  entries(dir: string): string[] {
    return this.fs[dir] ?? [];
  }
}
