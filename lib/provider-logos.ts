// Maps provider display names (as returned by analyze-bill / analyze-telecom)
// to their logo file paths in /public.

const LOGO_MAP: Record<string, string> = {
  // Electricity BE
  "Bolt":           "/bolt.png",
  "ENGIE":          "/engie.png",
  "Luminus":        "/luminus.png",
  "MEGA":           "/mega.png",
  "Octa+":          "/octa+.png",
  "TotalEnergies":  "/totalenergies.png",
  // Electricity FR
  // (EDF, Octopus Energy, ENGIE FR — reuse ENGIE logo for ENGIE FR)
  // Telecom BE
  "Proximus":       "/proximus.png",
  "Orange":         "/orange.png",
  "VOO":            "/voo.png",
  "Scarlet":        "/scarlet.png",
  "Telenet":        "/telenet.png",
  "Yoin":           "/yoin.png",
  "hey!":           "/hey.png",
};

/**
 * Returns the logo path for a provider name, or null if not available.
 */
export function getProviderLogo(providerName: string): string | null {
  return LOGO_MAP[providerName] ?? null;
}
