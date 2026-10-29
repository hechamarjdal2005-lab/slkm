"use client";

import { useMemo, useState } from "react";
import { Bus, SlidersHorizontal } from "lucide-react";
import type { Agency, Locale, RouteWithAgencies } from "@/lib/types";
import { pick } from "@/lib/utils";
import { RouteCard } from "./route-card";
import { fieldClass, labelClass } from "./ui";

export function LinesExplorer({
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
  const [busType, setBusType] = useState("");
  const [touristOnly, setTouristOnly] = useState(false);

  const visible = useMemo(
    () =>
      routes.filter((route) => {
        if (from && route.from_agency_id !== from) return false;
        if (to && route.to_agency_id !== to) return false;
        if (busType && route.bus_type !== busType) return false;
        if (touristOnly && !route.is_tourist_route) return false;
        return true;
      }),
    [routes, from, to, busType, touristOnly],
  );

  return (
    <div>
      <div className="rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm font-extrabold text-ink">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {locale === "ar" ? "تصفية الخطوط" : locale === "en" ? "Filter routes" : "Filtrer les lignes"}
          </p>
          <p className="text-xs font-bold text-muted">
            {locale === "ar" ? `${visible.length} خط` : locale === "en" ? `${visible.length} routes` : `${visible.length} lignes`}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="lines-from" className={labelClass}>{locale === "ar" ? "الانطلاق" : locale === "en" ? "From" : "Départ"}</label>
            <select id="lines-from" value={from} onChange={(event) => setFrom(event.target.value)} className={fieldClass}>
              <option value="">{locale === "ar" ? "كل المدن" : locale === "en" ? "All cities" : "Toutes les villes"}</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>{pick(locale, agency.city_fr, agency.city_ar, agency.city_en)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lines-to" className={labelClass}>{locale === "ar" ? "الوصول" : locale === "en" ? "To" : "Arrivée"}</label>
            <select id="lines-to" value={to} onChange={(event) => setTo(event.target.value)} className={fieldClass}>
              <option value="">{locale === "ar" ? "كل المدن" : locale === "en" ? "All cities" : "Toutes les villes"}</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>{pick(locale, agency.city_fr, agency.city_ar, agency.city_en)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="lines-class" className={labelClass}>{locale === "ar" ? "الفئة" : locale === "en" ? "Class" : "Classe"}</label>
            <select id="lines-class" value={busType} onChange={(event) => setBusType(event.target.value)} className={fieldClass}>
              <option value="">{locale === "ar" ? "كل الفئات" : locale === "en" ? "All classes" : "Toutes les classes"}</option>
              <option value="Comfort">Comfort</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
        </div>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-muted">
          <input type="checkbox" checked={touristOnly} onChange={(event) => setTouristOnly(event.target.checked)} className="h-4 w-4 rounded border-line text-primary focus:ring-primary" />
          {locale === "ar" ? "الخطوط السياحية فقط" : locale === "en" ? "Tourist routes only" : "Lignes touristiques uniquement"}
        </label>
      </div>

      {visible.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((route) => (
            <RouteCard key={route.id} route={route} locale={locale} whatsapp={whatsapp} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-line bg-white/70 p-10 text-center">
          <Bus className="mx-auto h-7 w-7 text-primary" />
          <p className="mt-3 text-sm font-bold text-ink">
            {locale === "ar" ? "لا توجد خطوط مطابقة" : locale === "en" ? "No matching routes" : "Aucune ligne correspondante"}
          </p>
          <p className="mt-1 text-xs text-muted">
            {locale === "ar" ? "غيّر مدن الانطلاق أو الوصول." : locale === "en" ? "Change the origin or destination city." : "Modifiez la ville de départ ou d'arrivée."}
          </p>
        </div>
      )}
    </div>
  );
}
