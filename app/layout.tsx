import type { Metadata } from "next";
import { Nunito, DM_Sans, DM_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

/* ── Fonts ── */
const nunito = Nunito({ subsets: ["latin"], variable: "--font-display", weight: ["700", "800", "900"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "700"] });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

/* ── Metadata ── */
export const metadata: Metadata = {
  title: "BillyCheck — Payez-vous trop cher votre électricité ?",
  description:
    "Scannez votre facture d'énergie. Billy l'analyse en 30 secondes et vous montre les offres potentiellement plus avantageuses. Premier check gratuit.",
  openGraph: {
    title: "BillyCheck — Payez-vous trop cher ?",
    description: "Scannez votre facture, découvrez vos économies potentielles en 30 secondes.",
    url: "https://billycheck.com",
    siteName: "BillyCheck",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "fr_BE",
    type: "website",
  },
};

/* ── Layout ── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${nunito.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-background font-body text-night">
        {/* ── Sticky navbar ── */}
        <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-slate-200/60 px-5 py-3 relative flex items-center justify-end">
  
  {/* Logo centré absolu */}
  <div className="absolute left-1/2 -translate-x-1/2">
    <Link href="/">
      <Image
        src="/brand/logo.png"
        alt="BillyCheck"
        width={170}
        height={44}
        priority
      />
    </Link>
  </div>

  {/* Bouton à droite */}
  <Link
    href="/scan"
    className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-billy-blue text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
  >
    🔍 Checker ma facture
  </Link>
</nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
