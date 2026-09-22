import Link from "next/link";
import { BadgeCheck, Home, MapPin, ShoppingBag, Star } from "lucide-react";
import Photo from "./Photo";
import type { Operator } from "@/lib/types";
import { lowestPrice, naira, priceTierLabel } from "@/lib/utils";
import { hasStore } from "@/lib/plans";
import { CATEGORIES } from "@/lib/seed";

export default function OperatorCard({ op }: { op: Operator }) {
  const from = lowestPrice(op.services);
  return (
    <Link
      href={`/stylists/${op.slug}`}
      className="group card-luxe flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-espresso-800">
        <Photo
          src={op.cover}
          alt={op.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          {hasStore(op) ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-espresso-900 uppercase">
              <ShoppingBag size={11} /> Prestige · Shop
            </span>
          ) : (
            op.featured && (
              <span className="rounded-full bg-espresso-900/80 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-gold-300 uppercase backdrop-blur">
                Featured
              </span>
            )
          )}
          {op.homeService && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ivory/90 px-2.5 py-1 text-[10px] font-semibold text-espresso-800 backdrop-blur">
              <Home size={11} /> Home service
            </span>
          )}
        </div>
        {op.logo && (
          <span className="absolute bottom-3 left-3 h-12 w-12 overflow-hidden rounded-xl shadow-soft ring-2 ring-ivory">
            <Photo src={op.logo} alt={`${op.name} logo`} fill sizes="48px" className="object-cover" />
          </span>
        )}
        <div className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-ivory px-2.5 py-1 text-xs font-bold text-espresso-900">
          <Star size={12} className="fill-gold-500 text-gold-500" />
          {op.reviewCount ? (
            <>
              {op.rating.toFixed(1)}
              <span className="font-medium text-muted">({op.reviewCount})</span>
            </>
          ) : (
            "New"
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-2xl leading-tight font-semibold text-espresso-900">
            {op.name}
            {op.verified && <BadgeCheck size={18} className="ml-1.5 inline -translate-y-0.5 text-gold-600" />}
          </h3>
          <span className="pt-1 text-sm font-semibold tracking-widest text-gold-600">{priceTierLabel(op.priceTier)}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} /> {op.area}, {op.city} · {op.kind}
        </p>
        <p className="mt-3 line-clamp-2 text-sm text-espresso-600">{op.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {op.categories.map((c) => (
            <span key={c} className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-espresso-600">
              {CATEGORIES.find((x) => x.id === c)?.name}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <p className="text-xs text-muted">
            {from ? (
              <>
                From <span className="text-sm font-bold text-espresso-900">{naira(from)}</span>
              </>
            ) : (
              "Price on consultation"
            )}
          </p>
          <span className="rounded-full bg-espresso-900 px-4 py-2 text-xs font-semibold text-ivory transition group-hover:bg-gold-500 group-hover:text-espresso-900">
            Book now
          </span>
        </div>
      </div>
    </Link>
  );
}
