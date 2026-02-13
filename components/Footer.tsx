"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-500">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link className="hover:text-slate-700" href="/about">
              Qui sommes-nous
            </Link>
            <Link className="hover:text-slate-700" href="/privacy">
              Politique de confidentialité
            </Link>
            <Link className="hover:text-slate-700" href="/terms">
              CGU
            </Link>
            <Link className="hover:text-slate-700" href="/legal">
              Mentions légales
            </Link>
            <a className="hover:text-slate-700" href="mailto:contact@billycheck.com">
              contact@billycheck.com
            </a>
          </div>

          <div className="text-xs text-slate-400">
            BillyCheck © {new Date().getFullYear()} — Billy ne fournit pas de conseil financier ou juridique.
          </div>
        </div>
      </div>
    </footer>
  );
}
