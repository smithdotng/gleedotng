import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOperator, updateListing, type ListingPatch } from "@/lib/store";
import { planInfo } from "@/lib/plans";
import { CATEGORIES, CITIES } from "@/lib/seed";
import type { CategoryId, Hours, Operator, Service, Weekday } from "@/lib/types";

export const dynamic = "force-dynamic";

const DAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const KINDS = ["Salon", "Studio", "Spa", "Barbershop", "Independent stylist"];
const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
const isTime = (t: unknown) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t);
const isImage = (u: unknown) => typeof u === "string" && /^(https:\/\/|\/)/.test(u);

/** A business owner edits their own listing. Plan, verified badge, ratings and reviews are not editable here. */
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (session.slug !== slug) return NextResponse.json({ error: "Not authorised." }, { status: 403 });

  const op = await getOperator(slug);
  if (!op) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  const plan = planInfo(op.plan);
  const b = await req.json().catch(() => ({}));
  const errors: string[] = [];
  const patch: ListingPatch = {};

  if (b.name !== undefined) {
    const name = str(b.name, 80);
    if (name.length < 2) errors.push("Business name is required");
    else patch.name = name;
  }
  if (b.kind !== undefined && KINDS.includes(b.kind)) patch.kind = b.kind as Operator["kind"];
  if (b.categories !== undefined) {
    const cats = (Array.isArray(b.categories) ? b.categories : []).filter((c: string) =>
      CATEGORIES.some((x) => x.id === c),
    ) as CategoryId[];
    if (!cats.length) errors.push("Pick at least one category");
    else patch.categories = cats;
  }
  if (b.city !== undefined) {
    if (!CITIES.includes(b.city)) errors.push("Choose a city from the list");
    else patch.city = b.city;
  }
  if (b.area !== undefined) {
    const area = str(b.area, 60);
    if (!area) errors.push("Area is required");
    else patch.area = area;
  }
  if (b.address !== undefined) patch.address = str(b.address, 200) || `${patch.area ?? op.area}, ${patch.city ?? op.city}`;
  if (b.phone !== undefined) {
    const phone = str(b.phone, 30);
    if (phone.replace(/\D/g, "").length < 7) errors.push("A valid phone number is required");
    else patch.phone = phone;
  }
  if (b.email !== undefined) {
    const email = str(b.email, 120);
    // the sign-in email stays put — this is only where booking notifications go
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("A valid contact email is required");
    else patch.email = email;
  }
  if (b.instagram !== undefined) patch.instagram = str(b.instagram, 40).replace(/^@/, "") || undefined;
  if (b.tagline !== undefined) patch.tagline = str(b.tagline, 140) || op.tagline;
  if (b.bio !== undefined) patch.bio = str(b.bio, 1500);
  if (b.homeService !== undefined) patch.homeService = Boolean(b.homeService);

  if (b.cover !== undefined || b.gallery !== undefined) {
    const cover = isImage(b.cover) ? (b.cover as string) : op.cover;
    const gallery = (Array.isArray(b.gallery) ? b.gallery : op.gallery)
      .filter(isImage)
      .filter((u: string) => u !== cover)
      .slice(0, Math.max(0, plan.maxPhotos - 1));
    patch.cover = cover;
    patch.gallery = gallery;
    if (op.lead?.avatar === op.cover) patch.lead = { ...op.lead, avatar: cover };
  }
  if (b.leadName !== undefined || b.leadTitle !== undefined) {
    patch.lead = {
      ...(patch.lead ?? op.lead),
      name: str(b.leadName, 80) || op.lead.name,
      title: str(b.leadTitle, 60) || op.lead.title,
    };
  }

  if (b.services !== undefined) {
    const services: Service[] = (Array.isArray(b.services) ? b.services : [])
      .map((s: Record<string, unknown>, i: number) => {
        const price = Math.max(0, Math.round(Number(s.price) || 0));
        const priceMax = Math.max(0, Math.round(Number(s.priceMax) || 0));
        return {
          id: str(s.id, 24) || `s${i + 1}`,
          name: str(s.name, 90),
          group: str(s.group, 60) || undefined,
          durationMins: Math.max(15, Math.min(600, Number(s.durationMins) || 60)),
          price,
          priceMax: priceMax > price ? priceMax : undefined,
          priceFrom: Boolean(s.priceFrom) || undefined,
          onRequest: Boolean(s.onRequest) || undefined,
          description: str(s.description, 240) || undefined,
        };
      })
      .filter((s: Service) => s.name && (s.price > 0 || s.onRequest))
      .slice(0, plan.maxServices);
    if (!services.length) errors.push("Keep at least one service with a price");
    else {
      // ids must stay unique so existing bookings keep pointing at the right service
      const seen = new Set<string>();
      patch.services = services.map((s, i) => {
        let id = s.id;
        while (seen.has(id)) id = `s${i + 1}-${Math.random().toString(36).slice(2, 6)}`;
        seen.add(id);
        return { ...s, id };
      });
      const priced = patch.services.filter((s) => s.price > 0).map((s) => s.price);
      if (priced.length) {
        const avg = priced.reduce((a, c) => a + c, 0) / priced.length;
        patch.priceTier = (avg < 15000 ? 1 : avg < 35000 ? 2 : avg < 70000 ? 3 : 4) as Operator["priceTier"];
      }
    }
  }

  if (b.remindersOn !== undefined) patch.remindersOn = Boolean(b.remindersOn);
  if (b.deposit !== undefined) {
    const d = b.deposit ?? {};
    const type = d.type === "fixed" ? "fixed" : "percent";
    const raw = Math.round(Number(d.value) || 0);
    const value = type === "percent" ? Math.max(5, Math.min(100, raw)) : Math.max(500, Math.min(500_000, raw));
    const enabled = Boolean(d.enabled) && planInfo(op.plan).deposits;
    patch.deposit = { enabled, type, value };
  }

  if (b.hours !== undefined) {
    const hours = {} as Hours;
    for (const d of DAYS) {
      const h = b.hours?.[d];
      hours[d] = h && isTime(h.open) && isTime(h.close) && h.open < h.close ? { open: h.open, close: h.close } : null;
    }
    if (DAYS.every((d) => !hours[d])) errors.push("Set opening hours for at least one day");
    else patch.hours = hours;
  }

  if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const saved = await updateListing(slug, patch);
  return NextResponse.json({ operator: saved });
}
