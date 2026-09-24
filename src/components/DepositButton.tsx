"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { naira } from "@/lib/utils";

/** Pays a booking deposit — no sign-in needed, the booking id is the client's key. */
export default function DepositButton({ bookingId, amount }: { bookingId: string; amount: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pay = async () => {
    setBusy(true);
    setError("");
    const res = await fetch("/api/billing/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) return (window.location.href = data.url as string);
    setBusy(false);
    setError(data.error || "Could not start the payment.");
  };

  return (
    <div>
      <button onClick={pay} disabled={busy} className="btn-gold w-full !py-3.5">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />} Pay {naira(amount)} deposit
      </button>
      {error && <p className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
