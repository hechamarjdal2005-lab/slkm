import Image from "@/components/site-image";
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
    <article id={`agency-${agency.id}`} className="agency-card group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition motion-safe:hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/8.5] overflow-hidden bg-surface-muted">
        {agency.image_url ? (
          <Image src={agency.image_url} alt={city} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-primary-dark text-white">
            <MapPin className="h-8 w-8 opacity-60" />
          </div>
        )}
        <Badge className="absolute start-4 top-4 bg-white/95" tone="primary">{city}</Badge>
      </div>
      <div className="agency-card-body p-5">
        <h3 className="text-[17px] font-extrabold tracking-[-0.02em] text-ink">{name}</h3>
        <p className="mt-2 line-clamp-2 min-h-11 text-xs leading-5 text-muted">{address}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.lat != null && agency.lng != null ? `${agency.lat},${agency.lng}` : `${address}, ${city}, Maroc`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-xs font-bold text-primary"><MapPin size={14} />{locale === "ar" ? "الاتجاهات" : locale === "en" ? "Directions" : "Itinéraire"}</a>
          {agency.phone_number ? (
            <a href={`tel:${agency.phone_number.replace(/\s/g, "")}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-ink transition hover:border-primary/40 hover:text-primary">
              <Phone className="h-3.5 w-3.5" />
              {locale === "ar" ? "اتصل" : locale === "en" ? "Call" : "Appeler"}
            </a>
          ) : null}
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-xs font-bold text-success transition hover:border-emerald-300 hover:bg-emerald-50">
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
