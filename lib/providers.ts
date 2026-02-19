// lib/providers.ts
// Single source of truth for all provider logos displayed in the marquee.

export type ProviderVertical = "electricity" | "telecom";
export type ProviderRegion = "BE" | "FR";

export interface Provider {
  id: string;
  name: string;
  verticals: ProviderVertical[];
  regions: ProviderRegion[];
  logo?: string; // path in /public, e.g. "/mega.png"
}

export const PROVIDERS: Provider[] = [
  // ── Electricity BE ──────────────────────────────────────────────────────
  { id: "octa_plus",       name: "Octa+",          verticals: ["electricity"],            regions: ["BE"], logo: "/octa+.png" },
  { id: "zendure",         name: "Zendure",         verticals: ["electricity"],            regions: ["BE"], logo: "/zendure.png" },
  { id: "mega",            name: "MEGA",            verticals: ["electricity", "telecom"], regions: ["BE"], logo: "/mega.png" },
  { id: "energie_be",      name: "Energie.be",      verticals: ["electricity"],            regions: ["BE"], logo: "/energie.be.png" },
  { id: "bolt",            name: "Bolt",            verticals: ["electricity"],            regions: ["BE"], logo: "/bolt.png" },
  { id: "luminus",         name: "Luminus",         verticals: ["electricity"],            regions: ["BE"], logo: "/luminus.png" },
  { id: "engie_be",        name: "ENGIE",           verticals: ["electricity"],            regions: ["BE"], logo: "/engie.png" },
  { id: "total_energies",  name: "TotalEnergies",   verticals: ["electricity"],            regions: ["BE"], logo: "/totalenergies.png" },
  // ── Electricity FR ──────────────────────────────────────────────────────
  { id: "frank_energie",   name: "Frank Energie",   verticals: ["electricity"],            regions: ["FR"], logo: "/frank-energie.png" },
  // ── Telecom BE ──────────────────────────────────────────────────────────
  { id: "proximus",        name: "Proximus",        verticals: ["telecom"],                regions: ["BE"], logo: "/proximus.png" },
  { id: "telenet",         name: "Telenet",         verticals: ["telecom"],                regions: ["BE"], logo: "/telenet.png" },
  { id: "orange",          name: "Orange",          verticals: ["telecom"],                regions: ["BE"], logo: "/orange.png" },
  { id: "voo",             name: "VOO",             verticals: ["telecom"],                regions: ["BE"], logo: "/voo.png" },
  { id: "base",            name: "BASE",            verticals: ["telecom"],                regions: ["BE"], logo: "/base.png" },
  { id: "scarlet",         name: "Scarlet",         verticals: ["telecom"],                regions: ["BE"], logo: "/scarlet.png" },
  { id: "mobile_vikings",  name: "Mobile Vikings",  verticals: ["telecom"],                regions: ["BE"], logo: "/mobile-vikings.png" },
  { id: "yoin",            name: "Yoin",            verticals: ["telecom"],                regions: ["BE"], logo: "/yoin.png" },
  { id: "hey",             name: "Hey",             verticals: ["telecom"],                regions: ["BE"], logo: "/hey.png" },
  { id: "saily",           name: "Saily",           verticals: ["telecom"],                regions: ["BE"], logo: "/saily.png" },
];

export function getProviders({
  vertical,
  region,
}: {
  vertical: ProviderVertical;
  region?: ProviderRegion;
}): Provider[] {
  return PROVIDERS.filter(
    (p) =>
      p.verticals.includes(vertical) &&
      (!region || p.regions.includes(region))
  );
}
