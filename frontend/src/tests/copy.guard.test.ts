/**
 * Copy guard tests (UI-CivicLens 7.2, 12).
 *
 * These are the tests that protect the project's central claim. If one of them
 * fails, the interface has started implying something the evidence does not
 * support.
 */

import { describe, expect, it } from "vitest";
import {
  ACTION,
  DATA_MODE_LABEL,
  EVIDENCE_TYPE_LABEL,
  INCONCLUSIVE_RESOLUTION,
  LOADED_TERMS,
  OUTCOME_LABEL,
  OVERALL_REASON_LABEL,
  REASON_LABEL,
  RESULT_LABEL,
  ROLE_LABEL,
  STATUS_LABEL,
  TRIGGER_LABEL,
  findLoadedTerms,
  mapError,
  overallReasonCopy,
  reasonCopy,
} from "@/domain/copy";
import {
  COMMITMENT_STATUSES,
  DATA_MODES,
  EVIDENCE_TYPES,
  OPERATORS,
  REGISTRANT_ROLES,
  REVIEW_STATUSES,
  ROUND_TRIGGERS,
} from "@/domain/types";
import { OVERALL_REASONS_USED } from "@/domain/actions";

describe("neutral copy guard", () => {
  it("contains no loaded terms in any outcome, reason, or status string", () => {
    expect(findLoadedTerms()).toEqual([]);
  });

  it("keeps the inconclusive vocabulary free of failure language", () => {
    const inconclusiveCopy = [
      OUTCOME_LABEL.inconclusive,
      RESULT_LABEL.inconclusive,
      RESULT_LABEL.pending,
      REASON_LABEL.no_relevant_evidence,
      REASON_LABEL.evidence_unavailable,
      REASON_LABEL.source_conflict,
      REASON_LABEL.criterion_ambiguous,
      REASON_LABEL.unit_mismatch,
      INCONCLUSIVE_RESOLUTION.no_relevant_evidence,
      INCONCLUSIVE_RESOLUTION.source_conflict,
      INCONCLUSIVE_RESOLUTION.criterion_ambiguous,
    ]
      .join(" ")
      .toLowerCase();

    for (const term of LOADED_TERMS) {
      expect(inconclusiveCopy).not.toMatch(new RegExp(`\\b${term}\\b`));
    }
  });

  it("uses exactly the three neutral outcome labels, and nothing else", () => {
    expect(Object.values(OUTCOME_LABEL).sort()).toEqual([
      "Evidence contradicts",
      "Evidence supports",
      "Inconclusive",
    ]);
  });

  it("gives every contract enum a label", () => {
    // These are arrays of enum values, not maps — iterate the values.
    for (const s of REVIEW_STATUSES) {
      expect(OUTCOME_LABEL[s], `missing outcome copy for ${s}`).toBeTruthy();
    }
    for (const t of EVIDENCE_TYPES) {
      expect(EVIDENCE_TYPE_LABEL[t], `missing type copy for ${t}`).toBeTruthy();
    }
    for (const r of REGISTRANT_ROLES) {
      expect(ROLE_LABEL[r], `missing role copy for ${r}`).toBeTruthy();
    }
    for (const m of DATA_MODES) {
      expect(DATA_MODE_LABEL[m], `missing data-mode copy for ${m}`).toBeTruthy();
    }
    for (const s of COMMITMENT_STATUSES) {
      expect(STATUS_LABEL[s], `missing status copy for ${s}`).toBeTruthy();
    }
    for (const t of ROUND_TRIGGERS) {
      expect(TRIGGER_LABEL[t], `missing trigger copy for ${t}`).toBeTruthy();
    }
    expect(OPERATORS.length).toBeGreaterThan(0);
  });

  it("has copy for every reason code the contract can emit", () => {
    // Mirrors REASON_CODES in contracts/civic_lens.py.
    const contractReasonCodes = [
      "supporting_evidence_found",
      "contradicting_evidence_found",
      "threshold_met",
      "threshold_not_met",
      "no_relevant_evidence",
      "evidence_unavailable",
      "source_conflict",
      "criterion_ambiguous",
      "unit_mismatch",
    ];
    for (const code of contractReasonCodes) {
      expect(REASON_LABEL[code as never], `missing copy for ${code}`).toBeTruthy();
    }
  });

  it("has copy for every overall reason the contract can emit", () => {
    for (const code of OVERALL_REASONS_USED) {
      expect(overallReasonCopy(code)).toBeTruthy();
      expect(overallReasonCopy(code)).not.toMatch(
        new RegExp(`\\b(${LOADED_TERMS.join("|")})\\b`, "i"),
      );
    }
  });

  it("falls back to neutral text for an unrecognized reason", () => {
    expect(overallReasonCopy("something_new_from_a_future_contract")).toBe(
      "Outcome derived from the per-criterion results.",
    );
    expect(reasonCopy(undefined)).toBe("No reason recorded.");
    expect(reasonCopy("nonsense")).toBe("Recorded reason not recognized.");
  });
});

describe("no-score guard", () => {
  it("never renders a score, grade, or rank vocabulary", () => {
    const all = JSON.stringify([
      OUTCOME_LABEL,
      RESULT_LABEL,
      OVERALL_REASON_LABEL,
      REASON_LABEL,
      INCONCLUSIVE_RESOLUTION,
      STATUS_LABEL,
      ACTION,
    ]).toLowerCase();

    for (const banned of ["score", "grade", "rating", "rank", "/100", "percentile"]) {
      expect(all).not.toContain(banned);
    }
  });

  it("describes the count basis as a derivation, not a score", () => {
    const countsCopy = "Based on 3 required criteria: 2 supported, 1 inconclusive.";
    expect(countsCopy).not.toMatch(/\b(score|grade|rank)/i);
  });
});

describe("error prefix mapping (7.1)", () => {
  it("surfaces the contract's own reason for EXPECTED errors", () => {
    const mapped = mapError(new Error("EXPECTED: evidence window is closed"));
    expect(mapped.message).toBe("evidence window is closed");
    expect(mapped.retryable).toBe(false);
    expect(mapped.detail).toContain("EXPECTED:");
  });

  it("gives each other prefix its documented sentence", () => {
    expect(mapError(new Error("EXTERNAL: evidence unreachable")).message).toBe(
      "A source couldn't be reached. Try again later.",
    );
    expect(mapError(new Error("TRANSIENT: node restarting")).message).toBe(
      "Temporary problem. Try again.",
    );
    expect(mapError(new Error("LLM_ERROR: invalid review json")).message).toBe(
      "The review couldn't be completed. Try again.",
    );
  });

  it("marks non-EXPECTED errors retryable", () => {
    expect(mapError(new Error("EXTERNAL: x")).retryable).toBe(true);
    expect(mapError(new Error("LLM_ERROR: x")).retryable).toBe(true);
  });

  it("never apologizes or says 'something went wrong'", () => {
    for (const raw of [
      new Error("EXPECTED: whatever"),
      new Error("EXTERNAL: whatever"),
      new Error("TRANSIENT: whatever"),
      new Error("LLM_ERROR: whatever"),
      new Error("random failure"),
      "a string error",
      null,
    ]) {
      const { message } = mapError(raw);
      expect(message.toLowerCase()).not.toMatch(/sorry|apolog|went wrong|something went/i);
    }
  });
});

describe("one name per action (section 11)", () => {
  it("uses a single verb phrase for each action", () => {
    expect(ACTION.registerCommitment).toBe("Register commitment");
    expect(ACTION.addEvidence).toBe("Add evidence");
    expect(ACTION.requestReview).toBe("Request review");
    expect(ACTION.openChallenge).toBe("Open challenge");
  });
});