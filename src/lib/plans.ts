import type { PlanId } from "./types";

export interface PlanInfo {
  id: PlanId;
  name: string;
  price: string;
  note: string;
  badge?: string;
  /** Monthly price in Naira — 0 for the free plan. */
  amount: number;
  blurb: string;
  features: string[];
  cta: string;
  maxServices: number;
  maxPhotos: number;
  featured: boolean;
  store: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: "essential",
    amount: 0,
    name: "Essential",
    price: "Free",
    note: "forever",
    blurb: "Everything you need to get discovered and start taking bookings.",
    features: [
      "Business profile with up to 6 photos",
      "Up to 10 services with prices",
      "Online booking requests",
      "Operator dashboard & appointment list",
      "Guest reviews & ratings",
    ],
    cta: "Start free",
    maxServices: 10,
    maxPhotos: 6,
    featured: false,
    store: false,
  },
  {
    id: "signature",
    amount: 15000,
    name: "Signature",
    price: "₦15,000",
    note: "per month",
    badge: "50% off your first 3 months",
    blurb: "For established brands who want premium placement and more bookings.",
    features: [
      "Everything in Essential",
      "Featured placement on home & search",
      "Gold verified badge",
      "Unlimited services & gallery",
      "WhatsApp & SMS appointment reminders",
      "Booking deposits to reduce no-shows",
      "Performance insights",
    ],
    cta: "Go Signature",
    maxServices: 100,
    maxPhotos: 20,
    featured: true,
    store: false,
  },
  {
    id: "prestige",
    amount: 35000,
    name: "Prestige",
    price: "₦35,000",
    note: "per month",
    badge: "Includes glee Store",
    blurb: "For beauty houses that sell as well as serve — your own boutique inside glee.ng.",
    features: [
      "Everything in Signature",
      "glee Store: sell hair, skincare & beauty products online",
      "Product catalogue with stock tracking",
      "Order management — pickup or delivery",
      "Shop section on your profile",
      "Top-of-search Prestige placement",
      "Priority support",
    ],
    cta: "Go Prestige",
    maxServices: 200,
    maxPhotos: 30,
    featured: true,
    store: true,
  },
];

export const planInfo = (id: PlanId | undefined) => PLANS.find((p) => p.id === id) ?? PLANS[0];
export const hasStore = (op: { plan?: PlanId }) => planInfo(op.plan).store;
export const isPlanId = (v: unknown): v is PlanId => PLANS.some((p) => p.id === v);

/** Plans an operator can pay for, in order. */
export const planRank = (id: PlanId | undefined) => PLANS.findIndex((p) => p.id === (id ?? "essential"));
export const isUpgrade = (from: PlanId | undefined, to: PlanId) => planRank(to) > planRank(from);
