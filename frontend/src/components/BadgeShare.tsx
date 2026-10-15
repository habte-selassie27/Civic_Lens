/**
 * BadgeShare — download or embed the outcome badge for a commitment.
 *
 * The SVG is assembled by domain/badge.ts (escaped, neutral wording, sample
 * records labelled on the badge itself). Copying needs no server; hosting the
 * downloaded file is what makes the badge work as an image in tools that strip
 * inline markup. This build has no hosting layer, so no preview image is
 * promised anywhere.
 */

import { useState } from "react";
import { badgeEmbedSnippet, badgeFilename, badgeSvg, type BadgeInput } from "@/domain/badge";

export interface BadgeShareProps {
  input: BadgeInput;
}

export function BadgeShare({ input }: BadgeShareProps) {
  const [status, setStatus] = useState<string | null>(null);

  function download() {
    try {
      const blob = new Blob([badgeSvg(input)], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = badgeFilename(input.recordId);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setStatus("Badge downloaded.");
    } catch {
      setStatus("The badge could not be downloaded in this browser. Copy the embed code instead.");
    }
  }

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(badgeEmbedSnippet(input));
      setStatus("Embed code copied.");
    } catch {
      setStatus("Copying is blocked in this browser. The embed code is an SVG with a link to this record.");
    }
  }

  return (
    <div className="stack">
      <p className="hint" style={{ margin: 0 }}>
        The badge repeats the outcome label in the same neutral wording and links back to this
        record{input.sample ? ". It says “sample data” on its face" : ""}. Host the downloaded SVG
        to use it as an image anywhere; the embed code works inline on a website.
      </p>
      <div className="actions">
        <button type="button" className="btn btn--quiet btn--small" onClick={download}>
          Download badge (SVG)
        </button>
        <button
          type="button"
          className="btn btn--quiet btn--small"
          onClick={() => void copyEmbed()}
        >
          Copy embed code
        </button>
      </div>
      <span className="hint" role="status">
        {status ?? ""}
      </span>
    </div>
  );
}

export default BadgeShare;
