/**
 * DataModeBadge (UI-CivicLens 5.6) — "Sample data" / "Live evidence".
 *
 * Required on every commitment surface and in lists. The two modes differ by
 * SHAPE (dashed tag vs double-ruled stamp) as well as color, and the tooltip
 * says which one this is in words.
 */

import { DATA_MODE_LABEL } from "@/domain/copy";
import type { DataMode } from "@/domain/types";

const TOOLTIP: Record<DataMode, string> = {
  sample:
    "Sample data. A replay of a recorded result about a fabricated sample organization — not a finding about a real entity.",
  live:
    "Live evidence. Read from the deployed CivicLens contract on GenLayer.",
};

export interface DataModeBadgeProps {
  mode: DataMode;
  /** Overrides the wording when the app is in sample mode app-wide. */
  override?: DataMode;
  title?: string;
}

export function DataModeBadge({ mode, override, title }: DataModeBadgeProps) {
  const effective = override ?? mode;
  return (
    <span className={`badge badge--${effective}`} title={title ?? TOOLTIP[effective]}>
      <span className="badge__swatch" aria-hidden="true" />
      {DATA_MODE_LABEL[effective]}
    </span>
  );
}

export default DataModeBadge;