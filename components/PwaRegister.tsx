"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so the app can be installed and work offline.
 * Kept in a client component to avoid Next.js server component restrictions.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (err) {
        console.error("Service worker registration failed:", err);
      }
    };

    // Register after load to avoid interfering with first render.
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}

