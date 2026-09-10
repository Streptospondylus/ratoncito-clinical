export type SectionId =
  | "overview"
  | "history"
  | "examination"
  | "diagnostics"
  | "differentials"
  | "synthesis";

export type HypothesisState = "retain" | "uncertain" | "exclude";

export type RevealStage =
  | "idle"
  | "preparing"
  | "variable"
  | "identifying"
  | "revealed"
  | "closed";

export const sectionIds: SectionId[] = [
  "overview",
  "history",
  "examination",
  "diagnostics",
  "differentials",
  "synthesis"
];

export function getProgressPercent(visited: SectionId[]): number {
  return Math.round((new Set(visited).size / sectionIds.length) * 100);
}

export function getReviewStatus(
  openedPanels: string[],
  panelIds: string[],
  classifiedHypotheses: string[],
  hypothesisIds: string[]
) {
  const missingPanels = panelIds.filter((id) => !openedPanels.includes(id));
  const missingHypotheses = hypothesisIds.filter((id) => !classifiedHypotheses.includes(id));
  return {
    missingPanels,
    missingHypotheses,
    ready: missingPanels.length === 0 && missingHypotheses.length === 0
  };
}

export function getHypothesisFeedback(
  expected: HypothesisState,
  actual: HypothesisState | undefined,
  feedback: string
): string {
  if (!actual) {
    return "En attente de classification clinique.";
  }

  if (actual === expected) {
    return feedback;
  }

  return "Choix enregistré. " + feedback;
}
