# ValidateDeck

确定性检查 `ljg-present` 生成的单文件 HTML 是否仍满足演示契约。

## Usage

```bash
bun Tools/ValidateDeck.ts <deck.html> --theme hacker
bun Tools/ValidateDeck.ts SloganTemplate.html --template --theme hacker
bun Tools/ValidateDeck.ts --self-test
bun Tools/ValidateDeck.ts --help
```

## Options

| Option | Meaning |
|---|---|
| `--theme <name>` | 对 active theme 运行额外检查；hacker 会验证三色与浅/深阅读策略 |
| `--template` | 将四个模板占位符替换为内置 fixture 后检查，同时确认占位符仍存在 |
| `--json` | 输出机器可读结果 |
| `--self-test` | 验证合规模板、拒绝动效 fixture，并覆盖四种多行布局与公式/价格边界 |
| `--help` | 显示帮助 |

## Exit Codes

| Code | Meaning |
|---:|---|
| 0 | 所有检查通过 |
| 1 | 至少一个契约失败 |
| 2 | 参数错误或缺少输入文件 |

## What It Checks

- 模板版本与 JavaScript 语法。
- 文档标题 cover 与无重复合并路径。
- 无信息 header；meta footer 仅 cover，pager 每页存在。
- lines、table、pre 三种 renderer；table 仅在 `header:true` 时生成表头。
- duo、triptych、rows、matrix 与竖屏 fallback。
- `min-width:0`、自然换行和 measured fit guard。
- 离线公式、价格字符串保护与 ASCII 字号。
- 蓝牙翻页笔常见的方向键、PageUp/PageDown。
- CSS/JS 零动效（含属性族与 smooth scroll）以及零资源标签、`@import`、`url(...)`、`image-set(...)`。
- Hacker 三色和浅色正文/深色章节策略。

## Boundary

本工具验证静态结构，不替代真实浏览器。字体 fallback、实际换行、视觉节奏和每页最终 `fitScale` 仍需在 Interceptor 隔离浏览器中检查。
