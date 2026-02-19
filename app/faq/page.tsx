"use client";

import { useState } from "react";
import Link from "next/link";
import { Billy } from "@/components/Billy";

const FAQS = [
  {
    category: "Utilisation",
    items: [
      {
        q: "C'est vraiment gratuit ?",
        a: "Oui. Les 2 premières analyses sont offertes, sans inscription ni carte bancaire. À partir du 3e scan, chaque analyse supplémentaire est facturée 4,99\u00a0€, sans abonnement ni engagement.",
      },
      {
        q: "Combien puis-je économiser avec Billy ?",
        a: "Les économies dépendent du contrat actuel, de la consommation et des offres disponibles. Certaines personnes ne trouvent aucune différence, d'autres peuvent réduire leur facture annuelle de plusieurs dizaines voire centaines d'euros. Billy fournit une estimation basée sur les données de la facture et les tarifs publics, sans garantie de montant exact.",
      },
      {
        q: "Quels types de factures sont acceptes ?",
        a: "Billy accepte les factures d'electricite et de telecom au format PDF, photo (JPG, PNG, WebP) ou capture d'ecran. Pour l'electricite, privilegiez une facture annuelle de regularisation (couvrant 12 mois). Pour le telecom, n'importe quelle facture mensuelle convient.",
      },
      {
        q: "Billy fonctionne pour la Belgique uniquement ?",
        a: "BillyCheck est concu pour la Belgique francophone. Les offres proposees sont celles des fournisseurs belges. La comparaison telecom couvre Proximus, Orange, VOO, Scarlet, Telenet et autres operateurs belges.",
      },
      {
        q: "Pourquoi Billy me demande une facture annuelle ?",
        a: "Les factures mensuelles ne contiennent souvent que des acomptes provisionnels. Pour comparer de manière fiable avec les offres du marché, Billy a besoin d'une facture de régularisation annuelle qui reflète votre consommation réelle sur 12 mois.",
      },
      {
        q: "Un scan est-il décompté si le document est invalide ?",
        a: "Oui. Chaque analyse lancée est comptabilisée, même si le document transmis ne permet pas une extraction complète. Cela permet d'éviter les abus et de maintenir le service accessible à tous.",
      },
    ],
  },
  {
    category: "Sécurité & données",
    items: [
      {
        q: "Qu'est-ce que Billy fait de ma facture ?",
        a: "Billy analyse la facture pour en extraire uniquement les données utiles à la comparaison (prix du kWh, consommation, abonnement). La facture est supprimée immédiatement après analyse. Aucune donnée personnelle comme le nom ou l'adresse n'est conservée.",
      },
      {
        q: "Mes données sont-elles protégées ?",
        a: "Oui. Les factures sont supprimées immédiatement après analyse. BillyCheck respecte le RGPD. Aucune donnée personnelle inutile n'est conservée et une demande de suppression peut être effectuée à tout moment via contact@billycheck.com.",
      },
      {
        q: "Le paiement est-il sécurisé ?",
        a: "Oui. Les paiements sont gérés par Stripe, leader mondial du paiement en ligne. BillyCheck n'a jamais accès à vos données bancaires. Toutes les transactions sont chiffrées et sécurisées.",
      },
    ],
  },
  {
    category: "Résultats & offres",
    items: [
      {
        q: "Les résultats sont-ils fiables ?",
        a: "Les estimations sont calculées à partir des données extraites de la facture et des grilles tarifaires publiques des fournisseurs. Il s'agit d'indications comparatives. Le montant réel peut varier selon les conditions contractuelles et l'évolution des tarifs.",
      },
      {
        q: "C'est compliqué de changer de fournisseur ?",
        a: "En général, le nouveau fournisseur prend en charge la majorité des démarches. Il n'y a pas de coupure d'électricité. Il est recommandé de vérifier d'éventuels frais de résiliation ou périodes d'engagement en cours.",
      },
      {
        q: "Comment Billy gagne de l'argent ?",
        a: "Billy génère des revenus de deux façons : les scans payants (4,99\u00a0€ à partir du 3e scan) et les commissions d'affiliation. Si un changement de fournisseur est effectué via un lien partenaire, le fournisseur peut verser une commission à Billy. Cela ne modifie pas le prix de l'offre pour le client. Le tarif est identique à celui proposé directement par le fournisseur.",
      },
      {
        q: "Et si aucune offre moins chere n'est trouvee ?",
        a: "C'est possible, et c'est une bonne nouvelle ! Cela signifie que votre contrat actuel est deja competitif. Billy vous le dit honnetement. Les offres du marche evoluent regulierement, n'hesitez pas a reverifier dans quelques mois.",
      },
    ],
  },
  {
    category: "Telecom",
    items: [
      {
        q: "Quels operateurs telecom sont couverts ?",
        a: "Billy couvre les principaux operateurs belges francophones : Proximus, Orange, VOO, Scarlet, Telenet, EDPnet et d'autres. Que ce soit pour un forfait internet, mobile ou un pack tout-en-un (bundle), Billy peut analyser votre facture et comparer avec les offres du marche.",
      },
      {
        q: "Dois-je fournir ma vitesse internet ou mon volume data ?",
        a: "Non. Billy extrait automatiquement ces informations depuis votre facture, si elles y figurent. Le debit internet (ex: 500 Mbps) ou le volume de data mobile (ex: 20 Go) sont lus directement pour proposer des offres comparables.",
      },
      {
        q: "Puis-je analyser un pack internet + TV + mobile ?",
        a: "Oui. Billy reconnait les offres bundles (triple play, quadruple play) et compare avec des offres equivalentes incluant les memes services. Le prix mensuel total est utilise comme base de comparaison.",
      },
      {
        q: "C'est complique de changer d'operateur telecom ?",
        a: "En general, le changement d'operateur telecom se fait sans interruption de service. Il est cependant recommande de verifier la duree d'engagement restante et les frais de resiliation eventuels avant de changer.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-left text-[15px] font-semibold text-slate-900"
      >
        {q}
        <span
          className={`text-slate-400 text-lg ml-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 leading-relaxed animate-fade-up">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <main className="min-h-[70vh] bg-background">
      {/* Hero */}
      <section className="px-5 pt-14 pb-8 bg-gradient-to-b from-blue-50 to-background text-center">
        <div className="inline-block mb-3">
          <Billy expression="normal" size={90} />
        </div>
        <h1 className="font-display font-black text-[clamp(28px,5vw,40px)]">
          Questions fréquentes
        </h1>
        <p className="mt-2 text-slate-500 text-[15px] max-w-md mx-auto">
          Tout ce que tu veux savoir sur Billy et le fonctionnement de BillyCheck.
        </p>
      </section>

      {/* FAQ sections */}
      <section className="px-5 pb-12 max-w-2xl mx-auto space-y-8">
        {FAQS.map((section) => (
          <div key={section.category}>
            <h2 className="font-display font-bold text-lg text-slate-800 mb-3">
              {section.category}
            </h2>
            <div className="bg-white rounded-2xl border border-slate-200 px-5">
              {section.items.map((f, i) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="px-5 pb-16 text-center">
        <p className="text-slate-500 text-[15px] mb-4">
          {"Tu n'as pas trouvé ta réponse ?"}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="mailto:contact@billycheck.com"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-base font-display font-bold hover:bg-slate-50 transition"
          >
            ✉️ Nous contacter
          </a>
          <Link
            href="/scan"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-billy-blue text-white rounded-2xl text-base font-display font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
          >
            🔍 Checker ma facture
          </Link>
        </div>
      </section>
    </main>
  );
}
