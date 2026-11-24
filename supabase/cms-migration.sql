-- Mon Panier: extensible CMS schema (run AFTER supabase/schema.sql).
-- Backwards compatible: keep products.category text while introducing category_id.
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(trim(name)) between 1 and 100),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 description text not null default '',
 image_url text,
 parent_id uuid references public.categories(id) on delete set null,
 sort_order integer not null default 0,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
create index if not exists categories_parent_sort_idx on public.categories(parent_id, sort_order);
insert into public.categories(name, slug, sort_order) values
 ('PC portables','laptops',10),('PC de bureau','desktops',20),('Écrans','screens',30),('Imprimantes','printers',40),('Accessoires','accessories',50)
on conflict (slug) do nothing;

-- Preserve every existing product category before enabling the synchronization trigger.
insert into public.categories(name, slug, sort_order)
select distinct left(initcap(replace(category, '-', ' ')),100), category, 100
from public.products where category ~ '^[a-z0-9]+(-[a-z0-9]+)*

alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
update public.products p set category_id = c.id from public.categories c
 where p.category_id is null and p.category = c.slug;

-- Previously category had a fixed CHECK list. Remove it so any new category slug can be assigned.
do $$ declare con record; begin
 for con in select conname from pg_constraint
   where conrelid = 'public.products'::regclass and contype = 'c'
   and pg_get_constraintdef(oid) like '%category%' loop
  execute format('alter table public.products drop constraint %I', con.conname);
 end loop;
end $$;
create index if not exists products_category_id_idx on public.products(category_id);
-- category text is retained for compatibility with the existing storefront and admin scripts.
-- A trigger keeps the legacy text slug consistent with category_id.
create or replace function public.sync_product_category() returns trigger
language plpgsql set search_path = '' as $$
declare v_category public.categories%rowtype;
begin
 -- On legacy admin edits the slug changes while category_id still points to the old category.
 if tg_op = 'UPDATE' and new.category is distinct from old.category
    and new.category_id is not distinct from old.category_id then
  select * into v_category from public.categories where slug = new.category;
  if not found then raise exception 'Unknown category slug'; end if;
  new.category_id := v_category.id;
 elsif new.category_id is not null then
  select * into v_category from public.categories where id = new.category_id;
  if not found then raise exception 'Unknown category'; end if;
  new.category := v_category.slug;
 elsif new.category is not null then
  select * into v_category from public.categories where slug = new.category;
  if not found then raise exception 'Unknown category slug'; end if;
  new.category_id := v_category.id;
 end if;
 return new;
end $$;
drop trigger if exists sync_product_category_trigger on public.products;
create trigger sync_product_category_trigger before insert or update of category, category_id
on public.products for each row execute function public.sync_product_category();

create table if not exists public.site_pages (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(trim(title)) between 1 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 content text not null default '',
 seo_title text not null default '',
 seo_description text not null default '',
 is_published boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.site_banners (
 id uuid primary key default gen_random_uuid(),
 title text not null default '',
 subtitle text not null default '',
 image_url text,
 link_url text,
 sort_order integer not null default 0,
 is_active boolean not null default true
);
create table if not exists public.navigation_items (
 id uuid primary key default gen_random_uuid(),
 label text not null check (char_length(trim(label)) between 1 and 80),
 href text not null,
 sort_order integer not null default 0,
 is_active boolean not null default true
);
alter table public.categories enable row level security;
-- Explicit API privileges; row-level policies still enforce administrative writes.
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
alter table public.site_pages enable row level security;
alter table public.site_banners enable row level security;
alter table public.navigation_items enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon,authenticated
 using (is_active or public.is_shop_admin());
drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists pages_public_read on public.site_pages;
create policy pages_public_read on public.site_pages for select to anon,authenticated
 using (is_published or public.is_shop_admin());
drop policy if exists pages_admin_all on public.site_pages;
create policy pages_admin_all on public.site_pages for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists banners_public_read on public.site_banners;
create policy banners_public_read on public.site_banners for select to anon,authenticated
 using (is_active or public.is_shop_admin());
drop policy if exists banners_admin_all on public.site_banners;
create policy banners_admin_all on public.site_banners for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists navigation_public_read on public.navigation_items;
create policy navigation_public_read on public.navigation_items for select to anon,authenticated
 using (is_active or public.is_shop_admin());
drop policy if exists navigation_admin_all on public.navigation_items;
create policy navigation_admin_all on public.navigation_items for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());

-- IMPORTANT: apply migration in Supabase SQL Editor then update admin.html and
-- storefront scripts to use these tables. Adding tables alone doesn't activate UI.

on conflict (slug) do nothing;

alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;
update public.products p set category_id = c.id from public.categories c
 where p.category_id is null and p.category = c.slug;

-- Previously category had a fixed CHECK list. Remove it so any new category slug can be assigned.
do $$ declare con record; begin
 for con in select conname from pg_constraint
   where conrelid = 'public.products'::regclass and contype = 'c'
   and pg_get_constraintdef(oid) like '%category%' loop
  execute format('alter table public.products drop constraint %I', con.conname);
 end loop;
end $$;
create index if not exists products_category_id_idx on public.products(category_id);
-- category text is retained for compatibility with the existing storefront and admin scripts.
-- A trigger keeps the legacy text slug consistent with category_id.
create or replace function public.sync_product_category() returns trigger
language plpgsql set search_path = '' as $$
declare v_category public.categories%rowtype;
begin
 -- On legacy admin edits the slug changes while category_id still points to the old category.
 if tg_op = 'UPDATE' and new.category is distinct from old.category
    and new.category_id is not distinct from old.category_id then
  select * into v_category from public.categories where slug = new.category;
  if not found then raise exception 'Unknown category slug'; end if;
  new.category_id := v_category.id;
 elsif new.category_id is not null then
  select * into v_category from public.categories where id = new.category_id;
  if not found then raise exception 'Unknown category'; end if;
  new.category := v_category.slug;
 elsif new.category is not null then
  select * into v_category from public.categories where slug = new.category;
  if not found then raise exception 'Unknown category slug'; end if;
  new.category_id := v_category.id;
 end if;
 return new;
end $$;
drop trigger if exists sync_product_category_trigger on public.products;
create trigger sync_product_category_trigger before insert or update of category, category_id
on public.products for each row execute function public.sync_product_category();

create table if not exists public.site_pages (
 id uuid primary key default gen_random_uuid(),
 title text not null check (char_length(trim(title)) between 1 and 160),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 content text not null default '',
 seo_title text not null default '',
 seo_description text not null default '',
 is_published boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.site_banners (
 id uuid primary key default gen_random_uuid(),
 title text not null default '',
 subtitle text not null default '',
 image_url text,
 link_url text,
 sort_order integer not null default 0,
 is_active boolean not null default true
);
create table if not exists public.navigation_items (
 id uuid primary key default gen_random_uuid(),
 label text not null check (char_length(trim(label)) between 1 and 80),
 href text not null,
 sort_order integer not null default 0,
 is_active boolean not null default true
);
alter table public.categories enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_banners enable row level security;
alter table public.navigation_items enable row level security;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon,authenticated
 using (is_active or public.is_shop_admin());
drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all on public.categories for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists pages_public_read on public.site_pages;
create policy pages_public_read on public.site_pages for select to anon,authenticated
 using (is_published or public.is_shop_admin());
drop policy if exists pages_admin_all on public.site_pages;
create policy pages_admin_all on public.site_pages for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists banners_public_read on public.site_banners;
create policy banners_public_read on public.site_banners for select to anon,authenticated
 using (is_active or public.is_shop_admin());
drop policy if exists banners_admin_all on public.site_banners;
create policy banners_admin_all on public.site_banners for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());
drop policy if exists navigation_public_read on public.navigation_items;
create policy navigation_public_read on public.navigation_items for select to anon,authenticated
 using (is_active or public.is_shop_admin());
drop policy if exists navigation_admin_all on public.navigation_items;
create policy navigation_admin_all on public.navigation_items for all to authenticated
 using (public.is_shop_admin()) with check (public.is_shop_admin());

-- IMPORTANT: apply migration in Supabase SQL Editor then update admin.html and
-- storefront scripts to use these tables. Adding tables alone doesn't activate UI.
