# Réseau Messagerie — installation

## Appliquer la migration

1. Dans le projet Supabase existant, ouvrir **SQL Editor → New query**.
2. Copier l’intégralité de `supabase/migrations/20261030180000_messagerie_network.sql`.
3. Exécuter cette requête, puis vérifier l’absence d’erreurs.
4. Se connecter à `/admin?tab=messagerie` avec un compte dont `app_metadata.role` vaut `admin`.
5. Enregistrer les titres FR/AR/EN, les descriptions, l’URL de l’image et la visibilité du réseau.
6. Ajouter les agences Messagerie : soit sélectionner une agence existante, soit renseigner une agence indépendante. Enregistrer ses horaires, son ordre et son statut.
7. Contrôler l’aperçu enregistré puis `/irsaliyat`.

La migration n’a pas été exécutée à distance. Elle réutilise `public.is_admin()` et `public.set_updated_at()` du schéma existant. Elle crée uniquement deux tables, leurs index, contraintes, triggers et politiques RLS. Aucun contenu métier ou agence n’est inséré automatiquement.

## Données et sécurité

- `messagerie_network_settings` : un paramétrage unique, textes multilingues, URL de carte, visibilité.
- `messagerie_agencies` : rattachement facultatif à `agencies`, ou données indépendantes multilingues ; horaires, statut et ordre.
- Une agence liée garde son identité et ses contacts dans `agencies`. La contrainte SQL interdit de recopier ces champs dans la fiche Messagerie liée. Un index unique empêche le double rattachement.
- Une agence source inactive n’est pas publiée. Supprimer une fiche Messagerie ne supprime jamais l’agence source. La clé étrangère bloque la suppression d’une agence source encore référencée.
- Les villes desservies sont déduites des fiches Messagerie actives ; aucune table de destinations supplémentaire n’est nécessaire. Ajouter, modifier ou désactiver une agence gère les villes affichées.
- Lecture publique des seules fiches actives ; écritures réservées à `public.is_admin()`. Les nouvelles actions vérifient aussi la session via `auth.getUser()` et le rôle serveur. Aucune clé service_role ni identifiant d’admin fourni par le client.
- Les erreurs de migration absente ou de connexion donnent un état neutre sur la page et un message explicite dans l’administration.
- Aucune modification des politiques existantes ou des autres tables.

## Image

Aucune image de référence correspondant au réseau complet n’a été trouvée. Les deux images locales de carte concernent seulement Agadir/Inezgane ; elles n’ont pas été utilisées comme réseau national. Aucun tracé, ville ou délai n’a été inventé.

Le dashboard existant ne dispose pas de composant de téléversement. La gestion se fait donc par URL HTTPS de confiance (par exemple une image déjà hébergée) ou chemin local `/images/...`. Aucun nouveau bucket ni permission de stockage n’est nécessaire. L’image utilise `next/image` en mode non optimisé pour accepter une URL HTTPS administrée sans modifier la configuration globale des domaines. Elle n’est jamais recadrée : `object-contain` dans la page et dans la fenêtre agrandie. La fenêtre native `dialog` isole le focus, propose un bouton de fermeture, se ferme avec Échap et restitue le focus au bouton d’ouverture.

## Fichiers de cette intégration

Créés :
- `supabase/migrations/20261030180000_messagerie_network.sql`
- `src/lib/messagerie.ts`
- `src/app/messagerie-actions.ts`
- `src/components/messagerie-map-image.tsx`
- `src/components/messagerie-network-section.tsx` (cartes d’agences incluses)
- `src/components/admin/messagerie-network-manager.tsx`
- `MESSAGERIE.md`
- `scripts/test-messagerie.cjs`

Modifiés :
- `src/app/(site)/irsaliyat/page.tsx` : chargement et section après le hero/suivi.
- `src/app/admin/page.tsx` : onglet Messagerie.
- `src/components/admin/admin-nav.tsx` : accès à l’onglet.

Le reste du design, le suivi, les tarifs, les requêtes et actions antérieures sont conservés.

## Recette après migration

Validation locale exécutée : `npx.cmd tsc --noEmit --incremental false`, `npm.cmd run build`, `git diff --check` et `node scripts/test-messagerie.cjs` (12 assertions de rendu réussies). Aucun script lint autonome n’est défini dans ce projet. Les assertions couvrent les données actives, les identités liées, les trois langues, la section désactivée, `object-contain` et la structure accessible de la fenêtre ; elles ne remplacent pas un test clavier dans un navigateur.

- Sans session, vérifier l’impossibilité de créer/modifier/supprimer les deux tables avec la clé publique.
- Avec une session non administrateur, vérifier les mêmes interdictions.
- Avec un administrateur, enregistrer la carte et une fiche réelle, puis modifier ordre, horaires, ville et statut.
- Vérifier qu’une fiche inactive et une agence liée inactive n’apparaissent pas publiquement ; vérifier qu’un second rattachement identique échoue.
- Vérifier qu’une section désactivée disparaît, puis la réactiver.
- Contrôler les langues FR/AR/EN, le filtre de ville et la fenêtre d’image au clavier.
- Tester à 390, 768 et 1440 px : carte intégralement visible, cartes en une colonne sur mobile, aucun débordement horizontal.

Ces tests d’écriture et de politiques RLS nécessitent la migration et une session autorisée ; ils n’ont pas été exécutés sur la base distante. Aucun contrôle visuel de navigateur n’a été effectué pendant cette intégration.
