"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

const REF_COOKIE = "bc_ref";
const REF_COOKIE_DAYS = 30;

export function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      // Validate: 6-16 alphanumeric chars
      if (!ref || !/^[A-Z0-9]{6,16}$/i.test(ref)) return;

      // Store in cookie for 30 days
      const expires = new Date(Date.now() + REF_COOKIE_DAYS * 864e5).toUTCString();
      document.cookie = `${REF_COOKIE}=${encodeURIComponent(ref)}; Expires=${expires}; Path=/; SameSite=Lax`;

      track("referral_landing", { refCode: ref });
    } catch {
      // silently fail
    }
  }, []);

  return null;
}
