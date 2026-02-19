"use client";

import Image from "next/image";
import { useState } from "react";
import { getProviders, type Provider, type ProviderRegion, type ProviderVertical } from "@/lib/providers";

function ProviderLogo({ provider }: { provider: Provider }) {
  const [error, setError] = useState(false);

  if (!provider.logo || error) {
    return (
      <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-full whitespace-nowrap">
        {provider.name}
      </span>
    );
  }

  return (
    <Image
      src={provider.logo}
      alt={provider.name}
      width={80}
      height={32}
      className="object-contain max-h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-90 transition-all duration-200"
      onError={() => setError(true)}
    />
  );
}

interface ProviderLogoMarqueeProps {
  vertical: ProviderVertical;
  region?: ProviderRegion;
  className?: string;
}

export function ProviderLogoMarquee({
  vertical,
  region = "BE",
  className = "",
}: ProviderLogoMarqueeProps) {
  const providers = getProviders({ vertical, region });
  if (providers.length === 0) return null;

  // Duplicate list for seamless loop: animation scrolls -50% (= first copy width)
  const doubled = [...providers, ...providers];

  return (
    <div
      className={`marquee-container overflow-hidden w-full ${className}`}
      aria-hidden="true"
      title={`Fournisseurs ${vertical === "electricity" ? "electricite" : "telecom"} couverts`}
    >
      <div className="marquee-track flex w-max gap-0">
        {doubled.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="flex items-center justify-center px-5 py-2 shrink-0"
          >
            <ProviderLogo provider={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
