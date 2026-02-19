"use client";

import { useState } from "react";
import Link from "next/link";
import { VerticalTabs } from "./VerticalTabs";
import { ManualElectricityForm } from "./ManualElectricityForm";
import { ProviderLogoMarquee } from "./ProviderLogoMarquee";
import { VERTICAL_COPY } from "@/lib/verticals";
import type { Vertical } from "@/lib/verticals";
import { track } from "@/lib/analytics";

export function HeroModule() {
  const [vertical, setVertical] = useState<Vertical>("electricity");
  const copy = VERTICAL_COPY[vertical];

  function handleVerticalChange(v: Vertical) {
    setVertical(v);
    track("vertical_switched", { to: v });
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Vertical selector */}
      <VerticalTabs value={vertical} onChange={handleVerticalChange} />

      {/* Dynamic subtitle */}
      <p
        key={vertical}
        className="text-[clamp(15px,2.4vw,18px)] text-slate-600 max-w-sm mx-auto leading-relaxed text-center animate-fade-up"
      >
        {copy.subtitle}
      </p>

      {/* Primary scan CTA */}
      <Link
        href={`/scan?v=${vertical}`}
        className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-billy-blue text-white rounded-2xl text-lg font-display font-bold shadow-[0_6px_18px_rgba(37,99,235,0.22)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
      >
        {vertical === "electricity" ? "⚡" : "📱"} Scanner ma facture
      </Link>

      {/* Microcopy */}
      <p className="text-[13px] text-slate-500 font-medium -mt-2">
        🎁 2 analyses offertes · 🔒 Sans inscription
      </p>

{/* Provider logo marquee (no reset on vertical switch) */}
<div className="w-full mx-auto max-w-md sm:max-w-lg lg:max-w-4xl xl:max-w-6xl relative">
  <div className={vertical === "electricity" ? "opacity-100 transition-opacity duration-200" : "opacity-0 pointer-events-none absolute inset-0 transition-opacity duration-200"}>
    <ProviderLogoMarquee vertical="electricity" region="BE" />
  </div>
  <div className={vertical === "telecom" ? "opacity-100 transition-opacity duration-200" : "opacity-0 pointer-events-none absolute inset-0 transition-opacity duration-200"}>
    <ProviderLogoMarquee vertical="telecom" region="BE" />
  </div>
</div>


      {/* Electricity: manual form option */}
      {vertical === "electricity" && (
        <div className="w-full max-w-sm">
          <ManualElectricityForm /> 
        </div>
      )}

      {/* Telecom: scan hint */}
      {vertical === "telecom" && (
        <p className="text-[13px] text-slate-500 italic">
          {copy.scanHint}
        </p>
      )}
    </div>
  );
}
