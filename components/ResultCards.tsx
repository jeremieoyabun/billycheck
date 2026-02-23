"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Billy } from "./Billy";
import { ChatBubble } from "./ChatBubble";
import { EmailGate } from "./EmailGate";
import { TelecomResultCards, type TelecomResultJson } from "./TelecomResultCards";
import { ShareButton } from "./ShareButton";
import { track } from "@/lib/analytics";
import { getProviderLogo } from "@/lib/provider-logos";

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
export interface ExtractedBill {
  provider?: string | null;
  plan_name?: string | null;
  postal_code?: string | null;
  meter_type?: string | null;
  billing_period?: string | null;

  country?: string | null;

  // Nouveau modèle (annuel)
  energy_unit_price_eur_kwh?: number | null;
  consumption_kwh_annual?: number | null;
  subscription_annual_ht_eur?: number | null;
  total_annual_htva_eur?: number | null;
  total_annual_ttc_eur?: number | null;

  hp_unit_price_eur_kwh?: number | null;
  hc_unit_price_eur_kwh?: number | null;
  hp_consumption_kwh?: number | null;
  hc_consumption_kwh?: number | null;

  billing_period_start?: string | null;
  billing_period_end?: string | null;
  billing_period_days?: number | null;

  confidence?: "ok" | "partial" | "insufficient";
  missing_fields?: string[];
  needs_full_annual_invoice?: boolean;
  is_monthly_bill?: boolean;

  // Belgium-specific
  ean?: string | null;
  prosumer_detected?: boolean | null;
  prosumer_amount_eur?: number | null;
  prosumer_period_days?: number | null;
  prosumer_annual_eur?: number | null;
  inverter_kva?: number | null;
  bill_type?: "regularisation" | "acompte" | "intermediaire" | "unknown" | null;

  // Legacy fallback
  total_amount_eur?: number | null;
  consumption_kwh?: number | null;
  unit_price_eur_kwh?: number | null;
  fixed_fees_eur?: number | null;
  fixed_fees_monthly_eur?: number | null;
}

export interface Offer {
  provider: string;
  plan: string;
  estimated_savings: number;
  savings_percent: number;
  price_kwh: number;
  type: string;
  green?: boolean;
  url?: string;
  promo_bonus_eur?: number | null;
  // Belgium-specific breakdown
  total_tvac?: number;
  total_htva?: number;
  vat_amount?: number;
  assumptions?: string[];
}

export interface ResultJson {
  bill: ExtractedBill;
  offers: Offer[];
  engagement?: "yes" | "no" | "unknown";
  vertical?: "electricity" | "telecom";
}

/* ──────────── helpers ──────────── */
const fmt = (n: number | null | undefined) =>
  n != null
    ? n.toLocaleString("fr-BE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "–";

/* ──────────── OfferCard ──────────── */
function OfferCard({
  offer,
  rank,
  engagement,
  billAnnualTtc,
  unlocked = true,
}: {
  offer: Offer;
  rank: number;
  engagement?: string;
  billAnnualTtc?: number | null;
  unlocked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const medals = ["🥇", "🥈", "🥉"];
  const monthlySavings = Math.round(offer.estimated_savings / 12);
  const offerAnnual = offer.total_tvac ?? (billAnnualTtc != null ? billAnnualTtc - offer.estimated_savings : null);
  const barPct = billAnnualTtc && offerAnnual ? Math.round((offerAnnual / billAnnualTtc) * 100) : null;

  return (
    <div
      className={`bg-white rounded-2xl p-5 relative ${
        rank === 0
          ? "border-2 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.12)]"
          : "border border-slate-200 shadow-sm"
      }`}
    >
      {rank === 0 && (
        <span className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide">
          MEILLEURE ESTIMATION
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-2xl">{medals[rank] ?? "•"}</span>
        {(() => {
          const logo = getProviderLogo(offer.provider);
          return logo ? (
            <Image src={logo} alt={offer.provider} width={48} height={48} className={`rounded-md object-contain${unlocked ? "" : " blur-sm"}`} />
          ) : null;
        })()}
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base text-slate-900${unlocked ? "" : " blur-sm select-none"}`}>
            {unlocked ? offer.provider : "Fournisseur"}
          </div>
          <div className={`text-[13px] text-slate-500${unlocked ? "" : " blur-sm select-none"}`}>
            {unlocked ? offer.plan : "Offre"}
          </div>
        </div>
        {!unlocked && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">🔒</span>
        )}
      </div>

      {/* Savings — always visible */}
      <div className="bg-emerald-50 rounded-xl p-3 mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[28px] font-extrabold font-mono text-emerald-600">
            ~{offer.estimated_savings}€
          </span>
          <span className="text-sm text-slate-500">/an*</span>
        </div>
        {monthlySavings > 0 && (
          <div className="text-sm font-semibold text-emerald-700 mt-0.5">
            soit ~{monthlySavings}€/mois dans ta poche
          </div>
        )}
      </div>

      {/* Toggle details */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-3"
      >
        <span className={`inline-block transition-transform ${open ? "rotate-45" : ""}`}>+</span>
        {open ? "Masquer les détails" : "Voir les détails"}
      </button>

      {/* Collapsible details */}
      {open && (
        <div className="animate-fade-up space-y-3 mb-3">
          {/* Visual comparison bar */}
          {billAnnualTtc != null && offerAnnual != null && barPct != null && (
            <div className="rounded-xl bg-slate-50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 w-14 shrink-0">Actuel</span>
                <div className="flex-1 h-4 bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full animate-bar-fill" style={{ width: "100%" }} />
                </div>
                <span className="text-[11px] font-mono text-red-500 w-16 text-right">{fmt(billAnnualTtc)}€</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 w-14 shrink-0 font-semibold">Offre</span>
                <div className="flex-1 h-4 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-bar-fill" style={{ width: `${barPct}%`, animationDelay: "0.3s" }} />
                </div>
                <span className="text-[11px] font-mono text-emerald-600 w-16 text-right font-bold">{fmt(offerAnnual)}€</span>
              </div>
              <div className="text-center text-[11px] text-slate-400">estimation annuelle TTC</div>
            </div>
          )}

          {/* Savings % */}
          <div className="h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(offer.savings_percent, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">~{offer.savings_percent}% de moins</div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">~{offer.price_kwh}€/kWh HTVA</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">{offer.type}</span>
            {offer.green && <span className="bg-emerald-50 px-2 py-0.5 rounded-md">🌱 Vert</span>}
            {offer.promo_bonus_eur != null && offer.promo_bonus_eur < 0 && (
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">
                Promo {offer.promo_bonus_eur}€
              </span>
            )}
          </div>

          {/* Engagement warnings */}
          {engagement === "yes" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 leading-relaxed">
              ⚠️ Tu as indiqué être engagé(e). Vérifie la date de fin de ton contrat et les éventuels
              frais de résiliation avant de changer.
            </div>
          )}
          {engagement === "unknown" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800 leading-relaxed">
              ℹ️ Vérifie tes conditions d'engagement avant de souscrire.
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <a
        href={unlocked ? (offer.url ?? "#") : undefined}
        target={unlocked ? "_blank" : undefined}
        rel={unlocked ? "noopener noreferrer" : undefined}
        onClick={(e) => {
          if (!unlocked) {
            e.preventDefault();
            document.getElementById("email-gate")?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
          track("offer_clicked", { provider: offer.provider, vertical: "electricity", rank });
        }}
        className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
          !unlocked
            ? "bg-slate-100 text-slate-400 cursor-pointer hover:bg-slate-200"
            : rank === 0
              ? "bg-emerald-500 text-white hover:bg-emerald-600 animate-cta-glow"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        {!unlocked ? "🔒 Débloque pour voir l'offre" : rank === 0 ? "Économise maintenant →" : "Voir cette offre →"}
      </a>
    </div>
  );
}

/* ──────────── Main ResultCards ──────────── */
interface ResultCardsProps {
  data: ResultJson;
  scanId?: string;
  initialUnlocked?: boolean;
}

export function ResultCards({ data, scanId, initialUnlocked = false }: ResultCardsProps) {
  const [unlocked, setUnlocked] = useState(initialUnlocked);

  // ── Route to telecom renderer if vertical = telecom ──
  if (data.vertical === "telecom") {
    return <TelecomResultCards data={data as unknown as TelecomResultJson} scanId={scanId} unlocked={unlocked} onUnlocked={() => setUnlocked(true)} />;
  }

  const { bill, offers, engagement } = data;
  const hasOffers = offers && offers.length > 0;

  return (
    <div className="animate-fade-up space-y-5">
      {/* Billy reaction */}
      <div className="text-center">
        <Billy expression="success" size={110} />
      </div>

      {/* Billy chat */}
      <div className="flex flex-col gap-2.5">
        {bill.is_monthly_bill ? (
          <>
            <ChatBubble>
              <strong>Oups, c'est une facture mensuelle !</strong> 📄
            </ChatBubble>
            <ChatBubble delay={300}>
              Ta facture ne couvre que{" "}
              <strong>{bill.billing_period_days ?? "quelques"} jours</strong>
              {bill.billing_period ? ` (${bill.billing_period})` : ""}.
              Pour comparer les offres, j'ai besoin d'une <strong>facture annuelle de régularisation</strong> (sur 12 mois)
              avec le détail des coûts sur l'année complète.
            </ChatBubble>
          </>
        ) : bill.bill_type === "acompte" ? (
          <>
            <ChatBubble>
              <strong>Ceci est une facture d'acompte (avance).</strong> 📄
            </ChatBubble>
            <ChatBubble delay={300}>
              Un acompte est un montant forfaitaire payé chaque mois — il ne reflète pas
              ta consommation réelle. Pour comparer les offres, j'ai besoin de ta{" "}
              <strong>facture de régularisation annuelle</strong> (décompte annuel / afrekening)
              qui contient le détail de ta consommation et des coûts réels.
            </ChatBubble>
          </>
        ) : bill.needs_full_annual_invoice ? (
          <>
            <ChatBubble>
              <strong>Il me manque ta facture annuelle complète.</strong> 📄
            </ChatBubble>
            <ChatBubble delay={300}>
              Pour comparer précisément, j'ai besoin des 4 données annuelles: prix du kWh réellement
              payé, consommation annuelle, abonnement annuel HT, total annuel TTC. Upload une facture
              de régularisation sur 12 mois (avec le détail des coûts).
            </ChatBubble>
          </>
        ) : hasOffers ? (
          <>
            <ChatBubble>
              <strong>J'ai trouvé des offres potentiellement intéressantes !</strong> 👀
            </ChatBubble>
            <ChatBubble delay={300}>
              D'après les données de ta facture, tu pourrais peut-être payer moins cher. Voici ce
              que j'ai repéré, à toi de voir si ça te convient.
            </ChatBubble>
          </>
        ) : (
          <>
            <ChatBubble>
              <strong>Bonne nouvelle ! 👍</strong>
            </ChatBubble>
            <ChatBubble delay={300}>
              D'après ma comparaison, ton contrat semble déjà compétitif. Aucune offre ne paraît
              significativement moins chère pour ton profil en ce moment. Reviens dans quelques
              mois, les offres changent souvent.
            </ChatBubble>
          </>
        )}
      </div>

      {/* Current bill card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
          Ta facture actuelle
        </div>

        {/* ✅ LE GRID EST ICI */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Fournisseur" value={bill.provider ?? "Non détecté"} />
          <Field label="Offre détectée" value={bill.plan_name ?? "Non détectée"} />

          <Field
            label="Total annuel TTC payé"
            value={bill.total_annual_ttc_eur != null ? `${fmt(bill.total_annual_ttc_eur)}€` : "Non détecté"}
            mono
          />

          <Field
            label="Consommation annuelle réelle"
            value={
              bill.consumption_kwh_annual != null
                ? `${fmt(bill.consumption_kwh_annual)} kWh/an`
                : "Non détectée"
            }
            mono
          />

          <Field
            label="Prix énergie fournisseur (HTVA)"
            value={
              bill.energy_unit_price_eur_kwh != null
                ? `${bill.energy_unit_price_eur_kwh.toLocaleString("fr-BE", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })} €/kWh`
                : "Non détecté"
            }
          />

          <Field
            label="Prix fixe mensuel (annualisé)"
            value={
              bill.subscription_annual_ht_eur != null
                ? `${fmt(bill.subscription_annual_ht_eur)}€`
                : "Non detecté"
            }
            mono
          />
        </div>

        <p className="mt-3 text-[11px] text-slate-500 italic leading-relaxed">
          La TVA et une partie des taxes sont réglementées, et Billy estime le réseau selon ta région/GRD.
        </p>

        {/* Prosumer note */}
        {bill.prosumer_detected && (
          <p className="mt-2 text-[11px] text-slate-500 italic">
            ☀️ Prosumer détecté
            {bill.prosumer_annual_eur != null && bill.prosumer_annual_eur > 0
              ? ` — redevance estimée ${fmt(bill.prosumer_annual_eur)} €/an (identique chez tous les fournisseurs)`
              : " — montant redevance non détecté sur la facture"}
          </p>
        )}

        {/* Loss aversion */}
        {hasOffers && !bill.needs_full_annual_invoice && offers[0]?.estimated_savings > 0 && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-bold">
              💸 En restant chez {bill.provider ?? "ton fournisseur"}, tu perds ~{offers[0].estimated_savings}€ par an.
            </p>
          </div>
        )}

        {bill.needs_full_annual_invoice && (
          <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-800 leading-relaxed">
            ⚠️ Facture annuelle requise. Il manque des infos indispensables pour comparer
            précisément. Upload une facture annuelle complète (idéalement une régularisation sur 12
            mois avec le détail des coûts).
          </div>
        )}

        {bill.billing_period && (
          <p className="mt-2 text-[11px] text-slate-400">
            📅 Période : {bill.billing_period}
          </p>
        )}

      </div>
      <p className="text-[11px] text-slate-400 italic">
        * Données extraites automatiquement — vérifie qu'elles correspondent à ta situation.
      </p>

      {/* Email gate — above offers when locked */}
      {!unlocked && scanId && hasOffers && !bill.needs_full_annual_invoice && (
        <EmailGate scanId={scanId} onUnlocked={() => setUnlocked(true)} />
      )}

      {/* Referral share — only when unlocked */}
      {unlocked && <ShareButton />}

      {/* Offers */}
      {hasOffers && !bill.needs_full_annual_invoice && (
        <>
          <div>
            <div className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">
              Offres potentiellement plus avantageuses
            </div>
            <div className="text-[12px] text-slate-400 mt-0.5">
              Pas 50 offres incompréhensibles, juste les meilleures pour toi.
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {offers.map((o, i) => (
              <OfferCard key={i} offer={o} rank={i} engagement={engagement} billAnnualTtc={bill.total_annual_ttc_eur} unlocked={unlocked} />
            ))}
          </div>
        </>
      )}

      {/* Cross-sell: Telecom — only when unlocked */}
      {unlocked && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📱</span>
            <div className="font-bold text-sm text-blue-900">Verifiez aussi votre telecom</div>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed mb-3">
            Nos utilisateurs economisent en moyenne 120 €/an en changeant de forfait telecom.
            Analysez votre facture telecom gratuitement.
          </p>
          <Link
            href="/scan?v=telecom"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors text-center"
          >
            📱 Analyser ma facture telecom
          </Link>
        </div>
      )}

      {/* Legal disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed space-y-1.5">
        <div className="font-semibold text-slate-600">* Informations importantes</div>
        <p>
          Les estimations d'economies sont calculees sur la base des données extraites de ta facture
          et des tarifs publics des fournisseurs au moment de l'analyse. Elles sont indicatives et
          peuvent varier.
        </p>
        <p>
          BillyCheck ne fournit pas de conseil financier ou juridique. Avant tout changement,
          verifie les conditions de ton contrat actuel.
        </p>
        <p>
          BillyCheck peut percevoir une commission du fournisseur si tu souscris via nos liens.
          Cela ne modifie pas le prix de l'offre pour toi.
        </p>
      </div>
    </div>
  );
}

/* small helper */
function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-bold text-[15px] ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
