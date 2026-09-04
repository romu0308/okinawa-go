#!/bin/bash
# 出雲パッケージを Mac に取り込むスクリプト。
# 使い方:  bash setup-mac.sh
set -e

BRANCH="claude/line-harness-scenario-setup-f5srml"
REPO="https://github.com/romu0308/okinawa-go.git"
PKG="$HOME/izumo-package"
ELGRAM="$HOME/elgram-setup"

echo "== 1/4 パッケージを取得 =="
rm -rf "$PKG"
git clone -b "$BRANCH" --depth 1 "$REPO" "$PKG"

echo "== 2/4 エルグラム自動化ツールを $ELGRAM に配置 =="
mkdir -p "$ELGRAM"
cp -R "$PKG/l-harness-izumo/elgram/automation/." "$ELGRAM/"

echo "== 3/4 依存パッケージをインストール =="
cd "$ELGRAM"
npm install

echo "== 4/4 ブラウザを用意 =="
npx playwright install chromium

cat <<'MSG'

────────────────────────────────────────
準備完了。

次にやること:
  cd ~/elgram-setup
  npm run login        ← ブラウザが開くので手でログインして Enter

そのあと:
  node explore.mjs "（キーワード応答の作成画面のURL）" keyword-form

出てきた pagemap/keyword-form.json と .png を Claude に貼れば、
残りの設定は自動で入る。

note記事の下書きなど、他の資料は ~/izumo-package/l-harness-izumo/ にある。
────────────────────────────────────────
MSG
