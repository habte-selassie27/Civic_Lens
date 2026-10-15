/**
 * The surface additions: the evaluation-period strip, validator-vote
 * transparency, the evidence quota line, and the badge share controls.
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WindowStrip } from "@/components/WindowStrip";
import { ConsensusNote } from "@/components/ConsensusNote";
import { TxStatus } from "@/components/TxStatus";
import { BadgeShare } from "@/components/BadgeShare";
import { EvidenceSubmitForm } from "@/components/EvidenceSubmitForm";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import {
  COMMITMENT_STATUSES,
  DATA_MODES,
  EVIDENCE_TYPES,
  OPERATORS,
  REASON_CODES,
  REGISTRANT_ROLES,
  REVIEW_STATUSES,
  SUBJECT_KINDS,
  type ContractConstants,
} from "@/domain/types";

const constants: ContractConstants = {
  ...FALLBACK_CONSTANTS,
  subject_kinds: [...SUBJECT_KINDS],
  registrant_roles: [...REGISTRANT_ROLES],
  data_modes: [...DATA_MODES],
  evidence_types: [...EVIDENCE_TYPES],
  operators: [...OPERATORS],
  review_statuses: [...REVIEW_STATUSES],
  reason_codes: [...REASON_CODES],
  commitment_statuses: [...COMMITMENT_STATUSES],
};

describe("WindowStrip", () => {
  const now = new Date("2026-06-15T09:00:00Z");

  it("marks the current segment in text, never by colour alone", () => {
    render(
      <WindowStrip
        periodStart="2026-06-01"
        periodEnd="2026-06-30"
        timezone="UTC"
        status="evidence_open"
        hasOutcome={false}
        now={now}
      />,
    );
    expect(screen.getByText("Within the period")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Before the period")).not.toHaveAttribute("aria-current");
    expect(screen.getByText(/it ends in 15 days/)).toBeInTheDocument();
    expect(screen.getByText(/calendar days in UTC, as recorded/)).toBeInTheDocument();
    expect(screen.getByText(/pending is not a finding/)).toBeInTheDocument();
  });

  it("drops the pending sentence once a review has completed", () => {
    render(
      <WindowStrip
        periodStart="2026-05-01"
        periodEnd="2026-06-10"
        status="outcome_accepted"
        hasOutcome
        now={now}
      />,
    );
    expect(screen.getByText(/ended 5 days ago/)).toBeInTheDocument();
    expect(screen.queryByText(/pending is not a finding/)).toBeNull();
  });

  it("renders nothing for a broken period", () => {
    const { container } = render(
      <WindowStrip
        periodStart="bad"
        periodEnd="2026-06-10"
        status="evidence_open"
        hasOutcome={false}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("ConsensusNote", () => {
  const votes = { agreed: 5, total: 5, round: 2 };

  it("states the agreement and the open appeal window", () => {
    render(<ConsensusNote votes={votes} finality="accepted" />);
    expect(screen.getByText(/5 of 5 validators agreed in round 2/)).toBeInTheDocument();
    expect(screen.getByText(/appeal window is still open/)).toBeInTheDocument();
  });

  it("states the closed window once final", () => {
    render(<ConsensusNote votes={votes} finality="final" />);
    expect(screen.getByText(/appeal window has closed/)).toBeInTheDocument();
  });

  it("claims nothing without votes or without a decided state", () => {
    const noVotes = render(<ConsensusNote votes={null} finality="accepted" />);
    expect(noVotes.container.firstChild).toBeNull();
    const undecided = render(<ConsensusNote votes={votes} finality="none" />);
    expect(undecided.container.firstChild).toBeNull();
  });
});

describe("TxStatus", () => {
  it("shows the vote count once accepted", () => {
    render(
      <TxStatus
        phase="accepted"
        hash={`0x${"a".repeat(64)}`}
        votes={{ agreed: 4, total: 5, round: 1 }}
      />,
    );
    expect(screen.getByText(/4 of 5 validators agreed in round 1/)).toBeInTheDocument();
  });

  it("says nothing about votes while still pending", () => {
    render(<TxStatus phase="pending" votes={{ agreed: 4, total: 5, round: 1 }} />);
    expect(screen.queryByText(/validators agreed/)).toBeNull();
  });
});

describe("EvidenceSubmitForm quota line", () => {
  it("states the per-account usage when the account is connected", () => {
    render(
      <EvidenceSubmitForm
        constants={constants}
        existingCount={5}
        submitterCount={3}
        accountKnown
        onSubmit={() => Promise.resolve()}
      />,
    );
    expect(screen.getByText(/3 of 8 submissions used by this account/)).toBeInTheDocument();
    expect(screen.getByText(/5 of 20 sources on file/)).toBeInTheDocument();
  });

  it("asks for an account instead of implying a zero count", () => {
    render(
      <EvidenceSubmitForm
        constants={constants}
        existingCount={5}
        submitterCount={0}
        onSubmit={() => Promise.resolve()}
      />,
    );
    expect(screen.getByText(/Connect an account to see its submission count/)).toBeInTheDocument();
    expect(screen.queryByText(/used by this account/)).toBeNull();
  });
});

describe("BadgeShare", () => {
  const input = {
    recordId: 1,
    subject: "World Health Organization",
    outcome: "Evidence supports",
    tone: "supported" as const,
    finality: "",
    sample: true,
    url: "http://localhost:3000/commitments/1",
  };

  it("copies the embed code and confirms in place", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<BadgeShare input={input} />);
    await user.click(screen.getByRole("button", { name: "Copy embed code" }));
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(String(writeText.mock.calls[0][0])).toContain("<svg");
    expect(String(writeText.mock.calls[0][0])).toContain('href="http://localhost:3000/commitments/1"');
    expect(await screen.findByText("Embed code copied.")).toBeInTheDocument();
    writeText.mockRestore();
  });

  it("offers the SVG download", () => {
    render(<BadgeShare input={input} />);
    expect(screen.getByRole("button", { name: "Download badge (SVG)" })).toBeInTheDocument();
  });
});
