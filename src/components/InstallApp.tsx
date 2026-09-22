"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Download, PlusSquare, Share, Smartphone, X } from "lucide-react";
import { useInstall } from "@/lib/pwa-install";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* iOS instructions sheet                                              */
/* ------------------------------------------------------------------ */

function IosSheet({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const steps = [
    { icon: Share, text: <>Tap the <b>Share</b> button in Safari&apos;s toolbar</> },
    { icon: PlusSquare, text: <>Scroll down and choose <b>Add to Home Screen</b></> },
    { icon: Check, text: <>Tap <b>Add</b> — glee now opens like an app</> },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
      <button className="absolute inset-0 bg-espresso-950/70 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-[28px] bg-ivory p-7 pb-[calc(1.75rem+env(safe-area-inset-bottom))] shadow-luxe sm:rounded-[28px]">
        <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-2 text-muted hover:bg-sand" aria-label="Close">
          <X size={18} />
        </button>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="h-14 w-14 rounded-2xl shadow-soft" />
          <div>
            <p className="eyebrow">Install on iPhone</p>
            <h2 id="ios-install-title" className="font-display text-3xl text-espresso-900">
              Add glee to your Home Screen
            </h2>
          </div>
        </div>
        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-4 rounded-2xl bg-sand px-4 py-3 text-sm text-espresso-800">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-espresso-900 text-gold-300">
                <s.icon size={17} />
              </span>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-center text-xs text-muted">Using Chrome on iPhone? Open glee.ng in Safari first.</p>
      </div>
    </div>,
    document.body,
  );
}

function useInstallAction() {
  const { status, install, canInstall } = useInstall();
  const [sheet, setSheet] = useState(false);
  const [done, setDone] = useState(false);
  const run = async () => {
    const r = await install();
    if (r === "ios") setSheet(true);
    if (r === "accepted") setDone(true);
  };
  const sheetEl = sheet ? <IosSheet onClose={() => setSheet(false)} /> : null;
  return { status, canInstall, run, sheetEl, done };
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type Variant = "header" | "menu" | "footer";

/** Renders nothing unless this browser can actually install (or is iOS Safari). */
export function InstallButton({ variant, className }: { variant: Variant; className?: string }) {
  const { canInstall, run, sheetEl } = useInstallAction();
  if (!canInstall) return null;

  const styles: Record<Variant, string> = {
    header:
      "inline-flex items-center gap-1.5 rounded-full border border-gold-400/40 px-3.5 py-2 text-[12px] font-semibold tracking-wide text-gold-300 transition hover:border-gold-300 hover:bg-gold-400/10",
    menu: "btn-ghost-light mt-3 w-full",
    footer:
      "inline-flex items-center gap-2 rounded-full border border-gold-400/40 px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-gold-300 uppercase transition hover:bg-gold-400/10",
  };

  return (
    <>
      <button type="button" onClick={run} className={cn(styles[variant], className)}>
        {variant === "footer" ? <Smartphone size={15} /> : <Download size={variant === "header" ? 14 : 16} />}
        {variant === "footer" ? "Install the glee app" : "Get the app"}
      </button>
      {sheetEl}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Contextual card (dashboard, booking confirmation)                   */
/* ------------------------------------------------------------------ */

const DISMISS_KEY = "glee:install-card-dismissed";

export function InstallCard({
  title,
  text,
  tone = "light",
  dismissible = true,
  className,
}: {
  title: string;
  text: string;
  tone?: "light" | "dark";
  dismissible?: boolean;
  className?: string;
}) {
  const { canInstall, run, sheetEl, done } = useInstallAction();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
      setDismissed(dismissible && until > Date.now());
    } catch {
      setDismissed(false);
    }
  }, [dismissible]);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + 14 * 24 * 3600 * 1000)); // two weeks
    } catch {}
  };

  if (done) {
    return (
      <div className={cn("flex items-center gap-3 rounded-[24px] bg-gold-500/15 p-5 text-sm font-semibold text-gold-700", className)}>
        <Check size={18} /> glee is on your home screen. Open it any time — no app store needed.
      </div>
    );
  }
  if (!canInstall || dismissed) return null;

  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 overflow-hidden rounded-[24px] p-6 sm:flex-row sm:items-center sm:justify-between",
        dark ? "bg-espresso-950/60 ring-1 ring-gold-400/25 backdrop-blur" : "border border-gold-500/30 bg-ivory shadow-soft",
        className,
      )}
    >
      {dismissible && (
        <button
          onClick={dismiss}
          aria-label="Not now"
          className={cn("absolute top-3 right-3 rounded-full p-1.5", dark ? "text-ivory/50 hover:text-ivory" : "text-muted hover:bg-sand")}
        >
          <X size={16} />
        </button>
      )}
      <div className="flex items-start gap-4 pr-6 sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-14 w-14 shrink-0 rounded-2xl shadow-soft ring-1 ring-gold-400/30" />
        <div>
          <p className={cn("font-display text-2xl leading-tight", dark ? "text-ivory" : "text-espresso-900")}>{title}</p>
          <p className={cn("mt-1 text-sm", dark ? "text-ivory/65" : "text-muted")}>{text}</p>
        </div>
      </div>
      <button type="button" onClick={run} className="btn-gold shrink-0 !py-2.5">
        <Download size={15} /> Install app
      </button>
      {sheetEl}
    </div>
  );
}
