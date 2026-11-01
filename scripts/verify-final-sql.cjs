// Compatibility entry point: the archived packages are no longer active.
require('./test-final-sql.cjs'); return;
// Local PostgreSQL semantics with minimal Supabase auth/storage stubs; no network.
const {PGlite}=require('@electric-sql/pglite');const fs=require('node:fs');const assert=require('node:assert/strict');
const dir='supabase/slkm_final_sql';
async function setup(){const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;
create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
grant usage on schema public,auth,storage to anon,authenticated,service_role;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text references storage.buckets(id),name text not null);
alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;`);return db;}
async function main(){const db=await setup();let checks=0;const files=fs.readdirSync(dir).filter(f=>/^\d.*\.sql$/.test(f)).sort();const scalar=async sql=>(await db.query(sql)).rows[0].value;const denied=async sql=>{await assert.rejects(()=>db.exec(sql));checks++;};
try{
 for(const file of files)await db.exec(fs.readFileSync(`${dir}/${file}`,'utf8'));
 checks++;for(const file of files)await db.exec(fs.readFileSync(`${dir}/${file}`,'utf8'));checks++;
 const columns=fs.readFileSync(`${dir}/VALIDATION_QUERIES.sql`,'utf8');
 const missing=columns.slice(columns.indexOf('with expected'),columns.indexOf('-- Public request'));
 assert.equal((await db.query(missing)).rows.length,0);checks++;
 await db.exec(`update public.site_pages set title_fr='Preserved edit' where slug='home';alter table public.agencies drop column phone_number;`);
 for(const file of files)await db.exec(fs.readFileSync(`${dir}/${file}`,'utf8'));
 assert.equal(await scalar("select title_fr as value from public.site_pages where slug='home'"),'Preserved edit');checks++;
 assert.equal(await scalar("select count(*)::int as value from information_schema.columns where table_schema='public' and table_name='agencies' and column_name='phone_number'"),1);checks++;
 await db.exec(`set role authenticated;select set_config('request.jwt.claims','{"user_metadata":{"role":"admin"}}',false)`);
 await denied(`insert into storage.objects(bucket_id,name) values('agencies-media','unauthorized.png')`);
 await denied(`insert into public.agencies(city_fr) values('Unauthorized')`);
 assert.equal(await scalar('select public.is_admin() as value'),false);checks++;
 assert.equal(await scalar('select count(*)::int as value from public.contact_messages'),0);checks++;
 await db.exec(`select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false);insert into storage.objects(bucket_id,name) values('agencies-media','authorized.png');update public.site_settings set navigation='{"items":[]}' where id=1;`);checks++;
 await db.exec(`reset role;insert into public.parcel_rates(category_fr,category_ar,category_en,max_weight_kg,base_price_mad,is_active) values('Hidden','Hidden','Hidden',1,1,false);set role anon;`);
 assert.equal(await scalar('select count(*)::int as value from public.parcel_rates'),0);checks++;
 await denied(`select * from public.corporate_quotes`);
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`);
 await db.exec(`insert into public.agencies(id,city_fr,city_ar,city_en,agency_name_fr,agency_name_ar,agency_name_en,address_fr,address_ar,address_en) values
 ('11111111-1111-4111-8111-111111111111','A','A','A','A','A','A','A','A','A'),
 ('22222222-2222-4222-8222-222222222222','B','B','B','B','B','B','B','B','B');
 insert into public.routes(from_agency_id,to_agency_id,departure_time,arrival_time,price_mad,days_of_week) values('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','23:00','05:00',20,array['MON']);
 update public.routes set price_mad=30;`);
 assert.equal(await scalar('select price_mad::int as value from public.routes'),30);checks++;
 await denied(`delete from public.agencies where id='11111111-1111-4111-8111-111111111111'`);
 await db.exec(`insert into public.messagerie_agencies(agency_id) values('11111111-1111-4111-8111-111111111111');update public.messagerie_agencies set display_order=5;`);
 assert.equal(await scalar('select display_order as value from public.messagerie_agencies'),5);checks++;
 await db.exec(`update public.messagerie_agencies set image_url='/images/agencies/agadir.png',lat=30,lng=-9,agents='[{"name":"Public agent","role_fr":"Service","role_ar":"Service","role_en":"Service","phone":"000","email":"public@example.invalid","is_active":true}]'`);
 assert.equal(await scalar("select agents->0->>'name' as value from public.messagerie_agencies"),'Public agent');checks++;
 await denied(`update public.messagerie_agencies set lat=200`);
 await db.exec(`insert into public.contact_messages(full_name,email,subject,message) values('Local test','local@example.invalid','Local test','Local test only');update public.contact_messages set status='replied';`);
 assert.equal(await scalar('select status as value from public.contact_messages'),'replied');checks++;
 await db.exec(`insert into public.corporate_quotes(company_name,contact_person,phone,email,service_type,passenger_count,origin_city,destination_city) values('Local','Local','000','local@example.invalid','personnel',1,'A','B');update public.corporate_quotes set status='contacted';`);
 assert.equal(await scalar('select status as value from public.corporate_quotes'),'contacted');checks++;
 await db.exec(`insert into public.blog_posts(slug,title_fr,title_ar,title_en,content_fr,content_ar,content_en,is_published) values('local-test','Test','Test','Test','Body','Body','Body',false);set role anon;`);
 assert.equal(await scalar('select count(*)::int as value from public.blog_posts'),0);checks++;
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false);update public.blog_posts set is_published=true;set role anon;`);
 assert.equal(await scalar('select count(*)::int as value from public.blog_posts'),1);checks++;
 await db.exec(`reset role;set role authenticated;select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false);delete from public.routes;delete from public.messagerie_agencies;delete from public.agencies;delete from public.blog_posts;delete from public.contact_messages;delete from public.corporate_quotes;`);
 assert.equal(await scalar('select count(*)::int as value from public.agencies'),0);checks++;
 await db.exec('reset role');
 // Reproduce the historical partial-schema failure without touching business data.
 const old=await setup();try{await old.exec(`create table public.agencies(id uuid primary key default gen_random_uuid())`);await assert.rejects(()=>old.exec(fs.readFileSync('supabase/schema.sql','utf8')),e=>{console.log('Historical partial-schema error:',e.message);return /city_fr/.test(e.message);});checks++;}finally{await old.close();}
 console.log(`Final SQL: ${checks} assertions passed; fresh install, rerun, missing column repair, preserved edits, role checks, private requests, agency/route/messagerie/blog CRUD and request statuses. Local PGlite only.`);
}finally{await db.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
