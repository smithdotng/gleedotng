import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, MapPin, Phone, Store, Truck } from "lucide-react";
import Photo from "@/components/Photo";
import { getOperator, getOrder } from "@/lib/store";
import { naira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order placed" };

const COPY = {
  pending: ["Order received", "The boutique will confirm your order shortly."],
  confirmed: ["Order confirmed", "Your items are being prepared."],
  ready: ["Ready for you", "Your order is ready for pickup or on its way."],
  completed: ["Order complete", "Thank you for shopping with us."],
  cancelled: ["Order cancelled", "This order has been cancelled."],
} as const;

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  const op = await getOperator(order.operatorSlug);
  if (!op) notFound();
  const [title, sub] = COPY[order.status];

  return (
    <div className="relative min-h-[80vh] overflow-hidden bg-espresso-900 py-16">
      <Photo src={op.cover} alt="" fill sizes="100vw" className="object-cover opacity-20 blur-sm" />
      <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/80 to-espresso-900" />
      <div className="container-luxe relative max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-gold-300 ring-1 ring-gold-400/40">
            <CheckCircle2 size={32} />
          </span>
          <h1 className="font-display mt-6 text-5xl text-ivory">{title}</h1>
          <p className="mx-auto mt-3 max-w-md text-ivory/65">{sub}</p>
        </div>

        <div className="mt-10 overflow-hidden rounded-[28px] bg-ivory shadow-luxe">
          <div className="flex items-center justify-between gap-4 border-b border-linen px-6 py-5">
            <div>
              <p className="eyebrow">From</p>
              <p className="font-display text-2xl text-espresso-900">{op.name}</p>
            </div>
            <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-bold tracking-wider text-gold-700 uppercase">{order.status}</span>
          </div>
          <ul className="divide-y divide-linen px-6">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-4 py-3 text-sm">
                <span className="text-espresso-800">
                  {i.qty} × {i.name}
                </span>
                <b className="text-espresso-900">{naira(i.price * i.qty)}</b>
              </li>
            ))}
          </ul>
          <div className="space-y-3 bg-sand/60 px-6 py-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal · pay on {order.fulfilment}</span>
              <span className="font-display text-3xl text-espresso-900">{naira(order.subtotal)}</span>
            </div>
            <p className="flex items-start gap-2 text-espresso-700">
              {order.fulfilment === "pickup" ? <Store size={16} className="mt-0.5 shrink-0 text-gold-700" /> : <Truck size={16} className="mt-0.5 shrink-0 text-gold-700" />}
              {order.fulfilment === "pickup" ? `Pick up at ${op.address}` : `Delivery to ${order.address} — fee confirmed by ${op.name}`}
            </p>
            <p className="text-muted">
              Reference <span className="font-mono font-semibold text-espresso-900">{order.id.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {op.phone ? (
            <a href={`tel:${op.phone.replace(/\s/g, "")}`} className="btn-ghost-light">
              <Phone size={16} /> Call the boutique
            </a>
          ) : (
            <a href={`mailto:${op.email}`} className="btn-ghost-light">
              <Mail size={16} /> Email the boutique
            </a>
          )}
          <Link href={`/stylists/${op.slug}/shop`} className="btn-ghost-light">
            <MapPin size={16} /> Keep shopping
          </Link>
          <Link href={`/stylists/${op.slug}`} className="btn-gold">
            Book a treatment
          </Link>
        </div>
      </div>
    </div>
  );
}
