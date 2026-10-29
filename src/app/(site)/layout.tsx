import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/queries";
import { pick } from "@/lib/utils";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, locale] = await Promise.all([getSiteSettings(), getLocale()]);
  const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        locale={locale}
        siteName={siteName}
        phone={settings?.support_phone ?? null}
        whatsapp={settings?.whatsapp_number ?? null}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} locale={locale} />
    </div>
  );
}
