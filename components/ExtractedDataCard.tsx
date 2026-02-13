"use client";

import type { ExtractedBill } from "./ResultCards";

interface ExtractedDataCardProps {
  bill: ExtractedBill;
}

const fmt = (n: number | null | undefined, decimals = 2) =>
  n != null
    ? n.toLocaleString("fr-BE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : null;

export function ExtractedDataCard({ bill }: ExtractedDataCardProps) {
  const hasFees = bill.fixed_fees_eur != null;
  const hasUnitPrice = bill.unit_price_eur_kwh != null;
  const hasConsumption = bill.consumption_kwh != null;

  // Detect HP/HC (bi-horaire) from meter_type
  const isBiHoraire =
    bill.meter_type?.toLowerCase().includes("bi") ||
    bill.meter_type?.toLowerCase().includes("double");

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
          Données extraites
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Utilisées pour la comparaison
        </div>
      </div>

      {/* Section A: comparison fields */}
      <div className="px-5 py-4 space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Base de comparaison
        </div>

        {hasFees && (
          <Row
            label="Abonnement électricité HT (mensuel)"
            value={`${fmt(bill.fixed_fees_eur)} € / mois`}
          />
        )}

        {hasUnitPrice && !isBiHoraire && (
          <Row
            label="Prix énergie HT (€/kWh)"
            value={`${fmt(bill.unit_price_eur_kwh, 4)} €/kWh`}
          />
        )}

        {/* HP/HC breakdown would go here if we had separate HP/HC fields */}
        {hasUnitPrice && isBiHoraire && (
          <Row
            label="Prix moyen pondéré HT (€/kWh)"
            value={`${fmt(bill.unit_price_eur_kwh, 4)} €/kWh`}
          />
        )}

        <p className="text-[11px] text-slate-400 italic leading-relaxed">
          Les taxes et la TVA sont réglementées et identiques pour toutes les
          offres. Elles sont incluses dans le total TTC.
        </p>
      </div>

      {/* Section B: annual estimate fields */}
      <div className="px-5 py-4 border-t border-slate-100 space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Estimation annuelle
        </div>

        {hasConsumption && (
          <Row
            label="Consommation annuelle réelle"
            value={`${fmt(bill.consumption_kwh, 0)} kWh`}
            mono
          />
        )}

        {bill.billing_period && (
          <Row label="Période" value={bill.billing_period} />
        )}

        {bill.meter_type && (
          <Row label="Type de compteur" value={bill.meter_type} />
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] text-slate-600">{label}</span>
      <span
        className={`text-[14px] font-semibold text-slate-900 text-right shrink-0 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
