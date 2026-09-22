import { NextResponse } from "next/server";
import { OrderError, createOrder, getOperator } from "@/lib/store";
import { hasStore } from "@/lib/plans";
import * as mail from "@/lib/email/templates";
import { sendLater } from "@/lib/email";


const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

/** Public checkout — pay on pickup / delivery. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const op = await getOperator(str(b.operatorSlug, 120));
  if (!op || op.hidden || !hasStore(op)) return NextResponse.json({ error: "This shop isn't available." }, { status: 404 });

  // merge duplicate lines, cap quantities
  const qty = new Map<string, number>();
  for (const it of Array.isArray(b.items) ? b.items : []) {
    const id = str(it?.productId, 40);
    const q = Math.floor(Number(it?.qty));
    if (id && q > 0) qty.set(id, Math.min(20, (qty.get(id) ?? 0) + q));
  }
  const items = [...qty.entries()].slice(0, 30).map(([productId, q]) => ({ productId, qty: q }));

  const name = str(b.customerName, 80);
  const phone = str(b.customerPhone, 30);
  const fulfilment = b.fulfilment === "delivery" ? "delivery" : "pickup";
  const address = str(b.address, 300);
  const errors: string[] = [];
  if (!items.length) errors.push("Your bag is empty");
  if (name.length < 2) errors.push("Enter your name");
  if (phone.replace(/\D/g, "").length < 7) errors.push("Enter a valid phone number");
  if (fulfilment === "delivery" && address.length < 8) errors.push("Enter a delivery address");
  if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

  try {
    const order = await createOrder({
      operatorSlug: op.slug,
      items,
      fulfilment,
      customerName: name,
      customerPhone: phone,
      customerEmail: str(b.customerEmail, 120),
      address: fulfilment === "delivery" ? address : "",
      notes: str(b.notes, 500),
    });
    sendLater(op.email, () => mail.orderNewForOperator({ order, op }));
    sendLater(order.customerEmail, () => mail.orderReceivedForClient({ order, op }));
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return NextResponse.json({ error: e.message }, { status: 409 });
    throw e;
  }
}
