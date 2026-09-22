"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/seed";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (city) p.set("city", city);
    if (category) p.set("category", category);
    router.push(`/explore${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <form
      onSubmit={submit}
      className={`grid w-full gap-2 rounded-[28px] bg-ivory/95 p-2 shadow-luxe ring-1 ring-gold-500/30 backdrop-blur md:grid-cols-[1.6fr_1fr_1.1fr_auto] ${compact ? "" : "md:rounded-full"}`}
    >
      <label className="flex items-center gap-3 rounded-full px-4 py-3">
        <Search size={18} className="shrink-0 text-gold-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Stylist, salon or service"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </label>
      <label className="flex items-center gap-3 rounded-full px-4 py-3 md:border-l md:border-linen">
        <MapPin size={18} className="shrink-0 text-gold-600" />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent text-sm text-ink outline-none"
          aria-label="City"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-3 rounded-full px-4 py-3 md:border-l md:border-linen">
        <Sparkles size={18} className="shrink-0 text-gold-600" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent text-sm text-ink outline-none"
          aria-label="Category"
        >
          <option value="">Any service</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-dark !py-3.5 md:!px-8">
        Find beauty
      </button>
    </form>
  );
}
