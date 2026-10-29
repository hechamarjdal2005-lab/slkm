-- ============================================================================
-- SLKM — Production-oriented seed data
-- ----------------------------------------------------------------------------
-- Run AFTER ./supabase/schema.sql.
-- Safe to re-run: every insert has an explicit primary key or unique conflict
-- target, and updates the existing row with the latest curated values.
--
-- Image paths are intentionally root-relative (e.g. /images/agencies/...).
-- Copy the curated design assets from ./stitch-design-export into
-- ./public/images/... when integrating the Next.js frontend, or replace these
-- values with Supabase Storage public URLs after uploading to the buckets.
-- ============================================================================

begin;

set local search_path = public;

-- ============================================================================
-- 1. AGENCIES
-- ============================================================================

insert into public.agencies (
  id,
  city_ar,
  city_fr,
  city_en,
  agency_name_ar,
  agency_name_fr,
  agency_name_en,
  address_ar,
  address_fr,
  address_en,
  whatsapp_number,
  phone_number,
  lat,
  lng,
  image_url,
  is_active
)
values
  (
    '11111111-1111-4111-8111-000000000001',
    $a$أكادير$a$,
    $a$Agadir$a$,
    $a$Agadir$a$,
    $a$وكالة أكادير المسيرة$a$,
    $a$Agence Agadir Al Massira$a$,
    $a$Agadir Al Massira Agency$a$,
    $a$المحطة الطرقية المركزية إنزكان، الشباك رقم 12، إنزكان 80000$a$,
    $a$Gare Routière Centrale d'Inezgane, Guichet N° 12, Inezgane 80000$a$,
    $a$Inezgane Central Bus Station, Counter 12, Inezgane 80000$a$,
    '+212661001122',
    '+212528840001',
    30.3555000,
    -9.5360000,
    '/images/agencies/agadir.png',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000002',
    $a$الدار البيضاء$a$,
    $a$Casablanca$a$,
    $a$Casablanca$a$,
    $a$وكالة الدار البيضاء أولاد الزيان$a$,
    $a$Agence Casablanca Ouled Ziane$a$,
    $a$Casablanca Ouled Ziane Agency$a$,
    $a$محطة أولاد الزيان الطرقية، البوابة 4، الدار البيضاء 20250$a$,
    $a$Gare Routière Ouled Ziane, Porte 4, Casablanca 20250$a$,
    $a$Ouled Ziane Bus Station, Gate 4, Casablanca 20250$a$,
    '+212662445566',
    '+212522405588',
    33.5759000,
    -7.5720000,
    '/images/agencies/casablanca.png',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000003',
    $a$مراكش$a$,
    $a$Marrakech$a$,
    $a$Marrakech$a$,
    $a$وكالة مراكش باب دكالة$a$,
    $a$Agence Marrakech Bab Doukkala$a$,
    $a$Marrakech Bab Doukkala Agency$a$,
    $a$محطة باب دكالة الطرقية، القاعة الرئيسية، مراكش 40000$a$,
    $a$Gare Routière Bab Doukkala, Hall Principal, Marrakech 40000$a$,
    $a$Bab Doukkala Bus Station, Main Hall, Marrakech 40000$a$,
    '+212663889900',
    '+212524437890',
    31.6340000,
    -7.9990000,
    '/images/agencies/marrakech.png',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000004',
    $a$الرباط$a$,
    $a$Rabat$a$,
    $a$Rabat$a$,
    $a$وكالة الرباط القدس$a$,
    $a$Agence Rabat Al Qods$a$,
    $a$Rabat Al Qods Agency$a$,
    $a$المحطة الطرقية الجديدة الرباط، بهو المغادرة، الرباط 10000$a$,
    $a$Nouvelle Gare Routière de Rabat, Hall Départs, Rabat 10000$a$,
    $a$New Rabat Bus Station, Departure Hall, Rabat 10000$a$,
    '+212664123456',
    '+212537692255',
    34.0209000,
    -6.8416000,
    '/images/agencies/rabat.png',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000005',
    $a$العيون$a$,
    $a$Laâyoune$a$,
    $a$Laayoune$a$,
    $a$وكالة العيون المركزية$a$,
    $a$Agence Laâyoune Centrale$a$,
    $a$Laayoune Central Agency$a$,
    $a$شارع مولاي عبد الله، العيون 70000$a$,
    $a$Avenue Mly Abdellah, Laâyoune 70000$a$,
    $a$Mly Abdellah Avenue, Laayoune 70000$a$,
    '+212665778899',
    '+212528894411',
    27.1536000,
    -13.2033000,
    '/images/agencies/laayoune.png',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000006',
    $a$الداخلة$a$,
    $a$Dakhla$a$,
    $a$Dakhla$a$,
    $a$وكالة الداخلة المركزية$a$,
    $a$Agence Dakhla Centre$a$,
    $a$Dakhla Central Agency$a$,
    $a$شارع محمد الخامس، الداخلة 73000$a$,
    $a$Boulevard Mohammed V, Dakhla 73000$a$,
    $a$Mohammed V Boulevard, Dakhla 73000$a$,
    '+212666334455',
    '+212528930000',
    23.6848000,
    -15.9580000,
    '/images/agencies/dakhla.jpg',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000007',
    $a$طنجة$a$,
    $a$Tanger$a$,
    $a$Tangier$a$,
    $a$وكالة طنجة المدينة$a$,
    $a$Agence Tanger Ville$a$,
    $a$Tangier City Agency$a$,
    $a$محطة طنجة الطرقية، شارع محمد الخامس، طنجة 90000$a$,
    $a$Gare Routière de Tanger, Avenue Mohammed V, Tanger 90000$a$,
    $a$Tangier Bus Station, Mohammed V Avenue, Tangier 90000$a$,
    '+212667445566',
    '+212539940000',
    35.7595000,
    -5.8340000,
    '/images/agencies/tanger.jpg',
    true
  ),
  (
    '11111111-1111-4111-8111-000000000008',
    $a$تارودانت$a$,
    $a$Taroudant$a$,
    $a$Taroudant$a$,
    $a$وكالة تارودانت$a$,
    $a$Agence Taroudant$a$,
    $a$Taroudant Agency$a$,
    $a$شارع الحسن الثاني، تارودانت 83000$a$,
    $a$Avenue Hassan II, Taroudant 83000$a$,
    $a$Hassan II Avenue, Taroudant 83000$a$,
    '+212668556677',
    '+212528850000',
    30.4703000,
    -8.8760000,
    '/images/agencies/taroudant.jpg',
    true
  )
on conflict (id) do update
set
  city_ar = excluded.city_ar,
  city_fr = excluded.city_fr,
  city_en = excluded.city_en,
  agency_name_ar = excluded.agency_name_ar,
  agency_name_fr = excluded.agency_name_fr,
  agency_name_en = excluded.agency_name_en,
  address_ar = excluded.address_ar,
  address_fr = excluded.address_fr,
  address_en = excluded.address_en,
  whatsapp_number = excluded.whatsapp_number,
  phone_number = excluded.phone_number,
  lat = excluded.lat,
  lng = excluded.lng,
  image_url = excluded.image_url,
  is_active = excluded.is_active,
  updated_at = now();

-- ============================================================================
-- 2. ROUTES (LIGNES DE TRANSPORT)
-- ----------------------------------------------------------------------------
-- Overnight services intentionally have arrival_time earlier than
-- departure_time (e.g. Agadir -> Dakhla, 06:00 -> 04:00).
-- ============================================================================

insert into public.routes (
  id,
  from_agency_id,
  to_agency_id,
  departure_time,
  arrival_time,
  price_mad,
  bus_type,
  days_of_week,
  is_tourist_route,
  is_active
)
values
  -- Agadir <-> Casablanca
  ('22222222-2222-4222-8222-000000000001', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000002', '06:30', '12:00', 180.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),
  ('22222222-2222-4222-8222-000000000002', '11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-000000000001', '07:00', '12:30', 180.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),

  -- Agadir <-> Marrakech
  ('22222222-2222-4222-8222-000000000003', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000003', '06:00', '09:15', 110.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000004', '11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-000000000001', '10:00', '13:15', 110.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Agadir <-> Laâyoune
  ('22222222-2222-4222-8222-000000000005', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000005', '07:00', '15:30', 240.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000006', '11111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-000000000001', '08:00', '16:30', 240.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Agadir <-> Dakhla (overnight)
  ('22222222-2222-4222-8222-000000000007', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000006', '06:00', '04:00', 450.00, 'VIP', array['MON','WED','FRI','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000008', '11111111-1111-4111-8111-000000000006', '11111111-1111-4111-8111-000000000001', '18:00', '16:00', 450.00, 'VIP', array['TUE','THU','SAT','SUN'], true, true),

  -- Agadir <-> Rabat
  ('22222222-2222-4222-8222-000000000009', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000004', '21:00', '03:45', 210.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),
  ('22222222-2222-4222-8222-000000000010', '11111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-000000000001', '08:00', '14:45', 210.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),

  -- Casablanca <-> Marrakech
  ('22222222-2222-4222-8222-000000000011', '11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-000000000003', '06:00', '09:30', 120.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000012', '11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-000000000002', '15:00', '18:30', 120.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Casablanca <-> Rabat
  ('22222222-2222-4222-8222-000000000013', '11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-000000000004', '07:00', '08:20', 60.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),
  ('22222222-2222-4222-8222-000000000014', '11111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-000000000002', '18:00', '19:20', 60.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),

  -- Casablanca <-> Tanger
  ('22222222-2222-4222-8222-000000000015', '11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-000000000007', '08:00', '12:15', 150.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),
  ('22222222-2222-4222-8222-000000000016', '11111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-000000000002', '14:00', '18:15', 150.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),

  -- Rabat <-> Tanger
  ('22222222-2222-4222-8222-000000000017', '11111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-000000000007', '09:00', '12:00', 120.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),
  ('22222222-2222-4222-8222-000000000018', '11111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-000000000004', '16:00', '19:00', 120.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),

  -- Marrakech <-> Laâyoune
  ('22222222-2222-4222-8222-000000000019', '11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-000000000005', '07:30', '15:45', 260.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000020', '11111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-000000000003', '07:00', '15:15', 260.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Casablanca <-> Dakhla
  ('22222222-2222-4222-8222-000000000021', '11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-000000000006', '05:30', '03:30', 450.00, 'VIP', array['TUE','THU','SAT'], true, true),
  ('22222222-2222-4222-8222-000000000022', '11111111-1111-4111-8111-000000000006', '11111111-1111-4111-8111-000000000002', '06:00', '04:00', 450.00, 'VIP', array['MON','WED','FRI'], true, true),

  -- Agadir <-> Taroudant
  ('22222222-2222-4222-8222-000000000023', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000008', '08:00', '09:15', 40.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),
  ('22222222-2222-4222-8222-000000000024', '11111111-1111-4111-8111-000000000008', '11111111-1111-4111-8111-000000000001', '17:00', '18:15', 40.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], false, true),

  -- Casablanca <-> Laâyoune
  ('22222222-2222-4222-8222-000000000025', '11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-000000000005', '19:00', '08:30', 350.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000026', '11111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-000000000002', '18:00', '07:30', 350.00, 'VIP', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Rabat <-> Marrakech
  ('22222222-2222-4222-8222-000000000027', '11111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-000000000003', '07:00', '10:30', 130.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000028', '11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-000000000004', '16:00', '19:30', 130.00, 'Comfort', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Tanger <-> Marrakech
  ('22222222-2222-4222-8222-000000000029', '11111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-000000000003', '07:00', '14:00', 220.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000030', '11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-000000000007', '08:00', '15:00', 220.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),

  -- Tanger <-> Agadir
  ('22222222-2222-4222-8222-000000000031', '11111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-000000000001', '19:00', '07:30', 380.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true),
  ('22222222-2222-4222-8222-000000000032', '11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-000000000007', '18:30', '07:00', 380.00, 'Premium', array['MON','TUE','WED','THU','FRI','SAT','SUN'], true, true)
on conflict (id) do update
set
  from_agency_id = excluded.from_agency_id,
  to_agency_id = excluded.to_agency_id,
  departure_time = excluded.departure_time,
  arrival_time = excluded.arrival_time,
  price_mad = excluded.price_mad,
  bus_type = excluded.bus_type,
  days_of_week = excluded.days_of_week,
  is_tourist_route = excluded.is_tourist_route,
  is_active = excluded.is_active,
  updated_at = now();

-- ============================================================================
-- 3. PARCEL RATES (IRSALIYAT / COLIS)
-- ============================================================================

insert into public.parcel_rates (
  id,
  category_ar,
  category_fr,
  category_en,
  max_weight_kg,
  base_price_mad,
  description_ar,
  description_fr,
  description_en
)
values
  (
    '33333333-3333-4333-8333-000000000001',
    $a$ظرف$a$,
    $a$Enveloppe$a$,
    $a$Envelope$a$,
    0.50,
    25.00,
    $a$وثائق، ملفات، جوازات سفر ورسائل حتى 500 غرام.$a$,
    $a$Documents, dossiers, passeports et lettres jusqu'à 500 g.$a$,
    $a$Documents, folders, passports and letters up to 500 g.$a$
  ),
  (
    '33333333-3333-4333-8333-000000000002',
    $a$طرد صغير$a$,
    $a$Petit Colis$a$,
    $a$Small Box$a$,
    5.00,
    35.00,
    $a$حقائب صغيرة، ملابس وأجهزة إلكترونية خفيفة من 1 إلى 5 كلغ.$a$,
    $a$Sacs, vêtements et petits appareils électroniques de 1 à 5 kg.$a$,
    $a$Small bags, clothing and light electronics from 1 to 5 kg.$a$
  ),
  (
    '33333333-3333-4333-8333-000000000003',
    $a$صندوق متوسط$a$,
    $a$Carton Moyen$a$,
    $a$Medium Box$a$,
    20.00,
    55.00,
    $a$صناديق التجارة الإلكترونية القياسية من 5 إلى 20 كلغ.$a$,
    $a$Cartons e-commerce standards de 5 à 20 kg.$a$,
    $a$Standard e-commerce boxes from 5 to 20 kg.$a$
  ),
  (
    '33333333-3333-4333-8333-000000000004',
    $a$طرد كبير$a$,
    $a$Grand Colis$a$,
    $a$Large Freight$a$,
    40.00,
    95.00,
    $a$أجهزة تلفاز، أجهزة مطبخ وصناديق كبيرة من 20 إلى 40 كلغ.$a$,
    $a$Téléviseurs, robots de cuisine et grandes malles de 20 à 40 kg.$a$,
    $a$Televisions, kitchen appliances and large trunks from 20 to 40 kg.$a$
  ),
  (
    '33333333-3333-4333-8333-000000000005',
    $a$شحن ومعدات مهنية$a$,
    $a$Fret & Matériel Pro$a$,
    $a$Cargo$a$,
    100.00,
    140.00,
    $a$قطع غيار صناعية، أدوات ومعدات فلاحية حتى 100 كلغ، بأسعار حسب الحجم.$a$,
    $a$Pièces de rechange industrielles, outillage et matériel agricole jusqu'à 100 kg, tarification au volume.$a$,
    $a$Industrial spare parts, tools and agricultural equipment up to 100 kg, volume-based pricing.$a$
  )
on conflict (id) do update
set
  category_ar = excluded.category_ar,
  category_fr = excluded.category_fr,
  category_en = excluded.category_en,
  max_weight_kg = excluded.max_weight_kg,
  base_price_mad = excluded.base_price_mad,
  description_ar = excluded.description_ar,
  description_fr = excluded.description_fr,
  description_en = excluded.description_en,
  updated_at = now();

-- ============================================================================
-- 4. BLOG POSTS
-- ============================================================================

insert into public.blog_posts (
  id,
  slug,
  title_ar,
  title_fr,
  title_en,
  excerpt_ar,
  excerpt_fr,
  excerpt_en,
  content_ar,
  content_fr,
  content_en,
  cover_image_url,
  is_published,
  published_at
)
values
  (
    '44444444-4444-4444-8444-000000000001',
    'slkm-30-ans-transport-maroc',
    $a$إس إل كي إم: أكثر من 30 عاماً في خدمة النقل المغربي$a$,
    $a$SLKM : plus de 30 ans au service du transport marocain$a$,
    $a$SLKM: more than 30 years serving Moroccan transport$a$,
    $a$من نقل مولاي مبارك إلى شبكة وطنية تربط طنجة بالداخلة، رحلة ثلاثين عاماً من الثقة والالتزام.$a$,
    $a$De Naql Moulay Mbarek à un réseau national reliant Tanger à Dakhla, retour sur trois décennies de confiance et d'engagement.$a$,
    $a$From Naql Moulay Mbarek to a national network linking Tangier to Dakhla, three decades of trust and commitment.$a$,
    $body_ar$بدأت الحكاية في سنة 1992 من قلب سوق إنزكان، حيث أطلق مولاي مبارك أولى رحلاته لربط القرى والحواضر بمنطقة سوس. كانت البداية متواضعة، لكن الرؤية كانت واضحة: توفير نقل آمن ومنتظم يليق بسكان الجهة.

اليوم، أصبحت إس إل كي إم شبكة وطنية تمتد من طنجة إلى الداخلة، تجمع بين نقل المسافرين، خدمة إرساليات التوصيل السريع، وحلول النقل المؤسسي. وبقيت القيم نفسها: احترام المواعيد، سلامة الركاب، وخدمة إنسانية قريبة من الناس.$body_ar$,
    $body_fr$L'histoire commence en 1992 au coeur du souk d'Inezgane, lorsque Moulay Mbarek lance ses premières rotations pour relier les villages et les centres urbains du Souss. Les moyens étaient modestes, mais l'ambition était claire : offrir un transport sûr et régulier aux habitants de la région.

Aujourd'hui, SLKM est un réseau national qui s'étend de Tanger à Dakhla. La compagnie réunit le transport de voyageurs, la messagerie express Irsaliyat et les solutions de mobilité pour les entreprises. Les valeurs fondatrices restent intactes : ponctualité, sécurité des passagers et service humain de proximité.$body_fr$,
    $body_en$The story began in 1992 in the heart of the Inezgane market, when Moulay Mbarek launched the first trips connecting villages and urban centres across the Souss region. Resources were modest, but the ambition was clear: provide safe, reliable transport for local families.

Today, SLKM is a national network stretching from Tangier to Dakhla. It brings together passenger travel, Irsaliyat express parcels and corporate mobility solutions. The founding values remain unchanged: punctuality, passenger safety and a genuinely human service.$body_en$,
    '/images/blog/30-ans.jpg',
    true,
    '2026-09-12 09:00:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000002',
    'guide-voyage-agadir-dakhla',
    $a$دليلك للسفر من أكادير إلى الداخلة بالحافلة$a$,
    $a$Guide pratique : voyager d'Agadir à Dakhla en autocar$a$,
    $a$Practical guide: travelling from Agadir to Dakhla by coach$a$,
    $a$المسافة، المحطات، أوقات الراحة ونصائح عملية لرحلة الصحراء الطويلة بين أكادير والداخلة.$a$,
    $a$Distance, étapes, pauses et conseils pratiques pour réussir le long trajet du Sahara entre Agadir et Dakhla.$a$,
    $a$Distance, stops, rest breaks and practical advice for the long Sahara journey between Agadir and Dakhla.$a$,
    $body_ar$تربط رحلة أكادير – الداخلة بين المحيط الأطلسي والصحراء المغربية على مسافة تتجاوز 1,100 كيلومتر. تنطلق الحافلات من محطة إنزكان وتمر عبر تيزنيت، كلميم، طانطان والعيون قبل الوصول إلى الداخلة.

ننصح الركاب بالحضور قبل 45 دقيقة من الانطلاق، وحمل بطاقة الهوية، وطبقة ملابس إضافية للرحلات الليلية. تتوفر فترات توقف منتظمة في محطات معتمدة، مع إمكانية اقتناء المرطبات. احجز مسبقاً عبر واتساب في المواسم السياحية وعطلات نهاية الأسبوع.$body_ar$,
    $body_fr$La liaison Agadir – Dakhla relie l'Atlantique au Sahara marocain sur plus de 1 100 kilomètres. Les autocars partent de la gare d'Inezgane et desservent Tiznit, Guelmim, Tan-Tan et Laâyoune avant d'atteindre Dakhla.

Nous recommandons d'arriver 45 minutes avant le départ, de garder une pièce d'identité à portée de main et de prévoir une couche supplémentaire pour les trajets de nuit. Des pauses régulières sont organisées dans des stations agréées, avec possibilité d'acheter des rafraîchissements. En haute saison et lors des grands week-ends, réservez à l'avance via WhatsApp.$body_fr$,
    $body_en$The Agadir–Dakhla service connects the Atlantic coast to the Moroccan Sahara over more than 1,100 kilometres. Coaches leave Inezgane station and call at Tiznit, Guelmim, Tan-Tan and Laayoune before reaching Dakhla.

We recommend arriving 45 minutes before departure, keeping identification close at hand and packing an extra layer for overnight journeys. Regular breaks are made at approved service stations with refreshments available. In high season and on long weekends, book early through WhatsApp.$body_en$,
    '/images/blog/agadir-dakhla.jpg',
    true,
    '2026-10-04 08:30:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000003',
    'irsaliyat-expedition-colis-24h',
    $a$إرساليات: كيف تصل أماناتكم في أقل من 24 ساعة؟$a$,
    $a$Irsaliyat : comment vos colis arrivent en moins de 24 h$a$,
    $a$Irsaliyat: how your parcels arrive in under 24 hours$a$,
    $a$من الإيداع في الوكالة إلى التسليم عبر الحافلة، تعرف على مسار الأمانة خطوة بخطوة.$a$,
    $a$Du dépôt en agence à la remise au destinataire, découvrez le parcours d'un colis Irsaliyat étape par étape.$a$,
    $a$From agency drop-off to recipient handover, follow an Irsaliyat parcel step by step.$a$,
    $body_ar$تبدأ رحلة الأمانة في شباك إرساليات، حيث يتم وزنها وتسجيلها ومنحها رقم تتبع فريد. توضع الأمانات في صندوق مغلق مخصص داخل الحافلة، بعيداً عن الأمتعة العادية، مما يضمن حمايتها من الصدمات والظروف الجوية.

عند وصول الحافلة إلى المحطة المقصودة، يتلقى المرسل إليه رسالة نصية أو رسالة واتساب. يتم التسليم بعد التحقق من بطاقة التعريف والرمز السري. بالنسبة للتجار، يمكن دفع تكلفة السلعة عند الاستلام (COD) مع تحويل أسبوعي منظم.$body_ar$,
    $body_fr$Le parcours d'un colis commence au guichet Irsaliyat : pesée, enregistrement et attribution d'un numéro de suivi unique. Les colis sont placés dans un compartiment fermé dédié à bord de l'autocar, séparé des bagages classiques, ce qui les protège des chocs et des intempéries.

À l'arrivée de l'autocar, le destinataire reçoit une alerte SMS ou WhatsApp. La remise s'effectue après vérification de la CIN et du code secret. Pour les commerçants, le paiement à la livraison (COD) est encaissé puis reversé chaque semaine avec un récapitulatif détaillé.$body_fr$,
    $body_en$Every parcel starts at the Irsaliyat counter: it is weighed, registered and given a unique tracking number. Parcels travel in a dedicated sealed compartment on the coach, separate from regular luggage, protecting them from impacts and weather.

When the coach arrives, the recipient receives an SMS or WhatsApp alert. Handover takes place after checking ID and the secret code. For retailers, cash on delivery (COD) is collected and paid out weekly with a detailed statement.$body_en$,
    '/images/blog/irsaliyat-24h.jpg',
    true,
    '2026-10-11 10:15:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000004',
    'transport-khddama-zones-industrielles',
    $a$نقل الخدامة: حلول تنقل لعمال المناطق الصناعية$a$,
    $a$Transport Khddama : des navettes fiables pour les zones industrielles$a$,
    $a$Khddama transport: reliable shuttles for industrial zones$a$,
    $a$كيف تنظم إس إل كي إم رحلات 3x8 لفائدة المصانع والشركات في سوس ماسة والدار البيضاء؟$a$,
    $a$Comment SLKM organise les rotations 3x8 des usines et entreprises du Souss-Massa et de Casablanca.$a$,
    $a$How SLKM organises 3x8 shift rotations for factories and businesses in Souss-Massa and Casablanca.$a$,
    $body_ar$تعتمد الشركات الصناعية على انتظام النقل لضمان استمرارية الإنتاج. توفر إس إل كي إم أسطولاً مخصصاً لنقل العمال بمواعيد دقيقة، مع مسارات تجميع مدروسة تغطي المناطق الصناعية والمراكز السكنية.

يشمل العرض تتبع الرحلات، تقارير الحضور، وصيانة وقائية للحافلات، إضافة إلى سائقين مدربين على احترام معايير السلامة. يمكن للشركات طلب دراسة مخصصة عبر نموذج طلب عرض السعر، ويتم الرد خلال 24 ساعة عمل.$body_ar$,
    $body_fr$Les sites industriels dépendent d'un transport régulier pour garantir la continuité de production. SLKM met à disposition une flotte dédiée aux salariés, avec des horaires calibrés et des tournées de ramassage couvrant les zones industrielles et les bassins résidentiels.

L'offre inclut le suivi des rotations, des rapports de présence, la maintenance préventive des autocars et des conducteurs formés aux standards de sécurité. Les entreprises peuvent demander une étude sur mesure via le formulaire de devis B2B, avec une réponse sous 24 heures ouvrées.$body_fr$,
    $body_en$Industrial sites depend on reliable transport to keep production running. SLKM provides a dedicated employee fleet with precise schedules and carefully planned pick-up routes covering industrial zones and residential areas.

The service includes trip monitoring, attendance reports, preventive coach maintenance and drivers trained to safety standards. Companies can request a tailored study through the B2B quote form, with a response within 24 working hours.$body_en$,
    '/images/blog/khddama.jpg',
    true,
    '2026-09-22 14:00:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000005',
    'nouvelle-flotte-scania-irizar-euro6',
    $a$أسطول جديد: حافلات سكانيا إيرزار بمعايير يورو 6$a$,
    $a$Nouvelle flotte : des autocars Scania Irizar Euro 6$a$,
    $a$New fleet: Scania Irizar coaches meeting Euro 6 standards$a$,
    $a$مقاعد مريحة، واي فاي، ومنافذ شحن فردية: تعرف على تجهيزات الحافلات الجديدة.$a$,
    $a$Sièges ergonomiques, Wi-Fi et prises USB individuelles : découvrez les équipements des nouveaux autocars.$a$,
    $a$Ergonomic seats, Wi-Fi and individual USB ports: discover the equipment on the new coaches.$a$,
    $body_ar$عززت إس إل كي إم أسطولها بوحدات سكانيا إيرزار المطابقة لمعايير يورو 6، بهدف تقليل الانبعاثات وتحسين راحة المسافرين على الرحلات الطويلة. تتميز الحافلات بمقاعد قابلة للإمالة، تكييف ثنائي المناطق، وإضاءة داخلية مريحة.

كل مقعد مزود بمنفذ شحن، وتتوفر خدمة الواي فاي على المحاور الرئيسية. يخضع الأسطول لبرنامج صيانة وقائية صارم قبل كل رحلة، مع فحص الإطارات والفرامل وأنظمة السلامة.$body_ar$,
    $body_fr$SLKM a renforcé sa flotte avec des unités Scania Irizar conformes à la norme Euro 6, afin de réduire les émissions et d'améliorer le confort sur les longues distances. Les autocars disposent de sièges inclinables, d'une climatisation bizone et d'un éclairage intérieur étudié.

Chaque siège est équipé d'une prise de recharge et le Wi-Fi est disponible sur les axes principaux. La flotte suit un programme de maintenance préventive rigoureux avant chaque rotation, avec contrôle des pneumatiques, du freinage et des systèmes de sécurité.$body_fr$,
    $body_en$SLKM has strengthened its fleet with Scania Irizar units meeting Euro 6 standards, reducing emissions and improving long-distance comfort. The coaches feature reclining seats, two-zone air conditioning and carefully designed interior lighting.

Every seat has a charging port, and Wi-Fi is available on main corridors. The fleet follows a strict preventive maintenance programme before each trip, including checks on tyres, braking and safety systems.$body_en$,
    '/images/blog/flotte-euro6.jpg',
    true,
    '2026-08-30 11:00:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000006',
    'decouvrir-laayoune-dakhla-tourisme',
    $a$اكتشف العيون والداخلة: وجهات الصحراء المغربية$a$,
    $a$Découvrir Laâyoune et Dakhla : les perles du Sahara marocain$a$,
    $a$Discover Laayoune and Dakhla: jewels of the Moroccan Sahara$a$,
    $a$شواطئ، ثقافة صحراوية وأفق لا ينتهي: أفكار لرحلة سياحية عبر Provinces du Sud.$a$,
    $a$Plages, culture sahraouie et horizons infinis : nos idées pour un séjour dans les Provinces du Sud.$a$,
    $a$Beaches, Saharan culture and endless horizons: ideas for a trip through the southern provinces.$a$,
    $body_ar$تجمع العيون بين أصالة الصحراء والحياة الحضرية، بينما تشتهر الداخلة بشواطئها المفتوحة على المحيط وأنشطتها الرياضية. يمكن الوصول إلى المدينتين عبر رحلات يومية من أكادير ومراكش والدار البيضاء.

ننصح بالتنقل مع مرشد محلي لاكتشاف المواقع الطبيعية والتراثية، واحترام تقاليد المنطقة. رحلات إس إل كي إم السياحية توفر وسائل نقل مريحة مع إمكانية تنظيم مجموعات ومحطات توقف حسب برنامج الزيارة.$body_ar$,
    $body_fr$Laâyoune allie l'authenticité saharienne à la vie urbaine, tandis que Dakhla est réputée pour ses plages ouvertes sur l'océan et ses activités nautiques. Les deux villes sont desservies par des départs quotidiens depuis Agadir, Marrakech et Casablanca.

Nous conseillons de voyager avec un guide local pour découvrir les sites naturels et patrimoniaux, dans le respect des traditions de la région. Les circuits touristiques SLKM proposent des autocars confortables et peuvent organiser des groupes avec des arrêts adaptés au programme de visite.$body_fr$,
    $body_en$Laayoune combines Saharan authenticity with city life, while Dakhla is known for its ocean-facing beaches and water sports. Both cities are served by daily departures from Agadir, Marrakech and Casablanca.

We recommend travelling with a local guide to discover natural and heritage sites while respecting regional traditions. SLKM tourist circuits offer comfortable coaches and can arrange groups with stops tailored to the visit programme.$body_en$,
    '/images/blog/sahara-tourisme.jpg',
    true,
    '2026-10-19 09:45:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000007',
    'conseils-voyager-ramadan',
    $a$نصائح للسفر خلال شهر رمضان$a$,
    $a$Conseils pour voyager pendant le Ramadan$a$,
    $a$Tips for travelling during Ramadan$a$,
    $a$كيف تجعل رحلتك في رمضان مريحة ومنظمة، من الحجز إلى مواعيد الإفطار.$a$,
    $a$Comment rendre votre voyage de Ramadan confortable et bien organisé, de la réservation aux horaires d'iftar.$a$,
    $a$How to make your Ramadan journey comfortable and well organised, from booking to iftar times.$a$,
    $body_ar$تشهد الرحلات خلال رمضان إقبالاً كبيراً، خاصة في الأيام الأخيرة قبل العيد. ننصح بالحجز المبكر وتأكيد المقعد عبر واتساب، مع مراعاة مواعيد الإفطار عند اختيار وقت الانطلاق.

توفر الحافلات فترات توقف منتظمة، ويحرص الطاقم على تنظيم الإفطار الخفيف للمسافرين عند الحاجة. يُستحسن حمل ماء كافٍ وأدوية شخصية، والوصول إلى المحطة قبل الموعد المحدد لتفادي الازدحام.$body_ar$,
    $body_fr$Les voyages pendant le Ramadan connaissent une forte affluence, surtout à l'approche de l'Aïd. Nous recommandons de réserver tôt et de confirmer sa place via WhatsApp, en tenant compte de l'heure de l'iftar pour choisir le départ.

Les autocars observent des pauses régulières et l'équipe organise si nécessaire une collation légère pour les voyageurs. Prévoyez suffisamment d'eau et vos médicaments personnels, et arrivez à la gare avant l'heure afin d'éviter les files d'attente.$body_fr$,
    $body_en$Ramadan travel is particularly busy, especially in the final days before Eid. We recommend booking early and confirming your seat via WhatsApp, while considering iftar time when choosing a departure.

Coaches make regular breaks and the team can arrange a light snack for travellers when needed. Carry enough water and personal medication, and arrive at the station ahead of time to avoid queues.$body_en$,
    '/images/blog/conseils-ramadan.jpg',
    true,
    '2026-09-28 07:30:00+00'
  ),
  (
    '44444444-4444-4444-8444-000000000008',
    'securite-routiere-longues-distances',
    $a$السلامة الطرقية على المسافات الطويلة$a$,
    $a$Sécurité routière sur les longues distances$a$,
    $a$Road safety on long-distance journeys$a$,
    $a$سائقان، فحص تقني وراحة إلزامية: هكذا تضمن إس إل كي إم سلامة رحلاتها.$a$,
    $a$Double équipage, contrôle technique et pauses obligatoires : comment SLKM garantit la sécurité de ses trajets.$a$,
    $a$Dual crews, technical checks and mandatory breaks: how SLKM keeps long journeys safe.$a$,
    $body_ar$تعتمد السلامة على المسافات الطويلة على التخطيط الدقيق. بالنسبة للرحلات التي تتجاوز 450 كيلومتراً، يتم توفير سائقين اثنين لضمان التركيز وتناوب القيادة، مع احترام فترات الراحة القانونية.

تخضع كل حافلة لفحص تقني شامل قبل الانطلاق، ويتم تتبعها عبر نظام تحديد المواقع. كما يتم تدريب السائقين على القيادة الوقائية والتعامل مع الظروف الجوية الصعبة، مثل الضباب والرياح الرملية في المناطق الصحراوية.$body_ar$,
    $body_fr$La sécurité sur longue distance repose sur une préparation rigoureuse. Pour les trajets dépassant 450 kilomètres, deux conducteurs sont mobilisés afin de garantir la vigilance et l'alternance de conduite, dans le respect des temps de repos réglementaires.

Chaque autocar passe un contrôle technique complet avant le départ et est suivi par GPS. Les conducteurs sont formés à l'éco-conduite et à la gestion des conditions difficiles, notamment le brouillard et les vents de sable dans les zones sahariennes.$body_fr$,
    $body_en$Long-distance safety depends on careful preparation. On journeys over 450 kilometres, two drivers are assigned to maintain alertness and share driving time, in line with mandatory rest periods.

Every coach undergoes a full technical inspection before departure and is tracked by GPS. Drivers are trained in defensive driving and in handling difficult conditions, including fog and sandstorms in desert areas.$body_en$,
    '/images/blog/securite-routiere.jpg',
    true,
    '2026-10-24 12:00:00+00'
  )
on conflict (slug) do update
set
  title_ar = excluded.title_ar,
  title_fr = excluded.title_fr,
  title_en = excluded.title_en,
  excerpt_ar = excluded.excerpt_ar,
  excerpt_fr = excluded.excerpt_fr,
  excerpt_en = excluded.excerpt_en,
  content_ar = excluded.content_ar,
  content_fr = excluded.content_fr,
  content_en = excluded.content_en,
  cover_image_url = excluded.cover_image_url,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  updated_at = now();

-- ============================================================================
-- 5. SITE SETTINGS (SINGLETON)
-- ============================================================================

insert into public.site_settings (
  id,
  site_name_ar,
  site_name_fr,
  site_name_en,
  default_locale,
  support_phone,
  emergency_phone,
  emergency_lines,
  whatsapp_number,
  contact_email,
  address_ar,
  address_fr,
  address_en,
  social_links,
  analytics_config
)
values (
  1,
  $a$نقل مولاي مبارك - إس إل كي إم$a$,
  $a$SLKM - Naql Moulay Mbarek$a$,
  $a$SLKM - Naql Moulay Mbarek$a$,
  'fr',
  '+212528840000',
  '+212661001122',
  '[
    {"label_ar":"غرفة العمليات المركزية 24/7","label_fr":"Dispatch central 24/7","label_en":"Central dispatch 24/7","phone":"+212661001122"},
    {"label_ar":"خدمة إرساليات والأمانات","label_fr":"Service Irsaliyat & fret","label_en":"Irsaliyat & freight desk","phone":"+212662445566"},
    {"label_ar":"النقل المؤسسي والعروض B2B","label_fr":"Transport B2B & Khddama","label_en":"B2B & Khddama transport","phone":"+212663889900"}
  ]'::jsonb,
  '+212661001122',
  'contact@slkm.ma',
  $a$المحطة الطرقية المركزية إنزكان، أكادير، المغرب$a$,
  $a$Gare Routière Centrale d'Inezgane, Agadir, Maroc$a$,
  $a$Inezgane Central Bus Station, Agadir, Morocco$a$,
  '{
    "facebook":"https://facebook.com/slkm.ma",
    "instagram":"https://instagram.com/slkm.ma",
    "linkedin":"https://linkedin.com/company/slkm-ma",
    "youtube":"https://youtube.com/@slkm-ma",
    "tiktok":"https://tiktok.com/@slkm.ma"
  }'::jsonb,
  $json${
    "stats": [
      {"key":"years","value":"30+","label_fr":"Années d'expérience","label_ar":"عاماً من الخبرة","label_en":"Years of experience"},
      {"key":"agencies","value":"48","label_fr":"Comptoirs & agences","label_ar":"وكالة وشباك","label_en":"Agencies & counters"},
      {"key":"travellers","value":"2.5M","label_fr":"Voyageurs par an","label_ar":"مسافر سنوياً","label_en":"Travellers per year"},
      {"key":"kilometres","value":"12M","label_fr":"Kilomètres parcourus","label_ar":"كيلومتر مقطوع سنوياً","label_en":"Kilometres driven"}
    ],
    "fleet": [
      {
        "name":"Scania Irizar i6S",
        "category":"VIP",
        "capacity":"49 places",
        "image_url":"/images/fleet/vip.jpg",
        "features_fr":["Sièges cuir inclinables","Wi-Fi & prises USB","Climatisation individuelle"],
        "features_ar":["مقاعد جلدية قابلة للإمالة","واي فاي ومنافذ USB","تكييف فردي"],
        "features_en":["Reclining leather seats","Wi-Fi & USB charging","Individual air conditioning"]
      },
      {
        "name":"Irizar i6",
        "category":"Premium",
        "capacity":"53 places",
        "image_url":"/images/fleet/premium.jpg",
        "features_fr":["Grande garde au sol","Écrans individuels","Toit panoramique"],
        "features_ar":["مساحة أرجل واسعة","شاشات فردية","سقف بانورامي"],
        "features_en":["Generous legroom","Individual screens","Panoramic roof"]
      },
      {
        "name":"Scania Touring",
        "category":"Confort",
        "capacity":"55 places",
        "image_url":"/images/fleet/comfort.jpg",
        "features_fr":["Suspension renforcée","Soute à bagages 12 m³","Sièges ergonomiques"],
        "features_ar":["تعليق معزز","صندوق أمتعة 12 م³","مقاعد مريحة"],
        "features_en":["Reinforced suspension","12 m³ luggage hold","Ergonomic seating"]
      }
    ],
    "timeline": [
      {
        "year":"1992",
        "title_fr":"Fondation à Inezgane",
        "title_ar":"التأسيس في إنزكان",
        "title_en":"Founded in Inezgane",
        "description_fr":"Moulay Mbarek lance les premières rotations entre les villages du Souss et le grand marché d'Inezgane.",
        "description_ar":"أطلق مولاي مبارك أولى الرحلات بين قرى سوس وسوق إنزكان الكبير.",
        "description_en":"Moulay Mbarek launches the first rotations between Souss villages and the Inezgane market.",
        "image_url":"/images/timeline/1992.jpg"
      },
      {
        "year":"2004",
        "title_fr":"Expansion vers le Nord",
        "title_ar":"التوسع نحو الشمال",
        "title_en":"Expansion to the North",
        "description_fr":"Ouverture des lignes quotidiennes vers Casablanca, Marrakech et Rabat avec une flotte renforcée.",
        "description_ar":"افتتاح خطوط يومية نحو الدار البيضاء ومراكش والرباط مع تعزيز الأسطول.",
        "description_en":"Daily services open to Casablanca, Marrakech and Rabat with a larger fleet.",
        "image_url":"/images/timeline/2004.jpg"
      },
      {
        "year":"2015",
        "title_fr":"Lancement d'Irsaliyat",
        "title_ar":"إطلاق خدمة إرساليات",
        "title_en":"Irsaliyat is launched",
        "description_fr":"Création du pôle messagerie express pour les coopératives agricoles, commerçants et e-commerçants.",
        "description_ar":"إنشاء قطب التوصيل السريع لفائدة التعاونيات الفلاحية والتجار وبائعي الإنترنت.",
        "description_en":"An express parcel division is created for farms, retailers and online sellers.",
        "image_url":"/images/timeline/2015.jpg"
      },
      {
        "year":"2021",
        "title_fr":"Flotte Euro 6 & digitalisation",
        "title_ar":"أسطول يورو 6 والتحول الرقمي",
        "title_en":"Euro 6 fleet & digitalisation",
        "description_fr":"Arrivée des autocars Scania Irizar Euro 6, du suivi GPS et de la réservation WhatsApp centralisée.",
        "description_ar":"وصول حافلات سكانيا إيرزار يورو 6، وتتبع GPS، والحجز المركزي عبر واتساب.",
        "description_en":"Scania Irizar Euro 6 coaches arrive alongside GPS tracking and centralised WhatsApp booking.",
        "image_url":"/images/timeline/2021.jpg"
      },
      {
        "year":"2026",
        "title_fr":"Corridor Tanger – Dakhla",
        "title_ar":"ممر طنجة – الداخلة",
        "title_en":"Tangier – Dakhla corridor",
        "description_fr":"Un réseau unifié de 48 comptoirs relie le Nord, le Souss et les provinces sahariennes.",
        "description_ar":"شبكة موحدة من 48 شباكاً تربط الشمال وسوس والأقاليم الصحراوية.",
        "description_en":"A unified network of 48 counters links the North, Souss and southern provinces.",
        "image_url":"/images/timeline/2026.jpg"
      }
    ]
  }$json$::jsonb
)
on conflict (id) do update
set
  site_name_ar = excluded.site_name_ar,
  site_name_fr = excluded.site_name_fr,
  site_name_en = excluded.site_name_en,
  default_locale = excluded.default_locale,
  support_phone = excluded.support_phone,
  emergency_phone = excluded.emergency_phone,
  emergency_lines = excluded.emergency_lines,
  whatsapp_number = excluded.whatsapp_number,
  contact_email = excluded.contact_email,
  address_ar = excluded.address_ar,
  address_fr = excluded.address_fr,
  address_en = excluded.address_en,
  social_links = excluded.social_links,
  analytics_config = excluded.analytics_config,
  updated_at = now();

-- ============================================================================
-- 6. CORPORATE QUOTES (representative admin-dashboard data)
-- ----------------------------------------------------------------------------
-- Fictitious but realistic B2B requests so the admin UI has data before real
-- leads arrive. Remove this block if production must start with an empty inbox.
-- ============================================================================

insert into public.corporate_quotes (
  id,
  company_name,
  contact_person,
  phone,
  email,
  service_type,
  passenger_count,
  origin_city,
  destination_city,
  details,
  status,
  created_at
)
values
  (
    '55555555-5555-4555-8555-000000000001',
    $a$Atlas Agro Export$a$,
    $a$Yassine El Amrani$a$,
    '+212661200101',
    'yassine@atlasagro.ma',
    'personnel',
    85,
    $a$Agadir$a$,
    $a$Aït Melloul$a$,
    $a$Navette 3x8 du lundi au samedi, départ Inezgane 05h00, retour usine 18h30.$a$,
    'quoted',
    '2026-10-24 09:15:00+00'
  ),
  (
    '55555555-5555-4555-8555-000000000002',
    $a$Souss Call Center$a$,
    $a$Salma Bennani$a$,
    '+212662300202',
    'salma@sousscall.ma',
    'personnel',
    42,
    $a$Agadir$a$,
    $a$Casablanca$a$,
    $a$Transport mensuel pour séminaire, aller le 12 novembre et retour le 14 novembre.$a$,
    'contacted',
    '2026-10-25 11:40:00+00'
  ),
  (
    '55555555-5555-4555-8555-000000000003',
    $a$Marrakech Events & DMC$a$,
    $a$Omar Berrada$a$,
    '+212663400303',
    'operations@marrakechevents.ma',
    'tourisme',
    120,
    $a$Marrakech$a$,
    $a$Ouarzazate$a$,
    $a$Circuit 3 jours pour un groupe international, guides et pauses photo inclus.$a$,
    'confirmed',
    '2026-10-26 15:20:00+00'
  ),
  (
    '55555555-5555-4555-8555-000000000004',
    $a$Chtouka Packaging$a$,
    $a$Nadia Ait Said$a$,
    '+212664500404',
    'rh@chtoukapack.ma',
    'personnel',
    56,
    $a$Chtouka-Aït Baha$a$,
    $a$Agadir Port$a$,
    $a$Navette quotidienne pour deux équipes, besoin d'un bus 60 places climatisé.$a$,
    'pending',
    '2026-10-27 08:05:00+00'
  )
on conflict (id) do update
set
  company_name = excluded.company_name,
  contact_person = excluded.contact_person,
  phone = excluded.phone,
  email = excluded.email,
  service_type = excluded.service_type,
  passenger_count = excluded.passenger_count,
  origin_city = excluded.origin_city,
  destination_city = excluded.destination_city,
  details = excluded.details,
  status = excluded.status,
  updated_at = now();

-- ============================================================================
-- 7. REFRESH POSTGREST SCHEMA CACHE
-- ============================================================================

notify pgrst, 'reload schema';

commit;
