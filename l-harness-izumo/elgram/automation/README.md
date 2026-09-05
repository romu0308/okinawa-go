# エルグラム設定の自動化ツール

あなたの Mac で動かす。**ログインだけ手でやれば、あとは自動で入る。**
ID・パスワードはコードにもファイルにも保存しない。

## 準備（1回だけ・5分）

ターミナルに**これをまるごと貼って Enter**。取得・配置・インストールまで全部やる。

```bash
cd ~ && rm -rf izumo-package && git clone -b claude/line-harness-scenario-setup-f5srml --depth 1 https://github.com/romu0308/okinawa-go.git izumo-package && mkdir -p ~/elgram-setup && cp -R izumo-package/l-harness-izumo/elgram/automation/. ~/elgram-setup/ && cd ~/elgram-setup && npm install && npx playwright install chromium && echo "=== 準備完了 ==="
```

最後に `=== 準備完了 ===` と出れば成功。
（`~/izumo-package` に note 記事の下書きなど全資料も入る）

## 手順1：ログイン（1回だけ）

```bash
npm run login
```

ブラウザが開くので、**あなたが手でログイン**して管理画面のトップまで進む。
進んだらターミナルに戻って Enter。ログイン状態が `auth.json` に保存される。

> パスワードは私には見えないし、保存もされない。保存されるのはセッション情報だけ。
> `auth.json` は他人に渡さないこと（.gitignore 済み）。

## 手順2：画面を自動で読み取る（URLを探す必要はない）

```bash
npm run scan
```

管理画面を自動で歩き回って、全ページの入力欄・ボタン・見出しを書き出す。
ログアウトや削除のリンクは踏まないようにしてある。2〜3分で終わる。

終わると `pagemap/ALL.json` ができる。**これを Claude に貼る。**

（特定の1画面だけ見たいときは `node explore.mjs "<URL>" <保存名>` も使える）

## 手順3：plan.json を埋める

`pagemap/ALL.json` の中身を Claude に貼るか、同じフォルダで `claude` を起動してこれを貼る。

```
pagemap/ALL.json を読んで、plan.json を完成させて。

やりたいこと：エルグラムに「縁切り」というキーワード応答ルールを1本作る。
入れる値は settings.json に全部入っている（@keyword のように参照する）。

・ルール名 → settings.json の rule_name
・キーワード → keyword
・一致方法 → match（部分一致）
・除外キーワード → exclude_keywords
・対象の投稿 → target（すべての投稿）
・同一ユーザーへの再送 → resend_to_same_user が false なので「再送しない」にする
・コメントへの公開返信 → public_replies の5つ
・自動DM1通目 → dm_1
・自動DM2通目（返信が来たら送る）→ dm_2

plan.json の書き方は plan.json の _actions に書いてある。
pagemap の label や name を見て、確実にその要素を指すセレクタを使って。
保存ボタンには必ず danger: true を付けて。
削除系の操作は絶対に入れないで。

画面に該当する項目が見当たらない場合は、推測で埋めずに
「この項目が見つからない」と報告して。その項目は手で入れる。
```

## 手順4：まず空打ちして確認

```bash
npm run dry
```

ブラウザが見える状態で動き、**入力はするが保存は押さない**。
おかしなところに入っていないか目で見て確認する。

## 手順5：本番

```bash
npm run apply
```

保存の直前で必ず止まる。内容を見て Enter を押せば保存される。
`s` でそのステップを飛ばす、`q` で中止。

## 途中で止まったら

要素が見つからないと、推測せずに止まってスクリーンショットを残す。
`pagemap/error-*.png` と `pagemap/*.json` を Claude に貼れば、plan.json を直せる。

## 安全のために入れてある制限

- ブラウザは常に見える状態で動く（headless にしない）
- 保存など戻せない操作は、毎回あなたの Enter を待つ
- 「削除」「解約」「リセット」を含む操作は既定で実行しない
- 想定外の画面が出たら、推測せず止まる
- 投稿・コメント・DMの**送信**は自動化しない。設定だけ

## ファイル

| ファイル | 役割 |
|---|---|
| `login.mjs` | ログイン状態を保存する（手動ログイン） |
| `scan.mjs` | 管理画面を自動で歩いて全ページを書き出す（**これを使う**） |
| `explore.mjs` | 特定の1画面だけ書き出す |
| `apply.mjs` | plan.json の手順どおりに操作する |
| `settings.json` | **入れる値。文面を直すならここ** |
| `plan.json` | 画面ごとの操作手順（手順3で埋める） |
