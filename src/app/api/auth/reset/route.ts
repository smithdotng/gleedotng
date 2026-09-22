import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, hashPassword, passwordProblem, sessionCookieOptions } from "@/lib/auth";
import { resetPasswordWithToken } from "@/lib/store";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

export async function POST(req: Request) {
  const { token, password } = await req.json().catch(() => ({}));
  const problem = passwordProblem(String(password ?? ""));
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  const account = await resetPasswordWithToken(String(token ?? ""), await hashPassword(String(password)));
  if (!account) return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });

  sendLater(account.email, () => mail.passwordChanged({ email: account.email }));
  const res = NextResponse.json({ slug: account.operatorSlug });
  res.cookies.set(SESSION_COOKIE, createSessionToken(account.email, account.operatorSlug), sessionCookieOptions);
  return res;
}
