import "server-only";
import { cache } from "react";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./supabase/env";
import { getLocale } from "./locale";
import { pick } from "./utils";
import { CMS_CATALOG, fallbackPage, presentation, type CmsPageData, type CmsSection, type MediaAsset } from "./cms";
import { getSiteSettings } from "./queries";

export function anonymousCMSClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: init?.signal ?? AbortSignal.timeout(12000) }) },
  });
}
export const getPublicCMS = cache(async () => {
  const pages: Record<string, CmsPageData> = Object.fromEntries(Object.keys(CMS_CATALOG).map(key => [key, fallbackPage(key)]));
  const client = anonymousCMSClient();
  if (!client) return { ready: false, pages };
  try {
    const [pageRows, sections, media] = await Promise.all([
      client.from("site_pages").select("*").eq("is_published", true).eq("is_active", true),
      client.from("site_sections").select("*").eq("is_published", true).eq("is_active", true).order("sort_order").order("id"),
      client.from("site_page_media").select("*, asset:site_media_assets(id,is_active,is_published)"),
    ]);
    // An unapplied optional CMS migration must not break the existing website.
    if (pageRows.error || sections.error || media.error) return { ready: false, pages };
    for (const row of pageRows.data ?? []) {
      if (!CMS_CATALOG[row.slug]) continue;
      const images: Record<string, string> = {};
      for (const link of media.data ?? []) if (link.page_id === row.id) {
        if (link.asset?.is_active && link.asset?.is_published) images[link.field_key] = `/media/${link.asset.id}`;
        else if (!link.asset_id && link.external_url) images[link.field_key] = link.external_url;
      }
      pages[row.slug] = { ...fallbackPage(row.slug), ...row, configured: true, images, sections: (sections.data ?? []).filter(section => section.page_id === row.id) as CmsSection[] };
    }
    return { ready: true, pages };
  } catch { return { ready: false, pages }; }
});
export const getPageCMS = cache(async (slug: string) => (await getPublicCMS()).pages[slug] ?? fallbackPage(slug));
export async function getCMSMetadata(slug: string, fallback: Metadata = {}): Promise<Metadata> {
  const [page, locale, settings] = await Promise.all([getPageCMS(slug), getLocale(), getSiteSettings()]);
  const title = pick(locale, page.title_fr, page.title_ar, page.title_en);
  const description = pick(locale, page.seo_description_fr, page.seo_description_ar, page.seo_description_en);
  const labels: Record<string, {ar:string;en:string}> = { lignes:{ar:"الخطوط والوكالات",en:"Routes & agencies"}, irsaliyat:{ar:"إرساليات",en:"Parcels"}, about:{ar:"قصتنا",en:"Our story"}, services:{ar:"نقل الموظفين",en:"Staff transport"}, contact:{ar:"اتصل بنا",en:"Contact"}, blog:{ar:"الأخبار",en:"News"} };
  const theme = presentation(settings?.presentation);
  const localizedDescription = theme[`seo_description_${locale}`] || (locale === "ar" ? "نقل المسافرين وإرساليات وحلول تنقل الشركات بالمغرب. استكشفوا الخطوط واحجزوا رحلتكم." : "Passenger transport, parcels and corporate mobility in Morocco. Explore routes and book your journey.");
  const resolvedDescription = description || (locale !== "fr" ? localizedDescription : fallback.description);
  return { ...fallback, ...(locale !== "fr" && labels[slug] ? {title: labels[slug][locale]} : {}), ...(title ? { title } : {}), ...(resolvedDescription ? { description:resolvedDescription } : {}), openGraph: { ...fallback.openGraph, ...(resolvedDescription ? { description:resolvedDescription } : {}), images: fallback.openGraph?.images ?? [theme.social_image_url] } };
}
export type { MediaAsset };
