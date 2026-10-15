/**
 * EvidenceSubmitForm (UI-CivicLens 5.7).
 *
 * The contract's `note` field is labeled "Your note (not used by the review)".
 * There is no stance field in the deployed schema, and the UI must never imply
 * that a submitter's framing influences the result — that is the whole gaming
 * story in one label.
 *
 * Limits come from `get_constants()` when a contract is configured, and from the
 * mirrored snapshot otherwise. Duplicate and out-of-window feedback arrives as
 * contract errors and is mapped by domain/copy.
 */

import { useState } from "react";
import { EVIDENCE_TYPES, type ContractConstants, type EvidenceType } from "@/domain/types";
import { EVIDENCE_TYPE_LABEL, mapError } from "@/domain/copy";
import { ActionButton } from "./DisabledReason";

export interface EvidenceSubmitFormProps {
  constants: ContractConstants;
  /** Items already on file, for the "n of m used" line. */
  existingCount: number;
  submitterCount: number;
  /** Set when the window/state machine forbids submission. */
  disabledReason?: string | null;
  onSubmit(input: {
    url: string;
    evidenceType: string;
    publishedDate: string;
    note: string;
  }): Promise<void>;
  busy?: boolean;
}

const URL_RE = /^https?:\/\/\S+$/i;

export function EvidenceSubmitForm({
  constants,
  existingCount,
  submitterCount,
  disabledReason,
  onSubmit,
  busy = false,
}: EvidenceSubmitFormProps) {
  const [url, setUrl] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("official_report");
  const [publishedDate, setPublishedDate] = useState("");
  const [note, setNote] = useState("");
  const [fault, setFault] = useState<{ message: string; detail: string; retryable: boolean } | null>(
    null,
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  const remainingTotal = Math.max(0, constants.max_evidence - existingCount);
  const remainingMine = Math.max(0, constants.max_evidence_per_submitter - submitterCount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFault(null);

    if (!URL_RE.test(url.trim())) {
      setFieldError("Enter a full http or https link to the source.");
      return;
    }
    setFieldError(null);

    try {
      await onSubmit({
        url: url.trim(),
        evidenceType,
        publishedDate: publishedDate.trim(),
        note: note.trim(),
      });
      setUrl("");
      setPublishedDate("");
      setNote("");
    } catch (err) {
      setFault(mapError(err));
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label className="field__label" htmlFor="ev-url">
          Source link <span className="field__req">required</span>
        </label>
        <input
          id="ev-url"
          className="input"
          type="url"
          inputMode="url"
          placeholder="https://example.org/report.pdf"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-describedby="ev-url-hint"
          disabled={Boolean(disabledReason) || busy}
        />
        <p className="field__hint" id="ev-url-hint">
          A public page or document. The link is what the review fetches; the review does not
          follow links behind a login.
        </p>
        {fieldError && <p className="field__error">{fieldError}</p>}
      </div>

      <div className="grid-2">
        <div className="field">
          <label className="field__label" htmlFor="ev-type">
            Source type
          </label>
          <select
            id="ev-type"
            className="select"
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value as EvidenceType)}
            disabled={Boolean(disabledReason) || busy}
          >
            {constants.evidence_types.map((t) => (
              <option key={t} value={t}>
                {EVIDENCE_TYPE_LABEL[t] ?? t}
              </option>
            ))}
          </select>
          <p className="field__hint">
            Declared type. The review judges the content, not this label.
          </p>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="ev-date">
            Published date
          </label>
          <input
            id="ev-date"
            className="input"
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            disabled={Boolean(disabledReason) || busy}
          />
          <p className="field__hint">
            As claimed by the source. Outside the evaluation period means the item is not counted.
          </p>
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="ev-note">
          Your note (not used by the review)
        </label>
        <textarea
          id="ev-note"
          className="textarea"
          maxLength={300}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Why you think this source is relevant."
          disabled={Boolean(disabledReason) || busy}
          aria-describedby="ev-note-hint"
        />
        <p className="field__hint" id="ev-note-hint">
          Kept on the record for readers. The review never reads it, and a submitter's framing
          never changes a verdict.
        </p>
      </div>

      <p className="hint">
        {remainingTotal} of {constants.max_evidence} sources left on this commitment ·{" "}
        {remainingMine} of {constants.max_evidence_per_submitter} left for you.
      </p>

      {fault && (
        <div className="fault" style={{ margin: "var(--space-3) 0" }}>
          <p className="fault__message">{fault.message}</p>
          <details className="disclosure">
            <summary>Details</summary>
            <p className="fault__detail">{fault.detail}</p>
          </details>
        </div>
      )}

      <div style={{ marginTop: "var(--space-3)" }}>
        <ActionButton
          type="submit"
          disabledReason={disabledReason}
          busy={busy}
          variant="primary"
        >
          Add evidence
        </ActionButton>
      </div>
    </form>
  );
}

export { EVIDENCE_TYPES };
export default EvidenceSubmitForm;