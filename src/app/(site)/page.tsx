import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AgencyMap } from "@/components/agency-map";
import { BlogCard } from "@/components/blog-card";
import { RouteSearch } from "@/components/route-search";
import { Badge, buttonClass, EmptyState, SectionHeading, StatCard } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getAgencies, getBlogPosts, getRoutes, getSiteSettings } from "@/lib/queries";
import type { SiteStat } from "@/lib/types";
import { pick } from "@/lib/utils";

export default async function HomePage() {
  const locale = await getLocale();
  const [settings, agencies, routes, posts] = await Promise.all([
    getSiteSettings(),
    getAgencies(),
    getRoutes(),
    getBlogPosts(3),
  ]);

  const config = settings?.analytics_config;
  const stats = config?.stats ?? [];
  const fleet = config?.fleet ?? [];
  const whatsapp = settings?.whatsapp_number ?? null;
  const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";
  const fallbackStats: SiteStat[] = [
    { key: "agencies", value: String(agencies.length), label_fr: "Agences actives", label_ar: "وكالات نشطة", label_en: "Active agencies" },
    { key: "routes", value: String(routes.length), label_fr: "Lignes publiées", label_ar: "خطوط منشورة", label_en: "Published routes" },
    { key: "articles", value: String(posts.length), label_fr: "Derniers articles", label_ar: "أحدث المقالات", label_en: "Latest articles" },
  ];
  const quickStats = stats.length ? stats.slice(0, 3) : fallbackStats;

  const heroTitle =
    locale === "ar"
      ? "سافروا بعيداً. وصلوا مطمئنين."
      : locale === "en"
        ? "Travel further. Arrive with peace of mind."
        : "Voyagez loin. Arrivez serein.";
  const heroText =
    locale === "ar"
      ? "حافلات حديثة، شبكة وطنية من طنجة إلى الداخلة، وحجز مباشر عبر واتساب. إس إل كي إم تنقلكم بانتظام وأمان."
      : locale === "en"
        ? "Modern coaches, a national network from Tangier to Dakhla and direct WhatsApp booking. SLKM gets you there safely, on time."
        : "Des autocars récents, un réseau national de Tanger à Dakhla et une réservation directe sur WhatsApp. SLKM vous emmène loin, à l'heure et en sécurité.";
  const popularRoutes = routes.slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden bg-primary-dark">
        <Image src="/images/hero-home.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary-dark/85 to-primary-dark/25" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/90 to-transparent" />
        <div className="container-page relative py-20 sm:py-28 lg:py-32">
          <div className="max-w-3xl text-white">
            <Badge tone="orange" className="bg-secondary-bright text-white">
              <Sparkles className="h-3 w-3" />
              {siteName} · {locale === "ar" ? "منذ 1992" : locale === "en" ? "Since 1992" : "Depuis 1992"}
            </Badge>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.03] tracking-[-0.05em] sm:text-6xl lg:text-7xl">{heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-lg sm:leading-8">{heroText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/lignes" className={buttonClass("secondary", "lg")}>
                <Bus className="h-4 w-4" />
                {locale === "ar" ? "استكشف الخطوط" : locale === "en" ? "Explore routes" : "Explorer les lignes"}
              </Link>
              <Link href="/irsaliyat" className={buttonClass("white", "lg")}>
                <Package className="h-4 w-4" />
                {locale === "ar" ? "خدمة إرساليات" : locale === "en" ? "Irsaliyat parcels" : "Irsaliyat colis"}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {quickStats.map((stat) => (
                <StatCard key={stat.key} value={stat.value} label={pick(locale, stat.label_fr, stat.label_ar, stat.label_en)} tone="dark" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page relative z-10 -mt-14 sm:-mt-16">
        <RouteSearch routes={routes} agencies={agencies} locale={locale} whatsapp={whatsapp} />
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={locale === "ar" ? "الخطوط الأكثر طلباً" : locale === "en" ? "Popular routes" : "Lignes populaires"}
          title={locale === "ar" ? "وجهات تربط المغرب من الشمال إلى الجنوب" : locale === "en" ? "Destinations linking Morocco north to south" : "Des destinations qui relient le Maroc du nord au sud"}
          description={
            locale === "ar"
              ? "أسعار واضحة، مواعيد يومية وحجز سهل. اختر وجهتكم وتواصلوا مع الوكالة مباشرة."
              : locale === "en"
                ? "Clear fares, daily departures and simple booking. Pick your destination and reach the agency directly."
                : "Des tarifs clairs, des départs quotidiens et une réservation simple. Choisissez votre destination et contactez l'agence directement."
          }
          href="/lignes"
          linkLabel={locale === "ar" ? "كل الخطوط" : locale === "en" ? "All routes" : "Toutes les lignes"}
        />
        {popularRoutes.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {popularRoutes.map((route) => (
              <Link key={route.id} href={`/lignes?from=${route.from_agency_id}&to=${route.to_agency_id}`} className="group rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-ink">
                    {route.from_agency ? pick(locale, route.from_agency.city_fr, route.from_agency.city_ar, route.from_agency.city_en) : "—"}
                    <span className="mx-2 text-primary">→</span>
                    {route.to_agency ? pick(locale, route.to_agency.city_fr, route.to_agency.city_ar, route.to_agency.city_en) : "—"}
                  </p>
                  <ArrowRight className="h-4 w-4 text-primary transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <Clock3 className="h-3.5 w-3.5 text-primary" />
                  {route.departure_time.slice(0, 5)} · {route.bus_type}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title={locale === "ar" ? "لا توجد خطوط منشورة" : locale === "en" ? "No published routes" : "Aucune ligne publiée"}
            description={locale === "ar" ? "أضف الخطوط من لوحة الإدارة ثم أعد تحميل الصفحة." : locale === "en" ? "Add routes from the admin dashboard, then refresh this page." : "Ajoutez des lignes depuis l'espace admin, puis rechargez cette page."}
            action={{ href: "/admin?tab=routes", label: locale === "ar" ? "إدارة الخطوط" : locale === "en" ? "Manage routes" : "Gérer les lignes" }}
          />
        )}
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "شبكة وطنية" : locale === "en" ? "National network" : "Réseau national"}
              title={locale === "ar" ? "اعثروا على وكالتكم على الخريطة" : locale === "en" ? "Find your agency on the map" : "Trouvez votre agence sur la carte"}
              description={
                locale === "ar"
                  ? "شبابيك في المدن الكبرى والمتوسطة، مع فرق محلية تعرف الطرق وتفاصيل كل رحلة."
                  : locale === "en"
                    ? "Counters in major and regional cities, with local teams who know every road and connection."
                    : "Des comptoirs dans les grandes villes et les villes régionales, avec des équipes locales qui connaissent chaque route."
              }
              href="/lignes"
              linkLabel={locale === "ar" ? "كل الوكالات" : locale === "en" ? "All agencies" : "Toutes les agences"}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-line bg-background p-4">
                <MapPin className="h-5 w-5 text-primary" />
                <p className="mt-2 text-2xl font-extrabold text-ink">{agencies.length}</p>
                <p className="text-xs text-muted">{locale === "ar" ? "وكالة نشطة" : locale === "en" ? "active agencies" : "agences actives"}</p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <Bus className="h-5 w-5 text-secondary" />
                <p className="mt-2 text-2xl font-extrabold text-ink">{routes.length}</p>
                <p className="text-xs text-muted">{locale === "ar" ? "خط منشور" : locale === "en" ? "published routes" : "lignes publiées"}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {agencies.slice(0, 4).map((agency) => (
                <Link key={agency.id} href={`/lignes#agency-${agency.id}`} className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-sm transition hover:border-primary/30 hover:text-primary">
                  <span className="inline-flex items-center gap-2 font-bold">
                    <MapPin className="h-4 w-4 text-primary" />
                    {pick(locale, agency.city_fr, agency.city_ar, agency.city_en)}
                  </span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </div>
          <AgencyMap agencies={agencies} locale={locale} height="480px" />
        </div>
      </section>

      {fleet.length ? (
        <section className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow={locale === "ar" ? "أسطولنا" : locale === "en" ? "Our fleet" : "Notre flotte"}
            title={locale === "ar" ? "حافلات مصممة للراحة والسلامة" : locale === "en" ? "Coaches designed for comfort and safety" : "Des autocars pensés pour le confort et la sécurité"}
            description={
              locale === "ar"
                ? "من الحافلات السياحية الفاخرة إلى أسطول النقل اليومي، نختار تجهيزات تناسب كل مسار."
                : locale === "en"
                  ? "From premium touring coaches to everyday intercity fleet, every vehicle is configured for its route."
                  : "Du coach grand tourisme à l'autocar interurbain, chaque véhicule est configuré pour sa ligne."
            }
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {fleet.map((vehicle) => {
              const features = locale === "ar" ? vehicle.features_ar : locale === "en" ? vehicle.features_en : vehicle.features_fr;
              return (
                <article key={`${vehicle.name}-${vehicle.category}`} className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
                  <div className="relative aspect-[16/10] bg-surface-muted">
                    <Image src={vehicle.image_url} alt={vehicle.name} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                    <Badge className="absolute start-4 top-4 bg-white/95" tone="primary">{vehicle.category}</Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">{vehicle.name}</h3>
                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          {vehicle.capacity}
                        </p>
                      </div>
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <ul className="mt-4 grid gap-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs leading-5 text-muted">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="bg-primary-dark py-16 text-white sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "إرساليات" : locale === "en" ? "Irsaliyat" : "Irsaliyat"}
              title={locale === "ar" ? "أماناتكم تصل مع نفس الحافلات" : locale === "en" ? "Your parcels travel with the same coaches" : "Vos colis voyagent avec les mêmes autocars"}
              description={
                locale === "ar"
                  ? "توصيل سريع بين المدن، تتبع عبر واتساب، وخيار الدفع عند الاستلام للتجار."
                  : locale === "en"
                    ? "Fast intercity delivery, WhatsApp tracking and cash on delivery for retailers."
                    : "Livraison rapide entre les villes, suivi WhatsApp et paiement à la livraison pour les commerçants."
              }
              light
            />
            <Link href="/irsaliyat" className={buttonClass("secondary", "lg")}>
              {locale === "ar" ? "اكتشف الأسعار" : locale === "en" ? "See parcel rates" : "Voir les tarifs"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/15 shadow-lift">
            <Image src="/images/cargo-hold.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 to-transparent" />
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={locale === "ar" ? "المدونة" : locale === "en" ? "Journal" : "Le journal"}
          title={locale === "ar" ? "أخبار ونصائح للسفر" : locale === "en" ? "News and travel advice" : "Actualités et conseils de voyage"}
          description={
            locale === "ar"
              ? "كل ما تحتاجونه لتحضير رحلتكم، من مواعيد الخطوط إلى نصائح الطريق."
              : locale === "en"
                ? "Everything you need to plan your trip, from route updates to practical travel advice."
                : "Tout pour préparer votre trajet, des nouveautés du réseau aux conseils pratiques."
          }
          href="/blog"
          linkLabel={locale === "ar" ? "كل المقالات" : locale === "en" ? "All articles" : "Tous les articles"}
        />
        {posts.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={locale === "ar" ? "لا توجد مقالات منشورة" : locale === "en" ? "No published articles" : "Aucun article publié"}
            description={locale === "ar" ? "انشر أول مقال من لوحة الإدارة." : locale === "en" ? "Publish the first article from the admin dashboard." : "Publiez le premier article depuis l'espace admin."}
            action={{ href: "/admin?tab=blog", label: locale === "ar" ? "إدارة المدونة" : locale === "en" ? "Manage blog" : "Gérer le blog" }}
          />
        )}
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-primary p-7 text-white shadow-glow sm:p-9">
            <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/60">
              {locale === "ar" ? "شركات ومؤسسات" : locale === "en" ? "Business & institutions" : "Entreprises & institutions"}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              {locale === "ar" ? "نقل الموظفين والرحلات الجماعية" : locale === "en" ? "Staff transport and group travel" : "Transport du personnel et voyages de groupe"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
              {locale === "ar" ? "عروض مخصصة للشركات، المدارس والجمعيات، مع تتبع وتنسيق يومي." : locale === "en" ? "Tailored offers for companies, schools and associations, with daily coordination." : "Des offres sur mesure pour entreprises, écoles et associations, avec coordination quotidienne."}
            </p>
            <Link href="/services" className={`${buttonClass("white", "md")} mt-6`}>
              {locale === "ar" ? "طلب عرض أسعار" : locale === "en" ? "Request a quote" : "Demander un devis"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-7 shadow-soft sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-secondary">
              {locale === "ar" ? "دعم 24/7" : locale === "en" ? "24/7 support" : "Assistance 24/7"}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-ink sm:text-3xl">
              {locale === "ar" ? "هل تحتاجون مساعدة فورية؟" : locale === "en" ? "Need immediate help?" : "Besoin d'une aide immédiate ?"}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted">
              {locale === "ar" ? "فريق العمليات متاح على مدار الساعة للمساعدة في الحجز أو تتبع الأمانات." : locale === "en" ? "Our operations team is available around the clock for bookings and parcel tracking." : "Notre équipe d'exploitation répond 24 h/24 pour les réservations et le suivi des colis."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/contact" className={buttonClass("primary", "md")}>
                {locale === "ar" ? "اتصل بنا" : locale === "en" ? "Contact us" : "Nous contacter"}
              </Link>
              {settings?.emergency_phone ? (
                <a href={`tel:${settings.emergency_phone.replace(/\s/g, "")}`} className={buttonClass("ghost", "md")}>
                  {settings.emergency_phone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
