/**
 * Network + wallet helpers (UI-CivicLens section 7.3).
 *
 * Environment states the UI must handle, and where each one is resolved:
 *   wrong network     -> `isOnCorrectNetwork`, switch action in the masthead
 *   no account        -> `address === null`; reads still work without one
 *   unfunded account  -> StudioNet is gasless (0 GEN is expected, no warning);
 *                        on a funded network the banner links the faucet
 *   bad config        -> config/contracts.ts CONFIGURED === false
 *
 * No manual RPC override: one endpoint from config/network.ts.
 */

import { studionet } from "genlayer-js/chains";
import { CHAIN_ID, CHAIN_NAME, FAUCET_URL, NATIVE_SYMBOL, RPC_URL } from "@/config/network";

/** Hex chain id, as MetaMask's wallet_switchEthereumChain expects. */
export const CHAIN_ID_HEX = `0x${CHAIN_ID.toString(16)}`;

/** Passed straight to wallet_addEthereumChain. */
export const WALLET_CHAIN = {
  chainId: CHAIN_ID_HEX,
  chainName: CHAIN_NAME,
  nativeCurrency: { name: NATIVE_SYMBOL, symbol: NATIVE_SYMBOL, decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [],
} as const;

export interface EthereumProvider {
  isMetaMask?: boolean;
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on(event: string, handler: (...args: never[]) => void): void;
  removeListener(event: string, handler: (...args: never[]) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return window.ethereum ?? null;
}

export function isMetaMaskInstalled(): boolean {
  return Boolean(getEthereumProvider()?.isMetaMask);
}

export async function getAccounts(): Promise<string[]> {
  const provider = getEthereumProvider();
  if (!provider) return [];
  try {
    const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

export async function getCurrentChainId(): Promise<string | null> {
  const provider = getEthereumProvider();
  if (!provider) return null;
  try {
    return (await provider.request({ method: "eth_chainId" })) as string;
  } catch {
    return null;
  }
}

export function isOnCorrectNetwork(chainId: string | null): boolean {
  if (!chainId) return false;
  const decimal = Number.parseInt(chainId, 16);
  return Number.isFinite(decimal) && decimal === CHAIN_ID;
}

async function addNetwork() {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet provider detected.");
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [WALLET_CHAIN],
  });
}

export async function switchToGenLayerNetwork(): Promise<void> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet provider detected.");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CHAIN_ID_HEX }],
    });
  } catch (err) {
    // 4902 = chain not added to the wallet yet.
    if (err instanceof Error && /4902|unrecognized|not added/i.test(err.message)) {
      await addNetwork();
      return;
    }
    throw err;
  }
}

/** Request accounts and, if needed, move the wallet onto the right chain. */
export async function connectWallet(): Promise<string> {
  const provider = getEthereumProvider();
  if (!provider) throw new Error("No wallet provider detected.");

  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  const address = Array.isArray(accounts) ? accounts[0] : undefined;
  if (!address) throw new Error("No account was returned by the wallet.");

  const chainId = await getCurrentChainId();
  if (!isOnCorrectNetwork(chainId)) {
    await switchToGenLayerNetwork();
  }
  return address;
}

export const FAUCET = FAUCET_URL;
export const SDK_CHAIN = studionet;