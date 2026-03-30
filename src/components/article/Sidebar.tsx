export default function Sidebar() {
  const popularArticles = [
    { title: '転職エージェントおすすめ比較ランキング【2026年版】', slug: 'tenshoku-agent-ranking' },
    { title: '年収を上げる転職戦略｜3つのステップで年収アップ', slug: 'salary-up-strategy' },
    { title: 'ブラック企業の見分け方｜入社前にチェックすべき7項目', slug: 'black-company-checklist' },
    { title: '未経験からエンジニア転職する最短ルート', slug: 'engineer-career-change' },
    { title: 'フリーランスになるための完全ガイド', slug: 'freelance-guide' },
  ];

  const categories = [
    { name: '転職戦略', slug: 'tenshoku' },
    { name: '年収アップ', slug: 'salary' },
    { name: 'キャリア設計', slug: 'career-design' },
    { name: 'スキルアップ', slug: 'skill-up' },
    { name: 'フリーランス', slug: 'freelance' },
    { name: '副業', slug: 'side-job' },
    { name: '働き方改革', slug: 'work-style' },
  ];

  return (
    <aside className="hidden lg:block w-[280px] flex-shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Popular Articles */}
        <section>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#bbb',
              marginBottom: '6px',
            }}
          >
            Popular
          </p>
          <h3
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '15px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '12px',
            }}
          >
            人気記事TOP5
          </h3>
          <ol className="space-y-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {popularArticles.map((article, i) => (
              <li key={article.slug}>
                <a
                  href={`/career/${article.slug}/`}
                  className="group flex items-start gap-3 hover:opacity-70 transition-opacity duration-200"
                  style={{ textDecoration: 'none' }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      color: i < 3 ? '#e74c3c' : '#ccc',
                      flexShrink: 0,
                      marginTop: '2px',
                      width: '18px',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Noto Sans JP', sans-serif",
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: '#333',
                    }}
                  >
                    {article.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* Categories */}
        <section style={{ borderTop: '0.5px solid #eee', paddingTop: '24px' }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#bbb',
              marginBottom: '6px',
            }}
          >
            Category
          </p>
          <h3
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '15px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '12px',
            }}
          >
            カテゴリ一覧
          </h3>
          <ul className="space-y-2" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {categories.map((cat) => (
              <li key={cat.slug}>
                <a
                  href={`/career/?category=${cat.slug}`}
                  className="flex items-center justify-between py-2 px-3 rounded hover:bg-[#fafafa] transition-colors duration-200"
                  style={{
                    textDecoration: 'none',
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontSize: '13px',
                    color: '#555',
                  }}
                >
                  {cat.name}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 3L7.5 6L4.5 9" stroke="#ccc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* LINE CTA */}
        <section
          className="rounded-lg p-5"
          style={{
            background: 'linear-gradient(135deg, #06C755 0%, #04a648 100%)',
          }}
        >
          <p
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '15px',
              fontWeight: 500,
              color: '#fff',
              marginBottom: '8px',
              lineHeight: 1.4,
            }}
          >
            LINE登録で限定コンテンツ配信中
          </p>
          <p
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '12px',
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.6,
              marginBottom: '16px',
            }}
          >
            転職成功テンプレートを無料プレゼント
          </p>
          <a
            href="https://lin.ee/example"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#06C755',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: "'Noto Sans JP', sans-serif",
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            友だち追加する
          </a>
        </section>
      </div>
    </aside>
  );
}
