# CodeReviewBot

> 集成 LLM 的自动化代码审查工具

## 项目简介

CodeReviewBot 是一个基于大语言模型的自动化代码审查工具，可以集成到 GitHub PR 流程中，自动发现代码中的安全漏洞、性能问题和代码规范问题。

## 核心特性

### 🔍 智能分析

- 安全漏洞检测（SQL 注入、XSS 等）
- 性能问题识别（N+1 查询、内存泄漏）
- 代码规范检查
- 逻辑错误发现

### 🚀 快速集成

```yaml
# .github/workflows/review.yml
name: AI Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: felix/codereviewbot@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

### 📊 详细报告

每个 PR 都会收到详细的审查报告，包括：

- 问题严重程度分级
- 具体代码位置
- 修复建议和示例代码
- 相关最佳实践链接

## 快速开始

### 1. 安装

```bash
pip install codereviewbot
```

### 2. 配置

创建 `.codereviewbot.yml`：

```yaml
rules:
  security:
    enabled: true
    severity: high
  performance:
    enabled: true
    severity: medium
  style:
    enabled: false

ignore:
  - "*.test.js"
  - "vendor/*"

model: claude-sonnet-4-6
```

### 3. 运行

```bash
# 审查单个文件
codereviewbot review file.py

# 审查整个 PR
codereviewbot review-pr 123

# 本地审查
codereviewbot review --local
```

## 审查示例

### 输入代码

```python
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    return db.execute(query)
```

### 输出报告

```
⚠️ 安全问题 (高危)
文件: api/users.py:15
问题: SQL 注入风险

当前代码直接拼接用户输入到 SQL 查询中，攻击者可以通过构造特殊输入执行任意 SQL 命令。

建议修改:
def get_user(user_id):
    query = "SELECT * FROM users WHERE id = %s"
    return db.execute(query, (user_id,))

参考: https://owasp.org/www-community/attacks/SQL_Injection
```

## 支持的语言

- Python
- JavaScript/TypeScript
- Go
- Java
- Rust
- C/C++

## 配置选项

### 审查规则

```yaml
rules:
  security:
    - sql_injection
    - xss
    - csrf
    - sensitive_data_exposure
  
  performance:
    - n_plus_one_query
    - unnecessary_loop
    - blocking_operation
  
  best_practices:
    - error_handling
    - logging
    - naming_convention
```

### 严重程度

- `critical`: 必须修复
- `high`: 强烈建议修复
- `medium`: 建议修复
- `low`: 可选修复

## API 使用

```python
from codereviewbot import Reviewer

reviewer = Reviewer(api_key="your-api-key")

# 审查代码片段
result = reviewer.review_code(
    code=code_string,
    language="python",
    rules=["security", "performance"]
)

# 审查文件
result = reviewer.review_file("path/to/file.py")

# 审查 PR
result = reviewer.review_pr(
    repo="owner/repo",
    pr_number=123
)

print(result.issues)
```

## 性能指标

- 平均审查时间: < 2 分钟/PR
- 问题发现率: 85%
- 误报率: < 15%
- 支持的文件大小: < 10MB

## 定价

| 方案 | PR 数量 | 价格 |
|------|---------|------|
| 免费版 | 10/月 | 免费 |
| 个人版 | 100/月 | $9/月 |
| 团队版 | 500/月 | $49/月 |
| 企业版 | 无限 | 联系我们 |

## 贡献

欢迎贡献代码和反馈！

```bash
git clone https://github.com/felix/codereviewbot.git
cd codereviewbot
pip install -e ".[dev]"
pytest
```

## 许可证

MIT License

---

**项目地址**: [github.com/felix/codereviewbot](https://github.com/felix/codereviewbot)

**文档**: [docs.codereviewbot.dev](https://docs.codereviewbot.dev)
