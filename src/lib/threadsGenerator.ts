// Generates Threads post text from site articles (template rotation + article rotation)
import fs from 'node:fs';
import path from 'node:path';

const ARTICLES_DIR = path.join(process.cwd(), 'src/content/articles');
const SITE_URL = 'https://okinawa-go.jp';

interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  publishedAt: string;
}

function parseFrontmatter(raw: string): Record<string, any> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result: Record<string, any> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value: any = kv[2].trim();
    if (value.startsWith('[')) {
      try { value = JSON.parse(value.replace(/'/g, '"')); } catch { value = []; }
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    result[key] = value;
  }
  return result;
}

export function getArticleMetas(): ArticleMeta[] {
  let files: string[] = [];
  try {
    files = fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const now = new Date();
  const metas: ArticleMeta[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf-8');
      const fm = parseFrontmatter(raw);
      if (!fm.title) continue;
      if (fm.publishedAt && new Date(fm.publishedAt) > now) continue; // skip future-dated
      metas.push({
        slug: file.replace(/\.md$/, ''),
        title: fm.title,
        description: fm.description || '',
        category: fm.category || '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        thumbnail: fm.thumbnail || '',
        publishedAt: fm.publishedAt || '',
      });
    } catch {
      // skip unreadable file
    }
  }
  return metas;
}

const TEMPLATES: ((a: ArticleMeta, url: string) => string)[] = [
  (a, url) => `${a.title}\n\n${a.description}\n\n詳しくはこちら👇\n${url}`,
  (a, url) => `【沖縄情報】${a.title}\n\n${a.description}\n\n続きはブログで📝\n${url}`,
  (a, url) => `沖縄在住者が書きました✍️\n\n「${a.title}」\n\n${a.description}\n${url}`,
  (a, url) => `${a.description}\n\n▶ ${a.title}\n${url}`,
  (a, url) => `知ってた？🌺\n\n${a.title}\n\n${a.description}\n\n全文はこちら\n${url}`,
];

export interface GeneratedPost {
  text: string;
  imageUrl: string | null;
  sourceSlug: string;
}

// Pick the article least recently used and compose post text.
// recentSlugs: newest first — articles in it are deprioritized.
export function generatePost(recentSlugs: string[], hashtags: string): GeneratedPost | null {
  const articles = getArticleMetas();
  if (articles.length === 0) return null;

  const recency = new Map<string, number>();
  recentSlugs.forEach((slug, i) => {
    if (!recency.has(slug)) recency.set(slug, i);
  });

  // Unposted articles first (shuffled), then least-recently-posted
  const unposted = articles.filter((a) => !recency.has(a.slug));
  let picked: ArticleMeta;
  if (unposted.length > 0) {
    picked = unposted[Math.floor(Math.random() * unposted.length)];
  } else {
    picked = [...articles].sort((a, b) => recency.get(b.slug)! - recency.get(a.slug)!)[0];
  }

  const url = `${SITE_URL}/articles/${picked.slug}/`;
  const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
  let text = template(picked, url);

  const tagLine = buildHashtags(picked, hashtags);
  if (tagLine) text += `\n\n${tagLine}`;

  // Threads limit is 500 chars — trim description-heavy posts if needed
  if (text.length > 500) {
    const over = text.length - 500;
    const shortDesc = picked.description.slice(0, Math.max(0, picked.description.length - over - 1)) + '…';
    text = template({ ...picked, description: shortDesc }, url);
    if (tagLine) text += `\n\n${tagLine}`;
    if (text.length > 500) text = text.slice(0, 500);
  }

  return { text, imageUrl: picked.thumbnail || null, sourceSlug: picked.slug };
}

function buildHashtags(article: ArticleMeta, base: string): string {
  const tags = new Set<string>();
  for (const t of base.split(/\s+/).filter(Boolean)) tags.add(t.startsWith('#') ? t : `#${t}`);
  for (const t of article.tags.slice(0, 2)) tags.add(`#${t}`);
  return [...tags].join(' ');
}
