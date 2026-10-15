/**
 * Embeddable outcome badge (commitment page → Share and embed).
 *
 * A self-contained SVG — no scripts, no remote assets — so it can be hosted
 * anywhere, including places that strip inline markup. `badgeEmbedSnippet`
 * wraps it in a link back to the record.
 *
 * Honesty by construction: the badge carries the same neutral label as the
 * page, sample records say so on the badge itself, and an accepted outcome
 * says it is not final. Every dynamic string is XML-escaped.
 *
 * Colors are kept in step with src/styles/tokens.css; an exported asset
 * cannot use CSS variables, so the hex values are spelled out once, here.
 */

import { shortenUrl } from "./format";

export interface BadgeInput {
  recordId: number;
  subject: string;
  /** Neutral outcome label, e.g. "Evidence supports" or "Review pending". */
  outcome: string;
  tone: "supported" | "contradicted" | "neutral";
  /** Short finality note, e.g. "accepted, not final"; "" when unknown. */
  finality: string;
  sample: boolean;
  /** Absolute record URL the badge links back to. */
  url: string;
}

const TONE_COLOR: Record<BadgeInput["tone"], string> = {
  supported: "#2d7a68", // --verdigris
  contradicted: "#78396a", // --plum
  neutral: "#5c6672", // --graphite
};

const MUTED = "#4a5561"; // --ink-muted
const SHEET = "#ffffff"; // --sheet
const RULE = "#c5cfcd"; // --rule

const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncate(value: string, max: number): string {
  const clean = value.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export function badgeSvg(input: BadgeInput): string {
  const title = `CivicLens — ${input.outcome} — ${input.subject}`;
  const subject = escapeXml(truncate(input.subject, 46));
  const outcome = escapeXml(input.outcome);
  const foot = ["CivicLens", input.sample ? "sample data" : "", input.finality]
    .filter(Boolean)
    .join(" · ");
  const url = escapeXml(truncate(shortenUrl(input.url), 52));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="104" viewBox="0 0 440 104" role="img" aria-labelledby="civiclens-badge-${input.recordId}-title">
  <title id="civiclens-badge-${input.recordId}-title">${escapeXml(title)}</title>
  <rect x="0.5" y="0.5" width="439" height="103" rx="6" fill="${SHEET}" stroke="${RULE}"/>
  <rect x="1" y="8" width="5" height="88" rx="2.5" fill="${TONE_COLOR[input.tone]}"/>
  <text x="24" y="30" font-family="${FONT}" font-size="13" fill="${MUTED}">${subject}</text>
  <text x="24" y="57" font-family="${FONT}" font-size="18" font-weight="700" fill="${TONE_COLOR[input.tone]}">${outcome}</text>
  <text x="24" y="82" font-family="${FONT}" font-size="11" fill="${MUTED}">${escapeXml(foot)}</text>
  <text x="416" y="82" text-anchor="end" font-family="${FONT}" font-size="11" fill="${MUTED}">${url}</text>
</svg>`;
}

/** Inline-HTML embed: the SVG wrapped in a link back to the record. */
export function badgeEmbedSnippet(input: BadgeInput): string {
  return `<a href="${escapeXml(input.url)}" target="_blank" rel="noopener noreferrer">\n${badgeSvg(input)}\n</a>`;
}

export function badgeFilename(commitmentId: number): string {
  return `civiclens-commitment-${commitmentId}-badge.svg`;
}
