import type { IAppElements } from './types';

export function selectElements(): IAppElements {
  const get = (id: string) => document.getElementById(id) as HTMLElement;
  return {
    termBody: get('t-body'),
    output: get('output'),
    input: get('cmd-input') as HTMLInputElement,
    cmdTyped: get('cmd-typed'),
    blinkCursor: get('blink-cursor'),
    promptEl: get('prompt'),
    titleEl: get('t-title'),
    postData: JSON.parse(get('terminal').dataset.posts ?? '[]'),
  };
}
