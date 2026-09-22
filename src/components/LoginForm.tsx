"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not sign in.");
      setBusy(false);
      return;
    }
    router.replace(next && next.startsWith("/dashboard") ? next : `/dashboard/${data.slug}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label-luxe" htmlFor="email">Email</label>
        <div className="relative">
          <Mail size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gold-600" />
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxe !pl-11" placeholder="you@business.com" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="label-luxe" htmlFor="password">Password</label>
          <Link href="/forgot-password" className="mb-1.5 text-xs font-semibold text-gold-700 hover:underline">Forgot password?</Link>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gold-600" />
          <input id="password" type={show ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-luxe !px-11" placeholder="••••••••" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-4 -translate-y-1/2 text-muted hover:text-espresso-900" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="btn-dark w-full !py-3.5">
        {busy && <Loader2 size={16} className="animate-spin" />} Sign in
      </button>
    </form>
  );
}
