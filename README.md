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

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "your commit message"
git push origin main
```

### 2. 开启 GitHub Pages

1. 进入仓库页面，点击顶部 **Settings** 标签
2. 左侧菜单找到 **Pages**（在 "Code and automation" 分组下）
3. **Build and deployment** → **Source** 选择 **Deploy from a branch**
4. **Branch** 选 **main**，目录选 **/ (root)**
5. 点 **Save**

### 3. 等待部署完成

点击仓库顶部 **Actions** 标签，等待 `pages build and deployment` 任务显示绿色 ✓。

### 4. 访问网站

部署完成后访问：`https://your-username.github.io/my-website`

### 5. 自定义域名（可选）

如果你有自己的域名：

1. Settings → Pages → **Custom domain** 填入你的域名，点 Save
2. 在域名 DNS 服务商添加 CNAME 记录：
   ```
   类型:  CNAME
   名称:  @ 或子域名（如 blog）
   值:    your-username.github.io
   ```
3. 等待 DNS 生效后勾选 **Enforce HTTPS**

> 注意：仓库必须设置为 **Public**，免费版 GitHub Pages 不支持私有仓库。

## Local Development

Just open `index.html` in a browser, or use a local server:

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

> Note: Markdown rendering requires a local server (due to fetch API CORS restrictions).
