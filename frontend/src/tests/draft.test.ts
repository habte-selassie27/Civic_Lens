/**
 * The saved-draft store (domain/draft).
 *
 * The form's draft is the most expensive thing a reader can lose in this app,
 * so the store is strict on the way back in: anything corrupted, truncated or
 * stale is dropped rather than half-applied to a form that would then submit
 * something the registrant never typed.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearDraft,
  draftKeyFor,
  hasDraftContent,
  loadDraft,
  saveDraft,
  type CommitmentDraftSnapshot,
} from "@/domain/draft";

const FULL: CommitmentDraftSnapshot = {
  subject: "Riverdale Transit Authority",
  subjectKind: "institution",
  registrantRole: "observer",
  statementRef: "https://example.org/pledge",
  commitmentText: "We will publish an annual emissions report.",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31",
  timezone: "UTC",
  guidance: "Audited reports count.",
  criteria: [
    {
      key: "c1",
      text: "Publish an annual report",
      measure: "A published report covering the period",
      required: true,
      hasThreshold: false,
      threshold: "",
      operator: "gte",
      unit: "",
      deadline: "",
    },
  ],
};

const KEY = draftKeyFor(null);

describe("draft store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips every field the form holds", () => {
    saveDraft(KEY, FULL);
    expect(loadDraft(KEY)).toEqual(FULL);
  });

  it("keeps register and supersede drafts apart, per record", () => {
    saveDraft(draftKeyFor(null), { ...FULL, subject: "Register draft" });
    saveDraft(draftKeyFor(4), { ...FULL, subject: "Supersede 4 draft" });
    saveDraft(draftKeyFor(9), { ...FULL, subject: "Supersede 9 draft" });

    // Two pieces of work in progress are two drafts; the register form must
    // never inherit one written for a different record.
    expect(loadDraft(draftKeyFor(null))?.subject).toBe("Register draft");
    expect(loadDraft(draftKeyFor(4))?.subject).toBe("Supersede 4 draft");
    expect(loadDraft(draftKeyFor(9))?.subject).toBe("Supersede 9 draft");
  });

  it("clears only the key it is given", () => {
    saveDraft(KEY, FULL);
    saveDraft(draftKeyFor(4), { ...FULL, subject: "keep me" });

    clearDraft(KEY);

    expect(loadDraft(KEY)).toBeNull();
    expect(loadDraft(draftKeyFor(4))?.subject).toBe("keep me");
  });

  it("does not store the confirmation checkbox", () => {
    saveDraft(KEY, FULL);

    // An attestation carried over from a previous visit is not one the reader
    // just made, so the snapshot has no field for it at all.
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    expect(stored).not.toHaveProperty("confirmed");
  });

  it("drops a stale draft instead of applying it to a form months later", () => {
    saveDraft(KEY, FULL);
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    stored.savedAt = Date.now() - 15 * 24 * 60 * 60 * 1000;
    localStorage.setItem(KEY, JSON.stringify(stored));

    expect(loadDraft(KEY)).toBeNull();
    // And it is gone for good, not left to resurface on the next render.
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it("refuses a truncated draft rather than half-filling the form", () => {
    const stored = JSON.parse(
      JSON.stringify({ ...FULL, version: 1, savedAt: Date.now(), criteria: [{ key: "c1" }] }),
    );
    localStorage.setItem(KEY, JSON.stringify(stored));

    expect(loadDraft(KEY)).toBeNull();
  });

  it("refuses a draft whose types drifted", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...FULL, version: 1, savedAt: Date.now(), subject: 42 }),
    );
    expect(loadDraft(KEY)).toBeNull();
  });

  it("refuses a draft from a future shape version", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...FULL, version: 99, savedAt: Date.now() }),
    );
    expect(loadDraft(KEY)).toBeNull();
  });

  it("survives unparseable json without throwing", () => {
    localStorage.setItem(KEY, "{not json");
    expect(loadDraft(KEY)).toBeNull();
  });

  it("survives a storage that refuses to write", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    // A full or blocked store must never break the form being typed in.
    expect(() => saveDraft(KEY, FULL)).not.toThrow();

    setItem.mockRestore();
  });

  it("knows an untouched draft from one worth restoring", () => {
    expect(
      hasDraftContent({
        ...FULL,
        subject: "",
        statementRef: "",
        commitmentText: "",
        periodStart: "",
        periodEnd: "",
        guidance: "",
        criteria: [
          { ...FULL.criteria[0], text: "", measure: "", threshold: "" },
        ],
      }),
    ).toBe(false);

    expect(hasDraftContent(FULL)).toBe(true);
  });
});
