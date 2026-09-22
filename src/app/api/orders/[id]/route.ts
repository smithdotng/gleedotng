import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOperator, getOrder, updateOrderStatus } from "@/lib/store";
import * as mail from "@/lib/email/templates";
import { sendLater } from "@/lib/email";

import type { OrderStatus } from "@/lib/types";

const ALLOWED: OrderStatus[] = ["pending", "confirmed", "ready", "completed", "cancelled"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json().catch(() => ({}));
  if (!ALLOWED.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const before = await getOrder(id);
  const order = await updateOrderStatus(id, session.slug, status);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (before?.status !== status && order.customerEmail) {
    const op = await getOperator(order.operatorSlug);
    if (op) sendLater(order.customerEmail, () => mail.orderStatusForClient({ order, op }));
  }
  return NextResponse.json({ order });
}
