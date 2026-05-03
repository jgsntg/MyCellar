-- ============================================================
-- MyCellar — initial schema
-- Run this in the Supabase SQL editor (or via supabase db push)
-- ============================================================

create table if not exists public.wines (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  source_id     text,           -- CellarTracker iWine ID for dedup
  producer      text not null,
  wine          text,
  vintage       int,
  type          text,           -- Red | White | Rosé | Sparkling | Dessert | Fortified
  varietal      text,
  region        text,
  country       text,
  quantity      int not null default 1,
  size          text not null default '750 ml',
  location      text,
  price         numeric(10, 2),
  window_start  int,
  peak_start    int,
  peak_end      int,
  window_end    int,
  notes         text,
  added_at      timestamptz not null default now()
);

create table if not exists public.consumption_log (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete cascade not null,
  wine_id           uuid references public.wines(id) on delete set null,
  date              date not null,
  rating            int check (rating between 1 and 5),
  note              text,
  value             numeric(10, 2),
  snapshot_producer text not null,
  snapshot_wine     text,
  snapshot_vintage  int,
  created_at        timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists wines_user_id_idx        on public.wines(user_id);
create index if not exists wines_source_id_idx      on public.wines(user_id, source_id);
create index if not exists log_user_id_idx          on public.consumption_log(user_id);
create index if not exists log_date_idx             on public.consumption_log(user_id, date desc);

-- Row Level Security
alter table public.wines           enable row level security;
alter table public.consumption_log enable row level security;

-- RLS policies — users only see and modify their own rows
create policy "wines: own rows only"
  on public.wines for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "log: own rows only"
  on public.consumption_log for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
