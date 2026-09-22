import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, adminCookieOptions, checkAdminPassword, createAdminToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}));
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin access isn't configured on this deployment." }, { status: 503 });
  }
  if (typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Enter the admin password." }, { status: 400 });
  }
  if (!(await checkAdminPassword(password))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions);
  return res;
}
