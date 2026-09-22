import { NextResponse } from "next/server";
import { requireStoreOwner, parseProduct } from "@/lib/store-auth";
import { createProduct, getOperator, getProducts } from "@/lib/store";
import { hasStore } from "@/lib/plans";
import type { Product } from "@/lib/types";

/** Public: ?operator=<slug> → products on sale. Owner (no param): full catalogue. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("operator");
  if (slug) {
    const op = await getOperator(slug);
    if (!op || !hasStore(op)) return NextResponse.json({ products: [] });
    return NextResponse.json({ products: await getProducts(slug, { activeOnly: true }) });
  }
  const auth = await requireStoreOwner();
  if ("error" in auth) return auth.error;
  return NextResponse.json({ products: await getProducts(auth.op.slug) });
}

export async function POST(req: Request) {
  const auth = await requireStoreOwner();
  if ("error" in auth) return auth.error;
  const { data, error } = parseProduct(await req.json().catch(() => ({})));
  if (error) return NextResponse.json({ error }, { status: 400 });
  const product = await createProduct({ ...(data as Omit<Product, "id" | "createdAt" | "operatorSlug">), operatorSlug: auth.op.slug });
  return NextResponse.json({ product }, { status: 201 });
}
