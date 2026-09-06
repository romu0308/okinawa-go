// ログイン状態を保存するだけのスクリプト。
// ID・パスワードはこのコードにもファイルにも保存しない。あなたが画面で手入力する。
import { chromium } from "playwright";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs";

const START_URL = process.argv[2] ?? "https://go.lgram.jp/";

const browser = await chromium.launch({ headless: false, slowMo: 50 });
const context = await browser.newContext({
  locale: "ja-JP",
  timezoneId: "Asia/Tokyo",
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

console.log(`\nブラウザを開いた: ${START_URL}`);
await page.goto(START_URL, { waitUntil: "domcontentloaded" }).catch(() => {});

console.log(`
────────────────────────────────────────
手でログインして、管理画面のトップまで進んでほしい。
（パスワードは私には見えないし、保存もされない）

進んだら、このターミナルに戻って Enter を押す。
────────────────────────────────────────
`);

const rl = readline.createInterface({ input, output });
await rl.question("ログインが終わったら Enter: ");
rl.close();

await context.storageState({ path: "auth.json" });
fs.chmodSync("auth.json", 0o600);

const url = page.url();
fs.writeFileSync("start-url.txt", url);

console.log(`\nログイン状態を auth.json に保存した`);
console.log(`ログイン後のURL: ${url}`);

if (/^https?:\/\/lgram\.jp\/?$/.test(url) || url.includes("/manual/")) {
  console.log(`
⚠️  管理画面ではなく公開サイトのままに見える。
   ブラウザで管理画面（DMやキーワードの設定をする画面）まで進んでから
   Enter を押す必要がある。もう一度 npm run login をやり直してほしい。`);
} else {
  console.log(`次は  npm run scan  を実行する（このURLを起点にする）`);
}
console.log("auth.json は .gitignore 済み。他人に渡さないこと。");
await browser.close();
