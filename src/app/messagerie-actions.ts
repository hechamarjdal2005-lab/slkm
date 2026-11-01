"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSafeUrl } from "@/lib/cms";
import { createClient } from "@/lib/supabase/server";

function finish(message: string, error = false): never {
  redirect(`/admin?tab=messagerie&${error ? "error" : "success"}=${encodeURIComponent(message)}`);
}
async function authorized() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") finish("Session administrateur requise.", true);
  return client;
}
const text = (f: FormData, name: string) => String(f.get(name) ?? "").trim();
const optional = (f: FormData, name: string) => text(f, name) || null;
function refresh() { revalidatePath("/irsaliyat"); revalidatePath("/admin"); }
export async function saveMessagerieSettings(form: FormData) {
  const client = await authorized();
  const image = optional(form, "map_image_url");
  if (image && !isSafeUrl(image, true)) finish("URL de carte invalide.", true);
  if (image) {
    try {
      const url = new URL(image, "https://local.invalid");
      if (!(image.startsWith("/") && !image.startsWith("//")) && (url.protocol !== "https:" || url.username || url.password)) throw new Error();
    } catch { finish("Image : utilisez un chemin local ou une URL HTTPS sans identifiants.", true); }
  }
  const payload = { id: 1, map_image_url: image, is_active: form.get("is_active") === "on", ...Object.fromEntries(["title_fr", "title_ar", "title_en", "description_fr", "description_ar", "description_en"].map(k => [k, text(form, k)])) };
  const { error } = await client.from("messagerie_network_settings").upsert(payload);
  if (error) finish("Enregistrement impossible. Vérifiez la migration et les permissions.", true);
  refresh(); finish("Réseau Messagerie enregistré.");
}
export async function saveMessagerieAgency(form: FormData) {
  const client = await authorized();
  const id = optional(form, "id");
  const agencyId = optional(form, "agency_id");
  const image = agencyId ? null : optional(form, "image_url");
  const lat = agencyId || !optional(form, "lat") ? null : Number(text(form, "lat"));
  const lng = agencyId || !optional(form, "lng") ? null : Number(text(form, "lng"));
  if (image && !isSafeUrl(image, true)) finish("URL de photo invalide.", true);
  if ((lat === null) !== (lng === null) || (lat !== null && (!Number.isFinite(lat) || Math.abs(lat) > 90)) || (lng !== null && (!Number.isFinite(lng) || Math.abs(lng) > 180))) finish("Coordonnées invalides.", true);
  let agents: unknown[];
  try {
    const raw = text(form, "agents") || "[]";
    if (Buffer.byteLength(raw) > 32768) throw new Error();
    agents = JSON.parse(raw);
    if (!Array.isArray(agents) || agents.length > 20) throw new Error();
    agents = agents.map(value => {
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
      const row = value as Record<string, unknown>;
      const result: Record<string, string | boolean> = {};
      for (const key of ["name", "role_fr", "role_ar", "role_en", "phone", "email"]) {
        if (typeof row[key] !== "string" || row[key].length > 200 || row[key].includes("\0")) throw new Error();
        result[key] = row[key].trim();
      }
      if (!result.name || !result.role_fr || !result.role_ar || !result.role_en || !/^\+?[\d ()-]{3,32}$/.test(String(result.phone)) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(result.email))) throw new Error();
      if (row.is_active !== undefined && typeof row.is_active !== "boolean") throw new Error();
      result.is_active = row.is_active !== false;
      return result;
    });
  } catch { finish("Agents : nom, fonction FR/AR/EN, téléphone et e-mail valides requis (20 maximum).", true); }
  const order = Number(text(form, "display_order"));
  if (!Number.isInteger(order) || order < 0) finish("L’ordre doit être un entier positif ou nul.", true);
  if (agencyId) {
    const { data, error } = await client.from("agencies").select("id").eq("id", agencyId).maybeSingle();
    if (error || !data) finish("Agence liée introuvable.", true);
  } else if (!text(form, "name_fr") || !text(form, "city_fr")) finish("Nom et ville français requis pour une agence indépendante.", true);
  const payload = {
    image_url: image, lat, lng, agents,
    agency_id: agencyId, is_active: form.get("is_active") === "on", display_order: order,
    ...Object.fromEntries(["name_fr", "name_ar", "name_en", "city_fr", "city_ar", "city_en", "address_fr", "address_ar", "address_en", "phone", "whatsapp"].map(k => [k, agencyId ? null : optional(form, k)])),
    ...Object.fromEntries(["opening_hours_fr", "opening_hours_ar", "opening_hours_en"].map(k => [k, optional(form, k)])),
  };
  const result = id ? await client.from("messagerie_agencies").update(payload).eq("id", id).select("id") : await client.from("messagerie_agencies").insert(payload).select("id");
  if (result.error || !result.data?.length) finish("Agence non enregistrée : vérifiez les permissions ou un éventuel doublon d’agence liée.", true);
  refresh(); finish("Agence Messagerie enregistrée.");
}
export async function deleteMessagerieAgency(form: FormData) {
  const client = await authorized();
  const { data, error } = await client.from("messagerie_agencies").delete().eq("id", text(form, "id")).select("id");
  if (error || !data?.length) finish("Suppression impossible.", true);
  refresh(); finish("Agence retirée du réseau Messagerie. L’agence source est conservée.");
}
