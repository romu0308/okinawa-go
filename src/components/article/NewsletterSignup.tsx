import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.message || '登録に失敗しました。もう一度お試しください。');
        setStatus('error');
      }
    } catch {
      setErrorMsg('ネットワークエラーが発生しました。');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className="my-12 p-6 md:p-8 rounded-lg text-center"
        style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
      >
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            color: '#166534',
            marginBottom: '4px',
          }}
        >
          登録ありがとうございます！
        </p>
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '13px',
            color: '#15803d',
          }}
        >
          メールをご確認ください。
        </p>
      </div>
    );
  }

  return (
    <aside
      className="my-12 p-6 md:p-8 rounded-lg"
      style={{ backgroundColor: '#fafafa', border: '1px solid #eee' }}
    >
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#bbb',
          marginBottom: '8px',
        }}
      >
        Newsletter
      </p>
      <h3
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: '18px',
          fontWeight: 500,
          color: '#000',
          marginBottom: '8px',
          lineHeight: 1.4,
        }}
      >
        メルマガ登録（LINE以外の方へ）
      </h3>
      <p
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: '13px',
          color: '#666',
          lineHeight: 1.7,
          marginBottom: '16px',
        }}
      >
        キャリア戦略や転職のヒントを定期的にお届けします。
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレスを入力"
          required
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: "'Noto Sans JP', sans-serif",
            outline: 'none',
            backgroundColor: '#fff',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#e74c3c')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#ddd')}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: "'Noto Sans JP', sans-serif",
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            opacity: status === 'loading' ? 0.7 : 1,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'loading' ? '送信中...' : '登録する'}
        </button>
      </form>
      {status === 'error' && (
        <p
          style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontSize: '12px',
            color: '#e74c3c',
            marginTop: '8px',
          }}
        >
          {errorMsg}
        </p>
      )}
    </aside>
  );
}
