import { describe, expect, it } from "vitest";
import {
  getHypothesisFeedback,
  getProgressPercent,
  getReviewStatus
} from "./domain";
import { diagnosticPanels, hypotheses } from "./data";

const panelIds = diagnosticPanels.map((panel) => panel.id);
const hypothesisIds = hypotheses.map((hypothesis) => hypothesis.id);

describe("progression clinique", () => {
  it("calcule le pourcentage à partir des sections uniques", () => {
    expect(getProgressPercent(["overview", "history", "history"])).toBe(33);
    expect(getProgressPercent(["overview", "history", "examination"])).toBe(50);
  });

  it("identifie les trois examens à reprendre après sept classifications", () => {
    const review = getReviewStatus(["behavior"], panelIds, hypothesisIds, hypothesisIds);
    expect(review.ready).toBe(false);
    expect(review.missingPanels).toEqual(["hematology", "biochemistry", "exploration"]);
    expect(review.missingHypotheses).toEqual([]);
  });

  it("identifie la classification manquante sans exiger la réponse attendue", () => {
    const review = getReviewStatus(panelIds, panelIds, hypothesisIds.slice(1), hypothesisIds);
    expect(review.missingPanels).toEqual([]);
    expect(review.missingHypotheses).toEqual(["metabolic"]);
    expect(review.ready).toBe(false);
    expect(getReviewStatus(panelIds, panelIds, hypothesisIds, hypothesisIds).ready).toBe(true);
  });

  it("ne compte pas les doublons ni les identifiants inconnus comme des examens", () => {
    const review = getReviewStatus(["behavior", "behavior", "unknown", "unknown"], panelIds, hypothesisIds, hypothesisIds);
    expect(review.ready).toBe(false);
    expect(review.missingPanels).toHaveLength(3);
  });

  it("retourne un feedback contextualisé pour un choix enregistré", () => {
    expect(getHypothesisFeedback("retain", "retain", "Hypothèse compatible.")).toBe(
      "Hypothèse compatible."
    );
    expect(getHypothesisFeedback("exclude", "retain", "Non soutenue.")).toContain(
      "Choix enregistré"
    );
  });
});
