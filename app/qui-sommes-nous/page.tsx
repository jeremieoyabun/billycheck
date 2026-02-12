import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Qui sommes-nous | BillyCheck",
  description:
    "BillyCheck vous aide à comprendre votre facture d’électricité et à repérer des offres potentiellement plus avantageuses, en quelques secondes.",
};

export default function QuiSommesNousPage() {
  return (
    <main className="min-h-[70vh] bg-background">
      {/* Hero */}
      <section className="px-5 pt-14 pb-10 bg-gradient-to-b from-blue-50 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500 mb-3">Qui sommes-nous</p>

          <h1 className="font-display font-black text-[clamp(30px,6vw,48px)] leading-tight">
            Nous rendons les factures d’électricité{" "}
            <span className="text-billy-blue">plus simples</span>.
          </h1>

          <p className="mt-5 text-[17px] sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            BillyCheck est un outil conçu pour aider le grand public à comprendre sa facture,
            repérer les informations clés, et comparer avec des offres du marché quand c’est possible.
            Notre objectif est clair : vous faire gagner du temps et vous donner de la visibilité, sans jargon.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-billy-blue text-white rounded-2xl text-base font-display font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
            >
              🔍 Checker ma facture
            </Link>

            <a
              href="mailto:contact@billycheck.com"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-base font-display font-bold hover:bg-slate-50 transition"
            >
              ✉️ Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-5 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h2 className="font-display font-extrabold text-2xl mb-3">
              Une équipe orientée produit, simple et utile
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Nous construisons BillyCheck avec une obsession : une expérience fluide, rassurante,
              et compréhensible en quelques secondes. Pas besoin de compte, pas besoin d’installer quoi que ce soit.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="text-xl mb-1">🧠</div>
                <div className="font-bold text-sm">Clarté</div>
                <div className="text-xs text-slate-500 leading-snug mt-1">
                  Nous expliquons, nous simplifions, nous évitons le jargon.
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="text-xl mb-1">🔒</div>
                <div className="font-bold text-sm">Confiance</div>
                <div className="text-xs text-slate-500 leading-snug mt-1">
                  Vos données ne servent qu’à produire votre résultat.
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="text-xl mb-1">⚡</div>
                <div className="font-bold text-sm">Rapidité</div>
                <div className="text-xs text-slate-500 leading-snug mt-1">
                  Le but est de vous donner une réponse immédiatement.
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <div className="text-xl mb-1">🎯</div>
                <div className="font-bold text-sm">Utilité</div>
                <div className="text-xs text-slate-500 leading-snug mt-1">
                  Des recommandations simples, actionnables, et honnêtes.
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50">
                <Image
                  src="/team.jpg"
                  alt="L’équipe BillyCheck"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 520px"
                  priority
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 px-2">
                <span className="font-mono">/public/team.jpg</span>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="px-5 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8">
            <h2 className="font-display font-extrabold text-2xl mb-3">
              Comment fonctionne BillyCheck
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="rounded-2xl bg-blue-50 p-4">
                <div className="text-2xl mb-2">📸</div>
                <div className="font-bold text-sm">Vous envoyez</div>
                <div className="text-xs text-slate-600 mt-1 leading-snug">
                  Photo, capture ou PDF, tout marche.
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <div className="text-2xl mb-2">🔍</div>
                <div className="font-bold text-sm">Nous analysons</div>
                <div className="text-xs text-slate-600 mt-1 leading-snug">
                  Nous détectons les informations clés utiles pour comparer.
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4">
                <div className="text-2xl mb-2">💡</div>
                <div className="font-bold text-sm">Vous décidez</div>
                <div className="text-xs text-slate-600 mt-1 leading-snug">
                  Nous affichons des estimations, vous gardez le contrôle.
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500 leading-relaxed">
              Important : les estimations dépendent des données détectées sur la facture.
              Si une information manque, nous pouvons vous proposer de la compléter pour affiner le résultat.
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-5 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-extrabold text-2xl mb-2">
            Prêt à vérifier votre facture ?
          </h2>
          <p className="text-slate-600 text-[15px] mb-6">
            C’est rapide, simple, et sans inscription.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-billy-blue text-white rounded-2xl text-base font-display font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
            >
              🔍 Lancer un scan
            </Link>

            <Link
              href="/faq"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-base font-display font-bold hover:bg-slate-50 transition"
            >
              ❓ Lire la FAQ
            </Link>
          </div>

          <div className="mt-7 text-xs text-slate-500">
            <Link href="/politique-de-confidentialite" className="hover:underline">
              Politique de confidentialité
            </Link>{" "}
            ·{" "}
            <Link href="/cgu" className="hover:underline">
              CGU
            </Link>{" "}
            ·{" "}
            <Link href="/mentions-legales" className="hover:underline">
              Mentions légales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
