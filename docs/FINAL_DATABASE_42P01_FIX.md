# Correctif 42P01 : slkm_expected_agencies

Fichier corrigé : `supabase/FINAL_DATABASE/02.sql`.

## Diagnostic

La version précédente déclarait bien `CREATE TEMPORARY TABLE slkm_expected_agencies (LIKE public.agencies) ON COMMIT DROP` au début du fichier. Ce n'était donc ni une table métier manquante ni une faute de nom. Tous les accès suivants étaient dans les blocs de comparaison des contraintes de `agencies` : ajout de contrainte, lecture de `pg_constraint` via `regclass`, puis retrait de contrainte.

Ces accès dépendaient de tables temporaires créées par des instructions antérieures. Une table temporaire n'est pas conservée entre sessions ; `ON COMMIT DROP` la supprime à la fin de la transaction. Voir la [documentation PostgreSQL](https://www.postgresql.org/docs/18/sql-createtable.html). Une exécution partielle ou séparée peut donc produire 42P01. Le fichier complet dans une transaction unique passait les anciens tests locaux ; le message fourni ne permet pas de certifier exactement quelle limite de transaction/session a été rencontrée dans le SQL Editor réel.

Le nouveau test reproduit effectivement 42P01 en créant la table temporaire dans une transaction puis en essayant de l'utiliser après son commit. Il étend ainsi les tests antérieurs, qui ne couvraient pas cette séparation.

## Modification

Les 26 déclarations temporaires globales ont été retirées du début du fichier. Chacun des **69 blocs de contraintes**, sur les **13 tables**, crée maintenant ses deux tables temporaires avant leur première référence et les supprime explicitement à la fin du même bloc. Toutes les références sont qualifiées `pg_temp`. La normalisation des contraintes PostgreSQL reste inchangée, afin de conserver la comparaison correcte des expressions et conversions de types.

Seules les tables temporaires vides créées par le bloc courant sont supprimées. Aucun `DROP TABLE public`, aucune suppression de ligne ni désactivation de contrainte n'a été ajouté. Une contrainte contradictoire ou des données invalides continuent de provoquer un arrêt pour examen.

Inspection complète de `01.sql` à `09.sql` : aucun autre fichier ne crée ou ne référence `pg_temp`, `slkm_expected_*` ou `slkm_actual_*`. Chaque fichier contient sa propre transaction et son propre réglage de chemin de recherche ; les dépendances persistantes suivent l'ordre numéroté.

## Vérifications

- Ancien 42P01 reproduit dans PostgreSQL isolé.
- 69 blocs contrôlés : création avant référence et nettoyage dans le même bloc.
- 218 instructions de `02.sql` exécutées séparément avec `DISCARD TEMP` avant chaque instruction : succès, zéro table temporaire résiduelle.
- Installation `01.sql` à `09.sql`, avec fermeture/réouverture de PostgreSQL entre chaque fichier : succès.
- Un enregistrement agence est présent avant l'installation des contraintes et reste strictement identique après celle-ci.
- Réexécution de `02.sql` seul dans une nouvelle session, sur le schéma complet : les instantanés des 13 tables restent identiques, avec 77 contraintes et aucune duplication.
- Suite SQL complète : schéma, conservation des données existantes, réexécutions, RLS, Storage simulé, CMS et CRUD.

Le test spécifique compte **578 contrôles**. Rapport : `docs/FINAL_DATABASE_SESSION_TESTS.json`. Commande : `node scripts/test-sql-editor-sessions.cjs`, également incluse dans `npm run test:sql`. PostgreSQL est exécuté via PGlite ; Auth/Storage sont simulés, aucun service Supabase distant n'est modifié.

Une copie de l'ancien fichier est conservée dans `docs/archive/SQL02_BEFORE_TEMP_SCOPE_FIX.zip`. Le paquet SQL actif reste unique.

## Fichier à relancer dans Supabase

Si `01.sql` a réussi : exécuter **le nouveau `02.sql` complet**. Si nécessaire, exécuter `ROLLBACK;` avant de le relancer. Continuer ensuite avec les fichiers non encore exécutés, dans l'ordre `03.sql` à `09.sql`. Ne pas effacer les tables déjà créées et ne pas restaurer les anciennes migrations.

Si tous les fichiers suivants avaient déjà réussi, seul `02.sql` doit être corrigé/réexécuté ; `08.sql` et `09.sql` peuvent ensuite être relancés pour vérification.
