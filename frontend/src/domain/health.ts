/**
 * Config-health inspection (the /status page).
 *
 * This module checks what a browser CAN check about a deployed CivicLens
 * contract: whether `get_constants` answers at all, and whether the shape of
 * what it returns matches what this frontend consumes. That is the failure
 * class that actually happened: an address pointing at an older build came
 * back missing fields the UI relies on, and every page that used them threw.
 *
 * Method-level schema drift (renamed methods) cannot be enumerated from a
 * client read, so it is NOT pretended here: the page says plainly that the
 * full check runs via the schema script / CLI instead.
 */

import { FALLBACK_CONSTANTS } from "@/config/contracts";
import type { ContractConstants } from "@/domain/types";

/** Keys every build returns; the UI consumes all of them. */
export const REQUIRED_CONSTANT_KEYS = [
  "max_criteria",
  "max_evidence",
  "max_evidence_per_submitter",
  "max_rounds",
  "max_challenges_per_party",
  "max_new_evidence_per_challenge",
  "max_page_size",
  "subject_kinds",
  "registrant_roles",
  "data_modes",
  "evidence_types",
  "operators",
  "review_statuses",
  "reason_codes",
  "commitment_statuses",
] as const;

/** Fields added by the hardened build; absence marks an older contract. */
export const HARDENED_CONSTANT_KEYS = [
  "retrieval_statuses",
  "max_quote_len",
  "date_semantics",
  "threshold_semantics",
  "data_mode_semantics",
  "outcome_meaning",
  "challenge_semantics",
  "figure_verification_semantics",
] as const;

export interface BoundDiff {
  key: string;
  app: number;
  deployed: number;
}

export interface ShapeReport {
  /** Required keys absent from the payload. */
  missingRequired: string[];
  /** Hardened-build keys absent from the payload. */
  missingHardened: string[];
  /** Enum members the UI needs that the payload does not carry. */
  enumProblems: string[];
  /** Numeric bounds where the deployed value differs from the app snapshot. */
  boundDiffs: BoundDiff[];
}

/** Enum members this frontend renders controls for. */
const REQUIRED_ENUM_MEMBERS: Array<[keyof ContractConstants, string]> = [
  ["subject_kinds", "organization"],
  ["subject_kinds", "institution"],
  ["data_modes", "live"],
  ["data_modes", "sample"],
  ["review_statuses", "supported"],
  ["review_statuses", "contradicted"],
  ["review_statuses", "inconclusive"],
  ["commitment_statuses", "evidence_open"],
  ["commitment_statuses", "outcome_accepted"],
  ["commitment_statuses", "superseded"],
  ["operators", "gte"],
];

function asArray(value: unknown): string[] | null {
  return Array.isArray(value) ? (value as string[]) : null;
}

export function inspectConstants(
  constants: Partial<ContractConstants> | null | undefined,
): ShapeReport {
  const payload = (constants ?? {}) as Record<string, unknown>;

  const missingRequired = REQUIRED_CONSTANT_KEYS.filter(
    (key) => payload[key] === undefined,
  ) as unknown as string[];
  const missingHardened = HARDENED_CONSTANT_KEYS.filter(
    (key) => payload[key] === undefined,
  ) as unknown as string[];

  const enumProblems: string[] = [];
  for (const [key, member] of REQUIRED_ENUM_MEMBERS) {
    const values = asArray(payload[key]);
    if (values && !values.includes(member)) {
      enumProblems.push(`${String(key)} does not include "${member}"`);
    }
  }

  const boundDiffs: BoundDiff[] = [];
  for (const [key, appValue] of Object.entries(FALLBACK_CONSTANTS)) {
    const deployed = payload[key];
    if (typeof deployed === "number" && deployed !== appValue) {
      boundDiffs.push({ key, app: appValue, deployed });
    }
  }

  return { missingRequired, missingHardened, enumProblems, boundDiffs };
}
