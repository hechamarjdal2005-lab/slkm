const fs=require('node:fs');
const inventory=JSON.parse(fs.readFileSync('docs/SLKM_SQL_SOURCE_INVENTORY.json'));
const explain=file=>{
 if(file==='supabase/schema.sql')return 'Auth/Storage prérequis ; socle testé, risques E02/E05/E06/E11 ; ne pas rejouer après correction.';
 if(file==='supabase/seed.sql')return 'Socle requis ; 42P01 reproduit sans socle ; testé après socle et sur réexécution ; exclu des parcours réels.';
 if(file==='supabase/messagerie_setup.sql')return 'Agencies + Auth/UUID ; doublon du module migration ; ordre valide testé.';
 if(file.includes('20261030180000'))return 'Même module Messagerie ; agencies et helpers requis ; ordre valide testé.';
 if(file.includes('20261031090000'))return 'Socle/settings/helpers/Storage requis ; structure CMS testée.';
 if(file.includes('20261031091000'))return 'Structure CMS et helper admin requis ; policies/RPC testés.';
 if(file.includes('20261031092000'))return 'Tables et contraintes uniques CMS requises ; seed éditorial testé.';
 if(file.startsWith('supabase/slkm_final_sql/'))return file.includes('07_constraints')?'Précédent package : ordre valide testé ; faux conflit équivalent E04 reproduit sur état alternatif.':file.includes('01_core')?'Précédent package : ordre valide testé ; clé agencies manquante E03 reproduite.':'Précédent package : dépendances de sa chaîne 00–09 nécessaires ; exécution ordonnée testée.';
 if(file.includes('/fresh/'))return 'Nouveau : contrôle fresh testé en acceptation et refus sur base installée.';
 if(file.includes('/upgrade/'))return 'Nouveau : revue READ ONLY exécutée dans le parcours upgrade.';
 if(file.endsWith('VALIDATION_QUERIES.sql'))return 'Nouveau : inspection READ ONLY testée avant et après création des tables.';
 return 'Nouveau : exécuté dans les parcours fresh et upgrade, puis réexécuté ; vérifier WORKFLOWS.json.';
};
const text='| Fichier | Lignes | Vérification / dépendances |\n|---|---:|---|\n'+inventory.sql.map(f=>`| \`${f.file}\` | ${f.lines} | ${explain(f.file)} |`).join('\n')+'\n';
const file='docs/SLKM_SQL_AUDIT_FINAL.md';let source=fs.readFileSync(file,'utf8');source=source.replace(/<!-- SQL_INVENTORY_TABLE -->[\s\S]*$/,'<!-- SQL_INVENTORY_TABLE -->\n\n'+text);fs.writeFileSync(file,source);
console.log(`Report table updated with all ${inventory.sql.length} SQL files.`);
