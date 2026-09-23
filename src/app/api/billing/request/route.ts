import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOperator, requestPlan } from "@/lib/store";
import { isPlanId, planInfo } from "@/lib/plans";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

/** "I've sent the transfer" — records the request and tells the team. The plan changes only when we confirm. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { plan } = await req.json().catch(() => ({}));
  if (!isPlanId(plan) || plan === "essential") return NextResponse.json({ error: "Choose a plan." }, { status: 400 });

  const op = await getOperator(session.slug);
  if (!op) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const info = planInfo(plan);
  await requestPlan(op.slug, plan);

  sendLater(op.email, () => mail.planRequested({ op, planName: info.name, amount: info.amount }));
  const team = process.env.TEAM_EMAIL || process.env.SMTP_USER;
  if (team) sendLater(team, () => mail.planRequestForTeam({ op, planName: info.name, amount: info.amount }));

  return NextResponse.json({ ok: true });
}
