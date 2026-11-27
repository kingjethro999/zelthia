import type { MetadataRoute } from "next";
import { listVerifiedFacilityIds } from "@/lib/server/public-facility";
import { SITE_URL } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date("2026-11-16T00:00:00.000Z");
  const routes: [
    string,
    number,
    MetadataRoute.Sitemap[number]["changeFrequency"],
  ][] = [
    ["", 1, "weekly"],
    ["/chat", 0.9, "weekly"],
    ["/inventory", 0.9, "daily"],
    ["/doctors-note-reader", 0.8, "monthly"],
    ["/for-facilities", 0.8, "monthly"],
    ["/pricing", 0.7, "monthly"],
    ["/coming-soon", 0.4, "monthly"],
    ["/about", 0.7, "monthly"],
    ["/signup", 0.5, "monthly"],
    ["/privacy", 0.3, "yearly"],
    ["/terms", 0.3, "yearly"],
  ];
  const pages: MetadataRoute.Sitemap = routes.map(
    ([path, priority, changeFrequency]) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );
  // Verified facility profiles, so patients searching a place's name find its live stock
  const facilities = await listVerifiedFacilityIds().catch(() => []);
  return [
    ...pages,
    ...facilities.map((f) => ({
      url: `${SITE_URL}/facility/${f.id}`,
      lastModified: new Date(f.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];
}
