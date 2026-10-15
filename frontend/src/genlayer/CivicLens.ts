/**
 * CivicLens contract service — the only file that talks to genlayer-js.
 *
 * Method names, argument order, and return shapes come from the saved schema
 * (docs/civic_lens.schema.json) and contracts/civic_lens.py; the SDK calls
 * are verified against genlayer-js 1.1.8 typings. Components and hooks never
 * import the SDK directly (UI-CivicLens section 0.2).
 *
 * Reads vs writes are deliberately separate:
 * - reads  -> readContract (instant, no wallet needed)
 * - writes -> writeContract returns a tx HASH immediately; callers drive the
 *   submitted -> pending -> accepted -> final lifecycle through
 *   waitForAccept() / pollTransaction() so the UI never blocks on a wallet
 *   popup and never shows "accepted" as permanent.
 */

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  ContractConstants,
  Criterion,
  EvidenceItem,
  Outcome,
  RoundRecord,
} from "../domain/types";
import type { ReceiptLike } from "../domain/finality";

export type HexAddress = `0x${string}`;
export type TxHash = `0x${string}`;

export interface CreateCommitmentInput {
  subject: string;
  subjectKind: string;
  registrantRole: string;
  sourceStatementRef: string;
  commitmentText: string;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  sourceGuidance: string;
  dataMode: string;
  criteriaJson: string;
}

export interface SubmitEvidenceInput {
  commitmentId: number;
  url: string;
  evidenceType: string;
  publishedDate: string;
  note: string;
}

export interface OpenChallengeInput {
  commitmentId: number;
  target: string; // "" = whole outcome, else criterion id as string
  grounds: string;
  newEvidenceIds: number[];
}

const ACCEPT_RETRIES = 100;
const ACCEPT_INTERVAL = 3000;

export class CivicLens {
  readonly address: HexAddress;
  private readonly client: ReturnType<typeof createClient>;

  constructor(contractAddress: string, walletAddress?: string | null, endpoint?: string) {
    this.address = contractAddress as HexAddress;
    const config: {
      chain: typeof studionet;
      account?: HexAddress;
      endpoint?: string;
    } = { chain: studionet };
    if (walletAddress) config.account = walletAddress as HexAddress;
    if (endpoint) config.endpoint = endpoint;
    this.client = createClient(config);
  }

  // -------------------------------------------------------------------------
  // Reads (instant, no wallet required)
  // -------------------------------------------------------------------------

  async getConstants(): Promise<ContractConstants> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_constants",
      args: [],
    })) as unknown as ContractConstants;
  }

  async getCommitments(pageSize: number, beforeId = 0): Promise<CommitmentSummary[]> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_commitments",
      args: [pageSize, beforeId],
    })) as unknown as CommitmentSummary[];
  }

  async getCommitment(id: number): Promise<Commitment> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_commitment",
      args: [id],
    })) as unknown as Commitment;
  }

  async getEvidence(id: number): Promise<EvidenceItem[]> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_evidence",
      args: [id],
    })) as unknown as EvidenceItem[];
  }

  async getRounds(id: number): Promise<RoundRecord[]> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_rounds",
      args: [id],
    })) as unknown as RoundRecord[];
  }

  async getOutcome(id: number): Promise<Outcome> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_outcome",
      args: [id],
    })) as unknown as Outcome;
  }

  async getChallenges(id: number): Promise<ChallengeRecord[]> {
    return (await this.client.readContract({
      address: this.address,
      functionName: "get_challenges",
      args: [id],
    })) as unknown as ChallengeRecord[];
  }

  /** Convenience: criteria of a commitment (registration snapshot). */
  async getCriteria(id: number): Promise<Criterion[]> {
    const c = await this.getCommitment(id);
    return c.criteria ?? [];
  }

  // -------------------------------------------------------------------------
  // Writes (return a tx hash immediately — caller drives the lifecycle)
  // -------------------------------------------------------------------------

  async createCommitment(input: CreateCommitmentInput): Promise<TxHash> {
    return (await this.client.writeContract({
      address: this.address,
      functionName: "create_commitment",
      args: [
        input.subject,
        input.subjectKind,
        input.registrantRole,
        input.sourceStatementRef,
        input.commitmentText,
        input.periodStart,
        input.periodEnd,
        input.timezone,
        input.sourceGuidance,
        input.dataMode,
        input.criteriaJson,
      ],
      value: 0n,
    })) as TxHash;
  }

  async submitEvidence(input: SubmitEvidenceInput): Promise<TxHash> {
    return (await this.client.writeContract({
      address: this.address,
      functionName: "submit_evidence",
      args: [
        input.commitmentId,
        input.url,
        input.evidenceType,
        input.publishedDate,
        input.note,
      ],
      value: 0n,
    })) as TxHash;
  }

  async requestReview(commitmentId: number): Promise<TxHash> {
    return (await this.client.writeContract({
      address: this.address,
      functionName: "request_review",
      args: [commitmentId],
      value: 0n,
    })) as TxHash;
  }

  async openChallenge(input: OpenChallengeInput): Promise<TxHash> {
    return (await this.client.writeContract({
      address: this.address,
      functionName: "open_challenge",
      args: [
        input.commitmentId,
        input.target,
        input.grounds,
        input.newEvidenceIds,
      ],
      value: 0n,
    })) as TxHash;
  }

  async updateCriteria(commitmentId: number, criteriaJson: string): Promise<TxHash> {
    return (await this.client.writeContract({
      address: this.address,
      functionName: "update_criteria",
      args: [commitmentId, criteriaJson],
      value: 0n,
    })) as TxHash;
  }

  async withdrawCommitment(commitmentId: number): Promise<TxHash> {
    return (await this.client.writeContract({
      address: this.address,
      functionName: "withdraw_commitment",
      args: [commitmentId],
      value: 0n,
    })) as TxHash;
  }

  // -------------------------------------------------------------------------
  // Transaction lifecycle (verified genlayer-js APIs)
  // -------------------------------------------------------------------------

  /** Block until the tx reaches a decided state (ACCEPTED *or* CANCELED...). */
  async waitForAccept(hash: TxHash): Promise<ReceiptLike> {
    return (await this.client.waitForTransactionReceipt({
      hash: hash as never,
      status: "ACCEPTED" as never,
      retries: ACCEPT_RETRIES,
      interval: ACCEPT_INTERVAL,
    })) as ReceiptLike;
  }

  /** Non-blocking receipt/status fetch — used for polling and finality. */
  async getTransaction(hash: TxHash): Promise<ReceiptLike> {
    return (await this.client.getTransaction({ hash: hash as never })) as ReceiptLike;
  }

  /** Is the appeal window still open for this tx? (finality chip) */
  async canAppeal(hash: TxHash): Promise<boolean> {
    try {
      return await this.client.canAppeal({ txId: hash as never });
    } catch {
      return false;
    }
  }
}

export default CivicLens;
