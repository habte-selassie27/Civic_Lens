/**
 * windowState: where today sits relative to the evaluation period.
 *
 * UTC calendar-day comparisons mirror the contract's own date_semantics
 * (ISO dates, compared date-only; the timezone does not shift the window).
 */

import { describe, expect, it } from "vitest";
import { dayCount, utcDay, windowState } from "@/domain/window";

const now = new Date("2026-06-15T12:34:00Z");

describe("utcDay", () => {
  it("accepts real calendar dates", () => {
    expect(utcDay("2026-06-15")).toBe(Date.UTC(2026, 5, 15));
  });

  it("rejects malformed and impossible dates", () => {
    for (const bad of ["", "2026-6-15", "15-06-2026", "2026-02-30", "2026-13-01"]) {
      expect(utcDay(bad), bad).toBeNull();
    }
  });
});

describe("windowState", () => {
  it("before: counts days until the start", () => {
    const state = windowState("2026-06-20", "2026-07-01", now)!;
    expect(state.phase).toBe("before");
    expect(state.daysUntilStart).toBe(5);
    expect(state.daysLeft).toBeNull();
    expect(state.daysSinceEnd).toBeNull();
  });

  it("during: counts days left, with the last day included as 0", () => {
    const mid = windowState("2026-06-01", "2026-06-30", now)!;
    expect(mid.phase).toBe("during");
    expect(mid.daysLeft).toBe(15);

    const lastDay = windowState("2026-06-01", "2026-06-15", now)!;
    expect(lastDay.phase).toBe("during");
    expect(lastDay.daysLeft).toBe(0);
  });

  it("during: the first day is already within the period", () => {
    const state = windowState("2026-06-15", "2026-06-30", now)!;
    expect(state.phase).toBe("during");
    expect(state.daysLeft).toBe(15);
  });

  it("after: counts days since the end", () => {
    const state = windowState("2026-05-01", "2026-06-10", now)!;
    expect(state.phase).toBe("after");
    expect(state.daysSinceEnd).toBe(5);
    expect(state.daysLeft).toBeNull();
  });

  it("returns null for a broken or inverted period", () => {
    const pairs: Array<[string, string]> = [
      ["", "2026-01-01"],
      ["2026-01-01", "bad"],
      ["2026-06-01", "2026-05-01"],
      ["2026-02-30", "2026-03-01"],
    ];
    for (const [start, end] of pairs) {
      expect(windowState(start, end, now), `${start}..${end}`).toBeNull();
    }
  });

  it("dayCount reads naturally", () => {
    expect(dayCount(1)).toBe("1 day");
    expect(dayCount(5)).toBe("5 days");
  });
});
