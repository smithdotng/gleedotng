import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getBooking, getOperator, updateBookingStatus } from "@/lib/store";
import * as mail from "@/lib/email/templates";
import { sendLater } from "@/lib/email";

import type { BookingStatus } from "@/lib/types";

const ALLOWED: BookingStatus[] = ["pending", "confirmed", "completed", "cancelled"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();
  if (!ALLOWED.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const existing = await getBooking(id);
  if (!existing || existing.operatorSlug !== session.slug) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const booking = await updateBookingStatus(id, status);
  if (booking && status !== existing.status && booking.customerEmail) {
    const op = await getOperator(booking.operatorSlug);
    if (op) sendLater(booking.customerEmail, () => mail.bookingStatusForClient({ booking, op }));
  }
  return NextResponse.json({ booking });
}
