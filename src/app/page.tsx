import Link from "next/link";
import { ArrowRight, CalendarCheck, CalendarHeart, Gem, MessageCircleHeart, Search, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";
import Photo from "@/components/Photo";
import SearchBar from "@/components/SearchBar";
import OperatorCard from "@/components/OperatorCard";
import SectionHeading from "@/components/SectionHeading";
import Pricing from "@/components/Pricing";
import { CATEGORIES, CITIES } from "@/lib/seed";
import { countOperatorsByCity, queryOperators } from "@/lib/store";
import { IMG } from "@/lib/images";

export const dynamic = "force-dynamic";

const STEPS = [
  { icon: Search, title: "Discover", text: "Browse vetted stylists, salons and spas by city, treatment and price." },
  { icon: Gem, title: "Choose your service", text: "See real prices, durations, portfolios and honest guest reviews." },
  { icon: CalendarHeart, title: "Book a time", text: "Pick a live slot — in-salon or at home — and confirm in seconds." },
  { icon: MessageCircleHeart, title: "Glow & review", text: "Get reminders, enjoy your appointment and share the love after." },
];

const JOURNAL = [
  { tag: "Hair", title: "The protective-style calendar for Harmattan season", img: IMG.hairStyling, read: "5 min" },
  { tag: "Skin", title: "What a professional facial actually does for melanin-rich skin", img: IMG.facial, read: "7 min" },
  { tag: "Bridal", title: "Booking your wedding glam team: a 12-week timeline", img: IMG.makeupFace, read: "6 min" },
];

const TESTIMONIALS = [
  { quote: "I found my braider, my lash tech and my barber — all on one app. Booking takes less than a minute.", name: "Ifeoma, Lekki", img: IMG.portraitB },
  { quote: "Since listing on glee.ng our weekday chairs are full. The dashboard makes confirming appointments effortless.", name: "Seun, Kings & Co.", img: IMG.portraitC },
  { quote: "Everything feels so considered — the reviews are real and the prices are exactly what you pay.", name: "Hauwa, Wuse II", img: IMG.portraitD },
];

export default async function Home() {
  const [featured, cityCounts] = await Promise.all([
    queryOperators({ featured: true, limit: 6 }),
    countOperatorsByCity(),
  ]);
  const countByCity = (c: string) => cityCounts[c] ?? 0;

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative isolate overflow-hidden bg-espresso-900">
        <Photo src={IMG.salonInterior} alt="Luxury salon interior" fill priority sizes="100vw" className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-br from-espresso-950/95 via-espresso-900/75 to-espresso-700/40" />
        <div className="grain absolute inset-0" />
        <div className="container-luxe relative grid min-h-[92vh] items-center gap-12 pt-28 pb-20 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="animate-fade-up">
            <p className="eyebrow !text-gold-400 flex items-center gap-2">
              <Sparkles size={14} /> Nigeria&apos;s premium beauty marketplace
            </p>
            <h1 className="font-display mt-6 text-[52px] leading-[0.98] font-medium text-ivory sm:text-7xl lg:text-[88px]">
              Beauty, <br />
              <em className="bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 bg-clip-text text-transparent">
                beautifully booked.
              </em>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory/70 sm:text-lg">
              Discover Lagos, Abuja and Port Harcourt&apos;s most sought-after stylists, makeup artists, nail studios,
              barbers and spas — and reserve your chair in seconds.
            </p>
            <div className="mt-9 max-w-3xl">
              <SearchBar />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ivory/60">
              <span>Popular:</span>
              {["Silk press", "Knotless braids", "Bridal makeup", "Gel manicure", "Hydrafacial"].map((t) => (
                <Link
                  key={t}
                  href={`/explore?q=${encodeURIComponent(t)}`}
                  className="rounded-full border border-ivory/15 px-3 py-1 transition hover:border-gold-400 hover:text-gold-300"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          {/* collage */}
          <div className="relative hidden h-[560px] lg:block">
            <div className="absolute top-0 right-0 h-[380px] w-[290px] overflow-hidden rounded-[140px_140px_24px_24px] ring-1 ring-gold-500/40 shadow-luxe">
              <Photo src={IMG.hairStyling} alt="Hair styling" fill sizes="300px" className="object-cover" />
            </div>
            <div className="absolute bottom-0 left-4 h-[300px] w-[240px] overflow-hidden rounded-[24px] ring-1 ring-gold-500/40 shadow-luxe">
              <Photo src={IMG.makeupFace} alt="Makeup artistry" fill sizes="240px" className="object-cover" />
            </div>
            <div className="absolute right-6 bottom-10 w-[250px] rounded-2xl bg-ivory/95 p-4 shadow-luxe backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-gold-400">
                  <Photo src={IMG.portraitA} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-espresso-900">Booking confirmed</p>
                  <p className="text-xs text-muted">Silk Press · Sat, 11:00am</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-sand px-3 py-2 text-xs text-espresso-700">
                <CalendarCheck size={14} className="text-gold-600" /> Maison Adaeze, Ikoyi
              </div>
            </div>
            <div className="absolute top-16 left-0 rounded-2xl bg-espresso-900/85 px-5 py-4 text-ivory ring-1 ring-gold-500/30 backdrop-blur">
              <p className="flex items-center gap-1 text-gold-300">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="fill-gold-400 text-gold-400" />
                ))}
              </p>
              <p className="font-display mt-1 text-3xl">4.8</p>
              <p className="text-[11px] tracking-wider text-ivory/60 uppercase">avg. guest rating</p>
            </div>
          </div>
        </div>
        <div className="relative border-t border-gold-500/15 bg-espresso-950/60 backdrop-blur">
          <div className="container-luxe grid grid-cols-2 gap-6 py-6 text-center md:grid-cols-4">
            {[
              ["1,200+", "Verified professionals"],
              ["48k", "Appointments booked"],
              ["6", "Cities & counting"],
              ["4.8★", "Average rating"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-3xl text-gold-300">{n}</p>
                <p className="mt-1 text-[11px] tracking-[0.2em] text-ivory/55 uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CATEGORIES ---------------- */}
      <section className="container-luxe py-24">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Treatments" title="What are you" accent="in the mood for?" />
          <Link href="/explore" className="btn-outline">
            Explore all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/explore?category=${c.id}`}
              className="group relative aspect-[3/4] overflow-hidden rounded-[28px] bg-espresso-800"
            >
              <Photo src={c.image} alt={c.name} fill sizes="(max-width:768px) 50vw, 16vw" className="object-cover transition duration-[1.2s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/90 via-espresso-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-display text-2xl text-ivory">{c.name}</h3>
                <p className="mt-0.5 text-[11px] leading-snug text-ivory/65">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED ---------------- */}
      <section className="bg-sand/70 py-24">
        <div className="container-luxe">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="The Glee edit"
              title="Featured"
              accent="artisans & houses"
              sub="Hand-picked by our editors for craft, hospitality and consistently glowing reviews."
            />
            <Link href="/explore?sort=rating" className="btn-outline">
              See top rated <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((op) => (
              <OperatorCard key={op.slug} op={op} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CITIES ---------------- */}
      <section className="container-luxe py-24">
        <SectionHeading eyebrow="Browse by city" title="Glee, wherever" accent="you are." center />
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CITIES.map((c) => (
            <Link
              key={c}
              href={`/explore?city=${encodeURIComponent(c)}`}
              className="group flex items-center gap-3 rounded-full border border-linen bg-white px-6 py-3.5 shadow-soft transition hover:border-gold-500"
            >
              <span className="font-display text-xl text-espresso-900">{c}</span>
              <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold text-gold-700 group-hover:bg-gold-500 group-hover:text-espresso-900">
                {countByCity(c)} listed
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      <section className="relative overflow-hidden bg-espresso-900 py-24">
        <div className="grain absolute inset-0" />
        <div className="absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="container-luxe relative">
          <SectionHeading eyebrow="How it works" title="From inspiration to" accent="appointment." light center />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-[28px] border border-gold-500/15 bg-espresso-800/60 p-7 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/15 text-gold-300">
                    <s.icon size={22} />
                  </span>
                  <span className="font-display text-5xl text-gold-500/30">0{i + 1}</span>
                </div>
                <h3 className="font-display mt-6 text-2xl text-ivory">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ivory/60">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FOR BUSINESS ---------------- */}
      <section className="container-luxe grid items-center gap-14 py-24 lg:grid-cols-2">
        <div className="relative h-[520px]">
          <div className="absolute inset-y-0 left-0 w-[78%] overflow-hidden rounded-[32px] shadow-luxe">
            <Photo src={IMG.salonChairs} alt="Salon chairs" fill sizes="(max-width:1024px) 80vw, 40vw" className="object-cover" />
          </div>
          <div className="absolute right-0 bottom-8 w-[58%] rounded-[28px] bg-white p-6 shadow-luxe ring-1 ring-espresso-900/5">
            <p className="eyebrow">This week</p>
            <p className="font-display mt-2 text-4xl text-espresso-900">32 bookings</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <TrendingUp size={14} /> +41% vs last week
            </p>
            <div className="mt-5 flex h-20 items-end gap-2">
              {[40, 55, 35, 70, 60, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-gold-600 to-gold-300" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div>
          <SectionHeading
            eyebrow="For beauty businesses"
            title="Fill your chairs."
            accent="Grow your name."
            sub="Whether you run a flagship salon, a boutique studio or you're an independent stylist with a loyal following, glee.ng puts you in front of clients who are ready to book."
          />
          <ul className="mt-8 space-y-4">
            {[
              [CalendarCheck, "24/7 online bookings", "Clients book live slots from your menu — even while you sleep."],
              [ShieldCheck, "Fewer no-shows", "Automatic reminders and optional deposits keep your diary honest."],
              [Star, "Reputation that travels", "Verified reviews and a gorgeous profile that sells your craft."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof CalendarCheck;
              return (
                <li key={t as string} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sand text-gold-700">
                    <I size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-espresso-900">{t as string}</p>
                    <p className="text-sm text-muted">{d as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/list-your-business" className="btn-gold">
              List your business — free
            </Link>
            <Link href="/for-business" className="btn-outline">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="bg-blush-100/60 py-24">
        <div className="container-luxe">
          <SectionHeading eyebrow="Kind words" title="Loved by clients" accent="& creators." center />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card-luxe flex flex-col p-8">
                <span className="font-display text-6xl leading-none text-gold-500">&ldquo;</span>
                <blockquote className="font-display -mt-3 text-[22px] leading-snug text-espresso-800 italic">{t.quote}</blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-6">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-gold-400/60">
                    <Photo src={t.img} alt={t.name} fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-espresso-900">{t.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section id="pricing" className="container-luxe py-24">
        <SectionHeading
          eyebrow="Plans for operators"
          title="Simple pricing,"
          accent="serious results."
          sub="Start free. Upgrade when you're ready for premium placement and powerful tools."
          center
        />
        <div className="mx-auto mt-12 max-w-6xl">
          <Pricing />
        </div>
      </section>

      {/* ---------------- JOURNAL ---------------- */}
      <section className="bg-sand/70 py-24">
        <div className="container-luxe">
          <SectionHeading eyebrow="The Glee journal" title="Guides, trends" accent="& rituals." />
          <div className="mt-12 grid gap-7 md:grid-cols-3">
            {JOURNAL.map((j) => (
              <article key={j.title} className="group cursor-pointer">
                <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-espresso-800">
                  <Photo src={j.img} alt={j.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-[1.2s] group-hover:scale-105" />
                </div>
                <p className="eyebrow mt-5">
                  {j.tag} · {j.read} read
                </p>
                <h3 className="font-display mt-2 text-2xl leading-snug text-espresso-900 group-hover:text-gold-700">{j.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="relative isolate overflow-hidden bg-espresso-900 py-24">
        <Photo src={IMG.spaRoom} alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso-950 via-espresso-900/90 to-espresso-900/60" />
        <div className="container-luxe relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-4xl text-ivory md:text-6xl">
              Your next glow-up is <em className="text-gold-400">one tap away.</em>
            </h2>
            <p className="mt-3 text-ivory/65">Book tonight&apos;s look or list your business in under five minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/explore" className="btn-gold">
              Book an appointment
            </Link>
            <Link href="/list-your-business" className="btn-ghost-light">
              List your business
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
