# CivicLens — Brand & Logo

> One-line brief: a civic-accountability brand that looks like it belongs next to a public record, a citation, or a court filing — never next to a token launch.

## What it must communicate

- **Clarity, not accusation.** It reports what published evidence supports. It never asserts motive or fraud.
- **Evidence, not verdict.** A magnifying glass over a document, not a gavel.
- **Neutrality.** No red/green "good/bad" signal in the mark itself.
- **Institutional trust.** Reads as a public-sector, academic, or journalistic tool.

## What it must NOT communicate

- Crypto, Web3, DeFi, token, chain, or "blockchain" iconography (no hexagons, coins, nodes, glowing gradients, neon).
- Gaming / score / ranking language ("score", "grade", "ranking").
- Loaded verdict language ("truth", "liar", "fraud", "verdict").
- Generic SaaS (purple gradient, rounded blob, friendly sans-serif).

## Concept directions (pick one, or hybridize)

**A. The Lens (recommended, in use).** A simple lens or aperture shape placed over a single horizontal line — the line being a citation, a sentence of a public statement, a row of a report. The lens is the act of reading; the line is the evidence. Restrained, two-color.

**B. The Citation Mark.** A bracketed citation glyph — `[ ]` — paired with a small "verified" tick that is deliberately subtle (not a checkmark badge, just a hairline tick). Signals "this claim has a source."

**C. The Split Page.** Two stacked rectangles (a statement on top, evidence below) with a thin alignment line between them — the commitment and its proof, visually paired. Very editorial.

**D. The Seal.** A round, stamp-like seal with "CIVICLENS" around the rim and a single centered glyph (a magnifying glass or an open book). Reads as public record / notary. Use only if the brand wants to lean institutional.

## Mark specifications

- **Primary mark:** wordmark "CivicLens" + a small standalone symbol (lens or citation bracket) usable alone as a favicon/app icon.
- **Wordmark:** "Civic" and "Lens" in one weight, no color split between them; the symbol sits to the left of the wordmark or above it in a stacked lockup.
- **Symbol alone:** must be legible at 16×16 (favicon) and 32×32. No fine detail.
- **Clear space:** at least the height of the lowercase "c" on all sides.
- **Minimum size:** wordmark 96px wide; symbol 24px.

## Color palette (derived from the app's tokens — keep the brand in the same family)

| Role | Light theme | Dark theme | Notes |
|---|---|---|---|
| Ink (primary text / mark) | `#1B2430` | `#E7ECF1` | Deep navy-charcoal, not pure black. |
| Paper (background) | `#EBEFEE` | `#141A20` | Warm off-white / warm dark. |
| Citation accent | `#2F5B7C` | `#7FA8C9` | A muted blue — "citation" / link color. Used sparingly. |
| Record ink (secondary) | `#4A5561` | `#A3AEBA` | For secondary marks, captions. |
| Rule (lines/dividers) | `#B8C1C9` | `#3A4552` | Hairlines, the "citation line" under a lens. |
| Inconclusive (neutral) | `#6B7280` | `#9CA3AF` | Grey only — never red/orange for inconclusive. |

**Color rules:**

- The mark itself is **ink on paper** (monochrome) in its default form. Color is optional and only the citation accent.
- Never use red, orange, or green in the mark — those read as pass/fail, which the product deliberately avoids.
- The accent blue is used for one element only (e.g., the lens rim, or the focus point), never the whole mark.

## Typography

- **Wordmark:** a serif with editorial authority — e.g., Fraunces, Source Serif 4, or Lora. Avoid geometric sans (Inter, Helvetica) for the mark; they read as SaaS.
- **UI / body (app):** a readable sans — Source Sans 3, or system-ui stack. (Already in use; keep consistent.)
- **Numerals / hashes / code:** a monospace with character — JetBrains Mono or IBM Plex Mono, for addresses and tx hashes.
- **Rule:** serif for the brand, sans for the interface, mono for data.

## Tone of voice (for the prompt, and for copy)

- Sentence case, active voice, plain verbs.
- One name per action across the whole flow.
- Never "liar", "failed", "broken", "fraud", "score", "grade", "ranking".
- "Inconclusive" is a neutral third result, never a warning.
- Evidence, not intent: "CivicLens reports what published evidence supports."

## Logo prompt (for an image generator / illustrator)

> Design a minimal, editorial logo for "CivicLens", a public-commitment verification platform. The mark should look like it belongs beside a public record, a citation, or a court filing — not beside a token launch.
>
> Visual: a single thin magnifying-glass lens (or a citation bracket `[ ]`) placed over one horizontal hairline, suggesting a sentence of a public statement being read. Restrained, two-color: deep navy-charcoal ink on a warm off-white paper, with one small muted-blue accent on the lens rim or tick. No gradients, no glow, no 3D.
>
> Wordmark "CivicLens" set in a serif with editorial authority (Fraunces / Source Serif style), sentence case, ink on paper. The symbol sits to the left of the wordmark.
>
> Avoid: hexagons, coins, nodes, chains, glowing gradients, neon, red/green pass-fail colors, checkmark badges, "truth" or "verdict" wording, generic SaaS rounded blobs, friendly geometric sans-serifs.
>
> Deliver: (1) primary horizontal lockup, (2) stacked lockup, (3) symbol-only favicon at 16/32/64 px, (4) monochrome ink-on-paper and paper-on-ink variants, (5) a dark-theme variant using warm dark paper. Clear space = height of lowercase "c".

## Supporting brand assets (current state)

- **Favicon:** `frontend/public/favicon.svg` — paper badge with ink lens over a citation line and a muted-blue focus point. (Replaced the leftover "GenLayer Football Market" mark.)
- **Web manifest:** `frontend/public/site.webmanifest` — name/description/colors updated to CivicLens.
- **Page title:** `CivicLens — public-commitment verification` (in `index.html`).
- **Wordmark in app:** `frontend/src/components/Masthead.tsx` renders "CivicLens" with a `wordmark__rule` hairline — keep serif styling when a web font is added.

## Tagline options (neutral, evidence-focused)

- "What the published evidence supports."
- "Public commitments, checked against public evidence."
- "Evidence, not intent."

## Empty-state illustration style

Line-art, single stroke weight, editorial — like a newspaper diagram, not a friendly SaaS mascot. Same ink + rule palette, no fills except the citation accent.

## Icon set

Outline, 1.5px stroke, square caps, no fills except the citation accent. Consistent with the favicon's stroke weight.
EOF
echo "written docs/brand.md"; ls -la docs/brand.md