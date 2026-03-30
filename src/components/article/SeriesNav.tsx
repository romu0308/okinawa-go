interface SeriesArticle {
  slug: string;
  title: string;
}

interface SeriesNavProps {
  series: {
    name: string;
    articles: SeriesArticle[];
  };
  currentSlug: string;
}

export default function SeriesNav({ series, currentSlug }: SeriesNavProps) {
  if (!series || !series.articles || series.articles.length === 0) return null;

  return (
    <aside
      className="my-10 rounded-lg"
      style={{
        border: '1px solid #eee',
        backgroundColor: '#fafafa',
      }}
    >
      <div className="p-5 md:p-6">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#bbb',
            marginBottom: '6px',
          }}
        >
          Series
        </p>
        <h3
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            color: '#000',
            marginBottom: '16px',
            lineHeight: 1.4,
          }}
        >
          このシリーズの記事一覧：{series.name}
        </h3>
        <ol className="space-y-2" style={{ paddingLeft: '0', listStyle: 'none', margin: 0 }}>
          {series.articles.map((article, i) => {
            const isCurrent = article.slug === currentSlug;
            return (
              <li key={article.slug}>
                {isCurrent ? (
                  <div
                    className="flex items-start gap-3 p-3 rounded"
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e74c3c',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#e74c3c',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#e74c3c',
                        lineHeight: 1.5,
                      }}
                    >
                      {article.title}（この記事）
                    </span>
                  </div>
                ) : (
                  <a
                    href={`/career/${article.slug}/`}
                    className="flex items-start gap-3 p-3 rounded hover:bg-white transition-colors duration-200"
                    style={{ textDecoration: 'none' }}
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#aaa',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontSize: '13px',
                        color: '#555',
                        lineHeight: 1.5,
                      }}
                    >
                      {article.title}
                    </span>
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
