import type { SectionId } from "./domain";

export type IconName =
  | "grid"
  | "clipboard"
  | "pulse"
  | "flask"
  | "branch"
  | "report"
  | "arrow"
  | "chevron"
  | "check"
  | "lock"
  | "eye"
  | "search"
  | "shield"
  | "user"
  | "note"
  | "calendar"
  | "plus"
  | "spark";

export type HistoryEntry = {
  label: string;
  date: string;
  text: string;
  tags: string[];
};

export type ExamRow = {
  label: string;
  value: string;
  interpretation: string;
  tone?: "positive" | "neutral" | "attention";
};

export type LabRow = {
  analyte: string;
  value: string;
  reference: string;
  interpretation: string;
};

export type DiagnosticPanel = {
  id: "hematology" | "biochemistry" | "exploration" | "behavior";
  eyebrow: string;
  title: string;
  description: string;
  status: string;
  icon: IconName;
  summary: string;
  rows?: LabRow[];
  note?: string;
};

export type StimulusRow = {
  id: string;
  label: string;
  detail: string;
  orientation: string;
  attention: string;
  approach: string;
  recovery: string;
  response: "low" | "moderate" | "high";
  responseLabel: string;
};

export type Hypothesis = {
  id: string;
  label: string;
  category: string;
  expected: "retain" | "uncertain" | "exclude";
  feedback: string;
  rationale: string;
};

export const sectionMeta: Record<
  SectionId,
  { label: string; shortLabel: string; eyebrow: string; icon: IconName }
> = {
  overview: {
    label: "Vue d’ensemble",
    shortLabel: "Accueil",
    eyebrow: "Dossier référé",
    icon: "grid"
  },
  history: {
    label: "Anamnèse",
    shortLabel: "Anamnèse",
    eyebrow: "01 · Historique",
    icon: "clipboard"
  },
  examination: {
    label: "Examen clinique",
    shortLabel: "Examen",
    eyebrow: "02 · Observation",
    icon: "pulse"
  },
  diagnostics: {
    label: "Examens complémentaires",
    shortLabel: "Examens",
    eyebrow: "03 · Investigations",
    icon: "flask"
  },
  differentials: {
    label: "Hypothèses diagnostiques",
    shortLabel: "Hypothèses",
    eyebrow: "04 · Raisonnement",
    icon: "branch"
  },
  synthesis: {
    label: "Synthèse clinique",
    shortLabel: "Synthèse",
    eyebrow: "05 · Conclusion",
    icon: "report"
  }
};

export const historyEntries: HistoryEntry[] = [
  {
    label: "Installation du phénomène",
    date: "Début rapporté",
    text: "Évolution progressive, installée de longue date, sans épisode aigu ni altération générale associée.",
    tags: ["progressif", "stable"]
  },
  {
    label: "Épisodes reproductibles",
    date: "Circonstances spécifiques",
    text: "Orientation préférentielle, recherche de proximité et vigilance accrue lors de l’exposition à un facteur particulier.",
    tags: ["répétable", "sélectif"]
  },
  {
    label: "Éloignement / rapprochement",
    date: "Dynamique observée",
    text: "Atténuation rapide lors du rapprochement avec le facteur concerné, puis réapparition quasi systématique après éloignement.",
    tags: ["réversible", "contextuel"]
  },
  {
    label: "État général conservé",
    date: "À la consultation",
    text: "Appétit conservé. Activité générale satisfaisante. Aucun épisode douloureux, digestif ou locomoteur rapporté.",
    tags: ["rassurant", "non spécifique"]
  }
];

export const examRows: ExamRow[] = [
  {
    label: "État général",
    value: "Conservé",
    interpretation: "Patient éveillé, réactif, manipulable",
    tone: "positive"
  },
  {
    label: "Température",
    value: "37,4 °C",
    interpretation: "Mesure compatible avec un rat adulte au repos",
    tone: "positive"
  },
  {
    label: "Fréquence respiratoire",
    value: "86 / min",
    interpretation: "Mesure au repos, sans effort associé",
    tone: "positive"
  },
  {
    label: "Fréquence cardiaque",
    value: "318 / min",
    interpretation: "Mesure d’appoint ; variation contextuelle à réévaluer",
    tone: "attention"
  },
  {
    label: "Hydratation / muqueuses",
    value: "Correcte",
    interpretation: "Pas d’anomalie clinique objectivable",
    tone: "positive"
  },
  {
    label: "Examen neurologique",
    value: "Non contributif",
    interpretation: "Pas de déficit focal identifié",
    tone: "neutral"
  }
];

export const diagnosticPanels: DiagnosticPanel[] = [
  {
    id: "hematology",
    eyebrow: "LAB · HÉMATOLOGIE",
    title: "Hématologie",
    description: "Profil cellulaire et capacité de transport de l’oxygène.",
    status: "Non contributif",
    icon: "pulse",
    summary: "Aucune anomalie hématologique majeure mise en évidence.",
    rows: [
      {
        analyte: "Hématocrite (PCV)",
        value: "46 %",
        reference: "40–50 %¹",
        interpretation: "Dans l’intervalle publié"
      },
      {
        analyte: "Formule leucocytaire",
        value: "Sans particularité",
        reference: "Lecture qualitative",
        interpretation: "Pas d’argument inflammatoire majeur"
      },
      {
        analyte: "Frottis sanguin",
        value: "Non contributif",
        reference: "Évaluation morphologique",
        interpretation: "Pas de particularité notable"
      }
    ],
    note: "¹ Comparaison prudente avec des intervalles publiés chez le rat de compagnie (Rattus norvegicus)."
  },
  {
    id: "biochemistry",
    eyebrow: "LAB · BIOCHIMIE",
    title: "Biochimie",
    description: "Fonctions métaboliques principales et équilibre électrolytique.",
    status: "Sans anomalie significative",
    icon: "flask",
    summary: "Profil biochimique sans anomalie susceptible d’expliquer le tableau.",
    rows: [
      {
        analyte: "Glucose",
        value: "8,9 mmol/L",
        reference: "6,6–13,7 mmol/L¹",
        interpretation: "Dans l’intervalle publié"
      },
      {
        analyte: "Urée (BUN)",
        value: "4,1 mmol/L",
        reference: "2,5–6,6 mmol/L¹",
        interpretation: "Dans l’intervalle publié"
      },
      {
        analyte: "Créatinine",
        value: "31 µmol/L",
        reference: "≤ 53 µmol/L¹",
        interpretation: "Dans l’intervalle publié"
      },
      {
        analyte: "ALT",
        value: "61 UI/L",
        reference: "22–137 UI/L¹",
        interpretation: "Dans l’intervalle publié"
      },
      {
        analyte: "Protéines totales",
        value: "72 g/L",
        reference: "66–88 g/L¹",
        interpretation: "Dans l’intervalle publié"
      },
      {
        analyte: "Sodium",
        value: "139 mmol/L",
        reference: "133–144 mmol/L¹",
        interpretation: "Dans l’intervalle publié"
      }
    ],
    note: "¹ Intervalles de référence issus d’une étude de rats de compagnie Rattus norvegicus utilisant un analyseur de proximité. À interpréter avec le laboratoire et l’espèce."
  },
  {
    id: "exploration",
    eyebrow: "EXPLORATION · CONTEXTE",
    title: "Exploration ciblée",
    description: "Recherche d’un mécanisme organique avant l’analyse comportementale.",
    status: "Aucune indication d’imagerie avancée",
    icon: "search",
    summary: "Aucune atteinte organique objectivable lors de l’exploration clinique réalisée.",
    note: "L’absence de signes d’appel et le caractère strictement contextuel du phénomène ne justifient pas, à ce stade, une imagerie lourde. Une surveillance clinique reste recommandée dans le cadre du cas."
  },
  {
    id: "behavior",
    eyebrow: "ANALYSE · STIMULATION",
    title: "Analyse comportementale",
    description: "Comparaison contrôlée de plusieurs contextes d’exposition.",
    status: "Signal dominant identifié",
    icon: "eye",
    summary: "Une réponse intense, constante et rapidement reproductible est observée pour un stimulus unique.",
    note: "Les valeurs sont des mesures de simulation narrative : elles décrivent une dynamique relative et ne constituent pas un test clinique validé."
  }
];

export const stimulusRows: StimulusRow[] = [
  {
    id: "familiar",
    label: "Environnement familier",
    detail: "Condition de base · cage / pièce habituelle",
    orientation: "—",
    attention: "Faible",
    approach: "Spontanée",
    recovery: "Stable",
    response: "low",
    responseLabel: "Réponse de base"
  },
  {
    id: "food",
    label: "Alimentation",
    detail: "Présentation d’un aliment apprécié",
    orientation: "4,6 s",
    attention: "Modérée",
    approach: "2 / 6",
    recovery: "< 20 s",
    response: "moderate",
    responseLabel: "Réponse modérée"
  },
  {
    id: "enrichment",
    label: "Enrichissement",
    detail: "Objet nouveau non odorant",
    orientation: "6,2 s",
    attention: "Modérée",
    approach: "1 / 6",
    recovery: "< 15 s",
    response: "low",
    responseLabel: "Réponse faible"
  },
  {
    id: "handling",
    label: "Manipulation neutre",
    detail: "Contact standardisé par opérateur",
    orientation: "3,8 s",
    attention: "Brève",
    approach: "0 / 6",
    recovery: "12 s",
    response: "low",
    responseLabel: "Réponse faible"
  },
  {
    id: "unfamiliar",
    label: "Présence humaine non spécifique",
    detail: "Opérateur inconnu · distance constante",
    orientation: "5,1 s",
    attention: "Modérée",
    approach: "1 / 6",
    recovery: "< 18 s",
    response: "moderate",
    responseLabel: "Réponse modérée"
  },
  {
    id: "control",
    label: "Condition contrôle",
    detail: "Absence de stimulus social",
    orientation: "—",
    attention: "Faible",
    approach: "0 / 6",
    recovery: "Stable",
    response: "low",
    responseLabel: "Référence"
  },
  {
    id: "individual-a",
    label: "Individu A",
    detail: "Stimulus cible · exposition répétée",
    orientation: "0,7 s",
    attention: "Prolongée",
    approach: "6 / 6",
    recovery: "< 10 s au contact",
    response: "high",
    responseLabel: "Réponse forte · reproductible"
  }
];

export const hypotheses: Hypothesis[] = [
  {
    id: "metabolic",
    label: "Affection métabolique",
    category: "Organique",
    expected: "exclude",
    feedback: "Non soutenue par les résultats biochimiques disponibles.",
    rationale: "Le profil métabolique ne met pas en évidence de déséquilibre cohérent avec une réponse aussi sélective."
  },
  {
    id: "neurological",
    label: "Cause neurologique",
    category: "Organique",
    expected: "exclude",
    feedback: "Peu probable au regard de l’examen de base et de la forte spécificité contextuelle.",
    rationale: "L’absence de déficit et la reproductibilité liée au contexte diminuent cette hypothèse."
  },
  {
    id: "cardiorespiratory",
    label: "Affection cardio-respiratoire primaire",
    category: "Organique",
    expected: "exclude",
    feedback: "Peu soutenue. Les variations observées semblent secondaires à l’exposition.",
    rationale: "Les paramètres au repos sont rassurants et la variation n’est pas spontanée."
  },
  {
    id: "pain",
    label: "Processus douloureux",
    category: "Clinique",
    expected: "exclude",
    feedback: "Non soutenu par l’examen clinique et l’évolution rapportée.",
    rationale: "Appétit, locomotion et manipulation restent conservés en dehors du contexte étudié."
  },
  {
    id: "toxic",
    label: "Cause toxique",
    category: "Environnement",
    expected: "exclude",
    feedback: "Non retenue.",
    rationale: "Une intoxication n’expliquerait pas aussi bien la sélectivité et la résolution au rapprochement."
  },
  {
    id: "primary-behavioral",
    label: "Syndrome comportemental primaire",
    category: "Comportement",
    expected: "uncertain",
    feedback: "Ne suffit pas à expliquer la présence d’un signal unique et reproductible.",
    rationale: "Une composante comportementale existe, mais elle est structurée autour d’un facteur précis."
  },
  {
    id: "specific-stimulus",
    label: "Réponse spécifique à un stimulus identifié",
    category: "Comportement",
    expected: "retain",
    feedback: "Compatible avec la sélectivité, la répétabilité et l’évolution du phénomène.",
    rationale: "Cette hypothèse est la seule à rendre compte de l’ensemble des observations sans ajouter de maladie non documentée."
  }
];
