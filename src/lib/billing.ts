import "server-only";
import { randomBytes } from "crypto";
import { planInfo } from "./plans";
import type { PlanId } from "./types";

/**
 * Plan payments via Flutterwave (Standard checkout).
 *
 * Env:
 *   FLW_SECRET_KEY   secret key (FLWSECK-…). Without it, upgrades fall back to bank transfer.
 *   BANK_NAME, BANK_ACCOUNT_NAME, BANK_ACCOUNT_NUMBER   shown on the transfer fallback.
 *
 * Flow: checkout() → hosted payment page → Flutterwave redirects back to /api/billing/callback
 * with ?status=…&tx_ref=…&transaction_id=… → verify() confirms the amount with Flutterwave
 * before the plan is changed. Nothing trusts the redirect on its own.
 */

const API = "https://api.flutterwave.com/v3";

export const flutterwaveConfigured = () => Boolean(process.env.FLW_SECRET_KEY);

export const bankDetails = () => ({
  bank: process.env.BANK_NAME || "",
  accountName: process.env.BANK_ACCOUNT_NAME || "",
  accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
});

export const newTxRef = (slug: string) => `glee-${slug.slice(0, 20)}-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;

interface CheckoutInput {
  txRef: string;
  plan: PlanId;
  amount: number;
  email: string;
  name: string;
  redirectUrl: string;
}

/** Creates a hosted payment link. Returns null when Flutterwave is unavailable. */
export async function createPaymentLink(input: CheckoutInput): Promise<string | null> {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) return null;
  const plan = planInfo(input.plan);
  try {
    const res = await fetch(`${API}/payments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: input.txRef,
        amount: input.amount,
        currency: "NGN",
        redirect_url: input.redirectUrl,
        payment_options: "card,banktransfer,ussd",
        customer: { email: input.email, name: input.name },
        customizations: {
          title: "glee.ng",
          description: `${plan.name} plan — one month`,
        },
        meta: { plan: input.plan },
      }),
    });
    const data = (await res.json()) as { status?: string; data?: { link?: string }; message?: string };
    if (!res.ok || data.status !== "success" || !data.data?.link) {
      console.error("[billing] Flutterwave could not create a payment link:", data.message ?? res.status);
      return null;
    }
    return data.data.link;
  } catch (e) {
    console.error("[billing] Flutterwave request failed:", (e as Error).message);
    return null;
  }
}

export interface VerifiedPayment {
  ok: boolean;
  amount: number;
  currency: string;
  txRef: string;
  providerId: string;
  reason?: string;
}

/** Confirms a transaction with Flutterwave — never trust the browser redirect alone. */
export async function verifyPayment(transactionId: string, expect: { txRef: string; amount: number }): Promise<VerifiedPayment> {
  const key = process.env.FLW_SECRET_KEY;
  const fail = (reason: string): VerifiedPayment => ({ ok: false, amount: 0, currency: "", txRef: expect.txRef, providerId: transactionId, reason });
  if (!key) return fail("Payments are not configured.");
  try {
    const res = await fetch(`${API}/transactions/${encodeURIComponent(transactionId)}/verify`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const data = (await res.json()) as {
      status?: string;
      message?: string;
      data?: { status?: string; amount?: number; currency?: string; tx_ref?: string; id?: number };
    };
    const t = data.data;
    if (!res.ok || data.status !== "success" || !t) return fail(data.message || "Could not verify this payment.");
    if (t.status !== "successful") return fail("The payment did not go through.");
    if (t.tx_ref !== expect.txRef) return fail("This payment belongs to another order.");
    if (t.currency !== "NGN" || Number(t.amount) < expect.amount) return fail("The amount paid is less than the plan price.");
    return { ok: true, amount: Number(t.amount), currency: String(t.currency), txRef: String(t.tx_ref), providerId: String(t.id ?? transactionId) };
  } catch (e) {
    return fail((e as Error).message);
  }
}

/** One month from now, or from the current expiry when the plan is still running. */
export function nextRenewal(current?: string): string {
  const from = current && new Date(current) > new Date() ? new Date(current) : new Date();
  from.setMonth(from.getMonth() + 1);
  return from.toISOString();
}
