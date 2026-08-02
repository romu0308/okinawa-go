import { useState, useEffect } from 'react';

interface ThreadsPost {
  id: string;
  text: string;
  image_url: string | null;
  source_slug: string | null;
  source: 'manual' | 'auto';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  threads_post_id: string | null;
  permalink: string | null;
  error: string | null;
  created_at: string;
}

interface Settings {
  autopilot: boolean;
  post_times: string[];
  hashtags: string;
}

interface Connection {
  configured: boolean;
  username?: string;
  error?: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: '下書き', cls: 'bg-gray-100 text-gray-600' },
  scheduled: { label: '予約済み', cls: 'bg-blue-50 text-blue-700' },
  published: { label: '投稿済み', cls: 'bg-green-50 text-green-700' },
  failed: { label: '失敗', cls: 'bg-red-50 text-red-700' },
};

function fmtDate(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ThreadsManager() {
  const [posts, setPosts] = useState<ThreadsPost[]>([]);
  const [settings, setSettings] = useState<Settings>({ autopilot: false, post_times: ['09:00', '19:00'], hashtags: '' });
  const [connection, setConnection] = useState<Connection>({ configured: false });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/threads');
      const data = await res.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
      if (data.settings) setSettings(data.settings);
      if (data.connection) setConnection(data.connection);
    } catch {
      console.error('Failed to fetch threads data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const flash = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const openNew = () => {
    setEditId(null);
    setEditText('');
    setEditImage('');
    setEditSchedule('');
    setModalOpen(true);
  };

  const openEdit = (post: ThreadsPost) => {
    setEditId(post.id);
    setEditText(post.text);
    setEditImage(post.image_url || '');
    setEditSchedule(post.scheduled_at ? toLocalInput(post.scheduled_at) : '');
    setModalOpen(true);
  };

  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleSave = async () => {
    if (!editText.trim()) { flash('err', '投稿文を入力してください'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          id: editId,
          text: editText,
          image_url: editImage || null,
          scheduled_at: editSchedule ? new Date(editSchedule).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        flash('ok', editSchedule ? '投稿を予約しました' : '下書きを保存しました');
        fetchData();
      } else flash('err', data.error || '保存に失敗しました');
    } catch {
      flash('err', '保存に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      });
      const data = await res.json();
      if (data.success) {
        flash('ok', '記事から下書きを生成しました');
        fetchData();
      } else flash('err', data.error || '生成に失敗しました');
    } catch {
      flash('err', '生成に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishNow = async (id: string) => {
    if (!confirm('今すぐThreadsに投稿しますか？')) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_now', id }),
      });
      const data = await res.json();
      if (data.success) flash('ok', 'Threadsに投稿しました');
      else flash('err', data.error || '投稿に失敗しました');
      fetchData();
    } catch {
      flash('err', '投稿に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('この投稿を削除しますか？')) return;
    try {
      await fetch('/api/admin/threads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    } catch {
      flash('err', '削除に失敗しました');
    }
  };

  const handleSaveSettings = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', ...settings }),
      });
      const data = await res.json();
      if (data.success) flash('ok', '設定を保存しました');
      else flash('err', data.error || '設定の保存に失敗しました');
    } catch {
      flash('err', '設定の保存に失敗しました');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-400 p-10 text-center">読み込み中...</p>;

  const scheduled = posts.filter((p) => p.status === 'scheduled');
  const published = posts.filter((p) => p.status === 'published');

  return (
    <div>
      {message && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm ${message.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Connection status */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Threads API 接続状態</p>
            {connection.configured ? (
              connection.username ? (
                <p className="text-sm font-medium text-green-700">✅ 接続中：@{connection.username}</p>
              ) : (
                <p className="text-sm font-medium text-red-600">⚠️ 認証エラー：{connection.error || 'トークンを確認してください'}</p>
              )
            ) : (
              <p className="text-sm font-medium text-gray-500">
                未設定 — 環境変数 <code className="bg-gray-100 px-1 rounded">THREADS_ACCESS_TOKEN</code> と <code className="bg-gray-100 px-1 rounded">THREADS_USER_ID</code> を設定してください
              </p>
            )}
          </div>
          <div className="flex gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{scheduled.length}</p>
              <p className="text-xs text-gray-500">予約中</p>
            </div>
            <div>
              <p className="text-lg font-bold">{published.length}</p>
              <p className="text-xs text-gray-500">投稿済み</p>
            </div>
          </div>
        </div>
      </div>

      {/* Autopilot settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-bold mb-3">🤖 自動投稿設定（オートパイロット）</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autopilot}
              onChange={(e) => setSettings({ ...settings, autopilot: e.target.checked })}
            />
            記事から自動で投稿を生成してスケジュールする
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 w-24">投稿時刻（JST）</span>
            <input
              type="text"
              value={settings.post_times.join(', ')}
              onChange={(e) => setSettings({ ...settings, post_times: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="09:00, 19:00"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-48"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 w-24">ハッシュタグ</span>
            <input
              type="text"
              value={settings.hashtags}
              onChange={(e) => setSettings({ ...settings, hashtags: e.target.value })}
              placeholder="#沖縄 #沖縄旅行"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 min-w-48"
            />
          </div>
          <div>
            <button
              onClick={handleSaveSettings}
              disabled={busy}
              className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-700 disabled:opacity-50"
            >
              設定を保存
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-4">
        <button onClick={openNew} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          ＋ 新規投稿
        </button>
        <button onClick={handleGenerate} disabled={busy} className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm hover:bg-gray-50 disabled:opacity-50">
          ✨ 記事から生成
        </button>
      </div>

      {/* Post list */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-400">投稿はまだありません</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded ${STATUS_LABEL[post.status]?.cls || ''}`}>
                      {STATUS_LABEL[post.status]?.label || post.status}
                    </span>
                    <span className="text-xs text-gray-400">{post.source === 'auto' ? '自動生成' : '手動'}</span>
                    {post.status === 'scheduled' && <span className="text-xs text-gray-500">⏰ {fmtDate(post.scheduled_at)}</span>}
                    {post.status === 'published' && <span className="text-xs text-gray-500">✅ {fmtDate(post.published_at)}</span>}
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words text-gray-800">{post.text}</p>
                  {post.error && <p className="text-xs text-red-600 mt-2">エラー: {post.error}</p>}
                  {post.permalink && (
                    <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                      Threadsで見る →
                    </a>
                  )}
                </div>
                {post.image_url && (
                  <img src={post.image_url} alt="" className="w-16 h-16 object-cover rounded flex-shrink-0" />
                )}
              </div>
              <div className="flex gap-2 mt-3">
                {post.status !== 'published' && (
                  <>
                    <button onClick={() => handlePublishNow(post.id)} disabled={busy} className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50">
                      今すぐ投稿
                    </button>
                    <button onClick={() => openEdit(post)} className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">
                      編集
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(post.id)} className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50">
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-lg w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-4">{editId ? '投稿を編集' : '新規投稿'}</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={7}
              placeholder="Threadsに投稿する内容（500文字以内）"
              className="w-full border border-gray-300 rounded-md p-3 text-sm mb-1"
            />
            <p className={`text-xs text-right mb-3 ${editText.length > 500 ? 'text-red-600' : 'text-gray-400'}`}>
              {editText.length}/500
            </p>
            <input
              type="text"
              value={editImage}
              onChange={(e) => setEditImage(e.target.value)}
              placeholder="画像URL（任意）"
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm mb-3"
            />
            <label className="block text-xs text-gray-500 mb-1">予約日時（空欄なら下書き保存）</label>
            <input
              type="datetime-local"
              value={editSchedule}
              onChange={(e) => setEditSchedule(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                キャンセル
              </button>
              <button onClick={handleSave} disabled={busy} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
                {editSchedule ? '予約する' : '保存する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
