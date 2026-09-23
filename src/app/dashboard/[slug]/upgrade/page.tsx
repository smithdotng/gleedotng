import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getOperator } from "@/lib/store";
import { bankDetails } from "@/lib/billing";
import { isPlanId } from "@/lib/plans";
import UpgradePanel from "@/components/UpgradePanel";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Upgrade your plan", ...PRIVATE };

export default async function UpgradePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ plan?: string; payment?: string }>;
}) {
  const { slug } = await params;
  const { plan, payment } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/${slug}/upgrade`);
  if (session.slug !== slug) redirect(`/dashboard/${session.slug}/upgrade`);
  const op = await getOperator(slug);
  if (!op) notFound();

  return (
    <div className="bg-sand/60 pb-20">
      <section className="bg-espresso-900 py-12">
        <div className="container-luxe">
          <Link href={`/dashboard/${slug}`} className="inline-flex items-center gap-2 text-sm text-ivory/60 hover:text-gold-300">
            <ArrowLeft size={15} /> Back to dashboard
          </Link>
          <p className="eyebrow mt-6 !text-gold-400">{op.name}</p>
          <h1 className="font-display mt-2 text-5xl text-ivory">Choose your plan</h1>
          <p className="mt-2 text-sm text-ivory/60">Pick a plan and pay — nothing about your listing changes.</p>
        </div>
      </section>
      <div className="container-luxe pt-10">
        <UpgradePanel
          op={op}
          bank={bankDetails()}
          preselect={isPlanId(plan) ? plan : undefined}
          notice={payment === "cancelled" ? "cancelled" : payment === "failed" ? "failed" : undefined}
        />
      </div>
    </div>
  );
}
