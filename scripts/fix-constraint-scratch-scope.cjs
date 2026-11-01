// One-time, local-only repair. Keep scratch-table lifetime inside each DO statement.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const file = 'supabase/FINAL_DATABASE/02.sql';
let sql = fs.readFileSync(file, 'utf8');
if (sql.includes('-- Scratch objects are created and removed inside EACH DO statement.')) {
  console.log('02.sql already uses statement-local scratch objects.');
  process.exit(0);
}
const declarations = [...sql.matchAll(/^create temporary table "slkm_(expected|actual)_(\w+)" \(like public\."\w+"\) on commit drop;\r?\n/gm)];
assert.equal(declarations.length,26);
sql = sql.replace(/^create temporary table "slkm_(?:expected|actual)_\w+" \(like public\."\w+"\) on commit drop;\r?\n/gm,'');
let blocks = 0;
sql = sql.replace(/do \$\$ declare wanted text; observed text; existing record; matched boolean:=false; begin\r?\n([\s\S]*?)      end \$\$;/g, (statement, body) => {
  const tables = [...new Set([...body.matchAll(/pg_temp\."?slkm_expected_(\w+)"?/g)].map(m=>m[1]))];
  assert.equal(tables.length,1);
  const table = tables[0];
  blocks++;
  return `do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_${table}" (like public."${table}") on commit drop;
        create temporary table pg_temp."slkm_actual_${table}" (like public."${table}") on commit drop;
${body}        drop table pg_temp."slkm_expected_${table}";
        drop table pg_temp."slkm_actual_${table}";
      end $$;`;
});
assert.equal(blocks,69);
sql = sql.replace('-- Unique/primary/check constraints before dependent foreign keys.',`-- Unique/primary/check constraints before dependent foreign keys.
-- Scratch objects are created and removed inside EACH DO statement.
-- No temporary table needs to survive a prior statement, transaction or session.
-- Only empty pg_temp scratch objects are dropped; application tables/data are retained.`);
fs.writeFileSync(file,sql);
console.log(`Repaired ${blocks} self-contained constraint blocks across all 13 tables.`);
