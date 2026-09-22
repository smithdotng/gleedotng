import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccountByEmail, getOperator, issueVerificationToken } from "@/lib/store";
import { appUrl } from "@/lib/email/layout";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const account = await getAccountByEmail(session.email);
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (account.emailVerified !== false) return NextResponse.json({ ok: true, alreadyVerified: true });

  const last = account.verificationSentAt ? Date.parse(account.verificationSentAt) : 0;
  const wait = Math.ceil((last + 60_000 - Date.now()) / 1000);
  if (wait > 0) return NextResponse.json({ error: `Please wait ${wait}s before requesting another email.` }, { status: 429 });

  const op = await getOperator(account.operatorSlug);
  const token = await issueVerificationToken(account.email);
  sendLater(account.email, () => mail.verifyEmail({ businessName: op?.name ?? "your business", url: `${appUrl()}/verify-email?token=${token}` }));
  return NextResponse.json({ ok: true });
}
