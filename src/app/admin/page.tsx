import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut, PenLine, Plus, Wallet } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";
import { getPosts } from "@/lib/blog";
import { PostRowActions } from "@/components/AdminForms";
import { readingMinutes } from "@/lib/markdown";
import { prettyDate } from "@/lib/utils";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Journal admin", ...PRIVATE };

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const posts = await getPosts({ includeDrafts: true });
  const live = posts.filter((p) => p.status === "published").length;

  return (
    <div className="bg-sand/60 pb-20">
      <section className="bg-espresso-900 py-12">
        <div className="container-luxe flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow !text-gold-400">glee.ng team</p>
            <h1 className="font-display mt-2 text-5xl text-ivory">The Journal</h1>
            <p className="mt-1 text-sm text-ivory/60">
              {posts.length} {posts.length === 1 ? "story" : "stories"} · {live} live
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/plans" className="btn-ghost-light !py-2.5">
              <Wallet size={15} /> Plan requests
            </Link>
            <Link href="/journal" className="btn-ghost-light !py-2.5">
              <ExternalLink size={15} /> View the Journal
            </Link>
            <form action="/api/admin/logout" method="post">
              <button className="btn-ghost-light !py-2.5">
                <LogOut size={15} /> Sign out
              </button>
            </form>
            <Link href="/admin/posts/new" className="btn-gold !py-2.5">
              <Plus size={15} /> New story
            </Link>
          </div>
        </div>
      </section>

      <div className="container-luxe pt-10">
        {posts.length === 0 ? (
          <div className="card-luxe p-12 text-center">
            <h2 className="font-display text-3xl text-espresso-900">Nothing written yet</h2>
            <p className="mt-2 text-sm text-muted">The first story sets the tone for everything after it.</p>
            <Link href="/admin/posts/new" className="btn-gold mt-7">
              <Plus size={15} /> Write the first story
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id} className="card-luxe flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        p.status === "published"
                          ? "rounded-full bg-gold-500/15 px-2.5 py-1 text-[10px] font-bold tracking-widest text-gold-700 uppercase"
                          : "rounded-full bg-sand px-2.5 py-1 text-[10px] font-bold tracking-widest text-muted uppercase"
                      }
                    >
                      {p.status}
                    </span>
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="rounded-full bg-sand px-2.5 py-1 text-[11px] text-espresso-600">{t}</span>
                    ))}
                  </div>
                  <h2 className="font-display mt-2 truncate text-2xl text-espresso-900">{p.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {prettyDate((p.publishedAt ?? p.createdAt).slice(0, 10), { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                    {readingMinutes(p.body)} min read · /journal/{p.slug}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/journal/${p.slug}`} className="btn-outline !px-4 !py-2 text-xs">
                    <ExternalLink size={14} /> View
                  </Link>
                  <Link href={`/admin/posts/${p.id}`} className="btn-outline !px-4 !py-2 text-xs">
                    <PenLine size={14} /> Edit
                  </Link>
                  <PostRowActions post={p} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
