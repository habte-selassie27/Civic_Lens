/**
 * Network config — the single source for chain identity.
 *
 * UI-CivicLens section 9: one typed config, no scattered literals.
 * The RPC endpoint and chain id are read from Vite env vars; the chain object
 * itself comes from the SDK's own chain registry (genlayer-js/chains), so we
 * never hand-roll a chain definition.
 */

import { studionet } from "genlayer-js/chains";

/** Decimal chain id, as the CLI and env vars express it. */
export const CHAIN_ID = Number(import.meta.env.VITE_GENLAYER_CHAIN_ID ?? 61999);

export const CHAIN_NAME = import.meta.env.VITE_GENLAYER_CHAIN_NAME ?? "GenLayer Studio";

export const NATIVE_SYMBOL = import.meta.env.VITE_GENLAYER_SYMBOL ?? "GEN";

/** RPC API endpoint. Never overridden manually per request — one value. */
export const RPC_URL = import.meta.env.VITE_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api";

/** The SDK chain object used by createClient. */
export const CHAIN = studionet;

export const NETWORK_LABEL = `${CHAIN_NAME} · chain ${CHAIN_ID}`;

/** Browser-based testnet faucet. Claiming is a manual step (AGENTS section 18). */
export const FAUCET_URL = "https://testnet-faucet.genlayer.foundation/";

/** StudioNet is gasless — 0 GEN is expected, so the UI must not warn about it. */
export const IS_GASLESS_NETWORK = CHAIN_ID === 61999;