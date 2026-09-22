import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createBooking, getBookings, getOperator } from "@/lib/store";
import { daySlots, servicePriceLabel } from "@/lib/utils";
import * as mail from "@/lib/email/templates";
import { sendLater } from "@/lib/email";


/** An operator's own appointments (signed-in only — contains customer contact details). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  return NextResponse.json({ bookings: await getBookings(session.slug) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const op = await getOperator(String(body.operatorSlug ?? ""));
    if (!op || op.hidden) return NextResponse.json({ error: "Business not found" }, { status: 404 });
    const svc = op.services.find((s) => s.id === body.serviceId);
    if (!svc) return NextResponse.json({ error: "Please choose a service" }, { status: 400 });

    const name = String(body.customerName ?? "").trim();
    const phone = String(body.customerPhone ?? "").trim();
    if (name.length < 2 || phone.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "Please enter your name and a valid phone number" }, { status: 400 });
    }
    const date = String(body.date ?? "");
    const time = String(body.time ?? "");
    if (!daySlots(op.hours, date, svc.durationMins).includes(time)) {
      return NextResponse.json({ error: "That time is outside opening hours" }, { status: 400 });
    }

    const booking = await createBooking({
      operatorSlug: op.slug,
      serviceId: svc.id,
      serviceName: svc.name,
      price: svc.price,
      priceLabel: servicePriceLabel(svc),
      durationMins: svc.durationMins,
      date,
      time,
      customerName: name.slice(0, 80),
      customerPhone: phone.slice(0, 30),
      customerEmail: String(body.customerEmail ?? "").slice(0, 120),
      notes: String(body.notes ?? "").slice(0, 500),
      atHome: Boolean(body.atHome) && op.homeService,
    });
    sendLater(op.email, () => mail.bookingNewForOperator({ booking, op }));
    sendLater(booking.customerEmail, () => mail.bookingReceivedForClient({ booking, op }));
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }
}
