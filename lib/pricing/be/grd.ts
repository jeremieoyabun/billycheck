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
  // ── Wallonie ──
  // ORES (multiple sub-zones cover most of Wallonia)
  "541414100": { grd: "ORES Assets",    region: "WAL" },
  "541414200": { grd: "ORES Assets",    region: "WAL" },
  "541446200": { grd: "ORES Assets",    region: "WAL" },
  "541446300": { grd: "ORES Assets",    region: "WAL" },
  "541446400": { grd: "ORES Assets",    region: "WAL" },
  "541446500": { grd: "ORES Assets",    region: "WAL" },
  "541446600": { grd: "ORES Assets",    region: "WAL" },
  "541446700": { grd: "ORES Assets",    region: "WAL" },
  "541446800": { grd: "ORES Assets",    region: "WAL" },
  // RESA (Liège area)
  "541456700": { grd: "RESA",           region: "WAL" },
  "541456800": { grd: "RESA",           region: "WAL" },
  "541456900": { grd: "RESA",           region: "WAL" },
  // AIEG (Wallonie)
  "541414400": { grd: "AIEG",           region: "WAL" },
  // AIESH (Wallonie)
  "541414500": { grd: "AIESH",          region: "WAL" },
  // REW (Régie de Wavre)
  "541414600": { grd: "REW",            region: "WAL" },
  "541414300": { grd: "Gaselwest",      region: "WAL" },

  // ── Flandre ──
  // Fluvius (covers all of Flanders)
  "541414700": { grd: "Fluvius",        region: "FLA" },
  "541414800": { grd: "Fluvius",        region: "FLA" },
  "541414900": { grd: "Fluvius",        region: "FLA" },
  "541415000": { grd: "Fluvius",        region: "FLA" },
  "541448800": { grd: "Fluvius",        region: "FLA" },
  "541448900": { grd: "Fluvius",        region: "FLA" },
  "541449000": { grd: "Fluvius",        region: "FLA" },
  "541449100": { grd: "Fluvius",        region: "FLA" },
  "541449200": { grd: "Fluvius",        region: "FLA" },
  "541450700": { grd: "Fluvius",        region: "FLA" },

  // ── Bruxelles ──
  // Sibelga
  "541415100": { grd: "Sibelga",        region: "BRU" },
  "541415200": { grd: "Sibelga",        region: "BRU" },
  "541462100": { grd: "Sibelga",        region: "BRU" },
};

/**
 * Attempt to determine the GRD from a Belgian EAN-18.
 * Returns null if the EAN is unrecognised or not Belgian.
 */
export function lookupGrdFromEAN(ean: string): GrdInfo | null {
  if (!ean) return null;

  // Strip spaces/dashes, keep digits only
  const digits = ean.replace(/\D/g, "");

  // Belgian EAN-18 starts with 5414
  if (!digits.startsWith("5414") || digits.length !== 18) return null;

  // Try progressively shorter prefixes (9 → 7 digits)
  for (let len = 9; len >= 7; len--) {
    const prefix = digits.slice(0, len);
    if (GRD_BY_EAN_PREFIX[prefix]) {
      return GRD_BY_EAN_PREFIX[prefix];
    }
  }

  return null;
}
