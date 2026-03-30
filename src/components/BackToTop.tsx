import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        .back-to-top {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #dc2626;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          transition: opacity 0.3s, transform 0.3s;
          z-index: 50;
        }
        .back-to-top:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4);
        }
        .back-to-top.hidden {
          opacity: 0;
          transform: translateY(16px);
          pointer-events: none;
        }
        .back-to-top.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
      <button
        className={`back-to-top ${visible ? 'visible' : 'hidden'}`}
        onClick={scrollToTop}
        aria-label="ページの先頭に戻る"
        type="button"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 4L4 10H8V16H12V10H16L10 4Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </>
  );
}
