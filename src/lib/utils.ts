import type { Hours, Weekday } from "./types";

export const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const priceTierLabel = (t: number) => "₦".repeat(t);

export const duration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h ? `${h}h` : "", m ? `${m}m` : ""].filter(Boolean).join(" ");
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 60);

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const weekdayOf = (isoDate: string): Weekday => WEEKDAYS[new Date(isoDate + "T12:00:00").getDay()];

export const toMins = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMins = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

/** 30-minute start slots within opening hours that leave room for the service. */
export function daySlots(hours: Hours, isoDate: string, serviceMins = 60): string[] {
  const h = hours[weekdayOf(isoDate)];
  if (!h) return [];
  const out: string[] = [];
  for (let t = toMins(h.open); t + Math.min(serviceMins, 60) <= toMins(h.close); t += 30) out.push(fromMins(t));
  return out;
}

export const prettyTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")}${suffix}`;
};

export const prettyDate = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Date(iso + "T12:00:00").toLocaleDateString("en-GB", opts);

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export type Interval = { start: number; end: number };

/** How many clients can be served at once. Independent stylists work one chair; houses run several. */
export const chairCapacity = (op: { kind: string }) => (op.kind === "Independent stylist" ? 1 : 3);

/** True if a new appointment [time, time+mins) keeps concurrent bookings within capacity. */
export function isSlotFree(busy: Interval[], time: string, mins: number, capacity: number) {
  const start = toMins(time);
  const end = start + mins;
  // check concurrency at every point where load can change inside the new interval
  const points = [start, ...busy.map((b) => b.start).filter((p) => p > start && p < end)];
  return points.every((p) => busy.filter((b) => b.start <= p && b.end > p).length < capacity);
}

/* ---------------- Service prices ---------------- */

type PricedService = { price: number; priceMax?: number; priceFrom?: boolean; onRequest?: boolean };

export function servicePriceLabel(s: PricedService): string {
  if (s.onRequest || !s.price) return "On consultation";
  if (s.priceMax && s.priceMax > s.price) return `${naira(s.price)} – ${naira(s.priceMax)}`;
  if (s.priceFrom) return `From ${naira(s.price)}`;
  return naira(s.price);
}

/** Lowest bookable price across a menu (ignores "on consultation" items). */
export function lowestPrice(services: PricedService[]): number {
  const prices = services.filter((s) => !s.onRequest && s.price > 0).map((s) => s.price);
  return prices.length ? Math.min(...prices) : 0;
}
