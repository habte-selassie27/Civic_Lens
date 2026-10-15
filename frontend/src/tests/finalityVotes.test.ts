/**
 * validatorAgreement: per-validator votes read from the IC receipt's last
 * round. Names and numeric VoteType codes must both resolve; no votes yet
 * must resolve to null — consensus is never implied.
 */

import { describe, expect, it } from "vitest";
import { validatorAgreement } from "@/domain/finality";

describe("validatorAgreement", () => {
  it("counts named votes", () => {
    const receipt = {
      lastRound: {
        round: "2",
        validatorVotesName: ["AGREE", "AGREE", "AGREE", "AGREE", "AGREE"],
      },
    };
    expect(validatorAgreement(receipt)).toEqual({ agreed: 5, total: 5, round: 2 });
  });

  it("accepts numeric codes (VoteType mapping) and mixed case", () => {
    const receipt = { lastRound: { round: 1, validatorVotesName: [1, "agree", 2, 0] } };
    expect(validatorAgreement(receipt)).toEqual({ agreed: 2, total: 4, round: 1 });
  });

  it("reports a split honestly", () => {
    const receipt = { lastRound: { validatorVotesName: ["AGREE", "DISAGREE"] } };
    expect(validatorAgreement(receipt)).toEqual({ agreed: 1, total: 2, round: null });
  });

  it("returns null when no votes exist yet", () => {
    expect(validatorAgreement({})).toBeNull();
    expect(validatorAgreement({ lastRound: { validatorVotesName: [] } })).toBeNull();
  });
});
