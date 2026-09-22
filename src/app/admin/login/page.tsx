import AuthCard from "@/components/AuthCard";
import { AdminLoginForm } from "@/components/AdminForms";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Journal admin", ...PRIVATE };

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  if (!adminConfigured()) {
    return (
      <AuthCard
        eyebrow="glee.ng team"
        title="Admin isn't configured"
        sub="Set ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) in the environment, redeploy, and this page will let you in."
      >
        <p className="text-sm text-muted">Until then the Journal can only be updated in code.</p>
      </AuthCard>
    );
  }
  return (
    <AuthCard eyebrow="glee.ng team" title="Journal admin" sub="Only the glee.ng team publishes here.">
      <AdminLoginForm />
    </AuthCard>
  );
}
