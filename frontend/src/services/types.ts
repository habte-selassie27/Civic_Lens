/**
 * Service contracts (UI-CivicLens section 9).
 *
 * Pages and components depend only on these interfaces, never on genlayer-js
 * and never on fixtures. That is what lets the app run honestly on sample data
 * before a contract address exists, and switch to live reads without any page
 * knowing the difference.
 */

import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  ContractConstants,
  EvidenceItem,
  Outcome,
  RoundRecord,
} from "@/domain/types";
import type { ReceiptLike } from "@/domain/finality";

export type TxHash = `0x${string}`;

/** Everything a commitment page renders, fetched together. */
export interface CommitmentBundle {
  commitment: Commitment;
  evidence: EvidenceItem[];
  rounds: RoundRecord[];
  outcome: Outcome;
  challenges: ChallengeRecord[];
}

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

/**
 * The only legal way to change a criterion: a linked new version. Same fields
 * as creation plus the record being superseded — the contract marks the old
 * one `superseded` and links both directions; nothing is rewritten.
 */
export type SupersedeCommitmentInput = CreateCommitmentInput & { oldId: number };

export interface SubmitEvidenceInput {
  commitmentId: number;
  url: string;
  evidenceType: string;
  publishedDate: string;
  note: string;
}

export interface OpenChallengeInput {
  commitmentId: number;
  /** "" targets the whole outcome; otherwise a criterion id as a decimal string. */
  target: string;
  grounds: string;
  newEvidenceIds: number[];
}

/**
 * Reads. Always available: when the app runs on sample data these are served
 * from the bundled fixtures, and `isSample` is true so the UI can say so.
 */
export interface CivicLensReads {
  isSample: boolean;
  /** Why the app is on sample data, or null when it is on live evidence. */
  sampleReason: string | null;
  getConstants(): Promise<ContractConstants>;
  listCommitments(pageSize: number): Promise<CommitmentSummary[]>;
  getBundle(commitmentId: number): Promise<CommitmentBundle>;
  /**
   * The four granular reads below exist for bounded-window scans (activity,
   * stats, version chains) where fetching full bundles would multiply reads
   * for data the page does not display.
   */
  getCommitment(commitmentId: number): Promise<Commitment>;
  getEvidence(commitmentId: number): Promise<EvidenceItem[]>;
  getOutcome(commitmentId: number): Promise<Outcome>;
  getChallenges(commitmentId: number): Promise<ChallengeRecord[]>;
}

/**
 * Writes. Only present when a contract address is configured — a sample-mode
 * app must never pretend a transaction happened, so there is no write path at
 * all rather than a fake one.
 */
export interface CivicLensWrites {
  createCommitment(input: CreateCommitmentInput): Promise<TxHash>;
  /** Registrant-only: linked new version; the old record is marked superseded. */
  supersedeCommitment(input: SupersedeCommitmentInput): Promise<TxHash>;
  /** Registrant-only, only while the evidence window is still open. */
  withdrawCommitment(commitmentId: number): Promise<TxHash>;
  submitEvidence(input: SubmitEvidenceInput): Promise<TxHash>;
  requestReview(commitmentId: number): Promise<TxHash>;
  openChallenge(input: OpenChallengeInput): Promise<TxHash>;
  /** Block until the transaction is decided, then return its receipt. */
  waitForAccept(hash: TxHash): Promise<ReceiptLike>;
  /** One non-blocking receipt fetch, for polling and manual refresh. */
  getTransaction(hash: TxHash): Promise<ReceiptLike>;
}