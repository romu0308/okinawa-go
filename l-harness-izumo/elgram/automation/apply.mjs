// plan.json の手順どおりに画面を操作する。
// 安全側に倒してある:
//  - ブラウザは常に見える状態で動く
//  - 保存など後戻りできない操作の直前で必ず止まり、あなたが Enter を押すまで進まない
//  - 削除系の操作は既定で拒否する
//  - --dry-run を付けると入力だけして保存を押さない
//  - 想定外の要素が見つからなければ、推測せず止まってスクリーンショットを残す
import { chromium } from "playwright";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const DRY = process.argv.includes("--dry-run");
const ALLOW_DELETE = process.argv.includes("--allow-delete");
const AUTO = process.argv.includes("--yes"); // 確認を飛ばす。慣れるまで使わない

const DANGER = ["削除", "退会", "解約", "リセット", "初期化", "delete", "remove"];

if (!existsSync("auth.json")) {
  console.error("auth.json がない。先に `npm run login` を実行してほしい。");
  process.exit(1);
}
const plan = JSON.parse(await fs.readFile("plan.json", "utf8"));
const settings = JSON.parse(await fs.readFile("settings.json", "utf8"));

// "@key" または "@a.b" を settings.json の値に置き換える
const resolve = (v) => {
  if (typeof v !== "string" || !v.startsWith("@")) return v;
  const path = v.slice(1).split(".");
  let cur = settings;
  for (const k of path) {
    if (cur == null) break;
    cur = Array.isArray(cur) && /^\d+$/.test(k) ? cur[Number(k)] : cur[k];
  }
  if (cur == null) throw new Error(`settings.json に ${v} が見つからない`);
  return String(cur);
};

const rl = readline.createInterface({ input, output });
const confirm = async (msg) => {
  if (AUTO) return true;
  const a = await rl.question(`\n${msg}\n  Enter=実行 / s=このステップを飛ばす / q=中止: `);
  const t = a.trim().toLowerCase();
  if (t === "q") { console.log("中止した。"); await rl.close(); process.exit(0); }
  return t !== "s";
};

const browser = await chromium.launch({ headless: false, slowMo: 120 });
const context = await browser.newContext({
  storageState: "auth.json",
  locale: "ja-JP",
  timezoneId: "Asia/Tokyo",
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

const fail = async (step, err) => {
  const shot = `pagemap/error-${Date.now()}.png`;
  await fs.mkdir("pagemap", { recursive: true });
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
  console.error(`\n止まった。推測で進めない。
  手順: ${JSON.stringify(step)}
  理由: ${err.message}
  現在のURL: ${page.url()}
  スクリーンショット: ${shot}

このスクリーンショットと pagemap/*.json を Claude に貼れば、plan.json を直せる。`);
  await rl.close();
  await browser.close();
  process.exit(1);
};

let n = 0;
for (const step of plan.steps) {
  n++;
  const label = step.note ?? `${step.do} ${step.text ?? step.label ?? step.url ?? ""}`;
  console.log(`\n[${n}/${plan.steps.length}] ${label}`);

  const textish = `${step.text ?? ""}${step.label ?? ""}${step.note ?? ""}`;
  if (!ALLOW_DELETE && DANGER.some((d) => textish.toLowerCase().includes(d))) {
    console.log("  → 削除系に見えるので飛ばした（--allow-delete を付ければ実行する）");
    continue;
  }

  if (step.danger || step.do === "confirm") {
    if (DRY && step.danger) { console.log("  → dry-run なので保存は押さない"); continue; }
    const go = await confirm(step.message ?? `「${step.text ?? label}」を実行していい？`);
    if (!go) { console.log("  → 飛ばした"); continue; }
    if (step.do === "confirm") continue;
  }

  try {
    switch (step.do) {
      case "goto":
        await page.goto(resolve(step.url), { waitUntil: "domcontentloaded" });
        await page.waitForLoadState("networkidle").catch(() => {});
        break;
      case "click":
        await page.getByRole("button", { name: step.text, exact: false })
          .or(page.getByText(step.text, { exact: false }))
          .first()
          .click({ timeout: 15000 });
        await page.waitForTimeout(800);
        break;
      case "fill": {
        const val = resolve(step.value);
        const target = step.selector
          ? page.locator(step.selector).nth(step.index ?? 0)
          : page.getByLabel(step.label, { exact: false }).first();
        await target.fill(val, { timeout: 15000 });
        console.log(`  → 入力: ${val.slice(0, 40).replace(/\n/g, " ")}${val.length > 40 ? "…" : ""}`);
        break;
      }
      case "select": {
        const val = resolve(step.value);
        const target = step.selector
          ? page.locator(step.selector).nth(step.index ?? 0)
          : page.getByLabel(step.label, { exact: false }).first();
        await target.selectOption({ label: val }, { timeout: 15000 });
        break;
      }
      case "check":
      case "uncheck": {
        const target = step.selector
          ? page.locator(step.selector).nth(step.index ?? 0)
          : page.getByLabel(step.label, { exact: false }).first();
        await target[step.do === "check" ? "check" : "uncheck"]({ timeout: 15000 });
        break;
      }
      case "wait":
        await page.waitForTimeout(step.ms ?? 1000);
        break;
      case "screenshot": {
        await fs.mkdir("pagemap", { recursive: true });
        const p = `pagemap/${step.name ?? `step${n}`}.png`;
        await page.screenshot({ path: p, fullPage: true });
        console.log(`  → ${p}`);
        break;
      }
      default:
        throw new Error(`知らない手順: ${step.do}`);
    }
  } catch (err) {
    await fail(step, err);
  }
}

console.log(`\n全${plan.steps.length}手順が終わった${DRY ? "（dry-run なので保存はしていない）" : ""}。
ブラウザで結果を確認してほしい。確認したら Enter で閉じる。`);
await rl.question("");
await rl.close();
await browser.close();
