import Link from "next/link";
import { BarChart3, BellRing, CalendarCheck, CreditCard, Globe2, ShieldCheck } from "lucide-react";
import Photo from "@/components/Photo";
import Pricing from "@/components/Pricing";
import SectionHeading from "@/components/SectionHeading";
import { IMG } from "@/lib/images";

export const metadata = { title: "For beauty businesses" };

const FEATURES = [
  { icon: Globe2, title: "A stunning profile", text: "Portfolio, service menu, prices, hours and reviews on a page that feels as premium as your work." },
  { icon: CalendarCheck, title: "Online booking", text: "Clients choose a service and a live time slot. You confirm with a tap from your dashboard." },
  { icon: BellRing, title: "Smart reminders", text: "WhatsApp and SMS nudges before every appointment keep your chairs full." },
  { icon: CreditCard, title: "Deposits", text: "Protect premium services and bridal bookings with optional upfront deposits." },
  { icon: ShieldCheck, title: "Verified badge", text: "Stand out with a gold badge once our team has reviewed your business." },
  { icon: BarChart3, title: "Insights", text: "See which services, days and channels drive your best clients." },
];

const STEPS = [
  ["Create your listing", "Tell us about your business, services, prices and hours. It takes about five minutes."],
  ["Add your best work", "Upload photos of your space and finished looks. First impressions sell."],
  ["Share your link", "Put your glee.ng link in your Instagram bio and WhatsApp status."],
  ["Take bookings", "Confirm requests, manage your diary and grow your regulars."],
];

export default function ForBusiness() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-espresso-900">
        <Photo src={IMG.salonLounge} alt="Premium salon" fill priority sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso-950 via-espresso-900/85 to-espresso-900/30" />
        <div className="grain absolute inset-0" />
        <div className="container-luxe relative pt-40 pb-28">
          <p className="eyebrow !text-gold-400">glee.ng for business</p>
          <h1 className="font-display mt-5 max-w-3xl text-6xl leading-[0.98] text-ivory md:text-8xl">
            Less DMs. <br />
            <em className="text-gold-400">More bookings.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ivory/70">
            The booking platform built for Nigeria&apos;s salons, studios, spas, barbers and independent stylists. List for
            free and let clients book you around the clock.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/list-your-business" className="btn-gold">
              List your business — free
            </Link>
            <Link href="#pricing" className="btn-ghost-light">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      <section className="container-luxe py-24">
        <SectionHeading eyebrow="Everything included" title="Tools that feel" accent="as good as your work." center />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-luxe p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-espresso-900 text-gold-300">
                <f.icon size={22} />
              </span>
              <h3 className="font-display mt-5 text-2xl text-espresso-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-espresso-900 py-24">
        <div className="container-luxe grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Get started" title="Live in" accent="four steps." light />
            <ol className="mt-10 space-y-6">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex gap-5">
                  <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/40 text-2xl text-gold-300">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-2xl text-ivory">{t}</p>
                    <p className="text-sm text-ivory/60">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-[28px]">
              <Photo src={IMG.nailsManicure} alt="Nail studio" fill sizes="25vw" className="object-cover" />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-[28px]">
              <Photo src={IMG.barberCut} alt="Barbershop" fill sizes="25vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="container-luxe scroll-mt-24 py-24">
        <SectionHeading eyebrow="Pricing" title="Start free." accent="Upgrade when you glow." center />
        <div className="mx-auto mt-12 max-w-6xl">
          <Pricing />
        </div>
      </section>
    </>
  );
}
