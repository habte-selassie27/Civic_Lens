/**
 * System status page (/status) — the config-health checks.
 *
 * Pins the checks a browser CAN make against the configured contract
 * (address, live read, constants shape, bounds drift, wallet) and the honest
 * handling of what it cannot: with sample data there is nothing deployed to
 * verify, and method enumeration is delegated to the schema command instead
 * of being pretended.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const m = vi.hoisted(() => ({
  configured: false,
  address: "0x1111111111111111111111111111111111111111" as string,
  isSample: true,
  sampleReason: "No contract address configured." as string | null,
  getConstants: vi.fn(),
  wallet: {
    address: null as string | null,
    isConnected: false,
    hasProvider: false,
    isOnCorrectNetwork: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    switchNetwork: vi.fn(),
  },
}));

vi.mock("@/config/contracts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/contracts")>();
  return {
    ...actual,
    get CONFIGURED() {
      return m.configured;
    },
    get CONTRACT_ADDRESS() {
      return m.address;
    },
  };
});

vi.mock("@/services", () => ({
  reads: {
    get isSample() {
      return m.isSample;
    },
    get sampleReason() {
      return m.sampleReason;
    },
    getConstants: (...args: unknown[]) => m.getConstants(...args),
    listCommitments: vi.fn(),
    getBundle: vi.fn(),
    getCommitment: vi.fn(),
    getEvidence: vi.fn(),
    getOutcome: vi.fn(),
    getChallenges: vi.fn(),
  },
  writes: null,
  hasLiveWrites: () => false,
}));

vi.mock("@/genlayer/WalletProvider", () => ({
  useWallet: () => m.wallet,
  WalletProvider: ({ children }: { children: ReactNode }) => children,
}));

import { Status } from "@/pages/Status";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import type { ContractConstants } from "@/domain/types";

function liveConstants(over: Record<string, unknown> = {}): ContractConstants {
  return {
    ...FALLBACK_CONSTANTS,
    subject_kinds: ["organization", "institution", "individual"],
    registrant_roles: ["organization", "observer"],
    data_modes: ["live", "sample"],
    evidence_types: ["official_report", "other"],
    operators: ["gte", "lte"],
    review_statuses: ["supported", "contradicted", "inconclusive"],
    reason_codes: ["no_relevant_evidence"],
    commitment_statuses: [
      "evidence_open",
      "review_pending",
      "outcome_accepted",
      "challenged",
      "withdrawn",
      "superseded",
    ],
    retrieval_statuses: ["fetched", "unreachable", "unknown"],
    max_quote_len: 2000,
    date_semantics: "recorded",
    threshold_semantics: "recorded",
    data_mode_semantics: "recorded",
    outcome_meaning: "recorded",
    challenge_semantics: "recorded",
    figure_verification_semantics: "recorded",
    ...over,
  } as unknown as ContractConstants;
}

function renderStatus() {
  return render(
    <MemoryRouter>
      <Status />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  m.configured = false;
  m.address = "0x1111111111111111111111111111111111111111";
  m.isSample = true;
  m.sampleReason = "No contract address configured.";
  m.wallet.address = null;
  m.wallet.isConnected = false;
  m.wallet.hasProvider = false;
  m.wallet.isOnCorrectNetwork = true;
  m.getConstants.mockResolvedValue(liveConstants());
});

describe("system status page", () => {
  it("reports an unconfigured sample build honestly", async () => {
    renderStatus();

    expect(await screen.findByText("Not configured")).toBeInTheDocument();
    expect(screen.getByText(/No address is set/)).toBeInTheDocument();
    expect(
      screen.getByText(/No deployed contract to read in this build/),
    ).toBeInTheDocument();
    expect(screen.getByText(/nothing deployed to compare/)).toBeInTheDocument();
    expect(screen.getByText(/^Sample data — /)).toBeInTheDocument();
    expect(screen.getByText(/Checks needing attention: 1/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run checks again" })).toBeInTheDocument();
  });

  it("matches a healthy live contract field by field", async () => {
    m.configured = true;
    m.isSample = false;
    m.sampleReason = null;
    m.getConstants.mockResolvedValue(liveConstants());
    renderStatus();

    expect(await screen.findByText("Configured")).toBeInTheDocument();
    expect(await screen.findByText("Answers")).toBeInTheDocument();
    expect(screen.getByText(/Answered in \d+ ms/)).toBeInTheDocument();
    expect(screen.getAllByText("Matches").length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText(/Every field this frontend consumes is present/),
    ).toBeInTheDocument();
    expect(screen.getByText(/snapshot matches the deployed bounds/)).toBeInTheDocument();
    expect(screen.getByText(/Everything this page can check matches/)).toBeInTheDocument();
    expect(screen.getByText(/No wallet extension detected/)).toBeInTheDocument();
  });

  it("flags an older build at the address by its missing audit fields", async () => {
    m.configured = true;
    m.isSample = false;
    m.sampleReason = null;
    const older = liveConstants();
    delete (older as unknown as Record<string, unknown>).retrieval_statuses;
    delete (older as unknown as Record<string, unknown>).max_quote_len;
    m.getConstants.mockResolvedValue(older);
    renderStatus();

    expect(await screen.findByText("Older build")).toBeInTheDocument();
    expect(screen.getByText(/missing audit fields this frontend can use/)).toBeInTheDocument();
    expect(screen.getByText(/retrieval_statuses, max_quote_len/)).toBeInTheDocument();
    expect(screen.getByText(/Checks needing attention: 1/)).toBeInTheDocument();
  });

  it("flags a required key missing as the wrong contract at the address", async () => {
    m.configured = true;
    m.isSample = false;
    m.sampleReason = null;
    const broken = liveConstants();
    delete (broken as unknown as Record<string, unknown>).max_criteria;
    m.getConstants.mockResolvedValue(broken);
    renderStatus();

    expect(await screen.findByText(/required key missing: max_criteria/)).toBeInTheDocument();
    expect(
      screen.getByText(/Likely an older or different contract at this address/),
    ).toBeInTheDocument();
  });

  it("reports an unreachable read and answers again after a retry", async () => {
    const user = userEvent.setup();
    m.configured = true;
    m.isSample = false;
    m.sampleReason = null;
    m.getConstants
      .mockRejectedValueOnce(new Error("EXTERNAL: rpc down"))
      .mockResolvedValue(liveConstants());
    renderStatus();

    expect(
      await screen.findByText("A source couldn't be reached. Try again later."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Run checks again" }));

    expect(await screen.findByText("Answers")).toBeInTheDocument();
    expect(m.getConstants).toHaveBeenCalledTimes(2);
  });

  it("lists the pinned methods with the command that verifies them", async () => {
    renderStatus();

    expect(await screen.findByText("get_constants")).toBeInTheDocument();
    expect(screen.getByText("create_commitment")).toBeInTheDocument();
    expect(screen.getByText(/genlayer schema <address>/)).toBeInTheDocument();
  });
});
