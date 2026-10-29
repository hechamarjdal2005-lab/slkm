export type Locale = "fr" | "ar" | "en";

export interface Agency {
  id: string;
  city_ar: string;
  city_fr: string;
  city_en: string;
  agency_name_ar: string;
  agency_name_fr: string;
  agency_name_en: string;
  address_ar: string;
  address_fr: string;
  address_en: string;
  whatsapp_number: string | null;
  phone_number: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  from_agency_id: string;
  to_agency_id: string;
  departure_time: string;
  arrival_time: string;
  price_mad: number;
  bus_type: "Comfort" | "Premium" | "VIP";
  days_of_week: string[];
  is_tourist_route: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteWithAgencies extends Route {
  from_agency: Agency | null;
  to_agency: Agency | null;
}

export interface ParcelRate {
  id: string;
  category_ar: string;
  category_fr: string;
  category_en: string;
  max_weight_kg: number;
  base_price_mad: number;
  description_ar: string | null;
  description_fr: string | null;
  description_en: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title_ar: string;
  title_fr: string;
  title_en: string;
  excerpt_ar: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  content_ar: string;
  content_fr: string;
  content_en: string;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorporateQuote {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  service_type: "personnel" | "tourisme";
  passenger_count: number;
  origin_city: string;
  destination_city: string;
  details: string | null;
  status: "pending" | "contacted" | "quoted" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
  updated_at: string;
}

export interface EmergencyLine {
  label_ar: string;
  label_fr: string;
  label_en: string;
  phone: string;
}

export interface SiteStat {
  key: string;
  value: string;
  label_fr: string;
  label_ar: string;
  label_en: string;
}

export interface FleetVehicle {
  name: string;
  category: string;
  capacity: string;
  image_url: string;
  features_fr: string[];
  features_ar: string[];
  features_en: string[];
}

export interface TimelineItem {
  year: string;
  title_fr: string;
  title_ar: string;
  title_en: string;
  description_fr: string;
  description_ar: string;
  description_en: string;
  image_url: string;
}

export interface SiteConfig {
  stats?: SiteStat[];
  fleet?: FleetVehicle[];
  timeline?: TimelineItem[];
}

export interface SiteSettings {
  id: number;
  site_name_ar: string | null;
  site_name_fr: string | null;
  site_name_en: string | null;
  default_locale: Locale;
  support_phone: string | null;
  emergency_phone: string | null;
  emergency_lines: EmergencyLine[];
  whatsapp_number: string | null;
  contact_email: string | null;
  address_ar: string | null;
  address_fr: string | null;
  address_en: string | null;
  social_links: Record<string, string>;
  analytics_config: SiteConfig;
  created_at: string;
  updated_at: string;
}
