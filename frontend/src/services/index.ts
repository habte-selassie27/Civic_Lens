/**
 * Service selection — one place that decides sample vs live.
 *
 * Rule (UI-CivicLens section 0.8, section 8): sample data is always labeled,
 * and replay is never presented as a live run. The switch is driven only by
 * whether a contract address is configured — never by a query param, so the
 * label on a surface always matches where the data actually came from.
 */

import { CONFIGURED } from "@/config/contracts";
import { createLiveService } from "./live";
import { createSampleService } from "./sample";
import type { CivicLensReads, CivicLensWrites } from "./types";

function build(): { reads: CivicLensReads; writes: CivicLensWrites | null } {
  if (!CONFIGURED) {
    const sample = createSampleService();
    return { reads: sample, writes: null };
  }
  const live = createLiveService();
  return { reads: live, writes: live };
}

const built = build();

export const reads: CivicLensReads = built.reads;

/**
 * Writes exist only on live evidence. In sample mode this is null and every
 * write control renders disabled with a DisabledReason — the app never
 * pretends a transaction happened.
 */
export const writes: CivicLensWrites | null = built.writes;

export function hasLiveWrites(): boolean {
  return writes !== null;
}

/**
 * Narrow `writes` for call sites that already checked availability in the UI.
 * Throws rather than returning null so a missed guard fails loudly in
 * development instead of silently doing nothing.
 */
export function requireWrites(): CivicLensWrites {
  if (!writes) {
    throw new Error("No contract address is configured in this build, so writes are unavailable.");
  }
  return writes;
}

export { getScenario, SCENARIOS } from "@/domain/fixtures";
export type { Scenario } from "@/domain/fixtures";
export * from "./types";