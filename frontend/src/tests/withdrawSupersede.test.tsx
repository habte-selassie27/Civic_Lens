/**
 * Withdraw + supersede wiring (the two lifecycle writes the UI previously
 * promised but never offered).
 *
 * Rules live in domain/actions (tested in actions.test.ts); these tests pin
 * the wiring: the detail page offers both controls with the shared
 * disabled-reason treatment, withdraw calls the contract's
 * `withdraw_commitment`, and the prefilled `/commitments/:id/supersede` route
 * submits `supersede_commitment` with the old id — the only legal way to
 * change a criterion.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const m = vi.hoisted(() => ({
  wallet: {
    address: null as string | null,
    isOnCorrectNetwork: true,
    hasProvider: true,
  },
  getBundle: vi.fn(),
  getConstants: vi.fn(),
  withdrawCommitment: vi.fn(),
  supersedeCommitment: vi.fn(),
  createCommitment: vi.fn(),
  getTransaction: vi.fn(),
}));

vi.mock("@/services", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services")>();
  const readsFake = {
    ...actual.reads,
    isSample: false,
    sampleReason: null,
    getConstants: () => m.getConstants(),
    listCommitments: async () => [],
    getBundle: (id: number) => m.getBundle(id),
  };
  const writesFake = {
    createCommitment: m.createCommitment,
    supersedeCommitment: m.supersedeCommitment,
    withdrawCommitment: m.withdrawCommitment,
    submitEvidence: vi.fn(),
    requestReview: vi.fn(),
    openChallenge: vi.fn(),
    waitForAccept: async () => ({ statusName: "MAJORITY_AGREE", result: "MAJORITY_AGREE" }),
    getTransaction: () => m.getTransaction(),
  };
  return {
    ...actual,
    reads: readsFake,
    writes: writesFake,
    hasLiveWrites: () => true,
    requireWrites: () => writesFake,
  };
});

vi.mock("@/genlayer/WalletProvider", () => ({
  useWallet: () => m.wallet,
  WalletProvider: ({ children }: { children: ReactNode }) => children,
}));

import { CommitmentDetail } from "@/pages/CommitmentDetail";
import { CommitmentNew } from "@/pages/CommitmentNew";
import { WalletProvider } from "@/genlayer/WalletProvider";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import type { CommitmentBundle } from "@/services/types";
import type { Commitment, ContractConstants, Criterion } from "@/domain/types";

const REGISTRANT = "0x5B3661C576c7001e6d6279C67F3779705d334c89";
const OTHER = "0x0000000000000000000000000000000000000AAa";
const ACCEPTED_RECEIPT = { statusName: "MAJORITY_AGREE", result: "MAJORITY_AGREE" };

const CONSTANTS = {
  ...FALLBACK_CONSTANTS,
  subject_kinds: ["organization", "institution", "individual"],
  registrant_roles: ["organization", "observer"],
  data_modes: ["live", "sample"],
  evidence_types: ["official_report", "government_dataset", "press_release", "other"],
  operators: ["gte", "lte"],
  review_statuses: ["supported", "contradicted", "inconclusive"],
  reason_codes: [],
  commitment_statuses: [
    "evidence_open",
    "review_pending",
    "outcome_accepted",
    "challenged",
    "withdrawn",
    "superseded",
  ],
} as unknown as ContractConstants;

const CRITERION: Criterion = {
  id: 1,
  text: "Publish an annual emissions report",
  measure: "An official report covering the period",
  required: true,
  has_threshold: true,
  threshold_milli: 15000,
  operator: "gte",
  unit: "percent",
  deadline: "2026-12-31",
};

function makeCommitment(over: Partial<Commitment> = {}): Commitment {
  return {
    id: 7,
    registrant: REGISTRANT,
    registrant_role: "organization",
    subject: "Riverdale Transit Authority",
    subject_kind: "institution",
    source_statement_ref: "https://example.org/announcement",
    commitment_text: "We will publish an annual emissions report for 2026.",
    criteria: [CRITERION],
    period_start: "2026-01-01",
    period_end: "2026-12-31",
    timezone: "UTC",
    source_guidance: "Official reports only",
    data_mode: "live",
    status: "evidence_open",
    version: 1,
    supersedes: 0,
    superseded_by: 0,
    round_count: 0,
    challenge_count: 0,
    evidence_count: 0,
    current_round: 0,
    ...over,
  };
}

function makeBundle(c: Commitment): CommitmentBundle {
  return {
    commitment: c,
    evidence: [],
    rounds: [],
    outcome: { commitment_id: c.id, has_outcome: false, round: 0, status: c.status },
    challenges: [],
  };
}

function renderAt(path: string, commitment: Commitment) {
  m.getBundle.mockResolvedValue(makeBundle(commitment));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={client}>
        <WalletProvider>
          <Routes>
            <Route path="/commitments/:id/supersede" element={<CommitmentNew />} />
            <Route path="/commitments/new" element={<CommitmentNew />} />
            <Route path="/commitments/:id" element={<CommitmentDetail />} />
            <Route path="/commitments" element={<p>Commitment list</p>} />
          </Routes>
        </WalletProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  m.wallet.address = REGISTRANT;
  m.getConstants.mockResolvedValue(CONSTANTS);
  m.getTransaction.mockResolvedValue(ACCEPTED_RECEIPT);
  m.withdrawCommitment.mockResolvedValue("0xaaa1");
  m.supersedeCommitment.mockResolvedValue("0xaaa2");
  m.createCommitment.mockResolvedValue("0xaaa3");
});

describe("commitment page lifecycle actions", () => {
  it("offers withdraw and create-new-version to the registrant on an open commitment", async () => {
    renderAt("/commitments/7", makeCommitment());
    expect(await screen.findByRole("button", { name: "Withdraw" })).not.toBeDisabled();
    expect(screen.getByRole("link", { name: /create a new version/i })).toBeInTheDocument();
  });

  it("hides both from everyone but the registrant, each with its own reason", async () => {
    m.wallet.address = OTHER;
    renderAt("/commitments/7", makeCommitment());
    await screen.findByRole("button", { name: "Withdraw" });
    expect(screen.getAllByText(/only the registrant/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: /create a new version/i })).toBeNull();
  });

  it("reflects the contract: a superseded record offers neither", async () => {
    renderAt("/commitments/7", makeCommitment({ status: "superseded", superseded_by: 8 }));
    await screen.findByRole("button", { name: "Withdraw" });
    expect(screen.getByText(/nothing to withdraw/i)).toBeInTheDocument();
    expect(screen.getByText(/newer version .* already exists/i)).toBeInTheDocument();
  });

  it("withdraw writes withdraw_commitment with the commitment id", async () => {
    const user = userEvent.setup();
    renderAt("/commitments/7", makeCommitment());
    await user.click(await screen.findByRole("button", { name: "Withdraw" }));
    await waitFor(() => expect(m.withdrawCommitment).toHaveBeenCalledWith(7));
  });
});

describe("supersede form", () => {
  it("opens prefilled from the record it versions and says what will happen", async () => {
    renderAt("/commitments/7/supersede", makeCommitment());
    expect(
      await screen.findByRole("heading", { level: 1, name: /new version of commitment #7/i }),
    ).toBeInTheDocument();
    const subject = (await screen.findByRole("textbox", {
      name: /subject required/i,
    })) as HTMLInputElement;
    expect(subject.value).toBe("Riverdale Transit Authority");
    // Threshold round-trips through the milli-unit representation.
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    expect(screen.getByText(/history is never rewritten/i)).toBeInTheDocument();
  });

  it("submits supersede_commitment with the old id, not create_commitment", async () => {
    const user = userEvent.setup();
    renderAt("/commitments/7/supersede", makeCommitment());
    await screen.findByRole("textbox", { name: /subject required/i });
    await user.click(
      screen.getByRole("checkbox", { name: /summary describes what i want reviewed/i }),
    );
    await user.click(screen.getByRole("button", { name: "Create new version" }));

    await waitFor(() => expect(m.supersedeCommitment).toHaveBeenCalledTimes(1));
    const arg = m.supersedeCommitment.mock.calls[0][0];
    expect(arg.oldId).toBe(7);
    expect(arg.subject).toBe("Riverdale Transit Authority");
    expect(JSON.parse(arg.criteriaJson)).toHaveLength(1);
    expect(m.createCommitment).not.toHaveBeenCalled();
  });

  it("will not submit from an account that is not the registrant", async () => {
    m.wallet.address = OTHER;
    renderAt("/commitments/7/supersede", makeCommitment());
    await screen.findByRole("textbox", { name: /subject required/i });
    const submit = screen.getByRole("button", { name: "Create new version" });
    expect(submit).toBeDisabled();
    expect(screen.getByText(/only the registrant/i)).toBeInTheDocument();
    expect(m.supersedeCommitment).not.toHaveBeenCalled();
  });

  it("the plain register route still calls create_commitment", async () => {
    const user = userEvent.setup();
    renderAt("/commitments/new", makeCommitment({ id: 0 }));
    const subject = (await screen.findByRole("textbox", {
      name: /subject required/i,
    })) as HTMLInputElement;
    expect(subject.value).toBe(""); // register route stays blank — no prefill

    await user.type(subject, "Riverdale Transit Authority");
    await user.type(
      screen.getByLabelText(/link to the source statement/i),
      "https://example.org/a",
    );
    await user.type(
      screen.getByLabelText(/the commitment, as stated/i),
      "We will publish a report.",
    );
    await user.type(screen.getByLabelText(/^wording/i), "Publish an annual report");
    await user.type(
      screen.getByLabelText(/how it would be measured/i),
      "An official report covering the period",
    );
    await user.type(screen.getByLabelText(/evaluation starts/i), "2026-01-01");
    await user.type(screen.getByLabelText(/evaluation ends/i), "2026-12-31");
    await user.click(
      screen.getByRole("checkbox", { name: /summary describes what i want reviewed/i }),
    );
    await user.click(screen.getByRole("button", { name: "Register commitment" }));

    await waitFor(() => expect(m.createCommitment).toHaveBeenCalledTimes(1));
    expect(m.supersedeCommitment).not.toHaveBeenCalled();
  });
});
