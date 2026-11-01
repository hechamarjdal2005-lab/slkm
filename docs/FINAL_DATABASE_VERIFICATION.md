# Vérification du paquet FINAL_DATABASE — 31 octobre 2026

Le dossier actif unique est `supabase/FINAL_DATABASE`. Il contient neuf SQL numérotés `01.sql` à `09.sql` et une notice d'exécution en français. Les anciens dossiers, migrations, SQL isolés et ZIP de livraison ont été retirés de `supabase` après vérification de la sauvegarde.

**Correctif ultérieur 42P01 :** `02.sql` crée désormais ses objets de comparaison dans chaque bloc `DO` avant utilisation, sans dépendance temporaire entre instructions. Les 578 nouveaux contrôles incluent la reproduction de l'ancien défaut, 218 instructions indépendantes, de nouvelles sessions entre les neuf fichiers et la conservation intégrale des données lors d'une réexécution de `02.sql` seul. La suite SQL complète réussit après correction. Voir [le diagnostic et les instructions de reprise](FINAL_DATABASE_42P01_FIX.md) et `FINAL_DATABASE_SESSION_TESTS.json`.

## Sauvegarde vérifiée avant nettoyage

`docs/archive/SQL_BEFORE_FINAL_DATABASE_20261031.zip` contient les 85 fichiers alors présents dans `supabase` et `scripts`. Chaque entrée a été relue depuis le ZIP, avec comparaison de sa taille et de son SHA-256 au fichier original. Le manifeste est dans `docs/FINAL_DATABASE_BACKUP.json`. Les anciens générateurs sont conservés dans le dépôt avec un arrêt explicite avant exécution ; leurs versions originales sont également sauvegardées. Les anciens points d'entrée de tests SQL exécutent désormais le paquet canonique.

Seuls les anciens fichiers de `supabase` ont été supprimés. Aucun actif du site, code applicatif, utilisateur Auth, objet Storage distant ou donnée de production n'a été supprimé. Le dépôt comportait déjà de nombreuses modifications utilisateur, conservées.

## Schéma et couverture applicative

L'inventaire couvre toutes les sources actives TS/TSX, composants publics, Dashboard, actions serveur, routes API, métadonnées et accès Supabase. L'audit AST vérifie **322 références explicites de colonnes et 22 mutations, sans écart**. Les deux charges dynamiques `site_sections` passent par le validateur réel exécuté dans les tests ; le troisième point dynamique est `getAdminEntity`, un helper serveur protégé sans appel actuel dans le dépôt.

Le catalogue compte **249 entrées éditoriales trilingues**, neuf périmètres CMS dont le footer et le modèle d'article. Le fichier 06 est reconstruit depuis ce catalogue, les valeurs de design et la navigation du code. Chaque traduction et chaque lien inséré est comparé au catalogue dans le test CRUD ; les chemins des images locales sont vérifiés à la génération. Aucune donnée métier d'exemple n'est livrée.

Résultat : **13 tables, 197 colonnes, 77 contraintes dont huit FK, 24 index applicatifs supplémentaires, 13 triggers, trois fonctions et 49 politiques RLS applicatives/Storage**. Les clés créent leurs propres index en supplément. Il n'y a aucun doublon de table publique ou de définition de contrainte dans la base testée.

Les villes restent les champs FR/AR/EN des agences, les agents les objets JSON du réseau Messagerie. Les réservations voyageurs conservent le parcours WhatsApp existant ; aucune réservation n'est persistée par ce parcours. Les formulaires de contact et de devis sont persistés dans leurs tables privées et gérés dans le Dashboard. La notice fournit la correspondance complète fonctionnalité/table/écran d'administration.

## Tests exécutés

| Vérification | Résultat |
|---|---|
| `npm run test:sql` : inventaire des SQL et audit des sources | PASS — neuf SQL canoniques, zéro ancien SQL actif, zéro colonne incompatible |
| Installation PostgreSQL isolée, base partielle peuplée, réexécutions | PASS — 503 contrôles ; conservation des sept tables métier peuplées et des modifications CMS |
| Sécurité CMS et médias | PASS — 22 contrôles ; visiteurs/viewers/admins, brouillons, refus d'élévation via user_metadata, rollback atomique RPC, FK protégées |
| CRUD, contenu initial et contraintes | PASS — 814 contrôles ; les 13 tables exercées, dont paramètres singleton, traductions, liens, images et triggers |
| `npm run test:transport` | PASS — 14 assertions |
| `npm run test:cms` | PASS — 32 assertions |
| `npm run test:messagerie` | PASS — 16 assertions de rendu |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — zéro avertissement ESLint sur `src` |
| `npm run build` | PASS — build Next.js de production et toutes les routes compilées |
| Smoke HTTP sur le serveur de production local | PASS — 23 contrôles de pages, langues, RTL, métadonnées, médias et protection admin |
| Playwright sur le serveur de production local | PASS — 189 mises en page (sept pages × trois langues × neuf largeurs) et cinq groupes d'interactions |

Le build signale uniquement que le plugin ESLint Next.js n'est pas présent dans la configuration existante. L'exécution ESLint du projet et le contrôle des types réussissent ; cette configuration n'a pas été modifiée pour le travail SQL.

Les essais navigateur ont exercé le mode de secours du site : les requêtes au Supabase configuré renvoyaient `fetch failed` dans cet environnement. Ils valident donc le rendu, les langues, les interactions disponibles et la protection admin, sans prouver une connexion au nouveau schéma. Quatre parcours dépendant de données publiées ont été explicitement ignorés : réservation sur une vraie ligne, suivi WhatsApp avec contact configuré, agrandissement d'une carte Messagerie configurée et détail d'un article publié. Leur logique locale et les opérations SQL associées sont couvertes par les tests isolés ; une validation complète dans le navigateur après installation reste à faire.

Rapports structurés : `SLKM_SQL_TEST_RESULTS.json`, `FINAL_DATABASE_CRUD_TESTS.json`, `SLKM_SQL_SOURCE_INVENTORY.json`, `SLKM_REPOSITORY_INVENTORY.json`, `FINAL_DATABASE_PUBLIC_QA.json`. `FINAL_DATABASE_MANIFEST.json` contient les SHA-256 des neuf SQL ; la sauvegarde initiale a également été revérifiée après nettoyage. Le manifeste et les anciennes analyses restent disponibles ; les rapports historiques sont identifiés comme tels pour éviter de suivre un ancien ordre d'installation.

## Limites vérifiées

Le moteur utilisé est PostgreSQL 18.6 embarqué via PGlite 0.5.13. Les schémas Auth/Storage et rôles API de test sont minimaux. Ils sont créés uniquement en mémoire par les tests, jamais par les migrations livrées. Les politiques sont exécutées sous `anon`, `authenticated` et un JWT administrateur simulé, avec les privilèges SQL réels du moteur.

Le paquet ne modifie pas l'ownership ou le RLS des tables système. Les autorisations administrateur proviennent de `app_metadata`, conformément à la [documentation Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security). Les politiques Storage sont appliquées directement, sans contrôle erroné imposant que le rôle postgres soit propriétaire.

Les services Supabase hébergés, la vérification cryptographique des JWT, le cache PostgREST et les API de fichiers/liens signés ne sont pas reproduits par PGlite. Ils ne sont donc pas certifiés par ces tests. Le SQL final notifie le rechargement de schéma et la notice décrit les contrôles à faire après installation. Aucune migration n'a été exécutée en ligne.
