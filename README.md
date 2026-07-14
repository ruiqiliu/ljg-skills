# ljg-skills

LJG 的 Claude Code 技能集，全部技能默认输出 **Markdown** 格式。
[original repo from LJG](https://github.com/lijigang/ljg-skills)


## 安装

使用 `npx degit` 一键安装到 Claude Code：

```bash
# 安装全部技能
npx degit ruiqiliu/ljg-skills/skills ~/.claude/skills

# 安装单个技能
npx degit ruiqiliu/ljg-skills/skills/ljg-card ~/.claude/skills/ljg-card
```

安装后重启 Claude Code 即可生效（`/exit` 再进入），无需额外注册——Claude Code 会自动扫描 `~/.claude/skills/` 目录。

### ljg-card 依赖


`ljg-card` 需要 Playwright 截图，安装后额外执行：

```bash
cd ~/.claude/skills/ljg-card && npm install && npx playwright install chromium
```

## 更新

```bash
npx degit ruiqiliu/ljg-skills/skills ~/.claude/skills --force
```

## 输出格式

全部技能统一输出 **Markdown**（`.md`），文件头使用 YAML frontmatter：

```markdown
---
title: 标题
date: [YYYY-MM-DD Day HH:MM]
tags: 标签
---
# 一级标题
## 二级标题
```

输出目录：`~/Documents/notes/`

## 技能

| 技能 | 说明 |
|------|------|
| **ljg-blind** | 盲区扫描 — 读取指定日期的 AI 对话，找出结构性思维盲区，并用微信读书章节精准补上 |
| **ljg-book** | 拆书 — 落在一道等式 f(x) 上：作者站在哪个问题前（x）/ 他这副取景框是什么（f）/ 透过框照出的画面与落点（f(x)）；收尾一张 ASCII 参考系图 |
| **ljg-card** | 内容铸卡 — 将内容转为 PNG 视觉卡片（长图 `-l`、信息图 `-i`、多卡 `-m`、视觉笔记 `-v`、漫画 `-c`、白板 `-w`、大字 `-b`） |
| **ljg-constraint** | 约束引擎 — 给一个领域/专业/角色，找出框住它的那几条约束（硬/软/自设三层），揪出被当成硬约束的假墙 |
| **ljg-invest** | 投资分析 — 核心判断项目是否是一台「秩序创造机器」 |
| **ljg-learn** | 概念解剖 — 从八个方向切开一个概念（历史、辩证、现象、语言、形式、存在、美感、元反思），压成一句顿悟 |
| **ljg-library** | 取景框借书卡 — 一本书 → 一幅「取景框」意向画面 → 一张收藏卡（PNG）：真实封面 / 作者 / 书目 + 费曼式讲透画面 |
| **ljg-map** | 生态地形图卡 — 一个行业 → 一张可俯瞰的生态地形（PNG，AI 生图）：价值像河流过地貌，标出瓶颈与价值捕获点 |
| **ljg-paper** | 论文阅读 — 为非学术人士提取论文核心想法，重理解不重批判 |
| **ljg-plain** | 白话引擎 — 把任何内容改写到聪明的十二岁小孩也能懂 |
| **ljg-present** | 演讲铸造器 — 默认高桥流（一页一关键词）；`-s` 标语流（VACAT/BIG STUDIOS 风） |
| **ljg-push** | 推送引擎 — 把本地 `~/.claude/skills/ljg-*` 一键同步到 GitHub 仓库 |
| **ljg-qa** | 信息提问机 — 把文章/论文/书的核心观点抽成 Q-A 链，Q 切要害，A 四段（结论 / 形式化 / 步骤 / 边界） |
| **ljg-rank** | 降秩引擎 — 给一个领域，找出背后不可再少的独立生成器 |
| **ljg-read** | 伴读 — 陪你读任何文本，英文三层翻译（信达雅）+ 结构标注 + 深度提问 + 跨领域旁逸 |
| **ljg-relationship** | 关系分析 — 五层结构诊断 + 精神分析，通过对话引导帮用户「看见」关系真实结构 |
| **ljg-roundtable** | 圆桌讨论 — 一个议题一场圆桌：真实人物逐轮交锋，每轮收一张 ASCII 结构图，散场全文存档 |
| **ljg-think** | 追本之箭 — 给一个观点或现象，纵向深钻到不可再分的本质 |
| **ljg-word** | 单词精通 — 深度拆解一个英语单词的核心语义和顿悟时刻 |
| **ljg-writes** | 写作引擎 — 像手术刀剖开一个观点，一层层剥到底。1000-1500 字 |
