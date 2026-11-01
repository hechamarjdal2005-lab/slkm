// Compatibility entry point: the archived packages are no longer active.
require('./test-final-sql.cjs'); return;
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {isolatedDatabase,executeFiles}=require('./sql-verified-support.cjs');
const file='supabase/slkm_sql_verified/INSTALL_OR_UPGRADE.sql';
const scalar=async(db,sql)=>(await db.query(sql)).rows[0].value;
async function main(){
  let checks=0;
  for(const legacy of [false,true]){
    const db=await isolatedDatabase();
    try{
      if(legacy){
        await executeFiles(db,['supabase/schema.sql','supabase/seed.sql']);
        await db.exec("update public.agencies set agency_name_fr='Local preserved edit'");
      }
      const before=legacy?await scalar(db,'select count(*)::int as value from public.agencies'):0;
      await executeFiles(db,[file]);
      assert.equal(await scalar(db,"select to_regclass('public.agencies')::text as value"),'agencies');checks++;
      assert.equal(await scalar(db,"select count(*)::int as value from information_schema.tables where table_schema='public'"),13);checks++;
      assert.equal(await scalar(db,'select count(*)::int as value from public.agencies'),before);checks++;
      if(legacy){assert.equal(await scalar(db,"select count(*)::int as value from public.agencies where agency_name_fr='Local preserved edit'"),before);checks++;}
      await executeFiles(db,[file]);checks++;
      await executeFiles(db,['supabase/slkm_sql_verified/VALIDATION_QUERIES.sql']);checks++;
    }finally{await db.close();}
  }
  const rollback=await isolatedDatabase();
  try{
    const sql=fs.readFileSync(file,'utf8').replace(/\ncommit;\n\n-- Confirmation/,"\ndo $$ begin raise exception 'Deliberate local rollback test'; end $$;\ncommit;\n\n-- Confirmation");
    await assert.rejects(()=>rollback.exec(sql));await rollback.exec('rollback');
    assert.equal(await scalar(rollback,"select to_regclass('public.agencies')::text as value"),null);checks++;
  }finally{await rollback.close();}
  fs.writeFileSync('docs/SLKM_SQL_SINGLE_FILE_TEST.json',JSON.stringify({date:new Date().toISOString(),file,checks,status:'PASS',scope:'Real isolated PostgreSQL via PGlite; fresh + populated legacy + reruns + transaction rollback; no remote writes'},null,2));
  console.log(`${checks} single-file PostgreSQL checks passed; fresh installation, existing data preservation, reruns and atomic rollback.`);
}
main().catch(error=>{console.error(error.message,error.sqlFile||'');process.exitCode=1;});
