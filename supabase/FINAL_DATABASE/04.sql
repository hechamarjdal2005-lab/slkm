-- 04: application functions, triggers and indexes.
begin;
set local search_path=pg_catalog,public;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$function$
;
CREATE OR REPLACE FUNCTION public.save_site_cms_page(p_slug text, p_payload jsonb, p_images jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare page_uuid uuid; item record; ref uuid; url text;
begin
  if not public.is_admin() then raise exception 'Administrator role required' using errcode='42501'; end if;
  if jsonb_typeof(p_payload)<>'object' or jsonb_typeof(p_images)<>'object' then raise exception 'Invalid CMS payload'; end if;
  update public.site_pages set
    title_fr=coalesce(p_payload->>'title_fr',''),title_ar=coalesce(p_payload->>'title_ar',''),title_en=coalesce(p_payload->>'title_en',''),
    seo_description_fr=coalesce(p_payload->>'seo_description_fr',''),seo_description_ar=coalesce(p_payload->>'seo_description_ar',''),seo_description_en=coalesce(p_payload->>'seo_description_en',''),
    hero_overlay=(p_payload->>'hero_overlay')::numeric,content=p_payload->'content'
  where slug=p_slug returning id into page_uuid;
  if page_uuid is null then raise exception 'CMS page missing: apply defaults migration first'; end if;
  delete from public.site_page_media where page_id=page_uuid;
  for item in select key,value from jsonb_each_text(p_images) loop
    ref:=null; url:=null;
    if item.value ~ '^/media/[a-f0-9-]{36}$' then
      ref:=substring(item.value from 8)::uuid;
      if not exists(select 1 from public.site_media_assets where id=ref and is_active and is_published) then raise exception 'Publish media before using it on a public page'; end if;
    else url:=item.value;
    end if;
    insert into public.site_page_media(page_id,field_key,asset_id,external_url) values(page_uuid,item.key,ref,url);
  end loop;
  return page_uuid;
end $function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;
revoke all on function public.is_admin() from public,anon,authenticated;
      grant execute on function public.is_admin() to anon,authenticated,service_role;
      revoke all on function public.set_updated_at() from public,anon,authenticated;
      revoke all on function public.save_site_cms_page(text,jsonb,jsonb) from public,anon,authenticated;
      grant execute on function public.save_site_cms_page(text,jsonb,jsonb) to authenticated;
drop trigger if exists "trg_agencies_updated_at" on public."agencies";
CREATE TRIGGER trg_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "trg_blog_posts_updated_at" on public."blog_posts";
CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "trg_contact_messages_updated_at" on public."contact_messages";
CREATE TRIGGER trg_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "trg_corporate_quotes_updated_at" on public."corporate_quotes";
CREATE TRIGGER trg_corporate_quotes_updated_at BEFORE UPDATE ON public.corporate_quotes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "messagerie_agencies_updated_at" on public."messagerie_agencies";
CREATE TRIGGER messagerie_agencies_updated_at BEFORE UPDATE ON public.messagerie_agencies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "messagerie_settings_updated_at" on public."messagerie_network_settings";
CREATE TRIGGER messagerie_settings_updated_at BEFORE UPDATE ON public.messagerie_network_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "trg_parcel_rates_updated_at" on public."parcel_rates";
CREATE TRIGGER trg_parcel_rates_updated_at BEFORE UPDATE ON public.parcel_rates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "trg_routes_updated_at" on public."routes";
CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "site_media_assets_updated_at" on public."site_media_assets";
CREATE TRIGGER site_media_assets_updated_at BEFORE UPDATE ON public.site_media_assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "site_page_media_updated_at" on public."site_page_media";
CREATE TRIGGER site_page_media_updated_at BEFORE UPDATE ON public.site_page_media FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "site_pages_updated_at" on public."site_pages";
CREATE TRIGGER site_pages_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "site_sections_updated_at" on public."site_sections";
CREATE TRIGGER site_sections_updated_at BEFORE UPDATE ON public.site_sections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists "trg_site_settings_updated_at" on public."site_settings";
CREATE TRIGGER trg_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_agencies_active') and pg_get_indexdef(to_regclass('public.idx_agencies_active')) is distinct from 'CREATE INDEX idx_agencies_active ON public.agencies USING btree (is_active) WHERE is_active' then raise exception 'Conflicting index idx_agencies_active; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_agencies_active ON public.agencies USING btree (is_active) WHERE is_active;
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_agencies_city_ar') and pg_get_indexdef(to_regclass('public.idx_agencies_city_ar')) is distinct from 'CREATE INDEX idx_agencies_city_ar ON public.agencies USING btree (city_ar)' then raise exception 'Conflicting index idx_agencies_city_ar; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_agencies_city_ar ON public.agencies USING btree (city_ar);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_agencies_city_en') and pg_get_indexdef(to_regclass('public.idx_agencies_city_en')) is distinct from 'CREATE INDEX idx_agencies_city_en ON public.agencies USING btree (city_en)' then raise exception 'Conflicting index idx_agencies_city_en; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_agencies_city_en ON public.agencies USING btree (city_en);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_agencies_city_fr') and pg_get_indexdef(to_regclass('public.idx_agencies_city_fr')) is distinct from 'CREATE INDEX idx_agencies_city_fr ON public.agencies USING btree (city_fr)' then raise exception 'Conflicting index idx_agencies_city_fr; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_agencies_city_fr ON public.agencies USING btree (city_fr);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='slkm_agency_order') and pg_get_indexdef(to_regclass('public.slkm_agency_order')) is distinct from 'CREATE INDEX slkm_agency_order ON public.agencies USING btree (sort_order, city_fr)' then raise exception 'Conflicting index slkm_agency_order; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS slkm_agency_order ON public.agencies USING btree (sort_order, city_fr);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_blog_posts_published') and pg_get_indexdef(to_regclass('public.idx_blog_posts_published')) is distinct from 'CREATE INDEX idx_blog_posts_published ON public.blog_posts USING btree (is_published, published_at DESC) WHERE is_published' then raise exception 'Conflicting index idx_blog_posts_published; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts USING btree (is_published, published_at DESC) WHERE is_published;
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_contact_messages_status_created') and pg_get_indexdef(to_regclass('public.idx_contact_messages_status_created')) is distinct from 'CREATE INDEX idx_contact_messages_status_created ON public.contact_messages USING btree (status, created_at DESC)' then raise exception 'Conflicting index idx_contact_messages_status_created; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON public.contact_messages USING btree (status, created_at DESC);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_corporate_quotes_email') and pg_get_indexdef(to_regclass('public.idx_corporate_quotes_email')) is distinct from 'CREATE INDEX idx_corporate_quotes_email ON public.corporate_quotes USING btree (lower((email)::text))' then raise exception 'Conflicting index idx_corporate_quotes_email; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_corporate_quotes_email ON public.corporate_quotes USING btree (lower((email)::text));
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_corporate_quotes_service_type') and pg_get_indexdef(to_regclass('public.idx_corporate_quotes_service_type')) is distinct from 'CREATE INDEX idx_corporate_quotes_service_type ON public.corporate_quotes USING btree (service_type)' then raise exception 'Conflicting index idx_corporate_quotes_service_type; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_corporate_quotes_service_type ON public.corporate_quotes USING btree (service_type);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_corporate_quotes_status_created') and pg_get_indexdef(to_regclass('public.idx_corporate_quotes_status_created')) is distinct from 'CREATE INDEX idx_corporate_quotes_status_created ON public.corporate_quotes USING btree (status, created_at DESC)' then raise exception 'Conflicting index idx_corporate_quotes_status_created; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_corporate_quotes_status_created ON public.corporate_quotes USING btree (status, created_at DESC);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='messagerie_agencies_active_order') and pg_get_indexdef(to_regclass('public.messagerie_agencies_active_order')) is distinct from 'CREATE INDEX messagerie_agencies_active_order ON public.messagerie_agencies USING btree (is_active, display_order)' then raise exception 'Conflicting index messagerie_agencies_active_order; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS messagerie_agencies_active_order ON public.messagerie_agencies USING btree (is_active, display_order);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='messagerie_agency_link_unique') and pg_get_indexdef(to_regclass('public.messagerie_agency_link_unique')) is distinct from 'CREATE UNIQUE INDEX messagerie_agency_link_unique ON public.messagerie_agencies USING btree (agency_id) WHERE (agency_id IS NOT NULL)' then raise exception 'Conflicting index messagerie_agency_link_unique; review rather than silently skip'; end if; end $$;
CREATE UNIQUE INDEX IF NOT EXISTS messagerie_agency_link_unique ON public.messagerie_agencies USING btree (agency_id) WHERE (agency_id IS NOT NULL);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_parcel_rates_category_fr') and pg_get_indexdef(to_regclass('public.idx_parcel_rates_category_fr')) is distinct from 'CREATE INDEX idx_parcel_rates_category_fr ON public.parcel_rates USING btree (category_fr)' then raise exception 'Conflicting index idx_parcel_rates_category_fr; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_parcel_rates_category_fr ON public.parcel_rates USING btree (category_fr);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_parcel_rates_weight') and pg_get_indexdef(to_regclass('public.idx_parcel_rates_weight')) is distinct from 'CREATE INDEX idx_parcel_rates_weight ON public.parcel_rates USING btree (max_weight_kg)' then raise exception 'Conflicting index idx_parcel_rates_weight; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_parcel_rates_weight ON public.parcel_rates USING btree (max_weight_kg);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_routes_days_of_week') and pg_get_indexdef(to_regclass('public.idx_routes_days_of_week')) is distinct from 'CREATE INDEX idx_routes_days_of_week ON public.routes USING gin (days_of_week)' then raise exception 'Conflicting index idx_routes_days_of_week; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_routes_days_of_week ON public.routes USING gin (days_of_week);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_routes_from_agency') and pg_get_indexdef(to_regclass('public.idx_routes_from_agency')) is distinct from 'CREATE INDEX idx_routes_from_agency ON public.routes USING btree (from_agency_id)' then raise exception 'Conflicting index idx_routes_from_agency; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_routes_from_agency ON public.routes USING btree (from_agency_id);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_routes_search') and pg_get_indexdef(to_regclass('public.idx_routes_search')) is distinct from 'CREATE INDEX idx_routes_search ON public.routes USING btree (from_agency_id, to_agency_id, is_active, departure_time)' then raise exception 'Conflicting index idx_routes_search; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_routes_search ON public.routes USING btree (from_agency_id, to_agency_id, is_active, departure_time);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_routes_to_agency') and pg_get_indexdef(to_regclass('public.idx_routes_to_agency')) is distinct from 'CREATE INDEX idx_routes_to_agency ON public.routes USING btree (to_agency_id)' then raise exception 'Conflicting index idx_routes_to_agency; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_routes_to_agency ON public.routes USING btree (to_agency_id);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='idx_routes_tourist') and pg_get_indexdef(to_regclass('public.idx_routes_tourist')) is distinct from 'CREATE INDEX idx_routes_tourist ON public.routes USING btree (is_tourist_route) WHERE is_tourist_route' then raise exception 'Conflicting index idx_routes_tourist; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS idx_routes_tourist ON public.routes USING btree (is_tourist_route) WHERE is_tourist_route;
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='slkm_route_order') and pg_get_indexdef(to_regclass('public.slkm_route_order')) is distinct from 'CREATE INDEX slkm_route_order ON public.routes USING btree (sort_order, departure_time)' then raise exception 'Conflicting index slkm_route_order; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS slkm_route_order ON public.routes USING btree (sort_order, departure_time);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='site_media_public') and pg_get_indexdef(to_regclass('public.site_media_public')) is distinct from 'CREATE INDEX site_media_public ON public.site_media_assets USING btree (created_at DESC) WHERE (is_active AND is_published)' then raise exception 'Conflicting index site_media_public; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS site_media_public ON public.site_media_assets USING btree (created_at DESC) WHERE (is_active AND is_published);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='site_page_media_asset_fk') and pg_get_indexdef(to_regclass('public.site_page_media_asset_fk')) is distinct from 'CREATE INDEX site_page_media_asset_fk ON public.site_page_media USING btree (asset_id) WHERE (asset_id IS NOT NULL)' then raise exception 'Conflicting index site_page_media_asset_fk; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS site_page_media_asset_fk ON public.site_page_media USING btree (asset_id) WHERE (asset_id IS NOT NULL);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='site_sections_media_fk') and pg_get_indexdef(to_regclass('public.site_sections_media_fk')) is distinct from 'CREATE INDEX site_sections_media_fk ON public.site_sections USING btree (media_asset_id) WHERE (media_asset_id IS NOT NULL)' then raise exception 'Conflicting index site_sections_media_fk; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS site_sections_media_fk ON public.site_sections USING btree (media_asset_id) WHERE (media_asset_id IS NOT NULL);
do $$ begin if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='site_sections_public_order') and pg_get_indexdef(to_regclass('public.site_sections_public_order')) is distinct from 'CREATE INDEX site_sections_public_order ON public.site_sections USING btree (page_id, sort_order, id) WHERE (is_active AND is_published)' then raise exception 'Conflicting index site_sections_public_order; review rather than silently skip'; end if; end $$;
CREATE INDEX IF NOT EXISTS site_sections_public_order ON public.site_sections USING btree (page_id, sort_order, id) WHERE (is_active AND is_published);

commit;
