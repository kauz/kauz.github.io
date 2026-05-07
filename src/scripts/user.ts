import type { IUser } from './types.ts';
import { CHARACTER_DATA } from './characterData.ts';

export class User implements IUser {
  name: string;
  slug: string;
  private static readonly STORAGE_KEY: string = 'sw-user';

  private constructor(name: string) {
    this.name = name;
    this.slug = User.toSlug(name);
  }

  static async create(): Promise<User> {
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (stored) {
      return new User(stored);
    }

    const fingerprint = await User.generateFingerprint();
    const name = User.getCharacterFromFingerprint(fingerprint);

    localStorage.setItem(this.STORAGE_KEY, name);

    return new User(name);
  }

  private static toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private static getCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = 200;
    canvas.height = 50;

    ctx.font = "14px 'Arial'";
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.fillText('Hello, world! 12345', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Hello, world! 12345', 4, 17);

    return canvas.toDataURL();
  }

  private static async generateFingerprint(): Promise<string> {
    const encoder = new TextEncoder();
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      User.getCanvasFingerprint(),
    ];

    const fingerprintString = components.join('###');
    const data = encoder.encode(fingerprintString);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private static getCharacterFromFingerprint(fingerprint: string): string {
    const decimalValue = parseInt(fingerprint, 16);
    const NAMES = Object.keys(CHARACTER_DATA);
    const index = decimalValue % NAMES.length;
    return NAMES[index];
  }
}
