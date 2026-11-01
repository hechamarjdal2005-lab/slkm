// Isolated PostgreSQL regression for SQL Editor transaction/session boundaries.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {PGlite} = require('@electric-sql/pglite');
const {isolatedDatabase,executeFiles} = require('./sql-test-support.cjs');
const contract = require('./sql-schema-contract.json');
const root = 'supabase/FINAL_DATABASE/';
const files = Array.from({length:9},(_,i)=>root+String(i+1).padStart(2,'0')+'.sql');
const sql = fs.readFileSync(root+'02.sql','utf8');
const blocks = [...sql.matchAll(/do \$\$[\s\S]*?end \$\$;/g)].map(m=>m[0]);
let checks=0;
const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
async function main() {
  equal(blocks.length,69);
  for(const block of blocks) {
    const refs=[...new Set([...block.matchAll(/pg_temp\."?(slkm_(?:expected|actual)_\w+)"?/g)].map(m=>m[1]))];
    equal(refs.length,2);
    for(const name of refs) {
      const creation=block.indexOf(`create temporary table pg_temp."${name}"`);
      assert.ok(creation>=0 && creation<block.indexOf(`alter table pg_temp."${name}"`));checks++;
      assert.ok(block.includes(`drop table pg_temp."${name}";`));checks++;
    }
  }
  for(const file of files.filter(f=>!f.endsWith('/02.sql'))) {
    equal(/pg_temp|create\s+temp(?:orary)?\s+table|slkm_expected_|slkm_actual_/i.test(fs.readFileSync(file,'utf8')),false);
  }
  const artifacts=path.resolve('artifacts');fs.mkdirSync(artifacts,{recursive:true});
  const dataDir=fs.mkdtempSync(path.join(artifacts,'sql-editor-sessions-'));
  let db;
  try {
    db=await isolatedDatabase(dataDir);
    await executeFiles(db,[files[0]]);
    // Reproduce the old failure if CREATE and use run in different transactions.
    await db.exec('create temporary table slkm_expected_agencies (like public.agencies) on commit drop');
    await assert.rejects(()=>db.exec('do $$ begin alter table pg_temp.slkm_expected_agencies add primary key(id); end $$;'),e=>e.code==='42P01');checks++;
    // A real application record exists before constraint installation.
    await db.exec(`insert into public.agencies(id,city_fr,city_ar,city_en,agency_name_fr,agency_name_ar,agency_name_en,address_fr,address_ar,address_en)
      values('11111111-1111-4111-8111-111111111111','Local','محلي','Local','Local','محلي','Local','Local','محلي','Local')`);
    const recordBefore=(await db.query('select to_jsonb(a) as value from public.agencies a')).rows[0].value;
    // Run each DO and NOT NULL statement separately, clearing temporary state each time.
    const statements=[...sql.matchAll(/do \$\$[\s\S]*?end \$\$;|^alter table public\.[^;]+;/gm)].map(m=>m[0]);
    assert.ok(statements.length>69);checks++;
    for(const statement of statements) {
      await db.exec('discard temp');
      await db.exec(statement);
      equal((await db.query("select count(*)::int as n from pg_class where relnamespace=pg_my_temp_schema() and relkind='r'")).rows[0].n,0);
    }
    equal((await db.query('select to_jsonb(a) as value from public.agencies a')).rows[0].value,recordBefore);
    // Close and reopen PostgreSQL between EVERY numbered file.
    const executions=[];
    for(const file of files) {
      await db.close();db=new PGlite(dataDir);
      await executeFiles(db,[file]);
      executions.push({file,newSession:true,status:'PASS'});
    }
    const snapshot=async()=>{
      const result={};
      for(const table of contract.tables) result[table]=(await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by id),'[]'::jsonb) as value from public.${table} t`)).rows[0].value;
      return result;
    };
    const before=await snapshot();
    await db.close();db=new PGlite(dataDir);
    await executeFiles(db,[files[1]]); // Repeating ONLY the corrected 02.sql is safe.
    equal(await snapshot(),before);
    equal((await db.query('select to_jsonb(a) as value from public.agencies a')).rows[0].value,recordBefore);
    equal((await db.query("select count(*)::int as n from pg_constraint where connamespace='public'::regnamespace and contype in ('p','u','c','f')")).rows[0].n,77);
    const result={date:new Date().toISOString(),status:'PASS',checks,original42P01Reproduced:true,selfContainedConstraintBlocks:69,separatelyCommittedStatements:statements.length,numberedFilesInNewSessions:executions,rerunOnly02:'PASS; all 13 table snapshots unchanged',remoteWrites:false};
    fs.writeFileSync('docs/FINAL_DATABASE_SESSION_TESTS.json',JSON.stringify(result,null,2));
    console.log(`SQL Editor session regression: ${checks} checks PASS; old 42P01 reproduced; ${statements.length} independent statements; all 9 files in new sessions; rerun 02 preserves all data.`);
  } finally {
    if(db)await db.close();
    // Delete only this test's generated local database, never application data.
    if(path.dirname(dataDir)!==artifacts || !path.basename(dataDir).startsWith('sql-editor-sessions-'))throw new Error('Unexpected isolated database cleanup path');
    fs.rmSync(dataDir,{recursive:true,force:true});
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
