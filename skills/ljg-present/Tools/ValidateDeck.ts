#!/usr/bin/env bun

import { resolve } from "node:path";

const VERSION = "4.0.0";

const HELP = `ValidateDeck ${VERSION}

Usage:
  bun Tools/ValidateDeck.ts <deck.html> [--theme black|red|yellow|hacker] [--template] [--json]
  bun Tools/ValidateDeck.ts --self-test
  bun Tools/ValidateDeck.ts --help

Checks:
  template version and JavaScript syntax
  title cover, header/footer contract, page renderers
  density-aware multi-line layouts and measured fit guard
  offline math guards and presentation key map
  zero motion and zero external resources
  Hacker theme grammar when --theme hacker
`;

type Check = { id: string; pass: boolean; detail: string };
type Options = {
  file?: string;
  theme?: string;
  template: boolean;
  json: boolean;
  selfTest: boolean;
  help: boolean;
};

function parseArgs(args: string[]): Options {
  const options: Options = { template: false, json: false, selfTest: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--template") options.template = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--self-test") options.selfTest = true;
    else if (arg === "--theme") options.theme = args[++index];
    else if (arg.startsWith("--theme=")) options.theme = arg.slice("--theme=".length);
    else if (arg.startsWith("-")) throw new Error(`Unknown option: ${arg}`);
    else if (!options.file) options.file = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  return options;
}

function materializeTemplate(html: string, theme = "hacker") {
  const fixtureSlides = [
    { emphasis: true, lines: [{ indent: 0, chunks: [{ t: "章节" }] }], sourceIds: ["SRC-001"] },
    { lines: [{ indent: 0, chunks: [{ t: "脑力：组织信息" }] }, { indent: 0, chunks: [{ t: "心力：组织自己" }] }], sourceIds: ["SRC-002", "SRC-003"] },
    { lines: [{ indent: 0, chunks: [{ t: "一" }] }, { indent: 0, chunks: [{ t: "二" }] }, { indent: 0, chunks: [{ t: "三" }] }], sourceIds: ["SRC-004", "SRC-005", "SRC-006"] },
    { lines: [{ indent: 0, chunks: [{ t: "A" }] }, { indent: 0, chunks: [{ t: "B" }] }, { indent: 0, chunks: [{ t: "C" }] }, { indent: 0, chunks: [{ t: "D" }] }], sourceIds: ["SRC-007", "SRC-008", "SRC-009", "SRC-010"] },
    { lines: [{ indent: 0, chunks: [{ t: "$$C(Q)=C_1 \\cdot Q^{-b}$$" }] }], sourceIds: ["SRC-011"] },
    { lines: [{ indent: 0, chunks: [{ t: "定价: $20/month" }] }], sourceIds: ["SRC-012"] },
    { table: { caption: "无表头", header: false, rows: [["能量", "太阳能"], ["组织", "国家"]] }, sourceIds: ["SRC-013"] },
    { pre: "+---+\n|AI |\n+---+", sourceIds: ["SRC-014"] }
  ];
  return html
    .replaceAll("{{TITLE}}", "Fixture Deck")
    .replaceAll("{{SUBTITLE}}", "Fixture Meta")
    .replaceAll("{{THEME}}", theme)
    .replaceAll("{{SLIDES_JSON}}", JSON.stringify(fixtureSlides));
}

function mathSegments(text: string) {
  return [...text.matchAll(/\$\$([\s\S]+?)\$\$|\$(?![\d?])([^$\n]+?)\$/g)].map((match) => match[0]);
}

function chooseLayout(weights: number[]) {
  const lineCount = weights.length;
  const maxWeight = Math.max(...weights);
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  if (lineCount === 2) return maxWeight >= 38 || totalWeight >= 90 ? "rows" : "duo";
  if (lineCount === 3) return maxWeight <= 18 && totalWeight <= 55 ? "triptych" : "rows";
  if (lineCount === 4) return "matrix";
  return "single";
}

function validateHtml(original: string, options: Pick<Options, "theme" | "template">): Check[] {
  const html = options.template || original.includes("{{SLIDES_JSON}}")
    ? materializeTemplate(original, options.theme || "hacker")
    : original;
  const style = html.match(/<style>([\s\S]*?)<\/style>/i)?.[1] ?? "";
  const script = html.match(/<script>([\s\S]*?)<\/script>/i)?.[1] ?? "";
  const checks: Check[] = [];
  const add = (id: string, pass: boolean, detail: string) => checks.push({ id, pass, detail });

  let syntaxPass = false;
  try {
    new Function(script);
    syntaxPass = true;
  } catch (error) {
    add("javascript-syntax", false, String(error));
  }
  if (syntaxPass) add("javascript-syntax", true, "script compiles");

  add("template-version", html.includes('data-template-version="4.0.0"'), "template version is 4.0.0");
  add("title-present", /<title>[^<]+<\/title>/i.test(html), "document title is non-empty");
  add("cover-normalization", script.includes("function normalizeSlides") && script.includes("cover: true") && script.includes("linesText(slides[0]) === title"), "title cover is synthesized or deduplicated");
  add("no-information-header", !/<header\b/i.test(html) && !/first-guide/i.test(html), "no header or top guide");
  add("footer-cover-only", script.includes("metaFooter.hidden = index !== 0") && html.includes('id="pager"') && html.includes('id="metaFooter"'), "meta footer is cover-only; pager persists");

  const cssMotion = style.match(/\b(?:animation|transition|view-transition)(?:-[a-z-]+)?\s*:|@keyframes\b|scroll-behavior\s*:\s*smooth\b/gi) || [];
  const jsMotion = script.match(/\.animate\s*\(|setInterval\s*\(/g) || [];
  add("zero-motion", cssMotion.length === 0 && jsMotion.length === 0, `css=${cssMotion.length}, js=${jsMotion.length}`);

  const externalMarkup = html.match(/<(?:img|svg|link|iframe|video|audio|source)\b|https?:\/\//gi) || [];
  const externalCss = style.match(/@import\b|\burl\s*\(|\bimage-set\s*\(/gi) || [];
  add("offline", externalMarkup.length === 0 && externalCss.length === 0, `markup=${externalMarkup.length}, css=${externalCss.length}`);

  add("render-lines", script.includes("slide.lines?.length") && script.includes('lines.className = "lines fit-box"'), "lines renderer exists");
  add("render-table", script.includes("slide.table") && script.includes("slide.table.header === true") && script.includes('document.createElement("thead")') && script.includes('document.createElement("tbody")'), "table renderer respects explicit header flag and semantic sections");
  add("render-pre", script.includes("slide.pre != null") && script.includes('document.createElement("pre")'), "pre renderer exists");

  const layoutTokens = ["lineCount", "maxWeight", "totalWeight", '"duo"', '"triptych"', '"rows"', '"matrix"'];
  add("density-layout", layoutTokens.every((token) => script.includes(token)), "line count and density route four layouts");
  add("layout-css", ["duo", "triptych", "rows", "matrix"].every((layout) => style.includes(`data-layout="${layout}"`)), "four layout selectors exist");
  add("portrait-fallback", style.includes("@media (max-aspect-ratio: 1/1)") && ["duo", "triptych", "matrix"].every((layout) => style.includes(`data-layout="${layout}"`)), "portrait layout fallback exists");
  add("grid-safety", style.includes("min-width: 0") && style.includes("overflow-wrap: break-word") && style.includes("word-break: normal"), "grid items can shrink and wrap naturally");

  const fitTokens = ["function fitSlide", "availableWidth", "availableHeight", "scrollWidth", "scrollHeight", 'addEventListener("resize"', 'addEventListener("fullscreenchange"', "document.fonts?.ready", '"ResizeObserver" in window'];
  add("measured-fit", fitTokens.every((token) => script.includes(token)), "fit uses both dimensions and four refit triggers");
  add("fit-audit", script.includes("data.fitScale") || script.includes("dataset.fitScale"), "fit scale is exposed for readability audit");

  const mathTokens = ["function latexBody", "function renderMathAware", "<sup>", "<sub>", "\\\\cdot", "\\\\propto", "\\\\alpha"];
  add("offline-math", mathTokens.every((token) => script.includes(token)), "offline math subset and scripts exist");
  add("price-protection", mathSegments("$20/month\n$200/month\n$???/month").length === 0, "unclosed price strings are plain text");
  add("ascii-size", /\.pre-wrap pre[\s\S]*font-size:\s*clamp\(20px,\s*3\.6vmin,\s*70px\)/.test(style), "pre starts at 3.6vmin");

  const nextKeys = ["ArrowRight", "ArrowDown", "PageDown"].every((key) => script.includes(`"${key}"`));
  const prevKeys = ["ArrowLeft", "ArrowUp", "PageUp"].every((key) => script.includes(`"${key}"`));
  add("presenter-keys", nextKeys && prevKeys, "horizontal, vertical and page keys exist");
  add("audit-interface", script.includes("window.__DECK_AUDIT") && script.includes("currentLayout") && script.includes("footerState"), "runtime audit interface exists");

  const activeTheme = options.theme || html.match(/<body[^>]*data-theme="([^"]+)"/i)?.[1];
  if (activeTheme === "hacker" || activeTheme === "cyber") {
    const hackerColors = [
      /--hacker-void:\s*#07110D/i,
      /--hacker-paper:\s*#EAF4EC/i,
      /--hacker-signal:\s*#00C46A/i
    ];
    add("hacker-palette", hackerColors.every((pattern) => pattern.test(style)), "exact void, paper and signal colors exist");
    add("hacker-reading-strategy", style.includes('body[data-theme="hacker"] .slide') && style.includes('slide[data-cover="true"]') && style.includes("var(--hacker-paper)") && style.includes("var(--hacker-void)"), "regular paper and dark cover/chapter rules exist");
  }

  if (options.template) {
    const placeholders = ["{{TITLE}}", "{{SUBTITLE}}", "{{THEME}}", "{{SLIDES_JSON}}"];
    add("template-placeholders", placeholders.every((placeholder) => original.includes(placeholder)), "four template placeholders remain");
  }

  return checks;
}

function printResult(label: string, checks: Check[], json: boolean) {
  const failed = checks.filter((check) => !check.pass);
  const result = {
    status: failed.length === 0 ? "PASS" : "FAIL",
    label,
    passed: checks.length - failed.length,
    total: checks.length,
    failed
  };
  if (json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`${result.status} ${label} — ${result.passed}/${result.total}`);
    for (const failure of failed) console.error(`  ${failure.id}: ${failure.detail}`);
  }
  return failed.length === 0;
}

async function selfTest() {
  const templatePath = resolve(import.meta.dir, "..", "SloganTemplate.html");
  const template = await Bun.file(templatePath).text();
  const goodChecks = validateHtml(template, { theme: "hacker", template: true });
  const goodPass = goodChecks.every((check) => check.pass);

  const motionFixtures = [
    ".bad{transition:opacity 1s}",
    ".bad{transition-property:opacity;transition-duration:1s}",
    ".bad{animation-name:pulse}",
    ".bad{scroll-behavior:smooth}",
    ".bad{view-transition-name:card}"
  ];
  const motionFixturesRejected = motionFixtures.every((fixture) => {
    const bad = template.replace("</style>", `${fixture}</style>`);
    return validateHtml(bad, { theme: "hacker", template: true })
      .some((check) => check.id === "zero-motion" && !check.pass);
  });

  const resourceFixtures = [
    ".bad{background-image:url(external.png)}",
    '@import "theme.css";',
    '.bad{background-image:image-set("one.png" 1x)}'
  ];
  const resourceFixturesRejected = resourceFixtures.every((fixture) => {
    const bad = template.replace("</style>", `${fixture}</style>`);
    return validateHtml(bad, { theme: "hacker", template: true })
      .some((check) => check.id === "offline" && !check.pass);
  });

  const layouts = [
    chooseLayout([22, 24]),
    chooseLayout([48, 45]),
    chooseLayout([12, 13, 14]),
    chooseLayout([30, 28, 24]),
    chooseLayout([20, 21, 22, 23])
  ];
  const layoutPass = ["duo", "rows", "triptych", "matrix"].every((layout) => layouts.includes(layout));
  const mathPass = mathSegments("$$C(Q)=C_1\\cdot Q^{-b}$$ and $V\\propto n^2$").length === 2
    && mathSegments("$20/month $200/month $???/month").length === 0;

  const pass = goodPass && motionFixturesRejected && resourceFixturesRejected && layoutPass && mathPass;
  console.log(JSON.stringify({
    status: pass ? "PASS" : "FAIL",
    goodTemplateChecks: `${goodChecks.filter((check) => check.pass).length}/${goodChecks.length}`,
    motionFixturesRejected,
    resourceFixturesRejected,
    layouts,
    allLayoutsReachable: layoutPass,
    mathAndPriceFixtures: mathPass
  }, null, 2));
  if (!pass) process.exit(1);
}

async function main() {
  const options = parseArgs(Bun.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    return;
  }
  if (options.selfTest) {
    await selfTest();
    return;
  }
  if (!options.file) {
    console.error(HELP);
    process.exit(2);
  }

  const html = await Bun.file(options.file).text();
  const checks = validateHtml(html, options);
  const pass = printResult(options.file, checks, options.json);
  if (!pass) process.exit(1);
}

await main();
