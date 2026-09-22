import AuthCard from "@/components/AuthCard";
import { ForgotPasswordForm } from "@/components/PasswordForms";
import { PRIVATE } from "@/lib/site";

export const metadata = { title: "Forgot password", ...PRIVATE };

export default function ForgotPasswordPage() {
  return (
    <AuthCard eyebrow="Account help" title="Forgot your password?" sub="Enter the email you sign in with and we'll send you a secure reset link.">
      <ForgotPasswordForm />
    </AuthCard>
  );
}
