/**
 * CriterionLedger (UI-CivicLens 5.1) — the one memorable element.
 *
 * Each row pairs the criterion's EXACT wording with the evidence passages used,
 * the per-criterion result, and the reason — like an annotated document.
 *
 * Rules enforced here:
 * - The criterion's wording is quoted material: serif, on a sheet, with a rule.
 * - An excerpt appears ONLY when the record carries one. This component never
 *   invents, paraphrases, or fetches evidence text (section 0.7).
 * - "Considered, not used" is collapsed by default and carries a plain reason.
 * - Numeric criteria show the extracted figure, unit, and threshold in words.
 * - Inconclusive gets a neutral block: what is missing, and what would resolve it.
 */

import { Fragment, useState } from "react";
import type {
  Criterion,
  CriterionResult,
  EvidenceItem,
  ReviewStatus,
} from "@/domain/types";
import {
  EVIDENCE_TYPE_LABEL,
  INCONCLUSIVE_RESOLUTION,
  NOT_USED_LABEL,
  REASON_LABEL,
  reasonCopy,
} from "@/domain/copy";
import { REASON_CODES } from "@/domain/types";
import { displayUnit, formatDate, formatMilli, thresholdPhrase } from "@/domain/format";
import { ResultChip } from "./ResultChip";
import { ExternalMark } from "./Marks";

/** Excerpts are supplied by the caller and are always from the record. */
export interface EvidenceExcerpt {
  text: string;
  /** "evaluated" = the text the contract reviewed; "display-only" = a fetch. */
  provenance: "evaluated" | "display-only";
}

export interface CriterionLedgerProps {
  criteria: Criterion[];
  results: CriterionResult[];
  evidence: EvidenceItem[];
  /** Optional excerpts, keyed by evidence id. Absent = no text is shown. */
  excerpts?: Record<number, EvidenceExcerpt>;
  /** Expand every row by default (print, screen readers, few criteria). */
  defaultExpanded?: boolean;
  /** Hide the required/optional tag (e.g. inside a round record). */
  compact?: boolean;
}

function statusOf(results: CriterionResult[], criterionId: number): ReviewStatus | "pending" {
  return results.find((r) => r.criterion_id === criterionId)?.status ?? "pending";
}

function resultOf(results: CriterionResult[], criterionId: number): CriterionResult | undefined {
  return results.find((r) => r.criterion_id === criterionId);
}

/** Plain words for a numeric verdict: meets / doesn't meet / can't tell. */
function numericVerdict(
  criterion: Criterion,
  result: CriterionResult | undefined,
): { value: string; plain: string } | null {
  if (!criterion.has_threshold) return null;
  if (!result) return null;
  if (!result.has_figure) {
    return { value: "—", plain: "Can't tell — no figure was extractable in the criterion's unit." };
  }
  const meets =
    criterion.operator === "gte"
      ? result.figure_milli >= criterion.threshold_milli
      : result.figure_milli <= criterion.threshold_milli;
  return {
    value: `${formatMilli(result.figure_milli)} ${displayUnit(result.unit || criterion.unit)}`,
    plain: meets
      ? `Meets the threshold of ${thresholdPhrase(criterion)}.`
      : `Does not meet the threshold of ${thresholdPhrase(criterion)}.`,
  };
}

export function CriterionLedger({
  criteria,
  results,
  evidence,
  excerpts,
  defaultExpanded,
  compact = false,
}: CriterionLedgerProps) {
  const many = criteria.length > 3;
  // `defaultExpanded` (print, screen readers) overrides any toggle state, so
  // the same component works in both contexts.
  const [toggled, setToggled] = useState<Record<number, boolean>>({});

  const isOpen = (id: number) =>
    defaultExpanded === true ? true : (toggled[id] ?? !many);

  function toggle(id: number) {
    setToggled((prev) => ({ ...prev, [id]: !isOpen(id) }));
  }

  const byId = new Map(evidence.map((e) => [e.id, e]));

  return (
    <div className="ledger">
      {criteria.map((criterion, index) => {
        const result = resultOf(results, criterion.id);
        const status = statusOf(results, criterion.id);
        const open = isOpen(criterion.id);
        const figure = numericVerdict(criterion, result);
        const bodyId = `criterion-body-${criterion.id}`;

        const used = (result?.evidence_used ?? [])
          .map((id) => byId.get(id))
          .filter((e): e is EvidenceItem => Boolean(e));
        const notUsed = (result?.evidence_considered_not_used ?? [])
          .map((id) => byId.get(id))
          .filter((e): e is EvidenceItem => Boolean(e));

        return (
          <section className="ledger__row" key={criterion.id} aria-labelledby={`criterion-${criterion.id}`}>
            <div className="ledger__head">
              <span className="ledger__index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="ledger__wording">
                <div className="ledger__meta">
                  <span className="tag" id={`criterion-${criterion.id}`}>
                    Criterion {index + 1}
                  </span>
                  {!compact && (
                    <span className={criterion.required ? "tag tag--required" : "tag"}>
                      {criterion.required ? "Required" : "Optional"}
                    </span>
                  )}
                  {criterion.has_threshold && (
                    <span className="tag">Threshold {thresholdPhrase(criterion)}</span>
                  )}
                  {criterion.deadline && <span className="tag">Evidence deadline {formatDate(criterion.deadline)}</span>}
                </div>

                {/* Quoted material: the criterion exactly as registered. */}
                <p className="ledger__wording-text">{criterion.text}</p>
                <p className="ledger__measure">
                  <strong>Measured by:</strong> {criterion.measure}
                </p>
              </div>

              {/* Result chip at the row's right edge; stacks under on mobile. */}
              <div className="ledger__chip">
                <ResultChip status={status} />
              </div>
            </div>

            <button
              type="button"
              className="btn btn--quiet btn--small ledger__toggle"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={() => toggle(criterion.id)}
            >
              {open ? "Hide detail" : "Show detail"}
            </button>

            <div className="ledger__body" id={bodyId} hidden={!open}>
              {figure && (
                <div className="figure">
                  <span className="figure__cell">
                    <span className="figure__key">Extracted figure</span>
                    <span className="figure__value">{figure.value}</span>
                  </span>
                  <span className="figure__cell">
                    <span className="figure__key">Criterion asks for</span>
                    <span className="figure__plain">{thresholdPhrase(criterion)}</span>
                  </span>
                  <span className="figure__cell">
                    <span className="figure__key">In plain words</span>
                    <span className="figure__plain">{figure.plain}</span>
                  </span>
                </div>
              )}

              {/* --- evidence used ------------------------------------------ */}
              <div>
                <p className="ledger__sub">
                  {used.length === 0 ? "No evidence was used for this criterion" : "Evidence used"}
                </p>
                {used.length === 0 ? (
                  <p className="hint">
                    Nothing the review read pointed at this criterion. That is a statement about
                    the evidence on file, not about the organization.
                  </p>
                ) : (
                  used.map((item) => (
                    <EvidenceLine key={item.id} item={item} excerpt={excerpts?.[item.id]} used />
                  ))
                )}
              </div>

              {/* --- considered but not used (collapsed) --------------------- */}
              {notUsed.length > 0 && (
                <details className="disclosure">
                  <summary>
                    {NOT_USED_LABEL} — {notUsed.length} source{notUsed.length === 1 ? "" : "s"}
                  </summary>
                  {notUsed.map((item) => (
                    <Fragment key={item.id}>
                      <EvidenceLine item={item} excerpt={excerpts?.[item.id]} used={false} />
                      <p className="hint">
                        In the review's eligible set for this criterion, but not cited in the
                        verdict.
                      </p>
                    </Fragment>
                  ))}
                </details>
              )}

              {/* --- reason ------------------------------------------------- */}
              <div>
                <p className="ledger__sub">Reason</p>
                {result?.summary ? (
                  <p className="ledger__measure">{result.summary}</p>
                ) : (
                  <p className="ledger__measure">{reasonCopy(result?.reason_code)}</p>
                )}
                {result && (
                  <p className="hint">
                    Recorded reason code: <code>{result.reason_code}</code>
                  </p>
                )}
              </div>

              {/* --- inconclusive block: neutral, never an error ------------ */}
              {status === "inconclusive" && (
                <div className="resolution">
                  <p>
                    <span className="resolution__key">What this means:</span> the review could not
                    determine whether the evidence supports this criterion. That is not a finding
                    that the commitment went unmet.
                  </p>
                  {result && (
                    <p>
                      <span className="resolution__key">What's missing or conflicting:</span>{" "}
                      {REASON_LABEL[result.reason_code] ??
                        REASON_LABEL[REASON_CODES[0]]}
                    </p>
                  )}
                  {result && INCONCLUSIVE_RESOLUTION[result.reason_code] && (
                    <p>{INCONCLUSIVE_RESOLUTION[result.reason_code]}</p>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** One evidence item inside the ledger. */
function EvidenceLine({
  item,
  excerpt,
  used,
}: {
  item: EvidenceItem;
  excerpt?: EvidenceExcerpt;
  used: boolean;
}) {
  return (
    <div className="ev">
      <div className="ev__body">
        <p className="ev__title">
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {titleOf(item.url)} <ExternalMark />
          </a>
        </p>
        <p className="ev__meta">
          <span>{EVIDENCE_TYPE_LABEL[item.evidence_type] ?? item.evidence_type}</span>
          <span>
            Published {item.published_date ? formatDate(item.published_date) : "date not stated"}
          </span>
          <span>#{item.id}</span>
          <span>{used ? "Evaluated" : "Considered"}</span>
          {excerpt && (
            <span className="tag">
              {excerpt.provenance === "evaluated" ? "evaluated" : "display-only"}
            </span>
          )}
        </p>
        {item.note && <p className="hint">Submitter note (not used by the review): {item.note}</p>}
        {excerpt && (
          <blockquote className="excerpt ev__excerpt">
            {excerpt.provenance === "display-only" ? (
              <span className="tag">display-only — not the text the contract reviewed</span>
            ) : null}
            {excerpt.text}
          </blockquote>
        )}
      </div>
    </div>
  );
}

/**
 * Link label for a source. Deliberately the DOMAIN ONLY.
 *
 * A filename can be long, opaque, and in any script; a domain is short, tells
 * a reader at a glance whether the source looks authoritative, and stays
 * legible in the ledger and on paper. The full URL stays in the href and in the
 * title attribute.
 */
function titleOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export default CriterionLedger;