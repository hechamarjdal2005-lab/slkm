// Executes only against an in-memory PostgreSQL engine. Never connects to Supabase.
const { isolatedDatabase, executeFiles } = require('./sql-test-support.cjs');
const assert = require('node:assert/strict');
async function main() {
  const db = await isolatedDatabase();
  let checks = 0;
  try {
    const files = Array.from({length:9},(_,i)=>'supabase/FINAL_DATABASE/'+String(i+1).padStart(2,'0')+'.sql');
    await executeFiles(db, files);
    const scalar = async sql => (await db.query(sql)).rows[0].value;
    assert.equal(await scalar('select count(*)::int as value from public.site_pages'),9); checks++;
    assert.equal(await scalar('select count(*)::int as value from public.agencies'),0); checks++;
    await executeFiles(db, files);
    assert.equal(await scalar('select count(*)::int as value from public.site_pages'),9); checks++;
    await db.exec(`update public.site_sections set is_published=false where page_id=(select id from public.site_pages where slug='home') and section_key='hero'`);
    await db.exec(`set role anon; select set_config('request.jwt.claims','{}',false)`);
    assert.equal(await scalar(`select count(*)::int as value from public.site_sections where page_id=(select id from public.site_pages where slug='home') and section_key='hero'`),0);checks++;
    async function denied(sql) { let failed=false;try{await db.exec(sql);}catch(error){failed=true;}assert.ok(failed,'Operation must be denied: '+sql.slice(0,70));checks++; }
    await denied(`insert into public.site_pages(slug,route,label) values('contact','/contact','Unauthorized')`);
    await denied(`update public.site_pages set label='Anonymous edit'`);
    await denied(`select public.save_site_cms_page('home','{}','{}')`);
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claims','{"app_metadata":{"role":"viewer"},"user_metadata":{"role":"admin"}}',false)`);
    await denied(`insert into public.site_sections(page_id,section_key,label) select id,'custom-denied','Forbidden' from public.site_pages limit 1`);
    const before = await scalar(`select label as value from public.site_pages where slug='home'`);
    await db.exec(`update public.site_pages set label='Non-admin edit' where slug='home'`);
    assert.equal(await scalar(`select label as value from public.site_pages where slug='home'`),before);checks++;
    await denied(`select public.save_site_cms_page('home','{}','{}')`);
    await denied(`insert into storage.objects(bucket_id,name) values('agencies-media','unauthorized.png')`);
    await denied(`insert into storage.objects(bucket_id,name) values('site-media','unauthorized.png')`);
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`);
    const page=(await db.query(`select * from public.site_pages where slug='home'`)).rows[0];
    const content={...page.content,copy:{...page.content.copy}};
    const first=Object.keys(content.copy)[0]; content.copy[first]={fr:'Local test edit',ar:'اختبار محلي',en:'Local test edit'};
    const payload={title_fr:'Local test SEO',title_ar:'اختبار',title_en:'Test',seo_description_fr:'',seo_description_ar:'',seo_description_en:'',hero_overlay:.7,content};
    await db.query('select public.save_site_cms_page($1,$2::jsonb,$3::jsonb)',['home',JSON.stringify(payload),JSON.stringify({})]);
    assert.equal(await scalar(`select title_fr as value from public.site_pages where slug='home'`),'Local test SEO');checks++;
    // Invalid media must roll back the page edit as part of the same RPC transaction.
    payload.title_fr='Must roll back';
    let rolledBack=false;
    try { await db.query('select public.save_site_cms_page($1,$2::jsonb,$3::jsonb)',['home',JSON.stringify(payload),JSON.stringify({image_a12345678901:'/media/11111111-1111-4111-8111-111111111111'})]); } catch { rolledBack=true; }
    assert.ok(rolledBack);checks++;
    assert.equal(await scalar(`select title_fr as value from public.site_pages where slug='home'`),'Local test SEO');checks++;
    await db.exec(`insert into public.site_media_assets(id,storage_path,filename,mime_type,size_bytes,is_published) values
      ('11111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111.png','test draft.png','image/png',100,false),
      ('22222222-2222-4222-8222-222222222222','22222222-2222-4222-8222-222222222222.png','test public.png','image/png',100,true);
      insert into storage.objects(bucket_id,name) values('site-media','11111111-1111-4111-8111-111111111111.png'),('site-media','22222222-2222-4222-8222-222222222222.png');`);
    await db.exec(`reset role; set role anon; select set_config('request.jwt.claims','{}',false)`);
    assert.equal(await scalar(`select count(*)::int as value from public.site_media_assets`),1);checks++;
    assert.equal(await scalar(`select count(*)::int as value from storage.objects where bucket_id='site-media'`),1);checks++;
    await db.exec(`reset role; set role authenticated; select set_config('request.jwt.claims','{"app_metadata":{"role":"admin"}}',false)`);
    assert.equal(await scalar(`select count(*)::int as value from public.site_media_assets`),2);checks++;
    await db.exec(`insert into public.site_page_media(page_id,field_key,asset_id) select id,'image_a12345678901','22222222-2222-4222-8222-222222222222' from public.site_pages where slug='home'`);
    await denied(`delete from public.site_media_assets where id='22222222-2222-4222-8222-222222222222'`);
    await db.exec(`reset role`);
    await executeFiles(db, files);
    assert.equal(await scalar(`select title_fr as value from public.site_pages where slug='home'`),'Local test SEO');checks++;
    assert.equal(await scalar(`select count(*)::int as value from pg_proc where proname='save_site_cms_page' and prosecdef`),0);checks++;
    assert.equal(await scalar(`select count(*)::int as value from pg_class where relname in ('site_pages','site_sections','site_media_assets','site_page_media') and relrowsecurity`),4);checks++;
    console.log(`CMS SQL: ${checks} PostgreSQL assertions passed (dependencies, reruns, admin/viewer/anon RLS, draft media, RPC rollback, FK protection, preserved edits). No remote database was contacted.`);
  } finally { await db.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
