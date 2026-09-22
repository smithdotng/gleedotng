import Link from "next/link";
import Logo from "./Logo";
import { InstallButton } from "./InstallApp";
import { CATEGORIES, CITIES } from "@/lib/seed";

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-espresso-950 text-ivory/70">
      <div className="grain absolute inset-0 opacity-60" />
      <div className="container-luxe relative py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo height={60} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Nigeria&apos;s home for premium beauty. Discover exceptional stylists, salons, studios and spas — and book
              them in seconds.
            </p>
            <div className="mt-6 flex gap-4 text-xs tracking-[0.2em] uppercase">
              <a href="#" className="hover:text-gold-300">Instagram</a>
              <a href="#" className="hover:text-gold-300">TikTok</a>
              <a href="#" className="hover:text-gold-300">X</a>
            </div>
            <InstallButton variant="footer" className="mt-7" />
          </div>
          <div className="md:col-span-2">
            <h4 className="eyebrow !text-gold-400">Discover</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/explore?category=${c.id}`} className="hover:text-gold-300">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="eyebrow !text-gold-400">Cities</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {CITIES.map((c) => (
                <li key={c}>
                  <Link href={`/explore?city=${encodeURIComponent(c)}`} className="hover:text-gold-300">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="eyebrow !text-gold-400">For business</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/list-your-business" className="hover:text-gold-300">List your business</Link></li>
              <li><Link href="/for-business#pricing" className="hover:text-gold-300">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-gold-300">Operator sign in</Link></li>
              <li><Link href="/for-business" className="hover:text-gold-300">Why glee.ng</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h4 className="eyebrow !text-gold-400">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-gold-300">About</a></li>
              <li><a href="#" className="hover:text-gold-300">Journal</a></li>
              <li><a href="#" className="hover:text-gold-300">Help centre</a></li>
              <li><a href="mailto:hello@glee.ng" className="hover:text-gold-300">hello@glee.ng</a></li>
            </ul>
          </div>
        </div>
        <div className="gold-rule mt-14" />
        <div className="mt-6 flex flex-col justify-between gap-3 text-xs text-ivory/45 sm:flex-row">
          <p>© {new Date().getFullYear()} glee.ng. Crafted in Nigeria.</p>
          <p className="flex gap-5">
            <a href="#" className="hover:text-gold-300">Terms</a>
            <a href="#" className="hover:text-gold-300">Privacy</a>
            <a href="#" className="hover:text-gold-300">Cookies</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
