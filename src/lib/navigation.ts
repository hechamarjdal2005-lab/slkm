export interface NavigationItem { href: string; fr: string; ar: string; en: string; header: boolean; footer: boolean; dock: boolean; dock_fr?: string; dock_ar?: string; dock_en?: string }
export const NAV_DEFAULTS: NavigationItem[] = [
  { href: "/", fr: "Accueil", ar: "الرئيسية", en: "Home", header: true, footer: false, dock: true },
  { href: "/lignes", fr: "Lignes & agences", ar: "الخطوط والوكالات", en: "Routes & agencies", header: true, footer: true, dock: true, dock_fr: "Lignes", dock_ar: "الخطوط", dock_en: "Routes" },
  { href: "/irsaliyat", fr: "Messageries", ar: "إرساليات", en: "Parcels", header: true, footer: true, dock: true, dock_fr: "Colis", dock_ar: "إرساليات", dock_en: "Parcels" },
  { href: "/about", fr: "Notre histoire", ar: "قصتنا", en: "Our story", header: true, footer: true, dock: false },
  { href: "/services", fr: "Transport de personnel", ar: "نقل الموظفين", en: "Staff transport", header: true, footer: true, dock: false },
  { href: "/contact", fr: "Contact", ar: "اتصل بنا", en: "Contact", header: true, footer: true, dock: true },
  { href: "/blog", fr: "Actualités", ar: "الأخبار", en: "News", header: false, footer: true, dock: false },
];
export interface Navigation { items: NavigationItem[]; cta_href: string; cta_fr: string; cta_ar: string; cta_en: string }
export function navigation(value: unknown): Navigation {
  try { return validateNavigation(value); } catch { return { items: NAV_DEFAULTS, cta_href: "", cta_fr: "Réserver", cta_ar: "احجز", cta_en: "Book" }; }
}
export function validateNavigation(value: unknown): Navigation {
  const raw = value as Navigation;
  if (!raw || !Array.isArray(raw.items) || raw.items.length !== NAV_DEFAULTS.length || new Set(raw.items.map(item => item.href)).size !== NAV_DEFAULTS.length) throw new Error("Conservez les destinations du menu.");
  const items = raw.items.map(item => {
    if (!NAV_DEFAULTS.some(route => route.href === item.href)) throw new Error("Destination inconnue.");
    for (const locale of ["fr", "ar", "en"] as const) if (typeof item[locale] !== "string" || !item[locale].trim() || item[locale].length > 100) throw new Error("Libellés FR / AR / EN requis (100 caractères maximum).");
    for (const key of ["header", "footer", "dock"] as const) if (typeof item[key] !== "boolean") throw new Error("Visibilité invalide.");
    const result = Object.fromEntries(["href", "fr", "ar", "en", "header", "footer", "dock"].map(key => [key, item[key as keyof NavigationItem]])) as unknown as NavigationItem;
    for (const locale of ["fr", "ar", "en"] as const) {
      const key = `dock_${locale}` as const;
      if (item[key] !== undefined && (typeof item[key] !== "string" || !item[key]!.trim() || item[key]!.length > 100)) throw new Error("Libellé mobile invalide.");
      result[key] = item[key] ?? NAV_DEFAULTS.find(row => row.href === item.href)?.[key] ?? item[locale];
    }
    return result;
  });
  if (typeof raw.cta_href !== "string" || (raw.cta_href !== "" && !NAV_DEFAULTS.some(route => route.href === raw.cta_href))) throw new Error("Choisissez une destination interne existante.");
  for (const locale of ["fr", "ar", "en"] as const) if (typeof raw[`cta_${locale}`] !== "string" || !raw[`cta_${locale}`].trim() || raw[`cta_${locale}`].length > 100) throw new Error("Libellé du bouton invalide.");
  return { items, cta_href: raw.cta_href, cta_fr: raw.cta_fr, cta_ar: raw.cta_ar, cta_en: raw.cta_en };
}
