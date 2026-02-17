"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Billy } from "@/components/Billy";
import { ChatBubble } from "@/components/ChatBubble";
import { getClientUserId } from "@/lib/user-id.client";

export default function PaywallClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get("payment") === "cancelled";

  const [loading, setLoading] = useState(false);

  const PRICE_EUR = "4,99";

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const uid = getClientUserId();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIdentifier: uid }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-10 max-w-lg mx-auto min-h-[70vh]">
      <div className="animate-fade-up">
        <div className="text-center mb-5">
          <Billy expression="normal" size={110} />
        </div>

        <div className="flex flex-col gap-2.5 mb-8">
          {cancelled ? (
            <ChatBubble>
              <strong>Pas de souci.</strong> Tu peux revenir quand tu veux.
            </ChatBubble>
          ) : (
            <ChatBubble>
              <strong>Tu as utilisé tes 2 scans gratuits</strong> 🎁
            </ChatBubble>
          )}

<ChatBubble delay={300}>
  À partir du 3e scan, l’analyse est facturée <strong>4,99 €</strong>.
</ChatBubble>

<ChatBubble delay={600}>
  Pas d’abonnement. Tu payes uniquement quand tu en as besoin.
</ChatBubble>

        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 space-y-3">
          {([
            ["⚡", "Résultat en moins d'une minute"],
            ["📊", "Comparaison basée sur vos prix HT réels"],
            ["🔒", "Facture supprimée après analyse"],
          ] as const).map(([icon, text], i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg">{icon}</span>
              <span className="text-[15px] text-slate-700">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl text-base font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {loading ? "Redirection vers le paiement..." : `Continuer avec 1 scan (${PRICE_EUR} €)`}
        </button>

        <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-400">
          <span>💳 Carte · Apple Pay · Google Pay · Bancontact</span>
        </div>

        <div className="text-center mt-3 text-[11px] text-slate-400">
          Astuce : la plupart des gens n’ont besoin que de 1 à 2 scans.
        </div>

        <button
          onClick={() => router.push("/")}
          className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Revenir
        </button>
      </div>
    </div>
  );
}
