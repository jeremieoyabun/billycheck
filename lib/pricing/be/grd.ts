// lib/pricing/be/grd.ts
//
// Maps EAN prefixes to GRD (gestionnaire de réseau de distribution) and region.
// Belgium: EAN-18 starting with 54141…
//
// Stub: real lookup requires the full VREG/CWaPE/Brugel GRD tables.
// Add more EAN prefix ranges as they become available.

export type BeRegion = "WAL" | "FLA" | "BRU";

export interface GrdInfo {
  grd: string;
  region: BeRegion;
}

// EAN prefix → GRD mapping (first 8 significant digits after 54141)
// Source: CREG/VREG public datasets (simplified)
const GRD_BY_EAN_PREFIX: Record<string, GrdInfo> = {
  // Wallonie
  "541414100": { grd: "ORES Assets",    region: "WAL" },
  "541414200": { grd: "ORES Assets",    region: "WAL" },
  "541414300": { grd: "Gaselwest",      region: "WAL" },
  "541414400": { grd: "AIEG",           region: "WAL" },
  "541414500": { grd: "AIESH",          region: "WAL" },
  "541414600": { grd: "REW",            region: "WAL" },
  // Flandre
  "541414700": { grd: "Fluvius",        region: "FLA" },
  "541414800": { grd: "Fluvius",        region: "FLA" },
  "541414900": { grd: "Fluvius",        region: "FLA" },
  "541415000": { grd: "Fluvius",        region: "FLA" },
  // Bruxelles
  "541415100": { grd: "Sibelga",        region: "BRU" },
  "541415200": { grd: "Sibelga",        region: "BRU" },
};

/**
 * Attempt to determine the GRD from a Belgian EAN-18.
 * Returns null if the EAN is unrecognised or not Belgian.
 */
export function lookupGrdFromEAN(ean: string): GrdInfo | null {
  if (!ean) return null;

  // Strip spaces/dashes, keep digits only
  const digits = ean.replace(/\D/g, "");

  // Belgian EAN-18 starts with 54141
  if (!digits.startsWith("54141") || digits.length !== 18) return null;

  // Try progressively shorter prefixes (9 → 7 digits)
  for (let len = 9; len >= 7; len--) {
    const prefix = digits.slice(0, len);
    if (GRD_BY_EAN_PREFIX[prefix]) {
      return GRD_BY_EAN_PREFIX[prefix];
    }
  }

  return null;
}
