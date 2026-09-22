import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Home, Mail, MapPin, Phone } from "lucide-react";
import Photo from "@/components/Photo";
import { getBooking, getOperator } from "@/lib/store";
import { duration, naira, prettyDate, prettyTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking requested" };

export default async function BookingConfirmation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await getBooking(id);
  if (!booking) notFound();
  const op = await getOperator(booking.operatorSlug);
  if (!op) notFound();

  const statusCopy = {
    pending: ["Request sent", `${op.name} will confirm shortly — usually within the hour. We'll notify you by SMS/WhatsApp.`],
    confirmed: ["You're booked!", "Your appointment is confirmed. We can't wait to see you."],
    completed: ["Appointment complete", "We hope you loved it. Leave a review to help others."],
    cancelled: ["Booking cancelled", "This appointment has been cancelled."],
  }[booking.status];

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-espresso-900 py-16">
      <Photo src={op.cover} alt="" fill sizes="100vw" className="object-cover opacity-20 blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/80 to-espresso-900" />
      <div className="container-luxe relative max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-gold-300 ring-1 ring-gold-400/40">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="font-display mt-6 text-5xl text-ivory">{statusCopy[0]}</h1>
          <p className="mx-auto mt-3 max-w-md text-ivory/65">{statusCopy[1]}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] bg-ivory shadow-luxe">
          <div className="relative h-40">
            <Photo src={op.cover} alt={op.name} fill sizes="700px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/85 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <p className="font-display text-3xl text-ivory">{op.name}</p>
              <p className="flex items-center gap-1 text-xs text-ivory/75">
                <MapPin size={12} /> {op.address}
              </p>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Service</p>
                <p className="mt-1 text-lg font-semibold text-espresso-900">{booking.serviceName}</p>
              </div>
              <p className="font-display text-right text-2xl text-espresso-900 sm:text-3xl">{booking.priceLabel ?? naira(booking.price)}</p>
            </div>
            <div className="grid gap-3 rounded-2xl bg-sand p-4 text-sm text-espresso-800 sm:grid-cols-3">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-gold-700" />
                {prettyDate(booking.date, { weekday: "long", day: "numeric", month: "long" })}
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-gold-700" /> {prettyTime(booking.time)} · {duration(booking.durationMins)}
              </span>
              <span className="flex items-center gap-2">
                {booking.atHome ? <Home size={16} className="text-gold-700" /> : <MapPin size={16} className="text-gold-700" />}
                {booking.atHome ? "Home service" : "In-salon"}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linen pt-4 text-sm">
              <p className="text-muted">
                Reference <span className="font-mono font-semibold text-espresso-900">{booking.id.toUpperCase()}</span>
              </p>
              <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-bold tracking-wider text-gold-700 uppercase">
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {op.phone ? (
            <a href={`tel:${op.phone.replace(/\s/g, "")}`} className="btn-ghost-light">
              <Phone size={16} /> Call {op.name.split(" ")[0]}
            </a>
          ) : (
            <a href={`mailto:${op.email}`} className="btn-ghost-light">
              <Mail size={16} /> Email {op.name.split(" ")[0]}
            </a>
          )}
          <Link href={`/stylists/${op.slug}`} className="btn-ghost-light">
            View profile
          </Link>
          <Link href="/explore" className="btn-gold">
            Keep exploring
          </Link>
        </div>
      </div>
    </div>
  );
}
