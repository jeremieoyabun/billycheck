// lib/verticals.ts
// Shared vertical type and per-vertical copy used across the site.

export type Vertical = "electricity" | "telecom";

export const VERTICALS: { value: Vertical; label: string; emoji: string }[] = [
  { value: "electricity", label: "Electricite", emoji: "⚡" },
  { value: "telecom",     label: "Telecom",     emoji: "📱" },
];

export const VERTICAL_COPY = {
  electricity: {
    subtitle:       "Envoie ta facture d'electricite ou saisis tes données pour estimer tes economies potentielles.",
    scanHint:       "Photo, PDF ou capture d'ecran - tout fonctionne.",
    billTypeLabel:  "facture d'electricite",
    manualAvail:    true,
  },
  telecom: {
    subtitle:       "Envoie ta facture telecom pour reperer une offre plus avantageuse.",
    scanHint:       "Pour les Telecom, le scan est recommandé.",
    billTypeLabel:  "facture telecom",
    manualAvail:    false,
  },
} satisfies Record<Vertical, {
  subtitle:      string;
  scanHint:      string;
  billTypeLabel: string;
  manualAvail:   boolean;
}>;
