import Link from "next/link";
import { ArrowRight, Bus, Clock3, MapPin } from "lucide-react";
import type { Locale, RouteWithAgencies } from "@/lib/types";
import { cn, daysLabel, durationLabel, formatMad, formatTime, pick, whatsappUrl } from "@/lib/utils";
import { Badge, buttonClass } from "./ui";

export function RouteCard({
  route,
  locale,
  whatsapp,
  date,
  compact = false,
}: {
  route: RouteWithAgencies;
  locale: Locale;
  whatsapp?: string | null;
  date?: string;
  compact?: boolean;
}) {
  const from = route.from_agency;
  const to = route.to_agency;
  const fromCity = from ? pick(locale, from.city_fr, from.city_ar, from.city_en) : "—";
  const toCity = to ? pick(locale, to.city_fr, to.city_ar, to.city_en) : "—";
  const bookingText =
    locale === "ar"
      ? `مرحباً، أرغب في حجز تذكرة من ${fromCity} إلى ${toCity}${date ? ` بتاريخ ${date}` : ""}.`
      : locale === "en"
        ? `Hello, I would like to book a ticket from ${fromCity} to ${toCity}${date ? ` on ${date}` : ""}.`
        : `Bonjour, je souhaite réserver un billet de ${fromCity} à ${toCity}${date ? ` le ${date}` : ""}.`;
  const bookHref = whatsappUrl(whatsapp, bookingText) ?? "/contact";
  const bookLabel = locale === "ar" ? "احجز عبر واتساب" : locale === "en" ? "Book on WhatsApp" : "Réserver sur WhatsApp";

  return (
    <article className="group rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={route.bus_type === "VIP" ? "orange" : route.bus_type === "Premium" ? "primary" : "neutral"}>
            <Bus className="h-3 w-3" />
            {route.bus_type}
          </Badge>
          {route.is_tourist_route ? <Badge tone="green">{locale === "ar" ? "سياحي" : locale === "en" ? "Tourist" : "Touristique"}</Badge> : null}
        </div>
        <p className="text-end text-lg font-extrabold text-primary">{formatMad(route.price_mad)}</p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{formatTime(route.departure_time)}</p>
          <p className="mt-1 truncate text-xl font-extrabold tracking-[-0.03em] text-ink">{fromCity}</p>
          <p className="truncate text-xs text-muted">{from ? pick(locale, from.agency_name_fr, from.agency_name_ar, from.agency_name_en) : ""}</p>
        </div>
        <div className="flex min-w-16 flex-col items-center text-primary">
          <span className="mb-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted">
            <Clock3 className="h-3 w-3" />
            {durationLabel(route.departure_time, route.arrival_time)}
          </span>
          <div className="flex w-full items-center">
            <span className="h-2 w-2 rounded-full border-2 border-primary bg-white" />
            <span className="h-px flex-1 bg-line" />
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            <span className="h-px flex-1 bg-line" />
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="min-w-0 flex-1 text-end">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{formatTime(route.arrival_time)}</p>
          <p className="mt-1 truncate text-xl font-extrabold tracking-[-0.03em] text-ink">{toCity}</p>
          <p className="truncate text-xs text-muted">{to ? pick(locale, to.agency_name_fr, to.agency_name_ar, to.agency_name_en) : ""}</p>
        </div>
      </div>

      <div className={cn("mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4", compact && "mt-4")}>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {daysLabel(route.days_of_week, locale)}
        </p>
        {bookHref.startsWith("http") ? (
          <a href={bookHref} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "sm")}>
            {bookLabel}
          </a>
        ) : (
          <Link href={bookHref} className={buttonClass("primary", "sm")}>
            {bookLabel}
          </Link>
        )}
      </div>
    </article>
  );
}
