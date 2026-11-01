begin;
set local search_path=pg_catalog,public;
-- 07: STORAGE POLICIES ONLY.
-- Supabase Dashboard > SQL Editor: execute the complete file with role postgres.
-- Supabase policy_grants can authorize postgres without table ownership.
-- Do not SET ROLE supabase_storage_admin, change ownership, or disable RLS.
-- There is intentionally no ownership/membership preflight. Actual CREATE/DROP POLICY enforces authorization.
-- Any real 42501 aborts this entire transaction: do not skip this file.
do $$ begin if exists(select 1 from pg_policies p where (p.schemaname='storage' and p.tablename='objects') and not exists(select 1 from (values
('objects','CMS admin media all'),
('objects','CMS published media read'),
('objects','SLKM admins media delete'),
('objects','SLKM authenticated media update'),
('objects','SLKM authenticated media upload'),
('objects','SLKM public media read')
) allowed(table_name,policy_name) where allowed.table_name=p.tablename and allowed.policy_name=p.policyname)) then raise exception 'Unreviewed storage policies found; inspect 08.sql and review before continuing. No unknown policy was removed.'; end if; end $$;

drop policy if exists "CMS admin media all" on "storage"."objects";
create policy "CMS admin media all" on "storage"."objects" as PERMISSIVE for ALL to "authenticated" using (((bucket_id = 'site-media'::text) AND public.is_admin())) with check (((bucket_id = 'site-media'::text) AND public.is_admin()));
drop policy if exists "CMS published media read" on "storage"."objects";
create policy "CMS published media read" on "storage"."objects" as PERMISSIVE for SELECT to "anon","authenticated" using (((bucket_id = 'site-media'::text) AND (EXISTS ( SELECT 1
   FROM public.site_media_assets a
  WHERE ((a.storage_path = objects.name) AND a.is_active AND a.is_published)))));
drop policy if exists "SLKM admins media delete" on "storage"."objects";
create policy "SLKM admins media delete" on "storage"."objects" as PERMISSIVE for DELETE to "authenticated" using (((bucket_id = ANY (ARRAY['agencies-media'::text, 'blog-images'::text, 'fleet-images'::text])) AND public.is_admin()));
drop policy if exists "SLKM authenticated media update" on "storage"."objects";
create policy "SLKM authenticated media update" on "storage"."objects" as PERMISSIVE for UPDATE to "authenticated" using (((bucket_id = ANY (ARRAY['agencies-media'::text, 'blog-images'::text, 'fleet-images'::text])) AND public.is_admin())) with check (((bucket_id = ANY (ARRAY['agencies-media'::text, 'blog-images'::text, 'fleet-images'::text])) AND public.is_admin()));
drop policy if exists "SLKM authenticated media upload" on "storage"."objects";
create policy "SLKM authenticated media upload" on "storage"."objects" as PERMISSIVE for INSERT to "authenticated" with check (((bucket_id = ANY (ARRAY['agencies-media'::text, 'blog-images'::text, 'fleet-images'::text])) AND public.is_admin() AND (length(TRIM(BOTH FROM name)) > 0)));
drop policy if exists "SLKM public media read" on "storage"."objects";
create policy "SLKM public media read" on "storage"."objects" as PERMISSIVE for SELECT to "anon","authenticated" using ((bucket_id = ANY (ARRAY['agencies-media'::text, 'blog-images'::text, 'fleet-images'::text])));
commit;

-- Read-only diagnostics after a successful commit.
select current_user as execution_role,session_user as login_role,pg_get_userbyid(relowner) as storage_table_owner,relrowsecurity as storage_rls_enabled from pg_class where oid='storage.objects'::regclass;
