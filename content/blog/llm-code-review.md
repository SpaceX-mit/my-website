# LLM 辅助代码审查实践

> 将大语言模型集成到 CI/CD 流程中，实现自动化代码审查

## 动机

传统代码审查面临的挑战：

- 人工审查耗时，影响交付速度
- 审查质量依赖个人经验
- 难以覆盖所有代码变更
- 重复性问题反复出现

## 解决方案

利用 LLM 的代码理解能力，构建自动化审查系统：

```
Pull Request → GitHub Action → LLM 分析 → 自动评论
```

## 实现方案

### 1. GitHub Action 配置

```yaml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changes
        run: |
          git diff --name-only origin/${{ github.base_ref }}...HEAD > changed_files.txt

      - name: Run AI Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/ai_review.py \
            --pr-number ${{ github.event.pull_request.number }} \
            --files changed_files.txt
```

### 2. 审查脚本

```python
import anthropic
import os
from github import Github

def review_code(file_path, diff):
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    
    prompt = f"""
    请审查以下代码变更，关注：
    1. 潜在的安全漏洞
    2. 性能问题
    3. 代码规范
    4. 逻辑错误
    
    文件: {file_path}
    
    变更内容:
    {diff}
    
    请给出具体的改进建议。
    """
    
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return message.content[0].text

def post_review(pr_number, comments):
    g = Github(os.environ["GITHUB_TOKEN"])
    repo = g.get_repo(os.environ["GITHUB_REPOSITORY"])
    pr = repo.get_pull(pr_number)
    
    for comment in comments:
        pr.create_review_comment(
            body=comment["body"],
            path=comment["path"],
            line=comment["line"]
        )
```

### 3. 审查规则

定义审查重点：

```python
REVIEW_RULES = {
    "security": [
        "SQL 注入风险",
        "XSS 漏洞",
        "敏感信息泄露",
        "不安全的反序列化"
    ],
    "performance": [
        "N+1 查询",
        "不必要的循环",
        "内存泄漏风险",
        "阻塞操作"
    ],
    "best_practices": [
        "错误处理",
        "日志记录",
        "代码复用",
        "命名规范"
    ]
}
```

## 审查示例

### 输入代码

```python
def get_users(ids):
    users = []
    for id in ids:
        user = db.query(f"SELECT * FROM users WHERE id = {id}")
        users.append(user)
    return users
```

### AI 审查意见

> ⚠️ **安全问题**: SQL 注入风险
> 
> 当前代码直接将用户输入拼接到 SQL 查询中，存在 SQL 注入风险。
> 
> **建议修改**:
> ```python
> def get_users(ids):
>     placeholders = ','.join(['%s'] * len(ids))
>     query = f"SELECT * FROM users WHERE id IN ({placeholders})"
>     return db.query(query, ids)
> ```

> ⚠️ **性能问题**: N+1 查询
> 
> 在循环中执行数据库查询会导致性能问题。建议使用 `IN` 查询一次性获取所有数据。

## 效果评估

在实际项目中运行 3 个月后的数据：

| 指标 | 数值 |
|------|------|
| 审查覆盖率 | 100% |
| 发现问题数 | 247 |
| 误报率 | 12% |
| 平均响应时间 | < 2 分钟 |
| 人工审查时间节省 | 60% |

## 最佳实践

### 1. 分层审查

```python
# 快速检查（< 30s）
quick_checks = ["syntax", "formatting", "imports"]

# 深度分析（1-2min）
deep_checks = ["security", "performance", "logic"]

# 仅对关键文件进行深度分析
if is_critical_file(file_path):
    run_deep_checks(file_path)
else:
    run_quick_checks(file_path)
```

### 2. 上下文增强

提供更多上下文信息给 LLM：

```python
context = {
    "project_type": "web_api",
    "language": "python",
    "framework": "fastapi",
    "related_files": get_related_files(changed_file),
    "recent_issues": get_recent_issues()
}
```

### 3. 人机协作

AI 审查作为辅助，不替代人工审查：

- AI 负责常规检查
- 人工负责架构和业务逻辑审查
- 重要变更必须人工确认

## 成本分析

以每月 100 个 PR 计算：

| 项目 | 成本 |
|------|------|
| API 调用费用 | ~$50 |
| GitHub Actions 运行时间 | 免费（公开仓库） |
| 节省的人工时间 | ~40 小时 |

投资回报率：**800%**

## 局限性

当前方案的限制：

- 无法理解复杂的业务逻辑
- 可能产生误报
- 依赖网络连接
- API 调用有成本

## 未来改进

- 引入向量数据库存储项目知识
- 支持多轮对话式审查
- 集成静态分析工具结果
- 学习团队的审查偏好

## 总结

LLM 辅助代码审查能够：

✅ 提高审查覆盖率
✅ 发现常见问题
✅ 节省人工时间
✅ 统一审查标准

但需要注意：

❌ 不能完全替代人工
❌ 需要持续优化提示词
❌ 要控制成本

---

**相关资源**

- [完整代码](https://github.com/felix/ai-code-review)
- [Claude API 文档](https://docs.anthropic.com/)

**标签**: #AI #代码审查 #DevOps #LLM

**发布日期**: 2026-03-10
