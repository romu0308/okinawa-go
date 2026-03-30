import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
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
    <>
      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e7e5e4;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          z-index: 100;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
          animation: cookie-slide-up 0.4s ease-out;
        }
        @keyframes cookie-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .cookie-banner p {
          font-size: 13px;
          color: #44403c;
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .cookie-banner a {
          color: #dc2626;
          text-decoration: underline;
        }
        .cookie-buttons {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .cookie-btn {
          padding: 8px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }
        .cookie-btn-accept {
          background: #dc2626;
          color: white;
        }
        .cookie-btn-accept:hover {
          background: #b91c1c;
        }
        .cookie-btn-decline {
          background: #f5f5f4;
          color: #78716c;
          border: 1px solid #d6d3d1;
        }
        .cookie-btn-decline:hover {
          background: #e7e5e4;
        }
        @media (max-width: 640px) {
          .cookie-banner {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }
        }
      `}</style>
      <div className="cookie-banner" role="banner" aria-label="Cookie同意バナー">
        <p>
          このサイトではCookieを使用して、ユーザー体験の向上やアクセス解析を行っています。
          詳しくは<a href="/privacy">プライバシーポリシー</a>をご覧ください。
        </p>
        <div className="cookie-buttons">
          <button
            className="cookie-btn cookie-btn-decline"
            onClick={handleDecline}
            type="button"
          >
            拒否する
          </button>
          <button
            className="cookie-btn cookie-btn-accept"
            onClick={handleAccept}
            type="button"
          >
            同意する
          </button>
        </div>
      </div>
    </>
  );
}
