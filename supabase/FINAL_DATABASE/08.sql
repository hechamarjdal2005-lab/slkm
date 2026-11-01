-- 08: read-only schema/security inspection after all migrations.
begin read only;
set local search_path=pg_catalog,public;
-- READ ONLY: may be run before or after migrations with an authorized SQL Editor role.
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
('agencies','id','uuid',true),
('agencies','city_ar','character varying(120)',true),
('agencies','city_fr','character varying(120)',true),
('agencies','city_en','character varying(120)',true),
('agencies','agency_name_ar','character varying(200)',true),
('agencies','agency_name_fr','character varying(200)',true),
('agencies','agency_name_en','character varying(200)',true),
('agencies','address_ar','text',true),
('agencies','address_fr','text',true),
('agencies','address_en','text',true),
('agencies','whatsapp_number','character varying(32)',false),
('agencies','phone_number','character varying(32)',false),
('agencies','lat','numeric(10,7)',false),
('agencies','lng','numeric(10,7)',false),
('agencies','image_url','text',false),
('agencies','is_active','boolean',true),
('agencies','created_at','timestamp with time zone',true),
('agencies','updated_at','timestamp with time zone',true),
('agencies','sort_order','integer',true),
('blog_posts','id','uuid',true),
('blog_posts','slug','character varying(255)',true),
('blog_posts','title_ar','character varying(255)',true),
('blog_posts','title_fr','character varying(255)',true),
('blog_posts','title_en','character varying(255)',true),
('blog_posts','excerpt_ar','text',false),
('blog_posts','excerpt_fr','text',false),
('blog_posts','excerpt_en','text',false),
('blog_posts','content_ar','text',true),
('blog_posts','content_fr','text',true),
('blog_posts','content_en','text',true),
('blog_posts','cover_image_url','text',false),
('blog_posts','is_published','boolean',true),
('blog_posts','published_at','timestamp with time zone',false),
('blog_posts','created_at','timestamp with time zone',true),
('blog_posts','updated_at','timestamp with time zone',true),
('contact_messages','id','uuid',true),
('contact_messages','full_name','character varying(255)',true),
('contact_messages','email','character varying(320)',true),
('contact_messages','phone','character varying(32)',false),
('contact_messages','subject','character varying(255)',true),
('contact_messages','message','text',true),
('contact_messages','status','character varying(20)',true),
('contact_messages','created_at','timestamp with time zone',true),
('contact_messages','updated_at','timestamp with time zone',true),
('corporate_quotes','id','uuid',true),
('corporate_quotes','company_name','character varying(255)',true),
('corporate_quotes','contact_person','character varying(255)',true),
('corporate_quotes','phone','character varying(32)',true),
('corporate_quotes','email','character varying(320)',true),
('corporate_quotes','service_type','character varying(20)',true),
('corporate_quotes','passenger_count','integer',true),
('corporate_quotes','origin_city','character varying(120)',true),
('corporate_quotes','destination_city','character varying(120)',true),
('corporate_quotes','details','text',false),
('corporate_quotes','status','character varying(20)',true),
('corporate_quotes','created_at','timestamp with time zone',true),
('corporate_quotes','updated_at','timestamp with time zone',true),
('messagerie_agencies','id','uuid',true),
('messagerie_agencies','agency_id','uuid',false),
('messagerie_agencies','name_fr','text',false),
('messagerie_agencies','name_ar','text',false),
('messagerie_agencies','name_en','text',false),
('messagerie_agencies','city_fr','text',false),
('messagerie_agencies','city_ar','text',false),
('messagerie_agencies','city_en','text',false),
('messagerie_agencies','address_fr','text',false),
('messagerie_agencies','address_ar','text',false),
('messagerie_agencies','address_en','text',false),
('messagerie_agencies','phone','text',false),
('messagerie_agencies','whatsapp','text',false),
('messagerie_agencies','opening_hours_fr','text',false),
('messagerie_agencies','opening_hours_ar','text',false),
('messagerie_agencies','opening_hours_en','text',false),
('messagerie_agencies','is_active','boolean',true),
('messagerie_agencies','display_order','integer',true),
('messagerie_agencies','created_at','timestamp with time zone',true),
('messagerie_agencies','updated_at','timestamp with time zone',true),
('messagerie_agencies','image_url','text',false),
('messagerie_agencies','lat','numeric(10,7)',false),
('messagerie_agencies','lng','numeric(10,7)',false),
('messagerie_agencies','agents','jsonb',true),
('messagerie_network_settings','id','integer',true),
('messagerie_network_settings','title_fr','text',true),
('messagerie_network_settings','title_ar','text',true),
('messagerie_network_settings','title_en','text',true),
('messagerie_network_settings','description_fr','text',true),
('messagerie_network_settings','description_ar','text',true),
('messagerie_network_settings','description_en','text',true),
('messagerie_network_settings','map_image_url','text',false),
('messagerie_network_settings','is_active','boolean',true),
('messagerie_network_settings','created_at','timestamp with time zone',true),
('messagerie_network_settings','updated_at','timestamp with time zone',true),
('parcel_rates','id','uuid',true),
('parcel_rates','category_ar','character varying(120)',true),
('parcel_rates','category_fr','character varying(120)',true),
('parcel_rates','category_en','character varying(120)',true),
('parcel_rates','max_weight_kg','numeric(8,2)',true),
('parcel_rates','base_price_mad','numeric(10,2)',true),
('parcel_rates','description_ar','text',false),
('parcel_rates','description_fr','text',false),
('parcel_rates','description_en','text',false),
('parcel_rates','created_at','timestamp with time zone',true),
('parcel_rates','updated_at','timestamp with time zone',true),
('parcel_rates','is_active','boolean',true),
('routes','id','uuid',true),
('routes','from_agency_id','uuid',true),
('routes','to_agency_id','uuid',true),
('routes','departure_time','time without time zone',true),
('routes','arrival_time','time without time zone',true),
('routes','price_mad','numeric(10,2)',true),
('routes','bus_type','character varying(20)',true),
('routes','days_of_week','text[]',true),
('routes','is_tourist_route','boolean',true),
('routes','is_active','boolean',true),
('routes','created_at','timestamp with time zone',true),
('routes','updated_at','timestamp with time zone',true),
('routes','sort_order','integer',true),
('site_media_assets','id','uuid',true),
('site_media_assets','bucket_id','text',true),
('site_media_assets','storage_path','text',true),
('site_media_assets','filename','text',true),
('site_media_assets','mime_type','text',true),
('site_media_assets','size_bytes','integer',true),
('site_media_assets','alt_fr','text',true),
('site_media_assets','alt_ar','text',true),
('site_media_assets','alt_en','text',true),
('site_media_assets','is_published','boolean',true),
('site_media_assets','is_active','boolean',true),
('site_media_assets','created_at','timestamp with time zone',true),
('site_media_assets','updated_at','timestamp with time zone',true),
('site_page_media','id','uuid',true),
('site_page_media','page_id','uuid',true),
('site_page_media','field_key','text',true),
('site_page_media','asset_id','uuid',false),
('site_page_media','external_url','text',false),
('site_page_media','created_at','timestamp with time zone',true),
('site_page_media','updated_at','timestamp with time zone',true),
('site_pages','id','uuid',true),
('site_pages','slug','text',true),
('site_pages','route','text',true),
('site_pages','label','text',true),
('site_pages','title_fr','text',true),
('site_pages','title_ar','text',true),
('site_pages','title_en','text',true),
('site_pages','seo_description_fr','text',true),
('site_pages','seo_description_ar','text',true),
('site_pages','seo_description_en','text',true),
('site_pages','hero_overlay','numeric',true),
('site_pages','content','jsonb',true),
('site_pages','is_published','boolean',true),
('site_pages','is_active','boolean',true),
('site_pages','created_at','timestamp with time zone',true),
('site_pages','updated_at','timestamp with time zone',true),
('site_sections','id','uuid',true),
('site_sections','page_id','uuid',true),
('site_sections','section_key','text',true),
('site_sections','label','text',true),
('site_sections','kind','text',true),
('site_sections','sort_order','integer',true),
('site_sections','is_active','boolean',true),
('site_sections','is_published','boolean',true),
('site_sections','background','text',true),
('site_sections','layout','text',true),
('site_sections','title_fr','text',true),
('site_sections','title_ar','text',true),
('site_sections','title_en','text',true),
('site_sections','body_fr','text',true),
('site_sections','body_ar','text',true),
('site_sections','body_en','text',true),
('site_sections','cta_fr','text',true),
('site_sections','cta_ar','text',true),
('site_sections','cta_en','text',true),
('site_sections','cta_href','text',true),
('site_sections','media_asset_id','uuid',false),
('site_sections','image_url','text',false),
('site_sections','content','jsonb',true),
('site_sections','created_at','timestamp with time zone',true),
('site_sections','updated_at','timestamp with time zone',true),
('site_settings','id','smallint',true),
('site_settings','site_name_ar','character varying(200)',false),
('site_settings','site_name_fr','character varying(200)',false),
('site_settings','site_name_en','character varying(200)',false),
('site_settings','default_locale','character varying(2)',true),
('site_settings','support_phone','character varying(32)',false),
('site_settings','emergency_phone','character varying(32)',false),
('site_settings','emergency_lines','jsonb',true),
('site_settings','whatsapp_number','character varying(32)',false),
('site_settings','contact_email','character varying(320)',false),
('site_settings','address_ar','text',false),
('site_settings','address_fr','text',false),
('site_settings','address_en','text',false),
('site_settings','social_links','jsonb',true),
('site_settings','analytics_config','jsonb',true),
('site_settings','created_at','timestamp with time zone',true),
('site_settings','updated_at','timestamp with time zone',true),
('site_settings','presentation','jsonb',true),
('site_settings','navigation','jsonb',true)
      ) select e.*,format_type(a.atttypid,a.atttypmod) as actual_type,a.attnotnull from expected e left join pg_class c on c.relnamespace='public'::regnamespace and c.relname=e.table_name
      left join pg_attribute a on a.attrelid=c.oid and a.attname=e.column_name and a.attnum>0 and not a.attisdropped
      where a.attname is null or format_type(a.atttypid,a.atttypmod)<>e.column_type or (e.required and not a.attnotnull);
      -- Expected empty: missing canonical constraints (equivalent constraints under other names are accepted).
      with expected(table_name,definition) as (values
('agencies',array['PRIMARY KEY (id)']),
('blog_posts',array['PRIMARY KEY (id)']),
('contact_messages',array['PRIMARY KEY (id)']),
('corporate_quotes',array['PRIMARY KEY (id)']),
('messagerie_agencies',array['PRIMARY KEY (id)']),
('messagerie_network_settings',array['PRIMARY KEY (id)']),
('parcel_rates',array['PRIMARY KEY (id)']),
('routes',array['PRIMARY KEY (id)']),
('site_media_assets',array['PRIMARY KEY (id)']),
('site_page_media',array['PRIMARY KEY (id)']),
('site_pages',array['PRIMARY KEY (id)']),
('site_sections',array['PRIMARY KEY (id)']),
('site_settings',array['PRIMARY KEY (id)']),
('blog_posts',array['UNIQUE (slug)']),
('site_media_assets',array['UNIQUE (storage_path)']),
('site_page_media',array['UNIQUE (page_id, field_key)']),
('site_pages',array['UNIQUE (route)']),
('site_pages',array['UNIQUE (slug)']),
('site_sections',array['UNIQUE (page_id, section_key)']),
('agencies',array['CHECK (((lat IS NULL) = (lng IS NULL)))']),
('agencies',array['CHECK (((lat IS NULL) OR ((lat >= (''-90''::integer)::numeric) AND (lat <= (90)::numeric))))']),
('agencies',array['CHECK (((lng IS NULL) OR ((lng >= (''-180''::integer)::numeric) AND (lng <= (180)::numeric))))']),
('agencies',array['CHECK (((sort_order >= 0) AND (sort_order <= 10000)))']),
('blog_posts',array['CHECK (((slug)::text ~ ''^[a-z0-9]+(?:-[a-z0-9]+)*$''::text))']),
('contact_messages',array['CHECK (((status)::text = ANY ((ARRAY[''new''::character varying, ''read''::character varying, ''replied''::character varying, ''archived''::character varying])::text[])))','CHECK (((status)::text = ANY (ARRAY[(''new''::character varying)::text, (''read''::character varying)::text, (''replied''::character varying)::text, (''archived''::character varying)::text])))']),
('corporate_quotes',array['CHECK ((passenger_count > 0))']),
('corporate_quotes',array['CHECK (((service_type)::text = ANY ((ARRAY[''personnel''::character varying, ''tourisme''::character varying])::text[])))','CHECK (((service_type)::text = ANY (ARRAY[(''personnel''::character varying)::text, (''tourisme''::character varying)::text])))']),
('corporate_quotes',array['CHECK (((status)::text = ANY ((ARRAY[''pending''::character varying, ''contacted''::character varying, ''quoted''::character varying, ''confirmed''::character varying, ''completed''::character varying, ''cancelled''::character varying])::text[])))','CHECK (((status)::text = ANY (ARRAY[(''pending''::character varying)::text, (''contacted''::character varying)::text, (''quoted''::character varying)::text, (''confirmed''::character varying)::text, (''completed''::character varying)::text, (''cancelled''::character varying)::text])))']),
('messagerie_agencies',array['CHECK ((display_order >= 0))']),
('messagerie_agencies',array['CHECK ((((agency_id IS NOT NULL) AND (name_fr IS NULL) AND (name_ar IS NULL) AND (name_en IS NULL) AND (city_fr IS NULL) AND (city_ar IS NULL) AND (city_en IS NULL) AND (address_fr IS NULL) AND (address_ar IS NULL) AND (address_en IS NULL) AND (phone IS NULL) AND (whatsapp IS NULL)) OR ((agency_id IS NULL) AND (COALESCE(length(TRIM(BOTH FROM name_fr)), 0) > 0) AND (COALESCE(length(TRIM(BOTH FROM city_fr)), 0) > 0))))']),
('messagerie_agencies',array['CHECK ((((lat IS NULL) = (lng IS NULL)) AND ((lat IS NULL) OR ((lat >= (''-90''::integer)::numeric) AND (lat <= (90)::numeric))) AND ((lng IS NULL) OR ((lng >= (''-180''::integer)::numeric) AND (lng <= (180)::numeric))) AND ((image_url IS NULL) OR (image_url ~ ''^https://''::text) OR (image_url ~ ''^/[^/]''::text)) AND (jsonb_typeof(agents) = ''array''::text) AND (jsonb_array_length(agents) <= 20) AND (octet_length((agents)::text) <= 32768)))']),
('messagerie_network_settings',array['CHECK ((id = 1))']),
('messagerie_network_settings',array['CHECK (((map_image_url IS NULL) OR (map_image_url ~ ''^https://''::text) OR (map_image_url ~ ''^/[^/]''::text)))']),
('parcel_rates',array['CHECK ((base_price_mad >= (0)::numeric))']),
('parcel_rates',array['CHECK ((max_weight_kg > (0)::numeric))']),
('routes',array['CHECK (((bus_type)::text = ANY ((ARRAY[''Comfort''::character varying, ''Premium''::character varying, ''VIP''::character varying])::text[])))','CHECK (((bus_type)::text = ANY (ARRAY[(''Comfort''::character varying)::text, (''Premium''::character varying)::text, (''VIP''::character varying)::text])))']),
('routes',array['CHECK ((days_of_week <@ ARRAY[''MON''::text, ''TUE''::text, ''WED''::text, ''THU''::text, ''FRI''::text, ''SAT''::text, ''SUN''::text]))']),
('routes',array['CHECK ((from_agency_id <> to_agency_id))']),
('routes',array['CHECK ((price_mad >= (0)::numeric))']),
('routes',array['CHECK (((sort_order >= 0) AND (sort_order <= 10000)))']),
('site_media_assets',array['CHECK ((bucket_id = ''site-media''::text))']),
('site_media_assets',array['CHECK (((length(filename) >= 1) AND (length(filename) <= 255)))']),
('site_media_assets',array['CHECK ((mime_type = ANY (ARRAY[''image/jpeg''::text, ''image/png''::text, ''image/webp''::text, ''image/avif''::text])))']),
('site_media_assets',array['CHECK (((size_bytes >= 1) AND (size_bytes <= 5242880)))']),
('site_media_assets',array['CHECK ((storage_path ~ ''^[a-f0-9-]{36}\.(jpg|png|webp|avif)$''::text))']),
('site_page_media',array['CHECK (((asset_id IS NULL) <> (external_url IS NULL)))']),
('site_page_media',array['CHECK (((external_url IS NULL) OR (external_url ~ ''^https://''::text) OR (external_url ~ ''^/[^/]''::text)))']),
('site_page_media',array['CHECK ((field_key ~ ''^image_[a-f0-9]{12}$''::text))']),
('site_pages',array['CHECK (((jsonb_typeof(content) = ''object''::text) AND (jsonb_typeof((content -> ''copy''::text)) = ''object''::text) AND (octet_length((content)::text) <= 262144)))']),
('site_pages',array['CHECK (((hero_overlay >= 0.3) AND (hero_overlay <= 0.9)))']),
('site_pages',array['CHECK (((length(label) >= 1) AND (length(label) <= 200)))']),
('site_pages',array['CHECK ((route =
CASE slug
    WHEN ''home''::text THEN ''/''::text
    WHEN ''article''::text THEN ''/blog/[slug]''::text
    WHEN ''global''::text THEN ''global''::text
    ELSE (''/''::text || slug)
END))']),
('site_pages',array['CHECK ((slug = ANY (ARRAY[''home''::text, ''lignes''::text, ''irsaliyat''::text, ''about''::text, ''services''::text, ''contact''::text, ''blog''::text, ''article''::text, ''global''::text])))']),
('site_sections',array['CHECK ((background = ANY (ARRAY[''default''::text, ''white''::text, ''orange''::text, ''muted''::text])))']),
('site_sections',array['CHECK (((jsonb_typeof(content) = ''object''::text) AND (octet_length((content)::text) <= 65536)))']),
('site_sections',array['CHECK (((cta_href = ''''::text) OR (cta_href ~ ''^https://''::text) OR (cta_href ~ ''^/[^/]''::text) OR (cta_href = ''/''::text) OR (cta_href ~ ''^#[a-zA-Z]''::text)))']),
('site_sections',array['CHECK (((image_url IS NULL) OR (image_url ~ ''^https://''::text) OR (image_url ~ ''^/[^/]''::text)))']),
('site_sections',array['CHECK ((kind = ANY (ARRAY[''builtin''::text, ''text''::text, ''image_text''::text, ''features''::text, ''cta''::text])))']),
('site_sections',array['CHECK (((length(label) >= 1) AND (length(label) <= 200)))']),
('site_sections',array['CHECK ((layout = ANY (ARRAY[''compact''::text, ''standard''::text])))']),
('site_sections',array['CHECK ((section_key ~ ''^[a-z][a-z0-9-]{0,79}$''::text))']),
('site_sections',array['CHECK (((sort_order >= 0) AND (sort_order <= 10000)))']),
('site_settings',array['CHECK (((jsonb_typeof(presentation) = ''object''::text) AND (octet_length((presentation)::text) <= 65536) AND ((NOT (presentation ? ''primary_color''::text)) OR ((presentation ->> ''primary_color''::text) ~ ''^#[0-9a-fA-F]{6}$''::text)) AND ((NOT (presentation ? ''secondary_color''::text)) OR ((presentation ->> ''secondary_color''::text) ~ ''^#[0-9a-fA-F]{6}$''::text)) AND ((NOT (presentation ? ''font_arabic''::text)) OR ((presentation ->> ''font_arabic''::text) = ANY (ARRAY[''cairo''::text, ''system''::text]))) AND ((NOT (presentation ? ''font_latin''::text)) OR ((presentation ->> ''font_latin''::text) = ANY (ARRAY[''jakarta''::text, ''system''::text]))) AND ((NOT (presentation ? ''button_style''::text)) OR ((presentation ->> ''button_style''::text) = ANY (ARRAY[''rounded''::text, ''soft-square''::text]))) AND ((NOT (presentation ? ''layout''::text)) OR ((presentation ->> ''layout''::text) = ANY (ARRAY[''compact''::text, ''comfortable''::text])))))']),
('site_settings',array['CHECK ((jsonb_typeof(analytics_config) = ''object''::text))']),
('site_settings',array['CHECK (((default_locale)::text = ANY ((ARRAY[''ar''::character varying, ''fr''::character varying, ''en''::character varying])::text[])))','CHECK (((default_locale)::text = ANY (ARRAY[(''ar''::character varying)::text, (''fr''::character varying)::text, (''en''::character varying)::text])))']),
('site_settings',array['CHECK ((jsonb_typeof(emergency_lines) = ''array''::text))']),
('site_settings',array['CHECK ((id = 1))']),
('site_settings',array['CHECK ((jsonb_typeof(social_links) = ''object''::text))']),
('site_settings',array['CHECK (((jsonb_typeof(navigation) = ''object''::text) AND (octet_length((navigation)::text) <= 32768)))']),
('messagerie_agencies',array['FOREIGN KEY (agency_id) REFERENCES agencies(id) ON DELETE RESTRICT']),
('routes',array['FOREIGN KEY (from_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT']),
('routes',array['FOREIGN KEY (to_agency_id) REFERENCES agencies(id) ON DELETE RESTRICT']),
('site_media_assets',array['FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id) ON DELETE RESTRICT']),
('site_page_media',array['FOREIGN KEY (asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT']),
('site_page_media',array['FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE']),
('site_sections',array['FOREIGN KEY (media_asset_id) REFERENCES site_media_assets(id) ON DELETE RESTRICT']),
('site_sections',array['FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE'])
      ) select e.* from expected e where not exists(select 1 from pg_constraint k join pg_class c on c.oid=k.conrelid where c.relnamespace='public'::regnamespace and c.relname=e.table_name and pg_get_constraintdef(k.oid)=any(e.definition) and k.convalidated);
      -- Expected 13 RLS-enabled application tables after installation.
      select count(*) as rls_tables from pg_class where relnamespace='public'::regnamespace and relname=any(array['agencies','blog_posts','contact_messages','corporate_quotes','messagerie_agencies','messagerie_network_settings','parcel_rates','routes','site_media_assets','site_page_media','site_pages','site_sections','site_settings']) and relrowsecurity;
    
-- Review only: unexpected public tables may be legacy aliases, not proven duplicates.
select c.relname as unexpected_public_table
from pg_class c
where c.relnamespace='public'::regnamespace and c.relkind='r'
and not c.relname=any(array['agencies','routes','parcel_rates','corporate_quotes','contact_messages','blog_posts','site_settings','messagerie_network_settings','messagerie_agencies','site_pages','site_sections','site_media_assets','site_page_media'])
order by c.relname;

-- Candidate aliases with identical column structure. Names alone do not authorize a merge.
with signatures as (
 select table_name,string_agg(column_name||':'||udt_schema||'.'||udt_name||':'||is_nullable,',' order by ordinal_position) as shape
 from information_schema.columns where table_schema='public' group by table_name
)
select array_agg(table_name order by table_name) as identical_structure_candidates
from signatures group by shape having count(*)>1;

-- Exact equivalent policies/triggers/functions under different names.
select schemaname,tablename,cmd,roles,qual,with_check,array_agg(policyname) as duplicate_policies
from pg_policies where schemaname in ('public','storage')
group by schemaname,tablename,cmd,roles,qual,with_check having count(*)>1;
select tgrelid::regclass,tgfoid::regprocedure,tgtype,array_agg(tgname) as duplicate_triggers
from pg_trigger where not tgisinternal and tgrelid in(select oid from pg_class where relnamespace='public'::regnamespace)
group by tgrelid,tgfoid,tgtype having count(*)>1;
select array_agg(proname) as duplicate_function_candidates
from pg_proc where pronamespace='public'::regnamespace
group by prolang,prosrc,proargtypes,prorettype,prosecdef,proconfig having count(*)>1;

-- Possible duplicated agency RECORDS, not duplicated business tables. Never auto-link/delete.
select m.id as parcel_office_id,a.id as agency_candidate_id
from public.messagerie_agencies m join public.agencies a
 on lower(trim(m.city_fr))=lower(trim(a.city_fr))
 and lower(trim(m.name_fr))=lower(trim(a.agency_name_fr))
where m.agency_id is null;
commit;
