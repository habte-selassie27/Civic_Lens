/**
 * Audit pack (commitment page → "Download audit record").
 *
 * One JSON file: the record exactly as the contract returns it, the
 * display-level context a reader needs (finality, validator votes), and the
 * CLI commands to read the same record straight from the contract.
 *
 * Honesty rules baked in:
 * - the transaction hash is only included when this browser (or a shared
 *   ?tx= link) actually resolved one, labelled with where it came from;
 * - sample records say so and carry no commands, because there is no network
 *   record to verify;
 * - the notice repeats what an outcome is, and is not.
 */

import { explorerAddressUrl, explorerTxUrl } from "@/config/explorer";
import type { CommitmentBundle } from "@/services/types";
import type { ValidatorAgreement } from "./finality";
import type { FinalityState } from "./types";

export interface AuditPackInput {
  bundle: CommitmentBundle;
  dataSource: "live" | "sample";
  contractAddress: string | null;
  finality: { state: FinalityState; hash: string | null };
  votes: ValidatorAgreement | null;
  generatedAt?: Date;
}

export interface AuditPack {
  format: "civiclens.audit-pack/1";
  generated_at: string;
  data_source: "live" | "sample";
  notice: string;
  contract: { address: string | null; explorer: string | null };
  record: {
    commitment: CommitmentBundle["commitment"];
    evidence: CommitmentBundle["evidence"];
    rounds: CommitmentBundle["rounds"];
    outcome: CommitmentBundle["outcome"];
    challenges: CommitmentBundle["challenges"];
  };
  finality: {
    state: FinalityState;
    tx_hash: string | null;
    tx_hash_source: string | null;
    tx_explorer: string | null;
    validator_votes: { agreed: number; total: number; round: number | null } | null;
  };
  verify: { note: string; commands: string[] };
}

export const AUDIT_NOTICE =
  "CivicLens records whether submitted public evidence supports the stated criteria. " +
  "It is not proof of real-world fulfilment and says nothing about intent. " +
  "Inconclusive means the evidence did not settle the criterion — it is not a " +
  "finding against anyone. An accepted outcome can still be appealed until its " +
  "transaction finalizes.";

/**
 * The exact reads the page itself used, for the CLI. Schema-verified: every
 * one of these takes the commitment id (`--args <id>`), and the form was
 * confirmed against the deployed contract before being written down.
 */
export function auditCommands(address: string, commitmentId: number): string[] {
  return ["get_commitment", "get_rounds", "get_evidence", "get_outcome", "get_challenges"].map(
    (method) => `genlayer call ${address} ${method} --args ${commitmentId}`,
  );
}

export function buildAuditPack(input: AuditPackInput): AuditPack {
  const { bundle } = input;
  const hash = input.finality.hash;
  const live = input.dataSource === "live" && Boolean(input.contractAddress);

  const commands: string[] = [];
  if (live && input.contractAddress) {
    commands.push(...auditCommands(input.contractAddress, bundle.commitment.id));
    if (hash) commands.push(`genlayer receipt ${hash}`);
  }

  return {
    format: "civiclens.audit-pack/1",
    generated_at: (input.generatedAt ?? new Date()).toISOString(),
    data_source: input.dataSource,
    notice: AUDIT_NOTICE,
    contract: {
      address: input.contractAddress,
      explorer: input.contractAddress ? explorerAddressUrl(input.contractAddress) : null,
    },
    record: {
      commitment: bundle.commitment,
      evidence: bundle.evidence,
      rounds: bundle.rounds,
      outcome: bundle.outcome,
      challenges: bundle.challenges,
    },
    finality: {
      state: input.finality.state,
      tx_hash: hash,
      tx_hash_source: hash
        ? "Resolved from this browser's history or a ?tx= link. The contract does not store it, so it cannot be re-derived from the record alone."
        : null,
      tx_explorer: hash ? explorerTxUrl(hash) : null,
      validator_votes: input.votes
        ? { agreed: input.votes.agreed, total: input.votes.total, round: input.votes.round }
        : null,
    },
    verify: live
      ? {
          note: "Run these with the GenLayer CLI to read the same record straight from the contract and compare it with this file.",
          commands,
        }
      : {
          note: "This record is bundled sample data. No network record exists to verify.",
          commands: [],
        },
  };
}

export function auditPackFilename(commitmentId: number): string {
  return `civiclens-commitment-${commitmentId}-audit.json`;
}
