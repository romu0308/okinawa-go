export default function AuthorProfile() {
  return (
    <aside
      className="mt-12 p-6 rounded-lg"
      style={{ backgroundColor: '#fafafa', border: '1px solid #eee' }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div
          className="flex-shrink-0 rounded-full overflow-hidden"
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#e74c3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            K
          </span>
        </div>
        <div className="flex-1">
          <p
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '16px',
              fontWeight: 500,
              color: '#000',
              marginBottom: '6px',
            }}
          >
            キャリア孔明
          </p>
          <p
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontSize: '13px',
              lineHeight: 1.7,
              color: '#666',
              marginBottom: '12px',
            }}
          >
            元ブラック企業社畜。3度の戦略的転職で年収を2倍にした経験をもとに、キャリア戦略を発信中。沖縄在住フリーランス。
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/KOUMEI_GO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                color: '#999',
                textDecoration: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @KOUMEI_GO
            </a>
            <a
              href="https://lin.ee/example"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:opacity-60 transition-opacity duration-200"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                color: '#06C755',
                textDecoration: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.271.173-.508.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINE
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
