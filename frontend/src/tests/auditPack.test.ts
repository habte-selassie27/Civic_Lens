/**
 * buildAuditPack: the JSON a journalist or auditor keeps.
 *
 * The load-bearing rules: a sample record carries no verify commands (there is
 * nothing to verify against), a missing transaction hash never becomes a
 * fabricated one, and the CLI commands are the exact schema-verified reads.
 */

import { describe, expect, it } from "vitest";
import {
  AUDIT_NOTICE,
  auditCommands,
  auditPackFilename,
  buildAuditPack,
} from "@/domain/auditPack";
import type { CommitmentBundle } from "@/services/types";
import type { Commitment } from "@/domain/types";

const ADDRESS = "0xA8cc5b18C4ED3b3F5122bE02c972C17f224b27d6";
const HASH = `0x${"a".repeat(64)}`;

const commitment: Commitment = {
  id: 7,
  registrant: "0xabc0000000000000000000000000000000000001",
  registrant_role: "observer",
  subject: "Example Organization",
  subject_kind: "organization",
  source_statement_ref: "https://example.org/statement",
  commitment_text: "Example text",
  criteria: [],
  period_start: "2026-01-01",
  period_end: "2026-12-31",
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
};

const bundle: CommitmentBundle = {
  commitment,
  evidence: [],
  rounds: [],
  outcome: { commitment_id: 7, has_outcome: false, round: 0, status: "evidence_open" },
  challenges: [],
};

describe("buildAuditPack", () => {
  it("packs a live record with the exact schema-verified CLI reads", () => {
    const pack = buildAuditPack({
      bundle,
      dataSource: "live",
      contractAddress: ADDRESS,
      finality: { state: "accepted", hash: HASH },
      votes: { agreed: 5, total: 5, round: 2 },
      generatedAt: new Date("2026-01-02T03:04:05Z"),
    });

    expect(pack.format).toBe("civiclens.audit-pack/1");
    expect(pack.generated_at).toBe("2026-01-02T03:04:05.000Z");
    expect(pack.data_source).toBe("live");
    expect(pack.record.commitment.id).toBe(7);

    expect(pack.verify.commands).toHaveLength(6);
    expect(pack.verify.commands[0]).toBe(
      `genlayer call ${ADDRESS} get_commitment --args 7`,
    );
    expect(pack.verify.commands).toContain(`genlayer call ${ADDRESS} get_rounds --args 7`);
    expect(pack.verify.commands).toContain(`genlayer call ${ADDRESS} get_evidence --args 7`);
    expect(pack.verify.commands).toContain(`genlayer call ${ADDRESS} get_outcome --args 7`);
    expect(pack.verify.commands).toContain(`genlayer call ${ADDRESS} get_challenges --args 7`);
    expect(pack.verify.commands[5]).toBe(`genlayer receipt ${HASH}`);

    expect(pack.finality.tx_hash).toBe(HASH);
    expect(pack.finality.tx_hash_source).toMatch(/browser/i);
    expect(pack.finality.validator_votes).toEqual({ agreed: 5, total: 5, round: 2 });
  });

  it("never invents a hash when none was resolved", () => {
    const pack = buildAuditPack({
      bundle,
      dataSource: "live",
      contractAddress: ADDRESS,
      finality: { state: "none", hash: null },
      votes: null,
    });
    expect(pack.verify.commands).toHaveLength(5);
    expect(pack.verify.commands.every((c) => !c.startsWith("genlayer receipt"))).toBe(true);
    expect(pack.finality.tx_hash).toBeNull();
    expect(pack.finality.tx_hash_source).toBeNull();
    expect(pack.finality.validator_votes).toBeNull();
  });

  it("labels a sample record and offers nothing to verify", () => {
    const pack = buildAuditPack({
      bundle,
      dataSource: "sample",
      contractAddress: null,
      finality: { state: "none", hash: null },
      votes: null,
    });
    expect(pack.data_source).toBe("sample");
    expect(pack.verify.commands).toEqual([]);
    expect(pack.verify.note).toMatch(/sample data/i);
  });

  it("repeats what an outcome is and is not", () => {
    expect(AUDIT_NOTICE).toMatch(/not proof/i);
    expect(AUDIT_NOTICE).toMatch(/intent/i);
  });

  it("names the file after the commitment", () => {
    expect(auditPackFilename(7)).toBe("civiclens-commitment-7-audit.json");
  });

  it("builds the five reads for any id", () => {
    expect(auditCommands(ADDRESS, 12)).toHaveLength(5);
    expect(auditCommands(ADDRESS, 12)[0]).toContain("--args 12");
  });
});
