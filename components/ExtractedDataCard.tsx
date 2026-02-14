"use client";

import React from "react";
import type { ExtractedBill } from "./ResultCards";

interface ExtractedDataCardProps {
  bill: ExtractedBill;
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const fmtNumber = (n: number | null | undefined, decimals = 2) =>
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

type ExtractionStatus = "ok" | "partial" | "insufficient";

function badgeClass(kind: ExtractionStatus) {
  if (kind === "ok") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (kind === "partial") return "bg-amber-50 text-amber-800 border-amber-200";
  return "bg-rose-50 text-rose-800 border-rose-200";
}

function statusLabel(kind: ExtractionStatus) {
  if (kind === "ok") return "EXTRACTION OK";
  if (kind === "partial") return "EXTRACTION PARTIELLE";
  return "FACTURE ANNUELLE REQUISE";
}

function niceMissingLabel(key: string) {
  switch (key) {
    case "energy_unit_price_eur_kwh":
      return "Prix du kWh réellement payé (€/kWh)";
    case "consumption_kwh_annual":
      return "Consommation totale annuelle (kWh/an)";
    case "subscription_annual_ht_eur":
      return "Abonnement annuel HT";
    case "total_annual_ttc_eur":
      return "Total annuel TTC payé";
    default:
      return key;
  }
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */
export function ExtractedDataCard({ bill }: ExtractedDataCardProps) {
  // Nouveau modèle + fallback legacy (sans @ts-expect-error)
  const b = bill as any;

  const energyUnitPrice: number | null =
    b.energy_unit_price_eur_kwh ?? bill.unit_price_eur_kwh ?? null;

  const consumptionAnnual: number | null =
    b.consumption_kwh_annual ?? bill.consumption_kwh ?? null;

  const subscriptionAnnualHT: number | null =
    b.subscription_annual_ht_eur ??
    (bill.fixed_fees_monthly_eur != null ? bill.fixed_fees_monthly_eur * 12 : null) ??
    null;

  const totalAnnualTTC: number | null =
    b.total_annual_ttc_eur ?? bill.total_amount_eur ?? null;

  const meterType = bill.meter_type ?? null;

  // Données clés strictes (les 4)
  const required = [
    { key: "energy_unit_price_eur_kwh", ok: energyUnitPrice != null },
    { key: "consumption_kwh_annual", ok: consumptionAnnual != null },
    { key: "subscription_annual_ht_eur", ok: subscriptionAnnualHT != null },
    { key: "total_annual_ttc_eur", ok: totalAnnualTTC != null },
  ];

  const localMissingRequired = required.filter((r) => !r.ok).map((r) => r.key);

  // Si le backend fournit déjà missing_fields, on le préfère
  const missingRequired: string[] = Array.isArray(b.missing_fields)
    ? (b.missing_fields as string[])
    : localMissingRequired;

  // Données secondaires (pour "partial" sans bloquer)
  const secondaryMissing =
    (bill.provider ? 0 : 1) + (bill.postal_code ? 0 : 1) + (meterType ? 0 : 1);

  // Si le backend fournit confidence, on la respecte
  const backendStatus = b.confidence as ExtractionStatus | undefined;

  const status: ExtractionStatus =
    backendStatus ?? (missingRequired.length > 0 ? "insufficient" : secondaryMissing > 0 ? "partial" : "ok");

  // Si le backend indique explicitement qu'il faut la facture annuelle, on le respecte
  const needsFullAnnualInvoice: boolean =
    typeof b.needs_full_annual_invoice === "boolean" ? b.needs_full_annual_invoice : status === "insufficient";

  // Badge carte 1
  const energyBadge = isBiHoraire(meterType) ? "HP/HC" : "Moyen";
  const energySubtitle = isBiHoraire(meterType)
    ? "Moyenne pondérée selon ta consommation réelle"
    : "Prix moyen réellement payé";

  // Carte 2 abonnement
  const subscriptionValue =
    subscriptionAnnualHT != null ? `${fmtNumber(subscriptionAnnualHT, 0)} € / an` : "Non détecté";

  const subscriptionBadge =
    b.subscription_annual_ht_eur != null
      ? "Annuel HT"
      : bill.fixed_fees_monthly_eur != null
      ? "Estimé"
      : "Annuel HT";

  const subscriptionTone: "blue" | "green" | "amber" | "slate" =
    subscriptionAnnualHT != null ? "slate" : "amber";

  const subscriptionHint =
    subscriptionAnnualHT != null ? "Montant annuel hors taxes" : "Souvent indiqué dans le détail des coûts";

  // Carte 3 total TTC
  const totalValue =
    totalAnnualTTC != null ? `${fmtNumber(totalAnnualTTC, 0)} € / an` : "Non détecté";

  const totalTone: "blue" | "green" | "amber" | "slate" =
    totalAnnualTTC != null ? "slate" : "amber";

  return (
    <div className="relative bg-white border border-slate-300 shadow-sm rounded-2xl">
      {/* ── Header ── */}
      <div className="relative px-5 pt-4 pb-3 border-b border-slate-200">
        {/* Badge accroché au coin */}
        <span
          className={`absolute -top-3 -right-3 z-20 text-[11px] font-bold px-3 py-1 rounded-full border shadow-sm ${badgeClass(
            status
          )}`}
        >
          {statusLabel(status)}
        </span>

        {/* Textes avec padding-right pour ne pas passer sous le badge */}
        <div className="pr-44">
          <div className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
            Comment Billy a comparé ton contrat
          </div>

          <div className="text-xs text-slate-600 mt-0.5">
            Les éléments ci-dessous sont utilisés pour comparer les offres.
          </div>

          {needsFullAnnualInvoice ? (
            <div className="mt-2 text-[12px] text-slate-700">
              Pour comparer précisément, il nous faut une facture annuelle complète.
            </div>
          ) : status === "partial" ? (
            <div className="mt-2 text-[12px] text-slate-600">
              Certaines infos secondaires n’ont pas été trouvées. La comparaison reste possible.
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Bloc demande facture annuelle (si insuffisant) ── */}
      {needsFullAnnualInvoice && (
        <div className="px-6 py-5 border-t border-slate-200">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-sm font-extrabold text-rose-900">
              On a besoin d’une facture annuelle complète
            </div>

            <div className="mt-1 text-[12px] text-rose-900/80 leading-relaxed">
              Idéalement une facture de régularisation sur 12 mois, avec le détail des coûts.
            </div>

            <div className="mt-3 text-[12px] font-semibold text-rose-900/90">
              Éléments manquants :
            </div>
            <ul className="mt-1 space-y-1 text-[12px] text-rose-900/80 list-disc pl-5">
              {missingRequired.map((k) => (
                <li key={k}>{niceMissingLabel(k)}</li>
              ))}
            </ul>

            <div className="mt-3 text-[12px] text-rose-900/80">
              Dès que tu l’uploades, Billy peut recalculer proprement.
            </div>

            {/* Si tu as déjà un bouton ailleurs, supprime celui-ci */}
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
              onClick={() => {
                // TODO: brancher ton flow d'upload (router.push("/scan") ou ouvrir un modal)
              }}
            >
              Uploader la facture annuelle complète
            </button>
          </div>
        </div>
      )}

      {/* ── Section 1 : Cards comparaison ── */}
      <Section title="Base de comparaison" subtitle="Ce que BillyCheck utilise pour la simulation">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <MiniCard
            title="Prix énergie"
            value={energyUnitPrice != null ? `${fmtNumber(energyUnitPrice, 3)} €/kWh` : "Non détecté"}
            badge={energyBadge}
            tone="blue"
            subtitle={energySubtitle}
          />

          <MiniCard
            title="Abonnement"
            value={subscriptionValue}
            badge={subscriptionBadge}
            tone={subscriptionTone}
            subtitle={subscriptionHint}
          />

          <MiniCard
            title="Total payé"
            value={totalValue}
            badge="Annuel TTC"
            tone={totalTone}
            subtitle="Total facturé sur 12 mois"
          />
        </div>

        {/* Ligne consommation annuelle réelle sous les 3 cartes */}
        <div className="mt-4">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
                  Consommation annuelle réelle
                </div>
                <div className="text-[12px] text-slate-500 mt-0.5">
                  Utilisée pour simuler les offres concurrentes
                </div>
              </div>

              <div className="text-[16px] font-extrabold text-slate-900 text-right shrink-0">
                {consumptionAnnual != null ? `${fmtNumber(consumptionAnnual, 0)} kWh / an` : "Non détectée"}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 italic leading-relaxed">
          Les taxes et la TVA sont réglementées et identiques chez tous les fournisseurs. Elles sont incluses dans le total TTC.
        </p>
      </Section>

      {/* ── Section 2 : Infos facture ── */}
      <Section title="Données lues sur ta facture" subtitle="Informations extraites automatiquement">
        <div className="grid grid-cols-1 gap-2">
          <InfoLine icon="📅" label="Période analysée" value={bill.billing_period ?? "–"} />
          <InfoLine icon="⚡" label="Type de compteur" value={meterType ?? "–"} />
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
    <div className="px-6 py-5 border-t border-slate-200">
      <div className="mb-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {title}
        </div>
        {subtitle && <div className="text-[12px] text-slate-500 mt-0.5">{subtitle}</div>}
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
      ? "bg-blue-50 border border-blue-200"
      : tone === "green"
      ? "bg-emerald-50 border border-emerald-200"
      : tone === "amber"
      ? "bg-amber-50 border border-amber-300"
      : "bg-slate-50 border border-slate-300";

  const badgeToneClass =
    tone === "blue"
      ? "bg-blue-200 text-blue-900"
      : tone === "green"
      ? "bg-emerald-200 text-emerald-900"
      : tone === "amber"
      ? "bg-amber-200 text-amber-900"
      : "bg-slate-300 text-slate-800";

  return (
    <div className={`relative rounded-2xl ${toneClass} p-4 pt-6`}>
      {badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-[11px] px-3 py-1 rounded-full font-bold border shadow-sm ${badgeToneClass}`}
        >
          {badge}
        </span>
      )}

      <div className="text-xs font-semibold text-slate-950">{title}</div>

      <div className="mt-2 text-[18px] font-extrabold text-slate-900">{value}</div>

      {subtitle && <div className="mt-1 text-[12px] text-slate-500 leading-snug">{subtitle}</div>}
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 shadow-sm px-5 py-4 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-slate-600 text-lg">{icon}</span>
        <span className="text-[14px] font-medium text-slate-900/80">{label}</span>
      </div>

      <div className="text-[15px] font-bold text-slate-900 text-right shrink-0">{value}</div>
    </div>
  );
}
