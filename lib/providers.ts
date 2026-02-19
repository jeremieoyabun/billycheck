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
  // Electricity BE
  { id: "octa_plus",      name: "Octa+",         verticals: ["electricity"],            regions: ["BE"], logo: "/octa+.png" },
  { id: "zendure",        name: "Zendure",        verticals: ["electricity"],            regions: ["BE"], logo: "/zendure.png" },
  { id: "mega",           name: "MEGA",           verticals: ["electricity", "telecom"], regions: ["BE"], logo: "/mega.png" },
  { id: "energie_be",     name: "Energie.be",     verticals: ["electricity"],            regions: ["BE"], logo: "/energie.be.png" },
  { id: "bolt",           name: "Bolt",           verticals: ["electricity"],            regions: ["BE"], logo: "/bolt.png" },
  // Electricity FR (future)
  { id: "total_energies", name: "TotalEnergies",  verticals: ["electricity"],            regions: ["FR"], logo: "/total-energies.png" },
  { id: "frank_energie",  name: "Frank Energie",  verticals: ["electricity"],            regions: ["FR"], logo: "/frank-energie.png" },
  // Telecom BE
  { id: "orange",         name: "Orange",         verticals: ["telecom"],               regions: ["BE"], logo: "/orange.png" },
  { id: "yoin",           name: "Yoin",           verticals: ["telecom"],               regions: ["BE"], logo: "/yoin.png" },
  { id: "hey",            name: "Hey",            verticals: ["telecom"],               regions: ["BE"], logo: "/hey.png" },
  { id: "saily",          name: "Saily",          verticals: ["telecom"],               regions: ["BE"], logo: "/saily.png" },
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
