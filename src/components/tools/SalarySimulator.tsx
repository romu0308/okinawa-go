import { useState } from 'react';

const industries = ['IT', '金融', 'メーカー', 'コンサル', '商社', 'その他'] as const;
const jobTypes = ['エンジニア', '営業', 'マーケ', '人事', '経理', '企画', 'その他'] as const;
const skillOptions = ['マネジメント', '英語ビジネスレベル', 'プログラミング', '専門資格', 'MBA'] as const;

type Industry = typeof industries[number];
type JobType = typeof jobTypes[number];

const industryMultiplier: Record<Industry, number> = {
  IT: 1.15,
  金融: 1.20,
  メーカー: 1.00,
  コンサル: 1.25,
  商社: 1.18,
  その他: 1.00,
};

const jobMultiplier: Record<JobType, number> = {
  エンジニア: 1.12,
  営業: 1.05,
  マーケ: 1.08,
  人事: 0.98,
  経理: 0.95,
  企画: 1.05,
  その他: 1.00,
};

const skillBonus: Record<string, number> = {
  マネジメント: 0.08,
  英語ビジネスレベル: 0.06,
  プログラミング: 0.07,
  専門資格: 0.05,
  MBA: 0.10,
};

function calcSalary(
  current: number,
  industry: Industry,
  job: JobType,
  years: number,
  skills: string[]
) {
  const base = current;
  const indMul = industryMultiplier[industry];
  const jobMul = jobMultiplier[job];
  const yearMul = 1 + Math.min(years, 30) * 0.008;
  const skillMul = 1 + skills.reduce((sum, s) => sum + (skillBonus[s] || 0), 0);

  const estimated = Math.round(base * indMul * jobMul * yearMul * skillMul);
  const low = Math.round(estimated * 0.9);
  const high = Math.round(estimated * 1.15);
  const diff = estimated - current;

  return { estimated, low, high, diff };
}

function RadarDisplay({ skills, industry, job, years }: {
  skills: string[];
  industry: Industry;
  job: JobType;
  years: number;
}) {
  const categories = [
    { label: '業界力', value: Math.round(((industryMultiplier[industry] - 0.9) / 0.4) * 100) },
    { label: '職種力', value: Math.round(((jobMultiplier[job] - 0.9) / 0.3) * 100) },
    { label: '経験値', value: Math.min(100, Math.round((years / 20) * 100)) },
    { label: 'スキル', value: Math.min(100, skills.length * 25) },
    { label: '総合力', value: Math.min(100, Math.round(((industryMultiplier[industry] * jobMultiplier[job] * (1 + skills.length * 0.05)) - 0.8) / 0.8 * 100)) },
  ];

  return (
    <div style={{ margin: '24px 0' }}>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 12, fontWeight: 500 }}>スキルバランス</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map((c) => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: '#555', width: 56, textAlign: 'right', flexShrink: 0 }}>{c.label}</span>
            <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${Math.max(5, c.value)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: 4,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 12, color: '#888', width: 32 }}>{c.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalarySimulator() {
  const [currentSalary, setCurrentSalary] = useState<number>(450);
  const [industry, setIndustry] = useState<Industry>('IT');
  const [job, setJob] = useState<JobType>('エンジニア');
  const [years, setYears] = useState<number>(5);
  const [skills, setSkills] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof calcSalary> | null>(null);

  const toggleSkill = (s: string) => {
    setSkills((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleCalc = () => {
    setResult(calcSalary(currentSalary, industry, job, years, skills));
  };

  const shareText = result
    ? `年収シミュレーション結果：適正年収 ${result.low}〜${result.high}万円（現在比 ${result.diff >= 0 ? '+' : ''}${result.diff}万円）`
    : '';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://okinawa-go.jp/tools/salary';

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
      {/* Input Section */}
      {!result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

          <div>
            <label style={labelStyle}>業種</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              style={inputStyle}
            >
              {industries.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

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
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
              <span>1年</span><span>15年</span><span>30年</span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>保有スキル（複数選択可）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skillOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: skills.includes(s) ? '1.5px solid #3b82f6' : '1px solid #ddd',
                    background: skills.includes(s) ? '#eff6ff' : '#fff',
                    color: skills.includes(s) ? '#3b82f6' : '#666',
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

      {/* Result Section */}
      {result && (
        <div>
          <div style={{
            background: 'linear-gradient(135deg, #f8faff, #f0f4ff)',
            borderRadius: 12,
            padding: '28px 24px',
            marginBottom: 24,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>あなたの適正年収レンジ</p>
            <p style={{ fontSize: 36, fontWeight: 700, color: '#222', margin: '8px 0' }}>
              {result.low}〜{result.high}<span style={{ fontSize: 16, fontWeight: 400 }}>万円</span>
            </p>
            <p style={{
              fontSize: 14,
              color: result.diff >= 0 ? '#16a34a' : '#dc2626',
              fontWeight: 500,
            }}>
              現在の年収から {result.diff >= 0 ? '+' : ''}{result.diff}万円 {result.diff >= 0 ? 'アップの可能性' : ''}
            </p>
          </div>

          <RadarDisplay skills={skills} industry={industry} job={job} years={years} />

          {/* SNS Share */}
          <div style={{ display: 'flex', gap: 10, margin: '24px 0' }}>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
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
                gap: 6,
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

          {/* Affiliate CTAs */}
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#444', marginBottom: 16 }}>
              年収アップを実現するなら
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'ミイダス', desc: '市場価値を5分で無料診断。あなたの適正年収がわかる。', href: '#miidas' },
                { name: 'ビズリーチ', desc: 'ハイクラス転職。年収600万円以上の求人多数。', href: '#bizreach' },
                { name: 'アサイン', desc: '20-30代ハイエンド特化。AI×コンサルタントの転職支援。', href: '#assign' },
              ].map((s) => (
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
                      無料登録
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
              marginTop: 24,
            }}
          >
            もう一度診断する
          </button>
        </div>
      )}
    </div>
  );
}
