import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/lib/locale";
import { getAgencies, getSiteSettings } from "@/lib/queries";
import { pick } from "@/lib/utils";
import { presentation, themeStyle } from "@/lib/cms";
import { getPublicCMS } from "@/lib/cms-store";
import { PublicContentProvider } from "@/components/cms-provider";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, locale, agencies, cms] = await Promise.all([getSiteSettings(), getLocale(), getAgencies(), getPublicCMS()]);
  const theme = presentation(settings?.presentation);
  const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";

  return (
    <PublicContentProvider pages={cms.pages}><div className="public-site flex min-h-screen flex-col" style={themeStyle(theme)} data-density={theme.layout}>
      <a href="#main-content" className="skip-link">{locale === "ar" ? "انتقل إلى المحتوى" : locale === "en" ? "Skip to content" : "Aller au contenu"}</a>
      <SiteHeader
        locale={locale}
        siteName={siteName}
        phone={settings?.support_phone ?? null}
        whatsapp={settings?.whatsapp_number ?? null}
        theme={theme}
        navigation={settings?.navigation}
      />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">{children}</main>
      <SiteFooter settings={settings} locale={locale} agencies={agencies} />
    </div></PublicContentProvider>
  );
}
