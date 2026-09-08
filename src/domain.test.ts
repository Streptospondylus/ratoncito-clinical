import { describe, expect, it } from "vitest";
import {
  getHypothesisFeedback,
  getProgressPercent,
  isReadyForSynthesis
} from "./domain";

describe("progression clinique", () => {
  it("calcule le pourcentage à partir des sections uniques", () => {
    expect(getProgressPercent(["overview", "history", "history"])).toBe(33);
    expect(getProgressPercent(["overview", "history", "examination"])).toBe(50);
  });

  it("n’autorise la synthèse que lorsque les deux étapes sont complètes", () => {
    expect(isReadyForSynthesis(4, 4, 7, 7)).toBe(true);
    expect(isReadyForSynthesis(3, 4, 7, 7)).toBe(false);
    expect(isReadyForSynthesis(4, 4, 6, 7)).toBe(false);
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
