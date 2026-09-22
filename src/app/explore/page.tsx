import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ExploreFilters from "@/components/ExploreFilters";
import OperatorCard from "@/components/OperatorCard";
import { queryOperators } from "@/lib/store";
import { CATEGORIES } from "@/lib/seed";

export const metadata: Metadata = { title: "Explore stylists, salons & spas" };
export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function Explore({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const SORTS = ["recommended", "rating", "reviews", "price-asc", "price-desc"] as const;
  const list = await queryOperators({
    q,
    city: sp.city,
    category: sp.category,
    price: sp.price ? Number(sp.price) : undefined,
    homeService: sp.home === "1",
    sort: SORTS.find((x) => x === sp.sort) ?? "recommended",
  });

  const cat = CATEGORIES.find((c) => c.id === sp.category);

  return (
    <div>
      <section className="relative overflow-hidden bg-espresso-900 pt-14 pb-16">
        <div className="grain absolute inset-0" />
        <div className="absolute -right-20 -bottom-40 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl" />
        <div className="container-luxe relative">
          <p className="eyebrow !text-gold-400">Explore</p>
          <h1 className="font-display mt-3 text-5xl text-ivory md:text-6xl">
            {cat?.name ?? "Beauty professionals"}{" "}
            <em className="text-gold-400">{sp.city ? `in ${sp.city}` : "across Nigeria"}</em>
          </h1>
          <p className="mt-3 text-ivory/60">
            {list.length} {list.length === 1 ? "place" : "places"} ready to take your booking
            {q && (
              <>
                {" "}
                for “<span className="text-gold-300">{sp.q}</span>”
              </>
            )}
          </p>
        </div>
      </section>

      <section className="container-luxe -mt-8 pb-24">
        <div className="card-luxe relative p-5 md:p-6">
          <Suspense>
            <ExploreFilters />
          </Suspense>
        </div>

        {list.length ? (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((op) => (
              <OperatorCard key={op.slug} op={op} />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="font-display text-3xl text-espresso-900">No matches — yet.</p>
            <p className="mt-2 text-muted">Try another city or treatment, or tell a great stylist about glee.ng.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/explore" className="btn-dark">
                Clear filters
              </Link>
              <Link href="/list-your-business" className="btn-outline">
                List a business
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
