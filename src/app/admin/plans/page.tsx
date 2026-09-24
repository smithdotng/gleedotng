import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, Wallet } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { getUnverifiedTransfers } from "@/lib/store";
import { planInfo } from "@/lib/plans";
import { TransferActions } from "@/components/AdminForms";
import { naira, prettyDate } from "@/lib/utils";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan payments", ...PRIVATE };

export default async function AdminPlans() {
  if (!(await isAdmin())) redirect("/admin/login");
  const claims = await getUnverifiedTransfers();

  return (
    <div className="bg-sand/60 pb-20">
      <section className="bg-espresso-900 py-12">
        <div className="container-luxe flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow !text-gold-400">glee.ng team</p>
            <h1 className="font-display mt-2 text-5xl text-ivory">Plan payments</h1>
            <p className="mt-1 text-sm text-ivory/60">
              Transfers businesses say they have sent. Their plan is already live — confirm it against the bank, or reverse it.
            </p>
          </div>
          <Link href="/admin" className="btn-ghost-light !py-2.5">
            The Journal
          </Link>
        </div>
      </section>

      <div className="container-luxe pt-10">
        {claims.length === 0 ? (
          <div className="card-luxe p-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand text-gold-700">
              <Wallet size={24} />
            </span>
            <h2 className="font-display mt-5 text-3xl text-espresso-900">Nothing to check</h2>
            <p className="mt-2 text-sm text-muted">Card payments confirm themselves. Declared transfers appear here.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {claims.map(({ payment, operator }) => {
              const info = planInfo(payment.plan);
              return (
                <li key={payment.txRef} className="card-luxe flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gold-500/15 px-2.5 py-1 text-[10px] font-bold tracking-widest text-gold-700 uppercase">
                        Live · unconfirmed
                      </span>
                      <span className="text-xs text-muted">
                        declared {prettyDate(payment.createdAt.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-display mt-2 text-2xl text-espresso-900">{operator?.name ?? payment.operatorSlug}</h2>
                    <p className="mt-1 text-sm text-espresso-700">
                      {planInfo(payment.previousPlan).name} → <b>{info.name}</b> · {naira(payment.amount)}
                      {operator?.planRenewsAt && ` · runs to ${prettyDate(operator.planRenewsAt.slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}`}
                    </p>
                    <dl className="mt-3 grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
                      <div className="flex gap-2">
                        <dt className="text-muted">Sent from</dt>
                        <dd className="font-semibold text-espresso-900">{payment.payerName ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted">Bank</dt>
                        <dd className="font-semibold text-espresso-900">{payment.payerBank ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted">Paid on</dt>
                        <dd className="font-semibold text-espresso-900">{payment.paidOn ?? "—"}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="text-muted">Reference</dt>
                        <dd className="font-mono font-semibold text-espresso-900">{payment.reference ?? "—"}</dd>
                      </div>
                      {payment.note && (
                        <div className="flex gap-2 sm:col-span-2">
                          <dt className="text-muted">Note</dt>
                          <dd className="text-espresso-800">{payment.note}</dd>
                        </div>
                      )}
                      <div className="flex gap-2 sm:col-span-2">
                        <dt className="text-muted">Contact</dt>
                        <dd className="text-espresso-800">
                          {operator?.email} · {operator?.phone}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {operator && (
                      <Link href={`/stylists/${operator.slug}`} className="btn-outline !px-4 !py-2 text-xs">
                        <ExternalLink size={14} /> Listing
                      </Link>
                    )}
                    <TransferActions txRef={payment.txRef} />
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
