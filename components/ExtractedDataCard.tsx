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
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-800 border-amber-200";
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function ExtractedDataCard({ bill }: ExtractedDataCardProps) {
  const hasUnitPrice = bill.unit_price_eur_kwh != null;
  const hasConsumption = bill.consumption_kwh != null;
  const hasFees = bill.fixed_fees_monthly_eur != null || bill.fixed_fees_eur != null;

  // “OK” si on a le trio clé (prix + conso + abonnement)
  const extractionOk = hasUnitPrice && hasConsumption && hasFees;

  // Abonnement
  const subscriptionValue =
    bill.fixed_fees_monthly_eur != null
      ? `${fmt(bill.fixed_fees_monthly_eur, 2)} € / mois`
      : bill.fixed_fees_eur != null
      ? `${fmt(bill.fixed_fees_eur, 2)} € (période)`
      : "Non détecté";

  const subscriptionBadge =
    bill.fixed_fees_monthly_eur != null
      ? "Estimé"
      : bill.fixed_fees_eur != null
      ? "Détecté"
      : "Manquant";

  const subscriptionTone =
    bill.fixed_fees_monthly_eur != null
      ? "green"
      : bill.fixed_fees_eur != null
      ? "slate"
      : "amber";

  const subscriptionHint =
    bill.fixed_fees_monthly_eur != null
      ? "Calculé automatiquement à partir de la période."
      : bill.fixed_fees_eur != null
      ? "Montant trouvé sur la période."
      : "Souvent dans l’annexe “détail des coûts”.";

  // Prix énergie
  const unitPriceValue = hasUnitPrice
    ? `${fmt(bill.unit_price_eur_kwh, 4)} €/kWh${isBiHoraire(bill.meter_type) ? " (moyenne)" : ""}`
    : "–";

  const meterBadge = isBiHoraire(bill.meter_type) ? "Bi-horaire" : "Simple";

  // Conso
  const consumptionValue = hasConsumption ? `${fmt(bill.consumption_kwh, 0)} kWh` : "–";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* ── Header ── */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
              Comment Billy a comparé ton contrat
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Les éléments ci-dessous sont utilisés pour comparer les offres.
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
            Certaines infos n’ont pas été trouvées. La comparaison reste possible, mais elle peut être moins précise.
          </div>
        )}
      </div>

      {/* ── Section 1 : Cards comparaison ── */}
      <Section title="Base de comparaison" subtitle="Ce que BillyCheck utilise pour la simulation">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <MiniCard
            title="Prix énergie"
            value={unitPriceValue}
            badge={meterBadge}
            tone="blue"
            subtitle="Prix utilisé pour estimer ton coût"
          />

          <MiniCard
            title="Abonnement"
            value={subscriptionValue}
            badge={subscriptionBadge}
            tone={subscriptionTone}
            subtitle={subscriptionHint}
          />

          <MiniCard
            title="Consommation"
            value={consumptionValue}
            badge="Base"
            tone="slate"
            subtitle="Valeur utilisée pour comparer"
          />
        </div>

        <p className="mt-4 text-[11px] text-slate-400 italic leading-relaxed">
          Les taxes et la TVA sont réglementées et identiques chez tous les fournisseurs. Elles sont incluses dans le total TTC.
        </p>
      </Section>

      {/* ── Section 2 : Infos facture ── */}
      <Section title="Données lues sur ta facture" subtitle="Informations extraites automatiquement">
        <div className="grid grid-cols-1 gap-2">
          <InfoLine icon="📅" label="Période analysée" value={bill.billing_period ?? "–"} />
          <InfoLine icon="⚡" label="Type de compteur" value={bill.meter_type ?? "–"} />
          <InfoLine icon="📍" label="Code postal" value={bill.postal_code ?? "–"} />
          <InfoLine icon="🏢" label="Fournisseur" value={bill.provider ?? "–"} />
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
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </div>
        {subtitle && <div className="text-[12px] text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function MiniCard({
  title,
  value,
  subtitle,
  badge,
  tone,
}: {
  title: string;
  value: string;
  subtitle?: string;
  badge?: string;
  tone: "blue" | "green" | "amber" | "slate";
}) {
  const toneClass =
    tone === "blue"
      ? "bg-blue-50 border-blue-100"
      : tone === "green"
      ? "bg-emerald-50 border-emerald-100"
      : tone === "amber"
      ? "bg-amber-50 border-amber-100"
      : "bg-slate-50 border-slate-100";

  const badgeClass =
    tone === "blue"
      ? "bg-blue-100 text-blue-700"
      : tone === "green"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "amber"
      ? "bg-amber-100 text-amber-800"
      : "bg-slate-200 text-slate-700";

  return (
    <div className={`rounded-2xl border ${toneClass} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-semibold text-slate-600">{title}</div>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 text-[18px] font-extrabold text-slate-900">{value}</div>

      {subtitle && <div className="mt-1 text-[12px] text-slate-500 leading-snug">{subtitle}</div>}
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[13px] text-slate-600">{label}</span>
      </div>
      <div className="text-[14px] font-semibold text-slate-900 text-right shrink-0">{value}</div>
    </div>
  );
}
