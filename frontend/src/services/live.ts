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

export class NoAccountError extends Error {
  constructor() {
    super(
      "No wallet account is connected, so nothing was sent. Connect an account, then try again.",
    );
    this.name = "NoAccountError";
  }
}

/**
 * The address writes are signed from.
 *
 * genlayer-js binds the account when a client is *built*, so a client
 * constructed at import time can never know which account the wallet will
 * have later. Reads need no account at all; every write does — the SDK signs
 * through the wallet provider and refuses to start without one.
 *
 * Kept here rather than passed through every call site so there is exactly one
 * answer to "which account do writes use".
 */
let activeAccount: string | null = null;

export function setActiveAccount(address: string | null): void {
  activeAccount = address;
}

export function getActiveAccount(): string | null {
  return activeAccount;
}

class LiveService implements CivicLensReads, CivicLensWrites {
  readonly isSample = false;
  readonly sampleReason = null;

  private readonly reads: CivicLens;

  constructor() {
    if (!CONTRACT_ADDRESS) throw new NotConfiguredError();
    this.reads = new CivicLens(CONTRACT_ADDRESS, undefined, RPC_URL);
  }

  /**
   * A client carrying the connected account, built per write.
   *
   * Built on demand rather than cached: the account can be switched in the
   * wallet at any time, and a cached client would keep signing from the old
   * one. The SDK routes signing through the wallet's provider when `account`
   * is an address — verified against genlayer-js 1.1.8 — so no key is held
   * here. A write with no account fails inside the SDK before the wallet is
   * ever asked, which is why this refuses first, in plain words.
   */
  private forWrite(): CivicLens {
    if (!activeAccount) throw new NoAccountError();
    return new CivicLens(CONTRACT_ADDRESS, activeAccount, RPC_URL);
  }

  // -- reads ---------------------------------------------------------------

  async getConstants(): Promise<ContractConstants> {
    return this.reads.getConstants();
  }

  async listCommitments(pageSize: number): Promise<CommitmentSummary[]> {
    return this.reads.getCommitments(pageSize, 0);
  }

  async getBundle(commitmentId: number): Promise<CommitmentBundle> {
    // Parallel, not sequential: these are five independent reads of the same
    // record, and a Studio round trip is ~1-2s. Chaining them made the
    // commitment page take ten seconds to appear instead of two.
    const [commitment, evidence, rounds, outcome, challenges] = await Promise.all([
      this.reads.getCommitment(commitmentId),
      this.reads.getEvidence(commitmentId),
      this.reads.getRounds(commitmentId),
      this.reads.getOutcome(commitmentId),
      this.reads.getChallenges(commitmentId),
    ]);
    return { commitment, evidence, rounds, outcome, challenges };
  }

  // Granular reads: one contract call each, for bounded-window scans.

  async getCommitment(commitmentId: number): Promise<Commitment> {
    return this.reads.getCommitment(commitmentId);
  }

  async getEvidence(commitmentId: number): Promise<EvidenceItem[]> {
    return this.reads.getEvidence(commitmentId);
  }

  async getOutcome(commitmentId: number): Promise<Outcome> {
    return this.reads.getOutcome(commitmentId);
  }

  async getChallenges(commitmentId: number): Promise<ChallengeRecord[]> {
    return this.reads.getChallenges(commitmentId);
  }

  // -- writes --------------------------------------------------------------
  //
  // Declared `async` on purpose: `forWrite()` can refuse synchronously, and a
  // method typed `Promise<TxHash>` must always hand back a rejected promise
  // rather than throw before it returns. Callers that only `await` cannot tell
  // the difference, but `.catch()` chains and `rejects` assertions can.

  async createCommitment(input: CreateCommitmentInput): Promise<TxHash> {
    return this.forWrite().createCommitment(input);
  }

  async supersedeCommitment(input: SupersedeCommitmentInput): Promise<TxHash> {
    return this.forWrite().supersedeCommitment(input);
  }

  async withdrawCommitment(commitmentId: number): Promise<TxHash> {
    return this.forWrite().withdrawCommitment(commitmentId);
  }

  async submitEvidence(input: SubmitEvidenceInput): Promise<TxHash> {
    return this.forWrite().submitEvidence(input);
  }

  async requestReview(commitmentId: number): Promise<TxHash> {
    return this.forWrite().requestReview(commitmentId);
  }

  async openChallenge(input: OpenChallengeInput): Promise<TxHash> {
    return this.forWrite().openChallenge(input);
  }

  waitForAccept(hash: TxHash): Promise<ReceiptLike> {
    return this.reads.waitForAccept(hash);
  }

  getTransaction(hash: TxHash): Promise<ReceiptLike> {
    return this.reads.getTransaction(hash);
  }
}

/** Assert the method names still match the saved schema. */
export const SCHEMA_METHODS = { ...READ_METHODS, ...WRITE_METHODS };

/** Client-side bound snapshot, used before the first getConstants resolves. */
export const FALLBACK_BOUNDS = FALLBACK_CONSTANTS;

export function createLiveService(): LiveService {
  return new LiveService();
}