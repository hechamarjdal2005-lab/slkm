"use client";
import { createTranslator } from "@/lib/cms";
import { usePageCMS } from "@/components/cms-provider";
import { useId, useState } from "react";
import Image from "./site-image";
import { MapPin, Phone, MessageCircle, Clock3 } from "lucide-react";
import type { Locale } from "@/lib/types";
import type { MessagerieAgency, MessagerieSettings } from "@/lib/messagerie";
import { pick, normalizePhone, whatsappUrl } from "@/lib/utils";
import { MessagerieMapImage } from "./messagerie-map-image";

export function MessagerieNetworkSection({ settings, agencies, locale, error = false }: { settings: MessagerieSettings | null; agencies: MessagerieAgency[]; locale: Locale; error?: boolean }) {
  const cms = usePageCMS("irsaliyat");
  const ct = createTranslator(cms, locale);
  const [city, setCity] = useState("");
  const id = useId();
  const t = (fr: string, ar: string, en: string) => pick(locale, fr, ar, en);
  if (settings && !settings.is_active) return null;
  const rows = agencies.filter(a => a.is_active && (!a.agency_id || a.agency?.is_active));
  const cityName = (a: MessagerieAgency) => a.agency ? pick(locale, a.agency.city_fr, a.agency.city_ar, a.agency.city_en) : pick(locale, a.city_fr, a.city_ar, a.city_en);
  const key = (a: MessagerieAgency) => (a.agency?.city_fr || a.city_fr || "").normalize("NFC").trim().toLocaleLowerCase("fr");
  const cities = [...new Map(rows.map(a => [key(a), cityName(a)])).entries()];
  return <section className="border-y border-line bg-background py-12 sm:py-[4.5rem]"><div className="container-page">
    <div className="mb-8 max-w-3xl"><p className="text-xs font-bold uppercase tracking-widest text-primary">SLKM · Irsaliyat</p><h2 className="mt-3 text-[clamp(1.5rem,2.7vw,2.25rem)] font-bold leading-tight text-ink">{pick(locale, settings?.title_fr, settings?.title_ar, settings?.title_en) || ct("text_194d63493fa7", "Notre réseau de messagerie", "شبكة إرسالياتنا", "Our parcel network")}</h2><p className="mt-4 text-base leading-7 text-muted">{pick(locale, settings?.description_fr, settings?.description_ar, settings?.description_en) || ct("text_e35b49703650", "Découvrez les villes et agences desservies par notre service de livraison de colis et d'envois.", "اكتشفوا المدن والوكالات التي تغطيها خدمة إرسال الطرود لدينا.", "Discover the cities and agencies served by our parcel delivery service.")}</p></div>
    {settings?.map_image_url ? <MessagerieMapImage key={settings.map_image_url} src={settings.map_image_url} locale={locale} /> : <div role="status" className="rounded-2xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted"><MapPin className="mx-auto mb-3 text-primary" />{error ? ct("text_0b7897cb8ec3", "Les informations du réseau sont momentanément indisponibles.", "معلومات الشبكة غير متاحة حالياً.", "Network information is temporarily unavailable.") : ct("text_b7f5ef931116", "La carte du réseau sera prochainement disponible.", "ستتوفر خريطة الشبكة قريباً.", "The network map will be available soon.")}</div>}
    {cities.length > 0 && <ul aria-label={ct("text_621061dc7a98", "Villes desservies", "المدن المخدومة", "Served cities")} className="mt-6 flex flex-wrap gap-2">{cities.map(([k, label]) => <li key={k} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-primary">{label}</li>)}</ul>}
    <div className="mb-5 mt-10 flex flex-wrap items-end justify-between gap-4"><h3 className="text-xl font-bold text-ink">{ct("text_6f13f83e5a9b", "Nos agences de messagerie", "وكالات إرسالياتنا", "Our parcel agencies")}</h3>{cities.length > 1 && <div><label htmlFor={id} className="mb-2 block text-sm text-muted">{ct("text_6f4bb3e25693", "Filtrer par ville", "تصفية حسب المدينة", "Filter by city")}</label><select id={id} value={city} onChange={e => setCity(e.target.value)} className="min-h-11 max-w-full rounded-xl border border-line bg-white px-4 text-sm"><option value="">{ct("text_e92207923058", "Toutes les villes", "جميع المدن", "All cities")}</option>{cities.map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></div>}</div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{rows.filter(a => !city || key(a) === city).map(a => {
      const shared = a.agency;
      const name = shared ? pick(locale, shared.agency_name_fr, shared.agency_name_ar, shared.agency_name_en) : pick(locale, a.name_fr, a.name_ar, a.name_en);
      const address = shared ? pick(locale, shared.address_fr, shared.address_ar, shared.address_en) : pick(locale, a.address_fr, a.address_ar, a.address_en);
      const phone = shared?.phone_number || a.phone;
      const wa = whatsappUrl(shared?.whatsapp_number || a.whatsapp, t(`Bonjour, je souhaite envoyer un colis depuis ${cityName(a)}.`, `مرحباً، أريد إرسال طرد من ${cityName(a)}.`, `Hello, I would like to send a parcel from ${cityName(a)}.`));
      const hours = pick(locale, a.opening_hours_fr, a.opening_hours_ar, a.opening_hours_en);
      const photo = shared?.image_url || a.image_url;
      const lat = shared?.lat ?? a.lat;
      const lng = shared?.lng ?? a.lng;
      const details = <>
        {photo && <Image src={photo} alt={name} width={600} height={300} className="mb-4 h-36 w-full rounded-xl object-cover" />}
        {(a.agents ?? []).filter(agent => agent.is_active !== false).map((agent, index) => <div key={index} className="mt-3 border-t border-line pt-3 text-sm"><p className="font-bold">{agent.name}</p><p className="text-muted">{pick(locale, agent.role_fr, agent.role_ar, agent.role_en)}</p><div className="flex flex-wrap gap-3"><a className="inline-flex min-h-11 items-center text-primary" href={`tel:${normalizePhone(agent.phone)}`}><bdi>{agent.phone}</bdi></a><a className="inline-flex min-h-11 items-center break-all text-primary" href={`mailto:${agent.email}`}>{agent.email}</a></div></div>)}
        {lat != null && lng != null && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-primary"><MapPin size={15}/>{cityName(a)}</a>}
      </>;
      return <article key={a.id} className="rounded-2xl border border-line bg-white p-[18px] shadow-soft">{details}<p className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-primary"><MapPin size={16} />{cityName(a)}</p><h4 className="font-bold text-ink">{name}</h4>{address && <p className="mt-3 text-sm leading-6 text-muted">{address}</p>}{hours && <p className="mt-3 flex items-start gap-2 whitespace-pre-line text-sm text-muted"><Clock3 size={16} className="mt-1 shrink-0" />{hours}</p>}<div className="mt-4 flex flex-wrap gap-2">{phone && <a href={`tel:${normalizePhone(phone)}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm text-primary"><Phone size={15} /><bdi>{phone}</bdi></a>}{wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-3 text-sm font-bold text-white"><MessageCircle size={16} />WhatsApp</a>}</div></article>;
    })}</div>
    {!rows.length && <p role="status" className="rounded-2xl border border-dashed border-line bg-white p-8 text-sm text-muted">{ct("text_e98461de52c3", "Les coordonnées des agences de messagerie seront publiées prochainement.", "ستنشر بيانات وكالات الإرساليات قريباً.", "Parcel agency contact details will be published soon.")}</p>}
  </div></section>;
}
