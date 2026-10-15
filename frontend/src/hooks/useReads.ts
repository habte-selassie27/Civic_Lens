/**
 * Read hooks.
 *
 * Reads are instant and are cached with a short stale window. Reads NEVER show
 * the write lifecycle (section 6) — they go skeleton -> data, or error + retry.
 */

import { useQuery } from "@tanstack/react-query";
import { reads } from "@/services";
import { FALLBACK_CONSTANTS } from "@/config/contracts";
import type { ContractConstants } from "@/domain/types";

/** Contract bounds and enums. Falls back to the mirrored snapshot offline. */
export function useConstants() {
  return useQuery<ContractConstants>({
    queryKey: ["constants"],
    queryFn: () => reads.getConstants(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/** Convenience: the bound numbers, with the snapshot as a placeholder. */
export function useBounds() {
  const { data } = useConstants();
  return data ?? (FALLBACK_CONSTANTS as unknown as ContractConstants);
}

export function useCommitmentList() {
  return useQuery({
    queryKey: ["commitments"],
    queryFn: () => reads.listCommitments(20),
    staleTime: 10_000,
    retry: 1,
  });
}

export function useCommitmentBundle(commitmentId: number | null) {
  return useQuery({
    queryKey: ["commitment", commitmentId],
    queryFn: () => {
      if (commitmentId === null) throw new Error("No commitment selected.");
      return reads.getBundle(commitmentId);
    },
    enabled: commitmentId !== null,
    staleTime: 10_000,
    retry: 1,
  });
}