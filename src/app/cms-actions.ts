"use server";
import { randomUUID } from "node:crypto";
import { validateNavigation } from "@/lib/navigation";
import { revalidatePath } from "next/cache";
import { authorizedAdminClient } from "@/lib/supabase/admin";
import { CMS_CATALOG, BRAND_ASSET_KEYS, type CmsPageData } from "@/lib/cms";
import { parseCMSPayload, validatePagePayload, validatePresentation, validateSection, detectImageType, type CmsActionState } from "@/lib/cms-validation";

type Admin = Awaited<ReturnType<typeof authorizedAdminClient>>;
export async function saveNavigation(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const navigation = validateNavigation(parseCMSPayload(form.get("payload")));
    const { error } = await client.from("site_settings").update({ navigation }).eq("id", 1).select("id").single();
    fail(error);
    return "Navigation enregistrée et publiée.";
  });
}
function refresh() { revalidatePath("/", "layout"); revalidatePath("/admin"); }
async function run(operation: (client: Admin) => Promise<string>): Promise<CmsActionState> {
  try { const client = await authorizedAdminClient(); const message = await operation(client); refresh(); return { status: "success", message, revision: Date.now() }; }
  catch (error) { return { status: "error", message: error instanceof Error ? error.message : "Enregistrement impossible. Vérifiez les migrations et votre session admin.", revision: Date.now() }; }
}
function fail(error: { message: string } | null) { if (error) throw new Error("Enregistrement impossible. Vérifiez les migrations, les permissions et les références utilisées."); }
async function publishedMedia(client: Admin, paths: string[]) {
  const ids = paths.map(path => path.match(/^\/media\/([a-f\d-]{36})$/i)?.[1]).filter((id): id is string => Boolean(id));
  if (!ids.length) return;
  const { data, error } = await client.from("site_media_assets").select("id").in("id", ids).eq("is_published", true).eq("is_active", true);
  if (error || new Set(data?.map(asset => asset.id)).size !== new Set(ids).size) throw new Error("Publiez les images dans la médiathèque avant de les utiliser sur une page publique.");
}
export async function saveCMSPage(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const { slug, payload, images } = validatePagePayload(parseCMSPayload(form.get("payload")));
    await publishedMedia(client, Object.values(images));
    const { error } = await client.rpc("save_site_cms_page", { p_slug: slug, p_payload: payload, p_images: images });
    fail(error);
    return "Page enregistrée. Les textes, images et métadonnées publics sont à jour.";
  });
}
export async function resetCMSPage(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const slug = String(form.get("slug") ?? "");
    const defaults = CMS_CATALOG[slug];
    if (!defaults) throw new Error("Page inconnue.");
    const copy = Object.fromEntries(Object.entries(defaults.copy).map(([key, value]) => [key, { fr: value.fr, ar: value.ar, en: value.en }]));
    const links = Object.fromEntries(Object.entries(defaults.links ?? {}).map(([key, value]) => [key, value.href]));
    const payload = { title_fr: "", title_ar: "", title_en: "", seo_description_fr: "", seo_description_ar: "", seo_description_en: "", hero_overlay: .7, content: { copy, links } };
    const images = Object.fromEntries(Object.entries(defaults.images).map(([key, value]) => [key, value.src]));
    const { error } = await client.rpc("save_site_cms_page", { p_slug: slug, p_payload: payload, p_images: images });
    fail(error); return "Les textes et images d’origine ont été restaurés. L’ordre et la visibilité des sections sont conservés.";
  });
}
export async function saveCMSTheme(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const theme = validatePresentation(parseCMSPayload(form.get("payload")));
    await publishedMedia(client, BRAND_ASSET_KEYS.map(key => theme[key]));
    const { data, error } = await client.from("site_settings").update({ presentation: theme }).eq("id", 1).select("id").single();
    fail(error); if (!data) throw new Error("Paramètres introuvables.");
    return "Identité visuelle et réglages globaux enregistrés.";
  });
}
export async function saveCMSSection(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const { slug, id, payload } = validateSection(parseCMSPayload(form.get("payload")));
    const { data: page } = await client.from("site_pages").select("id").eq("slug", slug).single();
    if (!page) throw new Error("Page introuvable : appliquez d’abord les migrations CMS.");
    if (payload.is_active && payload.is_published && payload.media_asset_id) await publishedMedia(client, [`/media/${payload.media_asset_id}`]);
    if (id) {
      const { data: existing } = await client.from("site_sections").select("kind").eq("id", id).eq("page_id", page.id).single();
      if (!existing || existing.kind !== payload.kind) throw new Error("Section introuvable ou type modifié.");
      const { error } = await client.from("site_sections").update(payload).eq("id", id).eq("page_id", page.id).select("id").single(); fail(error);
    } else {
      if (payload.kind === "builtin") throw new Error("Les sections essentielles sont définies par l’application.");
      const { error } = await client.from("site_sections").insert({ ...payload, page_id: page.id, section_key: `custom-${randomUUID()}` }); fail(error);
    }
    return "Section enregistrée. L’ordre et la publication sont appliqués au site.";
  });
}
export async function deleteCMSSection(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const { data, error } = await client.from("site_sections").delete().eq("id", String(form.get("id"))).neq("kind", "builtin").select("id");
    fail(error); if (!data?.length) throw new Error("Section essentielle protégée : désactivez-la plutôt que la supprimer.");
    return "Section personnalisée supprimée.";
  });
}
export async function uploadCMSMedia(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const file = form.get("file");
    if (!file || typeof file === "string" || file.size < 1 || file.size > 5242880) throw new Error("Choisissez une image de 5 Mo maximum.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (file.type && file.type !== type.mime) throw new Error("Le contenu de l’image ne correspond pas à son format déclaré.");
    const path = `${randomUUID()}.${type.extension}`;
    const { error: uploadError } = await client.storage.from("site-media").upload(path, bytes, { contentType: type.mime, upsert: false }); fail(uploadError);
    const text = (key: string) => String(form.get(key) ?? "").trim().slice(0, 400);
    const { error } = await client.from("site_media_assets").insert({ storage_path: path, filename: file.name.slice(0, 255), mime_type: type.mime, size_bytes: file.size, alt_fr: text("alt_fr"), alt_ar: text("alt_ar"), alt_en: text("alt_en"), is_published: form.get("is_published") === "on" });
    if (error) { await client.storage.from("site-media").remove([path]); fail(error); }
    return "Image ajoutée à la médiathèque.";
  });
}
export async function updateCMSMedia(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const payload = { is_published: form.get("is_published") === "on", is_active: form.get("is_active") === "on", ...Object.fromEntries(["fr", "ar", "en"].map(locale => [`alt_${locale}`, String(form.get(`alt_${locale}`) ?? "").trim().slice(0, 400)])) };
    if (!payload.is_published || !payload.is_active) {
      const id = String(form.get("id"));
      const url = `/media/${id}`;
      const results = await Promise.all([
        client.from("site_settings").select("presentation,analytics_config").eq("id", 1).single(),
        client.from("agencies").select("id").eq("image_url", url),
        client.from("blog_posts").select("id").eq("cover_image_url", url),
        client.from("messagerie_network_settings").select("id").eq("map_image_url", url),
        client.from("messagerie_agencies").select("id").eq("image_url", url),
        client.from("site_page_media").select("id").eq("asset_id", id),
        client.from("site_sections").select("id").eq("media_asset_id", id),
      ]);
      if (results.some(result => result.error)) throw new Error("Vérification des références impossible. Aucune modification effectuée.");
      if (JSON.stringify(results[0].data).includes(url) || results.slice(1).some(result => Array.isArray(result.data) && result.data.length)) throw new Error("Cette image est utilisée. Remplacez ses références avant de la dépublier ou de la désactiver.");
    }
    const { error } = await client.from("site_media_assets").update(payload).eq("id", String(form.get("id"))).select("id").single(); fail(error);
    return "Métadonnées et publication de l’image mises à jour.";
  });
}
export async function deleteCMSMedia(_state: CmsActionState, form: FormData) {
  return run(async client => {
    const id = String(form.get("id"));
    const { data: settings, error: settingsError } = await client.from("site_settings").select("presentation,analytics_config").eq("id", 1).single();
    if (settingsError || !settings) throw new Error("Vérification des références impossible. Aucune suppression effectuée.");
    const [agencies, posts] = await Promise.all([client.from("agencies").select("id").eq("image_url", `/media/${id}`), client.from("blog_posts").select("id").eq("cover_image_url", `/media/${id}`)]);
    const { data: network, error: networkError } = await client.from("messagerie_network_settings").select("id").eq("map_image_url", `/media/${id}`);
    const { data: parcelAgencies, error: parcelError } = await client.from("messagerie_agencies").select("id").eq("image_url", `/media/${id}`);
    if (parcelError || agencies.error || posts.error || networkError) throw new Error("Vérification des références impossible. Aucune suppression effectuée.");
    if (parcelAgencies?.length || network?.length || JSON.stringify(settings).includes(`/media/${id}`) || agencies.data?.length || posts.data?.length) throw new Error("Cette image est utilisée. Remplacez ses références avant de la supprimer.");
    const { data, error } = await client.from("site_media_assets").delete().eq("id", id).select("storage_path").single();
    if (error || !data) throw new Error("Image utilisée par une page/section ou introuvable. Les références existantes sont protégées.");
    const { error: removal } = await client.storage.from("site-media").remove([data.storage_path]);
    return removal ? "Référence supprimée. Un administrateur doit retirer le fichier orphelin du stockage." : "Image et fichier supprimés.";
  });
}
