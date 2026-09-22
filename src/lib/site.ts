/** Public site URL — used for canonical links, Open Graph and sitemaps. */
export function siteUrl(): string {
  const url =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export const SITE = {
  name: "glee.ng",
  title: "glee.ng — Book Nigeria's finest stylists, salons & spas",
  description:
    "Discover and book premium hair stylists, makeup artists, nail studios, barbers and spas across Lagos, Abuja and beyond. Beauty businesses list for free and take bookings online.",
  ogImage: { url: "/og/glee-og.jpg", width: 1200, height: 630, alt: "glee.ng — Beauty, beautifully booked." },
  themeColor: "#1d0f0a",
};

/** Metadata for private pages that shouldn't appear in search results. */
export const PRIVATE = { robots: { index: false, follow: false } } as const;
