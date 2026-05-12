import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? 'https://kauz.github.io';

  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);
  const projectPosts = await getCollection('projects', ({ data }) => !data.draft);

  const staticPages = [
    { url: `${base}/`, lastmod: null },
    { url: `${base}/blog/`, lastmod: null },
    { url: `${base}/projects/`, lastmod: null },
  ];

  const blogUrls = blogPosts.map((p) => ({
    url: `${base}/blog/${p.id}/`,
    lastmod: p.data.date.toISOString().slice(0, 10),
  }));

  const projectUrls = projectPosts.map((p) => ({
    url: `${base}/projects/${p.id}/`,
    lastmod: p.data.date.toISOString().slice(0, 10),
  }));

  const allUrls = [...staticPages, ...blogUrls, ...projectUrls];

  const urlset = allUrls
    .map(({ url, lastmod }) =>
      lastmod
        ? `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
        : `  <url>\n    <loc>${url}</loc>\n  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
