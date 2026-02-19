// lib/analytics.ts
// Lightweight, zero-dependency analytics wrapper.
// Safe to call anywhere - never throws, degrades gracefully if no provider configured.
// Providers activated via env vars:
//   NEXT_PUBLIC_GA_ID        → Google Analytics 4
//   NEXT_PUBLIC_POSTHOG_KEY  → PostHog

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (name: string, props?: Record<string, unknown>) => void };
  }
}

export function track(name: string, props?: Record<string, unknown>): void {
  try {
    if (typeof window === "undefined") return;

    // GA4
    if (typeof window.gtag === "function") {
      window.gtag("event", name, props ?? {});
    }

    // PostHog
    if (typeof window.posthog?.capture === "function") {
      window.posthog.capture(name, props);
    }

    // Dev console
    if (process.env.NODE_ENV === "development") {
      console.debug(`[analytics] ${name}`, props);
    }
  } catch {
    // Never throw from analytics
  }
}
