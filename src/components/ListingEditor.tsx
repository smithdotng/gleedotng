"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, Copy, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/seed";
import { UPLOAD_CHOICES } from "@/lib/images";
import { planInfo } from "@/lib/plans";
import type { CategoryId, Operator, Service, Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAYS: { id: Weekday; label: string }[] = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];
const KINDS = ["Salon", "Studio", "Spa", "Barbershop", "Independent stylist"];
const TABS = ["Profile", "Photos", "Services", "Opening hours"] as const;
type Tab = (typeof TABS)[number];

type Row = Service & { priceMax?: number; priceFrom?: boolean; onRequest?: boolean };
type DayRow = { on: boolean; open: string; close: string };

export default function ListingEditor({ op, tab: initialTab = "Profile" }: { op: Operator; tab?: Tab }) {
  const router = useRouter();
  const plan = planInfo(op.plan);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [biz, setBiz] = useState({
    name: op.name,
    kind: op.kind as string,
    categories: op.categories as CategoryId[],
    city: op.city,
    area: op.area,
    address: op.address,
    phone: op.phone,
    email: op.email,
    instagram: op.instagram ?? "",
    tagline: op.tagline,
    bio: op.bio,
    leadName: op.lead?.name ?? "",
    leadTitle: op.lead?.title ?? "",
    homeService: op.homeService,
  });
  const [cover, setCover] = useState(op.cover);
  const [gallery, setGallery] = useState<string[]>(op.gallery ?? []);
  const [newPhoto, setNewPhoto] = useState("");
  const [services, setServices] = useState<Row[]>(op.services.map((s) => ({ ...s })));
  const [hours, setHours] = useState<Record<Weekday, DayRow>>(
    Object.fromEntries(
      DAYS.map((d) => [d.id, op.hours?.[d.id] ? { on: true, ...op.hours[d.id]! } : { on: false, open: "09:00", close: "19:00" }]),
    ) as Record<Weekday, DayRow>,
  );

  const change = (k: keyof typeof biz, v: string | boolean | CategoryId[]) => {
    setBiz((b) => ({ ...b, [k]: v }));
    setSaved(false);
  };
  const changeService = (i: number, patch: Partial<Row>) => {
    setServices((list) => list.map((s, n) => (n === i ? { ...s, ...patch } : s)));
    setSaved(false);
  };
  const photosLeft = plan.maxPhotos - 1 - gallery.length;

  const save = async () => {
    setBusy(true);
    setError("");
    const body = {
      ...biz,
      cover,
      gallery,
      services: services.map((s) => ({ ...s, price: Number(s.price) || 0, priceMax: Number(s.priceMax) || 0 })),
      hours: Object.fromEntries(DAYS.map((d) => [d.id, hours[d.id].on ? { open: hours[d.id].open, close: hours[d.id].close } : null])),
    };
    const res = await fetch(`/api/operators/${op.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not save your changes.");
    setSaved(true);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-full bg-sand p-1 text-sm font-semibold">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("rounded-full px-5 py-2.5 transition", tab === t ? "bg-espresso-900 text-ivory" : "text-espresso-600 hover:text-espresso-900")}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="card-luxe grid gap-5 p-6 md:grid-cols-2 md:p-8">
          <div className="md:col-span-2">
            <label className="label-luxe" htmlFor="name">Business name</label>
            <input id="name" value={biz.name} onChange={(e) => change("name", e.target.value)} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe" htmlFor="kind">Type of business</label>
            <select id="kind" value={biz.kind} onChange={(e) => change("kind", e.target.value)} className="input-luxe">
              {KINDS.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-luxe" htmlFor="city">City</label>
            <select id="city" value={biz.city} onChange={(e) => change("city", e.target.value)} className="input-luxe">
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <span className="label-luxe">What you do</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = biz.categories.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => change("categories", on ? biz.categories.filter((x) => x !== c.id) : [...biz.categories, c.id])}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      on ? "border-gold-500 bg-gold-500/15 text-espresso-900" : "border-linen text-espresso-600 hover:border-gold-400",
                    )}
                  >
                    {on && <Check size={13} className="mr-1 inline" />}
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label-luxe" htmlFor="area">Area / neighbourhood</label>
            <input id="area" value={biz.area} onChange={(e) => change("area", e.target.value)} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe" htmlFor="phone">Phone</label>
            <input id="phone" value={biz.phone} onChange={(e) => change("phone", e.target.value)} className="input-luxe" />
          </div>
          <div className="md:col-span-2">
            <label className="label-luxe" htmlFor="address">Full address</label>
            <input id="address" value={biz.address} onChange={(e) => change("address", e.target.value)} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe" htmlFor="email">Booking email</label>
            <input id="email" value={biz.email} onChange={(e) => change("email", e.target.value)} className="input-luxe" />
            <p className="mt-1.5 text-xs text-muted">Where booking and order alerts go. Your sign-in email doesn&apos;t change.</p>
          </div>
          <div>
            <label className="label-luxe" htmlFor="instagram">Instagram handle</label>
            <input id="instagram" value={biz.instagram} onChange={(e) => change("instagram", e.target.value)} className="input-luxe" placeholder="come2jane" />
          </div>
          <div className="md:col-span-2">
            <label className="label-luxe" htmlFor="tagline">One-line introduction</label>
            <input id="tagline" value={biz.tagline} onChange={(e) => change("tagline", e.target.value)} className="input-luxe" maxLength={140} />
          </div>
          <div className="md:col-span-2">
            <label className="label-luxe" htmlFor="bio">Your story</label>
            <textarea id="bio" value={biz.bio} onChange={(e) => change("bio", e.target.value)} rows={6} className="input-luxe !h-auto" />
          </div>
          <div>
            <label className="label-luxe" htmlFor="leadName">Lead stylist</label>
            <input id="leadName" value={biz.leadName} onChange={(e) => change("leadName", e.target.value)} className="input-luxe" />
          </div>
          <div>
            <label className="label-luxe" htmlFor="leadTitle">Their title</label>
            <input id="leadTitle" value={biz.leadTitle} onChange={(e) => change("leadTitle", e.target.value)} className="input-luxe" placeholder="Owner & lead stylist" />
          </div>
          <label className="flex cursor-pointer items-center gap-3 md:col-span-2">
            <input type="checkbox" checked={biz.homeService} onChange={(e) => change("homeService", e.target.checked)} className="h-5 w-5 accent-[#c9a25c]" />
            <span className="text-sm text-espresso-800">We offer home service</span>
          </label>
        </div>
      )}

      {tab === "Photos" && (
        <div className="card-luxe p-6 md:p-8">
          <h3 className="font-display text-2xl text-espresso-900">Cover photo</h3>
          <p className="mt-1 text-sm text-muted">The first thing clients see. Your plan allows {plan.maxPhotos} photos in total.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-[260px_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <div>
              <input
                value={cover}
                onChange={(e) => {
                  setCover(e.target.value);
                  setSaved(false);
                }}
                className="input-luxe"
                placeholder="https://… image URL"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {UPLOAD_CHOICES.slice(0, 10).map((c) => (
                  <button
                    key={c.url}
                    type="button"
                    onClick={() => {
                      setCover(c.url);
                      setSaved(false);
                    }}
                    className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-espresso-600 hover:bg-linen"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h3 className="font-display mt-10 text-2xl text-espresso-900">Gallery</h3>
          <p className="mt-1 text-sm text-muted">{photosLeft > 0 ? `${photosLeft} more photo${photosLeft === 1 ? "" : "s"} available on your plan.` : "You've used every photo your plan allows."}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((g, i) => (
              <div key={`${g}-${i}`} className="group relative overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g} alt="" className="aspect-square w-full object-cover" />
                <button
                  onClick={() => {
                    setGallery(gallery.filter((_, n) => n !== i));
                    setSaved(false);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-espresso-950/70 p-2 text-ivory opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <input value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} className="input-luxe flex-1" placeholder="https://… image URL" />
            <button
              type="button"
              disabled={!newPhoto.trim() || photosLeft <= 0}
              onClick={() => {
                setGallery([...gallery, newPhoto.trim()]);
                setNewPhoto("");
                setSaved(false);
              }}
              className="btn-outline"
            >
              <ImagePlus size={15} /> Add photo
            </button>
          </div>
        </div>
      )}

      {tab === "Services" && (
        <div className="card-luxe p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl text-espresso-900">Service menu</h3>
              <p className="mt-1 text-sm text-muted">
                {services.length} of {plan.maxServices} services. A range shows as &ldquo;₦x – ₦y&rdquo;, &ldquo;from&rdquo; shows as &ldquo;From ₦x&rdquo;.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setServices([...services, { id: `new-${Date.now()}`, name: "", durationMins: 60, price: 0 }]);
                setSaved(false);
              }}
              className="btn-outline"
            >
              <Plus size={15} /> Add service
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {services.map((s, i) => (
              <div key={s.id} className="rounded-2xl border border-linen p-4">
                <div className="grid gap-3 md:grid-cols-[1.6fr_1fr]">
                  <input
                    value={s.name}
                    onChange={(e) => changeService(i, { name: e.target.value })}
                    className="input-luxe"
                    placeholder="Service name"
                  />
                  <input
                    value={s.group ?? ""}
                    onChange={(e) => changeService(i, { group: e.target.value })}
                    className="input-luxe"
                    placeholder="Section (e.g. Hair treatment)"
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <label className="text-xs font-semibold text-muted">
                    Minutes
                    <input
                      type="number"
                      min={15}
                      step={15}
                      value={s.durationMins}
                      onChange={(e) => changeService(i, { durationMins: Number(e.target.value) })}
                      className="input-luxe mt-1"
                    />
                  </label>
                  <label className="text-xs font-semibold text-muted">
                    Price ₦
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={s.price || ""}
                      onChange={(e) => changeService(i, { price: Number(e.target.value) })}
                      className="input-luxe mt-1"
                      disabled={s.onRequest}
                    />
                  </label>
                  <label className="text-xs font-semibold text-muted">
                    Up to ₦ <span className="font-normal">(optional)</span>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={s.priceMax || ""}
                      onChange={(e) => changeService(i, { priceMax: Number(e.target.value) })}
                      className="input-luxe mt-1"
                      disabled={s.onRequest}
                    />
                  </label>
                  <div className="flex flex-col justify-center gap-2 pt-4 text-xs">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={Boolean(s.priceFrom)} onChange={(e) => changeService(i, { priceFrom: e.target.checked })} className="h-4 w-4 accent-[#c9a25c]" />
                      Show as &ldquo;From&rdquo;
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input type="checkbox" checked={Boolean(s.onRequest)} onChange={(e) => changeService(i, { onRequest: e.target.checked })} className="h-4 w-4 accent-[#c9a25c]" />
                      On consultation
                    </label>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <input
                    value={s.description ?? ""}
                    onChange={(e) => changeService(i, { description: e.target.value })}
                    className="input-luxe"
                    placeholder="A line of detail (optional)"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setServices([...services.slice(0, i + 1), { ...s, id: `new-${Date.now()}`, name: `${s.name} (copy)` }, ...services.slice(i + 1)]);
                        setSaved(false);
                      }}
                      className="rounded-full p-2.5 text-muted hover:bg-sand"
                      aria-label="Duplicate service"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServices(services.filter((_, n) => n !== i));
                        setSaved(false);
                      }}
                      className="rounded-full p-2.5 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove service"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Opening hours" && (
        <div className="card-luxe p-6 md:p-8">
          <h3 className="font-display text-2xl text-espresso-900">Opening hours</h3>
          <p className="mt-1 text-sm text-muted">Clients can only book inside these hours — closed days never appear.</p>
          <div className="mt-6 space-y-3">
            {DAYS.map((d) => {
              const h = hours[d.id];
              return (
                <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-sand/70 px-4 py-3">
                  <label className="flex w-40 cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={h.on}
                      onChange={(e) => {
                        setHours({ ...hours, [d.id]: { ...h, on: e.target.checked } });
                        setSaved(false);
                      }}
                      className="h-5 w-5 accent-[#c9a25c]"
                    />
                    <span className="font-semibold text-espresso-800">{d.label}</span>
                  </label>
                  {h.on ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={15} className="text-gold-600" />
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => {
                          setHours({ ...hours, [d.id]: { ...h, open: e.target.value } });
                          setSaved(false);
                        }}
                        className="input-luxe !h-11 !w-32"
                      />
                      <span className="text-muted">to</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => {
                          setHours({ ...hours, [d.id]: { ...h, close: e.target.value } });
                          setSaved(false);
                        }}
                        className="input-luxe !h-11 !w-32"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="text-muted">Quick set:</span>
            {[
              { label: "Mon–Sat 9–7", days: ["mon", "tue", "wed", "thu", "fri", "sat"], open: "09:00", close: "19:00" },
              { label: "Tue–Sun 10–8", days: ["tue", "wed", "thu", "fri", "sat", "sun"], open: "10:00", close: "20:00" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const next = { ...hours };
                  for (const d of DAYS) {
                    next[d.id] = preset.days.includes(d.id)
                      ? { on: true, open: preset.open, close: preset.close }
                      : { ...next[d.id], on: false };
                  }
                  setHours(next);
                  setSaved(false);
                }}
                className="rounded-full bg-sand px-3 py-1.5 font-semibold text-espresso-600 hover:bg-linen"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-espresso-900 px-6 py-4 shadow-luxe">
        <p className="text-sm text-ivory/70">
          {error ? <span className="text-red-300">{error}</span> : saved ? <span className="text-gold-300">Saved — your listing is updated.</span> : "Changes across all four tabs save together."}
        </p>
        <div className="flex gap-3">
          <Link href={`/stylists/${op.slug}`} className="btn-ghost-light !py-2.5">
            View profile
          </Link>
          <button onClick={save} disabled={busy} className="btn-gold !py-2.5">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
