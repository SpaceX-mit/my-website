# LiteMonitor

> 基于 Go 构建的轻量级服务监控系统

## 项目简介

LiteMonitor 是一个轻量级的服务监控与告警系统，专为中小团队和个人开发者设计。它提供了完整的指标采集、存储、查询和告警能力，同时保持极低的资源占用。

## 核心特性

### 🚀 轻量高效

- 单二进制部署，无外部依赖
- 内存占用 < 50MB
- 支持数千个监控目标

### 📊 多数据源支持

- Prometheus 格式指标
- HTTP 健康检查
- 数据库连接监控
- 自定义脚本采集

### 🔔 灵活告警

- 支持多种告警渠道（Slack、Email、Webhook）
- 可配置的告警规则
- 告警聚合与静默

### 📈 可视化

- 内置 Web UI
- 实时指标图表
- 告警历史查看

## 快速开始

### 安装

```bash
# 下载最新版本
wget https://github.com/felix/litemonitor/releases/latest/download/litemonitor-linux-amd64

# 赋予执行权限
chmod +x litemonitor-linux-amd64

# 运行
./litemonitor-linux-amd64 --config config.yaml
```

### 配置示例

```yaml
# config.yaml
server:
  port: 8080
  
storage:
  type: boltdb
  path: /var/lib/litemonitor/data.db
  retention: 30d

collectors:
  - name: my-api
    type: http
    url: http://localhost:3000/health
    interval: 30s
    
  - name: my-db
    type: postgres
    dsn: postgres://user:pass@localhost/mydb
    interval: 60s

alerts:
  - name: api-down
    condition: http_status != 200
    duration: 2m
    channels:
      - type: slack
        webhook: https://hooks.slack.com/services/xxx
```

## 架构设计

```
┌──────────────────────────────────────────┐
│              Web UI / API                │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│           Core Engine                    │
│  ┌────────┐  ┌────────┐  ┌────────┐    │
│  │Collect │  │ Store  │  │ Alert  │    │
│  └────────┘  └────────┘  └────────┘    │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│         Storage Layer (BoltDB)           │
└──────────────────────────────────────────┘
```

## 使用场景

### 1. 个人项目监控

监控你的个人网站、API 服务、数据库等：

```yaml
collectors:
  - name: blog
    type: http
    url: https://myblog.com
    interval: 5m
    
  - name: api
    type: http
    url: https://api.myblog.com/health
    interval: 1m
```

### 2. 小团队服务监控

为团队的微服务提供统一监控：

```yaml
collectors:
  - name: user-service
    type: prometheus
    url: http://user-svc:9090/metrics
    
  - name: order-service
    type: prometheus
    url: http://order-svc:9090/metrics
```

### 3. 边缘节点监控

在资源受限的边缘环境中运行：

```bash
# 使用最小配置运行
./litemonitor --config minimal.yaml --memory-limit 30M
```

## API 文档

### 查询指标

```bash
GET /api/v1/query?metric=cpu_usage&start=1h
```

### 手动触发采集

```bash
POST /api/v1/collect/my-api
```

### 查看告警历史

```bash
GET /api/v1/alerts?status=firing
```

## 性能指标

在标准配置下（100 个监控目标，30s 采集间隔）：

| 指标 | 数值 |
|------|------|
| 内存占用 | ~45MB |
| CPU 使用 | < 5% |
| 磁盘写入 | ~10MB/天 |
| 采集延迟 | < 100ms |

## 开发计划

- [x] 基础监控与告警
- [x] Web UI
- [x] Prometheus 集成
- [ ] 分布式部署支持
- [ ] 更多告警渠道（钉钉、企业微信）
- [ ] 机器学习异常检测

## 贡献指南

欢迎提交 Issue 和 Pull Request！

```bash
# 克隆仓库
git clone https://github.com/felix/litemonitor.git

# 安装依赖
go mod download

# 运行测试
go test ./...

# 构建
make build
```

## 许可证

MIT License

---

**项目地址**: [github.com/felix/litemonitor](https://github.com/felix/litemonitor)

**文档**: [docs.litemonitor.dev](https://docs.litemonitor.dev)

**讨论**: [GitHub Discussions](https://github.com/felix/litemonitor/discussions)
