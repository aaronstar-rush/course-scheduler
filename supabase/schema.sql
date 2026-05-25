-- 在 Supabase SQL Editor 中执行此脚本

create table if not exists schedule_store (
  id text primary key default 'main',
  schedules jsonb not null default '[]'::jsonb,
  students jsonb not null default '[]'::jsonb,
  teachers jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- 仅服务端（Service Role）访问，不开放 anon 读写
alter table schedule_store enable row level security;
