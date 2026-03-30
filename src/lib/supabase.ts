import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fallback: use local JSON when Supabase is not configured
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

function readJson(file: string) {
  const p = path.join(DATA_DIR, file);
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}
function writeJson(file: string, data: any) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// Newsletter
export async function addSubscriber(email: string) {
  if (supabase) {
    const { data: existing } = await supabase.from('newsletters').select('id').eq('email', email).single();
    if (existing) return { error: 'already_subscribed' };
    const { error } = await supabase.from('newsletters').insert({ email, status: 'active' });
    return error ? { error: error.message } : { success: true };
  }
  // Fallback
  const subs = readJson('newsletter-subscribers.json');
  if (subs.find((s: any) => s.email === email)) return { error: 'already_subscribed' };
  subs.push({ email, created_at: new Date().toISOString(), status: 'active' });
  writeJson('newsletter-subscribers.json', subs);
  return { success: true };
}

export async function getSubscribers() {
  if (supabase) {
    const { data } = await supabase.from('newsletters').select('*').order('created_at', { ascending: false });
    return data || [];
  }
  return readJson('newsletter-subscribers.json');
}

// Page Views
export async function incrementView(slug: string) {
  if (supabase) {
    const { data: existing } = await supabase.from('page_views').select('*').eq('slug', slug).single();
    if (existing) {
      await supabase.from('page_views').update({ count: existing.count + 1, last_viewed: new Date().toISOString() }).eq('slug', slug);
      return existing.count + 1;
    }
    await supabase.from('page_views').insert({ slug, count: 1, last_viewed: new Date().toISOString() });
    return 1;
  }
  // Fallback
  const views = readJson('page-views.json');
  const existing = views.find((v: any) => v.slug === slug);
  if (existing) { existing.count++; existing.last_viewed = new Date().toISOString(); }
  else views.push({ slug, count: 1, last_viewed: new Date().toISOString() });
  writeJson('page-views.json', views);
  return existing ? existing.count : 1;
}

export async function getViews(slug?: string) {
  if (supabase) {
    if (slug) {
      const { data } = await supabase.from('page_views').select('*').eq('slug', slug).single();
      return data;
    }
    const { data } = await supabase.from('page_views').select('*').order('count', { ascending: false });
    return data || [];
  }
  const views = readJson('page-views.json');
  if (slug) return views.find((v: any) => v.slug === slug);
  return views.sort((a: any, b: any) => b.count - a.count);
}

// Reviews
export async function addReview(spotSlug: string, name: string, rating: number, comment: string) {
  const review = { spot_slug: spotSlug, name: name || '匿名', rating, comment, created_at: new Date().toISOString(), approved: false };
  if (supabase) {
    const { error } = await supabase.from('reviews').insert(review);
    return error ? { error: error.message } : { success: true };
  }
  const reviews = readJson('reviews.json');
  reviews.push({ id: reviews.length + 1, ...review });
  writeJson('reviews.json', reviews);
  return { success: true };
}

export async function getReviews(spotSlug: string, approvedOnly = true) {
  if (supabase) {
    let query = supabase.from('reviews').select('*').eq('spot_slug', spotSlug);
    if (approvedOnly) query = query.eq('approved', true);
    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  }
  const reviews = readJson('reviews.json');
  return reviews.filter((r: any) => r.spot_slug === spotSlug && (!approvedOnly || r.approved));
}

export async function getAllReviews() {
  if (supabase) {
    const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    return data || [];
  }
  return readJson('reviews.json');
}

export async function approveReview(id: number) {
  if (supabase) {
    await supabase.from('reviews').update({ approved: true }).eq('id', id);
    return;
  }
  const reviews = readJson('reviews.json');
  const r = reviews.find((r: any) => r.id === id);
  if (r) r.approved = true;
  writeJson('reviews.json', reviews);
}

export async function deleteReview(id: number) {
  if (supabase) {
    await supabase.from('reviews').delete().eq('id', id);
    return;
  }
  const reviews = readJson('reviews.json');
  const idx = reviews.findIndex((r: any) => r.id === id);
  if (idx >= 0) reviews.splice(idx, 1);
  writeJson('reviews.json', reviews);
}

// Saved Plans
export async function savePlan(title: string, days: number, spotsJson: string) {
  const shareKey = Math.random().toString(36).substring(2, 10);
  const plan = { title, days, spots_json: spotsJson, created_at: new Date().toISOString(), share_key: shareKey };
  if (supabase) {
    const { error } = await supabase.from('plans').insert(plan);
    return error ? { error: error.message } : { shareKey };
  }
  const plans = readJson('saved-plans.json');
  plans.push({ id: plans.length + 1, ...plan });
  writeJson('saved-plans.json', plans);
  return { shareKey };
}

export async function getPlan(shareKey: string) {
  if (supabase) {
    const { data } = await supabase.from('plans').select('*').eq('share_key', shareKey).single();
    return data;
  }
  const plans = readJson('saved-plans.json');
  return plans.find((p: any) => p.share_key === shareKey);
}
