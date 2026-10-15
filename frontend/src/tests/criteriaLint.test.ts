/**
 * lintCriterion: deterministic pre-flight hints for criterion wording.
 * Hints only — nothing here may read as a verdict or a loaded term.
 */

import { describe, expect, it } from "vitest";
import { lintCriterion, VAGUE_TERMS } from "@/domain/criteriaLint";

const clean = {
  text: "Cuts fleet emissions to at most 2.0 tonnes CO2e per vehicle by 2030",
  measure: "The audited annual sustainability statement reports the fleet figure",
  hasThreshold: true,
  threshold: "2.0",
  unit: "co2e_tonnes",
};

describe("lintCriterion", () => {
  it("stays silent on a specific, measurable criterion", () => {
    expect(lintCriterion(clean)).toEqual([]);
  });

  it("stays silent on an empty draft", () => {
    expect(
      lintCriterion({ text: "  ", measure: "", hasThreshold: false, threshold: "", unit: "" }),
    ).toEqual([]);
  });

  it("flags vague terms and names the term", () => {
    const hints = lintCriterion({ ...clean, text: "Significantly reduces emissions" });
    const vague = hints.find((h) => h.id === "vague-terms");
    expect(vague).toBeDefined();
    expect(vague!.text).toContain("significantly");
  });

  it("flags measurable wording without a threshold", () => {
    const hints = lintCriterion({
      ...clean,
      text: "Reduces emissions by 40 percent",
      hasThreshold: false,
      threshold: "",
      unit: "",
    });
    expect(hints.some((h) => h.id === "no-threshold")).toBe(true);
  });

  it("does not flag change wording once a threshold is set", () => {
    expect(lintCriterion(clean).some((h) => h.id === "no-threshold")).toBe(false);
  });

  it("flags a missing measure", () => {
    expect(lintCriterion({ ...clean, measure: "" }).some((h) => h.id === "no-measure")).toBe(true);
  });

  it("flags a non-numeric threshold and one without a unit", () => {
    expect(
      lintCriterion({ ...clean, threshold: "about two" }).some(
        (h) => h.id === "threshold-not-numeric",
      ),
    ).toBe(true);
    expect(
      lintCriterion({ ...clean, unit: "" }).some((h) => h.id === "threshold-no-unit"),
    ).toBe(true);
  });
});

describe("lint vocabulary", () => {
  it("never uses a loaded outcome word", () => {
    for (const term of VAGUE_TERMS) {
      expect(term).not.toMatch(/\b(failed|failure|false|fraud|broken)\b/);
    }
    const all = lintCriterion({ text: "Significantly sooner", measure: "", hasThreshold: false, threshold: "", unit: "" })
      .map((h) => h.text)
      .join(" ");
    expect(all).not.toMatch(/\b(failed|failure|false|fraud|broken)\b/);
  });
});
