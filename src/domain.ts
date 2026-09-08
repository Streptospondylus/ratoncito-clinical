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

export function isReadyForSynthesis(
  openedDiagnosticPanels: number,
  totalDiagnosticPanels: number,
  classifiedHypotheses: number,
  totalHypotheses: number
): boolean {
  return (
    openedDiagnosticPanels >= totalDiagnosticPanels &&
    classifiedHypotheses >= totalHypotheses
  );
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

  return "Choix enregistré. Les éléments du dossier orientent toutefois plutôt vers une réponse contextuelle sélective.";
}
