import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Wallet } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { getPendingPlanRequests } from "@/lib/store";
import { planInfo } from "@/lib/plans";
import { PlanRequestActions } from "@/components/AdminForms";
import { naira, prettyDate } from "@/lib/utils";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan requests", ...PRIVATE };

export default async function AdminPlans() {
  if (!(await isAdmin())) redirect("/admin/login");
  const pending = await getPendingPlanRequests();

  return (
    <div className="bg-sand/60 pb-20">
      <section className="bg-espresso-900 py-12">
        <div className="container-luxe flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow !text-gold-400">glee.ng team</p>
            <h1 className="font-display mt-2 text-5xl text-ivory">Plan requests</h1>
            <p className="mt-1 text-sm text-ivory/60">
              Businesses who say they have paid by transfer. Card payments activate themselves.
            </p>
          </div>
          <Link href="/admin" className="btn-ghost-light !py-2.5">
            The Journal
          </Link>
        </div>
      </section>

      <div className="container-luxe pt-10">
        {pending.length === 0 ? (
          <div className="card-luxe p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand text-gold-700">
              <Wallet size={24} />
            </span>
            <h2 className="font-display mt-5 text-3xl text-espresso-900">Nothing waiting</h2>
            <p className="mt-2 text-sm text-muted">Upgrade requests paid by transfer will appear here for you to confirm.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {pending.map((op) => {
              const want = planInfo(op.pendingPlan);
              return (
                <li key={op.slug} className="card-luxe flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-display text-2xl text-espresso-900">{op.name}</h2>
                    <p className="mt-1 text-xs text-muted">
                      {op.area}, {op.city} · {op.email} · {op.phone}
                    </p>
                    <p className="mt-2 text-sm text-espresso-700">
                      {planInfo(op.plan).name} → <b>{want.name}</b> · {naira(want.amount)} / month
                      {op.planRenewsAt && ` · currently paid to ${prettyDate(op.planRenewsAt.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/stylists/${op.slug}`} className="btn-outline !px-4 !py-2 text-xs">
                      <ExternalLink size={14} /> Listing
                    </Link>
                    <PlanRequestActions slug={op.slug} plan={op.pendingPlan ?? "signature"} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
