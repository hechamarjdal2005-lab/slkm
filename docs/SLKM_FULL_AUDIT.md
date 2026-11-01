> Historique : les anciens paquets SQL cités ci-dessous ont été archivés. La seule procédure active est [FINAL_DATABASE](../supabase/FINAL_DATABASE/README.md).

# SLKM — audit technique du dépôt

Audit du 31 octobre 2026, sans refonte graphique. Le dépôt contenait déjà de nombreuses modifications non commitées et un CMS en cours de développement ; elles ont été conservées. Ce rapport distingue les fonctionnalités préexistantes des corrections apportées pendant cet audit. Aucune migration ni écriture de données n’a été exécutée sur Supabase distant.

## Périmètre et preuves

Inspection récursive des sources applicatives, routes, composants, actions, utilitaires, scripts, configurations et de tous les fichiers SQL historiques. `SLKM_REPOSITORY_INVENTORY.json` fournit les empreintes des fichiers lus, les références de tables/RPC, les clés CMS et les textes JSX statiques repérés. Les exports Stitch sont des références de design ; ils ne sont pas des routes actives. Les dépendances, sorties de build, secrets et fichiers binaires sont exclus de l’analyse textuelle.

Routes actives : `/`, `/lignes`, `/irsaliyat`, `/services`, `/about`, `/contact`, `/blog`, `/blog/[slug]`, `/admin`, `/admin/login`, `/api/admin/media`, `/media/[id]`, métadonnées robots/sitemap et nouveau manifeste. Aucun paiement, système de billets persistants ou suivi colis en base n’existe : réservations et suivi transmettent une demande WhatsApp, sans prétendre confirmer une réservation ou livrer un statut de colis.

Les variables locales Supabase URL/anon key/site URL existent. Leurs valeurs ne sont pas publiées. Des HEAD ont initialement renvoyé 204 mais n’ont pas détecté les erreurs de schéma. Le probe a été corrigé en GET `limit=0`, sans lecture d’enregistrements : les treize tables renvoient **404 / PGRST205**, « Could not find the table 'public.…' in the schema cache ». Voir `SLKM_LIVE_READONLY_PROBE.json`. Cela prouve l’indisponibilité des tables dans l’API du projet configuré, pas leur absence physique certaine : vérifier projet, schéma exposé, migrations et cache avec les catalogues SQL. Aucun accès admin ni écriture distante n’a été testé. Les 197 colonnes attendues sont vérifiées localement ; elles ne sont pas validées dans Supabase réel.

## Problèmes découverts et traitements

| Sévérité | Problème observé / fichiers | Traitement et limite |
|---|---|---|
| Haute | `supabase/schema.sql`, politiques `SLKM authenticated media upload/update` : tout compte connecté peut écrire dans les trois buckets historiques. | Les nouvelles versions 01/04 exigent le rôle admin de confiance. L’ancienne migration CMS 04 corrigeait déjà ces politiques lorsqu’elle était appliquée ; le schéma historique seul reste dangereux. Réparation distante non appliquée. |
| Haute | `schema.sql` prétend couvrir une base partielle mais `CREATE TABLE IF NOT EXISTS` ne répare pas les colonnes. | Échec local reproduit : `column "city_fr" does not exist`, lors de l’index `idx_agencies_city_fr` sur une table `agencies(id)` préexistante. Les fichiers 01–03 ajoutent explicitement les colonnes manquantes ; types incompatibles et données nécessitant une décision métier sont bloqués. |
| Haute | `schema.sql` exécute `ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY` sur une table système Supabase. | Retiré du nouveau package ; risque d’erreur de propriétaire suivant le rôle du SQL Editor. Aucun message distant de ce type n’a été observé pendant l’audit. |
| Haute | `supabase/seed.sql` contient des `ON CONFLICT DO UPDATE`, des données commerciales et des demandes d’exemple. | Exclu du package final ; ne pas exécuter sur une base réelle existante. Aucune donnée supprimée ni remplacée. |
| Haute | `package.json`/lock : PostCSS direct et embarqué dans Next.js signalés par npm audit (lecture de fichiers via source maps et sortie CSS non échappée). | Mise à jour PostCSS 8.5.32, override de la même version pour Next.js, sans migration majeure de Next.js. Installation npm : zéro vulnérabilité signalée après correction. |
| Bloquante distante | Toutes les lectures applicatives vers le projet configuré renvoient `PGRST205`. | Probe GET sans lignes et messages serveur concordants. Le frontend fonctionne avec ses secours ; la persistance réelle exige inspection/exécution SQL autorisée. Aucune donnée de démonstration ajoutée. |
| Moyenne | Tables principales définies dans `schema.sql`, hors `supabase/migrations`; les migrations CMS/Messagerie seules ne créent pas le socle. | Package ordonné 00–09 avec prérequis explicites. Un reset basé uniquement sur les anciens fichiers de migrations n’est pas une installation complète. |
| Moyenne | `site-header.tsx` et `site-footer.tsx` : destinations, traductions, ordre et visibilité du menu en dur. | `site_settings.navigation`, validation serveur des destinations existantes, formulaire dans Identité, en-tête/drawer/dock/footer reliés. Les pages restent accessibles quand un lien est masqué. |
| Moyenne | `cms.ts`, `cms-manager.tsx`, layout : un seul logo, favicon seulement ; partage social en dur. | Huit références d’assets, variantes clair/sombre/mobile, Apple/PWA/social, signature FR/AR/EN, accent et restauration par champ. Upload central réutilisé. |
| Moyenne | `cms-store.ts` : les métadonnées OpenGraph d’une page peuvent remplacer celles du layout et perdre l’image de partage par défaut. | Image de page explicite conservée, sinon image de partage configurée propagée dans les métadonnées de page. |
| Moyenne | `src/app/icon.svg` : convention automatique prioritaire susceptible de masquer le favicon configurable. | Même asset déplacé vers `public/icon.svg` ; `generateMetadata` devient la source des icônes. Manifeste dynamique ajouté. |
| Moyenne | `queries.ts` : comportement de cache public implicite. | Fetch public explicitement `no-store` et timeout ; mutations invalident `/` layout et `/admin`, réseau Messagerie invalide ses chemins. Metadata/manifeste/sitemap dynamiques. |
| Moyenne | `actions.ts` : updates/deletes peuvent afficher un succès malgré zéro ligne affectée. | Retour `.select("id").single()` pour mutations métier concernées, statuts et CMS média/sections ; échec si cible absente. |
| Moyenne | `actions.ts` : validation des horaires/classes/jours et taille des formulaires publics incomplète. | Contrôles serveur ajoutés, entier passagers borné et textes publics limités. Les contraintes PostgreSQL restent la seconde barrière. |
| Moyenne | `getAdminSnapshot` journalise les échecs puis renvoie des tableaux vides. | Alerte visible dans `/admin` lorsqu’une requête échoue ; une erreur de schéma n’est plus présentée comme une boîte simplement vide. |
| Moyenne | `analytics_config.stats` lu dans About sans éditeur. | Liste trilingue CRUD/ordre/visibilité dans Paramètres, validation et publication About. Valeurs à documenter par l’entreprise ; secours calculé depuis le nombre réel d’agences. |
| Moyenne | Agences/lignes : pas d’ordre éditable ; tarifs : pas de dépublication. | `sort_order`, contrôles admin et lectures ordonnées ; `parcel_rates.is_active`, filtre public et politique RLS dans 06. |
| Moyenne | `deleteCMSMedia` ne vérifie pas la carte Messagerie et tolère une erreur de lecture des références. | Carte/settings/agences/articles vérifiés, abandon si une lecture échoue ; FK protègent pages/sections. Les assets non utilisés ne sont jamais nettoyés automatiquement. |
| Moyenne | Un média utilisé par le logo ou une carte pouvait être dépublié et provoquer une image manquante. | L’action de dépublication/désactivation vérifie les références settings, agences, Messagerie, articles et CMS ; remplacement des références requis avant retrait. Contrôle serveur implémenté, aller-retour admin distant non testé. |
| Moyenne | `messagerie-network-manager.tsx` : carte par URL uniquement et message affirmant qu’aucun upload n’existe. | Sélecteur de médiathèque existante branché, validation URL partagée avec le CMS. |
| Moyenne | Titres/libellés formulaires Contact/Devis et textes du réseau hors CMS. | 36 entrées éditoriales supplémentaires reliées au provider public et à `08_editorial_defaults.sql`. |
| Faible | `cms-admin-store.ts` cite un guide de migration inexistant. | Référence au vrai `supabase/slkm_final_sql/README_EXECUTION.md`. |
| Faible | Outils PGlite/Playwright utilisés par les scripts mais non déclarés. | Dépendances de développement et scripts npm explicites. |
| Moyenne | Aucun lint autonome configuré ; l’outillage installé pour l’audit signale minimatch vulnérable. | ESLint supporté + parseur TypeScript, règles de validité/sécurité ; override minimatch 11.0.1, lint réussi et audit d’installation sans vulnérabilité. |
| Faible | Tests UI lisent des dimensions pendant un redimensionnement/une animation et supposent des lignes/articles disponibles. | Attente de stabilisation ; absences de données consignées comme BLOCKED, jamais remplacées par des fixtures distantes. |

## Fonctions déjà configurables avant l’audit

Les neuf périmètres du catalogue couvraient déjà les titres, descriptions, héros, images, CTA, SEO et sections principales des pages. `CMSManager` utilise `saveCMSPage`/RPC et des actions de sections/médias réelles ; les boutons ne se limitent pas à l’état React. Les listes flotte, chronologie et offres services étaient déjà sauvegardées dans `site_settings.analytics_config`, avec ordre et état actif. Les agences, lignes, tarifs, blog, messages et devis disposent d’actions Supabase. Le réseau Messagerie utilise exactement `messagerie_network_settings` et `messagerie_agencies`, avec agences indépendantes ou liées à `agencies`.

Le dépôt initial ne contenait aucune table `messagerie_agents`, ni de module distinct de gestion d’agents. Les nouveaux contacts de service sont une liste ordonnée dans `messagerie_agencies.agents` : formulaire, validation serveur, sauvegarde et rendu public intégrés, avec état actif. Le fichier 09 ajoute également photo et coordonnées pour les agences indépendantes. Les photos/coordonnées des agences liées restent gérées dans Agences. Ces contacts sont destinés au public et ne doivent contenir aucun renseignement privé ; comme les listes éditoriales de settings, le JSON de configuration d’une agence publiée peut être lu par l’API, y compris les éléments masqués à l’affichage. La carte réseau reste une image ; un lien Maps est fourni lorsqu’une agence possède des coordonnées. Aucun moteur d’itinéraires fictif n’est ajouté.

## Sécurité : décision et mise en œuvre

Avant correction, le changement annoncé consistait à réserver Storage aux admins et à conserver les sessions existantes. L’architecture a été réutilisée : `authorizedAdminClient` appelle `auth.getUser()` et accepte uniquement `app_metadata.role === admin`, middleware protège `/admin`, API médias vérifie elle-même la session et les server actions vérifient l’autorisation avant écriture. Les politiques du package utilisent le même rôle ; `user_metadata` n’accorde aucun privilège. `is_admin` est SECURITY INVOKER avec search_path vide ; RPC CMS SECURITY INVOKER également. Aucun compte, mot de passe ou rôle n’est créé par le package.

Uploads : UUID généré côté serveur, 5 Mo maximum, MIME déclaré comparé aux signatures JPEG/PNG/WebP/AVIF, SVG/HTML refusés, chemin de stockage non fourni par le client, rollback Storage si insertion metadata échoue. Images brouillon privées ; `/media/{id}` revérifie publication avant URL signée courte ; API admin no-store. Une signature de format n’est pas un décodage complet de l’image ; les dimensions Apple/PWA sont à valider au test d’installation. Les remplacements créent un nouvel asset et conservent l’ancien tant qu’il peut servir ailleurs.

Les vérifications de références JSON avant suppression réduisent les fichiers manquants ; elles ne sont pas une transaction globale couvrant settings, références JSON et Storage. Une suppression de fichier peut échouer après suppression de sa référence : l’action le signale pour nettoyage manuel. Ne pas interpréter ce mécanisme comme une garantie transactionnelle interservices.

La table `site_settings` est publique : contacts, navigation et présentation uniquement. Ne jamais y stocker de secrets SMTP ou destinataires privés. Les demandes sont stockées en base et accessibles aux admins ; aucun e-mail, intégration CRM, paiement ou message WhatsApp n’est envoyé par le code lors de la sauvegarde admin.

## SQL historique : erreurs, dépendances et ordre

| Fichier historique | Constat vérifié / dépendance | Correction |
|---|---|---|
| `supabase/schema.sql` | Échec partiel reproduit sur création d’index après table incomplète ; policies Storage trop larges ; ALTER table système. | 00/01 : gardes de types, ALTER ADD manquants, policies admin, pas d’ALTER Storage système. |
| `supabase/seed.sql` | Dépend du socle ; remplace les lignes en conflit, inclut des exemples de demandes. Ce n’est pas une migration de réparation. | Ne pas l’intégrer aux upgrades ; 05/08 ne sèment que du contenu éditorial manquant. |
| `supabase/messagerie_setup.sql` | Même module que `20261030180000_messagerie_network.sql` ; dépend de `agencies(id uuid,is_active boolean)`, Auth et UUID. | N’en exécuter qu’une version ; package 02 après 01. |
| `20261030180000_messagerie_network.sql` | Prérequis explicites, tables IF NOT EXISTS ; n’ajoute pas les colonnes d’une table déjà partielle. | 02 explicite les colonnes ; 07 inspecte/répare les contraintes. |
| `20261031090000_site_cms_structure.sql` | Dépend de settings/helpers/Storage, refuse un bucket CMS déjà public ; IF NOT EXISTS ne répare pas une table partielle. | 03 après socle, réparation additive ; conflit de bucket à examiner manuellement. |
| `20261031091000_site_cms_policies.sql` | Dépend des quatre tables CMS et du helper admin ; RPC et policies sont réexécutables sur schéma attendu. Aucun défaut syntaxique reproduit dans l’ordre correct. | 04 conserve ce modèle de sécurité. |
| `20261031092000_site_cms_defaults.sql` | Dépend de structure et contraintes uniques ; contenu existant conservé. Aucun défaut syntaxique reproduit dans l’ordre correct. | 05 repris sans écraser l’original ; 08 ajoute les nouvelles clés. |

Les lignes et empreintes originales sont dans l’inventaire ; rechercher les noms précis de policies/index pour retrouver l’instruction. Aucun message d’erreur du SQL Editor de l’utilisateur n’a été fourni : l’erreur locale reproduite ne prétend pas être l’unique cause de ses échecs distants. Les catalogues du projet réel doivent être inspectés avec les requêtes livrées.

## Contenu en dur conservé et justification

Les routes autorisées, noms de champs et statuts de workflow, codes de jours/classes, règles de validation, attributs d’accessibilité, messages d’erreur techniques, icônes et comportement de réservation/suivi restent du code applicatif. Les URL WhatsApp sont construites depuis le téléphone configuré ; le template transactionnel garde les détails réels du trajet. Les pages admin, les états d’erreur/404 et les textes d’authentification ne sont pas du contenu marketing éditable. `TRANSPORT` dans le lockup est le libellé graphique approuvé ; le nom du site et la signature sont configurables. Les textes et assets publics de secours évitent un écran cassé quand un CMS n’est pas encore initialisé ; le dashboard signale alors sa non-disponibilité. Ils ne constituent pas une preuve de connexion réussie.

Le dépôt ne contient pas de page légale active, de carte Contact embarquée ni de système d’e-mail. Aucune page ou configuration sans consommation applicative n’a été inventée. Les galeries existantes sont les listes flotte/chronologie/offres et les sections image/texte. Les composants de formulaire gardent leurs identifiants et règles de validation même si leurs libellés sont traduits depuis le CMS.

Les limitations restantes et les résultats exacts figurent dans `SLKM_FINAL_VERIFICATION_REPORT.md`. Voir également `SLKM_CMS_COVERAGE.md` pour les volumes éditoriaux et l’inventaire machine pour chaque clé/composant.
