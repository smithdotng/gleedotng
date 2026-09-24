import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { claimTransfer, getOperator } from "@/lib/store";
import { isPlanId, planInfo } from "@/lib/plans";
import { nextRenewal, newTxRef } from "@/lib/billing";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

const str = (v: unknown, max = 120) => String(v ?? "").trim().slice(0, max);

/**
 * "I've sent the transfer" — the owner declares the transfer they made and the plan goes live at once,
 * so they aren't left waiting. The payment is recorded as unconfirmed and the team matches it against
 * the bank statement at /admin/plans, where it can also be reversed.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const plan = b.plan;
  if (!isPlanId(plan) || plan === "essential") return NextResponse.json({ error: "Choose a plan." }, { status: 400 });

  const payerName = str(b.payerName, 90);
  if (payerName.length < 2) return NextResponse.json({ error: "Enter the name the transfer was sent from." }, { status: 400 });
  const paidOn = /^\d{4}-\d{2}-\d{2}$/.test(String(b.paidOn ?? "")) ? String(b.paidOn) : new Date().toISOString().slice(0, 10);

  const op = await getOperator(session.slug);
  if (!op) return NextResponse.json({ error: "Listing not found." }, { status: 404 });

  const info = planInfo(plan);
  const renewsAt = nextRenewal(op.planRenewsAt);
  const txRef = newTxRef(op.slug);
  const details = {
    payerName,
    payerBank: str(b.payerBank, 60) || undefined,
    paidOn,
    reference: str(b.reference, 60) || undefined,
    note: str(b.note, 240) || undefined,
  };

  const saved = await claimTransfer(op.slug, plan, details, info.amount, txRef, renewsAt);
  if (!saved) return NextResponse.json({ error: "Could not update your plan." }, { status: 500 });

  sendLater(saved.email, () => mail.planActivated({ op: saved, planName: info.name, amount: info.amount, renewsAt }));
  const team = process.env.TEAM_EMAIL || process.env.SMTP_USER;
  if (team) sendLater(team, () => mail.transferDeclaredForTeam({ op: saved, planName: info.name, amount: info.amount, ...details }));

  return NextResponse.json({ ok: true, plan });
}
