/**
 * Live data source — the only place that constructs the SDK client.
 *
 * Reads go through genlayer-js `readContract`, writes through `writeContract`
 * (which returns a hash immediately). Components never import genlayer-js;
 * they go through the service layer above (UI-CivicLens section 9).
 */

import CivicLens from "@/genlayer/CivicLens";
import { CONTRACT_ADDRESS, FALLBACK_CONSTANTS, READ_METHODS, WRITE_METHODS } from "@/config/contracts";
import { RPC_URL } from "@/config/network";
import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  ContractConstants,
  EvidenceItem,
  Outcome,
} from "@/domain/types";
import type { ReceiptLike } from "@/domain/finality";
import type {
  CivicLensReads,
  CivicLensWrites,
  CommitmentBundle,
  CreateCommitmentInput,
  OpenChallengeInput,
  SubmitEvidenceInput,
  SupersedeCommitmentInput,
  TxHash,
} from "./types";

export class NotConfiguredError extends Error {
  constructor() {
    super("No contract address configured.");
    this.name = "NotConfiguredError";
  }
}

class LiveService implements CivicLensReads, CivicLensWrites {
  readonly isSample = false;
  readonly sampleReason = null;

  private readonly contract: CivicLens;

  constructor() {
    if (!CONTRACT_ADDRESS) throw new NotConfiguredError();
    this.contract = new CivicLens(CONTRACT_ADDRESS, undefined, RPC_URL);
  }

  // -- reads ---------------------------------------------------------------

  async getConstants(): Promise<ContractConstants> {
    return this.contract.getConstants();
  }

  async listCommitments(pageSize: number): Promise<CommitmentSummary[]> {
    return this.contract.getCommitments(pageSize, 0);
  }

  async getBundle(commitmentId: number): Promise<CommitmentBundle> {
    // Parallel, not sequential: these are five independent reads of the same
    // record, and a Studio round trip is ~1-2s. Chaining them made the
    // commitment page take ten seconds to appear instead of two.
    const [commitment, evidence, rounds, outcome, challenges] = await Promise.all([
      this.contract.getCommitment(commitmentId),
      this.contract.getEvidence(commitmentId),
      this.contract.getRounds(commitmentId),
      this.contract.getOutcome(commitmentId),
      this.contract.getChallenges(commitmentId),
    ]);
    return { commitment, evidence, rounds, outcome, challenges };
  }

  // Granular reads: one contract call each, for bounded-window scans.

  async getCommitment(commitmentId: number): Promise<Commitment> {
    return this.contract.getCommitment(commitmentId);
  }

  async getEvidence(commitmentId: number): Promise<EvidenceItem[]> {
    return this.contract.getEvidence(commitmentId);
  }

  async getOutcome(commitmentId: number): Promise<Outcome> {
    return this.contract.getOutcome(commitmentId);
  }

  async getChallenges(commitmentId: number): Promise<ChallengeRecord[]> {
    return this.contract.getChallenges(commitmentId);
  }

  // -- writes --------------------------------------------------------------

  createCommitment(input: CreateCommitmentInput): Promise<TxHash> {
    return this.contract.createCommitment(input);
  }

  supersedeCommitment(input: SupersedeCommitmentInput): Promise<TxHash> {
    return this.contract.supersedeCommitment(input);
  }

  withdrawCommitment(commitmentId: number): Promise<TxHash> {
    return this.contract.withdrawCommitment(commitmentId);
  }

  submitEvidence(input: SubmitEvidenceInput): Promise<TxHash> {
    return this.contract.submitEvidence(input);
  }

  requestReview(commitmentId: number): Promise<TxHash> {
    return this.contract.requestReview(commitmentId);
  }

  openChallenge(input: OpenChallengeInput): Promise<TxHash> {
    return this.contract.openChallenge(input);
  }

  waitForAccept(hash: TxHash): Promise<ReceiptLike> {
    return this.contract.waitForAccept(hash);
  }

  getTransaction(hash: TxHash): Promise<ReceiptLike> {
    return this.contract.getTransaction(hash);
  }
}

/** Assert the method names still match the saved schema. */
export const SCHEMA_METHODS = { ...READ_METHODS, ...WRITE_METHODS };

/** Client-side bound snapshot, used before the first getConstants resolves. */
export const FALLBACK_BOUNDS = FALLBACK_CONSTANTS;

export function createLiveService(): LiveService {
  return new LiveService();
}