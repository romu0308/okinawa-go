# L Harness 出雲縁切りファネル — シナリオ自動投入パッケージ

L Harness 管理画面（l-harness-izumo-admin.pages.dev）で手作業する予定だった
「キーワード応答ルール4本＋7日間ステップ配信」を、コードから一括投入するためのパッケージ。

## 設計の全体像

- 分岐は **Day0・Day2・Day3 のみレベル別（A〜D）**。他は共通。運用が軽く、効果検証もしやすい
- ゴールの階段：無料で価値を渡す → 診断レポート1,000円（Day3） → カウンセリング4,980円（Day5） → 講座49,800円（Day7）
- レベル定義（診断結果と紐づけ）
  - A：今すぐ離れたい相手がいる（緊急度高）
  - B：離れたいが迷いが強い
  - C：モヤモヤはあるが相手が特定できていない
  - D：今は平気。予防・興味層
- 配信時刻：Day1以降は 20:00（悩み系は夜に開封率が上がる）

## 中身

| ファイル | 役割 |
|---|---|
| `scenario.json` | キーワードルール・タグ・ステップ配信スケジュールの機械可読な定義 |
| `messages/day0-common.md` | Day0 共通パート（登録直後の1通目） |
| `messages/day0-level-a.md` 〜 `day0-level-d.md` | Day0 レベル別（2通目） |
| `messages/day1-common.md` | Day1「縁を切る＝悪ではない」 |
| `messages/day2-level-a.md` 〜 `day2-level-d.md` | Day2 最初の一歩（レベル別） |
| `messages/day3-offer-report.md` | Day3 レベル別診断レポート 1,000円（URLをタグで分岐） |
| `messages/day4-common.md` | Day4 よくある相談パターン |
| `messages/day5-offer-counseling.md` | Day5 カウンセリング 4,980円 |
| `messages/day6-course-preview.md` | Day6 講座の中身公開 |
| `messages/day7-offer-course.md` | Day7 講座オファー 49,800円 |
| `messages/day8-followup.md` 〜 `day10-followup.md` | Day8〜10 買わなかった人向けフォロー3通 |
| `messages/weekly/` | 週1ナーチャリング配信の型と保存先 |
| `messages/buttons/` | **LINEのリンクをボタンにする（Flex Message）。Day3・5・7・10用** |
| `assets/reel-scripts.md` | Instagram リール台本12本（3〜4週間分） |
| `assets/bonus-videos.csv` | 既存の特典動画の棚卸しシート（自分で埋める） |
| `prompts/weekly-broadcast-prompt.md` | 週1配信を1回で1ヶ月分書かせるプロンプト |
| `prompts/bonus-video-audit.md` | 既存の特典動画を新ファネルに再配置させるプロンプト |
| `TESTING.md` | 公開前の通しテスト手順（30〜40分。note購入は不要） |
| `elgram/setup.md` | エルグラムに貼るだけの設定表（キーワード・公開返信・DM文面） |
| `elgram/troubleshooting.md` | DMが届かない等の切り分け表 |
| `elgram/automation/` | Mac で動くエルグラム設定の自動化ツール（ログインだけ手動） |
| `seed-prompt.md` | ローカルの L Harness リポジトリで Claude Code に貼るだけの投入指示文（AI鑑定の実装込み） |
| `STRATEGY.md` | 事業設計の全体（note一本化・自動化・匿名運営チェックリスト・実行順） |
| `ai-kantei/` | AI 個別鑑定の仕様・システムプロンプト・参考実装 |
| `note/` | note 記事の下書き6本（レポート×4、カウンセリング、講座） |
| `course/SPEC.md` | **講座の正式仕様（唯一の正）。変えるときは必ずここを先に直す** |
| `course/chapter-01-script.md` | 第1章の動画台本（15分・顔出しなし） |
| `prompts/course-room-sync.md` | 別の作業部屋と講座仕様を突き合わせるためのプロンプト |
| `prompts/izumo-kaiun-site-prompt.md` | izumo-kaiun.com から Stripe・特商法・特定情報を撤去する改修プロンプト |

## Mac への取り込み（最初にこれ）

```bash
cd ~ && rm -rf izumo-package && git clone -b claude/line-harness-scenario-setup-f5srml --depth 1 https://github.com/romu0308/okinawa-go.git izumo-package && bash izumo-package/l-harness-izumo/setup-mac.sh
```

## 使い方（自動投入）

1. ローカルの L Harness プロジェクト（`~/line-harness`）でこのフォルダを取得する
2. そこで Claude Code を起動し、`seed-prompt.md` の中身を貼り付ける
3. Claude Code が L Harness 側のスキーマ（D1 / KV / 管理API）を読み取り、
   `scenario.json` と `messages/` の本文をそのまま登録する

管理画面から手で作る場合も、`scenario.json` の構造どおりに
ルール4本＋ステップ7本を作り、本文は `messages/` からコピペすればよい。

## 販売は全部 note（Stripe・自前LPは使わない）

特商法表記を note 側が担うので、個人の住所・電話を公開せずに売れる。3商品とも note 有料記事にする。

| 商品 | note での形 | 購入者限定エリアに置くもの |
|---|---|---|
| Day3 診断レポート 1,000円 | 有料記事 ×4（レベルA〜D別） | レポート本文 |
| Day5 カウンセリング 4,980円 | 有料記事（申込チケット） | 予約カレンダー案内＋「LINEに『申込みました』と送る」 |
| Day7 講座 49,800円 | 有料記事（noteプレミアム必須） | 動画リンク（YouTube限定公開）＋週1相談のZoom＋質問先LINE |

## 埋めるべきURL（6つ）

`scenario.json` の `variables` にプレースホルダで入っている。note 記事を公開したら差し替える。

- `report_url_a` 〜 `report_url_d` … レベル別レポート記事
- `counseling_url` … カウンセリング申込チケット記事
- `course_url` … 講座記事

計測は UTM ではなく **L Harness のトラッキングリンク（/t/）** を使う（note のアクセス解析は UTM を出さない）。
Day ごとのクリック数と note の購入数を突き合わせれば、どの Day で売れているかが分かる。

## 法的注意（全文面で守っていること）

- 効果の断定なし。「縁が切れる」と約束しない。決めるのは本人、という立場を崩さない
- ウソの締切・限定を付けない（景表法の有利誤認）。延長した瞬間に信頼が死ぬ。
  カウンセリングは対応枠が実際に有限なので「月◯名まで」は正当に使える

## 運用の週次ルーティン

- リール：週3〜4本（`assets/reel-scripts.md` に12本ぶんの台本）。コメント誘導は全部「縁切り」に統一
- 週1配信：`prompts/weekly-broadcast-prompt.md` で月1回まとめて4本書く
- 数字チェック：週1回。見るのは「LINE登録数」と「note購入数（3商品）」だけ

## 今後の追加予定

- Day8〜10：買わなかった人向けフォロー3通（講座のQ&A形式が定番）
- 開封率が取れるなら、Day3とDay7の開封率を最初のKPIにする
