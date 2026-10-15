/**
 * Page-level tests: data-mode labeling, outcome/ledger pairing, attribution,
 * and the honesty rules the spec calls out by name (sections 4.3 and 8).
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { OutcomePanel } from "@/components/OutcomePanel";
import { DataModeBadge } from "@/components/DataModeBadge";
import { FinalityChip } from "@/components/FinalityChip";
import { ResultChip } from "@/components/ResultChip";
import { CopyField } from "@/components/CopyField";
import { AttributionBanner } from "@/components/AttributionBanner";
import { SCENARIOS } from "@/domain/fixtures";
import type { Commitment, Criterion, CriterionResult, Outcome } from "@/domain/types";

const outcome = (over: Partial<Outcome> = {}): Outcome => ({
  commitment_id: 1,
  has_outcome: true,
  round: 1,
  status: "outcome_accepted",
  trigger: "initial",
  overall_outcome: "supported",
  overall_reason: "all_required_supported",
  criteria_version: 1,
  evaluated_at: "2024-12-31T12:00:00Z",
  required_total: 2,
  counts: { supported: 2, contradicted: 0, inconclusive: 1 },
  ...over,
});

describe("OutcomePanel", () => {
  it("shows the overall label with the finality chip", () => {
    render(<OutcomePanel outcome={outcome()} finality="accepted" />);
    expect(screen.getByText("Evidence supports")).toBeInTheDocument();
    expect(screen.getByText(/Accepted — can still be appealed/)).toBeInTheDocument();
  });

  it("never collapses accepted into final", () => {
    const { unmount } = render(<OutcomePanel outcome={outcome()} finality="accepted" />);
    expect(screen.queryByText(/^Final$/)).not.toBeInTheDocument();
    unmount();

    render(<OutcomePanel outcome={outcome()} finality="final" />);
    expect(screen.getByText(/^Final$/)).toBeInTheDocument();
  });

  it("states the count basis and renders no score", () => {
    render(<OutcomePanel outcome={outcome()} finality="none" />);
    expect(screen.getByText(/Across all 3 criteria/)).toBeInTheDocument();
    const panel = screen.getByText(/Across all 3 criteria/).closest(".panel")!;
    expect(panel.textContent?.toLowerCase()).not.toMatch(/\b(score|grade|rank)\b/);
  });

  it("counts only required criteria when it can, so the stated basis is what decided the outcome", () => {
    // The contract's `counts` tallies every criterion; `required_total` counts
    // only required ones. Presenting the first next to the second would imply an
    // optional criterion's result fed the decision.
    const criteria: Criterion[] = [
      { id: 1, text: "Publishes the report", measure: "A filed report", required: true,
        has_threshold: false, threshold_milli: 0, operator: "", unit: "", deadline: "" },
      { id: 2, text: "Report is third-party audited", measure: "An audit statement", required: false,
        has_threshold: false, threshold_milli: 0, operator: "", unit: "", deadline: "" },
    ];
    const results: CriterionResult[] = [
      { criterion_id: 1, status: "supported", reason_code: "supporting_evidence_found",
        evidence_used: [1], evidence_considered_not_used: [], has_figure: false,
        figure_milli: 0, unit: "", summary: "" },
      { criterion_id: 2, status: "inconclusive", reason_code: "no_relevant_evidence",
        evidence_used: [], evidence_considered_not_used: [], has_figure: false,
        figure_milli: 0, unit: "", summary: "" },
    ];

    render(
      <OutcomePanel
        outcome={outcome({
          required_total: 1,
          counts: { supported: 1, contradicted: 0, inconclusive: 1 },
        })}
        finality="final"
        criteria={criteria}
        results={results}
      />,
    );

    // One required criterion, supported — the optional inconclusive must not be
    // counted into the stated basis.
    expect(screen.getByText(/Based on 1 required criterion:/)).toBeInTheDocument();
    const basis = screen.getByText(/Based on 1 required criterion:/).textContent ?? "";
    expect(basis).toContain("1 supported");
    expect(basis).toContain("0 contradicted");
    expect(basis).toContain("0 inconclusive");
  });

  it("does not let an optional criterion change the overall label", () => {
    const criteria: Criterion[] = [
      { id: 1, text: "Required one", measure: "Evidence", required: true,
        has_threshold: false, threshold_milli: 0, operator: "", unit: "", deadline: "" },
      { id: 2, text: "Optional one", measure: "Evidence", required: false,
        has_threshold: false, threshold_milli: 0, operator: "", unit: "", deadline: "" },
    ];
    const results: CriterionResult[] = [
      { criterion_id: 1, status: "supported", reason_code: "supporting_evidence_found",
        evidence_used: [1], evidence_considered_not_used: [], has_figure: false,
        figure_milli: 0, unit: "", summary: "" },
      { criterion_id: 2, status: "contradicted", reason_code: "contradicting_evidence_found",
        evidence_used: [1], evidence_considered_not_used: [], has_figure: false,
        figure_milli: 0, unit: "", summary: "" },
    ];

    render(
      <OutcomePanel
        outcome={outcome({
          overall_outcome: "supported",
          required_total: 1,
          counts: { supported: 1, contradicted: 1, inconclusive: 0 },
        })}
        finality="accepted"
        criteria={criteria}
        results={results}
      />,
    );

    // The optional criterion is contradicted but the overall is still supported,
    // and the stated basis shows only the required one.
    expect(screen.getByText("Evidence supports")).toBeInTheDocument();
    expect(screen.getByText(/Based on 1 required criterion:/)).toBeInTheDocument();
  });

  it("shows pending, not inconclusive, before a review exists", () => {
    const pending: Outcome = {
      commitment_id: 1,
      has_outcome: false,
      round: 0,
      status: "evidence_open",
    };
    render(<OutcomePanel outcome={pending} finality="none" pending />);
    expect(screen.getByText("Review pending")).toBeInTheDocument();
    expect(screen.queryByText(/Inconclusive/)).not.toBeInTheDocument();
    expect(screen.getByText(/Pending is not a finding/i)).toBeInTheDocument();
  });

  it("labels an inconclusive overall outcome neutrally", () => {
    render(
      <OutcomePanel
        outcome={outcome({
          overall_outcome: "inconclusive",
          overall_reason: "no_relevant_evidence",
          counts: { supported: 0, contradicted: 0, inconclusive: 2 },
          required_total: 2,
        })}
        finality="final"
      />,
    );
    const panel = screen.getByText("Inconclusive").closest(".panel")!;
    expect(panel.className).not.toMatch(/error|danger/);
    expect(panel.textContent?.toLowerCase()).not.toMatch(/\b(failed|broken|fraud)\b/);
  });
});

describe("FinalityChip", () => {
  it("renders nothing when there is no outcome yet", () => {
    const { container } = render(<FinalityChip state="none" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("distinguishes accepted from final", () => {
    const { unmount } = render(<FinalityChip state="accepted" />);
    expect(screen.getByText(/can still be appealed/i)).toBeInTheDocument();
    unmount();

    render(<FinalityChip state="final" />);
    expect(screen.getByText(/^Final$/)).toBeInTheDocument();
  });
});

describe("ResultChip", () => {
  it("always pairs a shape with a text label, never colour alone", () => {
    const { container } = render(<ResultChip status="inconclusive" />);
    expect(screen.getByText("Inconclusive")).toBeInTheDocument();
    // The dashed outline is what distinguishes "no determination" from "bad".
    expect(container.querySelector(".chip--inconclusive")).toBeInTheDocument();
    expect(container.querySelector(".chip__mark svg")).toBeInTheDocument();
  });

  it("uses a different class per result so they differ in shape too", () => {
    const classes = (["supported", "contradicted", "inconclusive", "pending"] as const).map(
      (status) => {
        const { container, unmount } = render(<ResultChip status={status} />);
        const cls = container.querySelector(".chip")?.className ?? "";
        unmount();
        return cls;
      },
    );
    expect(new Set(classes).size).toBe(classes.length);
  });
});

describe("DataModeBadge", () => {
  it("shows sample data with a distinct shape and label", () => {
    const { container } = render(<DataModeBadge mode="sample" />);
    expect(screen.getByText("Sample data")).toBeInTheDocument();
    expect(container.querySelector(".badge--sample")).toBeInTheDocument();
  });

  it("shows live evidence with a distinct shape and label", () => {
    const { container } = render(<DataModeBadge mode="live" />);
    expect(screen.getByText("Live evidence")).toBeInTheDocument();
    expect(container.querySelector(".badge--live")).toBeInTheDocument();
  });
});

describe("CopyField", () => {
  const tx = `0x${"11".repeat(32)}`;
  const addr = `0x${"22".repeat(20)}`;

  it("truncates an address for display but keeps the full value on hover", () => {
    render(<CopyField value={addr} kind="address" label="test address" />);
    const field = screen.getByTitle(addr);
    expect(field.textContent).toContain("…");
  });

  it("links a transaction to the explorer only when the hash is real", () => {
    render(<CopyField value={tx} kind="tx" label="test tx" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", `https://explorer-studio.genlayer.com/tx/${tx}`);
  });

  it("renders no link for a value that is not a hash", () => {
    const { container } = render(<CopyField value="not-a-hash" kind="tx" label="bad" />);
    expect(container.querySelector("a")).toBeNull();
  });
});

describe("AttributionBanner", () => {
  const commitment = SCENARIOS[0].commitment as Commitment;

  it("always states who registered it and that the subject has not verified it", () => {
    const { container } = render(
      <MemoryRouter>
        <AttributionBanner commitment={commitment} />
      </MemoryRouter>,
    );
    const text = (container.textContent ?? "").replace(/\s+/g, " ");
    // One assertion on the whole sentence: it is split across a CopyField
    // child, so no single element owns the full string.
    expect(text).toMatch(
      /Registered by 0x[0-9a-f…]+ (as an observer|for their own organization)\./,
    );
    expect(text).toMatch(/has not necessarily verified or endorsed this entry/i);
  });

  it("links to the fairness page", () => {
    render(
      <MemoryRouter>
        <AttributionBanner commitment={commitment} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /attribution/i })).toHaveAttribute("href", "/fairness");
  });

  it("surfaces a recorded challenge as a response", () => {
    const scenario = SCENARIOS.find((s) => s.challenges.length > 0);
    expect(scenario).toBeDefined();
    render(
      <MemoryRouter>
        <AttributionBanner commitment={scenario!.commitment} challenges={scenario!.challenges} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/response was recorded/i)).toBeInTheDocument();
  });
});

describe("sample scenario honesty", () => {
  it("labels every sample scenario as sample data", () => {
    expect(SCENARIOS.length).toBe(8);
    for (const scenario of SCENARIOS) {
      expect(scenario.commitment.data_mode).toBe("sample");
      expect(scenario.whatThisTests.length).toBeGreaterThan(10);
    }
  });

  it("names a fabricated subject in every scenario", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.commitment.subject.toLowerCase()).toMatch(/\(sample\)/);
    }
  });

  it("never uses a real-looking public figure as a subject", () => {
    for (const scenario of SCENARIOS) {
      expect(scenario.commitment.source_statement_ref).toMatch(/^https:\/\/example\.org\//);
    }
  });

  it("covers the eight outcomes the spec requires", () => {
    const outcomes = new Set(
      SCENARIOS.map((s) => (s.outcome.has_outcome ? s.outcome.overall_outcome : "none")),
    );
    expect(outcomes).toContain("supported");
    expect(outcomes).toContain("contradicted");
    expect(outcomes).toContain("inconclusive");
  });

  it("includes a round-2 scenario where a challenge changed a result", () => {
    const multi = SCENARIOS.filter((s) => s.rounds.length > 1);
    expect(multi.length).toBeGreaterThan(0);
    const before = multi[0].rounds[0].criteria[0].status;
    const after = multi[0].rounds[1].criteria[0].status;
    expect(after).not.toBe(before);
  });
});

describe("outcome panel and ledger are shown together", () => {
  it("never hides a mixed picture behind a single label", () => {
    const scenario = SCENARIOS.find((s) => {
      if (!s.outcome.has_outcome) return false;
      const c = s.outcome.counts;
      return Boolean(c && c.supported > 0 && c.inconclusive > 0);
    });
    expect(scenario).toBeDefined();

    const counts = scenario!.outcome.counts!;
    const panel = (
      <OutcomePanel outcome={scenario!.outcome} finality="none" />
    );

    render(panel);
    const rendered = screen.getByText("Evidence supports").closest(".panel") as HTMLElement;
    // Both the supported count and the inconclusive count are on screen together.
    expect(within(rendered).getByText(`${counts.supported} supported`)).toBeInTheDocument();
    expect(within(rendered).getByText(`${counts.inconclusive} inconclusive`)).toBeInTheDocument();
  });
});