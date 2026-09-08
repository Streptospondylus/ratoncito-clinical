export const appConfig = {
  clinic: {
    shortName: "CIRV",
    name: "Centre Interdisciplinaire de Référé Vétérinaire",
    service: "Unité NAC · cas complexes",
    location: "Pôle de médecine spécialisée",
    tagline: "Référé · précision · continuité"
  },
  recipient: {
    // À renseigner avant l’envoi. Aucun prénom n’est hardcodé dans l’application.
    displayName: ""
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
    attendingClinician: "Dr E. Vial",
    status: "Évaluation active"
  },
  email: {
    subject: "Avis spécialisé demandé — dossier atypique",
    introduction:
      "Un dossier clinique atypique nécessite une relecture. Merci d’ouvrir le lien ci-dessous depuis votre téléphone."
  },
  finalCopy: {
    result: "Comportement hors modèle clinique standard.",
    expectedCourse: "Persistance à long terme très probable.",
    recommendation: "Maintien du lien avec le facteur associé."
  }
} as const;

export type AppConfig = typeof appConfig;
