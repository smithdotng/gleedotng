import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Photo from "@/components/Photo";
import { getPosts } from "@/lib/blog";
import { readingMinutes } from "@/lib/markdown";
import { prettyDate } from "@/lib/utils";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const TITLE = "The glee Journal";
const DESC = "Notes on craft, care and the business of beauty in Nigeria — from the glee.ng team and the stylists, salons and spas we work with.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/journal" },
  openGraph: { title: `${TITLE} · glee.ng`, description: DESC, url: "/journal", siteName: SITE.name, locale: "en_NG", type: "website", images: [SITE.ogImage] },
  twitter: { card: "summary_large_image", title: `${TITLE} · glee.ng`, description: DESC, images: [SITE.ogImage.url] },
};

const dateOf = (p: { publishedAt?: string; createdAt: string }) => (p.publishedAt ?? p.createdAt).slice(0, 10);

export default async function JournalIndex() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="bg-sand/50 pb-24">
      <section className="relative overflow-hidden bg-espresso-900 py-20">
        <div className="grain absolute inset-0 opacity-60" />
        <div className="container-luxe relative text-center">
          <p className="eyebrow !text-gold-400">The Journal</p>
          <h1 className="font-display mt-3 text-6xl text-ivory md:text-7xl">Stories from the chair</h1>
          <p className="mx-auto mt-5 max-w-xl text-ivory/65">{DESC}</p>
        </div>
      </section>

      <div className="container-luxe -mt-12">
        {!lead ? (
          <div className="card-luxe p-12 text-center">
            <h2 className="font-display text-3xl text-espresso-900">The first story is being written</h2>
            <p className="mt-2 text-sm text-muted">Come back shortly — or explore the salons and studios in the meantime.</p>
            <Link href="/explore" className="btn-gold mt-7">
              Explore stylists <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <Link href={`/journal/${lead.slug}`} className="group card-luxe grid overflow-hidden transition hover:shadow-luxe lg:grid-cols-2">
              <div className="relative aspect-[16/10] bg-espresso-800 lg:aspect-auto lg:min-h-[420px]">
                <Photo src={lead.cover || SITE.ogImage.url} alt={lead.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <p className="eyebrow">{lead.tags[0] ?? "Journal"}</p>
                <h2 className="font-display mt-3 text-4xl leading-tight text-espresso-900 md:text-5xl">{lead.title}</h2>
                <p className="mt-4 leading-relaxed text-espresso-600">{lead.excerpt}</p>
                <p className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={13} /> {prettyDate(dateOf(lead), { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} /> {readingMinutes(lead.body)} min read
                  </span>
                  <span>{lead.author}</span>
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold-700 group-hover:gap-3 transition-all">
                  Read the story <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <Link key={p.id} href={`/journal/${p.slug}`} className="group card-luxe flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-luxe">
                    <div className="relative aspect-[4/3] bg-espresso-800">
                      <Photo src={p.cover || SITE.ogImage.url} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="eyebrow">{p.tags[0] ?? "Journal"}</p>
                      <h3 className="font-display mt-2 text-2xl leading-tight text-espresso-900">{p.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-espresso-600">{p.excerpt}</p>
                      <p className="mt-auto flex items-center gap-3 pt-5 text-xs text-muted">
                        {prettyDate(dateOf(p), { day: "numeric", month: "short", year: "numeric" })} · {readingMinutes(p.body)} min read
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
