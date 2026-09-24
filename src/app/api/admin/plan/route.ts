import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { activatePlan, confirmTransfer, getOperator, reverseTransfer } from "@/lib/store";
import { isPlanId, planInfo } from "@/lib/plans";
import { nextRenewal } from "@/lib/billing";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

/** The team matches a declared transfer against the bank statement — or sets a plan by hand. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const { txRef, slug, plan, action } = await req.json().catch(() => ({}));

  if (action === "confirm" || action === "reverse") {
    if (typeof txRef !== "string" || !txRef) return NextResponse.json({ error: "Which payment?" }, { status: 400 });
    const op = action === "confirm" ? await confirmTransfer(txRef) : await reverseTransfer(txRef);
    if (!op) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
    return NextResponse.json({ operator: op });
  }

  // manual plan change
  if (typeof slug !== "string" || !slug) return NextResponse.json({ error: "Which business?" }, { status: 400 });
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
