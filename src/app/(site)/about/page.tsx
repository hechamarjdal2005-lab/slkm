import { createTranslator, cmsImage, cmsLink } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import { CmsPage, CmsBuiltin } from "@/components/cms-page";
import type { Metadata } from "next";
import Image from "@/components/site-image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, Users } from "lucide-react";
import { AgencyMap } from "@/components/agency-map";
import { Badge, buttonClass, EmptyState, PageHero, SectionHeading, StatCard } from "@/components/ui";
import { getLocale } from "@/lib/locale";
import { getAgencies, getSiteSettings } from "@/lib/queries";
import { pick } from "@/lib/utils";
export async function generateMetadata(): Promise<Metadata> { return getCMSMetadata("about", { "title": "Notre histoire", "description": "Des équipes locales dans chaque ville, qui connaissent les routes et les attentes des voyageurs." }); }
export default async function AboutPage() {
    const locale = await getLocale();
    const cms = await getPageCMS("about");
    const ct = createTranslator(cms, locale);
    const [settings, agencies] = await Promise.all([getSiteSettings(), getAgencies()]);
    const stats = settings?.analytics_config.stats?.filter(item => item.is_active !== false) ?? [];
    const timeline = settings?.analytics_config.timeline?.filter(item => item.is_active !== false) ?? [];
    const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";
    const values = [
        {
            icon: ShieldCheck,
            fr: ct("text_e1170ab1997e", "Sécurité d'abord", "السلامة أولاً", "Safety first", "fr"),
            ar: ct("text_e1170ab1997e", "Sécurité d'abord", "السلامة أولاً", "Safety first", "ar"),
            en: ct("text_e1170ab1997e", "Sécurité d'abord", "السلامة أولاً", "Safety first", "en"),
            textFr: ct("text_164066236600", "Des véhicules suivis, des chauffeurs formés et des procédures de contrôle à chaque départ.", "مركبات متتبعة، سائقون مؤهلون وإجراءات مراقبة عند كل رحلة.", "Tracked vehicles, trained drivers and control procedures at every departure.", "fr"),
            textAr: ct("text_164066236600", "Des véhicules suivis, des chauffeurs formés et des procédures de contrôle à chaque départ.", "مركبات متتبعة، سائقون مؤهلون وإجراءات مراقبة عند كل رحلة.", "Tracked vehicles, trained drivers and control procedures at every departure.", "ar"),
            textEn: ct("text_164066236600", "Des véhicules suivis, des chauffeurs formés et des procédures de contrôle à chaque départ.", "مركبات متتبعة، سائقون مؤهلون وإجراءات مراقبة عند كل رحلة.", "Tracked vehicles, trained drivers and control procedures at every departure.", "en")
        },
        {
            icon: HeartHandshake,
            fr: ct("text_a4ed9ff495ee", "Proximité", "القرب من الناس", "Closeness", "fr"),
            ar: ct("text_a4ed9ff495ee", "Proximité", "القرب من الناس", "Closeness", "ar"),
            en: ct("text_a4ed9ff495ee", "Proximité", "القرب من الناس", "Closeness", "en"),
            textFr: ct("text_d1e1254035e1", "Des équipes locales dans chaque ville, qui connaissent les routes et les attentes des voyageurs.", "فرق محلية في كل مدينة تعرف الطرق وتطلعات المسافرين.", "Local teams in every city who know the roads and what travellers need.", "fr"),
            textAr: ct("text_d1e1254035e1", "Des équipes locales dans chaque ville, qui connaissent les routes et les attentes des voyageurs.", "فرق محلية في كل مدينة تعرف الطرق وتطلعات المسافرين.", "Local teams in every city who know the roads and what travellers need.", "ar"),
            textEn: ct("text_d1e1254035e1", "Des équipes locales dans chaque ville, qui connaissent les routes et les attentes des voyageurs.", "فرق محلية في كل مدينة تعرف الطرق وتطلعات المسافرين.", "Local teams in every city who know the roads and what travellers need.", "en")
        },
        {
            icon: Sparkles,
            fr: ct("text_1915ad464625", "Exigence", "الجودة", "Excellence", "fr"),
            ar: ct("text_1915ad464625", "Exigence", "الجودة", "Excellence", "ar"),
            en: ct("text_1915ad464625", "Exigence", "الجودة", "Excellence", "en"),
            textFr: ct("text_fbf2b0944ae5", "Une flotte renouvelée, des départs à l'heure et un service client accessible 24/7.", "أسطول متجدد، رحلات في الموعد وخدمة عملاء متاحة 24/7.", "A renewed fleet, on-time departures and customer service available 24/7.", "fr"),
            textAr: ct("text_fbf2b0944ae5", "Une flotte renouvelée, des départs à l'heure et un service client accessible 24/7.", "أسطول متجدد، رحلات في الموعد وخدمة عملاء متاحة 24/7.", "A renewed fleet, on-time departures and customer service available 24/7.", "ar"),
            textEn: ct("text_fbf2b0944ae5", "Une flotte renouvelée, des départs à l'heure et un service client accessible 24/7.", "أسطول متجدد، رحلات في الموعد وخدمة عملاء متاحة 24/7.", "A renewed fleet, on-time departures and customer service available 24/7.", "en")
        },
    ];
    return <CmsPage cms={cms}><>
      <CmsBuiltin sectionKey="hero"><PageHero image={cmsImage(cms, "image_9fce0732de23", "/images/hero-about.jpg")} eyebrow={ct("text_652cd9603ac8", "Notre histoire", "قصتنا", "Our story")} title={ct("text_51ef54c529de", "Du souk d'Inezgane à un réseau national", "من سوق إنزكان إلى شبكة وطنية", "From the Inezgane market to a national network")} description={ct("text_26b72d60c687", `${siteName} a commencé avec une liaison et une idée claire : un transport sûr et régulier au service des gens. Aujourd'hui, la même route continue avec une flotte moderne et une équipe qui connaît le Maroc.`, `بدأت ${siteName} برحلة واحدة ورؤية واضحة: نقل آمن ومنتظم يخدم الناس. اليوم، نواصل نفس الطريق بأسطول حديث وفريق يفهم المغرب.`, `${siteName} began with one route and a clear vision: safe, reliable transport for local people. Today, the same road continues with a modern fleet and a team that knows Morocco.`, undefined, { "siteName": siteName })}/></CmsBuiltin>

      <CmsBuiltin sectionKey="section-1"><section className="container-page -mt-10 relative z-10">
        <div className="grid gap-3 rounded-3xl border border-line bg-white p-4 shadow-lift sm:grid-cols-2 lg:grid-cols-4 sm:p-[18px]">
          {(stats.length ? stats : [
            { key: "agencies", value: String(agencies.length), label_fr: "Agences", label_ar: "وكالات", label_en: "Agencies" },
        ]).map((stat) => (<StatCard key={stat.key} value={stat.value} label={pick(locale, stat.label_fr, stat.label_ar, stat.label_en)}/>))}
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-2"><section className="container-page py-16 sm:py-[4.5rem]">
        <div className="grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative">
            <div className="relative aspect-square max-h-[520px] overflow-hidden rounded-2xl border border-line shadow-soft">
              <Image src={cmsImage(cms, "image_19e23c8c7648", "/images/ceo.jpg")} alt="" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover"/>
            </div>
            <div className="absolute -bottom-5 -end-3 max-w-[220px] rounded-2xl bg-ink p-4 text-white shadow-lift sm:end-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">
                {ct("text_5a3031c4680d", "Fondateur", "المؤسس", "Founder")}
              </p>
              <p className="mt-1 text-sm font-extrabold">Moulay Mbarek</p>
              <p className="mt-1 text-[11px] leading-5 text-white/60">
                {ct("text_54b9497e87db", "Une vision familiale depuis 1992", "رؤية عائلية منذ 1992", "A family vision since 1992")}
              </p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow={ct("text_8c6db3af58e2", "L'histoire", "الحكاية", "The story")} title={ct("text_1148cf3ee1c8", "Trente ans sur la même route", "ثلاثون عاماً على نفس الطريق", "Thirty years on the same road")}/>
            <div className="grid gap-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
              <p>
                {ct("text_5775e5336150", "En 1992, les premières rotations partaient du cœur du souk d'Inezgane pour relier villages et centres urbains du Souss. Les débuts étaient modestes, mais l'engagement était total : respecter les horaires et servir les gens avec honnêteté.", "في 1992، انطلقت أولى الرحلات من قلب سوق إنزكان لربط القرى والحواضر بمنطقة سوس. كانت البداية متواضعة، لكن الالتزام كان كبيراً: احترام المواعيد وخدمة الناس بصدق.", "In 1992, the first journeys left the heart of the Inezgane market, connecting villages and towns across the Souss. The start was modest, but the commitment was clear: keep to the schedule and serve people honestly.")}
              </p>
              <p>
                {ct("text_6974fce44f26", "Au fil des années, le réseau s'est étendu vers le nord et le sud, et Irsaliyat a ajouté le transport de colis sur les mêmes autocars. Aujourd'hui, nous réunissons voyageurs, messagerie express et mobilité d'entreprise.", "مع مرور السنوات، توسعت الشبكة نحو الشمال والجنوب، وانضافت خدمة إرساليات لنقل الأمانات مع نفس الحافلات. اليوم، نجمع بين نقل المسافرين، التوصيل السريع وحلول النقل للشركات.", "Over the years the network expanded north and south, and Irsaliyat added parcel transport on the same coaches. Today we bring together passenger travel, express delivery and corporate mobility.")}
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
            { fr: ct("text_7541c2434aed", "Un réseau national", "شبكة وطنية", "A national network", "fr"), ar: ct("text_7541c2434aed", "Un réseau national", "شبكة وطنية", "A national network", "ar"), en: ct("text_7541c2434aed", "Un réseau national", "شبكة وطنية", "A national network", "en") },
            { fr: ct("text_6fae79c72db8", "Des équipes locales", "فرق محلية", "Local teams", "fr"), ar: ct("text_6fae79c72db8", "Des équipes locales", "فرق محلية", "Local teams", "ar"), en: ct("text_6fae79c72db8", "Des équipes locales", "فرق محلية", "Local teams", "en") },
            { fr: ct("text_5852bcae1f62", "Une flotte moderne", "أسطول حديث", "A modern fleet", "fr"), ar: ct("text_5852bcae1f62", "Une flotte moderne", "أسطول حديث", "A modern fleet", "ar"), en: ct("text_5852bcae1f62", "Une flotte moderne", "أسطول حديث", "A modern fleet", "en") },
            { fr: ct("text_d925c104e333", "Un service humain", "خدمة إنسانية", "Human service", "fr"), ar: ct("text_d925c104e333", "Un service humain", "خدمة إنسانية", "Human service", "ar"), en: ct("text_d925c104e333", "Un service humain", "خدمة إنسانية", "Human service", "en") },
        ].map((item) => (<p key={item.fr} className="flex items-center gap-2 text-sm font-bold text-ink">
                  <CheckCircle2 className="h-4 w-4 text-success"/>
                  {locale === "ar" ? item.ar : locale === "en" ? item.en : item.fr}
                </p>))}
            </div>
          </div>
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-3"><section className="border-y border-line bg-white py-16 sm:py-[4.5rem]">
        <div className="container-page">
          <SectionHeading eyebrow={ct("text_09e7d2cf376c", "Les étapes", "المراحل", "Milestones")} title={ct("text_66d2df0e0bda", "Les moments qui ont façonné le trajet", "محطات شكلت مسارنا", "Moments that shaped the journey")} align="center"/>
          {timeline.length ? (<div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-y-0 start-[19px] w-px bg-line md:start-1/2"/>
              <div className="grid gap-7">
                {timeline.map((item, index) => (<article key={item.year} className={`relative grid gap-5 ps-12 md:grid-cols-2 md:items-center md:gap-9 md:ps-0 ${index % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
                    <div className={`${index % 2 ? "md:ps-12" : "md:pe-12 md:text-end"}`}>
                      <Badge tone="orange">{item.year}</Badge>
                      <h3 className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-ink">{pick(locale, item.title_fr, item.title_ar, item.title_en)}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted">{pick(locale, item.description_fr, item.description_ar, item.description_en)}</p>
                    </div>
                    <div className={`relative ${index % 2 ? "md:pe-12" : "md:ps-12"}`}>
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line shadow-soft">
                        <Image src={item.image_url} alt={pick(locale, item.title_fr, item.title_ar, item.title_en)} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition duration-300 hover:scale-[1.02]"/>
                      </div>
                      <span className="absolute -start-[37px] top-8 h-4 w-4 rounded-full border-4 border-white bg-primary shadow md:start-auto md:left-1/2 md:-translate-x-1/2"/>
                    </div>
                  </article>))}
              </div>
            </div>) : (<EmptyState title={ct("text_d0c8a757b7e7", "Aucune étape publiée", "لا توجد مراحل منشورة", "No milestones yet")} description={ct("text_49f6c0ea2f85", "Contactez-nous pour en savoir plus sur SLKM.", "تواصلوا معنا لمعرفة المزيد عن SLKM.", "Contact us to learn more about SLKM.")}/>)}
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-4"><section className="container-page py-16 sm:py-[4.5rem]">
        <SectionHeading eyebrow={ct("text_c3201fad6f90", "Nos valeurs", "قيمنا", "Our values")} title={ct("text_fb69107a96df", "Ce qui ne change pas", "ما لا يتغير مع مرور السنوات", "What never changes")} align="center"/>
        <div className="grid gap-5 lg:grid-cols-3">
          {values.map((value) => (<article key={value.fr} className="rounded-3xl border border-line bg-white p-[21px] shadow-soft">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                <value.icon className="h-5 w-5"/>
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-ink">{locale === "ar" ? value.ar : locale === "en" ? value.en : value.fr}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{locale === "ar" ? value.textAr : locale === "en" ? value.textEn : value.textFr}</p>
            </article>))}
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-5"><section className="border-y border-line bg-white py-16 sm:py-[4.5rem]">
        <div className="container-page grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <SectionHeading eyebrow={ct("text_d95a1270801d", "Présence", "الحضور", "Presence")} title={ct("text_17c70e1250fa", "Notre réseau sur la carte", "شبكتنا على الخريطة", "Our network on the map")} description={ct("text_b140ab9fb32c", `${agencies.length} agences actives relient le nord, le centre et le sud.`, `${agencies.length} وكالة نشطة تربط الشمال والوسط والجنوب.`, `${agencies.length} active agencies connecting north, centre and south.`, undefined, { "agencies.length": agencies.length })} href={cmsLink(cms, "link_3bd6b58d0eb5", "/lignes")} linkLabel={ct("text_f139c54b7dd6", "Toutes les agences", "كل الوكالات", "All agencies")}/>
            <Link href={cmsLink(cms, "link_72a342010d62", "/contact")} className={buttonClass("primary", "md")}>
              {ct("text_9f38ae8098e2", "Nous contacter", "تواصل معنا", "Contact us")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180"/>
            </Link>
          </div>
          <AgencyMap agencies={agencies} locale={locale} height="460px"/>
        </div>
      </section></CmsBuiltin>

      <CmsBuiltin sectionKey="section-6"><section className="container-page py-16 sm:py-[4.5rem]">
        <div className="rounded-3xl bg-ink p-7 text-white shadow-lift sm:p-9">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-white/70">
                <Users className="h-3.5 w-3.5"/>
                {ct("text_cc48426bf7db", "Rejoignez le voyage", "انضموا إلى رحلتنا", "Join the journey")}
              </p>
              <h2 className="mt-2 text-[22px] font-extrabold tracking-[-0.03em] sm:text-[27px]">
                {ct("text_fda674ddaf45", "Que vous voyagiez ou travailliez avec nous, bienvenue", "سواء كنتم مسافراً أو شريكاً، مرحباً بكم", "Whether you travel or partner with us, welcome")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">
                {ct("text_ffcadf5671ac", "Découvrez nos lignes ou demandez une offre adaptée à vos équipes.", "استكشفوا خطوطنا أو اطلبوا عرضاً مخصصاً لفريقكم.", "Explore our routes or request a tailored offer for your team.")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={cmsLink(cms, "link_a6d076cfdd50", "/lignes")} className={buttonClass("white", "md")}>{ct("text_567565cc67ca", "Les lignes", "الخطوط", "Routes")}</Link>
              <Link href={cmsLink(cms, "link_4e08d4e7785a", "/services")} className={buttonClass("secondary", "md")}>{ct("text_330a53f83685", "Un devis", "عرض أسعار", "Get a quote")}</Link>
            </div>
          </div>
        </div>
      </section></CmsBuiltin>
    </></CmsPage>;
}
