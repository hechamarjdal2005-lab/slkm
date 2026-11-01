begin;
set local search_path=pg_catalog,public;
-- 09: completion checks and PostgREST schema refresh. No business data changes.
do $$ begin
if (select count(*) from pg_class where relnamespace='public'::regnamespace and relkind='r' and relname=any(array['agencies','blog_posts','contact_messages','corporate_quotes','messagerie_agencies','messagerie_network_settings','parcel_rates','routes','site_media_assets','site_page_media','site_pages','site_sections','site_settings']) and relrowsecurity)<>13 then raise exception 'Expected 13 RLS-enabled application tables; complete 01.sql through 07.sql first'; end if;
if not exists(select 1 from pg_class where oid='storage.objects'::regclass and relrowsecurity) then raise exception 'Storage system RLS is not enabled; stop and contact the project administrator'; end if;
if exists(select 1 from (values ('CMS admin media all'),('CMS published media read'),('SLKM admins media delete'),('SLKM authenticated media update'),('SLKM authenticated media upload'),('SLKM public media read')) expected(name) where not exists(select 1 from pg_policies p where p.schemaname='storage' and p.tablename='objects' and p.policyname=expected.name)) then raise exception 'Storage policies incomplete: execute 07.sql successfully as postgres in Supabase SQL Editor'; end if;
if has_table_privilege('anon','public.contact_messages','SELECT') or has_table_privilege('anon','public.corporate_quotes','SELECT') then raise exception 'Anonymous SQL read access to private requests detected; review 05.sql and inherited privileges'; end if;
if not exists(select 1 from public.site_settings where id=1) then raise exception 'Settings singleton missing: execute 06.sql'; end if;
end $$;
notify pgrst, 'reload schema';
commit;

select 'SLKM schema and managed policy presence checks completed; test hosted Storage and admin CRUD separately.' as migration_status;
