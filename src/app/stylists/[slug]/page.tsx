import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, AtSign, BadgeCheck, ChevronLeft, Home, MapPin, Phone, ShoppingBag, Star } from "lucide-react";
import Photo from "@/components/Photo";
import Stars from "@/components/Stars";
import BookingPanel from "@/components/BookingPanel";
import ServiceList from "@/components/ServiceList";
import OperatorCard from "@/components/OperatorCard";
import { getOperator, getProducts, getSimilarOperators } from "@/lib/store";
import { hasStore } from "@/lib/plans";
import { getSession } from "@/lib/auth";
import { CATEGORIES } from "@/lib/seed";
import { WEEKDAY_LABEL, lowestPrice, naira, prettyDate, prettyTime, priceTierLabel } from "@/lib/utils";
import type { Weekday } from "@/lib/types";
import { PRIVATE, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const op = await getOperator((await params).slug);
  if (!op || op.hidden) return { title: "Not found", ...PRIVATE };
  const title = `${op.name} — ${op.area}, ${op.city}`;
  const description = `${op.tagline} Book ${op.kind.toLowerCase()} appointments online on glee.ng.`;
  const url = `/stylists/${op.slug}`;
  const images = [{ url: op.cover, alt: op.name }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "profile", title: `${title} · glee.ng`, description, url, siteName: SITE.name, locale: "en_NG", images },
    twitter: { card: "summary_large_image", title: `${title} · glee.ng`, description, images: [op.cover] },
  };
}

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default async function StylistPage({ params }: { params: Params }) {
  const { slug } = await params;
  const op = await getOperator(slug);
  if (!op) notFound();
  if (op.hidden && (await getSession())?.slug !== slug) notFound();

  const similar = await getSimilarOperators(op);
  const store = hasStore(op);
  const products = store ? (await getProducts(op.slug, { activeOnly: true })).slice(0, 4) : [];

  const photos = [op.cover, ...op.gallery].slice(0, 5);

  return (
    <div className="pb-24">
      {/* Gallery mosaic */}
      <section className="bg-espresso-900 pt-6 pb-10">
        <div className="container-luxe">
          <Link href="/explore" className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-ivory/60 uppercase hover:text-gold-300">
            <ChevronLeft size={14} /> Back to explore
          </Link>
          <div className="mt-5 grid h-[300px] gap-3 sm:h-[440px] sm:grid-cols-4 sm:grid-rows-2">
            {photos.map((src, i) => (
              <div
                key={src + i}
                className={`relative overflow-hidden rounded-[22px] bg-espresso-800 ${i === 0 ? "sm:col-span-2 sm:row-span-2" : "hidden sm:block"}`}
              >
                <Photo src={src} alt={`${op.name} photo ${i + 1}`} fill priority={i === 0} sizes={i === 0 ? "(max-width:640px) 100vw, 50vw" : "25vw"} className="object-cover transition duration-700 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-luxe mt-10 grid gap-12 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          {/* Title block */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sand px-3 py-1 text-[11px] font-semibold tracking-wider text-gold-700 uppercase">{op.kind}</span>
            {op.categories.map((c) => (
              <Link key={c} href={`/explore?category=${c}`} className="rounded-full border border-linen px-3 py-1 text-[11px] font-semibold text-espresso-600 hover:border-gold-500">
                {CATEGORIES.find((x) => x.id === c)?.name}
              </Link>
            ))}
          </div>
{op.logo && (
            <span className="relative mt-5 mb-1 block h-20 w-20 overflow-hidden rounded-2xl shadow-soft ring-1 ring-espresso-900/10">
              <Photo src={op.logo} alt={`${op.name} logo`} fill sizes="80px" className="object-cover" />
            </span>
          )}
          <h1 className="font-display mt-4 text-5xl leading-none font-medium text-espresso-900 md:text-6xl">
            {op.name}
            {op.verified && <BadgeCheck size={30} className="ml-2 inline -translate-y-1 text-gold-600" />}
          </h1>
          <p className="font-display mt-3 text-2xl text-espresso-600 italic">{op.tagline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-espresso-700">
            <span className="inline-flex items-center gap-1.5">
              <Star size={16} className="fill-gold-500 text-gold-500" />
              {op.reviewCount ? (
                <>
                  <b>{op.rating.toFixed(1)}</b> <span className="text-muted">({op.reviewCount} reviews)</span>
                </>
              ) : (
                <b>New on glee.ng</b>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} className="text-gold-600" /> {op.area}, {op.city}
            </span>
            <span className="font-semibold tracking-widest text-gold-600">{priceTierLabel(op.priceTier)}</span>
            {op.homeService && (
              <span className="inline-flex items-center gap-1.5">
                <Home size={16} className="text-gold-600" /> Home service available
              </span>
            )}
          </div>

          <div className="gold-rule my-10" />

          {/* About */}
          <section>
            <h2 className="font-display text-3xl text-espresso-900">About</h2>
            <p className="mt-4 leading-relaxed text-espresso-700">{op.bio}</p>
            <div className="mt-6 flex items-center gap-4 rounded-3xl bg-sand/70 p-4">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-gold-400">
                <Photo src={op.lead.avatar} alt={op.lead.name} fill sizes="56px" className="object-cover" />
              </span>
              <div>
                <p className="font-semibold text-espresso-900">{op.lead.name}</p>
                <p className="text-sm text-muted">{op.lead.title}</p>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="mt-14">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl text-espresso-900">Service menu</h2>
              <p className="text-xs text-muted">{op.services.length} services</p>
            </div>
            <div className="card-luxe mt-5 px-6">
              <ServiceList services={op.services} />
            </div>
          </section>

          {/* Boutique (Prestige plan) */}
          {store && (
            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow flex items-center gap-1.5">
                    <ShoppingBag size={13} /> The boutique
                  </p>
                  <h2 className="font-display mt-1 text-3xl text-espresso-900">Shop {op.name}</h2>
                </div>
                <Link href={`/stylists/${op.slug}/shop`} className="btn-outline !px-4 !py-2 text-xs">
                  Visit shop <ArrowRight size={14} />
                </Link>
              </div>
              {products.length ? (
                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {products.map((p) => (
                    <Link key={p.id} href={`/stylists/${op.slug}/shop`} className="group card-luxe overflow-hidden">
                      <div className="relative aspect-square overflow-hidden bg-espresso-800">
                        {p.image ? (
                          <Photo src={p.image} alt={p.name} fill sizes="25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#5a3322,#1d0f0a_70%)]">
                            <ShoppingBag size={28} className="text-gold-400/60" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold text-espresso-900">{p.name}</p>
                        <p className="text-sm text-gold-700">{naira(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-3xl border border-dashed border-gold-500/40 bg-sand/50 p-8 text-center">
                  <p className="font-display text-2xl text-espresso-900">The boutique opens soon</p>
                  <p className="mt-1 text-sm text-muted">Hair, skincare and aftercare products from {op.name} will be available here.</p>
                </div>
              )}
            </section>
          )}

          {/* Gallery */}
          {op.gallery.length > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-3xl text-espresso-900">Portfolio</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {op.gallery.map((g, i) => (
                  <div key={g + i} className="relative aspect-square overflow-hidden rounded-2xl bg-espresso-800">
                    <Photo src={g} alt={`${op.name} portfolio ${i + 1}`} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-14">
            <div className="flex items-center gap-4">
              <h2 className="font-display text-3xl text-espresso-900">Guest reviews</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-3 py-1 text-sm font-bold text-gold-300">
                <Star size={14} className="fill-gold-400 text-gold-400" /> {op.reviewCount ? op.rating.toFixed(1) : "New"}
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {op.reviews.length ? (
                op.reviews.map((r) => (
                  <div key={r.author + r.date} className="card-luxe p-6">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-espresso-900">{r.author}</p>
                      <Stars value={r.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-espresso-700">{r.text}</p>
                    <p className="mt-3 text-xs text-muted">{prettyDate(r.date, { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted">New on glee.ng — be the first to leave a review after your appointment.</p>
              )}
            </div>
          </section>

          {/* Hours & location */}
          <section className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="card-luxe p-6">
              <h3 className="font-display text-2xl text-espresso-900">Opening hours</h3>
              <ul className="mt-4 space-y-2 text-sm">
                {ORDER.map((d) => {
                  const h = op.hours[d];
                  return (
                    <li key={d} className="flex justify-between">
                      <span className="text-espresso-700">{WEEKDAY_LABEL[d]}</span>
                      <span className={h ? "font-semibold text-espresso-900" : "text-muted"}>
                        {h ? `${prettyTime(h.open)} – ${prettyTime(h.close)}` : "Closed"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="card-luxe p-6">
              <h3 className="font-display text-2xl text-espresso-900">Find us</h3>
              <ul className="mt-4 space-y-3 text-sm text-espresso-700">
                <li className="flex gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gold-600" /> {op.address}
                </li>
                {op.phone && (
                  <li className="flex gap-2">
                    <Phone size={16} className="mt-0.5 shrink-0 text-gold-600" />
                    <a href={`tel:${op.phone.replace(/\s/g, "")}`} className="hover:text-gold-700 hover:underline">
                      {op.phone}
                    </a>
                  </li>
                )}
                {op.instagram && (
                  <li className="flex gap-2">
                    <AtSign size={16} className="mt-0.5 shrink-0 text-gold-600" />
                    <a href={`https://instagram.com/${op.instagram}`} target="_blank" rel="noreferrer" className="hover:text-gold-700 hover:underline">
                      @{op.instagram}
                    </a>
                  </li>
                )}
              </ul>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(op.address)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline mt-5 !py-2.5 text-xs"
              >
                Open in Maps
              </a>
            </div>
          </section>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <BookingPanel op={op} />
        </aside>
      </div>

      {/* mobile booking bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-gold-500/20 bg-espresso-900/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ivory">{op.name}</p>
          <p className="text-xs text-ivory/60">From {naira(lowestPrice(op.services))}</p>
        </div>
        <a href="#book" className="btn-gold shrink-0 !py-2.5">
          Book now
        </a>
      </div>

      {similar.length > 0 && (
        <section className="container-luxe mt-24">
          <h2 className="font-display text-4xl text-espresso-900">
            You may also <em className="text-gold-600">love</em>
          </h2>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((o) => (
              <OperatorCard key={o.slug} op={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
