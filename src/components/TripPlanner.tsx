import { useState } from 'react';

const DAYS_OPTIONS = ['1泊2日', '2泊3日', '3泊4日', '4泊5日以上'];
const GROUP_OPTIONS = ['カップル', 'ファミリー', '友人グループ', '一人旅'];
const BUDGET_OPTIONS = ['節約', '普通', 'ちょっと贅沢'];
const INTEREST_OPTIONS = ['海・ビーチ', 'グルメ', '文化・歴史', 'アクティビティ', 'カフェ巡り'];
const MONTHS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`);

const FALLBACK_PLANS: Record<string, string> = {
  'couple-2': `# 2泊3日 カップル向けプラン

## 1日目：北谷でゆるく始める
- 14:00 那覇空港到着 → レンタカーで北谷へ（40分）
- 15:30 ホテルチェックイン（ヒルトン沖縄北谷リゾート）
- 16:30 アラハビーチで散歩
- 18:00 サンセット鑑賞
- 19:00 ZHYVAGO COFFEE WORKS で夕食

## 2日目：中部〜北部ドライブ
- 9:00 浜屋そばで朝ごはん
- 10:30 万座毛
- 12:00 岸本食堂で沖縄そば（本部町）
- 13:30 美ら海水族館
- 16:00 備瀬のフクギ並木散歩
- 18:00 北谷に戻ってアメリカンビレッジ散策
- 19:30 GORDIE'S OLD HOUSEでハンバーガー

## 3日目：那覇でのんびり
- 10:00 チェックアウト → 那覇へ
- 11:00 壺屋やちむん通り散策
- 12:30 牧志公設市場で海鮮ランチ
- 14:00 国際通り裏通りでお土産
- 16:00 那覇空港

**予算の目安（2名）:** 宿泊 35,000〜50,000円 / 食事 15,000〜20,000円 / レンタカー 8,000〜12,000円 / 観光 5,000円

**地元Tips:** 浜屋そばは朝9時の開店直後が空いていておすすめ。美ら海水族館は16時以降の入館が割引あり。`,

  'family-2': `# 2泊3日 ファミリー向けプラン

## 1日目：南部でのんびりスタート
- 11:00 那覇空港到着 → レンタカーで南部へ
- 12:00 瀬長島ウミカジテラスでランチ
- 14:00 おきなわワールド（鍾乳洞＆エイサー体験）
- 16:30 ホテル到着（ザ・ビーチタワー沖縄・北谷）
- 17:30 ホテルのプールで遊ぶ
- 19:00 北谷のデポアイランドで夕食

## 2日目：北部で大自然体験
- 8:30 ホテル出発
- 9:30 ネオパークオキナワ（動物ふれあい）
- 12:00 名護のステーキハウスでランチ
- 13:30 美ら海水族館（ジンベエザメ餌やりは15:00）
- 16:30 エメラルドビーチで水遊び
- 18:00 北谷に戻る
- 19:00 アメリカンビレッジで夕食＆散策

## 3日目：那覇で最後のお楽しみ
- 9:00 チェックアウト → 那覇へ
- 10:00 首里城公園
- 11:30 牧志公設市場で海鮮ランチ
- 13:00 国際通りでお土産ショッピング
- 14:30 ブルーシールでアイス
- 15:30 那覇空港へ

**予算の目安（4名家族）:** 宿泊 40,000〜60,000円 / 食事 25,000〜35,000円 / レンタカー 10,000〜15,000円 / 観光 10,000円

**地元Tips:** おきなわワールドの鍾乳洞は真夏でも涼しいので暑さ対策にも。美ら海水族館の年パスは2回行けば元が取れるので、連日行く予定なら検討を。`,

  'friends-1': `# 1泊2日 友人グループ向けプラン

## 1日目：到着したらすぐ海と夜を楽しむ
- 12:00 那覇空港到着 → レンタカーで北谷へ（40分）
- 13:00 ジャッキーステーキハウスでボリューム満点ランチ
- 14:30 アラハビーチ or 北谷サンセットビーチ
- 17:00 ホテルチェックイン（ラ・ジェント・ホテル沖縄北谷）
- 18:00 アメリカンビレッジ散策
- 19:30 GORDIE'S OLD HOUSEでハンバーガー＆クラフトビール
- 21:00 デポアイランドのバーでナイトタイム

## 2日目：南部をドライブして帰路
- 9:00 チェックアウト
- 9:30 港川外人住宅街でカフェモーニング（oHacorte）
- 11:00 知念岬公園（絶景ドライブ）
- 12:00 奥武島の天ぷら（1個65円の島天ぷら！）
- 13:30 ニライカナイ橋で記念撮影
- 14:30 瀬長島ウミカジテラスで最後のお土産
- 16:00 レンタカー返却 → 那覇空港

**予算の目安（1人あたり）:** 宿泊 5,000〜8,000円 / 食事 5,000〜8,000円 / レンタカー割り勘 2,000〜3,000円 / 観光 1,000円

**地元Tips:** 奥武島の天ぷらは中本鮮魚店が地元民の定番。もずく天ぷらとさかな天ぷらがおすすめ。港川外人住宅街は駐車場が少ないので朝イチが吉。`,
};

function getFallbackPlan(days: string, group: string): string {
  if (days === '2泊3日' && group === 'カップル') return FALLBACK_PLANS['couple-2'];
  if (days === '2泊3日' && group === 'ファミリー') return FALLBACK_PLANS['family-2'];
  if (days === '1泊2日' && group === '友人グループ') return FALLBACK_PLANS['friends-1'];
  // Default: return the closest match
  if (days === '1泊2日') return FALLBACK_PLANS['friends-1'];
  if (group === 'ファミリー') return FALLBACK_PLANS['family-2'];
  return FALLBACK_PLANS['couple-2'];
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-[15px] md:text-[17px] font-medium mt-8 mb-3 text-[#000]">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-[17px] md:text-[20px] font-medium mt-10 mb-4 text-[#000]">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-[20px] md:text-[24px] font-medium mt-0 mb-6 text-[#000]">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-medium">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="text-[13px] md:text-[14px] leading-[1.8] text-[#333] ml-4 mb-1">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="mb-6 list-disc pl-1">$&</ul>')
    .replace(/^(?!<[hul]|<li|<strong)(.+)$/gm, (_, p) => {
      if (p.trim() === '') return '';
      return `<p class="text-[13px] md:text-[14px] leading-[1.8] text-[#333] mb-4">${p}</p>`;
    })
    .replace(/\n{3,}/g, '\n\n');
}

export default function TripPlanner() {
  const [days, setDays] = useState('2泊3日');
  const [group, setGroup] = useState('カップル');
  const [budget, setBudget] = useState('普通');
  const [interests, setInterests] = useState<string[]>(['グルメ']);
  const [month, setMonth] = useState('3');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setIsFallback(false);

    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days, group, budget, interests, month }),
      });
      const data = await res.json();

      if (data.fallback || data.error) {
        setResult(getFallbackPlan(days, group));
        setIsFallback(true);
      } else {
        setResult(data.plan);
      }
    } catch {
      setResult(getFallbackPlan(days, group));
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* 旅行日数 */}
        <fieldset className="mb-8">
          <legend className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3">
            Duration / 旅行日数
          </legend>
          <div className="flex flex-wrap gap-2">
            {DAYS_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`cursor-pointer px-4 py-2 text-[13px] border rounded-sm transition-colors duration-200 ${
                  days === opt
                    ? 'border-[#000] text-[#000] bg-[#fafafa]'
                    : 'border-[#eee] text-[#999] hover:border-[#ccc]'
                }`}
              >
                <input
                  type="radio"
                  name="days"
                  value={opt}
                  checked={days === opt}
                  onChange={() => setDays(opt)}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 人数構成 */}
        <fieldset className="mb-8">
          <legend className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3">
            Group / 人数構成
          </legend>
          <div className="flex flex-wrap gap-2">
            {GROUP_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`cursor-pointer px-4 py-2 text-[13px] border rounded-sm transition-colors duration-200 ${
                  group === opt
                    ? 'border-[#000] text-[#000] bg-[#fafafa]'
                    : 'border-[#eee] text-[#999] hover:border-[#ccc]'
                }`}
              >
                <input
                  type="radio"
                  name="group"
                  value={opt}
                  checked={group === opt}
                  onChange={() => setGroup(opt)}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 予算 */}
        <fieldset className="mb-8">
          <legend className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3">
            Budget / 予算
          </legend>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`cursor-pointer px-4 py-2 text-[13px] border rounded-sm transition-colors duration-200 ${
                  budget === opt
                    ? 'border-[#000] text-[#000] bg-[#fafafa]'
                    : 'border-[#eee] text-[#999] hover:border-[#ccc]'
                }`}
              >
                <input
                  type="radio"
                  name="budget"
                  value={opt}
                  checked={budget === opt}
                  onChange={() => setBudget(opt)}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 興味 */}
        <fieldset className="mb-8">
          <legend className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3">
            Interests / 興味（複数選択可）
          </legend>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`cursor-pointer px-4 py-2 text-[13px] border rounded-sm transition-colors duration-200 ${
                  interests.includes(opt)
                    ? 'border-[#000] text-[#000] bg-[#fafafa]'
                    : 'border-[#eee] text-[#999] hover:border-[#ccc]'
                }`}
              >
                <input
                  type="checkbox"
                  value={opt}
                  checked={interests.includes(opt)}
                  onChange={() => toggleInterest(opt)}
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 時期 */}
        <fieldset className="mb-10">
          <legend className="font-['Inter'] text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3">
            Month / 時期
          </legend>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none bg-white border border-[#eee] rounded-sm px-4 py-2 text-[13px] text-[#000] pr-8 cursor-pointer hover:border-[#ccc] transition-colors duration-200 focus:outline-none focus:border-[#000]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>
        </fieldset>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || interests.length === 0}
          className="w-full md:w-auto px-8 py-3 bg-[#000] text-white text-[12px] font-['Inter'] tracking-[0.1em] uppercase rounded-sm hover:bg-[#222] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating' : 'Generate Plan'}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="mt-12 flex items-center gap-3">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-[#000] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-[#000] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-[#000] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[12px] text-[#999] font-['Inter'] tracking-[0.05em]">
            AIがプランを作成中...
          </span>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-12">
          {isFallback && (
            <div className="mb-6 px-4 py-3 bg-[#fafafa] border border-[#eee] rounded-sm">
              <p className="text-[12px] text-[#999] leading-[1.6]">
                ※ AI生成は現在準備中のため、サンプルプランを表示しています。
              </p>
            </div>
          )}
          <div className="border border-[#eee] rounded-sm p-6 md:p-8">
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(result) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
