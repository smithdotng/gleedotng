import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import Photo from "@/components/Photo";
import { getPostBySlug, getPosts } from "@/lib/blog";
import { isAdmin } from "@/lib/admin-auth";
import { readingMinutes, renderMarkdown } from "@/lib/markdown";
import { prettyDate } from "@/lib/utils";
import { PRIVATE, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found", ...PRIVATE };
  const url = `/journal/${post.slug}`;
  const image = post.cover || SITE.ogImage.url;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.title} · glee.ng`,
      description: post.excerpt,
      url,
      siteName: SITE.name,
      locale: "en_NG",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: image, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: `${post.title} · glee.ng`, description: post.excerpt, images: [image] },
  };
}

export default async function JournalPost({ params }: Params) {
  const { slug } = await params;
  const admin = await isAdmin();
  const post = await getPostBySlug(slug, { includeDrafts: admin });
  if (!post) notFound();

  const date = (post.publishedAt ?? post.createdAt).slice(0, 10);
  const more = (await getPosts({ limit: 4 })).filter((p) => p.id !== post.id).slice(0, 3);

  return (
    <article className="bg-sand/40 pb-24">
      <header className="relative overflow-hidden bg-espresso-900 pt-16 pb-28">
        {post.cover && <Photo src={post.cover} alt="" fill sizes="100vw" className="object-cover opacity-25" />}
        <div className="absolute inset-0 bg-gradient-to-b from-espresso-950/80 via-espresso-900/85 to-espresso-900" />
        <div className="container-luxe relative max-w-3xl text-center">
          {post.status === "draft" && (
            <p className="mb-4 inline-block rounded-full bg-gold-500/20 px-4 py-1 text-xs font-bold tracking-widest text-gold-300 uppercase">
              Draft preview
            </p>
          )}
          <p className="eyebrow !text-gold-400">{post.tags[0] ?? "Journal"}</p>
          <h1 className="font-display mt-3 text-5xl leading-tight text-ivory md:text-6xl">{post.title}</h1>
          <p className="mt-5 text-lg text-ivory/70">{post.excerpt}</p>
          <p className="mt-7 flex flex-wrap items-center justify-center gap-5 text-xs tracking-wide text-ivory/50">
            <span>{post.author}</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} /> {prettyDate(date, { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {readingMinutes(post.body)} min read
            </span>
          </p>
        </div>
      </header>

      <div className="container-luxe -mt-16">
        {post.cover && (
          <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-[28px] shadow-luxe">
            <Photo src={post.cover} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" priority />
          </div>
        )}

        <div className="card-luxe mx-auto mt-10 max-w-3xl p-8 text-[17px] md:p-14">
          <div className="[&>*:first-child]:mt-0" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />

          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-linen pt-7">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-espresso-600">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/journal" className="inline-flex items-center gap-2 text-sm font-semibold text-espresso-700 hover:text-gold-700">
            <ArrowLeft size={16} /> All stories
          </Link>
          <Link href="/explore" className="btn-gold">
            Book a stylist <ArrowRight size={16} />
          </Link>
        </div>

        {more.length > 0 && (
          <section className="mx-auto mt-20 max-w-5xl">
            <h2 className="font-display text-center text-3xl text-espresso-900">Keep reading</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <Link key={p.id} href={`/journal/${p.slug}`} className="group card-luxe overflow-hidden transition hover:-translate-y-1 hover:shadow-luxe">
                  <div className="relative aspect-[4/3] bg-espresso-800">
                    <Photo src={p.cover || SITE.ogImage.url} alt={p.title} fill sizes="33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl leading-tight text-espresso-900">{p.title}</h3>
                    <p className="mt-1 text-xs text-muted">{readingMinutes(p.body)} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
