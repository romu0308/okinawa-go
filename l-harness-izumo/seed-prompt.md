# ローカルの L Harness（`~/line-harness`）で Claude Code に貼るプロンプト

`~/line-harness` で `claude` を起動し、**Claude Code の画面が出てから**以下を貼り付ける。

---

GitHubの公開リポジトリ romu0308/okinawa-go のブランチ claude/line-harness-scenario-setup-f5srml にある l-harness-izumo フォルダ一式を、このプロジェクトにダウンロードして。
（URL: https://github.com/romu0308/okinawa-go/tree/claude/line-harness-scenario-setup-f5srml/l-harness-izumo）

ダウンロードできたら、その中の scenario.json と messages/ を、このプロジェクトのデータストア（D1 / KV / 管理APIのいずれか、実装を読んで判断して）に一括登録してほしい。

やること：
1. このプロジェクトのスキーマ（キーワード応答ルール・タグ・ステップ配信がどう保存されているか）を読んで把握する
2. scenario.json の内容をそのスキーマに変換して登録する
   - キーワードルール4本（A/B/C/D、全角半角・大文字小文字を同一視）。各ルールは day0-common.md と day0-level-X.md の2通を続けて送る
   - タグ9種
   - ステップ配信 Day1〜Day7（Day2とDay3はタグでレベル分岐。Day3は同じ本文で {{report_url}} だけレベル別の値に置換。配信時刻は全て20:00、タイムゾーンは Asia/Tokyo）
3. メッセージ本文は messages/ の各ファイルの「---」より下の本文部分だけを使う（見出しと注意書きは登録しない）
4. `{{report_url_a〜d}}` `{{counseling_url}}` `{{course_url}}` は scenario.json の variables の値で置換する。まだ note.com/USER のプレースホルダなので、Day3・Day5・Day7 は下書き（無効）状態で登録し、URL確定後に有効化できるようにしておく。可能なら各URLは L Harness のトラッキングリンクとして発行し、その /t/ URL を本文に入れる
5. 登録に使ったスクリプトを scripts/seed-scenario.(ts|js|sql) として残す。冪等な作り（既存データがあれば上書き）にして、文面を直したら再実行するだけで更新できるようにする
6. 登録後、実際に保存された内容を読み出して、ルール4本・ステップ7本が入っていることを確認して報告する

管理画面のUIコードは変更しない。データ登録のみ。

---

## 補足（人間向け）

- これで管理画面での手作業は不要になる。文面を直したいときは `messages/` の
  ファイルを編集して、同じシードスクリプトを再実行すればよい
- note 記事を公開したら `scenario.json` の `variables` に記事URLを入れる → 再シード →
  Day3・Day5・Day7 を有効化、の順
- 動作確認：自分のLINEアカウントで「A」と送り、Day0の2通が届くこと・
  タグが付くことを管理画面で確認する
