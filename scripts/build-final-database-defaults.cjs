// Rebuild only 06.sql from application-owned editorial defaults. No network access.
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);
const { CMS_CATALOG, THEME_DEFAULTS } = require('../src/lib/cms.ts');
const { navigation } = require('../src/lib/navigation.ts');
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const json = value => quote(JSON.stringify(value)) + '::jsonb';
let sql = `-- 06: contenu existant du site, sans données commerciales de démonstration.
-- Sources: src/lib/cms-defaults.json, cms.ts et navigation.ts. UTF-8 FR/AR/EN.
-- Les modifications des administrateurs sont conservées lors d'une réexécution.
begin;
set local search_path=pg_catalog,public;
insert into public.site_settings(id,site_name_fr,site_name_ar,site_name_en,presentation,navigation)
values(1,'SLKM Transport','SLKM Transport','SLKM Transport',${json(THEME_DEFAULTS)},${json(navigation(null))})
on conflict(id) do nothing;
insert into public.messagerie_network_settings(id) values(1) on conflict(id) do nothing;
`;
for (const page of Object.values(CMS_CATALOG)) {
  const copy = Object.fromEntries(Object.entries(page.copy).map(([key, value]) => [key, {fr:value.fr, ar:value.ar, en:value.en}]));
  const links = Object.fromEntries(Object.entries(page.links || {}).map(([key, value]) => [key, value.href]));
  sql += `\ninsert into public.site_pages(slug,route,label,content) values(${quote(page.slug)},${quote(page.route)},${quote(page.label)},${json({copy,links})}) on conflict(slug) do nothing;\n`;
  // Fill missing keys only; never replace an administrator's edited translations or links.
  for (const [key, defaults] of Object.entries({copy, links})) {
    sql += `update public.site_pages set content=jsonb_set(content,'{${key}}',${json(defaults)} || coalesce(content->'${key}','{}'::jsonb)) where slug=${quote(page.slug)} and exists(select 1 from jsonb_object_keys(${json(defaults)}) k where not coalesce(content->'${key}','{}'::jsonb) ? k);\n`;
  }
  for (const section of page.sections) sql += `insert into public.site_sections(page_id,section_key,label,sort_order) select id,${quote(section.key)},${quote(section.label)},${section.sort_order} from public.site_pages where slug=${quote(page.slug)} on conflict(page_id,section_key) do nothing;\n`;
  for (const [key,image] of Object.entries(page.images)) {
    if (image.src.startsWith('/') && !fs.existsSync('public' + image.src)) throw new Error('Missing bundled image: ' + image.src);
    sql += `insert into public.site_page_media(page_id,field_key,external_url) select id,${quote(key)},${quote(image.src)} from public.site_pages where slug=${quote(page.slug)} on conflict(page_id,field_key) do nothing;\n`;
  }
}
sql += '\ncommit;\n';
fs.writeFileSync('supabase/FINAL_DATABASE/06.sql', sql);
console.log('06.sql rebuilt from the 9 existing CMS scopes, branding and navigation; existing local images verified.');
