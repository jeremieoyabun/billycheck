"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Billy } from "./Billy";
import { ChatBubble } from "./ChatBubble";
import { EmailGate } from "./EmailGate";
import { ShareButton } from "./ShareButton";
import { track } from "@/lib/analytics";
import { getProviderLogo } from "@/lib/provider-logos";
import type { ExtractedTelecomBill, TelecomOffer } from "@/lib/analyze-telecom";

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */
export interface TelecomResultJson {
  telecom: ExtractedTelecomBill;
  offers: TelecomOffer[];
  vertical: "telecom";
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const fmt = (n: number | null | undefined, dec = 2) =>
  n != null
    ? n.toLocaleString("fr-BE", { minimumFractionDigits: dec, maximumFractionDigits: dec })
    : "-";

const planTypeLabel = (t: string | null | undefined) => {
  switch (t) {
    case "mobile":   return "mobile";
    case "internet": return "internet";
    case "tv":       return "TV";
    case "bundle":   return "pack";
    default:         return "telecom";
  }
};

/* ──────────────────────────────────────────────
   Offer card
   ────────────────────────────────────────────── */
function TelecomOfferCard({ offer, rank, mobileLines, billMonthly, unlocked = true, scanId }: { offer: TelecomOffer; rank: number; mobileLines: number; billMonthly?: number | null; unlocked?: boolean; scanId?: string }) {
  const [open, setOpen] = useState(false);
  const medals = ["🥇", "🥈", "🥉"];
  const monthlySavings = Math.round(offer.estimated_annual_savings / 12);
  const offerMonthlyTotal = offer.monthly_price_eur * mobileLines;
  const barPct = billMonthly && billMonthly > 0 ? Math.round((offerMonthlyTotal / billMonthly) * 100) : null;

  const includedItems = [
    offer.includes_internet && "Internet",
    offer.includes_tv       && "TV",
    offer.includes_mobile   && "Mobile",
  ].filter(Boolean) as string[];

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
            ~{offer.estimated_annual_savings}€
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
          {billMonthly != null && barPct != null && (
            <div className="rounded-xl bg-slate-50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 w-14 shrink-0">Actuel</span>
                <div className="flex-1 h-4 bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full animate-bar-fill" style={{ width: "100%" }} />
                </div>
                <span className="text-[11px] font-mono text-red-500 w-16 text-right">{fmt(billMonthly)}€</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-600 w-14 shrink-0 font-semibold">Offre</span>
                <div className="flex-1 h-4 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full animate-bar-fill" style={{ width: `${barPct}%`, animationDelay: "0.3s" }} />
                </div>
                <span className="text-[11px] font-mono text-emerald-600 w-16 text-right font-bold">{fmt(offerMonthlyTotal)}€</span>
              </div>
              <div className="text-center text-[11px] text-slate-400">par mois TTC</div>
            </div>
          )}

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap text-xs text-slate-500">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md">
              {fmt(offer.monthly_price_eur)}&nbsp;€/mois{mobileLines > 1 ? ` × ${mobileLines} lignes` : ""}
            </span>
            {offer.data_gb != null && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">{offer.data_gb}&nbsp;GB</span>
            )}
            {offer.download_speed_mbps && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-md">{offer.download_speed_mbps}&nbsp;Mbps</span>
            )}
            {includedItems.map((it) => (
              <span key={it} className="bg-blue-50 px-2 py-0.5 rounded-md text-blue-700">{it}</span>
            ))}
            {offer.promo_bonus_eur != null && offer.promo_bonus_eur < 0 && (
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium">
                Promo {offer.promo_bonus_eur}€
              </span>
            )}
          </div>
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
          track("offer_clicked", { provider: offer.provider, vertical: "telecom", rank });
          if (scanId) {
            fetch(`/api/scans/${scanId}/track-click`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: offer.provider,
                plan: offer.plan,
                vertical: "telecom",
                rank,
                savings: offer.estimated_annual_savings,
              }),
            }).catch(() => {});
          }
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

/* ──────────────────────────────────────────────
   Cross-sell electricity block
   ────────────────────────────────────────────── */
function ElectricityCrossSell() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">⚡</span>
        <div className="font-bold text-sm text-amber-900">Verifiez aussi votre electricite</div>
      </div>
      <p className="text-xs text-amber-800 leading-relaxed mb-3">
        Nos utilisateurs economisent en moyenne 180€/an en changeant de fournisseur d'electricite.
        Analysez votre facture d'electricite gratuitement.
      </p>
      <Link
        href="/scan?v=electricity"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors text-center"
      >
        <span className="shrink-0">⚡</span>
  <span className="text-center">Analyser ma facture d'électricité</span>
      </Link>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main TelecomResultCards
   ────────────────────────────────────────────── */
interface TelecomResultCardsProps {
  data: TelecomResultJson;
  scanId?: string;
  unlocked?: boolean;
  onUnlocked?: () => void;
}

export function TelecomResultCards({ data, scanId, unlocked = false, onUnlocked }: TelecomResultCardsProps) {
  const { telecom, offers } = data;
  const hasOffers = offers && offers.length > 0;
  const isInsufficient = telecom.confidence === "insufficient";

  return (
    <div className="animate-fade-up space-y-5">
      {/* Billy reaction */}
      <div className="text-center">
        <Billy expression={isInsufficient ? "normal" : "success"} size={110} />
      </div>

      {/* Billy chat */}
      <div className="flex flex-col gap-2.5">
        {isInsufficient ? (
          <>
            <ChatBubble>
              <strong>J'ai besoin de plus d'infos.</strong> 📄
            </ChatBubble>
            <ChatBubble delay={300}>
              Je n'ai pas pu detecter le prix mensuel de ton forfait.
              Essaie avec une facture plus lisible ou complete.
            </ChatBubble>
          </>
        ) : hasOffers ? (
          <>
            <ChatBubble>
              <strong>J'ai trouve des offres {planTypeLabel(telecom.plan_type)} potentiellement plus avantageuses !</strong>{" "}
              {telecom.plan_type === "mobile" ? "📱" : telecom.plan_type === "internet" ? "🌐" : "📦"}
            </ChatBubble>
            <ChatBubble delay={300}>
              D'apres ta facture, tu paies actuellement{" "}
              <strong>{fmt(telecom.monthly_price_ttc_eur)}&nbsp;€/mois</strong>{" "}
              pour ton forfait {planTypeLabel(telecom.plan_type)}.
              Voici ce que j'ai repere.
            </ChatBubble>
          </>
        ) : (
          <>
            <ChatBubble>
              <strong>Bonne nouvelle ! 👍</strong>
            </ChatBubble>
            <ChatBubble delay={300}>
              Ton forfait {planTypeLabel(telecom.plan_type)} semble deja competitif
              par rapport aux offres {planTypeLabel(telecom.plan_type)} actuelles.
              Reviens dans quelques mois, les offres evoluent souvent.
            </ChatBubble>
          </>
        )}
      </div>

      {/* Current plan card */}
      {!isInsufficient && (
        <>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider mb-3">
            Ton forfait actuel
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Operateur" value={telecom.provider ?? "Non detecte"} />
            <Field label="Forfait" value={telecom.plan_name ?? "Non detecte"} />
            <Field
              label="Prix du forfait mensuel"
              value={telecom.monthly_price_ttc_eur != null
                ? `${fmt(telecom.monthly_price_ttc_eur)} €/mois`
                : "Non detecte"}
              mono
            />
            {telecom.plan_type === "mobile" ? (
              <Field
                label="Data mobile"
                value={telecom.mobile_data_gb != null && telecom.mobile_data_gb > 0
                  ? `${telecom.mobile_data_gb} GB`
                  : "-"}
              />
            ) : (
              <Field
                label="Debit internet"
                value={telecom.download_speed_mbps != null && telecom.download_speed_mbps > 0
                  ? `${telecom.download_speed_mbps} Mbps`
                  : "-"}
              />
            )}
            {telecom.mobile_lines != null && telecom.mobile_lines > 1 && (
              <Field label="Lignes mobiles" value={`${telecom.mobile_lines} lignes`} />
            )}
          </div>

          {/* Included services */}
          <div className="mt-3 flex gap-1.5 flex-wrap">
            {telecom.includes_internet && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Internet
              </span>
            )}
            {telecom.includes_tv && (
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                TV
              </span>
            )}
            {telecom.includes_mobile && (
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Mobile
              </span>
            )}
          </div>

          {/* Loss aversion */}
          {hasOffers && offers[0]?.estimated_annual_savings > 0 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-700 font-bold">
                💸 En restant chez {telecom.provider ?? "ton opérateur"}, tu perds ~{offers[0].estimated_annual_savings}€ par an.
              </p>
            </div>
          )}
        </div>
        <p className="text-[11px] text-slate-400 italic">
          * Données extraites automatiquement — vérifie qu'elles correspondent à ta situation.
        </p>
        </>
      )}

      {/* Email gate — above offers when locked */}
      {!unlocked && scanId && onUnlocked && hasOffers && !isInsufficient && (
        <EmailGate scanId={scanId} onUnlocked={onUnlocked} />
      )}

      {/* Referral share — only when unlocked */}
      {unlocked && <ShareButton />}

      {/* Offers */}
      {hasOffers && !isInsufficient && (
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
              <TelecomOfferCard key={i} offer={o} rank={i} mobileLines={telecom.mobile_lines != null && telecom.mobile_lines > 1 ? telecom.mobile_lines : 1} billMonthly={telecom.monthly_price_ttc_eur} unlocked={unlocked} scanId={scanId} />
            ))}
          </div>
        </>
      )}

      {/* Cross-sell: electricity — only when unlocked */}
      {unlocked && <ElectricityCrossSell />}

      {/* Legal disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed space-y-1.5">
        <div className="font-semibold text-slate-600">* Informations importantes</div>
        <p>
          Les estimations d'economies sont indicatives, basees sur les tarifs publics au moment de l'analyse.
          Les conditions reelles peuvent varier.
        </p>
        <p>
          BillyCheck ne fournit pas de conseil contractuel. Verifie les conditions de ton contrat actuel
          (engagement, frais de resiliation) avant tout changement.
        </p>
        <p>
          BillyCheck peut percevoir une commission du fournisseur si tu souscris via nos liens.
          Cela ne modifie pas le prix de l'offre pour toi.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-bold text-[15px] ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
