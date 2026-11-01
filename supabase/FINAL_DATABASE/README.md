# SLKM Transport — installation complète de la base

Ce dossier est l'unique paquet SQL actif. Il contient exactement `01.sql` à `09.sql`. Les anciens SQL ont été sauvegardés, vérifiés puis retirés du projet actif. Ne restaurez et n'exécutez aucun ancien `schema.sql`, `seed.sql`, dossier de migrations ou autre paquet avec celui-ci.

## Correctif 42P01 — slkm_expected_agencies

Si `01.sql` a déjà réussi et que vous avez rencontré `relation "slkm_expected_agencies" does not exist`, **réexécutez uniquement le fichier corrigé `02.sql` complet**, puis poursuivez avec `03.sql` à `09.sql` si ces fichiers n'ont pas encore été exécutés. Il n'est pas nécessaire de recréer les tables avec `01.sql`. Si la transaction courante est en erreur, exécutez d'abord `ROLLBACK;`.

Ne sélectionnez pas uniquement la ligne `ALTER TABLE` en erreur : copiez tout `02.sql`. Chaque bloc `DO` crée désormais ses deux tables temporaires vides avant leur première utilisation et les retire avant de se terminer. Aucun bloc ne dépend d'une table temporaire laissée par une instruction, une transaction, une session ou un fichier précédent. Seuls ces objets vides `pg_temp` sont supprimés ; les tables applicatives et leurs données sont conservées. Les 69 blocs sont corrigés, y compris ceux des 12 autres tables.

Si `03.sql` à `09.sql` avaient déjà réussi, la correction de portée concerne seulement `02.sql` ; vous pouvez ensuite relancer `08.sql` et `09.sql` pour vérifier. Les tests de régression reproduisent l'ancien 42P01, exécutent 218 instructions indépendantes sans état temporaire conservé, puis les neuf fichiers avec une nouvelle session par fichier, et vérifient qu'une réexécution isolée de `02.sql` conserve toutes les données. Voir `docs/FINAL_DATABASE_SESSION_TESTS.json`.

## Exécution dans Supabase SQL Editor

1. Ouvrez votre projet Supabase, puis **SQL Editor → New query**. Sélectionnez la base principale et le rôle **postgres**. Vérifiez le projet avant toute exécution.
2. Ouvrez localement `01.sql`. Copiez **tout le fichier**, du premier commentaire jusqu'à la dernière instruction. Collez-le dans une nouvelle requête et cliquez sur **Run**.
3. Attendez la confirmation de réussite. Faites exactement la même chose avec `02.sql`, puis chaque fichier suivant, selon le tableau ci-dessous. Exécutez un seul fichier complet par requête.
4. Terminez impérativement par `08.sql` et `09.sql`. Le dernier fichier demande à PostgREST de recharger le schéma.
5. Ouvrez le site et connectez-vous au Dashboard avec votre compte administrateur existant. Renseignez les vraies coordonnées, agences, lignes et tarifs avant de les publier.

| Ordre | Fichier | Contenu |
|---|---|---|
| 1 | `01.sql` | Prérequis PostgreSQL/Supabase, contrôle des objets existants, création des 13 tables et 197 colonnes ; RLS activé immédiatement et privilèges publics révoqués. |
| 2 | `02.sql` | Clés primaires, clés uniques, contraintes CHECK et NOT NULL. |
| 3 | `03.sql` | Création/configuration des quatre buckets, puis les huit clés étrangères, après les tables et clés référencées. |
| 4 | `04.sql` | Autorisation administrateur, sauvegarde atomique CMS, triggers de dates et index. |
| 5 | `05.sql` | Permissions SQL et politiques RLS des tables applicatives. |
| 6 | `06.sql` | Identité, apparence, navigation et contenu éditorial FR/AR/EN tirés du code existant ; pages, sections, liens et images locales. |
| 7 | `07.sql` | Politiques Storage : écritures administrateur, lecture des images publiées. Aucune modification de propriétaire ou désactivation RLS. |
| 8 | `08.sql` | Inspection en lecture seule : colonnes manquantes, types, contraintes, privilèges, relations et doublons éventuels. |
| 9 | `09.sql` | Contrôles finaux obligatoires et notification de rechargement du schéma PostgREST. |

Les huit premiers fichiers ne sont pas interchangeables. En particulier, les tables sont créées dans **01**, les clés dans **02**, les relations dans **03**, et le contenu dans **06**. Les résultats des requêtes d'inspection de **08** comportent des listes normales ; les requêtes signalant des objets manquants ou des doublons doivent retourner zéro ligne sur une base neuve.

## Si un fichier échoue

Arrêtez-vous au fichier concerné. Conservez son numéro, le code d'erreur et le message exact. Si une transaction reste en erreur, exécutez `ROLLBACK;`. Corrigez la cause puis réexécutez le fichier complet. Les migrations 01–07 et 09 sont transactionnelles ; les fichiers précédents déjà validés restent appliqués.

Les prérequis sont PostgreSQL 15 ou supérieur, Supabase Auth et Storage initialisés, les rôles API Supabase et `gen_random_uuid()`. Le paquet ne recrée jamais leurs tables système.

Une base applicative vide est le cas principal. Une réexécution et certains schémas partiels compatibles sont également testés. Un type incompatible, une politique inconnue, une contrainte conflictuelle ou un bucket de confidentialité différente provoquent volontairement un arrêt : aucun effacement de données ni changement silencieux de confidentialité. Les tables temporaires vides utilisées pour comparer les contraintes sont créées et supprimées dans le même bloc `DO`, avec `ON COMMIT DROP` comme nettoyage de secours.

Si **07** retourne une erreur réelle de permission, vérifiez le rôle du SQL Editor et les autorisations Storage du projet. Ne changez pas l'ownership de `storage.objects`, ne faites pas `SET ROLE supabase_storage_admin` et ne désactivez pas RLS. Le fichier utilise directement les instructions de politiques ; il n'ajoute pas de faux contrôle de propriétaire susceptible de refuser une autorisation Supabase valide.

Si l'API signale `PGRST205` après installation, vérifiez d'abord que les neuf fichiers ont réussi **dans le même projet que les variables d'environnement du site**, puis réexécutez **09** et attendez le rechargement du cache. Le paquet ne remplace pas la configuration du projet ou de l'API hébergée.

## Correspondance avec le site et le Dashboard

| Fonction | Tables/champs utilisés | Gestion existante |
|---|---|---|
| Nom, contacts, réseaux sociaux, statistiques, services | `site_settings` | Paramètres |
| Logo clair/sombre/mobile, favicon, image sociale, couleurs, polices | `site_settings.presentation` | Design et médiathèque |
| Header, menu, bouton, navigation mobile et footer | `site_settings.navigation`, page CMS `global` | Navigation et CMS |
| Accueil, lignes, Irsaliyat, histoire, services, contact, blog et modèle d'article | `site_pages`, `site_sections` | CMS : textes, traductions, SEO, ordre, visibilité, sections et liens |
| Images des pages et bibliothèque | `site_media_assets`, `site_page_media`, bucket privé `site-media` | Médiathèque et sélection d'images ; diffusion par `/media/[id]` |
| Agences, villes, cartes | `agencies` | Agences : FR/AR/EN, coordonnées, contacts et images |
| Lignes, horaires et tarifs voyageurs | `routes` → `agencies` | Lignes |
| Réseau colis, carte et agents | `messagerie_network_settings`, `messagerie_agencies` → `agencies` | Messagerie ; agents dans `agents` JSON avec fonctions FR/AR/EN |
| Tarifs colis | `parcel_rates` | Tarifs |
| Transport de personnel/tourisme et devis | CMS `services`, `corporate_quotes` | CMS, paramètres des services et devis |
| Contact | CMS `contact`, `contact_messages` | CMS et messages |
| Actualités et traductions d'articles | `blog_posts` | Articles |

Les villes sont les champs trilingues des agences ; aucune table `cities` inutilisée n'est ajoutée. Une agence Messagerie liée réutilise l'identité de son agence source, avec une liaison unique et une suppression protégée. Une agence indépendante peut avoir ses propres informations.

**Réservations voyageurs :** le site existant envoie la demande par WhatsApp à l'agence, avec les informations du trajet ; à défaut de numéro, il ouvre Contact. Il n'enregistre actuellement aucune réservation ni aucun paiement dans Supabase. Ce fonctionnement et le design sont conservés. Aucune table de réservations sans formulaire ni Dashboard associé n'est ajoutée. Les demandes de devis et messages envoyés par les formulaires sont, eux, persistés et gérés dans le Dashboard.

## Contenu initial et sécurité

Les sources du contenu initial sont `src/lib/cms-defaults.json`, `src/lib/cms.ts` et `src/lib/navigation.ts`. Les images référencées sont vérifiées dans `public`. Ces textes sont ceux du dépôt existant ; ce travail ne constitue pas une vérification externe des affirmations commerciales historiques.

Aucune agence, ville commerciale, ligne, grille tarifaire, réservation, devis, client ou actualité de démonstration n'est inséré. Les coordonnées non confirmées restent vides. Les libellés de marque SLKM et les valeurs de design sont conservés ; les coordonnées réelles devront être saisies par l'entreprise. Une réexécution ne remplace pas les traductions, liens et images déjà modifiés.

L'administration utilise exclusivement `app_metadata.role = "admin"` dans le JWT, comme le code existant. Aucun utilisateur n'est créé ou promu par les migrations. Un responsable habilité doit attribuer cette métadonnée au compte existant depuis un environnement serveur de confiance, puis renouveler sa session. `user_metadata` ne donne aucun droit administrateur. Les recommandations Supabase distinguent ces deux sources : [documentation RLS officielle](https://supabase.com/docs/guides/database/postgres/row-level-security).

Les visiteurs peuvent lire le contenu actif/publié et envoyer des messages/devis ; ils ne peuvent pas lire les demandes privées ni administrer le site. `site_settings` étant public, n'y stockez aucun secret. Le bucket `site-media` reste privé ; les images actives publiées ont une politique de lecture, les brouillons restent réservés à l'admin. Les trois buckets historiques de médias publics sont conservés pour la compatibilité. Les droits d'écriture exigent un administrateur.

## Sauvegarde et tests

Archive hors du dossier SQL actif : `docs/archive/SQL_BEFORE_FINAL_DATABASE_20261031.zip`. Le manifeste `docs/FINAL_DATABASE_BACKUP.json` conserve les chemins, tailles et SHA-256 des 85 fichiers sauvegardés. Chaque entrée a été relue depuis le ZIP et comparée avant suppression des anciens fichiers actifs. Il s'agit d'une sauvegarde du dépôt, pas d'une sauvegarde de production. Les générateurs historiques sont désactivés pour éviter de recréer des paquets concurrents.

Commandes locales :

```text
npm run test:sql
npm run test:transport
npm run test:cms
npm run test:messagerie
npm run typecheck
npm run lint
npm run build
```

`test:sql` audite toutes les sources TS/TSX, exécute les neuf fichiers dans PostgreSQL embarqué via PGlite, puis vérifie le contrat des 197 colonnes, contraintes, politiques et triggers, les données existantes, les réexécutions, les refus RLS, les brouillons de médias, l'atomicité du RPC et les opérations CRUD. Les données de test sont uniquement en mémoire et ne sont jamais présentes dans le paquet SQL.

Limite explicite : Auth et Storage sont représentés par des schémas minimaux dans les tests locaux. Le service Supabase hébergé, PostgREST, les sessions Auth réelles, les liens signés et les autorisations système propres au projet doivent être validés après votre installation. Aucune migration distante n'a été exécutée automatiquement.

Rapports : `docs/SLKM_SQL_TEST_RESULTS.json`, `docs/FINAL_DATABASE_CRUD_TESTS.json`, `docs/SLKM_SQL_SOURCE_INVENTORY.json` et `docs/FINAL_DATABASE_VERIFICATION.md`.
