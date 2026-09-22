"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingBag, Store, Truck, X } from "lucide-react";
import Photo from "./Photo";
import type { Product } from "@/lib/types";
import { cn, naira } from "@/lib/utils";

type Bag = Record<string, number>;

export default function ShopFront({
  slug,
  businessName,
  address,
  products,
}: {
  slug: string;
  businessName: string;
  address: string;
  products: Product[];
}) {
  const router = useRouter();
  const storageKey = `glee-bag:${slug}`;
  const [bag, setBag] = useState<Bag>({});
  const [category, setCategory] = useState<string>("All");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "", fulfilment: "pickup" as "pickup" | "delivery" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // remember the bag per shop in this browser
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}") as Bag;
      const valid = Object.fromEntries(Object.entries(saved).filter(([id]) => products.some((p) => p.id === id)));
      setBag(valid);
    } catch {}
  }, [storageKey, products]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(bag));
    } catch {}
  }, [bag, storageKey]);

  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category).filter(Boolean) as string[])], [products]);
  const shown = category === "All" ? products : products.filter((p) => p.category === category);

  const lines = Object.entries(bag)
    .map(([id, qty]) => ({ p: byId.get(id)!, qty }))
    .filter((l) => l.p && l.qty > 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.p.price * l.qty, 0);

  const maxFor = (p: Product) => Math.min(20, p.stock ?? 20);
  const setQty = (p: Product, qty: number) =>
    setBag((b) => {
      const next = { ...b };
      const q = Math.max(0, Math.min(maxFor(p), qty));
      if (q) next[p.id] = q;
      else delete next[p.id];
      return next;
    });

  const checkout = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operatorSlug: slug,
        items: lines.map((l) => ({ productId: l.p.id, qty: l.qty })),
        fulfilment: form.fulfilment,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        address: form.address,
        notes: form.notes,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not place your order.");
      setBusy(false);
      return;
    }
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    router.push(`/orders/${data.order.id}`);
  };

  if (!products.length) {
    return (
      <div className="card-luxe p-12 text-center">
        <Store size={32} className="mx-auto text-gold-600" />
        <p className="font-display mt-4 text-3xl text-espresso-900">The boutique opens soon</p>
        <p className="mt-2 text-muted">{businessName} is curating their shelves. Check back shortly.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        {categories.length > 2 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold transition",
                  category === c ? "border-espresso-900 bg-espresso-900 text-gold-300" : "border-linen bg-white text-espresso-700 hover:border-gold-500",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const inBag = bag[p.id] ?? 0;
            const soldOut = p.stock !== null && p.stock <= 0;
            return (
              <article key={p.id} className="card-luxe group flex flex-col overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-espresso-800">
                  {p.image ? (
                    <Photo src={p.image} alt={p.name} fill sizes="(max-width:768px) 100vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#5a3322,#1d0f0a_70%)]">
                      <ShoppingBag size={36} className="text-gold-400/60" />
                    </div>
                  )}
                  {soldOut && (
                    <span className="absolute top-3 left-3 rounded-full bg-espresso-900/85 px-3 py-1 text-[10px] font-bold tracking-widest text-ivory uppercase">
                      Sold out
                    </span>
                  )}
                  {p.stock !== null && p.stock > 0 && p.stock <= 5 && (
                    <span className="absolute top-3 left-3 rounded-full bg-ivory/90 px-3 py-1 text-[10px] font-bold text-espresso-800">
                      Only {p.stock} left
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {p.category && <p className="eyebrow !text-[10px]">{p.category}</p>}
                  <h3 className="font-display mt-1 text-2xl leading-tight text-espresso-900">{p.name}</h3>
                  {p.description && <p className="mt-2 line-clamp-3 text-sm text-muted">{p.description}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="font-display text-2xl text-espresso-900">{naira(p.price)}</span>
                    {inBag ? (
                      <div className="flex items-center gap-2 rounded-full bg-sand p-1">
                        <button onClick={() => setQty(p, inBag - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-espresso-800" aria-label="Remove one">
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{inBag}</span>
                        <button onClick={() => setQty(p, inBag + 1)} disabled={inBag >= maxFor(p)} className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso-900 text-gold-300 disabled:opacity-40" aria-label="Add one">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setQty(p, 1)} disabled={soldOut} className="btn-dark !px-4 !py-2 text-xs">
                        <ShoppingBag size={14} /> Add to bag
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bag & checkout */}
      <aside id="bag" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
        <form onSubmit={checkout} className="overflow-hidden rounded-[28px] bg-white shadow-luxe ring-1 ring-gold-500/25">
          <div className="flex items-center justify-between bg-espresso-900 px-6 py-5">
            <div>
              <p className="eyebrow !text-gold-400">Your bag</p>
              <p className="font-display mt-1 text-2xl text-ivory">{count ? `${count} item${count > 1 ? "s" : ""}` : "Empty for now"}</p>
            </div>
            <ShoppingBag className="text-gold-300" />
          </div>
          <div className="space-y-5 p-6">
            {lines.length ? (
              <ul className="space-y-3">
                {lines.map(({ p, qty }) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-espresso-900">{p.name}</span>
                      <span className="text-xs text-muted">
                        {qty} × {naira(p.price)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <b className="text-espresso-900">{naira(p.price * qty)}</b>
                      <button type="button" onClick={() => setQty(p, 0)} className="text-muted hover:text-red-600" aria-label={`Remove ${p.name}`}>
                        <X size={14} />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Add products to reserve them for pickup or delivery.</p>
            )}

            {lines.length > 0 && (
              <>
                <div className="flex items-center justify-between border-t border-linen pt-4">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="font-display text-3xl text-espresso-900">{naira(subtotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["pickup", "delivery"] as const).map((f) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setForm({ ...form, fulfilment: f })}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-2xl border py-3 text-xs font-semibold transition",
                        form.fulfilment === f ? "border-espresso-900 bg-espresso-900 text-gold-300" : "border-linen text-espresso-700 hover:border-gold-500",
                      )}
                    >
                      {f === "pickup" ? <Store size={14} /> : <Truck size={14} />} {f === "pickup" ? "Pick up" : "Delivery"}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">
                  {form.fulfilment === "pickup" ? `Collect from ${address}.` : `${businessName} will confirm the delivery fee before dispatch.`}
                </p>
                <div className="space-y-3">
                  <input required placeholder="Full name" className="input-luxe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <input required type="tel" placeholder="Phone / WhatsApp" className="input-luxe" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  <input type="email" placeholder="Email (optional)" className="input-luxe" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {form.fulfilment === "delivery" && (
                    <textarea required rows={2} placeholder="Delivery address" className="input-luxe resize-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  )}
                  <textarea rows={2} placeholder="Notes (shade, size, preferred time…)" className="input-luxe resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={busy} className="btn-gold w-full !py-4">
                  {busy && <Loader2 size={16} className="animate-spin" />} Place order · {naira(subtotal)}
                </button>
                <p className="text-center text-[11px] text-muted">Pay on {form.fulfilment === "pickup" ? "pickup" : "delivery"}. You&apos;ll get a confirmation from {businessName}.</p>
              </>
            )}
          </div>
        </form>
      </aside>

      {count > 0 && (
        <a href="#bag" className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-full bg-espresso-900 px-5 py-3 text-ivory shadow-luxe ring-1 ring-gold-500/40 lg:hidden">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag size={16} className="text-gold-300" /> Bag · {count}
          </span>
          <span className="font-semibold text-gold-300">{naira(subtotal)} →</span>
        </a>
      )}
    </div>
  );
}
