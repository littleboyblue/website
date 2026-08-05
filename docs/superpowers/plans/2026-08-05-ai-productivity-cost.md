# AI 提效成本转嫁文章 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 发布 `post-059`，说明公司要求 AI 提效却让员工自费购买工具，本质上是在转嫁生产资料成本。

**Architecture:** 沿用站点现有静态博客架构：Markdown 文件承载正文，`index.html` 中的 `blogConfig.posts` 提供标题、日期、摘要、分类和文件路径。现有 hash 路由、Markdown 渲染和目录逻辑无需修改。

**Tech Stack:** 静态 HTML、Markdown、内联 JavaScript、Python `http.server`、Git。

## Global Constraints

- 使用 `post-059` 和文件名 `posts/2026-08-05_059.md`。
- 分类为“产品与技术”，日期为“2026年8月5日”。
- 采用匿名典型账单，不点名具体产品，不虚构个人经历，不依赖实时价格。
- 文章语气克制但锋利，核心立场是岗位必需的 AI 支出属于公司生产资料成本。
- 不修改站点样式、渲染脚本或 Worker。

---

### Task 1: 撰写 post-059 正文

**Files:**
- Create: `posts/2026-08-05_059.md`

**Interfaces:**
- Consumes: 现有 Markdown 渲染器对 `h1`、`h2`、引用、列表和表格的支持。
- Produces: `blogConfig.posts` 可通过相对路径加载的完整文章。

- [ ] **Step 1: 创建正文**

正文必须包含标题“公司要 AI 提效，为什么最后是打工人自己买单？”，并依次覆盖：AI 从个人爱好变成工作要求、200 元只是入场券、生产资料成本转嫁、提效数据失真、支付能力分层、私人账号沉淀组织资产、个人成长与岗位支出的边界、公司应承担的四项责任、公司应为提效买单的结论。

- [ ] **Step 2: 检查文章结构**

Run: `rg -n '^#|^>' posts/2026-08-05_059.md`

Expected: 第一行是唯一的一级标题，导语为引用块，正文小节全部使用二级标题。

- [ ] **Step 3: 检查文章约束**

Run: `rg -n 'ChatGPT|Claude|Cursor' posts/2026-08-05_059.md`

Expected: 无输出，正文没有具体产品名。

### Task 2: 注册首页元数据

**Files:**
- Modify: `index.html:1593-1600`

**Interfaces:**
- Consumes: `blogConfig.posts` 中 `{ id, title, date, excerpt, category, file }` 对象结构。
- Produces: 首页、分类和归档视图可发现 `post-059`，hash 路由可加载正文。

- [ ] **Step 1: 在 post-058 后追加元数据**

```javascript
                {
                    id: 'post-059',
                    title: '公司要 AI 提效，为什么最后是打工人自己买单？',
                    date: '2026年8月5日',
                    excerpt: '公司要求员工用 AI 提效，却把订阅、额度和超额费用留给个人承担。每月 200 元看似不少，真正进入高频工作流后却只是入场券。当岗位必需的 AI 工具需要员工自费购买，所谓提效就变成了生产资料成本转嫁。本文拆解这种模式如何扭曲效率数据、制造新的职场分层，并讨论公司应该为 AI 转型承担什么。',
                    category: '产品与技术',
                    file: 'posts/2026-08-05_059.md'
                }
```

- [ ] **Step 2: 校验元数据唯一且完整**

Run: `rg -n "post-059|2026-08-05_059.md" index.html posts/2026-08-05_059.md`

Expected: `index.html` 中 ID 和文件路径各出现一次，正文文件存在。

### Task 3: 验证并发布

**Files:**
- Verify: `posts/2026-08-05_059.md`
- Verify: `index.html`
- Verify: `docs/superpowers/specs/2026-08-05-ai-productivity-cost-design.md`
- Verify: `docs/superpowers/plans/2026-08-05-ai-productivity-cost.md`

**Interfaces:**
- Consumes: 本地静态服务器和 Git 远端 `origin/main`。
- Produces: 可通过 `#post-059` 访问并推送到远端的文章提交。

- [ ] **Step 1: 检查补丁格式**

Run: `git diff --check`

Expected: 无输出且退出码为 0。

- [ ] **Step 2: 启动本地静态服务器并检查资源**

Run: `python -m http.server 8000`

Expected: `http://localhost:8000/` 返回 `index.html`，`http://localhost:8000/posts/2026-08-05_059.md` 返回正文；浏览器访问 `http://localhost:8000/#post-059` 能显示标题和目录。

- [ ] **Step 3: 在提交文章前再次同步远端**

Run: `git pull --rebase --autostash`

Expected: 当前分支成功同步，或明确报告网络故障；不得丢失本地设计、计划、正文或元数据。

- [ ] **Step 4: 检查并提交文章改动**

Run: `git status --short && git diff -- posts/2026-08-05_059.md index.html docs/superpowers/plans/2026-08-05-ai-productivity-cost.md`

Expected: 仅显示本次计划中的文件，不包含无关改动。

```bash
git add index.html posts/2026-08-05_059.md docs/superpowers/plans/2026-08-05-ai-productivity-cost.md
git commit -m "post: 公司要 AI 提效，为什么最后是打工人自己买单 (post-059)"
```

- [ ] **Step 5: 推送 main**

Run: `git push origin main`

Expected: `main` 成功推送到 `origin/main`；若网络仍不可用，保留本地提交并报告具体失败。
