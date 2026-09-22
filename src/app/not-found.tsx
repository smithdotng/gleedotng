import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-espresso-900 px-4 text-center">
      <div>
        <p className="font-display text-8xl text-gold-400 italic">404</p>
        <h1 className="font-display mt-4 text-4xl text-ivory">This look isn&apos;t on the menu.</h1>
        <p className="mt-3 text-ivory/60">The page you&apos;re after may have moved or no longer exists.</p>
        <Link href="/explore" className="btn-gold mt-8">
          Explore stylists
        </Link>
      </div>
    </div>
  );
}
