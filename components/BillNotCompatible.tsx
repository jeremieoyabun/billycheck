"use client";

import { Billy } from "./Billy";
import { ChatBubble } from "./ChatBubble";

interface BillNotCompatibleProps {
  onRetry: () => void;
  onShowExample: () => void;
}

export function BillNotCompatible({ onRetry, onShowExample }: BillNotCompatibleProps) {
  return (
    <div className="animate-fade-up">
      <div className="text-center mb-5">
        <Billy expression="error" size={110} />
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        <ChatBubble>
          <strong>Cette facture semble être un échéancier ou une facture estimée.</strong>
        </ChatBubble>
        <ChatBubble delay={300}>
          Pour comparer les offres, nous avons besoin d'une facture avec la
          consommation réelle.
          <br />
          <br />
          👉 Essayez avec votre facture annuelle ou de régularisation.
        </ChatBubble>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onRetry}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-blue-700 transition-colors"
        >
          📸 Scanner une autre facture
        </button>
        <button
          onClick={onShowExample}
          className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Voir un exemple
        </button>
      </div>
    </div>
  );
}
