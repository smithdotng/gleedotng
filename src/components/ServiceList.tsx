"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import type { Service } from "@/lib/types";
import { cn, duration, servicePriceLabel } from "@/lib/utils";
import { SELECT_SERVICE_EVENT } from "./BookingPanel";

export default function ServiceList({ services }: { services: Service[] }) {
  const choose = (id: string) => {
    window.dispatchEvent(new CustomEvent(SELECT_SERVICE_EVENT, { detail: id }));
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Group by section heading (menus without groups render as one list).
  const groups = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of services) {
      const g = s.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(s);
    }
    return [...map.entries()];
  }, [services]);

  const grouped = groups.length > 1 || groups[0]?.[0];
  const [open, setOpen] = useState<string | null>(groups[0]?.[0] ?? null);

  const list = (items: Service[]) => (
    <ul className="divide-y divide-linen">
      {items.map((s) => (
        <li key={s.id} className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <p className="font-semibold text-espresso-900">{s.name}</p>
            {s.description && <p className="mt-0.5 text-sm text-muted">{s.description}</p>}
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
              <Clock size={12} /> {duration(s.durationMins)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <span className={cn("text-right", s.onRequest ? "text-sm font-semibold text-gold-700 italic" : "font-display text-xl text-espresso-900 sm:text-2xl")}>
              {servicePriceLabel(s)}
            </span>
            <button
              onClick={() => choose(s.id)}
              className="rounded-full border border-espresso-900/15 px-4 py-2 text-xs font-semibold text-espresso-800 transition hover:border-gold-500 hover:bg-gold-500 hover:text-espresso-900"
            >
              {s.onRequest ? "Consult" : "Book"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );

  if (!grouped) return list(services);

  return (
    <div className="divide-y divide-linen">
      {groups.map(([name, items]) => {
        const isOpen = open === name;
        return (
          <section key={name}>
            <button
              onClick={() => setOpen(isOpen ? null : name)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span>
                <span className="font-display block text-2xl text-espresso-900">{name}</span>
                <span className="text-xs text-muted">{items.length} services</span>
              </span>
              <ChevronDown size={20} className={cn("shrink-0 text-gold-600 transition", isOpen && "rotate-180")} />
            </button>
            {isOpen && <div className="pb-2">{list(items)}</div>}
          </section>
        );
      })}
    </div>
  );
}
