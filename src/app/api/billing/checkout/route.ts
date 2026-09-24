import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOperator, createPayment } from "@/lib/store";
import { isPlanId, planInfo } from "@/lib/plans";
import { createPaymentLink, newTxRef } from "@/lib/billing";
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
  if (op.plan === plan && op.planStatus === "active") {
    return NextResponse.json({ error: `You're already on ${info.name}.` }, { status: 400 });
  }

  const txRef = newTxRef(op.slug);
  const link = await createPaymentLink({
    txRef,
    plan,
    amount: info.amount,
    email: op.email,
    name: op.name,
    redirectUrl: `${siteUrl()}/api/billing/callback`,
  });

  // The record is only written once there is a real transaction to track — a declared
  // bank transfer creates its own record when the owner submits its details.
  if (link) {
    await createPayment({
      txRef,
      operatorSlug: op.slug,
      plan,
      amount: info.amount,
      method: "flutterwave",
      status: "pending",
      createdAt: new Date().toISOString(),
      previousPlan: op.plan,
    });
  }

  // No gateway (or it refused) — the operator pays by transfer and declares it.
  return link ? NextResponse.json({ url: link }) : NextResponse.json({ transfer: true, amount: info.amount });
}
