/** Adds https:// when missing and drops trailing slashes; returns "" if the value isn't a usable URL. */
function normalise(raw: string | undefined): string {
  const v = (raw ?? "").trim().replace(/^["']|["']$/g, "");
  if (!v) return "";
  const withScheme = /^https?:\/\//i.test(v) ? v : `${/^(localhost|127\.0\.0\.1)(:|$)/.test(v) ? "http" : "https"}://${v}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return "";
  }
}

/** Public site URL — used for canonical links, Open Graph, sitemaps and email links.
 *  Accepts APP_URL with or without https:// (e.g. "glee.ng" or "https://glee.ng"). */
export function siteUrl(): string {
  return (
    normalise(process.env.APP_URL) ||
    normalise(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalise(process.env.VERCEL_URL) ||
    "http://localhost:3000"
  );
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
