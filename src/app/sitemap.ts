import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getOperators } from "@/lib/store";
import { hasStore } from "@/lib/plans";
import { CATEGORIES } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/for-business`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/list-your-business`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...CATEGORIES.map((c) => ({ url: `${base}/explore?category=${c.id}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
  ];
  try {
    const ops = await getOperators();
    for (const op of ops) {
      pages.push({ url: `${base}/stylists/${op.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
      if (hasStore(op)) pages.push({ url: `${base}/stylists/${op.slug}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
    }
  } catch {
    // database unavailable — still serve the static part of the sitemap
  }
  return pages;
}
