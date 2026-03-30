import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
  industry: string;
  tags: string[];
  comment: string;
  agentLink: string;
  salaryRange: string;
  overtime: string;
  remote: string;
}

const emptyCompany: Company = {
  id: '',
  name: '',
  industry: '',
  tags: [],
  comment: '',
  agentLink: '',
  salaryRange: '',
  overtime: '',
  remote: '',
};

export default function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company>(emptyCompany);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies');
      const data = await res.json();
      setCompanies(Array.isArray(data) ? data : []);
    } catch {
      console.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const filtered = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q));
  });

  const openNew = () => {
    setEditing({ ...emptyCompany, id: 'company-' + Date.now() });
    setTagInput('');
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditing({ ...company });
    setTagInput('');
    setModalOpen(true);
  };

  const addTag = () => {
    const tags = tagInput.split(',').map((t) => t.trim()).filter((t) => t && !editing.tags.includes(t));
    if (tags.length) {
      setEditing((prev) => ({ ...prev, tags: [...prev.tags, ...tags] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setEditing((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSave = async () => {
    if (!editing.name) { alert('企業名を入力してください'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        await fetchCompanies();
      } else {
        alert('保存に失敗しました');
      }
    } catch {
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch('/api/admin/companies?id=' + id, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setDeleteConfirm(null); await fetchCompanies(); }
    } catch {
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><p className="text-gray-500">読み込み中...</p></div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-lg font-bold text-gray-900">ホワイト企業管理</h1>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">+ 新規追加</button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <input type="text" placeholder="企業名・業種・タグで検索..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 font-medium text-gray-600">企業名</th>
              <th className="text-left p-3 font-medium text-gray-600 hidden md:table-cell">業種</th>
              <th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">タグ</th>
              <th className="text-left p-3 font-medium text-gray-600 hidden sm:table-cell">年収レンジ</th>
              <th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">残業時間</th>
              <th className="text-left p-3 font-medium text-gray-600 hidden lg:table-cell">リモート</th>
              <th className="text-left p-3 font-medium text-gray-600 w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">{search ? '検索結果がありません' : '企業がまだ登録されていません'}</td></tr>
            ) : filtered.map((company) => (
              <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{company.name}</td>
                <td className="p-3 text-gray-500 hidden md:table-cell">{company.industry || '-'}</td>
                <td className="p-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {company.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-gray-500 hidden sm:table-cell">{company.salaryRange || '-'}</td>
                <td className="p-3 text-gray-500 hidden lg:table-cell">{company.overtime || '-'}</td>
                <td className="p-3 text-gray-500 hidden lg:table-cell">{company.remote || '-'}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(company)} className="text-blue-600 hover:text-blue-800 text-xs">編集</button>
                    {deleteConfirm === company.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(company.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">確定</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600 text-xs">取消</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(company.id)} className="text-red-500 hover:text-red-700 text-xs">削除</button>
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
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-900">{companies.some((c) => c.id === editing.id) ? '企業編集' : '新規企業'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">x</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">企業名 *</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing((prev) => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">業種</label>
                <input type="text" value={editing.industry} onChange={(e) => setEditing((prev) => ({ ...prev, industry: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">タグ</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="カンマ区切りで入力" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                  <button onClick={addTag} className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">追加</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editing.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-600">x</button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">コメント</label>
                <textarea value={editing.comment} onChange={(e) => setEditing((prev) => ({ ...prev, comment: e.target.value }))} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 resize-none h-20" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">エージェントリンク</label>
                <input type="text" value={editing.agentLink} onChange={(e) => setEditing((prev) => ({ ...prev, agentLink: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">年収レンジ</label>
                  <input type="text" value={editing.salaryRange} onChange={(e) => setEditing((prev) => ({ ...prev, salaryRange: e.target.value }))} placeholder="400-600万" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">残業時間</label>
                  <input type="text" value={editing.overtime} onChange={(e) => setEditing((prev) => ({ ...prev, overtime: e.target.value }))} placeholder="月10h以下" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">リモート制度</label>
                  <input type="text" value={editing.remote} onChange={(e) => setEditing((prev) => ({ ...prev, remote: e.target.value }))} placeholder="フルリモート" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" />
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
