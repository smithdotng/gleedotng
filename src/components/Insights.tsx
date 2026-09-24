import { WEEKDAY_LABEL, naira, prettyDate } from "@/lib/utils";
import type { Insights as InsightsData } from "@/lib/store";

/**
 * Insight charts. Single series everywhere, so identity is never carried by colour alone:
 * every chart names its measure in the title and labels its own bars. Marks use gold-600
 * (3.2:1 on the card surface); the track is sand. Each chart also has a table view.
 */

const MARK = "#a8844c";
const TRACK = "#efe6da";

export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { pct: number; word: string };
}) {
  return (
    <div className="card-luxe p-5">
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">{label}</p>
      <p className="font-display mt-3 text-4xl leading-none text-espresso-900">{value}</p>
      <p className="mt-2 text-xs text-muted">
        {delta && (
          <span className={delta.pct >= 0 ? "font-semibold text-gold-700" : "font-semibold text-espresso-600"}>
            {delta.pct >= 0 ? "▲" : "▼"} {Math.abs(delta.pct)}% {delta.word}{" "}
          </span>
        )}
        {hint}
      </p>
    </div>
  );
}

/** Bookings per day — thin bars, one series, labelled at its peak. */
export function DailyChart({ data }: { data: InsightsData["byDay"] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), data[0] ?? { date: "", count: 0, value: 0 });
  return (
    <figure className="card-luxe p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl text-espresso-900">Appointments a day</h3>
        <p className="text-xs text-muted">
          Busiest: {peak.count ? `${prettyDate(peak.date, { day: "numeric", month: "short" })} · ${peak.count}` : "—"}
        </p>
      </figcaption>
      <div className="mt-6 flex h-40 items-end gap-[3px]" role="img" aria-label="Appointments per day over the period">
        {data.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${d.date}: ${d.count} appointment${d.count === 1 ? "" : "s"}`}>
            <div
              className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
              style={{ height: `${Math.max(d.count ? 6 : 2, (d.count / max) * 100)}%`, background: d.count ? MARK : TRACK }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>{data[0] && prettyDate(data[0].date, { day: "numeric", month: "short" })}</span>
        <span>{data.at(-1) && prettyDate(data.at(-1)!.date, { day: "numeric", month: "short" })}</span>
      </div>
      <TableView
        summary="See the numbers"
        head={["Date", "Appointments", "Booked value"]}
        rows={data.filter((d) => d.count).map((d) => [prettyDate(d.date, { day: "numeric", month: "short" }), String(d.count), naira(d.value)])}
      />
    </figure>
  );
}

/** Horizontal bars — used for weekdays and services. */
export function RankedBars({
  title,
  note,
  rows,
  formatValue,
}: {
  title: string;
  note?: string;
  rows: { label: string; count: number; value?: number }[];
  formatValue?: (row: { count: number; value?: number }) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <figure className="card-luxe p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl text-espresso-900">{title}</h3>
        {note && <p className="text-xs text-muted">{note}</p>}
      </figcaption>
      {rows.length === 0 || rows.every((r) => !r.count) ? (
        <p className="mt-6 text-sm text-muted">Nothing booked in this period yet.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((r) => (
            <li key={r.label} className="grid grid-cols-[minmax(84px,120px)_1fr_auto] items-center gap-3 text-sm">
              <span className="truncate text-espresso-700" title={r.label}>
                {r.label}
              </span>
              <span className="h-2.5 rounded-full" style={{ background: TRACK }}>
                <span
                  className="block h-2.5 rounded-full"
                  style={{ width: `${Math.max(r.count ? 4 : 0, (r.count / max) * 100)}%`, background: MARK }}
                />
              </span>
              <span className="font-semibold text-espresso-900 tabular-nums">
                {formatValue ? formatValue(r) : r.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

function TableView({ summary, head, rows }: { summary: string; head: string[]; rows: string[][] }) {
  if (!rows.length) return null;
  return (
    <details className="mt-5">
      <summary className="cursor-pointer text-xs font-semibold text-gold-700">{summary}</summary>
      <div className="mt-3 max-h-64 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs tracking-wider text-muted uppercase">
              {head.map((h) => (
                <th key={h} className="py-1.5 pr-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-espresso-800">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-linen">
                {r.map((c, n) => (
                  <td key={n} className="py-1.5 pr-4">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export const weekdayRows = (byWeekday: InsightsData["byWeekday"]) =>
  byWeekday.map((w) => ({ label: WEEKDAY_LABEL[w.weekday], count: w.count }));

export const hourLabel = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "am" : "pm"}`;
