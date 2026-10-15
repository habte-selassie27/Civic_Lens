/**
 * Platform stats: the pure aggregation and the page that renders it.
 *
 * The stats page counts a BOUNDED window and says so. These tests pin the
 * counting rules that matter for fairness: unread outcomes are never folded
 * into an outcome, and inconclusive keeps its own row beside the others.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const m = vi.hoisted(() => ({
  isSample: true,
  sampleReason: "No contract address configured." as string | null,
  listCommitments: vi.fn(),
  getOutcome: vi.fn(),
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
    getOutcome: (...args: unknown[]) => m.getOutcome(...args),
    getConstants: vi.fn(),
    getBundle: vi.fn(),
    getCommitment: vi.fn(),
    getEvidence: vi.fn(),
    getChallenges: vi.fn(),
  },
  writes: null,
  hasLiveWrites: () => false,
}));

import { Stats } from "@/pages/Stats";
import { aggregatePlatformStats } from "@/domain/stats";
import type { CommitmentSummary, Outcome } from "@/domain/types";

function summary(over: Partial<CommitmentSummary> = {}): CommitmentSummary {
  return {
    id: 1,
    subject: "Subject",
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

function outcome(over: Partial<Outcome> = {}): Outcome {
  return {
    commitment_id: 1,
    has_outcome: true,
    round: 1,
    status: "outcome_accepted",
    overall_outcome: "supported",
    overall_reason: "all_required_supported",
    evaluated_at: "2026-07-01T00:00:00Z",
    retrieval_counts: { fetched: 2 },
    ...over,
  };
}

function rowFor(scope: HTMLElement, name: RegExp): HTMLElement {
  const header = within(scope).getByRole("rowheader", { name });
  const row = header.closest("tr");
  if (!row) throw new Error("row not found");
  return row;
}

function renderStats() {
  return render(
    <MemoryRouter>
      <Stats />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  m.isSample = true;
  m.sampleReason = "No contract address configured.";
  m.listCommitments.mockResolvedValue([
    summary({ id: 3 }),
    summary({ id: 2, status: "evidence_open", round_count: 1 }),
    summary({ id: 1, status: "review_pending", round_count: 0, evidence_count: 1 }),
  ]);
  m.getOutcome.mockImplementation(async (id: number) => {
    if (id === 3) {
      return outcome({
        commitment_id: 3,
        overall_outcome: "supported",
        retrieval_counts: { fetched: 3, http_error: 1 },
      });
    }
    if (id === 2) {
      return outcome({
        commitment_id: 2,
        overall_outcome: "inconclusive",
        overall_reason: "no_relevant_evidence",
        retrieval_counts: { fetched: 1 },
      });
    }
    return outcome({ commitment_id: 1, has_outcome: false, overall_outcome: undefined });
  });
});

describe("aggregatePlatformStats", () => {
  it("counts unread outcomes separately and never as an outcome", () => {
    const stats = aggregatePlatformStats([
      { summary: summary({ id: 1 }), outcome: outcome(), unread: false },
      { summary: summary({ id: 2 }), unread: true },
      { summary: summary({ id: 3 }), outcome: outcome({ has_outcome: false, overall_outcome: undefined }), unread: false },
    ]);

    expect(stats.outcomes).toEqual({
      supported: 1,
      contradicted: 0,
      inconclusive: 0,
      notYetReviewed: 1,
    });
    expect(stats.unreadOutcomes).toBe(1);
  });

  it("sums rounds, evidence, modes, and retrieval counts across the window", () => {
    const stats = aggregatePlatformStats([
      {
        summary: summary({ id: 1, round_count: 2, evidence_count: 5, data_mode: "live" }),
        outcome: outcome({ retrieval_counts: { fetched: 3, unreachable: 1 } }),
        unread: false,
      },
      {
        summary: summary({ id: 2, round_count: 1, evidence_count: 2, data_mode: "sample" }),
        outcome: outcome({ commitment_id: 2, retrieval_counts: { fetched: 2 } }),
        unread: false,
      },
    ]);

    expect(stats.rounds).toBe(3);
    expect(stats.evidence).toBe(7);
    expect(stats.byMode).toEqual({ live: 1, sample: 1 });
    expect(stats.retrieval).toEqual({ fetched: 5, unreachable: 1 });
    expect(stats.retrievalKnown).toBe(2);
  });
});

describe("stats page", () => {
  it("counts the window and shows the three outcomes side by side", async () => {
    renderStats();

    await screen.findByText("Records");
    expect(
      screen.getByRole("heading", { level: 1, name: "Platform stats" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/most recent commitment/)).toBeInTheDocument();

    const outcomes = screen.getByRole("region", { name: "Review outcomes" });
    expect(within(rowFor(outcomes, /evidence supports/i)).getByText("1")).toBeInTheDocument();
    expect(within(rowFor(outcomes, /inconclusive/i)).getByText("1")).toBeInTheDocument();
    expect(within(rowFor(outcomes, /review pending/i)).getByText("1")).toBeInTheDocument();

    const sources = screen.getByRole("region", { name: "How sources were read" });
    expect(within(rowFor(sources, /^read$/i)).getByText("4")).toBeInTheDocument();
    expect(
      within(rowFor(sources, /the source returned an error/i)).getByText("1"),
    ).toBeInTheDocument();
    expect(screen.getByText(/4 sources read and 1 not readable/)).toBeInTheDocument();

    expect(screen.getAllByText("Sample data").length).toBeGreaterThan(0);
  });

  it("counts an outcome that could not be read as unread, not as any outcome", async () => {
    m.getOutcome.mockImplementation(async (id: number) => {
      if (id === 2) throw new Error("EXTERNAL: rpc hiccup");
      if (id === 3) return outcome({ commitment_id: 3 });
      return outcome({ commitment_id: 1, has_outcome: false, overall_outcome: undefined });
    });
    renderStats();

    await screen.findByText("Records");
    const outcomes = screen.getByRole("region", { name: "Review outcomes" });
    expect(
      within(rowFor(outcomes, /outcome could not be read/i)).getByText("1"),
    ).toBeInTheDocument();
    expect(within(rowFor(outcomes, /inconclusive/i)).getByText("0")).toBeInTheDocument();
  });

  it("invites a first registration when the window is empty", async () => {
    m.listCommitments.mockResolvedValue([]);
    renderStats();

    expect(await screen.findByText("Nothing to count yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register a commitment" })).toHaveAttribute(
      "href",
      "/commitments/new",
    );
  });

  it("offers a retry when the window itself cannot be read", async () => {
    const user = userEvent.setup();
    m.listCommitments.mockRejectedValueOnce(new Error("EXTERNAL: rpc down"));
    renderStats();

    expect(await screen.findByText("The window could not be counted.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Records")).toBeInTheDocument();
    expect(screen.getByText("Evidence supports")).toBeInTheDocument();
  });
});
