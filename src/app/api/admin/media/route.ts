import { authorizedAdminClient } from "@/lib/supabase/admin";
export async function GET() {
  try {
    const client = await authorizedAdminClient();
    const { data, error } = await client.from("site_media_assets").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(300);
    if (error) return Response.json({ error: "Appliquez les migrations CMS avant d’utiliser la médiathèque." }, { status: 409 });
    const assets = await Promise.all((data ?? []).map(async asset => {
      const { data: image } = await client.storage.from("site-media").createSignedUrl(asset.storage_path, 600);
      return { ...asset, preview_url: image?.signedUrl };
    }));
    return Response.json({ assets }, { headers: { "cache-control": "private, no-store", "x-robots-tag": "noindex" } });
  } catch { return Response.json({ error: "Session administrateur requise." }, { status: 403, headers: { "cache-control": "no-store" } }); }
}
