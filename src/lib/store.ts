import "server-only";
import { createHash, randomBytes } from "crypto";
import type { Collection, Filter, Sort } from "mongodb";
import { getDb } from "./mongodb";
import { SEED_OPERATORS } from "./seed";
import { MANAGED_LISTINGS } from "./listings";
import type { Booking, BookingStatus, CategoryId, Operator, OperatorAccount, Order, OrderStatus, Payment, PlanId, Product, Weekday } from "./types";
import { WEEKDAYS, addDays, chairCapacity, isSlotFree, lowestPrice, toISODate, toMins, weekdayOf, type Interval } from "./utils";

/**
 * Data layer — every page and API route goes through this module.
 * Backed by MongoDB (collections: `operators`, `bookings`, `accounts`, `products`, `orders`).
 */

const NO_ID = { projection: { _id: 0 } } as const;

async function operatorsCol(): Promise<Collection<Operator>> {
  await ensureSetup();
  return (await getDb()).collection<Operator>("operators");
}

async function accountsCol(): Promise<Collection<OperatorAccount>> {
  await ensureSetup();
  return (await getDb()).collection<OperatorAccount>("accounts");
}

async function productsCol(): Promise<Collection<Product>> {
  await ensureSetup();
  return (await getDb()).collection<Product>("products");
}

async function ordersCol(): Promise<Collection<Order>> {
  await ensureSetup();
  return (await getDb()).collection<Order>("orders");
}

async function bookingsCol(): Promise<Collection<Booking>> {
  await ensureSetup();
  return (await getDb()).collection<Booking>("bookings");
}

/* ---------------- One-time setup: indexes + demo seed ---------------- */

let setupPromise: Promise<void> | null = null;

function ensureSetup(): Promise<void> {
  if (!setupPromise) {
    setupPromise = runSetup().catch((e) => {
      setupPromise = null;
      throw e;
    });
  }
  return setupPromise;
}

async function runSetup() {
  const db = await getDb();
  const ops = db.collection<Operator>("operators");
  const bks = db.collection<Booking>("bookings");
  const accts = db.collection<OperatorAccount>("accounts");
  const prods = db.collection<Product>("products");
  const ords = db.collection<Order>("orders");

  await Promise.all([
    prods.createIndex({ id: 1 }, { unique: true }),
    prods.createIndex({ operatorSlug: 1, active: 1 }),
    ords.createIndex({ id: 1 }, { unique: true }),
    ords.createIndex({ operatorSlug: 1, createdAt: -1 }),
    accts.createIndex({ email: 1 }, { unique: true }),
    accts.createIndex({ operatorSlug: 1 }),
    ops.createIndex({ slug: 1 }, { unique: true }),
    ops.createIndex({ city: 1, categories: 1 }),
    ops.createIndex({ featured: -1, rating: -1 }),
    bks.createIndex({ id: 1 }, { unique: true }),
    bks.createIndex({ operatorSlug: 1, date: 1, time: 1 }),
  ]);

  // Demo data: only into an empty database.
  if (process.env.SEED_DEMO_DATA !== "false" && (await ops.estimatedDocumentCount()) === 0) {
    await ops.insertMany(SEED_OPERATORS.map(withFromPrice), { ordered: false }).catch(ignoreDuplicates);
    await bks.insertMany(demoBookings(), { ordered: false }).catch(ignoreDuplicates);
  }

  // Businesses onboarded by the glee.ng team.
  // - Missing → inserted.
  // - Existing but on an older `revision` → listing details (services, plan, copy, photos…) are refreshed;
  //   ratings, reviews and the original createdAt are kept.
  // - The login account is only ever created, never overwritten.
  for (const { operator, account, revision } of MANAGED_LISTINGS) {
    const doc = { ...withFromPrice(operator), managedRevision: revision };
    const existing = await ops.findOne({ slug: operator.slug }, { projection: { _id: 0, managedRevision: 1 } });
    if (!existing) {
      await ops.insertOne({ ...doc }).catch(ignoreDuplicates);
    } else if ((existing.managedRevision ?? 0) < revision) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { rating, reviewCount, reviews, createdAt, ...details } = doc;
      await ops.updateOne({ slug: operator.slug }, { $set: details });
    }
    await accts.updateOne({ email: account.email }, { $setOnInsert: account }, { upsert: true });
  }
}

function ignoreDuplicates(e: { code?: number }) {
  if (e?.code !== 11000) throw e; // another instance seeded at the same time
}

const withFromPrice = (op: Operator): Operator => ({
  ...op,
  fromPrice: lowestPrice(op.services),
  planRank: PLAN_RANK[op.plan] ?? 0,
});

const PLAN_RANK: Record<string, number> = { essential: 0, signature: 1, prestige: 2 };

function demoBookings(): Booking[] {
  const today = new Date();
  const mk = (slug: string, serviceId: string, dayOffset: number, time: string, name: string, status: BookingStatus): Booking => {
    const op = SEED_OPERATORS.find((o) => o.slug === slug)!;
    const svc = op.services.find((s) => s.id === serviceId)!;
    return {
      id: newBookingId(),
      operatorSlug: slug,
      serviceId,
      serviceName: svc.name,
      price: svc.price,
      durationMins: svc.durationMins,
      date: toISODate(addDays(today, dayOffset)),
      time,
      customerName: name,
      customerPhone: "+234 810 000 0000",
      customerEmail: `${name.split(" ")[0].toLowerCase()}@example.com`,
      atHome: false,
      status,
      createdAt: new Date().toISOString(),
    };
  };
  return [
    mk("maison-adaeze-ikoyi", "s1", 0, "11:00", "Tolu Adebanjo", "confirmed"),
    mk("maison-adaeze-ikoyi", "s2", 1, "09:00", "Kemi Lawal", "pending"),
    mk("maison-adaeze-ikoyi", "s5", 2, "14:00", "Ngozi Umeh", "pending"),
    mk("maison-adaeze-ikoyi", "s3", -2, "12:00", "Sade Ojo", "completed"),
    mk("the-gilded-brush-lekki", "s1", 1, "10:00", "Amaka Eze", "confirmed"),
    mk("kings-and-co-barbers-vi", "s1", 0, "16:00", "David Okon", "confirmed"),
  ];
}

const newBookingId = () => `bk_${randomBytes(5).toString("hex")}`;

/* ---------------- Operators ---------------- */

export interface OperatorQuery {
  q?: string;
  city?: string;
  category?: string;
  price?: number;
  homeService?: boolean;
  featured?: boolean;
  sort?: "recommended" | "rating" | "reviews" | "price-asc" | "price-desc" | "newest";
  limit?: number;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function queryOperators(query: OperatorQuery = {}): Promise<Operator[]> {
  const col = await operatorsCol();
  const and: Filter<Operator>[] = [];

  if (query.city) and.push({ city: query.city });
  if (query.category) and.push({ categories: query.category as CategoryId });
  if (query.price) and.push({ priceTier: query.price as Operator["priceTier"] });
  if (query.homeService) and.push({ homeService: true });
  if (query.featured) and.push({ featured: true });

  // every word must appear in at least one searchable field
  for (const word of (query.q ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 6)) {
    const rx = new RegExp(escapeRegex(word), "i");
    and.push({
      $or: [
        { name: rx },
        { area: rx },
        { city: rx },
        { kind: rx },
        { tagline: rx },
        { categories: rx },
        { "lead.name": rx },
        { "services.name": rx },
      ],
    } as Filter<Operator>);
  }

  const sorts: Record<NonNullable<OperatorQuery["sort"]>, Sort> = {
    recommended: { planRank: -1, featured: -1, rating: -1, reviewCount: -1 },
    rating: { rating: -1, reviewCount: -1 },
    reviews: { reviewCount: -1 },
    "price-asc": { fromPrice: 1 },
    "price-desc": { fromPrice: -1 },
    newest: { createdAt: -1 },
  };

  and.push({ hidden: { $ne: true } });
  const cursor = col
    .find({ $and: and }, NO_ID)
    .sort(sorts[query.sort ?? "recommended"] ?? sorts.recommended);
  if (query.limit) cursor.limit(query.limit);
  return cursor.toArray();
}

export async function getOperators(): Promise<Operator[]> {
  return queryOperators({ sort: "newest" });
}

export async function getOperator(slug: string): Promise<Operator | undefined> {
  const col = await operatorsCol();
  return (await col.findOne({ slug }, NO_ID)) ?? undefined;
}

export async function getSimilarOperators(op: Operator, limit = 3): Promise<Operator[]> {
  const col = await operatorsCol();
  return col
    .find({ slug: { $ne: op.slug }, categories: { $in: op.categories }, hidden: { $ne: true } }, NO_ID)
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .toArray();
}

export async function countOperatorsByCity(): Promise<Record<string, number>> {
  const col = await operatorsCol();
  const rows = await col.aggregate<{ _id: string; n: number }>([{ $match: { hidden: { $ne: true } } }, { $group: { _id: "$city", n: { $sum: 1 } } }]).toArray();
  return Object.fromEntries(rows.map((r) => [r._id, r.n]));
}

export async function createOperator(input: Operator): Promise<Operator> {
  const col = await operatorsCol();
  const base = input.slug;
  for (let n = 1; n < 50; n++) {
    const op = withFromPrice({ ...input, slug: n === 1 ? base : `${base}-${n}` });
    try {
      await col.insertOne({ ...op }); // copy: the driver adds _id to the object it inserts
      return op;
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e; // slug taken — try the next suffix
    }
  }
  throw new Error("Could not create a unique link for this business. Try a different name.");
}

/* ---------------- Bookings ---------------- */

export async function getBookings(operatorSlug?: string): Promise<Booking[]> {
  const col = await bookingsCol();
  return col
    .find(operatorSlug ? { operatorSlug } : {}, NO_ID)
    .sort({ date: 1, time: 1 })
    .toArray();
}

export async function getBooking(id: string): Promise<Booking | undefined> {
  const col = await bookingsCol();
  return (await col.findOne({ id }, NO_ID)) ?? undefined;
}

export async function getBusyIntervals(operatorSlug: string, date: string): Promise<Interval[]> {
  const col = await bookingsCol();
  const rows = await col
    .find({ operatorSlug, date, status: { $ne: "cancelled" } }, { projection: { _id: 0, time: 1, durationMins: 1 } })
    .toArray();
  return rows.map((b) => {
    const start = toMins(b.time);
    return { start, end: start + b.durationMins };
  });
}

export async function createBooking(b: Omit<Booking, "id" | "status" | "createdAt">): Promise<Booking> {
  const col = await bookingsCol();
  const op = await getOperator(b.operatorSlug);
  if (!op) throw new Error("Business not found");

  const busy = await getBusyIntervals(b.operatorSlug, b.date);
  if (!isSlotFree(busy, b.time, b.durationMins, chairCapacity(op))) {
    throw new Error("That time has just been taken. Please pick another slot.");
  }

  const booking: Booking = { ...b, id: newBookingId(), status: "pending", createdAt: new Date().toISOString() };
  await col.insertOne({ ...booking });

  // Guard against two clients grabbing the last chair at the same instant:
  // re-check after insert and roll back the newer booking if capacity is exceeded.
  const after = await col
    .find({ operatorSlug: b.operatorSlug, date: b.date, status: { $ne: "cancelled" } }, NO_ID)
    .toArray();
  const others = after
    .filter(
      (x) =>
        x.id !== booking.id &&
        (x.createdAt < booking.createdAt || (x.createdAt === booking.createdAt && x.id < booking.id)),
    )
    .map((x) => ({ start: toMins(x.time), end: toMins(x.time) + x.durationMins }));
  if (!isSlotFree(others, b.time, b.durationMins, chairCapacity(op))) {
    await col.deleteOne({ id: booking.id });
    throw new Error("That time has just been taken. Please pick another slot.");
  }
  return booking;
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | undefined> {
  const col = await bookingsCol();
  const res = await col.findOneAndUpdate(
    { id },
    { $set: { status, updatedAt: new Date().toISOString() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  return res ?? undefined;
}

/* ---------------- Deposits ---------------- */

export async function setBookingDeposit(
  id: string,
  patch: { depositAmount?: number; depositStatus?: Booking["depositStatus"]; depositTxRef?: string; depositPaidAt?: string },
): Promise<Booking | undefined> {
  const col = await bookingsCol();
  await col.updateOne({ id }, { $set: { ...patch, updatedAt: new Date().toISOString() } });
  return (await col.findOne({ id }, NO_ID)) ?? undefined;
}

/* ---------------- Reminders ---------------- */

/** Appointments on a given date that still need a reminder sent. */
export async function getBookingsNeedingReminder(date: string): Promise<Booking[]> {
  const col = await bookingsCol();
  const rows = await col.find({ date, status: { $ne: "cancelled" } }, NO_ID).limit(500).toArray();
  return rows.filter((b) => !b.remindedClientAt && b.status !== "completed");
}

export async function markReminded(id: string): Promise<void> {
  await (await bookingsCol()).updateOne({ id }, { $set: { remindedClientAt: new Date().toISOString() } });
}

/* ---------------- Insights ---------------- */

export interface Insights {
  from: string;
  to: string;
  totals: { requests: number; confirmed: number; completed: number; cancelled: number; booked: number; collected: number };
  previous: { requests: number; booked: number };
  byDay: { date: string; count: number; value: number }[];
  byWeekday: { weekday: Weekday; count: number }[];
  byHour: { hour: number; count: number }[];
  /** Appointments still to come — they sit outside the reporting window but matter most. */
  upcoming: { count: number; value: number };
  topServices: { name: string; count: number; value: number }[];
  clients: { total: number; repeat: number };
  store?: { orders: number; revenue: number };
}

export async function getInsights(slug: string, days = 30): Promise<Insights> {
  const col = await bookingsCol();
  const to = new Date();
  const from = addDays(to, -days + 1);
  const prevFrom = addDays(to, -days * 2 + 1);
  const fromISO = toISODate(from);
  const toISO = toISODate(to);
  const prevFromISO = toISODate(prevFrom);

  const rows = await col
    .find({ operatorSlug: slug, date: { $gte: prevFromISO } }, NO_ID)
    .limit(5000)
    .toArray();

  const ahead = rows.filter((b) => b.date > toISO && b.status !== "cancelled");

  const inRange = rows.filter((b) => b.date >= fromISO && b.date <= toISO);
  const prior = rows.filter((b) => b.date >= prevFromISO && b.date < fromISO);
  const live = inRange.filter((b) => b.status !== "cancelled");

  const byDayMap = new Map<string, { count: number; value: number }>();
  for (let i = 0; i < days; i++) byDayMap.set(toISODate(addDays(from, i)), { count: 0, value: 0 });
  const weekdayMap = new Map<Weekday, number>(WEEKDAYS.map((w) => [w, 0]));
  const hourMap = new Map<number, number>();
  const serviceMap = new Map<string, { count: number; value: number }>();
  const clientSeen = new Map<string, number>();

  for (const b of live) {
    const day = byDayMap.get(b.date);
    if (day) {
      day.count += 1;
      day.value += b.price;
    }
    weekdayMap.set(weekdayOf(b.date), (weekdayMap.get(weekdayOf(b.date)) ?? 0) + 1);
    const hour = Number(b.time.slice(0, 2));
    hourMap.set(hour, (hourMap.get(hour) ?? 0) + 1);
    const svc = serviceMap.get(b.serviceName) ?? { count: 0, value: 0 };
    svc.count += 1;
    svc.value += b.price;
    serviceMap.set(b.serviceName, svc);
    const key = (b.customerPhone || b.customerEmail || b.customerName).replace(/\s/g, "").toLowerCase();
    clientSeen.set(key, (clientSeen.get(key) ?? 0) + 1);
  }

  let orders: { orders: number; revenue: number } | undefined;
  try {
    const ords = await (await ordersCol())
      .find({ operatorSlug: slug, createdAt: { $gte: `${fromISO}T00:00:00.000Z` } }, NO_ID)
      .limit(2000)
      .toArray();
    const paid = ords.filter((o) => o.status !== "cancelled");
    orders = { orders: paid.length, revenue: paid.reduce((sum, o) => sum + o.subtotal, 0) };
  } catch {
    orders = undefined;
  }

  return {
    from: fromISO,
    to: toISO,
    totals: {
      requests: inRange.length,
      confirmed: inRange.filter((b) => b.status === "confirmed").length,
      completed: inRange.filter((b) => b.status === "completed").length,
      cancelled: inRange.filter((b) => b.status === "cancelled").length,
      booked: live.reduce((sum, b) => sum + b.price, 0),
      collected: live.filter((b) => b.depositStatus === "paid").reduce((sum, b) => sum + (b.depositAmount ?? 0), 0),
    },
    previous: {
      requests: prior.length,
      booked: prior.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + b.price, 0),
    },
    byDay: [...byDayMap.entries()].map(([date, v]) => ({ date, ...v })),
    byWeekday: WEEKDAYS.map((w) => ({ weekday: w, count: weekdayMap.get(w) ?? 0 })),
    byHour: [...hourMap.entries()].sort((a, b) => a[0] - b[0]).map(([hour, count]) => ({ hour, count })),
    topServices: [...serviceMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    upcoming: { count: ahead.length, value: ahead.reduce((sum, b) => sum + b.price, 0) },
    clients: { total: clientSeen.size, repeat: [...clientSeen.values()].filter((n) => n > 1).length },
    store: orders,
  };
}

/* ---------------- Operator accounts ---------------- */

export const normaliseEmail = (e: string) => e.trim().toLowerCase();

export async function getAccountByEmail(email: string): Promise<OperatorAccount | undefined> {
  const col = await accountsCol();
  return (await col.findOne({ email: normaliseEmail(email) }, NO_ID)) ?? undefined;
}

export async function createAccount(acc: OperatorAccount): Promise<OperatorAccount> {
  const col = await accountsCol();
  const doc = { ...acc, email: normaliseEmail(acc.email) };
  try {
    await col.insertOne({ ...doc });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) throw new Error("An account with this email already exists. Please sign in.");
    throw e;
  }
  return doc;
}

/** Remove a just-created business if its account could not be created. */
export async function deleteOperator(slug: string) {
  const col = await operatorsCol();
  await col.deleteOne({ slug });
}

/* ---------------- Listing edits (owner) ---------------- */

/** Fields a business owner may change about their own listing. Plan, badge and ratings are not among them. */
export type ListingPatch = Partial<
  Pick<
    Operator,
    | "name"
    | "kind"
    | "categories"
    | "city"
    | "area"
    | "address"
    | "phone"
    | "email"
    | "instagram"
    | "tagline"
    | "bio"
    | "cover"
    | "gallery"
    | "logo"
    | "lead"
    | "services"
    | "hours"
    | "homeService"
    | "priceTier"
    | "deposit"
    | "remindersOn"
  >
>;

export async function updateListing(slug: string, patch: ListingPatch): Promise<Operator | undefined> {
  const col = await operatorsCol();
  const set: Record<string, unknown> = { ...patch };
  const unset: Record<string, ""> = {};
  for (const [k, v] of Object.entries(set)) {
    if (v === undefined) {
      delete set[k];
      unset[k] = "";
    }
  }
  if (patch.services) set.fromPrice = lowestPrice(patch.services);
  const update: Record<string, unknown> = { $set: set };
  if (Object.keys(unset).length) update.$unset = unset;
  await col.updateOne({ slug }, update);
  return (await col.findOne({ slug }, NO_ID)) ?? undefined;
}

/* ---------------- Plans & payments ---------------- */

async function paymentsCol(): Promise<Collection<Payment>> {
  await ensureSetup();
  return (await getDb()).collection<Payment>("payments");
}

export async function createPayment(p: Payment): Promise<Payment> {
  await (await paymentsCol()).insertOne({ ...p });
  return p;
}

export async function getPayment(txRef: string): Promise<Payment | undefined> {
  return (await (await paymentsCol()).findOne({ txRef }, NO_ID)) ?? undefined;
}

export async function markPaymentPaid(txRef: string, providerId: string): Promise<void> {
  await (await paymentsCol()).updateOne(
    { txRef },
    { $set: { status: "paid", providerId, paidAt: new Date().toISOString() } },
  );
}

export async function markPaymentFailed(txRef: string): Promise<void> {
  await (await paymentsCol()).updateOne({ txRef }, { $set: { status: "failed" } });
}

/** Activates a paid plan and clears any pending request. */
export async function activatePlan(slug: string, plan: PlanId, renewsAt: string): Promise<Operator | undefined> {
  const col = await operatorsCol();
  await col.updateOne(
    { slug },
    {
      $set: { plan, planStatus: "active", planRenewsAt: renewsAt, planRank: PLAN_RANK[plan] ?? 0, featured: plan !== "essential" },
      $unset: { pendingPlan: "" },
    },
  );
  return (await col.findOne({ slug }, NO_ID)) ?? undefined;
}

/** Records a declared bank transfer and activates the plan on trust — the team matches it afterwards. */
export async function claimTransfer(
  slug: string,
  plan: PlanId,
  details: { payerName: string; payerBank?: string; paidOn?: string; reference?: string; note?: string },
  amount: number,
  txRef: string,
  renewsAt: string,
): Promise<Operator | undefined> {
  const col = await operatorsCol();
  const current = await col.findOne({ slug }, NO_ID);
  if (!current) return undefined;

  await createPayment({
    txRef,
    operatorSlug: slug,
    plan,
    amount,
    method: "transfer",
    status: "pending",
    createdAt: new Date().toISOString(),
    previousPlan: current.plan,
    ...details,
  });

  await col.updateOne(
    { slug },
    {
      $set: { plan, planStatus: "confirming", planRenewsAt: renewsAt, planRank: PLAN_RANK[plan] ?? 0, featured: plan !== "essential" },
      $unset: { pendingPlan: "" },
    },
  );
  return (await col.findOne({ slug }, NO_ID)) ?? undefined;
}

/** Transfers the owner has declared but the team hasn't matched to the bank statement yet. */
export async function getUnverifiedTransfers(): Promise<{ payment: Payment; operator?: Operator }[]> {
  const payments = await (await paymentsCol())
    .find({ method: "transfer", status: "pending" }, NO_ID)
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();
  const ops = await operatorsCol();
  return Promise.all(
    payments.map(async (payment) => ({
      payment,
      operator: (await ops.findOne({ slug: payment.operatorSlug }, NO_ID)) ?? undefined,
    })),
  );
}

/** The money is in the account — the plan simply stops being marked "confirming". */
export async function confirmTransfer(txRef: string): Promise<Operator | undefined> {
  const payment = await getPayment(txRef);
  if (!payment) return undefined;
  await markPaymentPaid(txRef, "bank-transfer");
  const col = await operatorsCol();
  await col.updateOne({ slug: payment.operatorSlug }, { $set: { planStatus: "active" } });
  return (await col.findOne({ slug: payment.operatorSlug }, NO_ID)) ?? undefined;
}

/** No money arrived — put the listing back on the plan it was on before. */
export async function reverseTransfer(txRef: string): Promise<Operator | undefined> {
  const payment = await getPayment(txRef);
  if (!payment) return undefined;
  await markPaymentFailed(txRef);
  const back = payment.previousPlan ?? "essential";
  const col = await operatorsCol();
  await col.updateOne(
    { slug: payment.operatorSlug },
    {
      $set: { plan: back, planStatus: "active", planRank: PLAN_RANK[back] ?? 0, featured: back !== "essential" },
      $unset: { planRenewsAt: "" },
    },
  );
  return (await col.findOne({ slug: payment.operatorSlug }, NO_ID)) ?? undefined;
}

/* ---------------- glee Store: products ---------------- */

const newId = (prefix: string) => `${prefix}_${randomBytes(5).toString("hex")}`;

export async function getProducts(operatorSlug: string, opts: { activeOnly?: boolean } = {}): Promise<Product[]> {
  const col = await productsCol();
  return col
    .find(opts.activeOnly ? { operatorSlug, active: true } : { operatorSlug }, NO_ID)
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const col = await productsCol();
  return (await col.findOne({ id }, NO_ID)) ?? undefined;
}

export async function createProduct(p: Omit<Product, "id" | "createdAt">): Promise<Product> {
  const col = await productsCol();
  const product: Product = { ...p, id: newId("pr"), createdAt: new Date().toISOString() };
  await col.insertOne({ ...product });
  return product;
}

export async function updateProduct(
  id: string,
  operatorSlug: string,
  patch: Partial<Omit<Product, "id" | "operatorSlug" | "createdAt">>,
): Promise<Product | undefined> {
  const col = await productsCol();
  const res = await col.findOneAndUpdate(
    { id, operatorSlug },
    { $set: { ...patch, updatedAt: new Date().toISOString() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  return res ?? undefined;
}

export async function deleteProduct(id: string, operatorSlug: string): Promise<boolean> {
  const col = await productsCol();
  const res = await col.deleteOne({ id, operatorSlug });
  return res.deletedCount === 1;
}

/* ---------------- glee Store: orders ---------------- */

export class OrderError extends Error {}

/**
 * Creates an order after checking every product belongs to this business, is on sale and in stock.
 * Stock is decremented with a conditional update (`stock >= qty`), and rolled back if any line fails.
 */
export async function createOrder(input: {
  operatorSlug: string;
  items: { productId: string; qty: number }[];
  fulfilment: Order["fulfilment"];
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address?: string;
  notes?: string;
}): Promise<Order> {
  const products = await productsCol();
  const orders = await ordersCol();

  const lines: Order["items"] = [];
  const decremented: { id: string; qty: number }[] = [];
  try {
    for (const { productId, qty } of input.items) {
      const p = await products.findOne({ id: productId, operatorSlug: input.operatorSlug, active: true }, NO_ID);
      if (!p) throw new OrderError("One of the items is no longer available.");
      if (p.stock !== null && p.stock !== undefined) {
        const res = await products.updateOne(
          { id: productId, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
        );
        if (res.modifiedCount !== 1) throw new OrderError(`Sorry — only ${p.stock} of “${p.name}” left in stock.`);
        decremented.push({ id: productId, qty });
      }
      lines.push({ productId, name: p.name, price: p.price, qty });
    }
  } catch (e) {
    for (const d of decremented) await products.updateOne({ id: d.id }, { $inc: { stock: d.qty } });
    throw e;
  }

  const order: Order = {
    id: newId("od"),
    operatorSlug: input.operatorSlug,
    items: lines,
    subtotal: lines.reduce((sum, l) => sum + l.price * l.qty, 0),
    fulfilment: input.fulfilment,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail || undefined,
    address: input.address || undefined,
    notes: input.notes || undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await orders.insertOne({ ...order });
  return order;
}

export async function getOrders(operatorSlug: string): Promise<Order[]> {
  const col = await ordersCol();
  return col.find({ operatorSlug }, NO_ID).sort({ createdAt: -1 }).toArray();
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const col = await ordersCol();
  return (await col.findOne({ id }, NO_ID)) ?? undefined;
}

export async function updateOrderStatus(id: string, operatorSlug: string, status: OrderStatus): Promise<Order | undefined> {
  const col = await ordersCol();
  const current = await col.findOne({ id, operatorSlug }, NO_ID);
  if (!current) return undefined;
  // Cancelling puts tracked stock back on the shelf (once).
  if (status === "cancelled" && current.status !== "cancelled") {
    const products = await productsCol();
    for (const item of current.items) {
      await products.updateOne({ id: item.productId, stock: { $ne: null } }, { $inc: { stock: item.qty } });
    }
  }
  const res = await col.findOneAndUpdate(
    { id, operatorSlug },
    { $set: { status, updatedAt: new Date().toISOString() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  return res ?? undefined;
}

/* ---------------- Email verification & password reset ---------------- */

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const newToken = () => randomBytes(32).toString("base64url");

/** Creates a fresh verification token (24h). Returns the raw token for the email link. */
export async function issueVerificationToken(email: string): Promise<string> {
  const col = await accountsCol();
  const token = newToken();
  await col.updateOne(
    { email: normaliseEmail(email) },
    {
      $set: {
        emailVerified: false,
        verifyTokenHash: sha256(token),
        verifyExpires: new Date(Date.now() + 24 * 3600e3).toISOString(),
        verificationSentAt: new Date().toISOString(),
      },
    },
  );
  return token;
}

/** Marks the account verified and publishes its listing. Returns the account, or undefined if the link is invalid/expired. */
export async function consumeVerificationToken(token: string): Promise<OperatorAccount | undefined> {
  if (!token) return undefined;
  const col = await accountsCol();
  const acc = await col.findOne({ verifyTokenHash: sha256(token) }, NO_ID);
  if (!acc || !acc.verifyExpires || acc.verifyExpires < new Date().toISOString()) return undefined;
  await col.updateOne(
    { email: acc.email },
    { $set: { emailVerified: true }, $unset: { verifyTokenHash: "", verifyExpires: "" } },
  );
  const ops = await operatorsCol();
  await ops.updateOne({ slug: acc.operatorSlug }, { $set: { hidden: false } });
  return { ...acc, emailVerified: true };
}

/** Creates a password-reset token (1h). Returns undefined if no such account (caller should not reveal this). */
export async function issueResetToken(email: string): Promise<{ token: string; account: OperatorAccount } | undefined> {
  const col = await accountsCol();
  const account = await col.findOne({ email: normaliseEmail(email) }, NO_ID);
  if (!account) return undefined;
  const token = newToken();
  await col.updateOne(
    { email: account.email },
    { $set: { resetTokenHash: sha256(token), resetExpires: new Date(Date.now() + 3600e3).toISOString() } },
  );
  return { token, account };
}

export async function findAccountByResetToken(token: string): Promise<OperatorAccount | undefined> {
  if (!token) return undefined;
  const col = await accountsCol();
  const acc = await col.findOne({ resetTokenHash: sha256(token) }, NO_ID);
  if (!acc || !acc.resetExpires || acc.resetExpires < new Date().toISOString()) return undefined;
  return acc;
}

/** Sets a new password from a valid reset token (single use). Resetting also proves email ownership. */
export async function resetPasswordWithToken(token: string, passwordHash: string): Promise<OperatorAccount | undefined> {
  const acc = await findAccountByResetToken(token);
  if (!acc) return undefined;
  const col = await accountsCol();
  await col.updateOne(
    { email: acc.email },
    { $set: { passwordHash, emailVerified: true }, $unset: { resetTokenHash: "", resetExpires: "", verifyTokenHash: "", verifyExpires: "" } },
  );
  if (acc.emailVerified === false) {
    const ops = await operatorsCol();
    await ops.updateOne({ slug: acc.operatorSlug }, { $set: { hidden: false } });
  }
  return acc;
}

export async function getAccountBySlug(slug: string): Promise<OperatorAccount | undefined> {
  const col = await accountsCol();
  return (await col.findOne({ operatorSlug: slug }, NO_ID)) ?? undefined;
}
