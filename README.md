# Mon Panier Informatique — Supabase & administration (branche de développement)

Cette branche contient un catalogue relié à Supabase PostgreSQL, un panneau d'administration en français, la gestion du stock, le suivi des commandes (sans paiement en ligne), l'upload d'images et des politiques de sécurité RLS.

## Fichiers
- \`index.html\` : vitrine publique ; se synchronise automatiquement avec le catalogue Supabase une fois configuré.
- \`admin.html\` : accès administrateur, gestion du catalogue, stock, commandes et coordonnées.
- \`supabase/schema.sql\` : tables, accès RLS, bucket d'images et fonction sécurisée de prise de commande.
- \`supabase/config.js\` : configuration publique de la connexion ; actuellement vide.
- \`supabase/storefront.js\` : catalogue public et prise de commande.

## Activation pas à pas (obligatoire avant l'utilisation réelle)
1. Créer un projet sur https://supabase.com/dashboard ; noter son **Project URL** et sa clé **publishable/anon** (publique).
2. Dans Supabase > SQL Editor, exécuter le fichier \`supabase/schema.sql\`. Aucune table distante n'existe avant cette étape.
3. Dans Authentication > Users, créer un utilisateur administrateur avec e-mail et mot de passe forts. **Ne jamais mettre le mot de passe dans le dépôt GitHub**.
4. Dans Supabase > SQL Editor, exécuter après remplacement de l'adresse :
   \`\`\`sql
   insert into public.admin_users(user_id)
   select id from auth.users where email = 'VOTRE_EMAIL_ADMIN'
   on conflict do nothing;
   \`\`\`
5. Remplir \`supabase/config.js\` avec le Project URL et la clé publique publishable/anon. **Ne jamais publier la service_role key ni un secret**.
6. Ouvrir \`admin.html\`, se connecter et créer vos véritables produits (les exemples de démonstration ne sont pas importés). Ajuster le numéro WhatsApp.
7. Vérifier un parcours complet sur un environnement de test : ajout d'un produit, ouverture du catalogue public, panier, commande, confirmation dans l'administration, changement de statut, stock et export CSV.
8. Tester les permissions RLS : sans connexion admin, impossible de modifier le stock, les prix et les commandes.

## Sécurité et mise en production
- Les prix de commande sont recalculés côté serveur avec la fonction \`place_order\`, jamais pris depuis le navigateur.
- Le stock est vérifié lors de la demande mais **n'est pas réservé ni décrémenté** ; confirmer manuellement avant expédition.
- Aucune commande n'est payée en ligne : le total enregistré ne prouve pas une vente encaissée.
- Ajouter une protection contre le spam et les requêtes abusives (rate limiting / CAPTCHA vérifié côté serveur), sauvegardes, monitoring et conformité confidentialité avant commercialisation.
- La page admin est protégée par Supabase Auth + RLS, pas par une simple URL masquée.
- Ne pas remplacer la branche principale tant que le projet Supabase, les identifiants et les tests n'ont pas été configurés.

## Sans Supabase
Lorsque \`supabase/config.js\` est vide, la vitrine reste en mode démo local. La page \`admin.html\` affiche alors les étapes de configuration : **aucun stockage distant n'est actif**.

## Déploiement
Site statique possible sur Hostinger, Cloudflare Pages, Netlify ou GitHub Pages (avec HTTPS). Pour le test GitHub Pages de cette branche, la racine d'hébergement dépend de la configuration du dépôt. Le projet Supabase reste distinct de l'hébergement du site.
