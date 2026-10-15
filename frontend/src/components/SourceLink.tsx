/**
 * Renders an evidence source reference.
 *
 * WHY this is a component rather than a bare `<a href={url}>`: most of the
 * bundled demo records point at real public documents, but the authored
 * illustrations point at `sample://` references for documents that do not
 * exist. Rendering those as links would produce a dead link that looks exactly
 * like a real citation — implying a source that no validator ever read, which
 * is the one thing the demo must not do.
 *
 * So: an http(s) URL is a link that opens in a new tab; anything else is shown
 * as plain monospace text with the scheme visible, so the reader can see it is
 * not a resolvable citation.
 */

import type { ReactNode } from "react";

/**
 * Hosts the contract's own `_url_is_fetchable` refuses. Mirrored here so the UI
 * never calls something "fetchable" that a validator would have rejected.
 * (The contract's check is the authority; this is a display affordance.)
 */
const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "ip6-localhost",
  "ip6-loopback",
  "metadata",
  "metadata.google.internal",
]);
const BLOCKED_SUFFIXES = [".internal", ".local", ".localhost", ".localdomain"];

function hostOf(url: string): string | null {
  const match = /^https?:\/\/([^/?#]+)/i.exec(url);
  if (!match) return null;
  let authority = match[1];
  // Strip credentials and port the way the contract's `_extract_host` does.
  if (authority.includes("@")) return null;
  if (authority.startsWith("[")) {
    const end = authority.indexOf("]");
    return end < 0 ? null : authority.slice(0, end + 1).toLowerCase();
  }
  const colon = authority.lastIndexOf(":");
  if (colon >= 0) authority = authority.slice(0, colon);
  return authority.toLowerCase();
}

/** True only for a reference a validator could actually have fetched. */
export function isFetchableSourceUrl(url: string): boolean {
  const host = hostOf(url);
  if (!host) return false;
  const bare = host.replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (bare === "") return false;
  if (bare.startsWith("[")) return true; // a bracketed IPv6 literal
  if (BLOCKED_HOSTS.has(bare)) return false;
  return !BLOCKED_SUFFIXES.some((suffix) => bare.endsWith(suffix));
}

export function SourceLink({
  url,
  children,
  className,
}: {
  url: string;
  children?: ReactNode;
  className?: string;
}) {
  if (isFetchableSourceUrl(url)) {
    return (
      <a className={className} href={url} target="_blank" rel="noopener noreferrer">
        {children ?? url}
      </a>
    );
  }
  return (
    <span className={className ?? "source-ref"}>
      <span className="visually-hidden">Sample reference, not a real document: </span>
      {children ?? url}
    </span>
  );
}
