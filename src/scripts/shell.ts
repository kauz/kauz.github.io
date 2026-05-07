import type { IOutput, Post, Project } from './types.ts';
import { Commands } from './commands.ts';

interface Ctx {
  postData: Post[];
  projectData: Project[];
  output: IOutput;
  visitorSlug: string;
  visitorName: string;
  getHistory: () => readonly string[];
  onCwdChange: () => void;
}

export class Shell {
  private readonly output: IOutput;
  private readonly onCwdChange: () => void;
  private readonly commands: Commands;
  private cwd = '~';
  private prevCwd = '~';
  private promptSymbol = '$';
  private visitorSlug: string;
  private readonly visitorName: string;

  constructor(ctx: Ctx) {
    this.output = ctx.output;
    this.visitorSlug = ctx.visitorSlug;
    this.visitorName = ctx.visitorName;
    this.onCwdChange = ctx.onCwdChange;
    const base = import.meta.env.BASE_URL;
    const slugs = ctx.postData.map((p) => p.slug);
    const projectSlugs = ctx.projectData.map((p) => p.slug);
    const fs: Record<string, string[]> = {
      '~': ['blog/', 'projects/'],
      '~/blog': slugs.map((s) => s + '.md'),
      '~/projects': projectSlugs.map((s) => s + '.md'),
    };
    this.commands = new Commands({
      postData: ctx.postData,
      projectData: ctx.projectData,
      output: ctx.output,
      getCwd: () => this.cwd,
      setCwd: (cwd) => this.setCwd(cwd),
      getPrevCwd: () => this.prevCwd,
      base,
      fs,
      slugs,
      projectSlugs,
      getVisitorSlug: () => this.visitorSlug,
      getVisitorName: () => this.visitorName,
      getHistory: ctx.getHistory,
    });
  }

  getPrompt(): string {
    return `${this.visitorSlug}@holonet:${this.cwd}${this.promptSymbol}`;
  }

  dispatch(name: string, args: string[]): boolean {
    if (name === 'ivanna') {
      this.promptSymbol = '💜';
      this.visitorSlug = 'ivanna';
      this.onCwdChange();
      return true;
    }
    return this.commands.dispatch(name, args);
  }

  commandNames(): readonly string[] {
    return this.commands.commandNames();
  }

  complete(cmd: string, partial: string): string[] {
    return this.commands.complete(cmd, partial);
  }

  private setCwd(cwd: string): void {
    this.prevCwd = this.cwd;
    this.cwd = cwd;
    this.onCwdChange();
  }
}
