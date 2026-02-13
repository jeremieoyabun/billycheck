"use client";

interface ScanCounterProps {
  freeRemaining: number;
  paidCredits: number;
}

export function ScanCounter({ freeRemaining, paidCredits }: ScanCounterProps) {
  if (paidCredits > 0) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-medium text-blue-700">
        <span>🎟️</span>
        <span>{paidCredits} crédit{paidCredits > 1 ? "s" : ""} restant{paidCredits > 1 ? "s" : ""}</span>
      </div>
    );
  }

  if (freeRemaining <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-700">
      <span>🎁</span>
      <span>Scans gratuits restants : {freeRemaining}</span>
    </div>
  );
}
