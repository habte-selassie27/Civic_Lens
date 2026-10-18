/**
 * My activity page (/activity).
 *
 * Wallet-scoped view over a bounded scan. These tests pin the honesty rules:
 * nothing is shown without a connected account, other accounts' rows never
 * appear, a record that could not be read is counted and skipped rather than
 * hidden, and the browser's own transaction memory is shown as the local
 * convenience it is.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const ME = "0x5B3661C576c7001e6d6279C67F3779705d334c89";
const OTHER = "0x0000000000000000000000000000000000AAaa";
const HASH = `0x${"ab".repeat(32)}`;
const PENDING_HASH = `0x${"cd".repeat(32)}`;

const m = vi.hoisted(() => ({
  isSample: true,
  sampleReason: "No contract address configured." as string | null,
  listCommitments: vi.fn(),
  getCommitment: vi.fn(),
  getEvidence: vi.fn(),
  getChallenges: vi.fn(),
  wallet: {
    address: null as string | null,
    isConnected: false,
    hasProvider: true,
    isOnCorrectNetwork: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    switchNetwork: vi.fn(),
  },
}));

vi.mock("@/services", () => ({
  reads: {
    get isSample() {
      return m.isSample;
    },
    get sampleReason() {
      return m.sampleReason;
    },
    listCommitments: (...args: unknown[]) => m.listCommitments(...args),
    getCommitment: (...args: unknown[]) => m.getCommitment(...args),
    getEvidence: (...args: unknown[]) => m.getEvidence(...args),
    getChallenges: (...args: unknown[]) => m.getChallenges(...args),
    getConstants: vi.fn(),
    getBundle: vi.fn(),
    getOutcome: vi.fn(),
  },
  writes: null,
  hasLiveWrites: () => false,
}));

vi.mock("@/genlayer/WalletProvider", () => ({
  useWallet: () => m.wallet,
  WalletProvider: ({ children }: { children: ReactNode }) => children,
}));

import { Activity } from "@/pages/Activity";
import type {
  ChallengeRecord,
  Commitment,
  CommitmentSummary,
  EvidenceItem,
} from "@/domain/types";

function summary(over: Partial<CommitmentSummary> = {}): CommitmentSummary {
  return {
    id: 1,
    subject: "Alpha Trust",
    status: "outcome_accepted",
    data_mode: "live",
    registrant_role: "organization",
    version: 1,
    superseded_by: 0,
    round_count: 1,
    evidence_count: 2,
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    ...over,
  };
}

function commitment(over: Partial<Commitment> = {}): Commitment {
  return {
    id: 1,
    registrant: ME,
    registrant_role: "organization",
    subject: "Alpha Trust",
    subject_kind: "organization",
    source_statement_ref: "https://example.org/statement",
    commitment_text: "We will publish reports.",
    criteria: [],
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    timezone: "UTC",
    source_guidance: "",
    data_mode: "live",
    status: "outcome_accepted",
    version: 1,
    supersedes: 0,
    superseded_by: 0,
    round_count: 1,
    challenge_count: 0,
    evidence_count: 2,
    current_round: 1,
    ...over,
  };
}

function evidence(over: Partial<EvidenceItem> = {}): EvidenceItem {
  return {
    id: 1,
    url: "https://example.org/report-a",
    evidence_type: "official_report",
    declared_source_class: "primary",
    source_class_verified: false,
    published_date: "2026-02-01",
    published_date_verified: false,
    note: "",
    submitter: ME,
    submitted_at: "2026-02-02",
    ...over,
  };
}

function challenge(over: Partial<ChallengeRecord> = {}): ChallengeRecord {
  return {
    id: 1,
    round_challenged: 1,
    challenger: ME,
    target: "1",
    grounds: "The report covers a different year.",
    new_evidence_ids: [2],
    opened_at: "2026-03-01",
    ...over,
  };
}

function renderActivity() {
  return render(
    <MemoryRouter>
      <Activity />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  m.isSample = true;
  m.sampleReason = "No contract address configured.";
  m.wallet.address = null;
  m.wallet.isConnected = false;
  m.wallet.hasProvider = true;

  m.listCommitments.mockResolvedValue([
    summary({ id: 2, subject: "Beta City Council" }),
    summary({ id: 1, subject: "Alpha Trust" }),
  ]);
  m.getCommitment.mockImplementation(async (id: number) =>
    id === 1 ? commitment() : commitment({ id: 2, subject: "Beta City Council", registrant: OTHER }),
  );
  m.getEvidence.mockImplementation(async (id: number) =>
    id === 1
      ? [evidence(), evidence({ id: 2, url: "https://example.org/other", submitter: OTHER })]
      : [],
  );
  m.getChallenges.mockImplementation(async (id: number) =>
    id === 1 ? [challenge()] : [challenge({ id: 2, challenger: OTHER })],
  );
});

describe("my activity", () => {
  it("asks for a wallet before showing account activity", async () => {
    m.wallet.hasProvider = false;
    renderActivity();

    expect(await screen.findByText("Connect an account to see your activity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No wallet detected" })).toBeDisabled();
    expect(screen.getByText("Transactions from this browser")).toBeInTheDocument();
    expect(screen.getByText(/Nothing recorded yet/)).toBeInTheDocument();
    expect(screen.getAllByText("Sample data").length).toBeGreaterThan(0);
  });

  it("shows only this account's rows and links the evidence it evaluated", async () => {
    m.wallet.address = ME;
    m.wallet.isConnected = true;
    renderActivity();

    const alphaLinks = await screen.findAllByRole("link", { name: /#1 Alpha Trust/ });
    expect(alphaLinks.length).toBeGreaterThan(0);
    expect(alphaLinks[0]).toHaveAttribute("href", "/commitments/1");
    expect(screen.queryByText(/Beta City Council/)).toBeNull();

    const source = screen.getByRole("link", { name: "https://example.org/report-a" });
    expect(source).toHaveAttribute("href", "https://example.org/report-a");
    expect(screen.getByText("Official report")).toBeInTheDocument();
    expect(screen.getByText(/1 Feb 2026/)).toBeInTheDocument();
    expect(screen.queryByText(/example\.org\/other/)).toBeNull();

    expect(screen.getByText("The report covers a different year.")).toBeInTheDocument();
    expect(screen.getByText("Criterion 1")).toBeInTheDocument();
  });

  it("counts a record it could not read and scans the rest of the window", async () => {
    m.wallet.address = ME;
    m.wallet.isConnected = true;
    m.getCommitment.mockImplementation(async (id: number) => {
      if (id === 2) throw new Error("EXTERNAL: timeout");
      return commitment();
    });
    renderActivity();

    expect(
      await screen.findByText(/Records that could not be read and were skipped: 1/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /#1 Alpha Trust/ }).length).toBeGreaterThan(0);
  });

  it("remembers this browser's transactions and pending write as a local convenience", async () => {
    m.wallet.address = ME;
    m.wallet.isConnected = true;
    localStorage.setItem("civiclens.tx.byCommitment", JSON.stringify({ "1": HASH }));
    localStorage.setItem(
      "civiclens.tx.pending",
      JSON.stringify({ hash: PENDING_HASH, action: "Request review", startedAt: Date.now() }),
    );
    renderActivity();

    const txSection = (await screen.findByRole("heading", {
      name: "Transactions from this browser",
    })).closest("section");
    expect(txSection).not.toBeNull();
    const inTx = within(txSection as HTMLElement);

    expect(inTx.getByText(/still being tracked/)).toBeInTheDocument();
    expect(inTx.getByText("Request review")).toBeInTheDocument();
    expect(inTx.getByText(/not a network record/)).toBeInTheDocument();

    expect(inTx.getByRole("link", { name: /#1 Alpha Trust/ })).toHaveAttribute(
      "href",
      "/commitments/1",
    );
    const explorer = inTx.getByRole("link", { name: HASH });
    expect(explorer).toHaveAttribute(
      "href",
      `https://explorer-studio.genlayer.com/tx/${HASH}`,
    );
  });
});
