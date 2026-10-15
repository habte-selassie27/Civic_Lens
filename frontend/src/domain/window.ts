/**
 * Where "today" sits relative to a commitment's evaluation period.
 *
 * Contract semantics (get_constants().date_semantics): the period is ISO
 * calendar dates, compared date-only; the recorded timezone is audit metadata
 * and does NOT shift the window. This module compares UTC calendar days for
 * display, matching that rule. It is a reading aid only — the contract decides
 * which evidence a review counts.
 */

export type WindowPhase = "before" | "during" | "after";

export interface WindowState {
  phase: WindowPhase;
  /** Whole days until the period starts ("before" only). */
  daysUntilStart: number | null;
  /** Whole days until the period ends; 0 means it ends today ("during" only). */
  daysLeft: number | null;
  /** Whole days since the period ended ("after" only). */
  daysSinceEnd: number | null;
}

const DAY_MS = 86_400_000;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A calendar date as a UTC-midnight epoch, or null when it is not a real date. */
export function utcDay(dateIso: string): number | null {
  const m = DATE_RE.exec(dateIso);
  if (!m) return null;
  const y = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const ms = Date.UTC(y, month - 1, day);
  const back = new Date(ms);
  if (
    back.getUTCFullYear() !== y ||
    back.getUTCMonth() !== month - 1 ||
    back.getUTCDate() !== day
  ) {
    // e.g. 2026-02-30 — Date.UTC would silently roll it over.
    return null;
  }
  return ms;
}

/**
 * Null when either date is malformed or the range is inverted; the caller
 * renders nothing rather than guessing at a broken period.
 */
export function windowState(
  periodStart: string,
  periodEnd: string,
  now: Date = new Date(),
): WindowState | null {
  const start = utcDay(periodStart);
  const end = utcDay(periodEnd);
  if (start === null || end === null || end < start) return null;

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  if (today < start) {
    return {
      phase: "before",
      daysUntilStart: Math.round((start - today) / DAY_MS),
      daysLeft: null,
      daysSinceEnd: null,
    };
  }
  if (today > end) {
    return {
      phase: "after",
      daysUntilStart: null,
      daysLeft: null,
      daysSinceEnd: Math.round((today - end) / DAY_MS),
    };
  }
  return {
    phase: "during",
    daysUntilStart: null,
    daysLeft: Math.round((end - today) / DAY_MS),
    daysSinceEnd: null,
  };
}

/** "1 day" / "3 days" — shared so the strip and its tests agree. */
export function dayCount(n: number): string {
  return `${n} day${n === 1 ? "" : "s"}`;
}
