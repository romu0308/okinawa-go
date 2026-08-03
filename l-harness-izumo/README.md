# L Harness 出雲縁切りファネル — シナリオ自動投入パッケージ

L Harness 管理画面（l-harness-izumo-admin.pages.dev）で手作業する予定だった
「キーワード応答ルール4本＋ステップ配信シナリオ」を、コードから一括投入するためのパッケージ。

## 中身

| ファイル | 役割 |
|---|---|
| `scenario.json` | キーワードルール・タグ・ステップ配信スケジュールの機械可読な定義 |
| `messages/day0-welcome.md` | Day0 即時返信（A〜D共通テンプレ、タイプ名だけ差し込み） |
| `messages/day1-type-a.md` 〜 `day1-type-d.md` | Day1 タイプ別詳細鑑定文 ★感動ポイント |
| `messages/day2-work.md` | Day2 縁切りワーク①（価値提供） |
| `messages/day3-story.md` | Day3 事例ストーリー |
| `messages/day4-tease.md` | Day4 講座チラ見せ（講座骨子確定後に差し替え前提の暫定版） |
| `messages/day5-7-offer.md` | Day5〜7 講座案内（同上・骨子確定待ち） |
| `seed-prompt.md` | ローカルの L Harness リポジトリで Claude Code に貼るだけの投入指示文 |

## 使い方（自動投入）

1. ローカルの L Harness プロジェクトのフォルダでこのディレクトリ一式を持ち込む
   （このリポジトリを clone するか、`l-harness-izumo/` フォルダごとコピー）
2. そのフォルダで Claude Code / Codex を開き、`seed-prompt.md` の中身を貼り付ける
3. Claude Code が L Harness 側のスキーマ（D1 / KV / 管理API）を読み取り、
   `scenario.json` と `messages/` の本文をそのまま登録する

管理画面から手で作る場合も、`scenario.json` の構造どおりに
ルール4本＋シナリオ1本を作り、本文は `messages/` からコピペすればよい。

## 注意

- A〜D のタイプ定義は診断アプリ（izumo-engiri）側の結果分類と一致させること。
  ズレていたら `messages/` の各ファイル冒頭のタイプ名・説明を修正する。
- Day4 以降は5万円講座の骨子が固まったら本文を差し替える（現状は汎用の暫定文）。
- 配信時刻はすべて `scenario.json` の `send_time` で管理（デフォルト 08:00 JST）。
