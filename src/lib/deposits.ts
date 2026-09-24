import { hasDeposits } from "./plans";
import type { Operator, Service } from "./types";

/**
 * Booking deposits — one rule for the whole business (Signature and Prestige).
 * A deposit is only asked for when online payment is actually available, so a client
 * is never told to pay something the site cannot take.
 */

export const depositsAvailable = () => Boolean(process.env.FLW_SECRET_KEY);

export type DepositRule = { type: "percent" | "fixed"; value: number };

/** Pure — safe on the client, so the booking panel can show the deposit for the chosen service. */
export function computeDeposit(rule: DepositRule | undefined, price: number, onRequest?: boolean): number {
  if (!rule || onRequest || price <= 0) return 0; // nothing firm to take a percentage of
  const raw = rule.type === "percent" ? (price * rule.value) / 100 : rule.value;
  const rounded = Math.round(Math.max(0, Math.min(raw, price)) / 100) * 100; // to the nearest ₦100
  return rounded >= 500 ? rounded : 0; // not worth a payment fee below this
}

/** The rule to apply to this business, or undefined when no deposit should be asked for. */
export function depositRuleFor(op: Operator): DepositRule | undefined {
  const rule = op.deposit;
  return rule?.enabled && hasDeposits(op) && depositsAvailable() ? { type: rule.type, value: rule.value } : undefined;
}

export const depositFor = (op: Operator, svc: Pick<Service, "price" | "onRequest">) =>
  computeDeposit(depositRuleFor(op), svc.price, svc.onRequest);

export const depositLabel = (op: Operator) =>
  !op.deposit?.enabled ? "" : op.deposit.type === "percent" ? `${op.deposit.value}% deposit` : `₦${op.deposit.value.toLocaleString("en-NG")} deposit`;
