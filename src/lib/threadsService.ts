// Orchestration for Threads auto-posting: publishing queued posts,
// autopilot scheduling, and token refresh. Used by the cron endpoint and admin API.
import { getEnvCredentials, publishPost, refreshLongLivedToken, type ThreadsCredentials } from './threads';
import {
  getDuePosts,
  getFutureScheduledPosts,
  getRecentSourceSlugs,
  getSettings,
  newPostId,
  savePost,
  saveSettings,
  type ThreadsPost,
  type ThreadsSettings,
} from './threadsQueue';
import { generatePost } from './threadsGenerator';

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
const TOKEN_REFRESH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // weekly

export async function getCredentials(settings?: ThreadsSettings): Promise<ThreadsCredentials | null> {
  const env = getEnvCredentials();
  const s = settings || (await getSettings());
  // A refreshed token stored in settings takes priority over the (stale) env token
  if (s.access_token && env?.userId) return { accessToken: s.access_token, userId: env.userId };
  return env;
}

export async function publishQueuedPost(post: ThreadsPost, creds: ThreadsCredentials): Promise<ThreadsPost> {
  const result = await publishPost(creds, post.text, post.image_url || undefined);
  const updated: ThreadsPost = result.success
    ? {
        ...post,
        status: 'published',
        published_at: new Date().toISOString(),
        threads_post_id: result.postId || null,
        permalink: result.permalink || null,
        error: null,
      }
    : { ...post, status: 'failed', error: result.error || 'Unknown error' };
  await savePost(updated);
  return updated;
}

// Publish all posts whose scheduled time has passed
export async function publishDuePosts(): Promise<{ published: number; failed: number; errors: string[] }> {
  const creds = await getCredentials();
  const summary = { published: 0, failed: 0, errors: [] as string[] };
  if (!creds) {
    summary.errors.push('Threads credentials not configured');
    return summary;
  }
  const due = await getDuePosts();
  for (const post of due) {
    const updated = await publishQueuedPost(post, creds);
    if (updated.status === 'published') summary.published++;
    else {
      summary.failed++;
      summary.errors.push(`${post.id}: ${updated.error}`);
    }
  }
  return summary;
}

// Next occurrence of a JST "HH:MM" time strictly after `after`
function nextSlot(timeJst: string, after: Date): Date {
  const [h, m] = timeJst.split(':').map(Number);
  const nowJst = new Date(after.getTime() + JST_OFFSET_MS);
  const slot = new Date(Date.UTC(
    nowJst.getUTCFullYear(), nowJst.getUTCMonth(), nowJst.getUTCDate(), h, m, 0,
  ) - JST_OFFSET_MS);
  if (slot <= after) slot.setUTCDate(slot.getUTCDate() + 1);
  return slot;
}

// Autopilot: make sure every configured posting slot in the next 24h has a scheduled post
export async function ensureAutopilotSchedule(): Promise<{ generated: number }> {
  const settings = await getSettings();
  if (!settings.autopilot) return { generated: 0 };

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const scheduled = await getFutureScheduledPosts(now);
  let generated = 0;

  for (const time of settings.post_times) {
    const slot = nextSlot(time, now);
    if (slot > horizon) continue;
    // slot already covered by a post scheduled within ±90 minutes?
    const covered = scheduled.some((p) => {
      const t = new Date(p.scheduled_at!).getTime();
      return Math.abs(t - slot.getTime()) < 90 * 60 * 1000;
    });
    if (covered) continue;

    const recentSlugs = await getRecentSourceSlugs();
    const gen = generatePost(recentSlugs, settings.hashtags);
    if (!gen) continue;

    const post: ThreadsPost = {
      id: newPostId(),
      text: gen.text,
      image_url: gen.imageUrl,
      source_slug: gen.sourceSlug,
      source: 'auto',
      status: 'scheduled',
      scheduled_at: slot.toISOString(),
      published_at: null,
      threads_post_id: null,
      permalink: null,
      error: null,
      created_at: now.toISOString(),
    };
    await savePost(post);
    scheduled.push(post);
    generated++;
  }
  return { generated };
}

// Long-lived tokens expire after 60 days; refresh weekly and persist the new token
export async function maybeRefreshToken(): Promise<{ refreshed: boolean }> {
  const settings = await getSettings();
  const creds = await getCredentials(settings);
  if (!creds) return { refreshed: false };

  const last = settings.token_refreshed_at ? new Date(settings.token_refreshed_at).getTime() : 0;
  if (Date.now() - last < TOKEN_REFRESH_INTERVAL_MS) return { refreshed: false };

  const result = await refreshLongLivedToken(creds.accessToken);
  if (!result) {
    // Record the attempt so we don't hammer the API every cron run
    await saveSettings({ ...settings, token_refreshed_at: new Date().toISOString() });
    return { refreshed: false };
  }
  await saveSettings({
    ...settings,
    access_token: result.token,
    token_refreshed_at: new Date().toISOString(),
  });
  return { refreshed: true };
}
