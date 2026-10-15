/**
 * badgeSvg / badgeEmbedSnippet: the embeddable artifact.
 *
 * Two things must hold: every dynamic string is XML-escaped (a subject name
 * is user input), and the badge repeats the neutral label with the sample tag
 * on its face when the record is a sample.
 */

import { describe, expect, it } from "vitest";
import { badgeEmbedSnippet, badgeFilename, badgeSvg, escapeXml, type BadgeInput } from "@/domain/badge";

const badge: BadgeInput = {
  recordId: 3,
  subject: 'Halbrook <script>alert("x")</script> Industries',
  outcome: "Evidence supports",
  tone: "supported",
  finality: "accepted, not final",
  sample: true,
  url: "https://example.org/commitments/3",
};

describe("badgeSvg", () => {
  it("escapes markup in every dynamic field", () => {
    const svg = badgeSvg(badge);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("carries the neutral label, the sample tag, and the finality note", () => {
    const svg = badgeSvg(badge);
    expect(svg).toContain("Evidence supports");
    expect(svg).toContain("sample data");
    expect(svg).toContain("accepted, not final");
    expect(svg).toContain("CivicLens");
  });

  it("omits the sample tag for a live record and keeps the status tone", () => {
    const svg = badgeSvg({ ...badge, sample: false, tone: "contradicted" });
    expect(svg).not.toContain("sample data");
    expect(svg).toContain("#78396a"); // --plum, the contradicted tone
  });

  it("escapes the five XML characters", () => {
    expect(escapeXml(`<&>"'`)).toBe("&lt;&amp;&gt;&quot;&apos;");
  });
});

describe("badgeEmbedSnippet", () => {
  it("links back to the record", () => {
    const snippet = badgeEmbedSnippet(badge);
    expect(snippet.startsWith('<a href="https://example.org/commitments/3"')).toBe(true);
    expect(snippet).toContain("<svg");
    expect(snippet).toContain("</a>");
  });

  it("names the file after the commitment", () => {
    expect(badgeFilename(3)).toBe("civiclens-commitment-3-badge.svg");
  });
});
