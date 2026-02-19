"use client";

import { useCallback, useRef } from "react";
import type { Vertical } from "@/lib/verticals";

interface VerticalTabsProps {
  value: Vertical;
  onChange: (v: Vertical) => void;
}

const TABS: { value: Vertical; label: string; emoji: string }[] = [
  { value: "electricity", label: "Électricité", emoji: "⚡" },
  { value: "telecom", label: "Télécom", emoji: "📱" },
];

export function VerticalTabs({ value, onChange }: VerticalTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, idx: number) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = (idx + 1) % TABS.length;
        onChange(TABS[next].value);
        tabRefs.current[next]?.focus();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = (idx - 1 + TABS.length) % TABS.length;
        onChange(TABS[prev].value);
        tabRefs.current[prev]?.focus();
      }
    },
    [onChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Choisissez votre type de facture"
      className="inline-flex items-center bg-slate-100 border border-slate-200/70 shadow-sm rounded-2xl p-1 gap-1"
    >
      {TABS.map((tab, idx) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-billy-blue ${
              selected
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/70"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
