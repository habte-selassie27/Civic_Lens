/**
 * Explorer link builders.
 *
 * UI-CivicLens section 0.5 and 6: never invent an explorer link. These patterns
 * are the ones recorded in README "Deployment" for GenLayer Studio. If the app
 * is pointed at a network with no recorded explorer, the helpers return null and
 * the UI simply renders the hash without a link — it never fabricates a URL.
 */

const EXPLORER_BASE = "https://explorer-studio.genlayer.com";

export function explorerTxUrl(hash: string): string | null {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return null;
  return `${EXPLORER_BASE}/tx/${hash}`;
}

export function explorerAddressUrl(address: string): string | null {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return null;
  return `${EXPLORER_BASE}/address/${address}`;
}

/** Docs links used in the UI's "learn this term once, in place" pattern. */
export const DOCS = {
  home: "https://docs.genlayer.com",
  equivalence: "https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle",
  studio: "https://studio.genlayer.com",
  faucet: "https://testnet-faucet.genlayer.foundation/",
} as const;