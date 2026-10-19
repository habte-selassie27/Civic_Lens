/**
 * Commitment-form drafts kept in this browser.
 *
 * Registering is the expensive form in the app: up to five criteria, each with
 * its own wording, measure, threshold and deadline. Losing that to a stray
 * refresh — or to a write that fails and has to be retried — is the difference
 * between a registered commitment and none, so the draft survives both.
 *
 * Scope, deliberately narrow:
 * - One browser, one form. Nothing is uploaded, and no draft is ever presented
 *   as a record: the contract is the only record, and a draft is not evidence
 *   of anything.
 * - The confirmation checkbox is NOT stored. It reads "that summary describes
 *   what I want reviewed" — an attestation. One carried over from an earlier
 *   visit is not an attestation the reader just made.
 * - Everything read back is validated. A corrupted, truncated or stale draft is
 *   dropped rather than half-applied, because a form that silently submits
 *   something the registrant did not type is worse than an empty form.
 */

/** Bumped when the stored shape changes; older drafts are then discarded. */
const DRAFT_VERSION = 1;

/** A draft older than this is stale — the period it was written for has moved on. */
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

const KEY_PREFIX = "civiclens.draft.commitment";

/** Bound the stored array so a corrupted entry cannot expand the form without limit. */
const MAX_STORED_CRITERIA = 12;
const MAX_FIELD_LEN = 4000;

export interface DraftCriterionSnapshot {
  key: string;
  text: string;
  measure: string;
  required: boolean;
  hasThreshold: boolean;
  threshold: string;
  operator: string;
  unit: string;
  deadline: string;
}

export interface CommitmentDraftSnapshot {
  subject: string;
  subjectKind: string;
  registrantRole: string;
  statementRef: string;
  commitmentText: string;
  periodStart: string;
  periodEnd: string;
  timezone: string;
  guidance: string;
  criteria: DraftCriterionSnapshot[];
}

/**
 * Key per form. Supersede drafts are kept apart by the record being versioned:
 * two drafts for two different commitments are two different pieces of work,
 * and the register form must never inherit one from a supersede.
 */
export function draftKeyFor(supersedeId: number | null): string {
  return supersedeId === null ? KEY_PREFIX : `${KEY_PREFIX}.supersede.${supersedeId}`;
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    // Storage can be blocked outright (private mode, hardened settings).
    return null;
  }
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_FIELD_LEN;
}

function parseCriterion(raw: unknown): DraftCriterionSnapshot | null {
  if (typeof raw !== "object" || raw === null) return null;
  const c = raw as Record<string, unknown>;
  if (!isString(c.key) || !isString(c.text) || !isString(c.measure)) return null;
  if (typeof c.required !== "boolean" || typeof c.hasThreshold !== "boolean") return null;
  if (!isString(c.threshold) || !isString(c.operator)) return null;
  if (!isString(c.unit) || !isString(c.deadline)) return null;
  return {
    key: c.key,
    text: c.text,
    measure: c.measure,
    required: c.required,
    hasThreshold: c.hasThreshold,
    threshold: c.threshold,
    operator: c.operator,
    unit: c.unit,
    deadline: c.deadline,
  };
}

/**
 * Strict read. Returns null unless every field is the expected type: a draft is
 * a convenience, and a partial one would be written into the form as if the
 * registrant had typed it.
 */
function parse(raw: unknown): CommitmentDraftSnapshot | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Record<string, unknown>;

  if (d.version !== DRAFT_VERSION) return null;
  if (typeof d.savedAt !== "number" || !Number.isFinite(d.savedAt)) return null;
  if (Date.now() - d.savedAt > MAX_AGE_MS) return null;

  if (
    !isString(d.subject) ||
    !isString(d.subjectKind) ||
    !isString(d.registrantRole) ||
    !isString(d.statementRef) ||
    !isString(d.commitmentText) ||
    !isString(d.periodStart) ||
    !isString(d.periodEnd) ||
    !isString(d.timezone) ||
    !isString(d.guidance)
  ) {
    return null;
  }

  if (!Array.isArray(d.criteria) || d.criteria.length > MAX_STORED_CRITERIA) return null;
  const criteria: DraftCriterionSnapshot[] = [];
  for (const entry of d.criteria) {
    const parsed = parseCriterion(entry);
    if (!parsed) return null;
    criteria.push(parsed);
  }
  if (criteria.length === 0) return null;

  return {
    subject: d.subject,
    subjectKind: d.subjectKind,
    registrantRole: d.registrantRole,
    statementRef: d.statementRef,
    commitmentText: d.commitmentText,
    periodStart: d.periodStart,
    periodEnd: d.periodEnd,
    timezone: d.timezone,
    guidance: d.guidance,
    criteria,
  };
}

export function saveDraft(key: string, draft: CommitmentDraftSnapshot): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify({ ...draft, version: DRAFT_VERSION, savedAt: Date.now() }));
  } catch {
    // A full or blocked store must never break the form the reader is typing in.
  }
}

export function loadDraft(key: string): CommitmentDraftSnapshot | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const parsed = parse(JSON.parse(raw));
    // Drop anything unusable now, so a poisoned entry cannot resurface later.
    if (!parsed) store.removeItem(key);
    return parsed;
  } catch {
    store.removeItem(key);
    return null;
  }
}

export function clearDraft(key: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Nothing to do: the draft simply stays until it ages out.
  }
}

/** True when a draft holds something a reader would be sorry to lose. */
export function hasDraftContent(draft: CommitmentDraftSnapshot): boolean {
  const anyText =
    draft.subject.trim() !== "" ||
    draft.statementRef.trim() !== "" ||
    draft.commitmentText.trim() !== "" ||
    draft.guidance.trim() !== "" ||
    draft.periodStart !== "" ||
    draft.periodEnd !== "";
  const anyCriterion = draft.criteria.some(
    (c) => c.text.trim() !== "" || c.measure.trim() !== "" || c.threshold.trim() !== "",
  );
  return anyText || anyCriterion;
}
