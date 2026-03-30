import { useState, useEffect, useCallback } from 'react';

interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  thumbnail?: string;
}

const SAMPLE_ARTICLES: Article[] = [
  { slug: 'salary-negotiation', title: '年収交渉で失敗しないための5つの鉄則', description: '内定後の年収交渉は誰でも緊張するもの。しかし正しい準備と戦略があれば、提示額から50万円以上アップも可能です。', category: '年収アップ', date: '2024-03-15' },
  { slug: 'black-company-signs', title: 'ブラック企業の見分け方 - 入社前に確認すべき20のポイント', description: '求人票や面接だけでは分からないブラック企業の特徴。入社してから後悔しないために、事前にチェックすべきポイントを解説。', category: 'ブラック企業', date: '2024-03-10' },
  { slug: 'freelance-guide', title: 'フリーランス独立ガイド - 会社員から独立するまでのロードマップ', description: '準備期間、資金計画、最初のクライアント獲得まで。実体験に基づくフリーランス独立の完全ガイド。', category: 'フリーランス', date: '2024-03-05' },
  { slug: 'resume-template', title: '通過率が3倍上がる職務経歴書の書き方', description: '採用担当者が思わず面接したくなる職務経歴書のフォーマットと、業種別の書き方テンプレート。', category: '職務経歴書', date: '2024-02-28' },
  { slug: 'interview-tips', title: '面接対策 - よく聞かれる質問と回答テンプレート', description: '転職面接でよく聞かれる質問トップ20と、好印象を与える回答のテンプレートを紹介します。', category: '面接対策', date: '2024-02-20' },
  { slug: 'quit-service', title: '退職代行サービス比較 - おすすめランキング', description: '退職を切り出せない人のための退職代行サービス。料金・対応範囲・口コミを徹底比較。', category: '退職代行', date: '2024-02-15' },
  { slug: 'white-company', title: 'ホワイト企業の見つけ方 - 本当に働きやすい会社の特徴', description: '残業が少ない、有給が取れる、だけじゃない。本当の意味で働きやすい会社を見つけるための指標。', category: 'ホワイト企業', date: '2024-02-10' },
  { slug: 'career-change-30s', title: '30代の転職は遅くない - キャリアチェンジ成功の秘訣', description: '30代だからこそ活かせる経験とスキル。年齢をハンデではなく武器に変える転職戦略。', category: '転職', date: '2024-02-05' },
];

const POPULAR_KEYWORDS = ['転職', '年収アップ', 'ブラック企業', 'フリーランス', '面接対策', '退職代行', 'ホワイト企業', '職務経歴書'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>(SAMPLE_ARTICLES);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('search-history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveToHistory = useCallback((term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(updated);
    localStorage.setItem('search-history', JSON.stringify(updated));
  }, [history]);

  const handleSearch = useCallback((term: string) => {
    setQuery(term);
    if (!term.trim()) {
      setResults(SAMPLE_ARTICLES);
      return;
    }
    const lower = term.toLowerCase();
    const filtered = SAMPLE_ARTICLES.filter(a =>
      a.title.toLowerCase().includes(lower) ||
      a.description.toLowerCase().includes(lower) ||
      a.category.toLowerCase().includes(lower)
    );
    setResults(filtered);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveToHistory(query);
  };

  return (
    <div>
      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#ccc]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="キーワードで検索..."
            className="w-full pl-11 pr-4 py-3.5 border border-[#eee] rounded-lg text-[14px] text-[#333] placeholder-[#ccc] outline-none focus:border-[#999] transition-colors duration-300 bg-white"
            style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
          />
        </div>
      </form>

      {/* Search history */}
      {history.length > 0 && !query && (
        <div className="mb-8">
          <span className="block text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Recent</span>
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <button
                key={h}
                onClick={() => handleSearch(h)}
                className="px-3 py-1.5 bg-[#f8f8f6] border-none rounded-full text-[12px] text-[#666] cursor-pointer hover:bg-[#eee] transition-colors duration-300"
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular keywords */}
      <div className="mb-10">
        <span className="block text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>Popular</span>
        <div className="flex flex-wrap gap-2">
          {POPULAR_KEYWORDS.map(kw => (
            <button
              key={kw}
              onClick={() => { handleSearch(kw); saveToHistory(kw); }}
              className="px-3 py-1.5 border border-[#eee] bg-white rounded-full text-[12px] text-[#888] cursor-pointer hover:border-[#999] hover:text-[#333] transition-all duration-300"
              style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div>
        <span className="block text-[9px] tracking-[0.2em] uppercase text-[#bbb] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          {query ? `${results.length} Results` : 'All Articles'}
        </span>
        {results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#aaa]">該当する記事が見つかりませんでした。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map(article => (
              <a
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="block p-5 border border-[#eee] rounded-lg no-underline hover:border-[#ccc] transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#f8f8f6] rounded-md shrink-0 flex items-center justify-center">
                    <span className="text-[10px] text-[#ddd]">IMG</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] tracking-[0.08em] text-[#aaa] uppercase" style={{ fontFamily: "'Inter', sans-serif" }}>{article.category}</span>
                      <span className="text-[10px] text-[#ddd]">/</span>
                      <span className="text-[10px] tracking-[0.08em] text-[#ccc]" style={{ fontFamily: "'Inter', sans-serif" }}>{article.date}</span>
                    </div>
                    <h3 className="text-[14px] md:text-[15px] font-medium text-[#333] leading-[1.5] mb-1 group-hover:opacity-70 transition-opacity duration-300" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                      {article.title}
                    </h3>
                    <p className="text-[12px] leading-[1.6] text-[#999] hidden md:block" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
                      {article.description.slice(0, 80)}...
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
