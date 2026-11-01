> Historique : les anciens paquets SQL cités ci-dessous ont été archivés. La seule procédure active est [FINAL_DATABASE](../supabase/FINAL_DATABASE/README.md).

# SLKM — audit SQL final et package corrigé

Audit du 31 octobre 2026. **29 fichiers SQL inspectés : 18 préexistants et 11 nouveaux fichiers de livraison.** Le dossier autoritatif pour cette intervention est `supabase/slkm_sql_verified/`. Aucun SQL d’origine n’a été écrasé. Aucune interface, route, donnée de production ou configuration distante n’a été modifiée.

Complément après réapparition de l’erreur du seed : `INSTALL_OR_UPGRADE.sql` fournit désormais une alternative atomique en un seul fichier, assemblée à partir des huit étapes ordonnées déjà vérifiées. Ce fichier supplémentaire porte le total livré/inspecté à 30 SQL ; le tableau historique ci-dessous conserve les 29 fichiers de l’audit initial. Douze contrôles PostgreSQL isolés supplémentaires réussissent sur ce fichier unique, y compris installation, upgrade peuplé, réexécution et rollback. Preuve : `SLKM_SQL_SINGLE_FILE_TEST.json`. Ne pas ajouter le seed historique à ce fichier.

**Bilan : 12 problèmes de dépendance, réparation ou sécurité traités, dont 5 erreurs SQL effectivement reproduites.** Ce ne sont pas 12 erreurs de syntaxe : les fichiers historiques s’exécutent dans le moteur de test lorsqu’ils reçoivent leurs dépendances, mais ils ne constituent pas un parcours fiable dans tous les états partiels et ne doivent pas être mélangés sans ordre. Les modifications et les gardes nécessaires sont livrées dans de nouveaux fichiers.

## 1. Cause de l’erreur `public.agencies`

L’erreur fournie est reproduite à l’identique :

```text
42P01: relation "public.agencies" does not exist
```

`supabase/seed.sql:22` exécute un INSERT ; il ne contient pas la création de cette table. `supabase/schema.sql:50` définit bien `public.agencies`, avec le même nom et le bon schéma. Il n’existe pas de renommage `agency`/`agencies` expliquant l’échec dans le dépôt.

Les explications démontrées localement sont : seed lancé avant le socle, ou transaction du socle ayant échoué plus loin puis été annulée. Le second cas a également été testé : une erreur d’ownership à `schema.sql:629` annule la création d’agencies pourtant exécutée plus tôt. Le nouveau package crée toutes les tables/colonnes, puis toutes les clés, puis les FK, avant tout INSERT éditorial.

Le projet distant configuré renvoie actuellement **404 / PGRST205 pour les 13 tables**, dans un probe anonyme GET `limit=0`, sans récupération d’enregistrements. Cela ne permet pas de distinguer absence physique, schéma non exposé ou cache/projet incorrect. Pour confirmer la cause sur ce projet : exécuter les requêtes READ ONLY du nouveau dossier avec le SQL Editor autorisé, vérifier `current_database()`, `current_user` et `to_regclass('public.agencies')`, puis comparer le projet sélectionné avec la configuration locale. Aucun accès aux catalogues SQL distants ou compte admin de staging n’est disponible dans les outils connectés.

## 2. Erreurs et corrections

| ID | Constat, fichier/instruction | Preuve ou limite | Correction livrée |
|---|---|---|---|
| E01 | Seed avant socle : `supabase/seed.sql:22`, `INSERT INTO public.agencies`. Les migrations seules omettent aussi le socle placé dans `schema.sql`. | **42P01 reproduit**. | Parcours complet 00 → tables → clés → relations → sécurité → seed. Le seed historique est exclu des parcours production. |
| E02 | `schema.sql:268`, index `idx_agencies_city_fr` après `CREATE TABLE IF NOT EXISTS` sur une table partielle. | **42703 reproduit** : `column "city_fr" does not exist`. | 01 ajoute explicitement chaque colonne manquante ; 00 refuse un type incompatible. Aucun faux backfill métier. |
| E03 | `slkm_final_sql/01_core_schema_and_storage.sql`, création de routes/FK alors qu’agencies existe sans clé unique sur id. | **42830 reproduit** : `there is no unique constraint matching given keys for referenced table "agencies"`. | 01 ne crée aucune FK ; 02 répare toutes les clés avant 04. Cas agencies seule sans PK et cas toutes tables sans clés testés. |
| E04 | `slkm_final_sql/07_constraints_verification.sql`, comparaison textuelle brute de `pg_get_constraintdef`. | **P0001 reproduit** : conflit annoncé sur `contact_messages_status_valid` pour deux CHECK équivalents, casts de tableau réécrits par PostgreSQL. | 02 normalise les définitions attendues et existantes par le parseur PostgreSQL sur des tables temporaires vides. Un vrai conflit reste bloquant. |
| E05 | `schema.sql:629`, ALTER RLS d’une table système Storage appartenant à un autre rôle. | **42501 reproduit avec rôle restreint** : `must be owner of table objects`. Ce n’est pas une affirmation sur le rôle SQL Editor réel de l’utilisateur. | ALTER système supprimé ; 00 vérifie en amont les privilèges nécessaires pour gérer les policies Storage. Aucun changement d’ownership. |
| E06 | `schema.sql:643` et policy d’UPDATE Storage : tout utilisateur connecté peut téléverser/modifier les médias historiques. | Upload non-admin **réussi dans le schéma historique de test**, puis refusé dans le nouveau. | 06 exige le rôle admin de confiance pour l’écriture Storage. |
| E07 | `supabase/seed.sql`, UPSERT `DO UPDATE` sur données commerciales et demandes d’exemple. | Réexécution **efface une modification d’agence dans le test isolé**. | 07 ne contient que singleton/settings et contenu éditorial existant ; aucune agence, ligne ou demande fictive ajoutée. Les éditions sont préservées. |
| E08 | Tables existantes : défauts, NOT NULL et contraintes manquantes/non validées ne sont pas réparés par IF NOT EXISTS. | Tables partielles et contraintes NOT VALID testées ; NULL incompatibles bloqués sans suppression. | 01 aligne les défauts futurs ; 02/04 restaurent et valident les contraintes. Les NULL, doublons ou FK invalides exigent une décision métier, pas un cast ou une valeur inventée. |
| E09 | `CREATE INDEX IF NOT EXISTS` ignore un index portant le bon nom mais la mauvaise définition. | Index de ville créé sur la mauvaise colonne dans un test ; nouveau script le détecte. | 05 compare la définition et bloque un conflit plutôt que certifier un index incorrect. |
| E10 | Politiques supplémentaires inconnues : leur OR peut laisser passer une écriture malgré les nouvelles policies. | Une policy `USING(true) WITH CHECK(true)` ajoutée dans le test bloque le préflight. | 00 exige une revue des policies inconnues ; 06 remplace uniquement les policies gérées. Rien d’inconnu n’est effacé automatiquement. |
| E11 | Socle historique et précédent package peuvent remettre un bucket historique en public via UPSERT. | Le précédent CMS refusait déjà un `site-media` public, mais les anciens buckets pouvaient changer de visibilité silencieusement. | 03 bloque toute divergence de visibilité pour chacun des quatre buckets avant configuration. |
| E12 | Installation en plusieurs fichiers : les défauts de grants Supabase peuvent exposer une table avant l’étape RLS. | Risque d’installation, pas fuite distante constatée. Test avec grants API par défaut : accès refusé après 01. | 01 active RLS et révoque les accès API dans la transaction de création ; 06 rétablit uniquement les accès nécessaires. |

Les erreurs 42P01, 42703, 42830, P0001 et 42501 ci-dessus sont conservées dans `SLKM_SQL_TEST_RESULTS.json`. Les gardes de types, données invalides, index ou policies inconnues restent volontairement bloquantes : le package ne prétend pas réparer arbitrairement toutes les divergences d’une base dont le schéma réel est inconnu.

## 3. Inventaire des tables et correspondance application

**13 tables applicatives, 197 colonnes, 77 contraintes PK/UNIQUE/CHECK/FK dont 8 FK, 13 triggers, 24 index hors index de contraintes, 3 fonctions publiques et 49 politiques.** Les NOT NULL sont vérifiés séparément pour chaque colonne. Auth et Storage sont des services Supabase prérequis, pas des tables SLKM recréées.

Dans le tableau, « LOCAL OK / LIVE NON VÉRIFIÉ » signifie création, colonnes et contraintes vérifiées dans PostgreSQL isolé, sans validation du schéma physique distant.

| Table name | SQL creation file | Application usage | Dependencies | Status |
|---|---|---|---|---|
| `agencies` | Nouveau 01 ; origine `schema.sql` | Réseau public, cartes, header/footer, `queries.ts`, actions et AgencyManager | Aucune FK sortante | LOCAL OK / LIVE NON VÉRIFIÉ |
| `routes` | Nouveau 01 ; origine `schema.sql` | Lignes, horaires, tarifs et recherche ; RouteManager/actions | Deux FK vers agencies | LOCAL OK / LIVE NON VÉRIFIÉ |
| `parcel_rates` | Nouveau 01 ; origine `schema.sql` | Messageries/tarifs et RateManager | Aucune | LOCAL OK / LIVE NON VÉRIFIÉ |
| `corporate_quotes` | Nouveau 01 ; origine `schema.sql` | Devis personnel/tourisme, liste et statuts admin | Aucune | LOCAL OK / LIVE NON VÉRIFIÉ |
| `contact_messages` | Nouveau 01 ; origine `schema.sql` | Formulaire Contact, messages/statuts admin | Aucune | LOCAL OK / LIVE NON VÉRIFIÉ |
| `blog_posts` | Nouveau 01 ; origine `schema.sql` | Blog public, articles et BlogManager | Aucune | LOCAL OK / LIVE NON VÉRIFIÉ |
| `site_settings` | Nouveau 01 ; origine `schema.sql`, extensions du CMS | Identité, logos/icônes dans presentation JSON, navigation, contacts, flotte, chronologie et services | Singleton id=1 | LOCAL OK / LIVE NON VÉRIFIÉ |
| `messagerie_network_settings` | Nouveau 01 ; origine module Messagerie | Carte et textes du réseau | Singleton id=1 | LOCAL OK / LIVE NON VÉRIFIÉ |
| `messagerie_agencies` | Nouveau 01 ; origine module Messagerie + précédent fichier 09 | Agences liées/indépendantes, contacts/agents JSON, photos/positions, gestion admin | agencies optionnelle | LOCAL OK / LIVE NON VÉRIFIÉ |
| `site_pages` | Nouveau 01 ; origine migration CMS structure | Pages, traductions, images/SEO et CMS admin | Slug/route uniques et cohérents | LOCAL OK / LIVE NON VÉRIFIÉ |
| `site_sections` | Nouveau 01 ; origine migration CMS structure | Sections CMS, publication/ordre et contenu | site_pages, site_media_assets | LOCAL OK / LIVE NON VÉRIFIÉ |
| `site_media_assets` | Nouveau 01 ; origine migration CMS structure | Médiathèque, API admin et `/media/[id]` | storage.buckets | LOCAL OK / LIVE NON VÉRIFIÉ |
| `site_page_media` | Nouveau 01 ; origine migration CMS structure | Références images des pages, RPC CMS atomique | site_pages, site_media_assets | LOCAL OK / LIVE NON VÉRIFIÉ |
| `auth.users` | Prérequis Supabase, jamais recréé par le package | Service Auth ; inspection des rôles de confiance | Supabase Auth | SERVICE DISTANT NON INSPECTÉ |
| `storage.buckets` / `storage.objects` | Prérequis Supabase ; 03 configure seulement les lignes de buckets | Uploads, médias publiés/privés et signatures | Supabase Storage | SERVICE DISTANT NON TESTÉ |

Aucune table applicative requise ne manque dans le nouveau package. Les ajouts précédents (`sort_order`, `is_active` des tarifs, `presentation`, `navigation`, détails Messagerie) sont intégrés dès 01 ; il n’est pas nécessaire de deviner quels ALTER additionnels lancer.

Les réservations et le suivi existants utilisent WhatsApp ; aucune table `reservations`, `tickets`, `messagerie_agents` ou `profiles` n’est référencée et aucune n’a été inventée. Les agents sont dans `messagerie_agencies.agents`. Les références de logo/favicon utilisent `site_settings.presentation` et `site_media_assets`, pas une table branding parallèle.

## 4. Vérification des requêtes et des colonnes

Les **84 fichiers TS/TSX** ont été parcourus. L’inventaire machine `SLKM_SQL_SOURCE_INVENTORY.json` donne les fichiers/lignes, tables, SELECT/filtres/ordre et clés de payload : **322 références explicites de colonnes et 22 mutations INSERT/UPDATE/UPSERT, zéro écart relevé** par cette comparaison. Les DELETE sont recensés via leurs tables/filtres, pas comptés comme payloads d’écriture.

Les deux payloads `site_sections` construits par un validateur importé ne peuvent pas être déduits par simple recherche de chaînes : le vrai `validateSection()` a été exécuté et les colonnes produites comparées au contrat. `validatePagePayload()` est également exécuté. Le RPC `save_site_cms_page` et ses paramètres `p_slug`, `p_payload`, `p_images` sont présents et ont été testés en succès et en rollback atomique.

Le troisième point dynamique est `getAdminEntity(table,id)` dans `queries.ts`, utilitaire serveur autorisé, sans appel trouvé ailleurs dans les sources actuelles. Il n’est pas présenté comme une requête publique à table arbitraire. Aucune modification frontend n’a été nécessaire pour les colonnes inspectées ; les types applicatifs et les validateurs existants ont été lus. Des types générés depuis Supabase réel ne sont pas disponibles et la compatibilité distante ne peut pas être affirmée tant que son schéma reste inaccessible.

`npm run typecheck` et `npm run lint` ont également été exécutés et réussissent pendant cette intervention. Les modifications d’interface déjà présentes avant cette tâche n’ont pas été reprises ou annulées ; aucun fichier applicatif `src/` n’a été modifié pour cet audit SQL.

Les JSON de settings et d’agents sont des configurations publiques lorsqu’ils sont exposés : ils ne doivent contenir ni secrets ni données RH privées. Les messages/devis restent dans leurs tables privées. La publication d’un élément de liste JSON concerne l’affichage ; ce n’est pas une frontière de confidentialité sur les sous-éléments de ce JSON.

## 5. Dépendances et parcours

Les FK forment un graphe sans cycle : `agencies → routes / messagerie_agencies`, `storage.buckets → site_media_assets`, puis `site_pages + site_media_assets → site_sections / site_page_media`. Les helpers Auth sont des prérequis ; triggers/policies/RPC sont installés une fois les tables présentes. Les seeds viennent à la fin.

Premier fichier : **`supabase/slkm_sql_verified/00_prerequisites.sql`**.

| Étape | Base neuve | Base existante |
|---|---|---|
| 1 | 00_prerequisites.sql | 00_prerequisites.sql |
| 2 | fresh/00_assert_fresh.sql | upgrade/00_upgrade_review.sql |
| 3 | 01_tables_and_columns.sql | même fichier |
| 4 | 02_keys_and_checks.sql | même fichier |
| 5 | 03_storage_buckets.sql | même fichier |
| 6 | 04_foreign_keys.sql | même fichier |
| 7 | 05_functions_triggers_indexes.sql | même fichier |
| 8 | 06_rls_and_grants.sql | même fichier |
| 9 | 07_editorial_defaults.sql | même fichier |
| 10 | VALIDATION_QUERIES.sql | même fichier |

Ne jamais combiner les deux fichiers de l’étape 2. Le garde « fresh » doit refuser une base installée ; les réexécutions passent par « upgrade ». Chaque étape DDL est transactionnelle avec search_path fixé. Les tables temporaires de comparaison ne contiennent aucune donnée commerciale et disparaissent au commit. La normalisation ne supprime aucune contrainte réelle pour contourner un conflit ; seules les contraintes des tables temporaires sont retirées pendant la comparaison.

## 6. Doublons et conflits historiques

- `messagerie_setup.sql` et `20261030180000_messagerie_network.sql` ont un contenu identique après retrait des espaces finaux ; seule une ligne vide diffère. Ils définissent les mêmes deux tables, helpers et policies. Leur répétition avec les dépendances existe et a été testée, mais il est inutile de les exécuter tous deux pour une installation neuve.
- `slkm_final_sql/01…09` redéfinit les mêmes objets métier/CMS que le socle et les migrations. Ce n’est pas un second schéma à ajouter au nouveau dossier. Les noms sont communs, pas de nouvelles tables indépendantes.
- Rejouer `schema.sql` après les policies corrigées rétablit les anciennes policies d’écriture Storage et remplace la policy publique des tarifs par une lecture sans filtre d’activité. Il peut aussi modifier la visibilité des buckets historiques. Ce n’est donc pas une procédure de rollback.
- Rejouer le seed métier remplace les lignes correspondantes ; le nouveau seed éditorial conserve les éditions et les clés supplémentaires.
- Les triggers gérés du socle sont remplacés par leur nom, ceux des modules sont gardés par leur nom. Aucune duplication active de trigger canonique n’a été observée sur le parcours testé ; la requête de validation liste les candidats inconnus à examiner.
- Les fonctions/policies réexécutables ne rendent pas les fichiers indépendants : les migrations CMS nécessitent le socle et la structure. Les FK nécessitent d’abord une clé unique valide sur la table cible.

## 7. Sécurité et vérification locale

Le package applique RLS aux 13 tables dès leur création ; il ne le désactive jamais. Les helpers admin et RPC sont SECURITY INVOKER avec search_path vide. Le rôle admin provient de `app_metadata`, jamais de `user_metadata`. Seules les demandes publiques disposent d’un INSERT anonyme, avec statut limité ; aucun droit public d’écriture du CMS ou Storage n’est ajouté. Les politiques inconnues sont bloquées pour revue, pas supprimées. Aucune clé n’a été imprimée ou intégrée au SQL.

Les quatre buckets sont contrôlés avant modification de leurs limites/MIME. Aucun `ALTER TABLE storage.objects`, changement d’owner ou suppression de fichier n’est émis. L’autorisation nécessaire pour créer des policies sur cette table système reste un prérequis de rôle, vérifié avant les étapes DDL.

Tests : **84 contrôles réussis dans PostgreSQL 18.6 embarqué via PGlite 0.5.13**. Les fichiers sont réellement parsés et exécutés ; ce n’est pas uniquement un grep, un simulateur SQL ou un jeu de réponses Supabase fictives. Auth et Storage sont représentés par des schémas minimaux de test, pas par leurs services hébergés. Aucun serveur PostgreSQL natif/outil psql ou Docker utilisable n’a été trouvé dans l’environnement ; PostgreSQL 15 natif et Supabase staging restent non testés.

Couverture exécutée : installation neuve complète, garde fresh, réexécution upgrade, inspection READ ONLY avant/après tables, toutes les colonnes/défauts/NOT NULL, 77 contraintes validées, 49 policies et grants, index/triggers, données historiques peuplées, colonne manquante, PK absente, tables sans clés, contraintes NOT VALID, copie exacte de toutes les valeurs des sept tables existantes avant/après upgrade, préservation des éditions CMS, FK invalides, anon/viewer/admin, brouillons Storage, statuts publics, RPC succès/rollback, privilèges insuffisants, dérive de types/index/bucket/policy et NULL incompatibles sans perte de données.

Les sept SQL historiques et les onze SQL du précédent package ont aussi été réellement exécutés dans leur ordre valide, avec le seed historique uniquement en base jetable. Le nouveau package ne promet pas qu’ils peuvent tous être exécutés dans n’importe quel ordre.

Preuves : `SLKM_SQL_TEST_RESULTS.json`, `SLKM_SQL_SOURCE_INVENTORY.json`, `SLKM_LIVE_READONLY_PROBE.json`, `SCHEMA_CONTRACT.json`, `SOURCE_PROVENANCE.json`. Commande reproductible : `npm run test:sql:verified`.

## 8. État distant et actions restantes

Toutes les tables applicatives du tableau sont **non vérifiées dans le schéma physique Supabase actuel** ; le probe REST retourne PGRST205 sur chacune. Aucun privilège SQL distant ne permet de conclure davantage. Les rôles, propriétaires, grants et policies réels ainsi que le service Storage hébergé ne sont pas certifiés.

Exécuter d’abord les requêtes de validation dans le bon projet, revoir les sauvegardes et les différences, appliquer le parcours choisi sur staging avec autorisation, puis tester les sessions anon/utilisateur/admin et les CRUD/uploads réels. Les états partiels incompatibles nécessitent une migration de données ciblée. L’exécution production nécessite toujours une approbation explicite et n’a pas été effectuée. Le guide français du dossier SQL décrit la reprise après erreur et les transactions par fichier.

## 9. Liste exhaustive des fichiers inspectés

Le tableau ci-dessous est généré à partir du contenu lu. « Ordre valide testé » ne signifie pas « sûr à rejouer sur production ». Les empreintes SHA-256 complètes sont dans l’inventaire JSON, qui permet aussi de vérifier que les fichiers originaux sont préservés.

<!-- SQL_INVENTORY_TABLE -->

| Fichier | Lignes | Vérification / dépendances |
|---|---:|---|
| `supabase/messagerie_setup.sql` | 136 | Agencies + Auth/UUID ; doublon du module migration ; ordre valide testé. |
| `supabase/migrations/20261030180000_messagerie_network.sql` | 135 | Même module Messagerie ; agencies et helpers requis ; ordre valide testé. |
| `supabase/migrations/20261031090000_site_cms_structure.sql` | 106 | Socle/settings/helpers/Storage requis ; structure CMS testée. |
| `supabase/migrations/20261031091000_site_cms_policies.sql` | 76 | Structure CMS et helper admin requis ; policies/RPC testés. |
| `supabase/migrations/20261031092000_site_cms_defaults.sql` | 70 | Tables et contraintes uniques CMS requises ; seed éditorial testé. |
| `supabase/schema.sql` | 677 | Auth/Storage prérequis ; socle testé, risques E02/E05/E06/E11 ; ne pas rejouer après correction. |
| `supabase/seed.sql` | 849 | Socle requis ; 42P01 reproduit sans socle ; testé après socle et sur réexécution ; exclu des parcours réels. |
| `supabase/slkm_final_sql/00_existing_schema_preflight.sql` | 206 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/01_core_schema_and_storage.sql` | 820 | Précédent package : ordre valide testé ; clé agencies manquante E03 reproduite. |
| `supabase/slkm_final_sql/02_messagerie.sql` | 174 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/03_cms_structure.sql` | 172 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/04_cms_authorization.sql` | 76 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/05_cms_defaults.sql` | 70 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/06_complete_controls.sql` | 17 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/07_constraints_verification.sql` | 242 | Précédent package : ordre valide testé ; faux conflit équivalent E04 reproduit sur état alternatif. |
| `supabase/slkm_final_sql/08_editorial_defaults.sql` | 7 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/09_messagerie_details.sql` | 18 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_final_sql/VALIDATION_QUERIES.sql` | 216 | Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée. |
| `supabase/slkm_sql_verified/00_prerequisites.sql` | 268 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/01_tables_and_columns.sql` | 649 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/02_keys_and_checks.sql` | 1435 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/03_storage_buckets.sql` | 16 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/04_foreign_keys.sql` | 70 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/05_functions_triggers_indexes.sql` | 135 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/06_rls_and_grants.sql` | 262 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/07_editorial_defaults.sql` | 72 | Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json. |
| `supabase/slkm_sql_verified/fresh/00_assert_fresh.sql` | 3 | Nouveau : contrôle fresh testé en acceptation et refus sur base installée. |
| `supabase/slkm_sql_verified/upgrade/00_upgrade_review.sql` | 4 | Nouveau : revue READ ONLY exécutée dans le parcours upgrade. |
| `supabase/slkm_sql_verified/VALIDATION_QUERIES.sql` | 311 | Nouveau : inspection READ ONLY testée avant et après création des tables. |
