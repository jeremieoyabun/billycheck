"use client";

import { Billy } from "./Billy";
import { ChatBubble } from "./ChatBubble";

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
}

export interface ResultJson {
  bill: ExtractedBill;
  offers: Offer[];
  engagement?: "yes" | "no" | "unknown";
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
}: {
  offer: Offer;
  rank: number;
  engagement?: string;
}) {
  const medals = ["🥇", "🥈", "🥉"];
  const clr =
    offer.estimated_savings > 200
      ? "text-emerald-600"
      : offer.estimated_savings > 100
      ? "text-emerald-500"
      : "text-slate-500";

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

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-2xl">{medals[rank] ?? "•"}</span>
        <div>
          <div className="font-bold text-base text-slate-900">{offer.provider}</div>
          <div className="text-[13px] text-slate-500">{offer.plan}</div>
        </div>
      </div>

      {/* Savings */}
      <div className="bg-emerald-50 rounded-xl p-3 mb-3">
        <div className="text-[13px] text-slate-500 mb-0.5">Économie potentielle estimée</div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-[28px] font-extrabold font-mono ${clr}`}>
            ~{offer.estimated_savings}€
          </span>
          <span className="text-sm text-slate-500">/an*</span>
        </div>
        <div className="mt-1.5 h-1.5 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${Math.min(offer.savings_percent, 100)}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          soit environ ~{offer.savings_percent}% de moins
        </div>
      </div>

      {/* Engagement warnings */}
      {engagement === "yes" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mb-3 leading-relaxed">
          ⚠️ Tu as indiqué être engagé(e). Vérifie la date de fin de ton contrat et les éventuels
          frais de résiliation avant de changer.
        </div>
      )}
      {engagement === "unknown" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800 mb-3 leading-relaxed">
          ℹ️ Vérifie tes conditions d'engagement avant de souscrire. Cette information figure
          généralement sur ta facture ou ton espace client.
        </div>
      )}

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap text-xs text-slate-500 mb-3.5">
        <span className="bg-slate-100 px-2 py-0.5 rounded-md">~{offer.price_kwh}€/kWh</span>
        <span className="bg-slate-100 px-2 py-0.5 rounded-md">{offer.type}</span>
        {offer.green && <span className="bg-emerald-50 px-2 py-0.5 rounded-md">🌱 Vert</span>}
      </div>

      {/* CTA */}
      <a
        href={offer.url ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
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

/* ──────────── Main ResultCards ──────────── */
interface ResultCardsProps {
  data: ResultJson;
}

export function ResultCards({ data }: ResultCardsProps) {
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
            label="Prix énergie (moyen)"
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
            label="Abonnement annuel HT"
            value={
              bill.subscription_annual_ht_eur != null
                ? `${fmt(bill.subscription_annual_ht_eur)}€`
                : "Non détecté"
            }
            mono
          />
        </div>

        <p className="mt-3 text-[11px] text-slate-500 italic leading-relaxed">
  Les taxes et la TVA sont réglementées et identiques pour toutes les offres.
  Elles sont incluses dans le total TTC.
</p>
        {/* ✅ “SOUS LE </div> DU GRID” = JUSTE ICI */}

        {bill.needs_full_annual_invoice && (
          <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-800 leading-relaxed">
            ⚠️ Facture annuelle requise. Il manque des infos indispensables pour comparer
            précisément. Upload une facture annuelle complète (idéalement une régularisation sur 12
            mois avec le détail des coûts).
          </div>
        )}

        {bill.billing_period && (
          <div className="mt-2 text-xs text-slate-400">
            📅 Période analysée : <span className="text-slate-600">{bill.billing_period}</span>
          </div>
        )}

        {!bill.needs_full_annual_invoice && (
          <div className="mt-3 bg-amber-50 rounded-lg px-3 py-2 text-xs text-amber-800 leading-relaxed">
            ℹ️ Ces données ont été extraites automatiquement. Vérifie qu'elles correspondent bien à
            ta situation.
          </div>
        )}
      </div>

      {/* Offers */}
      {hasOffers && !bill.needs_full_annual_invoice && (
        <>
          <div className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">
            Offres potentiellement plus avantageuses
          </div>
          <div className="flex flex-col gap-3.5">
            {offers.map((o, i) => (
              <OfferCard key={i} offer={o} rank={i} engagement={engagement} />
            ))}
          </div>
        </>
      )}

      {/* Legal disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed space-y-1.5">
        <div className="font-semibold text-slate-600">* Informations importantes</div>
        <p>
          Les estimations d'économies sont calculées sur la base des données extraites de ta facture
          et des tarifs publics des fournisseurs au moment de l'analyse. Elles sont indicatives et
          peuvent varier.
        </p>
        <p>
          BillyCheck ne fournit pas de conseil financier ou juridique. Avant tout changement,
          vérifie les conditions de ton contrat actuel.
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
