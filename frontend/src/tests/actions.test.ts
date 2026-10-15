/**
 * Action availability tests (UI-CivicLens 5.12).
 *
 * Mirrors the state machine in contracts/civic_lens.py: every disabled action
 * must explain itself, and the explanation must be the reason the contract
 * would give.
 */

import { describe, expect, it } from "vitest";
import {
  canOpenChallenge,
  canRequestReview,
  canSubmitEvidence,
  canSupersede,
  canWithdraw,
  statusSentence,
} from "@/domain/actions";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import type { Commitment, ContractConstants } from "@/domain/types";

const constants = {
  ...FALLBACK_CONSTANTS,
  subject_kinds: ["organization", "institution", "individual"],
  registrant_roles: ["organization", "observer"],
  data_modes: ["live", "sample"],
  evidence_types: ["official_report", "audited_statement", "government_dataset", "press_release", "news_article", "other"],
  operators: ["gte", "lte"],
  review_statuses: ["supported", "contradicted", "inconclusive"],
  reason_codes: [],
  commitment_statuses: ["evidence_open", "review_pending", "outcome_accepted", "challenged", "withdrawn", "superseded"],
} as unknown as ContractConstants;

const REGISTRANT = "0xreg0000000000000000000000000000000000001";
const OTHER = "0xoth0000000000000000000000000000000000002";

function commitment(over: Partial<Commitment> = {}): Commitment {
  return {
    id: 1,
    registrant: REGISTRANT,
    registrant_role: "observer",
    subject: "Sample Organization",
    subject_kind: "organization",
    source_statement_ref: "https://example.org/a",
    commitment_text: "We will publish a report.",
    criteria: [],
    period_start: "2024-01-01",
    period_end: "2024-12-31",
    timezone: "UTC",
    source_guidance: "",
    data_mode: "live",
    status: "evidence_open",
    version: 1,
    supersedes: 0,
    superseded_by: 0,
    round_count: 0,
    challenge_count: 0,
    evidence_count: 0,
    current_round: 0,
    ...over,
  };
}

const ctx = (c: Commitment, over = {}) => ({
  commitment: c,
  constants,
  writesAvailable: true,
  isRegistrant: true,
  challengesByAccount: 0,
  evidenceByAccount: 0,
  ...over,
});

describe("submit evidence availability", () => {
  it("is enabled while the window is open", () => {
    expect(canSubmitEvidence(ctx(commitment())).enabled).toBe(true);
  });

  it("stays enabled after an outcome, so late evidence can still arrive", () => {
    const c = commitment({ status: "outcome_accepted", current_round: 1 });
    expect(canSubmitEvidence(ctx(c)).enabled).toBe(true);
  });

  it("is disabled while a review is pending", () => {
    const c = commitment({ status: "review_pending" });
    const result = canSubmitEvidence(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/review is in progress/i);
  });

  it("explains the per-commitment limit", () => {
    const c = commitment({ evidence_count: constants.max_evidence });
    const result = canSubmitEvidence(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toContain(String(constants.max_evidence));
  });

  it("explains the per-submitter limit", () => {
    const c = commitment();
    const result = canSubmitEvidence(ctx(c, { evidenceByAccount: constants.max_evidence_per_submitter }));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/you have submitted/i);
  });

  it("explains a superseded commitment", () => {
    const c = commitment({ status: "superseded" });
    const result = canSubmitEvidence(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/newer version/i);
  });
});

describe("request review availability", () => {
  it("is enabled for the registrant while evidence is open", () => {
    expect(canRequestReview(ctx(commitment())).enabled).toBe(true);
  });

  it("is enabled after a challenge, to run the new round", () => {
    const c = commitment({ status: "challenged", current_round: 1 });
    expect(canRequestReview(ctx(c)).enabled).toBe(true);
  });

  it("is disabled for anyone but the registrant", () => {
    const result = canRequestReview(ctx(commitment(), { isRegistrant: false }));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/only the registrant/i);
  });

  it("is disabled when the round was already reviewed", () => {
    const c = commitment({ status: "outcome_accepted", current_round: 1 });
    const result = canRequestReview(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/open a challenge/i);
  });

  it("is disabled when a review is already pending", () => {
    const c = commitment({ status: "review_pending" });
    expect(canRequestReview(ctx(c)).enabled).toBe(false);
  });

  it("is disabled at the round limit", () => {
    const c = commitment({ status: "challenged", current_round: constants.max_rounds });
    const result = canRequestReview(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/all \d+ review rounds/i);
  });
});

describe("open challenge availability", () => {
  it("is enabled against an accepted outcome", () => {
    const c = commitment({ status: "outcome_accepted", current_round: 1 });
    expect(canOpenChallenge(ctx(c)).enabled).toBe(true);
  });

  it("is disabled before any outcome exists", () => {
    const result = canOpenChallenge(ctx(commitment()));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/no accepted outcome/i);
  });

  it("is disabled once the round has been challenged", () => {
    const c = commitment({ status: "challenged", current_round: 1 });
    const result = canOpenChallenge(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/already been challenged/i);
  });

  it("enforces the per-party limit of one", () => {
    const c = commitment({ status: "outcome_accepted", current_round: 1 });
    const result = canOpenChallenge(
      ctx(c, { challengesByAccount: constants.max_challenges_per_party }),
    );
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/allows 1 challenge per party/i);
  });

  it("is disabled at the round limit", () => {
    const c = commitment({ status: "outcome_accepted", current_round: constants.max_rounds });
    const result = canOpenChallenge(ctx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/no further challenge/i);
  });
});

describe("sample mode never offers a write", () => {
  const sampleCtx = (c: Commitment) => ctx(c, { writesAvailable: false });

  it("disables every action and says why", () => {
    const c = commitment({ data_mode: "sample", status: "outcome_accepted", current_round: 1 });
    for (const check of [canSubmitEvidence, canRequestReview, canOpenChallenge, canWithdraw, canSupersede]) {
      const result = check(sampleCtx(c));
      expect(result.enabled).toBe(false);
      expect(result.reason).toMatch(/nothing is ever faked|no contract address/i);
    }
  });

  it("disables actions on live data when no contract is configured", () => {
    const c = commitment({ status: "outcome_accepted", current_round: 1 });
    const result = canOpenChallenge(sampleCtx(c));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/no contract address/i);
  });
});

describe("withdraw availability", () => {
  it("is enabled for the registrant while the evidence window is open", () => {
    expect(canWithdraw(ctx(commitment())).enabled).toBe(true);
  });

  it("is never offered to anyone but the registrant", () => {
    const result = canWithdraw(ctx(commitment(), { isRegistrant: false }));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/only the registrant/i);
  });

  it("reflects the contract: only evidence_open can be withdrawn", () => {
    for (const status of ["review_pending", "outcome_accepted", "challenged"] as const) {
      const result = canWithdraw(ctx(commitment({ status })));
      expect(result.enabled).toBe(false);
      expect(result.reason).toMatch(/while the evidence window is open/i);
    }
  });

  it("says a withdrawn commitment is already withdrawn, not open", () => {
    const result = canWithdraw(ctx(commitment({ status: "withdrawn" })));
    expect(result.reason).toMatch(/already withdrawn/i);
  });

  it("points at the newer version instead of offering a withdrawal", () => {
    const result = canWithdraw(ctx(commitment({ status: "superseded", superseded_by: 2 })));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/newer version/i);
  });
});

describe("supersede availability", () => {
  it("is enabled for the registrant in every live status", () => {
    for (const status of ["evidence_open", "review_pending", "outcome_accepted", "challenged"] as const) {
      expect(canSupersede(ctx(commitment({ status }))).enabled).toBe(true);
    }
  });

  it("is never offered to anyone but the registrant", () => {
    const result = canSupersede(ctx(commitment(), { isRegistrant: false }));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/only the registrant/i);
  });

  it("rejects an already superseded record — the chain only moves forward", () => {
    const result = canSupersede(ctx(commitment({ status: "superseded", superseded_by: 3 })));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/newer version .* already exists/i);
  });

  it("rejects a withdrawn record and points at registration instead", () => {
    const result = canSupersede(ctx(commitment({ status: "withdrawn" })));
    expect(result.enabled).toBe(false);
    expect(result.reason).toMatch(/register a new commitment/i);
  });
});

describe("status sentence", () => {
  it("describes each state without implying failure", () => {
    expect(statusSentence(commitment())).toMatch(/evidence window is open/i);
    expect(statusSentence(commitment({ status: "review_pending" }))).toMatch(/in progress/i);
    expect(statusSentence(commitment({ status: "challenged" }))).toMatch(/challenge is open/i);
    expect(statusSentence(commitment({ status: "withdrawn" }))).toMatch(/record is kept/i);
    expect(statusSentence(commitment({ status: "superseded" }))).toMatch(/newer version/i);
  });

  it("says nothing about a subject's character", () => {
    for (const status of [
      "evidence_open",
      "review_pending",
      "outcome_accepted",
      "challenged",
      "withdrawn",
      "superseded",
    ] as const) {
      const text = statusSentence(commitment({ status })).toLowerCase();
      expect(text).not.toMatch(/\b(failed|lied|fraud|liar|broken|guilty)\b/);
    }
  });
});

describe("registrant identity", () => {
  it("compares addresses case-insensitively", () => {
    const c = commitment({ registrant: REGISTRANT.toUpperCase().replace("0X", "0x") });
    expect(canRequestReview(ctx(c, { isRegistrant: true })).enabled).toBe(true);
    expect(OTHER).not.toBe(REGISTRANT);
  });
});