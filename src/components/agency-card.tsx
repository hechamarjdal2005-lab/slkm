import Image from "next/image";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import type { Agency, Locale } from "@/lib/types";
import { pick, whatsappUrl } from "@/lib/utils";
import { Badge } from "./ui";

export function AgencyCard({ agency, locale }: { agency: Agency; locale: Locale }) {
  const city = pick(locale, agency.city_fr, agency.city_ar, agency.city_en);
  const name = pick(locale, agency.agency_name_fr, agency.agency_name_ar, agency.agency_name_en);
  const address = pick(locale, agency.address_fr, agency.address_ar, agency.address_en);
  const wa = whatsappUrl(agency.whatsapp_number, locale === "ar" ? `مرحباً، أريد معلومات حول وكالة ${city}.` : locale === "en" ? `Hello, I need information about the ${city} agency.` : `Bonjour, je souhaite des informations sur l'agence de ${city}.`);

  return (
    <article id={`agency-${agency.id}`} className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-muted">
        {agency.image_url ? (
          <Image src={agency.image_url} alt={city} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-primary-dark text-white">
            <MapPin className="h-8 w-8 opacity-60" />
          </div>
        )}
        <Badge className="absolute start-4 top-4 bg-white/95" tone="primary">{city}</Badge>
      </div>
      <div className="p-5">
        <h3 className="truncate text-lg font-extrabold tracking-[-0.02em] text-ink">{name}</h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted">{address}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {agency.phone_number ? (
            <a href={`tel:${agency.phone_number.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-bold text-ink transition hover:border-primary/40 hover:text-primary">
              <Phone className="h-3.5 w-3.5" />
              {locale === "ar" ? "اتصل" : locale === "en" ? "Call" : "Appeler"}
            </a>
          ) : null}
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-bold text-success transition hover:border-emerald-300 hover:bg-emerald-50">
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
