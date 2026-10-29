-- ============================================================================
-- SLKM — Passenger Transport, Express Parcel (Irsaliyat), Corporate Commutes,
--        and Tourism Platform
-- ----------------------------------------------------------------------------
-- Target : PostgreSQL 15+ / Supabase
-- Run    : Supabase SQL Editor, or save as a migration under supabase/migrations
-- Idempotent: safe to run more than once on a fresh/partially-created project.
-- ============================================================================

begin;

-- ============================================================================
-- 0. SHARED HELPERS
-- ============================================================================

-- Returns true when the JWT carries an admin/service role in app_metadata.
-- Set this in Supabase Auth: app_metadata = { "role": "admin" }.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'service_role'),
    false
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Keeps updated_at accurate without relying on application code.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. AGENCIES
-- ============================================================================

create table if not exists public.agencies (
  id                uuid primary key default gen_random_uuid(),
  city_ar           varchar(120) not null,
  city_fr           varchar(120) not null,
  city_en           varchar(120) not null,
  agency_name_ar    varchar(200) not null,
  agency_name_fr    varchar(200) not null,
  agency_name_en    varchar(200) not null,
  address_ar        text not null,
  address_fr        text not null,
  address_en        text not null,
  whatsapp_number   varchar(32),
  phone_number      varchar(32),
  lat               numeric(10, 7),
  lng               numeric(10, 7),
  image_url         text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint agencies_lat_range
    check (lat is null or lat between -90 and 90),
  constraint agencies_lng_range
    check (lng is null or lng between -180 and 180),
  constraint agencies_coordinates_together
    check ((lat is null) = (lng is null))
);

comment on table public.agencies is
  'Physical SLKM agencies, multilingual and geo-located for map display.';

-- ============================================================================
-- 2. ROUTES (LIGNES DE TRANSPORT)
-- ============================================================================

create table if not exists public.routes (
  id                 uuid primary key default gen_random_uuid(),
  from_agency_id     uuid not null references public.agencies(id) on delete restrict,
  to_agency_id       uuid not null references public.agencies(id) on delete restrict,
  departure_time     time not null,
  arrival_time       time not null,
  price_mad          numeric(10, 2) not null,
  bus_type           varchar(20) not null default 'Comfort',
  days_of_week       text[] not null default '{}'::text[],
  is_tourist_route   boolean not null default false,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint routes_distinct_agencies
    check (from_agency_id <> to_agency_id),
  constraint routes_price_nonnegative
    check (price_mad >= 0),
  constraint routes_bus_type_valid
    check (bus_type in ('Comfort', 'Premium', 'VIP')),
  constraint routes_days_of_week_valid
    check (
      days_of_week <@ array['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']::text[]
    )
);

comment on table public.routes is
  'Scheduled intercity routes. arrival_time may be earlier than departure_time for overnight services.';

-- ============================================================================
-- 3. PARCEL RATES (IRSALIYAT / COLIS)
-- ============================================================================

create table if not exists public.parcel_rates (
  id                uuid primary key default gen_random_uuid(),
  category_ar       varchar(120) not null,
  category_fr       varchar(120) not null,
  category_en       varchar(120) not null,
  max_weight_kg     numeric(8, 2) not null,
  base_price_mad    numeric(10, 2) not null,
  description_ar    text,
  description_fr    text,
  description_en    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint parcel_rates_weight_positive
    check (max_weight_kg > 0),
  constraint parcel_rates_price_nonnegative
    check (base_price_mad >= 0)
);

comment on table public.parcel_rates is
  'Pricing tiers for Irsaliyat / express parcel services by maximum weight.';

-- ============================================================================
-- 4. CORPORATE QUOTES (TRANSPORT DE PERSONNEL & TOURISME)
-- ============================================================================

create table if not exists public.corporate_quotes (
  id                uuid primary key default gen_random_uuid(),
  company_name      varchar(255) not null,
  contact_person    varchar(255) not null,
  phone             varchar(32) not null,
  email             varchar(320) not null,
  service_type      varchar(20) not null,
  passenger_count   integer not null,
  origin_city       varchar(120) not null,
  destination_city  varchar(120) not null,
  details           text,
  status            varchar(20) not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint corporate_quotes_service_type_valid
    check (service_type in ('personnel', 'tourisme')),
  constraint corporate_quotes_passenger_count_positive
    check (passenger_count > 0),
  constraint corporate_quotes_status_valid
    check (status in ('pending', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'))
);

comment on table public.corporate_quotes is
  'B2B quote requests. Contains PII: readable/writable by admins only, insertable by the public.';

-- ============================================================================
-- 4b. CONTACT MESSAGES
-- ============================================================================

create table if not exists public.contact_messages (
  id                uuid primary key default gen_random_uuid(),
  full_name         varchar(255) not null,
  email             varchar(320) not null,
  phone             varchar(32),
  subject           varchar(255) not null,
  message           text not null,
  status            varchar(20) not null default 'new',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint contact_messages_status_valid
    check (status in ('new', 'read', 'replied', 'archived'))
);

comment on table public.contact_messages is
  'Public contact form submissions. Contains PII: readable/writable by admins only, insertable by the public.';

-- ============================================================================
-- 5. BLOG POSTS
-- ============================================================================

create table if not exists public.blog_posts (
  id                uuid primary key default gen_random_uuid(),
  slug              varchar(255) not null unique,
  title_ar          varchar(255) not null,
  title_fr          varchar(255) not null,
  title_en          varchar(255) not null,
  excerpt_ar        text,
  excerpt_fr        text,
  excerpt_en        text,
  content_ar        text not null,
  content_fr        text not null,
  content_en        text not null,
  cover_image_url   text,
  is_published      boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint blog_posts_slug_format
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

comment on table public.blog_posts is
  'Multilingual articles. The unique constraint on slug provides the requested slug index.';

-- ============================================================================
-- 6. SITE SETTINGS (SINGLETON)
-- ============================================================================

create table if not exists public.site_settings (
  id                smallint primary key default 1,
  site_name_ar      varchar(200),
  site_name_fr      varchar(200),
  site_name_en      varchar(200),
  default_locale    varchar(2) not null default 'fr',
  support_phone     varchar(32),
  emergency_phone   varchar(32),
  emergency_lines   jsonb not null default '[]'::jsonb,
  whatsapp_number   varchar(32),
  contact_email     varchar(320),
  address_ar        text,
  address_fr        text,
  address_en        text,
  social_links      jsonb not null default '{}'::jsonb,
  analytics_config  jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint site_settings_singleton
    check (id = 1),
  constraint site_settings_default_locale_valid
    check (default_locale in ('ar', 'fr', 'en')),
  constraint site_settings_emergency_lines_is_array
    check (jsonb_typeof(emergency_lines) = 'array'),
  constraint site_settings_social_links_is_object
    check (jsonb_typeof(social_links) = 'object'),
  constraint site_settings_analytics_is_object
    check (jsonb_typeof(analytics_config) = 'object')
);

comment on table public.site_settings is
  'Single-row global configuration. social_links example: {"facebook":"...","instagram":"..."}; emergency_lines example: [{"label_ar":"...","label_fr":"...","label_en":"...","phone":"..."}].';

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- ============================================================================
-- 7. INDEXES
-- ============================================================================

-- Agencies: city search and active directory filtering.
create index if not exists idx_agencies_city_fr
  on public.agencies (city_fr);
create index if not exists idx_agencies_city_ar
  on public.agencies (city_ar);
create index if not exists idx_agencies_city_en
  on public.agencies (city_en);
create index if not exists idx_agencies_active
  on public.agencies (is_active) where is_active;

-- Routes: FK lookups, search by origin/destination, tourist filter, schedule days.
create index if not exists idx_routes_from_agency
  on public.routes (from_agency_id);
create index if not exists idx_routes_to_agency
  on public.routes (to_agency_id);
create index if not exists idx_routes_search
  on public.routes (from_agency_id, to_agency_id, is_active, departure_time);
create index if not exists idx_routes_tourist
  on public.routes (is_tourist_route) where is_tourist_route;
create index if not exists idx_routes_days_of_week
  on public.routes using gin (days_of_week);

-- Parcel rates: category and weight lookups.
create index if not exists idx_parcel_rates_category_fr
  on public.parcel_rates (category_fr);
create index if not exists idx_parcel_rates_weight
  on public.parcel_rates (max_weight_kg);

-- Corporate quotes: admin queue and reporting.
create index if not exists idx_corporate_quotes_status_created
  on public.corporate_quotes (status, created_at desc);
create index if not exists idx_corporate_quotes_service_type
  on public.corporate_quotes (service_type);
create index if not exists idx_corporate_quotes_email
  on public.corporate_quotes (lower(email));

-- Contact messages: admin inbox.
create index if not exists idx_contact_messages_status_created
  on public.contact_messages (status, created_at desc);

-- Blog: published listing. slug already has a unique index via the constraint.
create index if not exists idx_blog_posts_published
  on public.blog_posts (is_published, published_at desc)
  where is_published;

-- ============================================================================
-- 8. updated_at TRIGGERS
-- ============================================================================

drop trigger if exists trg_agencies_updated_at on public.agencies;
create trigger trg_agencies_updated_at
  before update on public.agencies
  for each row execute function public.set_updated_at();

drop trigger if exists trg_routes_updated_at on public.routes;
create trigger trg_routes_updated_at
  before update on public.routes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_parcel_rates_updated_at on public.parcel_rates;
create trigger trg_parcel_rates_updated_at
  before update on public.parcel_rates
  for each row execute function public.set_updated_at();

drop trigger if exists trg_corporate_quotes_updated_at on public.corporate_quotes;
create trigger trg_corporate_quotes_updated_at
  before update on public.corporate_quotes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contact_messages_updated_at on public.contact_messages;
create trigger trg_contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.set_updated_at();

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 9. ROW LEVEL SECURITY
-- ============================================================================

alter table public.agencies          enable row level security;
alter table public.routes            enable row level security;
alter table public.parcel_rates      enable row level security;
alter table public.corporate_quotes  enable row level security;
alter table public.contact_messages enable row level security;
alter table public.blog_posts        enable row level security;
alter table public.site_settings     enable row level security;

-- ---------------------------------------------------------------------------
-- 9.1 Public read policies
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read active agencies" on public.agencies;
create policy "Public can read active agencies"
  on public.agencies
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read active routes" on public.routes;
create policy "Public can read active routes"
  on public.routes
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Public can read parcel rates" on public.parcel_rates;
create policy "Public can read parcel rates"
  on public.parcel_rates
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read published blog posts" on public.blog_posts;
create policy "Public can read published blog posts"
  on public.blog_posts
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

-- NOTE: corporate_quotes intentionally has NO public SELECT policy because it
-- contains personal contact data. Only admins (below) can read submissions.

-- ---------------------------------------------------------------------------
-- 9.2 Public B2B quote submission
-- ---------------------------------------------------------------------------

drop policy if exists "Anyone can submit a corporate quote" on public.corporate_quotes;
create policy "Anyone can submit a corporate quote"
  on public.corporate_quotes
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- ---------------------------------------------------------------------------
-- 9.2b Public contact message submission
-- ---------------------------------------------------------------------------

drop policy if exists "Anyone can send a contact message" on public.contact_messages;
create policy "Anyone can send a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (status = 'new');

-- ---------------------------------------------------------------------------
-- 9.3 Admin access (JWT app_metadata.role = 'admin')
-- ---------------------------------------------------------------------------

drop policy if exists "Admins can read all agencies" on public.agencies;
create policy "Admins can read all agencies"
  on public.agencies for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert agencies" on public.agencies;
create policy "Admins can insert agencies"
  on public.agencies for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update agencies" on public.agencies;
create policy "Admins can update agencies"
  on public.agencies for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete agencies" on public.agencies;
create policy "Admins can delete agencies"
  on public.agencies for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all routes" on public.routes;
create policy "Admins can read all routes"
  on public.routes for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert routes" on public.routes;
create policy "Admins can insert routes"
  on public.routes for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update routes" on public.routes;
create policy "Admins can update routes"
  on public.routes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete routes" on public.routes;
create policy "Admins can delete routes"
  on public.routes for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all parcel rates" on public.parcel_rates;
create policy "Admins can read all parcel rates"
  on public.parcel_rates for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert parcel rates" on public.parcel_rates;
create policy "Admins can insert parcel rates"
  on public.parcel_rates for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update parcel rates" on public.parcel_rates;
create policy "Admins can update parcel rates"
  on public.parcel_rates for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete parcel rates" on public.parcel_rates;
create policy "Admins can delete parcel rates"
  on public.parcel_rates for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all corporate quotes" on public.corporate_quotes;
create policy "Admins can read all corporate quotes"
  on public.corporate_quotes for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update corporate quotes" on public.corporate_quotes;
create policy "Admins can update corporate quotes"
  on public.corporate_quotes for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete corporate quotes" on public.corporate_quotes;
create policy "Admins can delete corporate quotes"
  on public.corporate_quotes for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read contact messages" on public.contact_messages;
create policy "Admins can read contact messages"
  on public.contact_messages for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update contact messages" on public.contact_messages;
create policy "Admins can update contact messages"
  on public.contact_messages for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete contact messages" on public.contact_messages;
create policy "Admins can delete contact messages"
  on public.contact_messages for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read all blog posts" on public.blog_posts;
create policy "Admins can read all blog posts"
  on public.blog_posts for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can insert blog posts" on public.blog_posts;
create policy "Admins can insert blog posts"
  on public.blog_posts for insert to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts"
  on public.blog_posts for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Admins can delete blog posts"
  on public.blog_posts for delete to authenticated
  using (public.is_admin());

drop policy if exists "Admins can read site settings" on public.site_settings;
create policy "Admins can read site settings"
  on public.site_settings for select to authenticated
  using (public.is_admin());

drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings"
  on public.site_settings for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- 10. TABLE PRIVILEGES
-- RLS filters rows; these grants are still required for PostgREST roles.
-- ============================================================================

grant usage on schema public to anon, authenticated;

grant select on
  public.agencies,
  public.routes,
  public.parcel_rates,
  public.blog_posts,
  public.site_settings
to anon, authenticated;

grant insert on public.corporate_quotes to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;

grant select, insert, update, delete on
  public.agencies,
  public.routes,
  public.parcel_rates,
  public.corporate_quotes,
  public.contact_messages,
  public.blog_posts,
  public.site_settings
to authenticated;

grant select, insert, update, delete on
  public.agencies,
  public.routes,
  public.parcel_rates,
  public.corporate_quotes,
  public.contact_messages,
  public.blog_posts,
  public.site_settings
to service_role;

-- ============================================================================
-- 11. SUPABASE STORAGE BUCKETS
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'agencies-media',
    'agencies-media',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'blog-images',
    'blog-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'fleet-images',
    'fleet-images',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table storage.objects enable row level security;

-- Public read access for the three public media buckets.
drop policy if exists "SLKM public media read" on storage.objects;
create policy "SLKM public media read"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id in ('agencies-media', 'blog-images', 'fleet-images')
  );

-- Authenticated uploads.
drop policy if exists "SLKM authenticated media upload" on storage.objects;
create policy "SLKM authenticated media upload"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in ('agencies-media', 'blog-images', 'fleet-images')
    and length(trim(name)) > 0
  );

-- Authenticated metadata/content updates.
drop policy if exists "SLKM authenticated media update" on storage.objects;
create policy "SLKM authenticated media update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id in ('agencies-media', 'blog-images', 'fleet-images')
  )
  with check (
    bucket_id in ('agencies-media', 'blog-images', 'fleet-images')
  );

-- Only admins may delete media.
drop policy if exists "SLKM admins media delete" on storage.objects;
create policy "SLKM admins media delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in ('agencies-media', 'blog-images', 'fleet-images')
    and public.is_admin()
  );

commit;
