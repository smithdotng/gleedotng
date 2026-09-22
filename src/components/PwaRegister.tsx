"use client";

import { useEffect } from "react";

/** Registers the service worker (production only, so it never caches during development). */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let done = false;
    const register = () => {
      if (done) return;
      done = true;
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };
    if (document.readyState === "complete") return register();
    // Register after load so it never competes with first paint — but don't wait forever on slow images.
    window.addEventListener("load", register, { once: true });
    const t = window.setTimeout(register, 4000);
    return () => {
      window.removeEventListener("load", register);
      window.clearTimeout(t);
    };
  }, []);
  return null;
}
