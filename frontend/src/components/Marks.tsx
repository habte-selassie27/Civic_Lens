/**
 * Result marks — the shape half of "never rely on color alone" (section 5.2).
 *
 * Each result has a DISTINCT silhouette so the chip is still readable in
 * greyscale, in print, and to a reader who cannot separate the hues:
 *
 *   supported     check mark inside a circle
 *   contradicted  horizontal bar inside a diamond
 *   inconclusive  DASHED circle with a dash inside
 *   pending       hourglass
 *
 * These are inline SVG rather than an icon font so the dashed stroke and the
 * diamond geometry survive print stylesheets.
 */

export interface MarkProps {
  size?: number;
}

function Frame({ size = 16 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/*
        currentColor is inherited from the chip, so a chip in any context
        paints its mark without a second class.
      */}
    </svg>
  );
}

/** Check mark inside a circle — "evidence supports". */
export function SupportedMark({ size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 8.2l2.1 2.1L11 6.4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Bar inside a diamond — "evidence contradicts". A bar, not an X: the shape
 *  differs from the check without reading as a cross-out of the whole entry. */
export function ContradictedMark({ size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 1.4L14.6 8 8 14.6 1.4 8z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.8 8h6.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Dashed circle with a dash — "no determination". The dashed outline is the
 *  whole point: an open verdict, not a negative grade. */
export function InconclusiveMark({ size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle
        cx="8"
        cy="8"
        r="6.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.4 2.1"
      />
      <path d="M5.4 8h5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/** Hourglass — review pending. */
export function PendingMark({ size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4.4 2h7.2M4.4 14h7.2M5.6 2c0 2.4 2.4 3.2 2.4 4 0 .8-2.4 1.6-2.4 4M10.4 2c0 2.4-2.4 3.2-2.4 4 0 .8 2.4 1.6 2.4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Document corner — used by the sheet surfaces. */
export function DocumentMark({ size = 14 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3.5 1.5h6L12.5 4.5v10h-9z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M9.5 1.5v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 8h5M5.5 10.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** External-link arrow — sits next to every source link. */
export function ExternalMark({ size = 12 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M6.5 3.5h-3v9h9v-3M9.5 3.5h3v3M12.5 3.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Seal — the "final" mark. A stamp, because finality is a filing event. */
export function FinalMark({ size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** Open circle — "accepted, can still be appealed". Deliberately unfilled:
 *  an accepted outcome is not sealed. */
export function AcceptedMark({ size = 16 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export { Frame };