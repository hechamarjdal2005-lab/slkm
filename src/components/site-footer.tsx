import Link from "next/link";
import {
  BriefcaseBusiness,
  Camera,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Play,
  Share2,
} from "lucide-react";
import type { Locale, SiteSettings } from "@/lib/types";
import { normalizePhone, pick, whatsappUrl } from "@/lib/utils";

const NAV = [
  { href: "/lignes", fr: "Lignes & agences", ar: "الخطوط والوكالات", en: "Routes & agencies" },
  { href: "/irsaliyat", fr: "Irsaliyat", ar: "إرساليات", en: "Parcels" },
  { href: "/services", fr: "Services B2B", ar: "خدمات الشركات", en: "B2B services" },
  { href: "/about", fr: "Notre histoire", ar: "قصتنا", en: "Our story" },
  { href: "/blog", fr: "Actualités", ar: "الأخبار", en: "News" },
  { href: "/contact", fr: "Contact", ar: "اتصل بنا", en: "Contact" },
];

function SocialIcon({ name }: { name: string }) {
  const className = "h-4 w-4";
  if (name === "facebook") return <Share2 className={className} />;
  if (name === "instagram") return <Camera className={className} />;
  if (name === "linkedin") return <BriefcaseBusiness className={className} />;
  if (name === "youtube") return <Play className={className} />;
  if (name === "tiktok") return <Music2 className={className} />;
  return <Share2 className={className} />;
}

export function SiteFooter({ settings, locale }: { settings: SiteSettings | null; locale: Locale }) {
  const siteName = pick(locale, settings?.site_name_fr, settings?.site_name_ar, settings?.site_name_en) || "SLKM";
  const address = pick(locale, settings?.address_fr, settings?.address_ar, settings?.address_en);
  const whatsapp = settings?.whatsapp_number ?? null;
  const supportPhone = settings?.support_phone ?? null;
  const email = settings?.contact_email ?? null;
  const socials = Object.entries(settings?.social_links ?? {}).filter(([, href]) => Boolean(href));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-primary-dark text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1fr_1.1fr]">
        <div>
          <p className="text-xl font-extrabold tracking-[-0.03em]">{siteName}</p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
            {locale === "ar"
              ? "شبكة وطنية للنقل تربط المدن الكبرى، مع خدمة إرساليات سريعة وحلول تنقل للشركات."
              : locale === "en"
                ? "A national transport network connecting Morocco's major cities, with express parcels and corporate mobility."
                : "Un réseau national de transport qui relie les grandes villes du Maroc, avec Irsaliyat et des solutions de mobilité pour les entreprises."}
          </p>
          {socials.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map(([name, href]) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                  aria-label={name}
                >
                  <SocialIcon name={name} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/45">
            {locale === "ar" ? "تنقل" : locale === "en" ? "Explore" : "Explorer"}
          </p>
          <nav className="mt-4 grid gap-2.5">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-white/70 transition hover:text-white">
                {item[locale]}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/45">
            {locale === "ar" ? "الاتصال" : locale === "en" ? "Contact" : "Nous joindre"}
          </p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {supportPhone ? (
              <a href={`tel:${normalizePhone(supportPhone)}`} className="inline-flex items-start gap-2.5 transition hover:text-white">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright" />
                <span>{supportPhone}</span>
              </a>
            ) : null}
            {whatsapp ? (
              <a href={whatsappUrl(whatsapp, locale === "ar" ? "مرحباً" : "Bonjour") ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2.5 transition hover:text-white">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright" />
                <span>WhatsApp {whatsapp}</span>
              </a>
            ) : null}
            {email ? (
              <a href={`mailto:${email}`} className="inline-flex items-start gap-2.5 break-all transition hover:text-white">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright" />
                <span>{email}</span>
              </a>
            ) : null}
            {address ? (
              <p className="inline-flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary-bright" />
                <span>{address}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/45">
            {locale === "ar" ? "خطوط المساعدة" : locale === "en" ? "Support lines" : "Lignes d'assistance"}
          </p>
          <div className="mt-4 grid gap-2.5">
            {(settings?.emergency_lines ?? []).map((line) => (
              <a key={`${line.phone}-${line.label_fr}`} href={`tel:${normalizePhone(line.phone)}`} className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/25 hover:bg-white/10">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/45">
                  <Clock3 className="h-3 w-3" />
                  {pick(locale, line.label_fr, line.label_ar, line.label_en)}
                </span>
                <span className="mt-1 block text-sm font-bold text-white">{line.phone}</span>
              </a>
            ))}
            {!settings?.emergency_lines?.length ? (
              <p className="text-xs leading-6 text-white/45">
                {locale === "ar" ? "أضف أرقام المساعدة من إعدادات الموقع." : locale === "en" ? "Add support numbers in site settings." : "Ajoutez les numéros d'assistance dans les paramètres du site."}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {siteName}. {locale === "ar" ? "جميع الحقوق محفوظة." : locale === "en" ? "All rights reserved." : "Tous droits réservés."}</p>
          <p>{locale === "ar" ? "المغرب · نقل المسافرين وإرساليات" : locale === "en" ? "Morocco · Passenger transport & Irsaliyat" : "Maroc · Transport de voyageurs & Irsaliyat"}</p>
        </div>
      </div>
    </footer>
  );
}
