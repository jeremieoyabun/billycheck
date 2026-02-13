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
    : "–";

function badgeTone(kind: "ok" | "warn") {
  return kind === "ok"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-800 border-amber-200";
}

export function ExtractedDataCard({ bill }: ExtractedDataCardProps) {
  const hasUnitPrice = bill.unit_price_eur_kwh != null;
  const hasConsumption = bill.consumption_kwh != null;
  const hasFees = bill.fixed_fees_eur != null;

  const isBiHoraire =
    bill.meter_type?.toLowerCase().includes("bi") ||
    bill.meter_type?.toLowerCase().includes("double");

  const extractionIsPartial = !hasFees; // pour l’instant: abonnement souvent manquant

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
              Données utilisées
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Ce sont les chiffres qui servent à comparer les offres.
            </div>
          </div>

          <span
            className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeTone(
              extractionIsPartial ? "warn" : "ok"
            )}`}
          >
            {extractionIsPartial ? "EXTRACTION PARTIELLE" : "EXTRACTION OK"}
          </span>
        </div>
      </div>

      {/* SECTION 1 — Base de comparaison */}
      <Section title="Base de comparaison" subtitle="Ce que BillyCheck compare entre les fournisseurs">
        <div className="grid grid-cols-1 gap-3">
          <DataRow
            label="Prix énergie HT"
            value={
              hasUnitPrice
                ? `${fmt(bill.unit_price_eur_kwh, 4)} €/kWh${isBiHoraire ? " (moyenne)" : ""}`
                : "–"
            }
            highlight
          />

          <DataRow
            label="Abonnement HT"
            value={
              hasFees
                ? `${fmt(bill.fixed_fees_eur, 2)} € (montant détecté)`
                : "Non détecté"
            }
            helper={
              hasFees
                ? "Astuce: on peut convertir en €/mois si on a la durée exacte de facturation."
                : "Souvent présent sur une annexe ou une page “détail des coûts”."
            }
            tone={hasFees ? "neutral" : "warn"}
          />

          <DataRow
            label="Consommation utilisée"
            value={hasConsumption ? `${fmt(bill.consumption_kwh, 0)} kWh` : "–"}
            helper="On utilise cette valeur comme base pour estimer un coût annuel et comparer les offres."
          />

          <p className="text-[11px] text-slate-400 italic leading-relaxed pt-1">
            Les taxes et la TVA sont réglementées et identiques pour toutes les offres. Elles sont incluses dans le total TTC.
          </p>

          {bill.fixed_fees_monthly_eur != null ? (
  <Row
    label="Abonnement électricité HT (estimé mensuel)"
    value={`${fmt(bill.fixed_fees_monthly_eur)} € / mois`}
  />
) : bill.fixed_fees_eur != null ? (
  <Row
    label="Abonnement électricité HT (fixe sur la période)"
    value={`${fmt(bill.fixed_fees_eur)} €`}
  />
) : (
  <Row
    label="Abonnement électricité HT"
    value="Non détecté"
  />
)}

        </div>
      </Section>

      {/* SECTION 2 — Données facture */}
      <Section title="Données de la facture" subtitle="Ce que nous avons lu sur ta facture">
        <div className="grid grid-cols-1 gap-3">
          <DataRow label="Période analysée" value={bill.billing_period ?? "–"} />
          <DataRow label="Type de compteur" value={bill.meter_type ?? "–"} />
          <DataRow label="Code postal" value={bill.postal_code ?? "–"} />
          <DataRow label="Fournisseur détecté" value={bill.provider ?? "–"} />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-4 border-t border-slate-100">
      <div className="mb-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</div>
        {subtitle && <div className="text-[12px] text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function DataRow({
  label,
  value,
  helper,
  mono,
  highlight,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper?: string;
  mono?: boolean;
  highlight?: boolean;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className={`rounded-xl ${highlight ? "bg-slate-50" : ""} px-3 py-2`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] text-slate-500">{label}</div>
          {helper && <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{helper}</div>}
        </div>
        <div
          className={`text-right shrink-0 text-[14px] font-extrabold ${
            mono ? "font-mono" : ""
          } ${tone === "warn" ? "text-amber-900" : "text-slate-900"}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
