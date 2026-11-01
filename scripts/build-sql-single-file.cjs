throw new Error('Historical SQL generator retired. Use supabase/FINAL_DATABASE/README.md. Refresh defaults with scripts/build-final-database-defaults.cjs');
// Package the already ordered, verified migrations into ONE atomic SQL Editor operation.
// No remote execution, no historical business seed, no changes to the source migrations.
const fs = require('node:fs');
const root = 'supabase/slkm_sql_verified/';
const files = JSON.parse(fs.readFileSync(root+'WORKFLOWS.json')).upgrade.filter(file => /^0\d_/.test(file));
let sql = `-- SLKM : exécuter CE FICHIER COMPLET dans Supabase SQL Editor.
-- Installation ou mise à niveau compatible, en une transaction.
-- Ne pas ajouter supabase/seed.sql : ce fichier ne contient aucune donnée commerciale fictive.
-- Si un contrôle échoue, ROLLBACK annule cette opération ; aucun DROP TABLE public.
begin;
set local search_path=pg_catalog,public;
`;
for (const file of files) {
  let source = fs.readFileSync(root+file,'utf8').trim();
  if (source.startsWith('begin;')) {
    if (!source.endsWith('commit;')) throw new Error('Unexpected transaction wrapper: '+file);
    source=source.slice('begin;'.length,-'commit;'.length).trim();
  }
  sql+=`\n-- ===== ${file} =====\n${source}\n`;
}
sql+='\ncommit;\n\n-- Confirmation (lecture seule).\nselect to_regclass(\'public.agencies\') as agencies_table;\n';
fs.writeFileSync(root+'INSTALL_OR_UPGRADE.sql',sql);
console.log('Generated INSTALL_OR_UPGRADE.sql from '+files.length+' ordered migrations; no database contacted.');
