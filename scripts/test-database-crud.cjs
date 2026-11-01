// Real PostgreSQL execution in isolated memory; synthetic fixtures never leave this process.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {isolatedDatabase, executeFiles} = require('./sql-test-support.cjs');
const catalog = require('../src/lib/cms-defaults.json');
let checks = 0;
const equal = (a,b) => { assert.deepEqual(a,b); checks++; };
async function main() {
  const db = await isolatedDatabase();
  const scalar = async sql => (await db.query(sql)).rows[0].value;
  const insert = async (table, row) => (await db.query(`insert into public.${table}(${Object.keys(row).join(',')}) values(${Object.keys(row).map((_,i)=>'$'+(i+1)).join(',')}) returning id`, Object.values(row))).rows[0].id;
  const denied = async (sql, code) => { await assert.rejects(()=>db.exec(sql), error=>error.code===code || code==='23503' && error.code==='23001'); checks++; };
  try {
    await executeFiles(db,Array.from({length:9},(_,i)=>`supabase/FINAL_DATABASE/${String(i+1).padStart(2,'0')}.sql`));
    const business = ['agencies','routes','messagerie_agencies','parcel_rates','contact_messages','corporate_quotes','blog_posts'];
    for (const table of business) equal(await scalar(`select count(*)::int as value from public.${table}`),0);
    for (const page of Object.values(catalog)) {
      const actual = (await db.query('select * from public.site_pages where slug=$1',[page.slug])).rows[0];
      equal(actual.content.copy,Object.fromEntries(Object.entries(page.copy).map(([key,v])=>[key,{fr:v.fr,ar:v.ar,en:v.en}])));
      equal(actual.content.links,Object.fromEntries(Object.entries(page.links||{}).map(([key,v])=>[key,v.href])));
      equal((await db.query('select field_key,external_url from public.site_page_media where page_id=$1 order by field_key',[actual.id])).rows,Object.entries(page.images).sort(([a],[b])=>a.localeCompare(b)).map(([key,v])=>({field_key:key,external_url:v.src})));
      for (const text of Object.values(actual.content.copy)) for (const locale of ['fr','ar','en']) { assert.ok(typeof text[locale]==='string' && text[locale].length); checks++; }
    }
    equal(await scalar("select count(*)::int as value from public.site_settings where presentation ? 'favicon_url' and navigation ? 'items'"),1);
    await db.exec(`set role authenticated; select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`);
    // Mirrors Dashboard field names; every translated agency field is exercised.
    const agency = suffix => Object.fromEntries(['city','agency_name','address'].flatMap(field=>['fr','ar','en'].map(locale=>[`${field}_${locale}`,`Local fixture ${suffix} ${locale}`])));
    const a = await insert('agencies',agency('A')), b = await insert('agencies',agency('B'));
    const route = await insert('routes',{from_agency_id:a,to_agency_id:b,departure_time:'23:00',arrival_time:'05:00',price_mad:1,days_of_week:['MON'],bus_type:'Comfort'});
    const rate = await insert('parcel_rates',{category_fr:'Local',category_ar:'محلي',category_en:'Local',max_weight_kg:1,base_price_mad:1});
    const post = await insert('blog_posts',{slug:'local-fixture',title_fr:'Local',title_ar:'محلي',title_en:'Local',content_fr:'Local',content_ar:'محلي',content_en:'Local'});
    const parcel = await insert('messagerie_agencies',{agency_id:a,agents:JSON.stringify([{name:'Local fixture',role_fr:'Conseil',role_ar:'استشارة',role_en:'Advisor',phone:'000',email:'local@example.invalid'}])});
    const message = await insert('contact_messages',{full_name:'Local fixture',email:'local@example.invalid',subject:'Local',message:'Local isolated fixture'});
    const quote = await insert('corporate_quotes',{company_name:'Local fixture',contact_person:'Local',phone:'000',email:'local@example.invalid',service_type:'personnel',passenger_count:1,origin_city:'A',destination_city:'B'});
    for (const [table,id] of [['agencies',a],['routes',route],['parcel_rates',rate],['blog_posts',post],['messagerie_agencies',parcel],['contact_messages',message],['corporate_quotes',quote]]) {
      const result = await db.query(`update public.${table} set updated_at='2000-01-01' where id=$1 returning updated_at`,[id]);
      assert.ok(new Date(result.rows[0].updated_at).getFullYear()>2000); checks++;
    }
    await denied(`delete from public.agencies where id='${a}'`,'23503');
    await denied(`update public.routes set to_agency_id=from_agency_id where id='${route}'`,'23514');
    await denied(`update public.routes set days_of_week=array['INVALID'] where id='${route}'`,'23514');
    await denied(`update public.parcel_rates set base_price_mad=-1 where id='${rate}'`,'23514');
    await db.exec(`update public.site_settings set site_name_fr='Local fixture'; update public.messagerie_network_settings set title_en='Local fixture'`);
    equal(await scalar("select site_name_fr as value from public.site_settings where id=1"),'Local fixture');
    equal(await scalar("select title_en as value from public.messagerie_network_settings where id=1"),'Local fixture');
    // CMS routes are intentionally restricted to the application's existing pages.
    await db.exec("delete from public.site_pages where slug='global'");
    const pageId = await insert('site_pages',{slug:'global',route:'global',label:'Local'});
    const assetId = await insert('site_media_assets',{storage_path:'11111111-1111-4111-8111-111111111111.png',filename:'local.png',mime_type:'image/png',size_bytes:100});
    const sectionId = await insert('site_sections',{page_id:pageId,section_key:'local',label:'Local',media_asset_id:assetId});
    const linkId = await insert('site_page_media',{page_id:pageId,field_key:'image_111111111111',asset_id:assetId});
    await denied(`delete from public.site_media_assets where id='${assetId}'`,'23503');
    for (const [table,id] of [['site_sections',sectionId],['site_page_media',linkId],['site_pages',pageId],['site_media_assets',assetId]]) {
      equal((await db.query(`update public.${table} set updated_at=now() where id=$1 returning id`,[id])).rows.length,1);
      equal((await db.query(`delete from public.${table} where id=$1 returning id`,[id])).rows.length,1);
    }
    for (const [table,id] of [['routes',route],['messagerie_agencies',parcel],['parcel_rates',rate],['blog_posts',post],['contact_messages',message],['corporate_quotes',quote],['agencies',a],['agencies',b]]) equal((await db.query(`delete from public.${table} where id=$1 returning id`,[id])).rows.length,1);
    const sqlFiles = fs.readdirSync('supabase/FINAL_DATABASE').filter(f=>f.endsWith('.sql'));
    const declarations = sqlFiles.flatMap(file=>[...fs.readFileSync('supabase/FINAL_DATABASE/'+file,'utf8').matchAll(/create table if not exists public\."?(\w+)/gi)].map(m=>m[1]));
    equal(declarations.length,13); equal(new Set(declarations).size,13);
    const result = {date:new Date().toISOString(),status:'PASS',checks,coverage:'All 13 tables; Dashboard CRUD, singleton settings, seeded FR/AR/EN catalog equality, local assets, FK restrictions, invalid values, updated_at triggers, no business seed',remoteWrites:false};
    fs.writeFileSync('docs/FINAL_DATABASE_CRUD_TESTS.json',JSON.stringify(result,null,2));
    console.log(`Database CRUD/content: ${checks} assertions PASS. All fixtures remained in isolated memory.`);
  } finally { await db.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
