# 前端性能优化实战

> 从 Core Web Vitals 出发，系统梳理前端性能优化的方法论与实践技巧

## Core Web Vitals

Google 定义的三个核心指标：

- **LCP** (Largest Contentful Paint): 最大内容绘制 < 2.5s
- **FID** (First Input Delay): 首次输入延迟 < 100ms
- **CLS** (Cumulative Layout Shift): 累积布局偏移 < 0.1

## 优化策略

### 1. 资源加载优化

#### 关键资源预加载

```html
<!-- 预加载关键字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预连接第三方域名 -->
<link rel="preconnect" href="https://cdn.example.com">
<link rel="dns-prefetch" href="https://analytics.example.com">
```

#### 图片优化

```html
<!-- 响应式图片 -->
<img 
  srcset="image-320w.jpg 320w,
          image-640w.jpg 640w,
          image-1280w.jpg 1280w"
  sizes="(max-width: 640px) 100vw, 640px"
  src="image-640w.jpg"
  alt="描述"
  loading="lazy"
>

<!-- 使用现代格式 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="描述">
</picture>
```

### 2. JavaScript 优化

#### 代码分割

```javascript
// 路由级别的代码分割
const Home = () => import('./views/Home.vue')
const About = () => import('./views/About.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
]
```

#### 按需加载

```javascript
// 仅在需要时加载大型库
async function handleExport() {
  const { default: XLSX } = await import('xlsx')
  XLSX.writeFile(workbook, 'export.xlsx')
}
```

#### Tree Shaking

```javascript
// ❌ 导入整个库
import _ from 'lodash'

// ✅ 仅导入需要的函数
import debounce from 'lodash/debounce'
```

### 3. CSS 优化

#### 关键 CSS 内联

```html
<head>
  <style>
    /* 首屏关键样式内联 */
    .header { /* ... */ }
    .hero { /* ... */ }
  </style>
  
  <!-- 非关键 CSS 异步加载 -->
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

#### 避免布局抖动

```css
/* 为图片容器预留空间 */
.image-container {
  aspect-ratio: 16 / 9;
  background: #f0f0f0;
}

/* 使用 content-visibility 优化渲染 */
.article-list > article {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

### 4. 网络优化

#### HTTP/2 服务器推送

```nginx
# nginx 配置
location / {
  http2_push /css/main.css;
  http2_push /js/app.js;
}
```

#### 资源压缩

```javascript
// Webpack 配置
module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
}
```

## 性能监控

### 使用 Performance API

```javascript
// 监控 LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]
  console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime)
}).observe({ entryTypes: ['largest-contentful-paint'] })

// 监控 FID
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('FID:', entry.processingStart - entry.startTime)
  })
}).observe({ entryTypes: ['first-input'] })

// 监控 CLS
let clsScore = 0
new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (!entry.hadRecentInput) {
      clsScore += entry.value
      console.log('CLS:', clsScore)
    }
  })
}).observe({ entryTypes: ['layout-shift'] })
```

### 真实用户监控 (RUM)

```javascript
// 上报性能数据
function reportMetrics() {
  const metrics = {
    lcp: getLCP(),
    fid: getFID(),
    cls: getCLS(),
    ttfb: getTTFB(),
  }
  
  navigator.sendBeacon('/api/metrics', JSON.stringify(metrics))
}

window.addEventListener('load', () => {
  setTimeout(reportMetrics, 0)
})
```

## 实战案例

### 优化前

```
LCP: 4.2s
FID: 180ms
CLS: 0.25
页面大小: 3.5MB
请求数: 87
```

### 优化措施

1. 图片转 WebP，启用懒加载 → 减少 1.8MB
2. 代码分割，按需加载 → 减少 45 个请求
3. 关键 CSS 内联 → LCP 提升 1.2s
4. 预留图片空间 → CLS 降至 0.05

### 优化后

```
LCP: 1.8s ✅
FID: 45ms ✅
CLS: 0.05 ✅
页面大小: 1.2MB
请求数: 32
```

## 工具推荐

### 分析工具

- **Lighthouse**: Chrome DevTools 内置
- **WebPageTest**: 多地域测试
- **PageSpeed Insights**: Google 官方工具

### 监控服务

- **Sentry**: 错误和性能监控
- **Datadog RUM**: 真实用户监控
- **New Relic**: 全栈性能监控

## 检查清单

性能优化检查清单：

- [ ] 启用 Gzip/Brotli 压缩
- [ ] 使用 CDN 分发静态资源
- [ ] 实现代码分割和懒加载
- [ ] 优化图片（格式、尺寸、懒加载）
- [ ] 内联关键 CSS
- [ ] 预加载关键资源
- [ ] 避免布局抖动
- [ ] 减少第三方脚本
- [ ] 启用 HTTP/2
- [ ] 配置缓存策略

## 总结

前端性能优化是一个持续的过程：

1. **测量**: 使用工具量化性能指标
2. **分析**: 找出性能瓶颈
3. **优化**: 应用针对性的优化策略
4. **监控**: 持续跟踪性能变化

记住：**过早优化是万恶之源，但不优化更糟糕**。

---

**标签**: #前端 #性能优化 #Web

**发布日期**: 2026-02-28
