import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'お問い合わせ', body: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const subjects = ['お問い合わせ', '取材依頼', '広告掲載', 'その他'];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '名前を入力してください';
    if (!form.email.trim()) e.email = 'メールアドレスを入力してください';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = '正しいメールアドレスを入力してください';
    if (!form.body.trim()) e.body = '本文を入力してください';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-xl font-medium mb-2">送信完了</h2>
        <p className="text-gray-500">お問い合わせありがとうございます。3営業日以内にご返信いたします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">名前 <span className="text-red-500">*</span></label>
        <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">メールアドレス <span className="text-red-500">*</span></label>
        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">件名</label>
        <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400">
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">本文 <span className="text-red-500">*</span></label>
        <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={6}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
        {errors.body && <p className="text-red-500 text-xs mt-1">{errors.body}</p>}
      </div>
      <button type="submit" className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
        送信する
      </button>
    </form>
  );
}
