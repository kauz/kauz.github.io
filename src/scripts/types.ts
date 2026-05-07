export type Post = { slug: string; title: string; date: string; description: string };
export type Project = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tech: string[];
  url: string;
};

export interface IOutput {
  out(text: string, cls?: string): void;
  outHTML(html: string, cls?: string): void;
  gap(): void;
  clear(): void;
}

export interface IVisitor {
  name: string;
  slug: string;
}

export interface IAppElements {
  termBody: HTMLElement;
  output: HTMLElement;
  input: HTMLInputElement;
  cmdTyped: HTMLElement;
  blinkCursor: HTMLElement;
  promptEl: HTMLElement;
  titleEl: HTMLElement;
  postData: Post[];
  projectData: Project[];
}
