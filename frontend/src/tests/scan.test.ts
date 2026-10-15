/**
 * Bounded-concurrency scan helper (domain/scan).
 *
 * The activity and stats pages read one record per commitment over a bounded
 * window. These pin the two properties those pages rely on: result order is
 * stable, and one failing read never hides the rest of the window.
 */

import { describe, expect, it } from "vitest";
import { mapLimit } from "@/domain/scan";

describe("mapLimit", () => {
  it("keeps result order and captures per-item failures", async () => {
    const results = await mapLimit([1, 2, 3, 4], 2, async (n) => {
      if (n === 3) throw new Error("boom");
      return n * 10;
    });

    expect(results).toEqual([
      { status: "fulfilled", value: 10 },
      { status: "fulfilled", value: 20 },
      { status: "rejected", reason: expect.any(Error) },
      { status: "fulfilled", value: 40 },
    ]);
  });

  it("never runs more than `limit` calls at once", async () => {
    let active = 0;
    let peak = 0;

    await mapLimit(Array.from({ length: 9 }, (_, i) => i), 3, async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return 0;
    });

    expect(peak).toBe(3);
  });

  it("handles empty input and a limit larger than the list", async () => {
    expect(await mapLimit([], 4, async () => 1)).toEqual([]);
    expect(await mapLimit([7], 40, async (n) => n + 1)).toEqual([
      { status: "fulfilled", value: 8 },
    ]);
  });
});
