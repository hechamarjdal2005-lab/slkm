import "server-only";
import { cache } from "react";
import { authorizedAdminClient } from "./supabase/admin";
import type { CmsPageData, CmsSection, MediaAsset } from "./cms";
export const getAdminCMS = cache(async () => {
  const client = await authorizedAdminClient();
  const [pages, sections, assets, media] = await Promise.all([
    client.from("site_pages").select("*").order("slug"),
    client.from("site_sections").select("*").order("sort_order").order("id"),
    client.from("site_media_assets").select("*").order("created_at", { ascending: false }).limit(300),
    client.from("site_page_media").select("*"),
  ]);
  const error = pages.error || sections.error || assets.error || media.error;
  if (error) return { ready: false, pages: [] as CmsPageData[], sections: [] as CmsSection[], assets: [] as MediaAsset[], error: "Le CMS nécessite les migrations. Consultez supabase/FINAL_DATABASE/README.md." };
  const library: MediaAsset[] = await Promise.all((assets.data ?? []).map(async asset => {
    const { data } = await client.storage.from("site-media").createSignedUrl(asset.storage_path, 600);
    return { ...asset, preview_url: data?.signedUrl } as MediaAsset;
  }));
  return {
    ready: true, error: "", sections: (sections.data ?? []) as CmsSection[], assets: library,
    pages: (pages.data ?? []).map(page => ({ ...page, configured: true, sections: (sections.data ?? []).filter(section => section.page_id === page.id), images: Object.fromEntries((media.data ?? []).filter(link => link.page_id === page.id).map(link => [link.field_key, link.asset_id ? `/media/${link.asset_id}` : link.external_url])) })) as CmsPageData[],
  };
});
