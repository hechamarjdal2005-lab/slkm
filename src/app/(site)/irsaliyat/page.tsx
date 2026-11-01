import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import { getMessagerieNetwork } from "@/lib/messagerie";
import { MessagerieNetworkSection } from "@/components/messagerie-network-section";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { Banknote, CheckCircle2, Clock3, MapPinned, Package, ShieldCheck, Truck } from "lucide-react";
import { TrackingForm } from "@/components/tracking-form";
import { Badge, buttonClass, EmptyState, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getParcelRates, getSiteSettings } from "@/lib/queries";
import { formatMad, formatWeight, pick } from "@/lib/utils";
export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("irsaliyat", { "title": "Messageries", "description": "Présentez le colis au guichet Irsaliyat. Nous le pesons, l'enregistrons et vous remettons un numéro de suivi." }); }
export default async function IrsaliyatPage() {
    const locale = await getLocale();
    const cms = await getPageCMS("irsaliyat");
    const ct = createTranslator(cms, locale);
    const [settings, rates, network] = await Promise.all([getSiteSettings(), getParcelRates(), getMessagerieNetwork()]);
    const whatsapp = settings?.whatsapp_number ?? null;
    const steps = [
        {
            icon: Package,
            fr: ct("text_95fa6b27692b", "Déposez votre colis", "أودعوا أمانتكم", "Drop off your parcel", "fr"),
            ar: ct("text_95fa6b27692b", "Déposez votre colis", "أودعوا أمانتكم", "Drop off your parcel", "ar"),
            en: ct("text_95fa6b27692b", "Déposez votre colis", "أودعوا أمانتكم", "Drop off your parcel", "en"),
            textFr: ct("text_7395bee98942", "Présentez le colis au guichet Irsaliyat. Nous le pesons, l'enregistrons et vous remettons un numéro de suivi.", "قدموا الأمانة في شباك إرساليات. نقوم بوزنها وتسجيلها ومنحكم رقم تتبع.", "Bring the parcel to the Irsaliyat counter. We weigh it, register it and issue a tracking number.", "fr"),
            textAr: ct("text_7395bee98942", "Présentez le colis au guichet Irsaliyat. Nous le pesons, l'enregistrons et vous remettons un numéro de suivi.", "قدموا الأمانة في شباك إرساليات. نقوم بوزنها وتسجيلها ومنحكم رقم تتبع.", "Bring the parcel to the Irsaliyat counter. We weigh it, register it and issue a tracking number.", "ar"),
            textEn: ct("text_7395bee98942", "Présentez le colis au guichet Irsaliyat. Nous le pesons, l'enregistrons et vous remettons un numéro de suivi.", "قدموا الأمانة في شباك إرساليات. نقوم بوزنها وتسجيلها ومنحكم رقم تتبع.", "Bring the parcel to the Irsaliyat counter. We weigh it, register it and issue a tracking number.", "en")
        },
        {
            icon: Truck,
            fr: ct("text_95d3c8989f13", "Voyage avec l'autocar", "السفر مع الحافلة", "Travels with the coach", "fr"),
            ar: ct("text_95d3c8989f13", "Voyage avec l'autocar", "السفر مع الحافلة", "Travels with the coach", "ar"),
            en: ct("text_95d3c8989f13", "Voyage avec l'autocar", "السفر مع الحافلة", "Travels with the coach", "en"),
            textFr: ct("text_8b2bd40ceaac", "Il est placé dans un compartiment fermé dédié, séparé des bagages classiques.", "توضع في صندوق مغلق مخصص، منفصل عن الأمتعة العادية.", "It travels in a dedicated sealed compartment, separate from regular luggage.", "fr"),
            textAr: ct("text_8b2bd40ceaac", "Il est placé dans un compartiment fermé dédié, séparé des bagages classiques.", "توضع في صندوق مغلق مخصص، منفصل عن الأمتعة العادية.", "It travels in a dedicated sealed compartment, separate from regular luggage.", "ar"),
            textEn: ct("text_8b2bd40ceaac", "Il est placé dans un compartiment fermé dédié, séparé des bagages classiques.", "توضع في صندوق مغلق مخصص، منفصل عن الأمتعة العادية.", "It travels in a dedicated sealed compartment, separate from regular luggage.", "en")
        },
        {
            icon: MapPinned,
            fr: ct("text_73b6e216b4a5", "Arrivée en agence", "الوصول إلى الوكالة", "Arrival at the agency", "fr"),
            ar: ct("text_73b6e216b4a5", "Arrivée en agence", "الوصول إلى الوكالة", "Arrival at the agency", "ar"),
            en: ct("text_73b6e216b4a5", "Arrivée en agence", "الوصول إلى الوكالة", "Arrival at the agency", "en"),
            textFr: ct("text_5d0898e0194c", "Le destinataire reçoit une alerte SMS ou WhatsApp dès l'arrivée.", "يتلقى المرسل إليه تنبيهاً عبر SMS أو واتساب عند الوصول.", "The recipient receives an SMS or WhatsApp alert on arrival.", "fr"),
            textAr: ct("text_5d0898e0194c", "Le destinataire reçoit une alerte SMS ou WhatsApp dès l'arrivée.", "يتلقى المرسل إليه تنبيهاً عبر SMS أو واتساب عند الوصول.", "The recipient receives an SMS or WhatsApp alert on arrival.", "ar"),
            textEn: ct("text_5d0898e0194c", "Le destinataire reçoit une alerte SMS ou WhatsApp dès l'arrivée.", "يتلقى المرسل إليه تنبيهاً عبر SMS أو واتساب عند الوصول.", "The recipient receives an SMS or WhatsApp alert on arrival.", "en")
        },
        {
            icon: CheckCircle2,
            fr: ct("text_f6b950d5e567", "Remise sécurisée", "تسليم آمن", "Secure handover", "fr"),
            ar: ct("text_f6b950d5e567", "Remise sécurisée", "تسليم آمن", "Secure handover", "ar"),
            en: ct("text_f6b950d5e567", "Remise sécurisée", "تسليم آمن", "Secure handover", "en"),
            textFr: ct("text_60a162e1535d", "Vérification de la pièce d'identité et du code secret avant la remise.", "التحقق من بطاقة التعريف والرمز السري قبل التسليم.", "ID and secret code are checked before handover.", "fr"),
            textAr: ct("text_60a162e1535d", "Vérification de la pièce d'identité et du code secret avant la remise.", "التحقق من بطاقة التعريف والرمز السري قبل التسليم.", "ID and secret code are checked before handover.", "ar"),
            textEn: ct("text_60a162e1535d", "Vérification de la pièce d'identité et du code secret avant la remise.", "التحقق من بطاقة التعريف والرمز السري قبل التسليم.", "ID and secret code are checked before handover.", "en")
        },
    ];
    return <CmsPage cms={cms}><>
      <CmsBuiltin sectionKey="hero"><PageHero image={cmsImage(cms, "image_44f3933530f3", "/images/hero-irsaliyat.jpg")} eyebrow={ct("text_cf04082cac0b", "Irsaliyat · messagerie express", "إرساليات · توصيل سريع", "Irsaliyat · express parcels")} title={ct("text_e6fa5ed22794", "Vos colis, livrés vite et en toute confiance", "أمانتكم تصل بسرعة، بأمان ووضوح", "Your parcels, delivered fast and safely")} description={ct("text_59adb8f9eb01", "Notre réseau de colis utilise les mêmes liaisons quotidiennes que nos autocars, avec un suivi direct sur WhatsApp.", "شبكة التوصيل الخاصة بنا تستعمل نفس رحلات الحافلات اليومية بين المدن، مع تتبع مباشر عبر واتساب.", "Our parcel network uses the same daily intercity coach routes, with direct WhatsApp tracking.")}>
        <div className="max-w-md">
          <TrackingForm locale={locale} whatsapp={whatsapp}/>
        </div>
      </PageHero></CmsBuiltin>
      {(network.settings || network.agencies.length > 0 || network.error) && <CmsBuiltin sectionKey="parcel-network"><MessagerieNetworkSection settings={network.settings} agencies={network.agencies} locale={locale} error={network.error}/></CmsBuiltin>}

      <CmsBuiltin sectionKey="section-1"><section className="container-page py-16 sm:py-[4.5rem]">
        <SectionHeading eyebrow={ct("text_df01d4b731c3", "Comment ça marche", "كيف تعمل الخدمة", "How it works")} title={ct("text_555d59a0bd73", "Du dépôt à la remise en quatre étapes", "من الإيداع إلى التسليم في أربع خطوات", "From drop-off to delivery in four steps")} align="center"/>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (<div key={step.fr} className="relative rounded-3xl border border-line bg-white p-[18px] shadow-soft">
              <span className="absolute end-4 top-4 text-[27px] font-extrabold text-primary-soft">{String(index + 1).padStart(2, "0")}</span>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <step.icon className="h-5 w-5"/>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-ink">{locale === "ar" ? step.ar : locale === "en" ? step.en : step.fr}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{locale === "ar" ? step.textAr : locale === "en" ? step.textEn : step.textFr}</p>
            </div>))}
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="tarifs"><section id="tarifs" className="scroll-mt-28 border-y border-line bg-white py-16 sm:py-[4.5rem]">
        <div className="container-page">
          <SectionHeading eyebrow={ct("text_fb30ae8c285e", "Tarifs", "الأسعار", "Pricing")} title={ct("text_53c01dacd291", "Des tarifs clairs selon le poids", "أسعار واضحة حسب الوزن", "Clear pricing by weight")} description={ct("text_edf6cf5d9204", "Tarifs de base par catégorie. Des suppléments peuvent s'appliquer selon la destination ou la nature du colis.", "الأسعار الأساسية لكل فئة. قد تُضاف رسوم حسب الوجهة أو طبيعة الأمانة.", "Base fares per category. Surcharges may apply depending on destination or parcel type.")} href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : "/contact"} linkLabel={ct("text_49e333f4f39c", "Demander pour votre destination", "اسأل عن وجهتكم", "Ask about your destination")}/>
          {rates.length ? (<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rates.map((rate, index) => {
                const description = pick(locale, rate.description_fr, rate.description_ar, rate.description_en);
                return (<article key={rate.id} className={`relative overflow-hidden rounded-3xl border bg-white p-[21px] shadow-soft ${index === 1 ? "border-primary/40 ring-2 ring-primary/10" : "border-line"}`}>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-primary">{formatWeight(rate.max_weight_kg)}</p>
                    <h3 className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-ink">{pick(locale, rate.category_fr, rate.category_ar, rate.category_en)}</h3>
                    <p className="mt-3 text-[27px] font-extrabold tracking-[-0.04em] text-primary">{formatMad(rate.base_price_mad)}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                      {ct("text_fd45ba571a87", "tarif de base", "سعر أساسي", "base fare")}
                    </p>
                    {description ? <p className="mt-4 text-xs leading-6 text-muted">{description}</p> : null}
                    <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[11px] font-semibold text-muted">
                      <ShieldCheck className="h-4 w-4 text-success"/>
                      {ct("text_bdbce9febab4", "Suivi et sécurisé", "تتبع وتسليم مؤمن", "Tracked and secured")}
                    </div>
                  </article>);
            })}
            </div>) : (<EmptyState title={ct("text_b310ecd98789", "Aucun tarif publié", "لا توجد أسعار منشورة", "No parcel rates")} description={ct("text_dd9085ae6490", "Contactez notre équipe pour connaître le tarif de votre envoi.", "تواصلوا مع فريقنا لمعرفة أسعار إرسالياتكم.", "Contact our team for a quote for your parcel.")} action={{ href: cmsLink(cms, "link_e0c7bc0426f0", "/contact"), label: ct("text_9f38ae8098e2", "Nous contacter", "اتصلوا بنا", "Contact us") }}/>)}
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-2"><section className="container-page py-16 sm:py-[4.5rem]">
        <div className="grid gap-7 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line shadow-soft">
            <Image src={cmsImage(cms, "image_7f366d3e4316", "/images/cargo-hold.jpg")} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover"/>
          </div>
          <div>
            <SectionHeading eyebrow={ct("text_feecc2f902e8", "Pour les commerçants", "للتجار", "For retailers")} title={ct("text_0239e9bb3b61", "Paiement à la livraison, reversé chaque semaine", "خدمة الدفع عند الاستلام", "Cash on delivery, reconciled weekly")} description={ct("text_94b51582a43e", "Expédiez vos produits avec nous. Nous encaissons à la livraison et vous reversons chaque semaine avec un récapitulatif.", "انقلوا منتجاتكم معنا، ونحن نحصل على المبلغ عند التسليم ونحوّله لكم أسبوعياً مع كشف مفصل.", "Ship your products with us. We collect payment on delivery and pay you weekly with a detailed statement.")}/>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
            { icon: Banknote, fr: ct("text_20e3ebeead0f", "Paiement à la livraison", "الدفع عند التسليم", "Cash on delivery", "fr"), ar: ct("text_20e3ebeead0f", "Paiement à la livraison", "الدفع عند التسليم", "Cash on delivery", "ar"), en: ct("text_20e3ebeead0f", "Paiement à la livraison", "الدفع عند التسليم", "Cash on delivery", "en") },
            { icon: Clock3, fr: ct("text_e4d0b543a685", "Reversement hebdomadaire", "تحويل أسبوعي", "Weekly payout", "fr"), ar: ct("text_e4d0b543a685", "Reversement hebdomadaire", "تحويل أسبوعي", "Weekly payout", "ar"), en: ct("text_e4d0b543a685", "Reversement hebdomadaire", "تحويل أسبوعي", "Weekly payout", "en") },
            { icon: Package, fr: ct("text_7ae43de7089d", "Colis traçables", "أمانات قابلة للتتبع", "Trackable parcels", "fr"), ar: ct("text_7ae43de7089d", "Colis traçables", "أمانات قابلة للتتبع", "Trackable parcels", "ar"), en: ct("text_7ae43de7089d", "Colis traçables", "أمانات قابلة للتتبع", "Trackable parcels", "en") },
            { icon: ShieldCheck, fr: ct("text_2b34a2619a8b", "Compartiment sécurisé", "صندوق مؤمن", "Secured compartment", "fr"), ar: ct("text_2b34a2619a8b", "Compartiment sécurisé", "صندوق مؤمن", "Secured compartment", "ar"), en: ct("text_2b34a2619a8b", "Compartiment sécurisé", "صندوق مؤمن", "Secured compartment", "en") },
        ].map((item) => (<div key={item.fr} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary"/>
                  <p className="text-sm font-bold text-ink">{locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}</p>
                </div>))}
            </div>
            <Link href={cmsLink(cms, "link_fd6dc411307f", "/contact")} className={`${buttonClass("primary", "md")} mt-6`}>
              {ct("text_dddf86c53ff6", "Parler à l'équipe Irsaliyat", "تواصل مع فريق إرساليات", "Talk to the Irsaliyat team")}
            </Link>
          </div>
        </div>
      </section></CmsBuiltin>
    </></CmsPage>;
}
