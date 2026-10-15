/**
 * Finality resolution for a commitment (UI-CivicLens 5.4).
 *
 * HONEST LIMIT, stated plainly: the deployed contract does not record a
 * transaction hash on the outcome — `get_outcome` returns the derived result
 * and no tx id (see contracts/civic_lens.py). So the app cannot invent one.
 * A hash is resolved from, in order:
 *
 *   1. a `?tx=` parameter, so a shared link carries its own receipt;
 *   2. a transaction THIS browser submitted for this commitment;
 *   3. nothing — in which case finality is unknown and no chip is rendered.
 *
 * "Unknown" is never rendered as "Final". Accepted and Final are only ever
 * derived from a real receipt.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { writes } from "@/services";
import type { TxHash } from "@/services/types";
import { finalityState } from "@/domain/finality";
import type { FinalityState } from "@/domain/types";

const MAP_KEY = "civiclens.tx.byCommitment";
const POLL_MS = 6000;

const TX_RE = /^0x[0-9a-fA-F]{64}$/;

function loadMap(): Record<string, TxHash> {
  if (typeof localStorage === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) ?? "{}") as Record<string, TxHash>;
  } catch {
    return {};
  }
}

/** Record the tx a write produced, so finality survives a reload. */
export function rememberTxForCommitment(commitmentId: number, hash: TxHash) {
  if (typeof localStorage === "undefined") return;
  try {
    const map = loadMap();
    map[String(commitmentId)] = hash;
    localStorage.setItem(MAP_KEY, JSON.stringify(map));
  } catch {
    // Storage full or blocked — finality stays unknown, which is honest.
  }
}

export function clearRememberedTx(commitmentId: number) {
  if (typeof localStorage === "undefined") return;
  try {
    const map = loadMap();
    delete map[String(commitmentId)];
    localStorage.setItem(MAP_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export interface FinalityResult {
  state: FinalityState;
  hash: TxHash | null;
  /** True while a receipt is being read the first time. */
  loading: boolean;
}

export function useFinality(commitmentId: number): FinalityResult {
  const [params] = useSearchParams();
  const fromUrl = params.get("tx");
  const [state, setState] = useState<FinalityState>("none");
  const [hash, setHash] = useState<TxHash | null>(null);
  const [loading, setLoading] = useState(false);

  const urlHash = fromUrl && TX_RE.test(fromUrl) ? (fromUrl as TxHash) : null;
  const localHash = loadMap()[String(commitmentId)] ?? null;
  const target = urlHash ?? localHash;

  useEffect(() => {
    const w = writes;
    if (!target || !w) {
      setState("none");
      setHash(null);
      return;
    }

    let cancelled = false;
    setHash(target);
    setLoading(true);

    const poll = async () => {
      try {
        const receipt = await w.getTransaction(target);
        if (cancelled) return;
        const next = finalityState(receipt);
        setState(next);
        // Stop once settled; accepted can still become final later, so only
        // "final" is terminal here.
        if (next === "final") return;
      } catch {
        if (!cancelled) setState("unknown");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void poll();
    const interval = setInterval(poll, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [target]);

  return { state, hash, loading };
}