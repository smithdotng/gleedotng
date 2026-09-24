import { NextResponse } from "next/server";
import { createPayment, getBooking, getOperator } from "@/lib/store";
import { createPaymentLink, newTxRef } from "@/lib/billing";
import { siteUrl } from "@/lib/site";

/** Starts payment of a booking deposit. Anyone holding the booking id may pay it — that's the client. */
export async function POST(req: Request) {
  const { bookingId } = await req.json().catch(() => ({}));
  const booking = typeof bookingId === "string" ? await getBooking(bookingId) : undefined;
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  if (booking.status === "cancelled") return NextResponse.json({ error: "This booking was cancelled." }, { status: 400 });
  if (booking.depositStatus !== "awaiting" || !booking.depositAmount) {
    return NextResponse.json({ error: "No deposit is due on this booking." }, { status: 400 });
  }
  const op = await getOperator(booking.operatorSlug);
  if (!op) return NextResponse.json({ error: "Business not found." }, { status: 404 });

  const txRef = newTxRef(`dep-${booking.id}`);
  const link = await createPaymentLink({
    txRef,
    plan: op.plan,
    amount: booking.depositAmount,
    email: booking.customerEmail || op.email,
    name: booking.customerName,
    redirectUrl: `${siteUrl()}/api/billing/callback`,
    description: `Deposit — ${booking.serviceName} at ${op.name}`,
  });
  if (!link) return NextResponse.json({ error: "Card payments are not available right now." }, { status: 503 });

  await createPayment({
    txRef,
    operatorSlug: op.slug,
    plan: op.plan,
    amount: booking.depositAmount,
    method: "flutterwave",
    status: "pending",
    kind: "deposit",
    bookingId: booking.id,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ url: link });
}
