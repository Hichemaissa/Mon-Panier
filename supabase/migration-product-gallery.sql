-- Mon Panier Informatique: album photo produit (1 image principale + plusieurs vues).
-- À exécuter une seule fois dans Supabase > SQL Editor, avec les droits propriétaire.
-- Aucune commande, aucun produit et aucune photo existante n'est supprimé.
alter table public.products
  add column if not exists image_urls text[] not null default '{}'::text[];

comment on column public.products.image_urls is
  'URLs HTTPS des vues supplémentaires, affichées sous la photo principale dans la fiche produit.';

-- La politique RLS existante sur products protège aussi la nouvelle colonne:
-- lecture publique seulement si is_active, modification réservée aux administrateurs.
