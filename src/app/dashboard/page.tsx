import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardIndex() {
  const session = await getSession();
  redirect(session ? `/dashboard/${session.slug}` : "/login");
}
