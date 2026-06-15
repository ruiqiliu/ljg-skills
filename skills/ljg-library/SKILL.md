---
name: ljg-library
description: "一本书 → 一句取景框 → 一张 2050 图书馆借书卡（PNG）。卡上有真实封面、作者头像、书目信息，核心是一句精炼该书独创「取景框」（它让你换一副眼睛看世界的方式）的话，配一张作者核心思想的 ASCII 图形。浅色光学玻璃风、强调色从封面动态提取、极简两 block、宽高自适应。合上书记住这一句，就没白读。Use when user says '取景框卡', '图书馆卡', 'library card', '书卡', '铸书卡', '一本书一句话一张卡', '/ljg-library', or provides a book name and wants it distilled into one collectible card. NOT FOR 拆书结构分析（用 ljg-book）、纯文字金句（用 ljg-card -b）、信息图（用 ljg-card -i）、视觉笔记（用 ljg-card -v）。"
user_invocable: true
version: "1.0.0"
---

# ljg-library：取景框借书卡

一本书，铸成一张 2050 图书馆借书卡。封面、作者、书目是身份；**核心是一句话——精炼这本书独创的「取景框」**（它让你换一副眼睛看世界的方式）。合上书半年后，瞥一眼这张卡，整本书改变你的那一格瞬间回来——这是「没白读」的物证。

> 设计经七轮迭代定型，完整历程见 `~/.claude/PAI/MEMORY/WORK/ljg-oneliner-design/ISA.md`。

## 约束

输出为视觉文件（PNG），不适用 Markdown / Denote / ASCII-only 规范。

## 灵魂：取景框提炼

卡好不好看是壳，**能不能从一本书提炼出它独创的看世界方式、压成一句话，才是命**。这一步若失手，整张卡退化成豆瓣读书卡。

执行提炼前，**先 Read `references/extraction.md`**，走那六步（问题 → 零点 → 位移 → 压句 → 配象 → 校验），并据此设计「作者核心思想」的 ASCII 图形。

**输入弹性**：继刚常常自己已经有那句话（读完顺手就想铸卡）。给了句子就直接用（只走第 6 步校验）；没给则走全程提炼。

## 视觉规格

生成 HTML 前，**先 Read `references/visual.md`**——浅色玻璃精确规格、动态强调色、凸性/思想图的非等距画法、七轮踩过的坑全在里面。这是视觉质量底线。

## 流程

```
输入：书名（或 书名 + 已想好的那句取景框）
  ↓
1. weread 取真封面 + 书目（见下「素材获取」）
2. web 抓作者头像
3. 提封面主色 → 动态强调色（python assets/extract_color.py <封面>）
4. 提炼取景框句（用户给了→只校验；没给→走 extraction.md 六步）
5. 设计作者核心思想 ASCII 图（extraction.md）
6. 填 assets/library_template.html 的占位变量
7. 渲染（capture.js，fullpage 自适应高度）
8. Read 自验 → 交付路径
```

## 素材获取（关键，按此顺序降级）

### 封面 + 书目（weread）

继刚有微信读书。走 weread skill 的 `/store/search`（先 Read `~/.claude/skills/weread/search.md`）：

```bash
curl -s -X POST "https://i.weread.qq.com/api/agent/gateway" \
  -H "Authorization: Bearer $WEREAD_API_KEY" -H "Content-Type: application/json" \
  -d '{"api_name":"/store/search","keyword":"<书名>","scope":10,"skill_version":"1.0.3"}'
```

- 回包 `results[0].books[].bookInfo` 有 `title / author / cover / publisher / category / intro`。
- **封面 cover URL 是 `s_` 缩略图（70×100，太小会糊）。把 `s_` 换成 `t7_` 拿高清（285×411）**：`.../cover/942/635942/t7_635942.jpg`。下载时带 `-H "Referer: https://weread.qq.com/"`。
- 取不到 weread → 联网搜豆瓣封面（web-access / markdown-proxy）→ 仍无则 CSS 占位书封。

### 作者头像（web）

维基百科原图最稳：

```bash
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
  -o /tmp/lib_avatar.jpg "https://upload.wikimedia.org/wikipedia/commons/<x>/<xx>/<File>.jpg"
```

- **坑：thumb 路径（`/thumb/.../480px-xxx.jpg`）若该尺寸未缓存会返 HTML 错误页。用原图路径（去掉 /thumb/ 和尺寸段），并必须带 User-Agent（缺 UA 被 Wikimedia 拦）。** 先 WebFetch 维基人物页拿到 `Xxx.JPG` 文件名，再构造原图 URL。
- 无头像 → 省略头像（模板作者行不显示 avatar），不阻塞。

### 动态强调色

```bash
python3 assets/extract_color.py /tmp/lib_cover.jpg
# 输出形如：#c43d30
```

从封面提取最显著的彩色作强调色（换书自动换色：红封→红卡、蓝封→蓝卡）。脚本逻辑见 `assets/extract_color.py`。

## 模板变量（library_template.html）

| 变量 | 内容 |
|------|------|
| `{{ACCENT}}` | 动态强调色 hex（如 `#c43d30`） |
| `{{COVER}}` `{{AVATAR}}` | 封面 / 头像的 `file://` 绝对路径（无头像填空，作者行自动省 avatar） |
| `{{TITLE}}` `{{EN}}` `{{SUBTITLE}}` | 书名中 / 英 / 副标题 |
| `{{TAGS}}` | 3-4 个主题标签（来自 weread category 或书的核心概念），每个 `<span class="tag">…</span>` |
| `{{AUTHOR_CN}}` `{{AUTHOR_META}}` | 作者中文名 / 「英文名 · 出版社 年份」 |
| `{{FRAME}}` | 取景框主句，关键词用 `<span class="hl">…</span>` 染强调色 |
| `{{ECHO}}` | 隐喻/配象句（取景框的具体意象，可被半年后重演） |
| `{{CHART}}` | 作者核心思想 ASCII 图（含 span 上色），见 extraction.md |
| `{{NOTE}}` | 图右侧 3 段思想解读（`<div class="cn-item">…</div>`） |

## 渲染

```bash
node ~/.claude/skills/ljg-card/assets/capture.js \
  /tmp/ljg_library_{name}.html ~/Downloads/{name}.png 1080 1440 fullpage
```

复用 ljg-card 的 capture.js（playwright 已装在 ljg-card/node_modules）。**必须 `fullpage`**——卡片高度自适应内容，不留底部空白。`file://` 引用本地封面/头像可直接渲染。

## 交付

1. Read 输出的 PNG 亲眼验图（封面/头像加载 ✓、取景框句是主角 ✓、强调色协调 ✓、凸图形状对 ✓、右侧无空白 ✓）。
2. 报告文件路径 + 一句取景框提炼说明。

## Gotchas（七轮踩坑，务必避开）

- **封面尺寸**：weread `s_` 前缀是 70×100 缩略图，必糊。换 `t7_` 拿 285×411 高清。
- **头像 thumb 陷阱**：Wikimedia `/thumb/.../NNNpx-` 特定尺寸未缓存会返 HTML 错误页。用原图路径 + User-Agent。
- **ASCII 曲线必须非等距**：等距 `╱` 字符（恒 45°）= 常斜率 = 必成直线，凸性出不来。凸曲线要散点按 `x=√y` 定位——底部水平跨度大（横铺=损失 capped）、顶部水平跨度小（近垂直=收益 open）。这条坑踩了三次，见 visual.md。
- **纯黑/纯白都不要**：纯黑无法分层、配亮字割眼；浅底用冷雾白 `#eef1f7→#e3e8f2`（非死白），深底用有色温的深炭。正文浅底用近黑 `#1a1f2e`、深底用暖米白。
- **右侧空白**：左对齐必留右侧豁口。文本用 `text-align:justify; text-justify:inter-ideograph` 两端对齐；信息块用左图右文填满，别让任何 block 只占左半。
- **颜色克制**：大面积是底色 + 正文占八成，强调色只点两成（标签/曲线/关键词/印）。强调色从封面动态提取，不写死。
- **取景框是认知位移不是摘要**：含动作动词 + 具体意象，写成「原来不是 X，其实是 Y」的换眼睛句，不是「本书讲了……」。验收尺：凉脑子瞥一眼，那一格回不回得来。
