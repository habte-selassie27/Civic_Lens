/**
 * Config-health inspection (domain/health) — the checks behind /status.
 *
 * The failure this guards against actually happened: an address pointed at an
 * older build whose constants payload was missing fields the UI consumes, and
 * every page that used them came down. inspectConstants is the client-side
 * detector for exactly that class of drift.
 */

import { describe, expect, it } from "vitest";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import { HARDENED_CONSTANT_KEYS, inspectConstants } from "@/domain/health";
import type { ContractConstants } from "@/domain/types";

function fullPayload(): Record<string, unknown> {
  const hardened = Object.fromEntries(
    HARDENED_CONSTANT_KEYS.map((key) => [key, key === "max_quote_len" ? 2000 : "recorded"]),
  );
  return {
    ...FALLBACK_CONSTANTS,
    subject_kinds: ["organization", "institution", "individual"],
    registrant_roles: ["organization", "observer"],
    data_modes: ["live", "sample"],
    evidence_types: ["official_report", "other"],
    operators: ["gte", "lte"],
    review_statuses: ["supported", "contradicted", "inconclusive"],
    reason_codes: ["no_relevant_evidence"],
    commitment_statuses: [
      "evidence_open",
      "review_pending",
      "outcome_accepted",
      "challenged",
      "withdrawn",
      "superseded",
    ],
    ...hardened,
  };
}

describe("inspectConstants", () => {
  it("reports a clean shape for the full hardened payload", () => {
    const report = inspectConstants(fullPayload() as Partial<ContractConstants>);
    expect(report.missingRequired).toEqual([]);
    expect(report.missingHardened).toEqual([]);
    expect(report.enumProblems).toEqual([]);
    expect(report.boundDiffs).toEqual([]);
  });

  it("flags required keys a stale or foreign contract does not answer with", () => {
    const payload = fullPayload();
    delete payload.max_criteria;
    const report = inspectConstants(payload as Partial<ContractConstants>);
    expect(report.missingRequired).toContain("max_criteria");
  });

  it("flags the hardened keys that mark an older build", () => {
    const payload = fullPayload();
    delete payload.retrieval_statuses;
    delete payload.max_quote_len;
    const report = inspectConstants(payload as Partial<ContractConstants>);
    expect(report.missingRequired).toEqual([]);
    expect(report.missingHardened).toEqual(["retrieval_statuses", "max_quote_len"]);
  });

  it("flags enum members the UI needs that the payload lacks", () => {
    const payload = fullPayload();
    payload.review_statuses = ["supported", "contradicted"];
    const report = inspectConstants(payload as Partial<ContractConstants>);
    expect(report.enumProblems).toEqual(['review_statuses does not include "inconclusive"']);
  });

  it("reports deployed bounds that differ from the app snapshot", () => {
    const payload = fullPayload();
    payload.max_criteria = 9;
    const report = inspectConstants(payload as Partial<ContractConstants>);
    expect(report.boundDiffs).toEqual([{ key: "max_criteria", app: 5, deployed: 9 }]);
  });

  it("handles a null payload without throwing", () => {
    const report = inspectConstants(null);
    expect(report.missingRequired.length).toBeGreaterThan(0);
  });
});
