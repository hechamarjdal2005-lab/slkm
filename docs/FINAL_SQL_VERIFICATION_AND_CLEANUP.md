> Historique : les anciens paquets SQL cités ci-dessous ont été archivés. La seule procédure active est [FINAL_DATABASE](../supabase/FINAL_DATABASE/README.md).

# FINAL_SQL — vérification et proposition de nettoyage

## État et autorisation

Le seul package à utiliser pour une nouvelle exécution est `supabase/FINAL_SQL/01.sql` à `09.sql`. Les autres fichiers restent présents comme historique et **ne doivent pas être exécutés avec cette séquence**.

**Aucune suppression n’a été effectuée.** La commande de nettoyage précédente a été interrompue. L’inventaire suivant et les comparaisons SHA-256 confirment que tous les fichiers d’origine vérifiés sont encore présents et identiques à leur sauvegarde. Les suppressions ci-dessous sont uniquement une proposition : elles nécessitent l’approbation explicite de l’utilisateur. Aucun script de nettoyage automatique n’est livré.

## Sauvegarde et intégrité

Archive conservée : `docs/archive/SLKM_SQL_HISTORY.zip`.

- 39 fichiers SQL antérieurs sauvegardés et identiques aux originaux présents.
- 61 fichiers protégés au total : anciens SQL, métadonnées/guides de leurs packages, archive précédente et 12 scripts SQL historiques.
- 61/61 SHA-256 concordants ; zéro fichier protégé absent ou modifié.
- Les empreintes complètes de l’archive et de chaque fichier sont dans `SLKM_SQL_BACKUP_VERIFICATION.json`.
- Les anciens rapports JSON peuvent différer de leur snapshot parce que les résultats de vérification sont actualisés. Ces rapports ne sont pas proposés à la suppression.

La sauvegarde contient les anciennes sources, y compris les versions avec erreurs : elle n’est pas un package d’installation à réexécuter.

## Structure canonique et doublons

L’inspection des 84 fichiers TS/TSX relève 13 tables applicatives requises. Le contrôle couvre 322 références explicites de colonnes, 22 mutations INSERT/UPDATE/UPSERT et les sorties des validateurs CMS calculés. Les champs de logo, icônes, couleurs, navigation et contacts sont dans les settings ; leurs médias sont dans la médiathèque. Aucun schéma branding parallèle n’a été ajouté.

| Table canonique | Fonction distincte |
|---|---|
| agencies | Agences principales, contacts, photos et positions |
| routes | Lignes/horaire/prix, avec deux relations agencies |
| parcel_rates | Tarifs colis |
| corporate_quotes | Demandes de devis privées et workflow admin |
| contact_messages | Messages privés et workflow admin |
| blog_posts | Articles multilingues publiés/brouillons |
| site_settings | Configuration globale, identité, navigation et listes éditoriales |
| messagerie_network_settings | Carte et présentation du réseau colis |
| messagerie_agencies | Participation au réseau colis ou office colis indépendant |
| site_pages | Contenu/SEO/traductions de page |
| site_sections | Blocs de page, ordre et publication |
| site_media_assets | Métadonnées et publication des fichiers uploadés |
| site_page_media | Références entre champs image d’une page et médias |

Les anciens dossiers répètent les définitions de ces mêmes tables ; ils ne prouvent pas l’existence de plusieurs copies physiques. Aucune table alternative du dépôt n’a été identifiée comme un alias métier supplémentaire à fusionner. Les 13 tables ci-dessus ne sont pas 13 doublons.

`agencies` et `messagerie_agencies` ont des fonctions différentes. Une agence liée utilise `agency_id` ; son identité et ses contacts viennent de la table source. Le CHECK interdit de dupliquer ces champs dans la ligne liée et un index unique interdit deux adhésions pour la même agence. Les bureaux indépendants conservent leurs propres coordonnées. Fusionner aveuglément ces tables casserait cette distinction et les interfaces existantes.

Les traductions FR/AR/EN ne sont pas des doublons à supprimer. Les settings globaux et les textes de pages sont deux niveaux de configuration différents. Les assets médias et leurs références de page sont une relation normalisée, pas deux bibliothèques concurrentes.

Le package final contient une seule déclaration de création pour chacune des 13 tables publiques, dans `02.sql`. Les tables temporaires de comparaison dans 03 ne contiennent aucune donnée métier et disparaissent à la fin de sa transaction. Les vérifications ne constatent aucune définition de contrainte dupliquée après exécution ; les policies, triggers et fonctions correspondent au contrat attendu.

## Ce qui a été réparé/conservé

- `agencies` existe avant les INSERT ; les clés uniques/primaires existent avant les FK.
- Les colonnes manquantes sont ajoutées explicitement ; les types incompatibles restent bloquants pour éviter une conversion destructive.
- Les CHECK équivalents sont comparés après normalisation native ; les contraintes NOT VALID compatibles sont validées.
- Les index conflictuels, policies inconnues et changements de visibilité Storage sont signalés plutôt qu’ignorés.
- Pas d’ALTER d’ownership/RLS sur une table système Storage, pas de désactivation de RLS.
- Uploads CMS/Storage réservés aux admins ; données de demandes privées ; aucun rôle admin issu de user_metadata.
- Les anciennes graines commerciales, exemples de devis et faux trajets ne figurent pas dans FINAL_SQL. Le fichier 08 initialise seulement les contenus éditoriaux existants et settings nécessaires au CMS, en préservant les éditions.
- Le dashboard et ses requêtes continuent à utiliser les mêmes tables canoniques ; seul son lien d’aide SQL a été redirigé vers FINAL_SQL. Aucun design public n’a été changé.

## Vérification réelle et limites

`npm run test:sql` exécute la séquence complète en PostgreSQL 18.6 via PGlite, pas un simple contrôle textuel. Les tests couvrent création neuve, base partielle peuplée, 197 colonnes, 77 contraintes PK/UNIQUE/CHECK/FK, 49 policies, 13 triggers et 3 fonctions, conservation des valeurs existantes dans les sept tables métier initiales, conservation d’éditions CMS et réexécution stable des 13 tables. Les tests vérifient aussi les rôles, le RPC CMS, la confidentialité des demandes et l’interdiction de doubler une agence liée ou de copier son identité.

Les résultats exacts et les fichiers réellement exécutés sont dans `SLKM_SQL_TEST_RESULTS.json`. La comparaison du code est dans `SLKM_SQL_SOURCE_INVENTORY.json`.

Les services Auth/Storage sont des schémas minimaux de test, pas les services hébergés. Le dernier probe réel de lecture renvoie PGRST205 pour les 13 tables. Leur schéma physique, les alias éventuels et les permissions réelles restent non vérifiés ; aucune fusion ou migration de production n’est exécutée.

`09.sql` fournit un inventaire des tables inattendues, des structures identiques et des policies/triggers/fonctions redondants, plus des candidats de rapprochement d’agences. Ces résultats sont des **candidats à examiner**, pas une autorisation de suppression. Si un alias réel contient des données, il faut d’abord recueillir son schéma, sauvegarder les deux tables, définir une correspondance explicite des colonnes et identifiants, résoudre les collisions sans écrasement, recopier les données dans une transaction contrôlée et vérifier les FK et totaux. Une éventuelle suppression de l’alias exige une nouvelle approbation explicite. Aucun script de fusion spéculatif vers des noms de tables inventés n’est produit.

## Proposition de suppression — EN ATTENTE D’APPROBATION

Les 20 chemins suivants correspondent aux 61 fichiers protégés sauvegardés. Les chemins de dossier désignent aussi leur contenu. **Ils sont tous conservés pour l’instant.**

| Chemin proposé | Pourquoi il est redondant ou obsolète |
|---|---|
| supabase/schema.sql | Ancien socle recouvert par FINAL_SQL ; policies Storage historiques trop larges. |
| supabase/seed.sql | Seed commercial d’exemple susceptible de remplacer les données ; non requis par FINAL_SQL. |
| supabase/messagerie_setup.sql | Version autonome du même module que l’ancienne migration Messagerie. |
| supabase/migrations/ | Anciennes définitions chevauchantes, remplacées par le parcours complet FINAL_SQL ; conservation possible si historique CLI à garder. |
| supabase/slkm_final_sql/ | Première livraison dérivée, mêmes tables, remplacée. |
| supabase/slkm_sql_verified/ | Livraison précédente, mêmes tables et parcours alternatifs, remplacée. |
| supabase/SLKM_SQL_ORDRE/ | Copie numérotée précédente du même SQL, remplacée. |
| supabase/SLKM_SQL_ORDRE.zip | Archive de livraison obsolète ; les sources sont aussi dans la sauvegarde historique conservée. |
| scripts/build-cms-seed.cjs | Réécrit un ancien fichier de migration. |
| scripts/build-final-sql.cjs | Régénère un ancien package concurrent. |
| scripts/build-schema-guards.cjs | Régénère les gardes de cet ancien package. |
| scripts/build-sql-verified.cjs | Régénère une ancienne livraison concurrente. |
| scripts/build-sql-single-file.cjs | Produit l’ancienne alternative monofichier. |
| scripts/prepare-numbered-sql.cjs | Produit le précédent dossier numéroté concurrent. |
| scripts/test-cms-sql.cjs | Test dépendant des anciens chemins ; couvert par le test canonique actuel. |
| scripts/verify-final-sql.cjs | Test du premier package ; remplacé pour FINAL_SQL. |
| scripts/test-sql-verified.cjs | Test de la livraison précédente, chemins anciens. |
| scripts/test-sql-single-file.cjs | Test de l’alternative monofichier précédente. |
| scripts/write-sql-audit-table.cjs | Génère le tableau des anciennes livraisons. |
| scripts/sql-verified-support.cjs | Helper du précédent ensemble de tests ; FINAL_SQL utilise sql-test-support.cjs. |

**À conserver** : `supabase/FINAL_SQL/`, l’archive `docs/archive/SLKM_SQL_HISTORY.zip`, les preuves de hash/tests, `scripts/test-final-sql.cjs`, `scripts/sql-test-support.cjs`, `scripts/sql-schema-contract.json`, l’auditeur de sources et tous les fichiers applicatifs. Aucune table Supabase n’est proposée à la suppression dans ce nettoyage de fichiers.

Il reste à obtenir l’approbation explicite de cette liste avant toute suppression. Rien ne sera supprimé du simple fait que les tests réussissent.
