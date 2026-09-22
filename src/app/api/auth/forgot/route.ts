import { NextResponse } from "next/server";
import { issueResetToken } from "@/lib/store";
import { appUrl } from "@/lib/email/layout";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";

/** Always answers the same way so the form can't be used to discover which emails have accounts. */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (typeof email === "string" && /^\S+@\S+\.\S+$/.test(email)) {
    const issued = await issueResetToken(email);
    if (issued) {
      const url = `${appUrl()}/reset-password?token=${issued.token}`;
      sendLater(issued.account.email, () => mail.passwordReset({ url }));
    }
  }
  return NextResponse.json({ ok: true });
}
