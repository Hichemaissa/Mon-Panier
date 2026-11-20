-- Mon Panier Informatique / Supabase PostgreSQL
-- Exécuter dans Supabase > SQL Editor. Le rôle administrateur est attribué manuellement.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.products (
  id text primary key,
  category text not null check (category in ('laptops','desktops','accessories')),
  name text not null check (length(name) between 1 and 120),
  specs text not null default '',
  price numeric(12,2) not null check (price >= 0),
  old_price numeric(12,2) check (old_price is null or old_price >= 0),
  badge text not null default '',
  art text not null default 'laptop',
  color text not null default '#ff8b2a',
  glow text not null default '#ffe0b9',
  image_url text,
  image_urls text[] not null default '{}'::text[],
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Existing shops can adopt gallery images without recreating tables.
alter table public.products add column if not exists image_urls text[] not null default '{}'::text[];

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_city text not null,
  customer_address text not null default '',
  notes text not null default '',
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'nouvelle'
    check (status in ('nouvelle','confirmee','expediee','livree','annulee')),
  created_at timestamptz not null default now()
);
create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity between 1 and 99),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  unique(order_id, product_id)
);
create table if not exists public.shop_settings (
  id integer primary key default 1 check(id = 1),
  whatsapp text not null default '213560283892',
  shop_name text not null default 'Mon Panier Informatique'
);
insert into public.shop_settings(id,whatsapp,shop_name)
values(1,'213560283892','Mon Panier Informatique')
on conflict (id) do nothing;

-- Fonction SECURITY DEFINER pour vérifier le rôle, sans boucle RLS.
create or replace function public.is_shop_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
 select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_shop_admin() from public;
grant execute on function public.is_shop_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.shop_settings enable row level security;

drop policy if exists "admin_self_read" on public.admin_users;
create policy "admin_self_read" on public.admin_users for select to authenticated
using (user_id = auth.uid());
drop policy if exists "catalog_read" on public.products;
create policy "catalog_read" on public.products for select to anon, authenticated
using(is_active or public.is_shop_admin());
drop policy if exists "catalog_admin_insert" on public.products;
create policy "catalog_admin_insert" on public.products for insert to authenticated
with check(public.is_shop_admin());
drop policy if exists "catalog_admin_update" on public.products;
create policy "catalog_admin_update" on public.products for update to authenticated
using(public.is_shop_admin()) with check(public.is_shop_admin());
drop policy if exists "catalog_admin_delete" on public.products;
create policy "catalog_admin_delete" on public.products for delete to authenticated
using(public.is_shop_admin());
drop policy if exists "orders_admin" on public.orders;
create policy "orders_admin" on public.orders for all to authenticated
using(public.is_shop_admin()) with check(public.is_shop_admin());
drop policy if exists "order_items_admin" on public.order_items;
create policy "order_items_admin" on public.order_items for all to authenticated
using(public.is_shop_admin()) with check(public.is_shop_admin());
drop policy if exists "settings_read" on public.shop_settings;
create policy "settings_read" on public.shop_settings for select to anon, authenticated using(true);
drop policy if exists "settings_admin" on public.shop_settings;
create policy "settings_admin" on public.shop_settings for update to authenticated
using(public.is_shop_admin()) with check(public.is_shop_admin());

-- Une commande passe exclusivement par la fonction: prix calculés côté serveur.
-- Le stock n'est pas décrémenté avant confirmation manuelle.
create or replace function public.place_order(
 p_customer_name text, p_customer_phone text, p_customer_city text,
 p_customer_address text, p_notes text, p_items jsonb
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
 v_id uuid; v_item jsonb; v_product public.products%rowtype;
 v_product_id text; v_qty integer; v_total numeric(12,2) := 0;
 v_seen text[] := array[]::text[];
begin
 if char_length(trim(coalesce(p_customer_name,''))) not between 2 and 100
  or char_length(trim(coalesce(p_customer_phone,''))) not between 8 and 20
  or char_length(trim(coalesce(p_customer_city,''))) not between 2 and 80
  or char_length(coalesce(p_customer_address,'')) > 250
  or char_length(coalesce(p_notes,'')) > 500
 then raise exception 'Coordonnées invalides'; end if;
 if p_items is null or jsonb_typeof(p_items) <> 'array' then
  raise exception 'Panier invalide'; end if;
 if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 30 then
  raise exception 'Nombre de produits invalide'; end if;
 for v_item in select value from jsonb_array_elements(p_items) loop
   v_product_id := v_item->>'id';
   if v_product_id is null or v_product_id = any(v_seen)
     or coalesce(v_item->>'qty','') !~ '^[0-9]{1,2}$'
   then raise exception 'Article invalide ou dupliqué'; end if;
   v_qty := (v_item->>'qty')::integer;
   if v_qty < 1 or v_qty > 99 then raise exception 'Quantité invalide'; end if;
   select * into v_product from public.products
    where id=v_product_id and is_active=true;
   if not found or v_qty > v_product.stock then
     raise exception 'Produit indisponible ou stock insuffisant'; end if;
   v_seen := array_append(v_seen, v_product_id);
   v_total := v_total + v_qty * v_product.price;
 end loop;
 insert into public.orders(customer_name,customer_phone,customer_city,customer_address,notes,total)
 values(trim(p_customer_name),trim(p_customer_phone),trim(p_customer_city),
        trim(coalesce(p_customer_address,'')),trim(coalesce(p_notes,'')),v_total)
 returning id into v_id;
 for v_item in select value from jsonb_array_elements(p_items) loop
   v_product_id := v_item->>'id'; v_qty := (v_item->>'qty')::integer;
   select * into v_product from public.products where id=v_product_id;
   insert into public.order_items(order_id,product_id,product_name,quantity,unit_price)
   values(v_id, v_product_id, v_product.name, v_qty, v_product.price);
 end loop;
 return v_id;
end; $$;
revoke all on function public.place_order(text,text,text,text,text,jsonb) from public;
grant execute on function public.place_order(text,text,text,text,text,jsonb) to anon, authenticated;

-- Images facultatives. N'utiliser que des URL HTTPS externes ou le bucket public.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "product_images_public" on storage.objects;
create policy "product_images_public" on storage.objects for select to anon, authenticated
using (bucket_id='product-images');
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects for insert to authenticated
with check (bucket_id='product-images' and public.is_shop_admin());
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects for update to authenticated
using (bucket_id='product-images' and public.is_shop_admin())
with check (bucket_id='product-images' and public.is_shop_admin());
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects for delete to authenticated
using (bucket_id='product-images' and public.is_shop_admin());

-- ÉTAPE MANUELLE après avoir créé un utilisateur dans Supabase Authentication:
-- insert into public.admin_users(user_id)
-- select id from auth.users where email = 'VOTRE_EMAIL_ADMIN' on conflict do nothing;
-- NE PAS ajouter de mot de passe ou de clé service_role au dépôt GitHub.
