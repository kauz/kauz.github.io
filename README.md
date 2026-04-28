# kauz.github.io

Personal portfolio site - terminal emulator UI with a blog. Built with Astro.

## Project structure

```
src/
  content/
    config.ts          - blog collection schema (title, date, description, draft)
    blog/              - markdown blog posts  ← add posts here
  layouts/
    BlogLayout.astro   - HTML shell for rendered blog posts
  lib/                 - Some functions
  pages/
    index.astro        - terminal emulator (home page)
    blog/[slug].astro  - dynamic blog post pages
  styles/
    global.css         - all styles (terminal + prose)
public/
  cv.pdf               - put your CV here (served at /cv.pdf)
```

## Adding a blog post

Create `src/content/blog/my-post-slug.md`:

```markdown
---
title: 'Post Title'
date: 2026-05-01
description: 'Optional one-liner shown in listings.'
draft: false # omit or set true to hide from build
---

Markdown content here.
```

The filename becomes the slug (`my-post-slug` → `/blog/my-post-slug`).  
Posts are sorted newest-first in the terminal's `blog` command.

## Local dev

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output → dist/
npm run preview  # serve dist/ locally
```
