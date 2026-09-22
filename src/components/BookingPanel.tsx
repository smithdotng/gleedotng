"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, Home, Loader2, Lock } from "lucide-react";
import type { Operator } from "@/lib/types";
import { addDays, cn, duration, prettyTime, servicePriceLabel, toISODate, weekdayOf } from "@/lib/utils";

export const SELECT_SERVICE_EVENT = "glee:select-service";

export default function BookingPanel({ op }: { op: Operator }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(op.services[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [atHome, setAtHome] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const service = op.services.find((s) => s.id === serviceId);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(today, i);
      const iso = toISODate(d);
      return { iso, d, open: !!op.hours[weekdayOf(iso)] };
    });
  }, [op.hours]);

  useEffect(() => {
    const first = days.find((d) => d.open);
    if (first) setDate(first.iso);
  }, [days]);

  useEffect(() => {
    const handler = (e: Event) => setServiceId((e as CustomEvent<string>).detail);
    window.addEventListener(SELECT_SERVICE_EVENT, handler);
    return () => window.removeEventListener(SELECT_SERVICE_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!date || !service) return;
    setLoadingSlots(true);
    setTime("");
    fetch(`/api/availability?slug=${op.slug}&date=${date}&duration=${service.durationMins}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [date, service, op.slug]);

  const canSubmit = service && date && time && form.name.trim() && form.phone.trim().length >= 7;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorSlug: op.slug,
          serviceId,
          date,
          time,
          atHome,
          customerName: form.name,
          customerPhone: form.phone,
          customerEmail: form.email,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form id="book" onSubmit={submit} className="scroll-mt-24 overflow-hidden rounded-[28px] bg-white shadow-luxe ring-1 ring-gold-500/25">
      <div className="bg-espresso-900 px-6 py-5">
        <p className="eyebrow !text-gold-400">Reserve your chair</p>
        <p className="font-display mt-1 text-2xl text-ivory">Book an appointment</p>
      </div>

      <div className="space-y-6 p-6">
        {/* Service */}
        <div>
          <label className="label-luxe">1 · Service</label>
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="input-luxe">
            {[...new Set(op.services.map((s) => s.group ?? ""))].map((g) => {
              const opts = op.services
                .filter((s) => (s.group ?? "") === g)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {servicePriceLabel(s)}
                  </option>
                ));
              return g ? (
                <optgroup key={g} label={g}>
                  {opts}
                </optgroup>
              ) : (
                opts
              );
            })}
          </select>
          {service && (
            <p className="mt-2 flex items-center gap-3 text-xs text-muted">
              <span className="inline-flex items-center gap-1">
                <Clock size={12} /> {duration(service.durationMins)}
              </span>
              <span className="font-bold text-espresso-900">{servicePriceLabel(service)}</span>
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="label-luxe flex items-center gap-1.5">
            <CalendarDays size={13} /> 2 · Date
          </label>
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
            {days.map(({ iso, d, open }) => (
              <button
                type="button"
                key={iso}
                disabled={!open}
                onClick={() => setDate(iso)}
                className={cn(
                  "flex w-14 shrink-0 snap-start flex-col items-center rounded-2xl border py-2.5 transition",
                  date === iso
                    ? "border-espresso-900 bg-espresso-900 text-ivory"
                    : "border-linen bg-white text-espresso-800 hover:border-gold-500",
                  !open && "cursor-not-allowed opacity-35",
                )}
              >
                <span className="text-[10px] font-semibold tracking-wider uppercase opacity-70">
                  {d.toLocaleDateString("en-GB", { weekday: "short" })}
                </span>
                <span className="font-display text-xl leading-tight">{d.getDate()}</span>
                <span className="text-[10px] opacity-60">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="label-luxe flex items-center gap-1.5">
            <Clock size={13} /> 3 · Time
          </label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 py-3 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" /> Checking availability…
            </div>
          ) : slots.length ? (
            <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto pr-1">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.time}
                  disabled={!s.available}
                  onClick={() => setTime(s.time)}
                  className={cn(
                    "rounded-xl border py-2 text-xs font-semibold transition",
                    time === s.time
                      ? "border-gold-500 bg-gold-500 text-espresso-900"
                      : "border-linen text-espresso-700 hover:border-gold-500",
                    !s.available && "cursor-not-allowed line-through opacity-35",
                  )}
                >
                  {prettyTime(s.time)}
                </button>
              ))}
            </div>
          ) : (
            <p className="py-2 text-sm text-muted">Closed on this day — please choose another date.</p>
          )}
        </div>

        {op.homeService && (
          <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-sand px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-espresso-800">
              <Home size={16} className="text-gold-700" /> Come to me (home service)
            </span>
            <input type="checkbox" checked={atHome} onChange={(e) => setAtHome(e.target.checked)} className="h-4 w-4 accent-gold-600" />
          </label>
        )}

        {/* Details */}
        <div className="space-y-3">
          <label className="label-luxe">4 · Your details</label>
          <input required placeholder="Full name" className="input-luxe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input required type="tel" placeholder="Phone / WhatsApp" className="input-luxe" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input type="email" placeholder="Email (optional)" className="input-luxe" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <textarea rows={2} placeholder="Notes for your stylist (inspo, allergies, address for home service…)" className="input-luxe resize-none" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={!canSubmit || submitting} className="btn-gold w-full !py-4">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {time && service ? `Request ${prettyTime(time)} · ${servicePriceLabel(service)}` : "Select a time"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <Lock size={11} /> Pay at the venue · Free cancellation up to 24h before
        </p>
      </div>
    </form>
  );
}
