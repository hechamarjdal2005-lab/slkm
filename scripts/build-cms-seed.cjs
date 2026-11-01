throw new Error('Historical SQL generator retired. Use supabase/FINAL_DATABASE/README.md. Refresh defaults with scripts/build-final-database-defaults.cjs');
// Derive defaults only from the existing application's extracted public content.
const fs = require('node:fs');
const catalog = JSON.parse(fs.readFileSync('src/lib/cms-defaults.json', 'utf8'));
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const json = value => quote(JSON.stringify(value)) + '::jsonb';
let sql = '-- Derived from existing SLKM public copy and bundled images. No business records.\n-- Existing editor changes are preserved on rerun.\nbegin;\n';
for (const page of Object.values(catalog)) {
  const copy = Object.fromEntries(Object.entries(page.copy).map(([key, field]) => [key, { fr: field.fr, ar: field.ar, en: field.en }]));
  const links = Object.fromEntries(Object.entries(page.links || {}).map(([key, field]) => [key, field.href]));
  sql += `\ninsert into public.site_pages(slug,route,label,content) values(${quote(page.slug)},${quote(page.route)},${quote(page.label)},${json({copy,links})}) on conflict(slug) do nothing;\n`;
  for (const section of page.sections) {
    sql += `insert into public.site_sections(page_id,section_key,label,sort_order) select id,${quote(section.key)},${quote(section.label)},${section.sort_order} from public.site_pages where slug=${quote(page.slug)} on conflict(page_id,section_key) do nothing;\n`;
  }
  for (const [key, image] of Object.entries(page.images)) {
    sql += `insert into public.site_page_media(page_id,field_key,external_url) select id,${quote(key)},${quote(image.src)} from public.site_pages where slug=${quote(page.slug)} on conflict(page_id,field_key) do nothing;\n`;
  }
}
sql += '\ncommit;\n';
fs.writeFileSync('supabase/migrations/20261031092000_site_cms_defaults.sql',sql);
console.log('CMS defaults generated from '+Object.keys(catalog).length+' existing page/template scopes.');
