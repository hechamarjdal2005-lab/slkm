throw new Error('Historical SQL generator retired. Use supabase/FINAL_DATABASE/README.md. Refresh defaults with scripts/build-final-database-defaults.cjs');
// Derive additive definitions from the repository schema; never contacts a database.
const fs=require('node:fs');
const dir='supabase/slkm_final_sql';fs.mkdirSync(dir,{recursive:true});
const expected=[];
function split(body){ let depth=0,quote=false,start=0,result=[];for(let i=0;i<body.length;i++){const c=body[i];if(c==="'"){if(quote&&body[i+1]==="'"){i++;continue;}quote=!quote;}if(quote)continue;if(c==='(')depth++;if(c===')')depth--;if(c===','&&depth===0){result.push(body.slice(start,i).trim());start=i+1;}}result.push(body.slice(start).trim());return result;}
function repair(source){return source.replace(/create table if not exists public\.(\w+)\s*\(([\s\S]*?)\n\);/g,(statement,table,body)=>{
 const parts=split(body.replace(/--[^\n]*/g,'')); let additions=[];
 for(const part of parts){const name=part.match(/^(\w+)\s+/)?.[1];if(!name)continue;if(['constraint','unique','check','foreign','primary'].includes(name.toLowerCase())){if(name==='constraint'){const constraint=part.match(/^constraint\s+(\w+)/)[1]; additions.push(`do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.${table}'::regclass and conname='${constraint}') then alter table public.${table} add ${part}; end if; end $$;`);}continue;}
 expected.push({table,column:name,definition:part});additions.push(`alter table public.${table} add column if not exists ${part};`);
 }
 return statement+'\n-- Repair missing columns explicitly. Required fields without defaults fail safely on populated tables.\n'+additions.join('\n');});}
function write(name,source){fs.writeFileSync(`${dir}/${name}`,source);}
let core=fs.readFileSync('supabase/schema.sql','utf8').replace('alter table storage.objects enable row level security;','-- Storage RLS is managed by Supabase; do not ALTER its system-owned tables.').replace("in ('admin', 'service_role')","= 'admin'");
core=core.replace("and length(trim(name)) > 0","and public.is_admin() and length(trim(name)) > 0");
core=core.replaceAll("bucket_id in ('agencies-media', 'blog-images', 'fleet-images')\r\n  )", "bucket_id in ('agencies-media', 'blog-images', 'fleet-images') and public.is_admin()\r\n  )");
// Public read must remain public; only insert/update require the trusted role.
core=core.replace(/(create policy "SLKM public media read"[\s\S]*?using \([\s\S]*?) and public\.is_admin\(\)/,'$1');
write('01_core_schema_and_storage.sql',repair(core));
write('02_messagerie.sql',repair(fs.readFileSync('supabase/migrations/20261030180000_messagerie_network.sql','utf8')));
write('03_cms_structure.sql',repair(fs.readFileSync('supabase/migrations/20261031090000_site_cms_structure.sql','utf8')));
write('04_cms_authorization.sql',fs.readFileSync('supabase/migrations/20261031091000_site_cms_policies.sql','utf8'));
write('05_cms_defaults.sql',fs.readFileSync('supabase/migrations/20261031092000_site_cms_defaults.sql','utf8'));
const controls=`-- Additive application controls. No business seed and no account changes.
begin;
alter table public.site_settings add column if not exists navigation jsonb not null default '{}'::jsonb;
do $$ begin if not exists(select 1 from pg_constraint where conrelid='public.site_settings'::regclass and conname='slkm_navigation_object') then alter table public.site_settings add constraint slkm_navigation_object check(jsonb_typeof(navigation)='object' and octet_length(navigation::text)<=32768); end if; end $$;
alter table public.agencies add column if not exists sort_order integer not null default 0 check(sort_order between 0 and 10000);
alter table public.routes add column if not exists sort_order integer not null default 0 check(sort_order between 0 and 10000);
alter table public.parcel_rates add column if not exists is_active boolean not null default true;
create index if not exists slkm_agency_order on public.agencies(sort_order,city_fr);
create index if not exists slkm_route_order on public.routes(sort_order,departure_time);
-- Correct existing bucket limits without changing visibility or removing objects.
update storage.buckets set file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'] where id='site-media' and not public;
drop policy if exists "Public can read parcel rates" on public.parcel_rates;
create policy "Public can read parcel rates" on public.parcel_rates for select to anon,authenticated using(is_active);
-- Full settings contains public content only. Never store SMTP keys or private recipients here.
notify pgrst, 'reload schema';
commit;
`;
write('06_complete_controls.sql',controls);
expected.push({table:'site_settings',column:'presentation'},{table:'site_settings',column:'navigation'},{table:'agencies',column:'sort_order'},{table:'routes',column:'sort_order'},{table:'parcel_rates',column:'is_active'});
for(const column of ['image_url','lat','lng','agents'])expected.push({table:'messagerie_agencies',column});
fs.writeFileSync(`${dir}/expected-schema.json`,JSON.stringify(expected,null,2));
write('VALIDATION_QUERIES.sql',`-- Lecture seule. Exécuter dans Supabase SQL Editor avec un rôle autorisé.
select table_name from information_schema.tables where table_schema='public' order by 1;
select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position;
select conrelid::regclass as table_name,conname,pg_get_constraintdef(oid) as definition from pg_constraint where connamespace='public'::regnamespace order by 1,2;
select relname,relrowsecurity,relforcerowsecurity from pg_class where relnamespace='public'::regnamespace and relkind='r' order by 1;
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by 1,2,3;
select event_object_table,trigger_name,action_statement from information_schema.triggers where trigger_schema='public';
select id,name,public,file_size_limit,allowed_mime_types from storage.buckets order by id;
select pg_get_functiondef(to_regprocedure('public.is_admin()'));
select id,app_metadata->>'role' as trusted_role from auth.users where raw_app_meta_data->>'role'='admin';
-- Missing expected tables or columns: expected empty result after successful execution.
with expected(table_name,column_name) as (values
${expected.map(r=>`('${r.table}','${r.column}')`).join(',\n')}
) select e.* from expected e left join information_schema.columns c on c.table_schema='public' and c.table_name=e.table_name and c.column_name=e.column_name where c.column_name is null;
-- Public request content must never have a permissive SELECT policy.
select * from pg_policies where schemaname='public' and tablename in ('contact_messages','corporate_quotes');
-- Inspect grants and security-definer helpers before approving an existing database upgrade.
select grantee,table_name,privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated') order by 2,1,3;
select p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public';
` .replace("id,app_metadata->>'role'","id,raw_app_meta_data->>'role'"));
console.log(`Generated ${expected.length} expected columns from repository SQL; no database modified.`);
