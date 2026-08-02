// Threads post queue + settings store
// Uses Supabase when configured, falls back to local JSON (same pattern as supabase.ts)
import { supabase } from './supabase';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const POSTS_FILE = 'threads-posts.json';
const SETTINGS_FILE = 'threads-settings.json';

export type ThreadsPostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface ThreadsPost {
  id: string;
  text: string;
  image_url: string | null;
  source_slug: string | null; // article slug the post was generated from
  source: 'manual' | 'auto';
  status: ThreadsPostStatus;
  scheduled_at: string | null;
  published_at: string | null;
  threads_post_id: string | null;
  permalink: string | null;
  error: string | null;
  created_at: string;
}

export interface ThreadsSettings {
  autopilot: boolean;
  post_times: string[]; // JST "HH:MM"
  hashtags: string;
  access_token: string | null; // refreshed token stored here (overrides env)
  token_refreshed_at: string | null;
}

export const DEFAULT_SETTINGS: ThreadsSettings = {
  autopilot: false,
  post_times: ['09:00', '19:00'],
  hashtags: '#沖縄 #沖縄旅行 #沖縄観光',
  access_token: null,
  token_refreshed_at: null,
};

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: any) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

export function newPostId(): string {
  return 'thp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
}

// ---- Posts ----

export async function getPosts(): Promise<ThreadsPost[]> {
  if (supabase) {
    const { data } = await supabase
      .from('threads_posts')
      .select('*')
      .order('created_at', { ascending: false });
    return (data as ThreadsPost[]) || [];
  }
  return readJson<ThreadsPost[]>(POSTS_FILE, []);
}

export async function getPost(id: string): Promise<ThreadsPost | null> {
  if (supabase) {
    const { data } = await supabase.from('threads_posts').select('*').eq('id', id).single();
    return (data as ThreadsPost) || null;
  }
  const posts = readJson<ThreadsPost[]>(POSTS_FILE, []);
  return posts.find((p) => p.id === id) || null;
}

export async function getDuePosts(now: Date = new Date()): Promise<ThreadsPost[]> {
  if (supabase) {
    const { data } = await supabase
      .from('threads_posts')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true });
    return (data as ThreadsPost[]) || [];
  }
  const posts = readJson<ThreadsPost[]>(POSTS_FILE, []);
  return posts
    .filter((p) => p.status === 'scheduled' && p.scheduled_at && new Date(p.scheduled_at) <= now)
    .sort((a, b) => (a.scheduled_at! < b.scheduled_at! ? -1 : 1));
}

export async function getFutureScheduledPosts(now: Date = new Date()): Promise<ThreadsPost[]> {
  if (supabase) {
    const { data } = await supabase
      .from('threads_posts')
      .select('*')
      .eq('status', 'scheduled')
      .gt('scheduled_at', now.toISOString());
    return (data as ThreadsPost[]) || [];
  }
  const posts = readJson<ThreadsPost[]>(POSTS_FILE, []);
  return posts.filter(
    (p) => p.status === 'scheduled' && p.scheduled_at && new Date(p.scheduled_at) > now,
  );
}

export async function savePost(post: ThreadsPost): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    const { error } = await supabase.from('threads_posts').upsert(post);
    return error ? { success: false, error: error.message } : { success: true };
  }
  const posts = readJson<ThreadsPost[]>(POSTS_FILE, []);
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  writeJson(POSTS_FILE, posts);
  return { success: true };
}

export async function deletePost(id: string): Promise<void> {
  if (supabase) {
    await supabase.from('threads_posts').delete().eq('id', id);
    return;
  }
  const posts = readJson<ThreadsPost[]>(POSTS_FILE, []);
  const idx = posts.findIndex((p) => p.id === id);
  if (idx >= 0) {
    posts.splice(idx, 1);
    writeJson(POSTS_FILE, posts);
  }
}

// Slugs of recently published/scheduled auto posts (for article rotation)
export async function getRecentSourceSlugs(limit = 20): Promise<string[]> {
  const posts = await getPosts();
  return posts
    .filter((p) => p.source_slug && p.status !== 'failed')
    .slice(0, limit)
    .map((p) => p.source_slug!) as string[];
}

// ---- Settings ----

export async function getSettings(): Promise<ThreadsSettings> {
  if (supabase) {
    const { data } = await supabase.from('threads_settings').select('*').eq('id', 1).single();
    if (data) {
      return {
        autopilot: !!data.autopilot,
        post_times: data.post_times || DEFAULT_SETTINGS.post_times,
        hashtags: data.hashtags ?? DEFAULT_SETTINGS.hashtags,
        access_token: data.access_token || null,
        token_refreshed_at: data.token_refreshed_at || null,
      };
    }
    return { ...DEFAULT_SETTINGS };
  }
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<ThreadsSettings>>(SETTINGS_FILE, {}) };
}

export async function saveSettings(settings: ThreadsSettings): Promise<{ success: boolean; error?: string }> {
  if (supabase) {
    const { error } = await supabase.from('threads_settings').upsert({ id: 1, ...settings });
    return error ? { success: false, error: error.message } : { success: true };
  }
  writeJson(SETTINGS_FILE, settings);
  return { success: true };
}
