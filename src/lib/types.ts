export type CategoryId = "hair" | "nails" | "makeup" | "barbing" | "spa" | "lashes";

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  image: string;
}

export interface Service {
  id: string;
  name: string;
  durationMins: number;
  /** Naira. For ranges / "from" prices this is the starting price. 0 when priced on consultation. */
  price: number;
  /** Upper end of a price range, e.g. 35,000–45,000. */
  priceMax?: number;
  /** Show as "From ₦x" (price rises with area, product or sessions). */
  priceFrom?: boolean;
  /** Price given after consultation — no price shown. */
  onRequest?: boolean;
  /** Menu section heading, e.g. "Hair treatment". */
  group?: string;
  description?: string;
}

export type PlanId = "essential" | "signature" | "prestige";

export interface Review {
  author: string;
  rating: number;
  date: string;
  text: string;
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type Hours = Record<Weekday, { open: string; close: string } | null>;

export interface Operator {
  slug: string;
  name: string;
  kind: "Salon" | "Studio" | "Spa" | "Barbershop" | "Independent stylist";
  categories: CategoryId[];
  city: string;
  area: string;
  address: string;
  phone: string;
  email: string;
  instagram?: string;
  rating: number;
  reviewCount: number;
  priceTier: 1 | 2 | 3 | 4;
  cover: string;
  /** Square brand logo (path under /public or https URL). */
  logo?: string;
  gallery: string[];
  lead: { name: string; title: string; avatar: string };
  tagline: string;
  bio: string;
  services: Service[];
  hours: Hours;
  homeService: boolean;
  verified: boolean;
  featured: boolean;
  plan: PlanId;
  /** Hidden from the public until the owner verifies their email. */
  hidden?: boolean;
  /** Revision of a team-managed listing last applied to the database. */
  managedRevision?: number;
  reviews: Review[];
  createdAt: string;
  /** Lowest service price — kept in sync by the store for sorting. */
  fromPrice?: number;
  /** 2 = Prestige, 1 = Signature, 0 = Essential — for "recommended" ordering. */
  planRank?: number;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  operatorSlug: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMins: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  atHome: boolean;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  /** Price as shown to the client, e.g. "From ₦85,000" or "On consultation". */
  priceLabel?: string;
}

/* ---------------- glee Store (Prestige plan) ---------------- */

export interface Product {
  id: string;
  operatorSlug: string;
  name: string;
  price: number; // Naira
  description?: string;
  category?: string;
  image?: string;
  /** null = not tracked (always available) */
  stock: number | null;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

export interface Order {
  id: string;
  operatorSlug: string;
  items: OrderItem[];
  subtotal: number;
  fulfilment: "pickup" | "delivery";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

/** Login for a business owner. One account per business for now. */
export interface OperatorAccount {
  email: string; // stored lower-case
  passwordHash: string; // scrypt$<salt>$<hash> — never the plain password
  operatorSlug: string;
  createdAt: string;
  /** false until the owner clicks the link in the verification email. Missing = verified (older accounts). */
  emailVerified?: boolean;
  verifyTokenHash?: string;
  verifyExpires?: string;
  verificationSentAt?: string;
  resetTokenHash?: string;
  resetExpires?: string;
}
