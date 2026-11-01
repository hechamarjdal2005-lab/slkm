import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/queries";
import { presentation } from "@/lib/cms";
export const dynamic = "force-dynamic";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  const theme = presentation(settings?.presentation);
  return { name: settings?.site_name_fr || "SLKM", short_name: settings?.site_name_fr || "SLKM", start_url: "/", display: "standalone", background_color: "#ffffff", theme_color: theme.primary_color, icons: [{ src: theme.pwa_icon_url, sizes: "any", purpose: "any" }] };
}
