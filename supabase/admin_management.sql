-- VIRAJ JEWELLERS ADMIN MANAGEMENT SETUP
-- Run this in Supabase SQL Editor AFTER confirming your existing tables.

-- 1) Secure admin roles
create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager')),
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;

drop policy if exists "Admins can read their own role" on public.admin_roles;
create policy "Admins can read their own role"
on public.admin_roles for select
to authenticated
using (auth.uid() = user_id);

-- 2) Public catalogue reads
drop policy if exists "Public can view categories" on public.categories;
create policy "Public can view categories"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Public can view products" on public.products;
create policy "Public can view products"
on public.products for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can view product images" on public.product_images;
create policy "Public can view product images"
on public.product_images for select
to anon, authenticated
using (true);

drop policy if exists "Public can view gold rates" on public.gold_rates;
create policy "Public can view gold rates"
on public.gold_rates for select
to anon, authenticated
using (true);

-- 3) Admin write policies
drop policy if exists "Managers can insert products" on public.products;
create policy "Managers can insert products"
on public.products for insert
to authenticated
with check (
  exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager'))
);

drop policy if exists "Managers can update products" on public.products;
create policy "Managers can update products"
on public.products for update
to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')))
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can delete products" on public.products;
create policy "Managers can delete products"
on public.products for delete
to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can insert categories" on public.categories;
create policy "Managers can insert categories"
on public.categories for insert to authenticated
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can update categories" on public.categories;
create policy "Managers can update categories"
on public.categories for update to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')))
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can delete categories" on public.categories;
create policy "Managers can delete categories"
on public.categories for delete to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can insert product images" on public.product_images;
create policy "Managers can insert product images"
on public.product_images for insert to authenticated
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can update product images" on public.product_images;
create policy "Managers can update product images"
on public.product_images for update to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')))
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can delete product images" on public.product_images;
create policy "Managers can delete product images"
on public.product_images for delete to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

-- 4) ONLY OWNER can insert/update/delete metal rates
drop policy if exists "Owner can insert rates" on public.gold_rates;
create policy "Owner can insert rates"
on public.gold_rates for insert to authenticated
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role = 'owner'));

drop policy if exists "Owner can update rates" on public.gold_rates;
create policy "Owner can update rates"
on public.gold_rates for update to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role = 'owner'))
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role = 'owner'));

drop policy if exists "Owner can delete rates" on public.gold_rates;
create policy "Owner can delete rates"
on public.gold_rates for delete to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role = 'owner'));

-- 5) Storage bucket for product photos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Managers can upload product images" on storage.objects;
create policy "Managers can upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager'))
);

drop policy if exists "Managers can update product images storage" on storage.objects;
create policy "Managers can update product images storage"
on storage.objects for update to authenticated
using (bucket_id = 'product-images' and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')))
with check (bucket_id = 'product-images' and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can delete product images storage" on storage.objects;
create policy "Managers can delete product images storage"
on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Public can view product image files" on storage.objects;
create policy "Public can view product image files"
on storage.objects for select to anon, authenticated
using (bucket_id = 'product-images');

-- 6) Assign the owner's existing Supabase Auth user.
-- Replace the UUID below with the owner's Auth user id.
-- insert into public.admin_roles (user_id, role)
-- values ('OWNER-AUTH-USER-UUID-HERE', 'owner')
-- on conflict (user_id) do update set role = 'owner';

-- 7) Homepage photos/videos managed from one Admin Dashboard option
create table if not exists public.homepage_media (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('photo','video')),
  title text,
  subtitle text,
  media_url text not null,
  link_url text default '/category',
  display_order integer not null default 1,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_media enable row level security;

drop policy if exists "Public can view published homepage media" on public.homepage_media;
create policy "Public can view published homepage media"
on public.homepage_media for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Managers can insert homepage media" on public.homepage_media;
create policy "Managers can insert homepage media"
on public.homepage_media for insert
to authenticated
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can update homepage media" on public.homepage_media;
create policy "Managers can update homepage media"
on public.homepage_media for update
to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')))
with check (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can delete homepage media" on public.homepage_media;
create policy "Managers can delete homepage media"
on public.homepage_media for delete
to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

insert into storage.buckets (id, name, public)
values ('homepage-media', 'homepage-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Managers can upload homepage media" on storage.objects;
create policy "Managers can upload homepage media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'homepage-media'
  and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager'))
);

drop policy if exists "Managers can update homepage media storage" on storage.objects;
create policy "Managers can update homepage media storage"
on storage.objects for update to authenticated
using (bucket_id = 'homepage-media' and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')))
with check (bucket_id = 'homepage-media' and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Managers can delete homepage media storage" on storage.objects;
create policy "Managers can delete homepage media storage"
on storage.objects for delete to authenticated
using (bucket_id = 'homepage-media' and exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));

drop policy if exists "Public can view homepage media files" on storage.objects;
create policy "Public can view homepage media files"
on storage.objects for select to anon, authenticated
using (bucket_id = 'homepage-media');

-- 9) HOMEPAGE MANAGER V2: organise media by homepage area and slot
alter table public.homepage_media
  add column if not exists content_area text not null default 'hero',
  add column if not exists media_key text;

alter table public.homepage_media drop constraint if exists homepage_media_content_area_check;
alter table public.homepage_media
  add constraint homepage_media_content_area_check
  check (content_area in ('hero','category','tile','campaign'));

create index if not exists homepage_media_area_order_idx
on public.homepage_media (content_area, display_order);

-- 8) Upgrade Homepage Manager: one table controls hero, tiles, campaign and category images.
alter table public.homepage_media
  add column if not exists placement text not null default 'hero',
  add column if not exists target_key text,
  add column if not exists eyebrow text;

-- Keep old rows working as hero slides. New valid placements are enforced when supported.
alter table public.homepage_media drop constraint if exists homepage_media_placement_check;
alter table public.homepage_media
  add constraint homepage_media_placement_check
  check (placement in ('hero','editorial','campaign','category'));

create index if not exists homepage_media_placement_order_idx
  on public.homepage_media (placement, is_published, display_order);

-- Allow owners/managers to see all homepage items, including hidden drafts.
drop policy if exists "Managers can view all homepage media" on public.homepage_media;
create policy "Managers can view all homepage media"
on public.homepage_media for select
to authenticated
using (exists (select 1 from public.admin_roles r where r.user_id = auth.uid() and r.role in ('owner','manager')));
