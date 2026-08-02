# Threads 自動投稿サービス セットアップガイド

サイトの記事を Meta Threads に自動投稿するサービスです。

## 機能

- **オートパイロット**: 設定した時刻（JST）に、サイトの記事から投稿文を自動生成して Threads に投稿
- **予約投稿**: 管理画面から投稿を作成し、日時を指定して予約
- **手動投稿**: 「今すぐ投稿」ボタンで即時投稿
- **記事ローテーション**: 未投稿の記事を優先し、同じ記事の連続投稿を回避
- **テンプレートローテーション**: 5種類の投稿文テンプレートをランダムに使用
- **画像付き投稿**: 記事のサムネイルを自動で添付
- **トークン自動更新**: 長期アクセストークン（60日有効）を週1回自動リフレッシュ（Supabase利用時）

## 管理画面

`/admin/threads` — 接続状態の確認、オートパイロット設定、投稿の作成・予約・削除ができます。

## セットアップ手順

### 1. Meta開発者アプリを作成

1. [Meta for Developers](https://developers.facebook.com/) でアプリを作成（ユースケース: **Threads API**）
2. 「Threads API」ユースケースに `threads_basic` と `threads_content_publish` の権限を追加
3. テスターとして自分の Threads アカウントを追加し、Threads アプリ側で承認

### 2. アクセストークンを取得

1. アプリの「Threads API」設定画面からユーザーアクセストークンを発行（Graph API Explorer または認可フロー）
2. 短期トークンを**長期トークン（60日有効）**に交換:

   ```
   curl "https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=<APP_SECRET>&access_token=<SHORT_LIVED_TOKEN>"
   ```

3. Threads ユーザーIDを取得:

   ```
   curl "https://graph.threads.net/v1.0/me?fields=id,username&access_token=<LONG_LIVED_TOKEN>"
   ```

### 3. 環境変数を設定（Vercel）

Vercel プロジェクトの Settings → Environment Variables に以下を追加:

| 変数名 | 説明 |
| --- | --- |
| `THREADS_ACCESS_TOKEN` | 長期アクセストークン |
| `THREADS_USER_ID` | Threads ユーザーID（数値） |
| `CRON_SECRET` | Cron エンドポイント保護用のランダムな文字列（`openssl rand -hex 32` などで生成） |

`CRON_SECRET` を設定すると、Vercel Cron は自動的に `Authorization: Bearer <CRON_SECRET>` ヘッダー付きでエンドポイントを呼び出します。

### 4. Supabase テーブルを作成（推奨）

`supabase/threads.sql` を Supabase の SQL Editor で実行してください。

> Supabase 未設定の場合は `src/data/threads-posts.json` へのローカルJSONフォールバックで動作しますが、Vercel のサーバーレス環境ではファイル書き込みが永続化されないため、**本番運用では Supabase が必須**です。トークンの自動リフレッシュも Supabase 利用時のみ永続化されます。

### 5. デプロイ

`vercel.json` に Cron 設定済み（毎時0分に `/api/threads/cron` を実行）。デプロイすれば自動で有効になります。

> **注意**: Vercel Hobby プランでは Cron の実行頻度が1日1回に制限されます。毎時実行には Pro プランが必要です。Hobby プランの場合は `vercel.json` の `schedule` を `"0 0 * * *"`（毎日9時JST）などに変更してください。

## 動作の仕組み

```
Vercel Cron（毎時） → GET /api/threads/cron
  1. トークンリフレッシュ（週1回、Supabase利用時）
  2. オートパイロットON時: 今後24時間の投稿時刻スロットに予約投稿がなければ記事から自動生成
  3. 予約時刻を過ぎた投稿を Threads API で公開
```

### 手動でCronを実行（動作確認）

```
curl "https://okinawa-go.jp/api/threads/cron?key=<CRON_SECRET>"
```

レスポンス例:

```json
{ "ok": true, "published": 1, "failed": 0, "generated": 2, "tokenRefreshed": false, "errors": [] }
```

## 関連ファイル

| ファイル | 役割 |
| --- | --- |
| `src/lib/threads.ts` | Threads Graph API クライアント |
| `src/lib/threadsQueue.ts` | 投稿キュー・設定ストア（Supabase / JSONフォールバック） |
| `src/lib/threadsGenerator.ts` | 記事からの投稿文生成 |
| `src/lib/threadsService.ts` | 公開処理・オートパイロット・トークン更新 |
| `src/pages/api/threads/cron.ts` | Cron エンドポイント |
| `src/pages/api/admin/threads.ts` | 管理API |
| `src/pages/admin/threads/index.astro` | 管理画面 |
| `src/components/admin/ThreadsManager.tsx` | 管理画面UI |
| `supabase/threads.sql` | Supabase テーブル定義 |
