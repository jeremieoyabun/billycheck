
import Link from "next/link";
import Image from "next/image";
import { Billy } from "@/components/Billy";
import { FAQ } from "@/components/FAQ";
import { HeroModule } from "@/components/HeroModule";
import { WithoutWithBillySection } from "@/components/WithoutWithBillySection";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="px-5 pt-12 pb-10 text-center bg-gradient-to-b from-blue-50 to-background">
        <div className="animate-billy-float inline-block mb-4">
          <Billy expression="normal" size={140} />
        </div>

        <p className="font-display font-semibold text-[clamp(20px,3.5vw,28px)] tracking-[-0.01em] text-slate-600 mb-2">
          Hey 👋 Moi c’est <span className="text-billy-blue font-bold">Billy</span>.
        </p>

        <h1 className="font-display font-black text-[clamp(26px,5vw,38px)] text-slate-900 mb-6 leading-tight">
          Billy te fait économiser sur tes factures.
        </h1>

        <div className="max-w-sm mx-auto">
          <HeroModule />
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-12 max-w-xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-center mb-1">Comment ca marche ?</h2>
        <p className="text-center text-slate-500 text-[15px] mb-8">
          Trois etapes. 30 secondes. C’est tout.
        </p>
        <div className="flex flex-col gap-4">
          {([
            ["📸", "Envoie ta facture", "Photo, PDF ou capture d’ecran - tout fonctionne pour l’électricite et les télécom."],
            ["🔍", "Billy analyse", "Billy analyse plus de 3 000 points de données en temps reel et compare avec les offres du marche belge."],
            ["💡", "Tu découvres le resultat", "Je te montre les offres qui pourraient te convenir, avec une estimation indicative des économies possibles."],
          ] as const).map(([icon, title, desc], i) => (
            <div key={i} className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-slate-200">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {icon}
              </div>
              <div>
                <div className="font-bold text-base mb-0.5">{title}</div>
                <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust tiles */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        <div className="grid grid-cols-3 gap-3">
          {([
            ["🔒", "Confidentiel", "Facture supprimée des que possible après traitement"],
            ["🎁", "2 analyses offertes", "Puis 4,99 € par analyse supplémentaire"],
            ["⚡", "30 secondes", "Billy va vite. Tres vite."],
          ] as const).map(([icon, title, desc], i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="font-bold text-sm mb-1">{title}</div>
              <div className="text-xs text-slate-500 leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof + trust badges */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 text-center mb-4">
          <div className="flex justify-center gap-0.5 text-2xl mb-1.5">
            <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
          </div>
          <div className="font-bold text-lg text-slate-900">548 clients satisfaits</div>
          <div className="text-sm font-semibold text-billy-blue mt-0.5">4,8 / 5</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Image
              src="/BFMTV.svg"
              alt="BFMTV"
              width={80}
              height={28}
              className="object-contain mb-2 opacity-80"
            />
            <div className="text-xs font-semibold text-slate-600">Vu SUR BFMTV</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Image
              src="/Stripe.svg"
              alt="Stripe"
              width={70}
              height={29}
              className="object-contain mb-2 opacity-80"
            />
            <div className="text-xs font-semibold text-slate-600">Paiement sécurise via Stripe</div>
          </div>
        </div>
      </section>

      {/* Before / After comparison */}
      <WithoutWithBillySection />

      {/* FAQ */}
      <section className="px-5 pb-12 max-w-xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl text-center mb-6">Questions fréquentes</h2>
        <FAQ />
      </section>

      {/* Final CTA */}
      <section className="px-5 py-12 text-center bg-gradient-to-b from-background to-blue-50">
        <div className="flex justify-center mb-3">
          <div className="animate-billy-float">
            <Billy expression="success" size={170} />
          </div>
        </div>
        <h2 className="font-display font-extrabold text-2xl mt-3 mb-2">
          Allez, montre-moi cette facture.
        </h2>
        <p className="text-slate-500 text-[15px] mb-6">
          En 30 secondes, tu sauras si tu pourrais payer moins.
        </p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-8 py-4 bg-billy-blue text-white rounded-2xl text-base font-display font-bold shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:bg-billy-blue-dark hover:-translate-y-0.5 transition-all"
        >
          🔍 Checker ma facture gratuitement
        </Link>
      </section>
    </>
  );
}
