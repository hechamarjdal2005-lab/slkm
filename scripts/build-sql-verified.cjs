throw new Error('Historical SQL generator retired. Use supabase/FINAL_DATABASE/README.md. Refresh defaults with scripts/build-final-database-defaults.cjs');
// Reconstruct ordered DDL from an executed local PostgreSQL catalog and the app CMS catalog.
// Never connects to a remote database. Never edits historical SQL.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { isolatedDatabase, executeFiles } = require('./sql-verified-support.cjs');
const root = 'supabase/slkm_sql_verified';
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
const ident = value => '"' + value.replaceAll('"', '""') + '"';
const tx = body => 'begin;\nset local search_path=pg_catalog,public;\n' + body + '\ncommit;\n';
const write = (name, text) => fs.writeFileSync(path.join(root,name), text);
async function main() {
  fs.mkdirSync(root + '/fresh', {recursive:true}); fs.mkdirSync(root + '/upgrade', {recursive:true});
  const db = await isolatedDatabase();
  try {
    const sources = fs.readdirSync('supabase/slkm_final_sql').filter(f=>/^\d.*\.sql$/.test(f)).sort().map(f=>'supabase/slkm_final_sql/'+f);
    await executeFiles(db, sources);
    const columns = (await db.query(`select c.relname as table_name,a.attname as column_name,format_type(a.atttypid,a.atttypmod) as data_type,a.attnotnull as required,pg_get_expr(d.adbin,d.adrelid) as default_sql
      from pg_attribute a join pg_class c on c.oid=a.attrelid left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
      where c.relnamespace='public'::regnamespace and c.relkind='r' and a.attnum>0 and not a.attisdropped order by c.relname,a.attnum`)).rows;
    const tables = [...new Set(columns.map(c=>c.table_name))];
    const constraints = (await db.query(`select c.relname as table_name,k.conname as name,k.contype as kind,pg_get_constraintdef(k.oid) as definition from pg_constraint k join pg_class c on c.oid=k.conrelid
      where c.relnamespace='public'::regnamespace and k.contype in ('p','u','c','f') order by case k.contype when 'p' then 0 when 'u' then 1 when 'c' then 2 else 3 end,c.relname,k.conname`)).rows;
    const functions = (await db.query(`select p.proname as name,pg_get_functiondef(p.oid) as definition,pg_get_function_identity_arguments(p.oid) as arguments from pg_proc p where p.pronamespace='public'::regnamespace order by p.proname`)).rows;
    const triggers = (await db.query(`select c.relname as table_name,t.tgname as name,pg_get_triggerdef(t.oid) as definition from pg_trigger t join pg_class c on c.oid=t.tgrelid where c.relnamespace='public'::regnamespace and not t.tgisinternal order by c.relname,t.tgname`)).rows;
    const indexes = (await db.query(`select t.relname as table_name,c.relname as name,pg_get_indexdef(i.indexrelid) as definition from pg_index i join pg_class t on t.oid=i.indrelid join pg_class c on c.oid=i.indexrelid
      where t.relnamespace='public'::regnamespace and not exists(select 1 from pg_constraint k where k.conindid=i.indexrelid) order by t.relname,c.relname`)).rows;
    const policies = (await db.query(`select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by schemaname,tablename,policyname`)).rows;
    const grants = (await db.query(`select grantee,table_name,privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated','service_role') order by table_name,grantee,privilege_type`)).rows;
    const buckets = (await db.query('select id,name,public,file_size_limit,allowed_mime_types from storage.buckets order by id')).rows;
    // PostgreSQL can deparse equivalent CHECK casts differently after a round trip.
    // Record both renderings for read-only inspection; migrations normalize both sides natively.
    for(const table of tables) {
      await db.exec(`create temporary table slkm_contract_${table} (like public.${ident(table)});`);
      for(const c of constraints.filter(c=>c.table_name===table)) {
        if(c.kind==='f') {c.accepted_definitions=[c.definition];continue;}
        await db.exec(`alter table slkm_contract_${table} add constraint slkm_contract_constraint ${c.definition};`);
        const normalized=(await db.query(`select pg_get_constraintdef(oid) as definition from pg_constraint where conrelid='slkm_contract_${table}'::regclass and conname='slkm_contract_constraint'`)).rows[0].definition;
        c.accepted_definitions=[...new Set([c.definition,normalized])];
        await db.exec(`alter table slkm_contract_${table} drop constraint slkm_contract_constraint;`);
      }
    }
    const schema = {tables,columns,constraints,indexes,triggers,functions,policies,grants,buckets};
    write('SCHEMA_CONTRACT.json', JSON.stringify(schema,null,2)+'\n');
    const tableArray = 'array['+tables.map(quote).join(',')+']';
    let preflight = `-- FIRST FILE for both workflows. Read-only checks; no account, extension or Storage ownership changes.\n`;
    preflight += `do $$ begin
      if current_setting('server_version_num')::integer < 150000 then raise exception 'PostgreSQL 15+ required'; end if;
      if to_regprocedure('auth.jwt()') is null or to_regprocedure('gen_random_uuid()') is null or to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then raise exception 'Supabase Auth, Storage and UUID prerequisites are missing'; end if;
      if not exists(select 1 from pg_class where oid='storage.objects'::regclass and relrowsecurity) then raise exception 'Storage system RLS must already be enabled by Supabase; do not change system ownership to bypass this check'; end if;
      if not (select pg_has_role(current_user,relowner,'USAGE') from pg_class where oid='storage.objects'::regclass) then raise exception 'Use an authorized Supabase SQL Editor migration role that can manage Storage policies; do not change system table ownership'; end if;
      if exists(select 1 from unnest(array['anon','authenticated','service_role']) r where not exists(select 1 from pg_roles where rolname=r)) then raise exception 'Supabase API roles missing'; end if;
    end $$;\n`;
    preflight += `do $$ declare expected record; actual text; begin
      if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname=any(${tableArray}) and relkind<>'r') then raise exception 'An expected application table name belongs to a different object kind; review existing objects before DDL'; end if;
      for expected in select * from (values\n${columns.map(c=>`(${quote(c.table_name)},${quote(c.column_name)},${quote(c.data_type)})`).join(',\n')}
      ) as v(table_name,column_name,column_type) loop
        select format_type(a.atttypid,a.atttypmod) into actual from pg_attribute a join pg_class c on c.oid=a.attrelid
        where c.relnamespace='public'::regnamespace and c.relname=expected.table_name and a.attname=expected.column_name and a.attnum>0 and not a.attisdropped;
        if actual is not null and actual<>expected.column_type then raise exception 'Type conflict %.%: expected %, got %. Stop and prepare a reviewed data migration.',expected.table_name,expected.column_name,expected.column_type,actual; end if;
      end loop;
    end $$;\n`;
    // Unknown permissive policies cannot be certified or safely deleted automatically.
    preflight += `do $$ begin if exists(select 1 from pg_policies p where ((p.schemaname='public' and p.tablename=any(${tableArray})) or (p.schemaname='storage' and p.tablename='objects'))
      and not exists(select 1 from (values\n${policies.map(p=>`(${quote(p.schemaname)},${quote(p.tablename)},${quote(p.policyname)})`).join(',\n')}
      ) as allowed(schema_name,table_name,policy_name) where allowed.schema_name=p.schemaname and allowed.table_name=p.tablename and allowed.policy_name=p.policyname))
      then raise exception 'Unreviewed RLS policies found. Inspect VALIDATION_QUERIES.sql; no unknown policy is deleted automatically.'; end if; end $$;\n`;
    write('00_prerequisites.sql',preflight);
    write('fresh/00_assert_fresh.sql',`-- Fresh workflow only. Intentionally fails if any application table already exists.\ndo $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname=any(${tableArray})) then raise exception 'Existing SLKM objects found: use upgrade workflow, do not recreate or remove them'; end if; end $$;\n`);
    write('upgrade/00_upgrade_review.sql',`-- Existing database only. Run VALIDATION_QUERIES.sql and review backups first.\nselect c.relname,pg_size_pretty(pg_total_relation_size(c.oid)) as total_size from pg_class c where c.relnamespace='public'::regnamespace and c.relkind='r' and c.relname=any(${tableArray}) order by c.relname;\n-- No assumed live state and no destructive backfill. Missing required values will stop 01/02.\n`);
    let tableSql = '-- Tables/columns FIRST; keys and FKs follow in separate files. RLS enabled immediately.\n';
    for (const table of tables) {
      const fields = columns.filter(c=>c.table_name===table);
      const declaration = c => `${ident(c.column_name)} ${c.data_type}${c.default_sql!==null?' default '+c.default_sql:''}${c.required?' not null':''}`;
      tableSql += `create table if not exists public.${ident(table)} (\n${fields.map(c=>'  '+declaration(c)).join(',\n')}\n);\n`;
      // Lock API access within the same transaction as table creation, avoiding a pre-RLS exposure window.
      tableSql += `alter table public.${ident(table)} enable row level security;\nrevoke all on public.${ident(table)} from public,anon,authenticated;\n`;
      for (const col of fields) {
        tableSql += `alter table public.${ident(table)} add column if not exists ${declaration(col)};\n`;
        tableSql += `alter table public.${ident(table)} alter column ${ident(col.column_name)} ${col.default_sql!==null?'set default '+col.default_sql:'drop default'};\n`;
      }
    }
    write('01_tables_and_columns.sql',tx(tableSql));
    function constraintSql(c) {
      const target='public.'+ident(c.table_name);
      if(c.kind==='f') return `do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid=${quote('public.'+c.table_name)}::regclass and conname=${quote(c.name)} and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>${quote(c.definition)}) then
          raise exception 'Conflicting foreign key ${c.table_name}.${c.name}; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid=${quote('public.'+c.table_name)}::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')=${quote(c.definition)} limit 1;
        if existing.conname is null then alter table ${target} add constraint ${ident(c.name)} ${c.definition};
        elsif not existing.convalidated then execute format('alter table ${target} validate constraint %I',existing.conname); end if;
      end $$;\n`;
      const expected='pg_temp.'+ident('slkm_expected_'+c.table_name);
      const actual='pg_temp.'+ident('slkm_actual_'+c.table_name);
      return `do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        alter table ${expected} add constraint slkm_expected_constraint ${c.definition};
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid=${quote('pg_temp.slkm_expected_'+c.table_name)}::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid=${quote('public.'+c.table_name)}::regclass and contype=${quote(c.kind)} loop
          execute format('alter table ${actual} add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid=${quote('pg_temp.slkm_actual_'+c.table_name)}::regclass and conname='slkm_actual_constraint';
          alter table ${actual} drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table ${target} validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname=${quote(c.name)} then
            raise exception 'Conflicting constraint ${c.table_name}.${c.name}; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table ${target} add constraint ${ident(c.name)} ${c.definition}; end if;
        alter table ${expected} drop constraint slkm_expected_constraint;
      end $$;\n`;
    }
    const templates=()=>tables.map(t=>`create temporary table ${ident('slkm_expected_'+t)} (like public.${ident(t)}) on commit drop;\ncreate temporary table ${ident('slkm_actual_'+t)} (like public.${ident(t)}) on commit drop;\n`).join('');
    let keys = templates()+constraints.filter(c=>c.kind!=='f').map(constraintSql).join('');
    for (const c of columns.filter(c=>c.required)) keys+=`alter table public.${ident(c.table_name)} alter column ${ident(c.column_name)} set not null;\n`;
    write('02_keys_and_checks.sql',tx('-- Unique/primary/check constraints before dependent foreign keys.\n'+keys));
    let storage = '-- Supabase owns Storage system tables. No ALTER TABLE storage.objects here.\n';
    for (const b of buckets) storage += `do $$ begin if exists(select 1 from storage.buckets where id=${quote(b.id)} and public is distinct from ${b.public}) then raise exception 'Bucket ${b.id} visibility differs: review existing files before changing confidentiality'; end if; end $$;\n`;
    storage+=`insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values\n${buckets.map(b=>`(${quote(b.id)},${quote(b.name)},${b.public},${b.file_size_limit},array[${b.allowed_mime_types.map(quote).join(',')}])`).join(',\n')}
      on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;\n`;
    write('03_storage_buckets.sql',tx(storage));
    write('04_foreign_keys.sql',tx('-- All application keys and Storage bucket rows now exist.\n'+constraints.filter(c=>c.kind==='f').map(constraintSql).join('')));
    let routines = functions.map(f=>f.definition+';\n').join('');
    routines += `revoke all on function public.is_admin() from public,anon,authenticated;
      grant execute on function public.is_admin() to anon,authenticated,service_role;
      revoke all on function public.set_updated_at() from public,anon,authenticated;
      revoke all on function public.save_site_cms_page(text,jsonb,jsonb) from public,anon,authenticated;
      grant execute on function public.save_site_cms_page(text,jsonb,jsonb) to authenticated;\n`;
    for (const t of triggers) routines += `drop trigger if exists ${ident(t.name)} on public.${ident(t.table_name)};\n${t.definition};\n`;
    for (const i of indexes) {
      routines+=`do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname=${quote(i.name)}) and pg_get_indexdef(to_regclass(${quote('public.'+i.name)})) is distinct from ${quote(i.definition)} then raise exception 'Conflicting index ${i.name}; review rather than silently skip'; end if; end $$;\n`;
      routines += i.definition.replace(/^CREATE (UNIQUE )?INDEX /,(_,u)=>'CREATE '+(u||'')+'INDEX IF NOT EXISTS ')+';\n';
    }
    write('05_functions_triggers_indexes.sql',tx(routines));
    let security = '-- All protected writes require trusted app_metadata.role=admin. Public inserts only for requests.\n';
    security+='grant usage on schema public to anon,authenticated,service_role;\n';
    for (const t of tables) security+=`alter table public.${ident(t)} enable row level security;\nrevoke all on public.${ident(t)} from public,anon,authenticated,service_role;\n`;
    for (const g of grants) security+=`grant ${g.privilege_type} on public.${ident(g.table_name)} to ${ident(g.grantee)};\n`;
    for (const p of policies) {
      const target=ident(p.schemaname)+'.'+ident(p.tablename);
      security+=`drop policy if exists ${ident(p.policyname)} on ${target};\ncreate policy ${ident(p.policyname)} on ${target} as ${p.permissive} for ${p.cmd} to ${p.roles.map(ident).join(',')}${p.qual?' using ('+p.qual+')':''}${p.with_check?' with check ('+p.with_check+')':''};\n`;
    }
    write('06_rls_and_grants.sql',tx(security));
    const catalog=JSON.parse(fs.readFileSync('src/lib/cms-defaults.json','utf8'));
    const json=value=>quote(JSON.stringify(value))+'::jsonb';
    let seed='-- Only existing editorial defaults. NO business agencies/routes, fake quotes or account/role creation.\ninsert into public.site_settings(id) values(1) on conflict(id) do nothing;\n';
    for(const p of Object.values(catalog)) {
      const copy=Object.fromEntries(Object.entries(p.copy).map(([key,v])=>[key,{fr:v.fr,ar:v.ar,en:v.en}]));
      const links=Object.fromEntries(Object.entries(p.links||{}).map(([key,v])=>[key,v.href]));
      seed+=`insert into public.site_pages(slug,route,label,content) values(${quote(p.slug)},${quote(p.route)},${quote(p.label)},${json({copy,links})}) on conflict(slug) do nothing;\n`;
      seed+=`update public.site_pages set content=jsonb_set(content,'{copy}',${json(copy)} || coalesce(content->'copy','{}'::jsonb)) where slug=${quote(p.slug)} and exists(select 1 from jsonb_object_keys(${json(copy)}) k where not coalesce(content->'copy','{}'::jsonb) ? k);\n`;
      for(const s of p.sections)seed+=`insert into public.site_sections(page_id,section_key,label,sort_order) select id,${quote(s.key)},${quote(s.label)},${s.sort_order} from public.site_pages where slug=${quote(p.slug)} on conflict(page_id,section_key) do nothing;\n`;
      for(const[key,img]of Object.entries(p.images))seed+=`insert into public.site_page_media(page_id,field_key,external_url) select id,${quote(key)},${quote(img.src)} from public.site_pages where slug=${quote(p.slug)} on conflict(page_id,field_key) do nothing;\n`;
    }
    seed+="notify pgrst, 'reload schema';\n";
    write('07_editorial_defaults.sql',tx(seed));
    // Inspector is standalone and remains useful even before installing any application tables.
    let validation=`-- READ ONLY: may be run before or after migrations with an authorized SQL Editor role.
      select current_database(),current_user,current_setting('server_version') as postgres_version;
      select table_name from information_schema.tables where table_schema='public' order by 1;
      select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position;
      select conrelid::regclass,conname,pg_get_constraintdef(oid),convalidated from pg_constraint where connamespace='public'::regnamespace order by 1,2;
      select c.relname,c.relrowsecurity,c.relforcerowsecurity from pg_class c where c.relnamespace='public'::regnamespace and c.relkind='r' order by 1;
      select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by 1,2,3;
      select event_object_table,trigger_name,action_statement from information_schema.triggers where trigger_schema='public';
      select tablename,indexname,indexdef from pg_indexes where schemaname='public' order by tablename,indexname;
      -- Review candidate duplicate triggers; never delete unknown business triggers automatically.
      select tgrelid::regclass,tgfoid::regprocedure,tgtype,count(*) from pg_trigger where not tgisinternal and tgrelid in (select oid from pg_class where relnamespace='public'::regnamespace) group by tgrelid,tgfoid,tgtype having count(*)>1;
      select id,name,public,file_size_limit,allowed_mime_types from storage.buckets;
      select pg_get_functiondef(to_regprocedure('public.is_admin()'));
      select id,raw_app_meta_data->>'role' as trusted_role from auth.users where raw_app_meta_data->>'role'='admin';
      select grantee,table_name,privilege_type from information_schema.role_table_grants where table_schema='public' and grantee in ('PUBLIC','anon','authenticated','service_role') order by 2,1,3;
      select p.proname,p.prosecdef,p.proconfig from pg_proc p where p.pronamespace='public'::regnamespace;
      -- Expected empty: missing columns/tables, wrong types or nullability.
      with expected(table_name,column_name,column_type,required) as (values
${columns.map(c=>`(${quote(c.table_name)},${quote(c.column_name)},${quote(c.data_type)},${c.required})`).join(',\n')}
      ) select e.*,format_type(a.atttypid,a.atttypmod) as actual_type,a.attnotnull from expected e left join pg_class c on c.relnamespace='public'::regnamespace and c.relname=e.table_name
      left join pg_attribute a on a.attrelid=c.oid and a.attname=e.column_name and a.attnum>0 and not a.attisdropped
      where a.attname is null or format_type(a.atttypid,a.atttypmod)<>e.column_type or (e.required and not a.attnotnull);
      -- Expected empty: missing canonical constraints (equivalent constraints under other names are accepted).
      with expected(table_name,definition) as (values
${constraints.map(c=>`(${quote(c.table_name)},array[${c.accepted_definitions.map(quote).join(',')}])`).join(',\n')}
      ) select e.* from expected e where not exists(select 1 from pg_constraint k join pg_class c on c.oid=k.conrelid where c.relnamespace='public'::regnamespace and c.relname=e.table_name and pg_get_constraintdef(k.oid)=any(e.definition) and k.convalidated);
      -- Expected 13 RLS-enabled application tables after installation.
      select count(*) as rls_tables from pg_class where relnamespace='public'::regnamespace and relname=any(${tableArray}) and relrowsecurity;
    `;
    write('VALIDATION_QUERIES.sql','begin read only;\nset local search_path=pg_catalog,public;\n'+validation+'\ncommit;\n');
    write('WORKFLOWS.json',JSON.stringify({fresh:['00_prerequisites.sql','fresh/00_assert_fresh.sql','01_tables_and_columns.sql','02_keys_and_checks.sql','03_storage_buckets.sql','04_foreign_keys.sql','05_functions_triggers_indexes.sql','06_rls_and_grants.sql','07_editorial_defaults.sql','VALIDATION_QUERIES.sql'],upgrade:['00_prerequisites.sql','upgrade/00_upgrade_review.sql','01_tables_and_columns.sql','02_keys_and_checks.sql','03_storage_buckets.sql','04_foreign_keys.sql','05_functions_triggers_indexes.sql','06_rls_and_grants.sql','07_editorial_defaults.sql','VALIDATION_QUERIES.sql']},null,2));
    write('SOURCE_PROVENANCE.json',JSON.stringify(sources.map(file=>({file,sha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')})),null,2));
    console.log(`Verified package generated from executed PostgreSQL catalog: ${tables.length} tables, ${columns.length} columns, ${constraints.length} constraints, ${policies.length} policies. No remote database contacted.`);
  } finally {await db.close();}
}
main().catch(error=>{console.error(error.message,error.sqlFile||'');process.exitCode=1;});
