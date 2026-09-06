// 管理画面を自動で歩き回って、全ページの構造を書き出す。
// あなたがURLを探す必要はない。ログイン後にこれを1回動かすだけ。
// 使い方: npm run scan
import { chromium } from "playwright";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";

const START =
  process.argv[2] ??
  (existsSync("start-url.txt") ? (await fs.readFile("start-url.txt", "utf8")).trim() : null) ??
  "https://go.lgram.jp/";
const MAX_PAGES = 30;

// 触ってはいけないリンク（押すと危ない・意味がない）
const SKIP = /logout|signout|ログアウト|削除|delete|destroy|退会|解約|支払|決済|billing|invoice|password|パスワード変更/i;
// 公開サイト・マニュアル・事例ページは管理画面ではないので歩かない
const MARKETING = /\/manual\/|interview|privacy|\/legal\/|\/terms|pricing|\/about\/|\/lp\/|\/blog\//i;

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

const DUMP = () => {
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
    let prev = el.previousElementSibling;
    for (let i = 0; i < 3 && prev; i++, prev = prev.previousElementSibling) {
      const t = (prev.innerText || "").trim();
      if (t && t.length < 40) return t;
    }
    return "";
  };
  const out = { title: document.title, url: location.href, headings: [], inputs: [], buttons: [], links: [] };
  document.querySelectorAll("h1,h2,h3,legend").forEach((el) => {
    if (visible(el)) out.headings.push(el.innerText.trim().slice(0, 80));
  });
  document.querySelectorAll("input,textarea,select").forEach((el, i) => {
    if (!visible(el)) return;
    if (el.type === "hidden" || el.type === "password") return;
    const rec = { idx: i, tag: el.tagName.toLowerCase(), type: el.type || "",
      name: el.name || "", id: el.id || "", label: labelOf(el) };
    if (el.tagName === "SELECT") rec.options = Array.from(el.options).map((o) => o.text.trim()).slice(0, 20);
    out.inputs.push(rec);
  });
  document.querySelectorAll('button,[role="button"],input[type="submit"],.btn').forEach((el) => {
    if (!visible(el)) return;
    const t = (el.innerText || el.value || "").trim();
    if (t) out.buttons.push(t.slice(0, 40));
  });
  document.querySelectorAll("a[href]").forEach((el) => {
    if (!visible(el)) return;
    const t = (el.innerText || "").trim();
    const h = el.href;
    if (t && h) out.links.push({ text: t.slice(0, 40), href: h });
  });
  return out;
};

console.log(`起点: ${START}`);
await page.goto(START, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle").catch(() => {});
await page.waitForTimeout(1500);

const origin = new URL(page.url()).origin;
const seen = new Set();
const queue = [page.url()];
const results = [];

await fs.mkdir("pagemap", { recursive: true });

while (queue.length && results.length < MAX_PAGES) {
  const url = queue.shift();
  if (seen.has(url)) continue;
  seen.add(url);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.waitForTimeout(900);
  } catch {
    console.log(`  スキップ（開けない）: ${url}`);
    continue;
  }

  const map = await page.evaluate(DUMP).catch(() => null);
  if (!map) continue;

  const slug = (new URL(url).pathname.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "top").slice(0, 50);
  const name = `${String(results.length).padStart(2, "0")}-${slug}`;
  await page.screenshot({ path: `pagemap/${name}.png`, fullPage: true }).catch(() => {});
  results.push({ name, ...map, links: undefined, linkCount: map.links.length });

  console.log(`[${results.length}] ${map.title || slug}  入力${map.inputs.length} ボタン${map.buttons.length}`);

  for (const l of map.links) {
    if (SKIP.test(l.text) || SKIP.test(l.href)) continue;
    if (MARKETING.test(l.href)) continue;
    let u;
    try { u = new URL(l.href); } catch { continue; }
    if (u.origin !== origin) continue;
    u.hash = "";
    if (!seen.has(u.href) && !queue.includes(u.href)) queue.push(u.href);
  }
}

const looksMarketing = results.filter((r) => MARKETING.test(r.url)).length;
await fs.writeFile("pagemap/ALL.json", JSON.stringify({ origin, pages: results }, null, 2));
if (looksMarketing > results.length / 2) {
  console.log(`
⚠️  読み取った${results.length}ページのうち${looksMarketing}ページが公開サイト・マニュアルだった。
   管理画面にログインできていない可能性が高い。
   ブラウザで管理画面を開いてそのURLをコピーし、
   node scan.mjs "<そのURL>"  で起点を指定してやり直してほしい。`);
}
await browser.close();

console.log(`
────────────────────────────────────────
${results.length}ページ分を書き出した。

  pagemap/ALL.json  ← これ1つを Claude に貼る
  pagemap/*.png     ← 画面の画像（必要なら一緒に）

ALL.json をエディタで開いて中身を全部コピーし、
Claude の会話に貼ってほしい。設定手順をこちらで作る。
────────────────────────────────────────`);
