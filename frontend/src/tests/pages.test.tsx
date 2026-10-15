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

/** Contract audit-trail fields, added with figure verification. */
const AUDIT_DEFAULTS = {
  source_quote: "",
  source_evidence_id: 0,
  figure_verified: false,
  held_from_prior: false,
} as const;

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
        figure_milli: 0, unit: "", summary: "", ...AUDIT_DEFAULTS },
      { criterion_id: 2, status: "inconclusive", reason_code: "no_relevant_evidence",
        evidence_used: [], evidence_considered_not_used: [], has_figure: false,
        figure_milli: 0, unit: "", summary: "", ...AUDIT_DEFAULTS },
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
        figure_milli: 0, unit: "", summary: "", ...AUDIT_DEFAULTS },
      { criterion_id: 2, status: "contradicted", reason_code: "contradicting_evidence_found",
        evidence_used: [1], evidence_considered_not_used: [], has_figure: false,
        figure_milli: 0, unit: "", summary: "", ...AUDIT_DEFAULTS },
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
      /Registered by 0x[0-9a-f…]+ (as an observer|for their own organization)\./i,
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

describe("demo record honesty", () => {
  it("declares where every bundled record came from", () => {
    expect(SCENARIOS.length).toBe(8);
    for (const scenario of SCENARIOS) {
      expect(["recorded_on_chain", "authored_illustration"]).toContain(scenario.provenance);
      expect(scenario.whatThisTests.length).toBeGreaterThan(10);
      expect(scenario.note.length).toBeGreaterThan(10);
    }
    // Both kinds are present, so the distinction is exercised rather than
    // theoretical.
    expect(SCENARIOS.some((s) => s.provenance === "recorded_on_chain")).toBe(true);
    expect(SCENARIOS.some((s) => s.provenance === "authored_illustration")).toBe(true);
  });

  it("only ever invents data it labels as invented", () => {
    for (const scenario of SCENARIOS) {
      if (scenario.provenance !== "authored_illustration") continue;
      // A fictional subject, stated as fictional on its face.
      expect(scenario.commitment.subject).toMatch(/\(sample\)/);
      // And references that CANNOT be mistaken for a real document: the
      // contract would reject them and the UI must not render them as links.
      expect(scenario.commitment.source_statement_ref).toMatch(/^sample:\/\//);
      for (const item of scenario.evidence) {
        expect(item.url).toMatch(/^sample:\/\//);
      }
    }
  });

  it("gives a replayed record a real subject and a resolvable source", () => {
    const recorded = SCENARIOS.filter((s) => s.provenance === "recorded_on_chain");
    expect(recorded.length).toBeGreaterThan(0);
    for (const scenario of recorded) {
      expect(scenario.commitment.subject).not.toMatch(/\(sample\)/);
      expect(scenario.commitment.source_statement_ref).toMatch(/^https:\/\//);
      for (const item of scenario.evidence) {
        expect(item.url).toMatch(/^https:\/\//);
      }
      // The record is a replay, so it carries the transaction that created it
      // (or is explicit that it was not captured).
      expect(scenario.recordedTx ?? "").toMatch(/^(0x[0-9a-f]{64})?$/);
    }
  });

  it("never presents a replay as live consensus", () => {
    // A replay is a recording of a past decision. It must not claim to be a
    // transaction the reader could inspect for a current round.
    for (const scenario of SCENARIOS.filter((s) => s.provenance === "recorded_on_chain")) {
      expect(scenario.commitment.data_mode).toBe("live");
      expect(scenario.rounds.length).toBeGreaterThan(0);
      for (const round of scenario.rounds) {
        expect(round.evaluated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      }
    }
  });

  it("covers supported and inconclusive across the bundled records", () => {
    const outcomes = new Set(
      SCENARIOS.map((s) => (s.outcome.has_outcome ? s.outcome.overall_outcome : "none")),
    );
    expect(outcomes).toContain("supported");
    expect(outcomes).toContain("inconclusive");
  });

  it("replays a challenge round that considered new evidence without resting on it", () => {
    const multi = SCENARIOS.filter((s) => s.rounds.length > 1);
    expect(multi.length).toBeGreaterThan(0);
    const challenged = multi.find((s) => s.challenges.length > 0);
    expect(challenged).toBeDefined();

    const [round1, round2] = challenged!.rounds;
    expect(round2.trigger).toBe("challenge");
    // The challenge's attached evidence is NEW to round 2 …
    const attached = new Set(challenged!.challenges.flatMap((c) => c.new_evidence_ids));
    expect(attached.size).toBeGreaterThan(0);
    // … and it was considered rather than ignored.
    const considered = new Set(round2.evidence_considered);
    for (const id of attached) expect(considered.has(id)).toBe(true);
    // The finding did not flip, because the new evidence was not cited.
    expect(round2.criteria[0].status).toBe(round1.criteria[0].status);
  });

  it("replays a numeric finding whose figure was verified against a passage", () => {
    const numeric = SCENARIOS.find(
      (s) => s.rounds.some((r) => r.criteria.some((c) => c.figure_verified)),
    );
    expect(numeric).toBeDefined();
    const verified = numeric!.rounds
      .flatMap((r) => r.criteria)
      .find((c) => c.figure_verified)!;
    // A verified figure carries the passage it was confirmed in and the source
    // that passage came from — otherwise "verified" would be unfalsifiable.
    expect(verified.source_quote.length).toBeGreaterThan(8);
    expect(verified.source_evidence_id).toBeGreaterThan(0);
    expect(verified.has_figure).toBe(true);
    expect(verified.figure_milli).toBeGreaterThan(0);
  });

  it("replays sources that could not be read, recorded as such", () => {
    const unread = SCENARIOS.filter((s) =>
      s.rounds.some((r) => r.retrieval.some((x) => x.status !== "fetched")),
    );
    expect(unread.length).toBeGreaterThan(0);
    for (const scenario of unread) {
      for (const round of scenario.rounds) {
        for (const record of round.retrieval) {
          if (record.status === "fetched") continue;
          // A source that was never read must not be cited by any verdict.
          const cited = round.criteria.some((c) => c.evidence_used.includes(record.evidence_id));
          expect(cited).toBe(false);
        }
      }
    }
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