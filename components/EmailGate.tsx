"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

interface EmailGateProps {
  scanId: string;
  onUnlocked: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate({ scanId, onUnlocked }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ton adresse email est requise.");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setError("Adresse email invalide.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/scans/${scanId}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erreur, réessaie.");
        setLoading(false);
        return;
      }

      track("email_unlocked", { scanId });
      onUnlocked();
    } catch {
      setError("Erreur réseau, réessaie.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-billy-blue/30 rounded-2xl p-5 space-y-3">
      <div className="text-center">
        <div className="text-2xl mb-1">🔓</div>
        <div className="font-bold text-base text-slate-900">
          Découvre quel fournisseur te fait économiser
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Entre ton email pour voir les noms des fournisseurs et accéder aux offres.
        </p>
      </div>

      <div>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          aria-invalid={!!error}
          className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors ${
            error
              ? "border-rose-400 bg-rose-50 focus:ring-rose-400"
              : "border-slate-200 bg-slate-50 focus:ring-billy-blue"
          }`}
        />
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-rose-600">{error}</p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Voir les fournisseurs →"}
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        🔒 Pas de spam. Uniquement pour tes résultats.{" "}
        <a href="/politique-de-confidentialite" className="underline">
          Confidentialité
        </a>
      </p>
    </div>
  );
}
