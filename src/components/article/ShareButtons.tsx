interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shares = [
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: '#000',
      color: '#fff',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'LINE',
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      bg: '#06C755',
      color: '#fff',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      ),
    },
    {
      label: 'はてブ',
      href: `https://b.hatena.ne.jp/entry/s/${url.replace(/^https?:\/\//, '')}`,
      bg: '#00A4DE',
      color: '#fff',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.47 0C22.42 0 24 1.58 24 3.53v16.94c0 1.95-1.58 3.53-3.53 3.53H3.53C1.58 24 0 22.42 0 20.47V3.53C0 1.58 1.58 0 3.53 0h16.94zM14.4 15.33c-.18-.42-.49-.78-.93-1.07.7-.38 1.07-.95 1.07-1.7 0-.58-.17-1.06-.52-1.42-.35-.37-.83-.59-1.42-.65-.6-.07-1.53-.1-2.82-.1H7v8.2h2.89c1.23 0 2.11-.04 2.66-.11.54-.08.99-.27 1.33-.58.35-.31.58-.73.68-1.25.04-.2.06-.4.06-.62 0-.58-.21-1.07-.63-1.48-.06-.06-.12-.12-.19-.17l.6-.05zM9.68 10.05h1.2c.6 0 1.02.04 1.25.12.37.12.56.42.56.88 0 .42-.16.72-.48.88-.21.1-.58.16-1.13.16h-1.4v-2.04zm2.59 5.15c-.23.12-.64.18-1.22.18H9.68v-2.31h1.4c.6 0 1.02.04 1.27.11.42.13.62.46.62.97 0 .48-.17.82-.5 1.05h-.2zM17 15.2a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM17 9.6h-3v1.4h3V9.6z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Desktop: inline */}
      <div className="hidden md:flex items-center gap-3 mt-10 mb-6">
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: '#bbb',
          }}
        >
          Share
        </span>
        {shares.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`${s.label}でシェア`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: s.bg,
              color: s.color,
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {s.icon}
          </a>
        ))}
      </div>

      {/* Mobile: fixed bottom */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #eee',
          zIndex: 50,
        }}
      >
        {shares.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              backgroundColor: s.bg,
              color: s.color,
              textDecoration: 'none',
              fontSize: '11px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            {s.icon}
            {s.label}
          </a>
        ))}
      </div>
    </>
  );
}
