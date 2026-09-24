"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut, PenLine, Rss, Store, User, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Me {
  admin: boolean;
  operator: { slug: string; name: string; logo: string | null; plan: string; store: boolean; email: string } | null;
}

/** Reads the current session in the browser so pages themselves stay cacheable. */
export function useMe(): { me: Me | null; loaded: boolean } {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Me | null) => {
        if (!live) return;
        setMe(data);
        setLoaded(true);
      })
      .catch(() => live && setLoaded(true));
    return () => {
      live = false;
    };
    // re-check after sign-in / sign-out navigations
  }, [pathname]);

  return { me, loaded };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Signed-in business menu for the header: dashboard, listing, store, sign out. */
export default function AccountMenu({ me }: { me: Me }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const op = me.operator;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!op) {
    // admin only — no business attached
    return (
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-[13px] font-medium text-ivory/75 hover:text-gold-300">
          Journal admin
        </Link>
        <form action="/api/admin/logout" method="post">
          <button className="text-[13px] font-medium text-ivory/75 hover:text-gold-300">Sign out</button>
        </form>
      </div>
    );
  }

  const links = [
    { href: `/dashboard/${op.slug}`, label: "Dashboard", icon: LayoutDashboard },
    { href: `/dashboard/${op.slug}/edit`, label: "Edit listing", icon: PenLine },
    ...(op.store
      ? [{ href: `/dashboard/${op.slug}/store`, label: "My store", icon: Store }]
      : [{ href: `/dashboard/${op.slug}/upgrade`, label: "Upgrade plan", icon: Wallet }]),
    { href: `/stylists/${op.slug}`, label: "View public profile", icon: User },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full border border-gold-400/30 py-1.5 pr-3 pl-1.5 transition hover:border-gold-300/60 hover:bg-gold-400/10"
      >
        {op.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={op.logo} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-gold-400/40" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/20 text-[11px] font-bold text-gold-300">
            {initials(op.name)}
          </span>
        )}
        <span className="max-w-[140px] truncate text-[13px] font-semibold text-ivory">{op.name}</span>
        <ChevronDown size={14} className={cn("text-ivory/60 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-[20px] bg-ivory p-2 shadow-luxe">
          <div className="px-3 py-2.5">
            <p className="font-display text-lg leading-tight text-espresso-900">{op.name}</p>
            <p className="truncate text-xs text-muted">{op.email}</p>
            <p className="mt-1 text-[10px] font-bold tracking-widest text-gold-700 uppercase">{op.plan} plan</p>
          </div>
          <div className="my-1 h-px bg-linen" />
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              role="menuitem"
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-espresso-800 hover:bg-sand"
            >
              <l.icon size={16} className="text-gold-600" /> {l.label}
            </Link>
          ))}
          {me.admin && (
            <Link href="/admin" role="menuitem" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-espresso-800 hover:bg-sand">
              <Rss size={16} className="text-gold-600" /> Journal admin
            </Link>
          )}
          <div className="my-1 h-px bg-linen" />
          <form action="/api/auth/logout" method="post">
            <button role="menuitem" className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold text-espresso-800 hover:bg-sand">
              <LogOut size={16} className="text-gold-600" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/** The same items, stacked, for the mobile menu. */
export function AccountMenuMobile({ me }: { me: Me }) {
  const op = me.operator;
  return (
    <div className="border-t border-gold-500/15 pt-3">
      {op ? (
        <>
          <p className="py-2 text-xs tracking-widest text-gold-400 uppercase">{op.name}</p>
          <Link href={`/dashboard/${op.slug}`} className="block py-3 text-sm text-ivory/85">
            Dashboard
          </Link>
          <Link href={`/dashboard/${op.slug}/edit`} className="block py-3 text-sm text-ivory/85">
            Edit listing
          </Link>
          <Link href={op.store ? `/dashboard/${op.slug}/store` : `/dashboard/${op.slug}/upgrade`} className="block py-3 text-sm text-ivory/85">
            {op.store ? "My store" : "Upgrade plan"}
          </Link>
          <Link href={`/stylists/${op.slug}`} className="block py-3 text-sm text-ivory/85">
            View public profile
          </Link>
        </>
      ) : (
        <Link href="/admin" className="block py-3 text-sm text-ivory/85">
          Journal admin
        </Link>
      )}
      {me.admin && op && (
        <Link href="/admin" className="block py-3 text-sm text-ivory/85">
          Journal admin
        </Link>
      )}
      <form action={op ? "/api/auth/logout" : "/api/admin/logout"} method="post">
        <button className="btn-ghost-light mt-3 w-full">
          <LogOut size={15} /> Sign out
        </button>
      </form>
    </div>
  );
}
