import { NextResponse } from "next/server";
import { requireStoreOwner, parseProduct } from "@/lib/store-auth";
import { deleteProduct, updateProduct } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireStoreOwner();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const { data, error } = parseProduct(await req.json().catch(() => ({})), true);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const product = await updateProduct(id, auth.op.slug, data);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const auth = await requireStoreOwner();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const ok = await deleteProduct(id, auth.op.slug);
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
