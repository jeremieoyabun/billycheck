"use client";

import type { ExtractedBill } from "./ResultCards";

interface ExtractedDataCardProps {
  bill: ExtractedBill;
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const fmt = (n: number | null | undefined, decimals = 2) =>
  n != null
    ? n.toLocaleString("fr-BE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : "–";

function isBiHoraire(meterType?: string | null) {
  const s = (meterType ?? "").toLowerCase();
  return s.includes("bi") || s.includes("double") || s.includes("hc") || s.includes("hp");
}

function badgeClass(kind: "ok" | "partial") {
  return kind === "ok"
    ? "bg-emerald-200 text-emerald-800 border-emerald-300"
    : "bg-yellow-100 text-yellow-800 border-yellow-300";
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function ExtractedDataCard({ bill }: ExtractedDataCardProps) {
  const hasUnitPrice = bill.unit_price_eur_kwh != null;
  const hasConsumption = bill.consumption_kwh != null;

  // ✅ abonnement: soit mensuel calculé, soit montant brut, sinon manquant
  const hasFees = bill.fixed_fees_monthly_eur != null || bill.fixed_fees_eur != null;

  // Extraction “OK” si on a les 3 champs clés
  const extractionOk = hasUnitPrice && hasConsumption && hasFees;

  // Affichage abonnement
  const subscriptionValue =
    bill.fixed_fees_monthly_eur != null
      ? `${fmt(bill.fixed_fees_monthly_eur, 2)} € / mois`
      : bill.fixed_fees_eur != null
      ? `${fmt(bill.fixed_fees_eur, 2)} € (période)`
      : "Non détecté";

  const subscriptionHelper =
    bill.fixed_fees_monthly_eur != null
      ? "Calculé automatiquement à partir de la période de facturation."
      : bill.fixed_fees_eur != null
      ? "Montant trouvé sur la période (mensuel non calculable sans durée précise)."
      : "Souvent présent sur une annexe ou une page “détail des coûts”.";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold text-slate-600 uppercase tracking-wider">
              Données utilisées
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Base de comparaison entre les offres
            </div>
          </div>

          <span
            className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badgeClass(
              extractionOk ? "ok" : "partial"
            )}`}
          >
            {extractionOk ? "EXTRACTION OK" : "EXTRACTION PARTIELLE"}
          </span>
        </div>

        {!extractionOk && (
          <div className="mt-2 text-[12px] text-slate-500">
            Certaines infos n’ont pas été trouvées, mais la comparaison reste possible.
          </div>
        )}
      </div>

      {/* ── Section 1 : Base de comparaison ── */}
      <Section title="Base de comparaison" subtitle="Ce que BillyCheck compare entre les fournisseurs">
        <div className="grid grid-cols-1 gap-3">
          <MetricRow
            label="Prix énergie HT"
            value={hasUnitPrice ? `${fmt(bill.unit_price_eur_kwh, 4)} €/kWh${isBiHoraire(bill.meter_type) ? " (moyenne)" : ""}` : "–"}
            highlight
          />

          <MetricRow
            label="Abonnement HT"
            value={subscriptionValue}
            helper={subscriptionHelper}
            tone={hasFees ? "neutral" : "warn"}
          />

          <MetricRow
            label="Consommation utilisée"
            value={hasConsumption ? `${fmt(bill.consumption_kwh, 0)} kWh` : "–"}
            helper="Cette valeur sert de base pour estimer un coût annuel et comparer les offres."
          />

          <p className="text-[11px] text-slate-400 italic leading-relaxed pt-1">
            Taxes et TVA : identiques pour toutes les offres, incluses dans le total TTC.
          </p>
        </div>
      </Section>

      {/* ── Section 2 : Données de la facture ── */}
      <Section title="Données de la facture" subtitle="Ce que nous avons lu sur ta facture">
        <div className="grid grid-cols-1 gap-3">
          <MetricRow label="Période analysée" value={bill.billing_period ?? "–"} />
          <MetricRow label="Type de compteur" value={bill.meter_type ?? "–"} />
          <MetricRow label="Code postal" value={bill.postal_code ?? "–"} />
          <MetricRow label="Fournisseur détecté" value={bill.provider ?? "–"} />
        </div>
      </Section>
    </div>
  );
}

/* ──────────────────────────────────────────────
   UI building blocks
   ────────────────────────────────────────────── */
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
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {title}
        </div>
        {subtitle && <div className="text-[12px] text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function MetricRow({
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
    <div className={`rounded-xl px-3 py-2 ${highlight ? "bg-slate-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] text-slate-600">{label}</div>
          {helper && (
            <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              {helper}
            </div>
          )}
        </div>

        <div
          className={`text-right shrink-0 text-[14px] font-extrabold ${mono ? "font-mono" : ""} ${tone === "warn" ? "text-yellow-900" : "text-slate-900"}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
