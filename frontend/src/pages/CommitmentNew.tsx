/**
 * Register a commitment (UI-CivicLens 4.2).
 *
 * Fields mirror the deployed schema. Client validation mirrors the contract's,
 * but the contract is authoritative and will re-check every bound.
 *
 * The plain-language summary updates live and the registrant confirms it before
 * anything is sent, because a misread criterion is the expensive mistake here.
 */

import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCommitmentBundle, useConstants } from "@/hooks/useReads";
import { useTxLifecycle } from "@/hooks/useTxLifecycle";
import { rememberTxForCommitment } from "@/hooks/useFinality";
import { requireWrites, writes } from "@/services";
import { useWallet } from "@/genlayer/WalletProvider";
import { ROLE_LABEL } from "@/domain/copy";
import { canSupersede } from "@/domain/actions";
import { lintCriterion } from "@/domain/criteriaLint";
import { formatDate, formatMilli, parseToMilli } from "@/domain/format";
import type {
  ContractConstants,
  CriterionDraft,
  Operator,
  RegistrantRole,
} from "@/domain/types";
import { TxStatus } from "@/components/TxStatus";
import { ActionButton } from "@/components/DisabledReason";
import { Banner, ErrorView, LoadingRegion, SampleBanner } from "@/components/Chrome";
import { reads } from "@/services";

interface DraftCriterion {
  key: string;
  text: string;
  measure: string;
  required: boolean;
  hasThreshold: boolean;
  threshold: string;
  operator: Operator;
  unit: string;
  deadline: string;
}

function emptyCriterion(key: string): DraftCriterion {
  return {
    key,
    text: "",
    measure: "",
    required: true,
    hasThreshold: false,
    threshold: "",
    operator: "gte",
    unit: "",
    deadline: "",
  };
}

const URL_RE = /^https?:\/\/\S+$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lint hints for one draft criterion. Reading aids only: they flag wording a
 * review tends to come back inconclusive on, and never block submission.
 */
function CriterionHints({ criterion }: { criterion: DraftCriterion }) {
  const hints = lintCriterion({
    text: criterion.text,
    measure: criterion.measure,
    hasThreshold: criterion.hasThreshold,
    threshold: criterion.threshold,
    unit: criterion.unit,
  });
  if (hints.length === 0) return null;
  return (
    <div className="lint">
      <p className="lint__lead">Hints, not verdicts — wording that tends to come back inconclusive:</p>
      <ul className="lint__list">
        {hints.map((h) => (
          <li key={h.id}>{h.text}</li>
        ))}
      </ul>
    </div>
  );
}

export function CommitmentNew() {
  const navigate = useNavigate();
  const params = useParams();
  const wallet = useWallet();
  const constantsQuery = useConstants();
  const liveConstants = constantsQuery.data;
  const tx = useTxLifecycle();

  // Two routes share this form: /commitments/new (register) and
  // /commitments/:id/supersede (create a linked new version — the only legal
  // way to change a criterion, contracts/civic_lens.py supersede_commitment).
  const supersedeId = Number(params.id) > 0 ? Number(params.id) : null;
  const isSupersede = supersedeId !== null;
  const oldQuery = useCommitmentBundle(supersedeId);
  const oldCommitment = isSupersede ? oldQuery.data?.commitment : undefined;

  const [subject, setSubject] = useState("");
  const [subjectKind, setSubjectKind] = useState("organization");
  const [registrantRole, setRegistrantRole] = useState("observer");
  const [statementRef, setStatementRef] = useState("");
  const [commitmentText, setCommitmentText] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [guidance, setGuidance] = useState("");
  const [criteria, setCriteria] = useState<DraftCriterion[]>([emptyCriterion("c1")]);
  const [confirmed, setConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** One-time prefill guard: a refetch must never stomp the registrant's edits. */
  const [prefilledFor, setPrefilledFor] = useState<number | null>(null);

  // Supersede mode: start from the record being versioned so the registrant
  // edits instead of retyping. Nothing is copied that the contract would not
  // itself echo — this is a display convenience, not authority.
  useEffect(() => {
    if (!oldCommitment || prefilledFor === oldCommitment.id) return;
    setSubject(oldCommitment.subject);
    setSubjectKind(oldCommitment.subject_kind);
    setRegistrantRole(oldCommitment.registrant_role);
    setStatementRef(oldCommitment.source_statement_ref);
    setCommitmentText(oldCommitment.commitment_text);
    setPeriodStart(oldCommitment.period_start);
    setPeriodEnd(oldCommitment.period_end);
    setTimezone(oldCommitment.timezone);
    setGuidance(oldCommitment.source_guidance);
    setCriteria(
      oldCommitment.criteria.map((c) => ({
        key: `c${c.id}`,
        text: c.text,
        measure: c.measure,
        required: c.required,
        hasThreshold: c.has_threshold,
        threshold: c.has_threshold ? formatMilli(c.threshold_milli) : "",
        operator: (c.operator || "gte") as Operator,
        unit: c.unit,
        deadline: c.deadline,
      })),
    );
    setPrefilledFor(oldCommitment.id);
  }, [oldCommitment, prefilledFor]);

  const required = criteria.filter((c) => c.required);

  const summary = useMemo(() => {
    if (!periodStart || !periodEnd) {
      return "Add an evaluation period to see the plain-language summary.";
    }
    return (
      `CivicLens will check whether published evidence between ${formatDate(periodStart)} and ` +
      `${formatDate(periodEnd)} supports each of these ${criteria.length} criteria` +
      `${criteria.length === 1 ? "" : ""}. ` +
      `Required: ${required.map((_, i) => `criterion ${i + 1}`).join(", ") || "none yet"}.`
    );
  }, [periodStart, periodEnd, criteria.length, required.length]);

  function update(key: string, patch: Partial<DraftCriterion>) {
    setCriteria((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (subject.trim().length < 3) e.subject = "The subject name needs at least 3 characters.";
    if (subjectKind === "individual")
      e.subjectKind = "CivicLens does not accept private individuals as subjects.";
    if (!URL_RE.test(statementRef.trim()))
      e.statementRef = "A link to where the commitment was made is required.";
    if (commitmentText.trim().length < 10)
      e.commitmentText = "Quote the commitment in at least 10 characters.";
    if (!DATE_RE.test(periodStart) || !DATE_RE.test(periodEnd))
      e.period = "Both dates must be YYYY-MM-DD.";
    else if (periodStart > periodEnd) e.period = "The start date is after the end date.";
    if (!timezone.trim()) e.timezone = "Name the timezone the dates are calendar days in.";

    if (criteria.length > constants.max_criteria)
      e.criteria = `The contract accepts at most ${constants.max_criteria} criteria.`;
    if (criteria.some((c) => c.text.trim().length < 5))
      e.criteria = "Every criterion needs wording of at least 5 characters.";
    if (criteria.some((c) => c.measure.trim().length < 5))
      e.criteria = "Every criterion needs a way it would be measured.";
    if (!criteria.some((c) => c.required))
      e.criteria = "At least one criterion must be required.";
    if (criteria.some((c) => c.hasThreshold && !c.unit.trim()))
      e.criteria = "A threshold needs a unit.";
    if (
      criteria.some(
        (c) =>
          c.hasThreshold &&
          c.deadline &&
          (c.deadline < periodStart || c.deadline > periodEnd),
      )
    )
      e.criteria = "Every deadline must fall inside the evaluation period.";
    return e;
  }

  const canWrite = Boolean(writes) && Boolean(wallet.address) && wallet.isOnCorrectNetwork;

  const roleHint = ROLE_LABEL[registrantRole as RegistrantRole] ?? "as an observer";

  // Supersede is registrant-only and rejects superseded/withdrawn records —
  // the same rules the contract enforces, surfaced early as a sentence.
  const supersedeAvail =
    isSupersede && oldCommitment
      ? canSupersede({
          commitment: oldCommitment,
          writesAvailable: Boolean(writes),
          isRegistrant:
            Boolean(wallet.address) &&
            oldCommitment.registrant.toLowerCase() === wallet.address!.toLowerCase(),
        })
      : null;

  const disabledReason = !writes
    ? "No contract address is configured in this build, so nothing can be registered. Registering runs a real transaction."
    : !wallet.address
      ? "Connect an account to register a commitment. Reading works without one."
      : !wallet.isOnCorrectNetwork
        ? "This wallet is on the wrong network. Switch networks from the header before registering."
        : supersedeAvail && !supersedeAvail.enabled
          ? supersedeAvail.reason ?? "This commitment cannot be versioned."
          : !confirmed
            ? "Confirm the plain-language summary before registering."
            : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const w = requireWrites();

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload: CriterionDraft[] = criteria.map((c) => ({
      text: c.text.trim(),
      measure: c.measure.trim(),
      required: c.required,
      has_threshold: c.hasThreshold,
      threshold_milli: c.hasThreshold ? (parseToMilli(c.threshold) ?? 0) : 0,
      operator: c.hasThreshold ? c.operator : "gte",
      unit: c.hasThreshold ? c.unit.trim().toLowerCase() : "",
      deadline: c.deadline,
    }));

    const fields = {
      subject: subject.trim(),
      subjectKind,
      registrantRole,
      sourceStatementRef: statementRef.trim(),
      commitmentText: commitmentText.trim(),
      periodStart,
      periodEnd,
      timezone: timezone.trim(),
      sourceGuidance: guidance.trim(),
      dataMode: "live",
      criteriaJson: JSON.stringify(payload),
    };

    // supersede_commitment takes the same fields plus the record it versions;
    // the contract validates everything again and links the two versions.
    await tx.start(isSupersede ? "Create new version" : "Register commitment", () =>
      isSupersede && supersedeId !== null
        ? w.supersedeCommitment({ oldId: supersedeId, ...fields })
        : w.createCommitment(fields),
    );

    const phase = await tx.waitForAcceptance();
    if ((phase === "accepted" || phase === "final") && tx.hash) {
      rememberTxForCommitment(isSupersede && supersedeId !== null ? supersedeId : 0, tx.hash);
      // The new id is not knowable client-side (the write returns a hash), so
      // return to the record being versioned — its superseded_by link points
      // at the new version once the chain catches up.
      navigate(isSupersede && supersedeId !== null ? `/commitments/${supersedeId}` : "/commitments");
    }
  }

  // The form mirrors the contract's own limits and enums. Without them (bad
  // address, unreachable RPC, first load) a partial fallback would promise
  // bounds the contract may not share — and a missing enum key would crash the
  // page exactly when the reader most needs an explanation. Say what happened
  // and offer a retry instead (UI-CivicLens 7.3).
  if (!liveConstants) {
    return (
      <div className="stack-lg">
        <div>
          <h1>{isSupersede ? `Create a new version of commitment #${supersedeId}` : "Register a commitment"}</h1>
          <p className="hint">
            The contract's own limits are read before the form is shown, so what you enter
            matches what it will accept.
          </p>
        </div>
        {constantsQuery.isLoading ? (
          <LoadingRegion label="Reading the contract's limits" />
        ) : (
          <ErrorView
            error={constantsQuery.error}
            title="The contract's limits could not be read."
            onRetry={() => void constantsQuery.refetch()}
          />
        )}
      </div>
    );
  }
  const constants: ContractConstants = liveConstants;

  // Supersede mode needs the record it versions before the form can be
  // prefilled; without it the page would open blank and lie about what it
  // supersedes.
  if (isSupersede && !oldCommitment) {
    if (oldQuery.isLoading) {
      return <LoadingRegion label="Loading the record this version replaces" />;
    }
    return (
      <ErrorView
        error={oldQuery.error ?? new Error("That commitment could not be read.")}
        title="The commitment being replaced could not be read."
        onRetry={() => void oldQuery.refetch()}
      />
    );
  }

  return (
    <div className="stack-lg">
      <div>
        <h1>
          {isSupersede ? `Create a new version of commitment #${supersedeId}` : "Register a commitment"}
        </h1>
        <p className="hint">
          {isSupersede
            ? "The form starts from the record you are versioning, so you edit instead of retype. The contract re-checks every field and that you are the registrant."
            : "Record a public commitment with criteria specific enough that a reviewer cannot misread them. Registration writes to the contract; the criteria are locked once a review starts."}
        </p>
      </div>

      {reads.isSample && reads.sampleReason && <SampleBanner reason={reads.sampleReason} />}

      {isSupersede ? (
        <Banner title="This creates a new version, not an edit">
          <p>
            Commitment #{supersedeId} will be marked superseded and will link here. Its record,
            evidence, and outcomes stay readable — history is never rewritten.
          </p>
        </Banner>
      ) : (
        <Banner title="Criteria are locked once review starts">
          <p>
            After a review, a criterion cannot be edited. A changed criterion means a{" "}
            <strong>new version</strong> of the commitment, linked to the old one — so the history of
            what was asked, and when, stays intact.
          </p>
        </Banner>
      )}

      <form onSubmit={submit} noValidate>
        <div className="stack">
          <section className="panel" aria-labelledby="what-heading">
            <div className="panel__head">
              <h2 id="what-heading">What was committed</h2>
            </div>
            <div className="panel__body">
              <div className="field">
                <label className="field__label" htmlFor="subject">
                  Subject <span className="field__req">required</span>
                </label>
                <input
                  id="subject"
                  className="input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-describedby="subject-hint"
                  disabled={tx.isBusy}
                />
                <p className="field__hint" id="subject-hint">
                  A public organization or institution. CivicLens does not accept private
                  individuals as subjects — the contract rejects them.
                </p>
                {errors.subject && <p className="field__error">{errors.subject}</p>}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="field__label" htmlFor="subject-kind">
                    Subject kind
                  </label>
                  <select
                    id="subject-kind"
                    className="select"
                    value={subjectKind}
                    onChange={(e) => setSubjectKind(e.target.value)}
                    disabled={tx.isBusy}
                  >
                    {constants.subject_kinds
                      .filter((k) => k !== "individual")
                      .map((k) => (
                        <option key={k} value={k}>
                          {k === "organization" ? "Organization" : "Public institution"}
                        </option>
                      ))}
                  </select>
                  <p className="field__hint">
                    Private individuals are excluded by design, not by configuration.
                  </p>
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="role">
                    Who is registering this?
                  </label>
                  <select
                    id="role"
                    className="select"
                    value={registrantRole}
                    onChange={(e) => setRegistrantRole(e.target.value)}
                    disabled={tx.isBusy}
                  >
                    <option value="observer">I'm an observer</option>
                    <option value="organization">I'm registering for my own organization</option>
                  </select>
                  <p className="field__hint">
                    This is what readers will see: registered {roleHint}. Neither
                    role means the subject has verified the entry.
                  </p>
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="statement">
                  Link to the source statement <span className="field__req">required</span>
                </label>
                <input
                  id="statement"
                  className="input"
                  type="url"
                  placeholder="https://example.org/announcement"
                  value={statementRef}
                  onChange={(e) => setStatementRef(e.target.value)}
                  disabled={tx.isBusy}
                />
                <p className="field__hint">
                  Where the commitment was actually made. A commitment without a source is not a
                  public statement.
                </p>
                {errors.statementRef && <p className="field__error">{errors.statementRef}</p>}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="commitment-text">
                  The commitment, as stated <span className="field__req">required</span>
                </label>
                <textarea
                  id="commitment-text"
                  className="textarea"
                  value={commitmentText}
                  onChange={(e) => setCommitmentText(e.target.value)}
                  placeholder="Quote it as published. Do not paraphrase."
                  disabled={tx.isBusy}
                  style={{ fontFamily: "var(--font-document)", fontSize: "var(--t-18)" }}
                />
                {errors.commitmentText && <p className="field__error">{errors.commitmentText}</p>}
              </div>
            </div>
          </section>

          {/* -------- criteria -------- */}
          <section className="panel" aria-labelledby="criteria-heading">
            <div className="panel__head">
              <h2 id="criteria-heading">Criteria</h2>
              <span className="hint" style={{ margin: 0 }}>
                {criteria.length} of {constants.max_criteria}
              </span>
            </div>
            <div className="panel__body">
              <p className="hint" style={{ marginBottom: "var(--space-4)" }}>
                Each criterion is judged separately against the evidence. Required criteria decide
                the overall outcome; optional ones are recorded and shown but do not.
              </p>

              {criteria.map((c, index) => (
                <div className="criterion-card" key={c.key}>
                  <div className="criterion-card__head">
                    <strong>Criterion {index + 1}</strong>
                    {criteria.length > 1 && (
                      <button
                        type="button"
                        className="btn btn--quiet btn--small"
                        onClick={() =>
                          setCriteria((prev) => prev.filter((x) => x.key !== c.key))
                        }
                        disabled={tx.isBusy}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor={`${c.key}-text`}>
                      Wording
                    </label>
                    <textarea
                      id={`${c.key}-text`}
                      className="textarea"
                      style={{ minHeight: "4rem" }}
                      value={c.text}
                      onChange={(e) => update(c.key, { text: e.target.value })}
                      placeholder="What exactly was promised, in the organization's own words?"
                      disabled={tx.isBusy}
                    />
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor={`${c.key}-measure`}>
                      How it would be measured
                    </label>
                    <textarea
                      id={`${c.key}-measure`}
                      className="textarea"
                      style={{ minHeight: "4rem" }}
                      value={c.measure}
                      onChange={(e) => update(c.key, { measure: e.target.value })}
                      placeholder="What observable evidence would show this was met?"
                      disabled={tx.isBusy}
                    />
                  </div>

                  <div className="radio-row" style={{ marginBottom: "var(--space-3)" }}>
                    <label>
                      <input
                        type="radio"
                        name={`${c.key}-req`}
                        checked={c.required}
                        onChange={() => update(c.key, { required: true })}
                        disabled={tx.isBusy}
                      />
                      Required
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${c.key}-req`}
                        checked={!c.required}
                        onChange={() => update(c.key, { required: false })}
                        disabled={tx.isBusy}
                      />
                      Optional
                    </label>
                  </div>

                  <div className="radio-row" style={{ marginBottom: "var(--space-3)" }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={c.hasThreshold}
                        onChange={(e) => update(c.key, { hasThreshold: e.target.checked })}
                        disabled={tx.isBusy}
                      />
                      This criterion has a numeric threshold
                    </label>
                  </div>

                  {c.hasThreshold && (
                    <div className="grid-2">
                      <div className="field">
                        <label className="field__label" htmlFor={`${c.key}-op`}>
                          Condition
                        </label>
                        <select
                          id={`${c.key}-op`}
                          className="select"
                          value={c.operator}
                          onChange={(e) => update(c.key, { operator: e.target.value as Operator })}
                          disabled={tx.isBusy}
                        >
                          <option value="gte">at least</option>
                          <option value="lte">at most</option>
                        </select>
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor={`${c.key}-thr`}>
                          Threshold
                        </label>
                        <input
                          id={`${c.key}-thr`}
                          className="input"
                          inputMode="decimal"
                          value={c.threshold}
                          onChange={(e) => update(c.key, { threshold: e.target.value })}
                          disabled={tx.isBusy}
                        />
                      </div>
                      <div className="field">
                        <label className="field__label" htmlFor={`${c.key}-unit`}>
                          Unit <span className="field__req">required</span>
                        </label>
                        <input
                          id={`${c.key}-unit`}
                          className="input"
                          placeholder="co2e_tonnes"
                          value={c.unit}
                          onChange={(e) => update(c.key, { unit: e.target.value })}
                          disabled={tx.isBusy}
                        />
                        <p className="field__hint">
                          A figure reported in a different unit reads as inconclusive, not as a
                          pass or a miss.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="field" style={{ marginBottom: 0 }}>
                    <label className="field__label" htmlFor={`${c.key}-deadline`}>
                      Evidence deadline (optional)
                    </label>
                    <input
                      id={`${c.key}-deadline`}
                      className="input"
                      type="date"
                      value={c.deadline}
                      onChange={(e) => update(c.key, { deadline: e.target.value })}
                      disabled={tx.isBusy}
                    />
                    <p className="field__hint">
                      Evidence published after this date is not counted for this criterion.
                    </p>
                  </div>

                  <CriterionHints criterion={c} />
                </div>
              ))}

              {criteria.length < constants.max_criteria && (
                <div className="actions" style={{ marginTop: "var(--space-4)" }}>
                  <button
                    type="button"
                    className="btn btn--quiet btn--small"
                    onClick={() =>
                      setCriteria((prev) => [
                        ...prev,
                        emptyCriterion(`c${prev.length + 1}-${Date.now()}`),
                      ])
                    }
                    disabled={tx.isBusy}
                  >
                    Add a criterion
                  </button>
                  <span className="hint" style={{ margin: 0 }}>
                    {constants.max_criteria - criteria.length} left before the contract limit.
                  </span>
                </div>
              )}

              {errors.criteria && <p className="field__error">{errors.criteria}</p>}
            </div>
          </section>

          {/* -------- period and sources -------- */}
          <section className="panel" aria-labelledby="period-heading">
            <div className="panel__head">
              <h2 id="period-heading">Period and sources</h2>
            </div>
            <div className="panel__body">
              <div className="grid-2">
                <div className="field">
                  <label className="field__label" htmlFor="period-start">
                    Evaluation starts
                  </label>
                  <input
                    id="period-start"
                    className="input"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    disabled={tx.isBusy}
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="period-end">
                    Evaluation ends
                  </label>
                  <input
                    id="period-end"
                    className="input"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    disabled={tx.isBusy}
                  />
                </div>
              </div>
              {errors.period && <p className="field__error">{errors.period}</p>}

              <div className="field">
                <label className="field__label" htmlFor="tz">
                  Timezone for those calendar dates
                </label>
                <input
                  id="tz"
                  className="input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="UTC"
                  disabled={tx.isBusy}
                />
                <p className="field__hint">
                  Dates are calendar days in this timezone, not UTC instants. Shown on every page so
                  nobody has to guess.
                </p>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="guidance">
                  What counts as authoritative evidence here
                </label>
                <textarea
                  id="guidance"
                  className="textarea"
                  value={guidance}
                  onChange={(e) => setGuidance(e.target.value)}
                  placeholder="e.g. Audited statements and official statistics agencies count. The organization's own press releases do not."
                  disabled={tx.isBusy}
                />
                <p className="field__hint">
                  Stated up front, this is guidance the review is told about — not a rule it can
                  enforce.
                </p>
              </div>
            </div>
          </section>

          {/* -------- confirmation -------- */}
          <section className="panel" aria-labelledby="confirm-heading">
            <div className="panel__head">
              <h2 id="confirm-heading">Confirm</h2>
            </div>
            <div className="panel__body stack">
              <div className="summary-box">
                <span className="summary-box__key">In plain words</span>
                {summary}
              </div>

              <label className="radio-row">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  disabled={tx.isBusy}
                />
                <span>
                  That summary describes what I want reviewed.{" "}
                  {!canWrite && (
                    <span className="hint" style={{ display: "inline" }}>
                      (You will still need a connected account on the right network to send it.)
                    </span>
                  )}
                </span>
              </label>

              <ActionButton type="submit" disabledReason={disabledReason} busy={tx.isBusy}>
                {isSupersede ? "Create new version" : "Register commitment"}
              </ActionButton>

              <p className="hint">
                {isSupersede
                  ? "This writes a transaction that marks the old version superseded and links the two. The old record stays readable either way."
                  : "Registering writes a transaction. You can withdraw the commitment later while its evidence window is still open; the record is kept either way."}
              </p>
            </div>
          </section>
        </div>
      </form>

      {tx.phase !== "idle" && (
        <TxStatus
          phase={tx.phase}
          hash={tx.hash}
          votes={tx.votes}
          error={tx.error}
          onRefresh={() => void tx.refresh()}
          detail={
            tx.phase === "accepted"
              ? "Validators agreed. The commitment is now on the record, and the result can still be appealed."
              : undefined
          }
        />
      )}

      <p className="hint">
        Changed your mind? <Link to="/commitments">Back to all commitments</Link>.
      </p>
    </div>
  );
}

export default CommitmentNew;