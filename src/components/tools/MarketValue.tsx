import { useState } from 'react';

const jobTypes = [
  'フロントエンドエンジニア',
  'バックエンドエンジニア',
  'フルスタックエンジニア',
  'インフラエンジニア',
  'データサイエンティスト',
  'プロジェクトマネージャー',
  'プロダクトマネージャー',
  'UIUXデザイナー',
  'マーケター',
  '営業',
  '人事・採用',
  '経理・財務',
  'コンサルタント',
  'その他',
] as const;

const skillOptions = [
  'JavaScript', 'Python', 'AWS', 'マネジメント', '英語',
  'データ分析', 'AI・ML', 'プロジェクト管理', 'デザイン', 'マーケティング',
] as const;

type JobType = typeof jobTypes[number];

const jobBase: Record<JobType, number> = {
  フロントエンドエンジニア: 520,
  バックエンドエンジニア: 550,
  フルスタックエンジニア: 600,
  インフラエンジニア: 530,
  データサイエンティスト: 620,
  プロジェクトマネージャー: 580,
  プロダクトマネージャー: 600,
  UIUXデザイナー: 480,
  マーケター: 470,
  営業: 450,
  '人事・採用': 430,
  '経理・財務': 440,
  コンサルタント: 620,
  その他: 450,
};

const skillWeight: Record<string, number> = {
  JavaScript: 30,
  Python: 35,
  AWS: 40,
  マネジメント: 50,
  英語: 35,
  データ分析: 40,
  'AI・ML': 55,
  プロジェクト管理: 35,
  デザイン: 25,
  マーケティング: 30,
};

interface Result {
  score: number;
  rank: string;
  low: number;
  high: number;
  strengths: string[];
  improvements: string[];
}

function calcMarketValue(
  job: JobType,
  years: number,
  skills: string[],
  currentSalary: number,
): Result {
  const base = jobBase[job];
  const yearBonus = Math.min(years, 25) * 12;
  const skillScore = skills.reduce((s, sk) => s + (skillWeight[sk] || 20), 0);

  const rawValue = base + yearBonus + skillScore;
  const score = Math.min(100, Math.round((rawValue / 900) * 100));

  let rank: string;
  if (score >= 85) rank = 'S';
  else if (score >= 70) rank = 'A';
  else if (score >= 50) rank = 'B';
  else if (score >= 30) rank = 'C';
  else rank = 'D';

  const estimated = rawValue;
  const low = Math.round(estimated * 0.85);
  const high = Math.round(estimated * 1.2);

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (years >= 10) strengths.push('豊富な実務経験');
  else improvements.push('実務経験を積み重ねる');

  if (skills.length >= 4) strengths.push('幅広いスキルセット');
  else improvements.push('スキルの幅を広げる');

  if (skills.includes('マネジメント')) strengths.push('マネジメント能力');
  else improvements.push('マネジメント経験を積む');

  if (skills.includes('英語')) strengths.push('英語力（グローバル対応）');
  else improvements.push('ビジネス英語の習得');

  if (skills.includes('AI・ML') || skills.includes('データ分析')) {
    strengths.push('先端技術への対応力');
  } else {
    improvements.push('AI・データ分析スキルの習得');
  }

  if (currentSalary < low) strengths.push('現在年収に伸びしろあり');

  return { score, rank, low, high, strengths: strengths.slice(0, 4), improvements: improvements.slice(0, 4) };
}

const rankColors: Record<string, string> = {
  S: '#7c3aed',
  A: '#2563eb',
  B: '#16a34a',
  C: '#eab308',
  D: '#dc2626',
};

export default function MarketValue() {
  const [job, setJob] = useState<JobType>('フロントエンドエンジニア');
  const [years, setYears] = useState(5);
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState('');
  const [currentSalary, setCurrentSalary] = useState(450);
  const [result, setResult] = useState<Result | null>(null);

  const toggleSkill = (s: string) => {
    setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleCalc = () => {
    setResult(calcMarketValue(job, years, skills, currentSalary));
  };

  const shareText = result
    ? `市場価値診断結果：ランク${result.rank}（スコア${result.score}）推定年収${result.low}〜${result.high}万円`
    : '';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://okinawa-go.jp/tools/market-value';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    fontSize: 15,
    outline: 'none',
    background: '#fafafa',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#444',
    marginBottom: 6,
  };

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {!result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>職種</label>
            <select
              value={job}
              onChange={(e) => setJob(e.target.value as JobType)}
              style={inputStyle}
            >
              {jobTypes.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>経験年数: {years}年</label>
            <input
              type="range"
              min={1}
              max={30}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
              <span>1年</span><span>15年</span><span>30年</span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>スキル（複数選択可）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: skills.includes(s) ? '1.5px solid #6366f1' : '1px solid #ddd',
                    background: skills.includes(s) ? '#f5f3ff' : '#fff',
                    color: skills.includes(s) ? '#6366f1' : '#666',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>保有資格（任意）</label>
            <input
              type="text"
              value={certifications}
              onChange={(e) => setCertifications(e.target.value)}
              style={inputStyle}
              placeholder="例: AWS SAA, PMP, TOEIC 900"
            />
          </div>

          <div>
            <label style={labelStyle}>現在の年収（万円）</label>
            <input
              type="number"
              value={currentSalary}
              onChange={(e) => setCurrentSalary(Number(e.target.value))}
              style={inputStyle}
              placeholder="例: 450"
            />
          </div>

          <button
            type="button"
            onClick={handleCalc}
            style={{
              width: '100%',
              padding: '14px',
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: 8,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            診断する
          </button>
        </div>
      )}

      {result && (
        <div>
          {/* Score Card */}
          <div style={{
            background: 'linear-gradient(135deg, #faf5ff, #f0f0ff)',
            borderRadius: 12,
            padding: '28px 24px',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>あなたの市場価値</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '12px 0' }}>
              <span style={{
                fontSize: 56,
                fontWeight: 800,
                color: rankColors[result.rank],
                lineHeight: 1,
              }}>
                {result.rank}
              </span>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 14, color: '#888', margin: 0 }}>スコア</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: '#222', margin: 0 }}>{result.score}</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#666' }}>
              推定年収: <strong>{result.low}〜{result.high}万円</strong>
            </p>
          </div>

          {/* Strengths */}
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            padding: '20px',
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#16a34a', marginBottom: 10 }}>あなたの強み</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#555', lineHeight: 2 }}>
              {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          {/* Improvements */}
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            padding: '20px',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#eab308', marginBottom: 10 }}>改善ポイント</p>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#555', lineHeight: 2 }}>
              {result.improvements.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>

          {/* SNS Share */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                background: '#000',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Xでシェア
            </a>
            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px',
                background: '#06C755',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              LINEでシェア
            </a>
          </div>

          {/* Recommended Services */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#444', marginBottom: 16 }}>
              あなたにおすすめのサービス
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(result.rank === 'S' || result.rank === 'A' ? [
                { name: 'ビズリーチ', desc: 'ハイクラス転職。スカウトで年収アップ。', href: '#bizreach' },
                { name: 'アサイン', desc: '20-30代ハイエンド特化の転職エージェント。', href: '#assign' },
                { name: 'リクルートダイレクトスカウト', desc: 'ヘッドハンターからの直接スカウト。', href: '#recruit-ds' },
              ] : result.rank === 'B' ? [
                { name: 'リクルートエージェント', desc: '求人数No.1。幅広い選択肢から最適な転職先を。', href: '#recruit' },
                { name: 'doda', desc: '転職満足度No.1。手厚いサポート体制。', href: '#doda' },
                { name: 'ミイダス', desc: '市場価値診断で適正年収を把握。', href: '#miidas' },
              ] : [
                { name: 'ミイダス', desc: 'まずは市場価値を正確に把握しよう。', href: '#miidas' },
                { name: 'リクルートエージェント', desc: '未経験歓迎求人も豊富。キャリアチェンジに。', href: '#recruit' },
                { name: 'Udemy', desc: 'スキルアップで市場価値を高めよう。', href: '#udemy' },
              ]).map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    border: '1px solid #e0e0e0',
                    borderRadius: 10,
                    padding: '16px 20px',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#222', marginBottom: 4 }}>{s.name}</p>
                      <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{s.desc}</p>
                    </div>
                    <span style={{
                      padding: '8px 18px',
                      background: '#dc2626',
                      color: '#fff',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      詳しく見る
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setResult(null)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              color: '#666',
              cursor: 'pointer',
            }}
          >
            もう一度診断する
          </button>
        </div>
      )}
    </div>
  );
}
