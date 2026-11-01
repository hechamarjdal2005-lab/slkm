import catalogJSON from "./cms-defaults.json";
import type { CSSProperties } from "react";
import type { Locale } from "./types";

export type LocalizedCopy = Record<Locale, string>;
export interface CopyField extends LocalizedCopy { label: string; group: string }
export interface PageDefinition {
  slug: string; route: string; label: string;
  copy: Record<string, CopyField>;
  images: Record<string, { src: string; label: string; group: string }>;
  links?: Record<string, { href: string; label: string; group: string }>;
  sections: Array<{ key: string; label: string; sort_order: number }>;
}
export const CMS_CATALOG = catalogJSON as Record<string, PageDefinition>;
export const PAGE_KEYS = Object.keys(CMS_CATALOG);
export const SECTION_KINDS = ["builtin", "text", "image_text", "features", "cta"] as const;
export const BACKGROUNDS = ["default", "white", "orange", "muted"] as const;
export interface CmsSection {
  id: string; page_id: string; section_key: string; label: string;
  kind: typeof SECTION_KINDS[number]; sort_order: number;
  is_active: boolean; is_published: boolean;
  background: typeof BACKGROUNDS[number]; layout: "compact" | "standard";
  title_fr: string; title_ar: string; title_en: string;
  body_fr: string; body_ar: string; body_en: string;
  cta_fr: string; cta_ar: string; cta_en: string; cta_href: string;
  media_asset_id: string | null; image_url: string | null;
  content: { items?: Array<{ title_fr: string; title_ar: string; title_en: string; body_fr: string; body_ar: string; body_en: string }> };
}
export interface CmsPageData {
  id?: string; slug: string; route: string; label: string; configured: boolean;
  title_fr: string; title_ar: string; title_en: string;
  seo_description_fr: string; seo_description_ar: string; seo_description_en: string;
  hero_overlay: number; content: { copy: Record<string, LocalizedCopy>; links?: Record<string, string> };
  images: Record<string, string>; sections: CmsSection[];
}
export interface MediaAsset {
  id: string; storage_path: string; filename: string; mime_type: string; size_bytes: number;
  alt_fr: string; alt_ar: string; alt_en: string; is_published: boolean; is_active: boolean;
  created_at?: string; preview_url?: string;
}
export function fallbackPage(slug: string): CmsPageData {
  const definition = CMS_CATALOG[slug];
  return {
    slug, route: definition?.route ?? "/", label: definition?.label ?? slug, configured: false,
    title_fr: "", title_ar: "", title_en: "", seo_description_fr: "", seo_description_ar: "", seo_description_en: "",
    hero_overlay: .7, content: { copy: {} }, images: {}, sections: [],
  };
}
export function createTranslator(page: CmsPageData, locale: Locale) {
  return (key: string, fr: string, ar: string, en: string, force?: Locale, variables: Record<string, string | number> = {}) => {
    const language = force ?? locale;
    const entry = page.content.copy?.[key];
    const value = typeof entry?.[language] === "string" ? entry[language] : ({ fr, ar, en })[language];
    return value.replace(/\{\{([^}]+)\}\}/g, (match, name: string) => Object.hasOwn(variables, name) ? String(variables[name]) : match);
  };
}
export function cmsImage(page: CmsPageData, key: string, fallback: string) { const value = page.images[key]; return value && isSafeUrl(value, true) ? value : fallback; }
export function cmsLink(page: CmsPageData, key: string, fallback: string) { const value = page.content.links?.[key]; return value && isSafeUrl(value) ? value : fallback; }
export function isSafeUrl(value: string, image = false) {
  if (!value || value.length > 2048 || /[\\\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) {
    return !value.split(/[/?#]/).some(part => { try { return decodeURIComponent(part) === ".."; } catch { return true; } });
  }
  if (!image && /^#[a-zA-Z][\w-]*$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
export const THEME_DEFAULTS = {
  primary_color: "#F97316", secondary_color: "#EA580C", accent_color: "#EA580C",
  font_latin: "jakarta", font_arabic: "cairo", button_style: "rounded", layout: "compact",
  logo_url: "/images/logo-header.jpg", favicon_url: "/icon.svg",
  logo_dark_url: "/images/logo-header.jpg", logo_light_url: "/images/logo-header.jpg", logo_mobile_url: "/images/logo-header.jpg",
  apple_icon_url: "/images/logo-header.jpg", pwa_icon_url: "/images/logo-header.jpg", social_image_url: "/images/og-image.jpg",
  tagline_fr: "Le voyage, en confiance", tagline_ar: "سافروا بثقة", tagline_en: "Travel with confidence",
  announcement_visible: true, footer_socials_visible: true,
  announcement_fr: "Le Maroc nous rapproche.", announcement_ar: "المغرب يجمعنا.", announcement_en: "Morocco brings us closer.",
  seo_title_fr: "", seo_title_ar: "", seo_title_en: "",
  seo_description_fr: "", seo_description_ar: "", seo_description_en: "",
};
export type SitePresentation = typeof THEME_DEFAULTS;
export const BRAND_ASSET_KEYS = ["logo_url", "favicon_url", "logo_dark_url", "logo_light_url", "logo_mobile_url", "apple_icon_url", "pwa_icon_url", "social_image_url"] as const;
export function presentation(value: unknown): SitePresentation {
  const raw = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const result = { ...THEME_DEFAULTS };
  for (const key of Object.keys(THEME_DEFAULTS) as Array<keyof SitePresentation>) {
    if (typeof raw[key] === typeof THEME_DEFAULTS[key]) (result as Record<string, unknown>)[key] = raw[key];
  }
  for (const key of ["primary_color", "secondary_color", "accent_color"] as const) if (!/^#[a-f\d]{6}$/i.test(result[key])) result[key] = THEME_DEFAULTS[key];
  for (const key of BRAND_ASSET_KEYS) if (!isSafeUrl(result[key], true)) result[key] = THEME_DEFAULTS[key];
  for (const key of ["logo_dark_url", "logo_light_url", "logo_mobile_url"] as const) if (raw[key] === undefined) result[key] = result.logo_url;
  if (!["jakarta", "system"].includes(result.font_latin)) result.font_latin = "jakarta";
  if (!["cairo", "system"].includes(result.font_arabic)) result.font_arabic = "cairo";
  if (!["rounded", "soft-square"].includes(result.button_style)) result.button_style = "rounded";
  if (!["compact", "comfortable"].includes(result.layout)) result.layout = "compact";
  return result;
}
function rgb(hex: string) { return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)); }
function luminance(channels: number[]) { return channels.map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0); }
export function themeStyle(theme: SitePresentation): CSSProperties {
  const channels = rgb(theme.primary_color);
  let text = [...channels];
  while (((luminance(rgb("#FFEDD5")) + .05) / (luminance(text) + .05)) < 4.5) text = text.map(value => Math.floor(value * .88));
  const background = luminance(channels);
  const ink = luminance([23, 32, 51]);
  const foreground = (background + .05) / (ink + .05) >= 4.5 ? "#172033" : 1.05 / (background + .05) >= 4.5 ? "#FFFFFF" : "#000000";
  const hover = luminance(rgb(theme.secondary_color));
  const hoverForeground = (hover + .05) / (ink + .05) >= 4.5 ? "#172033" : 1.05 / (hover + .05) >= 4.5 ? "#FFFFFF" : "#000000";
  return {
    "--brand-blue": channels.join(" "), "--brand-orange": channels.join(" "),
    "--orange": theme.primary_color, "--orange-hover": theme.secondary_color,
    "--accent-bright": rgb(theme.accent_color).join(" "),
    "--orange-text": `rgb(${text.join(" ")})`, "--button-ink": foreground, "--button-hover-ink": hoverForeground,
    "--public-latin-font": theme.font_latin === "jakarta" ? "var(--font-jakarta)" : "system-ui",
    "--public-arabic-font": theme.font_arabic === "cairo" ? "var(--font-cairo)" : "Tahoma",
    "--button-radius": theme.button_style === "rounded" ? "12px" : "7px",
  } as CSSProperties;
}
