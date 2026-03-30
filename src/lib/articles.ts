import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

export interface Article {
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
  affiliateLinks: { serviceName: string; url: string; position: string }[];
  series: string | null;
  seo: { metaDescription: string; ogpTitle: string; ogpImage: string | null };
}

export function getArticles(): Article[] {
  const filePath = path.join(DATA_DIR, 'articles.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function getArticleBySlug(slug: string): Article | undefined {
  return getArticles().find((a) => a.slug === slug);
}

export function saveArticles(articles: Article[]) {
  fs.writeFileSync(
    path.join(DATA_DIR, 'articles.json'),
    JSON.stringify(articles, null, 2),
  );
}

export function getPublishedArticles(): Article[] {
  return getArticles()
    .filter((a) => a.status === 'published')
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export function getArticlesByCategory(category: string): Article[] {
  return getPublishedArticles().filter((a) => a.category === category);
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase();
  return getPublishedArticles().filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q)),
  );
}
