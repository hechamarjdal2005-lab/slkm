begin;
set local search_path=pg_catalog,public;
-- 03: bucket configuration, then application foreign keys. No Storage system-table DDL.
-- Supabase owns Storage system tables. No ALTER TABLE storage.objects here.
do $$ begin if exists(select 1 from storage.buckets where id='agencies-media' and public is distinct from true) then raise exception 'Bucket agencies-media visibility differs: review existing files before changing confidentiality'; end if; end $$;
do $$ begin if exists(select 1 from storage.buckets where id='blog-images' and public is distinct from true) then raise exception 'Bucket blog-images visibility differs: review existing files before changing confidentiality'; end if; end $$;
do $$ begin if exists(select 1 from storage.buckets where id='fleet-images' and public is distinct from true) then raise exception 'Bucket fleet-images visibility differs: review existing files before changing confidentiality'; end if; end $$;
do $$ begin if exists(select 1 from storage.buckets where id='site-media' and public is distinct from false) then raise exception 'Bucket site-media visibility differs: review existing files before changing confidentiality'; end if; end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('agencies-media','agencies-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']),
('blog-images','blog-images',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']),
('fleet-images','fleet-images',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']),
('site-media','site-media',false,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
      on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- All application keys and Storage bucket rows now exist.
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.messagerie_agencies'::regclass and conname='messagerie_agencies_agency_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE RESTRICT') then
          raise exception 'Conflicting foreign key messagerie_agencies.messagerie_agencies_agency_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.messagerie_agencies'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE RESTRICT' limit 1;
        if existing.conname is null then alter table public."messagerie_agencies" add constraint "messagerie_agencies_agency_id_fkey" FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE RESTRICT;
        elsif not existing.convalidated then execute format('alter table public."messagerie_agencies" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.routes'::regclass and conname='routes_from_agency_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (from_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT') then
          raise exception 'Conflicting foreign key routes.routes_from_agency_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.routes'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (from_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT' limit 1;
        if existing.conname is null then alter table public."routes" add constraint "routes_from_agency_id_fkey" FOREIGN KEY (from_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT;
        elsif not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.routes'::regclass and conname='routes_to_agency_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (to_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT') then
          raise exception 'Conflicting foreign key routes.routes_to_agency_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.routes'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (to_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT' limit 1;
        if existing.conname is null then alter table public."routes" add constraint "routes_to_agency_id_fkey" FOREIGN KEY (to_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT;
        elsif not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.site_media_assets'::regclass and conname='site_media_assets_bucket_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) ON DELETE RESTRICT') then
          raise exception 'Conflicting foreign key site_media_assets.site_media_assets_bucket_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.site_media_assets'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) ON DELETE RESTRICT' limit 1;
        if existing.conname is null then alter table public."site_media_assets" add constraint "site_media_assets_bucket_id_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) ON DELETE RESTRICT;
        elsif not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.site_page_media'::regclass and conname='site_page_media_asset_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT') then
          raise exception 'Conflicting foreign key site_page_media.site_page_media_asset_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.site_page_media'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT' limit 1;
        if existing.conname is null then alter table public."site_page_media" add constraint "site_page_media_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT;
        elsif not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.site_page_media'::regclass and conname='site_page_media_page_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE') then
          raise exception 'Conflicting foreign key site_page_media.site_page_media_page_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.site_page_media'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE' limit 1;
        if existing.conname is null then alter table public."site_page_media" add constraint "site_page_media_page_id_fkey" FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE;
        elsif not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.site_sections'::regclass and conname='site_sections_media_asset_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (media_asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT') then
          raise exception 'Conflicting foreign key site_sections.site_sections_media_asset_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.site_sections'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (media_asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT' limit 1;
        if existing.conname is null then alter table public."site_sections" add constraint "site_sections_media_asset_id_fkey" FOREIGN KEY (media_asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT;
        elsif not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
      end $$;
do $$ declare existing record; begin
        if exists(select 1 from pg_constraint where conrelid='public.site_sections'::regclass and conname='site_sections_page_id_fkey' and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')<>'FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE') then
          raise exception 'Conflicting foreign key site_sections.site_sections_page_id_fkey; review before continuing';
        end if;
        select conname,convalidated into existing from pg_constraint where conrelid='public.site_sections'::regclass and regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','')='FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE' limit 1;
        if existing.conname is null then alter table public."site_sections" add constraint "site_sections_page_id_fkey" FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE;
        elsif not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
      end $$;
commit;
