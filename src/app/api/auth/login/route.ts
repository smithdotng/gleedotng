import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { getAccountByEmail } from "@/lib/store";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const account = await getAccountByEmail(email);
  // same message either way so the form doesn't reveal which emails are registered
  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }
  const res = NextResponse.json({ slug: account.operatorSlug });
  res.cookies.set(SESSION_COOKIE, createSessionToken(account.email, account.operatorSlug), sessionCookieOptions);
  return res;
}
