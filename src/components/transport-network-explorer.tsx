"use client";
import { createTranslator, cmsImage } from "@/lib/cms";
import { usePageCMS } from "@/components/cms-provider";
import { useId, useMemo, useState } from "react";
import { ArrowLeftRight, ArrowUpRight, MapPin, RotateCcw, Search } from "lucide-react";
import type { Agency, Locale, RouteWithAgencies } from "@/lib/types";
import { activeRoutes, cityKey, filterRoutes, resolveCity, routeCities } from "@/lib/transport";
import { pick } from "@/lib/utils";
import { AgencyMap } from "./agency-map";
import { AgencyCard } from "./agency-card";
import { RouteCard } from "./route-card";
import { buttonClass, fieldClass, labelClass } from "./ui";
export type NetworkProps = {
    routes: RouteWithAgencies[];
    agencies: Agency[];
    locale: Locale;
    whatsapp: string | null;
    initialFrom?: string;
    initialTo?: string;
    initialDate?: string;
    initialClass?: string;
    showAgencies?: boolean;
};
export function TransportNetworkExplorer({ routes, agencies, locale, whatsapp, initialFrom, initialTo, initialDate, initialClass, showAgencies = false }: NetworkProps) {
    const cms = usePageCMS("lignes");
    const ct = createTranslator(cms, locale);
    const t = (fr: string, ar: string, en: string) => pick(locale, fr, ar, en);
    const id = useId();
    const available = useMemo(() => activeRoutes(routes), [routes]);
    const validFrom = routeCities(available, "from").some(([key]) => key === resolveCity(available, initialFrom)) ? resolveCity(available, initialFrom) : "";
    const validTo = routeCities(available, "to", validFrom).some(([key]) => key === resolveCity(available, initialTo)) ? resolveCity(available, initialTo) : "";
    const [from, setFrom] = useState(validFrom);
    const [to, setTo] = useState(validTo);
    const [date, setDate] = useState(initialDate ?? "");
    const [busType, setBusType] = useState(initialClass ?? "");
    const initialLimit = showAgencies ? 6 : 3;
    const [limit, setLimit] = useState(initialLimit);
    const [agencyLimit, setAgencyLimit] = useState(6);
    const [selectedRoute, setSelectedRoute] = useState<string>();
    const [selectedAgency, setSelectedAgency] = useState<string>();
    const [mode, setMode] = useState<"both" | "agencies" | "routes">("both");
    const [agencyCity, setAgencyCity] = useState("");
    function chooseRoute(id: string) { setSelectedRoute(id); setSelectedAgency(undefined); }
    function chooseAgency(id: string) { setSelectedAgency(id); setSelectedRoute(undefined); }
    const origins = routeCities(available, "from");
    const destinations = routeCities(available, "to", from);
    const classes = [...new Set(available.map(r => r.bus_type))];
    const visible = filterRoutes(available, { from, to, date, busType });
    const canSwap = Boolean(from && to && filterRoutes(available, { from: to, to: from }).length);
    const relevantAgencies = agencies.filter(a => !agencyCity || cityKey(a) === agencyCity);
    const agencyCities = [...new Map(agencies.map(a => [cityKey(a), a])).entries()];
    const label = (a: Agency) => pick(locale, a.city_fr, a.city_ar, a.city_en);
    function reset() { setFrom(""); setTo(""); setDate(""); setBusType(""); setSelectedRoute(undefined); setSelectedAgency(undefined); setAgencyCity(""); setLimit(initialLimit); const params = new URLSearchParams(window.location.search); ["from", "to", "date", "class"].forEach(k => params.delete(k)); window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}`); }
    function updateFrom(value: string) {
        setFrom(value);
        setLimit(initialLimit);
        setSelectedRoute(undefined);
        setSelectedAgency(undefined);
        if (!routeCities(available, "to", value).some(([key]) => key === to))
            setTo("");
    }
    function persist() {
        const params = new URLSearchParams(window.location.search);
        for (const [key, value] of Object.entries({ from, to, date, class: busType }))
            value ? params.set(key, value) : params.delete(key);
        window.history.replaceState(null, "", `${window.location.pathname}${params.size ? `?${params}` : ""}${window.location.hash}`);
        setLimit(initialLimit);
        document.getElementById(`${id}-results`)?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    return <div className="network-explorer">
    <div className="network-layout">
      <div className="network-search">
        <span className="section-kicker">{ct("text_dc4ad13b105b", "Le Maroc, à votre portée", "المغرب بين أيديكم", "Morocco, within reach")}</span>
        <h2 className="mt-3 text-[clamp(1.375rem,2.4vw,1.8rem)] font-extrabold leading-tight text-primary-dark">{ct("text_a5bd8192fffa", "Où souhaitez-vous aller ?", "إلى أين تريدون السفر؟", "Where would you like to go?")}</h2>
        <p className="mb-5 mt-3 text-sm leading-6 text-muted">{ct("text_a01fe144c1c2", "Explorez nos lignes et contactez votre agence pour réserver.", "استكشفوا خطوطنا وتواصلوا مع الوكالة للحجز.", "Explore our routes and contact your agency to book.")}</p>
        <form onSubmit={e => { e.preventDefault(); persist(); }} className="grid gap-3.5">
          <div><label className={labelClass} htmlFor={`${id}-from`}>{ct("text_0bc226ec29cd", "Ville de départ", "مدينة الانطلاق", "Departure city")}</label>
            <select id={`${id}-from`} className={fieldClass} value={from} onChange={e => updateFrom(e.target.value)}><option value="">{ct("text_735327915fee", "Tous les départs", "جميع الانطلاقات", "All departures")}</option>{origins.map(([key, a]) => <option key={key} value={key}>{label(a)}</option>)}</select></div>
          <div className="flex items-end gap-2"><div className="min-w-0 flex-1"><label className={labelClass} htmlFor={`${id}-to`}>{ct("text_5f80f2a8bf91", "Ville d’arrivée", "مدينة الوصول", "Arrival city")}</label>
            <select id={`${id}-to`} className={fieldClass} value={to} onChange={e => { setTo(e.target.value); setSelectedRoute(undefined); setSelectedAgency(undefined); setLimit(initialLimit); }}><option value="">{ct("text_de2349b723f7", "Toutes les destinations", "جميع الوجهات", "All destinations")}</option>{destinations.map(([key, a]) => <option key={key} value={key}>{label(a)}</option>)}</select></div>
            <button type="button" disabled={!canSwap} title={ct("text_551c4bc6eb34", "Inverser si le retour existe", "عكس الاتجاه إذا توفر", "Swap when a return route exists")} aria-label={ct("text_8a26078a12f2", "Inverser les villes", "عكس المدن", "Swap cities")} onClick={() => { setFrom(to); setTo(from); setLimit(initialLimit); setSelectedRoute(undefined); }} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line text-primary transition hover:bg-primary-soft disabled:opacity-30"><ArrowLeftRight size={18}/></button></div>
          <div className="grid grid-cols-2 gap-3">
            {available.some(r => r.days_of_week.length) && <div><label className={labelClass} htmlFor={`${id}-date`}>{ct("text_99c40ab40592", "Date", "التاريخ", "Date")}</label><input id={`${id}-date`} type="date" className={fieldClass} value={date} onChange={e => { setDate(e.target.value); setLimit(initialLimit); setSelectedRoute(undefined); setSelectedAgency(undefined); }}/></div>}
            <div><label className={labelClass} htmlFor={`${id}-class`}>{ct("text_fec19fe3d560", "Classe", "الفئة", "Class")}</label><select id={`${id}-class`} className={fieldClass} value={busType} onChange={e => { setBusType(e.target.value); setLimit(initialLimit); setSelectedRoute(undefined); setSelectedAgency(undefined); }}><option value="">{ct("text_42623b97b481", "Toutes", "الكل", "All")}</option>{classes.map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <button className={buttonClass("secondary")} type="submit"><Search size={17}/>{ct("text_10505fb03757", "Rechercher un trajet", "البحث عن رحلة", "Find a journey")}</button>
        </form>
        <button onClick={reset} className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-bold text-primary"><RotateCcw size={14}/>{ct("text_c1705fc3641b", "Revenir à la vue nationale", "العودة إلى العرض الوطني", "Return to national view")}</button>
      </div>
      <div className="min-w-0 bg-background">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-white px-4 py-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold text-primary"><MapPin size={16}/>{ct("text_1e77d7378f6c", "Le réseau SLKM", "شبكة SLKM", "The SLKM network")}</p>
          <div className="flex gap-1" role="group" aria-label={ct("text_3c5f6dd25632", "Affichage carte", "عرض الخريطة", "Map display")}>{(["both", "agencies", "routes"] as const).map(v => <button key={v} aria-pressed={mode === v} onClick={() => setMode(v)} className={`min-h-11 rounded-xl px-3 text-xs font-semibold ${mode === v ? "bg-primary text-white" : "text-muted hover:bg-background"}`}>{v === "both" ? ct("text_bcda4a955df7", "Tout", "الكل", "All") : v === "agencies" ? ct("text_c7d44d72fa47", "Agences", "الوكالات", "Agencies") : ct("text_d08e01417571", "Lignes", "الخطوط", "Routes")}</button>)}</div>
        </div>
        <AgencyMap agencies={relevantAgencies} routes={visible} locale={locale} height="clamp(360px, 42vw, 550px)" mode={mode} selectedRoute={selectedRoute} selectedAgency={selectedAgency} onSelectRoute={chooseRoute} onSelectAgency={chooseAgency} fitRoutes={Boolean(from || to || date || busType)} className="network-map"/>
        <p className="px-4 py-3 text-xs leading-5 text-muted">{ct("text_74c28f96ba0d", "Liaisons géographiques indicatives : elles ne représentent pas les routes routières. Seules les agences avec coordonnées sont localisées.", "روابط جغرافية تقريبية لا تمثل المسارات الطرقية. تظهر فقط الوكالات ذات الإحداثيات.", "Indicative geographic connections, not road itineraries. Only agencies with coordinates are mapped.")}</p>
      </div>
    </div>
    <div id={`${id}-results`} className="scroll-mt-32 pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-extrabold text-primary-dark">{ct("text_c9e34c310b35", "Les trajets disponibles", "الخطوط المتاحة", "Available routes")}</h3><p role="status" className="text-sm text-muted">{visible.length} {ct("text_e0fd3c8b26e5", "lignes", "خطوط", "routes")}</p></div>
      <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">{visible.slice(0, limit).map(r => <div key={r.id} className={selectedRoute === r.id ? "rounded-2xl ring-2 ring-primary" : ""}><button className="mb-2 inline-flex min-h-11 items-center gap-1 text-xs font-bold text-primary" onClick={() => { chooseRoute(r.id); setMode("both"); }}><ArrowUpRight size={14}/>{ct("text_f1c90bceffe5", "Localiser cette ligne", "عرض الخط على الخريطة", "Locate this route")}</button><RouteCard route={r} locale={locale} whatsapp={whatsapp} date={date || undefined} compact/></div>)}</div>
      {!visible.length && <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center"><h3 className="font-bold text-primary-dark">{ct("text_4e0534017cae", "Aucun trajet correspondant", "لا توجد رحلة مطابقة", "No matching journeys")}</h3><p className="mt-2 text-sm text-muted">{ct("text_80f102fc3c61", "Modifiez les villes, la date ou la classe, ou contactez notre équipe.", "غيروا المدن أو التاريخ أو الفئة أو تواصلوا مع فريقنا.", "Change the cities, date or class, or contact our team.")}</p></div>}
      {limit < visible.length && <button className={`${buttonClass("ghost")} mt-5`} onClick={() => setLimit(limit + 6)}>{ct("text_35d5f8e60822", "Afficher plus de lignes", "عرض المزيد من الخطوط", "Show more routes")}</button>}
    </div>
    {showAgencies && <section className="mt-12 border-t border-line pt-10" id="agencies"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><h2 className="text-2xl font-extrabold text-primary-dark">{ct("text_277f2e31ace1", "Nos agences", "وكالاتنا", "Our agencies")}</h2><div><label htmlFor={`${id}-agency-city`} className={labelClass}>{ct("text_6f4bb3e25693", "Filtrer par ville", "تصفية حسب المدينة", "Filter by city")}</label><select id={`${id}-agency-city`} className={fieldClass} value={agencyCity} onChange={e => { setAgencyCity(e.target.value); setAgencyLimit(6); setSelectedAgency(undefined); }}><option value="">{ct("text_f139c54b7dd6", "Toutes les agences", "جميع الوكالات", "All agencies")}</option>{agencyCities.map(([key, a]) => <option key={key} value={key}>{label(a)}</option>)}</select></div></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relevantAgencies.slice(0, agencyLimit).map(a => <div key={a.id}><button onClick={() => { chooseAgency(a.id); setMode("both"); document.getElementById(`${id}-from`)?.closest(".network-explorer")?.scrollIntoView({ block: "start" }); }} className="mb-2 min-h-9 text-sm font-bold text-primary">{ct("text_8baf531b9ade", "Voir sur la carte", "عرض على الخريطة", "View on map")}</button><AgencyCard agency={a} locale={locale}/></div>)}</div>{agencyLimit < relevantAgencies.length && <button className={`${buttonClass("ghost")} mt-5`} onClick={() => setAgencyLimit(relevantAgencies.length)}>{ct("text_0aa81762192d", "Voir toutes les agences", "عرض جميع الوكالات", "View all agencies")}</button>}</section>}
  </div>;
}
