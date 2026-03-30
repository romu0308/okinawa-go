interface Article {
  slug: string;
  title: string;
  thumbnail?: string;
  publishedAt: string;
  category?: string;
}

interface RelatedArticlesProps {
  articles: Article[];
  currentSlug: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function RelatedArticles({ articles, currentSlug }: RelatedArticlesProps) {
  const filtered = articles.filter((a) => a.slug !== currentSlug).slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-16 pt-12" style={{ borderTop: '0.5px solid #eee' }}>
      <p
        className="mb-3"
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase' as const,
          color: '#bbb',
        }}
      >
        Related
      </p>
      <h2
        className="mb-8"
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: '22px',
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          color: '#000',
        }}
      >
        関連記事
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((article) => (
          <a
            key={article.slug}
            href={`/career/${article.slug}/`}
            className="group block"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="relative w-full overflow-hidden rounded mb-3"
              style={{ aspectRatio: '16/10' }}
            >
              {article.thumbnail ? (
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#ddd] to-[#eee]" />
              )}
            </div>
            <p
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '15px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: '#000',
                transition: 'opacity 0.3s',
              }}
              className="group-hover:opacity-60"
            >
              {article.title}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                color: '#aaa',
                marginTop: '4px',
              }}
            >
              {formatDate(article.publishedAt)}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
