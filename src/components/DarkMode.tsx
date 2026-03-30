import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'theme-preference';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function DarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setIsDark(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (dark: boolean) => {
    document.documentElement.classList.toggle('dark', dark);
  };

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  };

  return (
    <>
      <style>{`
        .dark-mode-toggle {
          position: relative;
          width: 52px;
          height: 28px;
          background: #e7e5e4;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: background 0.3s;
        }
        .dark-mode-toggle.active {
          background: #1e1b4b;
        }
        .dark-mode-toggle .knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          transition: transform 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .dark-mode-toggle.active .knob {
          transform: translateX(24px);
        }
      `}</style>
      <button
        className={`dark-mode-toggle ${isDark ? 'active' : ''}`}
        onClick={toggle}
        aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        type="button"
      >
        <span className="knob">{isDark ? '\u{1F319}' : '\u{2600}\u{FE0F}'}</span>
      </button>
    </>
  );
}
