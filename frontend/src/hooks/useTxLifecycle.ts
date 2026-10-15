/**
 * Write lifecycle (UI-CivicLens section 6).
 *
 * States: idle -> submitted -> pending -> accepted -> final, plus the three
 * "didn't complete" paths. `accepted` and `final` are kept distinct here so no
 * call site can collapse them.
 *
 * Rules enforced in this hook rather than in each component:
 * - Double submission is impossible: `start` refuses while a write is in flight.
 * - The optimistic state stops at "submitted". Nothing claims a result before
 *   consensus.
 * - An in-flight hash is persisted to localStorage, so a page reload resumes
 *   tracking the same transaction instead of losing it.
 * - Polling stops at a terminal phase; manual refresh stays available.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { writes } from "@/services";
import type { TxHash } from "@/services/types";
import { phaseCommitted, receiptPhase, validatorAgreement, type ValidatorAgreement } from "@/domain/finality";
import type { TxPhase } from "@/domain/copy";

const PENDING_KEY = "civiclens.tx.pending";
const POLL_INTERVAL_MS = 4000;

const TERMINAL: TxPhase[] = ["accepted", "final", "dropped", "rejected", "reverted"];

export interface PendingTx {
  hash: TxHash;
  action: string;
  startedAt: number;
}

export interface TxLifecycle {
  phase: TxPhase | "idle";
  hash: TxHash | null;
  action: string | null;
  error: string | null;
  /** Per-validator votes from the latest receipt; null until votes exist. */
  votes: ValidatorAgreement | null;
  isBusy: boolean;
  /** Run a write. Resolves once the hash is in hand, not once it is accepted. */
  start(action: string, fn: () => Promise<TxHash>): Promise<TxHash | null>;
  refresh(): Promise<void>;
  reset(): void;
  /** Wait for consensus to reach a decided state (used after a write). */
  waitForAcceptance(): Promise<TxPhase>;
}

function loadPersisted(): PendingTx | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingTx;
    if (!parsed?.hash || !parsed?.action) return null;
    // An hour-old write is not worth resuming; it would confuse the reader.
    if (Date.now() - parsed.startedAt > 60 * 60 * 1000) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function savePersisted(value: PendingTx | null) {
  if (typeof localStorage === "undefined") return;
  if (value) localStorage.setItem(PENDING_KEY, JSON.stringify(value));
  else localStorage.removeItem(PENDING_KEY);
}

/**
 * Read-only view of the in-flight write this browser persisted, if any.
 * Used by the activity page; the write itself stays tracked by the hook on
 * the page that submitted it.
 */
export function readPendingTx(): PendingTx | null {
  return loadPersisted();
}

export function useTxLifecycle(): TxLifecycle {
  const [phase, setPhase] = useState<TxPhase | "idle">("idle");
  const [hash, setHash] = useState<TxHash | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [votes, setVotes] = useState<ValidatorAgreement | null>(null);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clearTimer, []);

  const track = useCallback(async (target: TxHash) => {
    if (!writes) return;
    try {
      const receipt = await writes.getTransaction(target);
      const next = receiptPhase(receipt);
      setPhase(next);
      setVotes(validatorAgreement(receipt));
      if (TERMINAL.includes(next)) {
        savePersisted(null);
        clearTimer();
        return;
      }
      timer.current = setTimeout(() => void track(target), POLL_INTERVAL_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status could not be read.");
      clearTimer();
    }
  }, []);

  // Resume an interrupted write after a reload.
  useEffect(() => {
    const saved = loadPersisted();
    if (!saved) return;
    setHash(saved.hash);
    setAction(saved.action);
    void track(saved.hash);
  }, [track]);

  const start = useCallback(
    async (name: string, fn: () => Promise<TxHash>) => {
      // Prevent double submission from double clicks and re-renders.
      if (inFlight.current) return null;
      if (!writes) {
        setError("Writes need a configured contract address.");
        return null;
      }
      inFlight.current = true;
      setError(null);
      setAction(name);
      setVotes(null);
      // Optimistic state stops here — nothing claims a result before consensus.
      setPhase("submitted");

      try {
        const result = await fn();
        setHash(result);
        savePersisted({ hash: result, action: name, startedAt: Date.now() });
        setPhase("pending");
        void track(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "The write didn't go through.";
        setError(message);
        setPhase("rejected");
        savePersisted(null);
        return null;
      } finally {
        inFlight.current = false;
      }
    },
    [track],
  );

  const refresh = useCallback(async () => {
    if (!writes || !hash) return;
    clearTimer();
    await track(hash);
  }, [hash, track]);

  const waitForAcceptance = useCallback(async (): Promise<TxPhase> => {
    const w = writes;
    if (!w || !hash) {
      // Nothing in flight: report idle as a phase the caller can compare safely.
      return phase === "idle" ? "rejected" : phase;
    }
    const receipt = await w.waitForAccept(hash);
    const next = receiptPhase(receipt);
    setPhase(next);
    setVotes(validatorAgreement(receipt));
    if (phaseCommitted(next)) savePersisted(null);
    return next;
  }, [hash, phase]);

  const reset = useCallback(() => {
    clearTimer();
    savePersisted(null);
    setPhase("idle");
    setHash(null);
    setAction(null);
    setError(null);
    setVotes(null);
  }, []);

  return {
    phase,
    hash,
    action,
    error,
    votes,
    isBusy: phase === "submitted" || phase === "pending",
    start,
    refresh,
    reset,
    waitForAcceptance,
  };
}