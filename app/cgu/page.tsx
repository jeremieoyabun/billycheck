import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d’Utilisation | BillyCheck",
  description: "Conditions Générales d’Utilisation (CGU) du service BillyCheck.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-bold text-slate-900">{children}</h2>;
}

export default function CGUPage() {
  const SERVICE = "BillyCheck";
  const COMPANY = "ENNAVA";
  const CONTACT_EMAIL = "contact@billycheck.com";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Conditions Générales d’Utilisation
      </h1>
      <p className="mt-2 text-sm text-slate-600">Dernière mise à jour: 17/02/2026</p>

      <H>1. Objet</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Les présentes CGU encadrent l’accès et l’utilisation du service {SERVICE} édité par {COMPANY}.
        En utilisant {SERVICE}, l’utilisateur accepte les présentes CGU.
      </p>

      <H>2. Description du service</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {SERVICE} permet a l’utilisateur de televerser un document (ex: facture d’electricite ou de telecom)
        afin d’en extraire certaines données et d’afficher des estimations, comparaisons ou resultats informatifs,
        incluant des offres de partenaires.
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Le service repose en partie sur des traitements automatisés. Les résultats peuvent contenir des erreurs,
        approximations ou omissions.
      </p>

      <H>3. Conditions d’accès</H>
      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
        <li>
          L’utilisateur s’engage à fournir des informations exactes et à utiliser des documents qu’il est autorisé à partager.
        </li>
        <li>
          L’utilisateur garantit être titulaire des droits sur les documents téléversés ou disposer de l’autorisation nécessaire.
          La société ne saurait être tenue responsable du contenu des documents transmis.
        </li>
        <li>
          L’utilisateur s’engage à ne pas perturber le service (tests abusifs, contournement, surcharge, extraction automatisée non autorisée).
        </li>
        <li>
          La société se réserve le droit de suspendre l’accès au service en cas d’usage abusif, détourné ou frauduleux.
        </li>
        <li>
          La société se réserve le droit de rendre tout ou partie du service payant à l’avenir.
        </li>
      </ul>

      <H>4. Aucune prestation de conseil, aucune promesse</H>
      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
        <li>
          {SERVICE} ne fournit aucun conseil financier, juridique, fiscal, énergétique ou de courtage. Les informations affichées
          sont générales et indicatives.
        </li>
        <li>
          {SERVICE} ne fait aucune promesse d’économie, de gain, de réduction de facture ou d’amélioration de contrat.
        </li>
        <li>
          {SERVICE} n’a aucune obligation de résultat. Les résultats peuvent varier selon la qualité du document, les formats,
          les règles tarifaires, les données disponibles, et les mises à jour des partenaires.
        </li>
        <li>
          Les informations fournies ne doivent pas être interprétées comme une incitation, une recommandation personnalisée
          ou un élément déterminant de décision, et l’utilisateur demeure seul responsable de ses choix.
        </li>
      </ul>

      <H>5. Offres partenaires, absence de garantie</H>
      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
        <li>
          Les offres affichées proviennent de partenaires et/ou de sources publiques. {SERVICE} ne garantit pas que ces offres
          sont pertinentes, avantageuses, disponibles, exactes ou à jour.
        </li>
        <li>
          Les conditions contractuelles applicables sont celles du partenaire ou du fournisseur. L’utilisateur doit vérifier
          les informations avant toute souscription.
        </li>
        <li>
          {SERVICE} n’est pas responsable de la souscription, de l’exécution, du support, de la facturation ou du SAV des partenaires.
        </li>
      </ul>

      <H>6. Affiliation</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {SERVICE} peut percevoir une commission si l’utilisateur souscrit via un lien partenaire. Cette rémunération n’implique
        pas une recommandation personnalisée ni une garantie sur l’intérêt d’une offre.
      </p>

      <H>7. Disponibilité et maintenance</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {COMPANY} s’efforce d’assurer l’accès au service, sans garantir une disponibilité continue. Le service peut être suspendu
        pour maintenance, mise à jour, sécurité, ou en cas de contrainte technique.
      </p>

      <H>8. Responsabilité (limitation)</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Dans la mesure permise par la loi, {COMPANY} ne saurait être tenue responsable des dommages indirects, pertes de chance,
        pertes de données, pertes d’exploitation, ou conséquences liées à l’usage du service, aux résultats affichés,
        ou aux offres partenaires. La responsabilité de {COMPANY}, si elle devait être engagée, est limitée aux dommages directs
        et prouvés.
      </p>

      <H>9. Données personnelles</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Le traitement des données personnelles est décrit dans la{" "}
        <Link className="underline" href="/politique-de-confidentialite">
          Politique de confidentialité
        </Link>
        .
      </p>

      <H>10. Propriété intellectuelle</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {SERVICE} et ses contenus sont protégés. Toute reproduction ou exploitation non autorisée est interdite.
      </p>

      <H>11. Modifications</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {COMPANY} peut modifier les CGU à tout moment. La version applicable est celle publiée sur le site à la date d’utilisation.
      </p>

      <H>12. Droit applicable et règlement amiable des litiges</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Les présentes CGU sont régies par le droit français.
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        En cas de différend relatif à l’interprétation ou à l’exécution des présentes, les parties s’efforceront de rechercher
        une solution amiable avant toute action judiciaire.
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        À défaut de résolution amiable, et sauf dispositions impératives contraires, les tribunaux compétents seront ceux du ressort de Paris.
      </p>

      <H>13. Contact</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Pour toute question:{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>
    </main>
  );
}
