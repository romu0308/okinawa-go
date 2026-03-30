interface AffiliateCTAProps {
  serviceName: string;
  url: string;
  description: string;
  variant?: 'A' | 'B';
}

function trackClick(serviceName: string, variant: string) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        event_category: 'CTA',
        event_label: serviceName,
        value: variant,
      });
    }
  } catch {
    // silently fail
  }
}

export default function AffiliateCTA({
  serviceName,
  url,
  description,
  variant = 'A',
}: AffiliateCTAProps) {
  const isVariantA = variant === 'A';

  return (
    <div
      className="my-10 rounded-lg overflow-hidden"
      style={{
        backgroundColor: isVariantA ? '#fff5f5' : '#f0f7ff',
        border: `2px solid ${isVariantA ? '#e74c3c' : '#3b82f6'}`,
      }}
    >
      <div className="p-6 md:p-8">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: isVariantA ? '#e74c3c' : '#3b82f6',
            marginBottom: '8px',
          }}
        >
          Recommended
        </p>
        <h3
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '20px',
            fontWeight: 500,
            color: '#000',
            marginBottom: '12px',
            lineHeight: 1.4,
          }}
        >
          {serviceName}
        </h3>
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '14px',
            lineHeight: 1.7,
            color: '#555',
            marginBottom: '20px',
          }}
        >
          {description}
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => trackClick(serviceName, variant)}
          style={{
            display: 'inline-block',
            padding: '14px 32px',
            backgroundColor: isVariantA ? '#e74c3c' : '#3b82f6',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 500,
            fontFamily: "'Noto Sans JP', sans-serif",
            textDecoration: 'none',
            transition: 'opacity 0.2s, transform 0.2s',
            boxShadow: isVariantA
              ? '0 4px 14px rgba(231,76,60,0.3)'
              : '0 4px 14px rgba(59,130,246,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          無料で登録する →
        </a>
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '11px',
            color: '#aaa',
            marginTop: '12px',
          }}
        >
          ※ 公式サイトに遷移します。登録は無料です。
        </p>
      </div>
    </div>
  );
}
