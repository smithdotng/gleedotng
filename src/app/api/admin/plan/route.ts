import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { activatePlan, clearPendingPlan, getOperator } from "@/lib/store";
import { isPlanId, planInfo } from "@/lib/plans";
import { nextRenewal } from "@/lib/billing";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

/** The team activates a plan after confirming a transfer, or declines the request. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const { slug, plan, action } = await req.json().catch(() => ({}));
  if (typeof slug !== "string" || !slug) return NextResponse.json({ error: "Which business?" }, { status: 400 });

  if (action === "decline") {
    await clearPendingPlan(slug);
    return NextResponse.json({ ok: true });
  }
  if (!isPlanId(plan)) return NextResponse.json({ error: "Choose a plan." }, { status: 400 });

  const current = await getOperator(slug);
  if (!current) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const renewsAt = nextRenewal(current.planRenewsAt);
  const op = await activatePlan(slug, plan, renewsAt);
  if (op) {
    const info = planInfo(plan);
    sendLater(op.email, () => mail.planActivated({ op, planName: info.name, amount: info.amount, renewsAt }));
  }
  return NextResponse.json({ operator: op });
}
