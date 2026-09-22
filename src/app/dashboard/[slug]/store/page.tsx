import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Check, ExternalLink, ShoppingBag } from "lucide-react";
import StoreManager from "@/components/StoreManager";
import { getSession } from "@/lib/auth";
import { getOperator, getOrders, getProducts } from "@/lib/store";
import { hasStore, planInfo } from "@/lib/plans";
import { naira } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Store" };

export default async function StoreDashboard({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/${slug}/store`);
  if (session.slug !== slug) redirect(`/dashboard/${session.slug}/store`);
  const op = await getOperator(slug);
  if (!op) notFound();

  const header = (
    <section className="bg-espresso-900">
      <div className="container-luxe flex flex-col justify-between gap-6 py-12 md:flex-row md:items-end">
        <div>
          <Link href={`/dashboard/${slug}`} className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-ivory/60 uppercase hover:text-gold-300">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <p className="eyebrow mt-4 flex items-center gap-2 !text-gold-400">
            <ShoppingBag size={14} /> glee Store · {planInfo(op.plan).name} plan
          </p>
          <h1 className="font-display mt-2 text-5xl text-ivory">{op.name} boutique</h1>
        </div>
        {hasStore(op) && (
          <Link href={`/stylists/${slug}/shop`} className="btn-ghost-light !py-2.5">
            <ExternalLink size={15} /> View my shop
          </Link>
        )}
      </div>
    </section>
  );

  if (!hasStore(op)) {
    const prestige = planInfo("prestige");
    return (
      <div className="bg-sand/60 pb-20">
        {header}
        <div className="container-luxe pt-10">
          <div className="relative overflow-hidden rounded-[32px] bg-espresso-950 p-10 text-ivory shadow-luxe ring-1 ring-gold-400/50">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/25 blur-3xl" />
            <div className="relative max-w-2xl">
              <p className="eyebrow !text-gold-400">Prestige plan</p>
              <h2 className="font-display mt-2 text-4xl">Open your own boutique on glee.ng</h2>
              <p className="mt-3 text-ivory/70">{prestige.blurb}</p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {prestige.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ivory/85">
                    <Check size={16} className="mt-0.5 shrink-0 text-gold-300" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-display text-3xl text-gold-300">
                {prestige.price} <span className="text-base text-ivory/60">{prestige.note}</span>
              </p>
              <a href="mailto:hello@glee.ng?subject=Upgrade%20to%20Prestige" className="btn-gold mt-6">
                Upgrade to Prestige
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [products, orders] = await Promise.all([getProducts(slug), getOrders(slug)]);
  const month = new Date().toISOString().slice(0, 7);
  const sales = orders.filter((o) => o.status !== "cancelled" && o.createdAt.startsWith(month)).reduce((s, o) => s + o.subtotal, 0);
  const stats = [
    ["Products on sale", String(products.filter((p) => p.active).length)],
    ["Open orders", String(orders.filter((o) => ["pending", "confirmed", "ready"].includes(o.status)).length)],
    ["Sales this month", naira(sales)],
  ];

  return (
    <div className="bg-sand/60 pb-20">
      {header}
      <div className="container-luxe pt-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(([label, value]) => (
            <div key={label} className="card-luxe p-5">
              <p className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</p>
              <p className="font-display mt-2 text-4xl text-espresso-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <StoreManager initialProducts={products} initialOrders={orders} />
        </div>
      </div>
    </div>
  );
}
