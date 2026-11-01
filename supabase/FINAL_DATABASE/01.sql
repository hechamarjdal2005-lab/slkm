begin;
set local search_path=pg_catalog,public;
-- 01: prerequisites and all 13 application tables. Storage DDL authorization is enforced by PostgreSQL in 07.sql, not inferred from ownership.
do $$ begin
      if current_setting('server_version_num')::integer < 150000 then raise exception 'PostgreSQL 15+ required'; end if;
      if to_regprocedure('auth.jwt()') is null or to_regprocedure('gen_random_uuid()') is null or to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then raise exception 'Supabase Auth, Storage and UUID prerequisites are missing'; end if;
      if not exists(select 1 from pg_class where oid='storage.objects'::regclass and relrowsecurity) then raise exception 'Storage system RLS must already be enabled by Supabase; do not change system ownership to bypass this check'; end if;
      if exists(select 1 from unnest(array['anon','authenticated','service_role']) r where not exists(select 1 from pg_roles where rolname=r)) then raise exception 'Supabase API roles missing'; end if;
    end $$;
do $$ declare expected record; actual text; begin
      if exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname=any(array['agencies','blog_posts','contact_messages','corporate_quotes','messagerie_agencies','messagerie_network_settings','parcel_rates','routes','site_media_assets','site_page_media','site_pages','site_sections','site_settings']) and relkind<>'r') then raise exception 'An expected application table name belongs to a different object kind; review existing objects before DDL'; end if;
      for expected in select * from (values
('agencies','id','uuid'),
('agencies','city_ar','character varying(120)'),
('agencies','city_fr','character varying(120)'),
('agencies','city_en','character varying(120)'),
('agencies','agency_name_ar','character varying(200)'),
('agencies','agency_name_fr','character varying(200)'),
('agencies','agency_name_en','character varying(200)'),
('agencies','address_ar','text'),
('agencies','address_fr','text'),
('agencies','address_en','text'),
('agencies','whatsapp_number','character varying(32)'),
('agencies','phone_number','character varying(32)'),
('agencies','lat','numeric(10,7)'),
('agencies','lng','numeric(10,7)'),
('agencies','image_url','text'),
('agencies','is_active','boolean'),
('agencies','created_at','timestamp with time zone'),
('agencies','updated_at','timestamp with time zone'),
('agencies','sort_order','integer'),
('blog_posts','id','uuid'),
('blog_posts','slug','character varying(255)'),
('blog_posts','title_ar','character varying(255)'),
('blog_posts','title_fr','character varying(255)'),
('blog_posts','title_en','character varying(255)'),
('blog_posts','excerpt_ar','text'),
('blog_posts','excerpt_fr','text'),
('blog_posts','excerpt_en','text'),
('blog_posts','content_ar','text'),
('blog_posts','content_fr','text'),
('blog_posts','content_en','text'),
('blog_posts','cover_image_url','text'),
('blog_posts','is_published','boolean'),
('blog_posts','published_at','timestamp with time zone'),
('blog_posts','created_at','timestamp with time zone'),
('blog_posts','updated_at','timestamp with time zone'),
('contact_messages','id','uuid'),
('contact_messages','full_name','character varying(255)'),
('contact_messages','email','character varying(320)'),
('contact_messages','phone','character varying(32)'),
('contact_messages','subject','character varying(255)'),
('contact_messages','message','text'),
('contact_messages','status','character varying(20)'),
('contact_messages','created_at','timestamp with time zone'),
('contact_messages','updated_at','timestamp with time zone'),
('corporate_quotes','id','uuid'),
('corporate_quotes','company_name','character varying(255)'),
('corporate_quotes','contact_person','character varying(255)'),
('corporate_quotes','phone','character varying(32)'),
('corporate_quotes','email','character varying(320)'),
('corporate_quotes','service_type','character varying(20)'),
('corporate_quotes','passenger_count','integer'),
('corporate_quotes','origin_city','character varying(120)'),
('corporate_quotes','destination_city','character varying(120)'),
('corporate_quotes','details','text'),
('corporate_quotes','status','character varying(20)'),
('corporate_quotes','created_at','timestamp with time zone'),
('corporate_quotes','updated_at','timestamp with time zone'),
('messagerie_agencies','id','uuid'),
('messagerie_agencies','agency_id','uuid'),
('messagerie_agencies','name_fr','text'),
('messagerie_agencies','name_ar','text'),
('messagerie_agencies','name_en','text'),
('messagerie_agencies','city_fr','text'),
('messagerie_agencies','city_ar','text'),
('messagerie_agencies','city_en','text'),
('messagerie_agencies','address_fr','text'),
('messagerie_agencies','address_ar','text'),
('messagerie_agencies','address_en','text'),
('messagerie_agencies','phone','text'),
('messagerie_agencies','whatsapp','text'),
('messagerie_agencies','opening_hours_fr','text'),
('messagerie_agencies','opening_hours_ar','text'),
('messagerie_agencies','opening_hours_en','text'),
('messagerie_agencies','is_active','boolean'),
('messagerie_agencies','display_order','integer'),
('messagerie_agencies','created_at','timestamp with time zone'),
('messagerie_agencies','updated_at','timestamp with time zone'),
('messagerie_agencies','image_url','text'),
('messagerie_agencies','lat','numeric(10,7)'),
('messagerie_agencies','lng','numeric(10,7)'),
('messagerie_agencies','agents','jsonb'),
('messagerie_network_settings','id','integer'),
('messagerie_network_settings','title_fr','text'),
('messagerie_network_settings','title_ar','text'),
('messagerie_network_settings','title_en','text'),
('messagerie_network_settings','description_fr','text'),
('messagerie_network_settings','description_ar','text'),
('messagerie_network_settings','description_en','text'),
('messagerie_network_settings','map_image_url','text'),
('messagerie_network_settings','is_active','boolean'),
('messagerie_network_settings','created_at','timestamp with time zone'),
('messagerie_network_settings','updated_at','timestamp with time zone'),
('parcel_rates','id','uuid'),
('parcel_rates','category_ar','character varying(120)'),
('parcel_rates','category_fr','character varying(120)'),
('parcel_rates','category_en','character varying(120)'),
('parcel_rates','max_weight_kg','numeric(8,2)'),
('parcel_rates','base_price_mad','numeric(10,2)'),
('parcel_rates','description_ar','text'),
('parcel_rates','description_fr','text'),
('parcel_rates','description_en','text'),
('parcel_rates','created_at','timestamp with time zone'),
('parcel_rates','updated_at','timestamp with time zone'),
('parcel_rates','is_active','boolean'),
('routes','id','uuid'),
('routes','from_agency_id','uuid'),
('routes','to_agency_id','uuid'),
('routes','departure_time','time without time zone'),
('routes','arrival_time','time without time zone'),
('routes','price_mad','numeric(10,2)'),
('routes','bus_type','character varying(20)'),
('routes','days_of_week','text[]'),
('routes','is_tourist_route','boolean'),
('routes','is_active','boolean'),
('routes','created_at','timestamp with time zone'),
('routes','updated_at','timestamp with time zone'),
('routes','sort_order','integer'),
('site_media_assets','id','uuid'),
('site_media_assets','bucket_id','text'),
('site_media_assets','storage_path','text'),
('site_media_assets','filename','text'),
('site_media_assets','mime_type','text'),
('site_media_assets','size_bytes','integer'),
('site_media_assets','alt_fr','text'),
('site_media_assets','alt_ar','text'),
('site_media_assets','alt_en','text'),
('site_media_assets','is_published','boolean'),
('site_media_assets','is_active','boolean'),
('site_media_assets','created_at','timestamp with time zone'),
('site_media_assets','updated_at','timestamp with time zone'),
('site_page_media','id','uuid'),
('site_page_media','page_id','uuid'),
('site_page_media','field_key','text'),
('site_page_media','asset_id','uuid'),
('site_page_media','external_url','text'),
('site_page_media','created_at','timestamp with time zone'),
('site_page_media','updated_at','timestamp with time zone'),
('site_pages','id','uuid'),
('site_pages','slug','text'),
('site_pages','route','text'),
('site_pages','label','text'),
('site_pages','title_fr','text'),
('site_pages','title_ar','text'),
('site_pages','title_en','text'),
('site_pages','seo_description_fr','text'),
('site_pages','seo_description_ar','text'),
('site_pages','seo_description_en','text'),
('site_pages','hero_overlay','numeric'),
('site_pages','content','jsonb'),
('site_pages','is_published','boolean'),
('site_pages','is_active','boolean'),
('site_pages','created_at','timestamp with time zone'),
('site_pages','updated_at','timestamp with time zone'),
('site_sections','id','uuid'),
('site_sections','page_id','uuid'),
('site_sections','section_key','text'),
('site_sections','label','text'),
('site_sections','kind','text'),
('site_sections','sort_order','integer'),
('site_sections','is_active','boolean'),
('site_sections','is_published','boolean'),
('site_sections','background','text'),
('site_sections','layout','text'),
('site_sections','title_fr','text'),
('site_sections','title_ar','text'),
('site_sections','title_en','text'),
('site_sections','body_fr','text'),
('site_sections','body_ar','text'),
('site_sections','body_en','text'),
('site_sections','cta_fr','text'),
('site_sections','cta_ar','text'),
('site_sections','cta_en','text'),
('site_sections','cta_href','text'),
('site_sections','media_asset_id','uuid'),
('site_sections','image_url','text'),
('site_sections','content','jsonb'),
('site_sections','created_at','timestamp with time zone'),
('site_sections','updated_at','timestamp with time zone'),
('site_settings','id','smallint'),
('site_settings','site_name_ar','character varying(200)'),
('site_settings','site_name_fr','character varying(200)'),
('site_settings','site_name_en','character varying(200)'),
('site_settings','default_locale','character varying(2)'),
('site_settings','support_phone','character varying(32)'),
('site_settings','emergency_phone','character varying(32)'),
('site_settings','emergency_lines','jsonb'),
('site_settings','whatsapp_number','character varying(32)'),
('site_settings','contact_email','character varying(320)'),
('site_settings','address_ar','text'),
('site_settings','address_fr','text'),
('site_settings','address_en','text'),
('site_settings','social_links','jsonb'),
('site_settings','analytics_config','jsonb'),
('site_settings','created_at','timestamp with time zone'),
('site_settings','updated_at','timestamp with time zone'),
('site_settings','presentation','jsonb'),
('site_settings','navigation','jsonb')
      ) as v(table_name,column_name,column_type) loop
        select format_type(a.atttypid,a.atttypmod) into actual from pg_attribute a join pg_class c on c.oid=a.attrelid
        where c.relnamespace='public'::regnamespace and c.relname=expected.table_name and a.attname=expected.column_name and a.attnum>0 and not a.attisdropped;
        if actual is not null and actual<>expected.column_type then raise exception 'Type conflict %.%: expected %, got %. Stop and prepare a reviewed data migration.',expected.table_name,expected.column_name,expected.column_type,actual; end if;
      end loop;
    end $$;

do $$ begin if exists(select 1 from pg_policies p where (p.schemaname='public' and p.tablename=any(array['agencies','blog_posts','contact_messages','corporate_quotes','messagerie_agencies','messagerie_network_settings','parcel_rates','routes','site_media_assets','site_page_media','site_pages','site_sections','site_settings'])) and not exists(select 1 from (values
('agencies','Admins can delete agencies'),
('agencies','Admins can insert agencies'),
('agencies','Admins can read all agencies'),
('agencies','Admins can update agencies'),
('agencies','Public can read active agencies'),
('blog_posts','Admins can delete blog posts'),
('blog_posts','Admins can insert blog posts'),
('blog_posts','Admins can read all blog posts'),
('blog_posts','Admins can update blog posts'),
('blog_posts','Public can read published blog posts'),
('contact_messages','Admins can delete contact messages'),
('contact_messages','Admins can read contact messages'),
('contact_messages','Admins can update contact messages'),
('contact_messages','Anyone can send a contact message'),
('corporate_quotes','Admins can delete corporate quotes'),
('corporate_quotes','Admins can read all corporate quotes'),
('corporate_quotes','Admins can update corporate quotes'),
('corporate_quotes','Anyone can submit a corporate quote'),
('messagerie_agencies','messagerie_agencies_admin'),
('messagerie_agencies','messagerie_agencies_public'),
('messagerie_network_settings','messagerie_settings_admin'),
('messagerie_network_settings','messagerie_settings_public'),
('parcel_rates','Admins can delete parcel rates'),
('parcel_rates','Admins can insert parcel rates'),
('parcel_rates','Admins can read all parcel rates'),
('parcel_rates','Admins can update parcel rates'),
('parcel_rates','Public can read parcel rates'),
('routes','Admins can delete routes'),
('routes','Admins can insert routes'),
('routes','Admins can read all routes'),
('routes','Admins can update routes'),
('routes','Public can read active routes'),
('site_media_assets','cms_admin_all'),
('site_media_assets','cms_public_assets'),
('site_page_media','cms_admin_all'),
('site_page_media','cms_public_media_links'),
('site_pages','cms_admin_all'),
('site_pages','cms_public_pages'),
('site_sections','cms_admin_all'),
('site_sections','cms_public_sections'),
('site_settings','Admins can read site settings'),
('site_settings','Admins can update site settings'),
('site_settings','Public can read site settings')
) allowed(table_name,policy_name) where allowed.table_name=p.tablename and allowed.policy_name=p.policyname)) then raise exception 'Unreviewed public policies found; inspect 08.sql and review before continuing. No unknown policy was removed.'; end if; end $$;

-- Tables/columns FIRST; keys and FKs follow in separate files. RLS enabled immediately.
create table if not exists public."agencies" (
  "id" uuid default gen_random_uuid() not null,
  "city_ar" character varying(120) not null,
  "city_fr" character varying(120) not null,
  "city_en" character varying(120) not null,
  "agency_name_ar" character varying(200) not null,
  "agency_name_fr" character varying(200) not null,
  "agency_name_en" character varying(200) not null,
  "address_ar" text not null,
  "address_fr" text not null,
  "address_en" text not null,
  "whatsapp_number" character varying(32),
  "phone_number" character varying(32),
  "lat" numeric(10,7),
  "lng" numeric(10,7),
  "image_url" text,
  "is_active" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "sort_order" integer default 0 not null
);
alter table public."agencies" enable row level security;
revoke all on public."agencies" from public,anon,authenticated;
alter table public."agencies" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."agencies" alter column "id" set default gen_random_uuid();
alter table public."agencies" add column if not exists "city_ar" character varying(120) not null;
alter table public."agencies" alter column "city_ar" drop default;
alter table public."agencies" add column if not exists "city_fr" character varying(120) not null;
alter table public."agencies" alter column "city_fr" drop default;
alter table public."agencies" add column if not exists "city_en" character varying(120) not null;
alter table public."agencies" alter column "city_en" drop default;
alter table public."agencies" add column if not exists "agency_name_ar" character varying(200) not null;
alter table public."agencies" alter column "agency_name_ar" drop default;
alter table public."agencies" add column if not exists "agency_name_fr" character varying(200) not null;
alter table public."agencies" alter column "agency_name_fr" drop default;
alter table public."agencies" add column if not exists "agency_name_en" character varying(200) not null;
alter table public."agencies" alter column "agency_name_en" drop default;
alter table public."agencies" add column if not exists "address_ar" text not null;
alter table public."agencies" alter column "address_ar" drop default;
alter table public."agencies" add column if not exists "address_fr" text not null;
alter table public."agencies" alter column "address_fr" drop default;
alter table public."agencies" add column if not exists "address_en" text not null;
alter table public."agencies" alter column "address_en" drop default;
alter table public."agencies" add column if not exists "whatsapp_number" character varying(32);
alter table public."agencies" alter column "whatsapp_number" drop default;
alter table public."agencies" add column if not exists "phone_number" character varying(32);
alter table public."agencies" alter column "phone_number" drop default;
alter table public."agencies" add column if not exists "lat" numeric(10,7);
alter table public."agencies" alter column "lat" drop default;
alter table public."agencies" add column if not exists "lng" numeric(10,7);
alter table public."agencies" alter column "lng" drop default;
alter table public."agencies" add column if not exists "image_url" text;
alter table public."agencies" alter column "image_url" drop default;
alter table public."agencies" add column if not exists "is_active" boolean default true not null;
alter table public."agencies" alter column "is_active" set default true;
alter table public."agencies" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."agencies" alter column "created_at" set default now();
alter table public."agencies" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."agencies" alter column "updated_at" set default now();
alter table public."agencies" add column if not exists "sort_order" integer default 0 not null;
alter table public."agencies" alter column "sort_order" set default 0;
create table if not exists public."blog_posts" (
  "id" uuid default gen_random_uuid() not null,
  "slug" character varying(255) not null,
  "title_ar" character varying(255) not null,
  "title_fr" character varying(255) not null,
  "title_en" character varying(255) not null,
  "excerpt_ar" text,
  "excerpt_fr" text,
  "excerpt_en" text,
  "content_ar" text not null,
  "content_fr" text not null,
  "content_en" text not null,
  "cover_image_url" text,
  "is_published" boolean default false not null,
  "published_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."blog_posts" enable row level security;
revoke all on public."blog_posts" from public,anon,authenticated;
alter table public."blog_posts" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."blog_posts" alter column "id" set default gen_random_uuid();
alter table public."blog_posts" add column if not exists "slug" character varying(255) not null;
alter table public."blog_posts" alter column "slug" drop default;
alter table public."blog_posts" add column if not exists "title_ar" character varying(255) not null;
alter table public."blog_posts" alter column "title_ar" drop default;
alter table public."blog_posts" add column if not exists "title_fr" character varying(255) not null;
alter table public."blog_posts" alter column "title_fr" drop default;
alter table public."blog_posts" add column if not exists "title_en" character varying(255) not null;
alter table public."blog_posts" alter column "title_en" drop default;
alter table public."blog_posts" add column if not exists "excerpt_ar" text;
alter table public."blog_posts" alter column "excerpt_ar" drop default;
alter table public."blog_posts" add column if not exists "excerpt_fr" text;
alter table public."blog_posts" alter column "excerpt_fr" drop default;
alter table public."blog_posts" add column if not exists "excerpt_en" text;
alter table public."blog_posts" alter column "excerpt_en" drop default;
alter table public."blog_posts" add column if not exists "content_ar" text not null;
alter table public."blog_posts" alter column "content_ar" drop default;
alter table public."blog_posts" add column if not exists "content_fr" text not null;
alter table public."blog_posts" alter column "content_fr" drop default;
alter table public."blog_posts" add column if not exists "content_en" text not null;
alter table public."blog_posts" alter column "content_en" drop default;
alter table public."blog_posts" add column if not exists "cover_image_url" text;
alter table public."blog_posts" alter column "cover_image_url" drop default;
alter table public."blog_posts" add column if not exists "is_published" boolean default false not null;
alter table public."blog_posts" alter column "is_published" set default false;
alter table public."blog_posts" add column if not exists "published_at" timestamp with time zone;
alter table public."blog_posts" alter column "published_at" drop default;
alter table public."blog_posts" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."blog_posts" alter column "created_at" set default now();
alter table public."blog_posts" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."blog_posts" alter column "updated_at" set default now();
create table if not exists public."contact_messages" (
  "id" uuid default gen_random_uuid() not null,
  "full_name" character varying(255) not null,
  "email" character varying(320) not null,
  "phone" character varying(32),
  "subject" character varying(255) not null,
  "message" text not null,
  "status" character varying(20) default 'new'::character varying not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."contact_messages" enable row level security;
revoke all on public."contact_messages" from public,anon,authenticated;
alter table public."contact_messages" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."contact_messages" alter column "id" set default gen_random_uuid();
alter table public."contact_messages" add column if not exists "full_name" character varying(255) not null;
alter table public."contact_messages" alter column "full_name" drop default;
alter table public."contact_messages" add column if not exists "email" character varying(320) not null;
alter table public."contact_messages" alter column "email" drop default;
alter table public."contact_messages" add column if not exists "phone" character varying(32);
alter table public."contact_messages" alter column "phone" drop default;
alter table public."contact_messages" add column if not exists "subject" character varying(255) not null;
alter table public."contact_messages" alter column "subject" drop default;
alter table public."contact_messages" add column if not exists "message" text not null;
alter table public."contact_messages" alter column "message" drop default;
alter table public."contact_messages" add column if not exists "status" character varying(20) default 'new'::character varying not null;
alter table public."contact_messages" alter column "status" set default 'new'::character varying;
alter table public."contact_messages" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."contact_messages" alter column "created_at" set default now();
alter table public."contact_messages" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."contact_messages" alter column "updated_at" set default now();
create table if not exists public."corporate_quotes" (
  "id" uuid default gen_random_uuid() not null,
  "company_name" character varying(255) not null,
  "contact_person" character varying(255) not null,
  "phone" character varying(32) not null,
  "email" character varying(320) not null,
  "service_type" character varying(20) not null,
  "passenger_count" integer not null,
  "origin_city" character varying(120) not null,
  "destination_city" character varying(120) not null,
  "details" text,
  "status" character varying(20) default 'pending'::character varying not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."corporate_quotes" enable row level security;
revoke all on public."corporate_quotes" from public,anon,authenticated;
alter table public."corporate_quotes" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."corporate_quotes" alter column "id" set default gen_random_uuid();
alter table public."corporate_quotes" add column if not exists "company_name" character varying(255) not null;
alter table public."corporate_quotes" alter column "company_name" drop default;
alter table public."corporate_quotes" add column if not exists "contact_person" character varying(255) not null;
alter table public."corporate_quotes" alter column "contact_person" drop default;
alter table public."corporate_quotes" add column if not exists "phone" character varying(32) not null;
alter table public."corporate_quotes" alter column "phone" drop default;
alter table public."corporate_quotes" add column if not exists "email" character varying(320) not null;
alter table public."corporate_quotes" alter column "email" drop default;
alter table public."corporate_quotes" add column if not exists "service_type" character varying(20) not null;
alter table public."corporate_quotes" alter column "service_type" drop default;
alter table public."corporate_quotes" add column if not exists "passenger_count" integer not null;
alter table public."corporate_quotes" alter column "passenger_count" drop default;
alter table public."corporate_quotes" add column if not exists "origin_city" character varying(120) not null;
alter table public."corporate_quotes" alter column "origin_city" drop default;
alter table public."corporate_quotes" add column if not exists "destination_city" character varying(120) not null;
alter table public."corporate_quotes" alter column "destination_city" drop default;
alter table public."corporate_quotes" add column if not exists "details" text;
alter table public."corporate_quotes" alter column "details" drop default;
alter table public."corporate_quotes" add column if not exists "status" character varying(20) default 'pending'::character varying not null;
alter table public."corporate_quotes" alter column "status" set default 'pending'::character varying;
alter table public."corporate_quotes" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."corporate_quotes" alter column "created_at" set default now();
alter table public."corporate_quotes" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."corporate_quotes" alter column "updated_at" set default now();
create table if not exists public."messagerie_agencies" (
  "id" uuid default gen_random_uuid() not null,
  "agency_id" uuid,
  "name_fr" text,
  "name_ar" text,
  "name_en" text,
  "city_fr" text,
  "city_ar" text,
  "city_en" text,
  "address_fr" text,
  "address_ar" text,
  "address_en" text,
  "phone" text,
  "whatsapp" text,
  "opening_hours_fr" text,
  "opening_hours_ar" text,
  "opening_hours_en" text,
  "is_active" boolean default true not null,
  "display_order" integer default 0 not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "image_url" text,
  "lat" numeric(10,7),
  "lng" numeric(10,7),
  "agents" jsonb default '[]'::jsonb not null
);
alter table public."messagerie_agencies" enable row level security;
revoke all on public."messagerie_agencies" from public,anon,authenticated;
alter table public."messagerie_agencies" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."messagerie_agencies" alter column "id" set default gen_random_uuid();
alter table public."messagerie_agencies" add column if not exists "agency_id" uuid;
alter table public."messagerie_agencies" alter column "agency_id" drop default;
alter table public."messagerie_agencies" add column if not exists "name_fr" text;
alter table public."messagerie_agencies" alter column "name_fr" drop default;
alter table public."messagerie_agencies" add column if not exists "name_ar" text;
alter table public."messagerie_agencies" alter column "name_ar" drop default;
alter table public."messagerie_agencies" add column if not exists "name_en" text;
alter table public."messagerie_agencies" alter column "name_en" drop default;
alter table public."messagerie_agencies" add column if not exists "city_fr" text;
alter table public."messagerie_agencies" alter column "city_fr" drop default;
alter table public."messagerie_agencies" add column if not exists "city_ar" text;
alter table public."messagerie_agencies" alter column "city_ar" drop default;
alter table public."messagerie_agencies" add column if not exists "city_en" text;
alter table public."messagerie_agencies" alter column "city_en" drop default;
alter table public."messagerie_agencies" add column if not exists "address_fr" text;
alter table public."messagerie_agencies" alter column "address_fr" drop default;
alter table public."messagerie_agencies" add column if not exists "address_ar" text;
alter table public."messagerie_agencies" alter column "address_ar" drop default;
alter table public."messagerie_agencies" add column if not exists "address_en" text;
alter table public."messagerie_agencies" alter column "address_en" drop default;
alter table public."messagerie_agencies" add column if not exists "phone" text;
alter table public."messagerie_agencies" alter column "phone" drop default;
alter table public."messagerie_agencies" add column if not exists "whatsapp" text;
alter table public."messagerie_agencies" alter column "whatsapp" drop default;
alter table public."messagerie_agencies" add column if not exists "opening_hours_fr" text;
alter table public."messagerie_agencies" alter column "opening_hours_fr" drop default;
alter table public."messagerie_agencies" add column if not exists "opening_hours_ar" text;
alter table public."messagerie_agencies" alter column "opening_hours_ar" drop default;
alter table public."messagerie_agencies" add column if not exists "opening_hours_en" text;
alter table public."messagerie_agencies" alter column "opening_hours_en" drop default;
alter table public."messagerie_agencies" add column if not exists "is_active" boolean default true not null;
alter table public."messagerie_agencies" alter column "is_active" set default true;
alter table public."messagerie_agencies" add column if not exists "display_order" integer default 0 not null;
alter table public."messagerie_agencies" alter column "display_order" set default 0;
alter table public."messagerie_agencies" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."messagerie_agencies" alter column "created_at" set default now();
alter table public."messagerie_agencies" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."messagerie_agencies" alter column "updated_at" set default now();
alter table public."messagerie_agencies" add column if not exists "image_url" text;
alter table public."messagerie_agencies" alter column "image_url" drop default;
alter table public."messagerie_agencies" add column if not exists "lat" numeric(10,7);
alter table public."messagerie_agencies" alter column "lat" drop default;
alter table public."messagerie_agencies" add column if not exists "lng" numeric(10,7);
alter table public."messagerie_agencies" alter column "lng" drop default;
alter table public."messagerie_agencies" add column if not exists "agents" jsonb default '[]'::jsonb not null;
alter table public."messagerie_agencies" alter column "agents" set default '[]'::jsonb;
create table if not exists public."messagerie_network_settings" (
  "id" integer default 1 not null,
  "title_fr" text default ''::text not null,
  "title_ar" text default ''::text not null,
  "title_en" text default ''::text not null,
  "description_fr" text default ''::text not null,
  "description_ar" text default ''::text not null,
  "description_en" text default ''::text not null,
  "map_image_url" text,
  "is_active" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."messagerie_network_settings" enable row level security;
revoke all on public."messagerie_network_settings" from public,anon,authenticated;
alter table public."messagerie_network_settings" add column if not exists "id" integer default 1 not null;
alter table public."messagerie_network_settings" alter column "id" set default 1;
alter table public."messagerie_network_settings" add column if not exists "title_fr" text default ''::text not null;
alter table public."messagerie_network_settings" alter column "title_fr" set default ''::text;
alter table public."messagerie_network_settings" add column if not exists "title_ar" text default ''::text not null;
alter table public."messagerie_network_settings" alter column "title_ar" set default ''::text;
alter table public."messagerie_network_settings" add column if not exists "title_en" text default ''::text not null;
alter table public."messagerie_network_settings" alter column "title_en" set default ''::text;
alter table public."messagerie_network_settings" add column if not exists "description_fr" text default ''::text not null;
alter table public."messagerie_network_settings" alter column "description_fr" set default ''::text;
alter table public."messagerie_network_settings" add column if not exists "description_ar" text default ''::text not null;
alter table public."messagerie_network_settings" alter column "description_ar" set default ''::text;
alter table public."messagerie_network_settings" add column if not exists "description_en" text default ''::text not null;
alter table public."messagerie_network_settings" alter column "description_en" set default ''::text;
alter table public."messagerie_network_settings" add column if not exists "map_image_url" text;
alter table public."messagerie_network_settings" alter column "map_image_url" drop default;
alter table public."messagerie_network_settings" add column if not exists "is_active" boolean default true not null;
alter table public."messagerie_network_settings" alter column "is_active" set default true;
alter table public."messagerie_network_settings" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."messagerie_network_settings" alter column "created_at" set default now();
alter table public."messagerie_network_settings" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."messagerie_network_settings" alter column "updated_at" set default now();
create table if not exists public."parcel_rates" (
  "id" uuid default gen_random_uuid() not null,
  "category_ar" character varying(120) not null,
  "category_fr" character varying(120) not null,
  "category_en" character varying(120) not null,
  "max_weight_kg" numeric(8,2) not null,
  "base_price_mad" numeric(10,2) not null,
  "description_ar" text,
  "description_fr" text,
  "description_en" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "is_active" boolean default true not null
);
alter table public."parcel_rates" enable row level security;
revoke all on public."parcel_rates" from public,anon,authenticated;
alter table public."parcel_rates" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."parcel_rates" alter column "id" set default gen_random_uuid();
alter table public."parcel_rates" add column if not exists "category_ar" character varying(120) not null;
alter table public."parcel_rates" alter column "category_ar" drop default;
alter table public."parcel_rates" add column if not exists "category_fr" character varying(120) not null;
alter table public."parcel_rates" alter column "category_fr" drop default;
alter table public."parcel_rates" add column if not exists "category_en" character varying(120) not null;
alter table public."parcel_rates" alter column "category_en" drop default;
alter table public."parcel_rates" add column if not exists "max_weight_kg" numeric(8,2) not null;
alter table public."parcel_rates" alter column "max_weight_kg" drop default;
alter table public."parcel_rates" add column if not exists "base_price_mad" numeric(10,2) not null;
alter table public."parcel_rates" alter column "base_price_mad" drop default;
alter table public."parcel_rates" add column if not exists "description_ar" text;
alter table public."parcel_rates" alter column "description_ar" drop default;
alter table public."parcel_rates" add column if not exists "description_fr" text;
alter table public."parcel_rates" alter column "description_fr" drop default;
alter table public."parcel_rates" add column if not exists "description_en" text;
alter table public."parcel_rates" alter column "description_en" drop default;
alter table public."parcel_rates" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."parcel_rates" alter column "created_at" set default now();
alter table public."parcel_rates" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."parcel_rates" alter column "updated_at" set default now();
alter table public."parcel_rates" add column if not exists "is_active" boolean default true not null;
alter table public."parcel_rates" alter column "is_active" set default true;
create table if not exists public."routes" (
  "id" uuid default gen_random_uuid() not null,
  "from_agency_id" uuid not null,
  "to_agency_id" uuid not null,
  "departure_time" time without time zone not null,
  "arrival_time" time without time zone not null,
  "price_mad" numeric(10,2) not null,
  "bus_type" character varying(20) default 'Comfort'::character varying not null,
  "days_of_week" text[] default '{}'::text[] not null,
  "is_tourist_route" boolean default false not null,
  "is_active" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "sort_order" integer default 0 not null
);
alter table public."routes" enable row level security;
revoke all on public."routes" from public,anon,authenticated;
alter table public."routes" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."routes" alter column "id" set default gen_random_uuid();
alter table public."routes" add column if not exists "from_agency_id" uuid not null;
alter table public."routes" alter column "from_agency_id" drop default;
alter table public."routes" add column if not exists "to_agency_id" uuid not null;
alter table public."routes" alter column "to_agency_id" drop default;
alter table public."routes" add column if not exists "departure_time" time without time zone not null;
alter table public."routes" alter column "departure_time" drop default;
alter table public."routes" add column if not exists "arrival_time" time without time zone not null;
alter table public."routes" alter column "arrival_time" drop default;
alter table public."routes" add column if not exists "price_mad" numeric(10,2) not null;
alter table public."routes" alter column "price_mad" drop default;
alter table public."routes" add column if not exists "bus_type" character varying(20) default 'Comfort'::character varying not null;
alter table public."routes" alter column "bus_type" set default 'Comfort'::character varying;
alter table public."routes" add column if not exists "days_of_week" text[] default '{}'::text[] not null;
alter table public."routes" alter column "days_of_week" set default '{}'::text[];
alter table public."routes" add column if not exists "is_tourist_route" boolean default false not null;
alter table public."routes" alter column "is_tourist_route" set default false;
alter table public."routes" add column if not exists "is_active" boolean default true not null;
alter table public."routes" alter column "is_active" set default true;
alter table public."routes" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."routes" alter column "created_at" set default now();
alter table public."routes" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."routes" alter column "updated_at" set default now();
alter table public."routes" add column if not exists "sort_order" integer default 0 not null;
alter table public."routes" alter column "sort_order" set default 0;
create table if not exists public."site_media_assets" (
  "id" uuid default gen_random_uuid() not null,
  "bucket_id" text default 'site-media'::text not null,
  "storage_path" text not null,
  "filename" text not null,
  "mime_type" text not null,
  "size_bytes" integer not null,
  "alt_fr" text default ''::text not null,
  "alt_ar" text default ''::text not null,
  "alt_en" text default ''::text not null,
  "is_published" boolean default false not null,
  "is_active" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."site_media_assets" enable row level security;
revoke all on public."site_media_assets" from public,anon,authenticated;
alter table public."site_media_assets" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."site_media_assets" alter column "id" set default gen_random_uuid();
alter table public."site_media_assets" add column if not exists "bucket_id" text default 'site-media'::text not null;
alter table public."site_media_assets" alter column "bucket_id" set default 'site-media'::text;
alter table public."site_media_assets" add column if not exists "storage_path" text not null;
alter table public."site_media_assets" alter column "storage_path" drop default;
alter table public."site_media_assets" add column if not exists "filename" text not null;
alter table public."site_media_assets" alter column "filename" drop default;
alter table public."site_media_assets" add column if not exists "mime_type" text not null;
alter table public."site_media_assets" alter column "mime_type" drop default;
alter table public."site_media_assets" add column if not exists "size_bytes" integer not null;
alter table public."site_media_assets" alter column "size_bytes" drop default;
alter table public."site_media_assets" add column if not exists "alt_fr" text default ''::text not null;
alter table public."site_media_assets" alter column "alt_fr" set default ''::text;
alter table public."site_media_assets" add column if not exists "alt_ar" text default ''::text not null;
alter table public."site_media_assets" alter column "alt_ar" set default ''::text;
alter table public."site_media_assets" add column if not exists "alt_en" text default ''::text not null;
alter table public."site_media_assets" alter column "alt_en" set default ''::text;
alter table public."site_media_assets" add column if not exists "is_published" boolean default false not null;
alter table public."site_media_assets" alter column "is_published" set default false;
alter table public."site_media_assets" add column if not exists "is_active" boolean default true not null;
alter table public."site_media_assets" alter column "is_active" set default true;
alter table public."site_media_assets" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."site_media_assets" alter column "created_at" set default now();
alter table public."site_media_assets" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."site_media_assets" alter column "updated_at" set default now();
create table if not exists public."site_page_media" (
  "id" uuid default gen_random_uuid() not null,
  "page_id" uuid not null,
  "field_key" text not null,
  "asset_id" uuid,
  "external_url" text,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."site_page_media" enable row level security;
revoke all on public."site_page_media" from public,anon,authenticated;
alter table public."site_page_media" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."site_page_media" alter column "id" set default gen_random_uuid();
alter table public."site_page_media" add column if not exists "page_id" uuid not null;
alter table public."site_page_media" alter column "page_id" drop default;
alter table public."site_page_media" add column if not exists "field_key" text not null;
alter table public."site_page_media" alter column "field_key" drop default;
alter table public."site_page_media" add column if not exists "asset_id" uuid;
alter table public."site_page_media" alter column "asset_id" drop default;
alter table public."site_page_media" add column if not exists "external_url" text;
alter table public."site_page_media" alter column "external_url" drop default;
alter table public."site_page_media" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."site_page_media" alter column "created_at" set default now();
alter table public."site_page_media" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."site_page_media" alter column "updated_at" set default now();
create table if not exists public."site_pages" (
  "id" uuid default gen_random_uuid() not null,
  "slug" text not null,
  "route" text not null,
  "label" text not null,
  "title_fr" text default ''::text not null,
  "title_ar" text default ''::text not null,
  "title_en" text default ''::text not null,
  "seo_description_fr" text default ''::text not null,
  "seo_description_ar" text default ''::text not null,
  "seo_description_en" text default ''::text not null,
  "hero_overlay" numeric default 0.7 not null,
  "content" jsonb default '{"copy": {}}'::jsonb not null,
  "is_published" boolean default true not null,
  "is_active" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."site_pages" enable row level security;
revoke all on public."site_pages" from public,anon,authenticated;
alter table public."site_pages" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."site_pages" alter column "id" set default gen_random_uuid();
alter table public."site_pages" add column if not exists "slug" text not null;
alter table public."site_pages" alter column "slug" drop default;
alter table public."site_pages" add column if not exists "route" text not null;
alter table public."site_pages" alter column "route" drop default;
alter table public."site_pages" add column if not exists "label" text not null;
alter table public."site_pages" alter column "label" drop default;
alter table public."site_pages" add column if not exists "title_fr" text default ''::text not null;
alter table public."site_pages" alter column "title_fr" set default ''::text;
alter table public."site_pages" add column if not exists "title_ar" text default ''::text not null;
alter table public."site_pages" alter column "title_ar" set default ''::text;
alter table public."site_pages" add column if not exists "title_en" text default ''::text not null;
alter table public."site_pages" alter column "title_en" set default ''::text;
alter table public."site_pages" add column if not exists "seo_description_fr" text default ''::text not null;
alter table public."site_pages" alter column "seo_description_fr" set default ''::text;
alter table public."site_pages" add column if not exists "seo_description_ar" text default ''::text not null;
alter table public."site_pages" alter column "seo_description_ar" set default ''::text;
alter table public."site_pages" add column if not exists "seo_description_en" text default ''::text not null;
alter table public."site_pages" alter column "seo_description_en" set default ''::text;
alter table public."site_pages" add column if not exists "hero_overlay" numeric default 0.7 not null;
alter table public."site_pages" alter column "hero_overlay" set default 0.7;
alter table public."site_pages" add column if not exists "content" jsonb default '{"copy": {}}'::jsonb not null;
alter table public."site_pages" alter column "content" set default '{"copy": {}}'::jsonb;
alter table public."site_pages" add column if not exists "is_published" boolean default true not null;
alter table public."site_pages" alter column "is_published" set default true;
alter table public."site_pages" add column if not exists "is_active" boolean default true not null;
alter table public."site_pages" alter column "is_active" set default true;
alter table public."site_pages" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."site_pages" alter column "created_at" set default now();
alter table public."site_pages" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."site_pages" alter column "updated_at" set default now();
create table if not exists public."site_sections" (
  "id" uuid default gen_random_uuid() not null,
  "page_id" uuid not null,
  "section_key" text not null,
  "label" text not null,
  "kind" text default 'builtin'::text not null,
  "sort_order" integer default 0 not null,
  "is_active" boolean default true not null,
  "is_published" boolean default true not null,
  "background" text default 'default'::text not null,
  "layout" text default 'standard'::text not null,
  "title_fr" text default ''::text not null,
  "title_ar" text default ''::text not null,
  "title_en" text default ''::text not null,
  "body_fr" text default ''::text not null,
  "body_ar" text default ''::text not null,
  "body_en" text default ''::text not null,
  "cta_fr" text default ''::text not null,
  "cta_ar" text default ''::text not null,
  "cta_en" text default ''::text not null,
  "cta_href" text default ''::text not null,
  "media_asset_id" uuid,
  "image_url" text,
  "content" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
alter table public."site_sections" enable row level security;
revoke all on public."site_sections" from public,anon,authenticated;
alter table public."site_sections" add column if not exists "id" uuid default gen_random_uuid() not null;
alter table public."site_sections" alter column "id" set default gen_random_uuid();
alter table public."site_sections" add column if not exists "page_id" uuid not null;
alter table public."site_sections" alter column "page_id" drop default;
alter table public."site_sections" add column if not exists "section_key" text not null;
alter table public."site_sections" alter column "section_key" drop default;
alter table public."site_sections" add column if not exists "label" text not null;
alter table public."site_sections" alter column "label" drop default;
alter table public."site_sections" add column if not exists "kind" text default 'builtin'::text not null;
alter table public."site_sections" alter column "kind" set default 'builtin'::text;
alter table public."site_sections" add column if not exists "sort_order" integer default 0 not null;
alter table public."site_sections" alter column "sort_order" set default 0;
alter table public."site_sections" add column if not exists "is_active" boolean default true not null;
alter table public."site_sections" alter column "is_active" set default true;
alter table public."site_sections" add column if not exists "is_published" boolean default true not null;
alter table public."site_sections" alter column "is_published" set default true;
alter table public."site_sections" add column if not exists "background" text default 'default'::text not null;
alter table public."site_sections" alter column "background" set default 'default'::text;
alter table public."site_sections" add column if not exists "layout" text default 'standard'::text not null;
alter table public."site_sections" alter column "layout" set default 'standard'::text;
alter table public."site_sections" add column if not exists "title_fr" text default ''::text not null;
alter table public."site_sections" alter column "title_fr" set default ''::text;
alter table public."site_sections" add column if not exists "title_ar" text default ''::text not null;
alter table public."site_sections" alter column "title_ar" set default ''::text;
alter table public."site_sections" add column if not exists "title_en" text default ''::text not null;
alter table public."site_sections" alter column "title_en" set default ''::text;
alter table public."site_sections" add column if not exists "body_fr" text default ''::text not null;
alter table public."site_sections" alter column "body_fr" set default ''::text;
alter table public."site_sections" add column if not exists "body_ar" text default ''::text not null;
alter table public."site_sections" alter column "body_ar" set default ''::text;
alter table public."site_sections" add column if not exists "body_en" text default ''::text not null;
alter table public."site_sections" alter column "body_en" set default ''::text;
alter table public."site_sections" add column if not exists "cta_fr" text default ''::text not null;
alter table public."site_sections" alter column "cta_fr" set default ''::text;
alter table public."site_sections" add column if not exists "cta_ar" text default ''::text not null;
alter table public."site_sections" alter column "cta_ar" set default ''::text;
alter table public."site_sections" add column if not exists "cta_en" text default ''::text not null;
alter table public."site_sections" alter column "cta_en" set default ''::text;
alter table public."site_sections" add column if not exists "cta_href" text default ''::text not null;
alter table public."site_sections" alter column "cta_href" set default ''::text;
alter table public."site_sections" add column if not exists "media_asset_id" uuid;
alter table public."site_sections" alter column "media_asset_id" drop default;
alter table public."site_sections" add column if not exists "image_url" text;
alter table public."site_sections" alter column "image_url" drop default;
alter table public."site_sections" add column if not exists "content" jsonb default '{}'::jsonb not null;
alter table public."site_sections" alter column "content" set default '{}'::jsonb;
alter table public."site_sections" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."site_sections" alter column "created_at" set default now();
alter table public."site_sections" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."site_sections" alter column "updated_at" set default now();
create table if not exists public."site_settings" (
  "id" smallint default 1 not null,
  "site_name_ar" character varying(200),
  "site_name_fr" character varying(200),
  "site_name_en" character varying(200),
  "default_locale" character varying(2) default 'fr'::character varying not null,
  "support_phone" character varying(32),
  "emergency_phone" character varying(32),
  "emergency_lines" jsonb default '[]'::jsonb not null,
  "whatsapp_number" character varying(32),
  "contact_email" character varying(320),
  "address_ar" text,
  "address_fr" text,
  "address_en" text,
  "social_links" jsonb default '{}'::jsonb not null,
  "analytics_config" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "presentation" jsonb default '{}'::jsonb not null,
  "navigation" jsonb default '{}'::jsonb not null
);
alter table public."site_settings" enable row level security;
revoke all on public."site_settings" from public,anon,authenticated;
alter table public."site_settings" add column if not exists "id" smallint default 1 not null;
alter table public."site_settings" alter column "id" set default 1;
alter table public."site_settings" add column if not exists "site_name_ar" character varying(200);
alter table public."site_settings" alter column "site_name_ar" drop default;
alter table public."site_settings" add column if not exists "site_name_fr" character varying(200);
alter table public."site_settings" alter column "site_name_fr" drop default;
alter table public."site_settings" add column if not exists "site_name_en" character varying(200);
alter table public."site_settings" alter column "site_name_en" drop default;
alter table public."site_settings" add column if not exists "default_locale" character varying(2) default 'fr'::character varying not null;
alter table public."site_settings" alter column "default_locale" set default 'fr'::character varying;
alter table public."site_settings" add column if not exists "support_phone" character varying(32);
alter table public."site_settings" alter column "support_phone" drop default;
alter table public."site_settings" add column if not exists "emergency_phone" character varying(32);
alter table public."site_settings" alter column "emergency_phone" drop default;
alter table public."site_settings" add column if not exists "emergency_lines" jsonb default '[]'::jsonb not null;
alter table public."site_settings" alter column "emergency_lines" set default '[]'::jsonb;
alter table public."site_settings" add column if not exists "whatsapp_number" character varying(32);
alter table public."site_settings" alter column "whatsapp_number" drop default;
alter table public."site_settings" add column if not exists "contact_email" character varying(320);
alter table public."site_settings" alter column "contact_email" drop default;
alter table public."site_settings" add column if not exists "address_ar" text;
alter table public."site_settings" alter column "address_ar" drop default;
alter table public."site_settings" add column if not exists "address_fr" text;
alter table public."site_settings" alter column "address_fr" drop default;
alter table public."site_settings" add column if not exists "address_en" text;
alter table public."site_settings" alter column "address_en" drop default;
alter table public."site_settings" add column if not exists "social_links" jsonb default '{}'::jsonb not null;
alter table public."site_settings" alter column "social_links" set default '{}'::jsonb;
alter table public."site_settings" add column if not exists "analytics_config" jsonb default '{}'::jsonb not null;
alter table public."site_settings" alter column "analytics_config" set default '{}'::jsonb;
alter table public."site_settings" add column if not exists "created_at" timestamp with time zone default now() not null;
alter table public."site_settings" alter column "created_at" set default now();
alter table public."site_settings" add column if not exists "updated_at" timestamp with time zone default now() not null;
alter table public."site_settings" alter column "updated_at" set default now();
alter table public."site_settings" add column if not exists "presentation" jsonb default '{}'::jsonb not null;
alter table public."site_settings" alter column "presentation" set default '{}'::jsonb;
alter table public."site_settings" add column if not exists "navigation" jsonb default '{}'::jsonb not null;
alter table public."site_settings" alter column "navigation" set default '{}'::jsonb;
commit;

-- This file has created the base tables before 02.sql and every INSERT.
select to_regclass('public.agencies') as agencies_table;
