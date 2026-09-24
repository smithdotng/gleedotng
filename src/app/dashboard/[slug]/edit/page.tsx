import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getOperator } from "@/lib/store";
import ListingEditor from "@/components/ListingEditor";
import { depositsAvailable } from "@/lib/deposits";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit your listing", ...PRIVATE };

const TABS = ["Profile", "Photos", "Services", "Opening hours", "Bookings"] as const;

export default async function EditListing({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/${slug}/edit`);
  if (session.slug !== slug) redirect(`/dashboard/${session.slug}/edit`);
  const op = await getOperator(slug);
  if (!op) notFound();
  const start = TABS.find((t) => t.toLowerCase() === (tab ?? "").toLowerCase());

  return (
    <div className="bg-sand/60 pb-32">
      <section className="bg-espresso-900 py-12">
        <div className="container-luxe">
          <Link href={`/dashboard/${slug}`} className="inline-flex items-center gap-2 text-sm text-ivory/60 hover:text-gold-300">
            <ArrowLeft size={15} /> Back to dashboard
          </Link>
          <p className="eyebrow mt-6 !text-gold-400">{op.name}</p>
          <h1 className="font-display mt-2 text-5xl text-ivory">Edit your listing</h1>
          <p className="mt-2 text-sm text-ivory/60">Your profile, photos, service menu and opening hours — live the moment you save.</p>
        </div>
      </section>
      <div className="container-luxe pt-10">
        <ListingEditor op={op} tab={start} depositsAvailable={depositsAvailable()} />
      </div>
    </div>
  );
}
