import { CMS_CATALOG, THEME_DEFAULTS, SECTION_KINDS, BACKGROUNDS, isSafeUrl, presentation, type LocalizedCopy } from "./cms";
export const CMS_INITIAL_STATE = { status: "idle" as "idle" | "success" | "error", message: "", revision: 0 };
export type CmsActionState = typeof CMS_INITIAL_STATE;
const languages = ["fr", "ar", "en"] as const;
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Objet de contenu invalide.");
  return value as Record<string, unknown>;
};
function string(value: unknown, max = 8000, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim()) || value.includes("\0")) throw new Error(`Texte invalide (maximum ${max} caractères).`);
  return value.trim();
}
export function parseCMSPayload(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || Buffer.byteLength(value) > 262144) throw new Error("Contenu manquant ou trop volumineux.");
  try { return object(JSON.parse(value)); } catch { throw new Error("Contenu invalide. Rechargez le formulaire."); }
}
export function validatePagePayload(input: unknown) {
  const raw = object(input);
  const slug = string(raw.slug, 30, true);
  const definition = CMS_CATALOG[slug];
  if (!definition) throw new Error("Page inconnue.");
  const sourceCopy = object(raw.copy);
  const copy: Record<string, LocalizedCopy> = {};
  if (Object.keys(sourceCopy).some(key => !definition.copy[key])) throw new Error("Champ de contenu inconnu.");
  for (const [key, field] of Object.entries(definition.copy)) {
    const entry = sourceCopy[key] === undefined ? field : object(sourceCopy[key]);
    copy[key] = { fr: "", ar: "", en: "" };
    for (const locale of languages) {
      const text = string(entry[locale], 8000, true);
      const required: string[] = Array.from(field[locale].match(/\{\{[^}]+\}\}/g) ?? []);
      if (required.some(token => !text.includes(token)) || (text.match(/\{\{[^}]+\}\}/g) ?? []).some(token => !required.includes(token))) throw new Error("Conservez les variables {{…}} : elles affichent les noms et chiffres réels.");
      copy[key][locale] = text;
    }
  }
  const images: Record<string, string> = {};
  const rawImages = object(raw.images);
  if (Object.keys(rawImages).some(key => !definition.images[key])) throw new Error("Champ image inconnu.");
  for (const [key, field] of Object.entries(definition.images)) {
    const value = string(rawImages[key] ?? field.src, 2048, true);
    if (!isSafeUrl(value, true)) throw new Error("Image : utilisez un chemin local ou une URL HTTPS sûre.");
    images[key] = value;
  }
  const hero = Number(raw.hero_overlay);
  if (!Number.isFinite(hero) || hero < .55 || hero > .9) throw new Error("L’intensité du voile doit être comprise entre 0,55 et 0,90.");
  const links: Record<string, string> = {};
  const rawLinks = object(raw.links ?? {});
  if (Object.keys(rawLinks).some(key => !definition.links?.[key])) throw new Error("Champ de lien inconnu.");
  for (const [key, field] of Object.entries(definition.links ?? {})) {
    const value = string(rawLinks[key] ?? field.href, 2048, true);
    if (!isSafeUrl(value)) throw new Error("Lien invalide : chemin local, ancre ou HTTPS requis.");
    links[key] = value;
  }
  const payload: Record<string, unknown> = { hero_overlay: hero, content: { copy, links } };
  for (const locale of languages) {
    payload[`title_${locale}`] = string(raw[`title_${locale}`] ?? "", 200);
    payload[`seo_description_${locale}`] = string(raw[`seo_description_${locale}`] ?? "", 500);
  }
  return { slug, payload, images };
}
export function validatePresentation(input: unknown) {
  const raw = object(input);
  if (Object.keys(raw).some(key => !(key in THEME_DEFAULTS))) throw new Error("Paramètre de présentation inconnu.");
  const normalized = presentation(raw);
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== typeof THEME_DEFAULTS[key as keyof typeof THEME_DEFAULTS] || normalized[key as keyof typeof normalized] !== value || (typeof value === "string" && value.length > 2000)) throw new Error(`Paramètre invalide : ${key}.`);
  }
  return normalized;
}
export function validateSection(input: unknown) {
  const raw = object(input);
  const slug = string(raw.slug, 30, true);
  if (!CMS_CATALOG[slug]) throw new Error("Page inconnue.");
  const kind = string(raw.kind, 30, true);
  if (!(SECTION_KINDS as readonly string[]).includes(kind)) throw new Error("Type de section invalide.");
  const sort = Number(raw.sort_order);
  if (!Number.isInteger(sort) || sort < 0 || sort > 10000) throw new Error("L’ordre doit être un entier entre 0 et 10000.");
  if (!(BACKGROUNDS as readonly unknown[]).includes(raw.background) || !["compact", "standard"].includes(String(raw.layout))) throw new Error("Choisissez un fond et une disposition proposés.");
  if (typeof raw.is_active !== "boolean" || typeof raw.is_published !== "boolean") throw new Error("État de publication invalide.");
  const payload: Record<string, unknown> = {
    kind, label: string(raw.label, 200, true), sort_order: sort, background: raw.background, layout: raw.layout,
    is_active: raw.is_active, is_published: raw.is_published,
  };
  for (const locale of languages) for (const prefix of ["title", "body", "cta"] as const) payload[`${prefix}_${locale}`] = string(raw[`${prefix}_${locale}`] ?? "", prefix === "body" ? 8000 : 250, kind !== "builtin" && prefix === "title");
  const href = string(raw.cta_href ?? "", 2048);
  if (href && !isSafeUrl(href)) throw new Error("Lien : utilisez un chemin local, une ancre ou HTTPS.");
  const image = string(raw.image_url ?? "", 2048);
  if (image && !isSafeUrl(image, true)) throw new Error("Image invalide.");
  const match = image.match(/^\/media\/([a-f\d-]{36})$/i);
  payload.cta_href = href;
  payload.media_asset_id = match?.[1] ?? null;
  payload.image_url = match ? null : image || null;
  const items = raw.items ?? [];
  if (!Array.isArray(items) || items.length > 12) throw new Error("Douze cartes maximum par section.");
  payload.content = { items: items.map(value => {
    const item = object(value);
    return Object.fromEntries(languages.flatMap(locale => [[`title_${locale}`, string(item[`title_${locale}`], 200, true)], [`body_${locale}`, string(item[`body_${locale}`], 2000)]]));
  }) };
  return { slug, id: typeof raw.id === "string" ? raw.id : null, payload };
}
export function detectImageType(bytes: Uint8Array) {
  const buffer = Buffer.from(bytes);
  if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { mime: "image/png", extension: "png" };
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return { mime: "image/jpeg", extension: "jpg" };
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return { mime: "image/webp", extension: "webp" };
  if (buffer.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(buffer.toString("ascii", 8, 32))) return { mime: "image/avif", extension: "avif" };
  throw new Error("Image non reconnue. Formats autorisés : JPEG, PNG, WebP, AVIF. SVG et HTML ne sont pas acceptés.");
}
