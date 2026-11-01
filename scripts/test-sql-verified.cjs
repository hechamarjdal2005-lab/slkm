// Compatibility entry point: the archived packages are no longer active.
require('./test-final-sql.cjs'); return;
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {isolatedDatabase, executeFiles} = require('./sql-verified-support.cjs');
const root='supabase/slkm_sql_verified';
const workflows=JSON.parse(fs.readFileSync(root+'/WORKFLOWS.json'));
const contract=JSON.parse(fs.readFileSync(root+'/SCHEMA_CONTRACT.json'));
const checks=[];
const versions=[];
const legacyErrors={};
const pass=(name,fn)=>{fn();checks.push(name);};
const value=async(db,sql)=>(await db.query(sql)).rows[0].value;
async function fails(db,sql,code,name){let error;try{await db.exec(sql);}catch(e){error=e;try{await db.exec('rollback');}catch{}}assert.ok(error,name);if(code)assert.equal(error.code,code);checks.push(name);return {code:error.code,message:error.message};}
async function run(db,workflow){await executeFiles(db,workflows[workflow].map(f=>root+'/'+f));}
async function assertContract(db,label){
 const cols=(await db.query(`select c.relname as table_name,a.attname as column_name,format_type(a.atttypid,a.atttypmod) as data_type,a.attnotnull as required,pg_get_expr(d.adbin,d.adrelid) as default_sql from pg_attribute a join pg_class c on c.oid=a.attrelid left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum where c.relnamespace='public'::regnamespace and c.relkind='r' and a.attnum>0 and not a.attisdropped order by c.relname,a.attnum`)).rows;
 const sorted=rows=>[...rows].sort((a,b)=>(a.table_name+'.'+a.column_name).localeCompare(b.table_name+'.'+b.column_name));
 pass(label+': all 197 column definitions/defaults/nullability match',()=>assert.deepEqual(sorted(cols),sorted(contract.columns)));
 for(const c of contract.constraints){const definitions='array['+c.accepted_definitions.map(d=>'$q$'+d+'$q$').join(',')+']';const count=await value(db,`select count(*)::int as value from pg_constraint k join pg_class t on t.oid=k.conrelid where t.relnamespace='public'::regnamespace and t.relname='${c.table_name}' and pg_get_constraintdef(k.oid)=any(${definitions}) and k.convalidated`);assert.ok(count>0,`${label}: ${c.table_name}.${c.name}`);}
 checks.push(label+': all 77 constraints validated');
 const indexes=(await db.query(`select t.relname as table_name,c.relname as name,pg_get_indexdef(i.indexrelid) as definition from pg_index i join pg_class t on t.oid=i.indrelid join pg_class c on c.oid=i.indexrelid where t.relnamespace='public'::regnamespace and not exists(select 1 from pg_constraint k where k.conindid=i.indexrelid) order by t.relname,c.relname`)).rows;
 pass(label+': all non-constraint indexes match',()=>assert.deepEqual(indexes,contract.indexes));
 const triggers=(await db.query(`select c.relname as table_name,t.tgname as name,pg_get_triggerdef(t.oid) as definition from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relnamespace='public'::regnamespace and not t.tgisinternal order by c.relname,t.tgname`)).rows;
 pass(label+': all triggers match',()=>assert.deepEqual(triggers,contract.triggers));
 const policies=(await db.query(`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname`)).rows;
 pass(label+': all 49 policies match',()=>assert.deepEqual(policies,contract.policies));
 const grants=(await db.query(`select grantee,table_name,privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated','service_role') order by table_name,grantee,privilege_type`)).rows;
 pass(label+': all API table grants match',()=>assert.deepEqual(grants,contract.grants));
 pass(label+': RLS on 13 tables',()=>{});assert.equal(await value(db,`select count(*)::int as value from pg_class where relnamespace='public'::regnamespace and relkind='r' and relrowsecurity`),13);
}
async function main(){
 const fresh=await isolatedDatabase();
 let reproduced;
 try{
   versions.push(await value(fresh,'select version() as value'));
   reproduced=await fails(fresh,fs.readFileSync('supabase/seed.sql','utf8'),'42P01','Original seed before schema reproduces missing public.agencies');
   assert.match(reproduced.message,/public.agencies/);
   await executeFiles(fresh,[root+'/VALIDATION_QUERIES.sql']); checks.push('Read-only inspector executes before application tables exist');
   await run(fresh,'fresh');checks.push('Complete fresh workflow including verification executes');
   await assertContract(fresh,'Fresh');
   const fk=contract.constraints.find(c=>c.table_name==='routes'&&c.kind==='f');
   await fresh.exec(`alter table public.routes drop constraint "${fk.name}";alter table public.routes add constraint "${fk.name}" ${fk.definition} not valid`);
   await executeFiles(fresh,[root+'/04_foreign_keys.sql']);
   assert.equal(await value(fresh,`select convalidated as value from pg_constraint where conrelid='public.routes'::regclass and conname='${fk.name}'`),true);checks.push('Existing NOT VALID foreign key is genuinely validated');
   const check=contract.constraints.find(c=>c.table_name==='contact_messages'&&c.kind==='c');
   await fresh.exec(`alter table public.contact_messages drop constraint "${check.name}";alter table public.contact_messages add constraint "${check.name}" ${check.definition} not valid`);
   await executeFiles(fresh,[root+'/02_keys_and_checks.sql']);
   assert.equal(await value(fresh,`select convalidated as value from pg_constraint where conrelid='public.contact_messages'::regclass and conname='${check.name}'`),true);checks.push('Existing NOT VALID check is genuinely validated');
   legacyErrors.constraintText=await fails(fresh,fs.readFileSync('supabase/slkm_final_sql/07_constraints_verification.sql','utf8'),'P0001','Prior final package falsely rejects equivalent CHECK cast renderings');
   await executeFiles(fresh,[root+'/02_keys_and_checks.sql']);checks.push('Native normalization accepts equivalent CHECK constraints safely');
   assert.equal(await value(fresh,'select count(*)::int as value from public.agencies'),0);checks.push('No invented transport business records seeded');
   assert.equal(await value(fresh,'select count(*)::int as value from public.site_pages'),9);checks.push('Nine approved editorial scopes seeded');
   await fails(fresh,fs.readFileSync(root+'/fresh/00_assert_fresh.sql','utf8'),'P0001','Fresh-only guard refuses an existing application database');
   await run(fresh,'upgrade');await assertContract(fresh,'Rerun');
   await fresh.exec(`set role anon;select set_config('request.jwt.claims','{}',false)`);
   await fails(fresh,`insert into public.agencies(city_fr) values('Denied')`,'42501','Anonymous CMS/agency insert denied');
   await fails(fresh,`select * from public.contact_messages`,'42501','Anonymous contact submission reads denied');
   await fails(fresh,`select * from public.corporate_quotes`,'42501','Anonymous quote reads denied');
   await fresh.exec(`insert into public.contact_messages(full_name,email,subject,message) values('Local test','local@example.invalid','Local test','Local integration test only');
     insert into public.corporate_quotes(company_name,contact_person,phone,email,service_type,passenger_count,origin_city,destination_city) values('Local','Local','000','local@example.invalid','personnel',1,'A','B')`);checks.push('Public contact/quote inserts genuinely persisted locally');
   await fails(fresh,`insert into public.contact_messages(full_name,email,subject,message,status) values('Local','local@example.invalid','Local','Local integration test only','replied')`,'42501','Public cannot insert privileged contact status');
   await fresh.exec(`set role authenticated;select set_config('request.jwt.claims','{"user_metadata":{"role":"admin"}}',false)`);
   assert.equal(await value(fresh,'select public.is_admin() as value'),false);checks.push('Editable user metadata does not grant admin');
   await fails(fresh,`insert into storage.objects(bucket_id,name) values('agencies-media','denied.png')`,'42501','Regular authenticated Storage upload denied');
   await fresh.exec(`update public.site_settings set support_phone='forbidden' where id=1`);
   assert.notEqual(await value(fresh,'select support_phone as value from public.site_settings where id=1'),'forbidden');checks.push('Non-admin update affects no settings row');
   await fresh.exec(`select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false);
     update public.contact_messages set status='replied';update public.corporate_quotes set status='contacted';
     insert into storage.objects(bucket_id,name) values('agencies-media','admin.png');`);
   assert.equal(await value(fresh,'select status as value from public.contact_messages'),'replied');checks.push('Admin status change genuinely persisted locally');
   await fresh.exec(`insert into public.site_media_assets(id,storage_path,filename,mime_type,size_bytes,is_published) values
     ('11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111.png','Draft','image/png',100,false),
     ('22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222.png','Published','image/png',100,true);
     insert into storage.objects(bucket_id,name) values('site-media','11111111-1111-4111-8111-111111111111.png'),('site-media','22222222-2222-4222-8222-222222222222.png');
     set role anon;`);
   assert.equal(await value(fresh,'select count(*)::int as value from public.site_media_assets'),1);checks.push('Draft media metadata hidden from public');
   assert.equal(await value(fresh,"select count(*)::int as value from storage.objects where bucket_id='site-media'"),1);checks.push('Draft private Storage object hidden from public');
   await fresh.exec(`reset role;set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`);
   const before=await value(fresh,"select title_fr as value from public.site_pages where slug='home'");
   await fails(fresh,`select public.save_site_cms_page('home','{"title_fr":"Must roll back","hero_overlay":0.7,"content":{"copy":{}}}', '{"image_a12345678901":"/media/11111111-1111-4111-8111-111111111111"}')`,'P0001','CMS RPC rejects draft asset and rolls back page edit');
   assert.equal(await value(fresh,"select title_fr as value from public.site_pages where slug='home'"),before);checks.push('RPC atomic rollback preserved prior content');
   await fresh.query('select public.save_site_cms_page($1,$2::jsonb,$3::jsonb)',['home',JSON.stringify({title_fr:'Persisted local RPC edit',hero_overlay:.7,content:{copy:{}}}),JSON.stringify({image_a12345678901:'/media/22222222-2222-4222-8222-222222222222'})]);
   assert.equal(await value(fresh,"select title_fr as value from public.site_pages where slug='home'"),'Persisted local RPC edit');checks.push('CMS RPC positively persists page and published media references');
   await fresh.exec('reset role');
 } finally {await fresh.close();}
 const missingColumn=await isolatedDatabase();try{
   await missingColumn.exec('create table public.agencies(id uuid primary key default gen_random_uuid())');
   legacyErrors.missingColumn=await fails(missingColumn,fs.readFileSync('supabase/schema.sql','utf8'),'42703','Original schema fails on an incomplete existing agencies table');
 }finally{await missingColumn.close();}
 const missingKey=await isolatedDatabase();try{
   const agencyDDL=fs.readFileSync(root+'/01_tables_and_columns.sql','utf8').match(/create table if not exists public\."agencies" \([\s\S]*?\n\);/)[0];
   await missingKey.exec(agencyDDL);
   legacyErrors.missingKey=await fails(missingKey,fs.readFileSync('supabase/slkm_final_sql/01_core_schema_and_storage.sql','utf8'),'42830','Prior package references agency ID before repairing its missing unique key');
   await run(missingKey,'upgrade');await assertContract(missingKey,'Agency-only partial');
 }finally{await missingKey.close();}
 const owner=await isolatedDatabase();try{
   await owner.exec('create role restricted_migrator;grant usage,create on schema public to restricted_migrator;grant usage on schema auth,storage to restricted_migrator;grant select,insert,update on storage.buckets to restricted_migrator;set role restricted_migrator');
   legacyErrors.storageOwner=await fails(owner,fs.readFileSync('supabase/schema.sql','utf8'),'42501','Original schema unnecessarily ALTERs a system-owned Storage table');
   assert.equal(await value(owner,"select to_regclass('public.agencies')::text as value"),null);checks.push('Failure later in original schema transaction rolls back earlier agencies creation');
   await fails(owner,fs.readFileSync(root+'/00_prerequisites.sql','utf8'),'P0001','New preflight explains insufficient migration-role privileges before DDL');
 }finally{await owner.close();}
 // Representative non-empty legacy installation: actual historical seed, only in this disposable database.
 const upgrade=await isolatedDatabase();
 try{
   await executeFiles(upgrade,['supabase/schema.sql','supabase/seed.sql']);checks.push('Historical business seed executes after base schema');
   const oldId=await value(upgrade,'select id::text as value from public.agencies order by id limit 1');
   await upgrade.exec(`update public.agencies set agency_name_fr='Preserved real edit' where id='${oldId}'`);
   const countBefore=await value(upgrade,'select count(*)::int as value from public.agencies');
   // Missing optional column and missing PK before a dependent table is installed.
   await upgrade.exec('alter table public.agencies drop column image_url;alter table public.blog_posts drop constraint blog_posts_pkey');
   const snapshots=[];
   for(const table of ['agencies','routes','parcel_rates','corporate_quotes','contact_messages','blog_posts','site_settings']) {
     const columns=(await upgrade.query(`select column_name from information_schema.columns where table_schema='public' and table_name='${table}' order by ordinal_position`)).rows.map(r=>r.column_name);
     const sql=`select coalesce(jsonb_agg(to_jsonb(a) order by a.id),'[]'::jsonb) as value from (select ${columns.map(c=>'"'+c+'"').join(',')} from public.${table}) a`;
     snapshots.push({table,sql,rows:await value(upgrade,sql)});
   }
   await run(upgrade,'upgrade'); await assertContract(upgrade,'Legacy upgrade');
   for(const s of snapshots)assert.deepEqual(await value(upgrade,s.sql),s.rows,s.table+': all original values preserved');checks.push('All original values in all seven seeded legacy tables are preserved');
   assert.equal(await value(upgrade,`select agency_name_fr as value from public.agencies where id='${oldId}'`),'Preserved real edit');checks.push('Upgrade preserves edited agency content');
   assert.equal(await value(upgrade,'select count(*)::int as value from public.agencies'),countBefore);checks.push('Upgrade preserves agency row count');
   await upgrade.exec(`update public.site_pages set title_fr='Preserved CMS edit',content=jsonb_set(content,'{copy,text_custom}', '{"fr":"Custom","ar":"Custom","en":"Custom"}') where slug='home'`);
   await run(upgrade,'upgrade');
   assert.equal(await value(upgrade,"select title_fr as value from public.site_pages where slug='home'"),'Preserved CMS edit');checks.push('Rerun preserves CMS SEO edits');
   assert.equal(await value(upgrade,"select content->'copy'->'text_custom'->>'fr' as value from public.site_pages where slug='home'"),'Custom');checks.push('Rerun preserves extra editorial keys');
   await fails(upgrade,`delete from public.agencies where id='${oldId}'`,'23001','Transport FK prevents removal of referenced agency');
   const from=await value(upgrade,'select id::text as value from public.agencies order by id limit 1');
   await fails(upgrade,`insert into public.routes(from_agency_id,to_agency_id,departure_time,arrival_time,price_mad) values('${from}','ffffffff-ffff-4fff-8fff-ffffffffffff','10:00','11:00',1)`,'23503','Unknown route destination rejected by FK');
   await upgrade.exec('create policy unexpected_public_write on public.agencies for all to anon using(true) with check(true)');
   await fails(upgrade,fs.readFileSync(root+'/00_prerequisites.sql','utf8'),'P0001','Unknown permissive policy blocks upgrade before changes');
   await upgrade.exec('drop policy unexpected_public_write on public.agencies');
   await upgrade.exec("alter table public.agencies alter column city_fr type text");
   await fails(upgrade,fs.readFileSync(root+'/00_prerequisites.sql','utf8'),'P0001','Incompatible existing column type safely blocks automatic upgrade');
 } finally {await upgrade.close();}
 // Previously-failing dependency: agencies exists without a PK; routes must be created before FK, then keys restored.
 const partial=await isolatedDatabase();try{
   await partial.exec('alter default privileges in schema public grant select,insert,update,delete on tables to anon,authenticated');
   await executeFiles(partial,[root+'/00_prerequisites.sql',root+'/01_tables_and_columns.sql']);
   await partial.exec('set role anon');
   await fails(partial,'select * from public.site_media_assets','42501','New tables remain inaccessible even when API default grants would expose them');
   await partial.exec('reset role');
   await run(partial,'upgrade');await assertContract(partial,'Partial without keys');checks.push('All-table partial schema repaired without premature FK references');
   await partial.exec("update storage.buckets set public=true where id='site-media'");
   await fails(partial,fs.readFileSync(root+'/03_storage_buckets.sql','utf8'),'P0001','Bucket visibility conflict blocks silently exposing/changing assets');
 }finally{await partial.close();}
 const drift=await isolatedDatabase();try{
   await run(drift,'fresh');
   await drift.exec('drop index public.idx_agencies_city_fr;create index idx_agencies_city_fr on public.agencies(city_ar)');
   await fails(drift,fs.readFileSync(root+'/05_functions_triggers_indexes.sql','utf8'),'P0001','Existing index with wrong definition is detected, not silently skipped');
   await drift.exec("insert into public.contact_messages(full_name,email,subject,message) values('Preserve me','local@example.invalid','Local','Local test');alter table public.contact_messages alter column subject drop not null;update public.contact_messages set subject=null");
   await fails(drift,fs.readFileSync(root+'/02_keys_and_checks.sql','utf8'),'23502','Existing NULLs block NOT NULL enforcement without fabricated backfills');
   assert.equal(await value(drift,'select count(*)::int as value from public.contact_messages where subject is null'),1);checks.push('Failed NOT NULL upgrade preserves existing rows');
 }finally{await drift.close();}
 // Read every historical file by genuinely executing its documented dependency path.
 const historical=await isolatedDatabase();try{
   await executeFiles(historical,['supabase/schema.sql','supabase/seed.sql']);
   await historical.exec(`set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{}}',false);insert into storage.objects(bucket_id,name) values('agencies-media','legacy-non-admin-upload.png');reset role;`);
   assert.equal(await value(historical,"select count(*)::int as value from storage.objects where name='legacy-non-admin-upload.png'"),1);checks.push('Historical Storage policy weakness reproduced: non-admin upload succeeds before repair');
   await historical.exec("update public.agencies set agency_name_fr='Local test edit to preserve'");
   await executeFiles(historical,['supabase/seed.sql']);
   assert.equal(await value(historical,"select count(*)::int as value from public.agencies where agency_name_fr='Local test edit to preserve'"),0);checks.push('Historical seed overwrites business edits on rerun; excluded from new production workflow');
   await executeFiles(historical,['supabase/messagerie_setup.sql',...fs.readdirSync('supabase/migrations').sort().map(f=>'supabase/migrations/'+f)]);
   checks.push('All seven historical SQL files execute in their correct dependency order');
   await executeFiles(historical,fs.readdirSync('supabase/slkm_final_sql').filter(f=>/^\d.*\.sql$/.test(f)).sort().map(f=>'supabase/slkm_final_sql/'+f));
   await executeFiles(historical,['supabase/slkm_final_sql/VALIDATION_QUERIES.sql']);checks.push('All eleven prior-final SQL files execute in documented order');
 }finally{await historical.close();}
 fs.mkdirSync('docs',{recursive:true});
 const result={date:new Date().toISOString(),engine:versions,scope:'Isolated PGlite PostgreSQL; minimal Supabase Auth/Storage stubs; no remote writes or Supabase service execution',assertions:checks.length,checks,reproducedMissingAgencies:reproduced,legacyErrors,tables:contract.tables.length,columns:contract.columns.length,constraints:contract.constraints.length,status:'PASS'};
 fs.writeFileSync('docs/SLKM_SQL_TEST_RESULTS.json',JSON.stringify(result,null,2));
 console.log(`Verified SQL: ${checks.length} checks passed; ${contract.tables.length} tables / ${contract.columns.length} columns / ${contract.constraints.length} constraints. ${versions[0]}`);
}
main().catch(error=>{console.error(JSON.stringify({file:error.sqlFile,code:error.code,message:error.message,detail:error.detail},null,2));process.exitCode=1;});
