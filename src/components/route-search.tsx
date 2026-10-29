"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Bus, CalendarDays, MapPin, Search } from "lucide-react";
import type { Agency, Locale, RouteWithAgencies } from "@/lib/types";
import { cn, pick, routeRunsOnDate } from "@/lib/utils";
import { RouteCard } from "./route-card";
import { buttonClass, fieldClass, labelClass } from "./ui";

export function RouteSearch({
  routes,
  agencies,
  locale,
  whatsapp,
  initialFrom,
  initialTo,
}: {
  routes: RouteWithAgencies[];
  agencies: Agency[];
  locale: Locale;
  whatsapp: string | null;
  initialFrom?: string;
  initialTo?: string;
}) {
  const [from, setFrom] = useState(initialFrom ?? "");
  const [to, setTo] = useState(initialTo ?? "");
  const [date, setDate] = useState("");
  const [busType, setBusType] = useState("");
  const [results, setResults] = useState<RouteWithAgencies[] | null>(null);

  const shown = useMemo(() => results ?? routes.slice(0, 4), [results, routes]);

  function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = routes.filter((route) => {
      if (from && route.from_agency_id !== from) return false;
      if (to && route.to_agency_id !== to) return false;
      if (busType && route.bus_type !== busType) return false;
      if (date && !routeRunsOnDate(route.days_of_week, date)) return false;
      return true;
    });
    setResults(next);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const agencyOptions = agencies.map((agency) => ({
    id: agency.id,
    label: pick(locale, agency.city_fr, agency.city_ar, agency.city_en),
  }));

  return (
    <div>
      <form onSubmit={search} className="rounded-3xl border border-line bg-white p-4 shadow-lift sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-sm font-extrabold text-ink">
            <Bus className="h-4 w-4 text-primary" />
            {locale === "ar" ? "ابحث عن رحلتك" : locale === "en" ? "Find your journey" : "Trouvez votre trajet"}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            {locale === "ar" ? "حجز فوري عبر واتساب" : locale === "en" ? "Instant WhatsApp booking" : "Réservation WhatsApp"}
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_0.85fr_0.75fr_auto] lg:items-end">
          <div>
            <label htmlFor="search-from" className={labelClass}>
              {locale === "ar" ? "الانطلاق" : locale === "en" ? "From" : "Départ"}
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
              <select id="search-from" value={from} onChange={(event) => setFrom(event.target.value)} className={cn(fieldClass, "appearance-none ps-9")}>
                <option value="">{locale === "ar" ? "كل المدن" : locale === "en" ? "All cities" : "Toutes les villes"}</option>
                {agencyOptions.map((agency) => (
                  <option key={agency.id} value={agency.id}>{agency.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" onClick={swap} className="hidden h-10 w-10 place-items-center rounded-full border border-line bg-surface-muted text-primary transition hover:bg-primary-soft lg:grid" aria-label="Swap cities">
            <ArrowLeftRight className="h-4 w-4" />
          </button>

          <div>
            <label htmlFor="search-to" className={labelClass}>
              {locale === "ar" ? "الوصول" : locale === "en" ? "To" : "Arrivée"}
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
              <select id="search-to" value={to} onChange={(event) => setTo(event.target.value)} className={cn(fieldClass, "appearance-none ps-9")}>
                <option value="">{locale === "ar" ? "كل المدن" : locale === "en" ? "All cities" : "Toutes les villes"}</option>
                {agencyOptions.map((agency) => (
                  <option key={agency.id} value={agency.id}>{agency.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="search-date" className={labelClass}>
              {locale === "ar" ? "التاريخ" : locale === "en" ? "Date" : "Date"}
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input id="search-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className={cn(fieldClass, "ps-9")} />
            </div>
          </div>

          <div>
            <label htmlFor="search-class" className={labelClass}>
              {locale === "ar" ? "الفئة" : locale === "en" ? "Class" : "Classe"}
            </label>
            <select id="search-class" value={busType} onChange={(event) => setBusType(event.target.value)} className={fieldClass}>
              <option value="">{locale === "ar" ? "الكل" : locale === "en" ? "All" : "Toutes"}</option>
              <option value="Comfort">Comfort</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>

          <button type="submit" className={buttonClass("secondary", "md")}>
            <Search className="h-4 w-4" />
            {locale === "ar" ? "بحث" : locale === "en" ? "Search" : "Chercher"}
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
          {results
            ? locale === "ar"
              ? `${results.length} رحلة`
              : locale === "en"
                ? `${results.length} journeys`
                : `${results.length} trajets`
            : locale === "ar"
              ? "رحلات مقترحة"
              : locale === "en"
                ? "Suggested journeys"
                : "Trajets suggérés"}
        </p>
        {results ? (
          <button type="button" onClick={() => setResults(null)} className="text-xs font-bold text-primary underline-offset-4 hover:underline">
            {locale === "ar" ? "إعادة تعيين" : locale === "en" ? "Reset" : "Réinitialiser"}
          </button>
        ) : null}
      </div>

      {shown.length ? (
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {shown.map((route) => (
            <RouteCard key={route.id} route={route} locale={locale} whatsapp={whatsapp} date={date || undefined} compact />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-3xl border border-dashed border-line bg-white/70 p-8 text-center">
          <p className="text-sm font-bold text-ink">
            {locale === "ar" ? "لا توجد رحلات مطابقة" : locale === "en" ? "No matching journeys" : "Aucun trajet correspondant"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {locale === "ar" ? "جرب مدينة أخرى أو تاريخاً مختلفاً." : locale === "en" ? "Try another city or date." : "Essayez une autre ville ou une autre date."}
          </p>
        </div>
      )}
    </div>
  );
}
