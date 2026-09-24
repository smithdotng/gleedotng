import { NextResponse } from "next/server";
import { after } from "next/server";
import { getBookingsNeedingReminder, getOperator, markReminded } from "@/lib/store";
import { hasReminders } from "@/lib/plans";
import { addDays, toISODate } from "@/lib/utils";
import { sendEmail } from "@/lib/email";
import * as mail from "@/lib/email/templates";
import type { Booking, Operator } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Appointment reminders — run once a day (Vercel Cron hits this).
 *
 * Every client with an appointment tomorrow gets a reminder, and their business gets the
 * day-ahead list. Reminders are a Signature/Prestige feature and a business can switch them
 * off. Each booking is stamped once it has been reminded, so a second run sends nothing.
 *
 * Secure with CRON_SECRET: Vercel sends it as `Authorization: Bearer <secret>`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const given = new URL(req.url).searchParams.get("key");
    if (auth !== `Bearer ${secret}` && given !== secret) {
      return NextResponse.json({ error: "Not authorised." }, { status: 401 });
    }
  }

  const date = toISODate(addDays(new Date(), 1));
  const due = await getBookingsNeedingReminder(date);

  const operators = new Map<string, Operator | undefined>();
  const perOperator = new Map<string, Booking[]>();
  let sent = 0;
  let skipped = 0;

  for (const booking of due) {
    if (!operators.has(booking.operatorSlug)) operators.set(booking.operatorSlug, await getOperator(booking.operatorSlug));
    const op = operators.get(booking.operatorSlug);
    if (!op || !hasReminders(op) || op.remindersOn === false) {
      skipped++;
      continue;
    }
    perOperator.set(op.slug, [...(perOperator.get(op.slug) ?? []), booking]);
    if (booking.customerEmail) {
      await sendEmail(booking.customerEmail, mail.appointmentReminder({ booking, op }));
      sent++;
    }
    await markReminded(booking.id);
  }

  // one day-ahead list per business, after the response
  after(async () => {
    for (const [slug, bookings] of perOperator) {
      const op = operators.get(slug);
      if (!op) continue;
      const ordered = [...bookings].sort((a, b) => a.time.localeCompare(b.time));
      await sendEmail(op.email, mail.dayAheadForOperator({ op, bookings: ordered, date }));
    }
  });

  return NextResponse.json({ date, due: due.length, sent, skipped, businesses: perOperator.size });
}
