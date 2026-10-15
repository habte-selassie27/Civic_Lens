/**
 * Browse page search, filters, and sort (/commitments).
 *
 * All three apply to the loaded page (the contract's most recent records) and
 * the page says so. These pin the behaviour: text search by subject or number,
 * registrant-role filter, the sort orders, and the version/superseded tags
 * that lead into the version chain.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const m = vi.hoisted(() => ({
  isSample: true,
  sampleReason: "No contract address configured." as string | null,
  listCommitments: vi.fn(),
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
    getConstants: vi.fn(),
    getBundle: vi.fn(),
    getCommitment: vi.fn(),
    getEvidence: vi.fn(),
    getOutcome: vi.fn(),
    getChallenges: vi.fn(),
  },
  writes: null,
  hasLiveWrites: () => false,
}));

import { Commitments } from "@/pages/Commitments";
import type { CommitmentSummary } from "@/domain/types";

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
    evidence_count: 1,
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    ...over,
  };
}

function renderList() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Commitments />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

function rowTexts(): string[] {
  return screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => row.textContent ?? "");
}

const ROWS = [
  summary({
    id: 3,
    subject: "Alpha University",
    status: "outcome_accepted",
    data_mode: "live",
    registrant_role: "organization",
    version: 2,
    round_count: 2,
    evidence_count: 4,
    period_end: "2026-06-30",
  }),
  summary({
    id: 2,
    subject: "Beta City Council",
    status: "evidence_open",
    data_mode: "sample",
    registrant_role: "observer",
    version: 1,
    superseded_by: 4,
    round_count: 0,
    evidence_count: 1,
    period_end: "2026-03-31",
  }),
  summary({
    id: 1,
    subject: "Gamma Trust",
    status: "outcome_accepted",
    data_mode: "live",
    registrant_role: "observer",
    version: 1,
    round_count: 1,
    evidence_count: 2,
    period_end: "2026-12-31",
  }),
];

beforeEach(() => {
  vi.clearAllMocks();
  m.isSample = true;
  m.sampleReason = "No contract address configured.";
  m.listCommitments.mockResolvedValue(ROWS);
});

describe("browse search, filter, and sort", () => {
  it("searches by subject and by record number", async () => {
    const user = userEvent.setup();
    renderList();
    expect(await screen.findByText("Alpha University")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/search/i), "beta");
    expect(screen.getByText("Beta City Council")).toBeInTheDocument();
    expect(screen.queryByText("Alpha University")).toBeNull();
    expect(screen.queryByText("Gamma Trust")).toBeNull();

    await user.clear(screen.getByLabelText(/search/i));
    await user.type(screen.getByLabelText(/search/i), "3");
    expect(screen.getByText("Alpha University")).toBeInTheDocument();
    expect(screen.queryByText("Beta City Council")).toBeNull();
  });

  it("filters by registrant role", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText("Alpha University");

    await user.selectOptions(screen.getByLabelText(/registrant/i), "observer");
    expect(screen.getByText("Beta City Council")).toBeInTheDocument();
    expect(screen.getByText("Gamma Trust")).toBeInTheDocument();
    expect(screen.queryByText("Alpha University")).toBeNull();
  });

  it("sorts by ending soonest and back to newest", async () => {
    const user = userEvent.setup();
    renderList();
    await screen.findByText("Alpha University");

    // Newest first is the default: id descending.
    expect(rowTexts()[0]).toContain("Alpha University");

    await user.selectOptions(screen.getByLabelText(/sort/i), "ending_soonest");
    const order = rowTexts();
    expect(order[0]).toContain("Beta City Council");
    expect(order[1]).toContain("Alpha University");
    expect(order[2]).toContain("Gamma Trust");
  });

  it("tags versions and superseded records for the chain view", async () => {
    renderList();
    await screen.findByText("Alpha University");

    const alphaRow = screen.getByRole("link", { name: "Alpha University" }).closest("tr");
    const betaRow = screen.getByRole("link", { name: "Beta City Council" }).closest("tr");
    expect(alphaRow).not.toBeNull();
    expect(betaRow).not.toBeNull();

    expect(within(alphaRow as HTMLElement).getByText("v2")).toBeInTheDocument();
    expect(
      within(betaRow as HTMLElement).getByText("Superseded by #4"),
    ).toBeInTheDocument();

    expect(screen.getByText(/most recently registered/)).toBeInTheDocument();
  });
});
