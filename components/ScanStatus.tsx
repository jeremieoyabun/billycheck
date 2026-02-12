"use client";

import { useEffect, useState } from "react";
import { Billy } from "./Billy";
import { ChatBubble } from "./ChatBubble";

const MESSAGES = [
  { text: "Je regarde ta facture… 🔍", at: 0 },
  { text: "Hmm, je vois ton fournisseur…", at: 2000 },
  { text: "Je compare avec les offres du marché…", at: 5000 },
  { text: "Encore un petit instant… 📊", at: 8000 },
  { text: "J'ai presque fini !", at: 12000 },
];

interface ScanStatusProps {
  status: "PROCESSING" | "FAILED";
  onRetry?: () => void;
}

export function ScanStatus({ status, onRetry }: ScanStatusProps) {
  const [msgs, setMsgs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  /* ── Animated messages while processing ── */
  useEffect(() => {
    if (status !== "PROCESSING") return;
    setMsgs([]);
    setProgress(0);

    const timers = MESSAGES.map((m) =>
      setTimeout(() => setMsgs((prev) => [...prev, m.text]), m.at)
    );

    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 8 + 2, 92));
    }, 600);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [status]);

  /* ── FAILED state ── */
  if (status === "FAILED") {
    return (
      <div className="text-center animate-fade-up">
        <Billy expression="error" size={120} />

        <div className="mt-4 flex flex-col gap-2.5 items-start">
          <ChatBubble>
            <strong>Oups 😅</strong>
          </ChatBubble>
          <ChatBubble delay={300}>
            J'arrive pas à lire cette facture. C'est peut-être flou, ou ce
            n'est pas une facture d'électricité. Essaie avec une photo plus
            nette ou un PDF.
          </ChatBubble>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            📸 Réessayer avec un autre fichier
          </button>
        )}
      </div>
    );
  }

  /* ── PROCESSING state ── */
  return (
    <div className="animate-fade-up">
      <div className="text-center mb-6">
        <div className="animate-billy-bounce inline-block">
          <Billy expression="searching" size={120} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-xs text-slate-400 mb-6">
        {Math.round(progress)}%
      </p>

      {/* Messages */}
      <div className="flex flex-col gap-2.5">
        {msgs.map((m, i) => (
          <ChatBubble key={i}>{m}</ChatBubble>
        ))}
      </div>
    </div>
  );
}
