# 用 Go 构建轻量级监控系统

> 从零开始设计并实现一个轻量级的服务监控系统

## 项目背景

在微服务架构下，我们需要一个轻量级的监控系统来追踪服务健康状态。本文记录了使用 Go 构建监控系统的完整过程。

## 系统架构

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Agents    │─────▶│  Collector  │─────▶│   Storage   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   Alerter   │
                     └─────────────┘
```

## 核心组件

### 1. 指标采集器

```go
package collector

type Metric struct {
    Name      string
    Value     float64
    Labels    map[string]string
    Timestamp time.Time
}

type Collector interface {
    Collect() ([]Metric, error)
}

// HTTP 端点采集器
type HTTPCollector struct {
    endpoint string
    timeout  time.Duration
}

func (c *HTTPCollector) Collect() ([]Metric, error) {
    client := &http.Client{Timeout: c.timeout}
    resp, err := client.Get(c.endpoint)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    // 解析 Prometheus 格式指标
    return parseMetrics(resp.Body)
}
```

### 2. 时序数据存储

使用 BoltDB 作为轻量级存储：

```go
package storage

import "go.etcd.io/bbolt"

type Storage struct {
    db *bbolt.DB
}

func (s *Storage) Write(metrics []Metric) error {
    return s.db.Update(func(tx *bbolt.Tx) error {
        bucket := tx.Bucket([]byte("metrics"))
        for _, m := range metrics {
            key := fmt.Sprintf("%s:%d", m.Name, m.Timestamp.Unix())
            value, _ := json.Marshal(m)
            if err := bucket.Put([]byte(key), value); err != nil {
                return err
            }
        }
        return nil
    })
}
```

### 3. 告警规则引擎

```go
package alerter

type Rule struct {
    Name      string
    Condition string  // e.g., "cpu_usage > 80"
    Duration  time.Duration
    Actions   []Action
}

type Alerter struct {
    rules   []Rule
    storage Storage
}

func (a *Alerter) Evaluate() {
    for _, rule := range a.rules {
        if a.checkCondition(rule) {
            a.trigger(rule)
        }
    }
}
```

## 配置文件

使用 YAML 定义监控配置：

```yaml
collectors:
  - name: web-service
    type: http
    endpoint: http://localhost:8080/metrics
    interval: 30s

  - name: database
    type: postgres
    dsn: postgres://user:pass@localhost/db
    interval: 60s

rules:
  - name: high-cpu
    condition: cpu_usage > 80
    duration: 5m
    actions:
      - type: webhook
        url: https://hooks.slack.com/xxx

  - name: high-memory
    condition: memory_usage > 90
    duration: 3m
    actions:
      - type: email
        to: ops@example.com
```

## 部署方式

### Docker 部署

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o monitor ./cmd/monitor

FROM alpine:latest
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/monitor /usr/local/bin/
COPY config.yaml /etc/monitor/
ENTRYPOINT ["monitor"]
CMD ["--config", "/etc/monitor/config.yaml"]
```

### 二进制部署

```bash
# 编译
go build -o monitor ./cmd/monitor

# 运行
./monitor --config config.yaml
```

## 性能优化

### 1. 批量写入

```go
func (s *Storage) BatchWrite(metrics []Metric) error {
    const batchSize = 1000
    for i := 0; i < len(metrics); i += batchSize {
        end := i + batchSize
        if end > len(metrics) {
            end = len(metrics)
        }
        if err := s.Write(metrics[i:end]); err != nil {
            return err
        }
    }
    return nil
}
```

### 2. 并发采集

```go
func (c *Collector) CollectAll() []Metric {
    var wg sync.WaitGroup
    results := make(chan []Metric, len(c.collectors))

    for _, collector := range c.collectors {
        wg.Add(1)
        go func(col Collector) {
            defer wg.Done()
            metrics, _ := col.Collect()
            results <- metrics
        }(collector)
    }

    go func() {
        wg.Wait()
        close(results)
    }()

    var allMetrics []Metric
    for metrics := range results {
        allMetrics = append(allMetrics, metrics...)
    }
    return allMetrics
}
```

## 监控指标

系统自身也需要被监控：

- 采集延迟
- 存储写入速度
- 内存使用
- Goroutine 数量

```go
import "github.com/prometheus/client_golang/prometheus"

var (
    collectDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "collect_duration_seconds",
            Help: "Time spent collecting metrics",
        },
        []string{"collector"},
    )
)

func init() {
    prometheus.MustRegister(collectDuration)
}
```

## 总结

通过 Go 构建的轻量级监控系统具有以下特点：

- ✅ 单二进制部署，无外部依赖
- ✅ 资源占用低（< 50MB 内存）
- ✅ 支持多种数据源
- ✅ 灵活的告警规则

完整代码已开源：[github.com/felix/litemonitor](https://github.com/felix/litemonitor)

---

**标签**: #Go #监控 #DevOps #系统设计

**发布日期**: 2026-03-20
