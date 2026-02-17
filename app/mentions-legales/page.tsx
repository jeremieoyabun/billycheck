export const metadata = {
  title: "Mentions légales | BillyCheck",
  description: "Mentions légales du site BillyCheck.",
};

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p className="text-sm leading-6 text-slate-700">
      <span className="font-semibold text-slate-900">{label}</span>
      <br />
      <span>{value}</span>
    </p>
  );
}

export default function MentionsLegalesPage() {
  const SITE_NAME = "BillyCheck";
  const SITE_URL = "https://billycheck.com"; // TODO: remplace si besoin
  const CONTACT_EMAIL = "contact@billycheck.com"; // TODO: remplace par ton email réel

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Mentions légales
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Dernière mise à jour: 16/02/2026
      </p>

      <section className="mt-8 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Éditeur du site</h2>

        <Item label="Dénomination sociale" value="ENNAVA (SAS)" />
        <Item label="Adresse du siège" value="3 rue de la Lune, 75002 Paris, France" />
        <Item label="SIREN" value="877 765 115" />
        <Item label="SIRET (siège)" value="877 765 115 00010" />
        <Item label="TVA intracommunautaire" value="FR79877765115" />
                <Item label="Contact" value={<a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>} />
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Hébergement</h2>
        <p className="text-sm leading-6 text-slate-700">
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          Contact: privacy@vercel.com.
        </p>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Objet du site</h2>
        <p className="text-sm leading-6 text-slate-700">
          {SITE_NAME} ({SITE_URL}) est un service permettant d’analyser des documents fournis par l’utilisateur (ex: facture)
          afin d’extraire des informations et d’afficher des estimations et comparaisons d’offres proposées par des partenaires.
        </p>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Avertissement important</h2>
        <ul className="list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
          <li>
            {SITE_NAME} n’est pas une société de conseil, n’est pas un courtier, et ne fournit pas de conseil financier,
            juridique, fiscal ou énergétique.
          </li>
          <li>
            Les informations affichées sont indicatives. Elles ne constituent pas une offre contractuelle et ne remplacent pas
            les informations officielles des fournisseurs ou partenaires.
          </li>
          <li>
            {SITE_NAME} ne garantit pas l’exactitude exhaustive des extractions (OCR, qualité du document, formats variables) ni
            l’intérêt des offres proposées par des partenaires.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Liens partenaires et affiliation</h2>
        <p className="text-sm leading-6 text-slate-700">
          Certains liens peuvent être des liens d’affiliation. Si l’utilisateur souscrit une offre via un lien partenaire,
          ENNAVA peut percevoir une commission. Cela n’implique pas que {SITE_NAME} recommande une offre en particulier,
          ni que l’offre est nécessairement la plus avantageuse pour l’utilisateur.
        </p>
      </section>

      <section className="mt-10 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">Propriété intellectuelle</h2>
        <p className="text-sm leading-6 text-slate-700">
          L’ensemble des éléments du site (marques, textes, visuels, logos, interfaces, codes, bases de données) est protégé.
          Toute reproduction, représentation ou exploitation non autorisée est interdite.
        </p>
      </section>
    </main>
  );
}
