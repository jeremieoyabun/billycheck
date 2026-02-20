"use client";

import Link from "next/link";
import { Billy } from "./Billy";
import { ChatBubble } from "./ChatBubble";
import { ShareButton } from "./ShareButton";
import { track } from "@/lib/analytics";
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

/* ──────────────────────────────────────────────
   Offer card
   ────────────────────────────────────────────── */
function TelecomOfferCard({ offer, rank }: { offer: TelecomOffer; rank: number }) {
  const medals = ["🥇", "🥈", "🥉"];
  const clr =
    offer.estimated_annual_savings > 200 ? "text-emerald-600"
    : offer.estimated_annual_savings > 100 ? "text-emerald-500"
    : "text-slate-500";

  const includedItems = [
    offer.includes_internet && "Internet",
    offer.includes_tv       && "TV",
    offer.includes_mobile   && "Mobile",
  ].filter(Boolean) as string[];

  return (
    <div
      className={`bg-white rounded-2xl p-5 relative transition-transform ${
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

      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-2xl">{medals[rank] ?? "•"}</span>
        <div>
          <div className="font-bold text-base text-slate-900">{offer.provider}</div>
          <div className="text-[13px] text-slate-500">{offer.plan}</div>
        </div>
      </div>

      {/* Savings */}
      <div className="bg-emerald-50 rounded-xl p-3 mb-3">
        <div className="text-[13px] text-slate-500 mb-0.5">Economie potentielle estimee</div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[28px] font-extrabold font-mono ${clr}`}>
            ~{offer.estimated_annual_savings}€
          </span>
          <span className="text-sm text-slate-500">/an*</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex gap-1.5 flex-wrap text-xs text-slate-500 mb-3.5">
        <span className="bg-slate-100 px-2 py-0.5 rounded-md">
          {fmt(offer.monthly_price_eur)}&nbsp;€/mois
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

      <a
        href={offer.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("offer_clicked", { provider: offer.provider, vertical: "telecom", rank })}
        className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${
          rank === 0
            ? "bg-emerald-500 text-white hover:bg-emerald-600"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
        }`}
      >
        Voir cette offre →
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
}

export function TelecomResultCards({ data }: TelecomResultCardsProps) {
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
              <strong>J'ai trouve des forfaits potentiellement plus avantageux !</strong> 📱
            </ChatBubble>
            <ChatBubble delay={300}>
              D'apres ta facture telecom, tu paies actuellement{" "}
              <strong>{fmt(telecom.monthly_price_ttc_eur)}&nbsp;€/mois</strong>.
              Voici ce que j'ai repere.
            </ChatBubble>
          </>
        ) : (
          <>
            <ChatBubble>
              <strong>Bonne nouvelle ! 👍</strong>
            </ChatBubble>
            <ChatBubble delay={300}>
              Ton forfait telecom semble deja competitif par rapport aux offres actuelles.
              Reviens dans quelques mois, les offres evoluent souvent.
            </ChatBubble>
          </>
        )}
      </div>

      {/* Current plan card */}
      {!isInsufficient && (
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
            <Field
              label="Debit internet"
              value={telecom.download_speed_mbps != null
                ? `${telecom.download_speed_mbps} Mbps`
                : "-"}
            />
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

          <div className="mt-3 bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-800 leading-relaxed">
            Ces données ont ete extraites automatiquement. Verifie qu'elles correspondent a ta situation.
          </div>
        </div>
      )}

      {/* Offers */}
      {hasOffers && !isInsufficient && (
        <>
          <div className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">
            Offres potentiellement plus avantageuses
          </div>
          <div className="flex flex-col gap-3.5">
            {offers.map((o, i) => (
              <TelecomOfferCard key={i} offer={o} rank={i} />
            ))}
          </div>
        </>
      )}

      {/* Referral share */}
      <ShareButton />

      {/* Cross-sell: electricity */}
      <ElectricityCrossSell />

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
