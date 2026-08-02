import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';
import { verifyCredentials } from '../../../lib/threads';
import {
  deletePost,
  getPost,
  getPosts,
  getRecentSourceSlugs,
  getSettings,
  newPostId,
  savePost,
  saveSettings,
  type ThreadsPost,
} from '../../../lib/threadsQueue';
import { generatePost } from '../../../lib/threadsGenerator';
import { getCredentials, publishQueuedPost } from '../../../lib/threadsService';

export const prerender = false;

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthenticated(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const [posts, settings] = await Promise.all([getPosts(), getSettings()]);
    const creds = await getCredentials(settings);
    let connection: { configured: boolean; username?: string; error?: string } = { configured: false };
    if (creds) {
      const check = await verifyCredentials(creds);
      connection = { configured: true, username: check.username, error: check.error };
    }
    // Never expose the access token to the browser
    const { access_token, ...safeSettings } = settings;
    return json({ posts, settings: safeSettings, connection });
  } catch (error) {
    console.error('GET /api/admin/threads error:', error);
    return json({ error: 'Failed to fetch threads data' }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const body = await request.json();
    const action = body.action as string;

    if (action === 'save') {
      const now = new Date().toISOString();
      const existing = body.id ? await getPost(body.id) : null;
      const post: ThreadsPost = {
        id: existing?.id || newPostId(),
        text: body.text || '',
        image_url: body.image_url || null,
        source_slug: existing?.source_slug || null,
        source: existing?.source || 'manual',
        status: body.scheduled_at ? 'scheduled' : 'draft',
        scheduled_at: body.scheduled_at || null,
        published_at: existing?.published_at || null,
        threads_post_id: existing?.threads_post_id || null,
        permalink: existing?.permalink || null,
        error: null,
        created_at: existing?.created_at || now,
      };
      if (!post.text.trim()) return json({ error: '投稿文を入力してください' }, 400);
      if (post.text.length > 500) return json({ error: '投稿文は500文字以内にしてください' }, 400);
      const result = await savePost(post);
      return result.success ? json({ success: true, post }) : json({ error: result.error }, 500);
    }

    if (action === 'generate') {
      const settings = await getSettings();
      const recentSlugs = await getRecentSourceSlugs();
      const gen = generatePost(recentSlugs, settings.hashtags);
      if (!gen) return json({ error: '記事が見つかりません' }, 404);
      const post: ThreadsPost = {
        id: newPostId(),
        text: gen.text,
        image_url: gen.imageUrl,
        source_slug: gen.sourceSlug,
        source: 'auto',
        status: 'draft',
        scheduled_at: null,
        published_at: null,
        threads_post_id: null,
        permalink: null,
        error: null,
        created_at: new Date().toISOString(),
      };
      const result = await savePost(post);
      return result.success ? json({ success: true, post }) : json({ error: result.error }, 500);
    }

    if (action === 'publish_now') {
      const post = body.id ? await getPost(body.id) : null;
      if (!post) return json({ error: '投稿が見つかりません' }, 404);
      if (post.status === 'published') return json({ error: 'すでに投稿済みです' }, 400);
      const creds = await getCredentials();
      if (!creds) return json({ error: 'Threads APIが未設定です（THREADS_ACCESS_TOKEN / THREADS_USER_ID）' }, 400);
      const updated = await publishQueuedPost(post, creds);
      return updated.status === 'published'
        ? json({ success: true, post: updated })
        : json({ error: updated.error, post: updated }, 500);
    }

    if (action === 'save_settings') {
      const current = await getSettings();
      const postTimes = Array.isArray(body.post_times)
        ? body.post_times.filter((t: string) => /^\d{1,2}:\d{2}$/.test(t))
        : current.post_times;
      const result = await saveSettings({
        ...current,
        autopilot: !!body.autopilot,
        post_times: postTimes.length > 0 ? postTimes : current.post_times,
        hashtags: typeof body.hashtags === 'string' ? body.hashtags : current.hashtags,
      });
      return result.success ? json({ success: true }) : json({ error: result.error }, 500);
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (error) {
    console.error('POST /api/admin/threads error:', error);
    return json({ error: 'Request failed' }, 500);
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAuthenticated(cookies)) return json({ error: 'Unauthorized' }, 401);
  try {
    const { id } = await request.json();
    if (!id) return json({ error: 'id is required' }, 400);
    await deletePost(id);
    return json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/threads error:', error);
    return json({ error: 'Failed to delete post' }, 500);
  }
};
