-- Atelier des Histoires — schéma Supabase
-- Exécuter ce fichier dans Supabase > SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.is_story_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'joshouatritto2020@gmail.com';
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  slug text not null unique,
  summary text not null default '',
  genre text not null default 'Aventure',
  cover_url text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  theme jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  title text not null,
  content text not null default '',
  position integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(story_id, position)
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  name text not null,
  role text not null default 'Secondaire',
  archetype text not null default '',
  age_label text not null default '',
  appearance text not null default '',
  personality text not null default '',
  goal text not null default '',
  fear text not null default '',
  backstory text not null default '',
  notes text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(story_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1200),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  event_type text not null,
  value numeric not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  app_name text not null default 'Atelier des Histoires',
  tagline text not null default 'Écrire. Publier. Être lu.',
  primary_color text not null default '#6c4cff',
  secondary_color text not null default '#ebe5ff',
  accent_color text not null default '#ffb347',
  background_color text not null default '#f7f5fb',
  surface_color text not null default '#ffffff',
  text_color text not null default '#241f33',
  radius integer not null default 18 check (radius between 0 and 40),
  font_family text not null default 'serif' check (font_family in ('serif','sans'))
);
insert into public.site_settings(id) values (1) on conflict (id) do nothing;

create index if not exists stories_status_published_idx on public.stories(status, published_at desc);
create index if not exists chapters_story_position_idx on public.chapters(story_id, position);
create index if not exists comments_story_created_idx on public.comments(story_id, created_at desc);
create index if not exists analytics_story_type_idx on public.analytics_events(story_id, event_type, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.characters enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.analytics_events enable row level security;
alter table public.site_settings enable row level security;

-- Profils : visibles uniquement par les membres connectés, modification personnelle.
create policy "members read profiles" on public.profiles for select to authenticated using (true);
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Histoires : les lecteurs connectés ne voient que les œuvres publiées ; l'admin gère tout.
create policy "members read published stories" on public.stories for select to authenticated using (status = 'published' or public.is_story_admin());
create policy "admin inserts stories" on public.stories for insert to authenticated with check (public.is_story_admin() and owner_id = auth.uid());
create policy "admin updates stories" on public.stories for update to authenticated using (public.is_story_admin()) with check (public.is_story_admin());
create policy "admin deletes stories" on public.stories for delete to authenticated using (public.is_story_admin());

create policy "members read published chapters" on public.chapters for select to authenticated using (exists (select 1 from public.stories s where s.id = story_id and (s.status = 'published' or public.is_story_admin())));
create policy "admin manages chapters insert" on public.chapters for insert to authenticated with check (public.is_story_admin());
create policy "admin manages chapters update" on public.chapters for update to authenticated using (public.is_story_admin()) with check (public.is_story_admin());
create policy "admin manages chapters delete" on public.chapters for delete to authenticated using (public.is_story_admin());

create policy "admin reads characters" on public.characters for select to authenticated using (public.is_story_admin());
create policy "admin inserts characters" on public.characters for insert to authenticated with check (public.is_story_admin());
create policy "admin updates characters" on public.characters for update to authenticated using (public.is_story_admin()) with check (public.is_story_admin());
create policy "admin deletes characters" on public.characters for delete to authenticated using (public.is_story_admin());

create policy "members read likes" on public.likes for select to authenticated using (true);
create policy "members add own likes" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "members remove own likes" on public.likes for delete to authenticated using (auth.uid() = user_id);

create policy "members read visible comments" on public.comments for select to authenticated using (not is_hidden or public.is_story_admin());
create policy "members add own comments" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "members update own comments" on public.comments for update to authenticated using (auth.uid() = user_id or public.is_story_admin()) with check (auth.uid() = user_id or public.is_story_admin());
create policy "members delete own comments" on public.comments for delete to authenticated using (auth.uid() = user_id or public.is_story_admin());

create policy "members create analytics" on public.analytics_events for insert to authenticated with check (auth.uid() = user_id);
create policy "admin reads analytics" on public.analytics_events for select to authenticated using (public.is_story_admin());

create policy "members read site design" on public.site_settings for select to authenticated using (true);
create policy "admin updates site design" on public.site_settings for insert to authenticated with check (public.is_story_admin());
create policy "admin edits site design" on public.site_settings for update to authenticated using (public.is_story_admin()) with check (public.is_story_admin());
