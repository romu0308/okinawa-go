import { useState } from 'react';

const questions = [
  '残業が月80時間を超えることがある',
  '有給休暇を自由に取れない',
  'パワハラ・モラハラが日常的にある',
  '給与が労働時間に見合っていない',
  '退職を申し出ても引き止められる',
  '休日出勤が月2回以上ある',
  '上司の機嫌で評価が変わる',
  '会社の将来性に不安がある',
  '同僚が次々と辞めていく',
  '心身の不調を感じている',
] as const;

type Answer = 10 | 5 | 0;

interface Level {
  label: string;
  color: string;
  emoji: string;
  advice: string;
}

function getLevel(score: number): Level {
  if (score <= 20) {
    return {
      label: '安全',
      color: '#16a34a',
      emoji: '',
      advice: 'あなたの職場環境は良好です。現在の環境を活かしてスキルアップに集中しましょう。ただし、キャリアの停滞を感じたら転職も視野に入れて。',
    };
  }
  if (score <= 50) {
    return {
      label: '注意',
      color: '#eab308',
      emoji: '',
      advice: 'いくつか気になる点があります。今すぐ転職する必要はありませんが、転職市場の情報収集を始めることをお勧めします。自分の市場価値を把握しておくことで、いつでも動ける状態を作りましょう。',
    };
  }
  if (score <= 75) {
    return {
      label: '危険',
      color: '#f97316',
      emoji: '',
      advice: '職場環境にかなりの問題があります。心身への影響が出る前に、具体的な転職活動を始めることを強くお勧めします。まずは転職エージェントに相談して、選択肢を広げましょう。',
    };
  }
  return {
    label: '即脱出',
    color: '#dc2626',
    emoji: '',
    advice: '深刻な状況です。あなたの心身の健康が最優先です。退職代行サービスの利用も含め、一刻も早く環境を変えることを検討してください。一人で抱え込まず、専門家に相談しましょう。',
  };
}

export default function BlackCheck() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (pts: Answer) => {
    const newAnswers = [...answers, pts];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setFinished(true);
    }
  };

  const score = answers.reduce((s, a) => s + a, 0);
  const level = getLevel(score);
  const progress = ((currentQ + (finished ? 1 : 0)) / questions.length) * 100;

  const shareText = finished
    ? `ブラック度チェック結果：${score}点 / 100点【${level.label}】あなたの職場は大丈夫？`
    : '';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://okinawa-go.jp/tools/escape';

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setFinished(false);
  };

  const btnBase: React.CSSProperties = {
    flex: 1,
    padding: '12px 8px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  };

  return (
    <div style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: '#aaa' }}>
          <span>Q{Math.min(currentQ + 1, questions.length)} / {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      {/* Question */}
      {!finished && (
        <div>
          <p style={{
            fontSize: 17,
            fontWeight: 500,
            color: '#222',
            lineHeight: 1.6,
            marginBottom: 24,
            minHeight: 60,
          }}>
            {questions[currentQ]}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleAnswer(10)}
              style={{ ...btnBase, background: '#fef2f2', color: '#dc2626' }}
            >
              はい
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(5)}
              style={{ ...btnBase, background: '#fefce8', color: '#a16207' }}
            >
              どちらとも
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(0)}
              style={{ ...btnBase, background: '#f0fdf4', color: '#16a34a' }}
            >
              いいえ
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {finished && (
        <div>
          <div style={{
            background: '#fafafa',
            borderRadius: 12,
            padding: '28px 24px',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>あなたの職場のブラック度</p>
            <p style={{ fontSize: 48, fontWeight: 700, color: level.color, margin: '8px 0' }}>
              {score}<span style={{ fontSize: 18, fontWeight: 400 }}> / 100</span>
            </p>
            <span style={{
              display: 'inline-block',
              padding: '4px 16px',
              borderRadius: 20,
              background: level.color,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
            }}>
              {level.label}
            </span>
          </div>

          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: 10,
            padding: '20px',
            marginBottom: 24,
          }}>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#444', marginBottom: 8 }}>アドバイス</p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#666', margin: 0 }}>{level.advice}</p>
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

          {/* Affiliate CTAs */}
          {score > 50 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#444', marginBottom: 16 }}>
                今すぐ使えるサービス
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: '退職代行EXIT', desc: '業界実績No.1。即日退職可能。上司への連絡不要。', href: '#exit' },
                  { name: '退職代行Jobs', desc: '弁護士監修で安心。24時間対応。', href: '#jobs' },
                  { name: 'リクルートエージェント', desc: '求人数No.1。非公開求人20万件以上。', href: '#recruit' },
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
                        詳細を見る
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={reset}
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
