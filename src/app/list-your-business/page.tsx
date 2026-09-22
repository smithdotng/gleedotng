import type { Metadata } from "next";
import { Suspense } from "react";
import { BadgeCheck, CalendarCheck, Sparkles } from "lucide-react";
import ListingForm from "@/components/ListingForm";
import Photo from "@/components/Photo";
import { IMG } from "@/lib/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "List your beauty business",
  description: "List your salon, studio or spa on glee.ng in five minutes and start receiving bookings.",
  alternates: { canonical: "/list-your-business" },
  openGraph: { title: "List your beauty business · glee.ng", description: "List your salon, studio or spa on glee.ng in five minutes and start receiving bookings.", url: "/list-your-business", siteName: SITE.name, locale: "en_NG", type: "website", images: [SITE.ogImage] },
  twitter: { card: "summary_large_image", title: "List your beauty business · glee.ng", description: "List your salon, studio or spa on glee.ng in five minutes and start receiving bookings.", images: [SITE.ogImage.url] },
};

export default function ListYourBusiness() {
  return (
    <div className="bg-sand/60">
      <div className="container-luxe grid gap-10 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:py-16">
        <aside className="relative hidden overflow-hidden rounded-[32px] bg-espresso-900 lg:block">
          <Photo src={IMG.hairStyling} alt="Stylist at work" fill sizes="40vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-900/60 to-espresso-900/20" />
          <div className="relative flex h-full flex-col justify-end p-10">
            <p className="eyebrow !text-gold-400">For operators</p>
            <h1 className="font-display mt-3 text-5xl leading-[1.02] text-ivory">
              Your craft deserves a <em className="text-gold-400">front-row seat.</em>
            </h1>
            <ul className="mt-8 space-y-4 text-sm text-ivory/80">
              <li className="flex gap-3">
                <Sparkles size={18} className="shrink-0 text-gold-400" /> Go live in about five minutes — no website needed.
              </li>
              <li className="flex gap-3">
                <CalendarCheck size={18} className="shrink-0 text-gold-400" /> Receive booking requests 24/7 and confirm from your dashboard.
              </li>
              <li className="flex gap-3">
                <BadgeCheck size={18} className="shrink-0 text-gold-400" /> Earn a verified badge after a quick quality review.
              </li>
            </ul>
          </div>
        </aside>
        <div>
          <div className="mb-6 lg:hidden">
            <p className="eyebrow">For operators</p>
            <h1 className="font-display mt-2 text-4xl text-espresso-900">
              List your <em className="text-gold-600">business</em>
            </h1>
          </div>
          <Suspense>
            <ListingForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
