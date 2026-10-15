/**
 * Criterion Ledger tests (UI-CivicLens section 12).
 *
 * Covers the states the spec calls out by name: zero / one / many evidence
 * items, considered-but-unused, numeric criteria at and off the threshold, the
 * inconclusive block, and mixed outcomes.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CriterionLedger } from "@/components/CriterionLedger";
import type { Criterion, CriterionResult, EvidenceItem } from "@/domain/types";

const criterion = (over: Partial<Criterion> = {}): Criterion => ({
  id: 1,
  text: "Publishes an annual emissions report for 2024",
  measure: "An official report filed with the regulator",
  required: true,
  has_threshold: false,
  threshold_milli: 0,
  operator: "",
  unit: "",
  deadline: "",
  ...over,
});

const result = (over: Partial<CriterionResult> = {}): CriterionResult => ({
  criterion_id: 1,
  status: "supported",
  reason_code: "supporting_evidence_found",
  evidence_used: [1],
  evidence_considered_not_used: [],
  has_figure: false,
  figure_milli: 0,
  unit: "",
  summary: "",
  ...over,
});

const evidence = (id: number, over: Partial<EvidenceItem> = {}): EvidenceItem => ({
  id,
  url: `https://evidence.example.org/report-${id}.pdf`,
  evidence_type: "official_report",
  published_date: "2024-06-01",
  note: "",
  submitter: "0xabc0000000000000000000000000000000000001",
  submitted_at: "2024-06-02T09:00:00Z",
  ...over,
});

describe("CriterionLedger", () => {
  it("renders the criterion's exact wording and its result together", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );

    expect(
      screen.getByText("Publishes an annual emissions report for 2024"),
    ).toBeInTheDocument();
    expect(screen.getByText("Evidence supports")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("works with zero evidence and says so without blaming anyone", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result({ status: "inconclusive", reason_code: "no_relevant_evidence", evidence_used: [] })]}
        evidence={[]}
        defaultExpanded
      />,
    );

    expect(screen.getByText("No evidence was used for this criterion")).toBeInTheDocument();
    expect(
      screen.getByText(/statement about the evidence on file, not about the organization/i),
    ).toBeInTheDocument();
  });

  it("works with one evidence item", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    expect(screen.getByText("Evidence used")).toBeInTheDocument();
  });

  it("works with many evidence items and lists each one", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result({ evidence_used: [1, 2, 3] })]}
        evidence={[evidence(1), evidence(2), evidence(3)]}
        defaultExpanded
      />,
    );
    // Links are labelled by domain, with the full URL on the href.
    const links = screen.getAllByRole("link", { name: "evidence.example.org" });
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute(
      "href",
      "https://evidence.example.org/report-1.pdf",
    );
  });

  it("collapses 'considered but not used' and lists each with a reason", async () => {
    const user = userEvent.setup();
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result({ evidence_used: [1], evidence_considered_not_used: [2] })]}
        evidence={[evidence(1), evidence(2)]}
        defaultExpanded
      />,
    );

    const disclosure = screen.getByText(/Considered, not used/);
    // Collapsed by default: the item is not visible until the summary is used.
    expect(disclosure.closest("details")).not.toHaveAttribute("open");

    await user.click(disclosure);
    expect(screen.getAllByRole("link", { name: "evidence.example.org" })).toHaveLength(2);
    expect(screen.getByText(/not cited in the verdict/i)).toBeInTheDocument();
  });

  it("shows an extracted figure and the threshold in plain words when they agree", () => {
    render(
      <CriterionLedger
        criteria={[
          criterion({ has_threshold: true, operator: "gte", threshold_milli: 100_000, unit: "co2e_tonnes" }),
        ]}
        // 110 kt against a 100 kt floor: meets it.
        results={[result({ reason_code: "threshold_met", has_figure: true, figure_milli: 110_000, unit: "co2e_tonnes" })]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );

    expect(screen.getByText("110 co2e tonnes")).toBeInTheDocument();
    expect(screen.getByText("Meets the threshold of ≥ 100 co2e tonnes.")).toBeInTheDocument();
  });

  it("says plainly when a figure does not meet the threshold", () => {
    render(
      <CriterionLedger
        criteria={[
          criterion({ has_threshold: true, operator: "gte", threshold_milli: 100_000, unit: "co2e_tonnes" }),
        ]}
        // 90 kt against a 100 kt floor: does not meet it.
        results={[result({ status: "contradicted", reason_code: "threshold_not_met", has_figure: true, figure_milli: 90_000, unit: "co2e_tonnes" })]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );

    expect(screen.getByText("90 co2e tonnes")).toBeInTheDocument();
    expect(screen.getByText("Does not meet the threshold of ≥ 100 co2e tonnes.")).toBeInTheDocument();
  });

  it("handles a figure exactly at the threshold", () => {
    render(
      <CriterionLedger
        criteria={[
          criterion({ has_threshold: true, operator: "gte", threshold_milli: 100_000, unit: "pct" }),
        ]}
        results={[result({ reason_code: "threshold_met", has_figure: true, figure_milli: 100_000, unit: "pct" })]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    // gte at exactly the threshold meets.
    expect(screen.getByText("Meets the threshold of ≥ 100 pct.")).toBeInTheDocument();
  });

  it("renders the neutral inconclusive block, never an error style", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[
          result({
            status: "inconclusive",
            reason_code: "no_relevant_evidence",
            evidence_used: [],
          }),
        ]}
        evidence={[]}
        defaultExpanded
      />,
    );

    const block = screen.getByText(/What this means/).closest(".resolution");
    expect(block).toBeInTheDocument();
    expect(block?.className).not.toMatch(/error|danger|alert/);
    expect(screen.getByText(/not a finding that the commitment went unmet/i)).toBeInTheDocument();
    expect(screen.getByText(/What could resolve this/)).toBeInTheDocument();
  });

  it("shows a mixed picture: required supported, optional inconclusive", () => {
    render(
      <CriterionLedger
        criteria={[
          criterion({ id: 1 }),
          criterion({ id: 2, text: "Publishes a second report", required: false }),
        ]}
        results={[
          result({ criterion_id: 1, status: "supported" }),
          result({ criterion_id: 2, status: "inconclusive", reason_code: "no_relevant_evidence", evidence_used: [] }),
        ]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );

    expect(screen.getByText("Evidence supports")).toBeInTheDocument();
    expect(screen.getByText("Inconclusive")).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
  });

  it("shows 'Review pending' before any review has happened", () => {
    render(<CriterionLedger criteria={[criterion()]} results={[]} evidence={[]} />);
    expect(screen.getByText("Review pending")).toBeInTheDocument();
  });

  it("expands rows by default when there are few criteria", () => {
    render(<CriterionLedger criteria={[criterion()]} results={[result()]} evidence={[evidence(1)]} />);
    // One criterion is not a list to scan — it is open on arrival.
    expect(screen.getByRole("button", { name: "Hide detail" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("Evidence used")).toBeInTheDocument();
  });

  it("collapses rows by default when there are many, and toggles by keyboard", async () => {
    const user = userEvent.setup();
    render(
      <CriterionLedger
        criteria={[1, 2, 3, 4].map((id) => criterion({ id, text: `Criterion number ${id}` }))}
        results={[1, 2, 3, 4].map((id) => result({ criterion_id: id }))}
        evidence={[evidence(1)]}
      />,
    );

    const toggle = screen.getAllByRole("button", { name: "Show detail" })[0];
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    // Reach it the way a keyboard user would, then activate with Enter.
    toggle.focus();
    expect(toggle).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getAllByRole("button", { name: "Hide detail" })[0]).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("survives very long criterion wording without truncating the text", () => {
    const long = "R".repeat(480);
    render(
      <CriterionLedger
        criteria={[criterion({ text: long })]}
        results={[result()]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );
    expect(screen.getByText(long)).toBeInTheDocument();
  });

  it("never shows an excerpt the record did not contain", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        excerpts={{ 2: { text: "an excerpt with no source in the record", provenance: "display-only" } }}
        defaultExpanded
      />,
    );
    expect(screen.queryByText(/no source in the record/)).not.toBeInTheDocument();
  });

  it("labels an excerpt that came from the record as evaluated", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        excerpts={{ 1: { text: "Scope 1 emissions for 2024 were 90 kt.", provenance: "evaluated" } }}
        defaultExpanded
      />,
    );
    expect(screen.getByText("Scope 1 emissions for 2024 were 90 kt.")).toBeInTheDocument();
    expect(screen.getByText("evaluated")).toBeInTheDocument();
  });

  it("labels a display-only excerpt as such", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        excerpts={{ 1: { text: "fetched later for display", provenance: "display-only" } }}
        defaultExpanded
      />,
    );
    expect(screen.getByText(/display-only — not the text the contract reviewed/i)).toBeInTheDocument();
  });

  it("exposes criterion, result, and reason in reading order", () => {
    const { container } = render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1)]}
        defaultExpanded
      />,
    );

    const row = container.querySelector(".ledger__row")!;
    const text = row.textContent ?? "";
    expect(text.indexOf("Criterion 1")).toBeLessThan(text.indexOf("Evidence supports"));
    expect(text.indexOf("Evidence supports")).toBeLessThan(text.indexOf("Reason"));
  });

  it("marks a submitter note as not used by the review", () => {
    render(
      <CriterionLedger
        criteria={[criterion()]}
        results={[result()]}
        evidence={[evidence(1, { note: "this looks damning" })]}
        defaultExpanded
      />,
    );
    const row = screen.getByText(/Submitter note/).closest("div");
    expect(within(row as HTMLElement).getByText(/not used by the review/i)).toBeInTheDocument();
  });
});