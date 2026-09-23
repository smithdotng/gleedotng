import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOperator, createPayment } from "@/lib/store";
import { isPlanId, isUpgrade, planInfo } from "@/lib/plans";
import { createPaymentLink, flutterwaveConfigured, newTxRef } from "@/lib/billing";
import { siteUrl } from "@/lib/site";

/** Starts a plan payment for the signed-in operator. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const { plan } = await req.json().catch(() => ({}));
  if (!isPlanId(plan)) return NextResponse.json({ error: "Choose a plan." }, { status: 400 });

  const op = await getOperator(session.slug);
  if (!op) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const info = planInfo(plan);
  if (info.amount <= 0) return NextResponse.json({ error: "The Essential plan is free — nothing to pay." }, { status: 400 });
  if (!isUpgrade(op.plan, plan) && op.plan === plan && op.planStatus === "active") {
    return NextResponse.json({ error: `You're already on ${info.name}.` }, { status: 400 });
  }

  const txRef = newTxRef(op.slug);
  await createPayment({
    txRef,
    operatorSlug: op.slug,
    plan,
    amount: info.amount,
    method: flutterwaveConfigured() ? "flutterwave" : "transfer",
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  const link = await createPaymentLink({
    txRef,
    plan,
    amount: info.amount,
    email: op.email,
    name: op.name,
    redirectUrl: `${siteUrl()}/api/billing/callback`,
  });

  // No gateway (or it refused) — the operator pays by transfer and we confirm it.
  return link ? NextResponse.json({ url: link }) : NextResponse.json({ transfer: true, txRef, amount: info.amount });
}
