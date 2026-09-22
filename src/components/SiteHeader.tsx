"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { InstallButton } from "./InstallApp";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/explore?category=hair", label: "Hair" },
  { href: "/explore?category=makeup", label: "Makeup" },
  { href: "/explore?category=nails", label: "Nails" },
  { href: "/explore?category=spa", label: "Spa & Skin" },
  { href: "/explore?category=barbing", label: "Barbers" },
  { href: "/journal", label: "Journal" },
  { href: "/for-business", label: "For Business" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const overlay = pathname === "/" || pathname === "/for-business";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const solid = !overlay || scrolled || open;

  return (
    <header
      className={cn(
        "z-50 w-full transition-all duration-500",
        overlay ? "fixed top-0" : "sticky top-0",
        solid ? "bg-espresso-900/95 backdrop-blur-xl shadow-[0_1px_0_0_rgb(201_164_106/0.18)]" : "bg-transparent",
      )}
    >
      <div className="container-luxe flex h-[72px] items-center justify-between gap-6">
        <Logo height={52} />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[13px] font-medium tracking-wide text-ivory/75 transition hover:text-gold-300"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <InstallButton variant="header" />
          <Link href="/login" className="text-[13px] font-medium text-ivory/75 hover:text-gold-300">
            Operator login
          </Link>
          <Link href="/list-your-business" className="btn-gold !px-5 !py-2.5">
            List your business
          </Link>
        </div>
        <button
          className="rounded-full p-2 text-ivory lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-gold-500/15 bg-espresso-900 lg:hidden">
          <div className="container-luxe flex flex-col py-4">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="py-3 text-sm text-ivory/85 hover:text-gold-300">
                {n.label}
              </Link>
            ))}
            <Link href="/login" className="py-3 text-sm text-ivory/85">
              Operator login
            </Link>
            <Link href="/list-your-business" className="btn-gold mt-3">
              List your business
            </Link>
            <InstallButton variant="menu" />
          </div>
        </div>
      )}
    </header>
  );
}
