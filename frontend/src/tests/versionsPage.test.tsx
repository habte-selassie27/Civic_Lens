/**
 * Version history page (/commitments/:id/versions).
 *
 * Pins the chain order, the criteria diff between consecutive versions, the
 * single-record honesty note, and the retry path when the chain cannot be
 * loaded.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const m = vi.hoisted(() => ({
  isSample: true,
  sampleReason: "No contract address configured." as string | null,
  getCommitment: vi.fn(),
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
    getCommitment: (...args: unknown[]) => m.getCommitment(...args),
    getOutcome: (...args: unknown[]) => m.getOutcome(...args),
    getConstants: vi.fn(),
    listCommitments: vi.fn(),
    getBundle: vi.fn(),
    getEvidence: vi.fn(),
    getChallenges: vi.fn(),
  },
  writes: null,
  hasLiveWrites: () => false,
}));

import { Versions } from "@/pages/Versions";
import type { Commitment, Criterion, Outcome } from "@/domain/types";

function criterion(over: Partial<Criterion> = {}): Criterion {
  return {
    id: 1,
    text: "Publishes an annual emissions report",
    measure: "An official report is filed",
    required: true,
    has_threshold: false,
    threshold_milli: 0,
    operator: "",
    unit: "",
    deadline: "",
    ...over,
  };
}

function commitment(over: Partial<Commitment> = {}): Commitment {
  return {
    id: 1,
    registrant: "0x0000000000000000000000000000000000000001",
    registrant_role: "organization",
    subject: "Riverdale Transit Authority",
    subject_kind: "institution",
    source_statement_ref: "https://example.org/statement",
    commitment_text: "We will publish an annual emissions report.",
    criteria: [criterion()],
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
    evidence_count: 1,
    current_round: 1,
    ...over,
  };
}

function outcome(over: Partial<Outcome> = {}): Outcome {
  return {
    commitment_id: 1,
    has_outcome: false,
    round: 0,
    status: "review_pending",
    ...over,
  };
}

const V1 = commitment({ id: 1, version: 1, superseded_by: 2 });
const V2 = commitment({
  id: 2,
  version: 2,
  supersedes: 1,
  superseded_by: 3,
  criteria: [criterion({ has_threshold: true, threshold_milli: 100_000, operator: "gte", unit: "co2e_tonnes" })],
});
const V3 = commitment({
  id: 3,
  version: 3,
  supersedes: 2,
  criteria: [
    criterion({ has_threshold: true, threshold_milli: 100_000, operator: "gte", unit: "co2e_tonnes" }),
    criterion({ id: 2, text: "Files the report with the regulator", measure: "A filing receipt exists" }),
  ],
});

function renderAt(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/commitments/${id}/versions`]}>
      <Routes>
        <Route path="/commitments/:id/versions" element={<Versions />} />
        <Route path="/commitments/:id" element={<p>Commitment page</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  m.isSample = true;
  m.sampleReason = "No contract address configured.";
  const chain = new Map<number, Commitment>([
    [1, V1],
    [2, V2],
    [3, V3],
  ]);
  m.getCommitment.mockImplementation(async (id: number) => {
    const found = chain.get(id);
    if (!found) throw new Error(`EXPECTED: no commitment ${id}`);
    return found;
  });
  m.getOutcome.mockImplementation(async (id: number) =>
    id === 2
      ? outcome({
          commitment_id: 2,
          has_outcome: true,
          round: 1,
          status: "outcome_accepted",
          overall_outcome: "supported",
          overall_reason: "all_required_supported",
          evaluated_at: "2026-07-01T00:00:00Z",
        })
      : outcome({ commitment_id: id }),
  );
});

describe("version history page", () => {
  it("shows the chain in version order with the criteria diff between versions", async () => {
    renderAt("2");

    await screen.findByText(/Changed from version 1:/);
    expect(
      screen.getByRole("heading", { level: 1, name: "Version history" }),
    ).toBeInTheDocument();

    const versionHeadings = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent ?? "");
    expect(versionHeadings[0]).toContain("Version 1");
    expect(versionHeadings[1]).toContain("Version 2");
    expect(versionHeadings[2]).toContain("Version 3");

    expect(screen.getByText("This record")).toBeInTheDocument();

    // v2's threshold change against v1
    expect(screen.getByText(/Changed from version 1:/)).toBeInTheDocument();
    expect(screen.getByText("Criterion 1 changed: threshold.")).toBeInTheDocument();
    // v3 adds a criterion against v2
    expect(screen.getByText(/Changed from version 2:/)).toBeInTheDocument();
    expect(screen.getByText("Criterion 2 added.")).toBeInTheDocument();

    // The reviewed version carries its outcome; the others are pending.
    expect(screen.getAllByText("Evidence supports").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Review pending").length).toBeGreaterThanOrEqual(2);

    expect(screen.getByRole("link", { name: /Open commitment #3/ })).toHaveAttribute(
      "href",
      "/commitments/3",
    );
    expect(screen.getByRole("link", { name: /Back to the commitment/ })).toHaveAttribute(
      "href",
      "/commitments/2",
    );

    // Immutability framing is present, not just implied.
    expect(screen.getByText(/Superseding never edits a record/)).toBeInTheDocument();
  });

  it("says plainly when a record has no other versions", async () => {
    // The default fixture chain links 1 -> 2 -> 3; this record stands alone.
    m.getCommitment.mockImplementation(async (id: number) => {
      if (id !== 1) throw new Error(`EXPECTED: no commitment ${id}`);
      return commitment({ id: 1, version: 1 });
    });
    renderAt("1");
    expect(await screen.findByText(/no earlier or later version/)).toBeInTheDocument();
  });

  it("says the chain continues past the cap instead of pretending it ended", async () => {
    const long = new Map<number, Commitment>();
    for (let id = 1; id <= 12; id += 1) {
      long.set(
        id,
        commitment({
          id,
          version: id,
          supersedes: id === 1 ? 0 : id - 1,
          superseded_by: id === 12 ? 0 : id + 1,
        }),
      );
    }
    m.getCommitment.mockImplementation(async (id: number) => {
      const found = long.get(id);
      if (!found) throw new Error(`EXPECTED: no commitment ${id}`);
      return found;
    });
    renderAt("1");

    expect(
      await screen.findByText(/continues beyond the first 10 versions/),
    ).toBeInTheDocument();
  });

  it("offers a retry when the chain cannot be loaded", async () => {
    const user = userEvent.setup();
    m.getCommitment.mockRejectedValueOnce(new Error("EXTERNAL: timeout"));
    renderAt("2");

    expect(
      await screen.findByText("The version history could not be loaded."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText(/Changed from version 1:/)).toBeInTheDocument();
  });
});
