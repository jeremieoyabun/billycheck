"use client";

import { useEffect, useRef } from "react";

interface BillTypeModalProps {
  open: boolean;
  onClose: () => void;
}

export function BillTypeModal({ open, onClose }: BillTypeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-[90vw] max-w-md rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-black/40"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900">
            Quelle facture utiliser ?
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Placeholder image — swap the src with the real asset later */}
        <div className="bg-slate-100 rounded-xl overflow-hidden mb-4 aspect-[4/3] flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bill-example.png"
            alt="Exemple de facture annuelle"
            className="w-full h-full object-contain"
            onError={(e) => {
              // If image doesn't exist yet, show placeholder text
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.innerHTML =
                '<div class="text-center p-8 text-slate-400 text-sm">Image d\'exemple à venir</div>';
            }}
          />
        </div>

        <div className="text-sm text-slate-600 leading-relaxed space-y-2">
          <p>
            <strong>Utilisez votre facture annuelle ou de régularisation.</strong>
            {" "}C'est la seule qui contient votre consommation réelle en kWh
            et le détail des prix de l'énergie.
          </p>
          <p>
            Les factures d'acompte ou échéanciers ne contiennent pas ces
            informations et ne permettent pas une comparaison fiable.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          J'ai compris
        </button>
      </div>
    </dialog>
  );
}
