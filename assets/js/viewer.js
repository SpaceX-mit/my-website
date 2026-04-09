// Get file parameter from URL
const urlParams = new URLSearchParams(window.location.search);
const filePath = urlParams.get('file');

// Display file path
const filePathDisplay = document.getElementById('file-path-display');
if (filePathDisplay && filePath) {
  filePathDisplay.textContent = filePath;
}

// Load and render content
async function loadContent() {
  const contentDiv = document.getElementById('content');

  if (!filePath) {
    contentDiv.innerHTML = '<p class="loading">未指定文件路径</p>';
    return;
  }

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error('文件加载失败');

    const content = await response.text();
    const fileExt = filePath.split('.').pop().toLowerCase();

    if (fileExt === 'md') {
      // Render Markdown
      marked.setOptions({
        highlight: function(code, lang) {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
          }
          return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
      });

      contentDiv.innerHTML = marked.parse(content);

      // Generate TOC
      generateTOC();

      // Highlight code blocks
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });

    } else if (fileExt === 'html') {
      // Render HTML
      contentDiv.innerHTML = content;
    } else {
      // Plain text
      contentDiv.innerHTML = `<pre>${escapeHtml(content)}</pre>`;
    }

  } catch (error) {
    contentDiv.innerHTML = `<p class="loading">加载失败: ${error.message}</p>`;
  }
}

// Generate table of contents
function generateTOC() {
  const tocNav = document.getElementById('toc-nav');
  const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3');

  if (headings.length === 0) {
    tocNav.innerHTML = '<p style="color: var(--text-light);">无目录</p>';
    return;
  }

  tocNav.innerHTML = '';

  headings.forEach((heading, index) => {
    const id = `heading-${index}`;
    heading.id = id;

    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = heading.textContent;
    link.style.paddingLeft = `${(parseInt(heading.tagName.charAt(1)) - 1) * 0.75}rem`;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth' });

      // Update active state
      document.querySelectorAll('#toc-nav a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });

    tocNav.appendChild(link);
  });

  // Highlight TOC on scroll
  window.addEventListener('scroll', () => {
    let current = '';
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 100) {
        current = heading.id;
      }
    });

    document.querySelectorAll('#toc-nav a').forEach(a => {
      a.classList.remove('active');
      if (a.getAttribute('href') === `#${current}`) {
        a.classList.add('active');
      }
    });
  });
}

// Toggle TOC on mobile
function toggleToc() {
  const toc = document.getElementById('toc');
  toc.classList.toggle('active');
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Load content when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadContent);
} else {
  loadContent();
}
