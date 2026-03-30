interface NavArticle {
  slug: string;
  title: string;
}

interface ArticleNavigationProps {
  prevArticle?: NavArticle | null;
  nextArticle?: NavArticle | null;
}

export default function ArticleNavigation({ prevArticle, nextArticle }: ArticleNavigationProps) {
  if (!prevArticle && !nextArticle) return null;

  return (
    <nav
      className="mt-12 pt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
      style={{ borderTop: '0.5px solid #eee' }}
    >
      {prevArticle ? (
        <a
          href={`/career/${prevArticle.slug}/`}
          className="group flex items-center gap-3 p-4 rounded hover:bg-[#fafafa] transition-colors duration-200"
          style={{ textDecoration: 'none' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M12 15L7 10L12 5"
              stroke="#999"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: '#aaa',
                marginBottom: '4px',
              }}
            >
              Prev
            </p>
            <p
              className="group-hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: '#333',
              }}
            >
              {prevArticle.title}
            </p>
          </div>
        </a>
      ) : (
        <div />
      )}

      {nextArticle ? (
        <a
          href={`/career/${nextArticle.slug}/`}
          className="group flex items-center justify-end gap-3 p-4 rounded hover:bg-[#fafafa] transition-colors duration-200 text-right"
          style={{ textDecoration: 'none' }}
        >
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '9px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: '#aaa',
                marginBottom: '4px',
              }}
            >
              Next
            </p>
            <p
              className="group-hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Noto Sans JP', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.5,
                color: '#333',
              }}
            >
              {nextArticle.title}
            </p>
          </div>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M8 5L13 10L8 15"
              stroke="#999"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      ) : (
        <div />
      )}
    </nav>
  );
}
