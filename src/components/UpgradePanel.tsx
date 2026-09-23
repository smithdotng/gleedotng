"use client";

import { useState } from "react";
import { ArrowRight, Building2, Check, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { PLANS, planInfo, planRank } from "@/lib/plans";
import type { Operator, PlanId } from "@/lib/types";
import { naira, cn } from "@/lib/utils";

/**
 * Choosing a plan from inside the dashboard goes straight to payment —
 * the business already exists, so nothing here asks for listing details again.
 */
export default function UpgradePanel({
  op,
  bank,
  preselect,
  notice,
}: {
  op: Operator;
  bank: { bank: string; accountName: string; accountNumber: string };
  preselect?: PlanId;
  notice?: "cancelled" | "failed";
}) {
  const current = op.plan ?? "essential";
  const paid = PLANS.filter((p) => p.amount > 0);
  const [choice, setChoice] = useState<PlanId>(
    preselect && preselect !== "essential" ? preselect : planRank(current) >= planRank("signature") ? "prestige" : "signature",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(notice === "failed" ? "That payment didn't go through — nothing has been charged." : notice === "cancelled" ? "Payment cancelled. Your plan is unchanged." : "");
  const [transfer, setTransfer] = useState(false);
  const [requested, setRequested] = useState(op.pendingPlan ?? null);

  const info = planInfo(choice);
  const hasBank = Boolean(bank.accountNumber);

  const pay = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: choice }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setError(data.error || "Could not start the payment.");
    }
    if (data.url) return (window.location.href = data.url as string); // card / transfer / USSD on Flutterwave
    setBusy(false);
    setTransfer(true); // no gateway configured — pay by bank transfer
  };

  const confirmTransfer = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/billing/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: choice }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Could not send your request.");
    setRequested(choice);
  };

  if (requested) {
    const req = planInfo(requested);
    return (
      <div className="card-luxe p-8 text-center md:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
          <ShieldCheck size={30} />
        </span>
        <h2 className="font-display mt-6 text-4xl text-espresso-900">We&apos;re confirming your payment</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Your request to move to <b className="text-espresso-800">{req.name}</b> is with our team. The moment we see {naira(req.amount)} land, your
          plan goes live and we&apos;ll email you — usually within a few working hours.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {paid.map((p) => {
          const isCurrent = p.id === current && op.planStatus !== "pending";
          const selected = choice === p.id;
          const down = planRank(p.id) < planRank(current);
          return (
            <button
              key={p.id}
              type="button"
              disabled={isCurrent}
              onClick={() => setChoice(p.id)}
              className={cn(
                "w-full rounded-[28px] border p-6 text-left transition md:p-7",
                isCurrent
                  ? "cursor-default border-linen bg-sand/60"
                  : selected
                    ? "border-gold-500 bg-ivory shadow-luxe"
                    : "border-linen bg-ivory hover:border-gold-400",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      selected && !isCurrent ? "border-gold-500 bg-gold-500 text-espresso-900" : "border-linen",
                    )}
                  >
                    {selected && !isCurrent && <Check size={13} strokeWidth={3} />}
                  </span>
                  <h3 className="font-display text-3xl text-espresso-900">{p.name}</h3>
                  {isCurrent && <span className="rounded-full bg-espresso-900 px-3 py-1 text-[10px] font-bold tracking-widest text-gold-300 uppercase">Your plan</span>}
                  {down && !isCurrent && <span className="text-xs text-muted">(a step down from your current plan)</span>}
                </div>
                <p className="font-display text-3xl text-espresso-900">
                  {p.price} <span className="text-sm font-normal text-muted">/ month</span>
                </p>
              </div>
              <p className="mt-2 text-sm text-muted">{p.blurb}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {p.features.slice(0, 6).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-espresso-700">
                    <Check size={14} className="mt-1 shrink-0 text-gold-600" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <aside className="space-y-5">
        <div className="card-luxe p-6">
          <p className="eyebrow">Summary</p>
          <h3 className="font-display mt-1 text-3xl text-espresso-900">{info.name}</h3>
          <div className="mt-5 space-y-2 border-t border-linen pt-5 text-sm">
            <p className="flex justify-between">
              <span className="text-muted">Plan</span>
              <span className="font-semibold text-espresso-900">{info.name}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">Billing</span>
              <span className="font-semibold text-espresso-900">Monthly</span>
            </p>
            <p className="flex justify-between text-lg">
              <span className="text-muted">Due today</span>
              <span className="font-display text-2xl text-espresso-900">{naira(info.amount)}</span>
            </p>
          </div>

          {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {!transfer ? (
            <>
              <button onClick={pay} disabled={busy} className="btn-gold mt-5 w-full">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />} Continue to payment
              </button>
              <p className="mt-3 text-center text-xs text-muted">Card, bank transfer or USSD. Cancel any time — your plan runs to the end of the month you paid for.</p>
            </>
          ) : (
            <div className="mt-5 rounded-2xl bg-sand p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-espresso-900">
                <Building2 size={16} className="text-gold-600" /> Pay by bank transfer
              </p>
              {hasBank ? (
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Bank</dt>
                    <dd className="font-semibold text-espresso-900">{bank.bank}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Account name</dt>
                    <dd className="font-semibold text-espresso-900">{bank.accountName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Account number</dt>
                    <dd className="font-mono font-bold text-espresso-900">{bank.accountNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Amount</dt>
                    <dd className="font-semibold text-espresso-900">{naira(info.amount)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Reference</dt>
                    <dd className="font-mono font-semibold text-espresso-900">{op.slug.slice(0, 18)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  Card payment isn&apos;t switched on yet. Tap below and our team will contact you with payment details right away.
                </p>
              )}
              <button onClick={confirmTransfer} disabled={busy} className="btn-dark mt-4 w-full">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />} I&apos;ve sent the payment
              </button>
            </div>
          )}
        </div>

        <div className="card-luxe p-6 text-sm text-muted">
          <p className="font-semibold text-espresso-900">Your listing stays as it is</p>
          <p className="mt-1">Upgrading only changes your plan — your profile, services, photos and bookings are untouched.</p>
        </div>
      </aside>
    </div>
  );
}
