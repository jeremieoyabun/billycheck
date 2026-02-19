"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

type Status = "idle" | "loading" | "done" | "error";

export function ShareButton() {
  const [status, setStatus] = useState<Status>("idle");

  const handleShare = async () => {
    if (status !== "idle") return;
    setStatus("loading");

    try {
      const res = await fetch("/api/referrals/code");
      if (!res.ok) throw new Error("API error");
      const { url } = await res.json();
      if (!url) throw new Error("No URL");

      const shareText =
        "Utilise BillyCheck pour verifier si tu paies trop cher ton electricite ou telecom. 30 secondes, gratuit.";

      if (navigator.share) {
        await navigator.share({ title: "BillyCheck", text: shareText, url });
        track("referral_shared", { method: "native_share" });
      } else {
        await navigator.clipboard.writeText(url);
        track("referral_shared", { method: "clipboard" });
      }

      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      // User cancelled or clipboard failed
      setStatus("idle");
    }
  };

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🎁</span>
        <div className="font-bold text-sm text-violet-900">Invitez un ami, gagnez des analyses</div>
      </div>
      <p className="text-xs text-violet-800 leading-relaxed mb-3">
        Partagez votre lien personnalise : votre ami recoit 2 analyses offertes, et vous aussi.
      </p>
      <button
        onClick={handleShare}
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors disabled:opacity-60"
      >
        {status === "done" ? (
          <>✅ Lien copie ! Ton ami recoit aussi 2 analyses.</>
        ) : status === "loading" ? (
          <>⏳ Generation du lien...</>
        ) : (
          <>🔗 Partager a un ami (+2 analyses offertes)</>
        )}
      </button>
    </div>
  );
}
