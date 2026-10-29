import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Clock3, GraduationCap, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { Badge, buttonClass, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/queries";
import { normalizePhone, pick } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services B2B · Personnel, tourisme & groupes",
  description: "Transport du personnel, voyages touristiques et sorties scolaires : demandez une offre sur mesure à SLKM.",
};

export default async function ServicesPage() {
  const locale = await getLocale();
  const settings = await getSiteSettings();
  const address = pick(locale, settings?.address_fr, settings?.address_ar, settings?.address_en);

  const offers = [
    {
      image: "/images/service-personnel.jpg",
      icon: Building2,
      titleFr: "Transport du personnel",
      titleAr: "نقل الموظفين",
      titleEn: "Staff transport",
      textFr: "Navettes quotidiennes, ramassage à domicile ou points fixes, coordination avec vos horaires d'équipe.",
      textAr: "رحلات يومية، جمع من المنازل أو نقاط محددة، وتنسيق مع مواعيد فرقكم.",
      textEn: "Daily shuttles, home or fixed-point pickups, coordinated with your team schedules.",
    },
    {
      image: "/images/service-tourism.jpg",
      icon: MapPin,
      titleFr: "Voyages touristiques",
      titleAr: "رحلات سياحية",
      titleEn: "Tourism trips",
      textFr: "Circuits pour agences, associations et groupes privés, avec chauffeurs expérimentés et autocars grand tourisme.",
      textAr: "برامج للوكالات والجمعيات والمجموعات الخاصة، مع سائقين متمرسين وحافلات سياحية.",
      textEn: "Itineraries for agencies, associations and private groups, with experienced drivers and touring coaches.",
    },
    {
      image: "/images/service-school.jpg",
      icon: GraduationCap,
      titleFr: "Sorties scolaires",
      titleAr: "رحلات مدرسية",
      titleEn: "School trips",
      textFr: "Transport sécurisé pour écoles et centres de formation, avec encadrement et documents de voyage.",
      textAr: "نقل آمن للمدارس ومراكز التكوين، مع مرافقة ووثائق السفر.",
      textEn: "Safe transport for schools and training centres, with supervision and travel documents.",
    },
  ];

  return (
    <>
      <PageHero
        image="/images/hero-services.jpg"
        eyebrow={locale === "ar" ? "حلول الشركات" : locale === "en" ? "Business solutions" : "Solutions entreprises"}
        title={locale === "ar" ? "حركوا فرقكم بثقة، كل يوم" : locale === "en" ? "Move your teams with confidence, every day" : "Déplacez vos équipes en confiance, chaque jour"}
        description={
          locale === "ar"
            ? "حلول نقل مخصصة للشركات والمؤسسات: نقل الموظفين، رحلات سياحية ورحلات مدرسية، مع تتبع وتنسيق."
            : locale === "en"
              ? "Tailored transport for companies and institutions: staff mobility, tourism and school trips, with tracking and coordination."
              : "Des solutions de transport sur mesure pour entreprises et institutions : personnel, tourisme et scolaire, avec suivi et coordination."
        }
      >
        <Link href="#devis" className={buttonClass("secondary", "lg")}>
          {locale === "ar" ? "اطلب عرض أسعار" : locale === "en" ? "Request a quote" : "Demander un devis"}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </PageHero>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={locale === "ar" ? "عروضنا" : locale === "en" ? "Our offers" : "Nos offres"}
          title={locale === "ar" ? "حل نقل يناسب كل احتياج" : locale === "en" ? "A mobility solution for every need" : "Une solution de mobilité pour chaque besoin"}
          description={
            locale === "ar"
              ? "نصمم كل عرض حسب عدد المسافرين، المسافة، التردد ومستوى الخدمة المطلوب."
              : locale === "en"
                ? "Every proposal is built around passenger count, distance, frequency and service level."
                : "Chaque proposition est construite selon le nombre de passagers, la distance, la fréquence et le niveau de service."
          }
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.titleFr} className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
              <div className="relative aspect-[16/10]">
                <Image src={offer.image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/65 to-transparent" />
                <span className="absolute start-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/95 text-primary">
                  <offer.icon className="h-5 w-5" />
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">{locale === "ar" ? offer.titleAr : locale === "en" ? offer.titleEn : offer.titleFr}</h3>
                <p className="mt-2 text-xs leading-6 text-muted">{locale === "ar" ? offer.textAr : locale === "en" ? offer.textEn : offer.textFr}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "لماذا إس إل كي إم" : locale === "en" ? "Why SLKM" : "Pourquoi SLKM"}
              title={locale === "ar" ? "شريك نقل تعرفه الفرق" : locale === "en" ? "A transport partner your teams can rely on" : "Un partenaire transport que vos équipes connaissent"}
              description={
                locale === "ar"
                  ? "ثلاثون عاماً من الخبرة الميدانية، أسطول متنوع وفريق تنسيق واحد يجمع كل التفاصيل."
                  : locale === "en"
                    ? "Thirty years of field experience, a diversified fleet and one coordination team for every detail."
                    : "Trente ans d'expérience terrain, une flotte diversifiée et une équipe de coordination unique pour chaque détail."
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Clock3, fr: "Ponctualité suivie", ar: "التزام بالمواعيد", en: "Tracked punctuality" },
                { icon: ShieldCheck, fr: "Sécurité & assurance", ar: "السلامة والتأمين", en: "Safety & insurance" },
                { icon: Users, fr: "Chauffeurs formés", ar: "سائقون مؤهلون", en: "Trained drivers" },
                { icon: CheckCircle2, fr: "Facturation entreprise", ar: "فواتير للشركات", en: "Corporate invoicing" },
              ].map((item) => (
                <div key={item.fr} className="flex items-start gap-3 rounded-2xl border border-line bg-background p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-bold text-ink">{locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-line shadow-soft">
            <Image src="/images/serenity-coach.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 backdrop-blur">
              <Badge tone="orange">{locale === "ar" ? "أسطول حديث" : locale === "en" ? "Modern fleet" : "Flotte récente"}</Badge>
              <p className="mt-2 text-sm font-extrabold text-ink">
                {locale === "ar" ? "حافلات مجهزة للرحلات الطويلة واليومية" : locale === "en" ? "Coaches equipped for long-distance and daily duty" : "Des autocars équipés pour la route et le quotidien"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="devis" className="container-page py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <QuoteForm locale={locale} />
          <aside className="grid gap-4">
            <div className="rounded-3xl border border-line bg-white p-5 shadow-soft">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {locale === "ar" ? "فريق الشركات" : locale === "en" ? "B2B desk" : "Équipe B2B"}
              </p>
              <h3 className="mt-2 text-lg font-extrabold text-ink">
                {locale === "ar" ? "نتواصل معكم خلال 24 ساعة" : locale === "en" ? "We reply within 24 hours" : "Réponse sous 24 heures"}
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                {settings?.support_phone ? (
                  <a href={`tel:${normalizePhone(settings.support_phone)}`} className="inline-flex items-center gap-2 transition hover:text-primary">
                    <Phone className="h-4 w-4 text-primary" />
                    {settings.support_phone}
                  </a>
                ) : null}
                {settings?.contact_email ? (
                  <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 break-all transition hover:text-primary">
                    <Mail className="h-4 w-4 text-primary" />
                    {settings.contact_email}
                  </a>
                ) : null}
                {address ? (
                  <p className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {address}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="rounded-3xl bg-primary-dark p-5 text-white shadow-soft">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/50">
                {locale === "ar" ? "للمؤسسات" : locale === "en" ? "For institutions" : "Institutions"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {locale === "ar"
                  ? "عقود سنوية، تتبع الرحلات وفواتير شهرية منظمة."
                  : locale === "en"
                    ? "Annual contracts, journey tracking and structured monthly invoicing."
                    : "Contrats annuels, suivi des trajets et facturation mensuelle structurée."}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
