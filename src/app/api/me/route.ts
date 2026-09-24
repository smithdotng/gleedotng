import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/admin-auth";
import { getOperator } from "@/lib/store";
import { hasStore } from "@/lib/plans";

export const dynamic = "force-dynamic";

/** Who is signed in — used by the header. Pages stay cacheable because this is fetched in the browser. */
export async function GET() {
  const [session, admin] = await Promise.all([getSession(), isAdmin()]);
  const op = session ? await getOperator(session.slug) : undefined;
  const body = {
    admin,
    operator: op
      ? { slug: op.slug, name: op.name, logo: op.logo ?? null, plan: op.plan, store: hasStore(op), email: session?.email ?? op.email }
      : null,
  };
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
