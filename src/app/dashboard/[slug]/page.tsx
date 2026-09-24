import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Clock, ExternalLink, LogOut, PartyPopper, PenLine, ShoppingBag, Star, Wallet } from "lucide-react";
import { hasStore, planInfo } from "@/lib/plans";
import { getSession } from "@/lib/auth";
import Photo from "@/components/Photo";
import AppointmentsBoard from "@/components/AppointmentsBoard";
import { getAccountByEmail, getBookings, getOperator } from "@/lib/store";
import { ResendVerificationButton } from "@/components/PasswordForms";
import { MailCheck } from "lucide-react";
import { InstallCard } from "@/components/InstallApp";
import { WEEKDAY_LABEL, duration, naira, prettyDate, prettyTime, servicePriceLabel, toISODate } from "@/lib/utils";
import type { Weekday } from "@/lib/types";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard", ...PRIVATE };

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default async function Dashboard({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ welcome?: string; upgraded?: string }>;
}) {
  const { slug } = await params;
  const { welcome, upgraded } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/${slug}`);
  if (session.slug !== slug) redirect(`/dashboard/${session.slug}`);
  const op = await getOperator(slug);
  if (!op) notFound();
  const [bookings, account] = await Promise.all([getBookings(slug), getAccountByEmail(session.email)]);
  const unverified = account?.emailVerified === false;

  const today = toISODate(new Date());
  const month = today.slice(0, 7);
  const active = bookings.filter((b) => b.status !== "cancelled");
  const stats = [
    { icon: CalendarDays, label: "Today", value: String(active.filter((b) => b.date === today).length), hint: "appointments" },
    { icon: Clock, label: "Awaiting you", value: String(bookings.filter((b) => b.status === "pending").length), hint: "to confirm" },
    {
      icon: Wallet,
      label: "This month",
      value: naira(active.filter((b) => b.date.startsWith(month)).reduce((s, b) => s + b.price, 0)),
      hint: "booked value",
    },
    { icon: Star, label: "Rating", value: op.reviewCount ? op.rating.toFixed(1) : "New", hint: `${op.reviewCount} reviews` },
  ];

  return (
    <div className="bg-sand/60 pb-20">
      <section className="relative overflow-hidden bg-espresso-900">
        <Photo src={op.cover} alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso-950 via-espresso-900/90 to-espresso-900/50" />
        <div className="container-luxe relative flex flex-col justify-between gap-6 py-12 md:flex-row md:items-end">
          <div className="flex items-end gap-5">
            {op.logo && (
              <span className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-1 ring-gold-400/40 sm:block">
                <Photo src={op.logo} alt={`${op.name} logo`} fill sizes="80px" className="object-cover" />
              </span>
            )}
            <div>
            <p className="eyebrow !text-gold-400">
              Operator dashboard · {planInfo(op.plan).name} plan
            </p>
            <h1 className="font-display mt-2 text-5xl text-ivory">{op.name}</h1>
            <p className="mt-1 text-sm text-ivory/60">
              {op.area}, {op.city} · Signed in as {session.email}
            </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/stylists/${op.slug}`} className="btn-ghost-light !py-2.5">
              <ExternalLink size={15} /> View public profile
            </Link>
            <Link href={`/dashboard/${op.slug}/edit`} className="btn-ghost-light !py-2.5">
              <PenLine size={15} /> Edit listing
            </Link>
            <Link href={`/dashboard/${op.slug}/store`} className={hasStore(op) ? "btn-gold !py-2.5" : "btn-ghost-light !py-2.5"}>
              <ShoppingBag size={15} /> {hasStore(op) ? "My store" : "Store"}
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost-light !py-2.5">
                <LogOut size={15} /> Sign out
              </button>
            </form>
            {op.plan !== "prestige" && (
              <Link href={`/dashboard/${op.slug}/upgrade`} className="btn-gold !py-2.5">
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container-luxe -mt-2 pt-10">
        {unverified && (
          <div className="mb-6 flex flex-col gap-4 rounded-[24px] border border-gold-500/40 bg-ivory p-6 shadow-soft md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <MailCheck size={26} className="mt-0.5 shrink-0 text-gold-600" />
              <div>
                <p className="font-display text-2xl text-espresso-900">Verify your email to go live</p>
                <p className="mt-1 text-sm text-muted">
                  We sent a link to <b className="text-espresso-800">{session.email}</b>. Your listing stays hidden from clients until you confirm it.
                </p>
              </div>
            </div>
            <ResendVerificationButton />
          </div>
        )}

        {upgraded && (
          <div className="mb-6 flex items-start gap-4 rounded-[24px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 p-6 text-espresso-900 shadow-luxe">
            <PartyPopper size={26} className="shrink-0" />
            <div>
              <p className="font-display text-2xl">You&apos;re on {planInfo(op.plan).name}</p>
              <p className="mt-1 text-sm">
                Payment received — everything on the plan is switched on.
                {op.planRenewsAt && ` Renews ${prettyDate(op.planRenewsAt.slice(0, 10), { day: "numeric", month: "long", year: "numeric" })}.`}
              </p>
            </div>
          </div>
        )}

        {op.planStatus === "confirming" && (
          <div className="mb-6 flex items-start gap-4 rounded-[24px] border border-gold-500/40 bg-ivory p-6 shadow-soft">
            <Wallet size={24} className="mt-0.5 shrink-0 text-gold-600" />
            <div>
              <p className="font-display text-2xl text-espresso-900">Your {planInfo(op.plan).name} plan is live</p>
              <p className="mt-1 text-sm text-muted">
                We&apos;re matching your transfer against the account and will email your receipt. Keep your transfer slip until then.
              </p>
            </div>
          </div>
        )}

        {welcome && !unverified && (
          <div className="mb-8 flex items-start gap-4 rounded-[24px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 p-6 text-espresso-900 shadow-luxe">
            <PartyPopper size={28} className="shrink-0" />
            <div>
              <p className="font-display text-2xl">You&apos;re live on glee.ng!</p>
              <p className="mt-1 text-sm">
                Your listing is published. Share your link —{" "}
                <span className="font-mono font-semibold">glee.ng/stylists/{op.slug}</span> — on Instagram and WhatsApp to start
                receiving bookings. Our team will review your profile for a verified badge within 48 hours.
              </p>
            </div>
          </div>
        )}

        <InstallCard
          className="mb-6"
          title="Your salon, one tap away"
          text="Install glee on your phone to see new bookings and confirm appointments straight from your home screen."
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card-luxe p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">{s.label}</p>
                <s.icon size={18} className="text-gold-600" />
              </div>
              <p className="font-display mt-3 text-4xl text-espresso-900">{s.value}</p>
              <p className="text-xs text-muted">{s.hint}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <AppointmentsBoard initial={bookings} />
          <div className="space-y-6">
            <div className="card-luxe p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl text-espresso-900">Service menu</h3>
                <Link href={`/dashboard/${op.slug}/edit?tab=services`} className="text-xs font-semibold text-gold-700 hover:underline">
                  Edit
                </Link>
              </div>
              <ul className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 text-sm">
                {op.services.map((s) => (
                  <li key={s.id} className="flex justify-between gap-3">
                    <span className="text-espresso-800">
                      {s.name}
                      <span className="block text-xs text-muted">{duration(s.durationMins)}</span>
                    </span>
                    <span className="shrink-0 text-right font-semibold text-espresso-900">{servicePriceLabel(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-luxe p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl text-espresso-900">Opening hours</h3>
                <Link href={`/dashboard/${op.slug}/edit?tab=opening%20hours`} className="text-xs font-semibold text-gold-700 hover:underline">
                  Edit
                </Link>
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {ORDER.map((d) => (
                  <li key={d} className="flex justify-between">
                    <span className="text-espresso-700">{WEEKDAY_LABEL[d].slice(0, 3)}</span>
                    <span className={op.hours[d] ? "font-semibold text-espresso-900" : "text-muted"}>
                      {op.hours[d] ? `${prettyTime(op.hours[d]!.open)} – ${prettyTime(op.hours[d]!.close)}` : "Closed"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
