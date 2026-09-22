import { NextResponse } from "next/server";
import { getBusyIntervals, getOperator } from "@/lib/store";
import { chairCapacity, daySlots, isSlotFree, toISODate } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "";
  const date = searchParams.get("date") ?? "";
  const dur = Number(searchParams.get("duration") ?? 60);
  const op = await getOperator(slug);
  if (!op || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const busy = await getBusyIntervals(slug, date);
  const cap = chairCapacity(op);
  const now = new Date();
  const isToday = date === toISODate(now);
  const nowMins = now.getHours() * 60 + now.getMinutes() + 60; // 1h lead time
  const slots = daySlots(op.hours, date, dur).map((t) => {
    const [h, m] = t.split(":").map(Number);
    const past = isToday && h * 60 + m < nowMins;
    return { time: t, available: !past && isSlotFree(busy, t, dur, cap) };
  });
  return NextResponse.json({ slots });
}
