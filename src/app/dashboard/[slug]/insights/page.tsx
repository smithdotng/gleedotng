import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { getInsights, getOperator } from "@/lib/store";
import { hasInsights, hasStore } from "@/lib/plans";
import { DailyChart, RankedBars, StatTile, hourLabel, weekdayRows } from "@/components/Insights";
import { naira, prettyDate } from "@/lib/utils";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Insights", ...PRIVATE };

const RANGES = [30, 90] as const;

export default async function InsightsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ days?: string }>;
}) {
  const { slug } = await params;
  const { days } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?next=/dashboard/${slug}/insights`);
  if (session.slug !== slug) redirect(`/dashboard/${session.slug}/insights`);
  const op = await getOperator(slug);
  if (!op) notFound();

  const range = RANGES.includes(Number(days) as (typeof RANGES)[number]) ? Number(days) : 30;

  if (!hasInsights(op)) {
    return (
      <div className="bg-sand/60 py-20">
        <div className="container-luxe max-w-2xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
            <BarChart3 size={28} />
          </span>
          <h1 className="font-display mt-6 text-5xl text-espresso-900">Insights live on Signature</h1>
          <p className="mx-auto mt-3 max-w-md text-muted">
            See which services earn, which days fill, how many clients come back, and what changed since last month.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`/dashboard/${slug}`} className="btn-outline">
              Back to dashboard
            </Link>
            <Link href={`/dashboard/${slug}/upgrade`} className="btn-gold">
              See the plans
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const data = await getInsights(slug, range);
  const { totals, previous } = data;
  const pct = (now: number, before: number) => (before === 0 ? (now > 0 ? 100 : 0) : Math.round(((now - before) / before) * 100));
  const completion = totals.requests ? Math.round((totals.completed / totals.requests) * 100) : 0;
  const cancelled = totals.requests ? Math.round((totals.cancelled / totals.requests) * 100) : 0;

  return (
    <div className="bg-sand/60 pb-20">
      <section className="bg-espresso-900 py-12">
        <div className="container-luxe">
          <Link href={`/dashboard/${slug}`} className="inline-flex items-center gap-2 text-sm text-ivory/60 hover:text-gold-300">
            <ArrowLeft size={15} /> Back to dashboard
          </Link>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow !text-gold-400">{op.name}</p>
              <h1 className="font-display mt-2 text-5xl text-ivory">Insights</h1>
              <p className="mt-1 text-sm text-ivory/60">
                {prettyDate(data.from, { day: "numeric", month: "long" })} – {prettyDate(data.to, { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex gap-1 rounded-full bg-espresso-950/60 p-1 text-xs font-semibold">
              {RANGES.map((r) => (
                <Link
                  key={r}
                  href={`/dashboard/${slug}/insights?days=${r}`}
                  className={`rounded-full px-4 py-2 ${range === r ? "bg-gold-500 text-espresso-900" : "text-ivory/70 hover:text-gold-300"}`}
                >
                  {r} days
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container-luxe space-y-8 pt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Appointments"
            value={String(totals.requests)}
            delta={{ pct: pct(totals.requests, previous.requests), word: "vs previous period" }}
          />
          <StatTile
            label="Booked value"
            value={naira(totals.booked)}
            delta={{ pct: pct(totals.booked, previous.booked), word: "vs previous period" }}
          />
          <StatTile
            label="Still to come"
            value={String(data.upcoming.count)}
            hint={`${naira(data.upcoming.value)} booked ahead`}
          />
          <StatTile
            label="Returning clients"
            value={String(data.clients.repeat)}
            hint={`of ${data.clients.total} client${data.clients.total === 1 ? "" : "s"} · ${completion}% completed, ${cancelled}% cancelled`}
          />
        </div>

        <DailyChart data={data.byDay} />

        <div className="grid gap-6 lg:grid-cols-2">
          <RankedBars title="Your week" note="appointments by day" rows={weekdayRows(data.byWeekday)} />
          <RankedBars
            title="What sells"
            note="most-booked services"
            rows={data.topServices.map((s) => ({ label: s.name, count: s.count, value: s.value }))}
            formatValue={(r) => `${r.count} · ${naira(r.value ?? 0)}`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RankedBars
            title="Busiest hours"
            note="when clients want you"
            rows={data.byHour.map((h) => ({ label: hourLabel(h.hour), count: h.count }))}
          />
          <div className="card-luxe p-6">
            <h3 className="font-display text-2xl text-espresso-900">Money in</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-baseline justify-between gap-4 border-b border-linen pb-3">
                <dt className="text-muted">Booked (services)</dt>
                <dd className="font-display text-2xl text-espresso-900">{naira(totals.booked)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-linen pb-3">
                <dt className="text-muted">Deposits paid up front</dt>
                <dd className="font-display text-2xl text-espresso-900">{naira(totals.collected)}</dd>
              </div>
              {hasStore(op) && data.store && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted">Store orders ({data.store.orders})</dt>
                  <dd className="font-display text-2xl text-espresso-900">{naira(data.store.revenue)}</dd>
                </div>
              )}
            </dl>
            <p className="mt-5 text-xs text-muted">
              Booked value counts every appointment that wasn&apos;t cancelled, at the price on your menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
