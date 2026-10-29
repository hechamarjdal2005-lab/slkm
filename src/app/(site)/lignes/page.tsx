import type { Metadata } from "next";
import { Bus, CheckCircle2, Clock3, MapPin, ShieldCheck, Ticket } from "lucide-react";
import { AgencyCard } from "@/components/agency-card";
import { AgencyMap } from "@/components/agency-map";
import { LinesExplorer } from "@/components/lines-explorer";
import { EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getAgencies, getRoutes, getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Lignes & agences",
  description: "Consultez les lignes interurbaines, horaires, tarifs et agences SLKM au Maroc.",
};

export default async function LignesPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const locale = await getLocale();
  const params = await searchParams;
  const [settings, agencies, routes] = await Promise.all([getSiteSettings(), getAgencies(), getRoutes()]);
  const whatsapp = settings?.whatsapp_number ?? null;

  return (
    <>
      <PageHero
        image="/images/hero-about.jpg"
        eyebrow={locale === "ar" ? "الخطوط والوكالات" : locale === "en" ? "Routes & agencies" : "Lignes & agences"}
        title={locale === "ar" ? "وجهتكم التالية على بعد رحلة واحدة" : locale === "en" ? "Your next destination is one journey away" : "Votre prochaine destination est à un trajet"}
        description={
          locale === "ar"
            ? "استعرضوا الخطوط النشطة، قارنوا الفئات والأسعار، ثم احجزوا مباشرة عبر واتساب."
            : locale === "en"
              ? "Browse active routes, compare classes and fares, then book directly on WhatsApp."
              : "Parcourez les lignes actives, comparez les classes et les tarifs, puis réservez directement sur WhatsApp."
        }
      >
        <div className="flex flex-wrap gap-3 text-xs font-semibold text-white/75">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <Bus className="h-3.5 w-3.5" />
            {routes.length} {locale === "ar" ? "خط" : locale === "en" ? "routes" : "lignes"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {agencies.length} {locale === "ar" ? "وكالة" : locale === "en" ? "agencies" : "agences"}
          </span>
        </div>
      </PageHero>

      <section className="container-page py-14 sm:py-16">
        {routes.length ? (
          <LinesExplorer
            routes={routes}
            agencies={agencies}
            locale={locale}
            whatsapp={whatsapp}
            initialFrom={params.from}
            initialTo={params.to}
          />
        ) : (
          <EmptyState
            title={locale === "ar" ? "لا توجد خطوط منشورة" : locale === "en" ? "No published routes" : "Aucune ligne publiée"}
            description={locale === "ar" ? "أضف الخطوط والوكالات من لوحة الإدارة لعرضها هنا." : locale === "en" ? "Add routes and agencies from the admin dashboard to display them here." : "Ajoutez des lignes et des agences depuis l'espace admin pour les afficher ici."}
            action={{ href: "/admin?tab=routes", label: locale === "ar" ? "إدارة الخطوط" : locale === "en" ? "Manage routes" : "Gérer les lignes" }}
          />
        )}
      </section>

      <section className="border-y border-line bg-white py-14 sm:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow={locale === "ar" ? "وكالاتنا" : locale === "en" ? "Our agencies" : "Nos agences"}
            title={locale === "ar" ? "قريبون منكم، في كل محطة" : locale === "en" ? "Close to you, at every stop" : "Proches de vous, à chaque étape"}
            description={
              locale === "ar"
                ? "كل وكالة تضم شبابيك بيع، معلومات، واستقبال الأمانات. اتصلوا أو راسلونا على واتساب."
                : locale === "en"
                  ? "Each agency offers ticket counters, information and parcel drop-off. Call or message us on WhatsApp."
                  : "Chaque agence propose la billetterie, l'information et le dépôt de colis. Appelez ou écrivez-nous sur WhatsApp."
            }
          />
          {agencies.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {agencies.map((agency) => (
                <AgencyCard key={agency.id} agency={agency} locale={locale} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={locale === "ar" ? "لا توجد وكالات نشطة" : locale === "en" ? "No active agencies" : "Aucune agence active"}
              description={locale === "ar" ? "أضف الوكالات من لوحة الإدارة." : locale === "en" ? "Add agencies from the admin dashboard." : "Ajoutez des agences depuis l'espace admin."}
              action={{ href: "/admin?tab=agencies", label: locale === "ar" ? "إدارة الوكالات" : locale === "en" ? "Manage agencies" : "Gérer les agences" }}
            />
          )}
        </div>
      </section>

      <section className="container-page py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "الخريطة" : locale === "en" ? "Map" : "Carte"}
              title={locale === "ar" ? "شبكة تغطي المغرب" : locale === "en" ? "A network across Morocco" : "Un réseau qui couvre le Maroc"}
              description={
                locale === "ar"
                  ? "انقروا على أي نقطة لعرض عنوان الوكالة، رقم الهاتف والخطوط المرتبطة بها."
                  : locale === "en"
                    ? "Click any pin to see the agency address, phone number and available routes."
                    : "Cliquez sur une épingle pour afficher l'adresse, le téléphone et les lignes de l'agence."
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Ticket, fr: "Billetterie en agence", ar: "بيع التذاكر في الوكالة", en: "Agency ticketing" },
                { icon: Clock3, fr: "Départs quotidiens", ar: "رحلات يومية", en: "Daily departures" },
                { icon: ShieldCheck, fr: "Voyage sécurisé", ar: "سفر آمن", en: "Safe travel" },
                { icon: CheckCircle2, fr: "Paiement à bord ou en ligne", ar: "الدفع في الحافلة أو عبر الإنترنت", en: "Pay onboard or online" },
              ].map((item) => (
                <div key={item.fr} className="rounded-2xl border border-line bg-white p-4">
                  <item.icon className="h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-bold text-ink">{locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}</p>
                </div>
              ))}
            </div>
          </div>
          <AgencyMap agencies={agencies} locale={locale} height="500px" />
        </div>
      </section>
    </>
  );
}
