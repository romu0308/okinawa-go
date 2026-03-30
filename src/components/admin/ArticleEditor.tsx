import { useState, useEffect, useRef, useCallback } from 'react';

interface AffiliateLink {
  serviceName: string;
  url: string;
  position: string;
}

interface Article {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail: string;
  publishedAt: string;
  status: string;
  pv: number;
  affiliateLinks: AffiliateLink[];
  series: string | null;
  seo: { metaDescription: string; ogpTitle: string; ogpImage: string | null };
}

interface Category {
  id: string;
  name: string;
  order: number;
}

interface Series {
  id: string;
  name: string;
  description: string;
  articleSlugs: string[];
}

interface Props {
  slug?: string;
  initialData?: any;
}

const emptyArticle: Article = {
  slug: '',
  title: '',
  description: '',
  content: '',
  category: '',
  tags: [],
  thumbnail: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  status: 'draft',
  pv: 0,
  affiliateLinks: [],
  series: null,
  seo: { metaDescription: '', ogpTitle: '', ogpImage: null },
};

export default function ArticleEditor({ slug, initialData }: Props) {
  const [article, setArticle] = useState<Article>(emptyArticle);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!!slug);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSavedContent = useRef('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, articlesRes] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/articles'),
        ]);

        const settings = await settingsRes.json();
        setCategories(settings.categories || []);

        const articles = await articlesRes.json();
        setAllArticles(Array.isArray(articles) ? articles : []);

        if (slug && Array.isArray(articles)) {
          const existing = articles.find((a: Article) => a.slug === slug);
          if (existing) {
            setArticle(existing);
            setThumbnailPreview(existing.thumbnail || '');
            lastSavedContent.current = JSON.stringify(existing);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      const current = JSON.stringify(article);
      if (article.slug && article.title && current !== lastSavedContent.current) {
        doSave('draft', true);
      }
    }, 30000);

    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [article]);

  const doSave = async (status?: string, isAutoSave = false) => {
    if (!article.title) {
      if (!isAutoSave) alert('タイトルを入力してください');
      return;
    }

    setSaving(true);
    const toSave = {
      ...article,
      slug: article.slug || generateSlug(article.title),
      status: status || article.status,
    };

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (data.success) {
        setArticle((prev) => ({ ...prev, slug: toSave.slug, status: toSave.status }));
        lastSavedContent.current = JSON.stringify(toSave);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        if (!slug && !isAutoSave) {
          window.history.replaceState(null, '', `/admin/articles/edit/${toSave.slug}`);
        }
      } else {
        if (!isAutoSave) alert('保存に失敗しました');
      }
    } catch {
      if (!isAutoSave) alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60) || `article-${Date.now()}`;
  };

  const insertText = (before: string, after = '') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.substring(start, end);
    const newText = before + selected + after;
    const newContent = ta.value.substring(0, start) + newText + ta.value.substring(end);
    setArticle((prev) => ({ ...prev, content: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    }, 0);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setArticle((prev) => ({ ...prev, thumbnail: data.path }));
        setThumbnailPreview(data.path);
      }
    } catch {
      alert('アップロードに失敗しました');
    }
  };

  const addTag = () => {
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !article.tags.includes(t));
    if (tags.length) {
      setArticle((prev) => ({ ...prev, tags: [...prev.tags, ...tags] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setArticle((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const addAffiliateLink = () => {
    setArticle((prev) => ({
      ...prev,
      affiliateLinks: [...prev.affiliateLinks, { serviceName: '', url: '', position: 'bottom' }],
    }));
  };

  const updateAffiliateLink = (index: number, field: keyof AffiliateLink, value: string) => {
    setArticle((prev) => {
      const links = [...prev.affiliateLinks];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, affiliateLinks: links };
    });
  };

  const removeAffiliateLink = (index: number) => {
    setArticle((prev) => ({
      ...prev,
      affiliateLinks: prev.affiliateLinks.filter((_, i) => i !== index),
    }));
  };

  // Extract headings for TOC
  const extractHeadings = (content: string) => {
    const lines = content.split('\n');
    const headings: { level: number; text: string }[] = [];
    for (const line of lines) {
      const m2 = line.match(/^## (.+)/);
      const m3 = line.match(/^### (.+)/);
      if (m2) headings.push({ level: 2, text: m2[1] });
      else if (m3) headings.push({ level: 3, text: m3[1] });
    }
    return headings;
  };

  // Character count and reading time
  const charCount = article.content.length;
  const readingTime = Math.max(1, Math.ceil(charCount / 600));
  const headings = extractHeadings(article.content);

  // Related article suggestions
  const getRelatedSuggestions = () => {
    if (!article.title && article.tags.length === 0) return [];
    const keywords = [
      ...article.tags,
      ...article.title.split(/\s+/).filter((w) => w.length > 1),
    ];
    return allArticles
      .filter((a) => a.slug !== article.slug)
      .filter((a) => {
        return keywords.some(
          (kw) =>
            a.title.includes(kw) ||
            a.tags.some((t) => t.includes(kw)) ||
            a.category === article.category,
        );
      })
      .slice(0, 5);
  };

  const relatedArticles = getRelatedSuggestions();

  // Simple markdown preview
  const renderPreview = (md: string) => {
    let html = md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 pb-2 border-b border-gray-200">$1</h2>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 underline">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-4" />')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">');
    return '<p class="mb-4">' + html + '</p>';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <a href="/admin/articles" className="text-gray-400 hover:text-gray-600 transition-colors">
            &larr; 記事一覧
          </a>
          <h1 className="text-lg font-bold text-gray-900">
            {slug ? '記事編集' : '新規記事'}
          </h1>
          {saved && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">保存済み</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (article.slug) {
                window.open('/articles/' + article.slug, '_blank');
              } else {
                alert('先に保存してください');
              }
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            プレビュー
          </button>
          <button
            onClick={() => doSave('draft')}
            disabled={saving}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '下書き保存'}
          </button>
          <button
            onClick={() => doSave('published')}
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            公開
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              placeholder="記事タイトル"
              value={article.title}
              onChange={(e) => setArticle((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full text-xl font-bold outline-none placeholder-gray-300"
            />
          </div>

          {/* Slug */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="text-xs text-gray-500 mb-1 block">スラッグ</label>
            <input
              type="text"
              placeholder="article-slug"
              value={article.slug}
              onChange={(e) => setArticle((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full text-sm outline-none border border-gray-200 rounded px-3 py-2"
            />
          </div>

          {/* Content editor with tabs */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-4">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={'px-4 py-3 text-sm font-medium border-b-2 transition-colors ' +
                    (activeTab === 'edit'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700')}
                >
                  編集
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={'px-4 py-3 text-sm font-medium border-b-2 transition-colors ' +
                    (activeTab === 'preview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700')}
                >
                  プレビュー
                </button>
              </div>
              <div className="text-xs text-gray-400">
                {charCount}文字 / 約{readingTime}分
              </div>
            </div>

            {/* Toolbar */}
            {activeTab === 'edit' && (
              <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-gray-100">
                <button onClick={() => insertText('## ', '\n')} className="px-2 py-1 text-xs font-medium bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="H2">H2</button>
                <button onClick={() => insertText('### ', '\n')} className="px-2 py-1 text-xs font-medium bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="H3">H3</button>
                <button onClick={() => insertText('**', '**')} className="px-2 py-1 text-xs font-bold bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="太字">B</button>
                <button onClick={() => insertText('[', '](url)')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="リンク">Link</button>
                <button onClick={() => insertText('![alt](', ')')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="画像">Img</button>
                <button onClick={() => insertText('\n:::cta\n', '\n:::\n')} className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors" title="CTAテンプレート">CTA</button>
                <button onClick={() => insertText('- ', '\n')} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors" title="リスト">List</button>
              </div>
            )}

            {/* Editor / Preview */}
            <div className="p-4">
              {activeTab === 'edit' ? (
                <textarea
                  ref={textareaRef}
                  value={article.content}
                  onChange={(e) => setArticle((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="マークダウンで記事を書く..."
                  className="w-full min-h-[500px] outline-none resize-y font-mono text-sm leading-relaxed"
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none min-h-[500px]"
                  dangerouslySetInnerHTML={{ __html: renderPreview(article.content) }}
                />
              )}
            </div>
          </div>

          {/* Affiliate Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">アフィリエイトリンク</h3>
              <button onClick={addAffiliateLink} className="text-xs text-blue-600 hover:text-blue-800">+ 追加</button>
            </div>
            {article.affiliateLinks.length === 0 && (
              <p className="text-xs text-gray-400">リンクがありません</p>
            )}
            {article.affiliateLinks.map((link, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                <input type="text" placeholder="サービス名" value={link.serviceName} onChange={(e) => updateAffiliateLink(i, 'serviceName', e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <input type="text" placeholder="URL" value={link.url} onChange={(e) => updateAffiliateLink(i, 'url', e.target.value)} className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500" />
                <select value={link.position} onChange={(e) => updateAffiliateLink(i, 'position', e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500">
                  <option value="top">上部</option>
                  <option value="middle">中間</option>
                  <option value="bottom">下部</option>
                </select>
                <button onClick={() => removeAffiliateLink(i)} className="px-3 py-2 text-sm text-red-500 hover:text-red-700">削除</button>
              </div>
            ))}
          </div>

          {/* SEO Fields */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">SEO設定</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">メタディスクリプション</label>
                <textarea
                  value={article.seo.metaDescription}
                  onChange={(e) => setArticle((prev) => ({ ...prev, seo: { ...prev.seo, metaDescription: e.target.value } }))}
                  placeholder="検索結果に表示される説明文（120文字推奨）"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 resize-none h-20"
                />
                <p className="text-xs text-gray-400 mt-1">{article.seo.metaDescription.length}/120文字</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">OGPタイトル</label>
                <input
                  type="text"
                  value={article.seo.ogpTitle}
                  onChange={(e) => setArticle((prev) => ({ ...prev, seo: { ...prev.seo, ogpTitle: e.target.value } }))}
                  placeholder="SNSシェア時のタイトル（空欄で記事タイトルを使用）"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">カテゴリ</h3>
            <select
              value={article.category}
              onChange={(e) => setArticle((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">タグ</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="タグ（カンマ区切り）"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
              />
              <button onClick={addTag} className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 transition-colors">追加</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-600">x</button>
                </span>
              ))}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">サムネイル</h3>
            {thumbnailPreview && (
              <img src={thumbnailPreview} alt="サムネイル" className="w-full h-32 object-cover rounded mb-2 border border-gray-200" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
          </div>

          {/* Publish Date */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">公開日時</h3>
            <input
              type="datetime-local"
              value={article.publishedAt?.slice(0, 16) || ''}
              onChange={(e) => setArticle((prev) => ({ ...prev, publishedAt: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
            />
          </div>

          {/* Series */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">シリーズ</h3>
            <select
              value={article.series || ''}
              onChange={(e) => setArticle((prev) => ({ ...prev, series: e.target.value || null }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500"
            >
              <option value="">なし</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* TOC Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">目次プレビュー</h3>
            {headings.length === 0 ? (
              <p className="text-xs text-gray-400">見出し（H2/H3）がありません</p>
            ) : (
              <ul className="space-y-1">
                {headings.map((h, i) => (
                  <li key={i} className={'text-xs text-gray-600 ' + (h.level === 3 ? 'ml-4' : '')}>
                    {h.level === 2 ? '\u25A0' : '\u2514'} {h.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Related Articles */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">関連記事候補</h3>
            {relatedArticles.length === 0 ? (
              <p className="text-xs text-gray-400">候補がありません</p>
            ) : (
              <ul className="space-y-2">
                {relatedArticles.map((a) => (
                  <li key={a.slug} className="text-xs text-gray-600 flex items-start gap-1">
                    <span className="text-gray-400 mt-0.5 shrink-0">-</span>
                    <span>{a.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">記事概要</h3>
            <textarea
              value={article.description}
              onChange={(e) => setArticle((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="記事の概要を入力..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded outline-none focus:border-blue-500 resize-none h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
