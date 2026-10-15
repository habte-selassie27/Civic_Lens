/**
 * CopyField (UI-CivicLens 5.11) — addresses, hashes, and long references.
 *
 * Truncated display, full value on focus and hover, a copy button that
 * confirms in place, and an explorer link ONLY when explorer.ts can build a
 * real one. It never fabricates a URL.
 */

import { useEffect, useRef, useState } from "react";
import { shortenAddress, shortenUrl } from "@/domain/format";
import { explorerAddressUrl, explorerTxUrl } from "@/config/explorer";

const TX_RE = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

export interface CopyFieldProps {
  value: string;
  /** "tx" links to the explorer tx page, "address" to the address page. */
  kind?: "tx" | "address" | "url" | "text";
  label: string;
  /** Shorten hex values to 0x1234…abcd. URLs are shortened by host+path. */
  truncate?: boolean;
  className?: string;
}

export function CopyField({ value, kind = "text", label, truncate = true, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!value) return null;

  const isHex = TX_RE.test(value) || ADDRESS_RE.test(value);
  const display =
    kind === "tx" && truncate
      ? shortenAddress(value, 8)
      : kind === "address" && truncate
        ? shortenAddress(value, 6)
        : kind === "url" && truncate
          ? shortenUrl(value)
          : value;

  const explorerHref =
    kind === "tx" ? explorerTxUrl(value) : kind === "address" ? explorerAddressUrl(value) : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the full value is still on focus/hover.
      setCopied(false);
    }
  }

  return (
    <span className={["copyfield", className].filter(Boolean).join(" ")}>
      {explorerHref ? (
        <a href={explorerHref} target="_blank" rel="noopener noreferrer" title={value}>
          {display}
        </a>
      ) : (
        // Full value stays reachable for assistive tech and on hover.
        <span tabIndex={0} title={value}>
          {display}
        </span>
      )}
      <button
        type="button"
        className="copyfield__icon"
        onClick={copy}
        aria-label={`Copy ${label}`}
        style={isHex ? undefined : undefined}
      >
        {copied ? <span aria-hidden="true">Copied</span> : <CopyGlyph />}
      </button>
      <span className="sr-only" role="status">
        {copied ? `${label} copied to clipboard` : ""}
      </span>
    </span>
  );
}

function CopyGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <rect x="5.5" y="5.5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 3.5v-1a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export default CopyField;