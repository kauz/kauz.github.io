const NAMES = [
  // Original trilogy
  'Luke Skywalker',
  'Leia Organa',
  'Han Solo',
  'Chewbacca',
  'Darth Vader',
  'Obi-Wan Kenobi',
  'Yoda',
  'Lando Calrissian',
  'Wedge Antilles',
  'Boba Fett',
  'Emperor Palpatine',
  'R2-D2',
  'C-3PO',
  'Admiral Ackbar',
  'Mon Mothma',
  'Grand Moff Tarkin',
  // Prequel trilogy
  'Qui-Gon Jinn',
  'Padmé Amidala',
  'Mace Windu',
  'Count Dooku',
  'General Grievous',
  'Jango Fett',
  'Kit Fisto',
  'Aayla Secura',
  'Plo Koon',
  'Jar Jar Binks',
  'Darth Maul',
  // Sequel trilogy
  'Rey Skywalker',
  'Poe Dameron',
  'Kylo Ren',
  'Finn',
  'BB-8',
  'Maz Kanata',
  'General Hux',
  'Captain Phasma',
  // The Clone Wars
  'Ahsoka Tano',
  'Captain Rex',
  'Commander Cody',
  'Asajj Ventress',
  'Hondo Ohnaka',
  'Savage Opress',
  'Cad Bane',
  'Aurra Sing',
  'Pre Vizsla',
  'Bo-Katan Kryze',
  'Barriss Offee',
  // Rebels
  'Kanan Jarrus',
  'Ezra Bridger',
  'Sabine Wren',
  'Hera Syndulla',
  'Zeb Orrelios',
  'Grand Admiral Thrawn',
  'Agent Kallus',
  'Chopper',
  // The Mandalorian / Book of Boba Fett
  'Din Djarin',
  'Grogu',
  'Greef Karga',
  'Kuiil',
  'Fennec Shand',
  'IG-11',
  'Moff Gideon',
  // The Bad Batch
  'Hunter',
  'Crosshair',
  'Tech',
  'Wrecker',
  'Omega',
  // Andor
  'Cassian Andor',
  'Luthen Rael',
  'Syril Karn',
  'Vel Sartha',
  'B2EMO',
  // Obi-Wan Kenobi (series)
  'Reva',
  // Jedi: Fallen Order / Survivor
  'Cal Kestis',
  'Cere Junda',
  'Merrin',
  'BD-1',
  // KOTOR
  'Darth Revan',
  'Bastila Shan',
  'Darth Malak',
  'Carth Onasi',
  'Jolee Bindo',
  'HK-47',
  'Mission Vao',
  'Canderous Ordo',
  'Meetra Surik',
  'Darth Nihilus',
  'Darth Sion',
  'Atton Rand',
  'Mira',
  // Legends / EU
  'Mara Jade',
  'Kyle Katarn',
  'Galen Marek',
  'Dash Rendar',
  'Jaina Solo',
  'Jacen Solo',
  'Nomi Sunrider',
  'Ulic Qel-Droma',
  'Starkiller',
  'Darth Bane',
];

export interface IVisitor {
  name: string;
  slug: string;
}

export class Visitor {
  name: string;
  slug: string;
  private static readonly STORAGE_KEY: string = 'sw-visitor';

  private constructor(name: string) {
    this.name = name;
    this.slug = Visitor.toSlug(name);
  }

  static async create(): Promise<Visitor> {
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (stored) {
      return new Visitor(stored);
    }

    const fingerprint = await Visitor.generateFingerprint();
    const name = Visitor.getCharacterFromFingerprint(fingerprint);

    localStorage.setItem(this.STORAGE_KEY, name);

    return new Visitor(name);
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

    ctx.textBaseline = 'top';
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
      Visitor.getCanvasFingerprint(),
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
    const index = decimalValue % NAMES.length;
    return NAMES[index];
  }
}
