import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const posts = await getBlogPosts();
  const staticRoutes = ["", "/lignes", "/irsaliyat", "/services", "/about", "/blog", "/contact"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" || path === "/lignes" || path === "/blog" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
