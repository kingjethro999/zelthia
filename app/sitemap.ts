import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ["/about", 0.7, "monthly"],
    ["/signup", 0.5, "monthly"],
    ["/privacy", 0.3, "yearly"],
    ["/terms", 0.3, "yearly"],
  ];
  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
