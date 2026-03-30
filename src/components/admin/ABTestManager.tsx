import { useState, useEffect } from 'react';

interface Variant {
  id: string;
  label: string;
  value: string;
}

interface ABTest {
  id: string;
  name: string;
  active: boolean;
  variants: Variant[];
}

interface ABTestData {
  tests: ABTest[];
}

export default function ABTestManager() {
  const [data, setData] = useState<ABTestData>({ tests: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newTestOpen, setNewTestOpen] = useState(false);
  const [newTest, setNewTest] = useState<ABTest>({
    id: '',
    name: '',
    active: false,
    variants: [
      { id: 'A', label: '', value: '' },
      { id: 'B', label: '', value: '' },
    ],
  });

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch('/api/admin/abtest');
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch {
        console.error('Failed to fetch A/B tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const saveData = async (updated: ABTestData) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/abtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setData(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert('保存に失敗しました');
      }
    } catch {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (testId: string) => {
    const updated = {
      ...data,
      tests: data.tests.map((t) => t.id === testId ? { ...t, active: !t.active } : t),
    };
    saveData(updated);
  };

  const deleteTest = (testId: string) => {
    if (!confirm('このテストを削除しますか？')) return;
    const updated = { ...data, tests: data.tests.filter((t) => t.id !== testId) };
    saveData(updated);
  };

  const addVariant = () => {
    const nextId = String.fromCharCode(65 + newTest.variants.length);
    setNewTest((prev) => ({
      ...prev,
      variants: [...prev.variants, { id: nextId, label: '', value: '' }],
    }));
  };

  const removeVariant = (index: number) => {
    if (newTest.variants.length <= 2) return;
    setNewTest((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: 'label' | 'value', val: string) => {
    setNewTest((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: val } : v)),
    }));
  };

  const handleAddTest = () => {
    if (!newTest.name || !newTest.id) { alert('テスト名とIDを入力してください'); return; }
    if (data.tests.some((t) => t.id === newTest.id)) { alert('同じIDのテストが既に存在します'); return; }
    const updated = { ...data, tests: [...data.tests, { ...newTest }] };
    saveData(updated);
    setNewTestOpen(false);
    setNewTest({
      id: '', name: '', active: false,
      variants: [{ id: 'A', label: '', value: '' }, { id: 'B', label: '', value: '' }],
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-gray-500">読み込み中...</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">A/Bテスト管理</h1>
          {saved && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">保存しました</span>}
        </div>
        <button onClick={() => setNewTestOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">+ 新規テスト</button>
      </div>

      <div className="space-y-4">
        {data.tests.length === 0 && !newTestOpen && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-400 text-sm">A/Bテストがまだありません</p>
          </div>
        )}

        {data.tests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-gray-800">{test.name}</h3>
                <span className="text-xs text-gray-400">{test.id}</span>
                <span className={'text-xs px-2 py-0.5 rounded ' + (test.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {test.active ? '実行中' : '停止中'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(test.id)}
                  disabled={saving}
                  className={'text-xs px-3 py-1.5 rounded-lg transition-colors ' + (test.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200')}
                >
                  {test.active ? '停止' : '開始'}
                </button>
                <button onClick={() => deleteTest(test.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1.5">削除</button>
              </div>
            </div>
            <div className="space-y-2">
              {test.variants.map((variant) => (
                <div key={variant.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 w-6">{variant.id}</span>
                  <span className="text-sm text-gray-700">{variant.label}</span>
                  <span className="text-xs text-gray-400 ml-auto truncate max-w-xs">{variant.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {newTestOpen && (
          <div className="bg-white rounded-lg border-2 border-blue-200 p-5">
            <h3 className="text-sm font-medium text-gray-800 mb-4">新規A/Bテスト</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">テストID *</label>
                  <input type="text" value={newTest.id} onChange={(e) => setNewTest((prev) => ({ ...prev, id: e.target.value }))} placeholder="cta-color" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">テスト名 *</label>
                  <input type="text" value={newTest.name} onChange={(e) => setNewTest((prev) => ({ ...prev, name: e.target.value }))} placeholder="CTAボタン色テスト" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500">バリアント</label>
                  <button onClick={addVariant} className="text-xs text-blue-600 hover:text-blue-800">+ 追加</button>
                </div>
                <div className="space-y-2">
                  {newTest.variants.map((variant, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 w-6">{variant.id}</span>
                      <input type="text" value={variant.label} onChange={(e) => updateVariant(i, 'label', e.target.value)} placeholder="ラベル" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                      <input type="text" value={variant.value} onChange={(e) => updateVariant(i, 'value', e.target.value)} placeholder="値" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                      {newTest.variants.length > 2 && (
                        <button onClick={() => removeVariant(i)} className="text-xs text-red-500 hover:text-red-700">x</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={newTest.active} onChange={(e) => setNewTest((prev) => ({ ...prev, active: e.target.checked }))} className="rounded" />
                作成後すぐに開始
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button onClick={() => setNewTestOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">キャンセル</button>
              <button onClick={handleAddTest} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">追加</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
