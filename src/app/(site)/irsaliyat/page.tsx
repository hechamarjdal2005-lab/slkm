import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Banknote, CheckCircle2, Clock3, MapPinned, Package, ShieldCheck, Truck } from "lucide-react";
import { TrackingForm } from "@/components/tracking-form";
import { Badge, buttonClass, EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getParcelRates, getSiteSettings } from "@/lib/queries";
import { formatMad, formatWeight, pick } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Irsaliyat · Colis & messagerie express",
  description: "Envoyez vos colis entre les villes du Maroc avec Irsaliyat : tarifs clairs, suivi WhatsApp et paiement à la livraison.",
};

export default async function IrsaliyatPage() {
  const locale = await getLocale();
  const [settings, rates] = await Promise.all([getSiteSettings(), getParcelRates()]);
  const whatsapp = settings?.whatsapp_number ?? null;

  const steps = [
    {
      icon: Package,
      fr: "Déposez votre colis",
      ar: "أودعوا أمانتكم",
      en: "Drop off your parcel",
      textFr: "Présentez le colis au guichet Irsaliyat. Nous le pesons, l'enregistrons et vous remettons un numéro de suivi.",
      textAr: "قدموا الأمانة في شباك إرساليات. نقوم بوزنها وتسجيلها ومنحكم رقم تتبع.",
      textEn: "Bring the parcel to the Irsaliyat counter. We weigh it, register it and issue a tracking number.",
    },
    {
      icon: Truck,
      fr: "Voyage avec l'autocar",
      ar: "السفر مع الحافلة",
      en: "Travels with the coach",
      textFr: "Il est placé dans un compartiment fermé dédié, séparé des bagages classiques.",
      textAr: "توضع في صندوق مغلق مخصص، منفصل عن الأمتعة العادية.",
      textEn: "It travels in a dedicated sealed compartment, separate from regular luggage.",
    },
    {
      icon: MapPinned,
      fr: "Arrivée en agence",
      ar: "الوصول إلى الوكالة",
      en: "Arrival at the agency",
      textFr: "Le destinataire reçoit une alerte SMS ou WhatsApp dès l'arrivée.",
      textAr: "يتلقى المرسل إليه تنبيهاً عبر SMS أو واتساب عند الوصول.",
      textEn: "The recipient receives an SMS or WhatsApp alert on arrival.",
    },
    {
      icon: CheckCircle2,
      fr: "Remise sécurisée",
      ar: "تسليم آمن",
      en: "Secure handover",
      textFr: "Vérification de la pièce d'identité et du code secret avant la remise.",
      textAr: "التحقق من بطاقة التعريف والرمز السري قبل التسليم.",
      textEn: "ID and secret code are checked before handover.",
    },
  ];

  return (
    <>
      <PageHero
        image="/images/hero-irsaliyat.jpg"
        eyebrow={locale === "ar" ? "إرساليات · توصيل سريع" : locale === "en" ? "Irsaliyat · express parcels" : "Irsaliyat · messagerie express"}
        title={locale === "ar" ? "أمانتكم تصل بسرعة، بأمان ووضوح" : locale === "en" ? "Your parcels, delivered fast and safely" : "Vos colis, livrés vite et en toute confiance"}
        description={
          locale === "ar"
            ? "شبكة التوصيل الخاصة بنا تستعمل نفس رحلات الحافلات اليومية بين المدن، مع تتبع مباشر عبر واتساب."
            : locale === "en"
              ? "Our parcel network uses the same daily intercity coach routes, with direct WhatsApp tracking."
              : "Notre réseau de colis utilise les mêmes liaisons quotidiennes que nos autocars, avec un suivi direct sur WhatsApp."
        }
      >
        <div className="max-w-md">
          <TrackingForm locale={locale} whatsapp={whatsapp} />
        </div>
      </PageHero>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow={locale === "ar" ? "كيف تعمل الخدمة" : locale === "en" ? "How it works" : "Comment ça marche"}
          title={locale === "ar" ? "من الإيداع إلى التسليم في أربع خطوات" : locale === "en" ? "From drop-off to delivery in four steps" : "Du dépôt à la remise en quatre étapes"}
          align="center"
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.fr} className="relative rounded-3xl border border-line bg-white p-5 shadow-soft">
              <span className="absolute end-4 top-4 text-3xl font-extrabold text-primary-soft">{String(index + 1).padStart(2, "0")}</span>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-ink">{locale === "ar" ? step.ar : locale === "en" ? step.en : step.fr}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{locale === "ar" ? step.textAr : locale === "en" ? step.textEn : step.textFr}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow={locale === "ar" ? "الأسعار" : locale === "en" ? "Pricing" : "Tarifs"}
            title={locale === "ar" ? "أسعار واضحة حسب الوزن" : locale === "en" ? "Clear pricing by weight" : "Des tarifs clairs selon le poids"}
            description={
              locale === "ar"
                ? "الأسعار الأساسية لكل فئة. قد تُضاف رسوم حسب الوجهة أو طبيعة الأمانة."
                : locale === "en"
                  ? "Base fares per category. Surcharges may apply depending on destination or parcel type."
                  : "Tarifs de base par catégorie. Des suppléments peuvent s'appliquer selon la destination ou la nature du colis."
            }
            href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : "/contact"}
            linkLabel={locale === "ar" ? "اسأل عن وجهتكم" : locale === "en" ? "Ask about your destination" : "Demander pour votre destination"}
          />
          {rates.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rates.map((rate, index) => {
                const description = pick(locale, rate.description_fr, rate.description_ar, rate.description_en);
                return (
                  <article key={rate.id} className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-soft ${index === 1 ? "border-primary/40 ring-2 ring-primary/10" : "border-line"}`}>
                    {index === 1 ? <Badge className="absolute end-4 top-4" tone="orange">{locale === "ar" ? "الأكثر طلباً" : locale === "en" ? "Most popular" : "Le plus demandé"}</Badge> : null}
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">{formatWeight(rate.max_weight_kg)}</p>
                    <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-ink">{pick(locale, rate.category_fr, rate.category_ar, rate.category_en)}</h3>
                    <p className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-primary">{formatMad(rate.base_price_mad)}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {locale === "ar" ? "سعر أساسي" : locale === "en" ? "base fare" : "tarif de base"}
                    </p>
                    {description ? <p className="mt-4 text-xs leading-6 text-muted">{description}</p> : null}
                    <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[11px] font-semibold text-muted">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      {locale === "ar" ? "تتبع وتسليم مؤمن" : locale === "en" ? "Tracked and secured" : "Suivi et sécurisé"}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={locale === "ar" ? "لا توجد أسعار منشورة" : locale === "en" ? "No parcel rates" : "Aucun tarif publié"}
              description={locale === "ar" ? "أضف فئات الأسعار من لوحة الإدارة." : locale === "en" ? "Add pricing tiers from the admin dashboard." : "Ajoutez les paliers tarifaires depuis l'espace admin."}
              action={{ href: "/admin?tab=rates", label: locale === "ar" ? "إدارة الأسعار" : locale === "en" ? "Manage rates" : "Gérer les tarifs" }}
            />
          )}
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line shadow-soft">
            <Image src="/images/cargo-hold.jpg" alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "للتجار" : locale === "en" ? "For retailers" : "Pour les commerçants"}
              title={locale === "ar" ? "خدمة الدفع عند الاستلام" : locale === "en" ? "Cash on delivery, reconciled weekly" : "Paiement à la livraison, reversé chaque semaine"}
              description={
                locale === "ar"
                  ? "انقلوا منتجاتكم معنا، ونحن نحصل على المبلغ عند التسليم ونحوّله لكم أسبوعياً مع كشف مفصل."
                  : locale === "en"
                    ? "Ship your products with us. We collect payment on delivery and pay you weekly with a detailed statement."
                    : "Expédiez vos produits avec nous. Nous encaissons à la livraison et vous reversons chaque semaine avec un récapitulatif."
              }
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Banknote, fr: "Paiement à la livraison", ar: "الدفع عند التسليم", en: "Cash on delivery" },
                { icon: Clock3, fr: "Reversement hebdomadaire", ar: "تحويل أسبوعي", en: "Weekly payout" },
                { icon: Package, fr: "Colis traçables", ar: "أمانات قابلة للتتبع", en: "Trackable parcels" },
                { icon: ShieldCheck, fr: "Compartiment sécurisé", ar: "صندوق مؤمن", en: "Secured compartment" },
              ].map((item) => (
                <div key={item.fr} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-bold text-ink">{locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}</p>
                </div>
              ))}
            </div>
            <Link href="/contact" className={`${buttonClass("primary", "md")} mt-6`}>
              {locale === "ar" ? "تواصل مع فريق إرساليات" : locale === "en" ? "Talk to the Irsaliyat team" : "Parler à l'équipe Irsaliyat"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
