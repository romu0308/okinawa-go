import type { APIRoute } from 'astro';
import { getArticleBySlug } from '../../../lib/articles';
import { getSettings } from '../../../lib/settings';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const { slug } = params;
    if (!slug) {
      return new Response('Slug is required', { status: 400 });
    }

    const article = getArticleBySlug(slug);
    const settings = getSettings();
    const title = article?.title || slug;
    const siteName = settings.siteName || 'キャリア孔明';

    // Wrap long titles
    const maxCharsPerLine = 16;
    const lines: string[] = [];
    let remaining = title;
    while (remaining.length > 0) {
      if (remaining.length <= maxCharsPerLine) {
        lines.push(remaining);
        break;
      }
      lines.push(remaining.slice(0, maxCharsPerLine));
      remaining = remaining.slice(maxCharsPerLine);
      if (lines.length >= 3) {
        // Truncate with ellipsis on line 3
        if (remaining.length > 0) {
          lines[lines.length - 1] =
            lines[lines.length - 1].slice(0, maxCharsPerLine - 1) + '…';
        }
        break;
      }
    }

    const titleY = 280 - (lines.length - 1) * 30;
    const titleSvg = lines
      .map(
        (line, i) =>
          `<text x="600" y="${titleY + i * 64}" text-anchor="middle" font-size="48" font-weight="bold" fill="#1a1a2e" font-family="'Hiragino Sans', 'Noto Sans JP', sans-serif">${escapeXml(line)}</text>`,
      )
      .join('\n    ');

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)" />

  <!-- Card -->
  <rect x="40" y="40" width="1120" height="550" rx="20" fill="white" opacity="0.95" />

  <!-- Title -->
  ${titleSvg}

  <!-- Divider -->
  <line x1="400" y1="${titleY + lines.length * 64 - 20}" x2="800" y2="${titleY + lines.length * 64 - 20}" stroke="#667eea" stroke-width="3" />

  <!-- Site name -->
  <text x="600" y="540" text-anchor="middle" font-size="28" fill="#667eea" font-family="'Hiragino Sans', 'Noto Sans JP', sans-serif" font-weight="bold">${escapeXml(siteName)}</text>

  <!-- Decorative elements -->
  <circle cx="100" cy="100" r="60" fill="#667eea" opacity="0.1" />
  <circle cx="1100" cy="530" r="80" fill="#764ba2" opacity="0.1" />
</svg>`;

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('OGP generation error:', error);
    return new Response('Failed to generate OGP image', { status: 500 });
  }
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
