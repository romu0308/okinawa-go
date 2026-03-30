import { useState, useEffect, useRef } from 'react';

interface Category {
  id: string;
  name: string;
  order: number;
}

interface Settings {
  siteName: string;
  siteDescription: string;
  lineUrl: string;
  ga4Id: string;
  ogpDefaultImage: string;
  categories: Category[];
  defaultCtaTemplate: string;
}

const defaultSettings: Settings = {
  siteName: '',
  siteDescription: '',
  lineUrl: '',
  ga4Id: '',
  ogpDefaultImage: '',
  categories: [],
  defaultCtaTemplate: '',
};

export default function SettingsManager() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data });
      } catch {
        console.error('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
      else { alert('保存に失敗しました'); }
    } catch {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = newCatName.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'cat-' + Date.now();
    const maxOrder = Math.max(0, ...settings.categories.map((c) => c.order));
    setSettings((prev) => ({
      ...prev,
      categories: [...prev.categories, { id, name: newCatName.trim(), order: maxOrder + 1 }],
    }));
    setNewCatName('');
  };

  const removeCategory = (id: string) => {
    setSettings((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  };

  const startEditCategory = (cat: Category) => {
    setEditingCat(cat.id);
    setEditingCatName(cat.name);
  };

  const saveEditCategory = () => {
    if (!editingCatName.trim() || !editingCat) return;
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => c.id === editingCat ? { ...c, name: editingCatName.trim() } : c),
    }));
    setEditingCat(null);
    setEditingCatName('');
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const cats = [...settings.categories];
    const draggedItem = cats[dragItem.current];
    cats.splice(dragItem.current, 1);
    cats.splice(dragOverItem.current, 0, draggedItem);
    const reordered = cats.map((c, i) => ({ ...c, order: i + 1 }));
    setSettings((prev) => ({ ...prev, categories: reordered }));
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-gray-500">読み込み中...</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-gray-900">設定</h1>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">保存しました</span>}
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Site settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">サイト基本設定</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">サイト名</label>
              <input type="text" value={settings.siteName} onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">サイト説明</label>
              <textarea value={settings.siteDescription} onChange={(e) => setSettings((prev) => ({ ...prev, siteDescription: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none h-20" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">LINE URL</label>
              <input type="text" value={settings.lineUrl} onChange={(e) => setSettings((prev) => ({ ...prev, lineUrl: e.target.value }))} placeholder="https://line.me/R/ti/p/..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">GA4 測定ID</label>
              <input type="text" value={settings.ga4Id} onChange={(e) => setSettings((prev) => ({ ...prev, ga4Id: e.target.value }))} placeholder="G-XXXXXXXXXX" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">OGPデフォルト画像</label>
              <input type="text" value={settings.ogpDefaultImage} onChange={(e) => setSettings((prev) => ({ ...prev, ogpDefaultImage: e.target.value }))} placeholder="/images/ogp-default.jpg" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Category management */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">カテゴリ管理</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" placeholder="新しいカテゴリ名" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
            <button onClick={addCategory} className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">追加</button>
          </div>
          <p className="text-xs text-gray-400 mb-3">ドラッグで並び替え可能</p>
          <div className="space-y-1">
            {settings.categories.sort((a, b) => a.order - b.order).map((cat, index) => (
              <div
                key={cat.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-400 text-xs select-none">||</span>
                {editingCat === cat.id ? (
                  <div className="flex-1 flex gap-2">
                    <input type="text" value={editingCatName} onChange={(e) => setEditingCatName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEditCategory(); if (e.key === 'Escape') setEditingCat(null); }} autoFocus className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded outline-none focus:border-blue-500" />
                    <button onClick={saveEditCategory} className="text-xs text-blue-600 hover:text-blue-800">保存</button>
                    <button onClick={() => setEditingCat(null)} className="text-xs text-gray-400 hover:text-gray-600">取消</button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700">{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat.id}</span>
                    <button onClick={() => startEditCategory(cat)} className="text-xs text-blue-600 hover:text-blue-800">編集</button>
                    <button onClick={() => removeCategory(cat.id)} className="text-xs text-red-500 hover:text-red-700">削除</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Template */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h2 className="text-sm font-medium text-gray-700 mb-4">デフォルトCTAテンプレート</h2>
          <textarea
            value={settings.defaultCtaTemplate}
            onChange={(e) => setSettings((prev) => ({ ...prev, defaultCtaTemplate: e.target.value }))}
            placeholder="記事に挿入するCTAのテンプレートを入力..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-y h-32 font-mono"
          />
          <p className="text-xs text-gray-400 mt-2">記事エディタの「CTA」ボタンで挿入されるテンプレートです</p>
        </div>
      </div>
    </div>
  );
}
