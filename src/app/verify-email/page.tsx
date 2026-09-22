import Link from "next/link";
import { CheckCircle2, MailWarning } from "lucide-react";
import { consumeVerificationToken, getOperator } from "@/lib/store";
import { getSession } from "@/lib/auth";
import { sendLater } from "@/lib/email";
import * as mail from "@/lib/email/templates";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Verify your email", ...PRIVATE };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const account = token ? await consumeVerificationToken(token) : undefined;
  const op = account ? await getOperator(account.operatorSlug) : undefined;
  if (account && op) sendLater(account.email, () => mail.welcomeLive({ op }));
  const session = await getSession();

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-espresso-900 px-4 py-16">
      <div className="w-full max-w-lg rounded-[32px] bg-ivory p-10 text-center shadow-luxe">
        {account ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-gold-700 ring-1 ring-gold-400/50">
              <CheckCircle2 size={32} />
            </span>
            <p className="eyebrow mt-6">Email verified</p>
            <h1 className="font-display mt-2 text-4xl text-espresso-900">You&apos;re live on glee.ng</h1>
            <p className="mt-3 text-muted">{op ? `${op.name} is now visible to clients and ready to take bookings.` : "Your listing is now live."}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={session ? `/dashboard/${account.operatorSlug}` : "/login"} className="btn-gold">
                {session ? "Open my dashboard" : "Sign in"}
              </Link>
              <Link href={`/stylists/${account.operatorSlug}`} className="btn-outline">
                View my listing
              </Link>
            </div>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <MailWarning size={30} />
            </span>
            <p className="eyebrow mt-6">Verification link</p>
            <h1 className="font-display mt-2 text-4xl text-espresso-900">This link has expired</h1>
            <p className="mt-3 text-muted">Verification links last 24 hours and work once. Sign in to send yourself a fresh one from your dashboard.</p>
            <Link href={session ? `/dashboard/${session.slug}` : "/login"} className="btn-dark mt-8">
              {session ? "Back to dashboard" : "Sign in"}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
