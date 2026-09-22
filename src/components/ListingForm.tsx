"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/seed";
import { UPLOAD_CHOICES } from "@/lib/images";
import { PLANS, isPlanId, planInfo } from "@/lib/plans";
import type { CategoryId, PlanId, Weekday } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Your business", "Location & contact", "Service menu", "Opening hours", "Photos & plan"];
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

type Svc = { name: string; durationMins: number; price: number | "" };
type DayHours = { on: boolean; open: string; close: string };

export default function ListingForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [biz, setBiz] = useState({
    name: "",
    kind: "Salon",
    categories: [] as CategoryId[],
    leadName: "",
    leadTitle: "",
    tagline: "",
    bio: "",
    city: "Lagos",
    area: "",
    address: "",
    phone: "",
    email: "",
    instagram: "",
    password: "",
    confirm: "",
    homeService: false,
    plan: ((p) => (isPlanId(p) ? p : "essential"))(params.get("plan")) as PlanId,
  });
  const [services, setServices] = useState<Svc[]>([
    { name: "", durationMins: 60, price: "" },
    { name: "", durationMins: 60, price: "" },
  ]);
  const [hours, setHours] = useState<Record<Weekday, DayHours>>(
    Object.fromEntries(DAYS.map((d) => [d.id, { on: d.id !== "sun", open: "09:00", close: "19:00" }])) as Record<Weekday, DayHours>,
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [customUrl, setCustomUrl] = useState("");

  const up = (patch: Partial<typeof biz>) => setBiz((b) => ({ ...b, ...patch }));
  const plan = planInfo(biz.plan);
  const maxPhotos = plan.maxPhotos;

  const togglePhoto = (url: string) =>
    setPhotos((p) => (p.includes(url) ? p.filter((x) => x !== url) : p.length < maxPhotos ? [...p, url] : p));

  const validate = (): string => {
    if (step === 0) {
      if (biz.name.trim().length < 2) return "Please enter your business name.";
      if (!biz.categories.length) return "Choose at least one category.";
    }
    if (step === 1) {
      if (!biz.area.trim()) return "Please add your area or neighbourhood.";
      if (biz.phone.replace(/\D/g, "").length < 7) return "Please add a valid phone number.";
      if (!/^\S+@\S+\.\S+$/.test(biz.email)) return "Please add a valid email address.";
      if (biz.password.length < 8) return "Choose a password of at least 8 characters.";
      if (biz.password !== biz.confirm) return "The two passwords don't match.";
    }
    if (step === 2 && !services.some((s) => s.name.trim() && Number(s.price) > 0))
      return "Add at least one service with a price.";
    if (step === 3 && !DAYS.some((d) => hours[d.id].on)) return "Open on at least one day.";
    if (step === 4 && !photos.length) return "Pick at least one photo for your cover.";
    return "";
  };

  const next = () => {
    const v = validate();
    setError(v);
    if (!v) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const submit = async () => {
    const v = validate();
    if (v) return setError(v);
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/operators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...biz,
        services: services.filter((s) => s.name.trim() && Number(s.price) > 0),
        hours: Object.fromEntries(DAYS.map((d) => [d.id, hours[d.id].on ? { open: hours[d.id].open, close: hours[d.id].close } : null])),
        cover: photos[0],
        gallery: photos,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }
    router.push(`/dashboard/${data.operator.slug}?welcome=1`);
  };

  return (
    <div className="card-luxe overflow-hidden">
      {/* progress */}
      <div className="border-b border-linen bg-sand/50 px-6 py-5 md:px-8">
        <div className="flex items-center justify-between text-xs font-semibold text-muted">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span className="text-gold-700">{STEPS[step]}</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all", i <= step ? "bg-gradient-to-r from-gold-400 to-gold-600" : "bg-linen")} />
          ))}
        </div>
      </div>

      <div className="space-y-5 p-6 md:p-8">
        {step === 0 && (
          <>
            <div>
              <label className="label-luxe">Business name</label>
              <input className="input-luxe" placeholder="e.g. Maison Adaeze" value={biz.name} onChange={(e) => up({ name: e.target.value })} />
            </div>
            <div>
              <label className="label-luxe">Type of business</label>
              <div className="flex flex-wrap gap-2">
                {KINDS.map((k) => (
                  <button type="button" key={k} onClick={() => up({ kind: k })} className={cn("rounded-full border px-4 py-2 text-xs font-semibold transition", biz.kind === k ? "border-espresso-900 bg-espresso-900 text-gold-300" : "border-linen hover:border-gold-500")}>
                    {k}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label-luxe">What do you offer?</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CATEGORIES.map((c) => {
                  const on = biz.categories.includes(c.id);
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => up({ categories: on ? biz.categories.filter((x) => x !== c.id) : [...biz.categories, c.id] })}
                      className={cn("flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition", on ? "border-gold-500 bg-gold-500/10 text-espresso-900" : "border-linen text-espresso-700 hover:border-gold-500")}
                    >
                      {c.name}
                      {on && <Check size={16} className="text-gold-700" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-luxe">Lead stylist / owner</label>
                <input className="input-luxe" placeholder="Full name" value={biz.leadName} onChange={(e) => up({ leadName: e.target.value })} />
              </div>
              <div>
                <label className="label-luxe">Their title</label>
                <input className="input-luxe" placeholder="e.g. Creative Director" value={biz.leadTitle} onChange={(e) => up({ leadTitle: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label-luxe">Tagline</label>
              <input className="input-luxe" maxLength={120} placeholder="One line that captures your craft" value={biz.tagline} onChange={(e) => up({ tagline: e.target.value })} />
            </div>
            <div>
              <label className="label-luxe">About your business</label>
              <textarea rows={4} className="input-luxe resize-none" placeholder="Your story, specialities, products you use, what makes a visit special…" value={biz.bio} onChange={(e) => up({ bio: e.target.value })} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-luxe">City</label>
                <select className="input-luxe" value={biz.city} onChange={(e) => up({ city: e.target.value })}>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-luxe">Area / neighbourhood</label>
                <input className="input-luxe" placeholder="e.g. Lekki Phase 1" value={biz.area} onChange={(e) => up({ area: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label-luxe">Street address</label>
              <input className="input-luxe" placeholder="Where clients will find you" value={biz.address} onChange={(e) => up({ address: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label-luxe">Phone / WhatsApp</label>
                <input type="tel" className="input-luxe" placeholder="+234…" value={biz.phone} onChange={(e) => up({ phone: e.target.value })} />
              </div>
              <div>
                <label className="label-luxe">Email (booking alerts & login)</label>
                <input type="email" className="input-luxe" placeholder="you@business.com" value={biz.email} onChange={(e) => up({ email: e.target.value })} />
              </div>
            </div>
            <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-4">
              <p className="text-sm font-semibold text-espresso-900">Your operator login</p>
              <p className="mb-3 text-xs text-muted">You&apos;ll sign in with the email above and this password to manage bookings.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input type="password" autoComplete="new-password" className="input-luxe" placeholder="Password (8+ characters)" value={biz.password} onChange={(e) => up({ password: e.target.value })} />
                <input type="password" autoComplete="new-password" className="input-luxe" placeholder="Confirm password" value={biz.confirm} onChange={(e) => up({ confirm: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label-luxe">Instagram (optional)</label>
              <input className="input-luxe" placeholder="@yourhandle" value={biz.instagram} onChange={(e) => up({ instagram: e.target.value })} />
            </div>
            <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-sand px-5 py-4">
              <span>
                <span className="block text-sm font-semibold text-espresso-900">I offer home service</span>
                <span className="text-xs text-muted">Clients can request you come to them.</span>
              </span>
              <input type="checkbox" className="h-5 w-5 accent-gold-600" checked={biz.homeService} onChange={(e) => up({ homeService: e.target.checked })} />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm text-muted">
              List what clients can book. Clear names and honest prices convert best. (Up to {plan.maxServices} on {plan.name})
            </p>
            <div className="space-y-3">
              {services.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl border border-linen p-3 sm:grid-cols-[1fr_120px_140px_auto]">
                  <input className="input-luxe col-span-2 sm:col-span-1" placeholder="Service name (e.g. Silk press)" value={s.name} onChange={(e) => setServices((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <select className="input-luxe" value={s.durationMins} onChange={(e) => setServices((a) => a.map((x, j) => (j === i ? { ...x, durationMins: Number(e.target.value) } : x)))} aria-label="Duration">
                    {[15, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300, 360].map((m) => (
                      <option key={m} value={m}>
                        {m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? "s" : ""}`}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-sm text-muted">₦</span>
                    <input type="number" min={0} step={500} className="input-luxe !pl-8" placeholder="Price" value={s.price} onChange={(e) => setServices((a) => a.map((x, j) => (j === i ? { ...x, price: e.target.value === "" ? "" : Number(e.target.value) } : x)))} />
                  </div>
                  <button type="button" onClick={() => setServices((a) => a.filter((_, j) => j !== i))} className="flex items-center justify-center rounded-2xl px-3 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Remove service">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={services.length >= plan.maxServices}
              onClick={() => setServices((a) => [...a, { name: "", durationMins: 60, price: "" }])}
              className="btn-outline !py-2.5 text-xs"
            >
              <Plus size={14} /> Add service
            </button>
          </>
        )}

        {step === 3 && (
          <div className="space-y-2">
            {DAYS.map((d) => {
              const h = hours[d.id];
              const set = (patch: Partial<DayHours>) => setHours((x) => ({ ...x, [d.id]: { ...x[d.id], ...patch } }));
              return (
                <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-linen px-4 py-3">
                  <label className="flex w-36 cursor-pointer items-center gap-3 text-sm font-semibold text-espresso-900">
                    <input type="checkbox" checked={h.on} onChange={(e) => set({ on: e.target.checked })} className="h-4 w-4 accent-gold-600" />
                    {d.label}
                  </label>
                  {h.on ? (
                    <div className="flex items-center gap-2 text-sm">
                      <input type="time" step={1800} value={h.open} onChange={(e) => set({ open: e.target.value })} className="input-luxe !w-auto !py-2" />
                      <span className="text-muted">to</span>
                      <input type="time" step={1800} value={h.close} onChange={(e) => set({ close: e.target.value })} className="input-luxe !w-auto !py-2" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <>
            <div>
              <label className="label-luxe">Photos — first selected becomes your cover ({photos.length}/{maxPhotos})</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {[...UPLOAD_CHOICES.map((u) => u.url), ...photos.filter((p) => !UPLOAD_CHOICES.some((u) => u.url === p))].map((url) => {
                  const idx = photos.indexOf(url);
                  return (
                    <button type="button" key={url} onClick={() => togglePhoto(url)} className={cn("relative aspect-square overflow-hidden rounded-2xl ring-2 transition", idx >= 0 ? "ring-gold-500" : "ring-transparent opacity-80 hover:opacity-100")}>
                      <Image src={url} alt="" fill sizes="120px" className="object-cover" unoptimized={!url.includes("images.unsplash.com")} />
                      {idx >= 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-espresso-900">
                          {idx === 0 ? "Cover" : idx + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input className="input-luxe" placeholder="Or paste an image link (https://…) from Instagram, Drive, Cloudinary…" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                <button
                  type="button"
                  className="btn-outline shrink-0 !px-4 !py-2 text-xs"
                  onClick={() => {
                    if (customUrl.startsWith("https://")) {
                      togglePhoto(customUrl.trim());
                      setCustomUrl("");
                    }
                  }}
                >
                  <ImagePlus size={14} /> Add
                </button>
              </div>
              <p className="mt-2 text-xs text-muted">Tip: bright, well-lit photos of your space and finished looks get up to 3× more bookings.</p>
            </div>
            <div>
              <label className="label-luxe">Choose your plan</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {PLANS.map((p) => (
                  <button type="button" key={p.id} onClick={() => up({ plan: p.id })} className={cn("rounded-2xl border p-4 text-left transition", biz.plan === p.id ? "border-gold-500 bg-gold-500/10" : "border-linen hover:border-gold-500")}>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl text-espresso-900">{p.name}</span>
                      {biz.plan === p.id && <Check size={18} className="text-gold-700" />}
                    </div>
                    <p className="text-sm font-semibold text-espresso-700">
                      {p.price} <span className="font-normal text-muted">{p.note}</span>
                    </p>
                    {p.badge && <p className="mt-1 text-[11px] font-semibold text-gold-700">{p.badge}</p>}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="flex items-center justify-between border-t border-linen pt-6">
          <button type="button" onClick={() => { setError(""); setStep((s) => Math.max(0, s - 1)); }} disabled={step === 0} className="btn-outline !py-2.5 disabled:invisible">
            <ArrowLeft size={16} /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-dark">
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="btn-gold">
              {submitting && <Loader2 size={16} className="animate-spin" />} Publish my listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
