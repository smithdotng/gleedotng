import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { hasStore } from "./plans";
import { getOperator } from "./store";
import type { Operator } from "./types";

/** Signed-in owner of a business on a plan that includes the glee Store. */
export async function requireStoreOwner(): Promise<{ op: Operator } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Please sign in" }, { status: 401 }) };
  const op = await getOperator(session.slug);
  if (!op) return { error: NextResponse.json({ error: "Business not found" }, { status: 404 }) };
  if (!hasStore(op)) {
    return { error: NextResponse.json({ error: "The glee Store is part of the Prestige plan." }, { status: 403 }) };
  }
  return { op };
}

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Validates product fields from a request body. `partial` allows updates of a subset. */
export function parseProduct(b: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {};
  const errors: string[] = [];
  if (!partial || "name" in b) {
    const name = str(b.name, 100);
    if (name.length < 2) errors.push("Product name is required");
    out.name = name;
  }
  if (!partial || "price" in b) {
    const price = Math.round(Number(b.price));
    if (!Number.isFinite(price) || price <= 0) errors.push("Enter a price in Naira");
    out.price = price;
  }
  if (!partial || "stock" in b) {
    if (b.stock === null || b.stock === "" || b.stock === undefined) out.stock = null;
    else {
      const stock = Math.floor(Number(b.stock));
      if (!Number.isFinite(stock) || stock < 0) errors.push("Stock must be 0 or more (leave empty if not tracked)");
      out.stock = stock;
    }
  }
  if ("description" in b) out.description = str(b.description, 600) || undefined;
  if ("category" in b) out.category = str(b.category, 40) || undefined;
  if ("image" in b) {
    const image = str(b.image, 500);
    if (image && !image.startsWith("https://")) errors.push("Image link must start with https://");
    out.image = image || undefined;
  }
  if (!partial || "active" in b) out.active = b.active === undefined ? true : Boolean(b.active);
  return { data: out, error: errors.join(". ") };
}
