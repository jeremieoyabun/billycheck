"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "C'est vraiment gratuit ?",
    a: "Oui. Les 2 premières analyses sont offertes, sans inscription ni carte bancaire. À partir du 3e scan, chaque analyse supplémentaire est facturée 4,99\u00a0€, sans abonnement ni engagement.",
  },
  {
    q: "Qu'est-ce que Billy fait de ma facture ?",
    a: "Billy analyse la facture pour en extraire uniquement les données utiles à la comparaison (prix du kWh, consommation, abonnement). La facture est supprimée immédiatement après analyse. Aucune donnée personnelle comme le nom ou l’adresse n’est conservée.",
  },
  {
    q: "Combien puis-je économiser avec Billy ?",
    a: "Les économies dépendent du contrat actuel, de la consommation et des offres disponibles. Certaines personnes ne trouvent aucune différence, d’autres peuvent réduire leur facture annuelle de plusieurs dizaines voire centaines d’euros. Billy fournit une estimation basée sur les données de la facture et les tarifs publics, sans garantie de montant exact.",
  },
  {
    q: "Comment Billy gagne de l’argent ?",
    a: "Si un changement de fournisseur est effectué via un lien partenaire, le fournisseur peut verser une commission à Billy. Cela ne modifie pas le prix de l’offre pour le client. Le tarif est identique à celui proposé directement par le fournisseur.",
  },
  {
    q: "Les résultats sont-ils fiables ?",
    a: "Les estimations sont calculées à partir des données extraites de la facture et des grilles tarifaires publiques des fournisseurs. Il s’agit d’indications comparatives. Le montant réel peut varier selon les conditions contractuelles et l’évolution des tarifs.",
  },
  {
    q: "Un scan est-il décompté si le document est invalide ?",
    a: "Oui. Chaque analyse lancée est comptabilisée, même si le document transmis ne permet pas une extraction complète. Cela permet d’éviter les abus et de maintenir le service accessible à tous.",
  },
  {
    q: "C'est compliqué de changer de fournisseur ?",
    a: "En général, le nouveau fournisseur prend en charge la majorité des démarches. Il n’y a pas de coupure d’électricité. Il est recommandé de vérifier d’éventuels frais de résiliation ou périodes d’engagement en cours.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Oui. Les factures sont supprimées immédiatement après analyse. BillyCheck respecte le RGPD. Aucune donnée personnelle inutile n’est conservée et une demande de suppression peut être effectuée à tout moment via contact@billycheck.com.",
  },
];


function Item({ q, a }: { q: string; a: string }) {
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

export function FAQ() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-5">
      {FAQS.map((f, i) => (
        <Item key={i} q={f.q} a={f.a} />
      ))}
    </div>
  );
}
