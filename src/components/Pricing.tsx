import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { PLANS } from "@/lib/plans";

export { PLANS };

export default function Pricing() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {PLANS.map((p) => {
        const prestige = p.id === "prestige";
        const signature = p.id === "signature";
        return (
          <div
            key={p.id}
            className={
              prestige
                ? "relative overflow-hidden rounded-[32px] bg-espresso-950 p-8 text-ivory shadow-luxe ring-1 ring-gold-400/60 md:p-9 lg:-my-4 lg:py-12"
                : signature
                  ? "relative overflow-hidden rounded-[32px] bg-espresso-900 p-8 text-ivory shadow-luxe ring-1 ring-gold-500/30 md:p-9"
                  : "card-luxe rounded-[32px] p-8 md:p-9"
            }
          >
            {prestige && (
              <>
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/25 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
              </>
            )}
            {signature && <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />}
            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className={`font-display text-3xl font-semibold ${prestige || signature ? "text-gold-300" : "text-espresso-900"}`}>
                  {p.name}
                </h3>
                {p.badge && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                      prestige ? "bg-gradient-to-r from-gold-300 to-gold-500 text-espresso-900" : "bg-gold-500 text-espresso-900"
                    }`}
                  >
                    {prestige && <ShoppingBag size={11} />} {p.badge}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm ${prestige || signature ? "text-ivory/70" : "text-muted"}`}>{p.blurb}</p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-semibold">{p.price}</span>
                <span className={`text-sm ${prestige || signature ? "text-ivory/60" : "text-muted"}`}>{p.note}</span>
              </p>
              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        prestige || signature ? "bg-gold-500/20 text-gold-300" : "bg-sand text-gold-700"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span className={prestige || signature ? "text-ivory/85" : "text-espresso-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/list-your-business?plan=${p.id}`}
                className={`${prestige ? "btn-gold" : signature ? "btn-ghost-light" : "btn-dark"} mt-9 w-full`}
              >
                {p.cta}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
