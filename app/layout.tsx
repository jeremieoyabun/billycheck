import type { Metadata } from "next";
import { Nunito, DM_Sans, DM_Mono } from "next/font/google";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ReferralCapture } from "@/components/ReferralCapture";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-display", weight: ["700", "800", "900"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "700"] });
const dmMono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://billycheck.com"),

  title: "BillyCheck - Telecom et Electricite : payez-vous trop cher ?",
  description:
    "Analysez votre facture de telephonie ou d'electricite en 30 secondes. Billy compare les meilleures offres disponibles en Belgique francophone. 2 analyses gratuites.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "BillyCheck - Telecom et Electricite",
    description: "Analysez votre facture telecom ou electricite en 30 secondes. Belgique francophone.",
    url: "https://billycheck.com",
    siteName: "BillyCheck",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "fr_BE",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "BillyCheck - Telecom et Electricite",
    description: "Analysez votre facture telecom ou electricite. Belgique francophone.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${nunito.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-background font-body text-night">
       <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-5 py-2.5 sm:py-3 safe-top">
  <div className="relative flex items-center justify-center sm:justify-between">
    {/* Logo (centré sur mobile) */}
    <Link href="/" className="flex items-center gap-2">
      <Image src="/brand/logo.png" alt="BillyCheck" width={170} height={44} priority />
    </Link>
    {/* CTA (à droite sur desktop, n'influence pas le centrage mobile) */}
    <Link
      href="/scan"
      className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
    >
      🔍 Checker ma facture
    </Link>
  </div>
</nav>

        <main className="flex-1">{children}</main>

        <Footer />

        {/* Capture ?ref= referral code from URL into cookie */}
        <ReferralCapture />

        {/* Google Analytics 4 — activated via NEXT_PUBLIC_GA_ID env var */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
