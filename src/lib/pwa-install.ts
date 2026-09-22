"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Install-to-home-screen state, shared by every install button on the page.
 *
 * Chrome/Edge/Samsung fire `beforeinstallprompt` (often before React hydrates), so an inline
 * script in the root layout (INSTALL_CAPTURE_SCRIPT) stashes it on `window.__gleeInstall`.
 * iOS Safari has no prompt API — there we show "Share → Add to Home Screen" instructions.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __gleeInstall?: BeforeInstallPromptEvent | null;
    __gleeInstalled?: boolean;
  }
}

export type InstallStatus = "unknown" | "installed" | "available" | "ios" | "unsupported";

export const INSTALL_EVENT = "glee:install-change";

/** Runs in <head> before hydration so an early beforeinstallprompt isn't lost. */
export const INSTALL_CAPTURE_SCRIPT = `(function(){try{
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__gleeInstall=e;window.dispatchEvent(new Event('${INSTALL_EVENT}'));});
window.addEventListener('appinstalled',function(){window.__gleeInstall=null;window.__gleeInstalled=true;window.dispatchEvent(new Event('${INSTALL_EVENT}'));});
}catch(_){}})();`;

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as a Mac with touch
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function read(): InstallStatus {
  if (window.__gleeInstalled || isStandalone()) return "installed";
  if (window.__gleeInstall) return "available";
  if (isIos()) return "ios";
  return "unsupported";
}

function subscribe(cb: () => void) {
  window.addEventListener(INSTALL_EVENT, cb);
  const mq = window.matchMedia?.("(display-mode: standalone)");
  mq?.addEventListener?.("change", cb);
  return () => {
    window.removeEventListener(INSTALL_EVENT, cb);
    mq?.removeEventListener?.("change", cb);
  };
}

export function useInstall() {
  const status = useSyncExternalStore<InstallStatus>(subscribe, read, () => "unknown");

  /** Opens the native install prompt. Returns "ios" when the caller should show instructions instead. */
  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "ios" | "unavailable"> => {
    const evt = window.__gleeInstall;
    if (evt) {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      // A prompt event can only be used once.
      window.__gleeInstall = null;
      if (outcome === "accepted") window.__gleeInstalled = true;
      window.dispatchEvent(new Event(INSTALL_EVENT));
      return outcome;
    }
    return isIos() ? "ios" : "unavailable";
  }, []);

  return { status, install, canInstall: status === "available" || status === "ios" };
}
