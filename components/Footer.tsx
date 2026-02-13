import Link from "next/link";

const LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgu", label: "CGU" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "mailto:contact@billycheck.com", label: "Contact" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 px-5 py-6 text-center text-xs text-slate-400">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:text-slate-600 transition-colors"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <p>BillyCheck © {new Date().getFullYear()} — Billy ne fournit pas de conseil financier ou juridique.</p>
    </footer>
  );
}
