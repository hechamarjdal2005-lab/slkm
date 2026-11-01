-- 02: primary/unique/check constraints, before any foreign key.
begin;
set local search_path=pg_catalog,public;
-- Unique/primary/check constraints before dependent foreign keys.
-- Scratch objects are created and removed inside EACH DO statement.
-- No temporary table needs to survive a prior statement, transaction or session.
-- Only empty pg_temp scratch objects are dropped; application tables/data are retained.
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_agencies" (like public."agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_agencies" (like public."agencies") on commit drop;
        alter table pg_temp."slkm_expected_agencies" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.agencies'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='agencies_pkey' then
            raise exception 'Conflicting constraint agencies.agencies_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."agencies" add constraint "agencies_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_agencies";
        drop table pg_temp."slkm_actual_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_blog_posts" (like public."blog_posts") on commit drop;
        create temporary table pg_temp."slkm_actual_blog_posts" (like public."blog_posts") on commit drop;
        alter table pg_temp."slkm_expected_blog_posts" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_blog_posts'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.blog_posts'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_blog_posts" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_blog_posts'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_blog_posts" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."blog_posts" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='blog_posts_pkey' then
            raise exception 'Conflicting constraint blog_posts.blog_posts_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."blog_posts" add constraint "blog_posts_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_blog_posts" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_blog_posts";
        drop table pg_temp."slkm_actual_blog_posts";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_contact_messages" (like public."contact_messages") on commit drop;
        create temporary table pg_temp."slkm_actual_contact_messages" (like public."contact_messages") on commit drop;
        alter table pg_temp."slkm_expected_contact_messages" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_contact_messages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.contact_messages'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_contact_messages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_contact_messages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_contact_messages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."contact_messages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='contact_messages_pkey' then
            raise exception 'Conflicting constraint contact_messages.contact_messages_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."contact_messages" add constraint "contact_messages_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_contact_messages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_contact_messages";
        drop table pg_temp."slkm_actual_contact_messages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_corporate_quotes" (like public."corporate_quotes") on commit drop;
        create temporary table pg_temp."slkm_actual_corporate_quotes" (like public."corporate_quotes") on commit drop;
        alter table pg_temp."slkm_expected_corporate_quotes" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_corporate_quotes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.corporate_quotes'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_corporate_quotes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_corporate_quotes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_corporate_quotes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."corporate_quotes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='corporate_quotes_pkey' then
            raise exception 'Conflicting constraint corporate_quotes.corporate_quotes_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."corporate_quotes" add constraint "corporate_quotes_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_corporate_quotes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_corporate_quotes";
        drop table pg_temp."slkm_actual_corporate_quotes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_agencies" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_agencies'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='messagerie_agencies_pkey' then
            raise exception 'Conflicting constraint messagerie_agencies.messagerie_agencies_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_agencies" add constraint "messagerie_agencies_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_messagerie_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_agencies";
        drop table pg_temp."slkm_actual_messagerie_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_network_settings" (like public."messagerie_network_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_network_settings" (like public."messagerie_network_settings") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_network_settings" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_network_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_network_settings'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_network_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_network_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_network_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_network_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='messagerie_network_settings_pkey' then
            raise exception 'Conflicting constraint messagerie_network_settings.messagerie_network_settings_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_network_settings" add constraint "messagerie_network_settings_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_messagerie_network_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_network_settings";
        drop table pg_temp."slkm_actual_messagerie_network_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_parcel_rates" (like public."parcel_rates") on commit drop;
        create temporary table pg_temp."slkm_actual_parcel_rates" (like public."parcel_rates") on commit drop;
        alter table pg_temp."slkm_expected_parcel_rates" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_parcel_rates'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.parcel_rates'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_parcel_rates" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_parcel_rates'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_parcel_rates" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."parcel_rates" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='parcel_rates_pkey' then
            raise exception 'Conflicting constraint parcel_rates.parcel_rates_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."parcel_rates" add constraint "parcel_rates_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_parcel_rates" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_parcel_rates";
        drop table pg_temp."slkm_actual_parcel_rates";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_routes" (like public."routes") on commit drop;
        create temporary table pg_temp."slkm_actual_routes" (like public."routes") on commit drop;
        alter table pg_temp."slkm_expected_routes" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_routes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.routes'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_routes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_routes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_routes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='routes_pkey' then
            raise exception 'Conflicting constraint routes.routes_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."routes" add constraint "routes_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_routes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_routes";
        drop table pg_temp."slkm_actual_routes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_pkey' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_page_media" (like public."site_page_media") on commit drop;
        create temporary table pg_temp."slkm_actual_site_page_media" (like public."site_page_media") on commit drop;
        alter table pg_temp."slkm_expected_site_page_media" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_page_media'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_page_media'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_site_page_media" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_page_media'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_page_media" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_page_media_pkey' then
            raise exception 'Conflicting constraint site_page_media.site_page_media_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_page_media" add constraint "site_page_media_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_site_page_media" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_page_media";
        drop table pg_temp."slkm_actual_site_page_media";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_pkey' then
            raise exception 'Conflicting constraint site_pages.site_pages_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_pkey' then
            raise exception 'Conflicting constraint site_sections.site_sections_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint PRIMARY KEY (id);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='p' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_settings_pkey' then
            raise exception 'Conflicting constraint site_settings.site_settings_pkey; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_settings_pkey" PRIMARY KEY (id); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_blog_posts" (like public."blog_posts") on commit drop;
        create temporary table pg_temp."slkm_actual_blog_posts" (like public."blog_posts") on commit drop;
        alter table pg_temp."slkm_expected_blog_posts" add constraint slkm_expected_constraint UNIQUE (slug);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_blog_posts'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.blog_posts'::regclass and contype='u' loop
          execute format('alter table pg_temp."slkm_actual_blog_posts" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_blog_posts'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_blog_posts" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."blog_posts" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='blog_posts_slug_key' then
            raise exception 'Conflicting constraint blog_posts.blog_posts_slug_key; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."blog_posts" add constraint "blog_posts_slug_key" UNIQUE (slug); end if;
        alter table pg_temp."slkm_expected_blog_posts" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_blog_posts";
        drop table pg_temp."slkm_actual_blog_posts";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint UNIQUE (storage_path);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='u' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_storage_path_key' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_storage_path_key; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_storage_path_key" UNIQUE (storage_path); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_page_media" (like public."site_page_media") on commit drop;
        create temporary table pg_temp."slkm_actual_site_page_media" (like public."site_page_media") on commit drop;
        alter table pg_temp."slkm_expected_site_page_media" add constraint slkm_expected_constraint UNIQUE (page_id, field_key);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_page_media'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_page_media'::regclass and contype='u' loop
          execute format('alter table pg_temp."slkm_actual_site_page_media" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_page_media'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_page_media" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_page_media_page_id_field_key_key' then
            raise exception 'Conflicting constraint site_page_media.site_page_media_page_id_field_key_key; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_page_media" add constraint "site_page_media_page_id_field_key_key" UNIQUE (page_id, field_key); end if;
        alter table pg_temp."slkm_expected_site_page_media" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_page_media";
        drop table pg_temp."slkm_actual_site_page_media";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint UNIQUE (route);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='u' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_route_key' then
            raise exception 'Conflicting constraint site_pages.site_pages_route_key; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_route_key" UNIQUE (route); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint UNIQUE (slug);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='u' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_slug_key' then
            raise exception 'Conflicting constraint site_pages.site_pages_slug_key; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_slug_key" UNIQUE (slug); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint UNIQUE (page_id, section_key);
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='u' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_page_id_section_key_key' then
            raise exception 'Conflicting constraint site_sections.site_sections_page_id_section_key_key; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_page_id_section_key_key" UNIQUE (page_id, section_key); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_agencies" (like public."agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_agencies" (like public."agencies") on commit drop;
        alter table pg_temp."slkm_expected_agencies" add constraint slkm_expected_constraint CHECK (((lat IS NULL) = (lng IS NULL)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='agencies_coordinates_together' then
            raise exception 'Conflicting constraint agencies.agencies_coordinates_together; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."agencies" add constraint "agencies_coordinates_together" CHECK (((lat IS NULL) = (lng IS NULL))); end if;
        alter table pg_temp."slkm_expected_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_agencies";
        drop table pg_temp."slkm_actual_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_agencies" (like public."agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_agencies" (like public."agencies") on commit drop;
        alter table pg_temp."slkm_expected_agencies" add constraint slkm_expected_constraint CHECK (((lat IS NULL) OR ((lat >= ('-90'::integer)::numeric) AND (lat <= (90)::numeric))));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='agencies_lat_range' then
            raise exception 'Conflicting constraint agencies.agencies_lat_range; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."agencies" add constraint "agencies_lat_range" CHECK (((lat IS NULL) OR ((lat >= ('-90'::integer)::numeric) AND (lat <= (90)::numeric)))); end if;
        alter table pg_temp."slkm_expected_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_agencies";
        drop table pg_temp."slkm_actual_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_agencies" (like public."agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_agencies" (like public."agencies") on commit drop;
        alter table pg_temp."slkm_expected_agencies" add constraint slkm_expected_constraint CHECK (((lng IS NULL) OR ((lng >= ('-180'::integer)::numeric) AND (lng <= (180)::numeric))));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='agencies_lng_range' then
            raise exception 'Conflicting constraint agencies.agencies_lng_range; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."agencies" add constraint "agencies_lng_range" CHECK (((lng IS NULL) OR ((lng >= ('-180'::integer)::numeric) AND (lng <= (180)::numeric)))); end if;
        alter table pg_temp."slkm_expected_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_agencies";
        drop table pg_temp."slkm_actual_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_agencies" (like public."agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_agencies" (like public."agencies") on commit drop;
        alter table pg_temp."slkm_expected_agencies" add constraint slkm_expected_constraint CHECK (((sort_order >= 0) AND (sort_order <= 10000)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='agencies_sort_order_check' then
            raise exception 'Conflicting constraint agencies.agencies_sort_order_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."agencies" add constraint "agencies_sort_order_check" CHECK (((sort_order >= 0) AND (sort_order <= 10000))); end if;
        alter table pg_temp."slkm_expected_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_agencies";
        drop table pg_temp."slkm_actual_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_blog_posts" (like public."blog_posts") on commit drop;
        create temporary table pg_temp."slkm_actual_blog_posts" (like public."blog_posts") on commit drop;
        alter table pg_temp."slkm_expected_blog_posts" add constraint slkm_expected_constraint CHECK (((slug)::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_blog_posts'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.blog_posts'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_blog_posts" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_blog_posts'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_blog_posts" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."blog_posts" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='blog_posts_slug_format' then
            raise exception 'Conflicting constraint blog_posts.blog_posts_slug_format; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."blog_posts" add constraint "blog_posts_slug_format" CHECK (((slug)::text ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'::text)); end if;
        alter table pg_temp."slkm_expected_blog_posts" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_blog_posts";
        drop table pg_temp."slkm_actual_blog_posts";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_contact_messages" (like public."contact_messages") on commit drop;
        create temporary table pg_temp."slkm_actual_contact_messages" (like public."contact_messages") on commit drop;
        alter table pg_temp."slkm_expected_contact_messages" add constraint slkm_expected_constraint CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'read'::character varying, 'replied'::character varying, 'archived'::character varying])::text[])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_contact_messages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.contact_messages'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_contact_messages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_contact_messages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_contact_messages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."contact_messages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='contact_messages_status_valid' then
            raise exception 'Conflicting constraint contact_messages.contact_messages_status_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."contact_messages" add constraint "contact_messages_status_valid" CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'read'::character varying, 'replied'::character varying, 'archived'::character varying])::text[]))); end if;
        alter table pg_temp."slkm_expected_contact_messages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_contact_messages";
        drop table pg_temp."slkm_actual_contact_messages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_corporate_quotes" (like public."corporate_quotes") on commit drop;
        create temporary table pg_temp."slkm_actual_corporate_quotes" (like public."corporate_quotes") on commit drop;
        alter table pg_temp."slkm_expected_corporate_quotes" add constraint slkm_expected_constraint CHECK ((passenger_count > 0));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_corporate_quotes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.corporate_quotes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_corporate_quotes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_corporate_quotes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_corporate_quotes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."corporate_quotes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='corporate_quotes_passenger_count_positive' then
            raise exception 'Conflicting constraint corporate_quotes.corporate_quotes_passenger_count_positive; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."corporate_quotes" add constraint "corporate_quotes_passenger_count_positive" CHECK ((passenger_count > 0)); end if;
        alter table pg_temp."slkm_expected_corporate_quotes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_corporate_quotes";
        drop table pg_temp."slkm_actual_corporate_quotes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_corporate_quotes" (like public."corporate_quotes") on commit drop;
        create temporary table pg_temp."slkm_actual_corporate_quotes" (like public."corporate_quotes") on commit drop;
        alter table pg_temp."slkm_expected_corporate_quotes" add constraint slkm_expected_constraint CHECK (((service_type)::text = ANY ((ARRAY['personnel'::character varying, 'tourisme'::character varying])::text[])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_corporate_quotes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.corporate_quotes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_corporate_quotes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_corporate_quotes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_corporate_quotes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."corporate_quotes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='corporate_quotes_service_type_valid' then
            raise exception 'Conflicting constraint corporate_quotes.corporate_quotes_service_type_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."corporate_quotes" add constraint "corporate_quotes_service_type_valid" CHECK (((service_type)::text = ANY ((ARRAY['personnel'::character varying, 'tourisme'::character varying])::text[]))); end if;
        alter table pg_temp."slkm_expected_corporate_quotes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_corporate_quotes";
        drop table pg_temp."slkm_actual_corporate_quotes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_corporate_quotes" (like public."corporate_quotes") on commit drop;
        create temporary table pg_temp."slkm_actual_corporate_quotes" (like public."corporate_quotes") on commit drop;
        alter table pg_temp."slkm_expected_corporate_quotes" add constraint slkm_expected_constraint CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'contacted'::character varying, 'quoted'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_corporate_quotes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.corporate_quotes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_corporate_quotes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_corporate_quotes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_corporate_quotes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."corporate_quotes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='corporate_quotes_status_valid' then
            raise exception 'Conflicting constraint corporate_quotes.corporate_quotes_status_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."corporate_quotes" add constraint "corporate_quotes_status_valid" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'contacted'::character varying, 'quoted'::character varying, 'confirmed'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[]))); end if;
        alter table pg_temp."slkm_expected_corporate_quotes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_corporate_quotes";
        drop table pg_temp."slkm_actual_corporate_quotes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_agencies" add constraint slkm_expected_constraint CHECK ((display_order >= 0));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='messagerie_agencies_display_order_check' then
            raise exception 'Conflicting constraint messagerie_agencies.messagerie_agencies_display_order_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_agencies" add constraint "messagerie_agencies_display_order_check" CHECK ((display_order >= 0)); end if;
        alter table pg_temp."slkm_expected_messagerie_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_agencies";
        drop table pg_temp."slkm_actual_messagerie_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_agencies" add constraint slkm_expected_constraint CHECK ((((agency_id IS NOT NULL) AND (name_fr IS NULL) AND (name_ar IS NULL) AND (name_en IS NULL) AND (city_fr IS NULL) AND (city_ar IS NULL) AND (city_en IS NULL) AND (address_fr IS NULL) AND (address_ar IS NULL) AND (address_en IS NULL) AND (phone IS NULL) AND (whatsapp IS NULL)) OR ((agency_id IS NULL) AND (COALESCE(length(TRIM(BOTH FROM name_fr)), 0) > 0) AND (COALESCE(length(TRIM(BOTH FROM city_fr)), 0) > 0))));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='messagerie_agency_source' then
            raise exception 'Conflicting constraint messagerie_agencies.messagerie_agency_source; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_agencies" add constraint "messagerie_agency_source" CHECK ((((agency_id IS NOT NULL) AND (name_fr IS NULL) AND (name_ar IS NULL) AND (name_en IS NULL) AND (city_fr IS NULL) AND (city_ar IS NULL) AND (city_en IS NULL) AND (address_fr IS NULL) AND (address_ar IS NULL) AND (address_en IS NULL) AND (phone IS NULL) AND (whatsapp IS NULL)) OR ((agency_id IS NULL) AND (COALESCE(length(TRIM(BOTH FROM name_fr)), 0) > 0) AND (COALESCE(length(TRIM(BOTH FROM city_fr)), 0) > 0)))); end if;
        alter table pg_temp."slkm_expected_messagerie_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_agencies";
        drop table pg_temp."slkm_actual_messagerie_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_agencies" (like public."messagerie_agencies") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_agencies" add constraint slkm_expected_constraint CHECK ((((lat IS NULL) = (lng IS NULL)) AND ((lat IS NULL) OR ((lat >= ('-90'::integer)::numeric) AND (lat <= (90)::numeric))) AND ((lng IS NULL) OR ((lng >= ('-180'::integer)::numeric) AND (lng <= (180)::numeric))) AND ((image_url IS NULL) OR (image_url ~ '^https://'::text) OR (image_url ~ '^/[^/]'::text)) AND (jsonb_typeof(agents) = 'array'::text) AND (jsonb_array_length(agents) <= 20) AND (octet_length((agents)::text) <= 32768)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_agencies'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_agencies'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_agencies" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_agencies'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_agencies" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_agencies" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='slkm_messagerie_details_valid' then
            raise exception 'Conflicting constraint messagerie_agencies.slkm_messagerie_details_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_agencies" add constraint "slkm_messagerie_details_valid" CHECK ((((lat IS NULL) = (lng IS NULL)) AND ((lat IS NULL) OR ((lat >= ('-90'::integer)::numeric) AND (lat <= (90)::numeric))) AND ((lng IS NULL) OR ((lng >= ('-180'::integer)::numeric) AND (lng <= (180)::numeric))) AND ((image_url IS NULL) OR (image_url ~ '^https://'::text) OR (image_url ~ '^/[^/]'::text)) AND (jsonb_typeof(agents) = 'array'::text) AND (jsonb_array_length(agents) <= 20) AND (octet_length((agents)::text) <= 32768))); end if;
        alter table pg_temp."slkm_expected_messagerie_agencies" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_agencies";
        drop table pg_temp."slkm_actual_messagerie_agencies";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_network_settings" (like public."messagerie_network_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_network_settings" (like public."messagerie_network_settings") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_network_settings" add constraint slkm_expected_constraint CHECK ((id = 1));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_network_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_network_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_network_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_network_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_network_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_network_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='messagerie_network_settings_id_check' then
            raise exception 'Conflicting constraint messagerie_network_settings.messagerie_network_settings_id_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_network_settings" add constraint "messagerie_network_settings_id_check" CHECK ((id = 1)); end if;
        alter table pg_temp."slkm_expected_messagerie_network_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_network_settings";
        drop table pg_temp."slkm_actual_messagerie_network_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_messagerie_network_settings" (like public."messagerie_network_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_messagerie_network_settings" (like public."messagerie_network_settings") on commit drop;
        alter table pg_temp."slkm_expected_messagerie_network_settings" add constraint slkm_expected_constraint CHECK (((map_image_url IS NULL) OR (map_image_url ~ '^https://'::text) OR (map_image_url ~ '^/[^/]'::text)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_messagerie_network_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.messagerie_network_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_messagerie_network_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_messagerie_network_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_messagerie_network_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."messagerie_network_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='messagerie_network_settings_map_image_url_check' then
            raise exception 'Conflicting constraint messagerie_network_settings.messagerie_network_settings_map_image_url_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."messagerie_network_settings" add constraint "messagerie_network_settings_map_image_url_check" CHECK (((map_image_url IS NULL) OR (map_image_url ~ '^https://'::text) OR (map_image_url ~ '^/[^/]'::text))); end if;
        alter table pg_temp."slkm_expected_messagerie_network_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_messagerie_network_settings";
        drop table pg_temp."slkm_actual_messagerie_network_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_parcel_rates" (like public."parcel_rates") on commit drop;
        create temporary table pg_temp."slkm_actual_parcel_rates" (like public."parcel_rates") on commit drop;
        alter table pg_temp."slkm_expected_parcel_rates" add constraint slkm_expected_constraint CHECK ((base_price_mad >= (0)::numeric));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_parcel_rates'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.parcel_rates'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_parcel_rates" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_parcel_rates'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_parcel_rates" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."parcel_rates" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='parcel_rates_price_nonnegative' then
            raise exception 'Conflicting constraint parcel_rates.parcel_rates_price_nonnegative; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."parcel_rates" add constraint "parcel_rates_price_nonnegative" CHECK ((base_price_mad >= (0)::numeric)); end if;
        alter table pg_temp."slkm_expected_parcel_rates" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_parcel_rates";
        drop table pg_temp."slkm_actual_parcel_rates";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_parcel_rates" (like public."parcel_rates") on commit drop;
        create temporary table pg_temp."slkm_actual_parcel_rates" (like public."parcel_rates") on commit drop;
        alter table pg_temp."slkm_expected_parcel_rates" add constraint slkm_expected_constraint CHECK ((max_weight_kg > (0)::numeric));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_parcel_rates'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.parcel_rates'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_parcel_rates" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_parcel_rates'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_parcel_rates" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."parcel_rates" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='parcel_rates_weight_positive' then
            raise exception 'Conflicting constraint parcel_rates.parcel_rates_weight_positive; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."parcel_rates" add constraint "parcel_rates_weight_positive" CHECK ((max_weight_kg > (0)::numeric)); end if;
        alter table pg_temp."slkm_expected_parcel_rates" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_parcel_rates";
        drop table pg_temp."slkm_actual_parcel_rates";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_routes" (like public."routes") on commit drop;
        create temporary table pg_temp."slkm_actual_routes" (like public."routes") on commit drop;
        alter table pg_temp."slkm_expected_routes" add constraint slkm_expected_constraint CHECK (((bus_type)::text = ANY ((ARRAY['Comfort'::character varying, 'Premium'::character varying, 'VIP'::character varying])::text[])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_routes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.routes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_routes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_routes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_routes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='routes_bus_type_valid' then
            raise exception 'Conflicting constraint routes.routes_bus_type_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."routes" add constraint "routes_bus_type_valid" CHECK (((bus_type)::text = ANY ((ARRAY['Comfort'::character varying, 'Premium'::character varying, 'VIP'::character varying])::text[]))); end if;
        alter table pg_temp."slkm_expected_routes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_routes";
        drop table pg_temp."slkm_actual_routes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_routes" (like public."routes") on commit drop;
        create temporary table pg_temp."slkm_actual_routes" (like public."routes") on commit drop;
        alter table pg_temp."slkm_expected_routes" add constraint slkm_expected_constraint CHECK ((days_of_week <@ ARRAY['MON'::text, 'TUE'::text, 'WED'::text, 'THU'::text, 'FRI'::text, 'SAT'::text, 'SUN'::text]));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_routes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.routes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_routes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_routes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_routes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='routes_days_of_week_valid' then
            raise exception 'Conflicting constraint routes.routes_days_of_week_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."routes" add constraint "routes_days_of_week_valid" CHECK ((days_of_week <@ ARRAY['MON'::text, 'TUE'::text, 'WED'::text, 'THU'::text, 'FRI'::text, 'SAT'::text, 'SUN'::text])); end if;
        alter table pg_temp."slkm_expected_routes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_routes";
        drop table pg_temp."slkm_actual_routes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_routes" (like public."routes") on commit drop;
        create temporary table pg_temp."slkm_actual_routes" (like public."routes") on commit drop;
        alter table pg_temp."slkm_expected_routes" add constraint slkm_expected_constraint CHECK ((from_agency_id <> to_agency_id));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_routes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.routes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_routes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_routes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_routes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='routes_distinct_agencies' then
            raise exception 'Conflicting constraint routes.routes_distinct_agencies; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."routes" add constraint "routes_distinct_agencies" CHECK ((from_agency_id <> to_agency_id)); end if;
        alter table pg_temp."slkm_expected_routes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_routes";
        drop table pg_temp."slkm_actual_routes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_routes" (like public."routes") on commit drop;
        create temporary table pg_temp."slkm_actual_routes" (like public."routes") on commit drop;
        alter table pg_temp."slkm_expected_routes" add constraint slkm_expected_constraint CHECK ((price_mad >= (0)::numeric));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_routes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.routes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_routes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_routes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_routes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='routes_price_nonnegative' then
            raise exception 'Conflicting constraint routes.routes_price_nonnegative; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."routes" add constraint "routes_price_nonnegative" CHECK ((price_mad >= (0)::numeric)); end if;
        alter table pg_temp."slkm_expected_routes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_routes";
        drop table pg_temp."slkm_actual_routes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_routes" (like public."routes") on commit drop;
        create temporary table pg_temp."slkm_actual_routes" (like public."routes") on commit drop;
        alter table pg_temp."slkm_expected_routes" add constraint slkm_expected_constraint CHECK (((sort_order >= 0) AND (sort_order <= 10000)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_routes'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.routes'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_routes" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_routes'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_routes" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."routes" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='routes_sort_order_check' then
            raise exception 'Conflicting constraint routes.routes_sort_order_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."routes" add constraint "routes_sort_order_check" CHECK (((sort_order >= 0) AND (sort_order <= 10000))); end if;
        alter table pg_temp."slkm_expected_routes" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_routes";
        drop table pg_temp."slkm_actual_routes";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint CHECK ((bucket_id = 'site-media'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_bucket_id_check' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_bucket_id_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_bucket_id_check" CHECK ((bucket_id = 'site-media'::text)); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint CHECK (((length(filename) >= 1) AND (length(filename) <= 255)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_filename_check' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_filename_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_filename_check" CHECK (((length(filename) >= 1) AND (length(filename) <= 255))); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint CHECK ((mime_type = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text, 'image/avif'::text])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_mime_type_check' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_mime_type_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_mime_type_check" CHECK ((mime_type = ANY (ARRAY['image/jpeg'::text, 'image/png'::text, 'image/webp'::text, 'image/avif'::text]))); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint CHECK (((size_bytes >= 1) AND (size_bytes <= 5242880)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_size_bytes_check' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_size_bytes_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_size_bytes_check" CHECK (((size_bytes >= 1) AND (size_bytes <= 5242880))); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_media_assets" (like public."site_media_assets") on commit drop;
        create temporary table pg_temp."slkm_actual_site_media_assets" (like public."site_media_assets") on commit drop;
        alter table pg_temp."slkm_expected_site_media_assets" add constraint slkm_expected_constraint CHECK ((storage_path ~ '^[a-f0-9-]{36}\.(jpg|png|webp|avif)$'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_media_assets'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_media_assets'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_media_assets" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_media_assets'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_media_assets" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_media_assets" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_media_assets_storage_path_check' then
            raise exception 'Conflicting constraint site_media_assets.site_media_assets_storage_path_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_media_assets" add constraint "site_media_assets_storage_path_check" CHECK ((storage_path ~ '^[a-f0-9-]{36}\.(jpg|png|webp|avif)$'::text)); end if;
        alter table pg_temp."slkm_expected_site_media_assets" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_media_assets";
        drop table pg_temp."slkm_actual_site_media_assets";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_page_media" (like public."site_page_media") on commit drop;
        create temporary table pg_temp."slkm_actual_site_page_media" (like public."site_page_media") on commit drop;
        alter table pg_temp."slkm_expected_site_page_media" add constraint slkm_expected_constraint CHECK (((asset_id IS NULL) <> (external_url IS NULL)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_page_media'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_page_media'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_page_media" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_page_media'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_page_media" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_page_media_check' then
            raise exception 'Conflicting constraint site_page_media.site_page_media_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_page_media" add constraint "site_page_media_check" CHECK (((asset_id IS NULL) <> (external_url IS NULL))); end if;
        alter table pg_temp."slkm_expected_site_page_media" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_page_media";
        drop table pg_temp."slkm_actual_site_page_media";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_page_media" (like public."site_page_media") on commit drop;
        create temporary table pg_temp."slkm_actual_site_page_media" (like public."site_page_media") on commit drop;
        alter table pg_temp."slkm_expected_site_page_media" add constraint slkm_expected_constraint CHECK (((external_url IS NULL) OR (external_url ~ '^https://'::text) OR (external_url ~ '^/[^/]'::text)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_page_media'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_page_media'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_page_media" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_page_media'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_page_media" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_page_media_external_url_check' then
            raise exception 'Conflicting constraint site_page_media.site_page_media_external_url_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_page_media" add constraint "site_page_media_external_url_check" CHECK (((external_url IS NULL) OR (external_url ~ '^https://'::text) OR (external_url ~ '^/[^/]'::text))); end if;
        alter table pg_temp."slkm_expected_site_page_media" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_page_media";
        drop table pg_temp."slkm_actual_site_page_media";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_page_media" (like public."site_page_media") on commit drop;
        create temporary table pg_temp."slkm_actual_site_page_media" (like public."site_page_media") on commit drop;
        alter table pg_temp."slkm_expected_site_page_media" add constraint slkm_expected_constraint CHECK ((field_key ~ '^image_[a-f0-9]{12}$'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_page_media'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_page_media'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_page_media" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_page_media'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_page_media" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_page_media" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_page_media_field_key_check' then
            raise exception 'Conflicting constraint site_page_media.site_page_media_field_key_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_page_media" add constraint "site_page_media_field_key_check" CHECK ((field_key ~ '^image_[a-f0-9]{12}$'::text)); end if;
        alter table pg_temp."slkm_expected_site_page_media" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_page_media";
        drop table pg_temp."slkm_actual_site_page_media";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint CHECK (((jsonb_typeof(content) = 'object'::text) AND (jsonb_typeof((content -> 'copy'::text)) = 'object'::text) AND (octet_length((content)::text) <= 262144)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_content_check' then
            raise exception 'Conflicting constraint site_pages.site_pages_content_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_content_check" CHECK (((jsonb_typeof(content) = 'object'::text) AND (jsonb_typeof((content -> 'copy'::text)) = 'object'::text) AND (octet_length((content)::text) <= 262144))); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint CHECK (((hero_overlay >= 0.3) AND (hero_overlay <= 0.9)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_hero_overlay_check' then
            raise exception 'Conflicting constraint site_pages.site_pages_hero_overlay_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_hero_overlay_check" CHECK (((hero_overlay >= 0.3) AND (hero_overlay <= 0.9))); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint CHECK (((length(label) >= 1) AND (length(label) <= 200)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_label_check' then
            raise exception 'Conflicting constraint site_pages.site_pages_label_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_label_check" CHECK (((length(label) >= 1) AND (length(label) <= 200))); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint CHECK ((route =
CASE slug
    WHEN 'home'::text THEN '/'::text
    WHEN 'article'::text THEN '/blog/[slug]'::text
    WHEN 'global'::text THEN 'global'::text
    ELSE ('/'::text || slug)
END));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_route_matches' then
            raise exception 'Conflicting constraint site_pages.site_pages_route_matches; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_route_matches" CHECK ((route =
CASE slug
    WHEN 'home'::text THEN '/'::text
    WHEN 'article'::text THEN '/blog/[slug]'::text
    WHEN 'global'::text THEN 'global'::text
    ELSE ('/'::text || slug)
END)); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_pages" (like public."site_pages") on commit drop;
        create temporary table pg_temp."slkm_actual_site_pages" (like public."site_pages") on commit drop;
        alter table pg_temp."slkm_expected_site_pages" add constraint slkm_expected_constraint CHECK ((slug = ANY (ARRAY['home'::text, 'lignes'::text, 'irsaliyat'::text, 'about'::text, 'services'::text, 'contact'::text, 'blog'::text, 'article'::text, 'global'::text])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_pages'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_pages'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_pages" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_pages'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_pages" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_pages" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_pages_slug_check' then
            raise exception 'Conflicting constraint site_pages.site_pages_slug_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_pages" add constraint "site_pages_slug_check" CHECK ((slug = ANY (ARRAY['home'::text, 'lignes'::text, 'irsaliyat'::text, 'about'::text, 'services'::text, 'contact'::text, 'blog'::text, 'article'::text, 'global'::text]))); end if;
        alter table pg_temp."slkm_expected_site_pages" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_pages";
        drop table pg_temp."slkm_actual_site_pages";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK ((background = ANY (ARRAY['default'::text, 'white'::text, 'orange'::text, 'muted'::text])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_background_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_background_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_background_check" CHECK ((background = ANY (ARRAY['default'::text, 'white'::text, 'orange'::text, 'muted'::text]))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK (((jsonb_typeof(content) = 'object'::text) AND (octet_length((content)::text) <= 65536)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_content_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_content_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_content_check" CHECK (((jsonb_typeof(content) = 'object'::text) AND (octet_length((content)::text) <= 65536))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK (((cta_href = ''::text) OR (cta_href ~ '^https://'::text) OR (cta_href ~ '^/[^/]'::text) OR (cta_href = '/'::text) OR (cta_href ~ '^#[a-zA-Z]'::text)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_cta_href_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_cta_href_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_cta_href_check" CHECK (((cta_href = ''::text) OR (cta_href ~ '^https://'::text) OR (cta_href ~ '^/[^/]'::text) OR (cta_href = '/'::text) OR (cta_href ~ '^#[a-zA-Z]'::text))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK (((image_url IS NULL) OR (image_url ~ '^https://'::text) OR (image_url ~ '^/[^/]'::text)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_image_url_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_image_url_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_image_url_check" CHECK (((image_url IS NULL) OR (image_url ~ '^https://'::text) OR (image_url ~ '^/[^/]'::text))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK ((kind = ANY (ARRAY['builtin'::text, 'text'::text, 'image_text'::text, 'features'::text, 'cta'::text])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_kind_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_kind_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_kind_check" CHECK ((kind = ANY (ARRAY['builtin'::text, 'text'::text, 'image_text'::text, 'features'::text, 'cta'::text]))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK (((length(label) >= 1) AND (length(label) <= 200)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_label_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_label_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_label_check" CHECK (((length(label) >= 1) AND (length(label) <= 200))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK ((layout = ANY (ARRAY['compact'::text, 'standard'::text])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_layout_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_layout_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_layout_check" CHECK ((layout = ANY (ARRAY['compact'::text, 'standard'::text]))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK ((section_key ~ '^[a-z][a-z0-9-]{0,79}$'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_section_key_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_section_key_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_section_key_check" CHECK ((section_key ~ '^[a-z][a-z0-9-]{0,79}$'::text)); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_sections" (like public."site_sections") on commit drop;
        create temporary table pg_temp."slkm_actual_site_sections" (like public."site_sections") on commit drop;
        alter table pg_temp."slkm_expected_site_sections" add constraint slkm_expected_constraint CHECK (((sort_order >= 0) AND (sort_order <= 10000)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_sections'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_sections'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_sections" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_sections'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_sections" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_sections" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_sections_sort_order_check' then
            raise exception 'Conflicting constraint site_sections.site_sections_sort_order_check; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_sections" add constraint "site_sections_sort_order_check" CHECK (((sort_order >= 0) AND (sort_order <= 10000))); end if;
        alter table pg_temp."slkm_expected_site_sections" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_sections";
        drop table pg_temp."slkm_actual_site_sections";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK (((jsonb_typeof(presentation) = 'object'::text) AND (octet_length((presentation)::text) <= 65536) AND ((NOT (presentation ? 'primary_color'::text)) OR ((presentation ->> 'primary_color'::text) ~ '^#[0-9a-fA-F]{6}$'::text)) AND ((NOT (presentation ? 'secondary_color'::text)) OR ((presentation ->> 'secondary_color'::text) ~ '^#[0-9a-fA-F]{6}$'::text)) AND ((NOT (presentation ? 'font_arabic'::text)) OR ((presentation ->> 'font_arabic'::text) = ANY (ARRAY['cairo'::text, 'system'::text]))) AND ((NOT (presentation ? 'font_latin'::text)) OR ((presentation ->> 'font_latin'::text) = ANY (ARRAY['jakarta'::text, 'system'::text]))) AND ((NOT (presentation ? 'button_style'::text)) OR ((presentation ->> 'button_style'::text) = ANY (ARRAY['rounded'::text, 'soft-square'::text]))) AND ((NOT (presentation ? 'layout'::text)) OR ((presentation ->> 'layout'::text) = ANY (ARRAY['compact'::text, 'comfortable'::text])))));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_presentation_valid' then
            raise exception 'Conflicting constraint site_settings.site_presentation_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_presentation_valid" CHECK (((jsonb_typeof(presentation) = 'object'::text) AND (octet_length((presentation)::text) <= 65536) AND ((NOT (presentation ? 'primary_color'::text)) OR ((presentation ->> 'primary_color'::text) ~ '^#[0-9a-fA-F]{6}$'::text)) AND ((NOT (presentation ? 'secondary_color'::text)) OR ((presentation ->> 'secondary_color'::text) ~ '^#[0-9a-fA-F]{6}$'::text)) AND ((NOT (presentation ? 'font_arabic'::text)) OR ((presentation ->> 'font_arabic'::text) = ANY (ARRAY['cairo'::text, 'system'::text]))) AND ((NOT (presentation ? 'font_latin'::text)) OR ((presentation ->> 'font_latin'::text) = ANY (ARRAY['jakarta'::text, 'system'::text]))) AND ((NOT (presentation ? 'button_style'::text)) OR ((presentation ->> 'button_style'::text) = ANY (ARRAY['rounded'::text, 'soft-square'::text]))) AND ((NOT (presentation ? 'layout'::text)) OR ((presentation ->> 'layout'::text) = ANY (ARRAY['compact'::text, 'comfortable'::text]))))); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK ((jsonb_typeof(analytics_config) = 'object'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_settings_analytics_is_object' then
            raise exception 'Conflicting constraint site_settings.site_settings_analytics_is_object; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_settings_analytics_is_object" CHECK ((jsonb_typeof(analytics_config) = 'object'::text)); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK (((default_locale)::text = ANY ((ARRAY['ar'::character varying, 'fr'::character varying, 'en'::character varying])::text[])));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_settings_default_locale_valid' then
            raise exception 'Conflicting constraint site_settings.site_settings_default_locale_valid; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_settings_default_locale_valid" CHECK (((default_locale)::text = ANY ((ARRAY['ar'::character varying, 'fr'::character varying, 'en'::character varying])::text[]))); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK ((jsonb_typeof(emergency_lines) = 'array'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_settings_emergency_lines_is_array' then
            raise exception 'Conflicting constraint site_settings.site_settings_emergency_lines_is_array; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_settings_emergency_lines_is_array" CHECK ((jsonb_typeof(emergency_lines) = 'array'::text)); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK ((id = 1));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_settings_singleton' then
            raise exception 'Conflicting constraint site_settings.site_settings_singleton; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_settings_singleton" CHECK ((id = 1)); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK ((jsonb_typeof(social_links) = 'object'::text));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='site_settings_social_links_is_object' then
            raise exception 'Conflicting constraint site_settings.site_settings_social_links_is_object; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "site_settings_social_links_is_object" CHECK ((jsonb_typeof(social_links) = 'object'::text)); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
do $$ declare wanted text; observed text; existing record; matched boolean:=false; begin
        -- Never depend on scratch objects from another SQL Editor statement/session.
        create temporary table pg_temp."slkm_expected_site_settings" (like public."site_settings") on commit drop;
        create temporary table pg_temp."slkm_actual_site_settings" (like public."site_settings") on commit drop;
        alter table pg_temp."slkm_expected_site_settings" add constraint slkm_expected_constraint CHECK (((jsonb_typeof(navigation) = 'object'::text) AND (octet_length((navigation)::text) <= 32768)));
        select pg_get_constraintdef(oid) into wanted from pg_constraint where conrelid='pg_temp.slkm_expected_site_settings'::regclass and conname='slkm_expected_constraint';
        for existing in select conname,convalidated,regexp_replace(pg_get_constraintdef(oid),' NOT VALID$','') as definition from pg_constraint where conrelid='public.site_settings'::regclass and contype='c' loop
          execute format('alter table pg_temp."slkm_actual_site_settings" add constraint slkm_actual_constraint %s',existing.definition);
          select pg_get_constraintdef(oid) into observed from pg_constraint where conrelid='pg_temp.slkm_actual_site_settings'::regclass and conname='slkm_actual_constraint';
          alter table pg_temp."slkm_actual_site_settings" drop constraint slkm_actual_constraint;
          if observed=wanted then
            matched:=true;
            if not existing.convalidated then execute format('alter table public."site_settings" validate constraint %I',existing.conname); end if;
            exit;
          elsif existing.conname='slkm_navigation_object' then
            raise exception 'Conflicting constraint site_settings.slkm_navigation_object; preserve data and review before continuing';
          end if;
        end loop;
        if not matched then alter table public."site_settings" add constraint "slkm_navigation_object" CHECK (((jsonb_typeof(navigation) = 'object'::text) AND (octet_length((navigation)::text) <= 32768))); end if;
        alter table pg_temp."slkm_expected_site_settings" drop constraint slkm_expected_constraint;
        drop table pg_temp."slkm_expected_site_settings";
        drop table pg_temp."slkm_actual_site_settings";
      end $$;
alter table public."agencies" alter column "id" set not null;
alter table public."agencies" alter column "city_ar" set not null;
alter table public."agencies" alter column "city_fr" set not null;
alter table public."agencies" alter column "city_en" set not null;
alter table public."agencies" alter column "agency_name_ar" set not null;
alter table public."agencies" alter column "agency_name_fr" set not null;
alter table public."agencies" alter column "agency_name_en" set not null;
alter table public."agencies" alter column "address_ar" set not null;
alter table public."agencies" alter column "address_fr" set not null;
alter table public."agencies" alter column "address_en" set not null;
alter table public."agencies" alter column "is_active" set not null;
alter table public."agencies" alter column "created_at" set not null;
alter table public."agencies" alter column "updated_at" set not null;
alter table public."agencies" alter column "sort_order" set not null;
alter table public."blog_posts" alter column "id" set not null;
alter table public."blog_posts" alter column "slug" set not null;
alter table public."blog_posts" alter column "title_ar" set not null;
alter table public."blog_posts" alter column "title_fr" set not null;
alter table public."blog_posts" alter column "title_en" set not null;
alter table public."blog_posts" alter column "content_ar" set not null;
alter table public."blog_posts" alter column "content_fr" set not null;
alter table public."blog_posts" alter column "content_en" set not null;
alter table public."blog_posts" alter column "is_published" set not null;
alter table public."blog_posts" alter column "created_at" set not null;
alter table public."blog_posts" alter column "updated_at" set not null;
alter table public."contact_messages" alter column "id" set not null;
alter table public."contact_messages" alter column "full_name" set not null;
alter table public."contact_messages" alter column "email" set not null;
alter table public."contact_messages" alter column "subject" set not null;
alter table public."contact_messages" alter column "message" set not null;
alter table public."contact_messages" alter column "status" set not null;
alter table public."contact_messages" alter column "created_at" set not null;
alter table public."contact_messages" alter column "updated_at" set not null;
alter table public."corporate_quotes" alter column "id" set not null;
alter table public."corporate_quotes" alter column "company_name" set not null;
alter table public."corporate_quotes" alter column "contact_person" set not null;
alter table public."corporate_quotes" alter column "phone" set not null;
alter table public."corporate_quotes" alter column "email" set not null;
alter table public."corporate_quotes" alter column "service_type" set not null;
alter table public."corporate_quotes" alter column "passenger_count" set not null;
alter table public."corporate_quotes" alter column "origin_city" set not null;
alter table public."corporate_quotes" alter column "destination_city" set not null;
alter table public."corporate_quotes" alter column "status" set not null;
alter table public."corporate_quotes" alter column "created_at" set not null;
alter table public."corporate_quotes" alter column "updated_at" set not null;
alter table public."messagerie_agencies" alter column "id" set not null;
alter table public."messagerie_agencies" alter column "is_active" set not null;
alter table public."messagerie_agencies" alter column "display_order" set not null;
alter table public."messagerie_agencies" alter column "created_at" set not null;
alter table public."messagerie_agencies" alter column "updated_at" set not null;
alter table public."messagerie_agencies" alter column "agents" set not null;
alter table public."messagerie_network_settings" alter column "id" set not null;
alter table public."messagerie_network_settings" alter column "title_fr" set not null;
alter table public."messagerie_network_settings" alter column "title_ar" set not null;
alter table public."messagerie_network_settings" alter column "title_en" set not null;
alter table public."messagerie_network_settings" alter column "description_fr" set not null;
alter table public."messagerie_network_settings" alter column "description_ar" set not null;
alter table public."messagerie_network_settings" alter column "description_en" set not null;
alter table public."messagerie_network_settings" alter column "is_active" set not null;
alter table public."messagerie_network_settings" alter column "created_at" set not null;
alter table public."messagerie_network_settings" alter column "updated_at" set not null;
alter table public."parcel_rates" alter column "id" set not null;
alter table public."parcel_rates" alter column "category_ar" set not null;
alter table public."parcel_rates" alter column "category_fr" set not null;
alter table public."parcel_rates" alter column "category_en" set not null;
alter table public."parcel_rates" alter column "max_weight_kg" set not null;
alter table public."parcel_rates" alter column "base_price_mad" set not null;
alter table public."parcel_rates" alter column "created_at" set not null;
alter table public."parcel_rates" alter column "updated_at" set not null;
alter table public."parcel_rates" alter column "is_active" set not null;
alter table public."routes" alter column "id" set not null;
alter table public."routes" alter column "from_agency_id" set not null;
alter table public."routes" alter column "to_agency_id" set not null;
alter table public."routes" alter column "departure_time" set not null;
alter table public."routes" alter column "arrival_time" set not null;
alter table public."routes" alter column "price_mad" set not null;
alter table public."routes" alter column "bus_type" set not null;
alter table public."routes" alter column "days_of_week" set not null;
alter table public."routes" alter column "is_tourist_route" set not null;
alter table public."routes" alter column "is_active" set not null;
alter table public."routes" alter column "created_at" set not null;
alter table public."routes" alter column "updated_at" set not null;
alter table public."routes" alter column "sort_order" set not null;
alter table public."site_media_assets" alter column "id" set not null;
alter table public."site_media_assets" alter column "bucket_id" set not null;
alter table public."site_media_assets" alter column "storage_path" set not null;
alter table public."site_media_assets" alter column "filename" set not null;
alter table public."site_media_assets" alter column "mime_type" set not null;
alter table public."site_media_assets" alter column "size_bytes" set not null;
alter table public."site_media_assets" alter column "alt_fr" set not null;
alter table public."site_media_assets" alter column "alt_ar" set not null;
alter table public."site_media_assets" alter column "alt_en" set not null;
alter table public."site_media_assets" alter column "is_published" set not null;
alter table public."site_media_assets" alter column "is_active" set not null;
alter table public."site_media_assets" alter column "created_at" set not null;
alter table public."site_media_assets" alter column "updated_at" set not null;
alter table public."site_page_media" alter column "id" set not null;
alter table public."site_page_media" alter column "page_id" set not null;
alter table public."site_page_media" alter column "field_key" set not null;
alter table public."site_page_media" alter column "created_at" set not null;
alter table public."site_page_media" alter column "updated_at" set not null;
alter table public."site_pages" alter column "id" set not null;
alter table public."site_pages" alter column "slug" set not null;
alter table public."site_pages" alter column "route" set not null;
alter table public."site_pages" alter column "label" set not null;
alter table public."site_pages" alter column "title_fr" set not null;
alter table public."site_pages" alter column "title_ar" set not null;
alter table public."site_pages" alter column "title_en" set not null;
alter table public."site_pages" alter column "seo_description_fr" set not null;
alter table public."site_pages" alter column "seo_description_ar" set not null;
alter table public."site_pages" alter column "seo_description_en" set not null;
alter table public."site_pages" alter column "hero_overlay" set not null;
alter table public."site_pages" alter column "content" set not null;
alter table public."site_pages" alter column "is_published" set not null;
alter table public."site_pages" alter column "is_active" set not null;
alter table public."site_pages" alter column "created_at" set not null;
alter table public."site_pages" alter column "updated_at" set not null;
alter table public."site_sections" alter column "id" set not null;
alter table public."site_sections" alter column "page_id" set not null;
alter table public."site_sections" alter column "section_key" set not null;
alter table public."site_sections" alter column "label" set not null;
alter table public."site_sections" alter column "kind" set not null;
alter table public."site_sections" alter column "sort_order" set not null;
alter table public."site_sections" alter column "is_active" set not null;
alter table public."site_sections" alter column "is_published" set not null;
alter table public."site_sections" alter column "background" set not null;
alter table public."site_sections" alter column "layout" set not null;
alter table public."site_sections" alter column "title_fr" set not null;
alter table public."site_sections" alter column "title_ar" set not null;
alter table public."site_sections" alter column "title_en" set not null;
alter table public."site_sections" alter column "body_fr" set not null;
alter table public."site_sections" alter column "body_ar" set not null;
alter table public."site_sections" alter column "body_en" set not null;
alter table public."site_sections" alter column "cta_fr" set not null;
alter table public."site_sections" alter column "cta_ar" set not null;
alter table public."site_sections" alter column "cta_en" set not null;
alter table public."site_sections" alter column "cta_href" set not null;
alter table public."site_sections" alter column "content" set not null;
alter table public."site_sections" alter column "created_at" set not null;
alter table public."site_sections" alter column "updated_at" set not null;
alter table public."site_settings" alter column "id" set not null;
alter table public."site_settings" alter column "default_locale" set not null;
alter table public."site_settings" alter column "emergency_lines" set not null;
alter table public."site_settings" alter column "social_links" set not null;
alter table public."site_settings" alter column "analytics_config" set not null;
alter table public."site_settings" alter column "created_at" set not null;
alter table public."site_settings" alter column "updated_at" set not null;
alter table public."site_settings" alter column "presentation" set not null;
alter table public."site_settings" alter column "navigation" set not null;

commit;
