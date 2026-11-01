import { navigation } from "@/lib/navigation";
import { createTranslator, cmsImage, presentation } from "@/lib/cms";
import { getPageCMS, getCMSMetadata } from "@/lib/cms-store";
import Image from "@/components/site-image";
import Link from "next/link";
import { BriefcaseBusiness, Camera, Clock3, Mail, MapPin, MessageCircle, Music2, Phone, Play, Share2, } from "lucide-react";
import type { Agency, Locale, SiteSettings } from "@/lib/types";
import { normalizePhone, pick, whatsappUrl } from "@/lib/utils";
const NAV = [
    { href: "/lignes", fr: "Lignes & agences", ar: "الخطوط والوكالات", en: "Routes & agencies" },
    { href: "/irsaliyat", fr: "Messageries", ar: "إرساليات", en: "Parcels" },
    { href: "/services", fr: "Transport de personnel", ar: "نقل الموظفين", en: "Staff transport" },
    { href: "/about", fr: "Notre histoire", ar: "قصتنا", en: "Our story" },
    { href: "/blog", fr: "Actualités", ar: "الأخبار", en: "News" },
    { href: "/contact", fr: "Contact", ar: "اتصل بنا", en: "Contact" },
];
function SocialIcon({ name }: {
    name: string;
}) {
    const className = "h-4 w-4";
    if (name === "facebook")
        return <Share2 className={className}/>;
    if (name === "instagram")
        return <Camera className={className}/>;
    if (name === "linkedin")
        return <BriefcaseBusiness className={className}/>;
    if (name === "youtube")
        return <Play className={className}/>;
    if (name === "tiktok")
        return <Music2 className={className}/>;
    return <Share2 className={className}/>;
}
export async function SiteFooter({ settings, locale, agencies = [] }: {
    settings: SiteSettings | null;
    locale: Locale;
    agencies?: Agency[];
}) {
    const nav = navigation(settings?.navigation);
    const cms = await getPageCMS("global");
    const ct = createTranslator(cms, locale);
    const theme = presentation(settings?.presentation);
    const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";
    const address = pick(locale, settings?.address_fr, settings?.address_ar, settings?.address_en);
    const whatsapp = settings?.whatsapp_number ?? null;
    const supportPhone = settings?.support_phone ?? null;
    const email = settings?.contact_email ?? null;
    const socials = theme.footer_socials_visible ? Object.entries(settings?.social_links ?? {}).filter(([, href]) => Boolean(href)) : [];
    const year = new Date().getFullYear();
    return (<footer className="site-footer mt-8 text-white">
      <div className="container-page grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-[1.35fr_0.9fr_1fr_1.1fr]">
        <div>
          <Image src={theme.logo_dark_url} alt={siteName} width={90} height={54} className="mb-4 rounded-lg bg-white object-contain p-2"/>
          <p className="text-lg font-extrabold tracking-[-0.03em]">{siteName}</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/75">
            {ct("text_c74de52e2e36", "Un réseau national de transport qui relie les grandes villes du Maroc, avec Irsaliyat et des solutions de mobilité pour les entreprises.", "شبكة وطنية للنقل تربط المدن الكبرى، مع خدمة إرساليات سريعة وحلول تنقل للشركات.", "A national transport network connecting Morocco's major cities, with express parcels and corporate mobility.")}
          </p>
          {socials.length ? (<div className="mt-6 flex flex-wrap gap-2">
              {socials.map(([name, href]) => (<a key={name} href={href} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white" aria-label={name}>
                  <SocialIcon name={name}/>
                </a>))}
            </div>) : null}
        </div>

        <div>
          <p className="footer-kicker text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
            {ct("text_c39d646f1076", "Explorer", "تنقل", "Explore")}
          </p>
          <nav className="mt-3 grid gap-1">
            {nav.items.filter(item => item.footer).map((item) => (<Link key={item.href} href={item.href} className="text-sm text-white/70 transition hover:text-white">
                {item[locale]}
              </Link>))}
          </nav>
        </div>

        <div>
          <p className="footer-kicker text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
            {ct("text_44d7e9ead9cc", "Nous joindre", "الاتصال", "Contact")}
          </p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {supportPhone ? (<a href={`tel:${normalizePhone(supportPhone)}`} className="inline-flex items-start gap-2.5 transition hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright"/>
                <bdi dir="ltr">{supportPhone}</bdi>
              </a>) : null}
            {whatsapp ? (<a href={whatsappUrl(whatsapp, locale === "ar" ? "مرحباً" : "Bonjour") ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2.5 transition hover:text-white">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright"/>
                <bdi dir="ltr">WhatsApp {whatsapp}</bdi>
              </a>) : null}
            {email ? (<a href={`mailto:${email}`} className="inline-flex items-start gap-2.5 break-all transition hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright"/>
                <span>{email}</span>
              </a>) : null}
            {address ? (<p className="inline-flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright"/>
                <span>{address}</span>
              </p>) : null}
          </div>
        </div>

        <div>
          <p className="footer-kicker text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
            {ct("text_cdcbda2a3dd2", "Lignes d'assistance", "خطوط المساعدة", "Support lines")}
          </p>
          <div className="mt-4 grid gap-2.5">
            {(settings?.emergency_lines ?? []).map((line) => (<a key={`${line.phone}-${line.label_fr}`} href={`tel:${normalizePhone(line.phone)}`} className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/25 hover:bg-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70">
                  <Clock3 className="h-3 w-3"/>
                  {pick(locale, line.label_fr, line.label_ar, line.label_en)}
                </span>
                <span className="mt-1 block text-sm font-bold text-white"><bdi dir="ltr">{line.phone}</bdi></span>
              </a>))}
            {!settings?.emergency_lines?.length ? (<p className="text-xs leading-6 text-white/70">
                {ct("text_adb674945680", "Contactez-nous pour préparer votre voyage.", "تواصلوا معنا لتحضير رحلتكم.", "Contact us to plan your journey.")}
              </p>) : null}
          </div>
        </div>
      </div>

      {agencies.length > 0 && <div className="container-page grid gap-4 border-t border-white/10 py-7 sm:grid-cols-3">{agencies.slice(0, 3).map(a => <Link key={a.id} href={`/lignes#agency-${a.id}`} className="text-sm text-white/80 transition hover:text-white"><span className="flex items-center gap-2 font-bold"><MapPin size={15} className="text-secondary-bright"/>{pick(locale, a.agency_name_fr, a.agency_name_ar, a.agency_name_en)}</span><span className="mt-2 block text-xs leading-5 text-white/70">{pick(locale, a.address_fr, a.address_ar, a.address_en)}</span></Link>)}</div>}
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[11px] text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. {ct("text_5a9b0ef55c1a", "Tous droits réservés.", "جميع الحقوق محفوظة.", "All rights reserved.")}</p>
          <p>{ct("text_ee26a4e645de", "Maroc · Transport de voyageurs & Irsaliyat", "المغرب · نقل المسافرين وإرساليات", "Morocco · Passenger transport & Irsaliyat")}</p>
        </div>
      </div>
    </footer>);
}
