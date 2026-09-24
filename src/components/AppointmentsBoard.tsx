"use client";

import { useMemo, useState } from "react";
import { Check, Home, Loader2, Phone, Wallet, X } from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn, naira, prettyDate, prettyTime, toISODate } from "@/lib/utils";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "pending", label: "Needs action" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
] as const;

const BADGE: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  completed: "bg-sand text-espresso-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function AppointmentsBoard({ initial }: { initial: Booking[] }) {
  const [bookings, setBookings] = useState(initial);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("upcoming");
  const [busy, setBusy] = useState<string | null>(null);
  const today = toISODate(new Date());

  const list = useMemo(() => {
    switch (tab) {
      case "upcoming":
        return bookings.filter((b) => b.date >= today && b.status !== "cancelled" && b.status !== "completed");
      case "pending":
        return bookings.filter((b) => b.status === "pending");
      case "past":
        return bookings.filter((b) => b.date < today || b.status === "completed").reverse();
      default:
        return bookings;
    }
  }, [bookings, tab, today]);

  const setStatus = async (id: string, status: BookingStatus) => {
    setBusy(id + status);
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setBookings((all) => all.map((b) => (b.id === id ? { ...b, status } : b)));
    setBusy(null);
  };

  return (
    <div className="card-luxe overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linen px-6 py-4">
        <h2 className="font-display text-2xl text-espresso-900">Appointments</h2>
        <div className="flex gap-1 rounded-full bg-sand p-1">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("rounded-full px-3.5 py-1.5 text-xs font-semibold transition", tab === t.id ? "bg-espresso-900 text-gold-300" : "text-espresso-600 hover:text-espresso-900")}>
              {t.label}
              {t.id === "pending" && bookings.some((b) => b.status === "pending") && (
                <span className="ml-1.5 rounded-full bg-gold-500 px-1.5 text-[10px] text-espresso-900">{bookings.filter((b) => b.status === "pending").length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-muted">Nothing here yet. Share your profile link to start receiving bookings.</p>
      ) : (
        <ul className="divide-y divide-linen">
          {list.map((b) => (
            <li key={b.id} className="grid gap-4 px-6 py-5 md:grid-cols-[110px_1fr_auto] md:items-center">
              <div className={cn("rounded-2xl px-3 py-2 text-center", b.date === today ? "bg-espresso-900 text-ivory" : "bg-sand text-espresso-900")}>
                <p className="text-[10px] font-semibold tracking-wider uppercase opacity-70">{b.date === today ? "Today" : prettyDate(b.date, { weekday: "short" })}</p>
                <p className="font-display text-2xl leading-tight">{prettyDate(b.date, { day: "numeric", month: "short" })}</p>
                <p className="text-xs font-semibold opacity-80">{prettyTime(b.time)}</p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-espresso-900">{b.customerName}</p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase", BADGE[b.status])}>{b.status}</span>
                  {b.atHome && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-700 uppercase">
                      <Home size={10} /> Home
                    </span>
                  )}
                  {b.depositStatus === "paid" && b.depositAmount ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-bold text-gold-700 uppercase">
                      <Wallet size={10} /> {naira(b.depositAmount)} deposit paid
                    </span>
                  ) : b.depositStatus === "awaiting" && b.depositAmount ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-bold text-muted uppercase">
                      <Wallet size={10} /> deposit unpaid
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-espresso-700">
                  {b.serviceName} · <b>{b.priceLabel ?? naira(b.price)}</b>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <Phone size={11} /> {b.customerPhone} {b.customerEmail && `· ${b.customerEmail}`}
                </p>
                {b.notes && <p className="mt-1 truncate text-xs text-muted italic">“{b.notes}”</p>}
              </div>
              <div className="flex gap-2">
                {b.status === "pending" && (
                  <>
                    <button onClick={() => setStatus(b.id, "confirmed")} disabled={!!busy} className="btn-dark !px-4 !py-2 text-xs">
                      {busy === b.id + "confirmed" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Confirm
                    </button>
                    <button onClick={() => setStatus(b.id, "cancelled")} disabled={!!busy} className="btn-outline !px-4 !py-2 text-xs">
                      <X size={14} /> Decline
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <>
                    <button onClick={() => setStatus(b.id, "completed")} disabled={!!busy} className="btn-gold !px-4 !py-2 text-xs">
                      Mark done
                    </button>
                    <button onClick={() => setStatus(b.id, "cancelled")} disabled={!!busy} className="btn-outline !px-4 !py-2 text-xs">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
