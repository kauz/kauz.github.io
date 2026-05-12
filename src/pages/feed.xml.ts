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

  const blogPosts = (await getCollection('blog', ({ data }) => !data.draft)).map((p) => ({
    ...p,
    _type: 'blog' as const,
  }));

  const projectPosts = (await getCollection('projects', ({ data }) => !data.draft)).map((p) => ({
    ...p,
    _type: 'project' as const,
  }));

  const all = [...blogPosts, ...projectPosts].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  const updated = (all[0]?.data.date ?? new Date()).toISOString();

  const entries = all
    .map((p) => {
      const url = `${base}/${p._type === 'blog' ? 'blog' : 'projects'}/${p.id}`;
      const date = p.data.date.toISOString();
      const categoryTerm = p._type === 'blog' ? 'blog' : 'project';
      const categoryLabel = p._type === 'blog' ? 'Blog' : 'Project';
      return `
  <entry>
    <title>${esc(p.data.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <published>${date}</published>
    <updated>${date}</updated>
    <category term="${categoryTerm}" label="${categoryLabel}" scheme="${base}/feed.xml" />${p.data.description ? `\n    <summary>${esc(p.data.description)}</summary>` : ''}
  </entry>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>apopov.dev</title>
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
