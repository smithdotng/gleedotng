import { NextResponse } from "next/server";
import { createAccount, createOperator, deleteOperator, getAccountByEmail, getOperators, issueVerificationToken } from "@/lib/store";
import { appUrl } from "@/lib/email/layout";
import * as mail from "@/lib/email/templates";
import { sendLater } from "@/lib/email";

import { SESSION_COOKIE, createSessionToken, hashPassword, passwordProblem, sessionCookieOptions } from "@/lib/auth";
import { CATEGORIES, CITIES } from "@/lib/seed";
import type { CategoryId, Hours, Operator, Weekday } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { isPlanId, planInfo } from "@/lib/plans";

export async function GET() {
  return NextResponse.json({ operators: await getOperators() });
}

const DAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const isTime = (t: unknown) => typeof t === "string" && /^\d{2}:\d{2}$/.test(t);
const str = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const b = await req.json();
  const errors: string[] = [];
  const plan = planInfo(isPlanId(b.plan) ? b.plan : "essential");

  const name = str(b.name, 80);
  const city = str(b.city, 40);
  const area = str(b.area, 60);
  const phone = str(b.phone, 30);
  const email = str(b.email, 120);
  const categories = (Array.isArray(b.categories) ? b.categories : []).filter((c: string) =>
    CATEGORIES.some((x) => x.id === c),
  ) as CategoryId[];

  if (name.length < 2) errors.push("Business name is required");
  if (!CITIES.includes(city as (typeof CITIES)[number])) errors.push("Choose a city");
  if (!area) errors.push("Area / neighbourhood is required");
  if (phone.replace(/\D/g, "").length < 7) errors.push("A valid phone number is required");
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.push("A valid email is required");
  if (!categories.length) errors.push("Pick at least one category");
  const password = String(b.password ?? "");
  const pwProblem = passwordProblem(password);
  if (pwProblem) errors.push(pwProblem.replace(/\.$/, ""));
  else if (/^\S+@\S+\.\S+$/.test(email) && (await getAccountByEmail(email)))
    errors.push("An account with this email already exists — please sign in instead");

  const services = (Array.isArray(b.services) ? b.services : [])
    .map((s: { name?: string; durationMins?: number; price?: number; description?: string }, i: number) => ({
      id: `s${i + 1}`,
      name: str(s.name, 80),
      durationMins: Math.max(15, Math.min(600, Number(s.durationMins) || 60)),
      price: Math.max(0, Math.round(Number(s.price) || 0)),
      description: str(s.description, 200) || undefined,
    }))
    .filter((s: { name: string; price: number }) => s.name && s.price > 0)
    .slice(0, plan.maxServices);
  if (!services.length) errors.push("Add at least one service with a price");

  const hours = {} as Hours;
  for (const d of DAYS) {
    const h = b.hours?.[d];
    hours[d] = h && isTime(h.open) && isTime(h.close) && h.open < h.close ? { open: h.open, close: h.close } : null;
  }
  if (DAYS.every((d) => !hours[d])) errors.push("Set opening hours for at least one day");

  if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

  const images = (Array.isArray(b.gallery) ? b.gallery : []).filter(
    (u: unknown) => typeof u === "string" && u.startsWith("https://"),
  ) as string[];
  const cover = typeof b.cover === "string" && b.cover.startsWith("https://") ? b.cover : images[0];
  const maxPhotos = plan.maxPhotos;
  const prices = services.map((s: { price: number }) => s.price);
  const avg = prices.reduce((a: number, c: number) => a + c, 0) / prices.length;
  const priceTier = (avg < 15000 ? 1 : avg < 35000 ? 2 : avg < 70000 ? 3 : 4) as Operator["priceTier"];

  const op: Operator = {
    slug: slugify(`${name}-${area}`),
    name,
    kind: ["Salon", "Studio", "Spa", "Barbershop", "Independent stylist"].includes(b.kind) ? b.kind : "Salon",
    categories,
    city,
    area,
    address: str(b.address, 200) || `${area}, ${city}`,
    phone,
    email,
    instagram: str(b.instagram, 40).replace(/^@/, "") || undefined,
    rating: 0,
    reviewCount: 0,
    priceTier,
    cover,
    gallery: images.filter((u) => u !== cover).slice(0, maxPhotos - 1),
    lead: { name: str(b.leadName, 80) || name, title: str(b.leadTitle, 60) || "Owner", avatar: cover },
    tagline: str(b.tagline, 120) || `${categories.map((c) => CATEGORIES.find((x) => x.id === c)?.name).join(", ")} in ${area}`,
    bio: str(b.bio, 1200),
    services,
    hours,
    homeService: Boolean(b.homeService),
    verified: false,
    featured: plan.featured,
    plan: plan.id,
    reviews: [],
    createdAt: new Date().toISOString(),
    hidden: true, // published once the owner verifies their email
  };

  const saved = await createOperator(op);
  try {
    await createAccount({
      email,
      passwordHash: await hashPassword(password),
      operatorSlug: saved.slug,
      createdAt: new Date().toISOString(),
      emailVerified: false,
    });
  } catch (e) {
    await deleteOperator(saved.slug);
    return NextResponse.json({ error: (e as Error).message }, { status: 409 });
  }

  const token = await issueVerificationToken(email);
  const verifyUrl = `${appUrl()}/verify-email?token=${token}`;
  sendLater(email, () => mail.verifyEmail({ businessName: saved.name, url: verifyUrl }));

  const res = NextResponse.json({ operator: saved }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, createSessionToken(email.toLowerCase(), saved.slug), sessionCookieOptions);
  return res;
}
