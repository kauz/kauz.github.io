import type { AppCtx, ShellState } from './types.ts';
import { FileSystem } from './file-system.ts';
import { Commands, COMMAND_NAMES, THEMES } from './commands.ts';

export class Shell {
  private readonly state: ShellState;
  private readonly fileSystem: FileSystem;
  private readonly commands: Commands;
  private readonly completions: Record<string, () => string[]>;
  private readonly aliases: Record<string, string> = { rss: 'feed' };

  constructor(ctx: AppCtx) {
    this.state = { userSlug: ctx.userSlug, promptSymbol: '$' };
    const blogSlugs = ctx.postData.map((p) => p.slug);
    const projectSlugs = ctx.projectData.map((p) => p.slug);
    this.fileSystem = new FileSystem(blogSlugs, projectSlugs, ctx.onCwdChange);
    this.commands = new Commands(ctx, this.state, this.fileSystem);
    this.completions = {
      blog: () => ['-w', ...blogSlugs],
      open: () => blogSlugs,
      cd: () => this.fileSystem.entries(this.fileSystem.getCwd()),
      ls: () => this.fileSystem.entries(this.fileSystem.getCwd()),
      cat: () => this.fileSystem.entries(this.fileSystem.getCwd()),
      theme: () => [...THEMES],
      projects: () => ['-w', ...projectSlugs],
      man: () => [...COMMAND_NAMES],
    };
  }

  getPrompt(): string {
    return `${this.state.userSlug}@holonet:${this.fileSystem.getCwd()}${this.state.promptSymbol}`;
  }

  dispatch(cmd: string, args: string[]): boolean {
    const name = this.aliases[cmd] ?? cmd;
    const method = this.commands[name as keyof Commands];
    if (typeof method !== 'function') return false;
    method.call(this.commands, args);
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
}
