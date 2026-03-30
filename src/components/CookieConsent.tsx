import { useState, useEffect } from 'react';

const STORAGE_KEY = 'cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(8px)',
        color: '#fff',
        padding: '16px 20px',
        zIndex: 9998,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <p
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#ddd',
          margin: 0,
          flex: '1 1 300px',
        }}
      >
        このサイトはCookieを使用しています。サイトの利用を続けることで、Cookieの使用に同意したものとみなされます。
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={handleAccept}
          style={{
            padding: '8px 20px',
            backgroundColor: '#fff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: "'Noto Sans JP', sans-serif",
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          同意する
        </button>
        <button
          onClick={handleDecline}
          style={{
            padding: '8px 20px',
            backgroundColor: 'transparent',
            color: '#aaa',
            border: '1px solid #555',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: "'Noto Sans JP', sans-serif",
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          拒否
        </button>
      </div>
    </div>
  );
}
