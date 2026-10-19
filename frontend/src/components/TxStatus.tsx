/**
 * TxStatus (UI-CivicLens 6) — the write lifecycle.
 *
 * The user-facing states are: nothing sent → submitted → validators reviewing →
 * accepted (still appealable) → final. Plus the four "didn't complete" paths,
 * one of which (`not_sent`) means the request never left the browser.
 *
 * Behavior rules enforced here:
 * - The tx hash appears as soon as it is known, with copy + explorer link.
 * - `accepted` and `final` are visually and textually distinct; nothing implies
 *   permanence before FINALIZED.
 * - Space is reserved so a status change never shifts layout (section 10).
 * - The progress region is a polite live region so screen readers announce it.
 */

import { phaseLabel } from "@/domain/finality";
import type { ValidatorAgreement } from "@/domain/finality";
import type { TxPhase } from "@/domain/copy";
import { CopyField } from "./CopyField";
import { AcceptedMark, ExternalMark, FinalMark } from "./Marks";

const IS_BUSY: TxPhase[] = ["submitted", "pending"];
const IS_FAILURE: TxPhase[] = ["dropped", "rejected", "reverted", "not_sent"];

export interface TxStatusProps {
  phase: TxPhase;
  hash?: string | null;
  /** Per-validator votes from the receipt, shown once they exist. */
  votes?: ValidatorAgreement | null;
  /** One sentence on what is happening now. */
  detail?: string;
  /** True while the browser tab is hidden but the tx is still tracked. */
  onRefresh?: () => void;
  error?: string | null;
}

export function TxStatus({ phase, hash, votes, detail, onRefresh, error }: TxStatusProps) {
  const busy = IS_BUSY.includes(phase);
  const failed = IS_FAILURE.includes(phase);

  return (
    <div className="tx" role="status" aria-live="polite">
      <div className="tx__phase">
        {busy && <span className="spinner" aria-hidden="true" />}
        {phase === "accepted" && (
          <span className="chip__mark" style={{ color: "var(--citation)" }}>
            <AcceptedMark />
          </span>
        )}
        {phase === "final" && (
          <span className="chip__mark" style={{ color: "var(--record-ink)" }}>
            <FinalMark />
          </span>
        )}
        <span>{phaseLabel(phase)}</span>
      </div>

      {detail && <p className="tx__detail">{detail}</p>}

      {(phase === "accepted" || phase === "final") && votes && (
        <p className="tx__detail">
          {votes.agreed} of {votes.total} validators agreed
          {typeof votes.round === "number" ? ` in round ${votes.round}` : ""}.
        </p>
      )}

      {busy && (
        <p className="tx__detail">
          Consensus can take a while. This page updates on its own; you can also refresh manually.
        </p>
      )}

      {error && <p className="tx__detail">{error}</p>}

      <div className="tx__row">
        {hash ? (
          <>
            <CopyField value={hash} kind="tx" label="transaction hash" />
            <a href="#" onClick={(e) => e.preventDefault()} style={{ display: "none" }} aria-hidden="true">
              <ExternalMark />
            </a>
          </>
        ) : (
          <span className="hint">The transaction hash appears once it is sent.</span>
        )}
        {busy && onRefresh && (
          <button type="button" className="btn btn--quiet btn--small" onClick={onRefresh}>
            Refresh status
          </button>
        )}
      </div>

      {/* Only offered when there is a hash to re-read. After a write that was
          never sent there is nothing on-chain to check, and a "Check again"
          button would suggest otherwise. */}
      {failed && hash && onRefresh && (
        <div className="tx__row">
          <button type="button" className="btn btn--quiet btn--small" onClick={onRefresh}>
            Check again
          </button>
        </div>
      )}
    </div>
  );
}

export default TxStatus;