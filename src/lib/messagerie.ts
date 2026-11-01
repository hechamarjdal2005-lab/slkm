import { cache } from "react";
import { createClient } from "./supabase/server";
import { getSupabaseEnv } from "./supabase/env";
import type { Agency } from "./types";

export interface MessagerieSettings {
  id: number; title_fr: string; title_ar: string; title_en: string;
  description_fr: string; description_ar: string; description_en: string;
  map_image_url: string | null; is_active: boolean;
}
export interface MessagerieAgency {
  image_url?: string | null; lat?: number | null; lng?: number | null;
  agents?: Array<{ name: string; role_fr: string; role_ar: string; role_en: string; phone: string; email: string; is_active?: boolean }>;
  id: string; agency_id: string | null; agency: Agency | null;
  name_fr: string | null; name_ar: string | null; name_en: string | null;
  city_fr: string | null; city_ar: string | null; city_en: string | null;
  address_fr: string | null; address_ar: string | null; address_en: string | null;
  phone: string | null; whatsapp: string | null;
  opening_hours_fr: string | null; opening_hours_ar: string | null; opening_hours_en: string | null;
  is_active: boolean; display_order: number;
}
export const getMessagerieNetwork = cache(async (admin = false) => {
  const empty = { settings: null as MessagerieSettings | null, agencies: [] as MessagerieAgency[], error: false };
  if (!getSupabaseEnv()) return { ...empty, error: true };
  try {
    const client = await createClient();
    if (admin) {
      const { data: { user } } = await client.auth.getUser();
      if (!user || user.app_metadata?.role !== "admin") return { ...empty, error: true };
    }
    let settingsQuery = client.from("messagerie_network_settings").select("*").eq("id", 1);
    let agencyQuery = client.from("messagerie_agencies").select("*, agency:agencies(*)").order("display_order").order("id");
    if (!admin) { settingsQuery = settingsQuery.eq("is_active", true); agencyQuery = agencyQuery.eq("is_active", true); }
    const [settings, agencies] = await Promise.all([settingsQuery.maybeSingle(), agencyQuery]);
    if (settings.error || agencies.error) return { ...empty, error: true };
    const rows = (agencies.data ?? []) as MessagerieAgency[];
    return { settings: settings.data as MessagerieSettings | null, agencies: admin ? rows : rows.filter(a => !a.agency_id || a.agency?.is_active), error: false };
  } catch { return { ...empty, error: true }; }
});
