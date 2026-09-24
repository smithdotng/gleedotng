import { NextResponse } from "next/server";
import { activatePlan, getOperator, getPayment, markPaymentFailed, markPaymentPaid, setBookingDeposit } from "@/lib/store";
import { nextRenewal, verifyPayment } from "@/lib/billing";
import { planInfo } from "@/lib/plans";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Where Flutterwave sends the customer back. The plan only changes if Flutterwave confirms the payment. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const txRef = url.searchParams.get("tx_ref") ?? "";
  const status = url.searchParams.get("status") ?? "";
  const transactionId = url.searchParams.get("transaction_id") ?? "";

  const payment = txRef ? await getPayment(txRef) : undefined;
  const back = (path: string) => NextResponse.redirect(new URL(path, siteUrl()), { status: 303 });
  if (!payment) return back("/dashboard");

  const isDeposit = payment.kind === "deposit" && payment.bookingId;
  const dash = isDeposit ? `/bookings/${payment.bookingId}` : `/dashboard/${payment.operatorSlug}`;
  if (status !== "successful" && status !== "completed") {
    await markPaymentFailed(txRef);
    return back(isDeposit ? `${dash}?deposit=cancelled` : `${dash}/upgrade?payment=cancelled`);
  }

  const result = await verifyPayment(transactionId, { txRef, amount: payment.amount });
  if (!result.ok) {
    await markPaymentFailed(txRef);
    return back(isDeposit ? `${dash}?deposit=failed` : `${dash}/upgrade?payment=failed`);
  }

  await markPaymentPaid(txRef, result.providerId);

  // A client's booking deposit — mark the booking and tell both sides.
  if (isDeposit) {
    const booking = await setBookingDeposit(payment.bookingId!, {
      depositStatus: "paid",
      depositTxRef: txRef,
      depositPaidAt: new Date().toISOString(),
    });
    const op = await getOperator(payment.operatorSlug);
    if (booking && op) {
      sendLater(op.email, () => mail.depositPaidForOperator({ booking, op }));
      sendLater(booking.customerEmail, () => mail.depositPaidForClient({ booking, op }));
    }
    return back(`${dash}?deposit=paid`);
  }
  const renewsAt = nextRenewal((await getOperator(payment.operatorSlug))?.planRenewsAt);
  const op = await activatePlan(payment.operatorSlug, payment.plan, renewsAt);
  if (op) {
    const info = planInfo(payment.plan);
    sendLater(op.email, () => mail.planActivated({ op, planName: info.name, amount: payment.amount, renewsAt }));
  }
  return back(`${dash}?upgraded=${payment.plan}`);
}
