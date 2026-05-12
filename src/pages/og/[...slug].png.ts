import { getCollection } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Cached at build time across all route renders
let _font: ArrayBuffer | null = null;
let _logo: string | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (_font) return _font;
  // No modern UA → Google Fonts returns TTF; Satori does not support WOFF2
  const css = await fetch('https://fonts.googleapis.com/css2?family=Space+Mono:wght@700').then(
    (r) => r.text()
  );
  const url = css.match(/url\((.+?)\)/)?.[1];
  if (!url) throw new Error('Could not parse Space Mono font URL from Google Fonts');
  _font = await fetch(url).then((r) => r.arrayBuffer());
  return _font;
}

function loadLogo(): string {
  if (_logo) return _logo;
  const buf = readFileSync(join(process.cwd(), 'public/assets/pwa-512.png'));
  _logo = `data:image/png;base64,${buf.toString('base64')}`;
  return _logo;
}

interface CardProps {
  title: string;
  label: string;
  logo: string;
}

// Logo: 380×380, centered vertically in 630px card → top = (630 - 380) / 2 = 125
const LOGO_SIZE = 380;
const LOGO_TOP = (630 - LOGO_SIZE) / 2;

function buildCard({ title, label, logo }: CardProps) {
  const fontSize = title.length > 50 ? 44 : title.length > 30 ? 54 : 64;
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: '#080808',
        fontFamily: '"Space Mono"',
        position: 'relative',
      },
      children: [
        {
          type: 'img',
          props: {
            src: logo,
            style: {
              position: 'absolute',
              right: 60,
              top: LOGO_TOP,
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              opacity: 0.12,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 18,
              color: '#39d353',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              maxWidth: 680,
            },
            children: label,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize,
              fontWeight: 700,
              color: '#d0d0d0',
              lineHeight: 1.2,
              maxWidth: 680,
            },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 20,
              color: '#787878',
              maxWidth: 680,
            },
            children: 'apopov.dev',
          },
        },
      ],
    },
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const blog = await getCollection('blog', ({ data }) => !data.draft);
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return [
    {
      params: { slug: 'default' },
      props: { title: 'software engineer', label: 'apopov.dev' },
    },
    ...blog.map((p) => ({
      params: { slug: `blog/${p.id}` },
      props: { title: p.data.title, label: 'blog' },
    })),
    ...projects.map((p) => ({
      params: { slug: `projects/${p.id}` },
      props: { title: p.data.title, label: 'project' },
    })),
  ];
};

export const GET: APIRoute = async ({ props }) => {
  const { title, label } = props as CardProps;
  const [font, logo] = await Promise.all([loadFont(), Promise.resolve(loadLogo())]);

  const svg = await satori(buildCard({ title, label, logo }), {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Space Mono', data: font, weight: 700, style: 'normal' }],
  });

  const png = new Resvg(svg).render().asPng();

  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
