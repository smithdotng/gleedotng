"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/seed";
import { cn } from "@/lib/utils";

export default function ExploreFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const set = (key: string, value: string | null) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`/explore?${p.toString()}`, { scroll: false });
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-xs font-semibold transition",
      active ? "border-espresso-900 bg-espresso-900 text-gold-300" : "border-linen bg-white text-espresso-700 hover:border-gold-500",
    );

  const category = params.get("category");
  const city = params.get("city");
  const price = params.get("price");
  const home = params.get("home");
  const sort = params.get("sort") ?? "recommended";

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          set("q", q || null);
        }}
        className="flex items-center gap-3 rounded-full border border-linen bg-white px-5 py-3 shadow-soft focus-within:border-gold-500"
      >
        <Search size={18} className="text-gold-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search stylists, salons, services or areas…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button className="btn-dark !px-5 !py-2 text-xs">Search</button>
      </form>

      <div className="flex flex-wrap gap-2">
        <button className={chip(!category)} onClick={() => set("category", null)}>
          All treatments
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} className={chip(category === c.id)} onClick={() => set("category", category === c.id ? null : c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-linen pt-5 text-sm">
        <SlidersHorizontal size={16} className="text-gold-600" />
        <select value={city ?? ""} onChange={(e) => set("city", e.target.value || null)} className="input-luxe !w-auto !rounded-full !py-2" aria-label="City">
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select value={price ?? ""} onChange={(e) => set("price", e.target.value || null)} className="input-luxe !w-auto !rounded-full !py-2" aria-label="Price">
          <option value="">Any price</option>
          <option value="1">₦ Budget</option>
          <option value="2">₦₦ Moderate</option>
          <option value="3">₦₦₦ Premium</option>
          <option value="4">₦₦₦₦ Luxury</option>
        </select>
        <select value={sort} onChange={(e) => set("sort", e.target.value === "recommended" ? null : e.target.value)} className="input-luxe !w-auto !rounded-full !py-2" aria-label="Sort">
          <option value="recommended">Recommended</option>
          <option value="rating">Top rated</option>
          <option value="reviews">Most reviewed</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-linen bg-white px-4 py-2 text-xs font-semibold text-espresso-700">
          <input type="checkbox" checked={home === "1"} onChange={(e) => set("home", e.target.checked ? "1" : null)} className="accent-gold-600" />
          Home service
        </label>
      </div>
    </div>
  );
}
