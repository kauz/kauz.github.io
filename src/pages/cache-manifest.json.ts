import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const urls = posts.map((post) => `/blog/${post.id}/`);
  return new Response(JSON.stringify(urls), {
    headers: { 'Content-Type': 'application/json' },
  });
};
