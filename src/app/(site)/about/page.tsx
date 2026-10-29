import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AgencyMap } from "@/components/agency-map";
import { Badge, buttonClass, EmptyState, PageHero, SectionHeading, StatCard } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getAgencies, getSiteSettings } from "@/lib/queries";
import { pick } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notre histoire",
  description: "Depuis 1992, SLKM relie les villes du Maroc avec une exigence constante : ponctualité, sécurité et proximité.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const [settings, agencies] = await Promise.all([getSiteSettings(), getAgencies()]);
  const stats = settings?.analytics_config.stats ?? [];
  const timeline = settings?.analytics_config.timeline ?? [];
  const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";

  const values = [
    {
      icon: ShieldCheck,
      fr: "Sécurité d'abord",
      ar: "السلامة أولاً",
      en: "Safety first",
      textFr: "Des véhicules suivis, des chauffeurs formés et des procédures de contrôle à chaque départ.",
      textAr: "مركبات متتبعة، سائقون مؤهلون وإجراءات مراقبة عند كل رحلة.",
      textEn: "Tracked vehicles, trained drivers and control procedures at every departure.",
    },
    {
      icon: HeartHandshake,
      fr: "Proximité",
      ar: "القرب من الناس",
      en: "Closeness",
      textFr: "Des équipes locales dans chaque ville, qui connaissent les routes et les attentes des voyageurs.",
      textAr: "فرق محلية في كل مدينة تعرف الطرق وتطلعات المسافرين.",
      textEn: "Local teams in every city who know the roads and what travellers need.",
    },
    {
      icon: Sparkles,
      fr: "Exigence",
      ar: "الجودة",
      en: "Excellence",
      textFr: "Une flotte renouvelée, des départs à l'heure et un service client accessible 24/7.",
      textAr: "أسطول متجدد، رحلات في الموعد وخدمة عملاء متاحة 24/7.",
      textEn: "A renewed fleet, on-time departures and customer service available 24/7.",
    },
  ];

  return (
    <>
      <PageHero
        image="/images/hero-about.jpg"
        eyebrow={locale === "ar" ? "قصتنا" : locale === "en" ? "Our story" : "Notre histoire"}
        title={locale === "ar" ? "من سوق إنزكان إلى شبكة وطنية" : locale === "en" ? "From the Inezgane market to a national network" : "Du souk d'Inezgane à un réseau national"}
        description={
          locale === "ar"
            ? `بدأت ${siteName} برحلة واحدة ورؤية واضحة: نقل آمن ومنتظم يخدم الناس. اليوم، نواصل نفس الطريق بأسطول حديث وفريق يفهم المغرب.`
            : locale === "en"
              ? `${siteName} began with one route and a clear vision: safe, reliable transport for local people. Today, the same road continues with a modern fleet and a team that knows Morocco.`
              : `${siteName} a commencé avec une liaison et une idée claire : un transport sûr et régulier au service des gens. Aujourd'hui, la même route continue avec une flotte moderne et une équipe qui connaît le Maroc.`
        }
      />

      <section className="container-page -mt-10 relative z-10">
        <div className="grid gap-3 rounded-3xl border border-line bg-white p-4 shadow-lift sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
          {(stats.length ? stats : [
            { key: "agencies", value: String(agencies.length), label_fr: "Agences", label_ar: "وكالات", label_en: "Agencies" },
          ]).map((stat) => (
            <StatCard key={stat.key} value={stat.value} label={pick(locale, stat.label_fr, stat.label_ar, stat.label_en)} />
          ))}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line shadow-lift">
              <Image src="/images/ceo.jpg" alt="" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-5 -end-3 max-w-[220px] rounded-2xl bg-primary-dark p-4 text-white shadow-lift sm:end-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/50">
                {locale === "ar" ? "المؤسس" : locale === "en" ? "Founder" : "Fondateur"}
              </p>
              <p className="mt-1 text-sm font-extrabold">Moulay Mbarek</p>
              <p className="mt-1 text-[11px] leading-5 text-white/60">
                {locale === "ar" ? "رؤية عائلية منذ 1992" : locale === "en" ? "A family vision since 1992" : "Une vision familiale depuis 1992"}
              </p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "الحكاية" : locale === "en" ? "The story" : "L'histoire"}
              title={locale === "ar" ? "ثلاثون عاماً على نفس الطريق" : locale === "en" ? "Thirty years on the same road" : "Trente ans sur la même route"}
            />
            <div className="grid gap-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
              <p>
                {locale === "ar"
                  ? "في 1992، انطلقت أولى الرحلات من قلب سوق إنزكان لربط القرى والحواضر بمنطقة سوس. كانت البداية متواضعة، لكن الالتزام كان كبيراً: احترام المواعيد وخدمة الناس بصدق."
                  : locale === "en"
                    ? "In 1992, the first journeys left the heart of the Inezgane market, connecting villages and towns across the Souss. The start was modest, but the commitment was clear: keep to the schedule and serve people honestly."
                    : "En 1992, les premières rotations partaient du cœur du souk d'Inezgane pour relier villages et centres urbains du Souss. Les débuts étaient modestes, mais l'engagement était total : respecter les horaires et servir les gens avec honnêteté."}
              </p>
              <p>
                {locale === "ar"
                  ? "مع مرور السنوات، توسعت الشبكة نحو الشمال والجنوب، وانضافت خدمة إرساليات لنقل الأمانات مع نفس الحافلات. اليوم، نجمع بين نقل المسافرين، التوصيل السريع وحلول النقل للشركات."
                  : locale === "en"
                    ? "Over the years the network expanded north and south, and Irsaliyat added parcel transport on the same coaches. Today we bring together passenger travel, express delivery and corporate mobility."
                    : "Au fil des années, le réseau s'est étendu vers le nord et le sud, et Irsaliyat a ajouté le transport de colis sur les mêmes autocars. Aujourd'hui, nous réunissons voyageurs, messagerie express et mobilité d'entreprise."}
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { fr: "Un réseau national", ar: "شبكة وطنية", en: "A national network" },
                { fr: "Des équipes locales", ar: "فرق محلية", en: "Local teams" },
                { fr: "Une flotte moderne", ar: "أسطول حديث", en: "A modern fleet" },
                { fr: "Un service humain", ar: "خدمة إنسانية", en: "Human service" },
              ].map((item) => (
                <p key={item.fr} className="flex items-center gap-2 text-sm font-bold text-ink">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={locale === "ar" ? "المراحل" : locale === "en" ? "Milestones" : "Les étapes"}
            title={locale === "ar" ? "محطات شكلت مسارنا" : locale === "en" ? "Moments that shaped the journey" : "Les moments qui ont façonné le trajet"}
            align="center"
          />
          {timeline.length ? (
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-y-0 start-[19px] w-px bg-line md:start-1/2" />
              <div className="grid gap-8">
                {timeline.map((item, index) => (
                  <article key={item.year} className={`relative grid gap-5 ps-12 md:grid-cols-2 md:items-center md:gap-10 md:ps-0 ${index % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
                    <div className={`${index % 2 ? "md:ps-12" : "md:pe-12 md:text-end"}`}>
                      <Badge tone="orange">{item.year}</Badge>
                      <h3 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-ink">{pick(locale, item.title_fr, item.title_ar, item.title_en)}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{pick(locale, item.description_fr, item.description_ar, item.description_en)}</p>
                    </div>
                    <div className={`relative ${index % 2 ? "md:pe-12" : "md:ps-12"}`}>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line shadow-soft">
                        <Image src={item.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
                      </div>
                      <span className="absolute -start-[37px] top-8 h-4 w-4 rounded-full border-4 border-white bg-primary shadow md:start-auto md:left-1/2 md:-translate-x-1/2" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title={locale === "ar" ? "لا توجد مراحل منشورة" : locale === "en" ? "No milestones yet" : "Aucune étape publiée"}
              description={locale === "ar" ? "أضف التواريخ من إعدادات الموقع (analytics_config)." : locale === "en" ? "Add timeline items in site settings (analytics_config)." : "Ajoutez les étapes dans les paramètres du site (analytics_config)."}
            />
          )}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={locale === "ar" ? "قيمنا" : locale === "en" ? "Our values" : "Nos valeurs"}
          title={locale === "ar" ? "ما لا يتغير مع مرور السنوات" : locale === "en" ? "What never changes" : "Ce qui ne change pas"}
          align="center"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {values.map((value) => (
            <article key={value.fr} className="rounded-3xl border border-line bg-white p-6 shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-ink">{locale === "ar" ? value.ar : locale === "en" ? value.en : value.fr}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{locale === "ar" ? value.textAr : locale === "en" ? value.textEn : value.textFr}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "الحضور" : locale === "en" ? "Presence" : "Présence"}
              title={locale === "ar" ? "شبكتنا على الخريطة" : locale === "en" ? "Our network on the map" : "Notre réseau sur la carte"}
              description={
                locale === "ar"
                  ? `${agencies.length} وكالة نشطة تربط الشمال والوسط والجنوب.`
                  : locale === "en"
                    ? `${agencies.length} active agencies connecting north, centre and south.`
                    : `${agencies.length} agences actives relient le nord, le centre et le sud.`
              }
              href="/lignes"
              linkLabel={locale === "ar" ? "كل الوكالات" : locale === "en" ? "All agencies" : "Toutes les agences"}
            />
            <Link href="/contact" className={buttonClass("primary", "md")}>
              {locale === "ar" ? "تواصل معنا" : locale === "en" ? "Contact us" : "Nous contacter"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <AgencyMap agencies={agencies} locale={locale} height="460px" />
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="rounded-3xl bg-primary-dark p-7 text-white shadow-lift sm:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">
                <Users className="h-3.5 w-3.5" />
                {locale === "ar" ? "انضموا إلى رحلتنا" : locale === "en" ? "Join the journey" : "Rejoignez le voyage"}
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
                {locale === "ar" ? "سواء كنتم مسافراً أو شريكاً، مرحباً بكم" : locale === "en" ? "Whether you travel or partner with us, welcome" : "Que vous voyagiez ou travailliez avec nous, bienvenue"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
                {locale === "ar" ? "استكشفوا خطوطنا أو اطلبوا عرضاً مخصصاً لفريقكم." : locale === "en" ? "Explore our routes or request a tailored offer for your team." : "Découvrez nos lignes ou demandez une offre adaptée à vos équipes."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/lignes" className={buttonClass("white", "md")}>{locale === "ar" ? "الخطوط" : locale === "en" ? "Routes" : "Les lignes"}</Link>
              <Link href="/services" className={buttonClass("secondary", "md")}>{locale === "ar" ? "عرض أسعار" : locale === "en" ? "Get a quote" : "Un devis"}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
