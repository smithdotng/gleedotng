"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Send, Trash2 } from "lucide-react";
import type { Post } from "@/lib/types";

/* ---------------- Sign in ---------------- */

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not sign in.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label-luxe" htmlFor="admin-password">Admin password</label>
        <div className="relative">
          <Lock size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gold-600" />
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-luxe !px-11"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-muted hover:text-espresso-900"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="btn-dark w-full !py-3.5">
        {busy && <Loader2 size={16} className="animate-spin" />} Enter the Journal
      </button>
    </form>
  );
}

/* ---------------- Row actions on the post list ---------------- */

export function PostRowActions({ post }: { post: Post }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);
  const [confirming, setConfirming] = useState(false);

  const togglePublish = async () => {
    setBusy("publish");
    await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: post.status === "published" ? "draft" : "published" }),
    });
    setBusy(null);
    router.refresh();
  };

  const remove = async () => {
    setBusy("delete");
    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    setBusy(null);
    setConfirming(false);
    router.refresh();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={togglePublish} disabled={busy !== null} className="btn-outline !px-4 !py-2 text-xs">
        {busy === "publish" ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {post.status === "published" ? "Unpublish" : "Publish"}
      </button>
      {confirming ? (
        <span className="flex items-center gap-2 text-xs">
          <button onClick={remove} disabled={busy !== null} className="rounded-full bg-red-600 px-4 py-2 font-semibold text-white">
            {busy === "delete" ? "Deleting…" : "Delete for good"}
          </button>
          <button onClick={() => setConfirming(false)} className="font-semibold text-muted hover:text-espresso-900">
            Cancel
          </button>
        </span>
      ) : (
        <button onClick={() => setConfirming(true)} className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete post">
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}
