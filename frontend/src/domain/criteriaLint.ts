/**
 * Deterministic pre-flight hints for criterion wording (register page).
 *
 * These are reading aids, not verdicts. Consensus decides with the contract's
 * rules: a criterion a review cannot match to evidence comes back
 * `inconclusive` with reason `criterion_ambiguous` — which costs a review
 * round. Nothing here blocks submission, and nothing here predicts an outcome.
 */

import { parseToMilli } from "./format";

export interface LintHint {
  id: string;
  text: string;
}

/**
 * Words that mean different things to different readers. Kept deliberately
 * short and explainable: each one is wording a review cannot compare against
 * a document without interpreting it.
 */
export const VAGUE_TERMS = [
  "significant",
  "significantly",
  "substantial",
  "substantially",
  "meaningful",
  "material",
  "major",
  "adequate",
  "appropriate",
  "appropriately",
  "reasonable",
  "timely",
  "soon",
  "improved",
  "better",
  "robust",
  "comprehensive",
  "leading",
  "world-class",
  "best efforts",
  "as soon as possible",
];

/** Wording that implies a measurable change, which needs a threshold. */
const CHANGE_RE =
  /\b(increase[sd]?|decrease[sd]?|reduce[sd]?|reduction|cut|cuts|double[sd]?|triple[sd]?|halve[sd]?|halved|grow|growth|percent|%)\b/i;

export interface CriterionLintInput {
  text: string;
  measure: string;
  hasThreshold: boolean;
  threshold: string;
  unit: string;
}

export function lintCriterion(input: CriterionLintInput): LintHint[] {
  const hints: LintHint[] = [];
  const text = input.text.trim();
  const measure = input.measure.trim();
  if (text.length === 0) return hints; // blank criterion, not a target

  const vague = VAGUE_TERMS.filter((term) =>
    new RegExp(`\\b${escapeRe(term)}\\b`, "i").test(text),
  );
  if (vague.length > 0) {
    const shown = vague
      .slice(0, 2)
      .map((t) => `“${t}”`)
      .join(", ");
    hints.push({
      id: "vague-terms",
      text: `${shown} means different things to different readers. Say the amount, date, or event that decides it.`,
    });
  }

  if (!input.hasThreshold && (CHANGE_RE.test(text) || /\d/.test(text))) {
    hints.push({
      id: "no-threshold",
      text: "The wording mentions something measurable but no threshold is set. Without one a review has to interpret the words, and criteria that cannot be matched to evidence come back inconclusive.",
    });
  }

  if (measure.length === 0) {
    hints.push({
      id: "no-measure",
      text: "No measure yet. The measure is the observable fact that decides this criterion — a report, dataset, or figure a reviewer can open.",
    });
  }

  if (input.hasThreshold && input.threshold.trim().length > 0) {
    if (parseToMilli(input.threshold) === null) {
      hints.push({
        id: "threshold-not-numeric",
        text: "The threshold takes a plain number (e.g. 4.2), so a review can compare figures against it.",
      });
    }
    if (input.unit.trim().length === 0) {
      hints.push({
        id: "threshold-no-unit",
        text: "Give the threshold a unit. A figure reported in a different unit reads as inconclusive.",
      });
    }
  }

  return hints;
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
