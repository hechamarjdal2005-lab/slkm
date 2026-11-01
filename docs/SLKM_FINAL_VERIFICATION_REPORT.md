> Historique : les anciens paquets SQL cités ci-dessous ont été archivés. La seule procédure active est [FINAL_DATABASE](../supabase/FINAL_DATABASE/README.md).

# SLKM — rapport final de vérification

Date : 31 octobre 2026. Changements effectués dans le dépôt existant, sans refonte du design, sans suppression de données ni remplacement des anciens SQL. Le dépôt avait déjà des modifications importantes avant cette intervention : ce rapport ne les attribue pas toutes à cet audit.

**Le code et le package SQL sont préparés, mais l’application n’est pas certifiée opérationnelle avec Supabase distant.** Le projet configuré renvoie `404 / PGRST205` pour les treize tables via des lectures anonymes `limit=0`. Les catalogues SQL et une session admin ne sont pas accessibles depuis les identifiants fournis. Aucune migration ni écriture distante n’a été effectuée. Les pages publiques testées utilisent leurs contenus de secours ; cela n’est pas une preuve de synchronisation CMS.

## Résultats de l’audit et corrections

Le détail des problèmes, sévérités et fichiers est dans `SLKM_FULL_AUDIT.md`. Les causes principales sont le socle SQL placé hors des migrations, l’absence de réparation des colonnes par `CREATE TABLE IF NOT EXISTS`, l’ancien ALTER sur une table système Storage, les politiques historiques d’upload trop larges et les dépendances non explicitées. L’échec `column "city_fr" does not exist` a été reproduit sur une base PostgreSQL locale partielle. Les erreurs SQL Editor originales de l’utilisateur n’étant pas fournies, aucune autre erreur distante n’est inventée.

Les ajouts/réparations comprennent : navigation FR/AR/EN avec ordre et visibilité par emplacement ; CTA interne protégé ; huit références de logos/icônes/partage ; signature et accent ; favicon par metadata ; manifeste dynamique ; statistiques éditables ; ordre agences/lignes ; dépublication des tarifs ; photo, position et agents de service Messagerie ; médiathèque pour sa carte ; textes Contact/Devis reliés au CMS ; vérification des lignes réellement affectées ; avertissements de lecture admin ; cache explicite ; validations et références médias renforcées. Le catalogue contient 249 entrées éditoriales trilingues dans neuf périmètres. `SLKM_CMS_COVERAGE.md` et `SLKM_REPOSITORY_INVENTORY.json` donnent l’inventaire détaillé.

PostCSS a été mis à jour en 8.5.32, avec override pour la copie utilisée par Next.js. La version majeure Next.js est conservée. L’installation npm après correction signale zéro vulnérabilité. Les dépendances PGlite et Playwright sont désormais déclarées pour rendre les tests reproductibles.

## Matrice CMS et synchronisation

`IMPLEMENTED BUT NOT LIVE-TESTED` signifie que le chemin formulaire → action → schéma est présent et que des validations/tests locaux existent, mais qu’aucun aller-retour d’écriture distant authentifié n’a été vérifié. Le statut ne signifie pas que la sauvegarde fonctionne déjà sur le projet Supabase actuellement configuré.

| Public feature | Admin page | Database table | CRUD status | Verified |
|---|---|---|---|---|
| Nom, adresses, téléphones, WhatsApp, réseaux sociaux | `/admin?tab=settings` | `site_settings` | Lecture/mise à jour singleton ; listes persistantes | IMPLEMENTED BUT NOT LIVE-TESTED |
| Logos clair/sombre/mobile, favicon, Apple, PWA, partage, signature et couleurs | `/admin?tab=design`, `media` | `site_settings.presentation`, `site_media_assets` | Upload, aperçu, remplacement, restauration ; publication média | IMPLEMENTED BUT NOT LIVE-TESTED |
| En-tête, drawer, barre mobile, footer, CTA | `/admin?tab=design` | `site_settings.navigation` | Traduction, ordre, visibilité par emplacement ; routes protégées | IMPLEMENTED BUT NOT LIVE-TESTED |
| Accueil : héros, cartes, services, étapes, bannières et CTA | `/admin?tab=cms` → Accueil | `site_pages`, `site_sections`, `site_page_media` | Édition FR/AR/EN, sections personnalisées CRUD, ordre/publication | IMPLEMENTED BUT NOT LIVE-TESTED |
| Titres/SEO/sections Lignes & agences | `/admin?tab=cms` → Lignes | mêmes tables CMS | Édition, publication et ordre sections | IMPLEMENTED BUT NOT LIVE-TESTED |
| Agences : villes, adresses, contacts, photo, position | `/admin?tab=agencies` | `agencies` | CRUD, actif, ordre ; FK protègent agences référencées | IMPLEMENTED BUT NOT LIVE-TESTED |
| Lignes : origine/destination, prix, horaires, jours, classe | `/admin?tab=routes` | `routes` | CRUD, actif, ordre | IMPLEMENTED BUT NOT LIVE-TESTED |
| Messageries : textes de page, services, CTA | `/admin?tab=cms` → Messageries | tables CMS | Édition trilingue, sections/images/CTA | IMPLEMENTED BUT NOT LIVE-TESTED |
| Réseau et carte Messagerie | `/admin?tab=messagerie` | `messagerie_network_settings` | Upsert singleton, image, visibilité | IMPLEMENTED BUT NOT LIVE-TESTED |
| Agences et agents de service Messagerie | `/admin?tab=messagerie` | `messagerie_agencies`, `agents` JSON intégré | CRUD agence/liste agents, traductions, photo/position, actif et ordre | IMPLEMENTED BUT NOT LIVE-TESTED |
| Tarifs colis | `/admin?tab=rates` | `parcel_rates` | CRUD, publier/masquer | IMPLEMENTED BUT NOT LIVE-TESTED |
| Personnel : héros, descriptions, offres, caractéristiques et CTA | `/admin?tab=cms` → Services + `settings` | CMS + `site_settings.analytics_config.services/fleet` | Édition, listes CRUD/ordre/actif, images | IMPLEMENTED BUT NOT LIVE-TESTED |
| Formulaire devis et suivi administratif | `/admin?tab=quotes`, textes dans CMS Services | `corporate_quotes`, CMS | Insertion publique ; lecture/statuts/suppression admin | IMPLEMENTED BUT NOT LIVE-TESTED |
| Histoire, mission, valeurs, photos, chronologie, statistiques | `/admin?tab=cms` → Histoire + `settings` | CMS + `site_settings.analytics_config.timeline/stats` | Édition, listes CRUD/ordre/actif | IMPLEMENTED BUT NOT LIVE-TESTED |
| Contact : textes, coordonnées et formulaire | `/admin?tab=cms` → Contact + `settings`, `messages` | CMS, `site_settings`, `contact_messages` | Paramètres ; insertion publique ; lecture/statuts/suppression admin | IMPLEMENTED BUT NOT LIVE-TESTED |
| Footer et textes globaux | `/admin?tab=cms` → Pied de page + `design/settings` | CMS global, `site_settings` | Texte/image/contact/liens configurables | IMPLEMENTED BUT NOT LIVE-TESTED |
| Blog, articles et gabarit SEO | `/admin?tab=blog`, `cms` → Blog/Article | `blog_posts`, CMS | CRUD, publication et traductions | IMPLEMENTED BUT NOT LIVE-TESTED |
| Médiathèque partagée | `/admin?tab=media` | `site_media_assets`, Storage `site-media` | Upload/publication/métadonnées/suppression protégée | IMPLEMENTED BUT NOT LIVE-TESTED |
| Compilation, rendu de secours des routes et langues | sans objet | aucune écriture | TypeScript/build/tests de lecture | VERIFIED |
| Persistance réelle admin, Storage hébergé et politiques réelles | toutes les pages admin | schéma distant à inspecter | `PGRST205`, absence de session admin et de migration approuvée | BLOCKED |

## Chaînes de lecture, mutation et invalidation

| Composants publics | Fetch | Formulaire / mutation | Validation / autorisation | Cache |
|---|---|---|---|---|
| Pages site, `CmsPage`, client provider, formulaires | `getPageCMS/getPublicCMS`, `getCMSMetadata` | `CMSManager` → `saveCMSPage` → `save_site_cms_page`; actions sections | `cms-validation.ts`, catalogue des champs, admin `getUser` + RLS | Lecture no-store ; `revalidatePath('/', 'layout')`, `/admin` |
| Header/footer, metadata/manifeste | `getSiteSettings`, `presentation`, `navigation` | `ThemeEditor`, `NavigationManager` → `saveCMSTheme/saveNavigation` | assets publiés, URLs/couleurs/polices, routes internes autorisées, admin + RLS | no-store et invalidation layout ; manifeste dynamique |
| Header/footer/Contact, flotte/offres/chronologie/statistiques | `getSiteSettings` | `SettingsManager`/listes → `updateSiteSettings` | validation serveur du JSON, URLs et traductions, admin + RLS | invalidation layout et admin |
| Réseau voyageurs, cartes, `AgencyCard/RouteCard` | `getAgencies/getRoutes` | managers → `upsertAgency/upsertRoute`, suppressions | coordonnées/prix/classes/jours/ordre + contraintes/FK, admin + RLS | lectures no-store ; invalidation layout/admin |
| Réseau Messagerie, carte, contacts agents | `getMessagerieNetwork` | manager → `saveMessagerieSettings/saveMessagerieAgency/deleteMessagerieAgency` | agence source, ordre, coordonnées, agents publics, URL ; admin + RLS | invalide `/irsaliyat` et `/admin` |
| Tarifs et blog | `getParcelRates/getBlogPosts/getBlogPostBySlug` | managers → actions `upsert/deleteParcelRate`, `upsert/deleteBlogPost` | prix/poids, slug, traductions, URL, admin + RLS | no-store ; invalidation layout/admin |
| Formulaires Contact/Devis et boîtes admin | actions serveur + `getAdminSnapshot` | `submitContactMessage/submitCorporateQuote`, actions statuts/suppression | champs/tailles/types, statuts publics imposés ; admin pour lecture et traitement | invalide admin ; demandes privées non affichées publiquement |
| Tous les assets CMS | `/media/[id]`, API admin médias | `uploadCMSMedia/updateCMSMedia/deleteCMSMedia` | signature MIME, taille, publication, autorisation, références/FK | nouvelle URL UUID, redirection signée courte, no-store |

Les widgets conservent leurs états React de saisie ; les boutons Enregistrer appellent des mutations Supabase. Aucune persistance distante n’est déduite du seul changement de cet état.

## Base de données et package livré

Tables réellement référencées : `agencies`, `routes`, `parcel_rates`, `corporate_quotes`, `contact_messages`, `blog_posts`, `site_settings`, `messagerie_network_settings`, `messagerie_agencies`, `site_pages`, `site_sections`, `site_media_assets`, `site_page_media`. La liste d’agents utilise la colonne JSON de l’agence, sans table parallèle inventée. Les tables `storage.buckets` et `storage.objects` appartiennent à Supabase. Les types applicatifs ont été mis à jour pour les nouveaux champs ; des types générés depuis la base distante n’ont pas été produits, son schéma n’étant pas accessible par SQL privilégié.

Package `supabase/slkm_final_sql/` : `00_existing_schema_preflight.sql`, `01_core_schema_and_storage.sql`, `02_messagerie.sql`, `03_cms_structure.sql`, `04_cms_authorization.sql`, `05_cms_defaults.sql`, `06_complete_controls.sql`, `07_constraints_verification.sql`, `08_editorial_defaults.sql`, `09_messagerie_details.sql`, `VALIDATION_QUERIES.sql`, `README_EXECUTION.md`, `expected-schema.json`, `canonical-schema.json`.

Ordre manuel : **00 → 09**, puis validation. Même chaîne pour installation neuve ou upgrade compatible ; les colonnes manquantes sont ajoutées explicitement. Aucun script n’efface des données ni ne caste automatiquement un type métier incompatible. Les champs obligatoires manquants sur des lignes existantes, les contraintes ou clés incompatibles arrêtent la migration et exigent une correction ciblée. Les sauvegardes et l’approbation sont nécessaires avant production. Les anciens SQL ne sont ni écrasés ni supprimés. `schema.sql` et `seed.sql` ne doivent pas être rejoués après le package final.

## Sécurité vérifiée et limites

Vérifié dans le code : autorisation serveur par `getUser`/`app_metadata.role`, protection middleware des routes admin, API médias protégée indépendamment, absence de clé service-role côté client, validation des uploads, destinations de navigation contrôlées et rendu React sans exécution de HTML éditorial. Dans PostgreSQL local : refus anon/viewer, non-escalade via `user_metadata`, visibilité médias publiés, demandes privées, FK, RPC atomique et conservation des modifications sur réexécution.

Pas de certification des policies/grants, versions PostgreSQL, propriétaires Storage ou comptes réels sur Supabase. Les paramètres et les contacts des agents sont publics par conception ; les états masqués de listes JSON ne constituent pas une zone de confidentialité. Ne pas y mettre de secrets ou de données RH privées. Les demandes privées sont dans leurs tables dédiées. Pas de mécanisme antispam distribué configuré : le déploiement doit appliquer ses limites de trafic aux formulaires. Les suppressions Storage ne sont pas une transaction distribuée ; les éventuels fichiers orphelins sont signalés, pas effacés en masse.

## Tests réellement effectués

| Vérification | Résultat |
|---|---|
| `tsc --noEmit --incremental false` | PASS après modifications |
| `npm run build` | PASS, Next.js 15.5.28, PostCSS corrigé ; avertissement informatif sur l’absence du plugin de règles Next.js dans la configuration ESLint ciblée |
| CMS SQL historique ordonné | 22 assertions PostgreSQL locales PASS |
| Package SQL final | 23 assertions locales PASS : fresh install/rerun, 197 colonnes attendues, colonne manquante réparée, contenu préservé, rôles/Storage, CRUD métier et statuts, détails Messagerie |
| Contrôles CMS | 32 assertions PASS : routes autorisées, traductions, assets, URLs, signature SVG/HTML rejetée et payloads des neuf pages |
| Transport | 14 assertions PASS : sens réel, activité, villes, calendrier, classes et cas vides |
| Messagerie | 16 assertions de rendu PASS, dont photos, lien de position et agents actifs |
| Probe Supabase anonyme GET `limit=0` | 13 erreurs réelles `PGRST205` ; BLOCKED pour intégration distante |
| Smoke HTTP, langues et métadonnées | 23 contrôles PASS, dont manifeste, favicon, OpenGraph, API médias protégée et média invalide ; rendu avec secours, aucune écriture |
| UI desktop/mobile FR/AR/EN | 189 layouts et 5 groupes d’interactions PASS, zéro erreur JS client ; compte rendu `SLKM_PUBLIC_QA_RESULT.json` ; aucun formulaire envoyé |
| Dépendances | Installation npm après correction : zéro vulnérabilité signalée ; aucun `audit fix --force` |
| ESLint autonome | `npm run lint` PASS, zéro avertissement, configuration TypeScript de validité runtime et constructions dangereuses ; aucune règle de design/formatage imposée. |
| Session admin, CRUD/upload/favicon réel, permissions Storage hébergées | NON TESTÉS ; schéma API indisponible et aucun compte admin de staging fourni |

Les assertions SQL utilisent PGlite avec substituts minimaux Auth/Storage : elles ne lancent ni PostgREST ni le service Storage réel. Le build et la compilation ne prouvent pas la connexion Supabase. Les échecs intermédiaires de tests ont été corrigés (attentes d’animation/resize et attentes injustifiées de données publiques), sans injecter de données pour cacher le schéma indisponible.

Quatre contrôles UI restent explicitement BLOCKED : filtres/réservation sur une ligne publiée, bouton de suivi WhatsApp configuré, modal d’une carte Messagerie configurée et détail d’un article publié. Les cinq groupes réussis couvrent le menu/clavier/focus, les liens publics existants, le changement FR/AR/EN et RTL, les champs requis des formulaires et la redirection admin. Les photos et coordonnées Messagerie optionnelles ont aussi été testées par rendu React local ; leur upload réel ne l’a pas été. Inspection visuelle des captures mobile FR 320 px et desktop AR 1440 px : structure approuvée conservée.

ESLint et le parseur TypeScript ont été ajoutés puisqu’aucun lint autonome n’existait. Le contrôle npm a également révélé une alerte minimatch dans cet outillage ; override correctif 11.0.1, puis lint rejoué avec succès et installation auditée à zéro vulnérabilité. Ces dépendances sont de développement. La configuration ESLint ne remplace pas un audit manuel de sécurité ni une suite exhaustive de règles spécifiques à Next.js.

## Actions manuelles restantes

1. Vérifier le projet Supabase réellement visé et exécuter les requêtes de validation avec un rôle SQL autorisé. Confirmer si les tables sont absentes, non exposées ou si le cache est obsolète ; ne pas se fier aux HEAD 204.
2. Sauvegarder, appliquer le package sur staging après revue, valider le résultat et attribuer le rôle admin via un processus de confiance. Aucune attribution n’est faite par les SQL livrés.
3. Tester des sauvegardes/relectures admin autorisées sur staging pour chaque ligne de la matrice, et vérifier les réponses des sessions anon/viewer/admin contre les vraies policies.
4. Tester upload/remplacement/restauration et dépublication de logo/favicon, permissions Storage, nettoyage d’un asset inutilisé, puis installation Apple/PWA réelle et cache navigateur/social.
5. Vérifier les données de transport réelles et les traductions éditoriales avec l’entreprise. Tester filtres/réservation WhatsApp sur des lignes publiées réelles, détail d’article publié et carte réseau configurée. Aucun message WhatsApp n’a été envoyé.
6. Après approbation explicite seulement, préparer le déploiement et l’exécution production. Les modes de secours doivent rester distingués d’un CMS connecté ; la disponibilité en HTTP 200 n’est pas une preuve de données persistées.

Les pages légales, carte Contact embarquée, e-mail sortant, paiement et moteur de suivi colis ne sont pas des fonctionnalités actives trouvées dans le dépôt. Elles n’ont pas été inventées ni présentées comme opérationnelles. Les réservations restent des demandes WhatsApp. La demande de contrôle CMS est implémentée dans le code ; sa validation complète en environnement réel reste bloquée par l’état de l’API et l’absence de session de test privilégiée.
