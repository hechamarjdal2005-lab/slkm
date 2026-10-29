import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/queries";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { pick } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Espace admin",
  description: "Gestion des agences, lignes, tarifs, devis et articles SLKM.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [locale, settings] = await Promise.all([getLocale(), getSiteSettings()]);
  const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";
  let userEmail: string | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      userEmail = data.user?.email ?? null;
    } catch {
      userEmail = null;
    }
  }

  return (
    <AdminShell userEmail={userEmail} locale={locale} siteName={siteName}>
      {children}
    </AdminShell>
  );
}
