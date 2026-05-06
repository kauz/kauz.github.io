import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://kauz.github.io';

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const updated = (posts[0]?.data.date ?? new Date()).toISOString();

  const entries = posts
    .map((p) => {
      const url = `${base}/blog/${p.id}`;
      const date = p.data.date.toISOString();
      return `
  <entry>
    <title>${esc(p.data.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <published>${date}</published>
    <updated>${date}</updated>${p.data.description ? `\n    <summary>${esc(p.data.description)}</summary>` : ''}
  </entry>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>apopov.dev — Blog</title>
  <link href="${base}/feed.xml" rel="self" />
  <link href="${base}" />
  <id>${base}/feed.xml</id>
  <updated>${updated}</updated>
  <author><name>Artem Popov</name></author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
