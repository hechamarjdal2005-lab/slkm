import { anonymousCMSClient } from "@/lib/cms-store";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f\d-]{36}$/i.test(id)) return new Response(null, { status: 404 });
  const client = anonymousCMSClient();
  if (!client) return new Response(null, { status: 404 });
  const { data: asset } = await client.from("site_media_assets").select("storage_path").eq("id", id).eq("is_active", true).eq("is_published", true).maybeSingle();
  if (!asset) return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });
  const { data } = await client.storage.from("site-media").createSignedUrl(asset.storage_path, 120);
  if (!data?.signedUrl) return new Response(null, { status: 404, headers: { "cache-control": "no-store" } });
  return new Response(null, { status: 302, headers: { location: data.signedUrl, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
}
