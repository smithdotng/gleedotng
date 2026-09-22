"use client";

import { useState } from "react";
import Photo from "./Photo";
import { Check, Eye, EyeOff, Loader2, Package, Pencil, Plus, ShoppingBag, Store, Trash2, Truck, X } from "lucide-react";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { IMG } from "@/lib/images";
import { cn, naira } from "@/lib/utils";

const PHOTO_PICKS = [IMG.makeupProducts, IMG.makeupFlatlay, IMG.skincare, IMG.makeupBrushes, IMG.hairWash, IMG.facial];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  ready: "bg-gold-500/20 text-gold-700",
  completed: "bg-sand text-espresso-700",
  cancelled: "bg-red-50 text-red-700",
};

type Draft = { id?: string; name: string; price: string; category: string; stock: string; image: string; description: string; active: boolean };
const EMPTY: Draft = { name: "", price: "", category: "", stock: "", image: "", description: "", active: true };

export default function StoreManager({ initialProducts, initialOrders }: { initialProducts: Product[]; initialOrders: Order[] }) {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const openOrders = orders.filter((o) => o.status === "pending" || o.status === "confirmed" || o.status === "ready").length;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy("save");
    setError("");
    const body = {
      name: draft.name,
      price: Number(draft.price),
      category: draft.category,
      stock: draft.stock === "" ? null : Number(draft.stock),
      image: draft.image,
      description: draft.description,
      active: draft.active,
    };
    const res = await fetch(draft.id ? `/api/store/products/${draft.id}` : "/api/store/products", {
      method: draft.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setError(data.error || "Could not save product.");
    setProducts((all) => (draft.id ? all.map((p) => (p.id === draft.id ? data.product : p)) : [data.product, ...all]));
    setDraft(null);
  };

  const patchProduct = async (p: Product, patch: Partial<Product>) => {
    setBusy(p.id);
    const res = await fetch(`/api/store/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) setProducts((all) => all.map((x) => (x.id === p.id ? data.product : x)));
  };

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete “${p.name}” from your shop?`)) return;
    setBusy(p.id);
    const res = await fetch(`/api/store/products/${p.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) setProducts((all) => all.filter((x) => x.id !== p.id));
  };

  const setOrderStatus = async (o: Order, status: OrderStatus) => {
    setBusy(o.id + status);
    const res = await fetch(`/api/orders/${o.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (res.ok) {
      setOrders((all) => all.map((x) => (x.id === o.id ? data.order : x)));
      if (status === "cancelled") {
        // stock returned to shelf server-side; refresh the catalogue
        const r = await fetch("/api/store/products");
        if (r.ok) setProducts((await r.json()).products);
      }
    }
  };

  return (
    <div className="card-luxe overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linen px-6 py-4">
        <div className="flex gap-1 rounded-full bg-sand p-1">
          {(["products", "orders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition", tab === t ? "bg-espresso-900 text-gold-300" : "text-espresso-600")}
            >
              {t}
              {t === "orders" && openOrders > 0 && <span className="ml-1.5 rounded-full bg-gold-500 px-1.5 text-[10px] text-espresso-900">{openOrders}</span>}
              {t === "products" && <span className="ml-1.5 opacity-60">{products.length}</span>}
            </button>
          ))}
        </div>
        {tab === "products" && !draft && (
          <button onClick={() => setDraft({ ...EMPTY })} className="btn-gold !px-4 !py-2 text-xs">
            <Plus size={14} /> Add product
          </button>
        )}
      </div>

      {tab === "products" && (
        <div>
          {draft && (
            <form onSubmit={save} className="space-y-4 border-b border-linen bg-sand/40 p-6">
              <div className="flex items-center justify-between">
                <p className="font-display text-2xl text-espresso-900">{draft.id ? "Edit product" : "New product"}</p>
                <button type="button" onClick={() => setDraft(null)} className="text-muted hover:text-espresso-900" aria-label="Close">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input required className="input-luxe" placeholder="Product name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                <input className="input-luxe" placeholder="Category (e.g. Hair care, Skincare)" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                <div className="relative">
                  <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted">₦</span>
                  <input required type="number" min={1} step={100} className="input-luxe !pl-8" placeholder="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
                </div>
                <input type="number" min={0} className="input-luxe" placeholder="Stock (leave empty if not tracked)" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
              </div>
              <textarea rows={2} className="input-luxe resize-none" placeholder="Description — what it does, size, key ingredients" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <div>
                <p className="label-luxe">Photo</p>
                <div className="flex flex-wrap items-center gap-2">
                  {PHOTO_PICKS.map((url) => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setDraft({ ...draft, image: url })}
                      className={cn("relative h-14 w-14 overflow-hidden rounded-xl ring-2", draft.image === url ? "ring-gold-500" : "ring-transparent opacity-80")}
                    >
                      <Photo src={url} alt="" fill sizes="56px" className="object-cover" />
                    </button>
                  ))}
                  <input className="input-luxe min-w-[220px] flex-1" placeholder="…or paste an image link (https://)" value={PHOTO_PICKS.includes(draft.image) ? "" : draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-espresso-800">
                <input type="checkbox" className="h-4 w-4 accent-gold-600" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                Show in my shop
              </label>
              {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy === "save"} className="btn-dark !py-2.5">
                  {busy === "save" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {draft.id ? "Save changes" : "Add to shop"}
                </button>
                <button type="button" onClick={() => setDraft(null)} className="btn-outline !py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {products.length === 0 && !draft ? (
            <div className="px-6 py-14 text-center">
              <ShoppingBag size={28} className="mx-auto text-gold-600" />
              <p className="font-display mt-3 text-2xl text-espresso-900">Stock your boutique</p>
              <p className="mt-1 text-sm text-muted">Add the hair, skincare and aftercare products you sell — clients can order for pickup or delivery.</p>
            </div>
          ) : (
            <ul className="divide-y divide-linen">
              {products.map((p) => (
                <li key={p.id} className={cn("flex flex-wrap items-center gap-4 px-6 py-4", !p.active && "opacity-60")}>
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-espresso-800">
                    {p.image ? <Photo src={p.image} alt="" fill sizes="56px" className="object-cover" /> : <Package size={20} className="absolute inset-0 m-auto text-gold-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-espresso-900">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.category && `${p.category} · `}
                      {p.stock === null ? "Stock not tracked" : p.stock === 0 ? "Sold out" : `${p.stock} in stock`}
                      {!p.active && " · Hidden"}
                    </p>
                  </div>
                  <span className="font-display text-xl text-espresso-900">{naira(p.price)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => patchProduct(p, { active: !p.active })} disabled={busy === p.id} className="rounded-full p-2 text-muted hover:bg-sand hover:text-espresso-900" title={p.active ? "Hide from shop" : "Show in shop"}>
                      {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() =>
                        setDraft({ id: p.id, name: p.name, price: String(p.price), category: p.category ?? "", stock: p.stock === null ? "" : String(p.stock), image: p.image ?? "", description: p.description ?? "", active: p.active })
                      }
                      className="rounded-full p-2 text-muted hover:bg-sand hover:text-espresso-900"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => remove(p)} disabled={busy === p.id} className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "orders" &&
        (orders.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-muted">No orders yet. Share your shop link to start selling.</p>
        ) : (
          <ul className="divide-y divide-linen">
            {orders.map((o) => (
              <li key={o.id} className="grid gap-4 px-6 py-5 md:grid-cols-[1fr_auto] md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-espresso-900">{o.customerName}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase", STATUS_STYLE[o.status])}>{o.status}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-espresso-700 uppercase">
                      {o.fulfilment === "pickup" ? <Store size={10} /> : <Truck size={10} />} {o.fulfilment}
                    </span>
                    <span className="text-xs text-muted">{new Date(o.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  <p className="mt-1 text-sm text-espresso-700">
                    {o.items.map((i) => `${i.qty} × ${i.name}`).join(", ")} · <b>{naira(o.subtotal)}</b>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {o.customerPhone}
                    {o.customerEmail && ` · ${o.customerEmail}`}
                    {o.address && ` · ${o.address}`}
                  </p>
                  {o.notes && <p className="mt-1 text-xs text-muted italic">“{o.notes}”</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {o.status === "pending" && (
                    <button onClick={() => setOrderStatus(o, "confirmed")} disabled={!!busy} className="btn-dark !px-4 !py-2 text-xs">
                      <Check size={14} /> Confirm
                    </button>
                  )}
                  {o.status === "confirmed" && (
                    <button onClick={() => setOrderStatus(o, "ready")} disabled={!!busy} className="btn-dark !px-4 !py-2 text-xs">
                      {o.fulfilment === "pickup" ? "Ready for pickup" : "Out for delivery"}
                    </button>
                  )}
                  {o.status === "ready" && (
                    <button onClick={() => setOrderStatus(o, "completed")} disabled={!!busy} className="btn-gold !px-4 !py-2 text-xs">
                      Mark completed
                    </button>
                  )}
                  {(o.status === "pending" || o.status === "confirmed" || o.status === "ready") && (
                    <button onClick={() => setOrderStatus(o, "cancelled")} disabled={!!busy} className="btn-outline !px-4 !py-2 text-xs">
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
