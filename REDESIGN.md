# Livraison de la refonte SLKM

## Interface et recherche

- Palette officielle : bleu `#064B87`, navy `#072D4F`, orange `#FF6B2B`, blanc et fond `#F6F8FB`. Les petites actions orange utilisent un texte navy pour leur contraste.
- Police locale Plus Jakarta Sans conservée, titres fluides, champs tactiles, focus visibles, animations CSS avec réduction des mouvements.
- Accueil recomposé : photographie locale, découverte du réseau immédiatement après le hero, trajets publiés, flotte configurée ou classes présentes dans les lignes, services, accompagnement, Irsaliyat et articles publiés.
- Sur mobile, la photo du hero est séparée du texte ; la recherche précède la carte.
- Explorateur commun à Accueil et Lignes : carte Leaflet/OpenStreetMap, filtres agences/lignes/ensemble, sélection, zoom, popups, recherche et résultats limités à six par affichage.
- Origines et destinations issues uniquement des lignes actives avec agences actives. Regroupement des agences par nom de ville français canonique ; accents et ponctuation conservés. Aucune liste de villes externe.
- Destinations dépendantes du départ, réinitialisation d’une arrivée devenue invalide, inversion uniquement si une ligne inverse existe, filtrage par jours de circulation et classe.
- Paramètres de recherche conservés dans l’URL lors de la recherche et restaurés au rechargement. Les anciens paramètres contenant les identifiants d’agence restent reconnus.
- Informations de réservation WhatsApp : villes, date sélectionnée, départ et classe. Aucune disponibilité de sièges n’est calculée.
- Les liaisons cartographiques sont géographiques et indicatives, explicitement signalées. Aucun trajet routier n’est inventé. Les agences sans coordonnées restent consultables dans la liste.
- Agences : adresses, contacts et lien d’itinéraire réel à partir des coordonnées ou de l’adresse.
- Le titre « trajets à découvrir » évite de présenter une popularité qui n’est pas mesurée dans la base.

## Pages et administration

Les pages de service utilisent le nouveau système commun : photographies moins masquées, proportions plus sobres, cartes harmonisées. Le suivi Irsaliyat valide le numéro avant d’ouvrir la demande WhatsApp existante. Le blog possède une pagination, des images harmonisées et les metadata d’article respectent la langue sélectionnée. La chronologie et les contenus historiques existants sont conservés.

L’onglet **Paramètres & images** permet de modifier les contacts, identités et adresses FR/AR/EN, les réseaux sociaux, les véhicules, leurs images et équipements multilingues, la chronologie et les services B2B. Flotte, chronologie et services disposent de champs de formulaire avec ajout/retrait. Les réseaux sociaux utilisent un objet JSON. Les images doivent utiliser un chemin local ou un hébergement autorisé par `next.config.ts` (Supabase ou Google actuellement).

Les contenus B2B antérieurs servent de valeurs initiales tant qu’aucune liste de services n’est enregistrée. Aucun enregistrement ni seed n’est effectué automatiquement. Les clés existantes de `analytics_config` sont préservées lors de l’enregistrement. La nouvelle action contrôle la session administrateur et reste soumise aux politiques RLS existantes. Les suppressions existantes conservent leurs confirmations ; le retrait des nouveaux éléments est confirmé avant l’enregistrement.

## Base de données

Tables réutilisées : `agencies`, `routes`, `parcel_rates`, `blog_posts`, `corporate_quotes`, `contact_messages`, `site_settings`.

**Aucune migration SQL à appliquer.** Aucun schéma, seed, rôle, politique RLS ni donnée de production n’a été modifié. Les services utilisent une clé facultative `services` dans le JSON existant `site_settings.analytics_config`, aux côtés de `fleet` et `timeline`.

Pour gérer les contenus : se connecter à `/admin`, ouvrir **Paramètres & images**, modifier les champs et enregistrer. Le compte doit porter le rôle administrateur déjà prévu par le projet. Aucune clé privilégiée n’a été ajoutée côté client.

## Fichiers modifiés

Configuration :
- `package.json`
- `tailwind.config.ts`

Pages, layouts et actions :
- `src/app/globals.css`
- `src/app/actions.ts`
- `src/app/(site)/layout.tsx`
- `src/app/(site)/page.tsx`
- `src/app/(site)/lignes/page.tsx`
- `src/app/(site)/irsaliyat/page.tsx`
- `src/app/(site)/services/page.tsx`
- `src/app/(site)/about/page.tsx`
- `src/app/(site)/contact/page.tsx`
- `src/app/(site)/blog/page.tsx`
- `src/app/(site)/blog/[slug]/page.tsx`
- `src/app/admin/page.tsx`

Composants et types :
- `src/components/ui.tsx`
- `src/components/site-header.tsx`
- `src/components/site-footer.tsx`
- `src/components/locale-switcher.tsx`
- `src/components/agency-map.tsx`
- `src/components/agency-card.tsx`
- `src/components/route-card.tsx`
- `src/components/route-search.tsx` (compatibilité vers le nouvel explorateur)
- `src/components/lines-explorer.tsx` (compatibilité vers le nouvel explorateur)
- `src/components/blog-card.tsx`
- `src/components/tracking-form.tsx`
- `src/components/admin/admin-nav.tsx`
- `src/components/admin/admin-shell.tsx`
- `src/lib/types.ts`

Nouveaux fichiers :
- `src/components/transport-network-explorer.tsx`
- `src/components/admin/settings-manager.tsx`
- `src/components/admin/content-list-editor.tsx`
- `src/lib/transport.ts`
- `src/lib/service-content.ts` (contenus de services existants mutualisés)
- `scripts/test-transport.cjs`
- `scripts/smoke-public.cjs`
- `REDESIGN.md`

La suppression de `.env.example` et les modifications de `package-lock.json` étaient présentes avant cette intervention ; elles n’ont pas été modifiées.

## Validation

Commandes exécutées :

```powershell
npm.cmd run test:transport
npx.cmd tsc --noEmit --incremental false
npm.cmd run build
git diff --check
```

- 14 assertions de recherche passent : données actives, sens, absence de retour implicite, doublons de villes, Unicode, calendrier, classes, données vides et paramètres historiques.
- TypeScript passe.
- Compilation de production réussie avec accès réseau. La première compilation restreinte avait signalé des accès Supabase impossibles ; la compilation avec réseau n’a pas reproduit ces erreurs.
- Aucun script `lint` autonome n’est défini dans le projet. Le contrôle de types intégré à Next.js a également été exécuté.
- Contrôles HTTP en lecture seule sur le serveur de production local : 18 contrôles réussis, comprenant pages publiques, article publié, robots/sitemap, langues FR/AR/EN, attributs RTL/LTR et redirection de l’administration sans session.

Pour rejouer les contrôles HTTP :

```powershell
# Terminal 1, après compilation
npm.cmd run start -- --hostname 127.0.0.1 --port 3000
# Terminal 2
node scripts/smoke-public.cjs
```

## Limites de vérification

- Le pilotage du navigateur Windows a été interrompu par l’outil, qui ne pouvait pas identifier son URL avec assez de certitude. Les contrôles visuels et tactiles aux largeurs 320, 375, 390, 430, 768, 1024 et 1440 px ne sont donc pas certifiés. Les vérifications HTTP ne remplacent pas ces contrôles.
- Aucun envoi de formulaire, réservation WhatsApp ou changement de contenu en production n’a été effectué pendant les tests. Les actions et leur persistance nécessitent une recette avec un compte admin et des données de test autorisées.
- Le suivi de colis reste un échange avec l’équipe sur WhatsApp : aucune table de statuts de colis n’existe dans le schéma inspecté.
- Le fond de carte dépend du réseau OpenStreetMap ; un message d’erreur est prévu et la liste reste utilisable.
- Les photographies locales sont conservées ; plusieurs images sources, dont le hero, ont une faible résolution. Des originaux plus grands permettront d’améliorer leur netteté sur grand écran.
