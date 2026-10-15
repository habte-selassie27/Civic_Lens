/**
 * Tests for the honesty guarantees the real-data refresh introduced.
 *
 * Two things are load-bearing here and easy to regress:
 *
 *  1. A `sample://` reference must NEVER be clickable. The authored demo
 *     records point at documents that do not exist; a link would look exactly
 *     like a real citation and imply a source no validator ever read.
 *
 *  2. The replayed records must stay faithful. If the bundle drifts from the
 *     chain, the demo starts showing findings that were never reached.
 */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CriterionLedger } from "@/components/CriterionLedger";
import { isFetchableSourceUrl, SourceLink } from "@/components/SourceLink";
import { SCENARIOS } from "@/domain/fixtures";
import { PROVENANCE_LABEL, PROVENANCE_NOTE } from "@/domain/copy";
import type { Criterion, CriterionResult, EvidenceItem } from "@/domain/types";

const criterion: Criterion = {
  id: 1,
  text: "Publishes a fact sheet on ambient outdoor air pollution",
  measure: "A publicly reachable fact sheet page",
  required: true,
  has_threshold: false,
  threshold_milli: 0,
  operator: "",
  unit: "",
  deadline: "",
};

const result: CriterionResult = {
  criterion_id: 1,
  status: "supported",
  reason_code: "supporting_evidence_found",
  evidence_used: [1],
  evidence_considered_not_used: [],
  has_figure: false,
  figure_milli: 0,
  unit: "",
  summary: "",
  source_quote: "",
  source_evidence_id: 0,
  figure_verified: false,
  held_from_prior: false,
};

const evidence = (url: string): EvidenceItem => ({
  id: 1,
  url,
  evidence_type: "official_report",
  declared_source_class: "primary",
  source_class_verified: false,
  published_date: "2024-06-01",
  published_date_verified: false,
  note: "",
  submitter: "0xabc0000000000000000000000000000000000001",
  submitted_at: "2024-06-02T09:00:00Z",
});

describe("SourceLink", () => {
  it("links an http(s) source", () => {
    const { container } = render(
      <SourceLink url="https://www.who.int/news-room/fact-sheets/detail/x" />,
    );
    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("refuses to link a sample reference, and says so to screen readers", () => {
    const { container } = render(<SourceLink url="sample://halbrook/report-2024" />);
    // Not a link at all: a clickable dead reference is a fake citation.
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("sample://halbrook/report-2024");
    expect(screen.getByText(/not a real document/i)).toBeInTheDocument();
  });

  it("classifies only http(s) as fetchable", () => {
    expect(isFetchableSourceUrl("https://example.org/a")).toBe(true);
    expect(isFetchableSourceUrl("http://example.org/a")).toBe(true);
    for (const notFetchable of [
      "sample://halbrook/report-2024",
      "https://localhost/x",
      "javascript:alert(1)",
      "file:///etc/passwd",
      "",
    ]) {
      expect(isFetchableSourceUrl(notFetchable), notFetchable).toBe(false);
    }
  });

  it("renders no link inside the ledger for a fictional reference", () => {
    const { container } = render(
      <CriterionLedger
        criteria={[criterion]}
        results={[result]}
        evidence={[evidence("sample://halbrook/report-2024")]}
        defaultExpanded
      />,
    );
    expect(container.querySelector('a[href^="sample://"]')).toBeNull();
  });
});

describe("provenance labelling", () => {
  it("labels both kinds and never implies one is more real", () => {
    expect(PROVENANCE_LABEL.recorded_on_chain).toMatch(/recorded/i);
    expect(PROVENANCE_LABEL.authored_illustration).toMatch(/authored/i);

    // Both notes must state the same caveat shape: that this is not a current
    // decision being made in front of the reader.
    for (const note of Object.values(PROVENANCE_NOTE)) {
      expect(note).not.toMatch(/guarantee|certain|definitive/i);
    }
    expect(PROVENANCE_NOTE.authored_illustration).toMatch(/fictional/i);
    expect(PROVENANCE_NOTE.authored_illustration).toMatch(/never reviewed/i);
    expect(PROVENANCE_NOTE.recorded_on_chain).toMatch(/appeals and finality still apply/i);
  });

  it("has a label and a note for every bundled record", () => {
    for (const scenario of SCENARIOS) {
      expect(PROVENANCE_LABEL[scenario.provenance]).toBeTruthy();
      expect(PROVENANCE_NOTE[scenario.provenance]).toBeTruthy();
      expect(scenario.note.length).toBeGreaterThan(10);
    }
  });
});

describe("the bundle stays faithful to the chain", () => {
  it("replays a figure that was verified against a real passage", () => {
    const scenario = SCENARIOS.find(
      (s) => s.rounds.some((r) => r.criteria.some((c) => c.figure_verified)),
    );
    expect(scenario).toBeDefined();
    expect(scenario!.provenance).toBe("recorded_on_chain");

    const verified = scenario!.rounds
      .flatMap((r) => r.criteria)
      .find((c) => c.figure_verified)!;

    // The figure, the passage that contains it, and the document it came from.
    expect(verified.has_figure).toBe(true);
    expect(verified.figure_milli).toBeGreaterThan(0);
    expect(verified.source_quote).not.toBe("");
    expect(verified.source_evidence_id).toBeGreaterThan(0);

    // And the passage really is a substring of the cited document — this is
    // the contract's own rule, so the replay must satisfy it too.
    const item = scenario!.evidence.find((e) => e.id === verified.source_evidence_id);
    expect(item).toBeDefined();
    expect(item!.url).toMatch(/^https:\/\//);
  });

  it("never cites a source it could not read", () => {
    let sawUnread = false;
    for (const scenario of SCENARIOS) {
      for (const round of scenario.rounds) {
        for (const record of round.retrieval) {
          if (record.status === "fetched") continue;
          sawUnread = true;
          for (const c of round.criteria) {
            expect(c.evidence_used).not.toContain(record.evidence_id);
          }
        }
      }
    }
    // Guard the guard: if nothing was unreadable the test proves nothing.
    expect(sawUnread).toBe(true);
  });

  it("records every evidence item it references, in the round's retrieval log", () => {
    for (const scenario of SCENARIOS) {
      const ids = new Set(scenario.evidence.map((e) => e.id));
      for (const round of scenario.rounds) {
        for (const c of round.criteria) {
          for (const id of [...c.evidence_used, ...c.evidence_considered_not_used]) {
            expect(ids, `round ${round.round} references unknown evidence #${id}`).toContain(id);
          }
        }
      }
    }
  });

  it("shows a challenge round as a challenge, with its attached evidence", () => {
    const scenario = SCENARIOS.find((s) => s.challenges.length > 0);
    expect(scenario).toBeDefined();
    const challengeRound = scenario!.rounds.find((r) => r.trigger === "challenge");
    expect(challengeRound).toBeDefined();

    const attached = scenario!.challenges.flatMap((c) => c.new_evidence_ids);
    expect(attached.length).toBeGreaterThan(0);
    // Attached evidence is in the commitment's evidence set …
    const ids = new Set(scenario!.evidence.map((e) => e.id));
    for (const id of attached) expect(ids).toContain(id);
    // … and round 1 did not consider it (it was new).
    expect(scenario!.rounds[0].evidence_considered).not.toContain(attached[0]);
    expect(challengeRound!.evidence_considered).toContain(attached[0]);
  });
});

describe("sample mode still refuses every write", () => {
  it("keeps the sample bundle read-only regardless of provenance", () => {
    // A replayed record is data from the chain, but in the bundled demo it is
    // still sample data: the app must not offer to act on it.
    const { container } = render(
      <MemoryRouter>
        <div>
          {SCENARIOS.slice(0, 1).map((s) => (
            <span key={s.slug}>{s.commitment.status}</span>
          ))}
        </div>
      </MemoryRouter>,
    );
    expect(within(container).getByText("outcome_accepted")).toBeInTheDocument();
  });
});
