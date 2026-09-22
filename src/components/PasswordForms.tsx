"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Lock, Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setBusy(false);
    setSent(true);
  };

  if (sent)
    return (
      <div className="rounded-2xl bg-sand p-5 text-sm text-espresso-800">
        <CheckCircle2 size={20} className="mb-2 text-gold-700" />
        If an account exists for <b>{email}</b>, a reset link is on its way. It expires in 1 hour — check your spam folder if you don&apos;t see it.
        <Link href="/login" className="mt-4 block font-semibold text-gold-700 hover:underline">
          Back to sign in
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="relative">
        <Mail size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gold-600" />
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-luxe !pl-11" placeholder="you@business.com" />
      </div>
      <button disabled={busy} className="btn-dark w-full !py-3.5">
        {busy && <Loader2 size={16} className="animate-spin" />} Send reset link
      </button>
      <Link href="/login" className="block text-center text-sm text-muted hover:text-espresso-900">
        Remembered it? Sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Password must be at least 8 characters.");
    if (pw !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: pw }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setError(data.error || "Could not reset password.");
    }
    router.replace(`/dashboard/${data.slug}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {[
        [pw, setPw, "New password (8+ characters)"],
        [confirm, setConfirm, "Confirm new password"],
      ].map(([v, set, ph]) => (
        <div key={ph as string} className="relative">
          <Lock size={16} className="absolute top-1/2 left-4 -translate-y-1/2 text-gold-600" />
          <input type="password" required autoComplete="new-password" value={v as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} className="input-luxe !pl-11" placeholder={ph as string} />
        </div>
      ))}
      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="btn-dark w-full !py-3.5">
        {busy && <Loader2 size={16} className="animate-spin" />} Save new password
      </button>
    </form>
  );
}

export function ResendVerificationButton() {
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");
  const resend = async () => {
    setState("busy");
    setError("");
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Could not send email.");
      setState("idle");
    } else setState("sent");
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button onClick={resend} disabled={state !== "idle"} className="btn-dark !px-4 !py-2 text-xs">
        {state === "busy" && <Loader2 size={14} className="animate-spin" />}
        {state === "sent" ? "Sent — check your inbox" : "Resend verification email"}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </span>
  );
}
