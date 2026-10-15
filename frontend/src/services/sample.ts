/**
 * Sample data source — the bundled scenarios, served with honest labels.
 *
 * UI-CivicLens section 8: the demo must show every interesting outcome without
 * waiting on live evidence, and must never present sample outcomes as findings
 * about real entities. This service exists only when no contract address is
 * configured; `isSample` is true and every surface inherits that badge.
 *
 * There is deliberately NO write path here. A sample-mode app has no contract
 * to write to, and faking a transaction is exactly what the spec forbids.
 */

import { CONFIG_HINT } from "@/config/contracts";
import {
  EVIDENCE_TYPES,
  OPERATORS,
  REGISTRANT_ROLES,
  REASON_CODES,
  REVIEW_STATUSES,
  COMMITMENT_STATUSES,
  SUBJECT_KINDS,
  DATA_MODES,
} from "@/domain/types";
import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  ContractConstants,
  EvidenceItem,
  Outcome,
} from "@/domain/types";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import {
  SCENARIOS,
  SCENARIO_SUMMARIES,
  getScenario,
  type Scenario,
} from "@/domain/fixtures";
import type { CivicLensReads, CommitmentBundle } from "./types";

/** Mirrors contracts/civic_lens.py get_constants() so both sources agree. */
const SAMPLE_CONSTANTS: ContractConstants = {
  ...FALLBACK_CONSTANTS,
  subject_kinds: [...SUBJECT_KINDS],
  registrant_roles: [...REGISTRANT_ROLES],
  data_modes: [...DATA_MODES],
  evidence_types: [...EVIDENCE_TYPES],
  operators: [...OPERATORS],
  review_statuses: [...REVIEW_STATUSES],
  reason_codes: [...REASON_CODES],
  commitment_statuses: [...COMMITMENT_STATUSES],
};

/** Small latency so skeleton states are real, not theoretical. */
const LATENCY_MS = 180;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

class SampleService implements CivicLensReads {
  readonly isSample = true;
  readonly sampleReason: string;

  constructor() {
    this.sampleReason = CONFIG_HINT ?? "Running on bundled sample scenarios.";
  }

  async getConstants(): Promise<ContractConstants> {
    return delay(SAMPLE_CONSTANTS);
  }

  async listCommitments(pageSize: number): Promise<CommitmentSummary[]> {
    return delay(SCENARIO_SUMMARIES.slice(0, pageSize));
  }

  async getBundle(commitmentId: number): Promise<CommitmentBundle> {
    const scenario = this.scenario(commitmentId);
    return delay({
      commitment: scenario.commitment,
      evidence: scenario.evidence,
      rounds: scenario.rounds,
      outcome: scenario.outcome,
      challenges: scenario.challenges,
    });
  }

  // -- granular reads (same fixtures, one record each) ----------------------

  async getCommitment(commitmentId: number): Promise<Commitment> {
    return delay(this.scenario(commitmentId).commitment);
  }

  async getEvidence(commitmentId: number): Promise<EvidenceItem[]> {
    return delay(this.scenario(commitmentId).evidence);
  }

  async getOutcome(commitmentId: number): Promise<Outcome> {
    return delay(this.scenario(commitmentId).outcome);
  }

  async getChallenges(commitmentId: number): Promise<ChallengeRecord[]> {
    return delay(this.scenario(commitmentId).challenges);
  }

  private scenario(commitmentId: number): Scenario {
    const scenario = SCENARIOS.find((s) => s.commitment.id === commitmentId);
    if (!scenario) {
      throw new Error(`EXPECTED: commitment ${commitmentId} is not in the sample set`);
    }
    return scenario;
  }
}

export function createSampleService(): SampleService {
  return new SampleService();
}

export { getScenario, SCENARIOS };
export type { Scenario };