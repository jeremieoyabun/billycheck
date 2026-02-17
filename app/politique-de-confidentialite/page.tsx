export const metadata = {
  title: "Politique de confidentialité | BillyCheck",
  description: "Politique de confidentialité et informations RGPD du service BillyCheck.",
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-bold text-slate-900">{children}</h2>;
}

export default function PolitiqueConfidentialitePage() {
  const COMPANY = "ENNAVA (SAS)";
  const ADDRESS = "3 rue de la Lune, 75002 Paris, France";
  const CONTACT_EMAIL = "contact@billycheck.com";
  const SERVICE = "BillyCheck";

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-slate-600">Dernière mise à jour : 17/02/2026</p>

      <H>1. Responsable de traitement</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Le responsable de traitement est {COMPANY}, {ADDRESS}. Contact :{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <H>2. Données traitées</H>
      <p className="mt-3 text-sm leading-6 text-slate-700 font-semibold">2.1 Données fournies par l’utilisateur</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Lors de l’utilisation du service, l’utilisateur peut téléverser un document (par exemple une facture).
        Ce document peut contenir des données personnelles selon son contenu, notamment : informations contractuelles,
        données de consommation, montants facturés, périodes de facturation, intitulés tarifaires.
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-700 font-semibold">2.2 Données extraites et structurées</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        À partir du document téléversé, {SERVICE} extrait et structure certaines données nécessaires à l’analyse,
        aux estimations et aux comparaisons affichées.
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-700 font-semibold">2.3 Données techniques</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Des données techniques peuvent être collectées, notamment : adresse IP, journaux d’accès, informations relatives
        au navigateur et à l’appareil, données de sécurité et de prévention des abus.
      </p>

      <H>3. Finalités du traitement</H>
      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
        <li>Fournir le service d’analyse et d’extraction demandé par l’utilisateur.</li>
        <li>Afficher des résultats informatifs, estimations et comparaisons d’offres partenaires.</li>
        <li>Assurer la sécurité du service, prévenir les usages abusifs et la fraude.</li>
        <li>Améliorer le service et assurer le support utilisateur.</li>
        <li>Mesurer l’audience et les performances du service, lorsque cela est activé.</li>
      </ul>

      <H>4. Bases légales</H>
      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
        <li>Exécution du service demandé par l’utilisateur (exécution contractuelle).</li>
        <li>Intérêt légitime d’{COMPANY} (sécurité, prévention des abus, amélioration du service).</li>
        <li>Consentement de l’utilisateur lorsque requis (notamment pour les cookies non essentiels).</li>
        <li>Respect d’obligations légales applicables.</li>
      </ul>

      <H>5. Durées de conservation</H>
      <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-slate-700 space-y-2">
        <li>
          <span className="font-semibold">Documents téléversés :</span> conservés uniquement le temps nécessaire au traitement
          technique et à l’analyse, puis supprimés automatiquement dans un délai maximum de 48 heures, sauf obligation légale
          ou nécessité liée à la sécurité ou à la prévention des abus.
        </li>
        <li>
          <span className="font-semibold">Données extraites et structurées :</span> conservées pendant une durée maximale de 30 jours,
          afin de permettre l’affichage des résultats, la gestion du support utilisateur et la prévention des usages frauduleux,
          puis supprimées ou anonymisées.
        </li>
        <li>
          <span className="font-semibold">Données techniques et journaux :</span> conservées pendant une durée maximale de 12 mois
          à des fins de sécurité, de diagnostic et de conformité.
        </li>
      </ul>

      <H>6. Destinataires et sous-traitants</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Les données peuvent être traitées par des prestataires techniques agissant en tant que sous-traitants pour le compte de {COMPANY},
        notamment pour l’hébergement et l’infrastructure, le traitement automatisé et l’analyse, l’envoi d’emails, la mesure d’audience.
        Ces prestataires sont sélectionnés avec soin et soumis à des obligations contractuelles de confidentialité et de sécurité.
        {SERVICE} ne vend ni ne loue les données personnelles des utilisateurs.
      </p>

      <H>7. Offres partenaires et redirections</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Lorsque l’utilisateur consulte ou clique sur une offre partenaire, il peut être redirigé vers un site tiers.
        Les traitements de données réalisés par ces partenaires relèvent exclusivement de leur propre politique de confidentialité
        et de leurs conditions contractuelles.
      </p>

      <H>8. Transferts hors Union Européenne</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Certains prestataires techniques peuvent être situés hors de l’Union Européenne. Dans ce cas, des garanties appropriées
        sont mises en place, notamment par l’utilisation de clauses contractuelles types reconnues par la Commission européenne.
      </p>

      <H>9. Traitements automatisés</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Le service repose en partie sur des traitements automatisés. Les résultats fournis peuvent contenir des approximations,
        erreurs ou omissions liées aux formats des documents, aux données disponibles ou aux règles tarifaires applicables.
      </p>

      <H>10. Sécurité</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        {COMPANY} met en œuvre des mesures techniques et organisationnelles raisonnables pour protéger les données personnelles,
        incluant notamment : contrôles d’accès, chiffrement des communications, journalisation des accès, limitation des droits internes.
      </p>

      <H>11. Droits des utilisateurs</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Conformément au RGPD, l’utilisateur dispose des droits suivants : accès, rectification, effacement, limitation du traitement,
        opposition, portabilité lorsque applicable. Toute demande peut être adressée à :{" "}
        <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        . L’utilisateur peut également introduire une réclamation auprès de la CNIL.
      </p>

      <H>12. Cookies</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        Le site utilise des cookies strictement nécessaires à son fonctionnement. Des cookies de mesure d’audience ou marketing peuvent
        être utilisés uniquement lorsque le consentement de l’utilisateur est requis et a été donné.
      </p>

      <H>13. Modification de la politique</H>
      <p className="mt-3 text-sm leading-6 text-slate-700">
        La présente politique peut être modifiée à tout moment. La version applicable est celle publiée sur le site à la date
        d’utilisation du service.
      </p>
    </main>
  );
}
