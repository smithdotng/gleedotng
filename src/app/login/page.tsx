import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import Photo from "@/components/Photo";
import { getSession } from "@/lib/auth";
import { IMG } from "@/lib/images";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Operator sign in", ...PRIVATE };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const session = await getSession();
  if (session) redirect(`/dashboard/${session.slug}`);

  return (
    <div className="bg-sand/60">
      <div className="container-luxe grid min-h-[78vh] items-center gap-10 py-12 lg:grid-cols-2">
        <div className="relative hidden h-[560px] overflow-hidden rounded-[32px] bg-espresso-900 lg:block">
          <Photo src={IMG.spaRoom} alt="" fill sizes="45vw" className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-900/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10">
            <p className="eyebrow !text-gold-400">For beauty businesses</p>
            <p className="font-display mt-3 text-5xl leading-[1.02] text-ivory">
              Your diary, <em className="text-gold-400">beautifully kept.</em>
            </p>
          </div>
        </div>
        <div className="card-luxe mx-auto w-full max-w-md p-8 md:p-10">
          <p className="eyebrow">Operator sign in</p>
          <h1 className="font-display mt-2 text-4xl text-espresso-900">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">Sign in to manage your appointments and listing.</p>
          <div className="mt-8">
            <LoginForm next={next} />
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            New to glee.ng?{" "}
            <Link href="/list-your-business" className="font-semibold text-gold-700 hover:underline">
              List your business
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
