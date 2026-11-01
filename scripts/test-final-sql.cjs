// Executes only FINAL_SQL in isolated PostgreSQL. Never connects to Supabase.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {isolatedDatabase,executeFiles}=require('./sql-test-support.cjs');
const contract=require('./sql-schema-contract.json');
const root='supabase/FINAL_DATABASE/';
const files=Array.from({length:9},(_,i)=>root+String(i+1).padStart(2,'0')+'.sql');
const evidence=[];let checks=0;
const scalar=async(db,sql)=>(await db.query(sql)).rows[0].value;
const equal=(a,b)=>{assert.deepEqual(a,b);checks++;};
async function denied(db,sql,code){await assert.rejects(()=>db.exec(sql),error=>!code||error.code===code);checks++;}
async function verify(db){
 const actual=(await db.query(`select c.relname as table_name,a.attname as column_name,format_type(a.atttypid,a.atttypmod) as data_type,a.attnotnull as required,pg_get_expr(d.adbin,d.adrelid) as default_sql from pg_attribute a join pg_class c on c.oid=a.attrelid left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum where c.relnamespace='public'::regnamespace and c.relkind='r' and a.attnum>0 and not a.attisdropped`)).rows;
 const sorted=x=>[...x].sort((a,b)=>(a.table_name+'.'+a.column_name).localeCompare(b.table_name+'.'+b.column_name));
 equal(sorted(actual),sorted(contract.columns));
 equal(await scalar(db,`select count(*)::int as value from pg_class where relnamespace='public'::regnamespace and relkind='r'`),13);
 equal(await scalar(db,`select count(*)::int as value from pg_class where relnamespace='public'::regnamespace and relkind='r' and relrowsecurity`),13);
 const constraints=(await db.query(`select c.relname as table_name,k.conname,pg_get_constraintdef(k.oid) as definition,k.convalidated from pg_constraint k join pg_class c on c.oid=k.conrelid where c.relnamespace='public'::regnamespace and k.contype in ('p','u','c','f')`)).rows;
 for(const c of contract.constraints){assert.ok(constraints.some(a=>a.table_name===c.table_name&&a.convalidated&&c.accepted_definitions.includes(a.definition)),c.name);checks++;}
 equal(constraints.length,contract.constraints.length);
 const policies=(await db.query(`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname`)).rows;
 equal(policies,contract.policies);
 const triggers=(await db.query(`select c.relname as table_name,t.tgname as name,pg_get_triggerdef(t.oid) as definition from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relnamespace='public'::regnamespace and not t.tgisinternal order by c.relname,t.tgname`)).rows;
 equal(triggers,contract.triggers);
 const functions=(await db.query(`select proname from pg_proc where pronamespace='public'::regnamespace order by proname`)).rows.map(r=>r.proname);
 equal(functions,contract.functions.map(f=>f.name));
 const indexes=(await db.query(`select indexname,indexdef from pg_indexes where schemaname='public'`)).rows;
 for(const index of contract.indexes){equal(indexes.find(row=>row.indexname===index.name)?.indexdef,index.definition);}
 const grants=(await db.query(`select grantee,table_name,privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated','service_role')`)).rows;
 const sortGrants=rows=>[...rows].sort((a,b)=>(a.table_name+'.'+a.grantee+'.'+a.privilege_type).localeCompare(b.table_name+'.'+b.grantee+'.'+b.privilege_type));
 equal(sortGrants(grants),sortGrants(contract.grants));
 equal((await db.query(`select id,name,public,file_size_limit::float8,allowed_mime_types from storage.buckets order by id`)).rows,[...contract.buckets].sort((a,b)=>a.id.localeCompare(b.id)));
 const duplicates=(await db.query(`select c.relname,pg_get_constraintdef(k.oid),count(*) from pg_constraint k join pg_class c on c.oid=k.conrelid where c.relnamespace='public'::regnamespace and k.contype in ('p','u','c','f') group by c.relname,pg_get_constraintdef(k.oid) having count(*)>1`)).rows;
 equal(duplicates,[]);
}
async function snapshots(db,tables){const result=[];for(const table of tables){const fields=(await db.query(`select column_name from information_schema.columns where table_schema='public' and table_name='${table}' order by ordinal_position`)).rows.map(r=>r.column_name);const sql=`select coalesce(jsonb_agg(to_jsonb(a) order by a.id),'[]'::jsonb) as value from(select ${fields.map(f=>'"'+f+'"').join(',')} from public.${table}) a`;result.push({sql,rows:await scalar(db,sql)});}return result;}
async function existingRecords(db){
 await executeFiles(db,files.slice(0,2));
 await db.exec(`insert into public.agencies(id,city_fr,city_ar,city_en,agency_name_fr,agency_name_ar,agency_name_en,address_fr,address_ar,address_en) values
 ('11111111-1111-4111-8111-111111111111','A','A','A','Office A','Office A','Office A','Address A','Address A','Address A'),
 ('22222222-2222-4222-8222-222222222222','B','B','B','Office B','Office B','Office B','Address B','Address B','Address B');
 insert into public.routes(from_agency_id,to_agency_id,departure_time,arrival_time,price_mad,days_of_week) values('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','23:00','05:00',20,array['MON']);
 insert into public.parcel_rates(category_fr,category_ar,category_en,max_weight_kg,base_price_mad) values('Local','Local','Local',1,10);
 insert into public.contact_messages(full_name,email,subject,message) values('Local existing record','local@example.invalid','Local','Local database test only');
 insert into public.corporate_quotes(company_name,contact_person,phone,email,service_type,passenger_count,origin_city,destination_city) values('Local','Local','000','local@example.invalid','personnel',1,'A','B');
 insert into public.blog_posts(slug,title_fr,title_ar,title_en,content_fr,content_ar,content_en) values('local-test','Local','Local','Local','Local','Local','Local');
 insert into public.site_settings(id,site_name_fr,support_phone) values(1,'Preserved company','+212600000000');
 insert into public.site_pages(slug,route,label,title_fr,content) values('home','/','Home','Preserved SEO','{"copy":{"existing_custom":{"fr":"Preserved text","ar":"Preserved text","en":"Preserved text"}}}');
 alter table public.agencies drop column sort_order;alter table public.routes drop column sort_order;alter table public.parcel_rates drop column is_active;
 alter table public.site_settings drop column presentation;alter table public.site_settings drop column navigation;
 alter table public.messagerie_agencies drop column image_url;alter table public.messagerie_agencies drop column lat;alter table public.messagerie_agencies drop column lng;alter table public.messagerie_agencies drop column agents;`);
}
async function main(){
 equal(fs.readdirSync(root).filter(f=>f.endsWith('.sql')).sort(),files.map(f=>f.slice(root.length)));
 for(const legacy of [false,true]){
   const db=await isolatedDatabase();
   try{
     let before=[];
     if(legacy){await existingRecords(db);before=await snapshots(db,['agencies','routes','parcel_rates','contact_messages','corporate_quotes','blog_posts','site_settings']);}
     for(const file of files){await executeFiles(db,[file]);evidence.push({scenario:legacy?'existing partial database':'fresh database',file,status:'PASS'});}
     await verify(db);
     for(const row of before)equal(await scalar(db,row.sql),row.rows);
     if(legacy){equal(await scalar(db,"select title_fr as value from public.site_pages where slug='home'"),'Preserved SEO');equal(await scalar(db,"select content->'copy'->'existing_custom'->>'fr' as value from public.site_pages where slug='home'"),'Preserved text');}
     else equal(await scalar(db,'select count(*)::int as value from public.agencies'),0);
     const stable=await snapshots(db,contract.tables);
     await executeFiles(db,files);await verify(db);
     for(const row of stable)equal(await scalar(db,row.sql),row.rows);
     if(legacy){
       await db.exec("insert into public.messagerie_agencies(agency_id) values('11111111-1111-4111-8111-111111111111')");
       await denied(db,"insert into public.messagerie_agencies(agency_id) values('11111111-1111-4111-8111-111111111111')",'23505');
       await denied(db,"update public.messagerie_agencies set name_fr='Copied source name' where agency_id='11111111-1111-4111-8111-111111111111'",'23514');
     }
     await db.exec("set role anon;select set_config('request.jwt.claims','{}',false)");
     await denied(db,'select * from public.contact_messages','42501');
     await denied(db,'select * from public.corporate_quotes','42501');
     await denied(db,"insert into public.agencies(city_fr) values('denied')",'42501');
     await db.exec("insert into public.contact_messages(full_name,email,subject,message) values('Local','local@example.invalid','Local','Local test only')");checks++;
     await db.exec(`set role authenticated;select set_config('request.jwt.claims','{"user_metadata":{"role":"admin"}}',false)`);
     equal(await scalar(db,'select public.is_admin() as value'),false);
     await denied(db,"insert into storage.objects(bucket_id,name) values('agencies-media','denied.png')",'42501');
     await db.exec(`select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false);update public.contact_messages set status='replied';insert into storage.objects(bucket_id,name) values('agencies-media','allowed.png')`);
     equal(await scalar(db,"select count(*)::int as value from public.contact_messages where status<>'replied'"),0);
     await db.query('select public.save_site_cms_page($1,$2::jsonb,$3::jsonb)',['home',JSON.stringify({title_fr:'Saved through RPC',hero_overlay:.7,content:{copy:{}}}),'{}']);
     equal(await scalar(db,"select title_fr as value from public.site_pages where slug='home'"),'Saved through RPC');
     await db.exec('reset role');
     await db.exec("update storage.buckets set public=true where id='site-media'");
     await denied(db,fs.readFileSync(files[2],'utf8'),'P0001');await db.exec('rollback');
     await db.exec("update storage.buckets set public=false where id='site-media';create policy unknown_write on public.agencies for all to anon using(true) with check(true)");
     await denied(db,fs.readFileSync(files[0],'utf8'),'P0001');
   }finally{await db.close();}
 }
 const result={date:new Date().toISOString(),status:'PASS',engine:'Real PostgreSQL 18.6 via PGlite 0.5.13; minimal Auth/Storage stubs',checks,tables:13,columns:197,constraints:77,policies:49,triggers:13,functions:3,executions:evidence,existingData:'Seven populated business tables preserved; existing CMS edits retained; all 13 tables stable on rerun',duplicatePublicTables:0,duplicateConstraintDefinitions:0,remoteWrites:false,liveSupabase:'NOT VERIFIED'};
 fs.writeFileSync('docs/SLKM_SQL_TEST_RESULTS.json',JSON.stringify(result,null,2));
 console.log(`FINAL_DATABASE: ${checks} checks PASS; 01.sql through 09.sql tested fresh, populated partial upgrade and rerun; no duplicate public tables/constraints. No remote writes.`);
}
main().catch(error=>{console.error(JSON.stringify({file:error.sqlFile,code:error.code,message:error.message},null,2));process.exitCode=1;});
