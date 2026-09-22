import Link from "next/link";
import AuthCard from "@/components/AuthCard";
import { ResetPasswordForm } from "@/components/PasswordForms";
import { findAccountByResetToken } from "@/lib/store";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a new password", ...PRIVATE };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const account = await findAccountByResetToken(token);
  if (!account) {
    return (
      <AuthCard eyebrow="Account help" title="This link has expired" sub="Reset links last one hour and can be used once.">
        <Link href="/forgot-password" className="btn-dark w-full">
          Send a new link
        </Link>
      </AuthCard>
    );
  }
  return (
    <AuthCard eyebrow="Account security" title="Choose a new password" sub={`For ${account.email}`}>
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
