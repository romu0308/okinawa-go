// 画面の構造を JSON とスクリーンショットに書き出す。
// エルグラムの画面がどうなっているか私には見えないので、これで見えるようにする。
// 使い方: node explore.mjs <URL> <保存名>
import { chromium } from "playwright";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

const url = process.argv[2];
const name = process.argv[3] ?? "page";

if (!url) {
  console.error("使い方: node explore.mjs <URL> <保存名>");
  console.error("例: node explore.mjs https://lgram.jp/dashboard dashboard");
  process.exit(1);
}
if (!existsSync("auth.json")) {
  console.error("auth.json がない。先に `npm run login` を実行してほしい。");
  process.exit(1);
}

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  storageState: "auth.json",
  locale: "ja-JP",
  timezoneId: "Asia/Tokyo",
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(1500);

const map = await page.evaluate(() => {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const labelOf = (el) => {
    if (el.labels && el.labels.length) return el.labels[0].innerText.trim();
    if (el.getAttribute("aria-label")) return el.getAttribute("aria-label").trim();
    if (el.placeholder) return el.placeholder.trim();
    const wrap = el.closest("label");
    if (wrap) return wrap.innerText.trim();
    // 直前の見出し・ラベルらしき要素
    let prev = el.previousElementSibling;
    for (let i = 0; i < 3 && prev; i++, prev = prev.previousElementSibling) {
      const t = (prev.innerText || "").trim();
      if (t && t.length < 40) return t;
    }
    return "";
  };

  const out = { title: document.title, url: location.href, headings: [], inputs: [], buttons: [], links: [], tabs: [] };

  document.querySelectorAll("h1,h2,h3,legend").forEach((el) => {
    if (visible(el)) out.headings.push(el.innerText.trim().slice(0, 80));
  });
  document.querySelectorAll("input,textarea,select").forEach((el, i) => {
    if (!visible(el)) return;
    const rec = {
      idx: i,
      tag: el.tagName.toLowerCase(),
      type: el.type || "",
      name: el.name || "",
      id: el.id || "",
      label: labelOf(el),
      value: String(el.value || "").slice(0, 80),
    };
    if (el.tagName === "SELECT") {
      rec.options = Array.from(el.options).map((o) => o.text.trim()).slice(0, 20);
    }
    out.inputs.push(rec);
  });
  document.querySelectorAll('button,[role="button"],input[type="submit"],a.btn,.btn').forEach((el) => {
    if (!visible(el)) return;
    const t = (el.innerText || el.value || "").trim();
    if (t) out.buttons.push({ text: t.slice(0, 40), id: el.id || "" });
  });
  document.querySelectorAll("a[href]").forEach((el) => {
    if (!visible(el)) return;
    const t = (el.innerText || "").trim();
    if (t) out.links.push({ text: t.slice(0, 40), href: el.getAttribute("href") });
  });
  document.querySelectorAll('[role="tab"],.nav-link,.tab').forEach((el) => {
    if (!visible(el)) return;
    const t = (el.innerText || "").trim();
    if (t) out.tabs.push(t.slice(0, 30));
  });
  return out;
});

await fs.mkdir("pagemap", { recursive: true });
await fs.writeFile(`pagemap/${name}.json`, JSON.stringify(map, null, 2));
await page.screenshot({ path: `pagemap/${name}.png`, fullPage: true });

console.log(`保存した:
  pagemap/${name}.json  … 入力欄・ボタン・リンクの一覧
  pagemap/${name}.png   … 画面全体のスクリーンショット

見出し: ${map.headings.slice(0, 5).join(" / ")}
入力欄: ${map.inputs.length}個  ボタン: ${map.buttons.length}個`);
await browser.close();
