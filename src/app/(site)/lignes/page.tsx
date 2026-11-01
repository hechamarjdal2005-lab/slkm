import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import type { Metadata } from "next";
import { TransportNetworkExplorer } from "@/components/transport-network-explorer";
import { getLocale } from "@/lib/locale";
import { getAgencies, getRoutes, getSiteSettings } from "@/lib/queries";
import { pick } from "@/lib/utils";
export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("lignes", { "title": "Lignes & agences", "description": "Liaisons géographiques indicatives : elles ne représentent pas les routes routières. Seules les agences avec coordonnées sont localisées." }); }
export default async function LignesPage({ searchParams }: {
    searchParams: Promise<{
        from?: string;
        to?: string;
        date?: string;
        class?: string;
    }>;
}) {
    const locale = await getLocale();
    const cms = await getPageCMS("lignes");
    const ct = createTranslator(cms, locale);
    const params = await searchParams;
    const [settings, agencies, routes] = await Promise.all([getSiteSettings(), getAgencies(), getRoutes()]);
    return <CmsPage cms={cms}><CmsBuiltin sectionKey="network"><div className="container-page pb-16 pt-8 sm:pt-10"><div className="mb-7"><p className="section-kicker">SLKM · {ct("text_a692bb103ab3", "Le réseau", "الشبكة", "The network")}</p><h1 className="mt-3 text-[clamp(1.65rem,3.2vw,2.4rem)] font-extrabold tracking-tight text-primary-dark">{ct("text_57cce3ffe3ad", "Votre prochaine destination", "وجهتكم القادمة", "Your next destination")}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{ct("text_afdb2ecbcf0b", "Explorez la carte, comparez les trajets et retrouvez votre agence.", "استكشفوا الخريطة وقارنوا الرحلات واعثروا على وكالتكم.", "Explore the map, compare journeys and find your agency.")}</p></div><TransportNetworkExplorer routes={routes} agencies={agencies} locale={locale} whatsapp={settings?.whatsapp_number ?? null} initialFrom={params.from} initialTo={params.to} initialDate={params.date} initialClass={params.class} showAgencies/></div></CmsBuiltin></CmsPage>;
}
