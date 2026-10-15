/**
 * Formatting helpers for CivicLens domain values.
 *
 * Fixed-point rule: the contract stores thresholds and figures in
 * milli-units (integers). Display divides by 1000 here — never in the
 * contract, never with floats on chain.
 */

import type { Criterion, Operator } from "./types";

/** 100000 -> "100", 95000 -> "95", 100500 -> "100.5" (trailing zeros trimmed). */
export function formatMilli(milli: number | string | bigint): string {
  const n = typeof milli === "bigint" ? Number(milli) : Number(milli);
  if (!Number.isFinite(n)) return String(milli);
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(n));
  const whole = Math.floor(abs / 1000);
  const frac = abs % 1000;
  if (frac === 0) return `${sign}${whole}`;
  const fracStr = String(frac).padStart(3, "0").replace(/0+$/, "");
  return `${sign}${whole}.${fracStr}`;
}

/** Parse a decimal user input into milli-units. Returns null when invalid. */
export function parseToMilli(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, frac = ""] = trimmed.split(".");
  const fracPadded = (frac + "000").slice(0, 3);
  const milli = Number(whole) * 1000 + Number(fracPadded);
  return Number.isSafeInteger(milli) ? milli : null;
}

export const OPERATOR_SYMBOL: Record<Operator, string> = {
  gte: "≥",
  lte: "≤",
};

/** "co2e_tonnes" -> "co2e tonnes" (display only; the contract keeps the raw unit). */
export function displayUnit(unit: string): string {
  return unit.replace(/_/g, " ");
}

/** Shorten a URL for display: host + first path segment. Full URL stays in href. */
export function shortenUrl(url: string, max = 48): string {
  try {
    const u = new URL(url);
    const path = u.pathname === "/" ? "" : u.pathname;
    const s = `${u.host}${path}`;
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  } catch {
    return url.length > max ? `${url.slice(0, max - 1)}…` : url;
  }
}

/** 0x1234…abcd */
export function shortenAddress(address: string, chars = 6): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** "2024-06-01" -> "1 Jun 2024" for prose; ISO kept for tables. */
export function formatDate(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d} ${months[m - 1]} ${y}`;
}

/** Evaluation window as one line: "1 Jan 2024 – 31 Dec 2024 (UTC)". */
export function formatPeriod(start: string, end: string, timezone: string): string {
  return `${formatDate(start)} – ${formatDate(end)} (${timezone})`;
}

/** A criterion's threshold as plain text: "≥ 100 co2e tonnes". */
export function thresholdPhrase(c: Criterion): string {
  if (!c.has_threshold) return "";
  // operator is "" on the wire when there is no threshold; fall back safely.
  const sym = c.operator ? (OPERATOR_SYMBOL[c.operator] ?? "") : "";
  return `${sym} ${formatMilli(c.threshold_milli)} ${displayUnit(c.unit)}`.trim();
}
