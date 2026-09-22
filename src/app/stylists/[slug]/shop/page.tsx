import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, MapPin, ShoppingBag } from "lucide-react";
import Photo from "@/components/Photo";
import ShopFront from "@/components/ShopFront";
import { getOperator, getProducts } from "@/lib/store";
import { hasStore } from "@/lib/plans";
import { getSession } from "@/lib/auth";
import { PRIVATE, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const op = await getOperator((await params).slug);
  if (!op || op.hidden) return { title: "Not found", ...PRIVATE };
  const title = `Shop ${op.name}`;
  const description = `Beauty products from ${op.name}, ${op.area}, ${op.city} — order for pickup or delivery on glee.ng.`;
  const url = `/stylists/${op.slug}/shop`;
  const image = op.logo || op.cover;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title: `${title} · glee.ng`, description, url, siteName: SITE.name, locale: "en_NG", images: [{ url: image, alt: op.name }] },
    twitter: { card: "summary_large_image", title: `${title} · glee.ng`, description, images: [image] },
  };
}

export default async function ShopPage({ params }: { params: Params }) {
  const { slug } = await params;
  const op = await getOperator(slug);
  if (!op) notFound();
  if (op.hidden && (await getSession())?.slug !== slug) notFound();
  if (!hasStore(op)) redirect(`/stylists/${slug}`);
  const products = await getProducts(slug, { activeOnly: true });

  return (
    <div className="pb-24">
      <section className="relative isolate overflow-hidden bg-espresso-900">
        <Photo src={op.cover} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso-950 via-espresso-900/90 to-espresso-900/40" />
        <div className="grain absolute inset-0" />
        <div className="container-luxe relative py-14">
          <Link href={`/stylists/${slug}`} className="inline-flex items-center gap-1 text-xs font-semibold tracking-wider text-ivory/60 uppercase hover:text-gold-300">
            <ChevronLeft size={14} /> Back to {op.name}
          </Link>
          {op.logo && (
            <span className="relative mt-6 block h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-gold-400/40">
              <Photo src={op.logo} alt={`${op.name} logo`} fill sizes="64px" className="object-cover" />
            </span>
          )}
          <p className="eyebrow mt-6 flex items-center gap-2 !text-gold-400">
            <ShoppingBag size={14} /> The boutique
          </p>
          <h1 className="font-display mt-3 text-5xl text-ivory md:text-6xl">
            Shop <em className="text-gold-400">{op.name}</em>
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-ivory/60">
            <MapPin size={14} /> {op.area}, {op.city} · Pickup or delivery · Pay on collection
          </p>
        </div>
      </section>
      <div className="container-luxe mt-12">
        <ShopFront slug={op.slug} businessName={op.name} address={op.address} products={products} />
      </div>
    </div>
  );
}
