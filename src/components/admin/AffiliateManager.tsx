import { useState, useEffect } from 'react';

interface Affiliate {
  id: string;
  serviceName: string;
  url: string;
  reward: number;
  clicks: number;
  conversions: number;
  clickLog: { timestamp: string; referrer: string; userAgent: string }[];
}

const emptyAffiliate: Affiliate = {
  id: '',
  serviceName: '',
  url: '',
  reward: 0,
  clicks: 0,
  conversions: 0,
  clickLog: [],
};

export default function AffiliateManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Affiliate>(emptyAffiliate);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchAffiliates = async () => {
    try {
      const res = await fetch('/api/admin/affiliates');
      const data = await res.json();
      setAffiliates(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch affiliates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAffiliates(); }, []);

  const openNew = () => {
    setEditing({ ...emptyAffiliate, id: 'aff-' + Date.now() });
    setModalOpen(true);
  };

  const openEdit = (affiliate: Affiliate) => {
    setEditing({ ...affiliate });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing.serviceName) { alert('サービス名を入力してください'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (data.success) { setModalOpen(false); await fetchAffiliates(); }
      else { alert('保存に失敗しました'); }
    } catch {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/affiliates?id=' + id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setDeleteConfirm(null); await fetchAffiliates(); }
    } catch {
      alert('削除に失敗しました');
    }
  };

  const getCVR = (clicks: number, conversions: number) => {
    if (clicks === 0) return '0.0';
    return ((conversions / clicks) * 100).toFixed(1);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-gray-500">読み込み中...</p></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-lg font-bold text-gray-900">アフィリエイト管理</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">+ 新規追加</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">サービス数</p>
          <p className="text-xl font-bold text-gray-900">{affiliates.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">総クリック数</p>
          <p className="text-xl font-bold text-gray-900">{affiliates.reduce((s, a) => s + a.clicks, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">総成約数</p>
          <p className="text-xl font-bold text-gray-900">{affiliates.reduce((s, a) => s + a.conversions, 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">推定総報酬額</p>
          <p className="text-xl font-bold text-gray-900">{affiliates.reduce((s, a) => s + a.reward * a.conversions, 0).toLocaleString()}円</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-600">サービス名</th>
              <th className="text-left p-3 font-medium text-gray-600 hidden md:table-cell">URL</th>
              <th className="text-right p-3 font-medium text-gray-600">報酬額</th>
              <th className="text-right p-3 font-medium text-gray-600">クリック数</th>
              <th className="text-right p-3 font-medium text-gray-600 hidden sm:table-cell">成約数</th>
              <th className="text-right p-3 font-medium text-gray-600 hidden sm:table-cell">CVR</th>
              <th className="text-left p-3 font-medium text-gray-600 w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">アフィリエイトがまだ登録されていません</td></tr>
            ) : affiliates.map((aff) => (
              <tr key={aff.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{aff.serviceName}</td>
                <td className="p-3 text-gray-500 hidden md:table-cell">
                  <a href={aff.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">{aff.url}</a>
                </td>
                <td className="p-3 text-right text-gray-700">{aff.reward.toLocaleString()}円</td>
                <td className="p-3 text-right text-gray-700">{aff.clicks.toLocaleString()}</td>
                <td className="p-3 text-right text-gray-700 hidden sm:table-cell">{aff.conversions.toLocaleString()}</td>
                <td className="p-3 text-right text-gray-700 hidden sm:table-cell">{getCVR(aff.clicks, aff.conversions)}%</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(aff)} className="text-blue-600 hover:text-blue-800 text-xs">編集</button>
                    {deleteConfirm === aff.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(aff.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">確定</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 text-xs">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(aff.id)} className="text-red-500 hover:text-red-700 text-xs">削除</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">{affiliates.some((a) => a.id === editing.id) ? 'アフィリエイト編集' : '新規アフィリエイト'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">サービス名 *</label>
                <input type="text" value={editing.serviceName} onChange={(e) => setEditing((prev) => ({ ...prev, serviceName: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">URL</label>
                <input type="text" value={editing.url} onChange={(e) => setEditing((prev) => ({ ...prev, url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">報酬額（円）</label>
                <input type="number" value={editing.reward} onChange={(e) => setEditing((prev) => ({ ...prev, reward: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">クリック数</label>
                  <input type="number" value={editing.clicks} onChange={(e) => setEditing((prev) => ({ ...prev, clicks: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">成約数</label>
                  <input type="number" value={editing.conversions} onChange={(e) => setEditing((prev) => ({ ...prev, conversions: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
