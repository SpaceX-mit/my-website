# Personal Tech Blog

A static personal tech blog built with pure HTML/CSS/JS, deployable to GitHub Pages.

## Features

- Blog posts with Markdown rendering
- Projects showcase
- Products & solutions
- Ideas board
- Syntax highlighting for code blocks
- Table of contents for long articles
- Responsive design
- No build tools required

## Structure

```
my-website/
├── index.html          # Home page
├── blog.html           # Blog list
├── projects.html       # Projects showcase
├── products.html       # Products & solutions
├── ideas.html          # Ideas board
├── viewer.html         # MD/HTML document viewer
├── assets/
│   ├── css/
│   │   ├── main.css    # Main styles
│   │   └── viewer.css  # Viewer styles
│   └── js/
│       ├── main.js     # Common scripts
│       └── viewer.js   # Markdown renderer
└── content/
    ├── blog/           # Blog posts (.md)
    ├── projects/       # Project details (.md)
    └── products/       # Product docs (.md)
```

## Adding Content

### New Blog Post

Create a `.md` file in `content/blog/`:

```markdown
# Post Title

Your content here...
```

Then add a link in `blog.html`:

```html
<article class="post-item" data-tags="Go,系统">
  <div class="post-meta">
    <span class="post-date">2026-04-10</span>
    <span class="post-tag">Go</span>
  </div>
  <h2><a href="viewer.html?file=content/blog/your-post.md">Post Title</a></h2>
  <p>Brief description...</p>
  <a href="viewer.html?file=content/blog/your-post.md" class="read-more">阅读全文 →</a>
</article>
```

### New Project

Create a `.md` file in `content/projects/` and add a card in `projects.html`.

## Deploy to GitHub Pages

1. Push to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your site will be live at `https://username.github.io/my-website`

## Local Development

Just open `index.html` in a browser, or use a local server:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

> Note: Markdown rendering requires a local server (due to fetch API CORS restrictions).
