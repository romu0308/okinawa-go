// 参考実装: L Harness (Cloudflare Workers) に組み込む AI 鑑定モジュール
// - 実際の Worker のルーティング／D1 スキーマ／LINE 送信関数に合わせて Claude Code が調整する
// - 依存: npm i @anthropic-ai/sdk
// - secret: wrangler secret put ANTHROPIC_API_KEY

import Anthropic from "@anthropic-ai/sdk";

export type Level = "a" | "b" | "c" | "d";

export interface KanteiEnv {
  ANTHROPIC_API_KEY: string;
  LINE_CHANNEL_ACCESS_TOKEN: string;
  DB: D1Database;
}

// system-prompt.md の内容をビルド時に埋め込む（文字列は変更しない: プロンプトキャッシュの前提）
import COMMON from "./system-prompt-common.txt";
import LEVEL_A from "./system-prompt-level-a.txt";
import LEVEL_B from "./system-prompt-level-b.txt";
import LEVEL_C from "./system-prompt-level-c.txt";
import LEVEL_D from "./system-prompt-level-d.txt";

const LEVEL_PROMPT: Record<Level, string> = { a: LEVEL_A, b: LEVEL_B, c: LEVEL_C, d: LEVEL_D };

export const PASSCODES: Record<string, Level> = {
  "縁A-717": "a",
  "縁B-323": "b",
  "縁C-505": "c",
  "縁D-141": "d",
};

const DANGER_WORDS = ["死にたい", "消えたい", "自殺", "殴られ", "暴力", "監禁", "脅され", "殺す", "ストーカー", "逃げられない"];

// 打ち間違いで弾かれるのが最大の機会損失なので、照合は寛容にする。
// 縁A-717 / 縁A717 / 縁ａ-717 / 縁 A 717 / 　縁A－717　 / 縁a_717 を全部同じとみなす。
export function normalize(text: string): string {
  return text
    .trim()
    .replace(/[Ａ-Ｚａ-ｚ０-９－]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/[‐‑‒–—―ー]/g, "-")
    .toUpperCase()
    .replace(/[-_\s]/g, "");
}

const RESCUE_WORDS = ["鑑定", "合言葉", "パスワード", "あいことば"];

export function isRescue(text: string): boolean {
  const t = text.trim();
  return RESCUE_WORDS.some((w) => t === w || t.includes(w)) && !matchPasscode(text);
}

export function matchPasscode(text: string): Level | null {
  const n = normalize(text);
  for (const [code, level] of Object.entries(PASSCODES)) {
    if (normalize(code) === n) return level;
  }
  return null;
}

export function isDanger(text: string): boolean {
  return DANGER_WORDS.some((w) => text.includes(w));
}

export interface KanteiTurn {
  role: "user" | "assistant";
  content: string;
}

export async function generateKantei(
  env: KanteiEnv,
  level: Level,
  history: KanteiTurn[], // 初回: [user]. 追加質問: [user, assistant, user]
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 4000,
    output_config: { effort: "medium" },
    system: [
      { type: "text", text: COMMON, cache_control: { type: "ephemeral" } },
      { type: "text", text: LEVEL_PROMPT[level], cache_control: { type: "ephemeral" } },
    ],
    messages: history.map((t) => ({ role: t.role, content: t.content })),
  });

  if (response.stop_reason === "refusal") {
    throw new Error("refusal");
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("empty");

  return {
    text,
    inputTokens: response.usage.input_tokens + (response.usage.cache_read_input_tokens ?? 0),
    outputTokens: response.usage.output_tokens,
  };
}

// --- Webhook 側の組み込みイメージ（既存の handler に合わせて移植する） ---
//
// async function onTextMessage(env, ctx, userId, text, replyToken) {
//   const level = matchPasscode(text);
//   if (level) {
//     if (await hasTag(env, userId, "kantei_done")) return reply(replyToken, MSG_ALREADY_DONE);
//     await addTags(env, userId, ["bought_report", `kantei_level_${level}`, "kantei_waiting"]);
//     return reply(replyToken, MSG_INTAKE);
//   }
//   if (await hasTag(env, userId, "kantei_waiting")) {
//     if (isDanger(text)) {
//       await swapTags(env, userId, { remove: ["kantei_waiting"], add: ["kantei_safety_hold"] });
//       return reply(replyToken, MSG_SAFETY);
//     }
//     if (text.length < 20) return reply(replyToken, MSG_SHORT);
//     await reply(replyToken, "受け取った。数分で返す。");
//     ctx.waitUntil(runKantei(env, userId, text));   // Reply token の期限内に生成を待たない
//     return;
//   }
//   if (await hasTag(env, userId, "kantei_followup_ok")) {
//     await reply(replyToken, "受け取った。少し待ってほしい。");
//     ctx.waitUntil(runFollowup(env, userId, text));
//     return;
//   }
//   // それ以外は既存の挙動
// }
//
// async function runKantei(env, userId, input) {
//   const level = await getLevel(env, userId); // kantei_level_x タグから
//   try {
//     const r = await generateKantei(env, level, [{ role: "user", content: input }]);
//     await env.DB.prepare("INSERT INTO kantei_logs (user_id, level, turn, input, output, tokens_in, tokens_out) VALUES (?,?,?,?,?,?,?)")
//       .bind(userId, level, 1, input, r.text, r.inputTokens, r.outputTokens).run();
//     await push(env, userId, r.text);
//     await swapTags(env, userId, { remove: ["kantei_waiting"], add: ["kantei_done", "kantei_followup_ok"] });
//   } catch (e) {
//     await push(env, userId, "いま鑑定がうまく出せなかった。少し時間をおいて、もう一度同じ内容を送ってほしい。");
//   }
// }
