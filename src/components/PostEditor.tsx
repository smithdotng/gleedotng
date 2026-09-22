"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, FileText, Loader2, Save, Send } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import { UPLOAD_CHOICES } from "@/lib/images";
import type { Post } from "@/lib/types";

/** Write / edit a Journal post. Admin only — the API refuses anything else. */
export default function PostEditor({ post }: { post?: Post }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState(post?.body ?? "");
  const [cover, setCover] = useState(post?.cover ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [author, setAuthor] = useState(post?.author ?? "The glee.ng team");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");

  const preview = useMemo(() => renderMarkdown(body), [body]);

  const save = async (status: "draft" | "published") => {
    setBusy(status === "published" ? "publish" : "draft");
    setError("");
    const payload = { title, excerpt, body, cover, tags, author, status };
    const res = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
      method: post ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return setError(data.error || "Could not save the post.");
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="card-luxe p-6 md:p-8">
        <label className="label-luxe" htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-luxe font-display !text-2xl"
          placeholder="Beauty, beautifully booked"
        />

        <label className="label-luxe mt-6 block" htmlFor="excerpt">
          Standfirst <span className="font-normal text-muted">— shown on cards and link previews. Leave empty to use the opening lines.</span>
        </label>
        <textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="input-luxe !h-auto"
          placeholder="One or two sentences that make the reader want the rest."
        />

        <div className="mt-6 flex items-center justify-between">
          <span className="label-luxe !mb-0">Story</span>
          <div className="flex gap-1 rounded-full bg-sand p-1 text-xs font-semibold">
            <button type="button" onClick={() => setTab("write")} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${tab === "write" ? "bg-espresso-900 text-ivory" : "text-espresso-600"}`}>
              <FileText size={13} /> Write
            </button>
            <button type="button" onClick={() => setTab("preview")} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${tab === "preview" ? "bg-espresso-900 text-ivory" : "text-espresso-600"}`}>
              <Eye size={13} /> Preview
            </button>
          </div>
        </div>

        {tab === "write" ? (
          <>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={22}
              className="input-luxe mt-2 !h-auto font-mono !text-[13px] leading-relaxed"
              placeholder={"## A heading\n\nA paragraph of the story.\n\n- a point worth making\n- and another\n\n> A line worth pulling out.\n\n**Bold**, *italic* and [links](/explore) all work."}
            />
            <p className="mt-2 text-xs text-muted">
              Markdown: <b># ## ###</b> headings · <b>**bold**</b> · <b>*italic*</b> · <b>- lists</b> · <b>&gt; quote</b> · <b>[text](/link)</b> · <b>---</b> divider
            </p>
          </>
        ) : (
          <div className="mt-2 rounded-[24px] border border-linen bg-ivory p-6 text-[17px]">
            {body.trim() ? (
              <div className="[&>*:first-child]:mt-0" dangerouslySetInnerHTML={{ __html: preview }} />
            ) : (
              <p className="text-sm text-muted">Nothing to preview yet.</p>
            )}
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="card-luxe p-6">
          <h3 className="font-display text-2xl text-espresso-900">Details</h3>

          <label className="label-luxe mt-5 block" htmlFor="author">Byline</label>
          <input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} className="input-luxe" />

          <label className="label-luxe mt-5 block" htmlFor="tags">Tags <span className="font-normal text-muted">— comma separated</span></label>
          <input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} className="input-luxe" placeholder="Craft, Abuja" />

          <label className="label-luxe mt-5 block" htmlFor="cover">Cover image URL</label>
          <input id="cover" value={cover} onChange={(e) => setCover(e.target.value)} className="input-luxe" placeholder="https://… or /listings/…" />
          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="mt-3 aspect-[16/9] w-full rounded-2xl object-cover" />
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {UPLOAD_CHOICES.slice(0, 8).map((c) => (
              <button key={c.url} type="button" onClick={() => setCover(c.url)} className="rounded-full bg-sand px-2.5 py-1 text-[11px] font-medium text-espresso-600 hover:bg-linen">
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-luxe space-y-3 p-6">
          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button onClick={() => save("published")} disabled={busy !== null} className="btn-gold w-full">
            {busy === "publish" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {post?.status === "published" ? "Save & keep live" : "Publish"}
          </button>
          <button onClick={() => save("draft")} disabled={busy !== null} className="btn-outline w-full">
            {busy === "draft" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save as draft
          </button>
          <Link href="/admin" className="block pt-1 text-center text-xs font-semibold text-muted hover:text-espresso-900">
            Cancel
          </Link>
        </div>
      </aside>
    </div>
  );
}
