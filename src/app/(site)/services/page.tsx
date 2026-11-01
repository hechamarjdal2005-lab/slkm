import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Clock3, GraduationCap, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react";
import { DEFAULT_SERVICES } from "@/lib/service-content";
import { QuoteForm } from "@/components/quote-form";
import { Badge, buttonClass, PageHero, SectionHeading } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getSiteSettings } from "@/lib/queries";
import { normalizePhone, pick } from "@/lib/utils";
export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("services", { "title": "Transport de personnel", "description": "Des solutions de transport sur mesure pour entreprises et institutions : personnel, tourisme et scolaire, avec suivi et coordination." }); }
export default async function ServicesPage() {
    const locale = await getLocale();
    const cms = await getPageCMS("services");
    const ct = createTranslator(cms, locale);
    const settings = await getSiteSettings();
    const address = pick(locale, settings?.address_fr, settings?.address_ar, settings?.address_en);
    const offers = (settings?.analytics_config?.services ?? DEFAULT_SERVICES).filter(item => item.is_active !== false).map((offer, index) => ({
        image: offer.image_url, icon: [Building2, MapPin, GraduationCap][index % 3],
        titleFr: offer.title_fr, titleAr: offer.title_ar, titleEn: offer.title_en,
        textFr: offer.description_fr, textAr: offer.description_ar, textEn: offer.description_en
    }));
    return <CmsPage cms={cms}><>
      <CmsBuiltin sectionKey="hero"><PageHero image={cmsImage(cms, "image_3852bc87a12d", "/images/hero-services.jpg")} eyebrow={ct("text_1e013606c03c", "Solutions entreprises", "حلول الشركات", "Business solutions")} title={ct("text_fd23bd01afda", "Ensemble, allez plus loin", "معاً، إلى أبعد مدى", "Move further, together")} description={ct("text_7e9f0fa7d11a", "Des solutions de transport sur mesure pour entreprises et institutions : personnel, tourisme et scolaire, avec suivi et coordination.", "حلول نقل مخصصة للشركات والمؤسسات: نقل الموظفين، رحلات سياحية ورحلات مدرسية، مع تتبع وتنسيق.", "Tailored transport for companies and institutions: staff mobility, tourism and school trips, with tracking and coordination.")}>
        <Link href={cmsLink(cms, "link_bd01e7548213", "#devis")} className={buttonClass("secondary", "lg")}>
          {ct("text_3767bd206863", "Demander un devis", "اطلب عرض أسعار", "Request a quote")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180"/>
        </Link>
      </PageHero></CmsBuiltin>

      <CmsBuiltin sectionKey="section-1"><section className="container-page py-16 sm:py-[4.5rem]">
        <SectionHeading eyebrow={ct("text_88a1b6779e84", "Nos offres", "عروضنا", "Our offers")} title={ct("text_4a8d041ca795", "Une solution de mobilité pour chaque besoin", "حل نقل يناسب كل احتياج", "A mobility solution for every need")} description={ct("text_ef40bc4e956d", "Chaque proposition est construite selon le nombre de passagers, la distance, la fréquence et le niveau de service.", "نصمم كل عرض حسب عدد المسافرين، المسافة، التردد ومستوى الخدمة المطلوب.", "Every proposal is built around passenger count, distance, frequency and service level.")}/>
        <div className="grid gap-6 lg:grid-cols-3">
          {offers.map((offer) => (<article key={offer.titleFr} className="photo-card group flex h-full flex-col">
              <div className="relative aspect-[16/10]">
                <Image src={offer.image} alt={locale === "ar" ? offer.titleAr : locale === "en" ? offer.titleEn : offer.titleFr} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-300 group-hover:scale-[1.025]"/>
                <span className="absolute start-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/95 text-primary">
                  <offer.icon className="h-5 w-5"/>
                </span>
              </div>
              <div className="p-[18px]">
                <h3 className="text-lg font-extrabold tracking-[-0.02em] text-ink">{locale === "ar" ? offer.titleAr : locale === "en" ? offer.titleEn : offer.titleFr}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{locale === "ar" ? offer.textAr : locale === "en" ? offer.textEn : offer.textFr}</p>
                <Link href={cmsLink(cms, "link_8975dc6881f7", "#devis")} className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-primary">{ct("text_3767bd206863", "Demander un devis", "اطلب عرض أسعار", "Request a quote")}<ArrowRight size={16} className="rtl:rotate-180"/></Link>
              </div>
            </article>))}
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-2"><section className="border-y border-line bg-white py-16 sm:py-[4.5rem]">
        <div className="container-page grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow={ct("text_a9c1e59fe075", "Pourquoi SLKM", "لماذا إس إل كي إم", "Why SLKM")} title={ct("text_7ad3d45349f8", "Un partenaire transport que vos équipes connaissent", "شريك نقل تعرفه الفرق", "A transport partner your teams can rely on")} description={ct("text_81208c8b4684", "Trente ans d'expérience terrain, une flotte diversifiée et une équipe de coordination unique pour chaque détail.", "ثلاثون عاماً من الخبرة الميدانية، أسطول متنوع وفريق تنسيق واحد يجمع كل التفاصيل.", "Thirty years of field experience, a diversified fleet and one coordination team for every detail.")}/>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
            { icon: Clock3, fr: ct("text_890e612f8d9b", "Ponctualité suivie", "التزام بالمواعيد", "Tracked punctuality", "fr"), ar: ct("text_890e612f8d9b", "Ponctualité suivie", "التزام بالمواعيد", "Tracked punctuality", "ar"), en: ct("text_890e612f8d9b", "Ponctualité suivie", "التزام بالمواعيد", "Tracked punctuality", "en") },
            { icon: ShieldCheck, fr: ct("text_39291fb20b35", "Sécurité & assurance", "السلامة والتأمين", "Safety & insurance", "fr"), ar: ct("text_39291fb20b35", "Sécurité & assurance", "السلامة والتأمين", "Safety & insurance", "ar"), en: ct("text_39291fb20b35", "Sécurité & assurance", "السلامة والتأمين", "Safety & insurance", "en") },
            { icon: Users, fr: ct("text_7f144d54c07f", "Chauffeurs formés", "سائقون مؤهلون", "Trained drivers", "fr"), ar: ct("text_7f144d54c07f", "Chauffeurs formés", "سائقون مؤهلون", "Trained drivers", "ar"), en: ct("text_7f144d54c07f", "Chauffeurs formés", "سائقون مؤهلون", "Trained drivers", "en") },
            { icon: CheckCircle2, fr: ct("text_7cbe7e5a7bf9", "Facturation entreprise", "فواتير للشركات", "Corporate invoicing", "fr"), ar: ct("text_7cbe7e5a7bf9", "Facturation entreprise", "فواتير للشركات", "Corporate invoicing", "ar"), en: ct("text_7cbe7e5a7bf9", "Facturation entreprise", "فواتير للشركات", "Corporate invoicing", "en") },
        ].map((item) => (<div key={item.fr} className="flex items-start gap-3 rounded-2xl border border-line bg-background p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary"/>
                  <p className="text-sm font-bold text-ink">{locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}</p>
                </div>))}
            </div>
          </div>
          <div className="relative aspect-[16/11] overflow-hidden rounded-3xl border border-line shadow-soft">
            <Image src={cmsImage(cms, "image_1d93533d8035", "/images/serenity-coach.jpg")} alt="" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover"/>
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 backdrop-blur">
              <Badge tone="orange">{ct("text_e0122aab53de", "Flotte récente", "أسطول حديث", "Modern fleet")}</Badge>
              <p className="mt-2 text-sm font-extrabold text-ink">
                {ct("text_118661e672de", "Des autocars équipés pour la route et le quotidien", "حافلات مجهزة للرحلات الطويلة واليومية", "Coaches equipped for long-distance and daily duty")}
              </p>
            </div>
          </div>
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="devis"><section id="devis" className="container-page py-16 sm:py-[4.5rem]">
        <div className="grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <QuoteForm locale={locale}/>
          <aside className="grid gap-4">
            <div className="rounded-3xl border border-line bg-white p-[18px] shadow-soft">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
                {ct("text_f5554ae2f6b7", "Équipe B2B", "فريق الشركات", "B2B desk")}
              </p>
              <h3 className="mt-2 text-lg font-extrabold text-ink">
                {ct("text_81cced723304", "Réponse sous 24 heures", "نتواصل معكم خلال 24 ساعة", "We reply within 24 hours")}
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                {settings?.support_phone ? (<a href={`tel:${normalizePhone(settings.support_phone)}`} className="inline-flex items-center gap-2 transition hover:text-primary">
                    <Phone className="h-4 w-4 text-primary"/>
                    {settings.support_phone}
                  </a>) : null}
                {settings?.contact_email ? (<a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-2 break-all transition hover:text-primary">
                    <Mail className="h-4 w-4 text-primary"/>
                    {settings.contact_email}
                  </a>) : null}
                {address ? (<p className="inline-flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>
                    {address}
                  </p>) : null}
              </div>
            </div>
            <div className="rounded-3xl bg-ink p-[18px] text-white shadow-soft">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                {ct("text_52afccc9bd18", "Institutions", "للمؤسسات", "For institutions")}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                {ct("text_4844600a506a", "Contrats annuels, suivi des trajets et facturation mensuelle structurée.", "عقود سنوية، تتبع الرحلات وفواتير شهرية منظمة.", "Annual contracts, journey tracking and structured monthly invoicing.")}
              </p>
            </div>
          </aside>
        </div>
      </section></CmsBuiltin>
    </></CmsPage>;
}
