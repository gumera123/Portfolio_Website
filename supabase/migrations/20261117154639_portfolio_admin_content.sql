grant usage on schema public to anon, authenticated;

create table public.portfolio_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.portfolio_admins enable row level security;
revoke all on table public.portfolio_admins from public, anon, authenticated;
grant select on table public.portfolio_admins to authenticated;

create policy "Admins can view their own admin record"
on public.portfolio_admins
for select
to authenticated
using ((select auth.uid()) = user_id);

create table public.portfolio_content (
  id smallint primary key check (id = 1),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
revoke all on table public.portfolio_content from public, anon, authenticated;
grant select on table public.portfolio_content to anon, authenticated;
grant insert, update on table public.portfolio_content to authenticated;

create policy "Anyone can read portfolio content"
on public.portfolio_content
for select
to anon, authenticated
using (true);

create policy "Portfolio admins can create content"
on public.portfolio_content
for insert
to authenticated
with check (
  exists (
    select 1
    from public.portfolio_admins as admins
    where admins.user_id = (select auth.uid())
  )
);

create policy "Portfolio admins can update content"
on public.portfolio_content
for update
to authenticated
using (
  exists (
    select 1
    from public.portfolio_admins as admins
    where admins.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.portfolio_admins as admins
    where admins.user_id = (select auth.uid())
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Portfolio admins can upload assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'portfolio-assets'
  and exists (
    select 1
    from public.portfolio_admins as admins
    where admins.user_id = (select auth.uid())
  )
);