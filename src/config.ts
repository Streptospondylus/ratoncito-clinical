export const appConfig = {
  clinic: {
    shortName: "Dossier NAC",
    name: "VET30000",
    service: "Ratoncito · observation individuelle",
    location: "51 avenue du Général Leclerc, 30000 Nîmes",
    tagline: "Dossier adressé à la clinique"
  },
  recipient: {
    // Injecté uniquement dans le build Pages via le secret GitHub Actions.
    displayName: (import.meta.env.VITE_RECIPIENT_NAME ?? "").trim()
  },
  patient: {
    name: "Ratoncito",
    species: "Rattus rattus",
    sex: "Mâle",
    age: "18 mois",
    weight: "184 g",
    bodyCondition: "3 / 5"
  },
  case: {
    id: "NAC-26-0918-07",
    date: "18 septembre 2026",
    referringClinician: "Dossier référé",
    attendingClinician: import.meta.env.VITE_RECIPIENT_NAME || "Vétérinaire destinataire",
    status: "Évaluation active"
  },
  email: {
    subject: "Avis spécialisé demandé — dossier atypique",
    introduction:
      "Un dossier clinique atypique nécessite une relecture. Merci d’ouvrir le lien ci-dessous depuis votre téléphone."
  }
} as const;

export type AppConfig = typeof appConfig;
