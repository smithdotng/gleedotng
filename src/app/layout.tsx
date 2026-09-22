import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource-variable/manrope";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PwaRegister from "@/components/PwaRegister";
import { SITE, siteUrl } from "@/lib/site";
import { INSTALL_CAPTURE_SCRIPT } from "@/lib/pwa-install";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE.title, template: "%s · glee.ng" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["beauty", "salon", "hair stylist", "makeup artist", "nails", "spa", "barber", "booking", "Lagos", "Abuja", "Nigeria"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_NG",
    url: "/",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage.url],
  },
  appleWebApp: { capable: true, title: "glee", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: INSTALL_CAPTURE_SCRIPT }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <PwaRegister />
      </body>
    </html>
  );
}
