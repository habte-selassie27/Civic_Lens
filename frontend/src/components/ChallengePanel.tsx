/**
 * ChallengePanel (UI-CivicLens 5.8).
 *
 * Target a criterion or the whole outcome, give bounded grounds, attach evidence
 * already on file, and see in plain words what happens next.
 *
 * The copy about GenLayer's own appeal process is deliberately cautious: the
 * relationship is documented in docs/fairness.md, and this component states
 * only what the contract actually does — a challenge opens a NEW review round
 * with new inputs. It does not claim to be, or replace, a protocol-level appeal.
 */

import { useState } from "react";
import type { Commitment, EvidenceItem, ContractConstants } from "@/domain/types";
import { EVIDENCE_TYPE_LABEL, mapError } from "@/domain/copy";
import { formatDate } from "@/domain/format";
import { ActionButton } from "./DisabledReason";

const GROUNDS_MIN = 10;
const GROUNDS_MAX = 1000;

export interface ChallengePanelProps {
  commitment: Commitment;
  constants: ContractConstants;
  evidence: EvidenceItem[];
  disabledReason?: string | null;
  /** Whether THIS account has already used its challenge (per-party cap of 1). */
  alreadyChallenged: boolean;
  onSubmit(input: {
    target: string;
    grounds: string;
    newEvidenceIds: number[];
  }): Promise<void>;
  busy?: boolean;
}

export function ChallengePanel({
  commitment,
  constants,
  evidence,
  disabledReason,
  alreadyChallenged,
  onSubmit,
  busy = false,
}: ChallengePanelProps) {
  const [target, setTarget] = useState("");
  const [grounds, setGrounds] = useState("");
  const [attached, setAttached] = useState<number[]>([]);
  const [fault, setFault] = useState<{ message: string; detail: string } | null>(null);

  const remaining = Math.max(0, constants.max_new_evidence_per_challenge - attached.length);
  const trimmedGrounds = grounds.trim();
  const tooShort = trimmedGrounds.length > 0 && trimmedGrounds.length < GROUNDS_MIN;
  const tooLong = trimmedGrounds.length > GROUNDS_MAX;

  const blocked = disabledReason
    ? disabledReason
    : alreadyChallenged
      ? `You have already opened a challenge on this commitment. The contract allows ${constants.max_challenges_per_party} per party.`
      : tooShort
        ? `Grounds must be at least ${GROUNDS_MIN} characters.`
        : tooLong
          ? `Grounds must be at most ${GROUNDS_MAX} characters.`
          : null;

  function toggleEvidence(id: number) {
    setAttached((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < constants.max_new_evidence_per_challenge ? [...prev, id] : prev,
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFault(null);
    try {
      await onSubmit({ target, grounds: trimmedGrounds, newEvidenceIds: attached });
      setGrounds("");
      setAttached([]);
      setTarget("");
    } catch (err) {
      setFault(mapError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field__label" htmlFor="ch-target">
          What are you challenging?
        </label>
        <select
          id="ch-target"
          className="select"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          disabled={Boolean(disabledReason) || busy}
        >
          <option value="">The overall outcome</option>
          {commitment.criteria.map((c, i) => (
            <option key={c.id} value={String(c.id)}>
              Criterion {i + 1}: {c.text.slice(0, 60)}
              {c.text.length > 60 ? "…" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="ch-grounds">
          Grounds <span className="field__req">required</span>
        </label>
        <textarea
          id="ch-grounds"
          className="textarea"
          value={grounds}
          maxLength={GROUNDS_MAX}
          onChange={(e) => setGrounds(e.target.value)}
          placeholder="State which part of the outcome you dispute and why the evidence supports a different reading."
          disabled={Boolean(disabledReason) || busy}
          aria-describedby="ch-count ch-hint"
        />
        <p className="field__hint" id="ch-count">
          {trimmedGrounds.length} / {GROUNDS_MAX} characters
        </p>
        <p className="field__hint" id="ch-hint">
          Describe the disagreement, not the conclusion you want. Grounds are public on the record.
        </p>
      </div>

      {evidence.length > 0 && (
        <fieldset style={{ border: 0, padding: 0, margin: "0 0 var(--space-4)" }}>
          <legend className="field__label" style={{ padding: 0 }}>
            Attach evidence already on file ({attached.length}/
            {constants.max_new_evidence_per_challenge})
          </legend>
          <div className="stack" style={{ maxHeight: "14rem", overflowY: "auto" }}>
            {evidence.map((item) => (
              <label
                key={item.id}
                className="radio-row"
                style={{ alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  checked={attached.includes(item.id)}
                  onChange={() => toggleEvidence(item.id)}
                  disabled={Boolean(disabledReason) || busy || (!attached.includes(item.id) && remaining === 0)}
                  style={{ marginTop: "0.35rem", minHeight: "auto" }}
                />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: "var(--t-14)" }}>
                    {EVIDENCE_TYPE_LABEL[item.evidence_type] ?? item.evidence_type} ·{" "}
                    {item.published_date ? formatDate(item.published_date) : "date not stated"}
                  </span>
                  <span className="hint" style={{ display: "block" }}>
                    {item.url}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="field__hint">Only sources already submitted to this commitment can be attached.</p>
        </fieldset>
      )}

      <div className="resolution" style={{ marginBottom: "var(--space-4)" }}>
        <p>
          <span className="resolution__key">What happens next:</span> a challenge opens a new
          review round. Validators re-run the review with the attached evidence included, and the
          result is recorded as a new round — the earlier rounds stay on the record.
        </p>
        <p>
          This is separate from GenLayer's own protocol appeals. A protocol appeal disputes the
          committee's decision on the same inputs; a CivicLens challenge supplies new inputs. They
          do not replace or bypass one another.
        </p>
      </div>

      {fault && (
        <div className="fault" style={{ marginBottom: "var(--space-3)" }}>
          <p className="fault__message">{fault.message}</p>
          <details className="disclosure">
            <summary>Details</summary>
            <p className="fault__detail">{fault.detail}</p>
          </details>
        </div>
      )}

      <ActionButton type="submit" disabledReason={blocked} busy={busy}>
        Open challenge
      </ActionButton>
    </form>
  );
}

export default ChallengePanel;