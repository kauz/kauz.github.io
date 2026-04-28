type Post = { slug: string; title: string; date: string; description: string };
type OutFn = (text: string, cls?: string) => void;

interface Ctx {
  postData: Post[];
  output: HTMLElement;
  out: OutFn;
  outHTML: (html: string, cls?: string) => void;
  gap: () => void;
  scrollBottom: () => void;
}

export function createCommands(ctx: Ctx) {
  const { postData, output, out, outHTML, gap } = ctx;
  const base = import.meta.env.BASE_URL;

  function listPosts() {
    if (postData.length === 0) {
      out('No posts yet.');
      return;
    }
    out('Blog posts:');
    postData.forEach((p) => {
      const pad = ' '.repeat(Math.max(1, 28 - p.slug.length));
      outHTML(
        '  ' +
          p.date +
          '  ' +
          '<a href="' +
          base +
          'blog/' +
          p.slug +
          '">' +
          p.slug +
          '</a>' +
          pad +
          p.title
      );
    });
  }

  function openPost(slug: string) {
    const post = postData.find((p) => p.slug === slug);
    if (post) {
      out('Opening "' + post.title + '"…', 'out-dim');
      setTimeout(() => {
        window.location.href = base + 'blog/' + slug;
      }, 250);
    } else {
      out('Post not found: ' + slug, 'out-err');
      out("Type 'blog' to list available posts.", 'out-dim');
    }
  }

  return {
    help(_args: string[]) {
      const rows: [string, string][] = [
        ['help', 'Show this message'],
        ['about', 'Who I am'],
        ['skills', 'Tech stack'],
        ['cv', 'Download my CV (PDF)'],
        ['blog', 'List blog posts'],
        ['blog <slug>', 'Open a post'],
        ['open <slug>', 'Open a post (alias)'],
        ['social', 'Links — GitHub, LinkedIn, email'],
        ['clear', 'Clear the terminal'],
        ['date', 'Print current date'],
        ['echo <text>', 'Echo text'],
      ];
      out('Available commands:');
      rows.forEach(([cmd, desc]) => out('  ' + cmd.padEnd(22) + desc));
    },

    about(_args: string[]) {
      out('Artem Popov');
      out('Software Engineer');
      gap();
      out('I build products for the web — backend-leaning, with a taste for clean');
      out('interfaces and reliable systems.');
      gap();
      out("This site is an Astro SSG app hosted on Github Pages. Type 'help' to explore.");
    },

    skills(_args: string[]) {
      out('Languages:    TypeScript · Python · Go');
      out('Frontend:     Astro · React · HTML/CSS');
      out('Backend:      Node.js · PostgreSQL · Redis');
      out('Tools:        Git · Docker · Linux');
    },

    cv(_args: string[]) {
      out('Opening CV…  (add your PDF to /public/cv.pdf)', 'out-dim');
      window.open('/cv.pdf', '_blank');
    },

    blog(args: string[]) {
      if (args.length > 0) openPost(args[0]);
      else listPosts();
    },

    open(args: string[]) {
      if (args.length > 0) openPost(args[0]);
      else out('Usage: open <slug>', 'out-err');
    },

    social(_args: string[]) {
      outHTML(
        'GitHub    <a href="https://github.com/apopov" target="_blank" rel="noopener">github.com/apopov</a>'
      );
      outHTML(
        'LinkedIn  <a href="https://linkedin.com/in/apopov" target="_blank" rel="noopener">linkedin.com/in/apopov</a>'
      );
      outHTML('Email     <a href="mailto:hello@apopov.dev">hello@apopov.dev</a>');
    },

    clear(_args: string[]) {
      output.innerHTML = '';
    },

    date(_args: string[]) {
      const date = new Date();

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      };
      const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date())
        .replace(',', '');

      out(formattedDate);
    },

    echo(args: string[]) {
      out(args.join(' '));
    },
  };
}

export type Commands = ReturnType<typeof createCommands>;
