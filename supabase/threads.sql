-- Threads auto-post service tables
-- Run this in the Supabase SQL editor

create table if not exists threads_posts (
  id text primary key,
  text text not null,
  image_url text,
  source_slug text,
  source text not null default 'manual', -- 'manual' | 'auto'
  status text not null default 'draft',  -- 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at timestamptz,
  published_at timestamptz,
  threads_post_id text,
  permalink text,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists threads_posts_status_scheduled_idx
  on threads_posts (status, scheduled_at);

create table if not exists threads_settings (
  id int primary key default 1,
  autopilot boolean not null default false,
  post_times jsonb not null default '["09:00", "19:00"]',
  hashtags text not null default '#沖縄 #沖縄旅行 #沖縄観光',
  access_token text,
  token_refreshed_at timestamptz
);

insert into threads_settings (id) values (1) on conflict (id) do nothing;
