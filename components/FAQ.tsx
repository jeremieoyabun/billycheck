"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "C'est vraiment gratuit le premier check ?",
    a: "Oui ! Le premier check est totalement gratuit, sans inscription et sans carte bancaire. Les checks suivants sont à 0,99\u00a0€ — moins qu'un café.",
  },
  {
    q: "Qu'est-ce que tu fais de ma facture, Billy ?",
    a: "Je lis ta facture pour en extraire les chiffres importants (montant, consommation, fournisseur). Ta facture est supprimée immédiatement après l'analyse. Je ne garde que les données chiffrées nécessaires à la comparaison — aucun nom, aucune adresse.",
  },
  {
    q: "Comment tu gagnes de l'argent ?",
    a: "Si tu décides de changer de fournisseur via un de mes liens, le fournisseur me verse une petite commission. Ça ne change absolument rien au prix de l'offre pour toi.",
  },
  {
    q: "Les résultats sont-ils fiables ?",
    a: "Les estimations sont basées sur les données de ta facture et les tarifs publics des fournisseurs. Ce sont des estimations indicatives — ton économie réelle peut varier. Je te recommande toujours de vérifier les détails avant de souscrire.",
  },
  {
    q: "C'est compliqué de changer de fournisseur ?",
    a: "Non, en général c'est assez simple. Le nouveau fournisseur s'occupe de la plupart des démarches. Mais vérifie d'abord si tu es engagé(e) — il pourrait y avoir des frais de résiliation. Changer de fournisseur n'entraîne aucune coupure d'électricité.",
  },
  {
    q: "Mes données sont protégées ?",
    a: "Absolument. Ta facture est supprimée immédiatement après analyse. BillyCheck est conforme au RGPD. Tu peux demander la suppression de tes données à tout moment via contact@billycheck.com.",
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
