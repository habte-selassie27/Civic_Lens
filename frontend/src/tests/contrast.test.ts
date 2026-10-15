/**
 * Contrast guard (UI-CivicLens §2.1: "Meet WCAG AA contrast").
 *
 * The palette is a claim. This test checks it, so the claim stays true when
 * someone tunes a token.
 *
 * Rules applied:
 *   - body text and labels: 4.5:1 (WCAG AA)
 *   - control edges and focus indicators: 3:1 (WCAG 1.4.11 non-text)
 *
 * Decorative and structural dividers (.ledger row rules, panel edges) are
 * deliberately exempt: they convey grouping, not component state, and they are
 * backed by spacing and headings. That exemption is asserted explicitly below
 * so nobody "fixes" it by darkening every rule.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Read the REAL tokens.css so this test tracks the shipped palette rather than
 * a copy that can drift. Vitest's root is the frontend directory.
 */
const tokensCss = readFileSync(
  path.resolve(process.cwd(), "src/styles/tokens.css"),
  "utf8",
);

function token(name: string): string {
  const match = tokensCss.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`Token --${name} not found in tokens.css`);
  return match[1];
}

function channels(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const T = (name: string) => token(name);

/** [foreground, background, minimum, what it is] */
const TEXT_PAIRS: Array<[string, string, number, string]> = [
  ["record-ink", "microfiche", 4.5, "body text on the page background"],
  ["record-ink", "sheet", 4.5, "body text on a card"],
  ["ink-strong", "microfiche", 4.5, "headings on the page background"],
  ["ink-strong", "sheet", 4.5, "headings on a card"],
  ["ink-muted", "microfiche", 4.5, "secondary text on the page background"],
  ["ink-muted", "sheet", 4.5, "secondary text on a card"],
  // The one that failed before this test existed: .hint sits on the page.
  ["ink-faint", "microfiche", 4.5, "hint text on the page background"],
  ["ink-faint", "sheet", 4.5, "hint text on a card"],
  ["citation", "microfiche", 4.5, "links on the page background"],
  ["citation", "sheet", 4.5, "links on a card"],
  ["citation", "citation-tint", 4.5, "links inside banners"],
  // The three result colours, on their own chip tints.
  ["verdigris", "verdigris-tint", 4.5, '"Evidence supports" chip'],
  ["verdigris", "sheet", 4.5, 'supported text on a card'],
  ["plum", "plum-tint", 4.5, '"Evidence contradicts" chip'],
  ["plum", "sheet", 4.5, 'contradicted text on a card'],
  ["graphite", "graphite-tint", 4.5, '"Inconclusive" chip'],
  ["graphite", "sheet", 4.5, 'inconclusive text on a card'],
  ["graphite", "microfiche", 4.5, 'inconclusive text on the page background'],
];

const NON_TEXT_PAIRS: Array<[string, string, number, string]> = [
  // Focus ring and the borders that carry meaning.
  ["citation", "microfiche", 3, "focus ring on the page background"],
  ["citation", "sheet", 3, "focus ring on a card"],
  ["control-rule", "sheet", 3, "form control edge on a card"],
  ["control-rule", "microfiche", 3, "form control edge on the page background"],
  ["verdigris", "sheet", 3, '"Live evidence" badge edge'],
];

describe("WCAG contrast (UI-CivicLens 2.1)", () => {
  it.each(TEXT_PAIRS)("%s on %s — %s", (fg, bg, min, what) => {
    const ratio = contrast(T(fg), T(bg));
    expect(
      ratio,
      `${what}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
    ).toBeGreaterThanOrEqual(min);
  });

  it.each(NON_TEXT_PAIRS)("%s on %s — %s", (fg, bg, min, what) => {
    const ratio = contrast(T(fg), T(bg));
    expect(
      ratio,
      `${what}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
    ).toBeGreaterThanOrEqual(min);
  });

  it("keeps --rule as a decorative token, not a control edge", () => {
    // --rule deliberately does NOT meet 3:1: it draws dividers between rounds
    // and evidence rows, which convey grouping rather than component state.
    // If someone promotes it to a control border, this test fails loudly.
    const ruleRatio = contrast(T("rule"), T("sheet"));
    expect(ruleRatio).toBeLessThan(3);

    // And a separate token exists precisely so controls do not use --rule.
    const controlRatio = contrast(T("control-rule"), T("sheet"));
    expect(controlRatio).toBeGreaterThanOrEqual(3);
    expect(T("control-rule")).not.toBe(T("rule"));
  });

  it("introduces no warning or danger colour", () => {
    // The palette's whole argument is that contradicts is plum and inconclusive
    // is graphite. A red/amber semantic token would undo it.
    // Matched on DECLARATIONS only — this file's comments discuss the rule by
    // name, and a naive substring scan would flag its own explanation.
    const declared = tokensCss.replace(/\/\*[\s\S]*?\*\//g, "");
    const banned = ["--danger", "--warning", "--error", "--red", "--amber", "--destructive"];
    for (const name of banned) {
      expect(declared, `${name} must not be declared`).not.toContain(name);
    }
    // And the palette still uses plum, not a pure red, for contradicts.
    expect(T("plum")).not.toBe("#FF0000");
  });

  it("keeps the three result hues far apart", () => {
    // Luminance similarity between verdigris and graphite is intentional and
    // harmless: §2.1 forbids relying on colour alone, so each result carries a
    // distinct icon SHAPE and a text label (asserted in pages.test.tsx). What
    // must hold here is that the hues themselves are unambiguous.
    const hue = (hex: string): number => {
      const [r, g, b] = channels(hex).map((v) => v / 255);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const d = max - min;
      if (d === 0) return 0;
      let h: number;
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
      return (h + 360) % 360;
    };

    const results: Array<[string, string]> = [
      ["supported", T("verdigris")],
      ["contradicted", T("plum")],
      ["inconclusive", T("graphite")],
    ];
    expect(new Set(results.map(([, c]) => c)).size).toBe(3);

    for (const [aName, a] of results) {
      for (const [bName, b] of results) {
        if (aName === bName) continue;
        const d = Math.abs(hue(a) - hue(b));
        const separation = Math.min(d, 360 - d);
        expect(
          separation,
          `${aName} and ${bName} hues are only ${separation.toFixed(0)}° apart`,
        ).toBeGreaterThanOrEqual(30);
      }
    }
  });
});